import React, { useMemo, useState } from "react";
import { hexToUint8Array, strToFixed32Bytes, toFixed32FromHex, toHex, stringify, bytesToText } from "../utils/bytes";
import { splitByCurve, combineShares, Curve } from "../utils/sss";
import useWasmInit from "../hooks/useWasmInit";

type InputMode = "hex" | "text";

export default function DemoApp() {
  const { initialized, error } = useWasmInit();
  const [err, setErr] = useState<string | null>(null);

  const [inputMode, setInputMode] = useState<InputMode>("hex");
  const [secretInput, setSecretInput] = useState(
    "a9f1b4e8c2d7a1b3bce478f0d84f211ea1fe5d246b707df733fc7a5f21e2da43"
  );
  const [n, setN] = useState(3);
  const [t, setT] = useState(2);
  const [curve, setCurve] = useState<Curve>("secp256k1");

  const [shares, setShares] = useState<any[] | null>(null);
  const [combineHex, setCombineHex] = useState<string | null>(null);
  const [combineText, setCombineText] = useState<string | null>(null);
  const [displayShareAs, setDisplayShareAs] = useState<InputMode>("hex");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const canSubmit = useMemo(
    () => initialized && n >= 2 && t >= 2 && t <= n && !!secretInput.trim(),
    [initialized, n, t, secretInput]
  );

  const randomHex32 = () => {
    const arr = new Uint8Array(32);
    (globalThis.crypto || window.crypto).getRandomValues(arr);
    // Constrain MSB by modulo 64 as requested
    arr[0] = arr[0] % 16;
    return toHex(arr);
  };

  const handleSplit = () => {
    setErr(null);
    setShares(null);
    setCombineHex(null);
    setCombineText(null);
    setSelected(new Set());
    try {
      const secretBytes: number[] = inputMode === "hex"
        ? toFixed32FromHex(secretInput)
        : strToFixed32Bytes(secretInput);

      if (secretBytes.length !== 32) throw new Error("Secret must be exactly 32 bytes (padded/truncated). ");

      const out = splitByCurve(curve, secretBytes, n, t);
      const list = toSharesArray(out);
      setShares(list);

      const defaultSel = new Set<number>();
      for (let i = 0; i < Math.min(t, list.length || 0); i++) defaultSel.add(i);
      setSelected(defaultSel);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const equalToOriginal = useMemo(() => {
    try {
      if (!combineHex) return null;
      const originalHex = inputMode === "hex" ? toHex(toFixed32FromHex(secretInput)) : toHex(strToFixed32Bytes(secretInput));
      return combineHex === originalHex;
    } catch {
      return null;
    }
  }, [combineHex, inputMode, secretInput]);

  const copyShares = async () => {
    if (!shares) return;
    const text = (shares as any[]).map((s, i) => `Share #${i + 1}: ${formatShareForDisplay(s, displayShareAs)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("Shares copied to clipboard.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("Shares copied to clipboard.");
    }
  };

  function isByteArrayLike(x: any): x is number[] {
    return Array.isArray(x) && x.every(v => typeof v === "number" && v >= 0 && v <= 255);
  }

  function bytesFromUnknown(u: any): Uint8Array | null {
    if (u instanceof Uint8Array) return u;
    if (isByteArrayLike(u)) return new Uint8Array(u as number[]);
    if (u && typeof u === "object") {
      for (const key of ["share", "value", "y", "data"]) {
        const v = (u as any)[key];
        if (v instanceof Uint8Array) return v;
        if (isByteArrayLike(v)) return new Uint8Array(v);
      }
    }
    return null;
  }

  function formatShareForDisplay(u: any, mode: InputMode): string {
    const bytes = bytesFromUnknown(u);
    if (bytes) {
      if (mode === "hex") return toHex(bytes);
      try {
        return new TextDecoder().decode(bytes);
      } catch {
        return toHex(bytes);
      }
    }
    if (Array.isArray(u)) return `[${u.map(x => formatShareForDisplay(x, mode)).join(", ")}]`;
    if (u && typeof u === "object") {
      const entries = Object.entries(u as Record<string, unknown>).map(([k, v]) => `${k}: ${formatShareForDisplay(v, mode)}`);
      return `{ ${entries.join(", ")} }`;
    }
    return String(u);
  }

  function toSharesArray(out: any): any[] {
    if (Array.isArray(out)) return out as any[];
    if (out && typeof out === "object") {
      const o = out as any;
      if (Array.isArray(o.shares)) return o.shares as any[];
      if (Array.isArray(o.points)) return o.points as any[];
      const numericKeys = Object.keys(o).filter(k => /^\d+$/.test(k));
      if (numericKeys.length > 0) {
        return numericKeys.sort((a,b) => Number(a)-Number(b)).map(k => o[k]);
      }
    }
    return [out];
  }

  const toggleSelected = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleCombineSelected = () => {
    if (!shares) return;
    setErr(null);
    try {
      const indices = Array.from(selected.values()).sort((a,b) => a-b);
      const chosen = indices.map(i => (shares as any[])[i]);
      if (chosen.length < t) throw new Error(`Select at least ${t} shares.`);
      const recovered = combineShares(chosen, t);
      setCombineHex(toHex(recovered));
      setCombineText(bytesToText(recovered));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial", lineHeight: 1.5, maxWidth: 960, margin: "0 auto", padding: "0 16px 32px" }}>
      <h2 style={{ fontSize: 24, margin: "16px 0" }}>Secret Sharing Playground</h2>
      <p style={{ color: "#666", marginTop: 0 }}>Split a user-supplied secret into N shares with threshold T, then verify recovery.</p>

      {/* Simple SSS diagram */}
      <section style={{ marginTop: 8, background: "#0b1220", color: "#e5e7eb", borderRadius: 12, padding: 12, border: "1px solid #111827" }}>
        <pre style={{ margin: 0, fontSize: 12, whiteSpace: "pre-wrap" }}>{`Secret (32 bytes)
       |
       |  split (N, T)
       v
  [ Share 1 ]  [ Share 2 ]  ...  [ Share N ]
       |   \___________________________/   |
       |               select T            |
       v                                    v
        \__________ combine (>= T) ________/
                       |
                       v
                  Recovered Secret`}</pre>
      </section>

      {!initialized && !error && <div style={{ margin: "12px 0" }}>Initializing WASM...</div>}
      {(error || err) && (
        <div style={{ background: "#ffecec", color: "#b00020", padding: 12, borderRadius: 8, margin: "12px 0" }}>{error ?? err}</div>
      )}

      <section style={{ background: "#fafafa", padding: 16, borderRadius: 12, border: "1px solid #eee", marginTop: 12 }}>
        {/* Curve selector */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 600 }}>Curve</div>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" name="curve" value="secp256k1" checked={curve === "secp256k1"} onChange={() => setCurve("secp256k1")} /> secp256k1
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" name="curve" value="secp256r1" checked={curve === "secp256r1"} onChange={() => setCurve("secp256r1")} /> secp256r1
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" name="curve" value="ed25519" checked={curve === "ed25519"} onChange={() => setCurve("ed25519")} /> ed25519
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" name="mode" value="hex" checked={inputMode === "hex"} onChange={() => setInputMode("hex")} /> HEX
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" name="mode" value="text" checked={inputMode === "text"} onChange={() => setInputMode("text")} /> TEXT
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Secret</label>
          <textarea
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder={inputMode === "hex" ? "64 chars (32 bytes) HEX recommended" : "Any text (will be padded/truncated to 32 bytes)"}
            rows={3}
            style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas", borderRadius: 8, padding: 10, border: "1px solid #ddd" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => { setInputMode("hex"); setSecretInput(randomHex32()); }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#f9fafb", cursor: "pointer" }}
            >
              Random 32-byte HEX
            </button>
          </div>
          <div style={{ color: "#777", fontSize: 12, marginTop: 4 }}>
            {inputMode === "hex" ? "If not exactly 32 bytes, it will be padded/truncated." : "Text is UTF-8 and padded/truncated to 32 bytes."}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Total shares (N)</label>
            <input type="number" min={2} max={32} value={n} onChange={(e) => setN(Math.max(2, Math.min(32, Number(e.target.value))))} style={{ width: 120, padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Threshold (T)</label>
            <input type="number" min={2} max={n} value={t} onChange={(e) => setT(Math.max(2, Math.min(n, Number(e.target.value))))} style={{ width: 120, padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={handleSplit} disabled={!canSubmit} title={curve !== "secp256k1" ? "Only secp256k1 in this demo (others coming soon)" : undefined} style={{ background: canSubmit ? "#111827" : "#999", color: "white", padding: "10px 16px", border: 0, borderRadius: 8, cursor: canSubmit ? "pointer" : "not-allowed" }}>
            Split
          </button>
        </div>
      </section>

      {shares && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Shares</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#555" }}>Display as:</span>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="radio" name="disp" value="hex" checked={displayShareAs === "hex"} onChange={() => setDisplayShareAs("hex")} /> HEX
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="radio" name="disp" value="text" checked={displayShareAs === "text"} onChange={() => setDisplayShareAs("text")} /> TEXT
              </label>
            </div>
            <button onClick={copyShares} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Copy All</button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {(shares as any[]).map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", background: "#f8fafc", border: "1px solid #e5e7eb", padding: 10, borderRadius: 10 }}>
                <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelected(i)} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Share #{i + 1}</div>
                  <code style={{ display: "block", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{formatShareForDisplay(s, displayShareAs)}</code>
                </div>
                <button onClick={async () => {
                  const text = formatShareForDisplay(s, displayShareAs);
                  try { await navigator.clipboard.writeText(text); } catch {
                    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
                  }
                }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Copy</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ color: "#555" }}>Total: {shares.length} · Selected: {selected.size} / Needed: {t} · Requested N: {n}</div>
            <button onClick={handleCombineSelected} disabled={selected.size < t} style={{ background: selected.size < t ? "#999" : "#111827", color: "white", padding: "8px 14px", border: 0, borderRadius: 8, cursor: selected.size < t ? "not-allowed" : "pointer" }}>Recover from selected</button>
          </div>
        </section>
      )}

      {combineHex && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Recovery</h2>
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Recovered (HEX)</div>
              <code style={{ display: "block", background: "#f5f7f9", padding: 8, borderRadius: 8 }}>{combineHex}</code>
            </div>
            {combineText && (
              <div>
                <div style={{ fontWeight: 600 }}>Recovered (TEXT)</div>
                <code style={{ display: "block", background: "#f5f7f9", padding: 8, borderRadius: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{combineText}</code>
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600 }}>Equal to original?</div>
              <div>{equalToOriginal === null ? "-" : equalToOriginal ? "✅ Yes" : "❌ No"}</div>
            </div>
          </div>
        </section>
      )}

      <footer style={{ marginTop: 32, color: "#777", fontSize: 12 }}>
        Demo only. Review security requirements and key management policies before production use.
      </footer>
    </div>
  );
}
