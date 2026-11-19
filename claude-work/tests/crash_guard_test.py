# Nov 19: break receipts the way outside writers did (text instead of lists) and check the board still draws.
import json,re,sys,subprocess,os
src,tmp=sys.argv[1],sys.argv[2]
h=open(src).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
t=[x for x in s['tasks'] if not x.get('done')][:3]
for x in t: x['receipt']={"at":"2026-11-19T20:00:00Z","status":"done","summary":"guard test","did":"one line of text","where":"C:/some/path and https://example.com","unsure":"text"}
open(tmp,'w').write(h[:m.start(1)]+json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+h[m.end(1):])
js=os.path.join(os.path.dirname(os.path.abspath(__file__)),'crash_guard_check.js')
r=subprocess.run(['node',js,os.path.abspath(tmp)],capture_output=True,text=True);print(r.stdout.strip());sys.exit(0 if 'PASS' in r.stdout else 1)
