import json,re
s=json.load(open('s.json'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-16';NOW='2026-11-16T13:15:00.000Z'
TRI="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJS8AAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
PUL="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJS7AAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
REC="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJmz34BAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
GA={"uri":"mail:///messages/AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU_Hcc2AAAAAAEMAABCgVnAZCBUTa752dU_Hcc2AAJmz333AAA%3D","link":"https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJmz333AAA%3D&exvsurl=1&viewmodel=ReadMessageItem","subject":"FW: Meet Task Assistant: Easier Google Analytics setup","from":"Daniel Milkie","on":"2026-11-13T18:20:33Z","dom":"homeover.com"}
archived={a['id'] for a in s.get('doneArchive',[])}
new=[]
if 'in1116-1' not in T and 'in1116-1' not in archived:
  s['tasks'].append({"id":"in1116-1","group":"inbox","title":"Tell Daniel whether Google Analytics Task Assistant is worth a look","note":"Daniel M. · email · He forwarded Google's \"Meet Task Assistant\" setup email and asked \"Worth looking into?\"","due":TODAY,"done":False,"from":"Daniel M.","draft":False,"since":"2026-11-13","source":"triage 2026-11-16","mail":GA,
   "claudeCan":{"how":"Read Google's Task Assistant email and docs and draft a two-line answer to Daniel, saved in your Outlook Drafts.","steps":["Read Daniel's forward (FW: Meet Task Assistant) and the Google page it links to.","Note what it sets up in GA4 and whether it touches our existing tags.","Draft a short reply to Daniel with a yes/no and why.","Save it as a draft in your Outlook Drafts."]}})
  new.append('in1116-1')
T={t['id']:t for t in s['tasks']}
for i in ('in1112-1','in1103-2'):
  if not T[i].get('done'):T[i]['due']=TODAY
people=[{"name":"Daniel M.","taskIds":["in1116-1","in1104-2","in1109-1","in1103-1","in1020-3","in1105-1"]},{"name":"Ethan S.","taskIds":["in1112-1","in1109-3","in1105-3","in1103-2","in1020-4"]},{"name":"Rob S.","taskIds":[]},{"name":"Tory K.","taskIds":["in1026-2"]},{"name":"Sam P.","taskIds":[]}]
for p in people:p['taskIds']=[i for i in p['taskIds'] if i in T]
waiting=s['days']['2026-11-13']['inbox']['waiting']
fyi=["Regina's phone screen is today at 1:00 PM but isn't on your calendar, and your \"That works\" reply to her is still in Drafts. Maneesha's Tue 1:00 PM call is also only a draft, with no invite.",
 "Ethan said \"let's chat on Monday\" (Nov 9); that's today. You ticked the task, so it isn't on the plan.",
 "The triage still lists Daniel's Miva domains, Barron transfer, broken-tools list, Hayden's sheet and the Katherine/Victoria call as open; you ticked all of them. Say if any is still owed.",
 "The 9,811-row Beams Marketing categories import card expired Friday at 5:00 with nothing imported; it needs a new card.",
 "Daniel told Algolia PCI is on hold for a few weeks; he wants to go after Lynn Cove Foundry's customers at 25% less.",
 "TimberCraft shutters: sites will show the 3/4\" board vs the full 1 1/2\" depth (Daniel).",
 "Google Search Console: new Product snippets and Merchant listings structured-data issues on ekenamillwork.com (Nov 15).",
 "Your Oct 27 draft to Virginia Arteaga (Dallas College) still has \"[Attach PDFs...]\" in it. Thanksgiving potluck Fri Nov 20 at noon."]
inbox={"found":True,"link":TRI,"subject":"Inbox triage — Monday, Nov 16","counts":{"people":12,"other":1,"waiting":len(waiting),"fyi":11,"low":45,"drafts":0},"people":people,"other":[],"meetings":[],"recap":{"found":True,"subject":"Meeting recap — Friday, Nov 13","link":REC},"waiting":waiting,"fyi":fyi}
pulse={"found":True,"link":PUL,"label":"Fri–Sun vs last Fri–Sun. Proxy from order confirmations; NetSuite is the source of truth.","orders":772,"dollars":361170,"ordersPrev":797,"dollarsPrev":398858,"ordersPct":-3,"dollarsPct":-9,
 "sites":[{"name":"AD","orders":588,"dollars":290867.13,"pct":-14},{"name":"Millwork.com","orders":94,"dollars":39567.99,"pct":74},{"name":"Ekena","orders":75,"dollars":27147.58,"pct":-24},{"name":"HomeOver","orders":13,"dollars":2454.39,"pct":913},{"name":"FauxBeams","orders":2,"dollars":1133.11,"note":"$127 last wk"}],
 "flags":["Largest: Millwork.com 1302402748, $18,605 (Sat): 10 Fiberthane 700 Legacy balustrade kits.","Largest: AD 1762111, $11,016 (Fri): AmeriCraft knotty alder and wire-brushed U-beams, 5 Endura-Stone columns.","Largest: AD 1762710, $8,839 (Sat): 16 CarveWorks knotty alder U-beams.","19 confirmations for older orders ($16,437) may double count; 1 $0 sample order.","HomeOver +913% is off a tiny base ($242 last Fri–Sun).","Last week's total is low: Thursday's confirmation emails stopped around noon."],
 "week":{"found":True,"label":"Last week","start":"2026-11-09","end":"2026-11-15","orders":2140,"dollars":1125173.96,"cmpOrders":2373,"cmpDollars":1399124.0,"days":"7/7","partial":False,
  "sites":[{"name":"AD","orders":1680,"dollars":938240.40},{"name":"Millwork.com","orders":220,"dollars":92997.42},{"name":"Ekena","orders":204,"dollars":86394.32},{"name":"HomeOver","orders":29,"dollars":6256.47},{"name":"FauxBeams","orders":7,"dollars":1285.35},{"name":"Other","orders":0,"dollars":0}]}}
H=s['hiring'];H['refreshedAt']=NOW
H['refreshNote']="No college replies; Ashanti in person today 10:00; Byron's phone screen Tue 9:00 is on the calendar; Regina (today 1:00) and Maneesha (Tue 1:00) still have no invite; 9 new Handshake E-Commerce applicants since Friday."
for g in s.get('suggestions',[]):
  if g.get('status')=='new' and g.get('day','9')<'2026-11-12':g['status']='expired'
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
  b={"id":"n16-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
def pushes(tid):
  return sum(1 for k,d in s['days'].items() if k<TODAY for b in d.get('blocks',[]) if tid in (b.get('taskIds') or []) and not b.get('done'))
def P(tid,sub):
  n=pushes(tid);return ("Pushed %d times. Do it today, hand it to Claude, or drop it. "%n if n>=3 else "")+sub
bh=[t for t in s['tasks'] if t['group']=='bugherd' and not t['done']]
bh.sort(key=lambda t:((t.get('bh') or {}).get('assigned') or t.get('since') or ''))
bhsub="Rock time · 30 min. %d open (0 new, 0 with new comments since Friday). Do these %d: "%(len(bh),min(5,len(bh)))+", ".join("#"+t['id'][3:]+" "+re.sub(r'^#\S+\s*','',t['title'])[:40] for t in bh[:5])
cs=[t for t in s['tasks'] if t['group']=='cases' and not t['done'] and not ((t.get('case') or {}).get('assignedTo') not in (None,'','Brody Simpson'))]
cs.sort(key=lambda t:(t.get('case') or {}).get('created') or t.get('since') or '')
cssub=("Daily · 20 min. %d open from search 16559. Do these: %s. Oldest first. Brian sent 2 new alerts Friday."%(len(cs),", ".join(t['id'][2:] for t in cs))) if cs else "Daily · 20 min. Work your pending cases in NetSuite search 16559."
hire='hire1113' if not T.get('hire1113',{}).get('done',True) else 'hire1111'
blocks=[
 B(1,"08:00","08:20","Check and respond to emails","Daily · 20 min. 12 to-dos from key people (1 new: Daniel's Google Analytics question; most others already ticked), 1 other action (2 case alerts), 0 drafts ready. Work them from the Inbox section above.",links=[{"label":"Email: Inbox triage, Nov 16","href":TRI}]),
 B(2,"08:20","08:40","Review daily metrics & KPIs","Daily · 20 min. Fri–Sun $361,170, -9% vs last Fri–Sun (772 orders, -3%). AD -14%, Millwork.com +74% (one $18,605 balustrade order). Last week $1,125,174, -20%, understated by Thursday's email gap. Details in the Sales section above.",links=[{"label":"Email: Sales pulse, Nov 16","href":PUL}]),
 B(3,"08:40","09:00","Send Regina's invite for today 1:00 and Maneesha's for Tue 1:00",P(hire,"Carried from Friday. Neither Teams invite is on your calendar; both replies are still in Drafts. Regina's call is today."),taskIds=[hire],top=True),
 B(4,"09:00","09:20","Team check-in","Daily · 20 min. The 9:00 \"Does anyone need anything from me today?\" message goes out from your PC."),
 B(5,"09:20","09:40","Prep for Ashanti's interview","Re-read her application and your notes; Daniel, Ethan, Alejandra, Hayden, Lauren and Andrew are joining."),
 B(6,"10:00","11:00","Ashanti Yow - Interview","Creative Lounge - Heath, in person. With Daniel, Alejandra, Ethan, Hayden, Lauren and Andrew.",meeting=True),
 B(7,"11:00","11:30","Bug Herds — complete 5 (Rock: under 10)",bhsub),
 B(8,"11:30","11:50","Cases — complete 10",cssub),
 B(9,"12:40","13:00","Strety","Daily · 20 min. Week 44 scorecards on both meetings are queued on your PC; check the Strety task for the values."),
 B(10,"13:00","13:30","Phone interview: Regina Ogundeinde","Teams. She picked Mon 1:00 PM; send the invite first (block at 8:40). Not on your calendar yet.",meeting=True),
 B(11,"13:30","14:00","Re-run the Marketing categories import (9,811 Beams rows)",P("mc-2026-11-11","Carried from Friday. The Approvals card expired Friday at 5:00 with nothing imported; make a new card and give the go."),taskIds=["mc-2026-11-11"],top=True),
 B(12,"14:15","14:45","Review the PVC Brackets descriptions and category page",P("in1112-1","Carried from Friday (triage). Ethan is still waiting; no follow-up on the thread. Claude can do this; give it to Claude from the Tasks tab."),taskIds=["in1112-1"],top=True),
 B(13,"14:45","15:15","Find people to interview","Daily · 30 min. 9 new Handshake E-Commerce applicants since Friday. Booked: Byron Tue 9:00, Maneesha Tue 1:00 (send invite). Still yours: Theophilus, Gabriel's time, Douglas and Kirsten.",taskIds=["t7fp22","w1"],links=[{"label":"Handshake conversations","href":"https://app.joinhandshake.com/emp/conversations"}]),
 B(14,"15:30","15:50","Check Merchant Center beam test wave 2",P("abt-w2-0","Carried from Friday. All 10 wave 2 Heritage beam edits are ready for your check (A/B tests tab)."),taskIds=["abt-w2-0"]),
 B(15,"15:50","16:05","Answer Daniel on Google Analytics Task Assistant","From today's triage. Claude can do this; give it to Claude from the Tasks tab.",taskIds=["in1116-1"]),
 B(16,"16:40","17:00","Wrap","Daily · 20 min. Log what got done. Tomorrow gets built from this. If there's time: the Heritage Timber inside-opening fix (pushed twice), clearing your unsent drafts, the inaccurate-items previews. Tomorrow: Byron 9:00, PPC Ad Review 11:00, Maneesha 1:00, Andrew weekly sync 2:00 (tentative)."),
]
used={b['id'] for d in s['days'].values() for b in d.get('blocks',[])}|{t['id'] for t in s['tasks']}
for b in blocks:
  assert b['id'] not in used,b['id']
  for i in b.get('taskIds',[]):assert i in T,i
s['today']=TODAY;s['days'][TODAY]={"blocks":blocks,"log":[],"inbox":inbox,"pulse":pulse}
s['updated']=NOW
json.dump(s,open('s2.json','w'));print('ok',new,hire,{i:pushes(i) for i in[hire,'mc-2026-11-11','in1112-1','abt-w2-0','mcf-01']})
h=open('b.html').read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open('out.html','w').write(h[:m.start(1)]+nj+h[m.end(1):])
