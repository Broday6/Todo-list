import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-20';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJr8M2%2BAAA%3D";PUL=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJr8M2%2FAAA%3D"
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJYuAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
add(dict(base,id="in1120-1",title="Pick a time for the BigCommerce/Feedonomics call (Mon or Tue; Daniel prefers Mon)",note="Daniel M. · email · \"FW: PCI / BigCommerce Introduction\": Tory offered Mon 10 AM, but you have Hayden's 1:1 at 10:00. Pick another Monday time or Tuesday.",**{"from":"Daniel M."}))
add(dict(base,id="in1120-2",title="Athos paused the AD feed (over 25% product drop): answer Hayden or hand to Tory",note="Hayden Clow · email · \"Fw: Athos Commerce - Indexing Error\": Athos paused the architecturaldepot.com feed and failed on myhomesupply.com. Athos errors are usually Tory's. Your call.",**{"from":"Hayden Clow"}))
add(dict(base,id="in1120-3",title="Decide who takes the 3 ECOM Pending Cases alerts from Brian Thompson (Nov 19)",note="Brian Thompson · email · Alerts at 6:30 AM, 1:00 PM and 1:25 PM CT. Your call.",**{"from":"Brian Thompson"}))
add(dict(base,id="in1120-4",title="Reply to or screen an Indeed E-Com applicant who asked for an update",note="Indeed · email · She followed up asking for an update. Goes with today's hiring block.",**{"from":"Indeed"}))
T={t['id']:t for t in s['tasks']}
for i in ('bq1118-1','in1119-3','in1119-5','in1119-10','in1112-1'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1120-1","in1119-2","in1118-2"]},{"name":"Ethan S.","taskIds":["in1112-1","in1119-10","in1103-2"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1119-3","bq1118-1"]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T and not T[i].get('done')]
waiting=s['days']['2026-11-19'].get('inbox',{}).get('waiting',[])
fyi=["Closed: Ethan sent the approved Black Friday discounts Nov 19: 5% vendor, 10% Ekena, 15% motifs, beams, panels, hardware and balustrade.",
 "Barron/AZ Faux transfer: SharePoint Digital folder access granted, DNS export sent, Justin is building Barron phone queues, hard drive arrives 11/24.",
 "Bridgeline (Hawksearch) wants to meet about Barron and AZ Faux search (you're CC'd).",
 "Security: Daniel's 'New Gmail Account for Barron Designs' email has the password in plain text. Consider changing it and deleting the email.",
 "6 new Indeed applicants yesterday; Daniel says two look like sales fits.",
 "Still in Drafts, not sent: Re: Employer Newsletter and Re: Notes (to Daniel), plus two new ones to Lauren (Whitehall plaque, Mid-America offset shutter cases).",
 "T and L hinges are out of stock; about half arrives early January.",
 "Yesterday's recap: no action items for you. The L-10 transcript is still blocked by a Teams admin setting. Lauren is out today, back Monday."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Friday, Nov 20","counts":{"people":17,"other":7,"waiting":len(waiting),"fyi":47,"low":48,"drafts":0},"people":people,"other":[i for i in ["in1120-2","in1120-3","in1120-4","in1119-5","in1119-6","in1119-7","in1119-8"] if i in T and not T[i].get("done")],"meetings":[],"recap":{"found":True,"subject":"Meeting recap — Thursday, Nov 19","link":RECAP},"waiting":waiting,"fyi":fyi}
sites=[("AD",267,181082.17,72),("Ekena",38,9066.40,-14),("Millwork.com",16,6469.13,133)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"HomeOver","orders":5,"dollars":1244.57,"note":"$0 last wk"},{"name":"FauxBeams","orders":1,"dollars":42.53,"note":"$0 last wk"}]
pulse={"found":True,"link":PUL,"label":"Thu vs last Thu. Proxy from order confirmations; NetSuite is the source of truth.","orders":327,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":152,"dollarsPrev":118577,"ordersPct":115,"dollarsPct":67,"sites":S,
 "flags":["Last Thu's mail feed was cut off at midday, so the +67% is inflated. NetSuite has the real Nov 12 total.","Largest: AD 1764827, $27,469: 20 Craftsman PVC column wrap kits.","Largest: AD 1764855, $10,806: knotty alder U-beams and 28 beam hanger plates.","Largest: AD 1764998, $10,006: 72 EverStone faux aged brick panels, beams and mantels.","1 confirmation for an older order ($2,435) may double count. PacificColumns, BuyManufacturers and MyHomeSupply again returned no emails."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-16","end":"2026-11-19","orders":1475,"dollars":885474.72,"cmpOrders":1368,"cmpDollars":764003.76,"days":"4/4","partial":False,
  "sites":[{"name":"AD","orders":1177,"dollars":747392.90},{"name":"Millwork.com","orders":118,"dollars":65112.79},{"name":"Ekena","orders":154,"dollars":67886.10},{"name":"HomeOver","orders":20,"dollars":4845.73},{"name":"FauxBeams","orders":6,"dollars":237.20},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="6 new Indeed applicants Nov 19 (Daniel: two look like sales fits); One Indeed applicant asked for an update. Handshake checked Nov 19, 2:33 PM: nothing new; two Handshake candidates waiting since Nov 10."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n20-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. 17 to-dos from key people (1 new: the BigCommerce call time), 7 other actions, 0 drafts ready. Work them from the Inbox section above.",links=[{"label":"Email: Inbox triage, Nov 20","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Thu $197,905 (327 orders), +67% vs last Thu, but last Thu's feed was cut off so that's inflated. Week to date $885,475, +16% (+8% orders). Details in the Sales section above.",links=[{"label":"Email: Sales pulse, Nov 20","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The check-in goes from your PC. Lauren is out today."),
 B(4,"09:00","10:30","Barron: upload the first items to the new store","Top priority until Dec 2; carried from yesterday. Upload the items you picked, and tell Tory which SKUs can go in now so Paul and Milan can test search and product pages. Keep Barron's copy and URLs. Ask Ethan first whether the hold on new images is lifted.",taskIds=["bq1118-1","in1119-3","in1119-10"],top=True),
 B(5,"10:30","10:50","Athos paused the AD feed: answer Hayden or hand to Tory","Athos paused the architecturaldepot.com feed (over 25% product drop) and failed on myhomesupply.com. From the triage.",taskIds=["in1120-2"]),
 B(6,"10:50","11:00","Pick a time for the BigCommerce/Feedonomics call","Mon or Tue; Daniel prefers Monday. Mon 10:00 clashes with Hayden's 1:1.",taskIds=["in1120-1"]),
 B(7,"11:00","12:00","AI Training","Creative Lounge - Heath. You run it: use cases, skills and mods.",meeting=True),
 B(8,"12:00","12:30","Thanksgiving potluck","From the week plan (not on your calendar).",meeting=True),
 B(9,"12:30","13:30","Find people to hire: new applicants","6 new Indeed applicants yesterday (Daniel says two look like sales fits). One Indeed applicant asked for an update. Two Handshake candidates have waited since Nov 10.",taskIds=["bq1119-2","w1","in1120-4"],top=True),
 B(10,"13:30","14:00","Black Friday emails: final check","Ethan approved the discounts (5% vendor, 10% Ekena, 15% motifs, beams, panels, hardware and balustrade). Check the TEST emails match them. First sale email goes Wed 11/25.",top=True),
 B(11,"14:00","15:00","Team Leads Weekly Meeting","Teams. Tentative.",meeting=True),
 B(12,"15:00","15:30","Review the PVC Brackets descriptions and category page",P("in1112-1","Moved from Thursday. Copy is drafted in the repo; one question: do they ship primed or unfinished? Ryan says unfinished."),taskIds=["in1112-1"]),
 B(13,"15:30","15:50","Fix ARR100TRWR06 on AD: gloss white vs textured","Carried from yesterday. Jericah flagged it as high importance; 07 may be flipped.",taskIds=["in1119-5"]),
 B(14,"15:50","16:10","Cases — complete 10",cssub),
 B(15,"16:10","16:40","Weekly review","Re-date or drop overdue tasks, check Waiting on, and pick next week's Top 3. Due today and not scheduled: the 10 wrong facts on beam and mantel pages, and the web dev template list.",taskIds=["g5q1-08","g5q1-09"]),
 B(16,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Bug Herds and Strety are off today for your five-focus plan. Monday: Hayden's 1:1 at 10:00 (new format: top 3 competitors), Lauren is back, and the BigCommerce call once you pick a time."),
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
