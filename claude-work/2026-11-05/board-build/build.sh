set -e
cd "$(dirname "$0")"
python3 unwrap.py "$1" u.html
python3 patch.py u.html s1.html "$2" >/dev/null && python3 patch2.py s1.html s2.html "$2" >/dev/null && python3 patch3.py s2.html s3.html "$2" >/dev/null && python3 patch4.py s3.html "$3" x
python3 patch5.py "$3" "$3.tmp" "$2" && mv "$3.tmp" "$3"
