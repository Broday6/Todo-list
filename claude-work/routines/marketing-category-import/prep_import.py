"""Get the daily Marketing Category import files ready for NetSuite (runs on Brody's PC).

The cloud routine "Marketing Category Report" pushes one CSV per item Type to
marketing-category/imports/ on branch claude/admiring-mayer-9myyi8. For every
file not imported yet, this script checks it against Brody's limits (Nov 10,
2026: auto-import, but only fill blank values, and hold guessed rows, items
that already have a value and very large files for his OK) and writes:

  <work>/<file stem>/import.csv   only Internal ID + Marketing Product Categories
  <work>/<file stem>/held.csv     rows waiting for Brody's OK, with the reason
  <work>/<file stem>/plan.json    counts, SHA-256, record type, spot-check items

It prints one JSON summary and never touches NetSuite.

  python prep_import.py plan --repo <Todo-list clone> --work <dir>
         [--already-set pull.csv ...] [--approve <sha256> ...] [--no-fetch]
  python prep_import.py mark --work <dir> --sha <sha256> --job <n>
         --processed <n> --updated <n> --errors <n>

"plan" again with --already-set (a NetSuite pull of the file's items that
already have a Marketing Product Categories value) holds those items too.
"--approve <sha>" is Brody's OK for that file's held rows: the next plan
offers its guessed / mismatch / large-file rows for import.
"""
import argparse
import csv
import datetime as dt
import hashlib
import io
import json
import os
import re
import subprocess
import sys

BRANCH = "claude/admiring-mayer-9myyi8"
IMPORTS = "marketing-category/imports/"
TOOL = "marketing-category/split_by_type.py"
CATEGORY_MAP = "marketing-category/category_map.json"
MAX_ROWS = 5000  # bigger files wait for Brody (NetSuite's own cap is 25,000)

# Files Brody already OK'd in full, guessed rows included.
PRE_APPROVED = {
    "2ab95c0bb8b20b61798e64d234584fbd0e79333c29061a083efc206428fd04c2":
        "Brody asked for this upload on 2026-11-10, including the 2 Paints touch-up kits",
}

APPROVABLE = {"guessed", "mismatch", "large-file"}


def git(repo, *args):
    return subprocess.run(["git", "-C", repo, *args], check=True,
                          capture_output=True).stdout


def load_rules(repo, ref):
    """category_for() and the known Marketing values, from the split tool on the branch."""
    ns = {"__name__": "split_by_type", "__file__": "split_by_type.py"}
    exec(compile(git(repo, "show", f"{ref}:{TOOL}").decode("utf-8"), TOOL, "exec"), ns)
    mapping = json.loads(git(repo, "show", f"{ref}:{CATEGORY_MAP}").decode("utf-8-sig"))
    known = set(mapping.values()) | set(ns["PREFIX_RULES"].values())
    known |= {mc for _, mc in ns["DESCRIPTION_RULES"]}

    def confirmed(product_category):
        # The category from a Product Category rule Brody set (category_map.json,
        # GV, "Samples - X", same prefix). Blank means it was filled from words in
        # the description, which counts as a guess.
        return ns["category_for"](product_category, mapping, set(mapping.values()))

    return confirmed, known


def col(fields, name):
    for f in fields:
        if f.strip().lower() == name:
            return f
    raise SystemExit(f"Missing column {name!r}; got {fields}")


def read_ledger(work):
    path = os.path.join(work, "ledger.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {}


def write_ledger(work, ledger):
    with open(os.path.join(work, "ledger.json"), "w", encoding="utf-8") as f:
        json.dump(ledger, f, indent=1)


def read_already_set(paths):
    ids = set()
    for p in paths or []:
        with open(p, encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            id_col = col(reader.fieldnames, "internal id")
            ids |= {r[id_col].strip() for r in reader if r[id_col].strip()}
    return ids


def write_csv(path, fields, rows):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def plan_file(name, data, confirmed, known, already_set, approved, prior):
    sha = hashlib.sha256(data).hexdigest()
    stem = os.path.splitext(os.path.basename(name))[0]
    reader = csv.DictReader(io.StringIO(data.decode("utf-8-sig"), newline=""))
    fields = reader.fieldnames
    id_c, mc_c = col(fields, "internal id"), col(fields, "marketing product categories")
    type_c, pc_c = col(fields, "type"), col(fields, "product categories")
    rows = list(reader)
    approved_note = PRE_APPROVED.get(sha) or ("Brody OK'd held rows" if sha in approved else "")

    # A file already imported comes back only for rows Brody has since OK'd.
    if prior:
        if sha not in approved:
            return None
        retry = {i for i, why in prior.get("held", {}).items() if why in APPROVABLE}
        rows = [r for r in rows if r[id_c].strip() in retry]
        if not rows:
            return None

    types = {r[type_c].strip() for r in rows}
    seen, keep, held = set(), [], []
    for r in rows:
        iid, mc = r[id_c].strip(), r[mc_c].strip()
        rule = confirmed(r[pc_c])
        if not iid.isdigit() or iid in seen:
            why = "bad-id"
        elif not mc or mc not in known:
            why = "unknown-value"
        elif iid in already_set:
            why = "already-set"
        elif len(types) != 1:
            why = "mixed-types"
        elif not approved_note and len(rows) > MAX_ROWS:
            why = "large-file"
        elif not approved_note and not rule:
            why = "guessed"
        elif not approved_note and rule != mc:
            why = "mismatch"
        else:
            why = ""
        seen.add(iid)
        (held if why else keep).append(dict(r, Reason=why) if why else r)

    spot, cats = [], set()
    for r in keep:
        if r[mc_c] not in cats and len(spot) < 2:
            spot.append({"internal_id": r[id_c], "name": r.get(col(fields, "name"), ""),
                         "expect": r[mc_c]})
            cats.add(r[mc_c])
    for r in keep:
        if len(spot) >= 2:
            break
        if r[id_c] not in {s["internal_id"] for s in spot}:
            spot.append({"internal_id": r[id_c], "name": r.get(col(fields, "name"), ""),
                         "expect": r[mc_c]})

    m = re.match(r"(\d{4}-\d{2}-\d{2})", stem)
    age = (dt.date.today() - dt.date.fromisoformat(m.group(1))).days if m else None
    counts = {}
    for r in keep:
        counts[r[mc_c]] = counts.get(r[mc_c], 0) + 1
    reasons = {}
    for r in held:
        reasons[r["Reason"]] = reasons.get(r["Reason"], 0) + 1
    return {
        "file": name, "stem": stem, "sha256": sha, "rows_in_file": len(rows),
        "record_type": types.pop() if len(types) == 1 else sorted(types),
        "product_categories": sorted({r[pc_c].strip() for r in rows}),
        "import_rows": len(keep), "import_counts": counts,
        "held_rows": len(held), "held_reasons": reasons,
        "approved": approved_note, "retry_of_held": bool(prior),
        "age_days": age, "spot_check": spot,
        "run_id": f"marketing-category-import@{stem}",
        "_keep": [{"Internal ID": r[id_c].strip(),
                   "Marketing Product Categories": r[mc_c].strip()} for r in keep],
        "_held": held, "_fields": fields,
    }


def cmd_plan(a):
    os.makedirs(a.work, exist_ok=True)
    if not a.no_fetch:
        git(a.repo, "fetch", "-q", "origin", BRANCH)
    ref = f"origin/{BRANCH}"
    confirmed, known = load_rules(a.repo, ref)
    names = [n for n in git(a.repo, "ls-tree", "-r", "--name-only", ref, IMPORTS)
             .decode("utf-8").splitlines() if n.lower().endswith(".csv")]
    ledger = read_ledger(a.work)
    already_set = read_already_set(a.already_set)
    approved = set(a.approve or [])
    pending, done = [], []
    for name in sorted(names):
        data = git(a.repo, "show", f"{ref}:{name}")
        sha = hashlib.sha256(data).hexdigest()
        p = plan_file(name, data, confirmed, known, already_set, approved, ledger.get(sha))
        if p is None:
            done.append(os.path.basename(name))
            continue
        out = os.path.join(a.work, p["stem"])
        os.makedirs(out, exist_ok=True)
        write_csv(os.path.join(out, "import.csv"),
                  ["Internal ID", "Marketing Product Categories"], p.pop("_keep"))
        write_csv(os.path.join(out, "held.csv"), p.pop("_fields") + ["Reason"], p.pop("_held"))
        p["import_csv"] = os.path.join(out, "import.csv")
        p["held_csv"] = os.path.join(out, "held.csv")
        with open(os.path.join(out, "plan.json"), "w", encoding="utf-8") as f:
            json.dump(p, f, indent=1)
        pending.append(p)
    print(json.dumps({"pending": pending, "already_imported": done}, indent=1))


def cmd_mark(a):
    ledger = read_ledger(a.work)
    plans = [os.path.join(a.work, d, "plan.json") for d in os.listdir(a.work)
             if os.path.exists(os.path.join(a.work, d, "plan.json"))]
    plan = None
    for path in plans:
        with open(path, encoding="utf-8") as f:
            p = json.load(f)
        if p["sha256"] == a.sha:
            plan = p
    if plan is None:
        raise SystemExit(f"No plan.json in {a.work} for {a.sha}")
    with open(plan["held_csv"], encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        id_c = col(reader.fieldnames, "internal id")
        held = {r[id_c].strip(): r["Reason"] for r in reader}
    entry = ledger.get(a.sha, {"file": plan["file"], "jobs": []})
    entry["jobs"].append({"job": a.job, "processed": a.processed, "updated": a.updated,
                          "errors": a.errors, "at": dt.datetime.now().isoformat(timespec="minutes"),
                          "retry_of_held": plan["retry_of_held"]})
    if plan["retry_of_held"]:
        old = entry.get("held", {})
        retried = {k for k, v in old.items() if v in APPROVABLE}
        entry["held"] = {k: v for k, v in old.items() if k not in retried}
        entry["held"].update(held)
    else:
        entry["held"] = held
    ledger[a.sha] = entry
    write_ledger(a.work, ledger)
    print(json.dumps({"marked": plan["stem"], "held_left": len(entry["held"])}))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("plan")
    p.add_argument("--repo", required=True)
    p.add_argument("--work", required=True)
    p.add_argument("--already-set", action="append")
    p.add_argument("--approve", action="append")
    p.add_argument("--no-fetch", action="store_true")
    m = sub.add_parser("mark")
    m.add_argument("--work", required=True)
    m.add_argument("--sha", required=True)
    for k in ("job", "processed", "updated", "errors"):
        m.add_argument(f"--{k}", required=True)
    a = ap.parse_args(argv)
    (cmd_plan if a.cmd == "plan" else cmd_mark)(a)


if __name__ == "__main__":
    sys.exit(main())
