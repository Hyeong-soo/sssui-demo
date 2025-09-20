import React, { useState } from "react";
import Landing from "../components/Landing";
import DemoApp from "../components/DemoApp";

type Tab = "landing" | "demo";

export default function App() {
  const [tab, setTab] = useState<Tab>("landing");
  return (
    <main style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial", lineHeight: 1.5, maxWidth: 1040, margin: "32px auto", padding: 0 }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 10, background: "#ffffffcc", backdropFilter: "saturate(180%) blur(6px)", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", gap: 8, padding: "10px 16px", alignItems: "center", maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ fontWeight: 700 }}>SSSUI</div>
          <div style={{ flex: 1 }} />
          <button onClick={() => setTab("landing")} style={{ padding: "6px 10px", borderRadius: 8, border: tab === "landing" ? "1px solid #111827" : "1px solid #e5e7eb", background: tab === "landing" ? "#111827" : "#fff", color: tab === "landing" ? "#fff" : "#111827", cursor: "pointer" }}>Landing</button>
          <button onClick={() => setTab("demo")} style={{ padding: "6px 10px", borderRadius: 8, border: tab === "demo" ? "1px solid #111827" : "1px solid #e5e7eb", background: tab === "demo" ? "#111827" : "#fff", color: tab === "demo" ? "#fff" : "#111827", cursor: "pointer" }}>Demo</button>
        </div>
      </nav>
      <div style={{ paddingTop: 8 }}>
        {tab === "landing" ? <Landing onStartDemo={() => setTab("demo")} /> : <DemoApp />}
      </div>
    </main>
  );
}

