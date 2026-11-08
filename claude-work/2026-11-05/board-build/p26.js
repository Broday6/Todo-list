  /* ===== Nov 6 build (Brody: "Add the group 5 plan to my board and do 1,2,4,5,6,7,8,9,10"):
     G5 plan tab · rate results → playbook lessons · hand-off brief · reference cards · bulk + scheduled hand-off ·
     recurring work · one-tap asks · links on tasks · run history + retry · duplicate finder. */
  var u6G5=false,u6Rate={},u6Sel=false,u6Picked={},u6Brief=null,u6NoFire=false,u6PendBrief=null,u6LinkText={};
  function u6now(){return new Date().toISOString();}
  function u6tok(s){var stop={the:1,and:1,for:1,with:1,from:1,that:1,this:1,into:1,your:1,you:1,our:1,are:1,new:1,page:0};return String(s||"").toLowerCase().replace(/[^a-z0-9 ]+/g," ").split(/\s+/).filter(function(w){return w.length>2&&!stop[w];});}
  function u6jac(a,b){var A={},n=0,i;a.forEach(function(w){A[w]=1;});var B={};b.forEach(function(w){B[w]=1;});var inter=0,uni=0;for(i in A){uni++;if(B[i])inter++;}for(i in B)if(!A[i])uni++;return uni?inter/uni:0;}
  /* ---------- G5 plan tab ---------- */
  TABS.push(["g5","G5 plan"]);VIEW_TITLE.g5="G5 plan";
  (function(){for(var i=0;i<NAVGROUPS.length;i++){var g=NAVGROUPS[i][1],at=g.indexOf("goals");if(at>=0&&g.indexOf("g5")<0){g.splice(at+1,0,"g5");break;}}})();
  if(typeof ICON==="object"&&ICON&&!ICON.g5)ICON.g5='<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>';
  function g5p(){return state.g5plan||null;}
  function g5Tasks(){return state.tasks.filter(function(t){return t.group==="g5q1"||/^g5p-/.test(t.id)||t.source==="G5 game plan";});}
  function g5Match(item){if(item.taskId){var x=findTask(item.taskId);if(x)return x;}var it=u6tok(item.text),best=null,bs=0;g5Tasks().forEach(function(t){var s=u6jac(it,u6tok(t.title));if(s>bs){bs=s;best=t;}});return bs>=0.28?best:null;}
  function g5Status(t){if(!t)return {k:"none",l:"No task yet"};if(t.done)return {k:"ok",l:"Done"};var r=rcOf(t);if(r&&r.status==="done")return {k:"ok",l:"Claude finished"};if(r&&(r.status==="needs_you"||r.status==="stopped"||r.status==="followup"))return {k:"warn",l:"Needs you"};if(t.assignee==="claude")return {k:"acc",l:"Claude on it"};var od=t.due&&t.due<todayISO();return {k:od?"bad":"",l:od?"Overdue":"Not started"};}
  function g5HTML(){var P=g5p();if(!P)return '<section class="panel"><h2>G5 plan</h2><p class="empty">No plan loaded.</p></section>';
    var h='<section class="g5-goals">'+(P.goals||[]).map(function(g){return '<div class="g5-goal"><b>'+esc(g.n)+'</b><span>'+esc(g.l)+'</span><small>'+esc(g.s)+'</small></div>';}).join("")+'</section>';
    (P.quarters||[]).forEach(function(q,qi){var all=0,dn=0;q.months.forEach(function(m){m.items.forEach(function(it){all++;var t=g5Match(it);if(t&&(t.done||(rcOf(t)||{}).status==="done"))dn++;});});
      h+='<details class="panel g5-q"'+(qi===0?' open':'')+'><summary><div><b>'+esc(q.name)+'</b> <span class="g5-when">'+esc(q.when)+'</span></div><div class="g5-prog"><i style="width:'+(all?Math.round(dn/all*100):0)+'%"></i></div><span class="g5-pc">'+dn+' of '+all+' done</span></summary><p class="hint">'+esc(q.theme)+'</p><div class="g5-months">';
      q.months.forEach(function(m,mi){h+='<div class="g5-m"><h4>'+esc(m.m)+'</h4><ul>';m.items.forEach(function(it,ii){var t=g5Match(it),st=g5Status(t),key=qi+"|"+mi+"|"+ii;
        h+='<li class="g5-i st-'+st.k+'"><div class="g5-it">'+esc(it.text)+'</div><div class="g5-who">'+(it.who||[]).map(function(w){return '<span class="g5-tag'+(w==="Brody"?' you':w==="Claude"?'':' oth')+'">'+esc(w)+'</span>';}).join("")+'</div><div class="g5-a"><span class="stag'+(st.k?' '+st.k:'')+'">'+esc(st.l)+'</span>'+(t?'<button type="button" class="tx" data-opentask="'+esc(t.id)+'">View task</button>'+(!t.done&&t.assignee!=="claude"?hoBtn("task",t.id):''):'<button type="button" class="tx" data-g5make="'+esc(key)+'">Make a task</button>')+'</div></li>';});
        h+='</ul></div>';});
      h+='</div><p class="g5-done"><b>Done when:</b> '+esc(q.done)+'</p></details>';});
    h+='<section class="panel g5-dec"><h2>Your decisions <small>'+(P.decisions||[]).filter(function(d){return d.answer;}).length+' of '+(P.decisions||[]).length+' made</small></h2><ol>';
    (P.decisions||[]).forEach(function(d,i){h+='<li class="'+(d.answer?'made':'')+'"><div>'+esc(d.text)+'</div>'+(d.answer?'<div class="g5-ans">✓ '+esc(d.answer)+'</div>':'<div class="g5-ansrow"><input type="text" data-g5ans="'+i+'" placeholder="Your decision"><button type="button" class="btn ghost" data-g5anssave="'+i+'">Save</button></div>')+'</li>';});
    h+='</ol></section><section class="panel g5-sc"><h2>Scorecard <small>baselines Oct 28–29 · Claude fills “Now” monthly</small></h2><div class="g5-tw"><table><thead><tr><th>Measure</th><th>Baseline</th><th>End of Q1</th><th>Oct 2027</th><th>Now</th><th>Source</th></tr></thead><tbody>';
    (P.scorecard||[]).forEach(function(r){h+='<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td><td><b>'+esc(r[5]||"—")+'</b></td><td>'+esc(r[4])+'</td></tr>';});
    h+='</tbody></table></div></section><section class="panel g5-rh"><h2>How we run it</h2><ul>'+(P.rhythm||[]).map(function(r){return '<li><b>'+esc(r[0])+':</b> '+esc(r[1])+'</li>';}).join("")+'</ul><p class="hint">These run as recurring work (Control room › Recurring). <a href="'+esc(P.link||"#")+'" target="_blank" rel="noopener">Open the full plan</a></p></section>';
    return h;}
  var _goalsU6=goalsHTML;goalsHTML=function(){return u6G5?g5HTML():_goalsU6();};
  var _interestU6=interestHTML;interestHTML=function(){return u6G5?'':_interestU6();};
  var _pageHeadU6=pageHeadHTML;pageHeadHTML=function(k,t,s,a){if(u6G5)return _pageHeadU6("Group 5 · Beams, Mantels, Hardware","G5 game plan","Nov 2026 – Oct 2027 · status comes live from your tasks",a);return _pageHeadU6(k,t,s,a);};
  var _renderU6=render;
  render=function(){if(view==="g5"){u6G5=true;view="goals";try{_renderU6.apply(this,arguments);}finally{view="g5";u6G5=false;}document.querySelectorAll('.snav [data-view],.bnav [data-view]').forEach(function(b){var on=b.dataset.view==="g5";b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});}else _renderU6.apply(this,arguments);try{u6Post();}catch(e){}};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-g5make],[data-g5anssave]");if(!b)return;var P=g5p();if(!P)return;
    if(b.dataset.g5make){var k=b.dataset.g5make.split("|"),q=P.quarters[+k[0]],m=q.months[+k[1]],it=m.items[+k[2]];var id="g5p-"+Date.now().toString(36);
      state.tasks.push({id:id,group:+k[0]===0?"g5q1":"now",title:clip(it.text,140),note:"From the G5 plan: "+q.name+", "+m.m+". Owners: "+(it.who||[]).join(", ")+".",due:todayISO(),done:false,since:todayISO(),source:"G5 game plan"});it.taskId=id;save();chip("Task added.");return;}
    var i=+b.dataset.g5anssave,inp=document.querySelector('[data-g5ans="'+i+'"]'),v=String(inp&&inp.value||"").trim();if(!v)return;P.decisions[i].answer=clip(v,300);P.decisions[i].on=todayISO();save();chip("Decision saved. Claude follows it from the next run.");});
  /* ---------- 1. Rate results → lessons on the playbook ---------- */
  var _receiptU6=receiptHTML;
  receiptHTML=function(t){var h=_receiptU6(t);var r=rcOf(t);if(!h||!r||!(r.status==="done"||r.status==="needs_you"))return h;var rt=t.rating||{};
    var x='<div class="u6-rate">'+(rt.v?'<span class="u6-rated">You rated this '+(rt.v==="up"?'👍':'👎')+(rt.note?': '+esc(clip(rt.note,140)):'')+'</span><button type="button" class="tx" data-u6rate="'+esc(t.id)+'|clear">Change</button>':'<span>Was this right?</span><button type="button" class="u6-thumb" data-u6rate="'+esc(t.id)+'|up" aria-label="Yes, good">👍</button><button type="button" class="u6-thumb" data-u6rate="'+esc(t.id)+'|down" aria-label="No, something was wrong">👎</button>');
    if(u6Rate[t.id]&&!rt.v)x+='<div class="u6-why"><textarea data-u6why="'+esc(t.id)+'" rows="2" placeholder="What was wrong? This becomes a lesson Claude follows next time for '+esc(pbFor(t).name)+'."></textarea><button type="button" class="btn ghost" data-u6less="'+esc(t.id)+'|save">Save lesson</button><button type="button" class="btn" data-u6less="'+esc(t.id)+'|redo">Save and redo it</button></div>';
    x+='</div>';var i=h.lastIndexOf('</section>');return i>0?h.slice(0,i)+x+h.slice(i):h+x;};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-u6rate],[data-u6less]");if(!b)return;e.stopPropagation();
    if(b.dataset.u6rate){var q=b.dataset.u6rate.split("|"),t=findTask(q[0]);if(!t)return;if(q[1]==="clear"){delete t.rating;save();return;}if(q[1]==="up"){t.rating={v:"up",t:u6now()};save();chip("Thanks. Marked as right.");return;}u6Rate[t.id]=true;render();setTimeout(function(){var ta=document.querySelector('[data-u6why="'+t.id.replace(/"/g,'\\"')+'"]');if(ta)ta.focus();},40);return;}
    var p2=b.dataset.u6less.split("|"),t2=findTask(p2[0]);if(!t2)return;var ta=document.querySelector('[data-u6why="'+t2.id.replace(/"/g,'\\"')+'"]'),note=String(ta&&ta.value||"").trim();if(!note){chip("Say what was wrong first.",true);return;}
    t2.rating={v:"down",note:clip(note,500),t:u6now()};var pb=pbFor(t2);pb.lessons=pb.lessons||[];pb.lessons.push({t:u6now(),text:clip(note,300),taskId:t2.id});if(pb.lessons.length>20)pb.lessons=pb.lessons.slice(-20);pb.v=(pb.v||1)+1;delete u6Rate[t2.id];
    if(p2[1]==="redo"&&fuRun(t2,"Redo this. What was wrong: "+note,"thumbs-down redo")){save();chip("Lesson saved to "+pb.name+". Claude is redoing it.");return;}save();chip("Lesson saved to "+pb.name+". Claude follows it next time.");});
  /* ---------- 2. Hand-off brief ---------- */
  function u6BriefOff(){try{return localStorage.getItem("ul.noBrief")==="1";}catch(e){return false;}}
  function u6BriefClose(){var w=document.getElementById("u6brief");if(w)w.remove();u6Brief=null;}
  function u6BriefOpen(kind,ref){var t=kind==="task"?findTask(ref):null,title="",p;
    if(t){title=t.title;p=pbFor(t);}else{var probe={id:"x",title:"",hoKind:kind==="tw"?"teams":kind==="owe"?"owe":kind==="promo"?"promo":""};p=pbFor(probe,probe.hoKind);
      if(kind==="tw"){var x=twS().items.filter(function(i){return i.id===ref;})[0];title=x?"Reply to "+(x.from||"")+": "+(x.gist||""):"";}else if(kind==="blk"){var cb=locateBlock(ref);title=cb?cb.block.title:"";}else if(kind==="owe"){var pr=ref.split("|"),pp=tmPerson(pr[0]),o=pp&&(pp.youOwe||[]).filter(function(y){return y.id===pr[1];})[0];title=o?"Send "+pp.short+": "+o.what:"";}else if(kind==="promo"){var pm=pms().items.filter(function(i){return i.id===ref;})[0];title=pm?"Prep the promotion: "+pm.title:"";}}
    u6Brief={kind:kind,ref:ref};u6BriefClose();u6Brief={kind:kind,ref:ref};
    var w=document.createElement("div");w.id="u6brief";w.className="u6-bw";
    w.innerHTML='<div class="u6-bb" role="dialog" aria-modal="true" aria-label="Hand off to Claude"><h2>Hand off to Claude <small>'+esc(p.name)+' playbook</small></h2>'+
      '<label>What should be true when it’s done?<textarea id="u6b-goal" rows="2">'+esc(clip(title,300))+'</textarea></label>'+
      '<label>Done means<input id="u6b-done" type="text" value="'+esc(p.done||"")+'"></label>'+
      '<label>Where the result goes<input id="u6b-where" type="text" value="'+esc(p.output||"")+'"></label>'+
      '<label>Links Claude should use <small>email, OneDrive or web links, one per line</small><textarea id="u6b-links" rows="2" placeholder="https://…"></textarea></label>'+
      '<div class="u6-brow"><label>How<select id="u6b-mode"><option value="">Playbook default ('+esc(modeName(p.mode))+')</option>'+PB_MODES.map(function(m){return '<option value="'+m[0]+'"'+(t&&t.mode===m[0]?' selected':'')+'>'+m[1]+'</option>';}).join("")+'</select></label><label>When<select id="u6b-when"><option value="now">Start now</option><option value="later">Schedule…</option></select></label><label id="u6b-atw" hidden>Start at<input id="u6b-at" type="datetime-local"></label></div>'+
      '<div class="u6-bacts"><button type="button" class="btn" id="u6b-go">Hand off</button><button type="button" class="btn ghost" id="u6b-x">Cancel</button><label class="u6-skip"><input type="checkbox" id="u6b-skip"> Skip this brief from now on</label></div></div>';
    document.body.appendChild(w);var g=document.getElementById("u6b-goal");if(g){g.focus();g.setSelectionRange(g.value.length,g.value.length);}
    document.getElementById("u6b-when").onchange=function(){document.getElementById("u6b-atw").hidden=this.value!=="later";};
    document.getElementById("u6b-x").onclick=u6BriefClose;w.addEventListener("click",function(ev){if(ev.target===w)u6BriefClose();});
    w.addEventListener("keydown",function(ev){if(ev.key==="Escape")u6BriefClose();});
    document.getElementById("u6b-go").onclick=function(){u6BriefSubmit();};}
  function u6BriefSubmit(){if(!u6Brief)return;var B=u6Brief,v=function(id){var el=document.getElementById(id);return el?String(el.value||"").trim():"";};
    var brief={goal:clip(v("u6b-goal"),600),done:clip(v("u6b-done"),300),where:clip(v("u6b-where"),300),t:u6now()},links=v("u6b-links").split(/\s+/).filter(function(u){return /^https?:\/\//i.test(u);}).slice(0,10),mode=v("u6b-mode"),later=v("u6b-when")==="later",at=v("u6b-at");
    if(document.getElementById("u6b-skip")&&document.getElementById("u6b-skip").checked){try{localStorage.setItem("ul.noBrief","1");}catch(e){}}
    if(later&&!at){chip("Pick a start time.",true);return;}
    u6BriefClose();var apply=function(t){t.handoff=brief;if(links.length){t.links=(t.links||[]).concat(links.map(function(u){return {url:u,t:u6now()};}));}if(mode)t.mode=mode;};
    if(later){var iso=new Date(at).toISOString();var t=B.kind==="task"?findTask(B.ref):null;if(!t){u6NoFire=true;try{_handOffU6(B.kind,B.ref);}finally{u6NoFire=false;}t=state.tasks.filter(function(x){return x.handedAt;}).sort(function(a,b){return String(b.handedAt).localeCompare(String(a.handedAt));})[0];}
      if(!t)return;apply(t);t.handoffAt=iso;delete t.handoffFired;save();chip("Scheduled. Claude starts it "+new Date(iso).toLocaleString([], {weekday:"short",hour:"numeric",minute:"2-digit"})+".");return;}
    if(B.kind==="task"){var tt=findTask(B.ref);if(tt)apply(tt);}else u6PendBrief={brief:brief,links:links,mode:mode};
    _handOffU6(B.kind,B.ref);}
  var _handOffU6=handOff;
  handOff=function(kind,ref,direct){if(direct||u6BriefOff()||readOnly){_handOffU6(kind,ref);return;}u6BriefOpen(kind,ref);};
  var _giveU6=giveToClaude;
  giveToClaude=function(t){if(u6NoFire)return;if(u6PendBrief&&t&&!t.handoff){t.handoff=u6PendBrief.brief;if(u6PendBrief.links.length)t.links=(t.links||[]).concat(u6PendBrief.links.map(function(u){return {url:u,t:u6now()};}));if(u6PendBrief.mode)t.mode=u6PendBrief.mode;}u6PendBrief=null;return _giveU6(t);};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-dqgive]");if(!b||u6BriefOff())return;e.stopImmediatePropagation();e.preventDefault();handOff("task",b.dataset.dqgive);},true);
  /* ---------- 4. Reference cards ---------- */
  function u6Cards(){return state.refCards||(state.refCards=[]);}
  function u6CardsFor(t){var tx=u6tok((t.title||"")+" "+(t.note||"")),out=[];u6Cards().forEach(function(c){if(c.always){out.push(c);return;}var ct=u6tok(c.title+" "+c.body),hit=0;ct.forEach(function(w){if(tx.indexOf(w)>=0)hit++;});if(hit>=2)out.push(c);});return out.slice(0,6);}
  /* ---------- the brief Claude gets ---------- */
  var _doMsgU6=doMsg;
  doMsg=function(t){var m=_doMsgU6(t),add="";
    if(t.handoff){var b=t.handoff;add+="\nMY BRIEF: goal: "+b.goal+(b.done?" | done means: "+b.done:"")+(b.where?" | result goes: "+b.where:"");}
    if((t.links||[]).length)add+="\nLINKS TO USE (read them first; OneDrive/SharePoint and email links open with Microsoft 365 read_resource): "+t.links.map(function(l){return l.url;}).join(" ");
    var cards=u6CardsFor(t);if(cards.length)add+="\nREFERENCE CARDS (Brody keeps these current; trust them over older notes): "+cards.map(function(c){return "["+c.title+"] "+clip(c.body,400);}).join(" || ");
    var pb=pbFor(t);if((pb.lessons||[]).length)add+="\nLESSONS FROM MY THUMBS-DOWN on this kind of work (follow every one): "+pb.lessons.slice(-6).map(function(l){return l.text;}).join(" | ");
    return add?m+add:m;};
  /* ---------- 7. One-tap asks ---------- */
  var U6_QUICK={email:["Draft the reply","Summarize the thread and what they need","Draft a follow-up for 3 days from now"],teams:["Draft a reply","Summarize the chat"],owe:["Draft the email that delivers it","Find where I promised it"],alert:["Build the NOT-IMPORTED fix file","Summarize the rows and who owns them"],pricing:["Summarize the biggest price moves"],bugherd:["Check the live page","Draft the BugHerd comment"],"case":["Draft the vendor email","Summarize the case and next NetSuite step"],ads:["Write the exact change for my OK","Pull the numbers behind this"],abtest:["Remind me which SKUs to read"],hiring:["Summarize the candidate"],promo:["Draft the promo emails","List what's left to do"],strety:["Do the research for this to-do"],content:["Check the live page","Write the copy from fact-checked sources","Fact-check this page"],research:["Research this and write it up","Compare against competitors"],general:["Check the live page","Research this","Draft an email for this","Compare against competitors"]};
  function u6Quick(t){var p=pbFor(t);return (p.quick&&p.quick.length?p.quick:(U6_QUICK[p.id]||U6_QUICK.general)).slice(0,6);}
  /* ---------- 9. Run history ---------- */
  var _progSendU6=progSend;
  progSend=function(key,text){var m=/^do:(.+)$/.exec(String(key||""));if(m){var t=findTask(m[1]);if(t){var why=/RETRY/.test(text)?"retry":/NEWEST INSTRUCTION/.test(text)?((/one-tap/.test(text)?"one-tap ask":/thumbs-down/.test(text)?"redo":"follow-up")):"start";(t.runs=t.runs||[]).push({t:u6now(),why:why});if(t.runs.length>12)t.runs=t.runs.slice(-12);}}return _progSendU6(key,text);};
  function u6RunState(t,r,next){var rc=t.receipt&&t.receipt.at;if(rc&&rc>=r.t&&(!next||rc<=next.t))return {k:"ok",l:"Finished "+rcWhen(rc).split(" · ")[0].replace(/^Today at /,"")+" · took "+Math.max(1,Math.round((new Date(rc)-new Date(r.t))/60000))+" min"};if(next)return {k:"",l:"Replaced by a newer run"};var age=(Date.now()-new Date(r.t))/60000;return age>25?{k:"bad",l:"No result after "+Math.round(age)+" min",stall:true}:{k:"acc",l:"Running ("+Math.round(age)+" min)"};}
  function u6Stalled(t){var R=t.runs||[];if(!R.length||t.done)return false;var last=R[R.length-1];return u6RunState(t,last,null).stall;}
  /* opened task: brief, links, one-tap asks, run history */
  var _aboutU6=aboutHTML;
  aboutHTML=function(t){var h=_aboutU6(t);if(t.done)return h;var x='<div class="u6-box">';
    x+='<div class="u6-quick"><span class="u6-l">Ask Claude to</span>'+u6Quick(t).map(function(q,i){return '<button type="button" class="linkbtn" data-u6q="'+esc(t.id)+'|'+i+'"'+(mcp?'':' disabled')+'>'+esc(q)+'</button>';}).join("")+'</div>';
    if(t.handoff)x+='<p class="u6-brief"><b>Your brief:</b> '+esc(t.handoff.goal)+(t.handoff.done?' · <b>done means</b> '+esc(t.handoff.done):'')+(t.handoff.where?' · <b>goes to</b> '+esc(t.handoff.where):'')+'</p>';
    if(t.handoffAt&&!t.handoffFired)x+='<p class="u6-brief"><b>Scheduled:</b> Claude starts it '+esc(new Date(t.handoffAt).toLocaleString([], {weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}))+' <button type="button" class="tx" data-u6unsched="'+esc(t.id)+'">Cancel</button></p>';
    x+='<div class="u6-links"><span class="u6-l">Links</span>'+(t.links||[]).map(function(l,i){return '<span class="u6-link"><a href="'+esc(l.url)+'" target="_blank" rel="noopener">'+esc(clip(l.url.replace(/^https?:\/\/(www\.)?/,""),46))+'</a><button type="button" class="tx" data-u6ldel="'+esc(t.id)+'|'+i+'" aria-label="Remove link">×</button></span>';}).join("")+'<input type="url" data-u6ladd="'+esc(t.id)+'" placeholder="Paste an email, OneDrive or web link" value="'+esc(u6LinkText[t.id]||"")+'"><button type="button" class="linkbtn" data-u6lsave="'+esc(t.id)+'">Add</button></div>';
    var R=t.runs||[];if(R.length){x+='<details class="u6-runs"><summary>Runs <b>'+R.length+'</b>'+(u6Stalled(t)?' · <span class="u6-bad">last one didn’t finish</span>':'')+'</summary><ul>'+R.slice().reverse().map(function(r,ri,arr){var idx=R.length-1-ri,s=u6RunState(t,r,R[idx+1]);return '<li><span>'+esc(rcWhen(r.t).split(" · ")[0])+'</span> <span class="u6-why2">'+esc(r.why)+'</span> <span class="u6-s '+s.k+'">'+esc(s.l)+'</span></li>';}).join("")+'</ul></details>';}
    if(u6Stalled(t))x+='<button type="button" class="btn" data-u6retry="'+esc(t.id)+'"'+(mcp?'':' disabled')+'>Retry the run</button>';
    return h+x+'</div>';};
  document.addEventListener("input",function(e){var el=e.target;if(el&&el.dataset&&el.dataset.u6ladd!=null)u6LinkText[el.dataset.u6ladd]=el.value;});
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-u6q],[data-u6lsave],[data-u6ldel],[data-u6retry],[data-u6unsched]");if(!b)return;e.stopPropagation();var d=b.dataset,t;
    if(d.u6q){var q=d.u6q.split("|");t=findTask(q[0]);if(!t)return;var txt=u6Quick(t)[+q[1]];if(fuRun(t,txt+" (one-tap ask)","one-tap ask")){save();chip("Sent: "+txt+".");}return;}
    if(d.u6lsave){t=findTask(d.u6lsave);if(!t)return;var u=String(u6LinkText[t.id]||"").trim();if(!/^https?:\/\//i.test(u)){chip("Paste a full link starting with https://",true);return;}(t.links=t.links||[]).push({url:u,t:u6now()});delete u6LinkText[t.id];save();chip("Link added. Claude reads it when it works this task.");return;}
    if(d.u6ldel){var p=d.u6ldel.split("|");t=findTask(p[0]);if(t&&t.links){t.links.splice(+p[1],1);save();}return;}
    if(d.u6retry){t=findTask(d.u6retry);if(t&&fuRun(t,"RETRY: the last run didn't finish. Pick it up where it stopped and finish it.","retry")){save();chip("Retrying.");}return;}
    if(d.u6unsched){t=findTask(d.u6unsched);if(t){delete t.handoffAt;save();chip("Schedule cancelled.");}return;}
  });
  /* Do now: stalled runs get a Retry card */
  var _dqItemsU6=dqItems;
  dqItems=function(){var out=_dqItemsU6();state.tasks.forEach(function(t){if(u6Stalled(t))out.push({k:"decide",rank:1.5,t:t,tag:"Run didn’t finish",title:t.title,ctx:"Claude started this "+rcWhen(t.runs[t.runs.length-1].t)+" and no result came back.",main:'<button type="button" class="btn" data-u6retry="'+esc(t.id)+'"'+(mcp?'':' disabled')+'>Retry</button>'});});out.sort(function(a,b){return a.rank-b.rank||((b.late||0)-(a.late||0));});return out;};
  /* ---------- 5. Bulk + scheduled hand-off; 10. duplicates (Tasks tab) ---------- */
  function u6Dups(){var ig=state.dupIgnore||[],L=state.tasks.filter(function(t){return !t.done&&!/^idea/.test(t.group||"")&&t.group!=="frozen";}),out=[],toks={};
    L.forEach(function(t){toks[t.id]=u6tok(t.title);});
    for(var i=0;i<L.length;i++)for(var j=i+1;j<L.length;j++){var a=L[i],b=L[j],key=[a.id,b.id].sort().join("|");if(ig.indexOf(key)>=0)continue;var why="";
      if(a.bh&&b.bh&&a.bh.id&&a.bh.id===b.bh.id)why="Same BugHerd ticket";else if(a.case&&b.case&&a.case.no&&a.case.no===b.case.no)why="Same case";
      else if(a.mail&&b.mail&&a.mail.subject&&String(a.mail.subject).replace(/^((re|fw|fwd):\s*)+/i,"").toLowerCase()===String(b.mail.subject).replace(/^((re|fw|fwd):\s*)+/i,"").toLowerCase())why="Same email thread";
      else if(toks[a.id].length>=3&&toks[b.id].length>=3&&u6jac(toks[a.id],toks[b.id])>=0.6)why="Very similar titles";
      if(why)out.push({a:a,b:b,why:why,key:key});if(out.length>=8)return out;}
    return out;}
  function u6DupHTML(){var D=u6Dups();if(!D.length)return '';
    return '<section class="panel u6-dup" id="sec-dups"><h2>Possible duplicates <small><b>'+D.length+'</b> pair'+(D.length>1?'s':'')+'</small></h2><ul>'+D.map(function(d){return '<li><div class="u6-dp"><button type="button" class="tx" data-opentask="'+esc(d.a.id)+'">'+esc(clip(d.a.title,80))+'</button><span>and</span><button type="button" class="tx" data-opentask="'+esc(d.b.id)+'">'+esc(clip(d.b.title,80))+'</button></div><div class="u6-dw">'+esc(d.why)+'</div><div class="u6-da"><button type="button" class="linkbtn" data-u6merge="'+esc(d.a.id+"|"+d.b.id)+'">Keep the first</button><button type="button" class="linkbtn" data-u6merge="'+esc(d.b.id+"|"+d.a.id)+'">Keep the second</button><button type="button" class="tx" data-u6notdup="'+esc(d.key)+'">Not duplicates</button></div></li>';}).join("")+'</ul><p class="hint">Merging moves the thread, notes and links into the one you keep and closes the other as not needed (with Undo).</p></section>';}
  var _tasksU6=tasksHTML;
  tasksHTML=function(){var h=_tasksU6.apply(this,arguments);var bar='<div class="u6-tbar"><button type="button" class="btn ghost" data-u6sel="1" aria-pressed="'+u6Sel+'">'+(u6Sel?'Done selecting':'Select tasks')+'</button>'+(u6Sel?'<span class="hint">Tick tasks, then hand them off together or schedule them.</span>':'')+'</div>';return bar+u6DupHTML()+h;};
  function u6Bulk(){var ids=Object.keys(u6Picked).filter(function(id){var t=findTask(id);return t&&!t.done;});var w=document.getElementById("u6bulk");if(!u6Sel||view!=="tasks"){if(w)w.remove();return;}
    if(!w){w=document.createElement("div");w.id="u6bulk";w.className="u6-bulk";document.body.appendChild(w);}
    w.innerHTML='<b>'+ids.length+'</b> selected<button type="button" class="btn" data-u6bulkgo="1"'+(ids.length&&mcp?'':' disabled')+'>Hand off '+ids.length+'</button><input type="datetime-local" id="u6bulk-at" aria-label="Schedule time"><button type="button" class="btn ghost" data-u6bulkat="1"'+(ids.length?'':' disabled')+'>Schedule</button><button type="button" class="tx" data-u6bulkclr="1">Clear</button>';}
  function u6Post(){if(readOnly)return;if(u6Sel&&view==="tasks"){document.querySelectorAll("#root li.task[data-task]").forEach(function(li){if(li.querySelector(".u6-pick"))return;var t=findTask(li.dataset.task);if(!t||t.done)return;li.insertAdjacentHTML("afterbegin",'<input type="checkbox" class="u6-pick" data-u6pick="'+esc(t.id)+'"'+(u6Picked[t.id]?' checked':'')+' aria-label="Select '+esc(t.title)+'">');li.classList.add("u6-selmode");});}u6Bulk();}
  document.addEventListener("change",function(e){var el=e.target;if(el&&el.dataset&&el.dataset.u6pick){if(el.checked)u6Picked[el.dataset.u6pick]=1;else delete u6Picked[el.dataset.u6pick];u6Bulk();}},true);
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-u6sel],[data-u6bulkgo],[data-u6bulkat],[data-u6bulkclr],[data-u6merge],[data-u6notdup]");if(!b)return;var d=b.dataset;
    if(d.u6sel){u6Sel=!u6Sel;if(!u6Sel)u6Picked={};render();return;}
    if(d.u6bulkclr){u6Picked={};render();return;}
    if(d.u6bulkgo||d.u6bulkat){var ids=Object.keys(u6Picked).filter(function(id){var t=findTask(id);return t&&!t.done;});if(!ids.length)return;
      if(d.u6bulkat){var at=(document.getElementById("u6bulk-at")||{}).value;if(!at){chip("Pick a time first.",true);return;}var iso=new Date(at).toISOString();ids.forEach(function(id){var t=findTask(id);t.handoffAt=iso;delete t.handoffFired;});u6Picked={};u6Sel=false;save();chip("Scheduled "+ids.length+" for "+new Date(iso).toLocaleString([], {weekday:"short",hour:"numeric",minute:"2-digit"})+".");return;}
      if(live.chatSending){chip("Claude is still sending the last request. Try again in a few seconds.",true);return;}
      var now=u6now(),lines=[];ids.forEach(function(id){var t=findTask(id);t.assignee="claude";t.claudeStatus="queued";t.handedAt=now;t.handedBy="Brody";t.doSentAt=now;(t.runs=t.runs||[]).push({t:now,why:"bulk hand-off"});var p=pbFor(t);lines.push("- "+t.id+": “"+clip(t.title,120)+"” (playbook "+p.name+", mode "+modeOf(t)+")");});
      progSend("bulk:"+now,"Do these "+ids.length+" tasks now (bulk hand-off from Ultron):\n"+lines.join("\n")+"\n\nFor EACH task: read it on the board (note, my notes, brief, links, thread), follow its playbook and mode from state.playbooks, apply state.myRules and the reference cards in state.refCards, and finish it under the Task completion protocol with its own receipt and task-log row. Work them in the order listed. "+RULES_LINE);
      u6Picked={};u6Sel=false;save();chip("Handed off "+ids.length+". Claude works them in order.");return;}
    if(d.u6merge){var pq=d.u6merge.split("|"),keep=findTask(pq[0]),drop=findTask(pq[1]);if(!keep||!drop)return;
      keep.thread=(keep.thread||[]).concat((drop.thread||[]).map(function(m){var c={};for(var k in m)c[k]=m[k];c.text="[from merged task] "+c.text;return c;}));keep.notes=(keep.notes||[]).concat(drop.notes||[]);keep.links=(keep.links||[]).concat(drop.links||[]);
      (keep.thread=keep.thread||[]).push({role:"user",text:"Merged in a duplicate: “"+drop.title+"”.",t:u6now()});drop.mergedInto=keep.id;closeTask(drop,"drop");return;}
    if(d.u6notdup){(state.dupIgnore=state.dupIgnore||[]).push(d.u6notdup);save();return;}
  });
  /* scheduled hand-offs start themselves while the board is open (the hourly run is the backup) */
  function u6Tick(){if(readOnly||!mcp||live.chatSending)return;var now=Date.now(),due=state.tasks.filter(function(t){return !t.done&&t.handoffAt&&!t.handoffFired&&new Date(t.handoffAt).getTime()<=now;});if(!due.length)return;var t=due[0];t.handoffFired=u6now();_giveU6(t);save();chip("Started a scheduled hand-off: "+clip(t.title,60));}
  setInterval(u6Tick,60000);setTimeout(u6Tick,4000);
  /* ---------- 6. Recurring work ---------- */
  var U6_DAYS=["sun","mon","tue","wed","thu","fri","sat"];
  function u6Recs(){return state.recurring||(state.recurring=[]);}
  function u6DueToday(r){if(r.on===false)return false;var d=new Date(),dow=U6_DAYS[d.getDay()],dom=d.getDate(),mo=d.getMonth();
    if(r.every==="weekdays")return d.getDay()>0&&d.getDay()<6;if(r.every==="weekly")return dow===(r.day||"mon");
    if(r.every==="monthly")return dow===(r.day||"mon")&&dom<=7;if(r.every==="quarterly")return dow===(r.day||"mon")&&dom<=7&&(mo%3===0);return false;}
  function u6RunRecurring(){if(readOnly)return 0;var made=0,key=todayISO().replace(/-/g,"");u6Recs().forEach(function(r){if(!u6DueToday(r)||r.last===todayISO())return;var id="rc-"+r.id+"-"+key;if(findTask(id)){r.last=todayISO();return;}
      state.tasks.push({id:id,group:"now",title:clip(r.title,140),note:(r.note||"")+" (Recurring: "+r.every+(r.day&&r.every!=="weekdays"?" "+r.day:"")+".)",due:todayISO(),done:false,since:todayISO(),source:"Recurring: "+r.title,playbook:r.playbook||undefined,mode:r.mode||undefined,recurring:true});r.last=todayISO();made++;});return made;}
  setTimeout(function(){try{if(u6RunRecurring())save();}catch(e){}},2500);
  function u6RecHTML(){var R=u6Recs();
    var h='<section class="panel u6-rec"><h2>Recurring work <small>created on their day, with their playbook set</small></h2><p class="hint">Each one becomes a task on its day. If its mode is Auto, Claude takes it at the next hourly run and leaves a receipt.</p><ul class="u6-rl">';
    R.forEach(function(r,i){h+='<li class="'+(r.on===false?'off':'')+'"><div class="u6-rt"><b>'+esc(r.title)+'</b><span class="hint">'+esc(r.every+(r.every!=="weekdays"?" · "+(r.every==="weekly"?"every ":"first ")+(r.day||"mon"):""))+' · '+esc((pbById(r.playbook)||{name:"auto-picked playbook"}).name)+' · '+esc(r.mode?modeName(r.mode):"playbook mode")+(r.last?' · last made '+esc(shortDate(r.last)):'')+'</span></div><div class="u6-ra"><button type="button" class="linkbtn" data-u6rtog="'+i+'">'+(r.on===false?'Turn on':'Pause')+'</button><button type="button" class="tx" data-u6rdel="'+i+'">Delete</button></div></li>';});
    h+='</ul><div class="u6-radd"><input type="text" id="u6r-title" placeholder="What should happen, e.g. Weekly ads check for G5"><select id="u6r-every"><option value="weekly">Weekly</option><option value="weekdays">Every weekday</option><option value="monthly">Monthly (first week)</option><option value="quarterly">Quarterly (Jan/Apr/Jul/Oct)</option></select><select id="u6r-day">'+U6_DAYS.slice(1,6).map(function(d){return '<option value="'+d+'">'+d.charAt(0).toUpperCase()+d.slice(1)+'</option>';}).join("")+'</select><select id="u6r-pb"><option value="">Auto-pick playbook</option>'+pbList().map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>';}).join("")+'</select><select id="u6r-mode"><option value="">Playbook mode</option>'+PB_MODES.map(function(m){return '<option value="'+m[0]+'">'+m[1]+'</option>';}).join("")+'</select><button type="button" class="btn" data-u6radd="1">Add</button></div></section>';
    return h;}
  function u6CardsHTML(){var C=u6Cards();
    var h='<section class="panel u6-cards"><h2>Reference cards <small>facts Claude reads before it works a task</small></h2><p class="hint">Short, current facts: who owns what, vendors, sites, saved searches, how to address people. Cards marked “Always” go with every hand-off; the others go when the task mentions them. Names and roles only, no emails or phone numbers.</p><ul class="u6-cl">';
    C.forEach(function(c,i){h+='<li><div class="u6-ch"><input type="text" data-u6cf="'+i+'|title" value="'+esc(c.title)+'"><label class="u6-al"><input type="checkbox" data-u6calw="'+i+'"'+(c.always?' checked':'')+'> Always</label><button type="button" class="tx" data-u6cdel="'+i+'">Delete</button></div><textarea data-u6cf="'+i+'|body" rows="'+Math.min(8,Math.max(2,String(c.body).split(/\n/).length+1))+'">'+esc(c.body)+'</textarea></li>';});
    h+='</ul><div class="u6-cacts"><button type="button" class="btn" data-u6csave="1">Save cards</button><button type="button" class="btn ghost" data-u6cadd="1">Add a card</button></div></section>';return h;}
  CTL_TABS.splice(Math.max(0,CTL_TABS.length-1),0,["reference","Reference"],["recurring","Recurring"]);
  var _autoU6=autoHTML;
  autoHTML=function(){if(ctlTab!=="reference"&&ctlTab!=="recurring")return _autoU6();var h=_autoU6();var i=h.indexOf('</div>');return h.slice(0,i+6)+(ctlTab==="reference"?u6CardsHTML():u6RecHTML());};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-u6rtog],[data-u6rdel],[data-u6radd],[data-u6csave],[data-u6cadd],[data-u6cdel]");if(!b)return;var d=b.dataset,R=u6Recs(),C=u6Cards();
    if(d.u6rtog!=null){var r=R[+d.u6rtog];if(r){r.on=r.on===false;save();}return;}
    if(d.u6rdel!=null){R.splice(+d.u6rdel,1);save();return;}
    if(d.u6radd){var g=function(id){return String((document.getElementById(id)||{}).value||"").trim();};var tt=g("u6r-title");if(!tt){chip("Say what should happen.",true);return;}R.push({id:"r"+Date.now().toString(36),title:clip(tt,140),every:g("u6r-every")||"weekly",day:g("u6r-day")||"mon",playbook:g("u6r-pb"),mode:g("u6r-mode"),on:true});save();chip("Added. It appears as a task on its day.");return;}
    if(d.u6csave){document.querySelectorAll("[data-u6cf]").forEach(function(el){var q=el.dataset.u6cf.split("|"),c=C[+q[0]];if(c)c[q[1]]=clip(String(el.value||""),q[1]==="title"?80:1500);});document.querySelectorAll("[data-u6calw]").forEach(function(el){var c=C[+el.dataset.u6calw];if(c)c.always=!!el.checked;});save();chip("Cards saved. Claude reads them from the next run.");return;}
    if(d.u6cadd){C.push({id:"c"+Date.now().toString(36),title:"New card",body:"",always:false});save();return;}
    if(d.u6cdel!=null){C.splice(+d.u6cdel,1);save();return;}
  });
  /* playbook cards in the Control room: lessons and one-tap asks */
  var _pbEdU6=pbEditorHTML;
  pbEditorHTML=function(){var h=_pbEdU6();pbList().forEach(function(p){var needle='data-pbtog="'+p.id+'"',at=h.indexOf(needle);if(at<0)return;var end=h.indexOf('</button>',at);if(end<0)return;end+=9;var L=p.lessons||[],Q=p.quick&&p.quick.length?p.quick:(U6_QUICK[p.id]||U6_QUICK.general);
    var x=pbOpen[p.id]?'<div class="u6-pbx"><label>One-tap asks on its tasks <small>one per line</small><textarea data-u6pbq="'+esc(p.id)+'" rows="3">'+esc(Q.join("\n"))+'</textarea></label><button type="button" class="linkbtn" data-u6pbqs="'+esc(p.id)+'">Save asks</button>'+(L.length?'<h5>Lessons from your 👎 <small>Claude follows these</small></h5><ul>'+L.map(function(l,i){return '<li>'+esc(l.text)+' <span class="hint">'+esc(shortDate(String(l.t).slice(0,10)))+'</span><button type="button" class="tx" data-u6lesdel="'+esc(p.id+"|"+i)+'" aria-label="Remove lesson">×</button></li>';}).join("")+'</ul>':'<p class="hint">No lessons yet. A 👎 on a result adds one.</p>')+'</div>':(L.length?'<span class="u6-pbl">'+L.length+' lesson'+(L.length>1?'s':'')+' from your 👎</span>':'');
    h=h.slice(0,end)+x+h.slice(end);});return h;};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-u6pbqs],[data-u6lesdel]");if(!b)return;
    if(b.dataset.u6pbqs){var p=pbById(b.dataset.u6pbqs),ta=document.querySelector('[data-u6pbq="'+b.dataset.u6pbqs+'"]');if(p&&ta){p.quick=String(ta.value||"").split(/\n+/).map(function(s){return s.trim();}).filter(Boolean).slice(0,6);save();chip("Saved.");}return;}
    var q=b.dataset.u6lesdel.split("|"),p2=pbById(q[0]);if(p2&&p2.lessons){p2.lessons.splice(+q[1],1);save();}});
