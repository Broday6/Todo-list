import sys,os,re,json,datetime
# patch44 (Nov 10): board cleanup. "Claude at work" page with Open chat links, grouped sidebar, shorter Today.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var tkFull=false' in post, 'patch33 first'
if 'var NAV44=' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux44.js").read()+a)
    css=("/* patch44 */\n"
      ".w44-wrap{display:flex;flex-direction:column;gap:16px}\n"
      ".w44-list{list-style:none;margin:0;padding:0}\n"
      ".w44-r{display:grid;grid-template-columns:150px minmax(0,1fr) auto;gap:6px 16px;align-items:start;padding:12px 0;border-top:1px solid var(--line)}\n"
      ".w44-r:first-child{border-top:0;padding-top:4px}\n"
      ".w44-l{display:flex;flex-direction:column;gap:4px;align-items:flex-start}\n"
      ".w44-w{font-size:12px;color:var(--muted);font-family:var(--mono)}\n"
      ".w44-t{font-size:14.5px;font-weight:600;overflow-wrap:anywhere}\n"
      ".w44-s{font-size:12px;color:var(--muted);margin-top:1px}\n"
      ".w44-d{font-size:13px;color:var(--muted);margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}\n"
      ".w44-a{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;align-items:center}\n"
      ".w44-a .btn{padding:6px 11px;font-size:12.5px;white-space:nowrap}\n"
      ".w44-i{margin-top:6px;padding:6px 9px;border-radius:6px;background:var(--sunk);font-size:12.5px;line-height:1.45}\n.w44-i b{font-weight:600}\n.w44-i span{color:var(--muted)}\n.w44-mini .w44-i{display:none}\n"
      ".w44-acc{margin:0;padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:13px;color:var(--muted)}\n.w44-acc b{color:var(--ink)}\n"
      ".w44-nl{font-size:12px;color:var(--muted)}\n"
      ".w44-mini .w44-r{grid-template-columns:minmax(0,1fr);gap:4px}\n"
      ".w44-mini .w44-l{flex-direction:row;gap:8px;align-items:center}\n"
      ".w44-mini .w44-a{justify-content:flex-start}\n"
      ".w44-mini .w44-d{-webkit-line-clamp:1}\n"
      ".w44-needs{margin:8px 0 0;font-size:13px;color:var(--warn)}\n"
      ".w44-more>summary,.more44>summary{cursor:pointer;font-weight:600;font-size:15px}\n"
      ".more44>summary small{font-weight:400;color:var(--muted);font-size:13px;margin-left:6px}\n"
      ".more44-b{display:flex;flex-direction:column;gap:16px;margin-top:14px}\n"
      "@media(max-width:700px){.w44-r{grid-template-columns:minmax(0,1fr)}.w44-l{flex-direction:row;gap:8px;align-items:center}.w44-a{justify-content:flex-start}}\n"
      ".snav .slabel.s44{display:flex;align-items:center;gap:8px;width:100%;height:auto;margin:16px 0 4px;padding:4px 10px;border:0;background:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;color:var(--muted);text-align:left}\n"
      ".snav .slabel.s44:hover{background:rgba(127,127,127,.09);color:var(--ink)}\n"
      ".snav .slabel.s44 span{flex:1}\n"
      ".snav .slabel.s44 b{font-weight:400;font-size:10px}\n"
      ".snav .slabel.s44 i{font-style:normal;font-family:var(--mono);font-size:11px}\n"
      ".snav .slabel.s44 i.bad{color:var(--bad)}\n"
      ".dq-card.dq-short .dq-in{display:none}\n"
      ".dq-card.dq-short .dq-ctx{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n"
      ".dq-card.dq-short .dq-acts{margin-top:8px}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
NOTE=(" CHAT LINKS (Nov 10, patch44): the board's Claude at work page shows an Open chat link for each task Claude works on. Every routine "
      "run that works a task (live chat, hourly, morning rebuild, PC worker) must stamp its own chat on that task: read the environment "
      "variable CLAUDE_CODE_REMOTE_SESSION_ID with Bash (it looks like cse_...; replace the cse_ prefix with session_) and set "
      "task.receipt.session and task.chatSid to it, and add sid to the newest entry in task.runs. Do NOT call any Claude_Code_Remote tool for this. "
      "When the variable is empty (a PC run), leave the fields alone.")
if 'CHAT LINKS (Nov 10, patch44)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok')
