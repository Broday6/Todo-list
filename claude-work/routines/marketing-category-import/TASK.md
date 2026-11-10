# Daily Marketing Category import (PC scheduled task)

**Where it runs:** Claude Code on Brody's PC, as the scheduled task `marketing-category-import`. It runs weekdays at **8:40 AM and 1:40 PM Central**. It needs Claude in Chrome on the PCI profile. A cloud session can't run it: if you're in a Linux container with no Claude in Chrome tools, stop and say it has to run on the PC.

**Where the prompt lives:** the scheduled task's own prompt only says to fetch branch `claude/wonderful-ptolemy-uioi17` of Broday6/Todo-list and follow this file. That way, changes pushed here apply on the next run.

## Goal and done

Every weekday the cloud routine "Marketing Category Report" (7:51 AM Central) splits NetSuite's "E-Commerce Lead: Products Without Marketing Category" report (saved search 14260). It fills in Marketing Product Categories and pushes one import CSV per item Type to `marketing-category/imports/` on branch `claude/admiring-mayer-9myyi8`. This task imports each new file into NetSuite.

A run is done when each new file's import shows **completed** on View CSV Import Status, the two spot-check items show the new value, and a run-log row records the counts. Items that miss Marketing Product Categories don't roll up into Brody's Marketing Portal groups, which is why this matters.

## Brody's OK and its limits

Brody, Nov 10, 2026: "i need you to be able to consistently run it". He picked **auto-import, with limits**. That is his standing OK to import these files without asking each day, within these limits only:

- Change **only** Marketing Product Categories, and only on the items in the checked `import.csv`. That file has just two columns, Internal ID and Marketing Product Categories.
- Only fill a **blank** value. An item that already has a value is held.
- Hold, don't import:
  - a row whose category was **guessed** from its description, not taken from a Product Category rule Brody set;
  - a row whose rule disagrees with the file;
  - a file over **5,000 rows**.

  `prep_import.py` applies all of these. Never import a held row without Brody's OK.
- Everything else in Routine rules still applies:
  - Never edit or save a saved search. Preview only, never Save or Save As.
  - Never type a password or code.
  - Never send email.
  - Never change any other record or field.

## Steps

0. **Routine rules.** If Notion is connected, read the Notion page "Routine rules" (id 40f0034183cf8136a607d17d140a3b9d). Follow its Step 0 and its "PC scheduled tasks that use Chrome" rules.
1. **Chrome lock.** Run `python "C:/Users/broda/Claude Code/ops/preflight.py" browser-lock acquire --task marketing-category-import --log`. If Chrome is still busy after the wait, write a `skipped` run-log row and stop. If the PCI profile isn't connected, run `python "C:/Users/broda/Claude Code/ops/preflight.py" chrome`, wait 20 seconds and check again. If it's still missing, run it again with `--window`.
2. **Get the files.**
   - Use the PC's clone of Broday6/Todo-list. If there isn't one, clone it to `C:/Users/broda/Claude Code/repos/Todo-list`.
   - In the clone, run `git fetch origin claude/wonderful-ptolemy-uioi17 claude/admiring-mayer-9myyi8`. Leave the clone's checked-out branch alone.
   - Copy the checker to the work folder: `git show origin/claude/wonderful-ptolemy-uioi17:claude-work/routines/marketing-category-import/prep_import.py > "C:/Users/broda/Claude Code/marketing-category-import/prep_import.py"`.
3. **Check them.** Run `python -I "C:/Users/broda/Claude Code/marketing-category-import/prep_import.py" plan --repo <clone> --work "C:/Users/broda/Claude Code/marketing-category-import"`.
   - The JSON it prints lists `pending` files, each with its own `plan.json`, `import.csv` and `held.csv`.
   - `ledger.json` in the work folder records what was already imported, so a file is never imported twice.
   - If nothing is pending, release the lock, write a `skipped` row ("No new import files") and stop.
4. **For each pending file:**
   1. **Blank check.**
      - Use `netsuite-import/browser/marketing_category_pull.js` on Brody's search 14837 (Preview only, never Save). Pull the active items in the plan's `product_categories` that already have any Marketing Product Categories value (its anyMkt option).
      - Save the pull as a CSV with an Internal ID column, then run step 3 again with `--already-set <that csv>`. Those items move to `held.csv`.
      - If the pull fails twice and the plan's `age_days` is 0 or 1, the file came from the latest report, which lists only blank items. You may go on, but write "blank check not run" in the run log. Otherwise hold the whole file.
   2. If `import_rows` is 0, go to step 4.7.
   3. **Before values.** Open the plan's two `spot_check` items in NetSuite and note their Marketing Product Categories (expected: empty). For the `2026-11-10 Assembly-Bill of Materials` file, check 3329612 (MANURD08X06X60AI) and 3329644 (TKHBEAMSAI), the two items Brody named.
   4. **Import.**
      - Go to Setup > Import/Export > Import CSV Records.
      - Choose Import Type **Items**, Record Type = the plan's `record_type`, and Character Encoding **Unicode (UTF-8)**.
      - Upload the plan's `import.csv`. If Claude in Chrome can't fill the file field, try the courier file-input method from the asana-slide-uploader skill. If that fails too, stop with status `failed` and set unlockBy to "Upload <file> in NetSuite's Import CSV Records".
      - Set Data Handling to **Update**.
      - Map exactly two fields: Internal ID → Internal ID, and Marketing Product Categories → Marketing Product Categories.
      - Reuse or save the mapping as **"Marketing Category Fill"** for Assembly/Bill of Materials, or **"Marketing Category Fill - <record type>"** for any other type. Before reusing a saved mapping, check that it maps only those two fields.
      - Click **Run**.
   5. **Result.** On Setup > Import/Export > View CSV Import Status, wait for the job to finish. Record the job number and the processed, updated and error counts. If there are errors, download the error file and list the failed rows.
   6. **After values.** Open the two spot-check items again and confirm each shows its `expect` value. Then run `prep_import.py mark --work <work> --sha <sha256> --job <n> --processed <n> --updated <n> --errors <n>`.
   7. **Held rows.**
      - If `held.csv` has rows, ask Brody once with a goAsk. Add a pcOnly task on Ultron the same way the PC alert run does: the exact rows before → after, the reasons, and previewHash = the file's sha256.
      - If no helper on the PC can write a goAsk, put "Needs you: N rows held (reasons)" at the top of the run-log Summary instead.
      - When Brody says go for that file, a later run passes `--approve <sha256>` to step 3. Its held guessed, mismatch and large-file rows are then offered for import. Held already-set rows are never imported.
5. **Release the lock:** `python "C:/Users/broda/Claude Code/ops/preflight.py" browser-lock release --task marketing-category-import`.
6. **Log it.** Add one row per file to the Ultron run log (data source 0cec97f0-a88b-4c0b-af8d-91d544fce4fa):
   - **Job:** "Marketing Category NetSuite import"
   - **Run at:** now
   - **Status:**
     - `ok`: updated = import_rows, 0 errors and nothing held;
     - `partial`: some errors, or rows held;
     - `failed`: the import didn't run or didn't complete.
   - **Summary:** start with "Couldn't read NetSuite" when it failed.
   - **Counts:** job number; processed, updated and errors; held, with the reasons.
   - **Read:** for example `netsuite:ready, chrome:ready`.
   - **Minutes saved:** 15 per file that imported, otherwise 0.
   - **Links**
   - **Where:** `pc`
   - **Run ID:** the plan's `run_id`.

## When something goes wrong

- **Login page:** stop and don't type anything. Release the lock. Write a `failed` row with the Summary "Couldn't read NetSuite: signed out" and unlockBy "Sign in to NetSuite on the PCI profile".
- **A step fails:** retry it once. If it fails again, stop, release the lock and log the exact error and where it happened.
- **Success:** report it only when View CSV Import Status shows the job completed.
- **Files that don't match the import:** if a file in `imports/` doesn't fit this flow (mixed Types, unknown values), it stays held. Say so in the log and leave it for the cloud routine to fix.
