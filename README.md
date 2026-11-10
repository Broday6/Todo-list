# PC queue (doorbell from Ultron to Brody's PC)

Brody, Nov 10, 2026: "it needs to trigger on the pc from ultron".

Ultron runs in the cloud and can't reach NetSuite or Chrome on Brody's PC, and the board can't start a task on
the PC. So when a cloud run (Live chat, Give to Claude, Hand off, Auto hand-off, check-in) queues PC work on a
task (sets `task.pcLookup` on Ultron), it also pushes one small file here. A Windows task on the PC checks this
branch every 2 minutes with `git ls-remote` (no Claude, no cost while idle) and starts the PC worker as soon as
a new file appears.

- One file per request: `queue/<task id>-<unix ms>.json` = `{"task": "cs0980773", "kind": "work", "case": "0980773", "ask": "<Brody's newest instruction on the task, word for word, or empty>", "t": "<ISO time>", "by": "<routine name>"}`.
- No customer names, emails, phone numbers or addresses. The board task is the source of truth; this file only rings the bell.
- Never edit or delete a file once pushed. The PC keeps its own list of the files it has handled.
