import re,json,sys,os
f,out,NOW=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
J=open(D+'/bhc.js').read()
def rep(a,b):
    global h
    c=h.count(a); assert c==1,(a[:90],c); h=h.replace(a,b)
if 'function bhCloseQueue' not in h:
    rep("  function closeTask(t,how){\n",J+"  function closeTask(t,how){\n")
    rep("  function setTaskDone(t,done){\n","  function setTaskDone(t,done){\n    if(t&&t.group===\"bugherd\"&&t.bh){if(done&&!t.done)bhCloseQueue(t);else if(!done&&t.bh.closeAsk&&!t.bh.closedAt){delete t.bh.closeAsk;delete t.bh.closeErr;}}\n")
    rep("""    if(t.done)return '<span class="cl-state">'+(t.dropped?'Not needed':'Done')+'</span>""","""    if(t.done)return '<span class="cl-state">'+(t.dropped?'Not needed':'Done')+'</span>'+bhCloseTag(t)+'""")
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
N=" BUGHERD CLOSE (Brody, Nov 5: \"if I mark done here you need to mark it as done as well\", \"use a chrome browser extension\"): when Brody ticks Done on a BugHerd task, the board sets task.bh.closeAsk. Only the \"Ultron — BugHerd close\" scheduled task on Brody's PC closes tickets, using Claude in Chrome: it opens each done task with bh.closeAsk and no bh.closedAt, sets that ticket's status to Done in BugHerd, and sets bh.closedAt (or bh.closeErr with one short line). Cloud routines never close tickets and never set closedAt. This is the only BugHerd change allowed: never move other tickets, never send to Web Dev, never comment."
if 'BUGHERD CLOSE' not in s['_note']: s['_note']+=N
d=s['days'][s['today']]
if not any('closes it in BugHerd' in (l.get('text') or '') for l in d['log']):
    d['log'].append({"t":"12:25","text":"Done on a BugHerd ticket now queues it to close in BugHerd. A scheduled task on your PC closes it there with Claude in Chrome (set it up once in Claude desktop > Scheduled).","kind":"claude","by":"Claude"})
s['updated']=NOW
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(out,'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):]); print('ok',ind)
