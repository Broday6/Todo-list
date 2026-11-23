  /* ===== Redesign: calm, focused, Apple-style (Nov 23, patch63; Brody: "Looking at designers best practices redesign our
     application. Use ideas from Apple and top designers to build something out that is truly useful.")
     Principles used (Apple HIG: clarity, deference, depth; Rams: less but better; Things/Linear: one list, one next step):
     - Today answers three questions in order: what's now, what's next, what needs me. Everything else is one click away.
     - Six main destinations at the top of the sidebar (Today, Inbox, Tasks, This week, Hiring, Sales); every other page stays
       listed below under a quiet More label (Brody, Nov 13: no page may be hidden in the sidebar).
     - System font, Apple system colors, hairline separators, inset grouped lists, translucent bars, 44px touch targets.
     - Nothing is removed: every page still exists, and "Classic Today" brings the old Today back (per browser).
     Ticking uses the same data-blk checkboxes as the old plan, so logging and saving are unchanged. */
  var D63={on:true,more:false,open:{}};
  try{D63.on=localStorage.getItem("bb.classic63")!=="1";}catch(e){}
  var NAV63=["today","inbox","tasks","setup","hiring","sales"];
  function nav63(){return NAV63.filter(isTab);}
  function d63Apply(){document.documentElement.classList.toggle("d63",D63.on);}
  d63Apply();
  if(D63.on){PRIMARY=["today","inbox","tasks"].concat(isTab("setup")?["setup"]:["week"]);}
  var SHORT63={setup:"This week",abtests:"A/B tests",g5:"G5 plan",work:"Claude at work",auto:"Automations",chat:"Live chat",claude:"Claude"};
  function name63(k){return SHORT63[k]||tabName(k);}

  /* ---- sidebar ---- */
  var _side63=sideHTML;
  sideHTML=function(c,qLeft,ql){
    if(!D63.on)return _side63.apply(this,arguments);
    var P=nav63(),h='<aside class="side side63" aria-label="Board navigation">';
    h+='<div class="s63brand"><span class="slogo" aria-hidden="true"></span><div><b>Ultron</b><small>Saved '+esc(savedLabel())+'</small></div></div>';
    h+='<button type="button" class="s63find" data-act="pal">'+icon("search")+'<span>Search or add</span><kbd>'+(isMac()?'⌘K':'Ctrl K')+'</kbd></button>';
    h+='<nav class="s63nav">';
    P.forEach(function(k){var n=c&&c[k==="setup"?"week":k];if(k==="today")n=c&&c.today;
      h+='<button type="button" data-view="'+k+'"'+(view===k?' class="on" aria-current="page"':'')+'>'+icon(k)+'<span>'+esc(name63(k))+'</span>'+(n&&k!=="today"?'<i'+(n.bad?' class="bad"':'')+'>'+esc(n.n)+'</i>':'')+'</button>';});
    var rest=TABS.filter(function(t){return P.indexOf(t[0])<0&&String(t[0]).indexOf("hub-")!==0;});
    /* Brody, Nov 13: every page stays visible in the sidebar (folded groups once hid 8 tabs). So More is a quiet label, not a fold. */
    h+='<p class="s63lbl">More</p><div class="s63rest">';
    rest.forEach(function(t){var n=c&&c[t[0]];
      h+='<button type="button" data-view="'+t[0]+'"'+(view===t[0]?' class="on" aria-current="page"':'')+'>'+icon(t[0])+'<span>'+esc(name63(t[0]))+'</span>'+(n?'<i'+(n.bad?' class="bad"':'')+'>'+esc(n.n)+'</i>':'')+'</button>';});
    h+='</div>';
    h+='</nav>';
    var qPct=Math.max(0,Math.min(100,Math.round((92-qLeft)/92*100)));
    h+='<div class="s63foot">'+(typeof livePillHTML==="function"?livePillHTML():'')+'<div class="s63q"><span>'+esc(qLeft>=0?qLeft+' days left in '+ql:Math.abs(qLeft)+' days past '+ql)+'</span><i><b style="width:'+qPct+'%"></b></i></div><button type="button" class="s63classic" data-classic63>Classic look</button></div></aside>';
    return h;
  };

  /* ---- Today ---- */
  function cur63(day,isToday){
    var bl=(day.blocks||[]).slice().sort(function(a,b){return toMin(a.start)-toMin(b.start);}),nm=nowMin(),cur=null,nxt=null;
    bl.forEach(function(b){if(b.done)return;var s=toMin(b.start),e=toMin(b.end);
      if(isToday&&s<=nm&&nm<e&&!cur)cur=b;else if((!isToday||s>nm)&&!nxt)nxt=b;});
    if(!cur&&!nxt&&isToday){nxt=bl.filter(function(b){return !b.done&&!b.meeting;})[0]||null;}
    return {bl:bl,cur:cur,nxt:nxt,nm:nm};
  }
  function chk63(b,label){return '<label class="c63" title="'+esc(label||"Mark done")+'"><input type="checkbox" data-blk="'+esc(b.id)+'"'+(b.done?' checked':'')+' aria-label="'+esc((b.done?"Done: ":"Mark done: ")+b.title)+'"><span aria-hidden="true"></span></label>';}
  function tasks63(b){return (b.taskIds||[]).map(findTask).filter(Boolean);}
  function nowCard63(x,isToday){
    var b=x.cur||x.nxt;
    if(!b){var left=x.bl.filter(function(z){return !z.done;}).length;
      return '<section class="n63 calm"><p class="n63k">'+(x.bl.length?'Plan clear':'No plan yet')+'</p><h2>'+(x.bl.length?(left?left+' blocks left, nothing scheduled now':'Everything on today’s plan is done'):'Claude builds the plan at 6:50')+'</h2></section>';}
    var isNow=b===x.cur,s=toMin(b.start),e=toMin(b.end),when=h12(b.start)+'–'+h12(b.end);
    var rel=isNow?inMin(e-x.nm)+' left':(isToday&&s>x.nm?'in '+inMin(s-x.nm):'');
    var tk=tasks63(b).filter(function(t){return !t.done;});
    var h='<section class="n63'+(isNow?' isnow63':'')+(b.meeting?' mtg':'')+'" aria-label="'+(isNow?'Now':'Up next')+'">';
    h+='<div class="n63top"><p class="n63k">'+(isNow?'<i class="dot63"></i>Now':'Up next')+'</p><p class="n63w">'+esc(when)+(rel?' · <b>'+esc(rel)+'</b>':'')+'</p></div>';
    h+='<h2>'+esc(b.title)+'</h2>';
    if(b.sub)h+='<p class="n63s">'+esc(clip(b.sub,260))+'</p>';
    if(tk.length)h+='<ul class="n63t">'+tk.slice(0,4).map(function(t){return '<li>'+esc(clip(t.title,90))+'</li>';}).join('')+'</ul>';
    h+='<div class="n63a"><label class="b63"><input type="checkbox" data-blk="'+esc(b.id)+'"'+(b.done?' checked':'')+'>'+(b.meeting?'Mark attended':'Mark done')+'</label>';
    (b.links||[]).slice(0,2).forEach(function(l){if(l&&l.href)h+='<a class="b63 ghost" href="'+esc(l.href)+'" target="_blank" rel="noopener">'+esc(clip(l.label||"Open",34))+'</a>';});
    h+='</div>';
    var after=x.cur&&x.nxt?x.nxt:null;
    if(after)h+='<p class="n63n">Then <b>'+esc(after.title)+'</b> at '+esc(h12(after.start))+'</p>';
    return h+'</section>';
  }
  function top63(x){
    var t=x.bl.filter(function(b){return b.top;});if(!t.length)return '';
    var dn=t.filter(function(b){return b.done;}).length;
    return '<section class="g63"><h3>Top 3 <small>'+dn+' of '+t.length+' done</small></h3><ul class="l63">'+t.map(function(b){
      return '<li class="'+(b.done?'done':'')+'">'+chk63(b)+'<div class="l63m"><b>'+esc(b.title)+'</b><span>'+esc(h12(b.start))+'</span></div></li>';}).join('')+'</ul></section>';
  }
  function plan63(x,isToday){
    var dn=x.bl.filter(function(b){return b.done;}).length;
    var h='<section class="g63" id="sec-plan63"><h3>Today’s plan <small>'+dn+' of '+x.bl.length+' done</small><button type="button" class="lk63" data-view="'+(isTab("sched")?"sched":"today")+'">Full schedule</button></h3><ul class="l63 plan">';
    x.bl.forEach(function(b){
      var s=toMin(b.start),e=toMin(b.end),past=isToday&&e<=x.nm&&!b.done,now=b===x.cur,op=!!D63.open[b.id];
      h+='<li class="'+[b.done?'done':'',b.meeting?'mtg':'',now?'now':'',past?'late':'',op?'open':''].join(' ')+'">'+chk63(b)+'<button type="button" class="l63m" data-x63="'+esc(b.id)+'" aria-expanded="'+(op?'true':'false')+'"><b>'+esc(b.title)+(b.top?'<em>Top</em>':'')+'</b><span>'+esc(h12(b.start)+'–'+h12(b.end))+(b.meeting?' · Meeting':'')+(now?' · Now':'')+'</span>'+(op&&b.sub?'<p>'+esc(b.sub)+'</p>':'')+'</button></li>';
    });
    if(!x.bl.length)h+='<li class="empty63">No blocks yet. Claude builds the plan at 6:50 each weekday.</li>';
    return h+'</ul></section>';
  }
  function needs63(day){
    var rows=[],mc=null;
    try{mc=mCounts(mItems(day));}catch(e){}
    if(mc&&(mc.needs+mc.draft))rows.push({t:(mc.needs+mc.draft)+' email'+(mc.needs+mc.draft===1?'':'s')+' to answer',m:mc.draft?mc.draft+' draft'+(mc.draft>1?'s':'')+' ready to send':'From this morning’s triage',v:"inbox",tone:"acc",ic:"inbox"});
    try{var ap=apItems().length;if(ap)rows.push({t:ap+' waiting on your OK',m:'Imports and fixes Claude built',v:"approvals",tone:"warn",ic:"approvals"});}catch(e){}
    var od=state.tasks.filter(function(t){return !t.done&&t.due&&t.group!=="frozen"&&String(t.group).indexOf("idea-")!==0&&daysBetween(todayISO(),t.due)<0;}).length;
    if(od)rows.push({t:od+' overdue task'+(od>1?'s':''),m:'Re-date, hand to Claude, or drop',v:"tasks",tone:"bad",ic:"tasks"});
    var ny=[];try{ny=nyItems();}catch(e){}
    ny=ny.filter(function(n){return n.k==="auto";}).concat(ny.filter(function(n){return n.k!=="auto";})).slice(0,Math.max(5,ny.filter(function(n){return n.k==="auto";}).length));
    ny.forEach(function(n){var m=/data-view="([^"]+)"/.exec(n.act||"");rows.push({t:clip(n.t,80),m:n.m,v:m?m[1]:"",act:m?'':n.act,tone:n.k==="auto"?"bad":"",tag:NY_TAG[n.k]||""});});
    var h='<section class="g63"><h3>Needs you <small>'+rows.length+'</small></h3>';
    if(!rows.length)return h+'<p class="empty63">Nothing is waiting on you.</p></section>';
    h+='<ul class="l63 nav">';
    rows.forEach(function(r){
      var inner='<span class="t63 '+(r.tone||'')+'" aria-hidden="true"></span><span class="l63m"><b>'+esc(clip(r.t,110))+'</b>'+(r.m||r.tag?'<span>'+esc(clip((r.tag?r.tag+' · ':'')+(r.m||''),110))+'</span>':'')+'</span>';
      h+=r.v?'<li><button type="button" class="row63" data-view="'+esc(r.v)+'">'+inner+'<i class="chev63" aria-hidden="true">›</i></button></li>':'<li><div class="row63">'+inner+(r.act||'')+'</div></li>';
    });
    return h+'</ul></section>';
  }
  function money63(n){n=+n||0;return '$'+(n>=1e6?(n/1e6).toFixed(2)+'M':Math.round(n).toLocaleString());}
  function nums63(day){
    var p=day.pulse;if(!p||!p.found)return '<section class="g63"><h3>Sales</h3><p class="empty63">The 6:15 sales pulse isn’t in yet.</p></section>';
    var pc=p.dollarsPct,w=p.week;
    var h='<section class="g63"><h3>Sales <button type="button" class="lk63" data-view="sales">Details</button></h3><div class="k63">';
    h+='<div><b>'+money63(p.dollars)+'</b><span>'+esc(String(p.label||"").split(".")[0])+(pc!=null?' · <em class="'+(pc>=0?'up':'dn')+'">'+(pc>=0?'+':'')+pc+'%</em>':'')+'</span></div>';
    if(w&&w.found)h+='<div><b>'+money63(w.dollars)+'</b><span>'+esc(w.label||"Week")+(w.cmpDollars?' · <em class="'+(w.dollars>=w.cmpDollars?'up':'dn')+'">'+(w.dollars>=w.cmpDollars?'+':'')+Math.round((w.dollars/w.cmpDollars-1)*100)+'%</em>':'')+'</span></div>';
    return h+'</div></section>';
  }
  function week63(){
    var wp=state.weekPlan;if(!wp||!Array.isArray(wp.days)||!wp.days.length)return '';
    var t=state.today,tv=isTab("setup")?"setup":"week";
    var h='<section class="g63"><h3>This week <button type="button" class="lk63" data-view="'+tv+'">Open</button></h3>';
    if(Array.isArray(wp.top)&&wp.top.length)h+='<ol class="w63top">'+wp.top.slice(0,3).map(function(x){return '<li>'+esc(clip(typeof x==="string"?x:(x.text||""),120))+'</li>';}).join('')+'</ol>';
    h+='<ul class="w63">';
    wp.days.forEach(function(d){var on=d.date===t,past=d.date<t;
      h+='<li class="'+(on?'on':'')+(past?' past':'')+'"><b>'+esc(String(d.label||d.date).split(' ')[0])+'</b><span>'+esc(clip(d.focus||"",80))+'</span></li>';});
    return h+'</ul></section>';
  }
  function home63(){
    var day=state.days[state.today]||{blocks:[],log:[]},isToday=state.today===todayISO(),x=cur63(day,isToday);
    var dn=x.bl.filter(function(b){return b.done;}).length,wp=state.weekPlan;
    var sub=(wp&&wp.showOn===state.today&&wp.headline)?wp.headline:(x.bl.length?dn+' of '+x.bl.length+' blocks done':'');
    var h='<div class="h63">';
    h+='<header class="h63h"><p class="h63k">'+esc(fmtDate(state.today))+(isToday?'':' · <span class="stale">Not today’s plan</span>')+'</p><h1>'+esc(greet())+', Brody</h1>'+(sub?'<p class="h63s">'+esc(sub)+'</p>':'')+'</header>';
    h+='<div class="h63g"><div class="h63m">'+nowCard63(x,isToday)+top63(x)+plan63(x,isToday)+'</div>';
    h+='<div class="h63r">'+needs63(day)+nums63(day)+week63()+'</div></div>';
    h+='<p class="h63f">Every page is still in the sidebar under <b>More</b>, or press '+(isMac()?'⌘K':'Ctrl K')+'. <button type="button" class="lk63" data-classic63>Use the classic Today</button></p>';
    return h+'</div>';
  }
  var _render63=render;
  render=function(){
    d63Apply();
    var r=_render63.apply(this,arguments);
    if(D63.on){try{document.querySelectorAll('.side63 [data-view]').forEach(function(b){var on=b.dataset.view===view;b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});}catch(e){}}
    if(D63.on&&view==="today"){try{var pg=document.querySelector("main .page");if(pg){pg.className="page page-today page63";pg.innerHTML=home63();}}catch(e){console.error("home63",e);}}
    return r;
  };
  document.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest("[data-classic63],[data-x63]");if(!t)return;
    if(t.hasAttribute("data-classic63")){D63.on=!D63.on;try{localStorage.setItem("bb.classic63",D63.on?"0":"1");}catch(x){}
      PRIMARY=D63.on?["today","inbox","tasks"].concat(isTab("setup")?["setup"]:["week"]):["today","sched","inbox","tasks"];render();chip(D63.on?"New look on.":"Classic look on. Switch back from the sidebar.");return;}
    var id=t.getAttribute("data-x63");D63.open[id]=!D63.open[id];render();
  });
  (function(){var st=document.createElement("style");st.id="ux63-css";
    var L='--sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Inter","Segoe UI",Roboto,system-ui,sans-serif;--bg:#F5F5F7;--panel:#FFFFFF;--sunk:#EEEEF0;--side:rgba(246,246,248,.82);--ink:#1D1D1F;--muted:#6E6E73;--line:rgba(60,60,67,.13);--line-strong:rgba(60,60,67,.22);--accent:#0071E3;--accent-soft:rgba(0,113,227,.10);--ok:#248A3D;--ok-soft:rgba(36,138,61,.12);--warn:#B25000;--warn-soft:rgba(255,149,0,.14);--bad:#D70015;--bad-soft:rgba(255,59,48,.12);--radius:14px;--mono:var(--sans);--shadow63:0 1px 2px rgba(0,0,0,.04),0 0 0 .5px rgba(0,0,0,.05);';
    var D='--bg:#000000;--panel:#1C1C1E;--sunk:#2C2C2E;--side:rgba(28,28,30,.78);--ink:#F5F5F7;--muted:#98989D;--line:rgba(84,84,88,.42);--line-strong:rgba(84,84,88,.65);--accent:#0A84FF;--accent-soft:rgba(10,132,255,.18);--ok:#30D158;--ok-soft:rgba(48,209,88,.16);--warn:#FF9F0A;--warn-soft:rgba(255,159,10,.16);--bad:#FF453A;--bad-soft:rgba(255,69,58,.16);--shadow63:0 0 0 .5px rgba(255,255,255,.08);';
    st.textContent='html.d63{'+L+'}'
      +'@media (prefers-color-scheme:dark){html.d63:not([data-theme="light"]){'+D+'}}html.d63[data-theme="dark"]{'+D+'}'
      +'html.d63 body{font-family:var(--sans);background:var(--bg);color:var(--ink);letter-spacing:-.003em;font-feature-settings:"kern"}'
      +'html.d63 .panel,html.d63 .ncol,html.d63 .tile{border:0!important;box-shadow:var(--shadow63)!important;border-radius:var(--radius)!important}'
      +'html.d63 .btn{border-radius:980px;font-weight:500}'+'html.d63 nav.jump{display:none!important}'+'@media(max-width:560px){html.d63 *:has(>textarea[name="chq"]){flex-wrap:wrap}html.d63 textarea[name="chq"]{flex:1 1 100%!important;min-width:250px}}'+'html.d63 .mono,html.d63 .t,html.d63 .lt,html.d63 .wt,html.d63 .num{font-variant-numeric:tabular-nums}'
      +'html.d63 .ptitle{font-size:34px;font-weight:700;letter-spacing:-.022em}'
      /* sidebar */
      +'html.d63 .side63{background:var(--side)!important;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-right:.5px solid var(--line-strong)!important;padding:16px 10px 12px;gap:4px}'
      +'.s63brand{display:flex;align-items:center;gap:10px;padding:2px 8px 10px}.s63brand b{display:block;font-size:15px;font-weight:600}.s63brand small{display:block;font-size:11.5px;color:var(--muted)}'
      +'.s63find{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 10px;padding:7px 10px;border:0;border-radius:9px;background:var(--sunk);color:var(--muted);font:inherit;font-size:13px;cursor:pointer}.s63find svg{width:15px;height:15px}.s63find span{flex:1;text-align:left}.s63find kbd{font:inherit;font-size:11px;color:var(--muted)}'
      +'.s63nav{display:flex;flex-direction:column;gap:1px;flex:1;min-height:0;overflow-y:auto}'
      +'.s63nav button{display:flex;align-items:center;gap:10px;width:100%;min-height:34px;padding:6px 10px;border:0;border-radius:8px;background:transparent;color:var(--ink);font:inherit;font-size:14px;text-align:left;cursor:pointer}'
      +'.s63nav button svg{width:18px;height:18px;color:var(--accent);flex:none}.s63nav button span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      +'.s63nav button:hover{background:rgba(120,120,128,.10)}.s63nav button.on{background:rgba(120,120,128,.18);font-weight:600}'
      +'.s63nav button i{font-style:normal;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}.s63nav button i.bad{color:var(--bad);font-weight:600}'
      +'.s63lbl{margin:14px 10px 4px;font-size:11.5px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}'+'.s63rest button{min-height:30px;font-size:13px;color:var(--muted)}.s63rest button svg{width:16px;height:16px;color:var(--muted)}.s63rest button.on{color:var(--ink)}.s63rest button.on svg{color:var(--accent)}'
      +'.s63rest{display:flex;flex-direction:column;gap:1px}'
      +'.s63foot{display:flex;flex-direction:column;gap:8px;padding:10px 8px 0;border-top:.5px solid var(--line);font-size:12px;color:var(--muted)}'
      +'.s63q i{display:block;height:3px;border-radius:2px;background:var(--sunk);margin-top:5px;overflow:hidden}.s63q i b{display:block;height:100%;background:var(--accent)}'
      +'.s63classic,.lk63{border:0;background:none;padding:0;color:var(--accent);font:inherit;font-size:12.5px;cursor:pointer;text-align:left}'
      /* page */
      +'html.d63 .page63{max-width:1180px;gap:0}'
      +'.h63h{padding:6px 0 22px}.h63k{margin:0;font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}'
      +'.h63h h1{margin:4px 0 0;font-size:34px;line-height:1.12;font-weight:700;letter-spacing:-.022em}'
      +'.h63s{margin:8px 0 0;max-width:68ch;font-size:16px;line-height:1.45;color:var(--muted)}'
      +'.h63g{display:grid;grid-template-columns:1fr;gap:20px;align-items:start}'
      +'@media(min-width:1000px){.h63g{grid-template-columns:minmax(0,1.55fr) minmax(0,1fr)}}'
      +'.h63m,.h63r{display:flex;flex-direction:column;gap:20px;min-width:0}'
      /* now card */
      +'.n63{background:var(--panel);border-radius:18px;padding:20px 22px;box-shadow:var(--shadow63)}'
      +'.n63.isnow63{box-shadow:0 0 0 1.5px var(--accent),0 8px 28px rgba(0,113,227,.12)}'
      +'.n63top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 12px;align-items:baseline}'
      +'.n63k{margin:0;font-size:13px;font-weight:600;color:var(--accent);display:flex;align-items:center;gap:7px}.n63.calm .n63k{color:var(--muted)}'
      +'.dot63{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 0 rgba(0,113,227,.5);animation:pulse63 2s infinite}'
      +'@keyframes pulse63{70%{box-shadow:0 0 0 7px rgba(0,113,227,0)}100%{box-shadow:0 0 0 0 rgba(0,113,227,0)}}'
      +'@media (prefers-reduced-motion:reduce){.dot63{animation:none}}'
      +'.n63w{margin:0;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}.n63w b{color:var(--ink);font-weight:600}'
      +'.n63 h2{margin:6px 0 0;font-size:24px;line-height:1.2;font-weight:700;letter-spacing:-.018em;overflow-wrap:anywhere}'
      +'.n63s{margin:8px 0 0;font-size:15px;line-height:1.5;color:var(--muted)}'
      +'.n63t{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}.n63t li{font-size:14px;padding-left:16px;position:relative}.n63t li::before{content:"";position:absolute;left:2px;top:.55em;width:6px;height:6px;border-radius:50%;border:1.5px solid var(--muted)}'
      +'.n63a{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}'
      +'.b63{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:8px 16px;border-radius:980px;background:var(--accent);color:#fff;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none}'
      +'.b63 input{position:absolute;opacity:0;pointer-events:none}.b63:has(input:checked){background:var(--ok)}.b63:has(input:focus-visible){outline:2px solid var(--accent);outline-offset:2px}'
      +'.b63.ghost{background:var(--accent-soft);color:var(--accent)}'
      +'.n63n{margin:14px 0 0;padding-top:12px;border-top:.5px solid var(--line);font-size:13.5px;color:var(--muted)}.n63n b{color:var(--ink);font-weight:600}'
      /* grouped lists */
      +'.g63 h3{display:flex;align-items:baseline;gap:8px;margin:0 0 8px;padding:0 4px;font-size:20px;font-weight:700;letter-spacing:-.015em}'
      +'.g63 h3 small{font-size:13px;font-weight:400;color:var(--muted);font-variant-numeric:tabular-nums}.g63 h3 .lk63{margin-left:auto;font-size:14px}'
      +'.l63{margin:0;padding:0;list-style:none;background:var(--panel);border-radius:14px;box-shadow:var(--shadow63);overflow:hidden}'
      +'.l63>li{display:flex;align-items:flex-start;gap:12px;padding:0 0 0 14px;position:relative}'
      +'.l63>li+li::before{content:"";position:absolute;top:0;left:48px;right:0;height:.5px;background:var(--line)}'
      +'.l63.nav>li+li::before{left:40px}'
      +'.l63m{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;padding:11px 14px 11px 0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:default}'
      +'button.l63m{cursor:pointer}'
      +'.l63m b{font-size:15px;font-weight:500;line-height:1.35;overflow-wrap:anywhere}.l63m b em{font-style:normal;font-size:11px;font-weight:600;color:var(--accent);background:var(--accent-soft);padding:1px 6px;border-radius:5px;margin-left:8px;vertical-align:2px}'
      +'.l63m span{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}'
      +'.l63m p{margin:6px 0 2px;font-size:14px;line-height:1.5;color:var(--muted)}'
      +'.l63 li.done .l63m b{color:var(--muted);text-decoration:line-through;text-decoration-color:var(--line-strong)}'
      +'.l63 li.mtg .l63m b{color:var(--accent)}.l63 li.now{background:var(--accent-soft)}.l63 li.late .l63m span{color:var(--warn)}'
      +'.c63{position:relative;flex:none;width:22px;height:22px;margin:11px 0 0;cursor:pointer}'
      +'.c63 input{position:absolute;inset:0;margin:0;opacity:0;cursor:pointer}'
      +'.c63 span{display:block;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--line-strong);transition:background .15s,border-color .15s}'
      +'.c63:hover span{border-color:var(--accent)}.c63 input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}'
      +'.c63 input:checked+span{background:var(--accent);border-color:var(--accent);background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M6.5 12.5l3.5 3.5 7.5-8%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272.4%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E");background-size:16px;background-position:center;background-repeat:no-repeat}'
      +'.row63{display:flex;align-items:center;gap:12px;width:100%;padding:0 12px 0 0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;min-height:52px}'
      +'.row63 .btn,.row63 .linkbtn{flex:none;padding:5px 12px;font-size:13px;border-radius:980px;background:var(--accent-soft);color:var(--accent);border:0}'+'div.row63{cursor:default}.row63:hover{background:rgba(120,120,128,.06)}'
      +'.t63{flex:none;width:10px;height:10px;border-radius:50%;background:var(--line-strong)}.t63.acc{background:var(--accent)}.t63.warn{background:var(--warn)}.t63.bad{background:var(--bad)}'
      +'.chev63{font-style:normal;font-size:20px;color:var(--muted);opacity:.6}'
      +'.empty63{margin:0;padding:14px 16px;background:var(--panel);border-radius:14px;box-shadow:var(--shadow63);font-size:14px;color:var(--muted);list-style:none}'
      +'.l63 .empty63{box-shadow:none;border-radius:0}'
      /* numbers + week */
      +'.k63{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border-radius:14px;overflow:hidden;box-shadow:var(--shadow63)}'
      +'.k63>div{background:var(--panel);padding:14px 16px;display:flex;flex-direction:column;gap:4px;min-width:0}'
      +'.k63 b{font-size:26px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.k63 span{font-size:12.5px;color:var(--muted)}'
      +'.k63 em{font-style:normal;font-weight:600}.k63 em.up{color:var(--ok)}.k63 em.dn{color:var(--bad)}'
      +'.w63top{margin:0 0 10px;padding:12px 16px 12px 34px;background:var(--panel);border-radius:14px;box-shadow:var(--shadow63);font-size:14px;line-height:1.45;display:flex;flex-direction:column;gap:6px}'
      +'.w63{margin:0;padding:0;list-style:none;background:var(--panel);border-radius:14px;box-shadow:var(--shadow63);overflow:hidden}'
      +'.w63 li{display:grid;grid-template-columns:44px 1fr;gap:10px;padding:10px 16px;font-size:13.5px;border-top:.5px solid var(--line)}.w63 li:first-child{border-top:0}'
      +'.w63 li b{font-weight:600}.w63 li span{color:var(--muted)}.w63 li.on{background:var(--accent-soft)}.w63 li.on b{color:var(--accent)}.w63 li.past{opacity:.55}'
      +'.h63f{margin:28px 0 0;font-size:13px;color:var(--muted);text-align:center}.h63f .lk63{font-size:13px}'
      /* mobile */
      +'@media(max-width:820px){.h63h h1{font-size:30px}.n63{padding:18px}.n63 h2{font-size:21px}html.d63 .fab{border-radius:50%!important}}'
      +'html.d63 .bnav{background:color-mix(in srgb,var(--panel) 80%,transparent)!important;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-top:.5px solid var(--line-strong)!important}'
      +'html.d63 .bnav button.on{color:var(--accent)}'
      +'html.d63 .topbar{background:color-mix(in srgb,var(--bg) 78%,transparent)!important;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom:.5px solid var(--line-strong)!important}';
    document.head.appendChild(st);})();
