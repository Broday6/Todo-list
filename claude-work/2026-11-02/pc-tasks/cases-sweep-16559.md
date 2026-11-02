# NetSuite cases check, search 16559 (PC scheduled task)

- **Name:** NetSuite cases check (search 16559)
- **Schedule:** weekdays 7:10 and 12:10 Central
- **Needs:** Claude desktop open, Claude in Chrome on the PCI Chrome profile, signed in to NetSuite.
- **Why:** Brody's rule (Oct 28): cases come only from NetSuite saved search 16559, never from the
  "ALERT - ECOM - Pending Cases" emails. This task is that source (board task cn1029-7).

## Prompt

Read NetSuite saved search 16559 and write the open cases to Brody's board. Read-only in NetSuite:
open the search results only. Never edit, save, reassign or close a case, never edit the saved
search (Preview only, never Save), and never export a file to anyone.

1. In Chrome (PCI profile), open NetSuite saved search 16559 (ECOM pending cases) results. If you hit
   a login page, stop and write only `state.casesSweep.note = "Signed out of NetSuite on <date>"`
   (step 3), keeping any other fields.
2. For every row, read: case number, subject or issue, vendor, status, date created, assigned to.
   Do NOT read or store the Company (customer) field, or any customer name, email, phone or address.
3. Read the board: Artifact tool, action "read", URL
   https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7. If the saved file doesn't
   itself start with `<!doctype html>\n<html`, keep only the inner document from that point to its
   `</body>\n</html>\n`. Parse the JSON in `<script id="state" type="application/json">` (unescape `<\/`).
4. Set `state.casesSweep` = {asOf: now ISO, search: "16559", total: <rows>, mine: <rows assigned to
   Brody Simpson>, open: [{no, issue (at most 60 characters), vendor, status, created (YYYY-MM-DD),
   assignedTo (first and last name, "" if unassigned), group, leader}] oldest first}, note: one plain
   line, e.g. "22 open in search 16559, 3 assigned to you, live pull Nov 2"}.
   group and leader only when the vendor makes it clear (G1 Flex Trim, no leader; G2 Turncraft, AFCO:
   Andrew Gonzalez; G3 ACP: Hayden Clow; G4 Builder's Edge, Mid-America: Lauren Milkie; G5 Pearl
   Mantels, Brass Accents: Brody), otherwise "". Change nothing else in the state: the cloud rebuild
   adds case tasks for Brody's own cases from this list. Never mark a task done.
5. Publish surgically: keep the HTML exactly as read, `<style id="style">` and `<script id="app">`
   byte for byte; replace only the state JSON (same indent style as you found it), re-escape `</` as
   `<\/`, bump `state.updated`. Artifact action "publish" to the same URL with NO capabilities field.
   If refused because a newer version is live, read again, re-apply only `state.casesSweep`, publish again.
6. Reply with the note line.
