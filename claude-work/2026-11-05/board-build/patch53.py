import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]; arch=sys.argv[3] if len(sys.argv)>3 else None
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var TP52=' in post,'patch52 first'
if 'var PRUNE53_KEEP=' not in post:
    a="  function runBtnHTML(r){"; assert post.count(a)==1; post=post.replace(a,open(D+"/ux53.js").read()+a)
    css=(".dn53>summary{cursor:pointer;font-size:15px}.dn53>summary small{color:var(--muted);margin-left:6px}.dn53 h3{margin:14px 0 4px;font-size:12.5px;font-weight:600;color:var(--muted)}.dn53 h3 small{font-family:var(--mono)}"
      ".dn53-l{list-style:none;margin:0;padding:0}.dn53-l li{display:grid;grid-template-columns:4.5rem minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px solid var(--line);font-size:13.5px}"
      ".dn53-d{font-family:var(--mono);font-size:12px;color:var(--muted)}.dn53-t{font-weight:500;overflow-wrap:anywhere}.dn53-o{border:0!important;padding:0!important;background:none!important;font-size:13.5px!important;text-align:left;white-space:normal!important;color:var(--accent)}"
      ".dn53-m{font-size:12.5px;color:var(--muted);margin-top:1px}.dn53-w{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;margin-top:2px}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
KEEP={'bugherd','cases','hire','abtests'};CUT='2026-10-28'
gone={};keep=[];A=s.setdefault('doneArchive',[]);full=[]
for t in s['tasks']:
  d=str(t.get('doneOn') or '')[:10]
  if t.get('done') and d and d<=CUT and t['group'] not in KEEP and not t.get('recurring'):
    gone[t['id']]=1;full.append(t);rc=t.get('receipt') or {}
    A.append({'id':t['id'],'title':t['title'][:160],'group':t['group'],'from':t.get('from',''),'doneOn':d,'summary':(rc.get('summary') or (t.get('update') or {}).get('text') or '')[:240],'where':(rc.get('where') or [])[:3]})
  else: keep.append(t)
s['tasks']=keep
for k,d in s['days'].items():
  if k==s['today']:continue
  for b in d.get('blocks',[]):
    if b.get('taskIds'):b['taskIds']=[i for i in b['taskIds'] if i not in gone]
  ib=d.get('inbox')
  if ib:
    for p in ib.get('people',[]):p['taskIds']=[i for i in p.get('taskIds',[]) if i not in gone]
    if ib.get('other'):ib['other']=[i for i in ib['other'] if i not in gone]
    for mm in ib.get('meetings',[]):mm['taskIds']=[i for i in mm.get('taskIds',[]) if i not in gone]
for g in s.get('suggestions',[]):
  if g.get('taskId') in gone:g['taskId']=None
  if g.get('relatedTaskIds'):g['relatedTaskIds']=[i for i in g['relatedTaskIds'] if i not in gone]
for x in (s.get('teamsWatch') or {}).get('items',[]):
  if x.get('taskId') in gone:x.pop('taskId')
if s.get('claudePicks'):s['claudePicks']['items']=[x for x in s['claudePicks'].get('items',[]) if x.get('taskId') not in gone]
for t in s['tasks']:
  if t.get('relatedTaskIds'):t['relatedTaskIds']=[i for i in t['relatedTaskIds'] if i not in gone]
# today's references must still resolve
ids={t['id'] for t in s['tasks']}
for b in s['days'][s['today']]['blocks']:
  for i in b.get('taskIds',[]):assert i in ids,('today block refs pruned task',i)
NOTE=(" DONE ARCHIVE (Nov 11, patch53): tasks done 2+ weeks ago are removed from state.tasks (not BugHerd, cases, hire, abtests, recurring, or done without a date). "
      "Each leaves a record in state.doneArchive {id,title,group,from,doneOn,summary,where} (shown on the Week tab as Done this quarter; records from before state.quarter.start are cleared). Before adding any task (triage carry-overs, sweeps, case or BugHerd adds) "
      "check state.doneArchive too: an item whose id is there, or whose ask matches a tombstone from the same person, is closed; never re-add or reopen it.")
if 'DONE ARCHIVE (Nov 11, patch53)' not in s['_note']:s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
if arch: json.dump(full,open(arch,'w'),ensure_ascii=False,indent=1)
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post);print('pruned',len(gone),'kept',len(keep),'KB',len(nj)//1024)
