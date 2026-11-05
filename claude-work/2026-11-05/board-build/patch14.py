import sys,os
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function fuSend(' not in h:
    J=open(D+'/fu.js').read(); C=open(D+'/fu.css').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+C+h[j:]
open(out,'w').write(h); print('ok')
