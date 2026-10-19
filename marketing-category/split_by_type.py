"""Split the NetSuite "E-Commerce Lead: Products Without Marketing Category"
report into one import-ready CSV per item Type, with Marketing Product
Categories filled in from the item's Product Category.

    python3 split_by_type.py searchresults.csv out/2026-10-19

Writes one "<Type>.csv" per item Type (e.g. "Assembly-Bill of Materials.csv")
holding only rows whose category could be filled, plus "Needs review.csv"
for rows whose Product Category isn't in category_map.json, and prints a
summary. NetSuite's CSV import takes one record type per file, which is why
the split is by Type.
"""
import csv
import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))


def read_rows(path):
    raw = open(path, "rb").read()
    for enc in ("utf-8-sig", "cp1252"):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    reader = csv.DictReader(text.splitlines())
    return reader.fieldnames, list(reader)


def find_col(fields, *names):
    lowered = {f.strip().lower(): f for f in fields}
    for n in names:
        if n in lowered:
            return lowered[n]
    sys.exit(f"Missing column, expected one of {names}; got {fields}")


def category_for(product_category, mapping, marketing_values):
    pc = product_category.strip()
    if pc in mapping:
        return mapping[pc]
    # "Columns - Round" -> "Columns", "Shutters - Steel" -> "Shutters"
    prefix = pc.split(" - ")[0].strip()
    for known_pc, mc in mapping.items():
        if known_pc.split(" - ")[0].strip() == prefix and " - " in known_pc:
            return mc
    if prefix in marketing_values:
        return prefix
    return ""


def safe_name(item_type):
    return re.sub(r'[\\/:*?"<>|]+', "-", item_type).strip() or "No Type"


def main(src, out_dir):
    mapping = json.load(open(os.path.join(HERE, "category_map.json")))
    marketing_values = set(mapping.values())
    fields, rows = read_rows(src)
    type_col = find_col(fields, "type")
    name_col = find_col(fields, "name")
    pc_col = find_col(fields, "product categories", "product category")
    mc_col = find_col(fields, "marketing product categories", "marketing product category")

    by_type = defaultdict(list)
    review = []
    cats = Counter()
    for r in rows:
        if not r.get(mc_col, "").strip():
            r[mc_col] = category_for(r.get(pc_col, ""), mapping, marketing_values)
        if r[mc_col]:
            by_type[r[type_col].strip()].append(r)
            cats[r[mc_col]] += 1
        else:
            review.append(r)

    os.makedirs(out_dir, exist_ok=True)

    def write(fname, data):
        with open(os.path.join(out_dir, fname), "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(data)

    for t, data in sorted(by_type.items()):
        write(f"{safe_name(t)}.csv", sorted(data, key=lambda r: r[name_col]))
    if review:
        write("Needs review.csv", review)

    print(f"{len(rows)} rows in {os.path.basename(src)}")
    for t, data in sorted(by_type.items()):
        print(f"  {safe_name(t)}.csv: {len(data)}")
    for c, n in cats.most_common():
        print(f"  category {c}: {n}")
    print(f"  Needs review.csv: {len(review)}"
          + (" (" + ", ".join(sorted({r[pc_col] or '(blank)' for r in review})) + ")" if review else ""))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
