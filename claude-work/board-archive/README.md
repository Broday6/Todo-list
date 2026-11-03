# Board archive

`days.json` holds the days trimmed off Brody's board to keep it light: every day older than 14 days, exactly as it was (plan blocks, log, inbox, pulse, ops), plus `ops` (Cases & alerts reads) for days other than the newest two.

The board keeps a small stub for each archived day (ticked work blocks, the sales pulse total and closed waiting lines) so nothing on the board changes. The 7:12 run of the hourly board routine adds to this file each weekday. Trimmed by `claude-work/2026-11-03/board-build/v5.py`.
