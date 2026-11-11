  /* ===== Actions: one record per wait, buttons that trigger it (Nov 11, patch51; Brody: "I dont have a way to trigger this task
     from that task within ultron ... tasks are seeing the right things but triggers seeing how to trigger or what to trigger is not
     going well"). Before this, a wait lived in eight places (goAsk, approvalNeeded, approved, hold, pcJob, pcLookup, receipt
     "needs_you", a manifest's "held") and Go on Approvals only sent a chat message, which never reached the PC worker.
     Now, as in GitHub environments, Step Functions task tokens, Temporal signals and Power Automate approvals:
     - state.actions = [{id, key, task, executor:"pc"|"cloud", reason, title, ask:{what,why,risk,before,after,system,rows},
       steps:[...], resume:{kind,...refs}, status, decision, claim, result, ring, createdBy, createdAt, expiresAt, log:[]}].
     - status: waiting -> go -> running -> done | failed; or no, held, expired, superseded. A button only acts on a waiting
       (or failed, for Retry) record, so a second click or a stale page can't decide twice.
     - Buttons come from the reason code, write the decision on the record and publish the board. For the PC they also ask
       Live chat to ring the pc-queue doorbell (kind "action"); if that doesn't land, the PC worker reads state.actions on
       its next run anyway (every 30 min, weekdays 8:05 to 5:05).
     - Tasks that still only carry a goAsk / approvalNeeded / plan / pcJob "needs_signin" get a card too; the first click turns
       it into a stored record. Executors: Notion "Routine rules", section "Actions". */
  var AX51_REASONS={
    NEEDS_APPROVAL:{label:"Needs your OK",tone:"acc",opts:["go","hold","no"]},
    OVER_LIMIT:{label:"Over the standing limit",tone:"warn",opts:["go","hold","no"]},
    NEEDS_PERMISSION:{label:"Blocked by a PC permission",tone:"bad",opts:["retry","self","hold"]},
    NEEDS_SIGNIN:{label:"Needs your sign-in",tone:"bad",opts:["retry","self","hold"]},
    NEEDS_INPUT:{label:"Needs an answer",tone:"acc",opts:["answer","hold"]},
    FAILED:{label:"Failed",tone:"bad",opts:["retry","self","no"]},
    PLAN:{label:"Plan to approve",tone:"acc",opts:["go","hold","no"]}
  };
  var AX51_BTN={go:["Go","btn"],retry:["Retry","btn"],answer:["Send answer","btn"],self:["I did it myself","btn ghost"],hold:["Hold","btn ghost"],no:["No","btn ghost"]};
  var AX51_WHO={pc:"Your PC (PC worker)",cloud:"Claude in the cloud"};
  var AX51_OPEN={waiting:1,failed:1};
  var ax51Note={},ax51Hold={};
  function ax51List(){return Array.isArray(state.actions)?state.actions:(state.actions=[]);}
  function ax51Get(id){var L=ax51List();for(var i=0;i<L.length;i++)if(L[i]&&L[i].id===id)return L[i];return null;}
  function ax51ForTask(tid){return ax51List().filter(function(a){return a&&a.task===tid;});}
  function ax51Live(a){return a&&!/^(done|no|expired|superseded)$/.test(a.status||"");}
  var _ax51Legacy=apItems;
  /* A card for every task that waits on Brody but has no live action record yet. */
  function ax51Derived(){
    var out=[],seen={};
    ax51List().forEach(function(a){if(ax51Live(a)&&a.task)seen[a.task]=1;});
    _ax51Legacy().forEach(function(t){
      if(seen[t.id])return;seen[t.id]=1;var a=apAsk(t),plan=typeof apPlanWaiting==="function"&&apPlanWaiting(t);
      out.push({id:"act-"+t.id,key:"task|"+t.id,task:t.id,executor:t.pcOnly?"pc":"cloud",reason:plan?"PLAN":"NEEDS_APPROVAL",title:t.title,
        ask:{what:a.what,why:a.why,risk:a.risk,before:a.before,after:a.after,system:a.system},resume:{kind:plan?"plan":"task",previewHash:(t.goAsk&&t.goAsk.previewHash)||""},
        status:"waiting",createdBy:"",createdAt:t.since||"",derived:true,log:[]});
    });
    state.tasks.forEach(function(t){
      if(seen[t.id]||!dqTaskOK(t)||t.hold||!t.pcJob||t.pcJob.status!=="needs_signin")return;seen[t.id]=1;
      out.push({id:"act-"+t.id+"-signin",key:"signin|"+t.id,task:t.id,executor:"pc",reason:"NEEDS_SIGNIN",title:t.title,
        ask:{what:"Sign in on the PC, then the PC worker runs this step again: "+clip(t.pcJob.step||"",300),why:t.pcJob.site?"The PC worker was signed out of "+t.pcJob.site+".":"The PC worker hit a sign-in page.",system:t.pcJob.site||""},
        steps:["Sign in to "+(t.pcJob.site||"the site")+" in Chrome on your PC (PCI profile). Claude never types passwords or codes.","Press Retry."],
        resume:{kind:"pcJob"},status:"waiting",createdBy:"",createdAt:t.pcJob.at||"",derived:true,log:[]});
    });
    return out;
  }
  function ax51Cards(){
    var pr=function(a){var t=a.task&&findTask(a.task);return t&&t.pri==="high"?0:t&&t.pri==="low"?2:1;};
    var L=ax51List().filter(function(a){return a&&AX51_OPEN[a.status]&&!(a.task&&findTask(a.task)&&findTask(a.task).done);}).concat(ax51Derived());
    return L.sort(function(a,b){return pr(a)-pr(b)||(a.derived?1:0)-(b.derived?1:0)||String(a.createdAt||"").localeCompare(String(b.createdAt||""));});
  }
  apItems=function(){return ax51Cards();};
  function ax51Moving(){return ax51List().filter(function(a){return a&&(a.status==="go"||a.status==="running");});}
  function ax51Recent(){var cut=Date.now()-2*864e5;return ax51List().filter(function(a){return a&&/^(done|no|held)$/.test(a.status||"")&&Date.parse((a.result&&a.result.at)||(a.decision&&a.decision.at)||0)>cut;}).slice(-6).reverse();}
  function ax51Opts(a){var r=AX51_REASONS[a.reason]||AX51_REASONS.NEEDS_APPROVAL;var o=Array.isArray(a.options)&&a.options.length?a.options:r.opts;
    if(a.status==="failed"&&o.indexOf("retry")<0)o=["retry"].concat(o.filter(function(x){return x!=="go";}));return o;}
  function ax51When(iso){return !iso?"":String(iso).length<=10?shortDate(iso):rcWhen(iso)||shortDate(iso);}
  function ax51PcHours(d){d=d||new Date();var w=d.getDay(),m=d.getHours()*60+d.getMinutes();return w>0&&w<6&&m>=480&&m<=1025;}
  function ax51Stale(a){if(a.status!=="go"||a.claim)return false;var at=Date.parse((a.ring&&a.ring.at)||(a.decision&&a.decision.at)||0);return at&&Date.now()-at>40*60000;}
  function ax51Status(a){
    var d=a.decision||{},who=a.executor==="pc"?"your PC":"Claude";
    if(a.status==="running")return "Running on "+who+(a.claim&&a.claim.at?" since "+clk(a.claim.at):"")+(a.claim&&a.claim.by?" ("+a.claim.by+")":"")+".";
    if(a.status==="go"){
      var s="You said "+(AX51_BTN[d.choice]?AX51_BTN[d.choice][0]:"go")+(d.at?" at "+clk(d.at):"")+". ";
      if(a.executor==="pc")s+=(a.ring&&a.ring.at?"Asked Live chat to ring your PC at "+clk(a.ring.at)+". ":"")+(ax51PcHours()?"The PC worker picks it up on its next run (every 30 minutes) or sooner when the bell lands.":"The PC worker runs weekdays 8:05 to 5:05, so it starts on the next run.");
      else s+="Claude starts it from Live chat now, or at the next hourly check-in.";
      return s;
    }
    if(a.status==="failed")return "Failed"+(a.result&&a.result.at?" "+ax51When(a.result.at):"")+": "+clip((a.result&&a.result.summary)||"no reason given",240);
    if(a.status==="done")return (d.choice==="self"?"You did it yourself":"Done")+(a.result&&a.result.at?" "+ax51When(a.result.at):"")+(a.result&&a.result.summary?": "+clip(a.result.summary,240):".");
    if(a.status==="no")return "You said no"+(d.at?" "+ax51When(d.at):"")+".";
    if(a.status==="held")return "On hold: "+(d.note||"no reason")+".";
    return "Waiting on you"+(a.createdAt?" since "+ax51When(a.createdAt):"")+(a.createdBy?" · from "+a.createdBy:"")+".";
  }
  function ax51Card(a,compact){
    var r=AX51_REASONS[a.reason]||AX51_REASONS.NEEDS_APPROVAL,k=a.ask||{},t=a.task&&findTask(a.task),open=!!AX51_OPEN[a.status];
    var h='<li class="ax51-card st-'+esc(a.status||"waiting")+'" data-axid="'+esc(a.id)+'"><div class="ap-top"><span class="stag '+r.tone+'">'+esc(r.label)+'</span><span class="stag">'+esc(AX51_WHO[a.executor]||a.executor||"")+'</span>'+(k.system?'<span class="stag">'+esc(k.system)+'</span>':'')+(t&&t.pri==="high"?'<span class="stag bad">High</span>':'')+'<span class="ap-id">'+esc(a.id)+'</span></div>';
    h+='<div class="ap-t">'+esc(a.title||(t&&t.title)||a.id)+'</div>';
    var brief=compact==="brief";
    if(brief&&open){
      h+='<dl class="ap-dl"><dt>'+(a.reason==="NEEDS_PERMISSION"||a.reason==="NEEDS_SIGNIN"||a.reason==="FAILED"?"On Retry":"If you say go")+'</dt><dd>'+esc(clip(k.what||"",220))+'</dd><dt>Risks</dt><dd>'+(k.risk?esc(clip(k.risk,180)):'None found')+'</dd></dl>';
      if(a.steps&&a.steps.length)h+='<p class="ax51-st">'+esc(a.steps.length)+' step'+(a.steps.length>1?'s':'')+' for you: open it in Approvals.</p>';
    }else if(!compact||open){
      h+='<dl class="ap-dl"><dt>'+(a.reason==="NEEDS_PERMISSION"||a.reason==="NEEDS_SIGNIN"||a.reason==="FAILED"?"On Retry":"If you say go")+'</dt><dd>'+esc(k.what||"")+'</dd>';
      if(k.why)h+='<dt>Why</dt><dd>'+esc(clip(k.why,420))+'</dd>';
      if(open)h+='<dt>Risks</dt><dd>'+(k.risk?esc(clip(k.risk,300)):'None found')+'</dd>';
      if(open&&(k.before||k.after))h+='<dt>Before → after</dt><dd class="ap-ba"><span>'+esc(k.before||"—")+'</span><span>'+esc(k.after||"—")+'</span></dd>';
      h+='</dl>';
      if(open&&a.steps&&a.steps.length)h+='<ol class="ax51-steps">'+a.steps.slice(0,6).map(function(s){return '<li>'+esc(clip(s,300))+'</li>';}).join("")+'</ol>';
    }
    h+='<p class="ax51-st">'+esc(ax51Status(a))+'</p>';
    h+='<div class="ap-acts">';
    if(t)h+='<button type="button" class="linkbtn" data-opentask="'+esc(t.id)+'">Task</button>';
    if(!readOnly){
      h+='<span class="ap-pick">';
      if(open){
        var o=ax51Opts(a);
        if(o.indexOf("answer")>=0)h+='<input type="text" class="ax51-in" data-axnote="'+esc(a.id)+'" value="'+esc(ax51Note[a.id]||"")+'" placeholder="Your answer" aria-label="Your answer">';
        if(ax51Hold[a.id])h+='<select data-axhold="'+esc(a.id)+'" aria-label="Why hold it">'+HOLD_R.map(function(x){return '<option'+(ax51Hold[a.id]===x?' selected':'')+'>'+esc(x)+'</option>';}).join("")+'</select><button type="button" class="btn ghost" data-ax="holdok" data-id="'+esc(a.id)+'">Hold it</button>';
        else o.forEach(function(c){var b=AX51_BTN[c];if(b)h+='<button type="button" class="'+b[1]+' ax51-b" data-ax="'+c+'" data-id="'+esc(a.id)+'">'+esc(b[0])+'</button>';});
      }else if(a.status==="go"&&!a.claim){
        if(ax51Stale(a)&&a.executor==="pc")h+='<button type="button" class="btn ax51-b" data-ax="ring" data-id="'+esc(a.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>Ring the PC again</button>';
        h+='<button type="button" class="linkbtn" data-ax="undo" data-id="'+esc(a.id)+'">Undo</button>';
      }
      h+='</span>';
    }
    return h+'</div></li>';
  }
  function ax51Queued(){return state.tasks.filter(function(t){return dqTaskOK(t)&&!t.hold&&((t.pcJob&&t.pcJob.status==="queued")||t.pcLookup)&&!ax51ForTask(t.id).some(ax51Live);});}
  function ax51QueuedHTML(){
    var Q=ax51Queued();if(!Q.length)return "";
    var h='<details class="ax51-q"><summary>Queued on your PC ('+Q.length+') <small>the PC worker takes 3 a run; ring it to start now</small></summary><ul class="cl-list">';
    Q.slice(0,12).forEach(function(t){var j=t.pcJob||{},at=(j.rang&&j.rang.at)||j.t||(t.pcLookup&&t.pcLookup.t)||"";
      h+='<li><div class="ct"><button type="button" class="tx" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,110))+'</button></div><div class="cm">'+esc(clip(j.step||(t.pcLookup&&t.pcLookup.what)||"",160))+(at?' · '+esc(j.rang?"rang "+ax51When(at):"queued "+ax51When(at)):'')+'</div>'
        +(readOnly?'':'<div class="cacts"><button type="button" class="linkbtn" data-axring="'+esc(t.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>Ring the PC now</button></div>')+'</li>';});
    return h+'</ul></details>';
  }
  function ax51PanelHTML(full){
    var C=ax51Cards(),M=ax51Moving(),R=full?ax51Recent():[];
    if(!full&&!C.length&&!M.length)return "";
    var lim=full?C.length:3;
    var h='<section class="panel ax51" id="sec-actions"><h2>Needs your go <small><b>'+C.length+'</b> waiting'+(M.length?' · '+M.length+' moving':'')+'</small></h2>';
    if(full)h+='<p class="hint">Each button saves your choice on the board straight away. Work for your PC also rings it; if the bell doesn’t land, the PC worker reads your choice on its next run. Nothing here goes through a chat reply.</p>';
    if(C.length)h+='<ul class="ap-list ax51-list">'+C.slice(0,lim).map(function(a){return ax51Card(a,full?false:"brief");}).join("")+'</ul>';
    else if(full)h+='<p class="empty">Nothing is waiting on your go right now.</p>';
    if(!full&&C.length>lim)h+='<button type="button" class="linkbtn" data-view="approvals">See all '+C.length+' in Approvals</button>';
    if(M.length)h+='<h3 class="ax51-h">In progress</h3><ul class="ap-list ax51-list">'+M.map(function(a){return ax51Card(a,true);}).join("")+'</ul>';
    if(R.length)h+='<h3 class="ax51-h">Finished in the last 2 days</h3><ul class="ap-list ax51-list">'+R.map(function(a){return ax51Card(a,true);}).join("")+'</ul>';
    if(full)h+=ax51QueuedHTML();
    return h+'</section>';
  }
  var _ax51Src=srcStripHTML;
  srcStripHTML=function(){return ax51PanelHTML(false)+_ax51Src();};
  apHTML=function(){
    var held=state.tasks.filter(function(t){return dqTaskOK(t)&&t.hold&&(t.goAsk||t.approvalNeeded)&&!t.approved;});
    var h=ax51PanelHTML(true);
    if(held.length){
      h+='<section class="panel"><details class="ap-held" open><summary>On hold ('+held.length+')</summary><ul class="cl-list">';
      held.forEach(function(t){h+='<li><div class="ct">'+esc(t.title)+'</div><div class="cm">'+esc(t.hold.reason)+(t.hold.on?' · since '+esc(shortDate(t.hold.on)):'')+'</div><div class="cacts"><button type="button" class="linkbtn" data-resume="'+esc(t.id)+'">Resume</button></div></li>';});
      h+='</ul></details></section>';
    }
    return h+specLinkHTML();
  };
  var _ax51Head=viewHeadHTML;
  viewHeadHTML=function(){var h=_ax51Head.apply(null,arguments);return view==="approvals"?h.replace(" Mark Go or Hold on each, then send one reply."," Press a button on each; it saves and starts the work."):h;};
  /* Turn a derived card into a stored record (first click). */
  function ax51Store(a){if(!a.derived)return a;var x=JSON.parse(JSON.stringify(a));delete x.derived;x.createdAt=x.createdAt||nowISO();ax51List().push(x);return x;}
  function ax51Find(id){return ax51Get(id)||ax51Derived().filter(function(a){return a.id===id;})[0]||null;}
  function ax51Ring(a){
    if(!mcp||live.chatSending||a.executor!=="pc")return false;
    var ms=Date.now(),tk=a.task||a.id;
    chSend("[Ultron action "+a.id+"] Brody pressed "+(AX51_BTN[(a.decision||{}).choice]||["Go"])[0]+" on the board. Ring the PC doorbell and do nothing else: push queue/"+tk+"-"+ms+".json to the pc-queue branch = {\"task\":\""+(a.task||"")+"\",\"kind\":\"action\",\"action\":\""+a.id+"\",\"ask\":\"\",\"t\":\""+new Date(ms).toISOString()+"\",\"by\":\"Ultron Live chat\"}. The decision is already saved in state.actions on the board; the PC worker reads it there (Routine rules, Actions). Reply \"Rang your PC\" only if the push succeeded.");
    a.ring={at:new Date(ms).toISOString(),via:"live chat"};return true;
  }
  function ax51Cloud(a){
    if(!mcp||live.chatSending||a.executor!=="cloud")return false;
    chSend("[Ultron action "+a.id+"] Brody pressed "+(AX51_BTN[(a.decision||{}).choice]||["Go"])[0]+" on the board"+(a.task?" for task "+a.task:"")+". Work it now under Routine rules, Actions: set the action running, do exactly ask.what and nothing else, then set it done or failed with result, write the task receipt and publish.");
    a.ring={at:nowISO(),via:"live chat"};return true;
  }
  function ax51Decide(id,choice,note){
    if(readOnly)return;
    var a=ax51Find(id);if(!a){chip("That item is gone. Reload the board.",true);return;}
    var reopen=a.status==="failed"&&(choice==="retry"||choice==="self"||choice==="no");
    if(!AX51_OPEN[a.status]&&!reopen){chip("Already decided ("+a.status+"). Nothing changed.",true);render();return;}
    if(choice==="answer"&&!String(note||"").trim()){chip("Type your answer first.",true);return;}
    a=ax51Store(a);
    var now=nowISO(),today=todayISO(),t=a.task&&findTask(a.task),k=a.ask||{};
    a.decision={choice:choice,note:clip(note||"",500),by:"Brody",at:now,via:"button"};
    delete a.claim;
    a.status=(choice==="go"||choice==="retry"||choice==="answer")?"go":choice==="self"?"done":choice==="hold"?"held":"no";
    if(choice==="self")a.result={at:now,summary:"Brody did it himself."+(a.executor==="pc"?" The PC worker checks it on its next run.":""),by:"Brody"};
    (a.log||(a.log=[])).push({at:now,by:"Brody",text:(AX51_BTN[choice]?AX51_BTN[choice][0]:choice)+(note?": "+clip(note,200):"")});
    if(t){
      var th=t.thread||(t.thread=[]);
      if(a.status==="go"){
        if(a.resume&&a.resume.kind==="plan"){t.planOK=now;if(t.receipt&&t.receipt.status==="plan")delete t.receipt;}
        else t.approved={what:k.what||t.title,system:k.system||"",t:now,via:"action",action:a.id,previewHash:(a.resume&&(a.resume.sha256||a.resume.previewHash))||""};
        if(t.goAsk)t.goAsk.decided={how:"go",t:now,action:a.id};
        delete t.approvalNeeded;delete t.hold;
        if(t.pcJob&&(t.pcJob.status==="needs_signin"||a.reason==="NEEDS_SIGNIN"))t.pcJob.status="queued";
        th.push({role:"user",text:(choice==="answer"?"Answer: "+note:choice==="retry"?"Retry: "+(k.what||""):"OK, go ahead: "+(k.what||t.title)),t:now});
        t.update={on:today,by:"Brody",text:(choice==="retry"?"Retry":"Go")+" pressed on the board."};
        if(t.pcOnly)t.claudeStatus="ready";else{t.assignee="claude";t.claudeStatus="queued";}
      }else if(a.status==="held"){
        t.hold={reason:note||HOLD_R[1],on:today,t:now,via:"action"};if(t.goAsk)t.goAsk.decided={how:"hold",reason:note||HOLD_R[1],t:now,action:a.id};
        t.update={on:today,by:"Brody",text:"On hold: "+(note||HOLD_R[1])+"."};
      }else if(a.status==="no"){
        if(t.goAsk)t.goAsk.decided={how:"no",t:now,action:a.id};delete t.approvalNeeded;
        th.push({role:"user",text:"No, don't do this: "+(k.what||t.title),t:now});t.update={on:today,by:"Brody",text:"Said no on the board."};
      }else if(a.status==="done"){
        th.push({role:"user",text:"I did this myself: "+(k.what||t.title),t:now});t.update={on:today,by:"Brody",text:"Did it himself."};
        if(!ax51ForTask(t.id).some(function(x){return x!==a&&ax51Live(x)&&x.status!=="held";})){setTaskDone(t,true);t.doneVia="action";logTask(t,"done");}
      }
    }
    var rang=a.status==="go"&&(a.executor==="pc"?ax51Ring(a):ax51Cloud(a));
    delete ax51Note[a.id];delete ax51Hold[a.id];
    save();
    chip(a.status==="go"?(a.executor==="pc"?(rang?"Saved. Ringing your PC now.":"Saved. The PC worker picks it up on its next run."):(rang?"Saved. Claude is starting it now.":"Saved. Claude picks it up at the next check-in.")):a.status==="held"?"On hold.":a.status==="done"?"Marked done.":"Saved. Claude won’t do it.");
  }
  function ax51Undo(id){
    var a=ax51Get(id);if(!a||readOnly)return;
    if(a.status!=="go"||a.claim){chip("Too late to undo: it has already started.",true);render();return;}
    var now=nowISO(),t=a.task&&findTask(a.task);
    (a.log||(a.log=[])).push({at:now,by:"Brody",text:"Undo"});a.status="waiting";delete a.decision;delete a.ring;
    if(t){if(t.approved&&t.approved.action===a.id)delete t.approved;if(t.goAsk&&t.goAsk.decided&&t.goAsk.decided.action===a.id)delete t.goAsk.decided;if(a.resume&&a.resume.kind==="plan")delete t.planOK;
      (t.thread||(t.thread=[])).push({role:"user",text:"Undo: wait, don't start this yet.",t:now});}
    save();chip("Undone. It’s waiting on you again.");
  }
  function ax51RingTask(tid){
    var t=findTask(tid);if(!t||readOnly||!mcp||live.chatSending)return;var ms=Date.now();
    chSend("[Ultron ring PC for task "+t.id+"] Brody pressed Ring the PC now. Push queue/"+t.id+"-"+ms+".json to the pc-queue branch = {\"task\":\""+t.id+"\",\"kind\":\"work\",\"case\":\""+(t.case&&t.case.no||"")+"\",\"ask\":\"\",\"t\":\""+new Date(ms).toISOString()+"\",\"by\":\"Ultron Live chat\"} and do nothing else. Reply \"Rang your PC\" only if the push succeeded.");
    if(t.pcJob)t.pcJob.rang={at:new Date(ms).toISOString()};else if(t.pcLookup)t.pcLookup.rang={at:new Date(ms).toISOString()};
    save();chip("Ringing your PC.");
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-ax],[data-axring]");if(!b)return;
    if(b.dataset.axring){ax51RingTask(b.dataset.axring);return;}
    var id=b.dataset.id,c=b.dataset.ax;
    if(c==="hold"){ax51Hold[id]=HOLD_R[1];render();return;}
    if(c==="holdok"){ax51Decide(id,"hold",ax51Hold[id]||HOLD_R[1]);return;}
    if(c==="undo"){ax51Undo(id);return;}
    if(c==="ring"){var a=ax51Get(id);if(a&&!readOnly&&ax51Ring(a)){save();chip("Ringing your PC again.");}return;}
    ax51Decide(id,c,c==="answer"?ax51Note[id]:"");
  });
  document.addEventListener("input",function(e){var s=e.target;if(s&&s.dataset&&s.dataset.axnote)ax51Note[s.dataset.axnote]=s.value;});
  document.addEventListener("change",function(e){var s=e.target;if(s&&s.dataset&&s.dataset.axhold){ax51Hold[s.dataset.axhold]=s.value;}});
  (function(){
    if(document.getElementById("ax51-css"))return;
    var st=document.createElement("style");st.id="ax51-css";
    st.textContent='.ax51{border-left:3px solid var(--accent)}.ax51 h2 small b{color:var(--accent)}'
      +'.ax51-card{padding:14px 0;border-top:1px solid var(--line)}.ax51-card:first-child{border-top:0}'
      +'.ax51-card.st-go,.ax51-card.st-running{box-shadow:inset 3px 0 0 var(--accent);padding-left:12px}.ax51-card.st-failed{box-shadow:inset 3px 0 0 var(--bad);padding-left:12px}'
      +'.ax51-card.st-done{box-shadow:inset 3px 0 0 var(--ok);padding-left:12px}.ax51-card.st-no,.ax51-card.st-held{opacity:.75}'
      +'.stag.warn{background:var(--warn-soft);color:var(--warn)}'
      +'.ax51-st{margin:8px 0 0;font-size:13px;color:var(--muted)}.ax51-card.st-failed .ax51-st{color:var(--bad)}.ax51-card.st-go .ax51-st,.ax51-card.st-running .ax51-st{color:var(--accent)}'
      +'.ax51-steps{margin:8px 0 0;padding-left:20px;font-size:13.5px}.ax51-steps li{margin:2px 0;overflow-wrap:anywhere}'
      +'.ax51-b{min-height:36px}.ax51-in{min-height:36px;min-width:0;flex:1 1 180px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:6px;background:var(--panel);color:var(--ink);font:inherit;font-size:13px}'
      +'.ax51 .ap-pick select{min-height:36px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:6px;background:var(--panel);color:var(--ink);font-size:13px}'
      +'.ax51-h{margin:16px 0 4px;font-size:13px;font-weight:600;color:var(--muted);text-transform:none}'
      +'.ax51-q{margin-top:14px;border-top:1px solid var(--line);padding-top:10px}.ax51-q summary{cursor:pointer;font-size:13.5px;font-weight:600}.ax51-q summary small{font-weight:400;color:var(--muted)}'
      +'@media(max-width:560px){.ax51 .ap-pick{margin-left:0;width:100%}.ax51 .ap-pick .btn{flex:1 1 auto}}';
    document.head.appendChild(st);
  })();
