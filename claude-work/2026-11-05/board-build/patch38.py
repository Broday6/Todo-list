import sys,re,json,datetime
# patch38 (Nov 10, data only): Brody's case rules. Close cases already assigned to Kody; mark the rest for the PC
# worker's NetSuite read; note the new flow on the Cases block.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'));now=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z');today=s['today']
closed=[]
for t in s['tasks']:
    if t.get('group')!='cases' or t.get('done'):continue
    txt=json.dumps(t.get('thread',[]))+json.dumps(t.get('case',{}))+str(t.get('note',''))
    kody=(t.get('case') or {}).get('assignedTo','').startswith('Kody') or 'Assigned To Kody' in txt or 'assigned To is Kody' in txt
    if kody:
        t.update({'done':True,'doneOn':today,'doneVia':'asked','dropped':{'reason':"Assigned to Kody in NetSuite (Brody's Nov 10 rule)",'t':now},'assignee':''})
        t.pop('claudeStatus',None);t.pop('pcLookup',None)
        t.setdefault('thread',[]).append({'role':'claude','t':now,'text':"Closed on your board: this case is Kody's (Home Depot special order, Assigned To Kody Goss). Your Nov 10 rule: cases assigned to Kody don't show on your list."})
        closed.append(t['id'])
    else:
        t['pcLookup']={'what':'Read case %s in NetSuite: Assigned To, channel, vendor message, cancel reason, quick notes, order lines'%((t.get('case') or {}).get('no') or t['id'][2:]),'kind':'read','t':now}
        t['unlockBy']='The PC worker reads it in NetSuite, hands it to Kody if it is a marketplace order, and otherwise Claude proposes the fix.'
d=s['days'].get(today)
if d:
    for b in d.get('blocks',[]):
        if b['title'].startswith('Cases') and not b.get('done'):
            b['sub']='Daily · 20 min. New: Claude reads each case in NetSuite (via your PC), hands Amazon, Lowe’s, Home Depot and Wayfair cases to Kody, and brings you the rest with a proposed fix. Open the Cases tab.'
    if closed and not any('Closed case' in str(x.get('text','')) for x in d.get('log',[])):
        d.setdefault('log',[]).append({'t':datetime.datetime.now().strftime('%H:%M'),'text':'Closed case %s on your board: it is assigned to Kody. The other open cases are queued for a NetSuite read and a proposed fix.'%', '.join(c[2:] for c in closed),'kind':'claude','by':'Claude'})
NOTE=" CASES (Brody, Nov 10, patch38): cases assigned to Kody never show on Brody's board; Amazon, Lowe's, Home Depot and Wayfair cases are reassigned to Kody by the PC worker (standing OK for that one field); Brody's cases get task.case.facts from the PC and a proposed solution from the hourly Cases job (Notion job page step 2c)."
if 'CASES (Brody, Nov 10, patch38)' not in s['_note']:s['_note']+=NOTE
s['updated']=now
open(out,'w').write(h[:m.start(1)]+json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+h[m.end(1):]);print('ok closed',closed)
