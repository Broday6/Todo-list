import sys,re,json,datetime
# patch37 (Nov 10, data only): queue the 4 open cases for the PC worker's NetSuite lookup (task.pcLookup), and
# point the marketing category alert task at the new import queue.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'));now=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
PCP='https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-10/pc-worker-queues-PC-PROMPT.md'
for t in s['tasks']:
    if t.get('group')=='cases' and not t.get('done') and not t.get('pcLookup'):
        no=(t.get('case') or {}).get('no') or t['id'][2:]
        t['pcLookup']={'what':'Read case %s in NetSuite: the vendor’s question, the Assigned To, the order and whether it is big-box'%no,'t':now}
        t['unlockBy']='The PC worker reads it from NetSuite on its next run (once its update is pasted on your PC).'
    if t['id']=='wd-2026-11-10' and not t.get('why'):
        t['why']='PC scheduled tasks are stuck or signed out, so their work never reaches the board.'
        t['unlockBy']='Paste the PC worker update prompt into Claude Code on your PC: '+PCP
d=s['days'].get(s['today'])
if d is not None and not any('Queued 4 cases' in str(x.get('text','')) for x in d.get('log',[])):
    d.setdefault('log',[]).append({'t':datetime.datetime.now().strftime('%H:%M'),'text':'Queued 4 cases for a NetSuite read on the PC and today’s marketing category file (66 rows) for import on the PC. Both start by themselves once the PC worker update is pasted.','kind':'claude','by':'Claude'})
NOTE=" PC QUEUES (Nov 10, patch37): task.pcLookup = {what,t} asks the PC worker to READ something in NetSuite and write it into the task thread, then clear pcLookup. Marketing category imports queue as manifests in marketing-category/imports/*.json on branch claude/admiring-mayer-9myyi8. Never use Suggested task cards for PC work: they wait for a click."
if 'PC QUEUES (Nov 10' not in s['_note']:s['_note']+=NOTE
s['updated']=now
open(out,'w').write(h[:m.start(1)]+json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+h[m.end(1):]);print('ok')
