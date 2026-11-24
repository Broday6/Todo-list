import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
for t in s['tasks']:t.setdefault('done',False)
T={t['id']:t for t in s['tasks']}
TODAY='2026-11-24';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs692lAAA%3D";PUL=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs692jAAA%3D"
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs692XAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
add(dict(base,id="in1124-1",title="Barron game plan for Ethan: builder descriptions, lines not yet duplicated, assets to Andy",note="Ethan S. · email · \"RE: Barron Design & AZ Faux - Game Plan\" (new): lay out how the BM builder descriptions should read with the new brand, texture and finish names; send any product lines not yet duplicated for Barron; send finished pictures and design assets to Andy, cc Ethan. Site launch targeted for Wednesday.",top=True,**{"from":"Ethan S."}))
add(dict(base,id="in1124-2",title="Send Melissa the URLs for the Wall Accent and wainscot categories (sheet attached)",note="Melissa Conklin · email · \"Re: Wall Accent Catalog Category\": she needs the category URLs filled in on her sheet.",**{"from":"Melissa Conklin"}))
add(dict(base,id="in1124-3",title="Review Melissa's Shutter catalog section (headers, footers, intro)",note="Melissa Conklin · email · \"Shutter Catalog Section\": ready for E-Com review; changes to headers, footers and the intro are welcome.",**{"from":"Melissa Conklin"}))
add(dict(base,id="in1124-4",title="Tell Garrett what times work for the in-person interview (week of Nov 30)",note="Garrett Bonetti · email · He's setting up the next in-person interview, likely the week of 11/30, and asks what times work for you.",**{"from":"Garrett Bonetti"}))
T={t['id']:t for t in s['tasks']}
for i in ('in1119-5','in1112-1','in1123-2','in1123-3'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1119-2","in1118-2","in1118-4"]},{"name":"Ethan S.","taskIds":["in1124-1","in1112-1","in1103-2"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":[]},{"name":"Sam P.","taskIds":["in1123-2"]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T and not T[i].get('done')]
waiting=[]
fyi=["Barron/AZ Faux: product records are done except Heritage beams and mantels; the pods add images in display order; target live Wednesday. Barron's online price is 3% over Ekena list.",
 "Ethan bought 6 Claude seats for the pods; setup is today.",
 "Barron domain transfer: Justin's phone flow is built and ready for Barron's numbers.",
 "MLDP01X06DJWH is 7 ft, not 96 in; the item record and drawing are being fixed.",
 "Accounts Payable: New Horizon is still charging shipping; some bills need a price review for today's vendor payments.",
 "Check: James Morris changed the Miva 2FA on your admin accounts. Confirm that was him.",
 "Lauren says cut the big top block from the Black Friday emails.",
 "Daniel is at Quitman all day. Reminder: his Barron Gmail email still has a plain-text password."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Tuesday, Nov 24","counts":{"people":19,"other":8,"waiting":len(waiting),"fyi":20,"low":66,"drafts":0},"people":people,"other":[i for i in ["in1124-2","in1124-3","in1124-4","in1123-3","in1120-3","in1119-5","in1119-6"] if i in T and not T[i].get("done")],"meetings":[],"recap":{"found":True,"subject":"Meeting recap — Monday, Nov 23","link":RECAP},"waiting":waiting,"fyi":fyi}
sites=[("AD",264,134347.77,-31),("Ekena",32,21693.38,-22),("Millwork.com",42,15189.94,-33)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"HomeOver","orders":3,"dollars":2672.61,"note":"$978 last wk"},{"name":"FauxBeams","orders":1,"dollars":39.08,"note":"$86 last wk"}]
pulse={"found":True,"link":PUL,"label":"Mon vs last Mon. Proxy from order confirmations; NetSuite is the source of truth.","orders":342,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":428,"dollarsPrev":246677,"ordersPct":-20,"dollarsPct":-29,"sites":S,
 "flags":["Down on all three big sites vs last Monday (AD 264 orders vs 340).","Largest: Ekena 2101338856, $9,260: Timberthane hand hewn beams.","Largest: AD 1765989, $7,935: Heritage Timber and rustic sawn beams, 39 PL adhesive.","Largest: AD 1766068, $6,900: Burlington PVC brackets and 86 Clemmons rafter tails.","3 confirmations for older orders ($730) may double count."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-23","end":"2026-11-23","orders":342,"dollars":173942.78,"cmpOrders":428,"cmpDollars":246677.02,"days":"1/1","partial":False,
  "sites":[{"name":"AD","orders":264,"dollars":134347.77},{"name":"Millwork.com","orders":42,"dollars":15189.94},{"name":"Ekena","orders":32,"dollars":21693.38},{"name":"HomeOver","orders":3,"dollars":2672.61},{"name":"FauxBeams","orders":1,"dollars":39.08},{"name":"Other","orders":0,"dollars":0}]}}
if 'in1120-1' in T and 'Triage says settled' not in T['in1120-1'].get('note',''):T['in1120-1']['note']+=" Triage says settled: the BigCommerce call happened Mon 10:00."
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="One applicant replied Monday (tier B, your call) and one new applied. Garrett wants times for an in-person interview the week of Nov 30."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n24-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. 19 to-dos from key people (1 new: Ethan's Barron game plan), 8 other actions, 0 drafts. Work them from the Inbox page.",links=[{"label":"Email: Inbox triage, Nov 24","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Mon $173,943 (342 orders), -29% vs last Mon; AD, Ekena and Millwork.com all down. Details on the Sales page.",links=[{"label":"Email: Sales pulse, Nov 24","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The check-in goes from your PC. Daniel is at Quitman all day."),
 B(4,"09:00","10:30","Barron: Ethan's game plan, then specs and prices","Top priority until Dec 2; site launch targeted for tomorrow. Lay out how the builder descriptions read with the new brand, texture and finish names; send Ethan the lines not yet duplicated; send finished pictures to Andy (cc Ethan). Then Barron specs, prices and key pages. Keep Barron's copy and URLs.",taskIds=["in1124-1","br1117-3","br1117-5"],top=True),
 B(5,"10:30","11:00","Black Friday: final check before tomorrow's send","First sale email goes Wednesday. Lauren says cut the big top block; check Hayden's 4 fixes made it in.",top=True),
 B(6,"11:00","12:30","PPC Ad Review, then BigCommerce Business Review (clash)","PPC Ad Review 11:00–12:00 in the Creative Lounge. The BigCommerce Business Review is 11:30–12:30 (tentative) and overlaps it; pick one or leave PPC early.",meeting=True),
 B(7,"13:00","13:30","Melissa: Wall Accent URLs and the Shutter catalog review","Fill in the category URLs on her sheet, then review the Shutter section (headers, footers, intro).",taskIds=["in1124-2","in1124-3"]),
 B(8,"13:30","14:00","Review the PVC Brackets descriptions and category page",P("in1112-1","Ethan has waited since Nov 11. Copy is drafted in the repo; one question: do they ship primed or unfinished? Ryan says unfinished."),taskIds=["in1112-1"]),
 B(9,"14:00","14:30","Andrew X Brody Weekly Sync","Teams. Tentative. His Balustrade Designer feedback is due tomorrow.",meeting=True),
 B(10,"14:30","15:00","Bug Herds — complete 5 (Rock: under 10)",bhsub+" New: #9097 was assigned to you."),
 B(11,"15:00","15:20","Cases — complete 10",cssub),
 B(12,"15:20","15:40","Strety","Daily · 20 min."),
 B(13,"15:40","16:10","Small asks","ARR100TRWR06 finish on AD, Ryan's moulding drawing MLDW00X01WM881, Sam's Noralco portal check, and interview times for Garrett.",taskIds=["in1119-5","in1123-3","in1123-2","in1124-4"]),
 B(14,"16:10","16:40","Clean up the board","37 old plan-block tasks are still open. On Tasks > Overdue, press \"Mark all not needed\" if they're done with."),
 B(15,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Tomorrow: Product Category Group Meetings (Leadership) 9:30–12:00 (tentative), the first Black Friday email goes out, Andrew's Balustrade feedback is due, and Barron's target launch."),
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
