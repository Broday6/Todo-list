# Marketing category import queue

The cloud "Marketing Category Report" routine builds the fill files here every weekday and writes a manifest
`YYYY-MM-DD.json` with `"status": "ready"`. The PC worker on Brody's PC (Claude desktop, Scheduled, with
Claude in Chrome) imports every ready manifest into NetSuite and sets `"status"` to `"imported"` or `"failed"`
(with `"note"`). Brody's standing instruction (Nov 10, 2026): fill every row and get the file uploaded through
a local agent with the Chrome extension.

Manifest: `{"date","status","files":[{"name","recordType","rows","sha256"}]}`.
Import steps (Nov 10 import brief): verify sha256 and row count; Setup > Import/Export > Import CSV Records >
Items > the file's record type > Update; map only Internal ID and Marketing Product Categories; save mapping
"Marketing Category Fill"; run; confirm on View CSV Import Status; spot-check two items. Never type a password,
never edit a saved search, skip files over 25,000 rows.

## Held files and Ultron actions (Nov 11, 2026)

The PC worker may set a manifest to `"held"` (over its 5,000-row limit, a sign-in page, or a permission refusal), with a
`note`. It also writes one record in Ultron's `state.actions` per held file (reason OVER_LIMIT, NEEDS_SIGNIN or
NEEDS_PERMISSION; `resume` = {kind "mc-import", branch, manifest, file, recordType, rows, sha256}). Brody's Go, Retry or
"I did it myself" on that card is saved on the board; the PC worker's Job 0 imports that one file on a Go (the sha256 must
match; a Go lifts the 5,000-row limit for that file only, never past 25,000), then sets the file's status here and closes the
record. Contract: Notion "Routine rules", section "Actions".
