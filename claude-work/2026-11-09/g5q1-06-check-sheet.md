# g5q1-06 check sheet: 4 new G5 categories in Miva

Plan approved Nov 9. **Nothing is imported.** Both CSVs end in NOT-IMPORTED. Strike lines here or in the files before anything goes into Miva.

## What I couldn't do from the cloud (step 1)

I couldn't pull the full product lists. architecturaldepot.com and its search API sit behind a Cloudflare bot check that blocks the cloud session (403 "Just a moment"), the OneDrive "Ultron > 2 NetSuite exports" folder is empty, and there are no "Ultron feed:" emails yet. So the product file only has the SKUs the Oct 29 Deep Dive names. The full lists are in the build kit's "New categories" sheet on your PC, and the PC prompt fills them from there.

## Files

| File | What's in it |
|---|---|
| g5q1-06-miva-categories-NOT-IMPORTED.csv | The 4 categories, all inactive (CATEGORY_ACTIVE 0). Parent codes `beams` and `fireplaces` are my best match for Decorative Ceiling Beams and Fireplace Mantels, Shelves & Surrounds, so check them in Miva. |
| g5q1-06-miva-category-products-NOT-IMPORTED.csv | Category + product code rows. Only the 3 named SKUs so far; the PC run adds the rest from the sheet. |

## Products per category (from the Deep Dive; the sheet has the codes)

**Box Beams & Beam Wraps** (box-beams), 19 products
- 6 Heritage Timber U-beams
- 4 AmeriCraft real wood U-beams
- TimberThane builder (the BM parent) and 8 TimberThane U-beams
- Before launch: web dev removes the /box-beams.html 301 to /beams.html (draft in your Outlook Drafts).

**White Oak Beams** (white-oak-beams)
- The 4 AmeriCraft parents (White Oak comes in all 4 textures) plus the AmeriCraft sample kits.
- Open question for web dev: can the cards open on the White Oak variant?

**Mantel Shelves** (mantel-shelves)
- MANURUS, MANURD, MANU (Heritage beam mantel, sold as a mantel or floating shelf)
- About 10 Pearl shelves AD already lists (codes in the sheet)

**Mantel Corbels & Brackets** (mantel-corbels), 32 proposed SKUs. **Prune these before import.**
- 11 Rustic Wood corbels
- 6 TimberThane faux wood corbels
- 6 AmeriCraft hardwood corbels
- 6 steel brackets
- 3 hidden floating brackets

## Not sure these belong

- Endurathane mantel legs: AD search shows them for "mantel corbels", but they're legs, not corbels. Leave them out of mantel-corbels.
- AmeriCraft in Box Beams and in White Oak Beams: the same 4 parents go in both. That's intended.

## After import (not part of this run)

1. You check each category in Miva and switch it on.
2. Web dev removes the box-beams redirect.
3. Send Paul "Nav rows for 4 new G5 pages" (already in your Drafts).
