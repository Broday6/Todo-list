# Objective-and-split prompt hook (Nov 3 2026)

Brody, Nov 3: "I don't want it to always tighten what I type but it should look for what
objective the prompt is trying to achieve and then it splits the prompts by the certain
requests that it has."

His choices: split in the **same chat** and work the requests in order (suggest /spawn only
when two or more are big, unrelated jobs). Show "Objective:" and the numbered list **only when
a message has more than one request**.

| File | What it is |
|---|---|
| `prompt_objectives.py` | The UserPromptSubmit hook. Replaces `~/.claude/hooks/prompt_tighten.py` on Brody's PC. Adds a short note for Claude; never blocks or rewrites a message. |
| `test_prompt_objectives.py` | Pipe tests: `python test_prompt_objectives.py` |
| `install-on-pc.md` | One paste for a new Code chat on the PC. It backs up settings.json, installs the hook, tests it and swaps the command after Brody's OK. |

It skips: messages under 6 words, `/` and `!` commands, `<...>` wrapped messages (scheduled
tasks, session events), headless `sdk-cli` runs. Any error means it adds nothing.

Tested in the cloud on Nov 3:
- 10/10 pipe tests pass.
- Live headless run with the hook (Sonnet): a three-request message got "Objective:", a
  numbered list and numbered answers; a single request got a plain answer with no extra lines.

Not installed on the PC yet. Undo after install: point the hook command back at
`prompt_tighten.py`, or restore `~/.claude/backups/settings.2026-11-03-before-prompt-objectives.json`.
