# g5q1-06: Build the 4 new G5 categories in Miva (paste into Claude on your PC)

Brody's go-ahead (Ultron, Nov 6): "We don't need Paul for this. Me and you can actually create these categories in Miva ourselves; if you want to create them and assign the products to them you can."

Copy everything in the box below into Claude on your PC (Claude in Chrome needs to be connected, and you need to be signed in to the Miva admin first).

```
Build 4 new categories in the Architectural Depot Miva admin and assign their products. Brody approved exactly this on Nov 6, 2026.

Source of truth: the G5 build kit on this PC, folder "Claude Code\beams-mantels-audit\". Open the build kit workbook and use its "New categories" sheet for each category's name, code, parent, products (SKUs) and copy. If the sheet disagrees with the table below, the sheet wins; tell me what differed.

| Category name | Code | Parent (if the sheet doesn't say) |
|---|---|---|
| Box Beams & Beam Wraps | box-beams | Decorative Ceiling Beams |
| White Oak Beams | white-oak-beams | Decorative Ceiling Beams |
| Mantel Shelves | mantel-shelves | Fireplace Mantels, Shelves & Surrounds |
| Mantel Corbels & Brackets | mantel-corbels | Fireplace Mantels, Shelves & Surrounds |

Steps, one category at a time:
1. Check first that the code doesn't already exist in Miva. If it does, stop and tell me.
2. Box Beams only: /box-beams.html currently redirects to /beams.html. Don't change or delete that redirect. Create the category but leave it inactive and tell me the redirect still has to come off (web dev).
3. Create the category with the name, code and parent. Leave it INACTIVE (not visible on the site) so nothing goes live yet.
4. Paste the copy from the sheet (header text and any description fields the sheet has). Don't write new copy.
5. Assign the products from the sheet by SKU. Skip any SKU that doesn't exist in Miva and list it.
6. Don't touch the navigation, other categories, prices, products or redirects.

When done, give me one line per category: created yes/no, products assigned (count), SKUs skipped, anything that needs me. Then I'll check them and switch them on, and tell Paul to add the nav rows (the draft "Nav rows for 4 new G5 pages" is in my Outlook Drafts).
```

Before you run it:
- g5q1-03 (the one-product category test in Miva) proves the build process. If it isn't done, do that first or run this on one category only.
- The categories stay inactive. Turning them on, the Box Beams redirect, and Paul's nav rows are the steps after this.
