# PC prompt 2: have NetSuite email your saved searches every morning

This changes only the email schedule on your own saved searches. No item, price or record changes. You approve it by running it.

Paste the box into Claude on your PC (Claude in Chrome, signed in to NetSuite first).

```
In NetSuite (https://362135.app.netsuite.com), set up scheduled emails for my saved searches so their results arrive in my Outlook every weekday morning. Brody approved exactly this on Nov 6, 2026. Change only the Email/Schedule settings of these searches; don't change their criteria, results columns, or any record.

For each search below: open it in edit mode (Lists > Search > Saved Searches, filter by ID), go to the "Email" subtab, and set:
- Recipients: me only (b.simpson@pcienterprises.com). No one else.
- Subject: exactly the subject in the table.
- Attach results as: CSV (or Excel if CSV isn't offered).
- Send on: Schedule. Weekdays (Mon-Fri), once a day at 6:00 AM Central.
- Don't tick "Send email alerts when records are created/updated".
Then Save. If NetSuite asks to save as a copy because the search is someone else's, stop and tell me instead.

| Search ID | What it is | Subject |
|---|---|---|
| 14837 | My product data search | Ultron feed: 14837 product data |
| 15585 | Sales by item | Ultron feed: 15585 sales by item |

(The alert searches that already email you, like 14668 and 16559, stay as they are; Claude already reads those.)

When done, tell me one line per search: scheduled yes/no, time, format, and anything that blocked you. Don't press Preview/Run on anything big.
```

If you'd rather do it by hand: same steps, about 5 minutes per search. Add any other search you want Claude to watch with a subject starting "Ultron feed:".
