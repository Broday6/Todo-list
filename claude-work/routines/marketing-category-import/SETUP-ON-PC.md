# Set up the daily Marketing Category import on Brody's PC

To use it, start a Claude Code session on Brody's PC and paste: "In my Todo-list clone, run `git fetch origin claude/wonderful-ptolemy-uioi17`, then read claude-work/routines/marketing-category-import/SETUP-ON-PC.md from that branch with `git show` and follow it."

## Run this on Brody's PC
This needs Claude Code on Brody's Windows PC with Claude in Chrome (PCI profile) and the scripts in `C:/Users/broda/Claude Code/ops/`. If you're in a cloud Linux container with no Claude in Chrome tools, stop and say it has to be started on the PC.

## Goal
Brody, Nov 10, 2026: "i need you to be able to consistently run it". He means the NetSuite import of the daily Marketing Category files. He chose **auto-import, with limits**: the PC imports each weekday's file without asking, only fills blank Marketing Product Categories values, and holds for his OK any row guessed from its description, any item that already has a value, and any file over 5,000 rows.

Done means three things:
1. A Claude Code scheduled task named `marketing-category-import` exists on this PC and runs weekdays at 8:40 AM and 1:40 PM Central.
2. It has run once now and imported today's file (66 items: 48 Mantels, 18 Beams).
3. The report below has gone to Brody.

## Steps
1. **Get the repo.** Find the PC's clone of Broday6/Todo-list. If there isn't one, clone it to `C:/Users/broda/Claude Code/repos/Todo-list`. Then run `git fetch origin claude/wonderful-ptolemy-uioi17 claude/admiring-mayer-9myyi8`. Read `TASK.md` in this folder from `origin/claude/wonderful-ptolemy-uioi17` (use `git show`; don't switch the clone's branch). TASK.md has the full steps and limits; `prep_import.py` next to it does the checking.
2. **Create the scheduled task.** Make it the same way as Brody's other Claude Code scheduled tasks on this PC (look at how `ultron-pc-worker` is set up and copy that). Use:
   - **Name:** `marketing-category-import`
   - **Schedule:** weekdays at 8:40 AM and 1:40 PM Central
   - **Working folder:** the same as the other PC tasks
   - **Prompt:** "In the Broday6/Todo-list clone, run `git fetch origin claude/wonderful-ptolemy-uioi17`, then read `claude-work/routines/marketing-category-import/TASK.md` from `origin/claude/wonderful-ptolemy-uioi17` with `git show` and follow it exactly." Keeping the prompt this short means changes pushed to TASK.md apply on the next run.

   It must run with the permissions the other Chrome tasks have (Claude in Chrome, Python and git), so it never stops on a permission prompt with nobody watching. Show Brody the task's settings before you save it.
3. **Run it once now** by following TASK.md yourself. The only pending file should be `marketing-category/imports/2026-11-10 Assembly-Bill of Materials.csv` (SHA-256 `2ab95c0bb8b20b61798e64d234584fbd0e79333c29061a083efc206428fd04c2`, 66 rows). Brody already OK'd all 66 rows, including the 2 Paints touch-up kits, and `prep_import.py` knows this. Spot-check 3329612 (MANURD08X06X60AI, expect Mantels) and 3329644 (TKHBEAMSAI, expect Beams) before and after.

   A cloud session wrote a `failed` run-log row for this file on Nov 10 because it couldn't reach NetSuite. Ignore that row. Before importing, check View CSV Import Status for a completed Nov 10 Assembly/Bill of Materials import of this file. If there is one, don't import again: run `prep_import.py mark` with that job's numbers instead.
4. **Check the cloud side.** Tell Brody that the cloud routine "Marketing Category Report" still queues a click-to-start import card every day until its prompt is updated. The new prompt and the one-line message to apply it are in `cloud-routine-prompt.md` in this folder. A routine's prompt can only be changed from its own conversation.

## Limits
- Follow TASK.md's limits.
- Never type a password or code. On a login page, stop and ask Brody to sign in.
- Never edit or save a saved search.
- Never send email.
- Change only Marketing Product Categories on the items in the checked import file.

## Report
- Whether the scheduled task was created, with its name, schedule and next run.
- Today's import: job number; processed, updated and error counts; before and after values for the two spot-check items; any error or held rows.
- The run-log row (TASK.md step 6).
