import { useState } from "react";
import { vendors } from "../lib/work-tools";

export function VendorsTab() {
  const [q, setQ] = useState("");
  const query = q.trim();
  return (
    <section className="stack">
      <label>
        <span className="label">Item</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="gaffer tape 2in black" autoComplete="off" />
      </label>
      <ul className="list">
        {vendors.map((v) => (
          <li key={v.name}>
            <span><strong>{v.name}</strong> <span className="muted">— {v.taxNote}</span></span>
            {query
              ? <a href={v.url(query)} target="_blank" rel="noreferrer">Search</a>
              : <span className="muted" aria-disabled="true">Search</span>}
          </li>
        ))}
      </ul>
      <p className="hint">Compare listed prices before tax — you're tax-exempt.</p>
    </section>
  );
}
