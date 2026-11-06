import sys,os,re,json,datetime
# patch24: playbooks + modes + Hand off everywhere, command center + What changed, Control room (Nov 6)
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function pbList(' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,open(D+'/pb.js').read()+open(D+'/dash.js').read()+open(D+'/ctrl.js').read()+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+open(D+'/p24.css').read()+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
# seed playbooks from pb.js defaults so routines can read them
if not s.get('playbooks'):
    js=open(D+'/pb.js').read(); a=js.index('var PB_DEFAULTS=')+len('var PB_DEFAULTS='); b=js.index('];',a)+1
    import subprocess
    arr=subprocess.run(['node','-e','process.stdout.write(JSON.stringify('+js[a:b]+'))'],capture_output=True,text=True).stdout
    s['playbooks']=[dict(p,v=1) for p in json.loads(arr)]
if not s.get('myRules'):
    s['myRules']=[{"id":"mr-tory","t":"2026-11-06T16:50:00.000Z","text":"Tory owns website back-end errors (feed and indexing failures, Athos errors). Don't ping me or make tasks for them."}]
NOTE=(" PLAYBOOKS AND MODES (Brody, Nov 6: \"almost everything in this tool needs to be able to be handed off\"; \"an automated system where I have a dashboard and you do the job\"). "
 "state.playbooks = [{id,name,match,mode,steps,output,done,stop,v}]. A task's playbook is task.playbook if set, else the FIRST playbook in order whose match hits: match.kinds (task.hoKind), ids (id prefix; 'pr' only when followed by a digit), groups, sources (task.source prefix, lower case), touches, has (task field present), title (case-insensitive regex), all. "
 "Mode = task.mode or the playbook's mode: auto (Claude takes it on its own every hourly run and leaves a receipt), plan (write the steps into task.workflow, set claudeStatus 'plan' and receipt.status 'plan', stop; Brody approves on the board, which sets task.planOK, then run the steps), draft (do the work, everything stays a draft), manual (only when Brody hands it off). task.autoSkip keeps a task out of auto. "
 "Follow the playbook's steps, put results where output says, treat 'stop' as a hard stop to ask. Hand-offs of Teams items, owed follow-ups, plan blocks and promotions arrive as tasks with ids ho-tw-*, ho-owe-*, ho-blk-*, ho-pm-*. "
 "MY RULES: state.myRules = [{id,t,text}] are Brody's own standing rules; every run follows them (newest wins when two conflict) and never edits them. "
 "REQUESTS: state.requests = [{id,t,text,area,status,previewUrl,note,shippedAt}] are tool change requests from the Control room, handled by the tool change requests routine (trig_01NqRhkLSC15hY1J2ahMGVXL). Routines never change a request except that routine.")
if 'PLAYBOOKS AND MODES' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
# capability note in the head and the self-publish template: add update_trigger
open(out,'w').write(h); print('ok', len(s['playbooks']),'playbooks')
