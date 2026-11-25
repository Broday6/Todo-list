import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
for t in s['tasks']:t.setdefault('done',False)
T={t['id']:t for t in s['tasks']}
TODAY='2026-11-25';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJvVkxLAAA%3D";PUL=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJvQ1J2AAA%3D"
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs692XAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
add(dict(base,id="in1125-1",title="Criteo: approve or decline raising the Lower Funnel budget",note="Mallory MacDonald (Criteo) · email · \"Budget Approval Onsite Trends\": asks to raise the Lower Funnel budget (42% growth, 4% COS vs a 7% target). Your call. Goes with your Criteo task.",**{"from":"Criteo"}))
add(dict(base,id="in1125-2",title="Give Hayden your thoughts on his vinyl siding A+ content",note="Hayden Clow · email · \"Fall Is Color-Picking Season\": wants your and Daniel's thoughts.",**{"from":"Hayden Clow"}))
add(dict(base,id="in1125-3",title="Answer Hayden on Builder's Edge case 0983897: was it an old order?",note="Hayden Clow · email · He says the item is no longer on the site.",**{"from":"Hayden Clow"}))
add(dict(base,id="in1125-4",title="Find a fix for the two One Inch Increment issues on the BMUH Heritage Beams builder",note="Cody Meixner / Tory K. · email · \"One Inch Increment\": two issues with the builder; you said you'd find a solution.",**{"from":"Cody Meixner"}))
add(dict(base,id="in1125-5",title="Give interview times to the Indeed applicants who replied (one proposes today 2:45 PM)",note="Indeed · email · Several applicants replied with times (today 2:45 PM; Tue/Thu or Wed after 1:30; Mon Nov 30) and two confirmed they can work on site. About 17 new applicants.",**{"from":"Indeed"}))
add(dict(base,id="in1125-6",title="Respond to the BigCommerce invite for Wed Dec 2, 2:30 to 4:00 PM",note="Christopher Luca (BigCommerce) · calendar invite.",due="2026-11-30",**{"from":"BigCommerce"}))
T={t['id']:t for t in s['tasks']}
for i in ('in1124-2','in1124-3','in1119-6'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1119-2","in1118-4"]},{"name":"Ethan S.","taskIds":["in1103-2"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":[]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T and not T[i].get('done')]
waiting=[]
fyi=["Barron: Tory is making the store live today (you said the products are good to go).",
 "Garrett confirmed the next in-person interview for Mon Nov 30, 11:30 AM.",
 "Daniel: Barron's phone number, social and domain transfers are moving; Christina H. will help Barron customers once the numbers move. Daniel is out for a doctor's appointment today.",
 "Ryan: the AmeriCraft shutter spec sheets are fixed and ready to upload.",
 "Ethan: use the sample dimensions for the faux stone dimension fix.",
 "Search Console flagged a new Merchant listings issue on millwork.com.",
 "Heads-up: a ChatGPT login code was forwarded to the esm.team and cncorders mailing lists.",
 "No meeting recap came yesterday."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Wednesday, Nov 25","counts":{"people":14,"other":10,"waiting":len(waiting),"fyi":15,"low":45,"drafts":0},"people":people,"other":[i for i in ["in1119-6","in1125-1","in1125-5","in1125-4","in1125-2","in1125-3","in1125-6","in1124-2","in1124-3","in1120-3"] if i in T and not T[i].get("done")],"meetings":[],"recap":{"found":False},"waiting":waiting,"fyi":fyi}
sites=[("AD",253,177652.10,5),("Millwork.com",21,17974.49,-36),("Ekena",16,3700.52,-74),("HomeOver",5,1569.01,-27)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"FauxBeams","orders":0,"dollars":0,"note":"$81 last wk"}]
pulse={"found":True,"link":PUL,"label":"Tue vs last Tue. Proxy from order confirmations; NetSuite is the source of truth.","orders":295,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":353,"dollarsPrev":213956,"ordersPct":-16,"dollarsPct":-6,"sites":S,
 "flags":["Ekena: 16 orders vs 38 last Tue (-74%). Check the store or the confirmation emails. Millwork.com also down (21 vs 31).","Largest: AD 1766659, $13,540: 22 pairs of EnduraCore raised panel shutters with French cleat kits.","Largest: AD 1766432, $11,156: 9 Endura-Stone 10 in round columns with kits.","Largest: AD 1766560, $6,829: AmeriCraft hand hewn beams and a New River reclaimed mantel.","1 $0 sample order; 2 confirmations for older orders ($667) may double count."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-23","end":"2026-11-24","orders":637,"dollars":374838.90,"cmpOrders":781,"cmpDollars":460632.65,"days":"2/2","partial":False,
  "sites":[{"name":"AD","orders":517,"dollars":311999.87},{"name":"Millwork.com","orders":63,"dollars":33164.43},{"name":"Ekena","orders":48,"dollars":25393.90},{"name":"HomeOver","orders":8,"dollars":4241.62},{"name":"FauxBeams","orders":1,"dollars":39.08},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="Several Indeed applicants replied with interview times (one proposes today 2:45 PM); about 17 new applicants. The in-person interview is confirmed for Mon Nov 30, 11:30 AM."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n25-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. 14 to-dos from key people (none new), 10 other actions, 0 drafts. Work them from the Inbox page.",links=[{"label":"Email: Inbox triage, Nov 25","href":TRI}]),
 B(2,"08:20","09:30","Barron: final content check before it goes live","Top priority until Dec 2. Tory is making the store live today, so check the key pages, categories, specs and prices first. Keep Barron's copy, titles and URLs. Then the One Inch Increment builder issues if there's time.",taskIds=["br1117-6","in1125-4"],top=True),
 B(3,"09:30","12:00","Product Category Group Meetings: Leadership","Creative Lounge - Heath. Tentative.",meeting=True),
 B(4,"12:00","12:20","Review daily metrics & KPIs","Daily · 20 min. Tue $200,896 (295 orders), -6% vs last Tue. AD +5%, but Ekena -74% (16 orders vs 38): check the store. Week to date -19%.",links=[{"label":"Email: Sales pulse, Nov 25","href":PUL}]),
 B(5,"12:20","12:40","Team check-in","Daily · 20 min. The check-in goes from your PC."),
 B(6,"13:10","13:40","Black Friday: first sale email goes out today","Confirm it sent and looks right (more TEST sends came in yesterday morning). Watch Tory's Black Friday hero images on AD.",top=True),
 B(7,"13:40","14:10","Andrew's Balustrade Designer feedback (due today)","Ryan adds the wall should be there by default, post or not.",taskIds=["in1119-6"]),
 B(8,"14:10","14:40","Hiring: answer the Indeed applicants' times","One proposes a call today at 2:45 PM; others offered Tue/Thu, Wed after 1:30, or Mon Nov 30. About 17 new applicants.",taskIds=["in1125-5","bq1119-2"],top=True),
 B(9,"14:40","15:00","Criteo: Lower Funnel budget ask","Approve or decline. They report 42% growth at a 4% COS vs a 7% target. Your call.",taskIds=["in1125-1"]),
 B(10,"15:00","15:30","Bug Herds — complete 5 (Rock: under 10)",bhsub+" #9097 is still yours."),
 B(11,"15:30","15:50","Cases — complete 10",cssub+" Hayden asked if Builder's Edge 0983897 was an old order.",taskIds=["in1125-3"]),
 B(12,"15:50","16:10","Strety","Daily · 20 min."),
 B(13,"16:10","16:40","Small asks","Melissa's Wall Accent URLs and Shutter catalog review, Hayden's vinyl siding A+ content, and the BigCommerce Dec 2 invite.",taskIds=["in1124-2","in1124-3","in1125-2","in1125-6"]),
 B(14,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Tomorrow is Thanksgiving: the L-10 at 11:00 is still on your calendar (cancel it if the office is closed); Daniel is at Clarksville. Friday: AI Training 11:00, Team Leads 2:00."),
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
