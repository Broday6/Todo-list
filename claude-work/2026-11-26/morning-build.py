import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
for t in s['tasks']:t.setdefault('done',False)
T={t['id']:t for t in s['tasks']}
TODAY='2026-11-26';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJvVkySAAA%3D";PUL=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJvVkyRAAA%3D"
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs692XAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
add(dict(base,id="in1126-1",title="Switch the manufacturer to Barron (you told Ethan Monday)",note="Ethan S. · Teams (Wed) · You said you'd do it Monday.",due="2026-11-30",**{"from":"Ethan S."}))
add(dict(base,id="in1126-2",title="Send Teams invites to the Indeed applicants who confirmed times",note="Indeed · email · Confirmed: Mon Nov 30 and Wed Dec 2, 1:00 PM; others replied OK. Drop the extra holds for the Dec 2 applicant. About 20 new applicants.",**{"from":"Indeed"}))
add(dict(base,id="in1126-3",title="Reindex architecturaldepot.com/columns.html (content changed)",note="Andrew Gonzalez · Teams · He asked before you leave.",**{"from":"Andrew Gonzalez"}))
T={t['id']:t for t in s['tasks']}
for i in ('in1124-2','in1124-3','in1119-6','in1125-1','in1125-2','in1125-3'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1119-2","in1118-4"]},{"name":"Ethan S.","taskIds":["in1126-1","in1103-2"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":[]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T and not T[i].get('done')]
waiting=[{"who":"Matthew Durham","what":"Adding the 3 Primed ReadyGrain Round beam images (\"Yes sir can do\")","since":"2026-11-25"}]
fyi=["Barron: barrondesigns.com and azfauxbeams.com now point to Miva. Ethan okayed Ekena pricing x1.04 for the beam and mantel builders; Daniel is moving social, ads and phone numbers.",
 "One Inch Increment: Cody's team sets up the missed Barron items early next week (closed for you).",
 "Pacific Columns PO 06-4052718038 isn't for Order Management; Lauren asked procurement to mark the items inactive.",
 "Elite Architectural Products download issue is resolved except two failed exports; Ethan is looping Sam in.",
 "Lauren's Group 4 Claude account move is done; she flags missing skills and the NetSuite import rule.",
 "Daniel flagged the Google December core update. Ethan thanked you for the Barron cheat sheet.",
 "Thanksgiving: Daniel is at Clarksville. No meeting recap came yesterday."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Thursday, Nov 26","counts":{"people":15,"other":8,"waiting":len(waiting),"fyi":21,"low":39,"drafts":0},"people":people,"other":[i for i in ["in1126-2","in1126-3","in1119-6","in1125-1","in1125-6","in1125-2","in1125-3","in1124-2","in1124-3","in1120-3"] if i in T and not T[i].get("done")],"meetings":[],"recap":{"found":False},"waiting":waiting,"fyi":fyi}
sites=[("AD",203,107918.68,-46),("Ekena",23,9853.84,-42),("Millwork.com",18,5362.19,-32),("HomeOver",2,478.32,3)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"FauxBeams","orders":1,"dollars":482.00,"note":"$28 last wk"}]
pulse={"found":True,"link":PUL,"label":"Wed vs last Wed. Proxy from order confirmations; NetSuite is the source of truth.","orders":247,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":367,"dollarsPrev":226937,"ordersPct":-33,"dollarsPct":-45,"sites":S,
 "flags":["All sites well below last Wed; Wed was the day before Thanksgiving.","Largest: AD 1767082, $8,916: 30 Timberthane rough sawn beams.","Largest: AD 1767155, $7,254: Heritage Timber rustic sawn beams, Smokey Brown.","Largest: AD 1767154, $5,588: 3 Timberthane rough sawn beams 264 in.","4 confirmations for older orders ($1,490) may double count. PacificColumns, BuyManufacturers and MyHomeSupply again returned no emails."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-23","end":"2026-11-25","orders":884,"dollars":498933.93,"cmpOrders":1148,"cmpDollars":687569.92,"days":"3/3","partial":False,
  "sites":[{"name":"AD","orders":720,"dollars":419918.55},{"name":"Millwork.com","orders":81,"dollars":38526.62},{"name":"Ekena","orders":71,"dollars":35247.74},{"name":"HomeOver","orders":10,"dollars":4719.94},{"name":"FauxBeams","orders":2,"dollars":521.08},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="Indeed applicants confirmed Mon Nov 30 and Wed Dec 2, 1:00 PM; others replied OK and need Teams invites. About 20 new applicants. In-person interview Mon Nov 30, 11:30 AM."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n26-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Thanksgiving. If you're off today, nothing below is urgent. 15 to-dos from key people (1 new: Ethan's manufacturer switch, which you said is Monday), 8 other actions.",links=[{"label":"Email: Inbox triage, Nov 26","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Wed $124,095 (247 orders), -45% vs last Wed, the day before Thanksgiving. Week to date -27%.",links=[{"label":"Email: Sales pulse, Nov 26","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The check-in goes from your PC."),
 B(4,"09:00","10:30","Barron: check the live store","Top priority until Dec 2. Both Barron domains now point to Miva: click through the key pages and builders (Ekena price x1.04 on beams and mantels). The manufacturer switch is set for Monday.",taskIds=["br1117-6","in1126-1"],top=True),
 B(5,"10:30","11:00","Hiring: send the Teams invites","Applicants confirmed Mon Nov 30 and Wed Dec 2, 1:00 PM; others replied OK. Drop the extra Dec 2 holds.",taskIds=["in1126-2"],top=True),
 B(6,"11:00","12:00","E-Commerce L-10","Creative Lounge - Heath. You run it. It's still on the calendar on Thanksgiving; cancel it if the office is closed.",meeting=True),
 B(7,"13:00","13:30","Black Friday: check the sale is live","The first sale email went out yesterday; Black Friday is tomorrow. Check the AD hero images and the sale pages.",top=True),
 B(8,"13:30","14:00","Overdue asks","Andrew's Balustrade Designer feedback (was due yesterday) and Criteo's Lower Funnel budget ask (your call).",taskIds=["in1119-6","in1125-1"]),
 B(9,"14:00","14:30","Bug Herds — complete 5 (Rock: under 10)",bhsub+" New comment on #8988: add a Sales inquiries section."),
 B(10,"14:30","14:50","Cases — complete 10",cssub+" A new case alert needs a category leader; Hayden asked if Builder's Edge 0983897 was an old order.",taskIds=["in1125-3"]),
 B(11,"14:50","15:10","Strety","Daily · 20 min."),
 B(12,"15:10","15:50","Small asks","Reindex columns.html for Andrew, Melissa's Wall Accent URLs and Shutter review, Hayden's vinyl siding A+ thoughts, the BigCommerce Dec 2 invite.",taskIds=["in1126-3","in1124-2","in1124-3","in1125-2","in1125-6"]),
 B(13,"15:50","16:10","Clean up the board","Old plan-block tasks are still open: Tasks > Overdue > \"Mark all not needed\"."),
 B(14,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Tomorrow (Black Friday): AI Training 11:00 (you run it), Team Leads 2:00 (tentative), and the Friday weekly review."),
]
for t in s['tasks']:
  t.setdefault('done',False)  # shape fix: a PC-worker task arrived without done
used={b['id'] for d in s['days'].values() for b in d.get('blocks',[])}|{t['id'] for t in s['tasks']}
for b in blocks:
  assert b['id'] not in used,b['id']
  for i in b.get('taskIds',[]):assert i in T,i
s['today']=TODAY;s['days'][TODAY]={"blocks":blocks,"log":[],"inbox":inbox,"pulse":pulse};s['updated']=NOW
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(sys.argv[2],'w').write(h[:m.start(1)]+nj+h[m.end(1):]);print('ok',new,'pvc pushes',pushes('in1112-1'),'bh',len(bh),'cs',len(cs))
