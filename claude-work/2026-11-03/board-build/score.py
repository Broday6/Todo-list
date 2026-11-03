import json,sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
st.setdefault('quarter',{"name":"Q4 2026","start":"2026-10-01","end":"2026-12-31","rocks":[]})
st.setdefault('waiting',[])
st['_note']+=" state.quarter = {name, start, end, rocks:[{id,title,owner,status (on|off|done)}]}: Brody names the Rocks on the Week tab. state.waiting = [{id, who, what, since, due?, source?, done?, doneOn?}]: things Brody handed to someone else; the Team tab's Waiting panel also pulls each person's theyOwe and today's inbox waiting lines. Routines may add waiting items they find but never mark one done."
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)
rep('    } else if(view==="week"){\n      h+=weekHTML();','    } else if(view==="week"){\n      h+=scoreHTML();\n      h+=weekHTML();\n      h+=winsHTML();')
rep("    else if(view===\"week\"){sub='Pick a day to open its plan.';}","    else if(view===\"week\"){sub='The quarter scorecard, this week\\u2019s plan by day, and your wins.';}")
rep('      h+=teamHTML();','      h+=waitHTML();\n      h+=teamHTML();')
JS=r'''
  /* ---------- Quarter scorecard, Friday wins, Waiting on others ---------- */
  function qtr(){var q=state.quarter;if(!q||typeof q!=="object")state.quarter=q={name:"Q4 2026",start:"2026-10-01",end:state.quarterEnd||"2026-12-31",rocks:[]};q.rocks=q.rocks||[];return q;}
  function weekMon(iso){var d=parseISO(iso),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
  function weekStats(){
    var today=todayISO(),mon=weekMon(today),blk=0,blkDone=0;
    Object.keys(state.days||{}).forEach(function(k){if(k<mon||k>today)return;(state.days[k].blocks||[]).forEach(function(b){if(b.meeting)return;blk++;if(b.done)blkDone++;});});
    var closed=state.tasks.filter(function(t){return t.done&&!t.dropped&&t.doneOn&&t.doneOn>=mon&&t.doneOn<=today;});
    var dropped=state.tasks.filter(function(t){return t.dropped&&t.doneOn&&t.doneOn>=mon;}).length;
    var over=state.tasks.filter(function(t){return !t.done&&t.due&&t.due<today&&t.group.indexOf("idea-")!==0&&t.group!=="bugherd"&&t.group!=="cases";}).length;
    var bh=state.tasks.filter(function(t){return !t.done&&t.group==="bugherd";}).length;
    return {mon:mon,blk:blk,blkDone:blkDone,closed:closed,dropped:dropped,over:over,bh:bh};
  }
  function scoreHTML(){
    var q=qtr(),w=weekStats(),today=todayISO(),left=Math.max(0,daysBetween(today,q.end)),span=Math.max(1,daysBetween(q.start,q.end)),pc=Math.round((1-left/span)*100);
    var pw=null;var d=state.days[state.today];if(d&&d.pulse&&d.pulse.week&&d.pulse.week.found)pw=d.pulse.week;
    var h='<section class="panel scp"><h2>'+esc(q.name)+' scorecard <small>'+left+' days left · '+pc+'% of the quarter gone</small></h2>';
    h+='<div class="prog" style="margin:-4px 0 14px"><i style="width:'+pc+'%"></i></div>';
    h+='<div class="kpis-row">';
    function tile(lbl,val,sub,bad){return '<div class="tile'+(bad?' bad':'')+'"><span class="tl">'+lbl+'</span><b>'+val+'</b><span class="ts">'+sub+'</span></div>';}
    h+=tile("Plan ticked this week",w.blk?Math.round(w.blkDone/w.blk*100)+"%":"–",w.blkDone+" of "+w.blk+" work blocks",w.blk&&w.blkDone/w.blk<.5);
    h+=tile("Tasks closed this week",w.closed.length,(w.dropped?w.dropped+" more let go":"since Monday"));
    h+=tile("Overdue now",w.over,"not counting ideas, BugHerd, cases",w.over>10);
    h+=tile("BugHerd open",w.bh,"Q3 Rock was under 10",w.bh>=10);
    if(pw)h+=tile(esc(pw.label||"Week"),fmtMoney(pw.dollars),pw.cmpDollars?(pw.dollars>=pw.cmpDollars?"+":"")+Math.round((pw.dollars-pw.cmpDollars)/pw.cmpDollars*100)+"% vs last week":"no comparison yet",pw.cmpDollars&&pw.dollars<pw.cmpDollars);
    h+='</div>';
    h+='<h3 class="sc-h">Rocks <small>the 3 to 5 things this quarter has to deliver</small></h3>';
    if(!q.rocks.length)h+='<p class="empty">No Q4 Rocks named yet. Your Q3 Rocks are closed. Add up to five below.</p>';
    else{h+='<ul class="sc-rocks">';q.rocks.forEach(function(r){
      h+='<li data-tone="'+esc(r.status||"on")+'"><span class="mk"></span><span class="sc-t">'+esc(r.title)+(r.owner?' <span class="tm-m">'+esc(r.owner)+'</span>':'')+'</span><select data-rock="'+esc(r.id)+'" aria-label="Status">'+[["on","On track"],["off","Off track"],["done","Done"]].map(function(o){return '<option value="'+o[0]+'"'+((r.status||"on")===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join("")+'</select><button type="button" class="logx" data-rockdel="'+esc(r.id)+'" aria-label="Remove">×</button></li>';});
      h+='</ul>';}
    if(q.rocks.length<5)h+='<form class="addrow" data-form="rockadd" style="margin-top:8px"><input type="text" name="title" placeholder="Name a Q4 Rock" required aria-label="Rock"><button class="btn ghost" type="submit">Add Rock</button></form>';
    return h+'</section>';
  }
  function winsList(){
    var mon=weekMon(todayISO()),out=[];
    Object.keys(state.days||{}).forEach(function(k){if(k<mon)return;(state.days[k].log||[]).forEach(function(l){if(l.kind==="win")out.push({on:k,text:l.text,kind:"win"});});});
    state.tasks.forEach(function(t){if(t.done&&!t.dropped&&t.doneOn&&t.doneOn>=mon&&t.doneVia!=="cleanup"&&t.group.indexOf("idea-")!==0)out.push({on:t.doneOn,text:t.title,kind:"task"});});
    tm().people.forEach(function(p){["youOwe","theyOwe"].forEach(function(k){(p[k]||[]).forEach(function(x){if(x.done&&x.doneOn&&x.doneOn>=mon)out.push({on:x.doneOn,text:(k==="youOwe"?"Handled for ":"Got from ")+p.short+": "+x.what,kind:"team"});});});});
    out.sort(function(a,b){return a.kind===b.kind?(a.on<b.on?1:-1):(a.kind==="win"?-1:b.kind==="win"?1:0);});
    return out;
  }
  function winsHTML(){
    var ws=winsList(),fri=parseISO(todayISO()).getDay()===5,stars=ws.filter(function(x){return x.kind==="win";}).length;
    var h='<section class="panel wins" style="margin-top:16px"><h2>'+(fri?'It’s Friday: your wins this week':'Wins this week')+' <small>'+stars+' you logged · '+(ws.length-stars)+' closed</small></h2>';
    h+='<p class="hint">Log a win from Today’s log (pick “Win”). Closed tasks and team items land here on their own.</p>';
    if(!ws.length)h+='<p class="empty">Nothing yet this week.</p>';
    else{h+='<ul class="wins-l">';ws.slice(0,30).forEach(function(x){h+='<li class="w-'+x.kind+'"><span class="lt">'+esc(shortDate(x.on))+'</span><span>'+(x.kind==="win"?'<b class="lkind" style="color:var(--ok)">Win</b> ':'')+esc(x.text)+'</span></li>';});h+='</ul>';
      h+='<button type="button" class="btn ghost" data-wincopy="1" style="margin-top:10px">Copy as a list</button>';}
    return h+'</section>';
  }
  function waitAll(){
    var out=[];
    (state.waiting||[]).forEach(function(x){if(!x.done)out.push({who:x.who,what:x.what,since:x.since,src:"You added it",id:"w:"+x.id});});
    tm().people.forEach(function(p){tmOpen(p.theyOwe).forEach(function(x){out.push({who:p.short,what:x.what,since:x.since,src:x.source||"Teams or email",id:"t:"+p.id+"|theyOwe|"+x.id});});});
    var d=state.days[state.today],keys=closedWaitKeys();
    ((d&&d.inbox&&d.inbox.waiting)||[]).forEach(function(w,i){if(!waitClosed(w,keys))out.push({who:w.who,what:w.what,since:w.since,src:"Inbox triage",id:"i:"+i,replied:w.replied});});
    out.sort(function(a,b){return (a.since||"9")<(b.since||"9")?-1:1;});
    return out;
  }
  function waitHTML(){
    var ws=waitAll(),today=todayISO();
    var h='<section class="panel wt" style="margin-top:16px"><h2>Waiting on others <small>'+ws.length+' open · oldest first</small></h2>';
    if(!ws.length)h+='<p class="empty">Nobody owes you anything right now.</p>';
    else{h+='<ul class="wt-l">';ws.forEach(function(x){var age=x.since?daysBetween(x.since,today):0;
      h+='<li class="'+(age>=5?'old':'')+'"><span class="wdot"></span><div><div><b>'+esc(x.who)+'</b> · '+esc(x.what)+'</div><div class="tm-m">'+(x.since?'since '+esc(shortDate(x.since))+' · '+age+'d · ':'')+esc(x.src)+(x.replied?' · <span style="color:var(--ok)">'+esc(x.replied.why||"Replied")+'</span>':'')+'</div></div>'+
        '<button type="button" class="linkbtn" data-waitdone="'+esc(x.id)+'">Got it</button></li>';});h+='</ul>';}
    h+='<form class="addrow" data-form="waitadd"><input type="text" name="who" placeholder="Who" required aria-label="Who" style="flex:0 1 160px"><input type="text" name="what" placeholder="What you handed them" required aria-label="What"><button class="btn ghost" type="submit">Add</button></form>';
    return h+'</section>';
  }
  document.addEventListener("change",function(e){var el=e.target;if(!el.dataset||!el.dataset.rock)return;qtr().rocks.forEach(function(r){if(r.id===el.dataset.rock){r.status=el.value;if(el.value==="done")logAuto("Rock done: "+r.title,"rk-"+r.id);}});save();});
  document.addEventListener("click",function(e){
    var rd=e.target.closest("[data-rockdel]");
    if(rd){var q=qtr();q.rocks=q.rocks.filter(function(r){return r.id!==rd.dataset.rockdel;});save();return;}
    var wc=e.target.closest("[data-wincopy]");
    if(wc){copyText("Wins, week of "+shortDate(weekMon(todayISO()))+"\n"+winsList().map(function(x){return "- "+x.text;}).join("\n"));return;}
    var wd=e.target.closest("[data-waitdone]");
    if(wd){var id=wd.dataset.waitdone,k=id.slice(0,2),v=id.slice(2);
      if(k==="w:"){(state.waiting||[]).forEach(function(x){if(x.id===v){x.done=true;x.doneOn=todayISO();logAuto("Got from "+x.who+": "+x.what,"wt-"+x.id);}});save();}
      else if(k==="t:"){var q=v.split("|"),p=tmFind(q[0]);if(p)(p[q[1]]||[]).forEach(function(x){if(x.id===q[2]){x.done=true;x.doneOn=todayISO();logAuto("Got from "+p.short+": "+x.what,"tm-"+x.id);}});save();}
      else if(k==="i:"){closeWait(v,"done");}
      return;}
  });
  document.addEventListener("submit",function(e){
    var f=e.target;if(!f.dataset)return;
    if(f.dataset.form==="rockadd"){e.preventDefault();var t=String(f.title.value||"").trim();if(!t)return;qtr().rocks.push({id:"rk"+Date.now().toString(36),title:clip(t,140),owner:"",status:"on"});save();chip("Rock added.");return;}
    if(f.dataset.form==="waitadd"){e.preventDefault();var who=String(f.who.value||"").trim(),what=String(f.what.value||"").trim();if(!who||!what)return;
      (state.waiting||(state.waiting=[])).push({id:"wt"+Date.now().toString(36),who:clip(who,60),what:clip(what,200),since:todayISO()});save();chip("Added to Waiting on others.");return;}
  },true);

  function planHTML(day,isToday){'''
rep("\n  function planHTML(day,isToday){",JS)
CSS='''
/* ---------- scorecard, wins, waiting ---------- */
.sc-h{margin:16px 0 6px;font-size:13px;font-weight:600}
.sc-h small{font-weight:400;color:var(--muted);margin-left:6px}
.sc-rocks{list-style:none;margin:0;padding:0}
.sc-rocks li{display:grid;grid-template-columns:10px minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:14px}
.sc-rocks li:first-child{border-top:0}
.sc-rocks .mk{width:9px;height:9px;border-radius:50%;background:var(--ok)}
.sc-rocks li[data-tone="off"] .mk{background:var(--bad)}
.sc-rocks li[data-tone="done"] .mk{background:var(--line-strong)}
.sc-rocks li[data-tone="done"] .sc-t{text-decoration:line-through;color:var(--muted)}
.sc-rocks select{padding:4px 6px;border:1px solid var(--line-strong);border-radius:5px;background:var(--panel);font-size:13px}
.wins-l,.wt-l{list-style:none;margin:0;padding:0}
.wins-l li{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;padding:6px 0;border-top:1px solid var(--line);font-size:14px}
.wins-l li:first-child,.wt-l li:first-child{border-top:0}
.wins-l .lt{font-family:var(--mono);font-size:12px;color:var(--muted)}
.wins-l .lkind{font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin-right:6px}
.wt-l li{display:grid;grid-template-columns:8px minmax(0,1fr) auto;gap:10px;align-items:start;padding:9px 0;border-top:1px solid var(--line);font-size:14px}
.wt-l .wdot{width:8px;height:8px;border-radius:2px;background:var(--line-strong);margin-top:7px}
.wt-l li.old .wdot{background:var(--warn)}
.wt-l li.old .tm-m{color:var(--warn)}
'''
rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok")
