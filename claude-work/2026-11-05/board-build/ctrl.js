  /* ===== Control room (Nov 6, Brody: "I need more control to add changes, show changes and change how the task is being completed,
     the overall workflow of the tool"). The Automations tab becomes the Control room: Playbooks · My rules · Routines · Requests · Changes. */
  var RQ_TRIG="trig_01NqRhkLSC15hY1J2ahMGVXL",ctlTab="playbooks",rqArea="",pbOpen={};
  TABS.forEach(function(x){if(x[0]==="auto")x[1]="Control room";});VIEW_TITLE.auto="Control room";
  var CTL_TABS=[["playbooks","Playbooks"],["rules","My rules"],["routines","Routines"],["requests","Requests"],["changes","Changes"]];
  function pbUsedFor(p){var m=p.match||{},b=[];if(m.all)return "Anything no other playbook covers";
    if(m.kinds)b.push(m.kinds.map(function(k){return {teams:"Teams messages",owe:"things you owe people",promo:"promotions",strety:"Strety to-dos"}[k]||k;}).join(", "));
    if(m.groups)b.push("tasks in "+m.groups.map(function(g){return groupLabel(g);}).join(", "));
    if(m.has)b.push("tasks with "+m.has.join("/"));if(m.needsReply)b.push("emails that still need your reply");
    if(m.ids)b.push("alerts and items starting "+m.ids.join(", "));if(m.sources)b.push("from "+m.sources.join(", "));if(m.touches)b.push("anything touching "+m.touches.join(", "));
    if(m.title)b.push("titles matching “"+m.title.replace(/\|/g," / ").replace(/[\^\[\]\\:]/g,"")+"”");return b.join(" · ");}
  function pbCount(p){return state.tasks.filter(function(t){return !t.done&&!/^idea/.test(t.group||"")&&pbFor(t).id===p.id;}).length;}
  function pbEditorHTML(){
    var h='<section class="panel ctl-pb"><h2>Playbooks <small>how Claude handles each kind of work · edit any of it</small></h2>';
    h+='<p class="hint">The mode decides who starts the work. <b>Auto</b>: Claude takes these on its own every hour and leaves a receipt. <b>Plan first</b>: Claude shows its steps and waits for your OK. <b>Draft only</b>: Claude does the work but everything stays a draft. <b>Manual</b>: you do these (Hand off still works). You can override any single task from inside it.</p><ul class="pb-list">';
    pbList().forEach(function(p){var n=pbCount(p),open=!!pbOpen[p.id];
      h+='<li class="pb-card m-'+esc(p.mode)+'"><div class="pb-top"><div><div class="pb-name">'+esc(p.name)+' <span class="pb-v">v'+(p.v||1)+'</span></div><div class="pb-used">'+esc(pbUsedFor(p))+(n?' · <b>'+n+'</b> open now':'')+'</div></div>';
      h+='<div class="pb-modes" role="group" aria-label="Mode for '+esc(p.name)+'">'+PB_MODES.map(function(m){return '<button type="button" class="pb-mode'+(p.mode===m[0]?' on':'')+'" data-pbmode="'+esc(p.id+"|"+m[0])+'" title="'+esc(m[2])+'" aria-pressed="'+(p.mode===m[0])+'">'+m[1]+'</button>';}).join("")+'</div></div>';
      h+='<button type="button" class="tx pb-tog" data-pbtog="'+esc(p.id)+'">'+(open?'Hide steps':'Steps, where results go, when to stop')+'</button>';
      if(open){h+='<div class="pb-edit"><label>Steps Claude follows <small>one per line</small><textarea data-pbf="steps" rows="'+Math.max(3,(p.steps||[]).length+1)+'">'+esc((p.steps||[]).join("\n"))+'</textarea></label>';
        h+='<label>Where results go<input type="text" data-pbf="output" value="'+esc(p.output||"")+'"></label><label>Done means<input type="text" data-pbf="done" value="'+esc(p.done||"")+'"></label><label>Always stop and ask when<input type="text" data-pbf="stop" value="'+esc(p.stop||"")+'"></label>';
        if(!(p.match||{}).all)h+='<label>Also use it for titles with these words <small>separate with |</small><input type="text" data-pbf="title" value="'+esc((p.match||{}).title||"")+'"></label>';
        h+='<div class="pb-acts"><button type="button" class="btn" data-pbsave="'+esc(p.id)+'">Save playbook</button>'+(p.custom?'<button type="button" class="linkbtn" data-pbdel="'+esc(p.id)+'">Delete</button>':'')+'<span class="hint">Saved changes apply from Claude’s next run. Receipts show which version was used.</span></div></div>';}
      h+='</li>';});
    h+='</ul><div class="pb-add"><h3>Add a playbook</h3><input type="text" id="pbnew-name" placeholder="Name, e.g. Vendor price update"><input type="text" id="pbnew-words" placeholder="Words in task titles it should catch, e.g. price update|cost change"><select id="pbnew-mode">'+PB_MODES.map(function(m){return '<option value="'+m[0]+'"'+(m[0]==="plan"?' selected':'')+'>'+m[1]+'</option>';}).join("")+'</select><button type="button" class="btn" data-pbadd="1">Add</button></div></section>';
    return h;}
  function rulesHTML(){var R=state.myRules||[];
    var h='<section class="panel ctl-rules"><h2>My rules <small>every routine and every hand-off follows these, newest wins</small></h2>';
    h+=R.length?'<ol class="mr-list">'+R.map(function(r){return '<li><span>'+esc(r.text)+'</span><span class="mr-d">'+esc(shortDate(String(r.t).slice(0,10)))+'</span><button type="button" class="tx" data-mrdel="'+esc(r.id)+'" aria-label="Delete rule">×</button></li>';}).join("")+'</ol>':'<p class="empty">No rules of your own yet. Add one: “Tory owns website back-end errors”, “Always cc Lauren on G4 vendor emails”.</p>';
    h+='<div class="mr-add"><textarea id="mr-new" rows="2" placeholder="A rule Claude should always follow"></textarea><button type="button" class="btn" data-mradd="1">Add rule</button></div>';
    h+='<details class="mr-fixed"><summary>Rules that are always on</summary><ul><li>Never send email. Outlook writes are drafts only.</li><li>Never post in Teams; Send in Teams is your double tap.</li><li>Never change NetSuite, Miva or ads, or ask anyone to, without your OK for that exact change. Never raise budgets or judge on ROAS.</li><li>BugHerd: never to Web Dev unless you cleared it; comments are drafts.</li><li>Never store contact details, customer names, pay or health details.</li><li>Claude marks a task done only when you ask.</li></ul></details></section>';
    return h;}
  function routinesCtlHTML(){var L=((au().routines)||[]).filter(function(r){return r.trig;});
    var h='<section class="panel ctl-rt"><h2>Routines <small>what runs on its own · Run now or pause any of them</small></h2><ul class="rt-list">';
    L.forEach(function(r){var s2=auState(r),paused=r.status==="paused"||r.enabled===false,run=live.runs&&live.runs[r.trig];
      h+='<li class="'+(paused?'paused':'')+'"><div><div class="rt-n">'+esc(r.name)+'</div><div class="rt-m">'+esc([r.when,r.times,r.what].filter(Boolean).join(" · ").slice(0,160))+'</div><div class="rt-s '+esc(s2.k||"")+'">'+esc(paused?"Paused":(s2.t||""))+(run?' · '+esc(run.state):'')+'</div></div><div class="rt-a">';
      h+='<button type="button" class="linkbtn" data-rtrun="'+esc(r.trig)+'"'+(mcp?'':' disabled')+'>Run now</button><button type="button" class="linkbtn" data-rtpause="'+esc(r.trig+"|"+(paused?"on":"off"))+'"'+(mcp?'':' disabled')+'>'+(paused?'Resume':'Pause')+'</button></div></li>';});
    h+='</ul><p class="hint">Changing a routine’s time or steps is a Request: send it in Requests and press Ship it after you see the preview.</p></section>';return h;}
  var RQ_ST={requested:"Sent",building:"Claude is building it",preview:"Preview ready",shipping:"Shipping",live:"Live",declined:"Not doing"};
  function requestsHTML(){var Q=(state.requests||[]).slice().reverse();
    var h='<section class="panel ctl-rq"><h2>Requests <small>change anything about Ultron · you see a preview before it goes live</small></h2>';
    h+='<div class="rq-new"><select id="rq-area" aria-label="Which part"><option value="">Whole tool</option>'+TABS.map(function(x){return '<option value="'+x[0]+'"'+(rqArea===x[0]?' selected':'')+'>'+esc(x[1])+'</option>';}).join("")+'</select><textarea id="rq-text" rows="3" placeholder="What should change? e.g. “Sort Cases by vendor”, “Add a Pearl tracker to Today”, “Run the BugHerd check at 10 too”"></textarea><button type="button" class="btn" data-rqsend="1"'+(mcp?'':' disabled')+'>Send request</button></div>';
    h+=Q.length?'<ul class="rq-list">'+Q.map(function(q){return '<li class="rq-'+esc(q.status)+'"><div class="rq-top"><span class="stag">'+esc(RQ_ST[q.status]||q.status)+'</span><span class="rc-when">'+esc(rcWhen(q.t))+'</span>'+(q.area?'<span class="rc-when">· '+esc(tabName(q.area))+'</span>':'')+'</div><p class="rq-t">'+esc(q.text)+'</p>'+(q.note?'<p class="hint">'+esc(q.note)+'</p>':'')+'<div class="rq-a">'+(q.previewUrl&&okHref(q.previewUrl)?'<a class="btn ghost" href="'+esc(q.previewUrl)+'" target="_blank" rel="noopener">Open preview</a>':'')+(q.status==="preview"?'<button type="button" class="btn" data-rqship="'+esc(q.id)+'">Ship it</button><button type="button" class="linkbtn" data-rqno="'+esc(q.id)+'">Not yet</button>':'')+'</div></li>';}).join("")+'</ul>':'<p class="empty">No requests yet.</p>';
    return h+'</section>';}
  function rqFire(text,q){
    return mcp.callTool(CCR,"fire_trigger",{trigger_id:RQ_TRIG,text:text},{cache:false}).catch(function(e){
      return mcp.callTool(CCR,"fire_trigger",{trigger_id:CHAT_TRIG,text:text+"\n\n(This came from Ultron's Control room › Requests; the requests routine couldn't be started directly.) Handle it as a tool change request: find state.requests item "+(q?q.id:"")+", build the change as a new idempotent patch in claude-work/2026-11-05/board-build/, publish it as a separate preview artifact, then set the request's status \"preview\", previewUrl and a one-line note on the live board (NO capabilities field). For SHIP: apply the patch to the live board and set status \"live\" and shippedAt. For DECLINE: set status \"declined\"."},{cache:false});});}
  var _autoCtl=autoHTML;
  autoHTML=function(){var h='<div class="ctl-tabs" role="tablist">'+CTL_TABS.map(function(c){var n=c[0]==="requests"?(state.requests||[]).filter(function(q){return q.status==="preview";}).length:c[0]==="rules"?(state.myRules||[]).length:0;return '<button type="button" role="tab" class="dq-tab'+(ctlTab===c[0]?' on':'')+'" data-ctl="'+c[0]+'" aria-selected="'+(ctlTab===c[0])+'">'+c[1]+(n?' <span>'+n+'</span>':'')+'</button>';}).join("")+'</div>';
    if(ctlTab==="playbooks")return h+pbEditorHTML();if(ctlTab==="rules")return h+rulesHTML();if(ctlTab==="requests")return h+requestsHTML();if(ctlTab==="changes")return h+changesHTML(true);
    return h+routinesCtlHTML()+_autoCtl();};
  var _pageHeadCtl=pageHeadHTML;
  pageHeadHTML=function(k,t,s,a){return _pageHeadCtl(k,t,s,(a||"")+(view==="auto"||readOnly?'':'<button type="button" class="btn ghost rq-open" data-rqopen="'+esc(view||"today")+'" title="Ask for a change to this page; you see a preview before it goes live">Request a change</button>'));};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-ctl],[data-pbmode],[data-pbtog],[data-pbsave],[data-pbdel],[data-pbadd],[data-mradd],[data-mrdel],[data-rtrun],[data-rtpause],[data-rqsend],[data-rqship],[data-rqno],[data-rqopen]");if(!b)return;var d=b.dataset;
    if(d.ctl){ctlTab=d.ctl;render();return;}
    if(d.rqopen){rqArea=d.rqopen;view="auto";ctlTab="requests";render();window.scrollTo(0,0);setTimeout(function(){var ta=document.getElementById("rq-text");if(ta)ta.focus();},60);return;}
    if(d.pbmode){var q=d.pbmode.split("|"),p=pbById(q[0]);if(p&&p.mode!==q[1]){p.mode=q[1];p.v=(p.v||1)+1;p.updated=new Date().toISOString();save();chip(p.name+": "+modeName(q[1])+(q[1]==="auto"?". Claude takes these on its own every hour.":"."));}return;}
    if(d.pbtog){pbOpen[d.pbtog]=!pbOpen[d.pbtog];render();return;}
    if(d.pbsave){var p2=pbById(d.pbsave),card=b.closest(".pb-card");if(!p2||!card)return;var g=function(f){var el=card.querySelector('[data-pbf="'+f+'"]');return el?String(el.value||""):null;};
      var st=g("steps");if(st!=null)p2.steps=st.split(/\n+/).map(function(x){return x.trim();}).filter(Boolean);["output","done","stop"].forEach(function(f){var v=g(f);if(v!=null)p2[f]=v.trim();});
      var ti=g("title");if(ti!=null){p2.match=p2.match||{};if(ti.trim())p2.match.title=ti.trim();else delete p2.match.title;}
      p2.v=(p2.v||1)+1;p2.updated=new Date().toISOString();save();chip("Saved "+p2.name+" (v"+p2.v+"). Claude uses it from the next run.");return;}
    if(d.pbdel){state.playbooks=pbList().filter(function(x){return x.id!==d.pbdel;});save();return;}
    if(d.pbadd){var nm=String((document.getElementById("pbnew-name")||{}).value||"").trim(),wd=String((document.getElementById("pbnew-words")||{}).value||"").trim(),md=(document.getElementById("pbnew-mode")||{}).value||"plan";
      if(!nm||!wd){chip("Give it a name and the words it should catch.",true);return;}var L=pbList(),np={id:"pb"+Date.now().toString(36),name:clip(nm,60),match:{title:wd},mode:md,steps:["Read the task and my notes","Do the work","Save the result where I can find it"],output:"",done:"",stop:"",v:1,custom:true,updated:new Date().toISOString()};
      L.splice(Math.max(0,L.length-1),0,np);pbOpen[np.id]=true;save();chip("Added "+np.name+". Fill in its steps.");return;}
    if(d.mradd){var ta=document.getElementById("mr-new"),tx=String(ta&&ta.value||"").trim();if(!tx)return;(state.myRules=state.myRules||[]).push({id:"mr"+Date.now(),t:new Date().toISOString(),text:clip(tx,400)});save();chip("Rule added. Every run follows it from now on.");return;}
    if(d.mrdel){state.myRules=(state.myRules||[]).filter(function(r){return r.id!==d.mrdel;});save();return;}
    if(d.rtrun){runNow(d.rtrun);return;}
    if(d.rtpause){var pr=d.rtpause.split("|"),tid=pr[0],on=pr[1]==="on",r=auByTrig(tid);if(!mcp||!r)return;b.disabled=true;
      rqFire((on?"RESUME ":"PAUSE ")+tid+" ("+r.name+")",null).then(function(){r.status=on?"ok":"paused";r.enabled=on;if(on)delete r.note;else r.note="Paused by you "+todayISO();save();chip((on?"Resuming ":"Pausing ")+r.name+". It takes a minute to apply.");},function(){b.disabled=false;chip("Couldn’t reach Claude to change it. You can also do it at claude.ai/code/routines.",true);});return;}
    if(d.rqsend){var at=document.getElementById("rq-text"),txt=String(at&&at.value||"").trim();if(!txt){chip("Say what should change first.",true);return;}
      var area=(document.getElementById("rq-area")||{}).value||"",qq={id:"rq"+Date.now().toString(36),t:new Date().toISOString(),text:clip(txt,1500),area:area,status:"requested"};(state.requests=state.requests||[]).push(qq);rqArea="";save();
      rqFire("REQUEST "+qq.id+": "+qq.text+(area?" (part: "+tabName(area)+")":" (whole tool)"),qq).then(function(){chip("Request sent. You’ll get a preview link here before anything changes.");},function(){qq.note="Couldn’t reach Claude from this view; the next check-in picks it up.";save();});return;}
    if(d.rqship||d.rqno){var id=d.rqship||d.rqno,q2=(state.requests||[]).filter(function(x){return x.id===id;})[0];if(!q2)return;q2.status=d.rqship?"shipping":"declined";save();rqFire((d.rqship?"SHIP ":"DECLINE ")+q2.id,q2).then(function(){chip(d.rqship?"Shipping it. The live board updates in a few minutes.":"Marked not doing.");});return;}
  });
