# BugHerd live pull (PC scheduled task)

- **Name:** BugHerd live pull
- **Schedule:** weekdays 7:15 Central (before the 6:50 rebuild's next check-in at 8:47)
- **Needs:** Claude desktop open, Claude in Chrome on the PCI Chrome profile, signed in to BugHerd.

## Prompt

Read Brody's open BugHerd tickets and write them to his board. Read-only in BugHerd: never move,
comment on, assign, archive or close a ticket, and never send anything to Web Dev.

1. In Chrome (PCI profile), open the "Our Websites Bugs" project board on bugherd.com. If you hit a
   login page, stop and write only `state.bugherdSweep.note = "Signed out of BugHerd on <date>"`
   (step 4), keeping every other field as it is.
2. Filter to tickets assigned to Brody Simpson. For every ticket in To Do, Doing and Backlog, note its
   number and column. Also note tickets that were in the previous sweep but are now Done, archived or
   assigned to someone else.
3. Read the board: Artifact tool, action "read", URL
   https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7. If the saved file doesn't
   itself start with `<!doctype html>\n<html`, keep only the inner document from that point to its
   `</body>\n</html>\n`. Parse the JSON in `<script id="state" type="application/json">` (unescape
   `<\/`). Keep the previous `state.bugherdSweep` to compare.
4. Set `state.bugherdSweep` = {asOf: now ISO, open: [ticket numbers as strings, newest first],
   counts: {todo, doing, backlog}, archived: [numbers gone since the last sweep because they were
   archived], done: [numbers moved to Done], reassigned: {number: "<first and last name>"},
   new: [numbers not in the last sweep], note: one plain line, e.g. "15 open assigned to Brody
   (7 To Do, 2 Doing, 6 Backlog), live pull Nov 2. Since the Oct 30 sweep: 2 archived, 1 new."}.
   Change nothing else in the state. Never mark a board task done.
5. Publish surgically: keep the HTML exactly as read, `<style id="style">` and `<script id="app">`
   byte for byte; replace only the state JSON (same indent style as you found it), re-escape `</` as
   `<\/`, bump `state.updated`. Artifact action "publish" to the same URL with NO capabilities field.
   If the publish is refused because a newer version is live, read again, re-apply only
   `state.bugherdSweep`, and publish once more.
6. Reply with the note line.
