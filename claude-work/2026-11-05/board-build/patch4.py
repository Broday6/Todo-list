import re,json,sys,os
f,out,NOW=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
PJ=open(D+'/prog.js').read(); PC=open(D+'/prog.css').read()
def rep(a,b,n=1):
    global h
    c=h.count(a); assert c==n,(a[:90],c); h=h.replace(a,b)
if 'function progHTML' not in h:
    rep("  function ansSendHTML(t){\n",PJ+"  function ansSendHTML(t){\n")
    rep('live.chatRun={at:Date.now(),sid:"",bucket:"",sum:""};','live.chatRun={at:Date.now(),sid:"",bucket:"",sum:"",origin:live.nextOrigin||""};live.nextOrigin="";')
    rep("    var rs=document.querySelectorAll('[data-live-run]');","    var pg=document.querySelectorAll('[data-live-prog]');\n    for(var q=0;q<pg.length;q++)pg[q].innerHTML=progInner(pg[q].getAttribute(\"data-live-prog\"));\n    var rs=document.querySelectorAll('[data-live-run]');")
    # answer send: bar under the button, replacing the static text while a run is live
    rep("    return h+'</div>';\n  }\n  function ansMsg(t){","    return h+'</div>'+progHTML(progKey(\"ans\",t.id));\n  }\n  function ansMsg(t){")
    rep("    chSend(ansMsg(t));\n    chip(\"Sent to Claude.\");","    progSend(progKey(\"ans\",t.id),ansMsg(t));")
    # task dig deeper
    rep("digSent[t.id]=Date.now();chSend(digMsg(t));","digSent[t.id]=Date.now();progSend(progKey(\"dig\",t.id),digMsg(t));")
    rep("    h+='</div>';\n    if(digSent[t.id])","    h+='</div>'+progHTML(progKey(\"dig\",t.id));\n    if(digSent[t.id]&&!progState(progKey(\"dig\",t.id)))")
    # block dig deeper
    rep("lb.block.digSentAt=new Date().toISOString();chSend(blkDigMsg(lb.block));","lb.block.digSentAt=new Date().toISOString();progSend(progKey(\"bdig\",lb.block.id),blkDigMsg(lb.block));")
    rep("    if(b.digSentAt)h+=","    h+=progHTML(progKey(\"bdig\",b.id));\n    if(b.digSentAt&&!progState(progKey(\"bdig\",b.id)))h+=")
    # live chat: messages typed in Live chat show the same bar above the box
    rep("""'</ol><div class="ch-wait" data-live="chatwait" aria-live="polite">'+chatWaitInner()+'</div>';""","""'</ol><div class="ch-wait" data-live="chatwait" aria-live="polite">'+chatWaitInner()+'</div>'+progHTML("chat:live");""")
    rep("var c=cht(),item={id:\"cm-u\"+Date.now()","if(!live.nextOrigin)live.nextOrigin=\"chat:live\";var c=cht(),item={id:\"cm-u\"+Date.now()")
    rep("    if(t.answerWorkedAt&&(!t.answeredAt||t.answerWorkedAt>=t.answeredAt))h+=","    if(progState(progKey(\"ans\",t.id))){}\n    else if(t.answerWorkedAt&&(!t.answeredAt||t.answerWorkedAt>=t.answeredAt))h+=")
    m=re.search(r'<style id="style">',h); i=h.index('</style>',m.end()); h=h[:i]+"\n/* ---------- live progress bar ---------- */\n"+PC+h[i:]
open(out,'w').write(h); print('ok')
