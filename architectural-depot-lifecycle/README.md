# Architectural Depot — Email Flows + SMS Build-Out

A complete, build-ready lifecycle program for ArchitecturalDepot.com on Klaviyo: **11 automated flows,
37 emails and 14 texts**, plus the SMS program (consent capture, system replies, compliance, list
growth and a Q4 2026 campaign calendar). Every message has final copy. Anything not confirmed about
the business is a visible token, never a guess.

**Start here:** open `dist/flow-map.html` in a browser. It shows every flow's trigger, filters and
schedule, a live preview of each email (desktop and phone) and text, the SMS program, the launch
plan and the QA results.

## What's in this folder

| Path | What it is |
|---|---|
| `PROMPT.md` | The detailed build prompt: business facts, voice, per-flow requirements, rules, output format. Reusable to rebuild or extend the program. |
| `SMS-PROGRAM.md` | SMS setup, consent, compliance, frequency, list growth, campaign playbook, KPIs, launch checklist, SMS Terms draft. |
| `data/flows/*.json` | **Source of truth** for each flow and all of its copy. Edit these. |
| `data/program.json` | Launch phases, flow priority, program rules, segments, data requirements, items to confirm. |
| `data/sms.json` | Consent language, opt-in placements, system replies, campaign calendar. |
| `build.py` | Validates everything and generates `dist/`. Python 3.9+, no dependencies. |
| `viewer.html` | Template for the flow map. |
| `dist/flow-map.html` | Interactive flow map (generated). |
| `dist/emails/*.html` | Klaviyo-ready HTML for all 37 emails (generated). |
| `dist/build-sheet.csv` | One row per message, in build order: timing, conditions, subjects, CTA URLs with UTMs, SMS text and length (generated). |
| `dist/copy-deck.md` | Every message in reading order, for copy review and sign-off (generated). |
| `dist/sms-playbook.md` | All SMS copy with character counts (generated). |
| `dist/qa-report.md` | Errors, warnings, links and claims to verify, merge tokens to map (generated). |

## The program

| # | Flow | Phase | Trigger | Messages |
|---|---|---|---|---|
| 1 | Welcome Series | 1 | Joins the email list | 4 email |
| 2 | SMS Welcome | 1 | Confirms SMS opt-in | 4 SMS (incl. opt-in confirmation) |
| 3 | Cart & Checkout Abandonment | 1 | Started Checkout | 5 email, 2 SMS (3 + 2 per person; high-value and made-to-order branches) |
| 4 | Browse Abandonment | 1 | Viewed Product | 4 email, 1 SMS (standard and custom-builder branches) |
| 5 | Post-Purchase | 1 | Placed Order | 6 email, 2 SMS (4 + 2 per person; first, repeat and made-to-order branches) |
| 6 | Depot Dollars Expiring | 2 | Depot Dollars expiry date | 2 email, 1 SMS |
| 7 | Sample-to-Order | 2 | Samples-only order | 4 email, 1 SMS |
| 8 | Pro Welcome | 2 | Identifies as contractor, builder, designer or architect | 4 email |
| 9 | Back in Stock + Price Drop | 2 | Back-in-stock request / price drop on a viewed item | 3 email, 2 SMS |
| 10 | Win-Back | 3 | No order in 180 days | 3 email, 1 SMS |
| 11 | Sunset / Re-engagement | 3 | No clicks or visits in 120 days | 2 email |

What makes it specific to Architectural Depot: Depot Dollars (5% back, 90-day expiry) used as the
recovery lever instead of discounts, honest made-to-order handling (built to spec, not returnable),
sample buyers routed to a conversion flow, Design Your Own builder visitors routed to custom-help
copy, a pro track, and help-first copy that answers size, material, finish and install questions.

## How to take it live

1. **Review the copy.** Read `dist/copy-deck.md` or click through the flow map.
2. **Answer the "Confirm before launch" items** (Launch & rules tab): welcome offer, cart and
   win-back incentives, made-to-order lead time, sample credit, trade program, specialist name,
   Instagram handle, brand palette, SMS number, Black Friday offer, holiday cutoff, SMS Terms page.
3. **Confirm the data feed** from Miva to Klaviyo: Started Checkout, a made-to-order flag on items,
   samples-only orders, a cross-device cart restore URL, Depot Dollars balance and expiry, catalog
   sync. Details are in the Launch & rules tab.
4. **Create the segments** listed in `data/program.json`.
5. **Build the emails.** Swap the placeholder palette and wordmark in `build.py` for the real brand,
   rebuild, then paste each `dist/emails/*.html` into Klaviyo (or rebuild in the drag-and-drop editor
   from the copy deck). Replace each gray image slot with real photography and each dashed
   "Dynamic block" with Klaviyo's product or cart block.
6. **Build the flows** from `dist/build-sheet.csv`, Phase 1 first: delays, splits, filters and Smart
   Sending as listed in each flow's notes. Turn off Klaviyo's automatic UTMs for these flows, because
   the links already carry them.
7. **Set up SMS** with the checklist in `SMS-PROGRAM.md`.
8. **Test** every message to team inboxes and phones (desktop, mobile, dark mode), click every link,
   and push test profiles through each branch.
9. **Launch Phase 1**, watch for two weeks, then Phase 2 and Phase 3.

## Editing and rebuilding

Change copy or logic in `data/`, then run:

```bash
python3 build.py           # rebuild dist/ and print the QA summary
python3 build.py --strict  # same, but exit 1 on any error (use before handing off)
```

The build checks subject and preview lengths, word counts, exclamation points, emoji, SMS prefix,
STOP line, GSM-7 characters, segment counts, link counts, unverified site paths, and phrases that
read as a promise (shipping, lead time, ratings, material performance). Last build: **0 errors,
0 warnings**; one claim flagged for a human to confirm.

## Sources for the business facts

Facts used in copy come from ArchitecturalDepot.com's help, rewards, returns, price-match and product
pages (via search results, since the site was not reachable directly from the build environment)
and Ekena Millwork's own site. The full list, and everything still unconfirmed, is in
`PROMPT.md` section 2. Spot-check them against the live site before launch.
