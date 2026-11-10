  /* ===== Reply to team requests (Nov 10, patch45; Brody: "you should be able to follow up with team requests when i click reply
     i need you to reply to them"). One Reply window for a Teams message, a task that came from Teams, and the Team tab's
     "You owe" (Reply) and "owes you" (Follow up) items. Claude writes the message as soon as it opens; one press of
     "Send to <name>" posts it in Teams. Nothing is sent without that press. */
  var RP45=null; /* {kind,id,to,first,chatId,ctx,mode,text,busy,err,sending,sent,webUrl} */
  var TEAM_CHAT45="19:539dd505d6464a7d8e7281b2d1758ac6@thread.v2";
  function rp45Chat1to1(name){
    var id="";((state.teamsWatch&&state.teamsWatch.items)||[]).forEach(function(x){if(x.from===name&&x.chat==="1:1"&&twChatId(x))id=twChatId(x);});
    return id;
  }
  function rp45Open(o){
    RP45={kind:o.kind,id:o.id,to:o.to||"",first:(o.to||"them").split(" ")[0],chatId:o.chatId||"",ctx:o.ctx||{},mode:o.mode||"reply",text:"",busy:false,err:"",sending:false,sent:null,webUrl:o.webUrl||""};
    rp45Draw();rp45Draft();
  }
  function rp45FromTw(x){
    var tk=x.taskId&&findTask(x.taskId);
    rp45Open({kind:"tw",id:x.id,to:x.from,chatId:twChatId(x),webUrl:x.webUrl,ctx:{from:x.from,chat:x.chat,on:x.on,message:x.gist,hint:x.hint||"",task:tk?{title:tk.title,note:tk.note,thread:(tk.thread||[]).slice(-3).map(function(m){return m.role+": "+clip(m.text,300);})}:null}});
  }
  function rp45FromTask(t){
    var x=t.teamsItem&&twFind(t.teamsItem);if(x){rp45FromTw(x);return true;}
    var m=/^Reply to (.+?) on Teams/.exec(t.title||"");if(!m)return false;
    rp45Open({kind:"task",id:t.id,to:m[1],chatId:rp45Chat1to1(m[1]),ctx:{from:m[1],task:{title:t.title,note:t.note,why:t.why}}});return true;
  }
  function rp45FromTeam(pid,kind,iid){
    var p=(tm().people||[]).find(function(q){return q.id===pid;});if(!p)return;
    var it=(p[kind]||[]).find(function(y){return y.id===iid;});if(!it)return;
    var cid=rp45Chat1to1(p.name)||(/Lauren|Andrew|Hayden/.test(p.name)?TEAM_CHAT45:"");
    rp45Open({kind:"team",id:pid+"|"+kind+"|"+iid,to:p.name,chatId:cid,mode:kind==="theyOwe"?"follow":"reply",
      ctx:{person:p.name,role:p.role||"",item:it.what,since:it.since||"",source:it.source||"",hint:it.hint||"",recent:(p.recent||[]).slice(0,3).map(function(r){return (r.title||"")+" "+(r.gist||"");})}});
  }
  function rp45Draft(){
    var R=RP45;if(!R)return;
    if(!sampler){R.err="Claude can’t write here yet. Type the reply yourself, or allow Claude for this page.";rp45Draw();return;}
    R.busy=true;R.err="";rp45Draw();
    var job=R.mode==="follow"?"Write Brody's short, friendly Teams follow-up asking where this stands. One or two sentences.":"Write Brody's Teams reply that answers or acts on what they asked.";
    var p=[job,"Brody is the E-Commerce Team Lead at PCI Enterprises and this is a teammate. Teams style: short, friendly, plain words, start with their first name only if it reads naturally, no em dashes, no brackets, no sign-off. Never promise dates, prices, specs or fixes that aren't in the context. If a fact is missing, ask for it or say he'll check.","","CONTEXT:",JSON.stringify(R.ctx),"","Reply with ONLY one JSON object: {\"reply\":\"the message text\"}"].join("\n");
    sampler.json(p,{modelTier:"default",cache:false}).then(function(r){
      if(RP45!==R)return;R.busy=false;var t=(r&&typeof r.reply==="string")?clip(r.reply,1500):"";
      if(t)R.text=t;else R.err="No draft came back. Type it or press Rewrite.";rp45Draw();
    },function(e){if(RP45!==R)return;R.busy=false;R.err=sampleErr(e);rp45Draw();});
  }
  function rp45Draw(){
    var el=document.getElementById("rp45");
    if(!RP45){if(el)el.remove();return;}
    var R=RP45,canSend=!!(mcp&&R.chatId);
    var h='<div class="mailbox" role="dialog" aria-modal="true" aria-label="Reply to '+esc(R.to)+'"><h2>'+(R.mode==="follow"?'Follow up with ':'Reply to ')+esc(R.to)+'<small>'+esc(R.chatId?(R.chatId===TEAM_CHAT45?'in the team chat':'in Teams'):'Teams chat not found: copy it instead')+'</small><button type="button" class="mx" data-rp45x aria-label="Close">×</button></h2>';
    var said=R.ctx.message||R.ctx.item||(R.ctx.task&&R.ctx.task.title)||"";
    if(said)h+='<p class="hint"><b>'+esc(R.mode==="follow"?"They owe you":R.kind==="team"?"You owe":"They said")+':</b> '+esc(clip(said,300))+'</p>';
    if(R.sent)h+='<p class="mok">Sent to '+esc(R.first)+' in Teams.</p>';
    else{
      h+='<textarea class="mbody rp45-t" id="rp45t" placeholder="'+(R.busy?'Claude is writing…':'Type the reply')+'"'+(R.busy?' disabled':'')+'>'+esc(R.text)+'</textarea>';
      if(R.err)h+='<p class="mnote">'+esc(R.err)+'</p>';
      h+='<div class="macts">'+(canSend?'<button type="button" class="btn" data-rp45send'+(R.busy||R.sending?' disabled':'')+'>'+(R.sending?'Sending…':'Send to '+esc(R.first))+'</button>':'')
        +'<button type="button" class="'+(canSend?'linkbtn':'btn')+'" data-rp45copy>Copy and open Teams</button><button type="button" class="linkbtn" data-rp45redo'+(R.busy?' disabled':'')+'>Rewrite</button></div>';
      h+='<p class="hint">Claude wrote this from what they asked. Edit anything, then send. Nothing goes out until you press Send.</p>';
    }
    h+='</div>';
    if(!el){el=document.createElement("div");el.id="rp45";el.className="mailwrap";document.body.appendChild(el);}
    var keep=document.getElementById("rp45t");var cur=keep&&!R.busy?keep.value:null;if(cur!=null)R.text=cur;
    el.innerHTML=h;
    var ta=document.getElementById("rp45t");if(ta&&!R.busy){ta.focus();try{ta.setSelectionRange(ta.value.length,ta.value.length);}catch(e){}}
  }
  function rp45Mark(text){
    var R=RP45,now=new Date().toISOString(),hint="Replied in Teams "+clk(now)+".";
    if(R.kind==="tw"){var x=twFind(R.id);if(x){x.sent={t:now,text:clip(text,1500)};x.hint="Looks handled: you replied in Teams "+clk(now)+".";delete x.replyDraft;var tk=x.taskId&&findTask(x.taskId);if(tk)(tk.thread=tk.thread||[]).push({role:"user",t:now,text:"Replied in Teams: "+clip(text,600)});}}
    else if(R.kind==="task"){var t=findTask(R.id);if(t){(t.thread=t.thread||[]).push({role:"user",t:now,text:"Replied in Teams: "+clip(text,600)});t.update={on:now,by:"Brody",text:hint};}}
    else if(R.kind==="team"){var pr=R.id.split("|"),p=(tm().people||[]).find(function(q){return q.id===pr[0];}),it=p&&(p[pr[1]]||[]).find(function(y){return y.id===pr[2];});if(it){it.hint=(R.mode==="follow"?"Followed up in Teams ":"Replied in Teams ")+clk(now)+".";it.replied={t:now,text:clip(text,600)};}}
    save();
  }
  document.addEventListener("input",function(e){if(e.target&&e.target.id==="rp45t"&&RP45)RP45.text=e.target.value;});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&RP45&&!RP45.sending){RP45=null;rp45Draw();}});
  document.addEventListener("click",function(e){
    var t=e.target;if(!t.closest)return;
    /* entry points (capture: these replace the older draft/email paths for team messages) */
    var a=t.closest("[data-twdraft]");if(a&&!t.closest("#rp45")){var x=twFind(a.dataset.twdraft);if(x){e.preventDefault();e.stopImmediatePropagation();rp45FromTw(x);return;}}
    var mo=t.closest('[data-mailopen="task"]');if(mo){var tk=findTask(mo.dataset.id);if(tk&&(tk.teamsItem||tk.hoKind==="teams"||/ on Teams/.test(tk.title||""))&&rp45FromTask(tk)){e.preventDefault();e.stopImmediatePropagation();return;}}
    var tr=t.closest("[data-rp45team]");if(tr){var q=tr.dataset.rp45team.split("|");e.preventDefault();e.stopImmediatePropagation();rp45FromTeam(q[0],q[1],q[2]);return;}
    var tt=t.closest("[data-rp45task]");if(tt){var tk2=findTask(tt.dataset.rp45task);if(tk2){e.preventDefault();e.stopImmediatePropagation();rp45FromTask(tk2);}return;}
    if(!t.closest("#rp45"))return;
    if(t.closest("[data-rp45x]")||t.id==="rp45"){if(RP45&&!RP45.sending){RP45=null;rp45Draw();if(typeof render==="function")render();}return;}
    if(t.closest("[data-rp45redo]")){rp45Draft();return;}
    if(t.closest("[data-rp45copy]")){var txt=(document.getElementById("rp45t")||{}).value||RP45.text||"";
      try{navigator.clipboard.writeText(txt).then(function(){chip("Copied. Paste it in Teams and press Enter.");},function(){chip("Couldn’t copy. Select the text and copy it.",true);});}catch(er){}
      var u=okHref(RP45.webUrl)&&/^https:\/\/teams\.microsoft\.com\//.test(RP45.webUrl)?RP45.webUrl:"https://teams.microsoft.com/";try{window.open(u,"_blank","noopener");}catch(er2){}return;}
    if(t.closest("[data-rp45send]")){
      var R=RP45,text=String((document.getElementById("rp45t")||{}).value||R.text||"").trim();if(!text||!mcp||!R.chatId||R.sending)return;
      R.text=text;R.sending=true;R.err="";rp45Draw();
      mcp.callTool("Microsoft 365","teams_send_chat_message",{chatId:R.chatId,body:text,bodyType:"text"},{cache:false}).then(function(){
        R.sending=false;R.sent={t:new Date().toISOString()};rp45Mark(text);rp45Draw();chip("Sent to "+R.first+" in Teams.");
        setTimeout(function(){if(RP45===R){RP45=null;rp45Draw();render();}},1600);
      },function(err){R.sending=false;R.err=(err&&err.code==="not_granted")?"Allow Teams sending for this page when it asks, then press Send again.":"Couldn’t send: "+((err&&err.message)?String(err.message).slice(0,120):"try again");rp45Draw();});
    }
  },true);
  /* Reply / Follow up buttons on the Team tab and on Teams tasks */
  function rp45Post(){
    if(view==="team")document.querySelectorAll('main input[data-tmdone]').forEach(function(cb){
      var k=cb.dataset.tmdone,pr=k.split("|");if(pr.length<3)return;var li=cb.closest("li");if(!li||li.querySelector("[data-rp45team]"))return;
      var b=document.createElement("button");b.type="button";b.className="linkbtn rp45b";b.dataset.rp45team=k;b.textContent=pr[1]==="theyOwe"?"Follow up":"Reply";
      (li.querySelector(":scope > div")||li).appendChild(b);
    });
    document.querySelectorAll('main .twp p').forEach(function(q){if(/tap twice/.test(q.textContent))q.textContent='Press Reply on any message: Claude writes your answer and you press Send to post it in Teams.';});
    document.querySelectorAll('main [data-twdraft]').forEach(function(b){if(/Draft/i.test(b.textContent))b.textContent="Reply";});
    document.querySelectorAll('main li.task[data-task], main .dq-card').forEach(function(row){
      if(row.querySelector("[data-rp45task]"))return;
      var id=row.dataset.task||((row.querySelector("[data-opentask]")||{}).dataset||{}).opentask;var tk=id&&findTask(id);
      if(!tk||tk.done||!(tk.teamsItem||/^Reply to .+ on Teams/.test(tk.title||"")))return;
      var acts=row.querySelector(".dq-acts,.meta");if(!acts)return;
      var b=document.createElement("button");b.type="button";b.className="btn rp45b";b.dataset.rp45task=tk.id;b.textContent="Reply";acts.insertBefore(b,acts.firstChild);
    });
  }
  var _render45=render;
  render=function(){_render45.apply(this,arguments);try{rp45Post();}catch(e){}};

