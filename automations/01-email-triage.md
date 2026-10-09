# 01 — Email triage (8:00 block)

**Status:** Rebuilt to run locally on Brody's PC (2026-10-09). Prompt: [local/01-email-triage.prompt.md](local/01-email-triage.prompt.md). Brody registers the schedule himself (below). No cloud routine.

## Set it up on the PC (Brody, about 3 minutes)

1. Open the Claude Desktop app. Check that Microsoft 365 is connected under Settings → Connectors.
2. Create a new scheduled task (in Cowork / Claude Code on desktop: the Scheduled section, "New task").
3. Name: `E-comm 01 - Morning email triage`. Schedule: weekdays, 7:12 AM (before the 8:00 block in ET or CT).
4. Paste the full text of `local/01-email-triage.prompt.md` as the task prompt.
5. Permissions: allow Microsoft 365 mail search, read, and create reply draft; allow writing files in `OneDrive\Claude Automations`. Do **not** allow send mail or send draft.
6. Click "Run now" once and check Outlook Drafts and the summary file.

The PC must be on and signed in at 7:12. Desktop scheduled tasks don't run while the machine sleeps; they catch up when it wakes.

## What it does

1. Reads every inbox email since the last weekday's 5:00 PM.
2. Sorts each one into a bucket.
3. Writes Outlook reply drafts for "Needs Brody" items. Never sends.
4. Saves one summary to `OneDrive\Claude Automations\email-triage\<date>.md`, starting with "URGENT" when something can't wait.

## Buckets

| Bucket | How to spot it | Action |
|--------|----------------|--------|
| Needs Brody | Addressed to Brody (To, not only CC) with a question, request or decision; or from Ethan, Robert Sellek, Tory, Daniel | Reply draft on the existing thread |
| Case alert | Subject "ALERT - ECOM - Pending Cases" | List for the 9:30 Cases block |
| Bug mention | From notifications@bugherd.com | List task number and text for the 9:00 Bug Herds block |
| FYI | Brody only on CC, team threads already answered by someone else | One line each |
| Noise | Order confirmations (auto-confirm@millwork.com, homeover order confirmations), vendor newsletters, Google/Supabase marketing | Count only |

## Routine prompt

See [local/01-email-triage.prompt.md](local/01-email-triage.prompt.md). Edit it there only.

## To do / next improvements

- [ ] Brody: review the first run's drafts and say what to change in tone or buckets.
- [ ] Add the naming-team and 3D-team names to the priority sender list when known.
- [ ] Optional: write the "Needs you" list onto today's board as a timed block.
