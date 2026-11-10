# PC automation fixes (paste into Claude Code on your PC)

Brody, Nov 9, 2026: the PC worker "normally did not catch something", "we should fix" the alert run's two
blind spots, and the watchdog should stop making a new task every day. All of the code these touch lives on
your PC (the netsuite-import folder and the scheduled tasks), so this prompt is for Claude Code there.

Paste everything below the line.

---

Fix four things in my PC automations. Find the real code first (the alert run, the alert fixer `alertfix.py` /
`alerts.json`, `alert_board.py`, the `ultron-pc-worker` task and the stuck-run watchdog; they are in my
netsuite-import folder and my Claude scheduled tasks). Show me each change as a diff and wait for my OK before
you save it. Never import anything into NetSuite and never send email while doing this. My board is Ultron:
https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7

## 1. My approvals get erased, so the PC worker finds nothing to do

What happens now: I press go on an alert task (for example "Parent Item with Default Variant SKU Updates" on
Nov 6). The next morning a newer alert email of the same type arrives, the alert run rewrites the task
(new note, new file path, new goAsk), wipes `task.approved`, and writes "A newer alert email replaced the one
you approved. Approve again." The PC worker then logs "Nothing approved for the PC" (16 of its last 17 runs).

Change it so that:
- The board now keeps my go per alert type in `state.pcApprovals[<type>] = {t, what, taskId, by}` where
  `<type>` is the task id without its date (for example `al-default_variant`). The alert run must never erase
  `state.pcApprovals`, and must keep `task.approved` and the task's thread when it refreshes a task for a newer
  email of the same type.
- My go for the FIRST step (pull the items with saved search 14837 and build the import preview, or save the
  owner-list draft) carries over to the newer email's file. Use the newest fix file. Never ask me to approve
  that first step again while a `pcApprovals` entry for the type is under 14 days old.
- The second step (the actual NetSuite import of the exact rows) still always waits for a new OK from me on
  that exact preview. Nothing changes there.
- A hold whose only reason is "the task note and the go ask point at different dated files" is cleared by
  using the newest file; say which file you used in the thread.
- The PC worker reads `state.pcApprovals` as well as `task.approved` when it looks for work.
- Tell me whether the worker is still in dry-run mode (`live=false`). Do not switch it yourself. Tell me
  exactly what turning it on would let it do, so I can decide. My rule stays: previews and drafts are fine,
  imports need my OK on the exact rows.

## 2. The alert run can't read big files

Its last run skipped the group list price, Ekena site and marketing category files (348 KB to 2 MB, "too
large to read") and the category images file ("unexpected layout").

- Never open an alert CSV with the Read tool. Process it with Python (`csv` or `pandas`): row count, columns,
  then the same fix rules the small files use. Only print counts and the first few changed rows.
- For the category images file, print its header row and first 3 rows, tell me how the layout differs from
  what `alertfix.py` expects, and propose the smallest change to handle it.

## 3. Attachments that never reach OneDrive

Four alert tasks are stuck because the Power Automate flow didn't save the email's attachments (Missing
Miva.PCI Category Images, FAM Lead Time Updates, Products Without Marketing Category, Inaccurate EkenaMillwork
Items). The fix is in the flow itself, which only I can edit:
1. Open the flow that saves NetSuite alert attachments to OneDrive.
2. On the trigger "When a new email arrives", set Include Attachments to No.
3. Inside an "Apply to each" over the trigger's attachments, add "Get attachment (V2)" (message id from the
   trigger, attachment id from the current item) and feed ITS content into the "Create file" step.
4. Save, then use Resubmit on the failed runs for those four emails.
Walk me through those four steps on screen and check afterwards that the files are in the OneDrive folder.
Also make the alert run fall back to reading the attachment straight from the email with Python when the
OneDrive file is missing, and say in the task which way it got the file.

## 4. One watchdog task, not a new one every day

The stuck-run watchdog adds a new board task each day (`wd-2026-11-05`, `wd-2026-11-06`, `wd-2026-11-09` are
all open for the same two problems). Change it to keep ONE task with id `wd-open`: update its title, note and
list in place, and leave it alone when nothing changed. Fold the three open `wd-` tasks into it (ask me before
you mark the old three as no longer needed). The board's own Health tab (Control room) now checks the cloud
routines, so the PC watchdog only needs to cover the PC scheduled tasks.

When all four are done, write one line per fix in the Notion "Ultron run log" and tell me what changed.
