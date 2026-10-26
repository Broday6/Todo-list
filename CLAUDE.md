# Claude instructions for Brody's sessions

## Memory: read first, save as you go

Cloud sessions in this repo start with no local memory. Notion Memory is the
shared memory across all of Brody's Claude surfaces (Cowork, Desktop, Claude in
Chrome, cloud Claude Code, claude.ai).

- **Before starting work:** fetch Notion Memory (`fetch` with id `"memory"`) and
  run `memory-search` for the task's topic.
- **Save in the same turn** whenever Brody explains a workflow, answers a how-to
  question, names an owner or where something lives, corrects you, or says
  remember / always / never. Search first and update the existing topic page
  (one topic per page). Don't wait for the end of the session; it can end
  without warning.
- **Then sync:** after the last memory save in a turn, fire the routine
  "Notion memory KB sync" once (`fire_trigger`, id
  `trig_01A9Xm1hJZcUvWy1scHirSi6`). It copies Notion Memory into the
  "KB – Notion Memory" doc that feeds NotebookLM. If you can't fire it, skip
  this; the routine also runs every Monday.
- **Before ending a session:** check that nothing Brody taught is unsaved, then
  tell him in one line what was saved, with links.
- Brody's latest instruction wins over memory. When they disagree, follow the
  instruction and correct the memory.
- Since 2026-10-26, Notion Memory is the source of truth: the memory docs in
  the Drive folder "Claude Knowledge Base (NotebookLM)" (KB – Core, KB –
  NetSuite, Parts 0–6, etc.) were imported into it and are now an archive.
- For product facts, read (never edit) that folder's "Spec – …" docs and
  "KB – Products & Specs (Index)". "KB – Notion Memory" is written only by the
  sync routine.
- Never save passwords, compensation or customer personal data.

## Limits of cloud sessions

NetSuite, Miva and files on Brody's PC are not reachable from cloud sessions.
That work runs on Brody's PC (Cowork / Claude Desktop with Claude in Chrome).
