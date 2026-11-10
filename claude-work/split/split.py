#!/usr/bin/env python3
"""split.py <single.html> <outdir> [build]

Writes outdir/index.html (the page with the state JSON inline and small #style/#app markers),
outdir/app.js (build stamp line + the #app code) and outdir/app.css (the #style CSS).
build defaults to the current UTC time as YYYYMMDDHHMMSS; it must only ever increase.
join.py is the exact inverse: join(split(x)) == x byte for byte.
"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from splitlib import locate, style_marker, app_loader, app_stamp, MARKER_RE, rd, wr

def main():
    src, out = sys.argv[1], sys.argv[2]
    build = sys.argv[3] if len(sys.argv) > 3 else time.strftime("%Y%m%d%H%M%S", time.gmtime())
    assert len(build) == 14 and build.isdigit(), "build must be 14 digits"
    html = rd(src)
    sa, sb, aa, ab = locate(html)
    css, app = html[sa:sb], html[aa:ab]
    assert not MARKER_RE.match(css) and not MARKER_RE.match(app), "input is already a split page; join it first"
    assert "ultron-split v1" in app, "app code lacks patch_split.py changes; run patch_split.py first"
    index = html[:sa] + style_marker(build) + html[sb:aa] + app_loader(build) + html[ab:]
    os.makedirs(out, exist_ok=True)
    wr(os.path.join(out, "index.html"), index)
    wr(os.path.join(out, "app.js"), app_stamp(build) + app)
    wr(os.path.join(out, "app.css"), css)
    print("build", build, "index", len(index.encode()), "app.js", len((app_stamp(build) + app).encode()), "app.css", len(css.encode()))

if __name__ == "__main__":
    main()
