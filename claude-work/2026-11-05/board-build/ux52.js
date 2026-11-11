  /* ===== Task card popout (Nov 11, patch52; Brody: "Similar to how we made the popouts for the hiring people we need to do a
     similar design for tasks so i can see al the information super easily"). Clicking a task title or Open task anywhere opens
     one card with everything about the task: status, why, next step, what Claude did and where, the source email, the chat,
     the thread, the run history, and the actions (Open chat, Tell Claude, Hand off, Mark done, Show in list). */
  var TP52=null,TP52pass=false;
  function tp52Status(t){
    if(t.done)return ["ok","Done"+(t.doneOn?" "+shortDate(String(t.doneOn).slice(0,10)):"")];
    var R=t.runs||[],last=R[R.length-1],st=last?u6RunState(t,last,null):null;
    if(st&&st.k==="acc")return ["acc","Claude working · "+agoTxt(last.t)];
    if(t.pcJob&&/queued|chat/.test(t.pcJob.status||""))return ["acc",t.pcJob.status==="chat"?"Open in a chat on your PC":"Queued on your PC"];
    var cs=t.claudeStatus;
    if(cs==="queued")return ["acc","Queued for Claude"];
    if(cs==="plan")return ["warn","Plan waiting for your OK"];
    if(cs==="blocked")return ["warn","Needs you"];
    if(cs==="ready")return ["ok","Claude finished · review"];
    if(t.due&&t.due<todayISO())return ["bad","Overdue"];
    return ["","Open"];
  }
  function tp52Row(k,v){return v?'<div class="tp-f"><dt>'+esc(k)+'</dt><dd>'+v+'</dd></div>':'';}
  function tp52Link(l){var u=l&&(l.url||l.href||l.link);if(!u||!/^https:\/\//.test(u))return '';return '<a class="linkbtn" href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(clip(l.label||u,60))+' ↗</a>';}
  function tp52HTML(t){
    var st=tp52Status(t),rc=t.receipt||{},sid=w44Sid(t),m=t.mail||{};
    var h='<div class="tp-card" role="dialog" aria-modal="true" aria-label="'+esc(t.title)+' task">';
    h+='<div class="tp-head"><div><h2 class="tp-title">'+esc(t.title)+'</h2><p class="tp-sub"><span class="stag '+st[0]+'">'+esc(st[1])+'</span> '+[esc(groupLabel(t.group)||t.group),t.due?'<span class="'+(!t.done&&t.due<todayISO()?'tp-over':'')+'">Due '+esc(shortDate(t.due))+'</span>':'',t.from?esc(t.from):''].filter(Boolean).join(' · ')+'</p></div><button type="button" class="mx" data-tpx aria-label="Close">×</button></div>';
    var nxt=t.unlockBy||(rc.status!=="done"&&rc.left)||"";
    if(nxt&&!t.done)h+='<div class="tp-next"><b>Your next step</b><span>'+esc(Array.isArray(nxt)?nxt.join(" "):nxt)+'</span></div>';
    h+='<div class="tp-acts">'+(sid?'<a class="btn" href="'+esc(sessLink(sid))+'" target="_blank" rel="noopener">Open chat ↗</a>':'')
      +(m.link&&/^https:\/\//.test(m.link)?'<a class="btn ghost" href="'+esc(m.link)+'" target="_blank" rel="noopener">Source email ↗</a>':'')
      +(!t.done&&t.assignee!=="claude"?hoBtn("task",t.id,"Hand off to Claude"):'')
      +(!t.done?'<button type="button" class="btn ghost" data-markdone="'+esc(t.id)+'" data-tpclose="1">Mark done</button>':'')
      +'<button type="button" class="btn ghost" data-tplist="'+esc(t.id)+'">Show in task list</button></div>';
    h+='<div class="tp-main">';
    if(t.why)h+='<section><h3>Why it matters</h3><p>'+esc(t.why)+'</p></section>';
    if(t.note)h+='<section><h3>Details</h3><p>'+esc(t.note)+'</p></section>';
    if(rc.at){
      h+='<section class="tp-rc"><h3>What Claude did <small>'+esc(rcWhen(rc.at)||"")+'</small></h3>';
      if(rc.summary)h+='<p>'+esc(rc.summary)+'</p>';
      if(Array.isArray(rc.did)&&rc.did.length)h+='<ul>'+rc.did.slice(0,8).map(function(d){return '<li>'+esc(typeof d==="string"?d:(d.text||""))+'</li>';}).join("")+'</ul>';
      if(Array.isArray(rc.where)&&rc.where.length)h+='<div class="tp-links">'+rc.where.map(tp52Link).join("")+'</div>';
      if(Array.isArray(rc.unsure)&&rc.unsure.length)h+='<p class="tp-warn"><b>Check first:</b> '+esc(rc.unsure.join(" · "))+'</p>';
      h+='</section>';
    }
    var th=(t.thread||[]).slice(-6).reverse();
    if(th.length)h+='<section><h3>Conversation <small>'+(t.thread||[]).length+' messages</small></h3><ul class="tp-th">'+th.map(function(x){return '<li class="'+(x.role==="claude"?'c':'u')+'"><span>'+(x.role==="claude"?'Claude':'You')+' · '+esc(rcWhen(x.t)||"")+'</span>'+esc(clip(x.text,700))+'</li>';}).join("")+'</ul></section>';
    if(!t.done)h+='<section><h3>Tell Claude</h3><textarea id="tp-say" rows="3" placeholder="An answer, a correction, or what to do next. Claude starts on it right away."></textarea><div class="tp-acts"><button type="button" class="btn" data-tpsay="'+esc(t.id)+'">Send to Claude</button></div></section>';
    h+='<section class="tp-side"><h3>Details</h3><dl>';
    h+=tp52Row("From",esc(t.from||""));
    h+=tp52Row("Source",esc(t.source||""));
    h+=tp52Row("Open since",t.since?esc(shortDate(String(t.since).slice(0,10))):"");
    h+=tp52Row("Owner",t.assignee==="claude"?"Claude":"You");
    h+=tp52Row("Playbook",(typeof pbFor==="function"&&pbFor(t))?esc(pbFor(t).name):"");
    if(m.subject)h+=tp52Row("Email",esc(m.subject)+(m.from?'<br><small>'+esc(m.from)+(m.on?' · '+esc(shortDate(String(m.on).slice(0,10))):'')+'</small>':''));
    if(t.outlookDraft&&t.outlookDraft.link)h+=tp52Row("Draft",'<a href="'+esc(t.outlookDraft.link)+'" target="_blank" rel="noopener">'+esc(t.outlookDraft.subject||"Open draft")+' ↗</a>');
    if(t.pcJob)h+=tp52Row("PC job",esc((t.pcJob.status||"")+(t.pcJob.step?": "+clip(t.pcJob.step,140):"")));
    if(t.case)h+=tp52Row("Case",esc([t.case.no,t.case.issue,t.case.vendor,t.case.status].filter(Boolean).join(" · ")));
    if(t.bh&&t.bh.url)h+=tp52Row("BugHerd",'<a href="'+esc(t.bh.url)+'" target="_blank" rel="noopener">#'+esc(t.bh.id)+' '+esc(t.bh.column||"")+' ↗</a>');
    if(t.sourceLink)h+=tp52Row("Link",tp52Link({url:t.sourceLink,label:"Open source"}));
    h+='</dl>';
    var R=(t.runs||[]).filter(function(r){return r.why!=="done";}).slice(-5).reverse();
    if(R.length)h+='<h3>Runs</h3><ul class="tp-runs">'+R.map(function(r){return '<li><span>'+esc(rcWhen(r.t)||r.t)+' · '+esc(r.why||"run")+'</span>'+(r.sid?'<a href="'+esc(sessLink(r.sid))+'" target="_blank" rel="noopener">chat ↗</a>':'')+'</li>';}).join("")+'</ul>';
    h+='</section></div></div>';
    return h;
  }
  function tp52Open(id){var t=findTask(id);if(!t)return false;TP52=id;tp52Draw();return true;}
  function tp52Draw(){
    var el=document.getElementById("tp52");
    if(!TP52){if(el)el.remove();document.body.classList.remove("tp-on");return;}
    var t=findTask(TP52);if(!t){TP52=null;return tp52Draw();}
    var keep=document.getElementById("tp-say"),kv=keep?keep.value:"";
    if(!el){el=document.createElement("div");el.id="tp52";el.className="tp-wrap";document.body.appendChild(el);}
    el.innerHTML=tp52HTML(t);document.body.classList.add("tp-on");
    var ta=document.getElementById("tp-say");if(ta&&kv)ta.value=kv;
  }
  var _render52=render;
  render=function(){_render52.apply(this,arguments);if(TP52)try{tp52Draw();}catch(e){}};
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&TP52){TP52=null;tp52Draw();}});
  document.addEventListener("click",function(e){
    var t=e.target;if(!t.closest)return;
    if(TP52pass)return;
    if(t.closest("#tp52")){
      if(t.id==="tp52"||t.closest("[data-tpx]")){TP52=null;tp52Draw();return;}
      var l=t.closest("[data-tplist]");if(l){e.preventDefault();e.stopImmediatePropagation();var id=l.dataset.tplist;TP52=null;tp52Draw();
        TP52pass=true;var b=document.createElement("button");b.setAttribute("data-opentask",id);b.style.display="none";document.body.appendChild(b);try{b.click();}finally{TP52pass=false;b.remove();}return;}
      var s=t.closest("[data-tpsay]");if(s){var tk=findTask(s.dataset.tpsay),ta=document.getElementById("tp-say"),txt=ta?ta.value.trim():"";
        if(!tk||!txt){chip("Type what Claude should do first.",true);return;}
        (tk.thread=tk.thread||[]).push({role:"user",t:new Date().toISOString(),text:txt});
        if(fuRun(tk,txt,"follow-up")){ta.value="";save();chip("Sent. Claude is on it; watch Claude at work.");}else{save();chip("Saved on the task. Claude picks it up at the next run.");}
        tp52Draw();return;}
      if(t.closest("[data-tpclose]"))setTimeout(function(){TP52=null;tp52Draw();},0);
      return;
    }
    var o=t.closest("[data-opentask]");
    if(o&&!o.closest(".tp-wrap")){if(tp52Open(o.dataset.opentask)){e.preventDefault();e.stopImmediatePropagation();}return;}
    var ti=t.closest("li.task[data-task] .title, .dq-title, .w44-t");
    if(ti){var row=ti.closest("[data-task]"),id=row&&row.dataset.task;
      if(!id){var card=ti.closest(".dq-card,.w44-r");var ob=card&&card.querySelector("[data-opentask]");id=ob&&ob.dataset.opentask;}
      if(id&&tp52Open(id)){e.preventDefault();e.stopImmediatePropagation();}}
  },true);

