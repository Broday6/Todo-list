#!/usr/bin/env python3
"""patch_split.py <in_single.html> <out_single.html>

App-code changes so the SAME app code runs both inline (single file) and as app.js (split page).
Idempotent: if the marker is already present the file is copied through unchanged.

1. pageSource(): unchanged in what it reads (#style and #app textContent). In a split page those hold
   the small marker/loader, so it already emits the split shell; in a single file it emits the single
   file. Added: if this app.js is NEWER than the shell it was loaded by (an old tab re-wrote an older
   shell), the shell's build id is swapped for this app.js's build id, so the next save heals it.
2. save(): never publish if the split loader declared the page failed.
3. After the first render: tell the split loader the app booted (window.ULTRON_SHELL.up=true).
"""
import sys

MARK = "/* ultron-split v1 */"

PATCHES = [
    (
        '    var app=document.getElementById("app").textContent;\n',
        '    var app=document.getElementById("app").textContent;\n'
        '    ' + MARK + 'var _S=window.ULTRON_SHELL;if(_S&&_S.split&&_S.js&&_S.build&&_S.js>_S.build){style=style.split(_S.build).join(_S.js);app=app.split(_S.build).join(_S.js);}\n',
    ),
    (
        '    if(readOnly||!art){chip("Saving isn\\u2019t available',
        '    if(window.ULTRON_SHELL&&window.ULTRON_SHELL.failed)return;\n'
        '    if(readOnly||!art){chip("Saving isn\\u2019t available',
    ),
    (
        '  render();\n  setInterval(tick,60000);\n',
        '  render();\n  if(window.ULTRON_SHELL)window.ULTRON_SHELL.up=true;\n  setInterval(tick,60000);\n',
    ),
]


def main():
    src, dst = sys.argv[1], sys.argv[2]
    s = open(src, encoding="utf-8", newline="").read()
    if MARK in s:
        print("already patched; copying through")
    else:
        for old, new in PATCHES:
            n = s.count(old)
            assert n == 1, "anchor occurs %d times: %r" % (n, old[:80])
        for old, new in PATCHES:
            s = s.replace(old, new, 1)
        print("patched")
    open(dst, "w", encoding="utf-8", newline="").write(s)


if __name__ == "__main__":
    main()
