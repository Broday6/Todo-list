# Install the objective-and-split prompt hook (paste into a new Code chat on Brody's PC)

Paste everything under "Prompt" into a new chat in the Claude desktop app's Code tab on your PC.
It replaces the hook that tightens every message you type. This cloud session can't reach
`~/.claude` on your PC, so a PC chat has to make the change.

## Prompt

Install my new prompt hook. This is a first run, so walk me through it: show me the
settings.json change before you save it.

Background (Brody, Nov 3 2026): the UserPromptSubmit hook in `~/.claude/settings.json` runs
`~/.claude/hooks/prompt_tighten.py`, which tells Claude to quietly tighten every message I
type. I don't want that any more. The new hook makes Claude work out the objective of my
message. When the message has more than one request, Claude starts with "Objective:" and a
numbered list of the requests, then works them in order in the same chat. It suggests /spawn
only for big, unrelated jobs. A single request gets no extra lines.

1. Read `~/.claude/settings.json` and find the UserPromptSubmit entry whose command runs
   `prompt_tighten.py`. If there isn't one, stop and tell me what you found.
2. Back up settings.json to `~/.claude/backups/settings.2026-11-03-before-prompt-objectives.json`.
3. Create `~/.claude/hooks/prompt_objectives.py` with exactly the script at the end of this prompt.
4. Pipe-test it with the same python the hook command uses. Each test must exit with code 0:
   - a JSON payload whose `prompt` holds two requests (for example "Check the BugHerd tab is
     current, then email Paul the Shop All reply") prints JSON whose additionalContext
     contains "Objective:";
   - "yes do it" prints nothing;
   - a prompt starting with "/spawn" prints nothing;
   - a prompt starting with "<" prints nothing;
   - input that isn't JSON prints nothing.
5. Show me the change to the hook command: `prompt_tighten.py` becomes `prompt_objectives.py`,
   with the same python and flags. Save it once I say OK. Leave `prompt_tighten.py` on disk
   (never delete a file); it just stops running.
6. Leave the "Prompts to other AIs: auto-enhance" section of `~/.claude/CLAUDE.md` alone. It
   covers prompts Claude sends to other AIs, not what I type.
7. Update the Notion memory "Prompt enhancer skill", in its "Change requested Nov 3" section:
   installed, the date, the backup path and the test results. Update the Code memory copy too,
   if there is one.
8. Tell me to open a new Code chat and send a message with two requests, to see the
   Objective line.

To undo: change the command back to `prompt_tighten.py`, or restore the backup.

Script (`~/.claude/hooks/prompt_objectives.py`):

```python
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
```
