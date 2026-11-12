import json,re
s=json.load(open('s.json'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-12';NOW='2026-11-12T13:20:00.000Z'
TRI="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJlpLnBAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
PUL="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJlpLnAAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
REC="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEPAABCgVnAZCBUTa752dU%2BHcc2AAJlpY31AAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
ETH={"uri":"mail:///messages/AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU_Hcc2AAAAAAEMAABCgVnAZCBUTa752dU_Hcc2AAJlpLmlAAA%3D","link":"https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJlpLmlAAA%3D&exvsurl=1&viewmodel=ReadMessageItem","subject":"RE: 03-4216598/Div 5","from":"Ethan Sellek","on":"2026-11-11T19:43:17Z","dom":"pcienterprises.com"}
archived={a['id'] for a in s.get('doneArchive',[])}
new=[]
if 'in1112-1' not in T and 'in1112-1' not in archived:
  t={"id":"in1112-1","group":"inbox","title":"Review and update the PVC Brackets descriptions and category page content","note":"Ethan S. · email · Customers miss that the PVC brackets need painting even though the page says so; Ethan asked you to review the descriptions and the category page. You replied Nov 11 that you'll do it.","due":TODAY,"done":False,"from":"Ethan S.","draft":False,"since":"2026-11-11","source":"triage 2026-11-12","mail":ETH,"reply":{"state":"replied","at":"2026-11-11T20:21:12Z","subject":"Re: 03-4216598/Div 5"},
     "claudeCan":{"how":"Pull the PVC bracket descriptions and the category page text, and draft clearer 'paint required' wording for you to review, saved in this task's thread.","steps":["Read Ethan's email thread (RE: 03-4216598/Div 5) for what customers missed.","Read the PVC Brackets category page and a few bracket product pages on ArchitecturalDepot.com.","Draft new description lines and category copy that say plainly the brackets ship primed and must be painted.","Post the draft in this task's thread; any NetSuite description change waits for your OK."]}}
  s['tasks'].append(t);new.append(t['id'])
T={t['id']:t for t in s['tasks']}
T['in1103-2']['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1104-2","in1109-1","in1103-1","in1020-3","in1105-1"]},{"name":"Ethan S.","taskIds":["in1112-1","in1105-3","in1103-2","in1020-4","in1109-3"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1026-2"]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T]
waiting=s['days']['2026-11-11']['inbox']['waiting']
pearl={"who":"Procurement","what":"Pearl Mantels shelves and surrounds on AD for fireplace season","since":"2026-11-06"}
if not any('Pearl' in w['what'] for w in waiting):waiting=waiting+[pearl]
fyi=["Checked against your mailbox: these are still in Drafts, not sent: the \"That works\" reply to Regina (Mon 1:00 PM), the Custom Quoting quote-tool note to Daniel (Nov 11), and the Nov 11 notes to Kirsten, Douglas and Gabriel. The triage says you told Kirsten you'd be in touch; that is a draft. Your Nov 11 reply to Ethan on the PVC brackets was sent.",
 "Drafts not sent: about 30 older than a day (Regina, Daniel, Kirsten, Douglas, Gabriel, Hiring and older ones). They're listed on the drafts task.",
 "NetSuite emailed at 6:08 PM Wed that an Assembly/BOM import (import.csv) completed. Check whether that was the 9,811-row Marketing categories file before running it again.",
 "Pending Cases: 3 more alerts from Brian on Nov 11; case 0981120 (Mid-America) is yours. The Cases block covers them.",
 "Indeed: Theophilus Ewunuga and Angelica Rodriguez said on-site in Heath works; Maneesha and Gabriel still need a phone-screen time from your slots. On the hiring task.",
 "Daniel hasn't confirmed Simon's Heritage U-beam weights yet.",
 "Ryan Shumaker: Mid-America vents sold at qty 1 against a minimum of 20; you said the item is already inactive.",
 "Suspicious: an outside Gmail user asked for access to the Wayfair-MouldingTrim_Not_Live_Items sheet through esm.team. Don't approve unless you know them."]
recap={"found":True,"subject":"Meeting recap — Wednesday, Nov 11","link":REC}
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Thursday, Nov 12","counts":{"people":6,"other":5,"waiting":len(waiting),"fyi":26,"low":36,"drafts":0},"people":people,"other":["hire1111"],"meetings":[],"recap":recap,"waiting":waiting,"fyi":fyi}
pulse={"found":True,"link":PUL,"label":"Wed vs last Wed. Proxy from order confirmations; NetSuite is the source of truth.","orders":396,"dollars":162607.46,"ordersPrev":382,"dollarsPrev":269668,"ordersPct":4,"dollarsPct":-40,
 "sites":[{"name":"AD","orders":310,"dollars":132787.75,"pct":-36},{"name":"Ekena","orders":39,"dollars":16767.44,"pct":-62},{"name":"Millwork.com","orders":41,"dollars":11092.20,"pct":76},{"name":"HomeOver","orders":4,"dollars":1917.90,"note":"$157 last wk"},{"name":"FauxBeams","orders":2,"dollars":42.17,"note":"$10,109 last wk"}],
 "flags":["AD dollars -36% on about the same orders (310 vs 300): last Wed had a $24,964 order and a $10,054 FauxBeams order; this Wed's largest is $6,345.","Largest: AD 1761238, $6,345: TrueCraft PVC crown and flat utility moulding, chair rail, 7 pairs EnduraCore louver shutters.","Largest: Ekena 2101338357, $4,904: EnduraCore flat panel shutters and 4 SteelTek hinge kits.","Largest: AD 1761398, $4,478: 10 Heritage Timber 3-sided beams, Kona Brown.","3 $0 sample orders; 2 confirmations for older order numbers ($420) may double count.","No emails again for the Other sites (PacificColumns, BuyManufacturers, MyHomeSupply); possible search miss."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-09","end":"2026-11-11","orders":1216,"dollars":645426.28,"cmpOrders":1191,"cmpDollars":779193.73,"days":"3/3","partial":False,
  "sites":[{"name":"AD","orders":969,"dollars":542146.04},{"name":"Millwork.com","orders":115,"dollars":50654.11},{"name":"Ekena","orders":111,"dollars":48671.81},{"name":"HomeOver","orders":16,"dollars":3802.08},{"name":"FauxBeams","orders":5,"dollars":152.24},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW
H['refreshNote']="No college replies; Theophilus Ewunuga said on-site works (Indeed); new Handshake applicants Addie Nguyen and Taylor Drawert; Ashanti's in-person interview is on the calendar for Mon Nov 16, 10:00."
hs=H.get('handshake')
if hs:
  hs['asOf']=NOW
  hs.setdefault('notes',[]);hs['notes']=[n for n in hs['notes'] if not n.startswith('New applicants Nov 11')]+["New applicants Nov 11: Addie Nguyen (Michigan State), Taylor Drawert (Baylor), both E-Commerce."]
for g in s.get('suggestions',[]):
  if g.get('status')=='new' and g.get('day','9')<'2026-11-10':g['status']='expired'
s['suggestionsBuilt']=NOW
s.setdefault('cases',{})['refreshedAt']=NOW
s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n12-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']]
bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open (0 new, 0 with new comments since yesterday). Do these %d: "%(len(bh),len(bh))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh)
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done']]
cssub="Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first. Brian sent 3 more alerts Nov 11; 0981120 (Mid-America) is yours."%(len(cs),", ".join(t['id'][2:] for t in cs))
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. You told the team you may be out today; if so, this plan waits. 6 to-dos from key people (1 new: Ethan's PVC Brackets), 5 other actions (all hiring and cases), 0 drafts ready. Work them from the Inbox section above.",links=[{"label":"Email: Inbox triage, Nov 12","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Wed $162,607, -40% vs last Wed (396 orders, +4%). AD -36% and Ekena -62% (last Wed had two big orders); Millwork.com +76%. Week to date $645,426, -17%. Details in the Sales section above.",links=[{"label":"Email: Sales pulse, Nov 12","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The 9:00 \"Does anyone need anything from me today?\" message goes out from your PC. Lauren leaves at 12:30 today."),
 B(4,"09:00","09:30","Bug Herds — complete 5 (Rock: under 10)",bhsub),
 B(5,"09:30","09:50","Cases — complete 10",cssub),
 B(6,"09:50","10:10","Strety","Daily · 20 min. Week 44 scorecards on both meetings are queued on your PC; check the Strety task for the values."),
 B(7,"10:10","10:30","Send Regina the Teams invite for Mon 1:00 and send her 'That works' reply","She picked Mon Nov 16, 1:00 PM. The reply is still in Drafts, and the invite isn't on your calendar yet. From the hiring task.",taskIds=["hire1111"],top=True),
 B(8,"10:30","11:00","Check the Marketing categories import before running it","NetSuite says an Assembly/BOM import completed at 6:08 PM Wed. Confirm whether that was the 9,811-row RealGrain BMW file, then Retry or mark it done on its card.",taskIds=["mc-2026-11-11"],top=True),
 B(9,"11:00","12:00","E-Commerce L-10","Creative Lounge - Heath and Teams, with Cook, Lauren, Daniel, Ethan, Hayden and Andrew. The Power Hour at the same time is canceled.",meeting=True),
 B(10,"12:30","13:10","Find people to interview","Daily · 40 min. Indeed: Theophilus Ewunuga and Angelica Rodriguez said on-site works (phone screen or not?); Maneesha and Gabriel need a time from your slots; Douglas and Kirsten answered the follow-up. Handshake: new applicants Addie Nguyen and Taylor Drawert. Booked: Ashanti in person Mon 10:00, Regina Mon 1:00, Byron Tue 9:00.",taskIds=["t7fp22","w1"],links=[{"label":"Handshake conversations","href":"https://app.joinhandshake.com/emp/conversations"}]),
 B(11,"13:10","13:40","Review the PVC Brackets descriptions and category page","From today's triage. Ethan says customers miss that the brackets must be painted; you told him you'd update the copy. Claude can do this; give it to Claude from the Tasks tab.",taskIds=["in1112-1"],top=True),
 B(12,"14:00","14:20","Check Merchant Center beam test wave 2","All 10 wave 2 Heritage beam edits were done Nov 11 and are ready for your check (A/B tests tab).",taskIds=["abt-w2-0"]),
 B(13,"14:20","14:50","Fix the Heritage Timber inside-opening mismatch (feed vs website)","Carried from Wednesday (the one block not ticked). Merchant Center work on your PC.",taskIds=["mcf-01"]),
 B(14,"15:10","15:40","Clear your unsent drafts","About 30 drafts never went out, including Daniel's Custom Quoting note and the Nov 11 notes to Kirsten, Douglas and Gabriel. Send, fix or delete.",taskIds=["ms1110-1"]),
 B(15,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Tomorrow gets built from this. If there's time: the inaccurate-items previews (AD 68, Miva 71), Matthew Durham's Drive request, the Ekena return-policy trademark fix. Tomorrow: AI Training 11:00, Team Leads Weekly 2:00 (tentative)."),
]
used={b['id'] for d in s['days'].values() for b in d.get('blocks',[])}|{t['id'] for t in s['tasks']}
for b in blocks:
  assert b['id'] not in used,b['id']
  for i in b.get('taskIds',[]):assert i in T,i
s['today']=TODAY;s['days'][TODAY]={"blocks":blocks,"log":[],"inbox":inbox,"pulse":pulse}
s['updated']=NOW
json.dump(s,open('s2.json','w'));print('ok',new,len(blocks))
# shape fix: receipt lists saved as text crash the Today view
for t in s['tasks']:
  r=t.get('receipt')
  if isinstance(r,dict):
    for k in ('did','unsure'):
      if isinstance(r.get(k),str):r[k]=[r[k]]
    if isinstance(r.get('where'),str):r['where']=[{"label":r['where'],"url":""}]
json.dump(s,open('s2.json','w'));print('shape fixed')
