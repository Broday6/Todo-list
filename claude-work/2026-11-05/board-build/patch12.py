import sys,os
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function bhReplyHTML' not in h:
    J=open(D+'/reply.js').read(); C=open(D+'/reply.css').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    a2='live.chatRun={at:Date.now(),sid:"",bucket:"",sum:"",origin:live.nextOrigin||""};'
    assert h.count(a2)==1; h=h.replace(a2,'live.chatRun={at:Date.now(),sid:"",bucket:"",sum:"",origin:live.nextOrigin||"",item:item.id};')
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+C+h[j:]
open(out,'w').write(h); print('ok')
