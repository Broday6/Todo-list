import re,json,sys,os
f,out,NOW=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
SJ=open(D+'/send.js').read(); SC=open(D+'/send.css').read()
def rep(a,b):
    global h
    n=h.count(a); assert n==1,(a[:90],n); h=h.replace(a,b)
if 'function ansSendHTML' not in h:
    rep("  function bhqItem(t,answered){\n",SJ+"  function bhqItem(t,answered){\n")
    rep("""placeholder="Your answer">'+esc(t.answer||"")+'</textarea></li>';""","""placeholder="Your answer">'+esc(t.answer||"")+'</textarea>'+ansSendHTML(t)+'</li>';""")
    rep("""placeholder="Your answer. The next check-in preps a comment draft for you to post.">'+esc(t.answer||"")+'</textarea>';""","""placeholder="Your answer. Press Send to Claude and it works it now.">'+esc(t.answer||"")+'</textarea>'+ansSendHTML(t);""")
    m=re.search(r'<style id="style">',h); i=h.index('</style>',m.end()); h=h[:i]+"\n/* ---------- send an answer to Claude ---------- */\n"+SC+h[i:]
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
NOTE=" ANSWERS SENT FROM THE BOARD (Nov 5): a Live chat message that starts \"Answer from Brody on task\" carries his answer to a task.question (often BugHerd). Work it right away: do what the answer says, prep drafts only (BugHerd comment labelled \"Draft comment, not posted\" on the task, emails as Outlook drafts), answer in Live chat, push the same into the task thread, and set task.answerWorkedAt to now. Check-ins skip any task whose answerWorkedAt is at or after its answeredAt."
if 'ANSWERS SENT FROM THE BOARD' not in s['_note']: s['_note']+=NOTE
d=s['days'][s['today']]
if not any('Send to Claude' in (l.get('text') or '') for l in d['log']):
    d['log'].append({"t":"10:50","text":"BugHerd and Claude-tab answer boxes now have Send to Claude: it saves your answer and hands it to Claude right away instead of waiting for the next check-in.","kind":"claude","by":"Claude"})
s['updated']=NOW
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(out,'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):]); print('ok')
