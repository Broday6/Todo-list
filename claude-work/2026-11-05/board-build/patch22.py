import sys,os
# patch22: contrast fixes left over from the dark theme (Then line and times on the Now card)
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'contrast fixes (Nov 6' not in h:
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+open(D+'/fix22.css').read()+h[j:]
open(out,'w').write(h); print('ok')
