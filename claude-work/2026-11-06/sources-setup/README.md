# New sources for Ultron (no API keys)

Brody, Nov 6: "What additional sources can we add to make it more effective" → "start making these changes" (no API keys).

Everything comes in through two places Claude can already read: **your Outlook** and **your OneDrive › Ultron folder**.

OneDrive folder (created Nov 6): https://pacificcolumnscom-my.sharepoint.com/personal/b_simpson_pcienterprises_com/Documents/Ultron
- `1 Build kits and plans`: G5 build kit, nav sheet, audit workbooks. Anything Claude used to say "is on your PC".
- `2 NetSuite exports`: optional; the scheduled emails below are enough.
- `3 Ads and analytics reports`: optional; the scheduled emails below are enough.
- `4 Drop anything for Claude`: any file you want Claude to use.

| # | Source | Status | Your part | Unblocks |
|---|---|---|---|---|
| 1 | OneDrive Ultron folder | Folder made | Copy the build kit in (prompt: `pc-1-copy-build-kit.md`) | Nav rows, FAQs, G5 pages, audits without "it's on your PC" |
| 2 | NetSuite scheduled saved-search emails | Steps ready | Run `pc-2-netsuite-scheduled-emails.md` on your PC (or do it by hand, 5 min each) | Pearl shelves check, price drift, alert fix files, sales by item |
| 3 | Google Ads + Microsoft Ads scheduled report emails | Steps ready | Run `pc-3-ads-scheduled-reports.md` on your PC | The daily ads guard runs in the cloud even when your PC is off |
| 4 | Product feed links (AD, HomeOver, Ekena) | Waiting on you | Paste the feed URLs into Control room › Sources | Checking what's live without the site's bot block |
| 5 | Teams channels | Already covered | Nothing | The Teams search already includes channels you're in |
| 6 | Analytics (GA4 / Looker Studio) | Optional | Schedule a weekly email of the landing-page report to yourself | Page conversion for Faux Metal Beams and the new G5 pages |

Subjects matter: the routines find these emails by subject, so keep the subjects exactly as written in the prompts (they all start with "Ultron feed:").

Not doing (Brody, Nov 6: no API keys): BugHerd API, NetSuite API, Miva API, Search Console API. Those stay on the PC tasks.
