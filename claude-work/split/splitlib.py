"""Shared helpers for split.py / join.py (Ultron board). Plain string slicing, byte exact."""
import re

STYLE_OPEN = '<style id="style">'
STYLE_CLOSE = '</style>'
STATE_OPEN = '<script id="state" type="application/json">'
APP_OPEN = '<script id="app">'
SCRIPT_CLOSE = '</script>'

STAMP_RE = re.compile(r'/\* ultron:split build=(\d{14}) \(join\.py removes this line\) \*/[^\n]*\n')
MARKER_RE = re.compile(r'/\* ultron:split build=(\d{14})\.')


def locate(html):
    """Return (style_a, style_b, app_a, app_b): content spans of #style and #app.
    #style is the first <style id="style"> before the state element; #app is the first
    <script id="app"> after the state element (the app code itself contains these tag strings
    inside pageSource, but always after the real elements)."""
    st = html.find(STATE_OPEN)
    assert st > 0, "no state element"
    st_end = html.find(SCRIPT_CLOSE, st)
    assert st_end > 0, "state element not closed"
    sa = html.find(STYLE_OPEN)
    assert 0 < sa < st, "#style must come before the state element"
    sa += len(STYLE_OPEN)
    sb = html.find(STYLE_CLOSE, sa)
    assert sa <= sb < st, "#style not closed before state"
    aa = html.find(APP_OPEN, st_end)
    assert aa > 0, "no #app after state"
    aa += len(APP_OPEN)
    ab = html.find(SCRIPT_CLOSE, aa)
    assert ab > 0, "#app not closed"
    return sa, sb, aa, ab


def style_marker(build):
    return ("/* ultron:split build=%s. Ultron's CSS lives in app.css next to this page; join.py puts it back inline. Keep this element. */\n"
            '@import url("app.css?b=%s");\n' % (build, build))


def app_loader(build):
    # No "</script" and no "<!--" in here. Message text is plain so it shows without app.css.
    return ("/* ultron:split build=%s. Ultron's code lives in app.js next to this page; join.py puts it back inline. Keep this element. */\n"
            "(function(){\n"
            "var B=\"%s\",tries=0,S=window.ULTRON_SHELL={split:true,build:B,ok:function(b){S.js=b;return b>=B;}};\n"
            "function fail(){if(S.up||S.failed)return;S.failed=true;var r=document.getElementById(\"root\")||document.body;r.textContent=\"\";"
            "var p=document.createElement(\"p\");p.setAttribute(\"role\",\"alert\");"
            "p.setAttribute(\"style\",\"margin:40px auto;max-width:520px;padding:20px 24px;font:16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#111;background:#fff;border:2px solid #c62828;border-radius:10px\");"
            "p.textContent=\"Ultron's code didn't load. Reload the page.\";r.appendChild(p);}\n"
            "function css(){try{return !!getComputedStyle(document.documentElement).getPropertyValue(\"--accent\").trim();}catch(e){return false;}}\n"
            "function js(src){var s=document.createElement(\"script\");s.src=src;\n"
            " s.onload=function(){if(S.up||S.failed)return;\n"
            "  if(tries<2&&!S.js){tries++;js(\"app.js\");return;}\n"
            "  if(tries<2&&S.js<B){tries++;js(\"app.js?b=\"+B+\"&r=\"+Date.now());return;}\n"
            "  fail();};\n"
            " s.onerror=function(){if(S.up||S.failed)return;if(tries<1){tries++;js(\"app.js\");return;}fail();};\n"
            " document.body.appendChild(s);}\n"
            "function go(){if(css())js(\"app.js?b=\"+B);else fail();}\n"
            "if(css())go();else{var l=document.createElement(\"link\");l.rel=\"stylesheet\";l.href=\"app.css\";l.onload=go;l.onerror=fail;document.head.appendChild(l);}\n"
            "})();\n" % (build, build))


def app_stamp(build):
    return ('/* ultron:split build=%s (join.py removes this line) */'
            'if(window.ULTRON_SHELL&&!window.ULTRON_SHELL.ok("%s"))throw new Error("Ultron: this app.js is older than the page");\n' % (build, build))


def rd(p):
    with open(p, encoding="utf-8", newline="") as f:
        return f.read()


def wr(p, s):
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)
