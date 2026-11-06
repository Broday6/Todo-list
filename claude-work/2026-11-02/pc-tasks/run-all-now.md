# Run all PC pulls now (paste into one Claude desktop chat)

Paste the prompt below into a new chat in the Claude desktop app on your PC, with Claude in Chrome
connected to the PCI Chrome profile. It runs the four browser jobs back to back, then the board
picks them up at the next check-in (8:47, 11:47 or 2:47).

## Prompt

Run these four jobs now (the first three are read-only), one after the other, using Claude in Chrome on the PCI profile.
For each one, follow the instructions in its file exactly, including the board publish rules:

1. NetSuite cases check: https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-02/pc-tasks/cases-sweep-16559.md
2. BugHerd live pull: https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-02/pc-tasks/bugherd-sweep.md
3. Handshake check: run my existing "Handshake daily check" scheduled task's steps (read-only on Handshake;
   write state.hiring.sweep on the board; never message a candidate). Never write email addresses or phone
   numbers to the board; names, school, role and gist only.
4. BugHerd close: https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-05/bugherd-close-pc-task.md
   (sets to Done in BugHerd only the tickets I ticked Done or Not needed on Ultron; nothing else).

Read the board fresh before each publish, since each pull changes it. If a site shows a login page,
note it for that pull and move on to the next. Never change anything in NetSuite or Handshake; in BugHerd change only the status of the queued tickets in step 4.
At the end, reply with one line per pull.
