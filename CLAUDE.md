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
- **Before ending a session:** check that nothing Brody taught is unsaved, then
  tell him in one line what was saved, with links.
- Brody's latest instruction wins over memory. When they disagree, follow the
  instruction and correct the memory.
- Also read (never edit) the Drive folder "Claude Knowledge Base (NotebookLM)",
  e.g. "KB – NetSuite". It is generated from the memory on Brody's PC.
- Never save passwords, compensation or customer personal data.

## Limits of cloud sessions

NetSuite, Miva and files on Brody's PC are not reachable from cloud sessions.
That work runs on Brody's PC (Cowork / Claude Desktop with Claude in Chrome).
