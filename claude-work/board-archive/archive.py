"""Trim Brody's board: move days older than 14 days into days.json and keep stubs; keep days[*].ops for the newest 2 days only.
usage: python3 archive.py <board.html> <out.html> <days.json> <TODAY YYYY-MM-DD>
Prints what moved. Only the state JSON changes; style and app scripts stay byte-for-byte."""
import json,sys,datetime
src,dst,arch,TODAY=sys.argv[1:5]
s=open(src).read()
if not s.startswith("<!doctype html>\n<html"):
    i=s.find("<!doctype html>\n<html");s=s[i:]
    if s.endswith("\n</body></html>"):s=s[:-len("\n</body></html>")]
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
CUT=(datetime.date.fromisoformat(TODAY)-datetime.timedelta(days=14)).isoformat()
try: A=json.load(open(arch))
except Exception: A={"days":{},"ops":{}}
A.setdefault("days",{});A.setdefault("ops",{});A["cut"]=CUT
days=st['days'];moved=[];opsm=[]
for k in sorted(days):
    d=days[k]
    if k<CUT and not d.get('archived'):
        A["days"][k]=d
        stub={"archived":True,"log":[],"blocks":[{"id":x.get("id"),"start":x.get("start",""),"end":x.get("end",""),"title":x.get("title",""),"done":True,**({"taskIds":x["taskIds"]} if x.get("taskIds") else {})} for x in d.get("blocks",[]) if x.get("done") and not x.get("meeting")]}
        p=d.get("pulse")
        if p and p.get("found"): stub["pulse"]={"found":True,"label":p.get("label",""),"dollars":p.get("dollars"),"orders":p.get("orders")}
        w=[x for x in ((d.get("inbox") or {}).get("waiting") or []) if x.get("closed")]
        if w: stub["inbox"]={"waiting":[{"who":x.get("who",""),"what":x.get("what",""),"closed":x["closed"],**({"mail":{"subject":x["mail"].get("subject","")}} if x.get("mail") else {})} for x in w]}
        days[k]=stub;moved.append(k)
withops=[k for k in sorted(days) if days[k].get('ops')]
for k in withops[:-2]:
    A["ops"][k]=days[k].pop('ops');opsm.append(k)
if not moved and not opsm:
    print("nothing to archive");sys.exit(0)
st['updated']=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
open(dst,"w").write(s[:a2]+lead+newraw+trail+s[b:])
json.dump(A,open(arch,"w"),ensure_ascii=False,indent=1)
print("archived days",moved,"ops",opsm)
