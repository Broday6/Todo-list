import json,sys,re
src,dst,tj=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
T=json.load(open(tj))
EMAIL=re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+'); PHONE=re.compile(r'\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}')
def clean(x):
    if isinstance(x,str):
        assert not EMAIL.search(x) and not PHONE.search(x),x
        return x
    if isinstance(x,list): return [clean(i) for i in x]
    if isinstance(x,dict): return {k:(v if k=='link' else clean(v)) for k,v in x.items()}
    return x
old={p['id']:p for p in (st.get('team') or {}).get('people',[])}
people=[]
for p in T['people']:
    pid=re.sub(r'[^a-z]','',p['short'].lower())
    q=clean({k:v for k,v in p.items()})
    q['id']=pid
    for kind in ('theyOwe','youOwe'):
        for i,it in enumerate(q.get(kind) or []):
            it['id']=f"{pid}-{'t' if kind=='theyOwe' else 'y'}{i+1}"
    o=old.get(pid)
    if o: q['agenda']=o.get('agenda','')
    else: q.setdefault('agenda','')
    people.append(q)
st['team']={'asOf':T['asOf'],'window':T.get('window',''),'people':people}
st['_note']+=" state.team = {asOf, window, people:[{id, name, short, role, lastHeard, counts, theyOwe:[{id,what,since,source,done?}], youOwe:[...], recent:[{on,dir,channel,title,gist,link}], topics, meetings:{past,next}, flags, agenda}]}: the Team tab, read from Teams and email. Refreshing it: keep every item's id and done flag, keep agenda (Brody types it), add new owe items with new ids, and never store email addresses or phone numbers."
for x in st['automations']['building']:
    if x['name']=="Team tab":
        x['stage']="testing";x['next']="Live with a first read of Teams and email (Oct 20 to Nov 3). Next: the check-ins keep it fresh."
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)
rep('["inbox","Inbox"],["bugherd","BugHerd"]','["inbox","Inbox"],["team","Team"],["bugherd","BugHerd"]')
rep('["Focus",["today","inbox","bugherd","cases","tasks","goals","week"]]','["Focus",["today","inbox","team","bugherd","cases","tasks","goals","week"]]')
rep('tasks:"Tasks",goals:"Yearly objectives"','team:"Team",tasks:"Tasks",goals:"Yearly objectives"')
rep('var KEYORDER=["today","inbox","tasks"','var KEYORDER=["today","inbox","team","tasks"')
rep("    goals:'<circle","    team:'<circle cx=\"8\" cy=\"8.5\" r=\"2.8\"/><circle cx=\"16.5\" cy=\"8.5\" r=\"2.8\"/><path d=\"M3 18.5c.5-2.8 2.5-4.5 5-4.5s4.5 1.7 5 4.5M12.5 15.2c.9-.8 2.3-1.2 4-1.2 2.5 0 4.5 1.7 5 4.5\"/>',\n    goals:'<circle")
rep("    else if(view===\"auto\"){sub=","    else if(view===\"team\"){var tmA=(state.team||{}).asOf;sub='What each person owes you, what you owe them, and your next 1:1.'+(tmA?' Read from Teams and email, '+esc(shortDate(String(tmA).slice(0,10)))+'.':'');}\n    else if(view===\"auto\"){sub=")
rep('    } else if(view==="goals"){\n      h+=goalsHTML();','    } else if(view==="team"){\n      h+=teamHTML();\n    } else if(view==="goals"){\n      h+=goalsHTML();')
JS=r'''
  /* ---------- Team tab (state.team) ---------- */
  function tm(){var t=state.team;return t&&Array.isArray(t.people)?t:{people:[]};}
  function tmOpen(list){return (list||[]).filter(function(x){return !x.done;});}
  function tmBoard(p){
    var sh=String(p.short||"").toLowerCase(),re=new RegExp("\\b"+sh.replace(/[^a-z]/g,"")+"\\b","i");
    var cards=((state.ads&&state.ads.cards)||[]).filter(function(c){return String(c.owner||"").toLowerCase()===sh;});
    var tasks=state.tasks.filter(function(t){return !t.done&&t.group.indexOf("idea-")!==0&&t.group!=="bugherd"&&t.group!=="cases"&&(re.test(t.title)||re.test(t.from||""));});
    return {cards:cards,tasks:tasks};
  }
  function tmItems(p,kind,label){
    var all=p[kind]||[],open=tmOpen(all),done=all.length-open.length;
    var h='<div class="tm-owe"><h4>'+label+' <small>'+open.length+'</small></h4>';
    if(!open.length)h+='<p class="empty">Nothing open.</p>';
    else{h+='<ul>';open.forEach(function(x){
      var age=x.since?daysBetween(x.since,todayISO()):0;
      h+='<li'+(age>=5?' class="old"':'')+'><input type="checkbox" class="chk" data-tmdone="'+esc(p.id+"|"+kind+"|"+x.id)+'" aria-label="Mark done: '+esc(x.what)+'"><div><div class="tw">'+esc(x.what)+'</div><div class="tm-m">'+(x.since?esc(shortDate(x.since))+(age>0?' · '+age+'d':''):'')+(x.source?' · '+esc(clip(x.source,60)):'')+'</div>'+(x.hint?'<div class="tm-hint">'+esc(x.hint)+'</div>':'')+'</div></li>';});
      h+='</ul>';}
    if(done)h+='<div class="tm-m">'+done+' done <button type="button" class="tx" data-tmundo="'+esc(p.id+"|"+kind)+'">Show again</button></div>';
    return h+'</div>';
  }
  function tmMeet(m){return esc(m.title)+' · '+esc(shortDate(m.on))+(m.time?' '+esc(m.time):'');}
  function teamHTML(){
    var t=tm(),ps=t.people;
    if(!ps.length)return '<section class="panel"><p class="empty">No team data yet. The next check-in reads Teams and email for each person.</p></section>';
    var owe=0,mine=0,nxt=null;
    ps.forEach(function(p){owe+=tmOpen(p.theyOwe).length;mine+=tmOpen(p.youOwe).length;((p.meetings||{}).next||[]).forEach(function(m){if(m.on>=todayISO()&&(!nxt||m.on<nxt.m.on))nxt={p:p,m:m};});});
    var h='<div class="au-head"><span class="cst"><b>'+ps.length+'</b>people</span><span class="cst'+(mine?' hot':'')+'"><b>'+mine+'</b>you owe</span><span class="cst"><b>'+owe+'</b>owed to you</span>'+(nxt?'<span class="au-legend">Next: <strong>'+tmMeet(nxt.m)+'</strong></span>':'')+'</div>';
    h+='<div class="tm-grid">';
    ps.forEach(function(p){
      var bd=tmBoard(p),lh=p.lastHeard||{},mt=p.meetings||{};
      h+='<article class="panel tm-card" id="tm-'+esc(p.id)+'"><div class="tm-top"><div><div class="tm-n">'+esc(p.name)+'</div><div class="tm-r">'+esc(p.role||"")+'</div></div>'+
        (lh.on?'<div class="tm-lh">Last heard <b>'+esc(shortDate(lh.on))+'</b>'+(lh.channel?' · '+esc(lh.channel):'')+'</div>':'')+'</div>';
      if((p.flags||[]).length)h+='<div class="tm-flags">'+p.flags.map(function(f){return '<span class="stag warn">'+esc(f)+'</span>';}).join("")+'</div>';
      h+='<div class="tm-cols">'+tmItems(p,"youOwe","You owe "+esc(p.short))+tmItems(p,"theyOwe",esc(p.short)+" owes you")+'</div>';
      if((p.topics||[]).length)h+='<div class="tm-topics"><span class="tm-lbl">Working on</span>'+p.topics.map(function(x){return '<span class="stag">'+esc(x)+'</span>';}).join("")+'</div>';
      h+='<div class="tm-meet"><span class="tm-lbl">Meetings</span><span>'+((mt.next||[]).length?'Next: '+mt.next.map(tmMeet).join("; "):'Nothing booked in the next two weeks.')+((mt.past||[]).length?' <span class="tm-m">Last: '+tmMeet(mt.past[0])+'</span>':'')+'</span></div>';
      if(bd.cards.length||bd.tasks.length){
        h+='<div class="tm-board"><span class="tm-lbl">On the board</span><span>'+(bd.cards.length?'<button type="button" class="tx" data-view="ads">'+bd.cards.length+' ads card'+(bd.cards.length>1?'s':'')+'</button>':'')+(bd.cards.length&&bd.tasks.length?' · ':'')+
          bd.tasks.slice(0,3).map(function(x){return '<button type="button" class="tx" data-opentask="'+esc(x.id)+'">'+esc(clip(x.title,48))+'</button>';}).join(" · ")+(bd.tasks.length>3?' +'+(bd.tasks.length-3)+' more':'')+'</span></div>';}
      if((p.recent||[]).length){
        h+='<details class="tm-recent"><summary>Recent messages ('+p.recent.length+')</summary><ul>';
        p.recent.forEach(function(r){h+='<li><span class="tm-m">'+esc(shortDate(r.on))+' · '+esc(r.dir||"")+' · '+esc(r.channel||"")+'</span><div>'+(safeLink(r.link)?'<a href="'+esc(r.link)+'" target="_blank" rel="noopener">'+esc(r.title||"Email")+'</a>':'<b>'+esc(r.title||"")+'</b>')+' '+esc(r.gist||"")+'</div></li>';});
        h+='</ul></details>';}
      var sug=tmOpen(p.youOwe).concat(tmOpen(p.theyOwe)).slice(0,5);
      h+='<label class="tm-ag"><span class="tm-lbl">1:1 agenda</span><textarea data-tmagenda="'+esc(p.id)+'" placeholder="'+esc(sug.length?'Suggested: '+sug.map(function(x){return x.what;}).join("; "):'Notes for your next 1:1')+'">'+esc(p.agenda||"")+'</textarea></label>';
      if(sug.length&&!p.agenda)h+='<button type="button" class="tx" data-tmfill="'+esc(p.id)+'">Start the agenda from the open items</button>';
      h+='</article>';
    });
    h+='</div><p class="hint" style="margin-top:12px">Read-only from Teams and email ('+esc(t.window||"")+'). Claude never messages anyone from here. Tick an item when it\u2019s handled; the next refresh keeps your ticks.</p>';
    return h;
  }
  function tmFind(pid){var r=null;tm().people.forEach(function(p){if(p.id===pid)r=p;});return r;}
  document.addEventListener("change",function(e){
    var el=e.target;
    if(el.dataset&&el.dataset.tmdone){var q=el.dataset.tmdone.split("|"),p=tmFind(q[0]);if(!p)return;(p[q[1]]||[]).forEach(function(x){if(x.id===q[2]){x.done=true;x.doneOn=todayISO();logAuto((q[1]==="youOwe"?"Handled for ":"Got from ")+p.short+": "+x.what,"tm-"+x.id);}});save();return;}
    if(el.dataset&&el.dataset.tmagenda){var p2=tmFind(el.dataset.tmagenda);if(p2){p2.agenda=clip(String(el.value||""),3000);save();}return;}
  });
  document.addEventListener("click",function(e){
    var u=e.target.closest("[data-tmundo]");
    if(u){var q=u.dataset.tmundo.split("|"),p=tmFind(q[0]);if(p){(p[q[1]]||[]).forEach(function(x){if(x.done){delete x.done;delete x.doneOn;logDrop("tm-"+x.id);}});save();}return;}
    var f=e.target.closest("[data-tmfill]");
    if(f){var p3=tmFind(f.dataset.tmfill);if(p3){p3.agenda=tmOpen(p3.youOwe).map(function(x){return "- You: "+x.what;}).concat(tmOpen(p3.theyOwe).map(function(x){return "- "+p3.short+": "+x.what;})).join("\n");save();}return;}
  });

  function planHTML(day,isToday){'''
rep("\n  function planHTML(day,isToday){",JS)
CSS='''
/* ---------- Team tab ---------- */
.tm-grid{display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px;align-items:start}
@media(min-width:1000px){.tm-grid{grid-template-columns:1fr 1fr}}
.tm-top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 12px;align-items:baseline;padding-bottom:10px;border-bottom:1px solid var(--line)}
.tm-n{font-size:17px;font-weight:600;letter-spacing:-.01em}
.tm-r{font-size:12.5px;color:var(--muted)}
.tm-lh{font-size:12.5px;color:var(--muted)}
.tm-lh b{font-family:var(--mono);font-weight:500;color:var(--ink)}
.tm-flags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.tm-cols{display:grid;grid-template-columns:1fr;gap:4px 20px;margin-top:6px}
@media(min-width:560px){.tm-cols{grid-template-columns:1fr 1fr}}
.tm-owe h4{margin:10px 0 4px;font-size:13px;font-weight:600}
.tm-owe h4 small{font-family:var(--mono);font-weight:500;color:var(--accent);margin-left:4px}
.tm-owe ul{list-style:none;margin:0;padding:0}
.tm-owe li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;padding:6px 0;border-top:1px solid var(--line);font-size:13.5px}
.tm-owe li:first-child{border-top:0}
.tm-owe li.old .tm-m{color:var(--warn)}
.tm-m{font-size:12px;color:var(--muted)}
.tm-hint{font-size:12px;color:var(--ok);font-weight:500;margin-top:2px}
.tm-lbl{display:inline-block;min-width:92px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin-right:6px}
.tm-topics,.tm-meet,.tm-board{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline;margin-top:12px;font-size:13px}
.tm-recent{margin-top:12px;font-size:13px}
.tm-recent summary{cursor:pointer;color:var(--muted);font-weight:500}
.tm-recent ul{list-style:none;margin:6px 0 0;padding:0}
.tm-recent li{padding:6px 0;border-top:1px solid var(--line)}
.tm-ag{display:block;margin-top:12px}
.tm-ag textarea{display:block;width:100%;margin-top:4px;min-height:64px;padding:8px 10px;border:1px solid var(--line-strong);border-radius:6px;background:var(--bg);font-size:13.5px;resize:vertical}
'''
rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok",len(people))
