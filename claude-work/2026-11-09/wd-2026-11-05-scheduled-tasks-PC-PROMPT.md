# Stuck scheduled tasks: walk-through and PC prompt (task wd-2026-11-05)

Checked from the cloud on Nov 9, 2026 against Ultron's run log and today's 8:20 stuck-run watchdog.

| # | Item from Nov 5 | Status today | What it needs |
|---|---|---|---|
| 1 | KB daily sync stuck | Retired Nov 5. Nothing to do. | Nothing |
| 2 | Ekena lead auditor stuck | Still stuck. No ledger line since Nov 2 (watchdog, Nov 9 8:20). | Stop, then Run now, on your PC |
| 3 | Handshake check blocked (Chrome dropped mid sign-in) | Fixed. Today's 8:00 check read Handshake fine (30 new applicants, 3 waiting; task hs-2026-11-09). | Nothing |
| 4 | Competitor Watch weekly snapshot overdue | Still overdue. Last run Oct 26. | Run it once on your PC |
| 5 | Competitor Watch AI visibility blocked | Still blocked. OPENAI_API_KEY and PERPLEXITY_API_KEY aren't set. | You type the keys (Claude never types keys), plus your yes or no on the ~$5/month cost (26 questions) |

## Prompt to paste into Claude Code on your PC

```
Fix my stuck scheduled tasks (Ultron task wd-2026-11-05). Don't type or ask me to paste any password or API key into chat.
1. Ekena lead auditor: in Scheduled tasks, find "Ekena lead auditor". If it shows as running, stop it, then Run now. Wait for it to finish. Confirm it wrote a new ledger line dated today. If it fails, show me the last 20 lines of its log and the error.
2. Competitor Watch weekly snapshot: find its Windows Task Scheduler entry (or the Scheduled tasks entry). Report its last run time, last result code and next run time. Run it once now. Confirm a new snapshot file dated today exists. If the trigger is disabled or broken, tell me exactly what is wrong and the one-line fix, but don't change the schedule without my OK.
3. Competitor Watch AI visibility: check whether OPENAI_API_KEY and PERPLEXITY_API_KEY are set for my user (only say set or not set; never print the values). If not set, tell me the two setx commands to type myself in my own terminal, with placeholders, and stop there.
4. Add one row per job to the Notion "Ultron run log" (Job, Run at, Status, Summary, Read, Where = pc).
Then tell me in 3 lines what ran, what is still blocked, and the one thing left for me.
```

## The one thing only you can do
Set the two API keys yourself (step 3) if you want the AI visibility check running, and say yes or no to the ~$5/month cost. If not, tell Claude to turn that check off.
