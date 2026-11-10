import sys,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read()
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
s=json.loads(st.replace('<\\/','</'))
now='2026-11-10T22:05:00.000Z'
JOB='https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/pc-jobs/strety-scorecards.md'
for t in s['tasks']:
  if t['id']=='ho-blk-n10-7' and not any('Why the Strety runs kept failing' in x.get('text','') for x in t.get('thread',[])):
    t['pcJob']={'t':now,'by':'Claude','step':'Strety week 44 scorecards on BOTH meetings: follow claude-work/pc-jobs/strety-scorecards.md','status':'queued','job':JOB}
    t['thread'].append({'role':'claude','t':now,'text':"Why the Strety runs kept failing: Strety has no connector, so only Chrome on your PC can type into it. Each Redo started a cloud chat that rewrote the PC prompt (5 versions) and said it was queued, but nothing reached your PC: the doorbell push from board chats is refused, and the PC worker had no Strety job. Each version also targeted one meeting.\n\nFixed: one permanent PC job covers both meetings (Power Hour L10 and Marketing, Sales, & Web Dev L10), with the portal mapping, entry and a reload check on both. I rang the doorbell for week 44 from here (it worked), so your PC picks it up within about 2 minutes if it's on. It also runs every Wednesday at 8:20 once the PC worker prompt with Job D is pasted.\n\nJob: "+JOB})
    t['receipt']=dict(t.get('receipt') or {},at=now,status='needs_you',summary='Queued on your PC for both meetings (doorbell rang). Nothing entered in Strety yet.',left="Nothing, if your PC is on and the watcher is running: the PC enters week 44 on both meetings and posts the values here. If nothing shows by tomorrow 9 am, paste claude-work/2026-11-10/pc-worker-queues-PC-PROMPT.md into Claude on your PC once (adds the Strety job and the Wednesday schedule). Still open: close or re-date the 8 past-due to-dos?")
    t['receipt']['where']=[{'label':'Strety PC job (both meetings)','url':JOB,'kind':'web'},{'label':'Power Hour L10 Scorecards','url':'https://2.strety.com/0bac44c6-e618-4503-bec3-5da3ba0c9b88/meetings/59e56255-eedc-4bdc-b6f5-22ddf08823ec/agenda_items/5f19743d-62bf-4f72-a384-92fd3610c842','kind':'web'},{'label':'Marketing, Sales, & Web Dev L10','url':'https://2.strety.com/0bac44c6-e618-4503-bec3-5da3ba0c9b88/meetings/2f98527b-0b5e-4f4b-a208-2892a8e3c6f6','kind':'web'}]
    t['update']={'on':now,'by':'Claude','text':'Strety: queued on your PC for both meetings; one permanent job, runs weekly.'}
NOTE=(" STRETY (Nov 10, patch46): Strety has no connector. Never write a new Strety prompt; every Strety scorecard "
      "request points at claude-work/pc-jobs/strety-scorecards.md (both meetings: Power Hour L10 and Marketing, Sales, & Web Dev L10). "
      "Set task.pcJob {step:'Strety ... follow claude-work/pc-jobs/strety-scorecards.md', status:'queued'} and say 'Queued on your PC'. "
      "Never claim a doorbell was rung unless the push succeeded.")
if 'STRETY (Nov 10, patch46)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok')
