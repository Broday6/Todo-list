# 01 — Email triage (8:00 block)

**Status:** Spec written 2026-10-09. Routine not created yet. Planned: "E-comm 01: Morning email triage", weekdays 7:12 ET (before 8:00 in both ET and CT), fresh session each run, Microsoft 365 connector.

## What it does

1. Reads every inbox email since the last weekday's 5:00 PM.
2. Sorts each one into a bucket.
3. Writes Outlook reply drafts for "Needs Brody" items. Never sends.
4. Posts one summary and pushes to Brody's phone only if something is urgent.

## Buckets

| Bucket | How to spot it | Action |
|--------|----------------|--------|
| Needs Brody | Addressed to Brody (To, not only CC) with a question, request or decision; or from Ethan, Robert Sellek, Tory, Daniel | Reply draft on the existing thread |
| Case alert | Subject "ALERT - ECOM - Pending Cases" | List for the 9:30 Cases block |
| Bug mention | From notifications@bugherd.com | List task number and text for the 9:00 Bug Herds block |
| FYI | Brody only on CC, team threads already answered by someone else | One line each |
| Noise | Order confirmations (auto-confirm@millwork.com, homeover order confirmations), vendor newsletters, Google/Supabase marketing | Count only |

## Routine prompt

```
You are running Brody Simpson's 8:00 email triage. Brody is E-Commerce Team Lead at PCI Enterprises
(b.simpson@pcienterprises.com; also b.simpson@architecturaldepot.com and b.simpson@millwork.com).

Rules: never send email, never delete, move or mark anything read. Drafts only. Plain, specific
writing, no filler. Do not invent facts in drafts; leave [brackets] where Brody must fill in.

1. Use the Microsoft 365 connector. Search the inbox for email received since the previous weekday
   at 17:00 Eastern (on Monday, since Friday 17:00). Page through every result.
2. Read the full body of anything not obviously noise. Sort each email:
   - NEEDS BRODY: Brody is in To and someone asks him a question, requests something or needs a
     decision; or the sender is Ethan Sellek, Robert Sellek, Tory Kepler or Daniel Milkie and the
     thread waits on Brody. Skip it if Brody already replied later in the same thread.
   - CASE ALERT: subject contains "ALERT - ECOM - Pending Cases".
   - BUG: sender notifications@bugherd.com. Capture task number, status and the comment text.
   - FYI: Brody only CC'd, or someone else already handled it.
   - NOISE: order confirmations, newsletters, vendor marketing, meeting reminders.
3. For each NEEDS BRODY email, create a reply draft on that thread (outlook_create_reply_draft, or
   reply-all when others on the thread need the answer). Short, in Brody's voice, signed "Brody".
4. Final message, in this order:
   - "Needs you" — sender, subject, one-line ask, and "draft ready" or why there is no draft.
   - "Cases for 9:30" — count and case numbers if present in the alert.
   - "Bugs for 9:00" — BugHerd task numbers with one line each.
   - "FYI" — one line each, max 10.
   - "Noise" — a count only.
5. If any NEEDS BRODY item came from Ethan Sellek or Robert Sellek, or is marked high importance,
   say "URGENT" in the first line so the push notification fires.
```

## To do / next improvements

- [ ] Brody: review the first run's drafts and say what to change in tone or buckets.
- [ ] Add the naming-team and 3D-team names to the priority sender list when known.
- [ ] Optional: write the "Needs you" list onto today's board as a timed block.
