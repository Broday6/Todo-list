# Brody, Nov 19: 5 things for today and tomorrow: hiring, Black Friday emails, 1:1 structure (1-2 h, first), Barron, and what else from Daniel/Ethan.
import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
s=json.loads(m.group(2).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
def add(t):
  if t['id'] not in T:s['tasks'].insert(0,dict(done=False,since="2026-11-19",**t));T[t['id']]=s['tasks'][0]
add({"id":"bq1119-1","group":"now","title":"Set up the structure for one-on-ones","note":"Brody, Nov 19: one of the first to-dos; about 1 to 2 hours. Decide cadence, who (Andrew, Hayden, Lauren and new hires), a standing agenda, and where notes and action items live.","due":"2026-11-19","source":"Brody asked in chat, Nov 19","from":"Brody","top":True,
 "claudeCan":{"how":"Draft a 1:1 kit: cadence, a standing agenda, a notes and action-item template, and a first-meeting script, saved in the repo for you to edit.","steps":["Pull what each lead owns from the board (G2 Andrew, G3 Hayden, G4 Lauren) and their open asks","Draft cadence options and a 30-minute standing agenda","Draft a notes template with action items and follow-ups","Save it in the repo and link it on this task"]}})
add({"id":"bq1119-2","group":"now","title":"Find people to hire: work the new E-Com applicants","note":"Brody, Nov 19. 8 new Indeed and 3 Handshake applicants (Nov 18), Lauryn Lozano (Daniel asked), and the open decision on Ashanti, Byron and Maneesha. Daniel forwarded 2 Indeed applicants as maybe sales.","due":"2026-11-20","source":"Brody asked in chat, Nov 19","from":"Brody","relatedTaskIds":["hire1119","w1"]})
add({"id":"in1119-9","group":"inbox","title":"Get Daniel and Ethan's OK on the 15% Thanksgiving/Black Friday sale","note":"Daniel M. / Ethan S. · email · You sent the sale details Nov 18, 1:34 PM; no answer yet. The first sale email goes Wed 11/25 and Tory needs the details to set it live.","due":"2026-11-19","source":"Brody asked in chat, Nov 19","from":"Daniel M.","draft":False})
add({"id":"in1119-10","group":"inbox","title":"Ask Ethan if the hold on uploading product images is lifted (Barron needs it)","note":"Ethan S. · email · His Nov 3 hold on new product images, drawings and design assets is still open; the Barron store upload needs images.","due":"2026-11-19","source":"Brody asked in chat, Nov 19","from":"Ethan S.","draft":False,"relatedTaskIds":["in1103-2","bq1118-1"]})
d=s['days']['2026-11-19'];B={b['id']:b for b in d['blocks']}
for k in ('n19-9','n19-10','n19-12'):
  if k in B and not B[k].get('done'):d['blocks'].remove(B[k])
def mv(k,st,en,**kw):
  if k in B and not B[k].get('done'):B[k].update(start=st,end=en,**kw)
if 'f5-1' not in B:d['blocks'].append({"id":"f5-1","start":"09:00","end":"10:30","title":"Set up the one-on-one structure","sub":"Your first to-do today (1 to 2 hours). Cadence, who, a standing agenda, and where notes and action items live. Claude can draft a starter kit; give it to Claude from the Tasks tab. If it needs a second hour, it continues Friday morning.","taskIds":["bq1119-1"],"done":False,"top":True})
mv('n19-4',"13:30","14:45",sub="Top priority until Dec 2. Upload the items you picked, and tell Tory which SKUs can go in now so Paul and Milan can test search and product pages. Keep Barron's copy and URLs. Ask Ethan first whether the image hold is lifted.",taskIds=["bq1118-1","in1119-3","in1119-10"],top=True)
mv('n19-7',"12:30","13:30",taskIds=["in1119-4","in1119-9"],sub="Daniel's second round of notes: adPRO colors, fretwork and onlay pictures, shutter hardware and rafter tails photos, new door and window trim categories. Answer his question (interiors only?) and get his and Ethan's OK on the 15% sale; it goes out Wed 11/25.",top=True)
B.get('n19-5',{}).pop('top',None)
if 'f5-2' not in B:d['blocks'].append({"id":"f5-2","start":"14:45","end":"15:30","title":"Find people to hire: new applicants","sub":"11 new E-Com applicants (8 Indeed, 3 Handshake), Lauryn Lozano, and the decision on Ashanti, Byron and Maneesha. Daniel's 2 maybe-sales applicants go to the sales role.","taskIds":["bq1119-2","w1"],"done":False})
mv('n19-8',"15:30","15:50");mv('n19-11',"15:50","16:10",sub=B.get('n19-11',{}).get('sub','')+" Trimmed today.")
mv('n19-13',"16:10","16:40")
mv('n19-14',"16:40","17:00",sub="Daily · 20 min. Log what got done. Moved to Friday: the PVC Brackets review, Bug Herds, Strety. Friday: finish the 1:1 structure if needed, Barron store upload, Black Friday emails final check, hiring follow-ups; AI Training at 11:00 (you run it), Team Leads 2:00 (tentative), weekly review.")
d['blocks'].sort(key=lambda b:b['start'])
wp=s.get('weekPlan',{})
wp['top']=["Barron launch: upload the first items to the new store (target Dec 2)","Black Friday sale emails: Daniel's notes fixed and the 15% sale approved (first email Wed 11/25)","One-on-one structure set up, then hiring: work the new applicants"]
for dd in wp.get('days',[]):
  if dd.get('date')=='2026-11-20':
    dd['focus']="1) Finish the one-on-one structure if needed 2) Barron store upload 3) Black Friday emails final check 4) Hiring: new applicants"
    dd['due']=["Find people to hire (new applicants)","Black Friday sale approved","PVC Brackets review (moved from Thu)"]+[x for x in dd.get('due',[]) if x not in("Upload Barron items to the store",)]
    dd['note']=(dd.get('note') or [])+["Brody, Nov 19: today and tomorrow are for hiring, Black Friday emails, the 1:1 structure, Barron, and Daniel/Ethan follow-ups."] if isinstance(dd.get('note'),list) else ["Brody, Nov 19: today and tomorrow are for hiring, Black Friday emails, the 1:1 structure, Barron, and Daniel/Ethan follow-ups."]
for t in ('in1112-1',):
  if t in T and not T[t].get('done'):T[t]['due']="2026-11-20"
s['updated']=NOW
j=json.dumps(s,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
open(sys.argv[2],'w').write(h[:m.start(2)]+j+h[m.end(2):]);print('ok',[(b['start'],b['title'][:30]) for b in d['blocks']])
