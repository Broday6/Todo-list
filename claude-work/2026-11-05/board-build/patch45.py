import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var NAV44=' in post, 'patch44 first'
if 'var RP45=' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux45.js").read()+a)
    css=("/* patch45 */\n.rp45b{margin-top:6px}\n.tm-cols li .rp45b{margin:6px 0 0;display:inline-block}\n#rp45 .mbody{min-height:140px}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
NOTE=(" TEAM REPLIES (Nov 10, patch45; Brody: \"when i click reply i need you to reply to them\"): Reply buttons on Teams messages, "
      "Teams tasks and the Team tab's You owe / owes you items open one window where Claude writes the reply; Brody's press of "
      "\"Send to <name>\" posts it with teams_send_chat_message from the page. Routines still never post in Teams on their own "
      "(the one exception is the hourly's daily check-in). When a routine finds a team ask, write task/teamsWatch context "
      "(chatId of the chat, what they asked) so the Reply window has what it needs.")
if 'TEAM REPLIES (Nov 10, patch45' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok')
