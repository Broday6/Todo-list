Run the Daily ads + portal guard for Architectural Depot now, on this PC, in Chrome (PCI profile). Read-only: never change anything in Google Ads, Microsoft Ads, the Marketing Portal or NetSuite.

1. Sign-ins. Open productmarketing.pcienterprises.com. If it shows "Login to Your Account", stop and tell me: "Please sign in to the Marketing Portal in this window, then say done." Never type or ask me for a password. Wait for me. Then check ads.google.com and ads.microsoft.com the same way.

2. Marketing Portal (true numbers). For the account and each group (G1, G2, G3, G4, G5, Brand), read:
   - L7 and L30 ad spend, with the previous period for each;
   - revenue;
   - spend % of revenue and growth, calendar YTD.
   Note: portal spend numbers have known issues right now, so label spend % "unreliable (portal issue)".

3. Google Ads (Architectural Depot account). Compare the last 7 days with the 7 days before, by campaign. Read Change History since Nov 4, and check disapprovals and account alerts. Use Microsoft Ads only to explain moves.

4. Flag:
   - campaigns whose 7-day spend rose more than 25%, or that dropped to near $0;
   - new disapprovals or alerts;
   - any bid, target, budget or AI Max change, saying who made it;
   - groups over 7.5% spend of revenue, or under 12% growth.

   Explain each flag in one plain line.

5. Rules:
   - Recommend only.
   - Never raise budgets.
   - Never use ROAS as the reason for a move.
   - Cut waste with campaign-level negatives, never by narrowing match types.
   - Check every negative candidate against our own catalog first.
   - Fireplace Mantels is protected: log it, don't recommend cuts.

6. Write it up:
   - Add one card titled "Daily guard: <today's date>" to the Asana board "Ads Audit — Architectural Depot" (https://app.asana.com/1/674488968356586/project/1218505279617813). It holds account and group numbers, the flags, and recommendations. Open a new card for anything that needs a decision.
   - If you have the Artifact tool, also update Ultron (https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7):
     - read it fresh, then change only these parts of the state JSON;
     - append to state.ads.runs {"kind":"Daily guard","on":<now ISO>,"ok":true,"note":<one line>,"url":<Asana card link>};
     - replace state.ads.guard with today's numbers in the same shape;
     - in state.automations.routines, on "Daily ads + portal guard (AD)", set status "ok" and last to today;
     - publish with no capabilities field.

7. Finish with a 3-line summary: what moved, what needs my OK, and the card link.
