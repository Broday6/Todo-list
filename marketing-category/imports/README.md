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
