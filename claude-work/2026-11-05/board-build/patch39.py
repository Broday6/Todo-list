import sys,re,json,datetime
# patch39 (Nov 10, data only): Brody "remove this repeating task: Follow up with Andrew's ads" ("just andrews ads").
# Drops today's block, turns off its daily prep, records the rule. Also fixes two log times written in UTC.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'));now=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
d=s['days'].get(s['today'])
if d:
    d['blocks']=[b for b in d['blocks'] if not (b.get('title','').startswith("Follow up with Andrew's ads") and not b.get('done'))]
    for l in d.get('log',[]):
        if l.get('t')=='15:06' and l.get('text','').startswith('Queued 4 cases'):l['t']='09:06'
        if l.get('t')=='15:08' and l.get('text','').startswith('Closed case'):l['t']='09:08'
    if not any("Andrew’s ads block" in str(x.get('text','')) for x in d.get('log',[])):
        d['log'].append({'t':(datetime.datetime.utcnow()-datetime.timedelta(hours=6)).strftime('%H:%M'),'text':'Removed the daily “Follow up with Andrew’s ads” block, as you asked. It won’t be added or prepped again; everything else on the plan stays.','kind':'claude','by':'Claude'})
for p in s.get('playbooks',[]):
    if p['id']=='blk-ads':
        p['mode']='manual';p['retired']={'t':now,'why':"Brody, Nov 10: remove the daily Andrew's ads follow-up"};p['updated']=now;p['v']=(p.get('v') or 1)+1
        p['lb']={'mode':'manual','n':10**6}
R=s.setdefault('myRules',[])
if not any(r['id']=='mr-noads' for r in R):
    R.append({'id':'mr-noads','t':now,'text':"No daily \"Follow up with Andrew's ads\" block on the plan. Don't add it or prep it."})
s['updated']=now
open(out,'w').write(h[:m.start(1)]+json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+h[m.end(1):]);print('ok')
