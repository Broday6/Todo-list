# PC worker: run cases and marketing category imports on its own (paste into Claude Code on your PC)

Brody, Nov 10, 2026: "cases didnt automatically start. Marketing categories didnt automatically start."
Why: both jobs need NetSuite, which only your PC can reach. The cloud left them as Suggested task cards or
"needs you" notes, which wait for a click. This adds two queues your PC worker checks on every run.

Paste everything below the line into Claude Code on your PC.

---

Update my scheduled task "ultron-pc-worker" (Claude desktop, Scheduled; it already runs every 30 minutes on
weekdays with Claude in Chrome on the PCI profile). Show me the new prompt as a diff and wait for my OK before
saving it. Then run it once with me watching.

Add these two jobs to every run, after the jobs it already does:

## A. Marketing category imports (standing instruction, Nov 10: "get the file uploaded to NetSuite through a local agent with the Chrome extension")
1. In my Todo-list repo run: git fetch origin claude/admiring-mayer-9myyi8, then read
   marketing-category/imports/*.json on that branch (git show origin/claude/admiring-mayer-9myyi8:<path>).
2. For each manifest with "status": "ready": check out the branch, verify each file's sha256 and row count
   against the manifest; if they differ, set status "failed" with a note and skip it.
3. Import each file with Claude in Chrome: take the Chrome lock (ops/preflight.py browser-lock), Setup >
   Import/Export > Import CSV Records > Items > the file's record type > Update; map only Internal ID and
   Marketing Product Categories; save or reuse mapping "Marketing Category Fill"; run; confirm on View CSV
   Import Status; spot-check two items; release the lock. Skip files over 25,000 rows. Never type a password
   (if a sign-in page shows, stop and set status "failed" with note "signed out"). Never edit a saved search.
4. Set the manifest's status to "imported" (with imported counts and errors) or "failed" (with the reason),
   commit "Imported <date> marketing categories", push to claude/admiring-mayer-9myyi8.
5. Add one row to the Notion "Ultron run log" (Job "Marketing Category import", Where "pc").
This job runs even while the worker is in dry-run mode for other alert fixes, because you approved this
import as a standing job. If you'd rather it waited, tell me now and I'll leave it in dry-run.

## B. Case lookups (read only)
1. Read Ultron (https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7) and find open tasks in
   group "cases" that have task.pcLookup.
2. For each, open the case in NetSuite (search 16559 or the case number) and READ ONLY: the vendor's question
   or message, the Assigned To, the status, the sales order and whether it is big-box (Home Depot or Lowe's).
   Never change any field, never reply in NetSuite, never send email.
3. Write one thread message on that task: {role:"claude", text:"From NetSuite: <what you read, plain words,
   no customer names, emails or phone numbers>", t:now}, remove task.pcLookup, set claudeStatus "queued" so
   the next hourly cloud run drafts the reply or the hand-off note. If you couldn't read it, say why in the
   thread and leave pcLookup.
4. Publish the board the way its state._note describes (only the state JSON replaced, NO capabilities field).

Also confirm the "NetSuite cases check (search 16559)" scheduled task exists and has run. If it does not
exist, create it from claude-work/2026-11-02/pc-tasks/cases-sweep-16559.md (weekdays 7:10 and 12:10), run it
once, and confirm it wrote state.casesSweep on the board.
