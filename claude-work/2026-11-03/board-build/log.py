import json,sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
st['_note']+=" days[*].log entries are {t:\"HH:MM\", text, kind?, ref?, by?}: kind \"note\" (typed; the default), \"win\", \"blocked\", \"auto\" (the page logs ticks and closes itself, ref = block or task id) or \"claude\" (a routine reporting what it did; by:\"Claude\"). Routines may append kind \"claude\" entries to today's log; they never turn log lines into tasks."
for au in [st['automations']]:
    for x in au['building']:
        if x['name']=="Day log that fills itself":
            x['stage']="testing"; x['next']="Live now. Tell me if anything is missing from it."
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)

# 1. replace the log part of planHTML with logHTML(day,isToday)
i0=s.index("    h+='<div class=\"checkin\"><form data-form=\"log\">")
i1=s.index("    h+='</ul></div></section>';\n    return h;\n  }",i0)
s=s[:i0]+"    h+='</section>';\n    h+=logHTML(day,isToday);\n    return h;\n  }"+s[i1+len("    h+='</ul></div></section>';\n    return h;\n  }"):]

JS=r'''
  /* ---------- Day log: typed notes plus what the board and Claude did ---------- */
  var logFilter="all";
  try{logFilter=localStorage.getItem("bb.logf")||"all";}catch(e){}
  var LOG_KIND={note:"Note",win:"Win",blocked:"Blocked",auto:"Board",claude:"Claude"};
  function hhmm(d){return pad(d.getHours())+":"+pad(d.getMinutes());}
  function logDay(){var k=state.days[todayISO()]?todayISO():state.today;var d=state.days[k]||(state.days[k]={blocks:[],log:[]});if(!d.log)d.log=[];return d;}
  function logAuto(text,ref){var d=logDay(),t=hhmm(new Date());
    if(ref)d.log=d.log.filter(function(l){return !(l.kind==="auto"&&l.ref===ref);});
    d.log.push({t:t,text:clip(text,200),kind:"auto",ref:ref||""});}
  function logDrop(ref){if(!ref)return;var d=logDay();d.log=d.log.filter(function(l){return !(l.kind==="auto"&&l.ref===ref);});}
  function logTask(t,how){if(!t)return;
    if(how==="reopen"||how===false){logDrop(t.id);return;}
    logAuto((how==="drop"?"Let go: ":"Done: ")+t.title,t.id);}
  function logEntries(day,dayKey){
    var out=(day.log||[]).map(function(l,i){return {t:l.t,text:l.text,kind:l.kind||"note",i:i,by:l.by};});
    /* Claude's thread messages from that day */
    state.tasks.forEach(function(t){(t.thread||[]).forEach(function(m){
      if(!m||m.role!=="claude"||!m.t)return;var d=new Date(m.t);if(isNaN(d))return;
      var k=d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());if(k!==dayKey)return;
      out.push({t:hhmm(d),text:clip(t.title,70)+": "+clip(m.text,160),kind:"claude",task:t.id});});});
    out.sort(function(a,b){return a.t<b.t?1:a.t>b.t?-1:0;});
    return out;
  }
  function logHTML(day,isToday){
    var dayKey=isToday?todayISO():state.today,all=logEntries(day,dayKey);
    var cnt={all:all.length,you:0,claude:0,board:0};
    all.forEach(function(e){if(e.kind==="claude")cnt.claude++;else if(e.kind==="auto")cnt.board++;else cnt.you++;});
    var shown=all.filter(function(e){return logFilter==="all"||(logFilter==="claude"&&e.kind==="claude")||(logFilter==="board"&&e.kind==="auto")||(logFilter==="you"&&e.kind!=="claude"&&e.kind!=="auto");});
    var h='<section class="panel daylog" id="sec-log"><h2>Today\u2019s log <small>'+(cnt.you?'<b>'+cnt.you+'</b> from you · ':'')+cnt.board+' ticked or closed · '+cnt.claude+' from Claude</small></h2>';
    h+='<form class="logadd" data-form="log"><div class="logkinds" role="radiogroup" aria-label="Kind">'+[["note","Working on"],["win","Win"],["blocked","Blocked"]].map(function(k,i){
      return '<label><input type="radio" name="kind" value="'+k[0]+'"'+(i===0?' checked':'')+'><span>'+k[1]+'</span></label>';}).join("")+'</div>';
    h+='<div class="logrow"><input type="text" id="logtext" name="text" placeholder="What are you working on, what got done, what\u2019s stuck?" autocomplete="off" aria-label="Log entry"><button class="btn" type="submit">Log it</button></div></form>';
    h+='<div class="au-seg logseg" role="group" aria-label="Show">'+[["all","All",cnt.all],["you","You",cnt.you],["board","Ticks",cnt.board],["claude","Claude",cnt.claude]].map(function(o){
      return '<button type="button" data-logf="'+o[0]+'" class="'+(logFilter===o[0]?'on':'')+'" aria-pressed="'+(logFilter===o[0])+'">'+o[1]+' '+o[2]+'</button>';}).join("")+'</div>';
    h+='<ul class="log log2">';
    if(!shown.length)h+='<li class="empty">'+(all.length?'Nothing in this view.':'Nothing yet. Ticking a block or closing a task logs it here on its own, and so does Claude\u2019s work.')+'</li>';
    shown.forEach(function(e){
      h+='<li class="lk-'+esc(e.kind)+'"><span class="lt">'+esc(e.t)+'</span><span class="lx"><span class="lkind">'+esc(LOG_KIND[e.kind]||"Note")+'</span>'+esc(e.text)+'</span>'+
        (e.i!=null&&e.kind!=="claude"&&isToday?'<button type="button" class="logx" data-logdel="'+e.i+'" aria-label="Remove this entry" title="Remove">\u00d7</button>':(e.task?'<button type="button" class="logx tx" data-opentask="'+esc(e.task)+'" title="Open the task">Open</button>':'<span></span>'))+'</li>';
    });
    h+='</ul></section>';
    return h;
  }
  document.addEventListener("click",function(e){
    var lf=e.target.closest("[data-logf]");
    if(lf){logFilter=lf.dataset.logf;try{localStorage.setItem("bb.logf",logFilter);}catch(e2){}render();return;}
    var ld=e.target.closest("[data-logdel]");
    if(ld){var d=state.days[todayISO()]?state.days[todayISO()]:state.days[state.today];if(d&&d.log){d.log.splice(+ld.dataset.logdel,1);save();}return;}
  });

  function planHTML(day,isToday){'''
rep("\n  function planHTML(day,isToday){",JS)
# 2. log form handler with kind
rep('''    if(f.dataset.form==="log"){var v=f.text.value.trim();if(!v)return;var d=state.days[state.today]||(state.days[state.today]={blocks:[],log:[]});var n=new Date();d.log.push({t:pad(n.getHours())+":"+pad(n.getMinutes()),text:v});save();return;}''',
'''    if(f.dataset.form==="log"){var v=f.text.value.trim();if(!v)return;var kd=(f.querySelector('input[name="kind"]:checked')||{}).value||"note";var d=logDay();var n=new Date();var en={t:pad(n.getHours())+":"+pad(n.getMinutes()),text:clip(v,500)};if(kd!=="note")en.kind=kd;d.log.push(en);save();chip(kd==="win"?"Logged as a win. It goes on Friday\u2019s wins list.":"Logged.");return;}''')
# 3. hooks
rep('''    if(el.dataset.blk){var b=locateBlock(el.dataset.blk);if(b){var ch=setBlockDone(b.block,el.checked,b.day);save();''',
'''    if(el.dataset.blk){var b=locateBlock(el.dataset.blk);if(b){var ch=setBlockDone(b.block,el.checked,b.day);if(!b.block.meeting){if(el.checked)logAuto("Finished: "+b.block.title,b.block.id);else logDrop(b.block.id);}save();''')
rep('''    if(el.dataset.tchk){var t=findTask(el.dataset.tchk);if(t){setTaskDone(t,el.checked);save();}return;}''',
'''    if(el.dataset.tchk){var t=findTask(el.dataset.tchk);if(t){setTaskDone(t,el.checked);logTask(t,el.checked?"done":"reopen");save();}return;}''')
rep('''    t.update={on:todayISO(),by:"Brody",text:how==="reopen"?"Brought back.":how==="drop"?"Marked not needed.":"Marked done."};''',
'''    t.update={on:todayISO(),by:"Brody",text:how==="reopen"?"Brought back.":how==="drop"?"Marked not needed.":"Marked done."};
    logTask(t,how);''')
rep('''    if(u.kind==="task"){var t=findTask(u.id);if(!t)return;var p=u.prev;''','''    if(u.kind==="task"){var t=findTask(u.id);if(!t)return;var p=u.prev;logDrop(t.id);''')
rep('''    t.thread.push({role:"user",text:"Given to Claude.",t:new Date().toISOString()});''','''    t.thread.push({role:"user",text:"Given to Claude.",t:new Date().toISOString()});
    logAuto("Gave to Claude: "+t.title,t.id);''')
CSS='''
/* ---------- day log v2 ---------- */
.daylog{margin-top:16px}
.logadd{display:flex;flex-direction:column;gap:8px}
.logkinds{display:flex;flex-wrap:wrap;gap:6px}
.logkinds label{cursor:pointer}
.logkinds input{position:absolute;opacity:0;pointer-events:none}
.logkinds span{display:inline-block;font-size:12.5px;font-weight:500;padding:3px 11px;border:1px solid var(--line-strong);border-radius:999px;color:var(--muted)}
.logkinds input:checked+span{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.logkinds input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}
.logrow{display:flex;gap:8px;flex-wrap:wrap}
.logrow input[type=text]{flex:1 1 220px;min-width:0;padding:9px 11px;border:1px solid var(--line-strong);border-radius:6px;background:var(--bg)}
.logseg{margin-top:12px}
.log2 li{grid-template-columns:48px minmax(0,1fr) auto;align-items:start}
.log2 .lx{overflow-wrap:anywhere}
.log2 .lkind{display:inline-block;font-size:11px;font-weight:600;margin-right:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.log2 .lk-win .lkind{color:var(--ok)}
.log2 .lk-blocked .lkind{color:var(--bad)}
.log2 .lk-claude .lkind{color:var(--accent)}
.log2 .lk-auto{color:var(--muted)}
.logx{border:0;background:none;color:var(--muted);font-size:15px;line-height:1;padding:2px 4px}
.logx:hover{color:var(--bad)}
.logx.tx{font-size:12.5px;color:var(--accent)}
'''
rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok")
