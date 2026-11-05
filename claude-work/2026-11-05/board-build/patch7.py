import re,json,sys,os
f,out,NOW=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
J=open(D+'/tsend.js').read()
def rep(a,b):
    global h
    c=h.count(a); assert c==1,(a[:90],c); h=h.replace(a,b)
if 'function twSendBtn' not in h:
    rep("  function twActs(x){\n",J+"  function twActs(x){\n")
    rep("""<div class="cacts"><button type="button" class="btn" data-twcopy="'+esc(x.id)+'">Copy and open Teams</button>""","""<div class="cacts">'+twSendBtn(x)+'<button type="button" class="'+(twSendBtn(x)?'linkbtn':'btn')+'" data-twcopy="'+esc(x.id)+'">Copy and open Teams</button>""")
    rep("Read-only: nothing is posted in Teams.","Claude never posts. Draft a reply, then Send in Teams (tap twice) sends it as you.")
    rep("      progSend(progKey(\"tw\",y.id),\"Handle this Teams message for me:","      progSend(progKey(\"tw\",y.id),\"Handle this Teams message for me (I send replies myself from the board):")
    m=re.search(r'<style id="style">',h); i=h.index('</style>',m.end()); h=h[:i]+"\n.tw-r .btn.armed{background:var(--bad);border-color:var(--bad)}\n.tw-sent{font-size:12.5px;color:var(--ok);margin-top:4px}\n"+h[i:]
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
C={"Noah Kratz":"19:49857a5f-bc03-4f80-afea-db0a326e8c19_ee76b7d1-8b4b-4253-95ae-9fbfba95f464@unq.gbl.spaces",
 "Kody Goss":"19:b0a437bd-668d-4646-83be-2e81f2fe47ee_ee76b7d1-8b4b-4253-95ae-9fbfba95f464@unq.gbl.spaces",
 "Liam Daniels":"19:ee76b7d1-8b4b-4253-95ae-9fbfba95f464_f339bdc7-0486-49eb-82ac-f4eb01084bc8@unq.gbl.spaces",
 "Matthew Durham":"19:dfe925b1-7f8a-43c7-93dd-3672b4ccf1ac_ee76b7d1-8b4b-4253-95ae-9fbfba95f464@unq.gbl.spaces",
 "Angelica Gonzales":"19:4624e890-d2b4-43c8-a9b9-7835b50c4905_ee76b7d1-8b4b-4253-95ae-9fbfba95f464@unq.gbl.spaces",
 "Daniel Milkie":"19:abaa3dcb-ee51-4d11-935d-b2d33aeeb2d4_ee76b7d1-8b4b-4253-95ae-9fbfba95f464@unq.gbl.spaces",
 "Ethan Sellek":"19:811a2370-caa4-4d6e-9df6-b1435ca2c8ab_ee76b7d1-8b4b-4253-95ae-9fbfba95f464@unq.gbl.spaces"}
n=0
for x in s['teamsWatch']['items']:
    if x.get('chatId'):continue
    if x.get('chat')=='1:1' and x.get('from') in C: x['chatId']=C[x['from']]; n+=1
    elif x.get('from')=='Lauren Milkie' and x.get('on','').startswith('2026-11-05T15:58'): x['chatId']="19:539dd505d6464a7d8e7281b2d1758ac6@thread.v2"; n+=1
N=" TEAMS SEND (Brody, Nov 5: \"the teams tool should be connected so we can send messages through\"): the board's Send in Teams button sends a teamsWatch item's replyDraft to its chat (item.chatId, or the chat in item.webUrl) when Brody taps it twice; it records item.sent. Routines keep chatId (from chat_message_search) on every new teamsWatch item. Claude itself still never posts, reacts or marks anything in Teams."
if 'TEAMS SEND (Brody' not in s['_note']: s['_note']+=N
d=s['days'][s['today']]
if not any('Send in Teams' in (l.get('text') or '') for l in d['log']):
    d['log'].append({"t":"12:40","text":"Teams messages now have Send in Teams: draft a reply, tap Send twice, and it goes out as you. Claude never posts on its own.","kind":"claude","by":"Claude"})
s['updated']=NOW
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(out,'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):]); print('ok chatIds',n)
