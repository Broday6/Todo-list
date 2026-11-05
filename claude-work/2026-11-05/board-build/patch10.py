import sys,os
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
J=open(D+'/icon.js').read(); C=open(D+'/icon.css').read()
if 'var ULTRON_SVG=' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    a='<span class="slogo" aria-hidden="true"></span><div><b>Ultron</b><small>Saved \'+esc(savedLabel())+\'</small></div></div>\';'
    assert h.count(a)==1, h.count(a)
    h=h.replace(a,'<span class="slogo" aria-hidden="true">\'+ULTRON_SVG+\'</span><div><b>Ultron</b><small>Saved \'+esc(savedLabel())+\'</small></div></div><button type="button" class="sdl" data-dlapp>\'+ULTRON_SVG.replace(\'<svg \',\'<svg width="14" height="14" \')+\'Download app</button>\';')
    a="    auFetchLast();\n    var h=_autoBase();\n"
    assert h.count(a)==1; h=h.replace(a,a+"    h=getAppHTML()+h;\n")
    i=h.index('<style id="style">'); j=h.index('</style>',i)
    h=h[:j]+C+h[j:]
open(out,'w').write(h); print('ok')
