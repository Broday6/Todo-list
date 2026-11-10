#!/usr/bin/env python3
"""Ultron watchdog + evaluator.

Usage: python3 evaluate_board.py <unwrapped board .html> [now ISO, UTC]
Prints one JSON object (state.health) to stdout. Reads only; changes nothing.

Watchdog: judges every automation by what it left on the board (plan built, pulse and triage read, Teams and
cases checked, mail swept, PC job receipts), not by whether a routine "fired".
Evaluator: scores the board and the open tasks (missing why or source, stale reviews, long-overdue work,
needs-you tasks with no next step, duplicates, stored contact details, size).
"""
import sys, re, json, datetime
from zoneinfo import ZoneInfo

CT = ZoneInfo("America/Chicago")
UTC = datetime.timezone.utc


def parse(ts):
    if not ts:
        return None
    s = str(ts).strip()
    try:
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
            return datetime.datetime.fromisoformat(s + "T12:00:00").replace(tzinfo=CT)
        d = datetime.datetime.fromisoformat(s.replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=UTC)
    except Exception:
        return None


def ago(d, now):
    if not d:
        return "never"
    m = int((now - d).total_seconds() // 60)
    if m < 90:
        return "%d min ago" % max(m, 0)
    if m < 48 * 60:
        return "%d h ago" % (m // 60)
    return "%d days ago" % (m // 1440)


def main():
    html = open(sys.argv[1], encoding="utf-8").read()
    now = parse(sys.argv[2]) if len(sys.argv) > 2 else datetime.datetime.now(UTC)
    m = re.search(r'<script id="state" type="application/json">(.*?)</script>', html, re.S)
    raw = m.group(1)
    s = json.loads(raw.replace("<\\/", "</"))
    nct = now.astimezone(CT)
    today = nct.strftime("%Y-%m-%d")
    weekday = nct.weekday() < 5
    mins = nct.hour * 60 + nct.minute
    tasks = s.get("tasks", [])
    wd = []

    def add(id_, label, level, detail, fix):
        wd.append({"id": id_, "label": label, "level": level, "detail": detail, "fix": fix})

    day = (s.get("days") or {}).get(today) or {}
    # ---- watchdog: did each automation leave its mark? ----
    if weekday and mins >= 7 * 60 + 25:
        built = s.get("today") == today and len(day.get("blocks") or []) > 0
        if not built:
            add("plan", "Morning plan", "bad", "Today's plan isn't built (board still shows %s)." % s.get("today"),
                "Open Control room, Routines, and press Run now on the morning rebuild.")
        else:
            if not (day.get("pulse") or {}).get("found"):
                add("pulse", "Sales pulse", "warn", "Today's Sales pulse email wasn't found when the plan was built.",
                    "Check that the 6:15 Sales pulse email arrived.")
            if not (day.get("inbox") or {}).get("found"):
                add("triage", "Inbox triage", "warn", "Today's Inbox triage email wasn't found when the plan was built.",
                    "Check that the 6:30 Inbox triage email arrived.")
    if weekday and 8 * 60 <= mins <= 17 * 60 + 40:
        tw = parse((s.get("teamsWatch") or {}).get("asOf"))
        if not tw or (now - tw).total_seconds() > 130 * 60:
            add("hourly", "Hourly run (Teams watch)", "bad", "Teams was last checked %s; it should be every hour." % ago(tw, now),
                "The hourly routine is late or stuck. Press Run now on it in Control room, Routines.")
        bh = parse((s.get("bugherd") or {}).get("checkedAt"))
        if not bh or bh.astimezone(CT).strftime("%Y-%m-%d") != today:
            add("casesjob", "Cases, alerts and BugHerd check", "warn", "Last ran %s (expected 7:12, 12:12 and 3:12)." % ago(bh, now),
                "It runs inside the hourly; if the hourly is fine, this clears at the next slot.")
        ms = parse((s.get("mailSweep") or {}).get("asOf"))
        if not ms or (now - ms).total_seconds() > 26 * 3600:
            add("sweep", "Missed-mail sweep", "warn", "Last swept %s (expected every weekday at 7:12)." % ago(ms, now),
                "Ask in Live chat: run the missed-mail sweep now.")
        up = parse(s.get("updated"))
        if up and (now - up).total_seconds() > 4 * 3600:
            add("saved", "Board saves", "warn", "Nothing has saved to the board for %s." % ago(up, now).replace(" ago", ""),
                "If routines should have run, check the hourly.")
    # live chat
    items = ((s.get("chat") or {}).get("items")) or []
    replied = {x.get("re") for x in items if x.get("role") == "claude"}
    dead = [x for x in items if x.get("role") == "user" and x.get("err") and x.get("id") not in replied
            and parse(x.get("t")) and (now - parse(x.get("t"))).total_seconds() < 48 * 3600]
    if dead:
        add("chat", "Live chat", "bad", "%d message%s never reached Claude (newest: %s)." % (len(dead), "" if len(dead) == 1 else "s", ago(parse(dead[-1].get("t")), now)),
            "Open Live chat and press Send again; the hourly also answers them.")
    stuck = [c for c in (s.get("chats") or []) if c.get("st") in ("needs you", "failed")
             and parse(c.get("t")) and (now - parse(c.get("t"))).total_seconds() < 48 * 3600]
    if stuck:
        add("chats", "Board chats", "warn", "%d board chat%s stopped and wait%s on you." % (len(stuck), "" if len(stuck) == 1 else "s", "s" if len(stuck) == 1 else ""),
            "Open them from Live chat, Your board chats.")
    # PC jobs, from run receipts (state.runs keeps only the newest rows, so only daily jobs are judged)
    runs = [r for r in (s.get("runs") or []) if r and r.get("at")]
    last = {}
    for r in runs:
        j = r.get("job")
        d = parse(r.get("at"))
        if d and (j not in last or d > last[j][0]):
            last[j] = (d, r)
    lim = 100 if nct.weekday() in (0, 6) else 52  # hours; Monday allows the weekend
    if runs:
        for job in ("Handshake daily check", "Alert run", "PC worker", "Marketing Category Report"):
            if job in last:
                d, r = last[job]
                if r.get("status") == "failed":
                    add("pc:" + job, job, "bad", "Last run failed %s: %s" % (ago(d, now), str(r.get("summary") or "")[:140]),
                        "On your PC: Claude desktop, Scheduled, %s, Run now." % job)
                elif (now - d).total_seconds() > lim * 3600:
                    add("pc:" + job, job, "warn", "No run receipt since %s." % ago(d, now),
                        "On your PC: Claude desktop, Scheduled, %s. Stop it if it shows running, then Run now." % job)
        for j, (d, r) in last.items():
            if r.get("status") == "failed" and (now - d).total_seconds() < 48 * 3600 and not any(w["id"] == "pc:" + j for w in wd):
                add("pc:" + j, j, "bad", "Last run failed %s: %s" % (ago(d, now), str(r.get("summary") or "")[:140]), "Open its run receipt in Control room, Sources.")
    for k, v in (s.get("sources") or {}).items():
        if isinstance(v, dict) and v.get("health") not in ("ready", None):
            add("src:" + k, (v.get("name") or k) + " sign-in", "warn", "%s shows %s." % (v.get("name") or k, str(v.get("health")).replace("_", " ")),
                "Sign in to %s on your PC (the Log in button opens every sign-in page)." % (v.get("name") or k))
    bs = parse((s.get("bugherdSweep") or {}).get("asOf"))
    if not bs or (now - bs).total_seconds() > 4 * 86400:
        add("bhsweep", "BugHerd live pull (PC)", "warn", "BugHerd was last read live %s; since then the board relies on BugHerd emails." % ago(bs, now),
            "On your PC: Claude desktop, Scheduled, BugHerd sweep, Run now.")
    cs = parse((s.get("casesSweep") or {}).get("asOf"))
    if not cs or (now - cs).total_seconds() > 4 * 86400:
        add("cssweep", "NetSuite cases check (PC)", "warn", "The NetSuite cases check has %s." % ("never written to the board" if not cs else "not written since " + ago(cs, now)),
            "On your PC: Claude desktop, Scheduled, cases sweep 16559, Run now. Until then cases come from the alert emails.")

    # ---- evaluator: board and task quality ----
    openT = [t for t in tasks if not t.get("done") and not t.get("dropped") and not str(t.get("group", "")).startswith("idea-")]
    work = [t for t in openT if t.get("group") not in ("bugherd", "cases", "frozen")]
    checks, top = [], []

    def chk(id_, label, bad_tasks, weight, target, detail, fix):
        n = len(bad_tasks)
        checks.append({"id": id_, "label": label, "count": n, "ok": n <= target, "weight": weight, "detail": detail,
                       "ids": [t["id"] for t in bad_tasks[:8]]})
        for t in bad_tasks[:2]:
            top.append({"taskId": t["id"], "title": str(t.get("title", ""))[:90], "issue": label, "fix": fix})
        return n

    def days_old(ts):
        d = parse(ts)
        return (now - d).days if d else 0

    no_why = [t for t in work if not t.get("why")]
    chk("why", "No reason given", no_why, 0.5, 5, "Open tasks with no why line, so it isn't clear what they are for.", "Press Dig deeper on it, or add one line saying why it matters.")
    no_src = [t for t in work if not (t.get("source") or t.get("from") or t.get("mail") or t.get("sourceLink"))]
    chk("source", "No source", no_src, 0.5, 3, "Open tasks with no email, person or source to trace them to.", "Press Dig deeper so Claude finds where it came from.")
    overdue = [t for t in work if t.get("due") and t["due"] < today and days_old(t["due"]) > 7 and not t.get("hold")]
    chk("overdue", "More than a week overdue", sorted(overdue, key=lambda t: t["due"]), 1.5, 2, "Open work past its date by more than 7 days and not on hold.", "Do it, hand it to Claude, re-date it or mark it no longer needed.")
    nostep = [t for t in openT if t.get("assignee") == "claude" and t.get("claudeStatus") == "blocked" and not (t.get("unlockBy") or t.get("needs") or t.get("approvalNeeded"))]
    chk("nostep", "Needs you, but no next step", nostep, 2, 0, "Claude stopped on these without saying the one thing you must do.", "Claude should set the single next step (unlockBy) on it.")
    stale = [t for t in openT if t.get("claudeStatus") == "ready" and days_old((t.get("receipt") or {}).get("at")) >= 3]
    chk("review", "Waiting for your review 3+ days", stale, 1.5, 1, "Claude finished these and they haven't been looked at.", "Open it, then Done or Send back.")
    norc = [t for t in openT if (t.get("receipt") or {}).get("status") == "done" and not (t.get("receipt") or {}).get("where")]
    chk("proof", "Marked done by Claude with no link", norc, 2, 0, "A result with no link to where the work is.", "Claude should add where the result lives.")
    appr = [t for t in openT if t.get("pcOnly") and t.get("goAsk") and not t.get("approved") and not t.get("hold") and days_old(t.get("since")) >= 2]
    chk("approve", "Approvals waiting 2+ days", appr, 1, 1, "Fixes that are ready and wait only for your go.", "Approvals tab: say go or No.")
    seen, dups = {}, []
    for t in work:
        k = re.sub(r"[^a-z0-9 ]", "", str(t.get("title", "")).lower())[:60].strip()
        if len(k) > 12:
            if k in seen:
                dups.append(t)
            seen.setdefault(k, t)
    chk("dups", "Possible duplicates", dups, 1, 1, "Open tasks whose titles match another open task.", "Tasks tab, Possible duplicates.")
    held = [t for t in openT if t.get("hold") and days_old((t.get("hold") or {}).get("on")) >= 5]
    chk("hold", "On hold 5+ days", held, 0.5, 2, "Held with no movement.", "Resume it or mark it no longer needed.")
    # stored contact details (rule: never store email addresses or phone numbers on the board)
    em = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
    ph = re.compile(r"(?<!\d)(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?!\d)")

    def text_of(t):
        parts = [str(t.get(k, "")) for k in ("title", "note", "why", "question")]
        parts += [str(x.get("text", "")) for x in (t.get("thread") or []) if isinstance(x, dict)]
        return " ".join(parts)

    def personal_phone(txt):
        # toll-free numbers are company lines (for example a support number in policy wording), not personal
        return any(not re.match(r"\D*1?\D*8(00|33|44|55|66|77|88)\D", m.group(0)) for m in ph.finditer(txt))

    pii = [t for t in tasks if not t.get("done") and (em.search(text_of(t)) or personal_phone(text_of(t)))]
    chk("contact", "Email address or phone number stored", pii, 3, 0, "Your rule: no email addresses or phone numbers on the board.", "Claude should remove the address or number from the task text.")

    score = 100.0
    for c in checks:
        score -= min(15.0, c["weight"] * max(0, c["count"] - (1 if c["ok"] else 0)) * (0 if c["ok"] else 1))
    kb = len(raw) // 1024
    if kb > 1200:
        score -= 5
    checks.append({"id": "size", "label": "Board data size", "count": kb, "ok": kb <= 1200, "weight": 0,
                   "detail": "%d KB of data (routines read all of it every run; under 1,200 KB is fine)." % kb, "ids": []})
    score -= 6 * sum(1 for w in wd if w["level"] == "bad") + 2 * sum(1 for w in wd if w["level"] == "warn")
    score = int(max(0, min(100, round(score))))

    # outcome numbers, last 7 days
    wk = (nct - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    closed = [t for t in tasks if t.get("done") and str(t.get("doneOn", "")) >= wk and not t.get("dropped")]
    rc = [t for t in tasks if (t.get("receipt") or {}).get("at") and str(t["receipt"]["at"])[:10] >= wk]
    blocks = [b for d, v in (s.get("days") or {}).items() if d >= wk for b in (v.get("blocks") or [])]
    metrics = {
        "openTasks": len(openT), "closed7": len(closed),
        "claudeDone7": sum(1 for t in rc if t["receipt"].get("status") == "done"),
        "claudeNeedsYou7": sum(1 for t in rc if t["receipt"].get("status") == "needs_you"),
        "planTicked7": (round(100 * sum(1 for b in blocks if b.get("done")) / len(blocks)) if blocks else None),
        "minutesSaved": sum(int(r.get("minutesSaved") or 0) for r in runs),
    }
    bad = sum(1 for w in wd if w["level"] == "bad")
    warn = sum(1 for w in wd if w["level"] == "warn")
    out = {"asOf": now.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "day": today, "bad": bad, "warn": warn,
           "watchdog": sorted(wd, key=lambda w: 0 if w["level"] == "bad" else 1),
           "evaluator": {"score": score, "checks": checks, "top": top[:10], "metrics": metrics}}
    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()
