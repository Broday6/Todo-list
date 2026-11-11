> **RETIRED Nov 11, 2026 (Brody: "shut down ultrons version because its not working").** Do not follow this file.
> Strety scorecards are entered only by the Claude Code scheduled task `strety-scorecards` on Brody's PC
> (Wednesdays 8:20 Central, Thursday catch-up), on both boards, using each team's permanent Scorecards page.
> The meeting links below go stale every week. Ultron runs never queue, prompt or claim Strety work:
> see the Notion pages "Routine rules" (section "Strety is not an Ultron job any more") and "Strety weekly scorecard update".

# PC job: Strety weekly scorecards (both meetings)

Single source of truth for entering Brody's Strety scorecard numbers. Do not rewrite this as a new prompt per
run: every run (scheduled, PC worker, doorbell, or Brody pasting it) follows THIS file.
Brody, Nov 10, 2026: "update the scorecards in both of my meetings", after five cloud attempts that never reached the PC.

Why it kept failing (fixed by this file):
- Strety has no connector. Only Chrome on Brody's PC can enter numbers. Cloud chats can only write prompts.
- Each "Redo" made a cloud chat write a new prompt version (5 Notion pages) and say "queued for the PC worker",
  but the PC worker had no Strety job and the doorbell push from cloud chats is refused (no repo attached).
- Each version targeted one meeting; Brody needs BOTH.

## When it runs
- Weekly: a Claude desktop scheduled task on the PC, Wednesday 8:20 am (portal week numbers are final by then),
  for the week that ended the previous Sunday.
- On demand: the PC worker runs it when a board task has pcJob or pcLookup about Strety, or a pc-queue file has
  "kind":"strety". Before Wednesday, if the portal week looks partial (spend blank or far below the prior
  week), enter nothing and say so on the task; the Wednesday run does it.

## Steps
1. Chrome lock: `python "C:/Users/broda/Claude Code/ops/preflight.py" browser-lock acquire --task strety-scorecard --log`
   (PCI Chrome profile; run `preflight.py chrome` if not connected).
2. WEEK = the last full Mon-Sun week (portal week number, e.g. 44 = Nov 2-8, 2026).
3. Marketing Portal (https://productmarketing.pcienterprises.com/html/home.php) Dynamic report: Category Leader
   Group = Group 5, Time Period = Week, year, WEEK, Same Week Last Year, Actual - Revenue Report, show all rows,
   Generate (45-60 s). Not signed in: stop, set the task's pcJob.status "needs_signin", say "Sign in to the Marketing Portal".
4. Values (same mapping for both meetings): Group 5 total = "Sub-Total for Group: 5"; Beams, Mantels,
   Hardware & Adhesive = their "Marketing Sub-Total" rows. Growth % = Same Week Last Year Growth %;
   $ Growth = selected week revenue; Spend % = % Spend; $ Spend = Marketing Spend.
5. For EACH meeting below: open it, go to its Scorecards (never click Start Meeting), choose Weekly, filter
   Owner = Brody Simpson, scroll so every row loads, list every row Brody owns (name, unit, target).
   - E-Commerce Sales & Marketing Power Hour L10:
     https://2.strety.com/0bac44c6-e618-4503-bec3-5da3ba0c9b88/meetings/59e56255-eedc-4bdc-b6f5-22ddf08823ec/agenda_items/5f19743d-62bf-4f72-a384-92fd3610c842
   - Marketing, Sales, & Web Dev L10:
     https://2.strety.com/0bac44c6-e618-4503-bec3-5da3ba0c9b88/meetings/2f98527b-0b5e-4f4b-a208-2892a8e3c6f6
   If a scorecard is shared between the two meetings, entering it once fills both; still re-read it on both.
6. In the WEEK column, for each row: click the cell, type the bare number (10.96 for %, 310619.18 for $),
   Save Check in, wait 2 s, next row. A row with no portal value: leave blank and list it, never guess.
7. Reload both meetings' Scorecards, re-read every entered cell, confirm each matches the portal.
8. Release the lock. On Ultron, on the Strety task (today's "Strety" block task, or ho-blk-n10-7 for week 44):
   thread message "From the PC: Strety week WEEK entered and confirmed on both meetings" with a table of
   row / value per meeting and anything left blank; receipt {status "done", where: both meeting URLs};
   pcJob.status "done"; clear pcLookup; claudeStatus "ready". Publish once (state JSON only, NO capabilities
   field). Add the week to the Notion page "Strety weekly scorecard update".

## Rules
- Only scorecard check-ins for rows Brody owns. Never edit rocks, to-dos, targets, other people's rows or
  meeting settings unless the board task has Brody's OK for that exact change (task.approved).
- No customer data anywhere.
