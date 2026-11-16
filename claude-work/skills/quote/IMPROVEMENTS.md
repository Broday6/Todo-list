# /quote v2: what changed and why (bt1104-4, Nov 11, 2026)

Brody, Nov 11: "This task should build off the /quote skill that we have it is almost done but look at ways to make it better". The /quote skill is quote-cart-rebuild (v1: NetSuite quote -> storefront cart). v2 keeps every v1 rule and adds:

1. Quote-only mode. Reps can get a priced quote without anyone driving a cart, which is most of what sales asks for.
2. Part numbers and plain text as input (v1 took NetSuite links, screenshots or pasted rows only). Plain text is matched Ekena-first, with the guesses flagged.
3. Pricing. v1 left prices to the cart ("quote discounts don't carry over"). v2 prices every line: catalog at list, custom Ekena pieces with Ryan's Custom Quoting Tool model (quote_calc.py, matches his 4 worked examples to the cent), and list-with-discount per Brody's Nov 4 rule.
4. "Needs a human" list so nothing unpriced slips through (PRICE NOT FOUND, Send to Ryan, CHECK WITH REP).
5. One quote table a rep can paste straight into an email.

More ideas, not built yet (need your call):
- Fill the "Verify" rows in the site table (HomeOver, Millwork.com, FauxBeams.com) on the next live cart run.
- Excel output once Daniel says which format reps want.
- Save each quote to a shared log so reps can reuse past custom prices.

Install: on your PC, replace the quote-cart-rebuild account skill's SKILL.md with this one and add quote_calc.py next to it. Then run the 3 tests in ../sales-quote-builder/TESTS.md.
