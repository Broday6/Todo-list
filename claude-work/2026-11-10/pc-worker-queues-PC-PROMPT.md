# PC worker: cases and marketing category imports run on their own (paste into Claude Code on your PC)

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

## B. Cases: look them up, hand Kody his, do approved case updates
Brody, Nov 10: "It should look these up in netsuite without me telling it too. Then if it is from amazon lowes
homedepot or wayfair it assigns them to kody." Every run, with NetSuite open in Claude in Chrome (take and
release the Chrome lock; never type a password; if signed out, stop this job and say so on the board):

1. Open saved search 16559 "ECOM - Pending Cases" (Preview only, never edit or save the search) and list every
   case on it. Also include every open task in group "cases" on Ultron and any with task.pcLookup.
2. For each case, open it and READ: Assigned To, the order and its channel (Amazon, Lowe's, Home Depot,
   Wayfair, Architectural Depot, other), order date, case status, the vendor's message or question, the
   cancellation reason, Quick Notes, and the order lines (item and quantity). Write on the board task
   cs<case#> (add the task in group "cases" if it is missing and the case is assigned to Brody):
   task.case.facts = {asOf, assignedTo, channel, order, orderDate, status, vendorMessage, cancelReason,
   quickNotes, lines} and one thread message "From NetSuite: <plain summary>". No customer names, emails,
   phone numbers or the Company field anywhere on the board.
3. Assigned to Kody Goss already: write facts.assignedTo "Kody Goss" and leave it; the cloud closes the task.
4. Channel is Amazon, Lowe's, Home Depot or Wayfair and Assigned To is Brody: set Assigned To = Kody Goss and
   save. This is the ONLY field you may change without a new OK (Brody's standing OK, Nov 10). Reload and
   confirm it saved, then write facts.assignedTo "Kody Goss", facts.reassigned {t, from:"Brody Simpson"} and a
   thread message "Reassigned to Kody in NetSuite (marketplace order: <channel>)."
5. Brody approved a case update (task.approved, or task.pcApprovals for the case, after a "Proposed:" thread
   message): add the Quick Note to Sarah exactly as written in the proposal, set the status to "In Progress -
   Order Processing", save, confirm, and write "Done in NetSuite: Quick Note added, status set" in the thread.
   Change nothing else.
6. Clear task.pcLookup on every task you handled and publish the board once (only the state JSON replaced, NO
   capabilities field). Add one row to the Notion "Ultron run log" (Job "Cases (PC)", Where "pc").
The cloud hourly then builds Brody's proposed solutions from those facts.

Also confirm the "NetSuite cases check (search 16559)" scheduled task exists and has run. If it does not
exist, create it from claude-work/2026-11-02/pc-tasks/cases-sweep-16559.md (weekdays 7:10 and 12:10), run it
once, and confirm it wrote state.casesSweep on the board.
