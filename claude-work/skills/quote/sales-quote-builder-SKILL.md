---
name: sales-quote-builder
description: Turn a sales rep's list of part numbers, or a plain-text request ("6 corbels 6x10x12 Timberthane, closed"), into a quote for PCI. Catalog items are quoted at list from the storefront. Custom Ekena PVC/urethane pieces are priced with Ryan Shumaker's Custom Quoting Tool model (PVC Pricing 2.4.2022 plus annual increases). Shows Ekena list and the ArchitecturalDepot.com retail price. Never invents a price, never places an order and never changes NetSuite.
---

# Sales quote builder

## What the rep gives you
Part numbers, a pasted email or chat, or plain text. Mixed is fine.

## Step 1: Split every line into one of three kinds
1. **Catalog SKU** (a part number, or a stock product such as a column, a stock corbel or a mantel). Find the exact SKU on ekenamillwork.com or architecturaldepot.com (use the ekena-first-product-finder skill for plain text). Read its list price from the product page. If the SKU or the price can't be confirmed, write "PRICE NOT FOUND" for that line and keep going. Never guess.
2. **Custom Ekena piece** (made to size): corbels, brackets, braces, gingerbread brackets, outlookers, gable brackets, gable pediments, rafter tails, running trim, dentil trim, pilasters, pediments, gable vents, PVC medallions, wall panels, L 2-piece wall panels, flat trim, flat arch trim, plinths and rosettes, custom radius rail. Price it with quote_calc.py (Step 2).
3. **Can't quote here**: crossheads (Ryan's sheet says not yet), ForgeCraft faux steel, gable faces over 8 in, carved or complex designs that need extra CNC time. Mark "Send to Ryan" with the reason.

If a size, material, construction or quantity is missing, ask the rep for just that before pricing. Sizes are decimal inches (5 1/2 in = 5.5).

## Step 2: Custom pricing (exactly Ryan's workbook)
- 2022 list per unit = base labor + material charge x (1 + sum of % options) x (1 + material upcharge) x 1.10 tooling + dollar extras.
- Material charge = rate x W x H x D (gable vents: W x H in sq in; radius rail: L x D). Overall size, no cavity deduction.
- Options: closed +12%, solid +20% (braces are solid at base price), gable face over 4 to 6 in +4%, over 6 to 8 in +7%, fluted or paneled +8%, 3 or 4 spoke +7%, sunburst +12%, functional vent +10%, brick mold +12%, bottom sill +4%, outer edge detail +10%, bullseye +10%. Percent options add together and touch material only.
- Material: PVC 0, Signature Urethane +7%, Timberthane +10%.
- Medallion finishing: $1.50 per inch of outer diameter (2022 dollars, extra).
- Then multiply by the annual increase: 2023 +5%, 2024 +7%, 2025 0, 2026 +7% (x1.202145 for 2026).
- Round to cents. Quote total = unit x qty + stated freight. No tax.

## Step 3: Pricing rules (list with a discount)
- **Ekena Millwork / dealer quotes:** quote at list. Dealer discounts are applied in the CRM (NetSuite), never in this skill.
- **ArchitecturalDepot.com quotes:** starting retail = list x 0.85, then quantity discount off retail: 10+ units 5%, 25+ 10%, 50+ 15%. Round to cents after each step. Freight added after discounts.

## Step 4: Output
One table per quote: line, SKU or "Custom", sales description, qty, Ekena list/unit, list total, AD retail/unit, AD total, notes. Then totals, then a "Needs a human" list (PRICE NOT FOUND, Send to Ryan, missing details).
Custom line description, from Ryan's template:
Custom [BRAND + MATERIAL] [Category] / SIZE: W" x H" x L" / STYLE: Custom - See Drawing / CONSTRUCTION: Open, Closed or Solid / LOCATION REFERENCE if given.
Add: "Check that the description and the drawing match. They should never conflict."

## Never
- Never invent a SKU or a price, or quote a catalog item from the custom matrix.
- Never place an order, check out or change NetSuite. To turn the quote into a cart, hand off to customer-product-matcher or quote-cart-rebuild.
- Never quote crossheads or ForgeCraft from this model.

## Keeping it current
Annual increases and tier minimums live in quote_calc.py (INCREASES, AD_TIERS). Update them when Ryan updates the Price Increases and 2022 Matrix tabs.
