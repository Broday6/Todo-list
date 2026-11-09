# Ultron: tools and automations catalog

This is the list of what we built to help Brody's job and what runs on its own. Keep it up to date whenever something is added, changed or retired.

- Board: https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7
- App launcher: `claude-work/ultron-app/Ultron.html`. It opens the board and uses the red mask icon. You can also download it from the board: sidebar › Download app, or Automations › Get the Ultron app.
- Icon (favicon and app only): `claude-work/ultron-app/ultron-icon.svg` and `ultron-icon.png`.
- Board build scripts: `claude-work/2026-11-05/board-build/`. The patches are idempotent. Run them in this order: unwrap → patch → patch2 → patch3 → patch4 → patch5 → patch6 → bh8705 → patch7 → patch8 → patch9 → patch10 → patch11 → patch12 → patch13 → patch14 → patch15 → patch16 → patch17 → patch18 → patch19 → patch20 → patch21 → patch22 → patch23 → patch24 → patch25 → patch26 → patch27 → patch28.

## Board tools (on the page)

| Tool | Where | What it does |
|---|---|---|
| Explain / Dig deeper | Any task | Explains what a task means and where it came from, with links to the source email or tool. Dig deeper sends it to Claude for more. |
| Send to Claude (answer box) | BugHerd and question tasks | Type an answer and it goes straight to Claude to work. |
| More info and source links | Plan blocks | Every Schedule block gets More information plus chips that link to the emails or tools it cites (NetSuite, Asana, BugHerd and others). |
| Progress bar | Anything sent to Claude | Shows live steps until the run finishes. It survives the page reload a save causes. |
| ⚡ Have Claude do it now | Tasks and blocks | Fires the live-chat routine to do the task right away. |
| Needs you panel | Today | Shows what needs Brody: answers, sends, Strety, approvals. |
| Strety tab | Sidebar | Weekly check-in, rocks and to-dos, read from the Monday Strety email. Strety has no connector. |
| Teams reply drafts and Send in Teams | Team tab | Claude drafts a reply. Send posts it only on Brody's own double tap. Claude never posts by itself. |
| Email reply drafts | Inbox | Saves reply drafts to Outlook. Claude never sends email. |
| BugHerd close queue | BugHerd | Ticking Done queues the ticket. The PC task sets it to Done in BugHerd, and the board shows Queued, Closed or Not closed. |
| Automations tab, live | Automations | Reads each routine's real last run from get_trigger when the tab opens, and flags any that missed a run. |
| Follow up | Under Claude's answers | A box under quick answers, Claude's answer on BugHerd cards and plan-block explanations. Block follow-ups answer in the page; the others get a quick answer plus a full run with the earlier answer as context. |
| Waiting on Claude | Today and Live chat | Every request with no answer yet and how long it has waited. After 15 min: No answer yet + Resend. Claude's "I'll do it next run" promises get a Track it button that queues a task. |
| Draft it / Draft all | Team tab, what you owe | Claude saves an Outlook draft for each item you owe someone (up to 10 at once). Nothing is sent. |
| Clear the deck | Tasks tab | Overdue tasks, most-pushed first, with bulk Done, Not needed and Move. |
| One-tap OK | NetSuite alert tasks and Ads "Your call" | OK records approval of that exact change. NetSuite ones give a Copy PC prompt (imports need your PC). Ads ones queue Claude to draft the request to the group owner. |
| Jump to bar | Every long page | Sticky chips for each section (Team: each person; Tasks: each group plus Collapse all / Expand all), a Back to top button, and on Today the log shows the newest 8 while Needs your eyes and Cases & alerts fold to one line. |
| Claude wants to take these | Today | Claude's daily picks (state.claudePicks, written by the morning rebuild): up to 6 tasks it can do, each with Take it / Not today, plus Give all. |
| Project notes / task notes | Tasks tab group headers; inside each opened task | Your notes on a whole project or one task. Claude reads them every time it works the task. |
| Give to Claude starts now | Everywhere | Giving a task to Claude starts a run right away instead of waiting for the next check-in. |
| Never lose a tap | Every save | A save that clashes with a routine's newer version is re-applied on top of it after the reload, instead of being dropped. |
| Download app | Sidebar and Automations | Saves Ultron.html with the icon. The red mask is the favicon and app icon only; the sidebar keeps the original logo (Brody, Nov 5). |
| Quick answer | Every Send from the board | Claude answers in the page within seconds while the full run keeps going. The save that reloads the page waits for it. |
| Queued, not started | Today (Waiting on Claude) | Any task given to Claude 15+ min ago with no run started shows "not started yet" and a Start now button that fires the run. |
| Do now | Today (top) | One list of everything that needs Brody, each card with one main button that finishes it right there: OK go ahead, Answer and send to Claude, Looks good mark done, Open draft / I sent it, Have Claude draft it, Done / Tomorrow / Give to Claude / Not needed. Filter chips: Decide, Claude finished, Replies, Due. Details opens the full task inline. Undo on every close. |
| Done by Claude receipt | Every task Claude worked | Green card with when it finished, what Claude did, where it is (links to the Outlook draft, file, Notion page) and what's left for Brody. Mark done or Follow up from the card. Also logged in the Notion Ultron task log. |
| Light theme | Everywhere | White pages, dark text, one blue for actions, red only for the logo and overdue (Nov 6). |
| Hand off | Almost everything: tasks, inbox rows, cases, BugHerd, Teams asks, things you owe, plan blocks, promotions | One tap sends it to Claude now with its playbook; it comes back with a receipt. |
| Playbooks + modes | Control room › Playbooks; inside any task | One recipe per kind of work (steps, where results go, done means, when to stop) and a mode: Auto (Claude takes it on its own every hour), Plan first, Draft only, Manual. Override per task. |
| Command center | Today (top) | Need your call · Claude working · Done today · Queued for auto · Finished this week, plus Up next / Working / Done today columns with Start now and Not this one. |
| What changed | Today side; Control room › Changes | End results only: finished by Claude, closed, new on your list, drafts saved, approvals, tool changes shipped, routine runs. Since last look / Today / This week. |
| My rules | Control room › My rules | Your standing rules; every run follows them. |
| Requests | Control room › Requests; Request a change on every page | Ask for any change to Ultron; Claude builds a preview; Ship it or Not yet. Goes to trig_01NqRhkLSC15hY1J2ahMGVXL in this session. |
| Routines | Control room › Routines | Run now, Pause/Resume (applied by the requests routine). |
| Follow-ups act | Every task | A thread message, Follow up box, note or OK starts a real run that acts on it; a task never shows Done while your newest word is newer than Claude's receipt. |
| Sources | Control room › Sources | No-API-key sources: OneDrive › Ultron folder, NetSuite saved-search emails, Google/Microsoft Ads report emails, product feed links, Teams channels, analytics email. Tick each when set up (state.sourceSetup). Setup: claude-work/2026-11-06/sources-setup/. |
| G5 plan | Sidebar › G5 plan | The Group 5 game plan (4 quarters, months, owners) with live status from your tasks, Make a task / Hand off per item, your 7 decisions, the scorecard (Claude fills Now monthly) and the weekly rhythm. |
| Rate results | Every Done by Claude receipt | 👍 / 👎 + what was wrong. A 👎 becomes a lesson on that playbook that Claude follows next time; Save and redo reruns it. |
| Hand-off brief | Every Hand off | Goal, done means, where results go, links, mode, and Start now or Schedule. Can be switched off. |
| Reference cards | Control room › Reference | Owners by group, who does what, how to address people, sites, saved searches, vendors. Claude reads the Always cards on every task. |
| Bulk + scheduled hand-off | Tasks › Select tasks | Tick tasks, Hand off together (one run, in order) or Schedule for a time. |
| Recurring work | Control room › Recurring | Monday G5 check, Monday OK review, monthly scorecard, quarterly refresh; created on their day with their playbook. |
| One-tap asks | Inside any task | Ready-made requests per playbook (Check the live page, Draft the reply, Build the fix file...). Editable per playbook. |
| Links | Inside any task | Paste email, OneDrive or web links; Claude reads them first. |
| Run history + Retry | Inside any task; Do now | Every run with start, finish and duration; stalled runs get Retry. |
| Duplicate finder | Tasks tab | Same ticket, case, email thread or near-identical title; Keep the first / Keep the second / Not duplicates. |
| Copy and open in Teams | Teams reply cards | The connector can't send Teams messages (ChatMessage.Send not granted by IT), so this copies the reply and opens the chat. |
| Claude's answer on the card | BugHerd cards | Shows Claude's latest real reply and its Outlook draft. An unchanged answer that was already worked can't be resent. |

## Cloud routines (Claude Code)

| Routine | Trigger | When (Central) |
|---|---|---|
| Sales pulse | trig_01LMcYKXkRzyN2nnwKGkcSUB | Weekdays 6:15 |
| Inbox triage | trig_01Ah3Ga7TgqSpzoQ1uATtuY2 | Weekdays 6:30 |
| Ultron morning rebuild | trig_01UqcLyToyZm3yyc7yQyUGdk | Weekdays 6:50 |
| Cases, alerts & BugHerd check | trig_01MYXtzwUPSaeoWoADbywfUY | Weekdays 7:20, 12:20, 3:20 |
| Weekday login check | trig_01CAub7W29N3DzeQAyU1iCEY | Weekdays 7:42 |
| Marketing Category Report | trig_013u32ahu6VztnY5WiA8ByLo | Weekdays 7:51 |
| Ultron check-ins | trig_01AKYLwWAuUEsDnzF2wci73i | Weekdays 8:47, 11:47, 2:47 |
| Ultron ads refresh | trig_01899VdPf2gAAkjas5rmebWr | Weekdays 11:23 |
| Hourly: Teams watch, Auto hand-off, Team, Promotions & Automations | trig_01TEeBTBTmPV3MxApZH2aeMr | Weekdays hourly 7:12 to 5:12 |
| Tool change requests + Pause/Resume | trig_01NqRhkLSC15hY1J2ahMGVXL | When Send request, Ship it or Pause is pressed |
| Meeting recaps | trig_0118dmodKjFNLoqVAEak6YvS | Weekdays 4:45 |
| Live chat (fresh session) | trig_01JEYvWdaH6L4s8WcDsLrssJ | When Send or ⚡ is pressed |
| Weekly website audit | trig_01652c6RPMTQdanSEpgh33XN | Mondays 10:47 |
| Notion memory sync | trig_01A9Xm1hJZcUvWy1scHirSi6 | Mondays 5:41 |
| Daybook backup | trig_01RNsTfWSxh9W4b5wT9JArYn | Sundays 1:38am |

**Retire:** the old "Ultron Cases & alerts" routine (trig_015ZuN56zFoa7kgJA3rqnGcf) is still firing. Brody pauses it at claude.ai/code/routines/trig_015ZuN56zFoa7kgJA3rqnGcf.

## Claude app routines

- Daily read of Ultron (trig_01YDFzojud2Xx8LDnqEFoQPH): weekdays 7:43.
- Morning brief (trig_019ktoFxgsv4GM6hYtaxBQJG): every day 8:06.
- App check-ins (trig_01PvKJ48mpt8o9CpEVikpvez): every 3 hours from 7:36am to 7:36pm.

## PC tasks (Claude desktop › Scheduled)

- Daily ads + portal guard (AD): Tue–Fri 7:30. Press Run now after signing in.
- Handshake daily check: 7:35. Press Run now.
- Weekly ads + portal audit (AD): Mondays 9:30.
- Monthly full ads + portal audit (AD): the 16th at 9:00.
- Pacific Columns ads checks: daily Tue–Fri 7:40, weekly on Tuesdays 10:40, monthly on the 16th at 10:40.
- Ekena carousel board scan: every 3 hours.
- Still to set up:
  - BugHerd close: `claude-work/2026-11-05/bugherd-close-pc-task.md`.
  - BugHerd live pull: `claude-work/2026-11-02/pc-tasks/bugherd-sweep.md`.
  - NetSuite cases check 16559: `claude-work/2026-11-02/pc-tasks/cases-sweep-16559.md`.

## Rules every tool follows

- **Task completion protocol (Nov 6):** read the task, check the Notion Ultron task log for a past run, carry out the objective (no plans or promises instead of work), write task.receipt, log a row. Lives on the Notion Routine rules page; the live chat and check-in prompts point to it.

- **Website back-end errors:** Tory owns them (feed or indexing failures, Athos errors and similar). Don't ping Brody or create tasks for them (Brody, Nov 6).

- **Email:** never send email; Outlook writes are drafts only.
- **Calendar and Teams:**
  - never create or change calendar events;
  - Teams messages go out only on Brody's own double tap.
- **NetSuite and Ads:**
  - never change NetSuite or Ads, or ask anyone to, without Brody's OK for that exact change;
  - files are named `...-NOT-IMPORTED.csv`;
  - never raise budgets, and never judge on ROAS.
- **BugHerd:**
  - never send to Web Dev unless Brody clears the ticket;
  - never claim a ticket was prepped, moved or worked;
  - the only BugHerd change is the close queue for tickets Brody ticked Done.
- **Routine publishes:**
  - send no capabilities field;
  - the full declaration is now artifact, sample, downloads, Microsoft 365 (outlook_email_search, read_resource, outlook_send_draft, outlook_send_mail, teams_send_chat_message) and Claude Code Remote (get_session, get_trigger, fire_trigger).

## Teams replies (patch27, Nov 8)
- The Microsoft 365 connector lacks ChatMessage.Send (only IT can grant it), so the board can't post to Teams directly.
- **Reply in Teams** opens a box with the reply, a Copy button and a plain link to the exact Teams message. "I sent it" marks the card handled.
- **Send in Teams (optional):** once Brody builds his own Power Automate flow and ticks "Send Teams replies (Power Automate)" in Control room › Sources, a double tap emails the reply to Brody only (subject `ULTRON-TEAMS <chatId>`) and the flow posts it as him. Setup: `claude-work/2026-11-06/sources-setup/teams-send-flow.md`. Routines never send these.

## Radar refresh (patch28, Nov 9)
- Today's "Also on your radar" now pulls each cloud Routine's last run live (get_trigger), so healthy jobs stop showing "missed a run". Local PC tasks (ads guard, Handshake check) still rely on what they write to the board.
