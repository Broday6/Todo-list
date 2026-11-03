import json,sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
NOW="2026-11-03T18:24:00Z"
st.setdefault('teamsWatch',{"since":NOW,"asOf":NOW,"items":[]})
st['_note']+=" state.teamsWatch = {since, asOf, items:[{id, on (ISO), chat, from, kind (ask|mention|fyi), gist, done?, taskId?}]}: new Teams messages since Brody turned the watch on (Nov 3, no history). The hourly Teams watch adds items for messages after asOf; Brody marks them Got it or makes a task. Never store email addresses or phone numbers; never post in Teams."
for x in st['automations']['building']:
    pass
st['automations']['building'].insert(0,{"name":"Teams watch","where":"here","stage":"testing","who":"claude",
  "what":"Reads new Teams chat messages to you every hour on weekdays (8:12 to 5:12) and puts asks and mentions on the Team tab. Started Nov 3 with no history.",
  "next":"Live now. The first hourly read is at the next :12."})
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)
rep('      h+=waitHTML();\n      h+=teamHTML();','      h+=twHTML();\n      h+=waitHTML();\n      h+=teamHTML();')
JS=r'''
  /* ---------- Teams watch (state.teamsWatch) ---------- */
  var twShowAll=false;
  function twS(){var w=state.teamsWatch;if(!w||!Array.isArray(w.items))state.teamsWatch=w={since:new Date().toISOString(),asOf:"",items:[]};return w;}
  function twFind(id){var r=null;twS().items.forEach(function(x){if(x.id===id)r=x;});return r;}
  function twWhen(iso){var d=new Date(iso);if(isNaN(d))return "";var k=d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());return (k===todayISO()?"":shortDate(k)+" ")+(d.getHours()%12||12)+":"+pad(d.getMinutes())+(d.getHours()<12?"am":"pm");}
  function twHTML(){
    var w=twS(),open=w.items.filter(function(x){return !x.done;}),asks=open.filter(function(x){return x.kind!=="fyi";});
    var list=(twShowAll?w.items:open).slice().sort(function(a,b){return a.on<b.on?1:-1;});
    var h='<section class="panel twp" style="margin-top:16px"><h2>New in Teams <small>'+(asks.length?'<b>'+asks.length+'</b> need you · ':'')+open.length+' open · '+(w.asOf?'read '+esc(twWhen(w.asOf)):'not read yet')+'</small></h2>';
    h+='<p class="hint">Claude reads new Teams messages to you every hour on weekdays (since '+esc(twWhen(w.since))+', no history). Read-only: nothing is posted in Teams.</p>';
    if(!list.length)h+='<p class="empty">'+(w.items.length?'All caught up.':'Nothing new yet. The first hourly read is at the next :12.')+'</p>';
    else{h+='<ul class="tw-l">';list.forEach(function(x){
      var tk=x.taskId&&findTask(x.taskId);
      h+='<li class="tw-'+esc(x.kind||"fyi")+(x.done?' done':'')+'"><span class="wdot"></span><div><div><b>'+esc(x.from||"")+'</b>'+(x.chat?' <span class="tm-m">in '+esc(x.chat)+'</span>':'')+' <span class="stag'+(x.kind==="ask"?' warn':x.kind==="mention"?' acc':'')+'">'+(x.kind==="ask"?'Asks you':x.kind==="mention"?'Mentions you':'FYI')+'</span></div><div class="tw-g">'+esc(x.gist||"")+'</div><div class="tm-m">'+esc(twWhen(x.on))+'</div></div>';
      h+='<div class="tw-a">'+(x.done?'<button type="button" class="tx" data-twundo="'+esc(x.id)+'">Bring back</button>':(tk?'<button type="button" class="tx" data-opentask="'+esc(tk.id)+'">Open task</button>':'<button type="button" class="linkbtn" data-twtask="'+esc(x.id)+'">Make a task</button>')+'<button type="button" class="linkbtn" data-twdone="'+esc(x.id)+'">Got it</button>')+'</div></li>';});
      h+='</ul>';}
    if(w.items.some(function(x){return x.done;}))h+='<button type="button" class="tx" data-twall="1" style="margin-top:8px">'+(twShowAll?'Hide handled':'Show handled')+'</button>';
    return h+'</section>';
  }
  document.addEventListener("click",function(e){
    var el;
    if((el=e.target.closest("[data-twdone]"))){var x=twFind(el.dataset.twdone);if(x){x.done=true;x.doneOn=todayISO();save();}return;}
    if((el=e.target.closest("[data-twundo]"))){var x2=twFind(el.dataset.twundo);if(x2){delete x2.done;delete x2.doneOn;save();}return;}
    if((el=e.target.closest("[data-twall]"))){twShowAll=!twShowAll;render();return;}
    if((el=e.target.closest("[data-twtask]"))){var x3=twFind(el.dataset.twtask);if(!x3)return;
      var t={id:"tw"+Date.now().toString(36),group:"now",title:clip((x3.from?x3.from+": ":"")+x3.gist,120),note:(x3.from||"")+" · Teams"+(x3.chat?" ("+x3.chat+")":"")+" · "+twWhen(x3.on)+": "+(x3.gist||""),due:todayISO(),done:false,from:x3.from||"",since:todayISO(),source:"teams"};
      state.tasks.push(t);x3.taskId=t.id;save();chip("Added to This week.");return;}
  });

  function planHTML(day,isToday){'''
rep("\n  function planHTML(day,isToday){",JS)
CSS='''
/* ---------- Teams watch ---------- */
.tw-l{list-style:none;margin:0;padding:0}
.tw-l li{display:grid;grid-template-columns:8px minmax(0,1fr) auto;gap:10px;align-items:start;padding:9px 0;border-top:1px solid var(--line);font-size:14px}
.tw-l li:first-child{border-top:0}
.tw-l .wdot{width:8px;height:8px;border-radius:50%;background:var(--line-strong);margin-top:7px}
.tw-l li.tw-ask .wdot{background:var(--warn)}
.tw-l li.tw-mention .wdot{background:var(--accent)}
.tw-l li.done{opacity:.55}
.tw-g{font-size:13.5px;margin-top:2px;overflow-wrap:anywhere}
.tw-a{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}
@media(max-width:560px){.tw-l li{grid-template-columns:8px minmax(0,1fr)}.tw-a{grid-column:2;justify-content:flex-start}}
'''
rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok")
