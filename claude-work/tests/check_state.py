#!/usr/bin/env python3
"""Static checks on an Ultron board.html. Usage: python3 check_state.py /abs/board.html
Exits 1 with a clear message per failure."""
import sys, re, json, hashlib

REQ_KEYS = ["tasks", "days", "today", "automations", "chat", "playbooks", "_note", "_tools", "logins"]
MARKERS = ["function ux31Alert(", "function ux32Why(", "var tkFull=false", "function healthHTML(", "function pbAutoLadder("]
fails = []


def fail(msg):
    fails.append(msg)
    print("FAIL " + msg)


def main():
    if len(sys.argv) != 2:
        print("usage: check_state.py /abs/board.html"); sys.exit(1)
    try:
        html = open(sys.argv[1], encoding="utf-8").read()
    except Exception as e:
        print("FAIL cannot read file: %s" % e); sys.exit(1)

    m = re.search(r'<script id="state" type="application/json">(.*?)</script>', html, re.S)
    if not m:
        print('FAIL no <script id="state" type="application/json"> block found'); sys.exit(1)
    raw = m.group(1)
    if "</script" in raw.lower():
        fail('raw state text contains an unescaped "</script" (must be written as <\\/script)')
    try:
        s = json.loads(raw.replace("<\\/", "</"))
    except Exception as e:
        print("FAIL state JSON does not parse: %s" % e); sys.exit(1)
    if not isinstance(s, dict):
        print("FAIL state JSON is not an object"); sys.exit(1)

    for k in REQ_KEYS:
        if k not in s:
            fail("state is missing top-level key: " + k)

    tasks = s.get("tasks")
    if not isinstance(tasks, list):
        fail("state.tasks is not a list")
        tasks = []
    seen = {}
    for i, t in enumerate(tasks):
        if not isinstance(t, dict):
            fail("task #%d is not an object" % i); continue
        for f in ("id", "group", "title", "done"):
            if f not in t:
                fail("task #%d (id=%r) lacks field %s" % (i, t.get("id"), f))
        tid = t.get("id")
        if tid in seen:
            fail("duplicate task id: %s" % tid)
        seen[tid] = 1

    chat = s.get("chat") if isinstance(s.get("chat"), dict) else {}
    if not str(chat.get("trig", "")).startswith("trig_"):
        fail("state.chat.trig must start with trig_ (got %r)" % chat.get("trig"))

    am = re.search(r'<script id="app">(.*?)</script>', html, re.S)
    if not am:
        fail('no <script id="app"> block found')
    else:
        app = am.group(1)
        for mk in MARKERS:
            n = app.count(mk)
            if n != 1:
                fail("code marker %r appears %d times in app code (expected exactly 1)" % (mk, n))

    ev = (s.get("_tools") or {}).get("evaluator") if isinstance(s.get("_tools"), dict) else None
    if not isinstance(ev, dict) or "src" not in ev or "sha256" not in ev:
        fail("state._tools.evaluator needs src and sha256")
    else:
        h = hashlib.sha256(ev["src"].encode("utf-8")).hexdigest()
        if h != ev["sha256"]:
            fail("evaluator sha256 mismatch: src hashes to %s but state says %s" % (h, ev["sha256"]))

    if fails:
        print("check_state: %d failure(s)" % len(fails)); sys.exit(1)
    print("PASS check_state (%d tasks, %d top-level keys)" % (len(tasks), len(s)))


main()
