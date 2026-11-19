import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-19';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%(P8+"XRAAA%3D");PUL=OW%(P8+"XPAAA%3D")
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEPAABCgVnAZCBUTa752dU%2BHcc2AAJoyO3IAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
add(dict(base,id="in1119-1",title="Sit down with Daniel today on the Hilton Buffalo Thunder quote pricing",note="Daniel M. · email · \"RE: 02-1236063\": Daniel wants to go over the quote pricing with you today.",**{"from":"Daniel M."}))
add(dict(base,id="in1119-2",title="Give Daniel your opinion on the $1,000 1509 Shoreline print ad",note="Daniel M. · email · He thinks $1,000 is too much. Andrew was interested if backlinks and image rights are included. Your call.",**{"from":"Daniel M."}))
add(dict(base,id="in1119-3",title="Tell Tory which Barron SKUs can go into the store now for search and page testing",note="Tory K. · Teams (Nov 18, 3:54 PM) · Paul and Milan need real SKUs to test search and product pages; otherwise Tory imports a test medallion. Goes with today's Barron upload (bq1118-1).",since="2026-11-18",**{"from":"Tory K."}))
add(dict(base,id="in1119-4",title="Fix Daniel's second round of notes on the Black Friday TEST emails",note="Daniel M. · email/Teams · adPRO colors, fretwork and onlay pictures, better shutter hardware and rafter tails photos, replace the door and window trim and other categories (crossheads and wainscot are fine). He also asked if the sale is interiors only. First sale email goes Wed 11/25.",**{"from":"Daniel M."}))
add(dict(base,id="in1119-5",title="Correct AD part ARR100TRWR06: listed gloss white but it's textured (07 may be flipped)",note="Jericah Easter · email · High importance. Check ARR100TRWR06 and ARR100TRWR07 finishes on AD.",**{"from":"Jericah Easter"}))
add(dict(base,id="in1119-6",title="Give Andrew feedback on the Balustrade Designer",note="Andrew Gonzalez · email · Feedback due Wed Nov 25.",due="2026-11-25",**{"from":"Andrew Gonzalez"}))
add(dict(base,id="in1119-7",title="Tell Matthew Durham what time works to talk grout colors with Pod 3",note="Matthew Durham · Asana · He asked for a time to talk grout colors.",**{"from":"Matthew Durham"}))
add(dict(base,id="in1119-8",title="OK Hayden's Brown Wood table-leg images without the rod",note="Hayden Clow · email · Ethan okayed them; waiting on you and Daniel.",**{"from":"Hayden Clow"}))
T={t['id']:t for t in s['tasks']}
for i in ('in1112-1','in1103-2','in1117-4','in1118-2','in1118-5'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1119-4","in1119-1","in1119-2","in1118-2","in1104-2","in1103-1","in1020-3","in1105-1"]},{"name":"Ethan S.","taskIds":["in1112-1","in1109-3","in1105-3","in1103-2","in1020-4"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1119-3","in1117-2","in1026-2"]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T]
waiting=s['days']['2026-11-18'].get('inbox',{}).get('waiting',[])
fyi=["Barron call: Daniel confirmed 1:30 PM ET with Pam himself, so that ask is closed.",
 "Your replies to Daniel on UNT and the meeting notes are still in Drafts, not sent.",
 "Waiting on Daniel and Ethan to approve the Thanksgiving/Black Friday 15% sale (you sent it Nov 18, 1:34 PM).",
 "Barron domains: all arrived except FauxPanels.com (renews Nov 19); Tory asked McKenzie to recheck.",
 "T and L hinges are out of stock; Cody asked the vendor for a faster supply update.",
 "8 new E-Com applicants on Indeed and 3 on Handshake (Nov 18). Daniel forwarded two Indeed applicants as maybe sales.",
 "Check: a Miva login-from-new-device code (Nov 18, 3:52 PM) and a Google security alert on esm.team. Confirm both were you or the team.",
 "No meeting recap came yesterday. Lauren is out today and tomorrow."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Thursday, Nov 19","counts":{"people":15,"other":5,"waiting":len(waiting),"fyi":27,"low":43,"drafts":0},"people":people,"other":[i for i in ["in1119-5","in1119-6","in1119-7","in1119-8","in1118-5","in1117-4"] if i in T],"meetings":[],"recap":{"found":False},"waiting":waiting,"fyi":fyi}
sites=[("AD",293,201591.89,52),("Ekena",38,16915.57,1),("Millwork.com",28,7938.64,-28)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"HomeOver","orders":7,"dollars":463.01,"note":"$1,918 last wk"},{"name":"FauxBeams","orders":1,"dollars":28.16,"note":"$42 last wk"}]
pulse={"found":True,"link":PUL,"label":"Wed vs last Wed. Proxy from order confirmations; NetSuite is the source of truth.","orders":367,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":396,"dollarsPrev":162607,"ordersPct":-7,"dollarsPct":40,"sites":S,
 "flags":["Largest: AD 1764345, $12,211: TrueCraft PVC gable brackets and 15 Endura-Lite fiberglass columns.","Largest: AD 1764446, $7,468: 7 Timberthane/Heritage Timber faux beams and 3 mantels.","Largest: AD 1764413, $7,016: 92 Endurathane balusters with rails and kits.","Dollars +40% on 7% fewer orders: AD +52% with no single huge order.","1 $0 sample order; 2 confirmations for older orders ($1,714) may double count. Other sites again returned no emails."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-16","end":"2026-11-18","orders":1148,"dollars":687569.92,"cmpOrders":1216,"cmpDollars":645426.28,"days":"3/3","partial":False,
  "sites":[{"name":"AD","orders":910,"dollars":566310.73},{"name":"Millwork.com","orders":102,"dollars":58643.66},{"name":"Ekena","orders":116,"dollars":58819.70},{"name":"HomeOver","orders":15,"dollars":3601.16},{"name":"FauxBeams","orders":5,"dollars":194.67},{"name":"Other","orders":0,"dollars":0}]}}
if 'in1118-1' in T and 'Triage says closed' not in T['in1118-1'].get('note',''):T['in1118-1']['note']+=" Triage says closed Nov 19."
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="8 new E-Com applicants on Indeed and 3 on Handshake (Nov 18); Daniel forwarded 2 Indeed applicants as maybe sales. No college replies."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n19-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. 15 to-dos from key people (4 new: 3 from Daniel, 1 from Tory), 5 other actions, 0 drafts ready. Work them from the Inbox section above.",links=[{"label":"Email: Inbox triage, Nov 19","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Wed $226,937, +40% vs last Wed (367 orders, -7%). AD +52%, Millwork.com -28%. Week to date +7%. Details in the Sales section above.",links=[{"label":"Email: Sales pulse, Nov 19","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The check-in goes from your PC. Lauren is out today and tomorrow."),
 B(4,"09:00","10:30","Barron: upload the first items to the new store","Top priority until Dec 2. Upload the items you picked yesterday, and tell Tory which SKUs can go in now so Paul and Milan can test search and product pages. Keep Barron's copy and URLs. Ethan's hold on new images and drawings is still open, so check with him before uploading images.",taskIds=["bq1118-1","in1119-3"],top=True),
 B(5,"10:30","11:00","Sit down with Daniel: Hilton Buffalo Thunder quote pricing","Daniel asked for today (RE: 02-1236063). From the triage.",taskIds=["in1119-1"],top=True),
 B(6,"11:00","12:00","E-Commerce L-10","Creative Lounge - Heath. You run it. Lauren is out. The Power Hour is canceled; Daniel says re-schedule it when you're back.",meeting=True),
 B(7,"12:30","13:30","Black Friday: Daniel's second round of TEST email notes","adPRO colors, fretwork and onlay pictures, shutter hardware and rafter tails photos, new door and window trim categories. Answer his question: is the sale interiors only? First sale email goes Wed 11/25.",taskIds=["in1119-4"],top=True),
 B(8,"13:30","13:50","Fix ARR100TRWR06 on AD: gloss white vs textured","Jericah flagged it as high importance; 07 may be flipped. From the triage.",taskIds=["in1119-5"]),
 B(9,"13:50","14:20","Review the PVC Brackets descriptions and category page",P("in1112-1","Ethan has waited since Nov 11. Copy is drafted; one question: do they ship primed or unfinished?"),taskIds=["in1112-1"]),
 B(10,"14:40","15:10","Bug Herds — complete 5 (Rock: under 10)",bhsub),
 B(11,"15:10","15:30","Cases — complete 10",cssub),
 B(12,"15:30","15:50","Strety","Daily · 20 min."),
 B(13,"15:50","16:20","Review Melissa's Wall Accent catalog PDF (due today)","204 pages; skip Wainscot. Comment in Acrobat and save a new version in the same folder.",taskIds=["in1117-3"]),
 B(14,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. If there's time: the 1509 Shoreline ad opinion for Daniel, Matthew's grout call time, Hayden's table-leg images, Criteo and Microsoft Ads. Tomorrow: AI Training at 11:00 (you run it), Team Leads 2:00 (tentative), and the Friday weekly review."),
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
