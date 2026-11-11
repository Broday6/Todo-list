# Hiring workflow (stages, next steps, top qualities)

Every routine, PC task and chat that reads, sorts or answers job applicants follows this file. It is part of the
routine text of whichever routine sends you here (hourly step 2e, the morning rebuild's step 4c, the check-in job,
the board chat routine, the PC worker's Job H).

Why it exists (Brody, Nov 11, 2026): "you are not reading emails correctly and are only drafting emails to continue
to have people tell more about themselves. I need it to take them through a workflow not just continuing to ask
them if they are qualified also for each applicant pull me their top qualities from their emails and from their
resumes." What went wrong before: candidates who had already answered the screening question got a second one
("one more thing: what sets you apart"), stale drafts sat in Drafts and went out in a batch, and replies became
one grouped "review and reply" task with no next step and no summary of the person.

Roles: E-Commerce (ecom) is the active search. Full Stack and Inside Sales stay on hold ("E-Commerce only for
now") until Brody says otherwise. Location, sponsorship and shortlist rules are in the local file
hiring/TRIAGE_RULES.md on Brody's PC; the parts that matter here are repeated below.

## 1. Stages (state.hiring.candidates[].stage)

| Stage | Means | Moves on when | Who acts next |
|---|---|---|---|
| New | Applied; resume not read yet | Resume read (PC Job H or a live chat) | Claude |
| Asked | The one screening email went out (on site + why a good fit) | They reply | Them |
| Replied | They answered; profile written; recommendation set | Brody sends the phone-screen draft, or marks Passed | Brody |
| Phone screen | Times offered, or a call is on the calendar | The call happens | Them, then Brody |
| In person | In-person interview offered or booked | The interview happens | Brody and Daniel |
| Offer | Brody or Daniel made an offer | Accepted or declined | Brody |
| Hired / Passed / No reply | Closed | Never reopen | Nobody |

Old values on older rows read as: "Contacted" = Asked, "Messaged you" = Replied, "Screen" = Phone screen,
"Interview" = In person. Write only the new values.

Only Brody (or Daniel through Brody) sets Offer or Hired. Claude sets New, Asked, Replied, Phone screen, In person
and No reply, and only from evidence: an email in Sent Items, a reply from the candidate, or a calendar event. A
draft is not evidence that anything was sent. Claude sets Passed only for tier C or D (section 4; Brody, Nov 11, 2026:
"if it is c or d they arent hired"), and Brody can move anyone back by changing the tier or stage.

## 2. The rules that stop the loop

1. One screening question per person, ever. Once anyone has answered (any reply after the screening email), never
   send or draft another "tell us about yourself", "what makes you a good employee", "what sets you apart" or "why
   are you a good fit" email to them, in any wording. Their reply plus their resume is enough to decide.
2. Every reply moves the person forward. When a candidate replies, the result is a profile and a recommendation
   (section 4), and for tier A a phone-screen draft (section 3). Never a new question.
3. If a reply doesn't answer the "why" (for example "Yes, interested" or "I am open to relocate"), judge from the
   resume. Don't ask again.
4. Before drafting any stage email, check Sent Items AND Drafts for that person (the Indeed relay address, or their
   own address). If a stage email for this stage or a later one exists, sent or drafted, don't draft another.
5. Stale drafts: when a person moves past a stage, any unsent draft for an earlier stage is stale. List it on the
   hiring task as "Delete this stale draft: <subject> to <name>" so it doesn't go out in a batch. Never send it.
6. Never contact: anyone Daniel tagged "maybe sales" (he forwards them to Garrett Bonetti); anyone who needs visa
   sponsorship; candidates Brody already talked to or closed (Dax and the older candidates); anyone at Passed,
   Hired or No reply.
7. Everything is a draft. Brody sends every email. Handshake candidates get no Outlook drafts: write the message
   text on the board task for Brody to paste in Handshake.
8. One nudge at most. If someone hasn't answered the screening email or the phone-screen times 3 business days
   after Brody sent it, draft one nudge (section 3). 5 business days after the nudge with no answer, set No reply.

## 3. Stage emails (Brody's wording; plain text in an HTML draft, no em dashes, no brackets left in)

Reply in the same thread: an Indeed candidate gets an outlook_create_reply_draft on their newest email (the reply
goes through Indeed messaging), anyone else a reply draft on their newest email to Brody. Short paragraphs, "Hi
<first name>,", close "Thanks," and "Brody". Outlook adds his signature.

- SCREENING (stage New to Asked; only for people who pass the resume screen in section 5):
  "Thanks for applying to our E-Com Marketing & Online Merchandising role. We're interested in having you on our
  team. / The role is in person at our office in Heath, TX, right next to Rockwall. Does working on site there work
  for you? If it does, reply with a few sentences on why you think you're a good fit for the role."
- PHONE SCREEN (stage Replied and tier A, or a tier B person Brody picked):
  "Thanks for getting back to me. <one short line that repeats a specific thing they told you, in their own terms;
  leave it out rather than guess> I'd like to set up a 10 to 20 minute phone call to talk about the role. / Here are
  times that work on my end (Central Time): / <Day, Mon D: h:mm to h:mm AM/PM> (2 or 3 lines, one per day) / Let me
  know which works best and I'll send a Microsoft Teams invite."
  Times: the next 3 working days, inside 9:00 to 4:30 Central, from free time on Brody's calendar (outlook_calendar_search;
  skip anything busy or tentative and the 11:00 to 12:00 meetings). His calendar is incomplete, so the task says
  "check the times before you send".
- TIME PICKED (they chose a time): "That works. I'll send the Teams invite for <Day, Mon D at h:mm> Central." Then a
  task for Brody: "Send <name> the Teams invite for <time>". Claude never creates calendar events.
- AFTER THE PHONE SCREEN (its calendar time has passed): no email. A task for Brody: "How did <name>'s phone screen
  go? Bring them in?" When he says yes, draft the in-person email: "Thanks for talking with me. We'd like to bring you
  in for an in-person interview at our office, 6765 Horizon Road, Heath, TX. Would <2 options from Brody's calendar,
  or the days Daniel gave> work for you?"
- NUDGE (once): "Just checking in on my note below about the E-Com Marketing role. Are you still interested?"
- NO EMAIL for New people who fail the screen, for Passed, or to decline anyone. Brody declines in Indeed or
  Handshake himself.

## 4. The profile: top qualities (Brody, Nov 11: "for each applicant pull me their top qualities from their emails and from their resumes")

Write these fields on the candidate's row in state.hiring.candidates, for every E-Commerce applicant at Asked or
later, and for every New one whose resume has been read:

- top: up to 3 short lines (14 words at most each), the person's strongest points for THIS role, best first, each
  ending in its source: "(resume)" or "(reply)". Concrete beats general: "Ran Amazon and Shopify listings for a home
  decor brand (resume)" beats "Strong marketing background". Never use a claim the email or resume doesn't make.
- loc: "<City, ST> · L1|L2|L3|L4" from TRIAGE_RULES (L1 within about 45 minutes of Heath; L2 rest of DFW; L3
  relocating to DFW; L4 not local or unknown). City from the resume header, or what they wrote ("about 35 minutes
  away", "I live near Heath").
- tier and tierWhy (Brody, Nov 11, 2026: "put tiers of people with why they are in those tiers so A, b, c, d if it is
  c or d they arent hired"). tierWhy is one short line naming the reason, e.g. "Local (Forney), runs marketing
  campaigns, on site yes".
  - A, move forward now: L1 (or L2 with strong e-commerce experience such as marketplace listings or catalogs), on
    site is a yes or not answered yet, no sponsorship need, and real e-commerce, marketing, listings, merchandising
    or digital ads experience on the resume or stated specifically in the reply. Next: phone screen (or the
    screening email for someone new).
  - B, backup: a real fit with one gap: relocating (L3) with real experience, or local with lighter or vaguer
    experience. Next: Brody picks, or they move up if the A people don't work out.
  - C, not hired: little that fits the role, a thin answer with a thin resume, or not local with only some
    relevant experience. Stage Passed, no email.
  - D, not hired: a hard no: needs sponsorship, remote-only, out of state and not relocating, or an unrelated field.
    Stage Passed, no email.
  - Tier only from what the reply and resume show; when the resume isn't read yet, tier from the reply and add the
    flag "resume not read yet". Never put someone in C or D on a missing resume alone.
- flags: up to 2 short warnings ("confirm work auth", "relocating from Austin", "reply didn't answer why").
- next: "<who>: <what>", e.g. "You: send the phone-screen draft (check times)", "Them: reply to phone-screen times",
  "You: pick yes or pass", "Claude: read the resume on the PC".
- stageOn: the date (YYYY-MM-DD) the stage last changed.
- note: keep Brody's own note text; append one dated line per stage change, never rewrite what's there.

Privacy: no email addresses, phone numbers, street addresses, age, photos, family, health, religion or ethnicity on
the board, in Notion or in the repo. City and state are fine. Contact details stay in Outlook.

## 5. Resume screen (New to Asked or Passed)

Read the resume (Indeed "View resume" link in the application email; Handshake Documents tab; the PC worker's Job H
or a live chat on Brody's PC, because the cloud can't open the canvas resume). Then:
- Fail (tier C or D, stage Passed, no email): needs sponsorship, remote-only, out of state with no relocation and
  no e-commerce strength, or no fit at all. Brody overrules by changing the tier.
- Pass: draft the SCREENING email, stage stays New until Sent Items shows it went out, then Asked.
Digest-only applicants ("X and 7 others applied") have no relay email: list their names on the hiring task as
"needs Indeed sign-in or Daniel".

## 6. The board

- ONE open task per day, id "hire<MMDD>", group "inbox", title "Hiring: <N> to decide · <N> drafts to send · <N>
  waiting on them". Its note lists, best first, each person whose next starts "You:": name · tier · loc · top line ·
  what the draft says, plus the stale drafts to delete. Group the list by tier (A, then B). Refresh it each run instead of adding new tasks, and close
  the older hire<MMDD> tasks by setting dropped (they were replaced, not done). This replaces the grouped "<N> new
  applicants on Indeed: review and reply" tasks.
- The Hiring tab shows a Tiers block (A, B, C, D, each name with its tierWhy) above the candidate rows, and each row
  shows tier, top, loc, flags and next.
- When Sent Items shows Brody sent a stage email, move the stage and next. When a candidate replies, move them and
  write the profile in the same run.
