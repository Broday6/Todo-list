# SMS Program Build-Out — Architectural Depot

How to stand up SMS on Klaviyo: sender setup, consent capture, compliance, frequency, list growth,
campaigns and launch. **Exact copy** (consent language, system replies, every automated text and the
Q4 2026 campaign calendar) lives in `data/sms.json` and the flow files, is validated by `build.py`,
and is published to `dist/sms-playbook.md` and the **SMS program** tab of `dist/flow-map.html`.

> Not legal advice. Have counsel approve the consent disclosure, the SMS Terms page and the
> quiet-hours policy before the first text goes out.

---

## 1. What SMS is for here

Millwork is a considered purchase, so SMS is the short, timely channel and email does the teaching.

| Use SMS for | Keep in email |
|---|---|
| Codes and deadlines (welcome, sale start, last call) | Material guides, sizing help, install prep |
| Recovery while intent is hot (cart, repeat product views) | Category education and inspiration |
| Alerts the customer asked for (back in stock, price drop on a carted item) | Long-form "what to expect" for made-to-order |
| A person to call (the help line, with a link) | Reviews and cross-sell |

Automated texts: 14 across 8 flows (all one segment, GSM-7). Campaign texts: 2–4 a month.

## 2. Sender setup and registration

1. **Number:** launch on a **toll-free number** in Klaviyo. Move to a **short code** when the list
   passes roughly 25k or campaign send speed becomes a problem (short codes take weeks to provision).
2. **Toll-free verification** must be approved before marketing texts go out. Have ready:
   - Legal business name, address, website, and a contact person.
   - Use case: "Marketing — promotional offers, cart and browse reminders, back-in-stock alerts,
     order help for customers of ArchitecturalDepot.com."
   - Estimated monthly volume.
   - Opt-in description **plus screenshots** of the popup step 2, footer form and checkout checkbox,
     each showing the full disclosure.
   - Two sample messages (use SMW-S1 and CRT-S1 from the build sheet).
   - Links to the **Privacy Policy** and the **SMS Terms** page (draft in the appendix).
3. **Privacy Policy update:** add a line that mobile numbers and SMS consent are never sold or shared
   with third parties for their marketing.
4. **Brand prefix:** every text starts `Architectural Depot:` (enforced by `build.py`).
5. **Two-way inbox:** decide who answers replies. If nobody, turn on the `SYS-AUTO` auto-reply.

## 3. Consent capture

Six placements, copy in the playbook:

| Placement | Notes |
|---|---|
| Signup popup, step 2 | Shown after the email step. Biggest web source. |
| Footer form | Separate phone field and submit. |
| Checkout checkbox | **Unchecked by default.** Needs a Miva checkout customization that calls Klaviyo's subscribe API; the standard integration does not pass SMS consent. |
| Order confirmation page | Inline form; buyers are the most valuable subscribers. |
| Keyword `DEPOT` | Packing-slip insert, catalogs, CS email signatures, phone hold message. |
| Pro form | Unchecked checkbox. |

Rules:

- Consent is **express written consent** for automated marketing texts: a clear disclosure next to the
  field, a separate action (checkbox or submit), and never pre-checked.
- Consent is **never a condition of purchase**, and SMS consent is separate from email consent.
- **Double opt-in** on every web form (reply Y). Keyword joins are self-confirming.
- **Phone agents do not sign people up by voice.** They give callers the keyword.
- Klaviyo keeps the consent record (timestamp, source, method). Keep form screenshots and the exact
  disclosure text, versioned, whenever either changes.

## 4. Message rules (checked by `build.py`)

- Starts `Architectural Depot:`; marketing texts end `Reply STOP to opt out`.
- **GSM-7 only**: no emoji, curly quotes, em or en dashes, or ellipsis characters. One of those
  switches the whole text to UCS-2 and drops a segment from 160 to 70 characters.
- Target 160 characters (one segment) with the link counted at 23; hard max 306 (two segments).
- One link per text, shortened by Klaviyo's branded link domain only.
- No SHAFT content (sex, hate, alcohol, firearms, tobacco), no all caps, no "FREE!!!" style.
- Facts follow the same rules as email: verified facts or tokens only.

## 5. Frequency and timing

| Rule | Setting |
|---|---|
| Quiet hours | Send only **10am–8pm recipient local time**. Klaviyo quiet hours on; explicit send times on SMS steps. |
| State laws (FL, OK, MD) | 8am–8pm and **no more than 3 texts in 24 hours**. Our window and caps sit inside this. |
| Flow texts | Smart Sending 24 hours. |
| Program cap | **Max 3 marketing texts per rolling 7 days** per person across flows and campaigns. Klaviyo has no native cap: campaigns exclude a segment "Received SMS at least 3 times in the last 7 days", and SMS Welcome has a split before S2 and S3. |
| Campaign cadence | 2–4 a month, Tuesday–Thursday late morning by default. |
| Black Friday week | 3 campaign texts (11/24, 11/27, 11/30). Pause the Browse SMS step 11/24–12/1 so flows don't push anyone past the cap. |

## 6. Opt-outs and HELP

- Standard keywords: STOP, END, CANCEL, UNSUBSCRIBE, QUIT, STOPALL (opt out); START, UNSTOP, YES
  (rejoin); HELP, INFO (help). Replies `SYS-STOP`, `SYS-START`, `SYS-HELP`.
- **Honor opt-outs made any reasonable way** ("stop texting me", "remove me", "no more"). Add common
  phrases as opt-out keywords where Klaviyo allows, and have whoever watches the inbox unsubscribe
  anything else that reads as an opt-out, the same day.
- After STOP, the only message sent is the STOP confirmation.

## 7. List growth plan

| Lever | Starting target (reset after 30 days of data) |
|---|---|
| Popup step 2 | 1 in 4 email signups add a phone number |
| Checkout checkbox | Highest-volume source once live; track opt-in rate per order |
| Order confirmation page | Track separately; buyers convert best |
| Keyword `DEPOT` on inserts and catalogs | Count joins per month by source keyword |
| Black Friday early access for texters | Promote in email and the popup from 11/1; the 11/12 text announces it |

Report SMS list size and net growth monthly (new opt-ins minus opt-outs).

## 8. Campaign playbook

**Text when:** a sale starts or ends, a genuinely new product lands for a segment that viewed or
bought the category, a shipping cutoff matters, or early access is the point.
**Don't text:** blog posts, general newsletters, anything that isn't time-sensitive.

Segments: SMS engaged 90 days (clicked an SMS or visited the site), category viewers (beams,
shutters, mantels, corbels), pros, buyers in the last 12 months. Always exclude anyone texted 3+
times in the last 7 days.

The Q4 2026 calendar (8 sends, Oct 15 to Jan 12) is in the playbook and the viewer, with audience,
send time, copy and notes. Two items need answers first: `{{ BFCM_OFFER }}` and
`{{ HOLIDAY_SHIP_CUTOFF }}`.

## 9. KPIs and guardrails

| Metric | Starting target | Act when |
|---|---|---|
| Opt-out rate per send | < 1.5% | > 2% on any send: pause that audience and review copy, timing and frequency |
| Click rate (flows) | 8–10% | Below 5% for a month: rewrite the text |
| Delivery rate | > 95% | Drops: check carrier filtering and the toll-free verification status |
| Revenue per recipient | Baseline in month 1 | Compare by flow step and campaign |
| List growth | Net positive every month | Two flat months: revisit placements |

## 10. Launch checklist

- [ ] Toll-free number verified; Privacy Policy and SMS Terms page live.
- [ ] Counsel has approved the disclosure, Terms page and quiet-hours policy.
- [ ] Double opt-in on; `SYS-DOI`, `SYS-JOIN`, `SYS-HELP`, `SYS-STOP`, `SYS-START` pasted into SMS
      settings; SMW-S0 set as the opt-in confirmation.
- [ ] Keyword `DEPOT` live and tested from a real phone.
- [ ] Popup step 2, footer form, thank-you page form and pro form live with the full disclosure.
- [ ] Checkout checkbox built (or scheduled) with the short disclosure.
- [ ] Quiet hours 10am–8pm local; "Received 3+ SMS in 7 days" exclusion segment built.
- [ ] Every SMS step sent to a team phone: prefix, link, tokens and STOP line render correctly.
- [ ] Opt-out tested end to end (STOP, then confirm no further texts).
- [ ] Owner named for the SMS inbox and for weekly opt-out and delivery monitoring.

---

## Appendix: SMS Terms page (draft for counsel)

Suggested URL: `/sms-terms.html`

> **Architectural Depot SMS Terms**
>
> By opting in to Architectural Depot text messages, you agree to receive recurring automated
> marketing text messages (such as offers, restock alerts, cart reminders and order help) from
> Architectural Depot at the mobile number you provided. Consent is not a condition of any
> purchase.
>
> **Frequency:** message frequency varies.
> **Cost:** message and data rates may apply.
> **Opt out:** reply STOP to any message to cancel. You'll receive one message confirming you've been
> unsubscribed. Reply START to rejoin.
> **Help:** reply HELP, call 1-888-573-3768 (Mon–Fri 8am–6pm CT, Sat 8am–12pm CT), or email
> cs@architecturaldepot.com.
> **Carriers:** carriers are not liable for delayed or undelivered messages.
> **Privacy:** we do not sell or share your mobile number or SMS consent with third parties for their
> marketing. See our Privacy Policy.
>
> We may change these terms; the current version is always on this page.
