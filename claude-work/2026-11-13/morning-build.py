import json,re
s=json.load(open('s.json'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-13';NOW='2026-11-13T13:15:00.000Z'
TRI="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJmz33jAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
PUL="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJmz33iAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
for i in ('in1112-1','in1103-2'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
T['in1112-1']['note']="Ethan S. · email · Customers miss that the PVC brackets need painting even though the page says so; Ethan asked you to review the descriptions and the category page. You replied Nov 11 that you'll do it; no follow-up on the thread yet."
people=[{"name":"Daniel M.","taskIds":["in1104-2","in1109-1","in1103-1","in1020-3","in1105-1"]},{"name":"Ethan S.","taskIds":["in1112-1","in1105-3","in1103-2","in1020-4","in1109-3"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1026-2"]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T]
prev=s['days']['2026-11-12']['inbox']['waiting']
waiting=[w for w in prev if w['who']=='Procurement']
if not any(w['who']=='Daniel M.' and 'weight' in w['what'] for w in waiting):
  waiting.append({"who":"Daniel M.","what":"Whether Simon's weight calculator is right for the Heritage U-beams","since":"2026-11-11"})
fyi=["Thursday's sales look low because the order-confirmation emails stopped arriving around 11 AM to noon (AD order numbers ran past 1762060). Same window Claude lost Outlook. Treat Thursday and week to date as understated; NetSuite has the real numbers.",
 "Maneesha Kotagiri confirmed a phone call Tue Nov 17 at 1:00 PM. The reply to her is a draft (not sent) and the Teams invite isn't on your calendar yet.",
 "Regina's Mon 1:00 PM phone screen isn't on your calendar yet, and her \"That works\" reply is still in Drafts.",
 "Your Oct 27 draft to Virginia Arteaga (Dallas College) still has \"[Attach PDFs...]\" in it: finish or delete it.",
 "The triage still lists Daniel's Miva domains, Barron transfer, broken-tools list, Hayden's sheet and the Katherine/Victoria call, but you ticked all of those on your list. Say if any is still owed.",
 "Ryan Shumaker: TimberCraft shutters are 1 1/2\" deep overall (two 3/4\" boards) but the page shows 3/4\"; he suggests showing both.",
 "New Handshake applicant: Pratham Patel (Bentley), E-Commerce.",
 "Lauren is out Fri Dec 4 and Mon Dec 7."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Friday, Nov 13","counts":{"people":11,"other":2,"waiting":len(waiting),"fyi":4,"low":24,"drafts":1},"people":people,"other":["hire1111"],"meetings":[],"recap":{"found":False},"waiting":waiting,"fyi":fyi}
pulse={"found":True,"link":PUL,"label":"Thu vs last Thu. Proxy from order confirmations; NetSuite is the source of truth. Thursday is understated (confirmation emails stopped around noon).","orders":152,"dollars":118577.48,"ordersPrev":385,"dollarsPrev":221073,"ordersPct":-61,"dollarsPct":-46,
 "sites":[{"name":"AD","orders":123,"dollars":105227.23,"pct":-39},{"name":"Ekena","orders":18,"dollars":10574.93,"pct":-68},{"name":"Millwork.com","orders":11,"dollars":2775.32,"pct":-81},{"name":"HomeOver","orders":0,"dollars":0,"note":"$795 last wk"},{"name":"FauxBeams","orders":0,"dollars":0,"note":"$152 last wk"}],
 "flags":["Thursday is incomplete: confirmation emails stopped around 11 AM to noon; AD order numbers ran past 1762060, so the real total is well above 152 orders.","Largest: AD 1761677, $10,777: Timberthane pecky cypress U-beams and an L-beam.","Largest: AD 1761737, $6,087: 4 Fiberthane 700 Bradford balustrade kits and 5 newel posts.","Largest: AD 1761642, $5,374: 2 aluminum Bahama shutters 60x64, black.","1 confirmation for an older order ($913) may double count."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-09","end":"2026-11-12","orders":1368,"dollars":764003.75,"cmpOrders":1576,"cmpDollars":1000266.91,"days":"4/4","partial":False,
  "sites":[{"name":"AD","orders":1092,"dollars":647373.27},{"name":"Millwork.com","orders":126,"dollars":53429.43},{"name":"Ekena","orders":129,"dollars":59246.74},{"name":"HomeOver","orders":16,"dollars":3802.08},{"name":"FauxBeams","orders":5,"dollars":152.24},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW
for c in H['candidates']:
  if c['name']=='Maneesha Kotagiri' and 'Tue Nov 17' not in c['note']:c['note']+=" Nov 12: confirmed a phone call Tue Nov 17, 1:00 PM; reply draft saved (not sent); Teams invite not on the calendar yet."
H['refreshNote']="No college replies; Maneesha Kotagiri confirmed Tue Nov 17, 1:00 PM (invite not sent yet); new Handshake applicant Pratham Patel."
hs=H.get('handshake')
if hs:
  hs['asOf']=NOW;hs.setdefault('notes',[])
  if not any('Pratham' in n for n in hs['notes']):hs['notes'].append("New applicant Nov 12: Pratham Patel (Bentley), E-Commerce.")
for g in s.get('suggestions',[]):
  if g.get('status')=='new' and g.get('day','9')<'2026-11-11':g['status']='expired'
s['suggestionsBuilt']=NOW
s.setdefault('cases',{})['refreshedAt']=NOW
s['bugherd']['refreshedAt']=NOW
for t in s['tasks']:
  r=t.get('receipt')
  if isinstance(r,dict):
    for k in ('did','unsure'):
      if isinstance(r.get(k),str):r[k]=[r[k]]
    if isinstance(r.get('where'),str):r['where']=[{"label":r['where'],"url":""}]
def B(i,st,en,title,sub,**k):
  b={"id":"n13-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):
  return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']]
bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open (0 new, 0 with new comments since yesterday). Do these %d: "%(len(bh),len(bh))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh)
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done']]
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first. Brian sent 1 new alert Nov 12."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
def P(tid,sub):
  n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. You said you're out today; if so, this all moves to Monday. 11 to-dos from key people (most already ticked on your list), 2 other actions (a new case alert and hiring), 1 draft ready (Maneesha). Work them from the Inbox section above.",links=[{"label":"Email: Inbox triage, Nov 13","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Thu $118,577 (incomplete: confirmation emails stopped around noon), -46% vs last Thu. Week to date $764,004, -24%, also understated. Check NetSuite for Thursday's real total. Details in the Sales section above.",links=[{"label":"Email: Sales pulse, Nov 13","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The 9:00 \"Does anyone need anything from me today?\" message goes out from your PC."),
 B(4,"09:00","09:30","Bug Herds — complete 5 (Rock: under 10)",bhsub),
 B(5,"09:30","09:50","Cases — complete 10",cssub),
 B(6,"09:50","10:10","Strety","Daily · 20 min. Week 44 scorecards on both meetings are queued on your PC; check the Strety task for the values."),
 B(7,"10:10","10:40","Send the phone-screen invites: Regina Mon 1:00, Maneesha Tue 1:00","Carried from Thursday. Both replies are still in Drafts and neither Teams invite is on your calendar. From the hiring task.",taskIds=["hire1111"],top=True),
 B(8,"10:40","11:00","Prep the AI Training hour","You run it at 11:00 for Andrew, Hayden, Lauren and Daniel: skills, mods and everyday uses. Pick 2 or 3 live examples."),
 B(9,"11:00","12:00","AI Training","Creative Lounge - Heath, with Andrew, Hayden, Lauren and Daniel. You organize.",meeting=True),
 B(10,"12:30","13:10","Find people to interview","Daily · 40 min. Booked: Ashanti in person Mon 10:00, Regina Mon 1:00, Byron Tue 9:00, Maneesha Tue 1:00. Still yours: Theophilus (on-site works), Gabriel's time, Douglas and Kirsten next steps. New Handshake applicant: Pratham Patel.",taskIds=["t7fp22","w1"],links=[{"label":"Handshake conversations","href":"https://app.joinhandshake.com/emp/conversations"}]),
 B(11,"13:10","13:40","Check the Marketing categories import before running it",P("mc-2026-11-11","Carried from Thursday. NetSuite said an Assembly/BOM import completed Wed 6:08 PM; confirm whether it was the 9,811-row RealGrain BMW file, then Retry or mark it done on its card."),taskIds=["mc-2026-11-11"],top=True),
 B(12,"14:00","15:00","Team Leads Weekly Meeting","Teams, with Daniel, Ethan, Emily, Sam, Garrett, Tory, Jericah and Jordan. Tentative.",meeting=True),
 B(13,"15:00","15:30","Review the PVC Brackets descriptions and category page",P("in1112-1","Carried from Thursday (triage). Ethan is waiting; no follow-up on the thread yet. Claude can do this; give it to Claude from the Tasks tab."),taskIds=["in1112-1"],top=True),
 B(14,"15:45","16:05","Check Merchant Center beam test wave 2",P("abt-w2-0","Carried from Thursday. All 10 wave 2 Heritage beam edits are ready for your check (A/B tests tab)."),taskIds=["abt-w2-0"]),
 B(15,"16:10","16:40","Weekly review","Re-date or drop overdue tasks, check Waiting on, and pick next week's Top 3."),
 B(16,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Tomorrow gets built from this. If there's time: the Heritage Timber inside-opening fix (pushed twice), clearing your unsent drafts, the inaccurate-items previews. Monday: Ashanti's in-person interview 10:00, Regina's phone screen 1:00 (send the invite)."),
]
used={b['id'] for d in s['days'].values() for b in d.get('blocks',[])}|{t['id'] for t in s['tasks']}
for b in blocks:
  assert b['id'] not in used,b['id']
  for i in b.get('taskIds',[]):assert i in T,i
s['today']=TODAY;s['days'][TODAY]={"blocks":blocks,"log":[],"inbox":inbox,"pulse":pulse}
s['updated']=NOW
json.dump(s,open('s2.json','w'));print('ok',len(blocks),{i:pushes(i) for i in['mc-2026-11-11','in1112-1','abt-w2-0','mcf-01','hire1111']})
h=open('b.html').read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open('out.html','w').write(h[:m.start(1)]+nj+h[m.end(1):])
