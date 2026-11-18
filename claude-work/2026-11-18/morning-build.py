import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-18';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%(P8+"VuAAA%3D");PUL=OW%(P8+"VtAAA%3D")
RECAP=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEPAABCgVnAZCBUTa752dU%2BHcc2AAJoyO3IAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
add(dict(base,id="in1118-1",title="Tell Daniel and Pam when you can join the Barron/McKenzie transfer call (today 12:30-2:30 CT)",note="Daniel M. · email · Pam Wesson (McKenzie) offers today 1:30-3:30 PM ET, which is 12:30-2:30 CT; Tory and Justin say any time works. Your call on the time; reply on the thread.",**{"from":"Daniel M."},mail=mail(P8+"VrAAA%3D","Re: PCI & Barron - Transferring Accounts","Pam Wesson","2026-11-18T11:37:49Z")))
add(dict(base,id="in1118-2",title="Tell Daniel if the UNT career fair or a newsletter mention is worth it",note="Daniel M. · email · Daniel forwarded UNT's employer newsletter (Career Treks, Spring 2027 events). Your call.",**{"from":"Daniel M."},mail=mail(P8+"VdAAA%3D","FW: Employer Newsletter | UNT Career Treks, Spring 2027 Events & Engagement Opportunities","Daniel Milkie","2026-11-17T23:27:28Z")))
add(dict(base,id="in1118-3",title="Fix Daniel's notes on the Black Friday TEST emails before the sale goes out",note="Daniel M. · email · Fall/Thanksgiving colors, \"Cyber Monday\" not \"Tuesday\", Black Friday wording below the header, new pictures and categories in each email, adPRO colors, button issues, duplicate top pictures, a better medallion photo, and why he got two copies. First sale email goes Wed 11/25.",**{"from":"Daniel M."},mail=mail(P8+"VOAAA%3D","RE: TEST: Last Chance: 15% Off Ends Tonight","Daniel Milkie","2026-11-17T21:17:39Z")))
add(dict(base,id="in1118-4",title="Review Daniel's list of notes from earlier meetings",note="Daniel M. · email · Gable bracket straps and spec sheets online, grow yard and garden, NVR once 18\" vinyl shutters exist, animated install, unique content per product, a list of projects you can own.",due="2026-11-20",**{"from":"Daniel M."},mail=mail(P8+"VbAAA%3D","Notes from some previous meetings","Daniel Milkie","2026-11-17T23:22:35Z")))
add(dict(base,id="in1118-5",title="Decide whether to send Liam the E-Com job description for his prospect",note="Liam Daniels · Teams · He wants the E-Com job description and offer to pass on to a prospect. Your call.",**{"from":"Liam Daniels"}))
T={t['id']:t for t in s['tasks']}
for i in ('in1112-1','in1103-2','in1117-2','in1117-4'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1118-1","in1118-2","in1118-3","in1118-4","in1104-2","in1103-1","in1020-3","in1105-1"]},{"name":"Ethan S.","taskIds":["in1112-1","in1109-3","in1105-3","in1103-2","in1020-4"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1117-2","in1026-2"]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T]
waiting=s['days']['2026-11-17'].get('inbox',{}).get('waiting',[])
fyi=["Daniel's 3 older asks (other domains to Miva, a running list of what breaks, Hayden's naming sheet) and the Indeed call ask are carried by the triage, but they're ticked on the board.",
 "Barron: Elizabeth submitted the Barron merchant account application (under review). Daniel has contacted the McKenzie contacts.",
 "1509 Shoreline print ad: Andrew is interested if backlinks and image rights are included; Daniel wants photos of the house.",
 "Endura-Stone split charges are now live for future CW Ohio POs; CW Ohio can invoice through the vendor portal.",
 "FedEx account 2049-3792-2 is closed.",
 "HBG sent you and Andrew the latest PermaCast price book.",
 "Lauren is out Thu and Fri; back Monday.",
 "Yesterday's meeting recap has no action items (transcripts still blocked). It is in your Drafts folder, not your inbox."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Wednesday, Nov 18","counts":{"people":15,"other":4,"waiting":len(waiting),"fyi":17,"low":25,"drafts":0},"people":people,"other":[i for i in ["in1118-5","in1117-4","al-group_price-20261117"] if i in T],"meetings":[],"recap":{"found":True,"subject":"Meeting recap — Tuesday, Nov 17","link":RECAP},"waiting":waiting,"fyi":fyi}
sites=[("AD",277,169698.37,-1),("Millwork.com",31,27916.10,-8),("Ekena",38,14100.48,41),("HomeOver",5,2159.87,95)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"FauxBeams","orders":2,"dollars":80.81,"note":"$14 last wk"}]
pulse={"found":True,"link":PUL,"label":"Tue vs last Tue. Proxy from order confirmations; NetSuite is the source of truth.","orders":353,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":399,"dollarsPrev":212729,"ordersPct":-12,"dollarsPct":1,"sites":S,
 "flags":["Largest: Millwork.com 1302403168, $16,369: 22 Heritage Timber 3-sided faux beams, Kona Brown.","Largest: AD 1763682, $9,978: 4 Endura-Stone 12\" x 16' Tuscan columns plus install kits.","Largest: AD 1764140, $7,524: 12 pairs True Fit PVC shutters.","Orders -12% vs last Tue, dollars flat because of the $16K Millwork.com order.","1 $0 sample order; 4 confirmations for older orders ($1,068) may double count."],
 "week":{"found":True,"label":"Week to date","start":"2026-11-16","end":"2026-11-17","orders":781,"dollars":460632.65,"cmpOrders":820,"cmpDollars":482818.82,"days":"2/2","partial":False,
  "sites":[{"name":"AD","orders":617,"dollars":364718.84},{"name":"Millwork.com","orders":74,"dollars":50705.02},{"name":"Ekena","orders":78,"dollars":41904.13},{"name":"HomeOver","orders":8,"dollars":3138.15},{"name":"FauxBeams","orders":4,"dollars":166.51},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="No college replies or Handshake messages since yesterday. Your E-Commerce job on Handshake expires at 1 school within 7 days."
s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n18-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. 15 to-dos from key people (4 new, all from Daniel), 4 other actions, 0 drafts ready. Work them from the Inbox section above.",links=[{"label":"Email: Inbox triage, Nov 18","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Tue $213,956, +1% vs last Tue (353 orders, -12%). Ekena +41%, HomeOver +95%; a $16K Millwork.com beam order kept dollars flat. Details in the Sales section above.",links=[{"label":"Email: Sales pulse, Nov 18","href":PUL}]),
 B(3,"08:40","09:00","Team check-in","Daily · 20 min. The check-in goes from your PC. Hayden didn't answer yesterday's."),
 B(4,"09:00","09:20","Barron: tell Daniel and Pam when you can join the transfer call","Pam offers 12:30-2:30 CT today; Tory and Justin say any time works. You're free 12:30-1:30, so that window is left open on the plan.",taskIds=["in1118-1"],top=True),
 B(5,"09:30","12:00","Product Category Group Meetings","Creative Lounge - Heath. Tentative. The Leadership version and Product Launch - Quality are canceled.",meeting=True),
 B(6,"13:30","14:30","Black Friday: fix Daniel's notes on the TEST emails","Today's focus. Colors, Cyber Monday wording, new pictures and categories per email, adPRO colors, buttons, the medallion photo, the duplicate send. The sale's first email goes Wed 11/25. Advaning promo pricing (starts Sun 11/23) is next if there's time.",taskIds=["in1118-3"],top=True),
 B(7,"14:30","14:50","A/B check: Merchant Center beam test, 2-week check","Read clicks for each SKU in Merchant Center and log them with Log a read on the A/B tests tab.",taskIds=["abt-02"],top=True),
 B(8,"14:50","15:20","Review the PVC Brackets descriptions and category page",P("in1112-1","Ethan has waited since Nov 11. Claude can do this; give it to Claude from the Tasks tab."),taskIds=["in1112-1"]),
 B(9,"15:20","15:50","Bug Herds — complete 5 (Rock: under 10)",bhsub),
 B(10,"15:50","16:10","Cases — complete 10",cssub),
 B(11,"16:10","16:30","Strety","Daily · 20 min."),
 B(12,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. If there's time: Advaning promo pricing (starts Sun), the Barron store item list, the hiring decision, Melissa's catalog PDF (due Thu), Criteo and Microsoft Ads. Tomorrow: E-Commerce L-10 at 11:00 (you run it); the Power Hour is canceled; Lauren is out Thu and Fri."),
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
