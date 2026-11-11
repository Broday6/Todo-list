import sys,os,re,json,datetime
# usage: patch51.py <board.html> <out.html>
# Actions: one stored record per wait (state.actions), "Needs your go" on Today and Approvals with buttons that write the
# decision on the board and ring the PC, cards for tasks that still only carry a goAsk / plan / sign-in, and today's two
# held marketing-category imports as the first records. Runs after every other wrapper (inserted just before the boot render).
f,out=sys.argv[1],sys.argv[2]
h=open(f,encoding='utf-8').read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var HZ50_ROWS=' in post, 'patch50 first'
if 'function ax51Cards(' not in post:
    a="  render();\n  setInterval(tick,60000);"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux51.js",encoding='utf-8').read()+a)
s=json.loads(st.replace('<\\/','</'))
T={t['id']:t for t in s['tasks']}
acts=s.setdefault('actions',[])
have={x.get('id') for x in acts}
BR='claude/admiring-mayer-9myyi8'; MAN='marketing-category/imports/2026-11-11.json'
seed=[]
t=T.get('mc-2026-11-11')
if t and not t.get('done'):
    g=t.get('goAsk') or {}
    seed.append({"id":"act-mc-2026-11-11-assembly","key":"mc-import|2026-11-11|2026-11-11 Assembly-Bill of Materials.csv","task":t['id'],
      "executor":"pc","reason":"OVER_LIMIT","title":"Import 9,811 Beams rows into NetSuite (Assembly items)",
      "ask":{"what":"The PC worker imports 2026-11-11 Assembly-Bill of Materials.csv into NetSuite: Import Assistant, Assembly Item, Update, mapping only Internal ID and Marketing Product Categories (\"Marketing Category Fill\"). 9,811 rows, each blank to Beams. It re-checks the file's sha256 and that the rows are still blank first.",
             "why":"The file is over your 5,000-row standing limit for the PC worker, so it held it. "+(t.get('why') or ''),
             "risk":(g.get('risk') or '')+" If the PC permission check stops the Save & Run click again, this card comes back with Retry.",
             "before":g.get('before',''),"after":g.get('after',''),"system":"NetSuite","rows":9811},
      "resume":{"kind":"mc-import","branch":BR,"manifest":MAN,"file":"2026-11-11 Assembly-Bill of Materials.csv","recordType":"Assembly Item (Assembly/Bill of Materials)","rows":9811,
                "sha256":"335b1a4feb830cc68929ac9fb12ab5729d080b51816aaa624868602c9f714899","liftsLimit":True},
      "status":"waiting","createdBy":"PC worker (held it), recorded by Claude","createdAt":"2026-11-11T15:45:00Z","expiresAt":"2026-11-13T23:00:00Z",
      "log":[{"at":"2026-11-11T15:45:00Z","by":"PC worker","text":"Held: over the 5,000-row limit. Nothing imported."}]})
t=T.get('mc-2026-11-11-kit')
if t and not t.get('done'):
    g=t.get('goAsk') or {}
    seed.append({"id":"act-mc-2026-11-11-kit","key":"mc-import|2026-11-11|2026-11-11 Kit-Package.csv","task":t['id'],
      "executor":"pc","reason":"NEEDS_PERMISSION","title":"Import 189 Kit rows: the PC was stopped at Save & Run",
      "ask":{"what":"The PC worker runs the 189-row Kit/Package import again (Import Assistant, Kit/Package Item, Update, Internal ID and Marketing Product Categories), after re-checking the file's sha256 and that the rows are still blank.",
             "why":t.get('why',''),"risk":g.get('risk',''),"before":g.get('before',''),"after":g.get('after',''),"system":"NetSuite","rows":189},
      "steps":["Let the PC do it: on your PC, allow the ultron-pc-worker task's Claude in Chrome to press Save & Run in NetSuite's Import Assistant (its auto-mode permission check refused that click 3 times today). Then press Retry.",
               "Or do it yourself in about 2 minutes: NetSuite > Setup > Import/Export > Import CSV Records > Items > Kit/Package Item > UTF-8 > Update > import.csv from C:\\Users\\broda\\Claude Code\\marketing-category-import\\2026-11-11 Kit-Package > map Internal ID and Marketing Product Categories > Save & Run. Then press I did it myself."],
      "resume":{"kind":"mc-import","branch":BR,"manifest":MAN,"file":"2026-11-11 Kit-Package.csv","recordType":"Kit/Package Item (Kit/Package)","rows":189,
                "sha256":"8304d41f4ec2a22d8b5273c87a9342f65ea2f8688f2f1f08bd856b96b2b7faf3"},
      "status":"waiting","createdBy":"PC worker (stopped after 3 tries), recorded by Claude","createdAt":"2026-11-11T15:41:47Z","expiresAt":"2026-11-13T23:00:00Z",
      "log":[{"at":"2026-11-11T15:41:47Z","by":"PC worker","text":"Save & Run refused by the PC permission check 3 times. Stopped retrying."}]})
for x in seed:
    if x['id'] not in have: acts.append(x)
NOTE=(" ACTIONS (Nov 11, patch51; Brody: \"I dont have a way to trigger this task from that task within ultron\"): every wait on Brody is ONE record in state.actions"
      " = {id:'act-...', key (dedupe), task, executor:'pc'|'cloud', reason: NEEDS_APPROVAL|OVER_LIMIT|NEEDS_PERMISSION|NEEDS_SIGNIN|NEEDS_INPUT|FAILED|PLAN, title,"
      " ask:{what,why,risk,before,after,system,rows}, steps:[what Brody does], resume:{kind:'mc-import'|'task'|'plan'|'pcJob'|'pc-retry', exact refs incl. sha256},"
      " status: waiting|go|running|done|failed|no|held|expired|superseded, decision:{choice:'go'|'retry'|'answer'|'no'|'hold'|'self', note, by, at, via:'button'},"
      " claim:{by,at}, result:{at,summary,ref}, ring:{at,via}, createdBy, createdAt, expiresAt, log:[{at,by,text}]}. The board's buttons write decision + status"
      " (go/retry/answer -> go, hold -> held, no -> no, self -> done) and mirror task.approved {via:'action', action:id}. Executors poll status 'go' for their executor,"
      " claim it (status running), do exactly ask.what with resume refs, then write done/failed + result + task receipt and publish; never work a record that"
      " isn't 'go'; a new wait is a new record or the same record back to 'waiting' with a new reason. A Live chat message starting '[Ultron action <id>]' only"
      " pushes the pc-queue doorbell file {task, kind:'action', action, ask:'', t, by}. Full contract: Notion Routine rules, section Actions.")
if 'ACTIONS (Nov 11, patch51' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w',encoding='utf-8').write(pre+nj+post); print('ok', len(acts), 'actions')
