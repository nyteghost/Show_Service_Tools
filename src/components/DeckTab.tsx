import { useState } from "react";
import { deckReply } from "../lib/deck-solver";
import { MiniMarkdown } from "./MiniMarkdown";

export function DeckTab() {
  const [size, setSize] = useState("24x24x32");
  const reply = deckReply(`@deck ${size}`);
  return (
    <section className="stack">
      <label>
        <span className="label">Stage size — width × length in feet × height in inches</span>
        <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="24x24x32" inputMode="text" autoComplete="off" />
      </label>
      {reply && <div className="card"><MiniMarkdown text={reply} /></div>}
      <p className="hint">Width and length must be multiples of 4 ft (one side a multiple of 8). Legs range 32″–44″.</p>
    </section>
  );
}
