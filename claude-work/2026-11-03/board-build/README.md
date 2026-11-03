# Board build, Nov 3 2026

Scripts that rebuilt Brody's board in stages (run in this order, each takes the previous output):

1. `build.py` — Tasks clean-up: closes the clear ones (Q3 Rocks, duplicates, past meetings), adds Clean-up suggestions, "Claude can do this" tags, per-task last-update lines, idea triage (Interested / Not now).
2. `auto.py` — Automations tab v2: where each job lives, what starts it, what it makes, live last-run from board data, today's run order, and an In the works list.
3. `log.py` — Day log v2: ticks, closes and Claude's thread messages log themselves; Win / Blocked kinds; filters.
4. `team.py <in> <out> team.json` — Team tab from a read of Teams and email.
5. `promo.py <in> <out> promos.json` — Promotions calendar.
6. `score.py` — Quarter scorecard and Friday wins (Week tab), Waiting on others (Team tab).

Each script only swaps the state JSON and inserts app code with exact-match asserts.
7. `pe.py` — "Write the emails" on each promotion: hands the campaign emails to Claude as a queued task.
