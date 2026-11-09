# g5q1-06: Build the 4 new G5 categories in Miva (paste into Claude on your PC)

Plan approved Nov 9, 2026. Updated version: it starts from the NOT-IMPORTED files in the repo and fills in the product lists from the build kit. Sign in to the Architectural Depot Miva admin first (www.architecturaldepot.com/mm5/admin.mvc) and connect Claude in Chrome, then paste everything in the box into Claude on your PC.

```
Build 4 new categories in the Architectural Depot Miva admin and assign their products. Brody approved this plan on Nov 9, 2026. Nothing goes live: every category stays inactive.

Inputs (repo branch claude/brodys-board-v2-fuviv5, folder claude-work/2026-11-09/):
- g5q1-06-miva-categories-NOT-IMPORTED.csv: the 4 categories (code, name, inactive, parent code)
- g5q1-06-miva-category-products-NOT-IMPORTED.csv: product rows so far (only 3)
- g5q1-06-check-sheet.md: what belongs where and what Brody may have struck
- The G5 build kit on this PC: "Claude Code\beams-mantels-audit\out\AD beams & mantels build kit 2026-10-29.xlsx", sheet "New categories"

Steps:
1. Compare the categories CSV with the sheet. Use the sheet's name and code where they differ, and check the parent codes "beams" and "fireplaces" exist in Miva (if not, find the real codes for Decorative Ceiling Beams and Fireplace Mantels, Shelves & Surrounds). Tell me every difference.
2. Fill the products CSV from the sheet's product list for each category. Skip anything struck in the check sheet. For mantel-corbels, show me the 32 SKUs and wait for me to strike lines before going on. Save the result as ...-products-READY-NOT-IMPORTED.csv and show me the counts per category.
3. Stop and show me both files. Do nothing in Miva until I say go.
4. On my go, one category at a time: check the code doesn't already exist (stop and tell me if it does); create it with the name, code and parent, INACTIVE; paste the sheet's copy (header text, meta and any description fields; no new copy); assign the products by code. Skip codes Miva doesn't have and list them.
5. Box Beams: don't touch the /box-beams.html redirect. Web dev removes it later.
6. Don't touch navigation, other categories, prices, products or redirects.

At the end, give me one line per category: created yes/no, products assigned (count), codes skipped, anything that needs me.
```

Before you run it:
- g5q1-03 (the one-product category test) proves the Miva process. Do it first if it isn't done yet.
- After this: switch the categories on, send web dev the redirect note (in your Drafts), then send Paul "Nav rows for 4 new G5 pages" (in your Drafts).
