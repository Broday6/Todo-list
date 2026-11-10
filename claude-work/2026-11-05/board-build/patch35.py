import sys,os,re,json,datetime
# patch35 (Nov 10): playbooks move up by themselves after 5 clean runs; key routines switched off show as a problem.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'function healthHTML(' in post, 'patch34 first'
if 'function pbAutoLadder(' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux35.js").read()+a)
    css=(".al-bar{display:flex;gap:10px 14px;align-items:baseline;flex-wrap:wrap;margin:0 0 12px;padding:10px 12px;border-radius:8px;background:var(--sunk)}.al-bar .tm-m{flex:1 1 320px}\n"
         ".al-prog{font-size:12px;color:var(--accent);margin-top:3px}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
NOTE=(" AUTONOMY (Nov 10, patch35; Brody: 'when it works a handful of times I would love it to switch to be fully automated'): the page moves a playbook to its highest allowed mode after 5 clean runs in a row counted from its last mode change (playbook.lb = {mode, n}), and one step back after 2 redos in the last 5; playbook.ladder records {from,to,t,by,why}. state.autoLadder false turns that off. Routines never change playbook.mode, lb or ladder. "
      "A run is clean when the receipt's status is done and Brody did not send it back or follow up, so always write an honest receipt: 'needs_you' when anything is left for him. Auto still means drafts only; nothing is sent and nothing changes in NetSuite, Miva or ads without his OK.")
if 'AUTONOMY (Nov 10, patch35' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok')
