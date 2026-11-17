# Barron product audit: cloud part (task br1117-2)

Checked Tue Nov 17, 2026, about 11:30 CT, by the hourly Ultron run. Read only: nothing was changed on any site or in NetSuite.

## What the cloud could read

- **barron.pcienterprises.com** (the new Barron Miva store, store code BARRON): 48 menu links. 46 category pages load; 2 menu links point at product pages that return Not Found (/anson-fieldstone-stone-wall-panel/, /colorado-dry-stack-stone-column-wrap/).
- **azfauxbeams.pcienterprises.com**: runs on the same BARRON store. All 29 of its category links (Beams, Panels, Siding, Mantels, Samples and their subcategories) return **Not Found**. Its categories don't exist in the store yet, so it shows no products at all.
- **Product grid**: every Barron category page shows the **same 37 items**, whatever the category (Acoustic Panels, Barn Doors, Faux Columns and Beams all list the same set). They are our Ekena beam codes (BM..., SAMPLE-BM..., TKHBEAMS), not Barron's own products. The grid looks like an unfiltered search feed, not the category's products.
- **Every one of those 37 product links returns Not Found** in the Barron store. So the Barron store has **no working product pages yet**.

Codes the grid shows (all return Not Found): BM, BM-MAT-SAMPLE, BMAPRD, BMHH2-ST, BMHH3-ST, BMHHS1-ST, BMKP2-ST, BMKP3-ST, BMKPS1-ST, BMMAS3, BMPC2-ST, BMPC3-ST, BMPCS1-ST, BMPORD, BMRC2-ST, BMRC3-ST, BMRCS1-ST, BMRDS3, BMRRS3, BMRS2-ST, BMRS3-ST, BMRSS1-ST, BMRW2-ST, BMRW3-ST, BMRWS1-ST, BMSD2-ST, BMSD3-ST, BMSDS1-ST, BMSFRD, BMSM2-ST, BMSM3-ST, BMSMS1-ST, BMSTS3, SAMPLE-BMAPRD_P, SAMPLE-BMPORD_P, SAMPLE-BMSFRD_P, TKHBEAMS.

## What this means for the three lists

| List | Status |
|---|---|
| On both (Barron and us) | Can't be built from the storefront: the store has no Barron products loaded yet. |
| Barron-only (missing from us) | Needs Barron's own catalog: the old Barron/AZ Faux item list, the Barron Transfer.xlsx Tory sent, or Selina's staged records. |
| Ours but not on Barron | Needs our NetSuite items by line (beams, panels, columns, mantels, siding). |

## Sent to your PC

The comparison needs NetSuite and the Miva admin, which only your PC can reach. A Claude Code chat opens in the Ultron group at the next :05 or :35 with this step:
"Pull Barron's item list (Barron Transfer.xlsx from Tory's Nov 16 email, Selina's staged records, and the BARRON store's products in the Miva admin) and our NetSuite items for the same lines; build the three lists (on both, Barron-only, ours only) as a CSV in claude-work/2026-11-17/."

## Also worth flagging to Tory or Paul (not sent)

1. The Barron category grids show the same unfiltered 37 Ekena items on every category, and all of them 404.
2. The AZ Faux test site's 29 category links all 404.
3. Two Barron menu links go to product pages that don't exist.

Category-by-category detail: br1117-4-barron-category-check.csv (same folder).
