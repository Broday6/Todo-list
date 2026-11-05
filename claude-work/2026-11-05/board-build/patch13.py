import sys,os
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'var PENDKEY="ultron.pending"' not in h:
    J=open(D+'/pend.js').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    a='    clearTimeout(saveTimer);\n    chip("Saving\\u2026");'
    assert h.count(a)==1,h.count(a); h=h.replace(a,'    pendMark();\n'+a)
    a='art.publish(pageSource()).then(function(){chip("Saved");})'
    assert h.count(a)==1; h=h.replace(a,'art.publish(pageSource()).then(function(){pendDone();chip("Saved");})')
    a='if(code==="conflict") return; // view reloads to the winner'
    assert h.count(a)==1; h=h.replace(a,'if(code==="conflict"){chip("A newer version just landed. Re-applying your change\\u2026");setTimeout(function(){try{location.reload();}catch(x){}},2500);return;} // the reload re-applies it (pendMark)')
open(out,'w').write(h); print('ok')
