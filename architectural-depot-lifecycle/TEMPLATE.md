# Architectural Depot — Email + SMS General Template

Fill-in-the-blanks placeholders for planning flows, emails and texts. This is a planning document
only: nothing here connects to ActiveCampaign, changes a feed, or sends anything.

Anything in `[brackets]` is a placeholder to fill in or delete.

---

## 1. Flow template

Copy once per flow.

```
FLOW:          [Flow name]
Already have?  [Yes: name of the existing automation / No]
Goal:          [The one thing this flow should get the customer to do]
Starts when:   [Trigger, e.g. joins the list / leaves a cart / places an order / visits a page]
For:           [Who it's for]
Skips:         [Who it leaves out, e.g. bought in the last X days, pros, already in the cart flow]
Stops when:    [Exit, e.g. places an order]
Offer:         [None / offer + code + expiry date]
Owner:         [Who writes, who approves]

MESSAGES
| #  | Channel | When            | Working title     | Job of this message                 |
|----|---------|-----------------|-------------------|-------------------------------------|
| E1 | Email   | [Day 0, +1 hr]  | [Working title]   | [What it must answer or get done]   |
| S1 | SMS     | [Day 0, +2 hr]  | [Working title]   | [What it must answer or get done]   |
| E2 | Email   | [Day 1]         | [Working title]   | [What it must answer or get done]   |
| E3 | Email   | [Day 3]         | [Working title]   | [What it must answer or get done]   |

Measure:       [e.g. placed-order rate, click rate, revenue per recipient]
Notes:         [Anything the builder needs to know]
```

---

## 2. Email template

```
From name:      Architectural Depot
Subject A:      [45 characters or fewer]
Subject B:      [A different angle to A/B test]
Preview text:   [40-90 characters that add to the subject, not repeat it]

----------------------------------------------------------------
[HEADER: logo  ·  Beams  ·  Moulding  ·  Ekena Millwork  ·  Sale]

[EYEBROW: SHORT LABEL]
[HEADLINE: one clear promise, 8 words or fewer]
[SUBHEAD: one sentence on what's inside]

[HERO IMAGE: real product or install photo — describe the shot]

Hi [first name, or "there"],

[OPENING: 1-3 sentences. Why we're writing, tied to what they did.]

[SECTION TITLE]
- [Point 1]
- [Point 2]
- [Point 3]

[PRODUCT BLOCK, optional: cart items / viewed items / hand-picked items]

[REASSURANCE STRIP: Price match guarantee · 5% back in Depot Dollars · 1-888-573-3768]

[BUTTON: verb-first, 2-4 words]  ->  [URL]

P.S. [Optional: the phone line, or one helpful tip]

----------------------------------------------------------------
[FOOTER: 1-888-573-3768 (Mon-Fri 8am-6pm CT, Sat 8am-12pm CT) · cs@architecturaldepot.com
         Update preferences · Unsubscribe · Mailing address]
```

**Plain-text version** (for personal notes, e.g. a high-value cart): no header, images or button.

```
Hi [first name],

[2-4 short paragraphs in a person's voice.]

[Name]
[Title], Architectural Depot
1-888-573-3768 | cs@architecturaldepot.com
```

**Email rules**
- One main call to action per email.
- 80-200 words of body copy. Short paragraphs.
- No emoji in subject lines. At most one exclamation point.
- Only state facts we've confirmed. Anything unconfirmed stays a `[[PLACEHOLDER]]`.
- Made-to-order items: say they're built to order, can't be returned, and that measurements are
  worth a second check.

---

## 3. SMS template

```
Architectural Depot: [one idea, one sentence] [link] Reply STOP to opt out
```

**SMS rules**
- 160 characters or fewer, counting the link as about 23.
- Plain characters only: no emoji, curly quotes or long dashes. Any of those shrinks a text to
  70 characters.
- One link per text.
- Send only from 10am to 8pm in the customer's time zone.
- No more than 3 marketing texts per customer in any 7 days.

**Standard replies**

```
Opt-in confirmation: Architectural Depot: You'll get recurring automated marketing msgs.
                     Msg frequency varies. Msg & data rates may apply. Reply HELP for help,
                     STOP to cancel.
HELP:                Architectural Depot: Call 1-888-573-3768 (M-F 8am-6pm, Sat 8am-12pm CT)
                     or email cs@architecturaldepot.com. Reply STOP to cancel.
STOP:                Architectural Depot: You're unsubscribed and won't get more marketing
                     texts from us. Reply START to rejoin.
```

**Consent wording** (under every phone-number field; have counsel approve it):

```
By entering your phone number and submitting this form, you agree to receive recurring automated
marketing text messages from Architectural Depot at the number provided. Consent is not a
condition of any purchase. Msg frequency varies. Msg & data rates may apply. Reply HELP for help
or STOP to cancel. See our Privacy Policy and SMS Terms.
```

---

## 4. Program skeleton

Each flow with its message slots. Mark what already runs, then fill or delete the slots.

| Flow | Already have? | Email slots | SMS slots |
|---|---|---|---|
| Welcome | [Y/N] | E1 Welcome + [offer] · E2 [Material guide] · E3 [Sizing help] · E4 [Offer reminder] | — |
| SMS Welcome | [Y/N] | — | S0 Opt-in confirmation · S1 [Welcome code] · S2 [Helpful nudge] · S3 [Offer reminder] |
| Cart abandonment | [Y/N] | E1 [Cart saved] · E2 [Questions answered] · E3 [Last reminder + [offer?]] | S1 [Cart saved] · S2 [Last reminder] |
| Browse / page visit | [Y/N] | E1 [Still planning?] · E2 [How to choose] | S1 [Optional nudge] |
| Post-purchase | [Y/N] | E1 [Thank you + what's next] · E2 [Install prep] · E3 [Review ask] · E4 [Complete the look] | S1 [Thanks + help line] · S2 [Review ask] |
| Depot Dollars reminder | [Y/N] | E1 [Your Depot Dollars] · E2 [Last chance] | S1 [Reminder] |
| Sample follow-up | [Y/N] | E1 [How to judge samples] · E2 [How did it look?] · E3 [What to measure] · E4 [Still planning?] | S1 [Check-in] |
| Pro / trade | [Y/N] | E1 [What pros get] · E2 [Specs + custom] · E3 [Samples + quotes] · E4 [Where pros start] | — |
| Back in stock / price drop | [Y/N] | E1 [It's back] · E2 [Still deciding?] | S1 [It's back] |
| Win-back | [Y/N] | E1 [Next project?] · E2 [What's new] · E3 [Thank-you + [offer?]] | S1 [One nudge] |
| Sunset / re-engagement | [Y/N] | E1 [Still want emails?] · E2 [Last note] | — |

---

## 5. Placeholder key

| Placeholder | Fill with |
|---|---|
| `[[FIRST_NAME]]` | First name, with "there" when it's blank |
| `[[OFFER]]` | The offer in words, e.g. "10% off your first order" |
| `[[CODE]]` | The coupon code |
| `[[OFFER_END]]` | When the offer expires |
| `[[PRODUCT]]` | The product the customer viewed or carted |
| `[[CATEGORY]]` | Beams, corbels, shutters, mantels, moulding, ceiling, columns |
| `[[CART_LINK]]` | Link back to their cart |
| `[[MTO_LEAD_TIME]]` | Made-to-order production time |
| `[[SPECIALIST_NAME]]` | The real person who signs personal notes |
| `[[REVIEW]]` | A real, published customer review, word for word |
| `[[IMAGE]]` | Description of the real photo to use |

---

## 6. Before a message goes out

- [ ] Every `[bracket]` and `[[PLACEHOLDER]]` is filled or deleted.
- [ ] Facts match the live site (price match, returns, Depot Dollars, phone hours).
- [ ] Links work and go to the right page.
- [ ] Test sent and checked on phone and desktop.
- [ ] Texts fit in 160 characters and end with "Reply STOP to opt out".
