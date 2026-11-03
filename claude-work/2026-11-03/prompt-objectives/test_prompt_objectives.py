"""Pipe tests for prompt_objectives.py. Run: python test_prompt_objectives.py"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(HERE, "prompt_objectives.py")


def run(payload, env_extra=None):
    env = dict(os.environ)
    env.pop("CLAUDE_CODE_ENTRYPOINT", None)
    env.update(env_extra or {})
    data = payload if isinstance(payload, bytes) else json.dumps(payload).encode("utf-8")
    r = subprocess.run([sys.executable, HOOK], input=data, capture_output=True, env=env, timeout=10)
    return r.returncode, r.stdout.decode("utf-8")


def msg(prompt):
    return {"session_id": "t", "hook_event_name": "UserPromptSubmit", "cwd": ".", "prompt": prompt}


CASES = [
    # (name, payload, env, expect_note)
    ("multi-request message", msg("Check the BugHerd tab is current, then email Paul the Shop All reply and fix the board header colors"), None, True),
    ("single long request", msg("Write a product description for the new faux wood beam for homeowners"), None, True),
    ("short reply", msg("yes do the first one"), None, False),
    ("slash command", msg("/spawn check the inbox and audit the board tasks and the bugherd tab"), None, False),
    ("bang command", msg("!git status and then show me the log for the last ten commits"), None, False),
    ("wrapped scheduled task", msg("<scheduled-task>Run the weekly ads audit and post the results to Asana</scheduled-task>"), None, False),
    ("headless run", msg("Check the BugHerd tab is current, then email Paul the Shop All reply"), {"CLAUDE_CODE_ENTRYPOINT": "sdk-cli"}, False),
    ("empty prompt", msg(""), None, False),
    ("bad JSON", b"not json at all", None, False),
    ("non-UTF-8 bytes", b'{"prompt": "caf\xe9 menu update and also refresh the promotions calendar today"}', None, True),
]


def main():
    failed = 0
    for name, payload, env, expect in CASES:
        code, out = run(payload, env)
        ok = code == 0
        if expect:
            try:
                ctx = json.loads(out)["hookSpecificOutput"]
                ok = ok and ctx["hookEventName"] == "UserPromptSubmit" and "Objective:" in ctx["additionalContext"]
            except Exception:
                ok = False
        else:
            ok = ok and out == ""
        print(("PASS " if ok else "FAIL ") + name)
        failed += 0 if ok else 1
    print(f"{len(CASES) - failed}/{len(CASES)} passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
