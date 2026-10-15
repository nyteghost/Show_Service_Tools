# Repository Guidance

## Project Shape

- This is a static, browser-only React app built with Vite. Do not add a server, authentication, or remote file upload unless the task explicitly calls for it.
- Keep schedule parsing, event rules, calendar output, vendor links, and deck planning in the browser-safe modules under `src/lib/`.
- Keep PDF and spreadsheet reading/writing and downloads in `src/lib/work-files.ts`.
- UI for each tool belongs in its corresponding component under `src/components/`; shared persisted state belongs in `src/hooks/`.
- Files selected by users are processed locally in the browser.

## Implementation Practices

- Preserve the existing TypeScript strictness and public behavior. Prefer small changes that follow neighboring code and tests.
- Add or update focused Vitest coverage for changes to parsing, planning, formatting, or other business logic.
- Keep dependencies and generated output minimal; do not commit build output from `dist/`.

## Validation

- `npm test` runs the unit tests.
- `npm run typecheck` runs the strict TypeScript check.
- `npm run build` verifies the production bundle.

Run the checks relevant to the changed code, and run all three for broad or cross-cutting changes.