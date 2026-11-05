import sys,os
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
# 1) old sidebar logo back; mask stays as favicon + launcher only
h=h.replace("<span class=\"slogo\" aria-hidden=\"true\">'+ULTRON_SVG+'</span>","<span class=\"slogo\" aria-hidden=\"true\"></span>")
h=h.replace("<button type=\"button\" class=\"sdl\" data-dlapp>'+ULTRON_SVG.replace('<svg ','<svg width=\"14\" height=\"14\" ')+'Download app</button>","<button type=\"button\" class=\"sdl\" data-dlapp>Download app</button>")
h=h.replace(".slogo{background:#000!important;box-shadow:none!important;overflow:hidden;padding:0}\n","")
h=h.replace(".slogo svg,.ga-ico svg{",".ga-ico svg{")
assert ('class="slogo" aria-hidden="true">'+"'+ULTRON_SVG") not in h and ("data-dlapp>'+ULTRON_SVG") not in h
# 2) quick answers
if 'var QKEY="ultron.quick"' not in h:
    J=open(D+'/quick.js').read(); C=open(D+'/quick.css').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    a2='live.nextOrigin="";runPersist();save();'
    assert h.count(a2)==1, h.count(a2); h=h.replace(a2,'live.nextOrigin="";runPersist();qAfter(save);')
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+C+h[j:]
open(out,'w').write(h); print('ok')
