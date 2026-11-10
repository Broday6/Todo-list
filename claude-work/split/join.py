#!/usr/bin/env python3
"""join.py <index.html> <app.js> <app.css> <out_single.html>

Puts app.css back into <style id="style"> and app.js (minus its build stamp line) back into
<script id="app">, keeping every other byte of index.html (state JSON included) as is.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from splitlib import locate, STAMP_RE, MARKER_RE, rd, wr

def main():
    ip, jp, cp, op = sys.argv[1:5]
    html, js, css = rd(ip), rd(jp), rd(cp)
    sa, sb, aa, ab = locate(html)
    assert MARKER_RE.match(html[sa:sb]) and MARKER_RE.match(html[aa:ab]), "index.html is not a split page (no #style/#app markers)"
    m = STAMP_RE.match(js)
    assert m, "app.js has no build stamp line"
    code = js[m.end():]
    assert "</script" not in code.lower() and "</style" not in css.lower(), "code would close its element early"
    wr(op, html[:sa] + css + html[sb:aa] + code + html[ab:])
    print("joined; app.js build", m.group(1), "shell build", MARKER_RE.match(html[aa:ab]).group(1))

if __name__ == "__main__":
    main()
