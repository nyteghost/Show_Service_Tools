import { useEffect, useState, type KeyboardEvent } from "react";
import { DeckTab } from "./components/DeckTab";
import { EventsTab } from "./components/EventsTab";
import { ShiftsTab } from "./components/ShiftsTab";
import { VendorsTab } from "./components/VendorsTab";

const TABS = [
  { id: "events", label: "Events", view: <EventsTab /> },
  { id: "shifts", label: "My shifts", view: <ShiftsTab /> },
  { id: "deck", label: "Deck", view: <DeckTab /> },
  { id: "vendors", label: "Vendors", view: <VendorsTab /> },
] as const;

type TabId = (typeof TABS)[number]["id"];
const fromHash = (): TabId => (TABS.find((t) => `#${t.id}` === window.location.hash)?.id ?? "events");

export function App() {
  const [tab, setTab] = useState<TabId>(fromHash);
  useEffect(() => {
    const on = () => setTab(fromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const choose = (id: TabId) => { window.location.hash = id; setTab(id); };
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length]!;
    choose(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div className="app">
      <header>
        <h1>Show Services Tools</h1>
        <p className="muted">Everything runs in this browser — files never leave your device.</p>
      </header>
      <div className="tabs" role="tablist" aria-label="Tools">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => choose(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <main>
        {TABS.map((t) => (
          <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={tab !== t.id}>
            {t.view}
          </div>
        ))}
      </main>
    </div>
  );
}
