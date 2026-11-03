"""UserPromptSubmit hook: find the objective of Brody's message and split it into its requests.

Replaces ~/.claude/hooks/prompt_tighten.py (Brody, Nov 3 2026: "I don't want it to always
tighten what I type but it should look for what objective the prompt is trying to achieve
and then it splits the prompts by the certain requests that it has").

His choices (Nov 3 2026):
- Split in the same chat and work the requests in order. Suggest /spawn only when two or
  more of them are big, unrelated jobs.
- Show the "Objective:" line and the numbered list only when a message has more than one
  request. A single request gets no extra lines.

It never blocks or rewrites a message; it only adds a short note for Claude. It skips short
messages, slash and ! commands, <...> wrapped messages (scheduled tasks, session events) and
headless runs. Any error means it adds nothing.
"""
import json
import os
import sys

MIN_WORDS = 6

NOTE = (
    "Before you answer Brody's message, work out its objective: what he is trying to get "
    "done. Then check whether it holds more than one separate request.\n"
    "- One request: add no Objective line and no list. Just do it, aimed at that objective.\n"
    "- Two or more separate requests: start the reply with \"Objective: <one line>\", then a "
    "numbered list of the requests, one short line each in his words where you can. Work them "
    "in that order in this chat and head each part with its number. Don't merge or drop any. "
    "If one depends on another, do that one first and say so.\n"
    "- If two or more of them are big, unrelated jobs (each would take a long session of its "
    "own), do the small ones and suggest /spawn for the big ones instead of starting them.\n"
    "- Details and limits on one job (length, tone, which file) are part of that request, "
    "not separate requests.\n"
    "- Don't rewrite or tighten his wording, and don't ask him to confirm the split. Ask only "
    "when a request is unclear enough that guessing would waste work."
)


def should_skip(prompt):
    text = prompt.strip()
    if not text:
        return True
    if text[0] in "/!<":
        return True
    if len(text.split()) < MIN_WORDS:
        return True
    return False


def main():
    if os.environ.get("CLAUDE_CODE_ENTRYPOINT") == "sdk-cli":
        return
    try:
        raw = sys.stdin.buffer.read().decode("utf-8", errors="replace")
        prompt = json.loads(raw).get("prompt") or ""
    except Exception:
        return
    if should_skip(prompt):
        return
    sys.stdout.write(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": NOTE,
        }
    }))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
