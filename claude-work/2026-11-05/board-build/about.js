  /* ---------- About this task: where it came from, Explain, Dig deeper ----------
     Explain runs on the in-page Claude ("sample") with everything the board knows
     about the task. Dig deeper sends a Live chat message, so the fresh routine with
     Outlook, Teams, Notion and Asana finds the source and writes the answer into
     this task's thread. */
  var EXPLAIN_Q="What does this task mean? In plain words: what is being asked, who asked or where it came from, why it matters, and what done looks like. If the board doesn't say where it came from, tell me what's missing.";
  var digSent={};
  function taskLinks(t){
    var out={tw:[],blocks:[],rel:[],inbox:[]},seen={};
    ((state.teamsWatch&&state.teamsWatch.items)||[]).forEach(function(i){if(i.taskId===t.id)out.tw.push(i);});
    Object.keys(state.days||{}).sort().forEach(function(k){(state.days[k].blocks||[]).forEach(function(b){if((b.taskIds||[]).indexOf(t.id)>=0)out.blocks.push({day:k,b:b});});});
    (t.relatedTaskIds||[]).forEach(function(id){var x=findTask(id);if(x&&!seen[x.id]){seen[x.id]=1;out.rel.push(x);}});
    state.tasks.forEach(function(x){if(x!==t&&!seen[x.id]&&(x.relatedTaskIds||[]).indexOf(t.id)>=0){seen[x.id]=1;out.rel.push(x);}});
    var ib=(state.days[state.today]||{}).inbox;
    if(ib&&ib.people)ib.people.forEach(function(p){if((p.taskIds||[]).indexOf(t.id)>=0)out.inbox.push(p.name);});
    return out;
  }
  function srcLinks(t){
    var a=[];
    if(t.mail&&/^https:\/\/outlook\.(office365|office)\.com\//.test(t.mail.link||""))a.push({href:t.mail.link,label:"Open the email"});
    if(/^https:\/\//.test(t.sourceLink||""))a.push({href:t.sourceLink,label:"Open the source"});
    if(t.bh&&/^https:\/\/www\.bugherd\.com\//.test(t.bh.url||""))a.push({href:t.bh.url,label:"Open in BugHerd"});
    return a;
  }
  function isoDay(s){return (typeof s==="string"&&/^\d{4}-\d{2}-\d{2}/.test(s))?s.slice(0,10):"";}
  function whereFrom(t){
    var w=[];
    if(t.from)w.push("From "+t.from);
    if(t.mail&&t.mail.subject)w.push((t.from?"via email":"Email")+" “"+clip(t.mail.subject,90)+"”"+(t.mail.from&&!t.from?" from "+t.mail.from:"")+(isoDay(t.mail.on)?", "+shortDate(isoDay(t.mail.on)):""));
    if(t.source&&!/^triage \d/.test(t.source))w.push(t.source);
    if(t.bh)w.push("BugHerd #"+t.bh.id+(t.bh.column?" ("+t.bh.column+")":""));
    if(t.case)w.push("Case "+(t.case.no||"")+(t.case.issue?", "+t.case.issue:"")+(t.case.vendor?", vendor "+t.case.vendor:""));
    return w;
  }
  function taskCtx(t){
    var L=taskLinks(t),c={id:t.id,title:t.title,group:t.group,groupLabel:groupLabel(t.group),due:t.due,done:t.done,note:t.note};
    ["from","source","since","question","needs","answer","brief","claudeCan"].forEach(function(k){if(t[k]!=null&&t[k]!=="")c[k]=t[k];});
    if(t.mail)c.email={subject:t.mail.subject,from:t.mail.from,on:t.mail.on};
    if(t.bh)c.bugherd={id:t.bh.id,column:t.bh.column,assigned:t.bh.assigned,activity:(t.bh.activity||[]).slice(-5)};
    if(t.case)c.pendingCase={no:t.case.no,issue:t.case.issue,vendor:t.case.vendor,status:t.case.status,created:t.case.created,order:t.case.order,po:t.case.po};
    if(t.update)c.lastUpdate=t.update;
    if(t.reply)c.replyState=t.reply;
    if(t.workflow)c.workflow=t.workflow;
    if(L.tw.length)c.teamsMessages=L.tw.map(function(i){return {from:i.from,on:i.on,gist:i.gist};});
    if(L.blocks.length)c.onPlan=L.blocks.slice(-4).map(function(x){return {day:x.day,start:x.b.start,title:x.b.title,sub:clip(x.b.sub||"",300)};});
    if(L.rel.length)c.relatedTasks=L.rel.slice(0,8).map(function(x){return {id:x.id,title:x.title,note:clip(x.note||"",200),done:x.done};});
    if(L.inbox.length)c.inTodaysInboxFrom=L.inbox;
    return c;
  }
  function aboutHTML(t){
    var L=taskLinks(t),w=whereFrom(t),links=srcLinks(t);
    var h='<div class="about"><h4>About this task</h4><dl>';
    h+='<dt>Came from</dt><dd>'+(w.length?esc(w.join(" · ")):'<span class="muted">Not recorded on the board. Use Dig deeper to find it.</span>')+'</dd>';
    var since=t.since||isoDay(t.mail&&t.mail.on);
    if(since)h+='<dt>On your list</dt><dd>Since '+esc(shortDate(since))+(t.due?' · due '+esc(shortDate(t.due)):'')+'</dd>';
    if(t.needs||t.question)h+='<dt>Open question</dt><dd>'+esc(clip(t.needs||t.question,300))+'</dd>';
    if(L.tw.length)h+='<dt>Teams</dt><dd>'+L.tw.slice(-3).map(function(i){return esc(i.from+", "+shortDate(isoDay(i.on))+": "+clip(i.gist,140));}).join('<br>')+'</dd>';
    if(L.inbox.length)h+='<dt>Today’s inbox</dt><dd>From '+esc(L.inbox.join(", "))+'</dd>';
    if(L.blocks.length){var lb=L.blocks[L.blocks.length-1];h+='<dt>On your plan</dt><dd>'+esc(shortDate(lb.day)+" "+(lb.b.start||"")+" · "+lb.b.title)+(L.blocks.length>1?' <span class="muted">('+L.blocks.length+' times)</span>':'')+'</dd>';}
    if(L.rel.length)h+='<dt>Related</dt><dd>'+L.rel.slice(0,5).map(function(x){return '<button type="button" class="linkbtn rel" data-opentask="'+esc(x.id)+'">'+esc(clip(x.title,60))+'</button>';}).join(' ')+'</dd>';
    h+='</dl><div class="cacts">';
    links.forEach(function(l){h+='<a class="linkbtn" href="'+esc(l.href)+'" target="_blank" rel="noopener">'+esc(l.label)+'</a>';});
    var busy=tAsk.busy&&tAsk.id===t.id;
    h+='<button type="button" class="btn" data-taskexplain="'+esc(t.id)+'"'+(sampler&&!tAsk.busy?'':' disabled')+' title="Claude explains it from what the board knows. Instant.">'+(busy?'Thinking…':'Explain this task')+'</button>';
    h+='<button type="button" class="btn ghost" data-taskdig="'+esc(t.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+' title="Claude searches your email, Teams, Notion and Asana for where this came from. About 1 to 2 minutes.">Dig deeper (email, Teams, Notion)</button>';
    h+='</div>';
    if(digSent[t.id])h+='<p class="hint" style="margin:8px 0 0">Sent to Claude. The answer lands in this task’s thread below and in <button type="button" class="linkbtn" data-view="chat">Live chat</button>, usually in 1 to 2 minutes.</p>';
    else if(samplerTried&&!sampler&&!mcp)h+='<p class="hint" style="margin:8px 0 0">Explain and Dig deeper need Claude allowed for this page.</p>';
    h+='</div>';
    return h;
  }
  function digMsg(t){
    var w=whereFrom(t);
    return "Dig deeper on task "+t.id+" (“"+t.title+"”). Find where it came from in my email, Teams, Notion and Asana, then tell me in plain words what it means, who asked or is waiting on it, and the next step. Put your answer in Live chat and also push it into that task's thread (role claude). Change nothing else on the task."+
      "\n\nWhat the board has: "+(w.length?w.join("; "):"no source recorded")+(t.since?"; on the list since "+t.since:"")+(t.note?"; note: "+clip(t.note,400):"");
  }
  function runExplain(id){
    var t=findTask(id);if(!t||!sampler||tAsk.busy)return;
    tAsk={id:id,text:EXPLAIN_Q,busy:false,err:"",refocus:false};
    runTaskAsk(id);
  }
  document.addEventListener("click",function(e){
    var x=e.target.closest("[data-taskexplain]");if(x){runExplain(x.dataset.taskexplain);return;}
    var d=e.target.closest("[data-taskdig]");
    if(d){var t=findTask(d.dataset.taskdig);if(!t||!mcp||live.chatSending)return;digSent[t.id]=Date.now();chSend(digMsg(t));return;}
    var q=e.target.closest("[data-whatsthis]");
    if(q){var tq=findTask(q.dataset.whatsthis);if(!tq)return;
      openTasks[tq.id]=true;markRead(tq);
      if(sampler&&!tAsk.busy&&!(threadOf(tq)||[]).length)runExplain(tq.id);else render();
      var row=document.querySelector('.task[data-task="'+tq.id+'"] .about');if(row)row.scrollIntoView({block:"nearest",behavior:"smooth"});
      return;}
  });

