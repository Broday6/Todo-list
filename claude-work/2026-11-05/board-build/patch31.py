import sys,os,re,json,datetime
# patch31 (Nov 9): UX pass. Chat composer no longer squeezed; chat first on phones; chat says when a message failed
# or is waiting on Brody; alert emails aren't "Needs reply"; "Stuck" -> "Your step" when Claude says what's needed;
# sources strip shows only problems; closed clean-up list starts collapsed; outdated Live chat copy fixed.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
if 'function ux31Alert(' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux31.js").read()+a)
    def rep(old,new):
        global post
        assert post.count(old)==1,old[:50]; post=post.replace(old,new)
    rep("if(live.chatErr)h+=","h+=ux31NoticeHTML();if(live.chatErr)h+=")
    rep("this is your Claude Code chat, the same one the routines run in","each message starts a fresh Claude chat, and the answer lands here")
    rep("Talk to Claude here. Messages go straight into your Claude Code chat, and replies land back on Ultron.","Talk to Claude here. Each message starts a Claude chat that can read your Outlook, Notion and this board, and the reply lands back here.")
    rep(" What you type in the Claude app chat shows up here too."," Every chat is also listed under Your board chats.")
    rep("'<details class=\"cu-done\"'+(list.length?'':' open')+'>","'<details class=\"cu-done\">")
    css=(".ch-form{flex-wrap:wrap}.ch-form textarea{flex:1 1 240px}\n"
         "@media(max-width:999px){.ch-grid .tside{order:0}}\n"
         ".ux-note{margin:10px 0 0;padding:9px 12px;border-radius:8px;font-size:13.5px}.ux-note.bad{background:var(--bad-soft);color:var(--bad)}.ux-note.warn{background:var(--warn-soft);color:var(--warn)}.ux-note a{color:inherit;font-weight:600}\n"
         ".bc-w .stag{margin-right:4px}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
NOTE=" UX PASS (Nov 9, patch31): inbox tasks from automated alert emails (subject 'E-Commerce Alert:', 'E-Commerce Lead:', 'NS Alert', 'ALERT - ', 'Daily Backorder List') show under No reply needed; set reply {state:'none'} on them. A blocked task whose newest Claude note starts 'Needs you:' shows as 'Your step', so always start that note with the one thing Brody must do. state.chats[].st is working | needs you | failed | done."
if 'UX PASS (Nov 9, patch31)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok')
