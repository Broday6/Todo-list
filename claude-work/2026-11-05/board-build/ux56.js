  /* ===== This week: Monday setup and catch-up (Nov 16, patch56; Brody: "Mondays should generally be used as a set up day
     for the week ... i need to see which projects I have, emails, hiring things that are time sensitive and need my
     attention can we build this into ultron"). The morning rebuild writes state.weekPlan every Monday (and the first day
     back after time off); this tab shows it: what happened while he was out, what's time-sensitive, hiring that needs
     him, the big projects with their next step, and the week day by day. Today shows a banner on Mondays. */
  TABS.splice(1,0,["setup","This week"]);VIEW_TITLE.setup="This week";try{ICON.setup='<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h4"/>';}catch(e){}KEYORDER.splice(1,0,"setup");
  try{var i56=NAV44[0][1].indexOf("today");NAV44[0][1].splice(i56+1,0,"setup");}catch(e){}
  try{var h56=String(location.hash||"").slice(1);if(h56==="setup")view="setup";}catch(e){}
  function wp56(){var w=state.weekPlan;return (w&&typeof w==="object")?w:null;}
  function wp56Cur(){var w=wp56();if(!w||!w.weekOf)return null;var t=todayISO(),e=addDays56(w.weekOf,6);return (t>=w.weekOf&&t<=e)?w:null;}
  function addDays56(d,n){var x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);}
  function arr56(v){return Array.isArray(v)?v:[];}
  function tone56(t){return t==="bad"||t==="warn"||t==="ok"||t==="acc"?t:"";}
  function when56(w){if(!w)return "";var d=String(w).slice(0,10),tm=String(w).length>10?String(w).slice(11,16):"";
    var lbl=d===todayISO()?"Today":(d===addDays56(todayISO(),1)?"Tomorrow":shortDate(d));
    if(tm){var hh=+tm.slice(0,2),mm=tm.slice(3);lbl+=" "+((hh%12)||12)+(mm!=="00"?":"+mm:"")+(hh<12?" am":" pm");}return lbl;}
  function item56(x){
    if(typeof x==="string")x={text:x};
    var t=x.taskId&&findTask(x.taskId),done=t&&t.done;
    var acts='';
    if(t)acts+='<button type="button" class="linkbtn" data-opentask="'+esc(t.id)+'">Open</button>';
    if(x.link&&/^https:\/\//.test(x.link))acts+='<a class="linkbtn" href="'+esc(x.link)+'" target="_blank" rel="noopener">'+esc(x.linkLabel||"Open ↗")+'</a>';
    if(x.view)acts+='<button type="button" class="linkbtn" data-view="'+esc(x.view)+'">'+esc(x.viewLabel||"Go")+'</button>';
    return '<li class="w56i '+tone56(x.tone)+(done?' done':'')+'"><i class="mk"></i><div class="w56x">'
      +(x.when?'<span class="w56w">'+esc(when56(x.when))+'</span>':'')
      +(x.who?'<span class="w56who">'+esc(x.who)+'</span>':'')
      +'<div class="w56t">'+esc(x.text||"")+'</div>'+(x.sub?'<div class="w56s">'+esc(x.sub)+'</div>':'')+'</div>'
      +(acts?'<div class="w56a">'+acts+'</div>':'')+'</li>';
  }
  function list56(title,sub,items,empty){
    items=arr56(items);
    return '<section class="panel w56p"><h2>'+esc(title)+(sub?' <small>'+esc(sub)+'</small>':'')+'</h2>'
      +(items.length?'<ul class="w56l">'+items.map(item56).join("")+'</ul>':'<p class="empty">'+esc(empty||"Nothing here.")+'</p>')+'</section>';
  }
  function proj56(p){
    var ids=arr56(p.taskIds),open=ids.filter(function(i){var t=findTask(i);return t&&!t.done;}),done=ids.length-open.length;
    var pct=ids.length?Math.round(100*done/ids.length):null;
    var nxt=arr56(p.next).length?arr56(p.next):(p.next?[p.next]:[]);
    return '<article class="w56pr '+tone56(p.tone)+'"><div class="w56ph"><b>'+esc(p.name)+'</b>'+(p.status?'<span class="stag '+tone56(p.tone)+'">'+esc(p.status)+'</span>':'')+'</div>'
      +(p.why?'<p class="w56pw">'+esc(p.why)+'</p>':'')
      +(pct!==null?'<div class="prog" title="'+done+' of '+ids.length+' tasks done"><i style="width:'+pct+'%"></i></div><div class="w56pm">'+done+' of '+ids.length+' tasks done'+(p.due?' · next date '+esc(shortDate(p.due)):'')+'</div>':(p.due?'<div class="w56pm">Next date '+esc(shortDate(p.due))+'</div>':''))
      +(nxt.length?'<div class="w56pn"><span>This week</span><ul>'+nxt.map(function(n){return '<li>'+esc(n)+'</li>';}).join("")+'</ul></div>':'')
      +'<div class="w56a">'+(open.length?'<button type="button" class="linkbtn" data-opentask="'+esc(open[0])+'">Open next task</button>':'')
      +(p.view?'<button type="button" class="linkbtn" data-view="'+esc(p.view)+'">'+esc(p.viewLabel||"Open tab")+'</button>':'')
      +(p.link&&/^https:\/\//.test(p.link)?'<a class="linkbtn" href="'+esc(p.link)+'" target="_blank" rel="noopener">Plan ↗</a>':'')+'</div></article>';
  }
  function days56(w){
    var D=arr56(w.days);if(!D.length)return '';
    return '<section class="panel w56p"><h2>The week <small>meetings, focus and what is due each day</small></h2><div class="w56days">'
      +D.map(function(d){var isT=d.date===todayISO(),past=d.date<todayISO();
        return '<div class="w56d'+(isT?' today':'')+(past?' past':'')+'"><h3>'+esc(d.label||shortDate(d.date))+(isT?' <small>today</small>':'')+'</h3>'
          +(d.focus?'<p class="w56f"><span>Focus</span>'+esc(d.focus)+'</p>':'')
          +(arr56(d.meetings).length?'<div class="w56g"><span>Meetings</span><ul>'+arr56(d.meetings).map(function(m){return '<li>'+esc(m)+'</li>';}).join("")+'</ul></div>':'<div class="w56g"><span>Meetings</span><p class="empty">None</p></div>')
          +(arr56(d.due).length?'<div class="w56g due"><span>Due</span><ul>'+arr56(d.due).map(function(m){return '<li>'+esc(m)+'</li>';}).join("")+'</ul></div>':'')
          +(arr56(d.note).length?'<div class="w56g"><span>Note</span><ul>'+arr56(d.note).map(function(m){return '<li>'+esc(m)+'</li>';}).join("")+'</ul></div>':'')
          +'</div>';}).join("")+'</div></section>';
  }
  function setupHTML(){
    var w=wp56();
    if(!w)return '<section class="panel"><p class="empty">The week plan is built every Monday morning (and your first day back after time off). Nothing is here yet.</p></section>';
    var stale=!wp56Cur();
    var h='<div class="w56">';
    if(stale)h+='<p class="w56stale">This plan is for the week of '+esc(shortDate(w.weekOf))+'. Next Monday\'s rebuild makes a new one.</p>';
    if(w.headline)h+='<section class="panel w56head"><p>'+esc(w.headline)+'</p>'+(arr56(w.top).length?'<ol class="w56top">'+arr56(w.top).map(function(t){return '<li>'+esc(t)+'</li>';}).join("")+'</ol>':'')+'</section>';
    h+='<div class="w56cols"><div class="w56c">';
    if(w.away)h+=list56("While you were out",w.away.label||"",w.catchup,"Nothing big happened.");
    else if(arr56(w.catchup).length)h+=list56("Since last week","",w.catchup);
    h+=list56("Time-sensitive","dated, soonest first",w.timeSensitive,"Nothing dated this week.");
    h+='</div><div class="w56c">';
    h+=list56("Hiring that needs you","",w.hiring,"No hiring items need you.");
    if(arr56(w.cleanup).length)h+=list56("Clean up the board","stale or duplicate items Ultron can't close for you",w.cleanup);
    h+='</div></div>';
    if(arr56(w.projects).length)h+='<section class="panel w56p"><h2>Big projects <small>what each one needs from you this week</small></h2><div class="w56prs">'+arr56(w.projects).map(proj56).join("")+'</div></section>';
    h+=days56(w);
    h+='</div>';return h;
  }
  function w56Head(){var w=wp56();var sub=w?('Week of '+shortDate(w.weekOf)+(w.builtAt?' · built '+agoTxt(w.builtAt):'')):'';
    return pageHeadHTML("",VIEW_TITLE.setup,sub,'<button type="button" class="btn ghost" data-view="today">Today\'s plan</button><button type="button" class="btn ghost" data-view="week">Week grid</button>');}
  var _render56=render;
  render=function(){
    if(view!=="setup"){_render56.apply(this,arguments);try{w56Banner();}catch(e){}return;}
    view="claude";try{_render56.apply(this,arguments);}finally{view="setup";}
    var pg=document.querySelector("main .page");
    if(pg){pg.className="page page-setup";var ft=pg.querySelector(":scope > footer");pg.innerHTML=w56Head()+setupHTML()+(ft?ft.outerHTML:"");}
    document.querySelectorAll('.snav [data-view],.bnav [data-view]').forEach(function(b){var on=b.dataset.view==="setup";b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
    try{buildJump();}catch(e){}
  };
  function w56Banner(){
    if(view!=="today")return;var w=wp56Cur();if(!w)return;
    var t=todayISO(),dow=new Date(t+"T12:00:00").getDay();
    if(!(dow===1||w.showOn===t))return;
    var pg=document.querySelector("main .page-today");if(!pg||pg.querySelector(".w56ban"))return;
    var el=document.createElement("section");el.className="panel w56ban";
    el.innerHTML='<div><b>'+(w.away?'Welcome back. ':'')+'Monday is your setup day.</b><span>'+esc(w.headline||"Catch up, then set the week.")+'</span></div><button type="button" class="btn" data-view="setup">Open This week</button>';
    var head=pg.querySelector(".pghead, header, h1");if(head&&head.parentNode===pg)head.insertAdjacentElement("afterend",el);else pg.insertBefore(el,pg.firstChild);
  }

