import sys,os,re,json,datetime
# usage: patch48.py <board.html> <out.html> [hire48-data.json]
f,out=sys.argv[1],sys.argv[2]; data=json.load(open(sys.argv[3],encoding='utf-8')) if len(sys.argv)>3 else {}
h=open(f,encoding='utf-8').read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var LR47=' in post, 'patch47 first'
if 'var HZ48_OLD=' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux48.js",encoding='utf-8').read()+a)
s=json.loads(st.replace('<\\/','</'))
now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
# playbooks: the hiring ones follow the workflow (claude-work/routines/hiring-workflow.md)
PB={
 'hiring':{'steps':["Read the candidate's newest email in full, and their resume when on the PC",
   "Set their stage and write top qualities, location, tier (A to D) with why, and next on the Hiring tab (hiring workflow sections 1 and 4)",
   "Draft only the next stage email (phone screen for tier A); tier C or D is not hired, no email; never a second screening question",
   "List stale drafts to delete and what needs Brody"],
   'output':"Profile on the Hiring tab plus the next-stage draft",
   'done':"Every candidate who replied has top qualities, a tier with why, and a next step",
   'stop':"Never ask anyone a second screening question. No Outlook drafts to Handshake candidates. Brody sends every email."},
 'blk-hire':{'steps':["Read today's hire task and the Hiring tab",
   "Check every candidate who replied has top qualities, a tier with why, and next; fill gaps from their email",
   "List the tier A and B people Brody decides on and which drafts are ready to send"],
   'output':"Decision list and ready drafts",
   'done':"Brody can decide on everyone waiting in a few minutes",
   'stop':"No second screening questions; no Outlook drafts to Handshake candidates; E-Commerce only for now"}}
for p in s.get('playbooks',[]):
  if p.get('id') in PB:
    p.update(PB[p['id']]); p['v']=int(p.get('v',1))+1; p['updated']=now
h_=s.setdefault('hiring',{}); C=h_.setdefault('candidates',[])
OLD={"Contacted":"Asked","Messaged you":"Replied","Screen":"Phone screen","Interview":"In person"}
for c in C:
  if c.get('stage') in OLD: c['stage']=OLD[c['stage']]
def key(n): return re.sub(r'[^a-z]','',n.lower())
byname={key(c.get('name','')):c for c in C}
for row in data.get('candidates',[]):
  c=byname.get(key(row['name']))
  if not c:
    c={'id':row.get('id') or 'hc'+key(row['name'])[:10],'name':row['name'],'school':row.get('school',''),'source':row.get('source',''),
       'role':'ecom','stage':row.get('stage','New'),'interview':None,'where':'','note':''}
    C.append(c); byname[key(row['name'])]=c
  for k in ('stage','top','loc','tier','tierWhy','flags','next','stageOn','resumeOn','interview','where','school','source'):
    if k in row: c[k]=row[k]
  if row.get('noteAdd'):
    c['note']=((c.get('note') or '').rstrip()+' '+row['noteAdd']).strip()
T=s['tasks']; ids={t['id'] for t in T}
for t in data.get('tasksAdd',[]):
  if t['id'] in ids: [x.update(t) for x in T if x['id']==t['id']]
  else: T.insert(0,t)
for tid,patch in data.get('tasksPatch',{}).items():
  for x in T:
    if x['id']==tid: x.update(patch)
if data.get('flowAsOf'): h_['flowAsOf']=data['flowAsOf']
s['updated']=now
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w',encoding='utf-8').write(pre+nj+post); print('ok', len(C), 'candidates')
