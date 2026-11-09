import sys,os,re,json,datetime
# patch32 (Nov 9): reliability pass.
# - Live chat fires the routine the board is allowed to start again (the one made inside the Ultron project
#   was created through the app, and Claude refuses to let a page or agent fire a routine it didn't create).
# - Failed sends keep their reason; the hourly run answers messages that never sent.
# - "Clear in one sitting" card: tasks waiting on Brody grouped by sign-in, one PC prompt per group.
# - Routine status from live trigger data (cached) and run receipts, not stale saved dates.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
OLD="trig_0198zV2xEbNR8HrCf183tLAg"; GOOD="trig_01JEYvWdaH6L4s8WcDsLrssJ"
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
k='CHAT_TRIG="'+OLD+'"'
if k in post:
    assert post.count(k)==1; post=post.replace(k,'CHAT_TRIG="'+GOOD+'"')
assert post.count('CHAT_TRIG="'+GOOD+'"')==1
if 'function ux32Why(' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux32.js").read()+a)
    css=(".sit-wrap{margin-bottom:16px}.sit .hint{margin:0 0 4px}\n"
         ".sit-g{margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}.sit-g:first-of-type{border-top:0;padding-top:0}\n"
         ".sit h3{font-size:14.5px;font-weight:600;margin:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.sit h3 small{font-weight:400;font-size:12.5px;color:var(--muted)}\n"
         ".sit ul{list-style:none;margin:6px 0 0;padding:0}.sit li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--line);font-size:13.5px}.sit li:first-child{border-top:0}\n"
         ".sit li>div{flex:1 1 auto;min-width:0}.sit-t{font-weight:600}.sit-s{font-size:12.5px;color:var(--muted)}.sit-b{display:flex;gap:6px;flex:0 0 auto;flex-wrap:wrap;justify-content:flex-end}\n"
         ".sit-a{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}\n"
         ".sit-mini p{margin:0 0 10px;font-size:13.5px}\n"
         "@media(max-width:560px){.sit li{flex-direction:column;gap:6px}.sit-b{justify-content:flex-start}}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
s.setdefault('chat',{})['trig']=GOOD
today=datetime.datetime.utcnow().strftime('%Y-%m-%d')
for r in s['automations']['routines']:
    if r.get('trig')==OLD or (r.get('trig')==GOOD):
        r.update({'trig':GOOD,'name':'Ultron board chats (started by the board)','last':'2026-11-09','status':'ok',
                  'note':'On Nov 9 from 1:27 pm Live chat pointed at the routine made inside the Ultron project. Claude only lets the board start routines Claude itself created, so every send failed until it was put back that afternoon. The board can start this one.'})
    if r.get('trig') in ('trig_01MYXtzwUPSaeoWoADbywfUY','trig_01AKYLwWAuUEsDnzF2wci73i','trig_01899VdPf2gAAkjas5rmebWr') and r.get('status')!='paused':
        r['status']='paused'; r['note']='Runs inside the hourly since Nov 5, so it is paused on purpose.'
# Brody's 1:39 pm "Run any task" never left the board. Say so once.
it=s['chat'].setdefault('items',[])
u=[x for x in it if x.get('id')=='cm-u1794253183313']
if u and not any(x.get('re')=='cm-u1794253183313' for x in it):
    u[0]['why']='the board wasn’t allowed to start that routine'
    it.append({'id':'cm-c1794256200000','role':'claude','t':'2026-11-09T20:30:00.000Z','re':'cm-u1794253183313',
               'text':'Your 1:39 pm message "Run any task" never reached me. At 1:27 I pointed Live chat at the routine you made in the Ultron project, and Claude only lets the board start routines that Claude created, so every send failed until I put it back this afternoon.\n\nLive chat is back on the routine the board can start. Press Send again under that message if you still want it.'})
NOTE=(" RELIABILITY PASS (Nov 9, patch32): CHAT_TRIG must be a routine made with create_trigger by a Claude session (created_via meta_mcp); the board cannot fire a routine made in the Claude app, a project or the API, so never repoint it at one. Board chats run on "+GOOD+". A chat item that failed to send has err:1 and why:<reason>; the hourly run answers those (its step 2a) and clears err. "
      "The Claude tab's 'Clear in one sitting' card lists open tasks that have unlockBy, needs, blockedBy, a wd- id or pcOnly+goAsk, grouped by what clears them (answer, Miva, NetSuite, Power Automate, Teams, Claude on your PC). So when a task needs Brody, always set unlockBy to the single next step, naming the system he must sign in to, and link the PC prompt file (a repo .md with PROMPT in its name) in receipt.where. "
      "Routine status: cloud routines are judged on live get_trigger data, PC jobs on the newest state.runs row whose job equals the routine's name.")
if 'RELIABILITY PASS (Nov 9, patch32)' not in s['_note']: s['_note']+=NOTE
s['_note']=s['_note'].replace('fire '+OLD+' ("Ultron board chats", in Brody\'s Ultron Code project). The old '+GOOD+' is retired.','fire '+GOOD+' (see RELIABILITY PASS).')
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok')
