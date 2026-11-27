import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
for t in s['tasks']:t.setdefault('done',False)
T={t['id']:t for t in s['tasks']}
TODAY='2026-11-27';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJvVkywAAA%3D";PUL=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJvVkyvAAA%3D"
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJvVkygAAA%3D"
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs692XAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
T={t['id']:t for t in s['tasks']}
for i in ('in1126-2','in1126-3','in1119-6'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1119-2","in1118-4"]},{"name":"Ethan S.","taskIds":["in1126-1","in1103-2"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":[]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T and not T[i].get('done')]
waiting=[{"who":"Matthew Durham","what":"Adding the 3 Primed ReadyGrain Round beam images (\"Yes sir can do\")","since":"2026-11-25"}]
fyi=["Quiet holiday: no new asks since Thursday; everything below is carried.",
 "Search Console flagged a new Merchant listings structured data issue on homeover.com.",
 "NetSuite alert 11921: item group list prices need updating (also sent to Tory and Andrew).",
 "5 more Indeed applicants since yesterday.",
 "Yesterday's recap: no action items."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Friday, Nov 27","counts":{"people":15,"other":5,"waiting":len(waiting),"fyi":2,"low":25,"drafts":0},"people":people,"other":[i for i in ["in1126-2","in1126-3","in1119-6","in1125-1","in1125-6","in1125-2","in1125-3","in1124-2","in1124-3","in1120-3"] if i in T and not T[i].get("done")],"meetings":[],"recap":{"found":True,"subject":"Meeting recap — Thursday, Nov 26","link":RECAP},"waiting":waiting,"fyi":fyi}
sites=[("AD",92,74042.59,-59),("Millwork.com",13,3608.46,-44),("Ekena",9,1671.04,-82)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"FauxBeams","orders":1,"dollars":447.11,"note":"$43 last wk"},{"name":"HomeOver","orders":0,"dollars":0,"note":"$1,245 last wk"}]
pulse={"found":True,"link":PUL,"label":"Thu vs last Thu (Thanksgiving Day). Proxy from order confirmations; NetSuite is the source of truth.","orders":115,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":327,"dollarsPrev":197905,"ordersPct":-65,"dollarsPct":-60,"sites":S,
 "flags":["Thanksgiving Day. The confirmation feed ran through 11:53 PM, so this is real holiday slowness, not missing mail.","Largest: AD 1767314, $14,268: Fiberthane 700 Legacy balustrade kits.","Largest: AD 1767288, $10,869: 312 dentil blocks, flat trim and crossheads.","Largest: AD 1767236, $5,975: TimberCraft board-n-batten cedar shutters.","PacificColumns, BuyManufacturers and MyHomeSupply again returned no emails."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-23","end":"2026-11-26","orders":999,"dollars":578703.19,"cmpOrders":1475,"cmpDollars":885474.72,"days":"4/4","partial":False,
  "sites":[{"name":"AD","orders":812,"dollars":493961.14},{"name":"Millwork.com","orders":94,"dollars":42135.08},{"name":"Ekena","orders":80,"dollars":36918.78},{"name":"HomeOver","orders":10,"dollars":4719.94},{"name":"FauxBeams","orders":3,"dollars":968.19},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="Teams invites still to send for the applicants who confirmed (Mon Nov 30; Wed Dec 2, 1:00 PM). 5 more Indeed applicants since yesterday. In-person interview Mon Nov 30, 11:30 AM."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n27-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Black Friday. Quiet inbox: 15 carried to-dos, no new asks since Thursday.",links=[{"label":"Email: Inbox triage, Nov 27","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Thanksgiving Thu $79,769 (115 orders), -60% vs last Thu; real holiday slowness, not missing mail. Week to date $578,703, -35%. Watch today's Black Friday sales.",links=[{"label":"Email: Sales pulse, Nov 27","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The check-in goes from your PC."),
 B(4,"09:00","10:30","Barron: live store check and Monday's manufacturer switch","Top priority until Dec 2 (Wednesday). Click through the live Barron store and builders; line up the manufacturer switch to Barron for Monday.",taskIds=["br1117-6","in1126-1"],top=True),
 B(5,"10:30","11:00","Hiring: send the Teams invites","For the applicants who confirmed Mon Nov 30 and Wed Dec 2, 1:00 PM. 5 more applied since yesterday.",taskIds=["in1126-2"],top=True),
 B(6,"11:00","12:00","AI Training","Creative Lounge - Heath. You run it.",meeting=True),
 B(7,"13:00","13:30","Black Friday: watch the sale","Check the sale pages, AD hero images and the first orders; Cyber Monday is next.",top=True),
 B(8,"13:30","14:00","Overdue asks","Andrew's Balustrade Designer feedback, Criteo's Lower Funnel budget ask, and the columns.html reindex for Andrew.",taskIds=["in1119-6","in1125-1","in1126-3"]),
 B(9,"14:00","15:00","Team Leads Weekly Meeting","Teams. Tentative.",meeting=True),
 B(10,"15:00","15:30","Bug Herds — complete 5 (Rock: under 10)",bhsub+" #8988: add a Sales inquiries section."),
 B(11,"15:30","15:50","Cases — complete 10",cssub,taskIds=["in1125-3"]),
 B(12,"15:50","16:10","Small asks","Melissa's Wall Accent URLs and Shutter review, Hayden's vinyl siding A+ thoughts, the BigCommerce Dec 2 invite.",taskIds=["in1124-2","in1124-3","in1125-2","in1125-6"]),
 B(13,"16:10","16:40","Weekly review","Re-date or drop overdue tasks, check Waiting on, and pick next week's Top 3. Barron's priority window ends Wed Dec 2."),
 B(14,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Monday: Hayden's 1:1 at 10:00, an in-person interview at 11:30, the first Indeed interview, and the Barron manufacturer switch."),
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
