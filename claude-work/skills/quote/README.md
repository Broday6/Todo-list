# /quote skill for the sales team (Ultron task bt1104-4)

Lets a sales rep turn part numbers or a plain-text request ("6 white PVC columns, 8 ft") into a priced quote. Catalog items are quoted at list. Custom Ekena pieces are priced with Ryan Shumaker's Custom Quoting Tool model. Every custom quote starts at list and then takes the discount (Brody's Nov 4 rule).

Files:
- `SKILL-v2-new-sections.md`: the v2 sections (modes, plain text and part numbers, pricing, quote output). They go at the top of the existing quote-cart-rebuild (/quote) SKILL.md, and the v1 text stays below them unchanged.
- `quote_calc.py`: the custom pricing calculator (2022 matrix x annual increases; 2026 = x1.202145; AD = list x 0.85, then 10+/25+/50+ tiers).
- `sales-quote-builder-SKILL.md`: the Nov 10 standalone version, kept for reference.
- `IMPROVEMENTS.md`: what v2 changed and ideas not built yet.
- `TESTS.md`: test requests and expected prices.

Still open (from the draft to Daniel, not sent yet): are the AD quantity tiers 10/25/50 units, and do reps want email text or an Excel quote? Update `AD_TIERS` in quote_calc.py once Daniel answers.

Install on Brody's PC: add the v2 sections to the quote-cart-rebuild account skill's SKILL.md and put quote_calc.py next to it.
