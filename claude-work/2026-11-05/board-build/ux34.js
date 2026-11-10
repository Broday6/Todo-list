  /* ===== Health, Log in, approvals that stick (Nov 9, patch34; Brody: "make a watch dog and also make an evaluator
     for the board and tasks", "add a button on the computer that says login", PC worker "normally did not catch something").
     1. Control room > Health shows state.health, written by the "Ultron — watchdog and evaluator" routine
        (claude-work/tools/evaluate_board.py). Problems also show on Today's Needs you list.
     2. Log in: opens every work sign-in page (state.logins), and saves a desktop file that does the same.
     3. state.pcApprovals keeps each go Brody gives on a PC alert task by alert type, so a newer alert email
        replacing the task can't erase it. */

  /* ---- 1. Health ---- */
  CTL_TABS.unshift(["health","Health"]);
  function hlFresh(H){return !!(H&&H.asOf&&Date.now()-Date.parse(H.asOf)<9*3600000);}
  function healthHTML(){
    var H=state.health,h='<section class="panel hl" id="sec-health"><h2>Health <small>'+(H&&H.asOf?'checked '+esc(agoTxt(H.asOf)):'not checked yet')+'</small></h2>';
    if(!H)return h+'<p class="empty">The watchdog hasn’t run yet. It checks every weekday at 7:27 am and 1:27 pm.</p></section>'+loginHTML();
    var E=H.evaluator||{},W=H.watchdog||[],sc=+E.score||0;
    h+='<div class="hl-top"><div class="hl-score '+(sc>=85?'ok':sc>=70?'warn':'bad')+'"><b>'+sc+'</b><span>board score</span></div><div class="hl-sum">';
    h+=(H.bad?'<b class="hl-bad">'+H.bad+' problem'+(H.bad===1?'':'s')+' to fix</b>':'<b class="hl-ok">Nothing is broken</b>')+(H.warn?' · '+H.warn+' to look at':'');
    h+='<div class="tm-m">The watchdog judges each automation by what it left on the board, not by whether it started. The evaluator scores the board and your open tasks. Both run weekdays at 7:27 am and 1:27 pm.</div></div></div>';
    h+='<h3>Watchdog</h3>';
    if(!W.length)h+='<p class="empty">Every automation left its mark.</p>';
    else{h+='<ul class="hl-list">';W.forEach(function(w){h+='<li><span class="stag '+(w.level==="bad"?'bad':'warn')+'">'+(w.level==="bad"?'Problem':'Look')+'</span><div><div class="hl-t">'+esc(w.label)+'</div><div class="hl-d">'+esc(w.detail)+'</div><div class="hl-f"><b>Fix:</b> '+esc(w.fix)+'</div></div></li>';});h+='</ul>';}
    h+='<h3>Evaluator</h3><ul class="hl-list">';
    (E.checks||[]).forEach(function(c){
      h+='<li><span class="stag '+(c.ok?'ok':'warn')+'">'+(c.ok?'OK':'Fix')+'</span><div><div class="hl-t">'+esc(c.label)+(c.id==="size"?'':' <span class="hl-n">'+(+c.count||0)+'</span>')+'</div><div class="hl-d">'+esc(c.detail)+'</div>';
      if(!c.ok&&c.ids&&c.ids.length)h+='<div class="hl-ids">'+c.ids.slice(0,4).map(function(id){var t=findTask(id);return t?'<button type="button" class="linkbtn" data-opentask="'+esc(id)+'">'+esc(clip(t.title,38))+'</button>':'';}).join("")+'</div>';
      h+='</div></li>';});
    h+='</ul>';
    var M=E.metrics||{};
    h+='<h3>Last 7 days</h3><div class="hl-m"><span><b>'+(+M.closed7||0)+'</b>tasks closed</span><span><b>'+(+M.claudeDone7||0)+'</b>finished by Claude</span><span><b>'+(+M.claudeNeedsYou7||0)+'</b>stopped for you</span>'+(M.planTicked7!=null?'<span><b>'+(+M.planTicked7)+'%</b>of plan ticked</span>':'')+'<span><b>'+(+M.openTasks||0)+'</b>open tasks</span></div>';
    var L=(state.healthLog||[]).slice(-10);
    if(L.length>1)h+='<p class="hl-trend">Score by day: '+L.map(function(x){return esc(shortDate(x.day))+' <b>'+(+x.score||0)+'</b>';}).join(' · ')+'</p>';
    return h+'</section>'+loginHTML();
  }
  var _autoHealth=autoHTML;
  autoHTML=function(){
    var h=_autoHealth();if(ctlTab!=="health")return h;
    var k=h.lastIndexOf('data-ctl="'),i=k>=0?h.indexOf('</div>',k):-1;
    return i<0?h+healthHTML():h.slice(0,i+6)+healthHTML();
  };
  var _ny34=nyItems;
  nyItems=function(){
    var out=_ny34()||[],H=state.health;
    if(hlFresh(H))(H.watchdog||[]).forEach(function(w){if(w.level!=="bad")return;
      out.unshift({k:"auto",rank:-1,on:"",t:w.label+": "+w.detail,m:w.fix,act:'<button type="button" class="linkbtn" data-view="auto" data-ctlgo="health">Health</button>'});});
    return out;
  };
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-ctlgo]");if(!b)return;ctlTab=b.dataset.ctlgo;setTimeout(render,0);
  },true);

  /* ---- 2. Log in ---- */
  var LOGINS_DEFAULT=[
    {name:"NetSuite",url:"https://362135.app.netsuite.com/"},
    {name:"Marketing Portal",url:"https://productmarketing.pcienterprises.com/html/home.php"},
    {name:"Google Ads",url:"https://ads.google.com"},
    {name:"Microsoft Ads",url:"https://ads.microsoft.com"},
    {name:"Merchant Center",url:"https://merchants.google.com"},
    {name:"BugHerd",url:"https://www.bugherd.com/projects/295205/kanban"},
    {name:"Handshake",url:"https://app.joinhandshake.com/emp/conversations"},
    {name:"Indeed",url:"https://employers.indeed.com"},
    {name:"Asana",url:"https://app.asana.com"}
  ];
  function logins(){
    var L=(state.logins&&state.logins.length?state.logins:LOGINS_DEFAULT).filter(function(x){return x&&x.name&&/^https:\/\/[^\s"'<>]+$/.test(String(x.url||""));});
    return L;
  }
  function loginHTML(mini){
    var L=logins();if(!L.length)return '';
    var h='<section class="panel lg'+(mini?' lg-mini':'')+'" id="'+(mini?'sec-login-mini':'sec-login')+'"><h2>Log in <small>'+L.length+' work apps</small></h2>';
    h+='<div class="lg-a"><button type="button" class="btn" data-lgall="1">Open all sign-in pages</button><button type="button" class="btn ghost" data-lgfile="1">Put a Log in button on my desktop</button></div>';
    if(!mini)h+='<p class="hint">Sign in to each tab once in the morning. The desktop button is a small file: save it to your Desktop and double-click it to open every sign-in page at once.</p>';
    h+='<details class="lg-d"'+(mini?'':' open')+'><summary>Open one at a time</summary><div class="lg-l">'+L.map(function(x){return '<a class="linkbtn" href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.name)+' ↗</a>';}).join("")+'</div></details>';
    return h+'</section>';
  }
  function loginCmd(){
    var s='@echo off\r\nrem Ultron Log in: opens every work sign-in page in your default browser.\r\n';
    logins().forEach(function(x){s+='start "" "'+String(x.url).replace(/%/g,"%%").replace(/"/g,"")+'"\r\n';});
    return s;
  }
  function loginPage(){
    var L=logins(),a=L.map(function(x){return '<li><a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.name)+'</a></li>';}).join("");
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Ultron Log in</title><style>body{font:16px system-ui,sans-serif;margin:40px;max-width:520px}button{font:inherit;padding:10px 16px;margin:0 0 16px}li{margin:6px 0}</style></head><body><h1>Log in</h1><button id="all">Open all sign-in pages</button><ul id="l">'+a+'</ul><script>document.getElementById("all").onclick=function(){[].forEach.call(document.querySelectorAll("#l a"),function(x){window.open(x.href,"_blank");});};<\/script></body></html>\n';
  }
  document.addEventListener("click",function(e){
    if(e.target.closest("[data-lgall]")){
      var n=0;logins().forEach(function(x){try{var w=window.open(x.url,"_blank");if(w){n++;try{w.opener=null;}catch(er){}}}catch(err){}});
      chip(n>=logins().length?"Opened "+n+" sign-in pages.":"Your browser only let some open. Use the links under “Open one at a time”, or the desktop button.",n<logins().length);
      return;
    }
    if(e.target.closest("[data-lgfile]")){
      if(!(window.claude&&window.claude.use)){chip("Downloads aren’t available in this view.",true);return;}
      window.claude.use("downloads").then(function(d){
        if(!d){chip("Downloads aren’t available in this view.",true);return;}
        return d.save({filename:"Ultron Log in.cmd",data:loginCmd()}).then(function(){chip("Saved “Ultron Log in.cmd”. Put it on your Desktop and double-click it.");},function(er){
          if(er&&er.code==="declined")return;
          return d.save({filename:"Ultron Log in.html",data:loginPage()}).then(function(){chip("Saved “Ultron Log in.html”. Put it on your Desktop; open it and press Open all.");},function(e2){if(e2&&e2.code==="declined")return;chip("Couldn’t save the file here.",true);});
        });
      },function(){chip("Downloads aren’t available in this view.",true);});
    }
  });
  var _nyTop34=nyTopHTML;
  nyTopHTML=function(){return _nyTop34()+((view==="today"||!view)?loginHTML(true):'');};

  /* ---- 3. approvals that stick ---- */
  function pcType(id){return String(id||"").replace(/-\d{8}$/,"");}
  function pcApprSync(){
    var A=state.pcApprovals||(state.pcApprovals={}),ch=false;
    (state.tasks||[]).forEach(function(t){
      if(!t||!t.pcOnly||!t.approved||!t.approved.t)return;
      var k=pcType(t.id),cur=A[k];
      if(!cur||String(cur.t)<String(t.approved.t)){A[k]={t:t.approved.t,what:String(t.approved.what||"").slice(0,300),taskId:t.id,by:"Brody"};ch=true;}
    });
    return ch;
  }
  var _save34=save;
  save=function(){try{pcApprSync();}catch(e){}return _save34.apply(this,arguments);};
  var _sitStep34=sitStep;
  sitStep=function(t){
    var s=_sitStep34(t),a=t&&t.pcOnly&&!t.approved&&state.pcApprovals&&state.pcApprovals[pcType(t.id)];
    if(a&&a.t)s="You said go for this alert type on "+shortDate(String(a.t).slice(0,10))+". The PC worker should carry that over to this newer alert. "+s;
    return s;
  };

  /* A routine with no recorded run yet must not show "Missed a run" from an old saved date. */
  var _auState34=auState;
  auState=function(r){
    var s=_auState34(r),x=r.trig&&AU_LAST[r.trig];
    if(s&&s.t==="Missed a run"&&r.trig&&!(x&&x.on))return {k:"mut",t:"Can’t check from this view",on:s.on};
    return s;
  };
