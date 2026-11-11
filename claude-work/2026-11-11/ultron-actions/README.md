# Ultron actions (patch51, Nov 11, 2026)

Brody: "I dont have a way to trigger this task from that task within ultron ... tasks are seeing the right things but
triggers seeing how to trigger or what to trigger is not going well."

Live on Ultron since version 976. Game plan and research: Notion page "Ultron triggers: game plan and build (Nov 11, 2026)"
under "Ultron (Brody's board)". Contract every routine and the PC worker follows: Notion "Routine rules", section "Actions".

- `ux51.js`: `state.actions` (one record per wait), the "Needs your go" panel on Today and Approvals, buttons by reason code
  that write the decision on the board, ring the PC doorbell through Live chat, and cards for older goAsk / plan / sign-in tasks.
- `patch51.py <board.html> <out.html>`: inserts ux51.js just before the boot `render();` (after every other wrapper), seeds
  act-mc-2026-11-11-assembly and act-mc-2026-11-11-kit, and adds the ACTIONS note to `state._note`. Idempotent. Needs patch50.
  Run it from a copy of this folder next to the other board-build patches (claude-work/2026-11-05/board-build on
  claude/brodys-board-v2-fuviv5).
- `tests/`: drop-in replacements for `claude-work/tests/board_tests.js` and `check_state.py` on the board branch. They add the
  Approvals overflow check, the action schema check and four action browser checks (Go publishes and rings once, no second
  Go, Undo, an older goAsk card stores a record on first click). `bash claude-work/tests/run.sh board.html` -> 34 passed.
