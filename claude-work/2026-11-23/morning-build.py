import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
for t in s['tasks']:t.setdefault('done',False)
T={t['id']:t for t in s['tasks']}
TODAY='2026-11-23';NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
if s['today']==TODAY and s['days'].get(TODAY,{}).get('blocks'):print('ALREADY');sys.exit(0)
OW="https://outlook.office365.com/owa/?ItemID=%s&exvsurl=1&viewmodel=ReadMessageItem"
def mail(idd,subj,frm,on):
  return {"uri":"mail:///messages/"+idd.replace('%2B','_'),"link":OW%idd,"subject":subj,"from":frm,"on":on}
P8="AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJ"
TRI=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs691EAAA%3D";PUL=OW%"AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJs691BAAA%3D"
archived={a['id'] for a in s.get('doneArchive',[])};new=[]
def add(t):
  if t['id'] not in T and t['id'] not in archived:s['tasks'].append(t);new.append(t['id'])
base=dict(group="inbox",done=False,draft=False,since=TODAY,source="triage "+TODAY,due=TODAY)
add(dict(base,id="in1123-1",title="Answer Tory: is the Black Friday sale running the old way, and were the MAP holiday windows set up?",note="Tory K. · Teams (Fri Nov 20) · New. Check whether you already answered in the chat.",**{"from":"Tory K."}))
add(dict(base,id="in1123-2",title="Touch base with Noralco and make sure they're set up on the vendor portal",note="Sam P. · email · \"RE: Website issue\" (Nov 20). New; needs your update.",**{"from":"Sam P."}))
add(dict(base,id="in1123-3",title="Get moulding drawing MLDW00X01WM881 uploaded to its listing on the sites",note="Ryan Shumaker · email · The drawing is missing from the listing. You, Alejandra and Cody are on To.",**{"from":"Ryan Shumaker"}))
add(dict(base,id="in1123-4",title="Fix Hayden's 4 notes on the Black Friday TEST emails before the first send Wed 11/25",note="Daniel M. thread · Hayden's notes: the ceiling ring image is fretwork (use 2030660-08 or -10); Cyber Monday wall panels link to /3d-wall-panels.html; \"Get the House Ready\" links to /ceiling-motifs.html; the mantels link goes to the surround page.",due="2026-11-24",**{"from":"Daniel M."}))
T={t['id']:t for t in s['tasks']}
for i in ('bq1118-1','in1119-3','in1119-5','in1119-10','in1112-1','in1120-2'):
  if i in T and not T[i].get('done') and T[i]['group']=='inbox':T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1123-4","in1119-2","in1118-2","in1118-4"]},{"name":"Ethan S.","taskIds":["in1112-1","in1119-10","in1103-2"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1123-1","in1119-3","bq1118-1"]},{"name":"Sam P.","taskIds":["in1123-2"]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T and not T[i].get('done')]
waiting=s['days']['2026-11-20'].get('inbox',{}).get('waiting',[])
fyi=["BigCommerce call time is settled: Tory set Mon 10:00 and Christopher Luca sent the invite. It clashes with Hayden's 1:1.",
 "BigCommerce: the Barron and AZ Faux stores and Feedonomics are active; Tory asked to delay cancelling until after today's call. Contract assumption papers are coming.",
 "Ethan: the faux stone panels list is the next project after the Barron push. He's OK starting the sale Wednesday.",
 "Cody: the \"Primed Tan\" title change (11,888 items) is uploading.",
 "Zonos is circling back; Daniel says Q1 is a good time to follow up.",
 "Alex added a cache-clearing header for the vendor portal splash page issue.",
 "Daniel is in late today; Tue he's at Quitman all day, Thu at Clarksville.",
 "No meeting recap came Friday. Reminder: Daniel's Barron Gmail email still has a plain-text password."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Monday, Nov 23","counts":{"people":18,"other":8,"waiting":len(waiting),"fyi":21,"low":78,"drafts":0},"people":people,"other":[i for i in ["in1123-3","in1120-2","in1120-3","in1120-4","in1119-5","in1119-6","in1119-7","in1119-8"] if i in T and not T[i].get("done")],"meetings":[],"recap":{"found":False},"waiting":waiting,"fyi":fyi}
sites=[("AD",518,260087.73,-11),("Ekena",56,39232.89,45),("Millwork.com",61,22196.96,-44),("HomeOver",6,895.26,-64)]
S=[{"name":n,"orders":o,"dollars":d,"pct":p} for n,o,d,p in sites]+[{"name":"FauxBeams","orders":3,"dollars":1565.20,"note":"$1,133 last wk"}]
pulse={"found":True,"link":PUL,"label":"Fri–Sun vs last Fri–Sun. Proxy from order confirmations; NetSuite is the source of truth.","orders":644,"dollars":round(sum(x['dollars'] for x in S),2),"ordersPrev":772,"dollarsPrev":361170,"ordersPct":-17,"dollarsPct":-10,"sites":S,
 "flags":["By day: Fri $141,021 (-13%), Sat $75,240 (-34%), Sun $107,718 (+29%).","Largest: Ekena 2101338998, $12,788: faux wood beams and a mantel.","Largest: AD 1765496, $9,596: 11 Timberthane sandblasted U-beams and a mantel.","Largest: AD 1765725, $9,559: Rosetta crown, panel moulding, chair rail, baseboard and casing.","HomeOver: 6 orders vs 13 last week. Check the store.","4 $0 sample orders; 5 confirmations for older orders ($6,723) may double count. PacificColumns, BuyManufacturers and MyHomeSupply again returned no emails."],
 "week":{"found":True,"label":"Last week","start":"2026-11-16","end":"2026-11-22","orders":2119,"dollars":1209452.76,"cmpOrders":None,"cmpDollars":None,"days":"7/7","partial":False,
  "sites":[{"name":"AD","orders":1695,"dollars":1007480.63},{"name":"Millwork.com","orders":179,"dollars":87309.75},{"name":"Ekena","orders":210,"dollars":107118.99},{"name":"HomeOver","orders":26,"dollars":5740.99},{"name":"FauxBeams","orders":9,"dollars":1802.40},{"name":"Other","orders":0,"dollars":0}]}}
if 'in1120-1' in T and 'Triage says settled' not in T['in1120-1'].get('note',''):T['in1120-1']['note']+=" Triage says settled Nov 23: Tory set Mon 10:00 and the invite came."
H=s['hiring'];H['refreshedAt']=NOW;H['refreshNote']="About 14 new Indeed applicants over the weekend. Handshake is signed out in the PC's Chrome (since Nov 22), so it wasn't checked. Two tier-A Handshake candidates have waited since Nov 10."
# ---- WEEK PLAN (Monday setup) ----
T={t['id']:t for t in s['tasks']}
def ok(i):return i if i in T else None
def ids(l):return [i for i in l if i in T]
old={p['id']:p for p in s.get('weekPlan',{}).get('projects',[])}
def proj(pid,**k):
  p=dict(old.get(pid,{"id":pid}));p.update(k);p['taskIds']=ids(p.get('taskIds',[]));return p
HOLD=ids(['ho-blk-n10-1','ho-blk-n10-5'])
wp={"weekOf":"2026-11-23","builtAt":NOW,"showOn":TODAY,"away":None,
 "headline":"Barron is still the top priority (launch by Dec 2), and the first items still aren't in the new store. Black Friday goes out Wednesday, so Hayden's 4 email fixes and Tory's MAP question come first today. Thanksgiving week is short: Daniel is away Tue and Thu, Black Friday is Friday.",
 "top":["Barron: get the first items into the new store and settle the BigCommerce/Feedonomics question at today's 10:00 call","Black Friday: fix Hayden's 4 TEST email notes and answer Tory on MAP windows before the first send Wed 11/25","Hiring: work the weekend's new applicants and book the next calls"],
 "catchup":[
  {"who":"Friday","text":"None of Friday's 16 plan blocks were ticked. The wrap says the 7 TEST sale emails went out, Hayden sent back 4 fixes, and you answered Simon (10% on stock crown).","tone":"warn"},
  {"who":"Tory","text":"Asked Friday whether the Black Friday sale runs the old way and whether the MAP holiday windows were set up.","taskId":ok("in1123-1"),"tone":"warn"},
  {"who":"Tory","text":"Set the BigCommerce call for today 10:00. The Barron and AZ Faux BigCommerce stores and Feedonomics are still active; she asked to delay cancelling until after the call.","taskId":ok("in1120-1")},
  {"who":"Hayden","text":"Asked Friday if you still need him updating Barron. Andrew updated his 3 Barron column pages.","tone":"acc"},
  {"who":"Ethan","text":"OK starting the sale Wednesday. The faux stone panels list is the next project after the Barron push."},
  {"who":"Sam","text":"Wants you to touch base with Noralco and make sure they're set up on the vendor portal.","taskId":ok("in1123-2")},
  {"who":"Ryan","text":"Moulding drawing MLDW00X01WM881 is missing from its listing. In Teams he also asked who handles large moulding accounts.","taskId":ok("in1123-3")},
  {"who":"Athos","text":"The architecturaldepot.com feed is still paused (over 25% product drop, Nov 20 and 21); Miva and MyHomeSupply feeds also failed.","taskId":ok("in1120-2"),"tone":"bad"},
  {"who":"Sales","text":"Last week $1,209,453 (2,119 orders). Fri–Sun $323,978, -10%; HomeOver only 6 orders vs 13.","view":"sales","viewLabel":"Sales"},
  {"who":"NetSuite","text":"Marketing categories: 10,000 rows are built and wait for your OK.","taskId":ok("mc-2026-11-20"),"view":"approvals","viewLabel":"Approvals"},
  {"who":"PC","text":"Handshake is signed out in the PC's Chrome since Nov 22, so the daily Handshake check can't run.","taskId":ok("hs-2026-11-22"),"tone":"warn"}],
 "timeSensitive":[
  {"when":"2026-11-23T10:00","text":"PCI + BigCommerce: stores next steps (tentative, Gong link)","sub":"Clashes with Hayden's 1:1 at 10:00. Decides the Barron/AZ Faux BigCommerce stores and Feedonomics.","tone":"bad"},
  {"when":"2026-11-23T10:00","text":"1:1 with Hayden (new format: top 3 competitors)","sub":"Same time as the BigCommerce call; move one.","tone":"warn"},
  {"when":"2026-11-24","text":"Hayden's 4 Black Friday email fixes, done before Wednesday's send","taskId":ok("in1123-4"),"tone":"warn"},
  {"when":"2026-11-24","text":"Daniel at Quitman all day (phone and email only)"},
  {"when":"2026-11-24T11:00","text":"PPC Ad Review with Lauren and the team"},
  {"when":"2026-11-24T14:00","text":"Andrew weekly sync (tentative)"},
  {"when":"2026-11-25","text":"First Black Friday sale email goes out","sub":"Discounts approved: 5% vendor, 10% Ekena, 15% motifs, beams, panels, hardware and balustrade.","view":"promo","viewLabel":"Promotions","tone":"bad"},
  {"when":"2026-11-25T09:30","text":"Product Category Group Meetings: Leadership (tentative, until 12:00)"},
  {"when":"2026-11-25","text":"Andrew's Balustrade Designer feedback due","taskId":ok("in1119-6")},
  {"when":"2026-11-26","text":"Thanksgiving. The L-10 at 11:00 is still on your calendar; Daniel is at Clarksville.","sub":"Cancel or move the L-10 if the office is closed."},
  {"when":"2026-11-27","text":"Black Friday. AI Training 11:00 (you run it), Team Leads 2:00 (tentative)."},
  {"when":"2026-11-30","text":"Cyber Monday"},
  {"when":"2026-12-02","text":"Barron fully launched (priority deadline)","tone":"bad"}],
 "hiring":[
  {"text":"About 14 new Indeed applicants over the weekend; one earlier applicant asked for an update.","taskId":ok("in1120-4"),"tone":"warn"},
  {"text":"Two tier-A Handshake candidates have waited since Nov 10. Handshake is signed out in the PC's Chrome; sign in once.","taskId":ok("hs-2026-11-22"),"link":"https://app.joinhandshake.com/emp/conversations","linkLabel":"Handshake ↗","tone":"warn"},
  {"text":"Daniel asked (since Nov 4) if you want a call with two Indeed applicants he forwarded.","view":"hiring","viewLabel":"Hiring"},
  {"text":"Your call: UNT career fair or a newsletter mention (reply is in Drafts, not sent).","taskId":ok("in1118-2")},
  {"text":"Your call: send Liam the E-Com job description for his prospect.","taskId":ok("in1118-5")}],
 "cleanup":[
  {"text":"About 35 old block and hand-off tasks from Nov 10–20 (Check emails, Bug Herds, Wrap...) are still open under Now. Tick or clear them."},
  {"text":"7 hiring summary copies (Nov 12–20). Keep the newest, tick the rest.","taskId":ok("hire1120")},
  {"text":"6 \"Scheduled tasks need you\" items (Nov 5–20) are stale.","taskId":ok("wd-2026-11-20")},
  {"text":"Thursday's 4 PC run tasks (ads guard, monthly audit, BugHerd sweep, Handshake): 3 ran, the monthly audit is still waiting. Tick the 3 that ran.","taskId":ok("pc1119-1")},
  {"text":"The BigCommerce call-time task is settled (Tory booked today 10:00).","taskId":ok("in1120-1")}],
 "projects":[
  proj("p-barron",status="First items still not in the new store",tone="bad",why="Brody, Nov 18: Barron fully launched by Dec 2. 7 working days left.",
   next=["Mon: upload the first items and send Tory the SKU list","Mon 10:00: decide the BigCommerce stores and Feedonomics","Answer Hayden: does he keep updating Barron?","Replace Barron's specs and prices with ours (keep Barron's copy and URLs)","Final content check, then launch by Dec 2"],
   taskIds=["bq1118-1","in1119-3","in1119-10","br1117-1","br1117-2","br1117-3","br1117-4","br1117-5","br1117-6","in1117-2","in1118-1","in1117-1"],due="2026-12-02"),
  proj("p-bf",name="Black Friday and Cyber Monday",status="First email Wed 11/25",tone="bad",why="Biggest sales week of the year. Discounts are approved; the TEST emails have 4 fixes left.",
   next=["Fix Hayden's 4 TEST email notes (Mon)","Answer Tory: old-way sale and MAP holiday windows","First sale email Wed 11/25","Watch sales Fri; Cyber Monday email Nov 30"],taskIds=["in1123-4","in1123-1","in1119-4","in1119-9"],due="2026-11-25"),
  proj("p-hire",status="New applicants to work",tone="warn",why="Still need the E-Commerce specialist. New Indeed applicants keep coming; Handshake is signed out.",
   next=["Work the weekend's Indeed applicants","Sign in to Handshake on the PC","Book calls with the two tier-A Handshake candidates"],taskIds=["bq1119-2","w1","t7fp22","in1120-4","hs-2026-11-22","hire1120"],due="2026-11-27"),
  proj("p-g5",status="Nov 20 items overdue",tone="warn",why="Clear the known problems and ship the new beam and mantel pages before fireplace season.",
   next=["Re-date or finish the overdue November items (10 wrong facts, web dev template list)","Accessories box due Dec 4","Box Beams and Mantel launches Dec 11"],due="2026-12-04"),
  proj("p-data",status="Waiting on your OK",tone="acc",why="Marketing categories (10,000 rows) and the inaccurate-items fixes are built and held for you.",
   next=["OK the 10,000-row Marketing categories import","Say go to preview the AD and Miva inaccurate-item fixes"],taskIds=["mc-2026-11-20","al-site_ad-20261109","al-site_miva-20261109","al-site_ekena-20261109","al-default_variant-20261029","al-kit_location-20261111"]),
  proj("p-feeds",name="Feeds: Athos and Merchant Center",status="AD feed paused in Athos",tone="bad",why="Athos paused the architecturaldepot.com feed after a 25% product drop; Ekena was paused earlier.",
   next=["Confirm the AD feed in Athos or hand it to Tory","Confirm the Ekena feed (in1117-4)","Merchant Center beam test checks"],taskIds=["in1120-2","in1117-4","abt-02","abt-03","mcf-06"],view="tasks"),
  proj("p-asks",name="Criteo, Microsoft Ads and Daniel's marketing board",status="Not started",tone="acc",why="Your Nov 17 asks.",
   next=["Look over Criteo and find a solution","Find a solution with Microsoft Ads","Help Daniel with an e-commerce marketing board"],taskIds=["bq1117-1","bq1117-2","bq1117-3"],view="tasks"),
  proj("p-ads")],
 "days":[
  {"date":"2026-11-23","label":"Mon Nov 23","focus":"Setup day: Barron upload, the BigCommerce call, Black Friday fixes","meetings":["10:00 BigCommerce call (tentative) / 10:00 Hayden 1:1 (clash)"],"due":["Hayden's 4 email fixes","Tory: MAP windows answer"],"note":["Daniel in late"]},
  {"date":"2026-11-24","label":"Tue Nov 24","focus":"Barron: specs and prices, key pages","meetings":["11:00 PPC Ad Review","2:00 Andrew weekly sync (tentative)"],"due":["Black Friday email fixes final"],"note":["Daniel at Quitman all day"]},
  {"date":"2026-11-25","label":"Wed Nov 25","focus":"Black Friday send day, then Barron final content check","meetings":["9:30–12:00 Product Category Group Meetings: Leadership (tentative)"],"due":["First Black Friday email","Andrew's Balustrade Designer feedback"]},
  {"date":"2026-11-26","label":"Thu Nov 26","focus":"Thanksgiving","meetings":["11:00 E-Commerce L-10 (still on calendar)"],"due":[],"note":["Daniel at Clarksville","Cancel or move the L-10 if the office is closed"]},
  {"date":"2026-11-27","label":"Fri Nov 27","focus":"Black Friday: watch sales, Barron launch prep, weekly review","meetings":["11:00 AI Training (you run it)","2:00 Team Leads Weekly (tentative)"],"due":["Weekly review"]}]}
wp['projects']=[p for p in wp['projects'] if p.get('name')]
s['weekPlan']=wp

s['suggestionsBuilt']=NOW;s.setdefault('cases',{})['refreshedAt']=NOW;s['bugherd']['refreshedAt']=NOW
def B(i,st,en,title,sub,**k):
  b={"id":"n23-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']];bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open. Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])+"."
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and ((t.get('case') or {}).get('assignedTo') in (None,'','Brody Simpson'))];cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
blocks=[
 B(1,"08:00","08:20","Catch up: read This week","Setup day. The This week tab has what happened Friday and over the weekend, what's time-sensitive, hiring, and the big projects. Read it top to bottom first."),
 B(2,"08:20","08:45","Inbox: time-sensitive replies","18 to-dos from key people (2 new: Tory's Black Friday/MAP question and Sam's Noralco portal check), 8 other actions, 0 drafts. Hayden also asked Friday if you still need him updating Barron. The 9:00 check-in goes from your PC.",links=[{"label":"Email: Inbox triage, Nov 23","href":TRI}]),
 B(3,"08:45","09:00","Last week's numbers","Last week $1,209,453 (2,119 orders); no comparison yet. Fri–Sun $323,978, -10%. HomeOver only 6 orders vs 13. Details in the Sales tab.",links=[{"label":"Email: Sales pulse, Nov 23","href":PUL}]),
 B(4,"09:00","10:00","Barron: upload the first items and send Tory the SKU list","Top priority until Dec 2; carried since Thursday. Paul and Milan need real SKUs to test search and product pages. Keep Barron's copy and URLs. Ask Ethan if the image hold is lifted.",taskIds=["bq1118-1","in1119-3","in1119-10"],top=True),
 B(5,"10:00","10:30","Clash: BigCommerce call and Hayden's 1:1","Both are at 10:00. The BigCommerce call (Gong link, tentative) decides whether the Barron and AZ Faux BigCommerce stores and Feedonomics get cancelled. Hayden's is the first new-format 1:1 (top 3 competitors). Pick one and move the other.",meeting=True),
 B(6,"10:30","11:15","Black Friday: Hayden's 4 TEST email fixes and Tory's MAP question","First sale email goes Wed 11/25 (Ethan is OK starting Wednesday). Fix the ceiling ring image and the 3 links, then answer Tory: old-way sale, and were the MAP holiday windows set up?",taskIds=["in1123-4","in1123-1"],top=True),
 B(7,"11:15","12:00","Set the week: projects","Go through Big projects on This week. Confirm this week's steps for Barron, Black Friday and hiring; re-date the overdue G5 items; decide what Thanksgiving week can drop."),
 B(8,"12:45","13:45","Hiring: new applicants","About 14 new Indeed applicants over the weekend; one asked for an update. Handshake is signed out in the PC's Chrome: sign in once so the daily check runs.",taskIds=["bq1119-2","w1","in1120-4","hs-2026-11-22"],top=True),
 B(9,"13:45","14:10","Athos paused the AD feed: confirm or hand to Tory","Still paused since Nov 20 (over 25% product drop); also failures on the Miva and MyHomeSupply feeds.",taskIds=["in1120-2"]),
 B(10,"14:10","14:40","Approvals: Marketing categories (10,000 rows)","The import is built and waits for your OK.",taskIds=["mc-2026-11-20"]),
 B(11,"14:40","15:10","Review the PVC Brackets descriptions and category page",P("in1112-1","Ethan has waited since Nov 11. Copy is drafted in the repo; one question: do they ship primed or unfinished? Ryan says unfinished."),taskIds=["in1112-1"]),
 B(12,"15:10","15:30","Cases — complete 10",cssub),
 B(13,"15:30","16:10","Clean up the board","About 35 old block and hand-off tasks from Nov 10–20, 7 hiring summary copies, 6 \"Scheduled tasks need you\" items, and Thursday's 4 PC run tasks are still open. Tick what's done so the week starts clean."),
 B(14,"16:10","16:40","Small asks","ARR100TRWR06 finish on AD (gloss vs textured), Ryan's missing moulding drawing MLDW00X01WM881, Sam's Noralco vendor portal check.",taskIds=["in1119-5","in1123-3","in1123-2"]),
 B(15,"16:40","17:00","Wrap","Log what got done. Bug Herds and Strety are trimmed today for the setup day. Tomorrow: PPC Ad Review 11:00, Andrew sync 2:00 (tentative); Daniel is at Quitman all day."),
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
