import re,sys,os
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
J=open(D+'/prog2.js').read()
if 'var RUNKEY="ultron.run"' not in h:
    a="  function progSend(key,text){live.nextOrigin=key;chSend(text);}\n"
    assert h.count(a)==1; h=h.replace(a,a+J)
    # persist immediately when a run starts, before the save-triggered reload
    a2='live.chatRun={at:Date.now(),sid:"",bucket:"",sum:"",origin:live.nextOrigin||""};live.nextOrigin="";'
    assert h.count(a2)==1; h=h.replace(a2,a2+'runPersist();')
open(out,'w').write(h); print('ok')
