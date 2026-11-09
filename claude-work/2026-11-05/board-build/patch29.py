import sys,os,re,json,datetime
# patch29 (Nov 9): "Your board chats" panel on Live chat with a link to every chat the board started; replaces the old
# "Open the full chat in Claude" button, which pointed at a retired persistent session.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function bcPanelHTML(' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,open(D+"/bc.js").read()+a)
    old="<a class=\"btn ghost\" href=\"'+esc(CHAT_URL)+'\" target=\"_blank\" rel=\"noopener\">Open the full chat in Claude</a>"
    assert h.count(old)==1; h=h.replace(old,"")
    s2="h+=chSideHTML()+'</div></div>';"
    assert h.count(s2)==1; h=h.replace(s2,"h+=bcPanelHTML()+chSideHTML()+'</div></div>';")
    css=(".bc-list{list-style:none;margin:0;padding:0}.bc-list li{border-top:1px solid var(--line)}.bc-list li:first-child{border-top:0}"
         ".bc-list a{display:block;padding:9px 0;text-decoration:none;color:var(--ink)}.bc-list a:hover .bc-t{color:var(--accent)}"
         ".bc-t{display:block;font-size:14px;font-weight:500;overflow-wrap:anywhere}.bc-w{display:block;font-size:12.5px;color:var(--muted);margin-top:1px}\n")
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+css+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
C=s.setdefault('chats',[])
if not any(x.get('sid')=='session_01DpWgXUjErVxmXFEjBD3Dto' for x in C):
    C.append({"sid":"session_01DpWgXUjErVxmXFEjBD3Dto","t":"2026-11-09T15:24:24Z","label":"Board chat (Nov 9 morning)","origin":"","task":"","item":""})
NOTE=" BOARD CHATS (Nov 9): state.chats [{sid,t,label,origin,task,item}] lists every chat the board started (newest first, 60 max), shown on Live chat › Your board chats; task.chatSid links a task to its chat. Board-fired chats title themselves 'Ultron · …' and carry the tag ultron-board."
if 'BOARD CHATS (Nov 9)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(h[:m.start(1)]+nj+h[m.end(1):]); print('ok')
