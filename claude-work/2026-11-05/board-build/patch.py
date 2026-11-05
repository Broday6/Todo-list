import re,json,sys
f,out,NOW=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read()
D=__import__('os').path.dirname(__file__) or '.'
AJ=open(D+'/about.js').read(); AC=open(D+'/about.css').read()
def rep(a,b,cnt=1):
    global h
    n=h.count(a); assert n==cnt,(a[:80],n); h=h.replace(a,b)
if 'function aboutHTML' not in h:
    rep("  function taskRow(t){\n", AJ+"  function taskRow(t){\n")
    rep("    h+=hintBox(t);\n    h+=wfBox(t);\n    h+=claudeBox(t);\n    h+=threadHTML(t);","    h+=aboutHTML(t);\n    h+=hintBox(t);\n    h+=wfBox(t);\n    h+=claudeBox(t);\n    h+=threadHTML(t);")
    rep("threadBadge(t)+'<span class=\"closebtns\">'+closeBtns(t)","threadBadge(t)+(t.done?'':'<button type=\"button\" class=\"whatq\" data-whatsthis=\"'+esc(t.id)+'\" title=\"What does this task mean?\" aria-label=\"What does this task mean?\">?</button>')+'<span class=\"closebtns\">'+closeBtns(t)")
    rep("    if(samplerTried&&!sampler)return '';\n    var th=threadOf(t)||[];\n    var busy=(tAsk.busy&&tAsk.id===t.id);","    if(samplerTried&&!sampler&&!(threadOf(t)||[]).length)return '';\n    var th=threadOf(t)||[];\n    var busy=(tAsk.busy&&tAsk.id===t.id);")
    rep("""      JSON.stringify({id:t.id,title:t.title,group:t.group,groupLabel:groupLabel(t.group),
        due:t.due,done:t.done,note:t.note}),""","""      JSON.stringify(taskCtx(t)),""")
    rep("""      JSON.stringify(taskCtx(t)),""","""      JSON.stringify(taskCtx(t)),
      "",
      "If Brody asks what the task means or where it came from, answer from THE TASK's fields (email, source, Teams messages, plan blocks, related tasks): what is being asked, who asked, why it matters, what done looks like. If the board doesn't hold the source, say so plainly and tell him to press Dig deeper, which searches his email, Teams and Notion.",""")
    m=re.search(r'<style id="style">',h); assert m
    i=h.index('</style>',m.end()); h=h[:i]+"\n/* ---------- about this task ---------- */\n"+AC+h[i:]
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
NOTE=" DIG DEEPER (Nov 5): a Live chat message that starts \"Dig deeper on task\" names a task id. Search Outlook, Teams, Notion and Asana for where that task came from, answer in Live chat, and also push the same answer into that task's thread as {role:\"claude\",text,t}. Fill task.source, task.from or task.sourceLink if they were empty and you found them; change nothing else on the task."
if 'DIG DEEPER (Nov 5)' not in s['_note']: s['_note']+=NOTE
d=s['days'][s['today']]
if not any('About this task' in (l.get('text') or '') for l in d['log']):
    d['log'].append({"t":NOW[11:16] if False else "10:40","text":"Added to every task: an About this task box (where it came from, Teams, plan, related tasks, source links), Explain this task (instant) and Dig deeper (searches email, Teams and Notion, answer lands in the task thread). Collapsed rows get a ? button.","kind":"claude","by":"Claude"})
s['updated']=NOW
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(out,'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):]); print('ok')
