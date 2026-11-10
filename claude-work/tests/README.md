# Ultron board tests

Never publish a board build unless run.sh passes on that exact file.

## Run

    bash claude-work/tests/run.sh /abs/path/board.html

Prints `ALL PASSED` (exit 0) or `FAILED` (exit non-zero). About 75 seconds. Needs Python 3, Node and Playwright with Chromium (`NODE_PATH=$(npm root -g)` is set by run.sh). The board file must be the unwrapped HTML (starts with `<!doctype html>`).

## What it checks

1. `check_state.py`: state JSON parses; required top-level keys; tasks have id/group/title/done with unique ids; `state.chat.trig` starts `trig_`; no unescaped `</script` in state; each patch's code marker appears once in the app code; the embedded evaluator's sha256 matches its source.
2. Evaluator: `tools/evaluate_board.py` prints valid JSON with `evaluator.score` in 0-100.
3. `board_tests.js` (Playwright, desktop 1400x1000 and phone 390x800, with `window.claude` stubbed): no page errors; no horizontal overflow on Today, Inbox, Tasks, Claude, Live chat, Control room; Live chat box width, Send fires `state.chat.trig`, failed send shows `.ux-note` and Send again; Inbox More menu and Done; Tasks compact, Full details, Show all N, search; Claude tab "Clear in one sitting" and Copy one prompt; every Control room tab, Health with and without `state.health`, Log in `.cmd` file; Routines no false "Missed a run"; Today "switched off" for a disabled chat routine; Playbooks auto-ladder bar and progress lines.

State values (chat trigger id, logins, task ids) are read from the board file, not hard-coded.

## Add a check

In `board_tests.js` add `await check('name', async () => { ... assert(cond, 'reason'); });` before the "no page errors" check. Use `open(tag, w, h, stubOptions)` for a fresh page (extend `stub()` for new MCP behaviour), `go(page, view)` to switch view and `ctl(page, tab)` for Control room tabs. Static checks go in `check_state.py` (call `fail(msg)`). If a check fails because the selector is wrong, fix the test; if the board is broken, fix the board, never weaken the check.
