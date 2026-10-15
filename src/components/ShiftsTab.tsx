import { useState } from "react";
import { buildIcs, DEFAULT_SCHEDULE_NAME, formatMinutes, googleCalendarLink, parsePastedShifts, type Shift } from "../lib/work-tools";
import { downloadBlob, readScheduleWorkbook } from "../lib/work-files";
import { dayLabel, thisMonday } from "../lib/format";
import { usePersisted } from "../hooks/usePersisted";
import { FilePick } from "./FilePick";

export function ShiftsTab() {
  const [name, setName] = usePersisted("sst.scheduleName", DEFAULT_SCHEDULE_NAME);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [weekStart, setWeekStart] = useState(thisMonday);

  async function load(f: File, who = name) {
    setFile(f); setStatus("Reading…");
    try {
      const { shifts, people } = await readScheduleWorkbook(f, who);
      setShifts(shifts);
      setStatus(
        shifts.length
          ? `${shifts.length} shifts for ${who}.`
          : `No shifts found for “${who}”. Names on sheet: ${people.slice(0, 12).join(", ")}`,
      );
    } catch (e) {
      setShifts([]);
      setStatus(`Could not read that workbook: ${(e as Error).message}`);
    }
  }

  function readPasted() {
    const list = parsePastedShifts(pasted, weekStart, name);
    setShifts(list);
    setStatus(
      list.length
        ? `${list.length} shifts for ${name}.`
        : `No shifts found — make sure the first line starts with “${name}” and the times look like 9a-6p.`,
    );
  }

  const downloadIcs = () => downloadBlob(new Blob([buildIcs(shifts)], { type: "text/calendar" }), "my-shifts.ics");

  return (
    <section className="stack">
      <div className="row">
        <label className="grow">
          <span className="label">Name on schedule</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {file && <button className="btn" onClick={() => load(file)}>Re-read</button>}
      </div>
      <FilePick accept=".xlsx,.xls" label="Drop a monthly schedule workbook (.xlsx)" onFiles={([f]) => f && load(f)} />
      <details className="card">
        <summary>…or paste your rows from Excel</summary>
        <div className="stack tight">
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={4}
            aria-label="Pasted schedule rows"
            placeholder="Paste the week block from Excel — include the date row (10/19/26 … 10/25/26) and your name row."
          />
          <div className="row">
            <label>
              <span className="label">Week starting (Mon)</span>
              <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            </label>
            <button className="btn primary" onClick={readPasted} disabled={!pasted.trim()}>Read</button>
          </div>
        </div>
      </details>
      {status && <p className="status" role="status">{status}</p>}
      {shifts.length > 0 && (
        <>
          <div className="row">
            <button className="btn primary" onClick={downloadIcs}>Download all (.ics)</button>
            <a className="btn" href="https://calendar.google.com/calendar/u/0/r/settings/export" target="_blank" rel="noreferrer">Open Google Calendar import</a>
          </div>
          <p className="hint">Download the .ics, then import it in Google Calendar (Settings → Import &amp; export), Outlook or Apple Calendar. Or add days one at a time below.</p>
          <ul className="list">
            {shifts.map((s) => (
              <li key={s.date}>
                <span>{dayLabel(s.date)} · <span className="mono">{formatMinutes(s.start)}–{formatMinutes(s.end)}</span></span>
                <a href={googleCalendarLink(s)} target="_blank" rel="noreferrer">Add to Google</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
