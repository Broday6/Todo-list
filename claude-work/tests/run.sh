#!/usr/bin/env bash
# Usage: bash run.sh /abs/board.html   -- runs static checks, evaluator, then browser tests.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
B="$1"
if [ -z "$B" ] || [ ! -f "$B" ]; then echo "usage: bash run.sh /abs/board.html"; echo FAILED; exit 2; fi
case "$B" in /*) ;; *) B="$PWD/$B";; esac
fail=0

echo "== 1/3 check_state.py"
python3 "$DIR/check_state.py" "$B" || fail=1

echo "== 2/3 evaluator"
OUT="$(python3 "$DIR/../tools/evaluate_board.py" "$B" 2>&1)"
if printf '%s' "$OUT" | python3 -c '
import sys, json
j = json.load(sys.stdin)
s = j["evaluator"]["score"]
assert isinstance(s, (int, float)) and not isinstance(s, bool) and 0 <= s <= 100, "score out of range: %r" % (s,)
print("PASS evaluator score %s (bad %s, warn %s)" % (s, j.get("bad"), j.get("warn")))
'; then :; else echo "FAIL evaluator output invalid or score outside 0-100"; printf '%s\n' "$OUT" | head -c 500; fail=1; fi

echo "== 3/3 board_tests.js"
NODE_PATH="$(npm root -g)" node "$DIR/board_tests.js" "$B" || fail=1

if [ "$fail" = 0 ]; then echo "ALL PASSED"; else echo "FAILED"; fi
exit $fail
