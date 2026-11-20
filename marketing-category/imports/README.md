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

## Full export when the report is capped (Nov 20, 2026)

Brody: "Since it is maxed out you have to use the link that is within that email instead it loads a netsuite
search that has ALL the skus not just the 10k limit." When the email says "[TRUNCATED - LIMIT REACHED]" (or the
file has exactly 10,000 rows), the cloud routine adds `"fullExport": {"status": "ready", "url": <the email's View
Results link>}` to that day's manifest. The link is saved search 14260 in results view
(https://362135.app.netsuite.com/app/common/search/searchresults.nl?searchid=14260). The PC worker, in Job A:

1. Opens the url in the PCI Chrome profile (Chrome lock; Brody is signed in; retry once on a login page, never type
   a password). Results view only: never Edit or Save the search.
2. Exports the results as CSV (the export icon on the results page) and saves it as
   `searchresults-full-YYYY-MM-DD.csv`. Checks the header is
   `Internal ID,Name,Description,Type,Product Categories,Marketing Product Categories` and the row count is over 10,000.
3. Runs `python3 marketing-category/split_by_type.py --max-rows 25000 <file> <tmp dir>` (NetSuite takes at most
   25,000 rows per import file).
4. Copies each output to `marketing-category/imports/YYYY-MM-DD full <file name>.csv`, writes
   `marketing-category/imports/YYYY-MM-DD-full.json` (`status` "ready", files with rows and sha256, note "full export
   of saved search 14260"), and sets `fullExport` in the day's manifest to `{"status": "done", "rows", "at"}`.
   A non-empty Needs review.csv is committed too, as `YYYY-MM-DD full Needs review.csv`, for the cloud routine.
5. Marks every earlier held or ready file whose Internal IDs are all in the full export as
   `"result": {"status": "superseded", "by": "YYYY-MM-DD-full.json"}`, and its Ultron card superseded, so Brody
   answers one card per full-export file instead of one per daily slice.
6. Commits and pushes to claude/admiring-mayer-9myyi8, then imports the -full manifest like any other. A file over
   the 5,000-row standing limit gets one OVER_LIMIT card for Brody's Go (Routine rules, Actions).

A newer full export supersedes an older one that is still waiting.
