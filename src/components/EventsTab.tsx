import { useState } from "react";
import { entryLabel, summarizeEvents, type EventEntry } from "../lib/work-tools";
import { downloadBlob, eventsWorkbook, readEventPdf } from "../lib/work-files";
import { dayLabel } from "../lib/format";
import { FilePick } from "./FilePick";

const LEGEND = [
  ["green", "Move in"],
  ["yellow", "Show"],
  ["orange", "Move out"],
  ["teal", "Move in + show"],
  ["blue", "All three"],
] as const;

export function EventsTab() {
  const [entries, setEntries] = useState<EventEntry[]>([]);
  const [status, setStatus] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [merged, setMerged] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load(files: File[]) {
    setBusy(true); setStatus("Reading…"); setBlob(null);
    try {
      const pdfs = files.filter((f) => /\.pdf$/i.test(f.name));
      const existing = files.find((f) => /\.xlsx?$/i.test(f.name));
      if (!pdfs.length) { setEntries([]); setStatus("Add at least one Ungerboeck PDF."); return; }
      const rows = (await Promise.all(pdfs.map(readEventPdf))).flat();
      const list = summarizeEvents(rows);
      setEntries(list); setMerged(!!existing);
      setBlob(list.length ? await eventsWorkbook(list, existing) : null);
      const days = new Set(list.map((e) => e.date)).size;
      setStatus(
        list.length
          ? `${pdfs.length} PDF${pdfs.length > 1 ? "s" : ""} · ${list.length} entries across ${days} days. ${existing ? `Filled into ${existing.name} — engineer shifts kept.` : "Built weekly sheets with the engineering roster."}`
          : "No show, move-in or move-out lines found.",
      );
    } catch (e) {
      setEntries([]);
      setStatus(`Could not read that PDF: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack" aria-busy={busy}>
      <FilePick accept="application/pdf,.xlsx" multiple label="Drop Ungerboeck PDFs here — add your monthly schedule .xlsx to fill it in" onFiles={load} />
      <p className="hint">
        S = show · Exmi = exhibitor move in / service desk · MI = move in · MO = move out. Combined halls split into each
        hall. Escalators = 1 hr before first show to 1 hr after.
      </p>
      <ul className="legend" aria-label="Color legend">
        {LEGEND.map(([c, t]) => <li key={c}><span className={`chip ${c}`} />{t}</li>)}
      </ul>
      {status && <p className="status" role="status">{status}</p>}
      {entries.length > 0 && (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Day</th><th>Space</th><th>Entry</th></tr></thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i}>
                    <td>{dayLabel(e.date)}</td>
                    <td>{e.space}</td>
                    <td className="mono">{entryLabel(e)} <span className="muted">{e.title}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {blob && (
            <div className="row">
              <button className="btn primary" onClick={() => downloadBlob(blob, merged ? "schedule-updated.xlsx" : "engineering-schedule.xlsx")}>Download Excel</button>
              <button className="btn" onClick={() => { setEntries([]); setBlob(null); setStatus(""); }}>Clear</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
