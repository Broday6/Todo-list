# Nov 18: Brody "Marketing categories have been fixed." and Barron copy: "make it match their current copy but with our products" / "we dont want to lose rankings"
import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
s=json.loads(m.group(2).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ');D=NOW[:10]
for a in s.get('actions',[]):
  if a.get('key','').startswith(('mc-import|2026-11-12|','mc-import|2026-11-18|')) and a.get('status') not in('done','no','expired','superseded'):
    a['status']='superseded';a.setdefault('log',[]).append({"at":NOW,"by":"Brody","text":"Brody fixed the marketing categories himself in NetSuite. The PC worker import is not needed. Tomorrow's Products Without Marketing Category report confirms it."})
for i in ('mc-2026-11-12','mc-2026-11-18','al-marketing_category-20261111'):
  t=T.get(i)
  if t and not t.get('done'):
    t.update(done=True,doneOn=D,doneVia="brody-said")
    t.setdefault('thread',[]).append({"role":"claude","text":"Closed: you said on Nov 18 that the marketing categories are fixed. Not yet confirmed: tomorrow's Products Without Marketing Category report should no longer list these RealGrain beam items. If it does, this reopens.","t":NOW})
    t['verified']={"how":"Brody said it is fixed; to confirm in the Nov 19 Products Without Marketing Category report","at":NOW,"result":"pending"}
RULE=("Brody, Nov 18: keep Barron's current category copy (wording, headings, page titles, meta descriptions and URLs) so we don't lose rankings. "
 "Only swap the product references to our products and our product facts. If any URL has to change, it needs a 301 redirect from the old Barron/AZ Faux URL.")
t=T['br1117-4']
t['note']="Paul copied the categories. Every copied category needs intro copy and the right products, with no empty pages. "+RULE
t.update(answer="Make it match their current copy but with our products. We don't want to lose rankings.",answeredAt=NOW,claudeStatus="queued")
t.pop('blockedBy',None)
t.setdefault('thread',[]).append({"role":"user","text":"barron category copy we need to make it match their current copy but with our products. we dont want to lose rankings","t":NOW})
t.setdefault('thread',[]).append({"role":"claude","text":"Got it. For each of the 46 categories I'll pull Barron's live copy (H1, intro, page title, meta description, URL) and keep it as close to word-for-word as possible, changing only product names, specs and facts to ours. I'll flag any URL that differs between the old Barron/AZ Faux site and the new store so it gets a 301. The draft goes in the repo for your review; nothing is changed in Miva without your OK.","t":NOW})
for i in ('br1117-1','br1117-5','br1117-6'):
  if i in T and RULE not in T[i].get('note',''):T[i]['note']=T[i].get('note','')+" "+RULE
if s.get('priority'):s['priority']['seo']=RULE
s['updated']=NOW
j=json.dumps(s,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
open(sys.argv[2],'w').write(h[:m.start(2)]+j+h[m.end(2):]);print('ok')
