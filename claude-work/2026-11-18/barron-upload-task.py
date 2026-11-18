# Brody, Nov 18: "For my todo list for tomorrow have me upload some barron items to the store."
import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
s=json.loads(m.group(2).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
if 'bq1118-1' not in T:
  s['tasks'].insert(0,{"id":"bq1118-1","group":"now","title":"Upload Barron items to the new Barron Miva store","note":"Brody, Nov 18: upload some Barron items to the store tomorrow. Start with the items picked for the store (in1117-2). Keep Barron's product copy and URLs where they exist so we don't lose rankings. Note: Ethan's Nov 3 hold on uploading new product images and drawings (in1103-2) is still open, so check with him before uploading images.","due":"2026-11-19","done":False,"since":"2026-11-18","source":"Brody asked in chat, Nov 18","from":"Brody","top":True,"relatedTaskIds":["in1117-2","br1117-1","in1103-2"]})
p=s.get('priority')
if p and 'bq1118-1' not in p['taskIds']:p['taskIds'].insert(0,'bq1118-1')
for pr in s.get('weekPlan',{}).get('projects',[]):
  if pr.get('id')=='p-barron' and 'bq1118-1' not in pr['taskIds']:
    pr['taskIds'].insert(0,'bq1118-1');pr['next'].insert(0,"Thu Nov 19: upload the first Barron items to the new store")
for d in s.get('weekPlan',{}).get('days',[]):
  if d.get('date')=='2026-11-19':
    d.setdefault('due',[]);
    if "Upload Barron items to the store" not in d['due']:d['due'].insert(0,"Upload Barron items to the store")
s['updated']=NOW
j=json.dumps(s,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
open(sys.argv[2],'w').write(h[:m.start(2)]+j+h[m.end(2):]);print('ok')
