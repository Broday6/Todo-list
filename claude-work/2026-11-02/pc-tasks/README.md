# PC scheduled tasks for Ultron (Brody's board) (Nov 2)

These run in the Claude desktop app on Brody's PC, because they need the PCI Chrome profile
(NetSuite, BugHerd, Handshake, the Product Marketing Portal). The cloud board session can't
reach the PC, so it can't start them. Each one writes its results into the board's state,
and the cloud rebuild and check-ins pick them up.

## Run now (today, Nov 2), in Claude desktop > Scheduled
1. **Weekly ads + portal audit (AD)**, Mondays 9:30. Runs on its own at 9:30 if the app is open.
   It is the first read of the Product Marketing Portal since Oct 28; the 11:23 ads refresh
   copies it onto the Ads tab.
2. **Handshake daily check**, 7:35. It failed Nov 1 (signed out). Click Run now.
3. **BugHerd live pull**: new task, see `bugherd-sweep.md`. Create it, then Run now.
4. **NetSuite cases check (search 16559)**: new task, see `cases-sweep-16559.md`.
   Create it, then Run now. Until it runs, the Cases tab has no source.

## New tasks to create
| File | Name | Schedule (Central) | Writes |
|---|---|---|---|
| `bugherd-sweep.md` | BugHerd live pull | Weekdays 7:15 | `state.bugherdSweep` |
| `cases-sweep-16559.md` | NetSuite cases check (search 16559) | Weekdays 7:10 and 12:10 | `state.casesSweep` |

Paste each file's "Prompt" section into a new scheduled task. Both are read-only in
BugHerd and NetSuite, and they change only their own key in the board's state.
