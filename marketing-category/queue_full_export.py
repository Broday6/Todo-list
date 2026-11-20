"""Queue a full export of NetSuite saved search 14260 for the PC worker.

    python3 marketing-category/queue_full_export.py <exported.csv> 2026-11-20

Use it when the daily "Products Without Marketing Category" email is capped at
10,000 rows (Brody, Nov 20, 2026: "use the link that is within that email
instead it loads a netsuite search that has ALL the skus not just the 10k
limit"). Export the email's View Results link (saved search 14260, results view,
never Edit or Save) as CSV, then run this. It:

1. fills Marketing Product Categories with split_by_type.py, in parts of at most
   25,000 rows (NetSuite's CSV import limit);
2. writes the parts to marketing-category/imports/"<date> full <file>.csv" and
   the manifest imports/<date>-full.json (status "ready");
3. marks every earlier held or ready file whose Internal IDs are all in the full
   export as superseded by it, so Brody answers one card per part;
4. sets fullExport in imports/<date>.json to "done".

It does not commit, push or import; the caller commits and pushes, and the PC
worker imports (parts over its 5,000-row standing limit wait for Brody's Go).
"""
import csv
import datetime
import glob
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
IMPORTS = os.path.join(HERE, "imports")
SOURCE = "https://362135.app.netsuite.com/app/common/search/searchresults.nl?searchid=14260"
RECORD_TYPES = {
    "Assembly-Bill of Materials": "Assembly Item (Assembly/Bill of Materials)",
    "Kit-Package": "Kit/Package Item (Kit/Package)",
    "Inventory Item": "Inventory Item (Inventory Item)",
    "Non-inventory Item": "Non-inventory Item (Non-inventory Item)",
    "Service": "Service Item (Service)",
    "Other Charge": "Other Charge Item (Other Charge)",
    "Item Group": "Item Group (Item Group)",
}
sys.dont_write_bytecode = True  # a stale .pyc is tracked in the repo; don't rewrite it
sys.path.insert(0, HERE)
import split_by_type  # noqa: E402


def ids_in(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return {r["Internal ID"] for r in csv.DictReader(f)}


def sha256(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def main(src, date, max_rows=25000):
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    fields, rows = split_by_type.read_rows(src)
    want = ["Internal ID", "Name", "Description", "Type", "Product Categories", "Marketing Product Categories"]
    if [f.strip() for f in fields] != want:
        sys.exit(f"Unexpected header {fields}; expected {want}")
    if len(rows) <= 10000:
        print(f"Warning: only {len(rows)} rows; a full export should be over 10,000.")

    tmp = tempfile.mkdtemp(prefix="mc-full-")
    split_by_type.main(src, tmp, max_rows)

    files, full_ids, review = [], set(), None
    for name in sorted(os.listdir(tmp)):
        path = os.path.join(tmp, name)
        full_ids |= ids_in(path)
        dest_name = f"{date} full {name}"
        shutil.copy(path, os.path.join(IMPORTS, dest_name))
        if name == "Needs review.csv":
            review = dest_name
            continue
        type_name = re.sub(r" part \d+ of \d+$", "", name[:-4])
        files.append({"name": dest_name, "recordType": RECORD_TYPES.get(type_name, type_name),
                      "rows": len(ids_in(path)), "sha256": sha256(os.path.join(IMPORTS, dest_name))})

    manifest_name = f"{date}-full.json"
    manifest = {"date": date, "status": "ready", "queuedBy": "queue_full_export.py",
                "source": SOURCE,
                "note": f"Full export of saved search 14260 ({len(rows)} rows), parts of at most {max_rows} rows. "
                        "Parts over the 5,000-row standing limit wait for Brody's Go (OVER_LIMIT card).",
                "files": files}
    if review:
        manifest["needsReview"] = review
    json.dump(manifest, open(os.path.join(IMPORTS, manifest_name), "w"), indent=1)

    superseded = []
    for mpath in sorted(glob.glob(os.path.join(IMPORTS, "*.json"))):
        mname = os.path.basename(mpath)
        if mname.endswith("-full.json"):
            continue
        m = json.load(open(mpath))
        if m.get("status") not in ("ready", "held"):
            continue
        changed = False
        for f in m.get("files", []):
            res = (f.get("result") or {}).get("status")
            if res in ("imported", "already-set", "superseded", "done"):
                continue
            fpath = os.path.join(IMPORTS, f["name"])
            if os.path.exists(fpath) and ids_in(fpath) <= full_ids:
                f["result"] = {"status": "superseded", "by": manifest_name, "at": now}
                superseded.append(f["name"])
                changed = True
        if changed and all((f.get("result") or {}).get("status") in ("imported", "already-set", "superseded", "done")
                           for f in m.get("files", [])):
            m["status"] = "superseded"
        if mname == f"{date}.json" and "fullExport" in m:
            m["fullExport"].update({"status": "done", "rows": len(rows), "at": now, "manifest": manifest_name})
            changed = True
        if changed:
            json.dump(m, open(mpath, "w"), indent=1)

    print(f"{len(rows)} rows -> {manifest_name}")
    for f in files:
        print(f"  {f['name']}: {f['rows']} rows ({f['recordType']})")
    if review:
        print(f"  Needs review: {review}")
    print(f"  superseded {len(superseded)} earlier file(s): {', '.join(superseded) or 'none'}")


if __name__ == "__main__":
    args = sys.argv[1:]
    mr = 25000
    if "--max-rows" in args:
        i = args.index("--max-rows")
        mr = int(args[i + 1])
        del args[i:i + 2]
    if len(args) != 2:
        sys.exit(__doc__)
    main(args[0], args[1], mr)
