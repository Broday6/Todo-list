import sys,os
f,out=sys.argv[1],sys.argv[2];h=open(f).read();D=os.path.dirname(os.path.abspath(__file__))
if 'function setupHTML()' not in h:
  a="  function runBtnHTML(r){";assert h.count(a)==1 and 'var NAV44=' in h
  h=h.replace(a,open(D+"/ux56.js").read()+a)
  i=h.index('</style>');h=h[:i]+open(D+"/ux56.css").read()+h[i:]
open(out,'w').write(h);print('ok')
