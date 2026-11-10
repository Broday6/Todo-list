import sys,os,re,json,datetime,hashlib
# patch34 (Nov 9): Health tab (watchdog + evaluator), Log in button and desktop file, approvals that stick.
# Also stores the evaluator script in state._tools.evaluator so the connector-less watchdog routine can run it
# (the routine checks its sha256 against the hash pinned in its own prompt before running it).
f,out,script=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var tkFull=false' in post, 'patch33 first'
if 'function healthHTML(' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux34.js").read()+a)
    css=(".hl-top{display:flex;gap:16px;align-items:center;margin:4px 0 6px;flex-wrap:wrap}\n"
         ".hl-score{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:92px;padding:10px 14px;border-radius:12px;background:var(--sunk)}.hl-score b{font-size:30px;line-height:1.1;font-weight:650}.hl-score span{font-size:11.5px;color:var(--muted)}\n"
         ".hl-score.ok{background:var(--ok-soft);color:var(--ok)}.hl-score.warn{background:var(--warn-soft);color:var(--warn)}.hl-score.bad{background:var(--bad-soft);color:var(--bad)}\n"
         ".hl-sum{flex:1 1 260px;font-size:14.5px}.hl-bad{color:var(--bad)}.hl-ok{color:var(--ok)}\n"
         ".hl h3{font-size:14.5px;font-weight:600;margin:18px 0 4px}\n"
         ".hl-list{list-style:none;margin:0;padding:0}.hl-list li{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line);font-size:13.5px}.hl-list li:first-child{border-top:0}\n"
         ".hl-list li>div{flex:1 1 auto;min-width:0}.hl-t{font-weight:600}.hl-n{font-weight:500;color:var(--muted);margin-left:4px}.hl-d,.hl-f{font-size:12.5px;color:var(--muted);margin-top:2px}.hl-f b{color:var(--ink)}\n"
         ".hl-ids{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}\n"
         ".hl-m{display:flex;flex-wrap:wrap;gap:8px 22px;font-size:12.5px;color:var(--muted)}.hl-m b{display:block;font-size:20px;color:var(--ink);font-weight:600}\n"
         ".hl-trend{font-size:12.5px;color:var(--muted);margin:14px 0 0}.hl-trend b{color:var(--ink)}\n"
         ".lg{margin-top:16px}.lg-mini{margin-top:0}.lg-a{display:flex;flex-wrap:wrap;gap:8px}.lg .hint{margin:8px 0 0}\n"
         ".lg-d{margin-top:10px;font-size:13px}.lg-d summary{cursor:pointer;color:var(--muted)}.lg-l{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
src=open(script).read()
s.setdefault('_tools',{})['evaluator']={'src':src,'sha256':hashlib.sha256(src.encode()).hexdigest(),'file':'claude-work/tools/evaluate_board.py'}
if not s.get('logins'):
    s['logins']=[{"name":"NetSuite","url":"https://362135.app.netsuite.com/"},{"name":"Marketing Portal","url":"https://productmarketing.pcienterprises.com/html/home.php"},
      {"name":"Google Ads","url":"https://ads.google.com"},{"name":"Microsoft Ads","url":"https://ads.microsoft.com"},{"name":"Merchant Center","url":"https://merchants.google.com"},
      {"name":"BugHerd","url":"https://www.bugherd.com/projects/295205/kanban"},{"name":"Handshake","url":"https://app.joinhandshake.com/emp/conversations"},
      {"name":"Indeed","url":"https://employers.indeed.com"},{"name":"Asana","url":"https://app.asana.com"}]
    sh=(s.get('strety') or {}).get('home')
    if sh and re.match(r'^https://[^\s"\'<>]+$',sh): s['logins'].append({"name":"Strety","url":sh})
A=s.setdefault('pcApprovals',{})
for t in s['tasks']:
    if t.get('pcOnly') and (t.get('approved') or {}).get('t'):
        k=re.sub(r'-\d{8}$','',t['id'])
        if k not in A: A[k]={'t':t['approved']['t'],'what':str(t['approved'].get('what',''))[:300],'taskId':t['id'],'by':'Brody'}
    if t['id']=='al-default_variant-20261029' and 'al-default_variant' not in A:
        for x in t.get('thread') or []:
            if x.get('role')=='user' and str(x.get('text','')).startswith('OK, go ahead'):
                A['al-default_variant']={'t':x.get('t'),'what':x['text'][:300],'taskId':t['id'],'by':'Brody'}
for b in s['automations'].get('building',[]):
    if b.get('name','').startswith('NetSuite cases check'):
        b['stage']='testing'; b['next']='You said on Nov 9 it is ready to go. It has not written to the board yet, so Health flags it until its first run lands. On your PC: Claude desktop, Scheduled, cases sweep 16559, Run now.'
    if b.get('name','').startswith('BugHerd close'):
        b['what']='When you tick a BugHerd task done on Ultron, the ticket is queued. This PC task checks each queued ticket is really fixed (it reads the ticket and looks at the page or item it is about) and only then sets it to Done in BugHerd. A ticket it cannot confirm stays open with the reason.'
        b['next']='Replace the task’s prompt with the new one in the file (Nov 9: it only closes after checking), then press Run now.'
R=s['automations']['routines']
if not any(r.get('src')=='health' for r in R):
    R.insert(3,{'name':'Ultron — watchdog and evaluator','trig':'trig_01T99AD5i28qLXvSnPtoe66k','where':'here','when':'Weekdays 7:27 and 1:27','days':'wd','times':['07:27','13:27'],'freq':'daily','src':'health',
      'what':'Checks that every automation left its mark on the board, scores the board and your open tasks, and pings your phone when something is broken.','out':'Control room › Health · push notification','last':'','status':'ok'})
NOTE=(" HEALTH (Nov 9, patch34): state.health = {asOf, day, bad, warn, watchdog:[{id,label,level (bad|warn),detail,fix}], evaluator:{score, checks:[{id,label,count,ok,detail,ids}], top, metrics}} and state.healthLog = [{day,score,bad,warn}] are written ONLY by the 'Ultron — watchdog and evaluator' routine from state._tools.evaluator.src (a copy of claude-work/tools/evaluate_board.py; never edit it on the board). "
      "To keep Health green: set task.why and a source on every task you add, set unlockBy when a task needs Brody, link the result in receipt.where, and never store email addresses or phone numbers. "
      "LOG IN: state.logins = [{name,url}] is the list behind the Log in buttons; add a sign-in page there when a new tool needs one. "
      "APPROVALS THAT STICK: state.pcApprovals[<alert type, the al- id without its date>] = {t, what, taskId, by} records Brody's go for a PC alert task. When a newer alert email replaces that task, the go for the preview step still stands: never ask him to approve the preview again, and never erase pcApprovals.")
if 'HEALTH (Nov 9, patch34)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok',s['_tools']['evaluator']['sha256'],list(A))
