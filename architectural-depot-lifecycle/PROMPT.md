# Build Prompt — Architectural Depot Email Flows + SMS Build-Out

> Paste everything below the line into Claude (or hand it to a copywriter/agency) to build or rebuild
> the program. It is the same spec used to build the files in this folder. Sections 2 and 6 hold the
> facts and guardrails; edit them first if anything about the business changes.

---

## 1. Role and outcome

You are a senior lifecycle marketer and email/SMS copywriter who has built automated programs for
high-consideration home-improvement e-commerce brands. Build a complete, launch-ready **automated
email + SMS lifecycle program** for **Architectural Depot** (ArchitecturalDepot.com).

"Launch-ready" means: every flow has a trigger, filters, exit rules, timing, branch logic and KPIs;
every message has final copy (subject, preview text, headline, body, CTA, or SMS text); every unknown
is a visible placeholder, not a guess; and the whole thing can be built in the ESP by someone who has
not read anything else.

Assume **Klaviyo** as the ESP and SMS platform (it integrates with Miva, which runs the storefront) and
use Klaviyo trigger names and template tags. Keep the logic portable so it can be rebuilt elsewhere.

## 2. Business context

### Verified facts (you may state these in copy)

| Fact | Detail |
|---|---|
| Positioning | The largest provider of Ekena Millwork products anywhere; 20+ years as a source for architectural millwork and building elements. |
| What they sell | The full Ekena Millwork collection: exterior shutters (vinyl, wood, composite), corbels and brackets, faux wood ceiling beams, mantels, columns, balustrade railing kits, crown moulding and trim, wall accents (fretwork panels, wall/ceiling motif kits, slat wall kits), ceiling medallions, gable vents, finials, plinth blocks, shutter hardware. |
| Materials / lines | Polyurethane (Endurathane), Timberthane faux wood (beams; a new generation was released that is "even more realistic, still maintenance-free"), AmeriCraft real wood (stain-grade hardwoods), PVC, Fiberthane (fiberglass), SteelTek (metal brackets and hardware). |
| Custom | "Design Your Own" builders for corbels, brackets, flat trim and faux wood beams (custom sizes and profiles). Ekena positioning: custom products at "off-the-shelf" prices. |
| Quick ship | Heritage Series beams ship in 24–72 hours. Many items are marked "Free Shipping". |
| Samples | Material samples are sold: polyurethane material sample, Timberthane faux wood material sample (7" x 10"), vinyl shutter color sample kits, moulding profile samples. |
| Rewards | **Depot Dollars** — free rewards program. 5% back on every qualifying purchase ($0.05 per $1). $1 Depot Dollar = $1 off a future order. Available once the order ships. Expire 90 days after they are earned. Not valid on shipping, handling or tax; no cash value; non-transferable. |
| Price match | Lower price guarantee vs. any other online home improvement store: if you find a lower price (including shipping and handling) on the exact same product shippable within 10 business days, they refund the difference. |
| Free shipping | On select products marked "Free Shipping"; lower 48 states. (There is no site-wide threshold — never promise one.) |
| Returns | Most items: returnable within 30 days of delivery for a partial refund; 20% processing fee; customer pays return shipping. **Made-to-order items (vinyl shutters, wood shutters, custom/builder items, other made-to-order) are not returnable.** |
| Support | 1-888-573-3768 · cs@architecturaldepot.com · Mon–Fri 8am–6pm CT, Sat 8am–12pm CT. |
| Useful URLs | `/` · `/beams.html` · `/faux-wood-beams.html` · `/made-to-order-faux-wood-beams.html` · `/BM.html` (beam builder) · `/BUILDER-COR.html` · `/BUILDER-BKT.html` · `/BUILDER-FLT.html` · `/ekena-millwork.html` · `/moulding.html` · `/catalogs.html` · `/HELP.html` · `/products-on-sale.html` · `/architecturaldepot-customer-reviews.html` · `/all.html` · `/BASK.html` (cart) · `/SAMPLE-URETHANE.html` · `/BM-MAT-SAMPLE.html` · `/LVSAMPLECOLORS.html` · `/BESAMPLECOLORS.html` · `/blogs/` |

All URLs are on `https://www.architecturaldepot.com`. Any other path is allowed only if you mark it
for verification (the build script flags unverified paths automatically).

### Not confirmed — use a token, never a guessed value

| Token | What it stands for | Default to show in copy |
|---|---|---|
| `{{ WELCOME_OFFER }}` | Signup offer (public sources disagree on whether "10% off your first order" is live) | "10% off your first order" |
| `{{ welcome_code }}` | Unique welcome coupon (Klaviyo `{% coupon_code 'WELCOME' %}`) | — |
| `{{ CART_INCENTIVE }}` | Optional cart-recovery incentive. Prefer **bonus Depot Dollars** over a price discount. | "double Depot Dollars (10% back)" |
| `{{ WINBACK_INCENTIVE }}` | Optional win-back incentive | "bonus Depot Dollars" |
| `{{ SAMPLE_CREDIT }}` | Whether sample cost is credited toward a full order | omit the claim unless confirmed |
| `{{ MTO_LEAD_TIME }}` | Made-to-order production time, written as a noun phrase ("Production time: {{ MTO_LEAD_TIME }}") | placeholder until confirmed |
| `{{ TRADE_PROGRAM }}` | Any trade/pro pricing or account program | omit the claim unless confirmed |
| `{{ INSTAGRAM_HANDLE }}` | Social handle for photo sharing | — |

### Audience and buying behavior

- **DIY homeowners and remodelers** — most of the list. Project-driven, visual, anxious about getting
  size, material and finish right. Long consideration (days to weeks), high order values, often buy
  a sample first.
- **Pros** — contractors, builders, interior designers, architects. Want specs, custom sizes, lead
  times, someone to call, and repeat-order convenience.
- What blocks the sale: "Is this the right size?", "Will it look real/cheap?", "Interior or
  exterior?", "Can I return it?" (made-to-order cannot be), "When will it arrive?", "How do I
  install it?". Every flow must answer one or more of these — help sells this category.

## 3. Brand voice and copy rules

- Voice: a knowledgeable millwork pro at the counter. Warm, plain-spoken, specific, confident. Talk
  about *their project* and *their space*. No hype, no ALL CAPS, at most one exclamation point per
  email, no "Dear valued customer".
- Be concrete: name materials, finishes, profiles, sizes, rooms, exteriors. Prefer "a Timberthane
  beam looks like hand-hewn oak but weighs a fraction" style specificity — **only when true per
  section 2**.
- Subject lines: ≤ 45 characters ideal, ≤ 60 hard max. No emoji. Sentence case. Give an A/B variant
  for every email (`subject_b`) that tests a different angle (benefit vs. curiosity, etc.).
- Preview text: 40–90 characters, adds to the subject instead of repeating it.
- Body: 80–200 words of body copy per email (product blocks not counted). Paragraphs ≤ 3 sentences.
  Scannable: use bullets, cards or numbered steps where they help.
- One primary CTA per email, verb-first, 2–4 words ("Finish my order", "Shop faux wood beams").
  Primary CTA may repeat; secondary links are fine.
- Never invent: statistics, customer counts, reviews/testimonials, awards, ratings, warranties, lead
  times, shipping thresholds, or technical performance claims beyond section 2. For social proof, use
  a `review` block that tells the builder which **real** review to pull.
- Personalize with tokens (section 8), always with a fallback for first name.

## 4. The program — flows to build

Build these 11 flows. Phase 1 = launch first (highest revenue impact); Phase 2 = within 30 days;
Phase 3 = within 60 days. Message counts are targets (±1 is fine if justified in `build_notes`).

| # | Flow (id / code) | Phase | Trigger | Messages |
|---|---|---|---|---|
| 1 | Welcome Series (`welcome` / `WEL`) | 1 | Subscribed to email list | 4 email |
| 2 | SMS Welcome (`sms-welcome` / `SMW`) | 1 | Consented to SMS | 4 SMS (incl. opt-in confirmation) |
| 3 | Cart & Checkout Abandonment (`cart` / `CRT`) | 1 | Started Checkout | 3 email + 2 SMS, branches |
| 4 | Browse Abandonment (`browse` / `BRW`) | 1 | Viewed Product | 3–4 email + 1 SMS, custom-builder branch |
| 5 | Post-Purchase (`post-purchase` / `PP`) | 1 | Placed Order | 4–5 email + 2 SMS, branches |
| 6 | Depot Dollars Expiring (`depot-dollars` / `DD`) | 2 | Date: Depot Dollars expiry | 2 email + 1 SMS |
| 7 | Sample-to-Order (`sample` / `SMP`) | 2 | Placed Order containing only samples | 4 email + 1 SMS |
| 8 | Pro Welcome (`pro` / `PRO`) | 2 | `customer_type` set to a pro value | 4 email |
| 9 | Back in Stock + Price Drop (`back-in-stock` / `BIS`) | 2 | Back-in-stock subscription / price drop on viewed item | 3 email + 2 SMS, 2 branches |
| 10 | Win-Back (`winback` / `WIN`) | 3 | Enters "Lapsed customers" segment | 3 email + 1 SMS |
| 11 | Sunset / Re-engagement (`sunset` / `SUN`) | 3 | Enters "Unengaged 120d" segment | 2 email |

### Flow requirements

**1. Welcome Series (WEL).** Trigger: added to the Newsletter list (popup, footer form, account
signup with consent). Filter: placed order zero times since starting this flow. From E2 on, also
filter out `customer_type` = pro (they move to the Pro flow).
- E1 (immediately): welcome + `{{ WELCOME_OFFER }}` with `{{ welcome_code }}`; who we are (largest
  Ekena provider, 20+ years); the three reasons to buy here (Depot Dollars 5% back, price match,
  real people on the phone); shop-by-category cards. Include an `alt_versions` entry for a
  **no-offer** version (lead with Depot Dollars + early access to sales).
- E2 (day 2): "Pick the right material" — card per material line (polyurethane/Endurathane,
  Timberthane, AmeriCraft wood, PVC, Fiberthane, SteelTek) with what it's for; CTA to order a
  material sample.
- E3 (day 5): planning help — measuring/sizing advice framed as questions to ask, the Design Your Own
  builders (custom at off-the-shelf prices), call/email the team; a "Are you a pro?" link that sets
  `customer_type`.
- E4 (day 8): offer ends in 48 hours (no-offer version: "your first 5% back") + real review block +
  returns and price-match reassurance.

**2. SMS Welcome (SMW).** Trigger: consented to SMS (any source). Filter: placed order zero times
since starting. Klaviyo double opt-in is on, so:
- S0 (system): the opt-in confirmation reply (must contain brand, recurring/automated marketing
  disclosure, "Msg frequency varies", "Msg & data rates may apply", HELP and STOP).
- S1 (immediately after confirmation): welcome + code + link.
- S2 (day 2, 2pm local): help-first nudge (samples or builders).
- S3 (day 6): offer expires tomorrow.

**3. Cart & Checkout Abandonment (CRT).** Trigger: Started Checkout (fallback: Added to Cart if
Started Checkout is not available from Miva). Filters: placed order zero times since starting;
not in this flow in the last 7 days. Branches:
- A — cart value ≥ $1,000 (high value): E2 is a **plain-text** note from a named "project
  specialist" (`{{ SPECIALIST_NAME }}`) offering a call; no images.
- B — cart contains a made-to-order item: add a gentle "made for you" note (non-returnable, check
  measurements, `{{ MTO_LEAD_TIME }}`) — never framed as a scare.
- Default — everyone else.
- E1 (1 hour): your cart is saved; dynamic cart block; reassurance strip (price match, 5% back in
  Depot Dollars, secure checkout, phone + hours). No incentive.
- S1 (2 hours, SMS consent only): short, helpful, link to cart.
- E2 (24 hours): branch A plain-text specialist note / default: answer the top objections (sizing,
  material, shipping, returns, install) as a mini-FAQ.
- E3 (72 hours): last reminder; optional `{{ CART_INCENTIVE }}` (bonus Depot Dollars, expires in 48h).
- S2 (73 hours, SMS consent only): last-chance text matching E3.

**4. Browse Abandonment (BRW).** Trigger: Viewed Product. Filters: no Started Checkout or Placed
Order since starting; not in this flow in the last 14 days; not currently in the Cart flow.
Branch: viewed a Design Your Own builder page (`BUILDER-*` or `BM.html`) → custom branch; else
standard.
- Standard E1 (2 hours): "Still planning your {{ category_name }} project?" — dynamic viewed-product
  block + three decision helpers (specs/size, order a sample, call us). No discount.
- Standard E2 (2 days): category education + related products + real review block.
- Custom E1 (1 hour): help finishing the custom design (what to measure, how the builder works, call
  with dimensions).
- Custom E2 (2 days): custom at off-the-shelf prices, made-to-order note, samples.
- S1 (1 day, SMS consent AND viewed the same product 2+ times in 7 days — Klaviyo splits can't match the
  trigger's product, so this needs a site-side "repeat view" event or an approximation): one helpful text.

**5. Post-Purchase (PP).** Trigger: Placed Order. Filter: order is not samples-only (those go to
SMP). The storefront already sends transactional order/shipping confirmations — **do not
duplicate them**; this flow is education, delight and next purchase. Branches: first order vs.
repeat; contains made-to-order vs. in-stock only.
- E1 (1 hour): thank you + what happens next (MTO: built to your specs, `{{ MTO_LEAD_TIME }}`;
  in-stock: ships from our warehouse) + Depot Dollars earned (5%, available once it ships, expires in
  90 days) + "inspect on arrival, keep the packaging until install".
- S1 (2 hours, SMS consent): thanks + help line + install-guide link.
- E2 (day 5): get ready to install — prep checklist, link to install guides/specs on the product
  page, category-specific tips block (dynamic by category), call us.
- E3 (day 14): review request (review page) + share a photo (`{{ INSTAGRAM_HANDLE }}`).
- S2 (day 15, SMS consent, no review yet): one-tap review text.
- E4 (day 21): complete the look — category cross-sell map (corbels → shelf brackets/mantels; beams →
  beam straps/brackets/corbels; shutters → SteelTek hardware; mantels → corbels/moulding; columns →
  balustrades; moulding → ceiling medallions) + "your Depot Dollars are ready".
- Repeat-customer branch: skip E1's "who we are" content; thank them for coming back.

**6. Depot Dollars Expiring (DD).** Trigger: date-based on profile property
`depot_dollars_expiration_date` (needs a Miva → Klaviyo sync; fallback: Placed Order + 76 days).
Filter: `depot_dollars_balance` > 0 (when synced); placed order zero times since starting.
- E1 (14 days before): "You have {{ depot_dollars_balance }} in Depot Dollars" + ideas for what it
  covers (finials, plinth blocks, medallions, samples, hardware).
- S1 (3 days before, 11am local): balance + expiry date + link.
- E2 (2 days before): last chance; how to apply at checkout.

**7. Sample-to-Order (SMP).** Trigger: Placed Order where every item is a sample (SKU contains
`SAMPLE`, e.g. `SAMPLE-URETHANE`, `BM-MAT-SAMPLE`, `LVSAMPLECOLORS`, `BESAMPLECOLORS`). Exit: places a
non-sample order.
- E1 (1 hour): your samples are on the way — how to evaluate them (look in your light at different
  times of day, hold them where they'll be installed, compare with floors/cabinets/paint, feel the
  texture).
- E2 (day 7): "How did it look?" — shop the matching line, builders for custom sizes.
- S1 (day 8, SMS consent): quick check-in with link.
- E3 (day 14): planning help — what to measure, call a specialist with dimensions; `{{ SAMPLE_CREDIT }}`
  only if confirmed.
- E4 (day 30): still planning? inspiration by room/exterior + price match + Depot Dollars.

**8. Pro Welcome (PRO).** Trigger: `customer_type` updated to `contractor`, `builder`, `designer`
or `architect` (popup question, pro form, or the WEL E3 link). Filter: none beyond consent.
- E1 (immediately): what pros get — full Ekena catalog in one place, custom builders, phone support,
  price match, Depot Dollars on every order (adds up on volume), `{{ TRADE_PROGRAM }}` if confirmed.
- E2 (day 3): specs and custom — custom sizes via builders, specs/drawings/install guides on product
  pages, made-to-order planning, catalogs and brochures (`/catalogs.html`).
- E3 (day 7): samples for client presentations + send a project list to cs@ for help quoting.
- E4 (day 14): exterior + interior categories that pros order most (shutters, gable vents, columns,
  balustrades / beams, mantels, moulding, ceiling medallions) — no invented "most ordered" data; frame
  as "where pros start".

**9. Back in Stock + Price Drop (BIS).** Branch A trigger: Subscribed to back-in-stock (Klaviyo
catalog BIS). Branch B trigger: price drop on an item viewed or carted in the last 30 days (Klaviyo
price-drop trigger; requires catalog sync).
- A-E1 (immediately when restocked) + A-S1 (same time, SMS consent) + A-E2 (day 2 if not purchased).
- B-E1 (immediately) + B-S1 (2 hours, SMS consent, carted only).

**10. Win-Back (WIN).** Trigger: enters segment "Lapsed customers" = placed ≥ 1 order, last order
≥ 180 days ago, no site activity in 60 days (pros: 120 days). Filter: placed order zero times since
starting.
- E1: "What's your next project?" — inspiration by room/exterior + what's new (new-generation
  Timberthane; wall and ceiling motif kits; slat wall kits).
- E2 (day 7): new arrivals + Depot Dollars reminder.
- S1 (day 10, SMS consent): one text.
- E3 (day 14): `{{ WINBACK_INCENTIVE }}` + "we'll stop sending so often" honesty.

**11. Sunset / Re-engagement (SUN).** Trigger: enters segment "Unengaged 120d" = no email clicks or
site visits in 120 days (do **not** use opens — Apple Mail Privacy Protection inflates them) and
received ≥ 8 emails in that window. Email only.
- E1: "Still want project ideas from us?" — one-click choices: keep me subscribed / fewer emails /
  unsubscribe.
- E2 (day 5): last email unless they click. After 7 more days with no click: set
  `email_sunset = true` and exclude from campaign segments (do not unsubscribe them).

## 5. Cross-flow rules

- **Flow priority** (higher wins when a profile qualifies for several): Post-Purchase > Cart >
  Sample-to-Order > Depot Dollars > Back in Stock > Browse > Welcome/Pro > Win-Back > Sunset.
  Klaviyo removes a profile from a flow the moment it fails a flow filter, so put "not in flow X"
  filters only on the short, low-priority flows (Browse, Welcome, Win-Back, Sunset). The revenue
  flows (Cart, Post-Purchase, Sample, Depot Dollars) never block each other; Smart Sending spaces them.
- **Frequency caps:** email — Smart Sending 16 hours on all marketing flows except Cart E1,
  Post-Purchase E1 and the back-in-stock alert the shopper asked for; SMS — Smart Sending 24 hours, max 3 marketing texts per rolling 7 days
  per profile across flows and campaigns, never more than 3 in 24 hours (FL / OK / MD rule).
- **SMS quiet hours:** send only 10am–8pm in the recipient's local time; anything that falls outside
  waits for the next window. Use Klaviyo's quiet hours setting plus explicit send windows.
- **Discount guardrails:** the only standing discount is the welcome offer (if confirmed). Recovery and
  win-back incentives prefer bonus Depot Dollars. Never put a percentage off on made-to-order items
  in automated messages unless the business confirms margin allows it.
- **Made-to-order honesty:** whenever an MTO item is involved, say plainly that it is built to order,
  cannot be returned, and that measurements should be double-checked. Frame it as craftsmanship.
- **Exits:** every pre-purchase flow exits on Placed Order.
- **UTMs:** every link gets `utm_source=klaviyo&utm_medium={email|sms}&utm_campaign={flow id}&utm_content={step id}`
  (the build script adds these — write clean URLs).

## 6. SMS build-out requirements

Deliver an SMS program doc covering:
1. **Sender & registration:** toll-free number (verified) for launch; short code as volume grows.
   Verification paperwork, use-case description, sample messages, opt-in screenshots.
2. **Consent capture** with exact compliant disclosure copy for: popup step 2 (after email), footer
   form, checkout checkbox (unchecked by default; consent not a condition of purchase), keyword
   (`DEPOT` to the number) on packing inserts/catalogs/CS email signatures, pro form.
3. **Required system messages:** double opt-in prompt, opt-in confirmation, HELP reply, STOP reply,
   keyword join reply.
4. **Message rules:** brand prefix "Architectural Depot:" on every text; "Reply STOP to opt out" on
   every marketing text; GSM-7 characters only (no emoji, curly quotes or em dashes — they force
   70-character segments); ≤ 160 characters target, ≤ 306 (2 segments) hard max; one link max
   (Klaviyo-shortened); no SHAFT content; sender identification; no URL shorteners other than the
   platform's branded one.
5. **Compliance:** TCPA express written consent, CTIA guidelines, state rules (Florida FTSA,
   Oklahoma, Maryland: 8am–8pm and 3 texts / 24h), quiet hours, record-keeping of consent
   (timestamp, source, IP, disclosure text), honoring opt-outs in any reasonable form.
6. **List growth plan** with targets and placements.
7. **Campaign playbook** (non-automated SMS): cadence (2–4/month), which moments merit a text, and a
   Q4 2026 calendar (Black Friday Nov 27, Cyber Monday Nov 30, holiday shipping cutoffs).
8. **KPIs:** opt-in rate, opt-out rate per send (< 1.5% target), CTR, revenue per recipient,
   list growth.

## 7. Email template requirements

Responsive, table-based HTML, 600px max, inline styles, works in Outlook and dark mode. Header with
wordmark and a slim nav (Beams · Moulding · Ekena Millwork · Sale). Footer with phone, email, hours,
Depot Dollars + price match strip, `{% manage_preferences %}`, `{% unsubscribe %}`, and
`{{ organization.full_address }}` (CAN-SPAM). Image slots are placeholders with art direction.

## 8. Personalization tokens

Use only these in copy (the build sheet maps them to real Klaviyo variables):
`{{ first_name|default:'there' }}`, `{{ product_name }}`, `{{ product_url }}`, `{{ category_name }}`,
`{{ cart_url }}`, `{{ order_number }}`, `{{ depot_dollars_balance }}`,
`{{ depot_dollars_expiration_date }}`, `{{ welcome_code }}`, `{{ SPECIALIST_NAME }}`, plus the
section 2 business tokens. Dynamic blocks (cart items, viewed product, recommendations) are described
with a `products` block, not hand-written.

## 9. Output format

Write one JSON file per flow at `data/flows/<id>.json` with this shape:

```json
{
  "id": "welcome",
  "code": "WEL",
  "name": "Welcome Series",
  "phase": 1,
  "priority_rank": 1,
  "goal": "One sentence: what this flow exists to do.",
  "trigger": "Plain-language trigger + Klaviyo trigger type.",
  "flow_filters": ["..."],
  "exit_conditions": ["..."],
  "smart_sending": "Email on (16h) / SMS on (24h) — and why if off",
  "branches": [{"id": "A", "label": "High-value cart", "rule": "Checkout value >= 1000"}],
  "kpis": [{"metric": "Placed order rate", "target": "4%"}],
  "build_notes": ["Anything the ESP builder must know: data needed, setup quirks."],
  "steps": [
    {
      "id": "WEL-E1",
      "channel": "email",
      "branch": "All",
      "timing": "Day 0 - immediately",
      "offset_hours": 0,
      "condition": "None",
      "name": "Welcome + offer",
      "purpose": "Why this message exists and what it must make the reader feel/do.",
      "subject": "...",
      "subject_b": "...",
      "preheader": "...",
      "hero": {"eyebrow": "...", "headline": "...", "subhead": "...", "image": "Art direction for the hero image"},
      "blocks": [
        {"type": "text", "text": "Paragraph. Supports **bold** and [links](https://www.architecturaldepot.com/...)."},
        {"type": "bullets", "items": ["..."]},
        {"type": "cards", "title": "optional", "items": [{"title": "...", "text": "...", "url": "optional"}]},
        {"type": "steps", "title": "optional", "items": [{"title": "...", "text": "..."}]},
        {"type": "products", "title": "...", "source": "Dynamic: what feed/event fills it", "count": 3},
        {"type": "callout", "title": "...", "text": "..."},
        {"type": "review", "source": "Which REAL review to pull and from where"},
        {"type": "image", "direction": "Art direction"},
        {"type": "button", "label": "...", "url": "..."}
      ],
      "cta": {"label": "Shop faux wood beams", "url": "https://www.architecturaldepot.com/faux-wood-beams.html"},
      "ps": "Optional P.S. line",
      "style": "designed | plain",
      "alt_versions": [{"label": "No-offer version", "subject": "...", "headline": "...", "notes": "..."}]
    },
    {
      "id": "SMW-S1",
      "channel": "sms",
      "branch": "All",
      "timing": "Day 0 - right after confirmation",
      "offset_hours": 0,
      "condition": "None",
      "name": "Welcome code",
      "purpose": "...",
      "text": "Architectural Depot: ... {link} Reply STOP to opt out",
      "link": "https://www.architecturaldepot.com/",
      "media": "Optional MMS image direction, or omit"
    }
  ]
}
```

Rules for the file: `offset_hours` is hours after the flow trigger (used to draw the timeline);
step ids are `<CODE>-E<n>` for email and `<CODE>-S<n>` for SMS, with a branch letter suffix where
branches split (e.g. `CRT-E2A`); `style: "plain"` renders as a plain-text personal note.
In SMS `text`, write `{link}` where the link goes (counted as 23 characters).

## 10. Acceptance checklist (self-check before you finish)

- [ ] Every flow has trigger, filters, exits, smart-sending, KPIs, build notes.
- [ ] Every email has subject + `subject_b` + preheader + hero + body + one primary CTA.
- [ ] Every SMS starts "Architectural Depot:", ends "Reply STOP to opt out", is GSM-7 only, ≤ 306 chars.
- [ ] No invented facts, numbers, reviews or policies; unknowns are tokens.
- [ ] MTO items are handled honestly wherever they can appear.
- [ ] No more than one exclamation point per email; no emoji anywhere.
- [ ] Copy answers a real buying question in every message — not just "come back".
- [ ] JSON parses (`python3 -m json.tool data/flows/<id>.json`).
