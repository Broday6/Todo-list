import sys
h=open(sys.argv[1]).read()
while not h.startswith("<!doctype html>\n<html"):
    i=h.index("<!doctype html>\n<html",10); h=h[i:]
    if h.endswith("\n</body></html>"): h=h[:-len("\n</body></html>")]
open(sys.argv[2],'w').write(h); print('unwrapped', h.count('<!doctype html>'))
