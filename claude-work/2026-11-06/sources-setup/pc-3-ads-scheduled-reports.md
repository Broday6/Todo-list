# PC prompt 3: schedule Google Ads and Microsoft Ads reports to your Outlook

This only creates scheduled reports that email you. No bids, budgets, keywords or campaigns change. You approve it by running it.

Paste the box into Claude on your PC (Claude in Chrome, signed in to Google Ads and Microsoft Ads first).

```
Set up scheduled email reports in Google Ads and Microsoft Ads for the Architectural Depot accounts so the results arrive in my Outlook every weekday. Brody approved exactly this on Nov 6, 2026. Create reports and schedules only. Don't change any campaign, bid, budget, keyword, negative, ad or feed.

GOOGLE ADS (Reports > Report editor, build each as a table, save it with the name below, then Schedule: email to b.simpson@pcienterprises.com only, daily, format CSV, date range "Yesterday" unless noted):
1. "Ultron feed: GAds campaigns daily": Campaign, Campaign type, Cost, Clicks, Impressions, Conversions, Conv. value. Date range: Yesterday.
2. "Ultron feed: GAds search terms 7d": Search term, Campaign, Ad group, Match type, Cost, Clicks, Conversions. Date range: Last 7 days. Schedule weekly on Monday instead of daily.
3. "Ultron feed: GAds products daily": Shopping/PMax product view: Item ID, Product title, Campaign, Cost, Clicks, Conversions, Conv. value. Date range: Yesterday.
4. "Ultron feed: GAds disapprovals": Ads and assets with status Disapproved or Limited: Campaign, Ad group, Ad or asset, Policy status, Policy topic. Daily.

MICROSOFT ADS (Reports > create, then Schedule: email to b.simpson@pcienterprises.com only, CSV):
5. "Ultron feed: MSAds campaigns daily": Campaign performance: Campaign, Spend, Clicks, Impressions, Conversions, Revenue. Yesterday, daily.
6. "Ultron feed: MSAds search terms 7d": Search query performance, last 7 days, weekly on Monday.

If a report type isn't available, build the closest one and tell me what differs. When done, give me one line per report: created yes/no, schedule, and anything that blocked you.
```

The cloud ads guard reads these emails each morning (by the "Ultron feed:" subjects). It still never judges on ROAS and never changes anything without your OK.
