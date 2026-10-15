# Show Services Tools

Four small tools for show-services work, extracted from the Buddy Bot Room "Work tools" dialog into a standalone app.
Everything runs in the browser — files are never uploaded anywhere, and there is no server, login or database.

| Tab | What it does |
| --- | --- |
| **Events** | Drop one or more Ungerboeck "For Scheduling" PDFs (plus an optional monthly `.xlsx`) and download a weekly engineering schedule in Excel: halls, ballrooms, escalator and service-desk rows, merged cells for multi-room events, color-coded move-in / show / move-out. Existing engineer shifts in your workbook are preserved. |
| **My shifts** | Read your row from a monthly schedule workbook (or paste it from Excel), then download an `.ics` for Google / Outlook / Apple Calendar, or add single days to Google Calendar with one click. |
| **Deck** | Type a stage size like `24x24x32` (feet × feet × inches) to get decks, holders, bridges and a stairs suggestion. |
| **Vendors** | Type an item and open searches on Grainger, McMaster-Carr, Home Depot and 1000Bulbs, with tax-exempt reminders. |

## Run it

Requires Node.js 20+.

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for the parsing / planning logic
npm run typecheck  # strict TypeScript check
npm run build      # static site in dist/
```

## Deploy

`npm run build` produces a plain static site in `dist/` (relative asset paths), so it works on GitHub Pages,
Cloudflare Pages, Netlify, an S3 bucket or any internal web server. Tabs use URL hashes (`#events`, `#shifts`,
`#deck`, `#vendors`), so links to a tab survive a refresh and need no server rewrite rules.

## Where things live

```
src/lib/work-tools.ts   schedule + event rules, roster, weekly layout, .ics, vendor links (pure, browser-safe)
src/lib/work-files.ts   PDF reader (pdf.js), workbook reader (xlsx), Excel writer (exceljs), downloads
src/lib/deck-solver.ts  4×8 deck / holder / bridge planner (ported from Deck Builder Pro)
src/components/         one component per tab, plus the drop zone and a tiny Markdown renderer
```

Things you will probably want to edit in `src/lib/work-tools.ts`:

- `DEFAULT_SCHEDULE_NAME` — the name pre-filled on the My shifts tab (it is remembered per browser after you change it).
- `ENGINEER_ROSTER` — the names, badges and titles written onto the weekly Excel sheets.
- `TIME_ZONE` and the `"Mark Work"` event title used for calendar exports.
- `DECK_INVENTORY` (in `deck-solver.ts`) — how many decks and holders are in the warehouse.

## What changed from the original

- **No Lovable / Supabase / TanStack Start.** It is a plain Vite + React app with a hand-written stylesheet (light and dark mode follow your system).
- **"Add all to Google Calendar" was removed.** In the original it pushed shifts through Lovable's connector gateway and
  needed a sign-in, a database table and server secrets, none of which exist in a static app. The `.ics` download and the
  per-day "Add to Google" links cover the same need. If you want the one-click push back, it can be rebuilt with Google's
  browser sign-in and your own Google Cloud OAuth client.
- **Drag-and-drop** onto the drop zones (the original only supported click-to-browse), a color legend on the Events tab,
  and the name field is remembered.
- The `@deck` and `@price` chat commands are gone because there is no chat — the tabs replace them.
- The iCal ids now use `@show-services-tools` instead of `@pixel-pals`; re-importing an old `.ics` may create duplicates once.
