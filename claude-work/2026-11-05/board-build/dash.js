  /* ===== Command center + What changed (Nov 6, Brody: "I want an automated system where I have a dashboard and you do the job";
     "changes I'm interested in, but end changes, not every small change"). */
  var LASTLOOK_KEY="ul.lastLook",lastLook=null,chWin="since";
  try{lastLook=localStorage.getItem(LASTLOOK_KEY);}catch(e){}
  (function(){var mark=function(){try{localStorage.setItem(LASTLOOK_KEY,new Date().toISOString());}catch(e){}};window.addEventListener("pagehide",mark);document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")mark();});})();
  function chStart(){var now=Date.now();if(chWin==="week")return new Date(now-7*864e5);if(chWin==="today"||!lastLook){var d=new Date();d.setHours(0,0,0,0);return d;}var l=new Date(lastLook);return isNaN(l)?new Date(now-864e5):l;}
  function inWin(iso,s){if(!iso)return false;var d=new Date(String(iso).length===10?iso+"T12:00:00":iso);return !isNaN(d)&&d>=s;}
  function changesData(){
    var s=chStart(),G={claude:[],closed:[],added:{},drafts:[],ok:[],runs:[],shipped:[]};
    state.tasks.forEach(function(t){var r=t.receipt;
      if(r&&r.at&&inWin(r.at,s)&&r.status!=="plan")G.claude.push({t:r.at,txt:t.title,sub:r.summary||"",id:t.id,need:r.status==="needs_you",links:(r.where||[]).length});
      if(t.done&&t.doneOn&&inWin(t.doneOn,s)&&t.doneVia!=="cleanup")G.closed.push({t:t.doneOn,txt:t.title,id:t.id,drop:t.doneVia==="dropped"});
      if(!t.done&&t.since&&inWin(t.since,s)){var src=String(t.source||"added by you").replace(/\s+\d{4}-\d\d-\d\d.*$/,"");(G.added[src]=G.added[src]||[]).push({txt:t.title,id:t.id});}
      if(t.outlookDraft&&t.outlookDraft.t&&inWin(t.outlookDraft.t,s))G.drafts.push({t:t.outlookDraft.t,txt:t.outlookDraft.subject||t.title,link:t.outlookDraft.link,id:t.id});
      if(t.approved&&t.approved.t&&inWin(t.approved.t,s))G.ok.push({t:t.approved.t,txt:t.approved.what||t.title,id:t.id});
    });
    Object.keys(state.days||{}).forEach(function(k){var d=state.days[k];(d&&d.log||[]).forEach(function(l){if(l.kind!=="claude")return;var iso=k+"T"+(l.t||"00:00")+":00";if(inWin(iso,s))G.runs.push({t:iso,txt:l.text});});});
    (state.requests||[]).forEach(function(q){if(q.status==="live"&&q.shippedAt&&inWin(q.shippedAt,s))G.shipped.push({t:q.shippedAt,txt:q.text});});
    ["claude","closed","drafts","ok","runs","shipped"].forEach(function(k){G[k].sort(function(a,b){return String(b.t).localeCompare(String(a.t));});});
    return G;
  }
  function chList(arr,fn,max){max=max||5;var h='<ul class="ch-l">'+arr.slice(0,max).map(fn).join("")+'</ul>';if(arr.length>max)h+='<details class="ch-more"><summary>'+(arr.length-max)+' more</summary><ul class="ch-l">'+arr.slice(max).map(fn).join("")+'</ul></details>';return h;}
  function changesHTML(full){
    var G=changesData(),addedN=0,srcs=Object.keys(G.added);srcs.forEach(function(k){addedN+=G.added[k].length;});
    var total=G.claude.length+G.closed.length+addedN+G.drafts.length+G.ok.length+G.shipped.length;
    var lbl=chWin==="week"?"this week":chWin==="today"||!lastLook?"today":"since you last looked ("+rcWhen(lastLook).split(" · ")[0]+")";
    var h='<section class="panel chg'+(full?' full':'')+'" id="sec-chg"><h2>What changed <small>'+lbl+'</small></h2>';
    h+='<div class="ch-win">'+[["since","Since last look"],["today","Today"],["week","This week"]].map(function(w){return '<button type="button" class="dq-tab'+(chWin===w[0]?' on':'')+'" data-chwin="'+w[0]+'">'+w[1]+'</button>';}).join("")+'</div>';
    if(!total&&!G.runs.length)return h+'<p class="empty">Nothing finished or added in this window.</p></section>';
    var op=function(x){return '<li><button type="button" class="tx" data-opentask="'+esc(x.id)+'">'+esc(clip(x.txt,90))+'</button>'+(x.sub?'<span class="ch-s">'+esc(clip(x.sub,120))+'</span>':'')+'</li>';};
    if(G.claude.length)h+='<div class="ch-g ok"><h4><b>'+G.claude.length+'</b> finished by Claude</h4>'+chList(G.claude,function(x){return '<li><span class="ch-w">'+esc(rcWhen(x.t).split(" · ")[0].replace(/^Today at /,""))+'</span><button type="button" class="tx" data-opentask="'+esc(x.id)+'">'+esc(clip(x.txt,90))+'</button>'+(x.need?' <span class="ch-need">needs you</span>':'')+(x.links?' <span class="ch-s">'+x.links+' link'+(x.links>1?'s':'')+'</span>':'')+'</li>';},full?12:4)+'</div>';
    if(G.closed.length)h+='<div class="ch-g"><h4><b>'+G.closed.length+'</b> closed</h4>'+chList(G.closed,function(x){return '<li>'+(x.drop?'<span class="ch-s">not needed · </span>':'')+'<button type="button" class="tx" data-opentask="'+esc(x.id)+'">'+esc(clip(x.txt,90))+'</button></li>';},full?12:3)+'</div>';
    if(addedN)h+='<div class="ch-g acc"><h4><b>'+addedN+'</b> new on your list</h4><ul class="ch-l">'+srcs.map(function(k){var a=G.added[k];return '<li><span class="ch-w">'+a.length+'×</span>'+esc(clip(k,40))+': '+a.slice(0,2).map(function(x){return '<button type="button" class="tx" data-opentask="'+esc(x.id)+'">'+esc(clip(x.txt,50))+'</button>';}).join(", ")+(a.length>2?' …':'')+'</li>';}).join("")+'</ul></div>';
    if(G.drafts.length)h+='<div class="ch-g acc"><h4><b>'+G.drafts.length+'</b> drafts saved in Outlook</h4>'+chList(G.drafts,function(x){return '<li>'+(okHref(x.link)?'<a href="'+esc(x.link)+'" target="_blank" rel="noopener">'+esc(clip(x.txt,90))+'</a>':esc(clip(x.txt,90)))+'</li>';},full?12:3)+'</div>';
    if(G.ok.length)h+='<div class="ch-g warn"><h4><b>'+G.ok.length+'</b> approved by you</h4>'+chList(G.ok,op,3)+'</div>';
    if(G.shipped.length)h+='<div class="ch-g"><h4><b>'+G.shipped.length+'</b> tool changes shipped</h4>'+chList(G.shipped,function(x){return '<li>'+esc(clip(x.txt,120))+'</li>';},3)+'</div>';
    if(G.runs.length)h+='<details class="ch-g runs"'+(full?' open':'')+'><summary><b>'+G.runs.length+'</b> routine runs</summary>'+chList(G.runs,function(x){return '<li><span class="ch-w">'+esc(String(x.t).slice(11,16))+'</span>'+esc(clip(x.txt,200))+'</li>';},full?20:6)+'</details>';
    return h+'</section>';
  }
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-chwin]");if(!b)return;chWin=b.dataset.chwin;render();});
  /* Claude's pipeline: Up next (auto) → Working → Done today */
  function nextRunLabel(){var d=new Date(),h=d.getHours(),m=d.getMinutes(),day=d.getDay();if(day>0&&day<6){var nh=m<12?h:h+1;if(nh>=7&&nh<=17)return nh%12===0?"12:12":(nh%12)+":12";}return "the next weekday run (7:12)";}
  function dashHTML(){
    var up=autoEligible(),working=state.tasks.filter(function(t){return !t.done&&t.assignee==="claude"&&t.claudeStatus==="queued";});
    var today=new Date();today.setHours(0,0,0,0);
    var doneT=state.tasks.filter(function(t){var r=t.receipt;return r&&r.at&&new Date(r.at)>=today&&r.status==="done";});
    var need=dqItems().filter(function(x){return x.k==="decide";}).length;
    var wk=state.tasks.filter(function(t){var r=t.receipt;return r&&r.at&&(Date.now()-new Date(r.at))<7*864e5&&r.status==="done";}).length;
    var h='<section class="cc" aria-label="Command center"><div class="cc-stats">';
    h+='<button type="button" class="cc-s warn" data-dqf="decide"><b>'+need+'</b><span>need your call</span></button>';
    h+='<button type="button" class="cc-s acc" data-ccgo="working"><b>'+working.length+'</b><span>Claude working</span></button>';
    h+='<button type="button" class="cc-s ok" data-dqf="claude"><b>'+doneT.length+'</b><span>done by Claude today</span></button>';
    h+='<button type="button" class="cc-s" data-ccgo="up"><b>'+up.length+'</b><span>queued for auto</span></button>';
    h+='<a class="cc-s" href="'+TASK_LOG_URL+'" target="_blank" rel="noopener"><b>'+wk+'</b><span>finished this week ↗</span></a></div>';
    h+='<div class="cc-pipe"><div class="cc-col" id="cc-up"><h3>Up next <small>Claude takes these on its own at '+esc(nextRunLabel())+'</small></h3>';
    h+=up.length?'<ul>'+up.slice(0,5).map(function(t){var p=pbFor(t);return '<li><button type="button" class="tx cc-t" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,80))+'</button><span class="cc-m">'+esc(p.name)+'</span><span class="cc-a">'+hoBtn("task",t.id,"Start now")+'<button type="button" class="tx" data-ccskip="'+esc(t.id)+'" title="Keep this one for yourself">Not this one</button></span></li>';}).join("")+'</ul>'+(up.length>5?'<p class="cc-more">+'+(up.length-5)+' more. Set which kinds run on their own in <button type="button" class="tx" data-view="auto">Control room › Playbooks</button>.</p>':''):'<p class="empty">Nothing set to auto right now. Turn a playbook to Auto in <button type="button" class="tx" data-view="auto">Control room</button>.</p>';
    h+='</div><div class="cc-col" id="cc-working"><h3>Working <small>'+working.length+'</small></h3>';
    h+=working.length?'<ul>'+working.slice(0,5).map(function(t){var since=t.doSentAt||t.handedAt;return '<li><button type="button" class="tx cc-t" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,80))+'</button><span class="cc-m">'+esc(pbFor(t).name)+(since?' · started '+esc(rcWhen(since).split(" · ")[1]||rcWhen(since)):' · waiting for a run')+'</span>'+progHTML(progKey("do",t.id))+'</li>';}).join("")+'</ul>':'<p class="empty">Claude is idle. Hand something off.</p>';
    h+='</div><div class="cc-col" id="cc-done"><h3>Done today <small>'+doneT.length+'</small></h3>';
    h+=doneT.length?'<ul>'+doneT.slice(0,5).map(function(t){var r=t.receipt;return '<li><button type="button" class="tx cc-t" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,80))+'</button><span class="cc-m">'+esc(rcWhen(r.at).split(" · ")[0].replace(/^Today at /,""))+(r.where&&r.where.length?' · '+r.where.length+' link'+(r.where.length>1?'s':''):'')+'</span></li>';}).join("")+'</ul>':'<p class="empty">Nothing finished yet today.</p>';
    return h+'</div></div></section>';
  }
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-ccskip],[data-ccgo]");if(!b)return;
    if(b.dataset.ccskip){var t=findTask(b.dataset.ccskip);if(t){t.autoSkip=true;save();chip("Kept for you. Claude won’t auto-take this one.");}return;}
    var el=document.getElementById("cc-"+b.dataset.ccgo);if(el)el.scrollIntoView({behavior:"smooth",block:"center"});});
  var _focusDash=focusHTML;
  focusHTML=function(day,isToday){var h=_focusDash(day,isToday);if(!isToday)return h;
    var c=changesHTML(false);h=h.replace('<div class="dq-side">','<div class="dq-side">'+c);
    return dashHTML()+h;};
