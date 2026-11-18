# Brody, Nov 18: "Major priority for the next two weeks will be making sure barron gets fully launched."
import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
s=json.loads(m.group(2).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
BR=[i for i in ["in1118-1","in1117-2","br1117-1","br1117-2","br1117-3","br1117-4","br1117-5","br1117-6","in1117-1"] if i in T]
s['priority']={"title":"Barron fully launched","from":"2026-11-18","until":"2026-12-02","by":"Brody, Nov 18",
 "why":"Major priority for the next two weeks: the new Barron Miva store and AZ Faux Beams fully launched.",
 "rule":"Every working day through Dec 2: a 60-90 min Barron block before noon, at least one Barron item in the Top 3, Barron tasks first when work doesn't fit, and Barron emails answered same day.","taskIds":BR}
wp=s['weekPlan']
wp['headline']="Barron is the top priority until Dec 2: get the new Barron Miva store and AZ Faux Beams fully launched. Black Friday still has to go out (first email Wed 11/25), and hiring keeps moving around it."
wp['top']=["Barron launch: transfer call with McKenzie, store item list, product data, category copy and key pages, then a final check (target Dec 2)","Black Friday: fix Daniel's TEST email notes and set the Advaning promo pricing (starts Sun 11/23)","Hiring: decide on Ashanti, Byron and Maneesha"]
ps=wp.get('projects',[]);pb=next((p for p in ps if p.get('id')=='p-barron'),None)
if pb is None:pb={"id":"p-barron"};ps.insert(0,pb)
else:ps.remove(pb);ps.insert(0,pb)
pb.update(name="Barron launch (top priority until Dec 2)",status="Transfer under way; store being built",tone="bad",
 why="Brody, Nov 18: the major priority for the next two weeks is making sure Barron gets fully launched.",
 next=["Book the transfer call with McKenzie (Pam offered Wed 12:30-2:30 CT)","Pick the items for the new Barron Miva store from barron and azfauxbeams","Replace Barron's specs and prices with ours","Every copied category gets a description and the right products; key pages get real info","Final content check, then launch"],
 taskIds=BR,due="2026-12-02",view="tasks")
for d in wp.get('days',[]):
  if d.get('date') in ('2026-11-19','2026-11-20'):
    if not d.get('focus','').startswith('Barron'):d['focus']="Barron launch first, then "+d.get('focus','')
for t in s['tasks']:
  t.setdefault('done',False)  # shape fix: PC-worker tasks arriving without done
day=s['days'].get('2026-11-18',{})
for b in day.get('blocks',[]):
  if b['id']=='n18-8' and not b.get('done') and 'in1117-2' in T:
    b.update(title="Barron: pick the items for the new store",sub="Top priority until Dec 2. Choose what goes on the new Barron Miva store from barron and azfauxbeams. The PVC Brackets review moves to the Wrap list (Claude can take it from the Tasks tab).",taskIds=["in1117-2"],top=True)
  if b['id']=='n18-12' and 'PVC Brackets' not in b['sub']:
    b['sub']=b['sub'].replace("If there's time: ","If there's time: the PVC Brackets review (Ethan, since Nov 11), ")
s['updated']=NOW
j=json.dumps(s,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
open(sys.argv[2],'w').write(h[:m.start(2)]+j+h[m.end(2):]);print('ok',BR)
