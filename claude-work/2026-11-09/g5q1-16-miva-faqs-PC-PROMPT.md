# g5q1-16: Put the 7 category FAQs into Miva (paste into Claude on your PC)

Your go-ahead (Ultron, Nov 9): "now I want you to go and upload this task log into miva and add the content to the right places".

The cloud session can't sign in to Miva, so this runs on your PC. Sign in to the Architectural Depot Miva admin first (www.architecturaldepot.com/mm5/admin.mvc), make sure Claude in Chrome is connected, then paste everything in the box below into Claude on your PC.

What gets uploaded: [g5q1-16-miva-faq-blocks.html](g5q1-16-miva-faq-blocks.html). It has 7 ready-to-paste blocks, one per category: the FAQ in HTML plus FAQPage schema. The text is the fact-checked FAQ doc from Nov 6, with one change: the install answers no longer say "watch the video on this page", because those pages don't have the video yet.

```
Add FAQ content to 7 category pages in the Architectural Depot Miva admin. Brody approved exactly this on Nov 9, 2026: add these FAQ blocks to these 7 categories. Nothing else.

Source file: https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-09/g5q1-16-miva-faq-blocks.html
Each block runs from "BEGIN <code>" to "END <code>". Paste each block exactly as written. Don't rewrite the copy.

Categories (code = the Miva category code):
wood-beams, faux-log-beams, faux-metal-beams, fireplaces, faux-wood-beam-mantels, fasteners-and-adhesives, adhesives

Step 0. Find the right place. Open the "beams" category in Miva admin (/beams.html already has an FAQ on the live site). Note which field or tab holds that FAQ (for example a category header or footer, a custom field, or a content section) and where on the page it shows. Use that same field on the 7 categories. If the FAQ on /beams.html is not in the category record at all (it's in a template or a page builder), stop and tell me where it is before going on.

For each of the 7 categories, one at a time:
1. Open the category by code. If the code doesn't exist, skip it and tell me (fasteners-and-adhesives is the code from the nav file and may differ).
2. If that field already has an FAQ, don't overwrite it. Skip the category and tell me what's there.
3. Add the block at the end of that field and keep everything already in it. Save.
4. Open the live page (https://www.architecturaldepot.com/<code>.html) and check the FAQ shows once, the layout isn't broken, and there's no other FAQPage schema on the page already (if there is, remove only the <script type="application/ld+json"> part of my block and save again).
5. Don't touch products, prices, category assignments, navigation, redirects or any other field.

Start with wood-beams only and show me a screenshot of the live page. Do the other 6 after I say go.

When done, give me one line per category: added yes/no, which field, live page checked yes/no, anything that needs me.
```

Before you run it:
- Faux Metal Beams: the FAQ says samples are available. g5q1-04 (moving samples off that grid) can land before or after, and the answer is true either way.
- Faux Log and Faux Metal have the thinnest FAQs (the fact checks don't cover their material or sizes). Add a material answer later from the build kit if you want one.
- To undo a page, delete the block between its BEGIN and END comments.
