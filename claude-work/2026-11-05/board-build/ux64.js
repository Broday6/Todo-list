  /* ===== Pages re-imagined (Nov 23, patch64; Brody: "Re imagine the actual pages as well not just the overall navigation")
     Same principles as patch63. Each page leads with the one question it answers, then the detail.
     - Tasks: smart lists like Things/Reminders (Overdue, Today, Next 7 days, No date, With Claude, All). One clean list,
       round checkboxes, tap a task for its note and one-tap re-dating. "All" keeps the full classic list and its tools.
     - Hiring: "Waiting on you" first, then a pipeline board by stage (change a stage right on the card), applicants per
       job, colleges. The full editable tracker stays in a fold at the bottom.
     - Sales: one headline number, a 14-report trend, each site as a share bar, the week, and what was unusual.
     - This week: the week's Top 3, a five-day calendar strip, what's time-sensitive, catch-up, and project cards with
       progress. All read from state.weekPlan.
     Only shown with the new look (D63.on). Every control writes through the existing handlers (data-tchk, data-redate,
     data-close, data-hz), so saving and logging are unchanged. */
  var P64={tl:"overdue",q:"",more:{},open:{},role:"all",closed:false,newAll:false};
  try{var tl64=localStorage.getItem("bb.tl64");if(tl64)P64.tl=tl64;}catch(e){}
  function head64(kick,title,sub,right){
    return '<header class="p64h"><div>'+(kick?'<p class="h63k">'+kick+'</p>':'')+'<h1>'+esc(title)+'</h1>'+(sub?'<p class="h63s">'+sub+'</p>':'')+'</div>'+(right?'<div class="p64r">'+right+'</div>':'')+'</header>';
  }
  function pill64(t,tone){return '<span class="pl64 '+(tone||'')+'">'+esc(t)+'</span>';}
  function ago64(iso){if(!iso)return "";var n=daysBetween(String(iso).slice(0,10),todayISO());return n<=0?"today":n===1?"1 day":n+" days";}

  /* ---------- Tasks ---------- */
  var GRP64={now:"Now",inbox:"From email",g5q1:"G5 plan",abtests:"A/B tests",cases:"Cases",bugherd:"BugHerd",frozen:"Frozen"};
  function grp64(g){g=String(g||"");return GRP64[g]||(g.indexOf("idea-")===0?"Idea: "+g.slice(5):g);}
  function open64(){return state.tasks.filter(function(t){return !t.done&&t.group!=="frozen"&&String(t.group).indexOf("idea-")!==0&&t.group!=="bugherd"&&t.group!=="cases";});}
  function lists64(){
    var td=todayISO(),wk=(function(){var d=parseISO(td);d.setDate(d.getDate()+7);return isoOf(d);})(),o=open64();
    return [
      {k:"overdue",n:"Overdue",tone:"bad",ic:"⚠︎",l:o.filter(function(t){return t.due&&t.due<td;})},
      {k:"today",n:"Today",tone:"acc",ic:"◉",l:o.filter(function(t){return t.due===td;})},
      {k:"week",n:"Next 7 days",tone:"",ic:"▦",l:o.filter(function(t){return t.due&&t.due>td&&t.due<=wk;})},
      {k:"nodate",n:"No date",tone:"",ic:"○",l:o.filter(function(t){return !t.due;})},
      {k:"claude",n:"With Claude",tone:"",ic:"✦",l:state.tasks.filter(function(t){return !t.done&&t.assignee==="claude";})},
      {k:"all",n:"All tasks",tone:"",ic:"≡",l:null}];
  }
  function trow64(t){
    var td=todayISO(),late=t.due&&t.due<td?daysBetween(t.due,td):0,op=!!P64.open[t.id];
    var meta=[];
    if(t.due)meta.push(late?'<em class="bad">'+esc(shortDate(t.due))+' · '+late+'d late</em>':t.due===td?'<em class="acc">Today</em>':esc(shortDate(t.due)));
    if(t.from)meta.push(esc(t.from));
    meta.push(esc(grp64(t.group)));
    if(t.assignee==="claude")meta.push('<em class="acc">Claude'+(t.claudeStatus?' · '+esc(t.claudeStatus):'')+'</em>');
    var h='<li class="'+(op?'open':'')+'"><label class="c63"><input type="checkbox" data-tchk="'+esc(t.id)+'" aria-label="Done: '+esc(t.title)+'"><span aria-hidden="true"></span></label>';
    h+='<div class="l63m"><button type="button" class="t64t" data-tx64="'+esc(t.id)+'" aria-expanded="'+(op?'true':'false')+'">'+esc(t.title)+(t.top?'<em>Top</em>':'')+'</button><span>'+meta.join(' · ')+'</span>';
    if(op){
      if(t.note)h+='<p>'+esc(clip(t.note,700))+'</p>';
      h+='<div class="t64a"><button type="button" data-redate="'+esc(t.id)+'" data-to="'+td+'">Today</button><button type="button" data-redate="'+esc(t.id)+'" data-to="'+nextMonday()+'">Next Mon</button><button type="button" data-redate="'+esc(t.id)+'" data-to="">No date</button><button type="button" class="cl-drop" data-close="drop" data-id="'+esc(t.id)+'">Not needed</button></div>';
    }
    return h+'</div></li>';
  }
  function tasks64(){
    var L=lists64(),cur=L.filter(function(x){return x.k===P64.tl;})[0]||L[0],q=P64.q.trim().toLowerCase();
    var od=L[0].l.length;
    var h=head64("",'Tasks',open64().length+' open'+(od?' · <span class="bad">'+od+' overdue</span>':''),'<button type="button" class="b63" data-act="pal">New task</button>');
    h+='<div class="t64"><nav class="t64n" aria-label="Task lists">';
    L.forEach(function(x){h+='<button type="button" data-tl64="'+x.k+'"'+(x.k===cur.k&&!q?' class="on" aria-current="true"':'')+'><b class="'+x.tone+'" aria-hidden="true">'+x.ic+'</b><span>'+esc(x.n)+'</span>'+(x.l?'<i>'+x.l.length+'</i>':'')+'</button>';});
    h+='</nav><div class="t64b">';
    h+='<input type="search" class="t64q" id="t64q" placeholder="Search all open tasks" value="'+esc(P64.q)+'" aria-label="Search tasks">';
    if(q){
      var r=state.tasks.filter(function(t){return !t.done&&(String(t.title)+" "+String(t.note||"")).toLowerCase().indexOf(q)>=0;});
      h+='<section class="g63"><h3>Results <small>'+r.length+'</small></h3>'+(r.length?'<ul class="l63 t64l">'+r.slice(0,80).map(trow64).join('')+'</ul>':'<p class="empty63">No open task matches.</p>')+'</section>';
    }else if(cur.k==="all"){
      h+='<div class="t64all">'+cuHTML()+needsHTML()+tasksHTML()+'</div>';
    }else{
      var blk=cur.k==="overdue"?cur.l.filter(function(t){return /^ho-blk-/.test(t.id);}):[];
      var l=cur.l.filter(function(t){return blk.indexOf(t)<0||P64.blk;}).sort(function(a,b){return String(a.due||"9").localeCompare(String(b.due||"9"))||(b.top?1:0)-(a.top?1:0);});
      var cap=P64.more[cur.k]?l.length:30;
      h+='<section class="g63"><h3>'+esc(cur.n)+' <small>'+cur.l.length+'</small></h3>';
      if(blk.length>=3)h+='<div class="bk64"><span class="l63m"><b>'+blk.length+' are leftover plan blocks from past days</b><span>Check emails, Bug Herds, Wrap and the like. They were never ticked on their day.</span></span><div class="t64a"><button type="button" data-dropblk64>Mark all '+blk.length+' not needed</button><button type="button" class="cl-drop" data-showblk64>'+(P64.blk?'Hide them':'Show them')+'</button></div></div>';
      if(!l.length)h+='<p class="empty63">'+(cur.k==="overdue"?'Nothing overdue. Nice.':'Nothing here.')+'</p>';
      else{h+='<ul class="l63 t64l">'+l.slice(0,cap).map(trow64).join('')+'</ul>';if(l.length>cap)h+='<button type="button" class="lk63 t64more" data-tm64="'+cur.k+'">Show '+(l.length-cap)+' more</button>';}
      if(cur.k==="overdue"&&l.length>10)h+='<p class="t64hint">Tip: open a task to move it to Today, next Monday or no date, or mark it not needed. The bulk tools are under All tasks.</p>';
      h+='</section>';
    }
    return h+'</div></div>';
  }

  /* ---------- Hiring ---------- */
  var ST64=["New","Asked","Replied","Phone screen","In person","Offer","Hired"];
  function roleName64(r){for(var i=0;i<HZ_ROLES.length;i++)if(HZ_ROLES[i][0]===r)return HZ_ROLES[i][1];return "";}
  function hiring64(){
    var H=hz();if(!H)return head64("","Hiring","No hiring tracker yet.");
    var sw=H.sweep||{},inb=(sw.inbox&&sw.inbox.needReply)||[],C=H.candidates||[];
    var role=P64.role,cf=C.filter(function(c){return role==="all"||c.role===role;});
    var wait=inb.filter(function(x){return role==="all"||(role==="ecom"?x.ecom:String(x.role||"").toLowerCase().indexOf(role==="fullstack"?"full":"inside")>=0);});
    var rep=cf.filter(function(c){return c.stage==="Replied";});
    var act=cf.filter(function(c){return ST64.indexOf(c.stage)>0&&c.stage!=="Hired";}).length;
    var sub=(wait.length+rep.length)+' waiting on you · '+act+' in progress · '+cf.filter(function(c){return c.stage==="New";}).length+' new';
    var asOf=sw.asOf?' · Handshake read '+esc(shortDate(String(sw.asOf).slice(0,10))):'';
    var h=head64("",'Hiring',sub+asOf,'<a class="b63 ghost" href="https://app.joinhandshake.com/emp/conversations" target="_blank" rel="noopener">Handshake ↗</a>');
    h+='<nav class="sg64" aria-label="Role">';
    [["all","All roles"]].concat(HZ_ROLES.filter(function(r){return r[0];})).forEach(function(r){h+='<button type="button" data-role64="'+r[0]+'"'+(role===r[0]?' class="on"':'')+'>'+esc(r[1])+'</button>';});
    h+='</nav>';
    /* waiting on you */
    h+='<section class="g63"><h3>Waiting on you <small>'+(wait.length+rep.length)+'</small></h3>';
    if(!wait.length&&!rep.length)h+='<p class="empty63">No one is waiting on a reply from you.</p>';
    else{h+='<ul class="l63 nav">';
      wait.forEach(function(x){h+='<li><div class="row63"><span class="t63 '+(x.ecom?'warn':'')+'"></span><span class="l63m"><b>'+esc(x.name)+' <em class="rl64">'+esc(x.role||"")+'</em></b><span>'+esc(clip(x.gist||"",140))+'</span></span><span class="ago64">'+esc(ago64(x.on))+'</span></div></li>';});
      rep.forEach(function(c){h+='<li><div class="row63"><span class="t63 warn"></span><span class="l63m"><b>'+esc(c.name)+' <em class="rl64">'+esc(roleName64(c.role))+'</em></b><span>'+esc(clip(c.next||c.note||"",140))+'</span></span><span class="ago64">'+esc(ago64(c.stageOn))+'</span></div></li>';});
      h+='</ul>';}
    h+='</section>';
    /* pipeline */
    h+='<section class="g63"><h3>Pipeline <small>'+cf.length+' people</small><button type="button" class="lk63" data-closed64>'+(P64.closed?'Hide':'Show')+' passed ('+cf.filter(function(c){return c.stage==="Passed"||c.stage==="No reply";}).length+')</button></h3><div class="pp64">';
    var cols=ST64.concat(P64.closed?["Passed","No reply"]:[]);
    var tr={A:0,B:1,C:2,D:3};
    cols.forEach(function(st){
      var l=cf.filter(function(c){return (c.stage||"New")===st;}).sort(function(a,b){return (a.tier in tr?tr[a.tier]:5)-(b.tier in tr?tr[b.tier]:5)||String(b.stageOn||"").localeCompare(String(a.stageOn||""));});
      var cap=st==="New"&&!P64.newAll?10:999;
      h+='<div class="pc64"><h4>'+esc(st)+' <i>'+l.length+'</i></h4>';
      if(!l.length)h+='<p class="pe64">None</p>';
      l.slice(0,cap).forEach(function(c){
        var opts=HZ_STAGE.map(function(s){return '<option'+(s===c.stage?' selected':'')+'>'+esc(s)+'</option>';}).join('');
        h+='<article class="cd64"><div class="cd64t"><b>'+esc(c.name)+'</b>'+(c.tier?pill64(c.tier,c.tier==="A"?"ok":c.tier==="B"?"acc":""):'')+'</div>';
        h+='<p>'+esc([roleName64(c.role),c.loc||c.school].filter(Boolean).join(' · '))+'</p>';
        if(c.next)h+='<p class="nx64">'+esc(clip(c.next,110))+'</p>';
        if((c.top&&c.top.length)||c.tierWhy)h+='<details><summary>Why</summary>'+(c.tierWhy?'<p>'+esc(c.tierWhy)+'</p>':'')+(c.top?'<ul>'+c.top.slice(0,3).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'')+'</details>';
        h+='<label class="st64"><span>Stage</span><select data-hz="p" data-id="'+esc(c.id)+'" data-f="stage" aria-label="Stage, '+esc(c.name)+'">'+opts+'</select></label></article>';
      });
      if(l.length>cap)h+='<button type="button" class="lk63" data-newall64>Show '+(l.length-cap)+' more</button>';
      h+='</div>';
    });
    h+='</div></section>';
    /* applicants per job + colleges */
    h+='<div class="two64">';
    var jobs=sw.jobs||[];
    h+='<section class="g63"><h3>Applicants on Handshake</h3>'+(jobs.length?'<ul class="l63 nav">'+jobs.map(function(j){
      var ppl=(j.people||[]).slice(0,10);
      return '<li><details class="jb64"><summary class="row63"><span class="t63 '+(j.newCount?'acc':'')+'"></span><span class="l63m"><b>'+esc(j.role)+'</b><span>'+esc((j.total||0)+' applicants'+(j.newCount?' · '+j.newCount+' new since the last read':''))+'</span></span><i class="chev63">›</i></summary><ul class="pl64l">'+ppl.map(function(p){return '<li><b>'+esc(p.name)+'</b><span>'+esc([p.school,p.major].filter(Boolean).join(' · '))+(p.applied?' · applied '+esc(shortDate(String(p.applied).slice(0,10))):'')+'</span></li>';}).join('')+'</ul></details></li>';}).join('')+'</ul>':'<p class="empty63">No Handshake read yet.</p>')+'</section>';
    var cl=(H.colleges||[]).filter(function(c){return c.status!=="Done";}).sort(function(a,b){return HZ_CSTAT.indexOf(a.status)-HZ_CSTAT.indexOf(b.status);});
    h+='<section class="g63"><h3>Colleges <small>'+cl.length+' open</small></h3>'+(cl.length?'<ul class="l63 nav">'+cl.map(function(c){var tone=c.status==="Action on us"?"bad":c.status==="Meeting booked"?"acc":c.status==="Replied"?"ok":"";
      return '<li><div class="row63"><span class="t63 '+tone+'"></span><span class="l63m"><b>'+esc(c.name)+' <em class="rl64">'+esc(c.status||"")+'</em></b><span>'+esc(clip(c.next||c.heard||"",130))+(c.due?' · due '+esc(shortDate(c.due)):'')+'</span></span></div></li>';}).join('')+'</ul>':'<p class="empty63">No open college threads.</p>')+'</section>';
    h+='</div>';
    h+='<details class="full64"><summary>Full tracker: edit colleges, roles and candidates, add someone</summary>'+(hiringHTML()||'')+'</details>';
    return h;
  }

  /* ---------- Sales ---------- */
  function sales64(){
    var day=state.days[state.today]||{},p=day.pulse;
    if(!p||!p.found)return head64("","Sales","The 6:15 sales pulse isn’t in yet.");
    var pc=p.dollarsPct,op=p.ordersPct,lab=String(p.label||"").split(".")[0];
    var h=head64("",'Sales','Order confirmations are a proxy; NetSuite is the source of truth.',p.link?'<a class="b63 ghost" href="'+esc(p.link)+'" target="_blank" rel="noopener">Pulse email ↗</a>':'');
    h+='<section class="hero64"><p class="h63k">'+esc(lab)+'</p><div class="hero64n"><b>'+money63(p.dollars)+'</b>'+(pc!=null?pill64((pc>=0?'+':'')+pc+'%',pc>=0?'ok':'bad'):'')+'</div><p>'+esc((p.orders||0).toLocaleString())+' orders'+(op!=null?' ('+(op>=0?'+':'')+op+'%)':'')+(p.dollarsPrev?' · '+money63(p.dollarsPrev)+' the same days last week':'')+'</p>';
    /* trend */
    var ks=Object.keys(state.days).sort().filter(function(k){var q=state.days[k].pulse;return q&&q.found&&q.dollars;}).slice(-14);
    if(ks.length>2){
      var mx=Math.max.apply(null,ks.map(function(k){return state.days[k].pulse.dollars;})),W=ks.length*40,Hh=120;
      h+='<svg class="tr64" viewBox="0 0 '+W+' '+(Hh+28)+'" role="img" aria-label="Sales by report, last '+ks.length+' reports">';
      ks.forEach(function(k,i){var v=state.days[k].pulse.dollars,bh=Math.max(2,Math.round(v/mx*Hh)),x=i*40+6,last=k===state.today;
        var lb=parseISO(k).toLocaleDateString(undefined,{month:"numeric",day:"numeric"});
        h+='<g><title>'+esc(shortDate(k))+': '+money63(v)+'</title><rect x="'+x+'" y="'+(Hh-bh+14)+'" width="28" height="'+bh+'" rx="5" class="'+(last?'on':'')+'"/><text x="'+(x+14)+'" y="'+(Hh+26)+'" text-anchor="middle">'+esc(lb)+'</text>'+(last?'<text x="'+(x+14)+'" y="'+(Hh-bh+8)+'" text-anchor="middle" class="v">'+esc(Math.round(v/1000)+'k')+'</text>':'')+'</g>';});
      h+='</svg><p class="tr64c">Each bar is one morning’s pulse (Mondays cover Fri–Sun).</p>';
    }
    h+='</section>';
    var S=(p.sites||[]).slice().sort(function(a,b){return (b.dollars||0)-(a.dollars||0);}),tot=S.reduce(function(a,b){return a+(b.dollars||0);},0)||1;
    h+='<div class="two64"><section class="g63"><h3>By site</h3><ul class="l63 st64l">'+S.map(function(x){var sh=Math.round((x.dollars||0)/tot*100);
      return '<li><div class="si64"><div class="si64t"><b>'+esc(x.name)+'</b><span>'+money63(x.dollars)+(x.pct!=null?' <em class="'+(x.pct>=0?'up':'dn')+'">'+(x.pct>=0?'+':'')+x.pct+'%</em>':(x.note?' <small>'+esc(x.note)+'</small>':''))+'</span></div><div class="br64"><i style="width:'+Math.max(1,sh)+'%"></i></div><small>'+(x.orders||0)+' orders · '+sh+'% of sales</small></div></li>';}).join('')+'</ul></section>';
    var w=p.week;
    h+='<div class="h63r">';
    if(w&&w.found){var wc=w.cmpDollars?Math.round((w.dollars/w.cmpDollars-1)*100):null;
      h+='<section class="g63"><h3>'+esc(w.label||"Week")+' <small>'+esc(shortDate(w.start)+'–'+shortDate(w.end))+'</small></h3><div class="k63"><div><b>'+money63(w.dollars)+'</b><span>'+(wc!=null?'<em class="'+(wc>=0?'up':'dn')+'">'+(wc>=0?'+':'')+wc+'%</em> vs the same days last week':'No comparison yet')+'</span></div><div><b>'+(w.orders||0).toLocaleString()+'</b><span>orders'+(w.partial?' · partial':'')+'</span></div></div></section>';}
    if((p.flags||[]).length)h+='<section class="g63"><h3>Worth knowing</h3><ul class="l63 nav">'+p.flags.map(function(f){return '<li><div class="row63"><span class="t63 '+(/check|missing|cut off|no emails|double/i.test(f)?'warn':'')+'"></span><span class="l63m"><span class="fl64">'+esc(f)+'</span></span></div></li>';}).join('')+'</ul></section>';
    h+='</div></div>';
    return h;
  }

  /* ---------- This week ---------- */
  function when64(w){if(!w)return "";var d=String(w).slice(0,10),t=String(w).slice(11,16);var s=parseISO(d).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});return s+(t?' · '+h12(t):'');}
  function week64(){
    var wp=state.weekPlan;if(!wp)return head64("","This week","Claude builds the week plan every Monday morning.");
    var td=todayISO();
    var h=head64('Week of '+esc(shortDate(wp.weekOf||td)),'This week',esc(wp.headline||""));
    if((wp.top||[]).length)h+='<ol class="top64">'+wp.top.slice(0,3).map(function(x,i){return '<li><b>'+(i+1)+'</b><span>'+esc(typeof x==="string"?x:(x.text||""))+'</span></li>';}).join('')+'</ol>';
    if((wp.days||[]).length){h+='<div class="dy64">';
      wp.days.forEach(function(d){var on=d.date===td,past=d.date<td;
        h+='<section class="'+(on?'on':'')+(past?' past':'')+'"><h4>'+esc(String(d.label||d.date).split(' ')[0])+' <small>'+esc(String(d.label||"").split(' ').slice(1).join(' '))+'</small></h4><p class="fo64">'+esc(d.focus||"")+'</p>';
        (d.meetings||[]).forEach(function(m){h+='<p class="mt64">'+esc(m)+'</p>';});
        (d.due||[]).forEach(function(m){h+='<p class="du64">'+esc(m)+'</p>';});
        (d.note||[]).forEach(function(m){h+='<p class="no64">'+esc(m)+'</p>';});
        h+='</section>';});
      h+='</div>';}
    function items(l,showWhen){return '<ul class="l63 nav">'+l.map(function(x){var tone=x.tone==="bad"?"bad":x.tone==="warn"?"warn":x.tone==="acc"?"acc":x.tone==="ok"?"ok":"";
      var link=x.view&&isTab(x.view)?' data-view="'+esc(x.view)+'"':'';
      var inner='<span class="t63 '+tone+'"></span><span class="l63m"><b>'+(x.who?'<em class="rl64">'+esc(x.who)+'</em> ':'')+esc(x.text||"")+'</b>'+((showWhen&&x.when)||x.sub?'<span>'+esc([showWhen&&x.when?when64(x.when):"",x.sub||""].filter(Boolean).join(' · '))+'</span>':'')+'</span>';
      return '<li>'+(link?'<button type="button" class="row63"'+link+'>'+inner+'<i class="chev63">›</i></button>':'<div class="row63">'+inner+'</div>')+'</li>';}).join('')+'</ul>';}
    h+='<div class="two64">';
    if((wp.timeSensitive||[]).length)h+='<section class="g63"><h3>Time-sensitive <small>'+wp.timeSensitive.length+'</small></h3>'+items(wp.timeSensitive.filter(function(x){return String(x.when||"9")>=td||x.tone==="bad";}),true)+'</section>';
    if((wp.catchup||[]).length)h+='<section class="g63"><h3>Catch-up <small>'+wp.catchup.length+'</small></h3>'+items(wp.catchup)+'</section>';
    h+='</div>';
    if((wp.projects||[]).length){h+='<section class="g63"><h3>Projects <small>'+wp.projects.length+'</small></h3><div class="pj64">';
      wp.projects.forEach(function(p){var ids=p.taskIds||[],tk=ids.map(findTask).filter(Boolean),dn=tk.filter(function(t){return t.done;}).length,pct=tk.length?Math.round(dn/tk.length*100):0;
        var tone=p.tone==="bad"?"bad":p.tone==="warn"?"warn":p.tone==="ok"?"ok":"acc";
        h+='<article class="pj64c"><div class="pj64t"><b>'+esc(p.name)+'</b>'+pill64(p.status||"",tone)+'</div>'+(p.why?'<p>'+esc(p.why)+'</p>':'');
        if((p.next||[]).length)h+='<ul>'+p.next.slice(0,4).map(function(n){return '<li>'+esc(n)+'</li>';}).join('')+'</ul>';
        h+='<div class="pj64f">'+(tk.length?'<div class="br64"><i style="width:'+pct+'%"></i></div><small>'+dn+' of '+tk.length+' tasks done'+(p.due?' · due '+esc(shortDate(p.due)):'')+'</small>':(p.due?'<small>Due '+esc(shortDate(p.due))+'</small>':''))+(p.view&&isTab(p.view)?'<button type="button" class="lk63" data-view="'+esc(p.view)+'">'+esc(p.viewLabel||"Open")+'</button>':'')+'</div></article>';});
      h+='</div></section>';}
    h+='<div class="two64">';
    if((wp.hiring||[]).length)h+='<section class="g63"><h3>Hiring</h3>'+items(wp.hiring)+'</section>';
    if((wp.cleanup||[]).length)h+='<section class="g63"><h3>Clean up</h3>'+items(wp.cleanup)+'</section>';
    h+='</div>';
    return h;
  }

  var PAGES64={tasks:tasks64,hiring:hiring64,sales:sales64,setup:week64};
  var _render64=render;
  render=function(){
    var r=_render64.apply(this,arguments);
    if(D63.on&&view==="tasks"&&P64.tl==="all"&&!P64.q.trim()){try{var pa=document.querySelector("main .page");if(pa&&!pa.querySelector(".t64top")){pa.classList.add("p64all");
      var L=lists64(),nv='<div class="t64top">'+head64("",'Tasks',open64().length+' open','<button type="button" class="b63" data-act="pal">New task</button>')+'<nav class="t64n flat" aria-label="Task lists">';
      L.forEach(function(x){nv+='<button type="button" data-tl64="'+x.k+'"'+(x.k==="all"?' class="on" aria-current="true"':'')+'><b class="'+x.tone+'" aria-hidden="true">'+x.ic+'</b><span>'+esc(x.n)+'</span>'+(x.l?'<i>'+x.l.length+'</i>':'')+'</button>';});
      pa.insertAdjacentHTML("afterbegin",nv+'</nav></div>');}}catch(e){console.error("tasks64all",e);}
      return r;}
    if(D63.on&&PAGES64[view]){try{var pg=document.querySelector("main .page");if(pg){var y=window.scrollY,f=document.activeElement&&document.activeElement.id;pg.className="page page-"+view+" page63 p64";pg.innerHTML=PAGES64[view]();
      if(f==="t64q"){var q=document.getElementById("t64q");if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);}}}}catch(e){console.error("page64",e);}}
    return r;
  };
  document.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest("[data-tl64],[data-tx64],[data-tm64],[data-role64],[data-closed64],[data-newall64],[data-dropblk64],[data-showblk64]");if(!t)return;
    if(t.hasAttribute("data-showblk64")){P64.blk=!P64.blk;render();return;}
    if(t.hasAttribute("data-dropblk64")){if(readOnly)return;var td=todayISO(),n=0;
      state.tasks.forEach(function(x){if(x.done||!/^ho-blk-/.test(x.id)||!x.due||x.due>=td)return;
        x.update={on:td,by:"Brody",text:"Marked not needed (old plan block)."};logTask(x,"drop");setTaskDone(x,true);x.doneVia="dropped";x.dropped={on:td,t:new Date().toISOString(),title:x.title,from:x.from||"",subject:""};n++;});
      save();chip(n+" old plan blocks marked not needed.");return;}
    if(t.dataset.tl64){P64.tl=t.dataset.tl64;P64.q="";try{localStorage.setItem("bb.tl64",P64.tl);}catch(x){}render();return;}
    if(t.dataset.tx64){P64.open[t.dataset.tx64]=!P64.open[t.dataset.tx64];render();return;}
    if(t.dataset.tm64){P64.more[t.dataset.tm64]=true;render();return;}
    if(t.hasAttribute("data-role64")){P64.role=t.dataset.role64;render();return;}
    if(t.hasAttribute("data-closed64")){P64.closed=!P64.closed;render();return;}
    if(t.hasAttribute("data-newall64")){P64.newAll=true;render();return;}
  });
  document.addEventListener("input",function(e){if(e.target&&e.target.id==="t64q"){P64.q=e.target.value;clearTimeout(P64._t);P64._t=setTimeout(render,180);}});
  (function(){var st=document.createElement("style");st.id="ux64-css";
    st.textContent='html.d63 .p64{max-width:1180px;gap:22px}'
      +'.p64h{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 24px}.p64h h1{margin:2px 0 0;font-size:34px;line-height:1.12;font-weight:700;letter-spacing:-.022em}.p64h .h63s .bad{color:var(--bad);font-weight:600}'
      +'.p64r{display:flex;gap:8px}.b63{border:0;font:inherit}'
      +'.pl64{display:inline-block;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--sunk);color:var(--muted);white-space:nowrap}.pl64.ok{background:var(--ok-soft);color:var(--ok)}.pl64.bad{background:var(--bad-soft);color:var(--bad)}.pl64.warn{background:var(--warn-soft);color:var(--warn)}.pl64.acc{background:var(--accent-soft);color:var(--accent)}'
      /* tasks */
      +'.t64{display:grid;grid-template-columns:1fr;gap:18px;align-items:start}@media(min-width:900px){.t64{grid-template-columns:220px minmax(0,1fr)}}'
      +'.t64n{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}@media(min-width:900px){.t64n{flex-direction:column;position:sticky;top:20px;gap:2px}}'
      +'.t64n button{display:flex;align-items:center;gap:10px;flex:none;padding:9px 12px;border:0;border-radius:10px;background:transparent;color:var(--ink);font:inherit;font-size:14.5px;cursor:pointer;text-align:left}'
      +'@media(max-width:899px){.t64n button{background:var(--panel);box-shadow:var(--shadow63)}}'
      +'.t64n button b{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;background:var(--sunk);color:var(--muted);font-size:12px}.t64n button b.bad{background:var(--bad);color:#fff}.t64n button b.acc{background:var(--accent);color:#fff}'
      +'.t64n button span{flex:1}.t64n button i{font-style:normal;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}'
      +'.t64n button:hover{background:rgba(120,120,128,.10)}.t64n button.on{background:rgba(120,120,128,.18);font-weight:600}'
      +'.t64b{display:flex;flex-direction:column;gap:16px;min-width:0}'
      +'.t64q{width:100%;padding:10px 14px;border:0;border-radius:12px;background:var(--sunk);font:inherit;font-size:15px;color:var(--ink)}.t64q:focus{outline:2px solid var(--accent);background:var(--panel)}'
      +'.t64t{display:block;padding:0;border:0;background:none;color:var(--ink);font:inherit;font-size:15px;font-weight:500;text-align:left;cursor:pointer;line-height:1.35;overflow-wrap:anywhere}.t64t em{font-style:normal;font-size:11px;font-weight:600;color:var(--accent);background:var(--accent-soft);padding:1px 6px;border-radius:5px;margin-left:8px}'
      +'.t64l .l63m span em{font-style:normal}.t64l .l63m span em.bad{color:var(--bad)}.t64l .l63m span em.acc{color:var(--accent)}'
      +'.t64l li.open{background:rgba(120,120,128,.05)}'
      +'.t64a{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}.t64a button{border:0;border-radius:980px;padding:6px 12px;background:var(--accent-soft);color:var(--accent);font:inherit;font-size:13px;font-weight:500;cursor:pointer}.t64a .cl-drop{background:var(--sunk);color:var(--muted)}'
      +'.bk64{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin:0 0 12px;padding:12px 16px;border-radius:14px;background:var(--warn-soft)}.bk64 .l63m{padding:0;flex:1 1 260px}'+'.p64all>.phead,.p64all>.seg62{display:none}.t64top{display:flex;flex-direction:column;gap:14px}.t64n.flat{flex-direction:row!important;flex-wrap:wrap;position:static}.t64n.flat button{background:var(--panel);box-shadow:var(--shadow63)}.t64n.flat button.on{background:rgba(120,120,128,.18)}'+'.t64more{margin:10px 4px 0}.t64hint{margin:10px 4px 0;font-size:13px;color:var(--muted)}'
      /* segmented */
      +'.sg64{display:flex;flex-wrap:wrap;width:fit-content;max-width:100%;gap:2px;padding:3px;border-radius:10px;background:var(--sunk)}.sg64 button{border:0;background:transparent;color:var(--muted);font:inherit;font-size:13.5px;font-weight:500;padding:6px 14px;border-radius:8px;cursor:pointer}.sg64 button.on{background:var(--panel);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.12)}'
      +'.rl64{font-style:normal;font-size:12px;font-weight:500;color:var(--muted);margin-left:4px}.ago64{flex:none;font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums;padding-right:4px}'
      /* pipeline */
      +'.pp64{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(220px,1fr);gap:12px;overflow-x:auto;padding:2px 2px 10px;scroll-snap-type:x proximity}'
      +'.pc64{display:flex;flex-direction:column;gap:8px;min-width:0;scroll-snap-align:start}.pc64 h4{margin:0 4px 2px;font-size:13px;font-weight:600;color:var(--muted);display:flex;justify-content:space-between}.pc64 h4 i{font-style:normal;font-variant-numeric:tabular-nums}'
      +'.pe64{margin:0;padding:12px;border:1px dashed var(--line-strong);border-radius:12px;font-size:13px;color:var(--muted);text-align:center}'
      +'.cd64{background:var(--panel);border-radius:12px;box-shadow:var(--shadow63);padding:12px 12px 10px;display:flex;flex-direction:column;gap:4px}'
      +'.cd64t{display:flex;justify-content:space-between;align-items:center;gap:8px}.cd64t b{font-size:14.5px;font-weight:600}.cd64 p{margin:0;font-size:12.5px;color:var(--muted);line-height:1.4}.cd64 p.nx64{color:var(--ink)}'
      +'.cd64 details{font-size:12.5px}.cd64 summary{cursor:pointer;color:var(--accent)}.cd64 details ul{margin:4px 0 0;padding-left:16px;color:var(--muted)}'
      +'.st64{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:12px;color:var(--muted)}.st64 select{flex:1;min-width:0;padding:4px 6px;border:0;border-radius:7px;background:var(--sunk);font:inherit;font-size:12.5px;color:var(--ink)}'
      +'.two64{display:grid;grid-template-columns:1fr;gap:20px;align-items:start}@media(min-width:960px){.two64{grid-template-columns:1fr 1fr}}'
      +'.jb64 summary{list-style:none}.jb64 summary::-webkit-details-marker{display:none}.jb64[open] .chev63{transform:rotate(90deg)}'
      +'.pl64l{margin:0;padding:0 14px 10px 36px;list-style:none;display:flex;flex-direction:column;gap:6px}.pl64l li{font-size:13px;display:flex;flex-direction:column}.pl64l li span{color:var(--muted);font-size:12.5px}'
      +'.full64{background:var(--panel);border-radius:14px;box-shadow:var(--shadow63);padding:12px 16px}.full64>summary{cursor:pointer;font-size:14px;font-weight:500;color:var(--accent)}.full64[open]>summary{margin-bottom:12px}'
      /* sales */
      +'.hero64{background:var(--panel);border-radius:18px;box-shadow:var(--shadow63);padding:20px 22px}.hero64n{display:flex;align-items:center;gap:12px;margin-top:4px}.hero64n b{font-size:48px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.05}.hero64n .pl64{font-size:14px;padding:3px 10px}'
      +'.hero64>p{margin:6px 0 0;color:var(--muted);font-size:14px}'
      +'.tr64{display:block;width:100%;height:auto;max-height:190px;margin-top:16px}.tr64 rect{fill:var(--sunk)}.tr64 rect.on{fill:var(--accent)}.tr64 text{font-size:10px;fill:var(--muted)}.tr64 text.v{fill:var(--ink);font-weight:600}.tr64 g:hover rect{fill:var(--line-strong)}.tr64 g:hover rect.on{fill:var(--accent)}'
      +'.tr64c{margin:2px 0 0;font-size:12px;color:var(--muted)}'
      +'.si64{flex:1;padding:12px 16px 12px 0;display:flex;flex-direction:column;gap:6px;min-width:0}.si64t{display:flex;justify-content:space-between;gap:10px}.si64t b{font-weight:600}.si64t span{font-variant-numeric:tabular-nums}.si64t em{font-style:normal;font-weight:600}.si64t em.up{color:var(--ok)}.si64t em.dn{color:var(--bad)}.si64 small{font-size:12px;color:var(--muted)}'
      +'.st64l>li+li::before{left:14px!important}'
      +'.br64{height:6px;border-radius:3px;background:var(--sunk);overflow:hidden}.br64 i{display:block;height:100%;border-radius:3px;background:var(--accent)}'
      +'.fl64{font-size:14px!important;color:var(--ink)!important;line-height:1.45}'
      /* week */
      +'.top64{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:900px){.top64{grid-template-columns:repeat(3,1fr)}}'
      +'.top64 li{display:flex;gap:12px;align-items:flex-start;background:var(--panel);border-radius:16px;box-shadow:var(--shadow63);padding:16px}.top64 b{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff;font-size:14px}.top64 span{font-size:15px;line-height:1.4;font-weight:500}'
      +'.dy64{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:900px){.dy64{grid-template-columns:repeat(5,1fr)}}'
      +'.dy64 section{background:var(--panel);border-radius:14px;box-shadow:var(--shadow63);padding:12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}.dy64 section.on{box-shadow:0 0 0 1.5px var(--accent)}.dy64 section.past{opacity:.55}'
      +'.dy64 h4{margin:0;font-size:15px;font-weight:700}.dy64 h4 small{font-weight:400;color:var(--muted);font-size:12.5px}.dy64 section.on h4{color:var(--accent)}'
      +'.dy64 p{margin:0;font-size:13px;line-height:1.4}.dy64 .fo64{font-weight:500}.dy64 .mt64{color:var(--accent)}.dy64 .du64{color:var(--warn)}.dy64 .du64::before{content:"Due · ";font-weight:600}.dy64 .no64{color:var(--muted)}'
      +'.pj64{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}'
      +'.pj64c{background:var(--panel);border-radius:14px;box-shadow:var(--shadow63);padding:14px 16px;display:flex;flex-direction:column;gap:8px;min-width:0}'
      +'.pj64t{display:flex;flex-direction:column;align-items:flex-start;gap:6px}.pj64t b{font-size:15.5px;font-weight:600;line-height:1.3}.pj64c p{margin:0;font-size:13px;color:var(--muted);line-height:1.45}'
      +'.pj64c ul{margin:0;padding-left:18px;font-size:13px;line-height:1.45;display:flex;flex-direction:column;gap:3px}'
      +'.pj64f{margin-top:auto;display:flex;flex-direction:column;gap:5px;padding-top:6px}.pj64f small{font-size:12px;color:var(--muted)}.pj64f .lk63{align-self:flex-start;font-size:13px}'
      /* inbox: lighter rows */
      +'html.d63 .page-inbox .mrow{border-left-width:0!important;border-radius:12px;background:var(--panel);box-shadow:var(--shadow63);padding:14px 16px!important;margin-bottom:10px}'
      
      +'html.d63 .page-inbox .seg62{display:none}';
    document.head.appendChild(st);})();
