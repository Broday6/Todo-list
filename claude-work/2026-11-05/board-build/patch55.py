import sys,os,re
f,out=sys.argv[1],sys.argv[2];h=open(f).read();D=os.path.dirname(os.path.abspath(__file__))
if 'bb.nav55' not in h:
  a="  function runBtnHTML(r){";assert h.count(a)==1;assert 'var NAVSHUT44=' in h
  h=h.replace(a,open(D+"/ux55.js").read()+a)
open(out,'w').write(h);print('ok')
