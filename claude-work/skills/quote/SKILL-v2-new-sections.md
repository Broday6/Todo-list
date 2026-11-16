---
name: "quote-cart-rebuild"
description: "/quote: turn a NetSuite quote, pasted rows, part numbers or a plain-text ask (\"6 white PVC columns, 8 ft\") into a priced quote for a PCI rep (list price with the rep's discount; custom Ekena pieces priced with Ryan's Custom Quoting Tool model via quote_calc.py), then optionally rebuild it as a cart on Architectural Depot, HomeOver, Ekena Millwork, Millwork.com or FauxBeams.com. Never checks out, never invents a price, never changes NetSuite."
---

# /quote: price it, then (if asked) build the cart

v2 (Nov 11, 2026). Built on the v1 cart rebuild below. New in v2: Step 0 (modes), Step 1b (plain text and part numbers), Step 1c (pricing) and Step 7b (quote output). The v1 hard rules and steps are unchanged.

## 0. Pick the mode
- **Quote only** (default when the rep gives part numbers or plain text and does not ask for a cart): no browser cart work. Output the priced quote (Step 7b) and stop.
- **Cart** (a NetSuite quote or order, or the rep asks for a cart): run Steps 1 to 7, then add the Step 7b quote summary to the report.
- Say which mode you picked in one line.

## 1b. Part numbers and plain text (new)
- Part numbers: open each one directly (`/<ITEM NO>.html` on AD, or SKU Lookup). Never use site search.
- Plain text: turn each line into product, size, material, finish, quantity. Match it Ekena-first with the ekena-first-product-finder skill (category pages and direct URLs, no site search). Give the top match per line plus one alternate, and mark any guess "CHECK WITH REP".
- If a size, material, construction (open, closed, solid) or quantity is missing and it changes the price, ask the rep for just that, all in one question. Sizes are decimal inches (5 1/2 = 5.5).

## 1c. Price every line (new)
Split each line into one of three kinds:
1. **Catalog item:** list price read from the product page (Item No. must match exactly). If the price can't be read, write "PRICE NOT FOUND" and keep going. Never guess.
2. **Custom Ekena piece** (corbels, brackets, braces, gingerbread brackets, outlookers, gable brackets, gable pediments, rafter tails, running trim, dentil trim, pilasters, pediments, gable vents, PVC medallions, wall panels, L 2-piece wall panels, flat trim, flat arch trim, plinths and rosettes, custom radius rail): run `python3 quote_calc.py '<json>'` (keys: category, w, h, d, qty, material PVC|Signature Urethane|Timberthane, options, face, medallion_od, freight). It mirrors Ryan Shumaker's Custom Quoting Tool (2022 matrix x annual increases, 2026 = x1.202145).
3. **Send to Ryan:** crossheads, ForgeCraft faux steel, gable faces over 8 in, carved or complex designs. Mark the line with the reason.

**Discount rule (Brody, Nov 4): every custom quote starts at list and takes a discount.**
- Ekena / dealer quotes: show list. Dealer discounts are applied in NetSuite by the rep, never here.
- ArchitecturalDepot.com quotes: list x 0.85, then the quantity tier off that (10+ 5%, 25+ 10%, 50+ 15%; tiers pending Daniel's OK). Round to cents at each step. Freight after discounts. No tax.
- Any other discount (Pro, Depot Dollars, a rep's special): ask the rep for the exact amount. Never assume it from an old quote.

## 7b. Quote output (new)
One table: line, SKU or "Custom", description, qty, list/unit, discount, net/unit, line total, notes. Then subtotal, freight if stated, total. Then **Needs a human**: PRICE NOT FOUND, Send to Ryan, CHECK WITH REP, discounts still to confirm.
Custom line description (Ryan's template): `Custom [BRAND + MATERIAL] [Category] / SIZE: W" x H" x L" / STYLE: Custom - See Drawing / CONSTRUCTION: Open, Closed or Solid / LOCATION REFERENCE if given`. Add: "Check that the description and the drawing match."
Format: plain text a rep can paste into an email (Excel version pending Daniel's answer).
