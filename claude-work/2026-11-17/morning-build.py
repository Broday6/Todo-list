import json,re,sys
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-17';NOW='2026-11-17T13:20:00.000Z'
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
TRI="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJUdAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
PUL="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJUbAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
BAR={"uri":"mail:///messages/AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU_Hcc2AAAAAAEMAABCgVnAZCBUTa752dU_Hcc2AAJoyJUQAAA%3D","link":"https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJUQAAA%3D&exvsurl=1&viewmodel=ReadMessageItem","subject":"Re: PCI/Ekena & Barron?","from":"Tory Kepler","on":"2026-11-16T23:37:54Z","dom":"pcienterprises.com"}
archived={a['id'] for a in s.get('doneArchive',[])}
new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
add({"id":"in1117-1","group":"inbox","title":"Lead the Barron and AZ Faux transfer with Tory: one checklist, one contact, sync today","note":"Daniel M. / Tory K. · email · The deal is funded (wire sent Nov 16). Daniel named you and Tory as leads and will connect you with McKenzie's Pam Wesson and Laz Felix. Tory sent Barron Transfer.xlsx and wants one checklist, one main contact, and a quick sync this morning. One Braintree merchant account, DBA \"Barron Designs\", for both sites.","due":TODAY,"done":False,"from":"Daniel M.","draft":False,"since":"2026-11-16","source":"triage 2026-11-17","mail":BAR})
add({"id":"in1117-2","group":"inbox","title":"Pick what goes on the new Barron Miva store from barron and azfauxbeams","note":"Tory K. · email · The E-com team now has access to the new Barron Miva store and Paul copied the categories. Upload whichever items we want to offer from barron.pcienterprises.com and azfauxbeams.pcienterprises.com.","due":TODAY,"done":False,"from":"Tory K.","draft":False,"since":"2026-11-16","source":"triage 2026-11-17","mail":BAR})
add({"id":"in1117-3","group":"inbox","title":"Review the Wall Accent catalog category PDF for Melissa (204 pages, skip Wainscot)","note":"Melissa Conklin · email · Hayden is To and you're named. Comment in Acrobat and save a new version in the same folder.","due":"2026-11-19","done":False,"from":"Melissa Conklin","draft":False,"since":"2026-11-16","source":"triage 2026-11-17"})
add({"id":"in1117-4","group":"inbox","title":"Confirm the paused Ekena feed indexing in Athos (product count fell more than 25%)","note":"Athos Commerce · email · ekenamillwork.com indexing is paused until someone confirms the drop is expected; myhomesupply.com failed again. Website back end is Tory's area; check with him before confirming.","due":TODAY,"done":False,"from":"Athos Commerce","draft":False,"since":"2026-11-16","source":"triage 2026-11-17"})
T={t['id']:t for t in s['tasks']}
for i in ('in1112-1','in1103-2'):
  if not T[i].get('done'):T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1117-1","in1104-2","in1103-1","in1020-3","in1105-1"]},{"name":"Ethan S.","taskIds":["in1112-1","in1109-3","in1105-3","in1103-2","in1020-4"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1117-2","in1026-2"]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T]
waiting=s['days']['2026-11-16'].get('inbox',{}).get('waiting',[])
fyi=["Ashanti's interview moved to today 12:00 (she didn't come Monday at 10). The calendar invite is updated, but the email you sent her said Monday 10 AM, so make sure she knows it's today.",
 "\"Offer out\" got ticked yesterday when the Ashanti debrief block was ticked, but no offer went out. Re-open it if you want it tracked.",
 "Regina: you passed after Monday's call. Lybah and Daniela still need the Handshake phone-screen message.",
 "BugHerd #9080: BMSTRF03X144TRBL is cheaper on Ekena than on the e-com sites; Tory says the NetSuite List Price is too low. Your call on who fixes it.",
 "Case 0982536 (CW Ohio, drawing clarification, Home Depot order) is assigned to you; the Cases job adds it.",
 "Barron: Robert says the deal is funded and Daniel takes point; Barron Designs was featured on HGTV's Fixer to Fabulous.",
 "Hayden's Strety check-in: $84,966 total growth (Siding $41,289, Decorative $18,995, Wall Accents $13,323, Ceiling $11,359).",
 "Your Nov 13 draft to Maneesha is still in Drafts (the confirmation already went out Monday); delete it."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Tuesday, Nov 17","counts":{"people":12,"other":4,"waiting":len(waiting),"fyi":15,"low":55,"drafts":0},"people":people,"other":["in1117-3","in1117-4"],"meetings":[],"recap":{"found":False},"waiting":waiting,"fyi":fyi}
pulse={"found":True,"link":PUL,"label":"Mon vs last Mon. Proxy from order confirmations; NetSuite is the source of truth.","orders":428,"dollars":246677.02,"ordersPrev":421,"dollarsPrev":270089,"ordersPct":2,"dollarsPct":-9,
 "sites":[{"name":"AD","orders":340,"dollars":195020.47,"pct":-18},{"name":"Ekena","orders":40,"dollars":27803.65,"pct":27},{"name":"Millwork.com","orders":43,"dollars":22788.92,"pct":150},{"name":"HomeOver","orders":3,"dollars":978.28,"pct":26},{"name":"FauxBeams","orders":2,"dollars":85.70,"note":"$96 last wk"}],
 "flags":["Largest: AD 1763509, $13,860: 4 mahogany 12\" x 8' tapered columns with Tuscan base and capital.","Largest: AD 1763314, $12,569: Timberthane rough cedar 14\" column wraps.","Largest: Millwork.com 1302403022, $6,214: TrueCraft PVC gable vents.","AD dollars -18% on about the same orders (340 vs 337): smaller orders; last Mon had a $14K order.","2 $0 sample orders; 3 confirmations for older orders ($289) may double count."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-16","end":"2026-11-16","orders":428,"dollars":246677.02,"cmpOrders":421,"cmpDollars":270089.45,"days":"1/1","partial":False,
  "sites":[{"name":"AD","orders":340,"dollars":195020.47},{"name":"Millwork.com","orders":43,"dollars":22788.92},{"name":"Ekena","orders":40,"dollars":27803.65},{"name":"HomeOver","orders":3,"dollars":978.28},{"name":"FauxBeams","orders":2,"dollars":85.70},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="No college replies; today: Byron 9:00, Ashanti in person 12:00 (moved from Mon), Maneesha 1:00; Regina passed Monday; Lybah and Daniela still need a Handshake reply."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
wp=s.get('weekPlan')
if wp and not any(p.get('id')=='p-barron' for p in wp.get('projects',[])):
  wp['projects'].insert(1,{"id":"p-barron","name":"Barron and AZ Faux transfer","status":"Funded, transfer starting","tone":"bad","why":"PCI closed the Barron purchase Nov 16. Daniel wants you and Tory to lead the transfer fast.","next":["Sync with Tory; one checklist (Barron Transfer.xlsx) and one main contact","Meet McKenzie's Pam Wesson and Laz Felix when Daniel connects you","Pick the items for the new Barron Miva store"],"taskIds":["in1117-1","in1117-2"],"due":TODAY})
def B(i,st,en,title,sub,**k):
  b={"id":"n17-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+". Also new: #9080 (Ekena price lower than e-com; NS List Price)."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done']];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub="Daily · 20 min. %d open from search 16559: %s, plus new 0982536 (CW Ohio). Root-cause emails go to the category leader."%(len(cs),", ".join(t['id'][2:] for t in cs))
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. 12 to-dos from key people (2 new, both Barron), 4 other actions (case alert, Melissa's catalog PDF, BugHerd #9080, Athos feed). Work them from the Inbox section above.",links=[{"label":"Email: Inbox triage, Nov 17","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Mon $246,677, -9% vs last Mon (428 orders, +2%). AD -18% (smaller orders), Millwork.com +150%, Ekena +27%. Details in the Sales section above.",links=[{"label":"Email: Sales pulse, Nov 17","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The check-in goes from your PC. Hayden didn't answer yesterday's."),
 B(4,"09:00","09:30","Phone interview: Byron Brown","Teams. Tier A (UNT).",meeting=True),
 B(5,"09:30","10:00","Barron transfer: sync with Tory","Daniel named you and Tory as leads (\"move forward FAST\"). Tory wants one checklist (Barron Transfer.xlsx) and one main contact, and a sync this morning. Agree who owns what, then reply on the thread.",taskIds=["in1117-1"],top=True),
 B(6,"10:00","11:00","G5: Miva one-product category test, then the 33-product cleanup","This week's Tuesday focus. Files are in beams-mantels-audit/out/miva/: test BMSTRPS_P with Overwrite Product Category Assignments, check it in Miva admin, then run the full file.",taskIds=["g5q1-03"],top=True),
 B(7,"11:00","12:00","PPC Ad Review","Creative Lounge - Heath, with Lauren, Daniel, Hayden, James, Andrew and the E-Com team. The Power Hour at 11 is canceled.",meeting=True),
 B(8,"12:00","13:00","Ashanti Yow - Interview","Creative Lounge - Heath, in person, moved from Monday. Daniel, Alejandra, Ethan, Hayden, Lauren and Andrew are on the invite. Your email to her said Monday 10 AM, so confirm she knows.",meeting=True),
 B(9,"13:00","13:30","Phone interview: Maneesha Kotagiri","Teams. Tier A: 8 years of Shopify, Amazon, Walmart and Magento listings. Ask about the gap since Aug 2025 and whether her California jobs were remote.",meeting=True),
 B(10,"13:30","13:50","Hiring decision: Ashanti, Byron, Maneesha","Pick who moves on and whether an offer goes out this week. Then paste the phone-screen message to Lybah and Daniela in Handshake.",taskIds=["hire1116"],top=True),
 B(11,"14:00","14:30","Andrew X Brody Weekly Sync","Teams. Tentative.",meeting=True),
 B(12,"14:30","15:00","Review the PVC Brackets descriptions and category page",P("in1112-1","Ethan has waited since Nov 11. Claude can do this; give it to Claude from the Tasks tab."),taskIds=["in1112-1"]),
 B(13,"15:00","15:30","Bug Herds — complete 5 (Rock: under 10)",bhsub),
 B(14,"15:30","15:50","Cases — complete 10",cssub),
 B(15,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. If there's time: Set the week and Clean up the board (both carried from Monday), the Barron store item list, Melissa's catalog PDF (due Thu). Tomorrow: Product Category Group Meetings 9:30 (tentative); focus is Black Friday (Advaning pricing, the AD email); beam test 2-week check."),
]
used={b['id'] for d in s['days'].values() for b in d.get('blocks',[])}|{t['id'] for t in s['tasks']}
for b in blocks:
  assert b['id'] not in used,b['id']
  for i in b.get('taskIds',[]):assert i in T,i
for t in s['tasks']:
  r=t.get('receipt')
  if isinstance(r,dict):
    for k in ('did','unsure'):
      if isinstance(r.get(k),str):r[k]=[r[k]]
    if isinstance(r.get('where'),str):r['where']=[{"label":r['where'],"url":""}]
s['today']=TODAY;s['days'][TODAY]={"blocks":blocks,"log":[],"inbox":inbox,"pulse":pulse};s['updated']=NOW
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(sys.argv[2],'w').write(h[:m.start(1)]+nj+h[m.end(1):]);print('ok',new,pushes('in1112-1'))
