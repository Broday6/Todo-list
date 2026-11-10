#!/usr/bin/env python3
"""Builds test folders under split/fx/ from split/out/. Test-only."""
import os, shutil, json, sys
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
from splitlib import rd, wr, STATE_OPEN, SCRIPT_CLOSE, app_stamp, STAMP_RE, locate, style_marker, app_loader
OUT = os.path.join(D, "out"); FX = os.path.join(D, "fx")
shutil.rmtree(FX, ignore_errors=True)
idx, js, css = rd(OUT + "/index.html"), rd(OUT + "/app.js"), rd(OUT + "/app.css")
def mk(name, index=idx, j=js, c=css):
    p = os.path.join(FX, name); os.makedirs(p)
    wr(p + "/index.html", index)
    if j is not None: wr(p + "/app.js", j)
    if c is not None: wr(p + "/app.css", c)
# external writer: read page, replace ONLY the JSON inside the state element, publish
a = idx.index(STATE_OPEN) + len(STATE_OPEN); b = idx.index(SCRIPT_CLOSE, a)
st = json.loads(idx[a:b].replace("<\\/", "</"))
st["autoLadder"] = not st.get("autoLadder", False)
st["_extWriterProbe"] = "written by fixtures.py"
st["tasks"][0]["title"] = "EXTWRITER " + st["tasks"][0]["title"]
newjson = json.dumps(st, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
mk("ext", idx[:a] + newjson + idx[b:])
print("ext autoLadder", st["autoLadder"], "task0", st["tasks"][0]["id"])
mk("noj", j=None)            # app.js missing
mk("noc", c=None)            # app.css missing
mk("crash", j=STAMP_RE.match(js).group(0) + "\nthrow new Error('boom at boot');\n")
code = js[STAMP_RE.match(js).end():]
mk("stale", j=app_stamp("20261101000000") + code)      # cached older app.js than the page
sa, sb, aa, ab = locate(idx)
old_shell = idx[:sa] + style_marker("20261101000000") + idx[sb:aa] + app_loader("20261101000000") + idx[ab:]
mk("oldshell", old_shell)  # an old tab re-wrote an older shell; app.js is newer -> boots and heals
