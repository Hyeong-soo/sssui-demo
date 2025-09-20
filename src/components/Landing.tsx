import React from "react";

export default function Landing({ onStartDemo }: { onStartDemo: () => void }) {
  const badge = (text: string) => (
    <span style={{
      padding: "4px 8px",
      borderRadius: 999,
      fontSize: 12,
      background: "#eef2ff",
      color: "#3730a3",
      border: "1px solid #e0e7ff"
    }}>{text}</span>
  );

  const card = (icon: string, title: string, body: string) => (
    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontWeight: 700, marginTop: 6 }}>{title}</div>
      <div style={{ color: "#4b5563", marginTop: 6 }}>{body}</div>
    </div>
  );

  const code = `import { init, split_ec, combine_ec } from 'sssui_wasm';\n\ninit();\nconst secret32 = new Array(32).fill(1);\nconst ids = ['node1','node2','node3'].map(s => new TextEncoder().encode(s));\nconst shares = split_ec(secret32, ids, 2);\nconst recovered = combine_ec(shares.slice(0,2), 2);`;

  const pill = (text: string) => (
    <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#f9fafb" }}>{text}</span>
  );

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial", lineHeight: 1.6 }}>
      <section style={{
        position: "relative",
        padding: "72px 16px 56px",
        background: "radial-gradient(1200px 400px at 50% -10%, #e0e7ff 0%, rgba(224,231,255,0) 60%)"
      }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {badge("WASM + TypeScript")}
            {badge("Node & Browser")}
            {badge("Sui Curves")}
            {badge("Multi-chain")}
          </div>
          <h1 style={{ fontSize: 40, margin: "14px 0 8px", letterSpacing: -0.5 }}>Shamir & TSS for Sui, done right.</h1>
          <p style={{ color: "#4b5563", maxWidth: 760 }}>
            Browser/Node compatible Secret Sharing (SSS) and Threshold Signatures (TSS) utilities for the Sui ecosystem, powered by WebAssembly.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={onStartDemo} style={{ padding: "10px 16px", borderRadius: 12, border: 0, background: "#111827", color: "#fff", cursor: "pointer" }}>Start Demo</button>
          </div>
        </div>
      </section>

      <section style={{ padding: "24px 16px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {card("⚡", "WASM Performance", "Rust→WASM for fast finite-field ops with deterministic results.")}
            {card("🧭", "Node & Browser", "One API surface across server and browser.")}
            {card("🧩", "Multi-Curve", "Supports secp256k1 / secp256r1 / ed25519.")}
            {card("🌐", "Multi-chain Support", "Most chains choose one or more of these curves — ship one toolkit across ecosystems.")}
            {card("🛡️", "MPC Ready", "Designed for threshold split/combine and TSS workflows.")}
          </div>
        </div>
      </section>

      {/* TSS - Coming soon */}
      <section style={{ padding: "8px 16px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Threshold Signatures (TSS): coming soon</div>
          <p style={{ color: "#4b5563", margin: 0 }}>
            With TSS, agents can cooperate to produce a signature without reconstructing the full private key. Each node contributes a partial signature derived from its share, and an aggregator combines them into a valid signature.
            This unlocks flows like co-signing transactions on Sui where user consent and agent automation meet securely.
          </p>
        </div>
      </section>

      <section style={{ padding: "8px 16px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Supported Curves</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {pill("secp256k1")}
              {pill("secp256r1")}
              {pill("ed25519")}
            </div>
            <div style={{ color: "#4b5563", marginTop: 8, fontSize: 13 }}>Covers Sui key schemes and most chains that standardize on these curves.</div>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>How it works</div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              <li>Split secret with parameters T/N</li>
              <li>Distribute shares across nodes/agents</li>
              <li>Recover with T shares or sign via TSS</li>
            </ol>
          </div>

          <div style={{ background: "#0b1220", color: "#e5e7eb", borderRadius: 16, padding: 16, border: "1px solid #111827" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Start (TS)</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas", fontSize: 12 }}>{code}</pre>
          </div>
        </div>
      </section>

      {/* Sui-focused value for hackathon */}
      <section style={{ padding: "8px 16px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Built for Sui Hackathons</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#1f2937" }}>
            <li style={{ margin: "6px 0" }}>First-class support for Sui curves (ed25519, secp256r1) and browser-native demos.</li>
            <li style={{ margin: "6px 0" }}>Great for Move dApps and agents: split a user key into threshold shares; recover only with explicit consent.</li>
            <li style={{ margin: "6px 0" }}>Deterministic, fast WASM — easy to verify by judges and reproduce in submissions.</li>
            <li style={{ margin: "6px 0" }}>Local-only processing by default; ideal for privacy-friendly hackathon prototypes.</li>
          </ul>
        </div>
      </section>

      <section style={{ padding: "24px 16px 40px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", background: "linear-gradient(180deg, #f8fafc, #ffffff)", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Build your Sui demo with threshold secret sharing</div>
              <div style={{ color: "#4b5563", fontSize: 13 }}>All data is processed locally. Perfect for Sui hackathon demos.</div>
            </div>
            <button onClick={onStartDemo} style={{ padding: "10px 16px", borderRadius: 12, border: 0, background: "#111827", color: "#fff", cursor: "pointer" }}>Start Demo</button>
          </div>
        </div>
      </section>
    </div>
  );
}
