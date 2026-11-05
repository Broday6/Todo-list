  /* ===== Nov 5 build (Brody picked: waiting strip, drafts for every ask, clear the deck, one-tap OK) ===== */
  function nowISO(){return new Date().toISOString();}
  function agoTxt(iso){var m=Math.max(0,Math.round((Date.now()-Date.parse(iso))/60000));return m<60?m+" min":Math.floor(m/60)+" h "+(m%60)+" min";}
  /* --- 1. Waiting on Claude --- */
  function chatPending(){
    var it=chItems(),ans={},ansText={};
    it.forEach(function(m){if(m.role==="claude"&&m.re)ans[m.re]=1;});
    it.forEach(function(m){if(m.role==="user"&&ans[m.id])ansText[String(m.text||"").slice(0,300)]=m.t;});
    return it.filter(function(m){
      if(m.role!=="user"||m.via!=="ultron"||m.dismissed||ans[m.id]||m.err)return false;
      var age=Date.now()-Date.parse(m.t);if(!(age<24*3600000))return false;
      var later=ansText[String(m.text||"").slice(0,300)];if(later&&later>=m.t)return false;
      return true;
    });
  }
  var PROMISE_RE=/\b(I['’]ll|I will|I['’]m going to)\b[^.!?\n]{0,160}?\b(next (run|check-?in)|at the next|later today|this afternoon|tomorrow( morning)?|when (it|they|that) (comes|lands|arrives)|follow up)\b[^.!?\n]*[.!?]?/i;
  function chatPromises(){
    return chItems().filter(function(m){return m.role==="claude"&&!m.quick&&!m.promiseTask&&!m.promiseOff&&Date.now()-Date.parse(m.t)<3*86400000&&PROMISE_RE.test(m.text||"");})
      .map(function(m){return {m:m,s:String((m.text||"").match(PROMISE_RE)[0]).trim()};});
  }
  function waitClaudeHTML(){
    var pend=chatPending(),pr=chatPromises();if(!pend.length&&!pr.length)return '';
    var h='<section class="panel wq" id="sec-waiting"><h2>Waiting on Claude <small>'+(pend.length?'<b>'+pend.length+'</b> not answered yet':'')+(pend.length&&pr.length?' · ':'')+(pr.length?'<b>'+pr.length+'</b> promised':'')+'</small></h2><ul class="wq-list">';
    pend.forEach(function(m){
      var mins=(Date.now()-Date.parse(m.t))/60000,late=mins>=15;
      h+='<li class="'+(late?'late':'')+'"><div class="wq-t">'+esc(clip(String(m.text||"").replace(/^Message from Brody[^\n]*\n\n/,""),140))+'</div><div class="wq-m">Sent '+esc(clk(m.t))+' · waiting '+esc(agoTxt(m.t))+(late?' · <b>No answer yet</b>':'')+'</div><div class="wq-a">'
        +(late&&mcp?'<button type="button" class="btn" data-wqresend="'+esc(m.id)+'">Resend</button>':'')
        +'<button type="button" class="linkbtn" data-view="chat">Live chat</button><button type="button" class="linkbtn" data-wqclear="'+esc(m.id)+'">Clear</button></div></li>';
    });
    pr.forEach(function(x){
      h+='<li class="prom"><div class="wq-t">Claude said: “'+esc(clip(x.s,200))+'”</div><div class="wq-m">'+esc(clk(x.m.t))+' in Live chat. Nothing tracks this yet.</div><div class="wq-a"><button type="button" class="btn" data-wqtrack="'+esc(x.m.id)+'">Track it</button><button type="button" class="linkbtn" data-wqoff="'+esc(x.m.id)+'">Not needed</button></div></li>';
    });
    return h+'</ul></section>';
  }
  function chFindItem(id){var it=chItems();for(var i=0;i<it.length;i++)if(it[i].id===id)return it[i];return null;}
  document.addEventListener("click",function(e){
    var b;
    if((b=e.target.closest("[data-wqresend]"))){var m=chFindItem(b.dataset.wqresend);if(m&&mcp&&!live.chatSending){m.t=nowISO();chFire(m);chip("Sent again.");}return;}
    if((b=e.target.closest("[data-wqclear]"))){var m2=chFindItem(b.dataset.wqclear);if(m2){m2.dismissed=nowISO();save();}return;}
    if((b=e.target.closest("[data-wqoff]"))){var m3=chFindItem(b.dataset.wqoff);if(m3){m3.promiseOff=nowISO();save();}return;}
    if((b=e.target.closest("[data-wqtrack]"))){var m4=chFindItem(b.dataset.wqtrack);if(!m4)return;var s=String((m4.text||"").match(PROMISE_RE)||[""])[0].trim();
      var id="cp-"+Date.now(),t={id:id,group:"now",title:clip("Claude promised: "+s,140),note:"From Live chat "+clk(m4.t)+": "+clip(m4.text,700),due:todayISO(),done:false,since:todayISO(),source:"chat promise",assignee:"claude",claudeStatus:"queued",thread:[{role:"user",text:"Do what you promised in Live chat: "+s,t:nowISO()}]};
      state.tasks.push(t);m4.promiseTask=id;save();chip("Tracked. It’s on your list and queued for Claude’s next check-in.");return;}
  });
  var _chatHTMLBase=chatHTML;chatHTML=function(){return waitClaudeHTML()+_chatHTMLBase();};
  var _focusBase=focusHTML;focusHTML=function(day,isToday){return (isToday?waitClaudeHTML():'')+_focusBase(day,isToday);};
  /* --- quick fixes: label quick answers; stop accidental resends --- */
  var _chSendGuard=chSend,dupArm={};
  chSend=function(text){
    var t=String(text||"").trim();if(!t)return;
    var prev=chItems().filter(function(m){return m.role==="user"&&String(m.text||"").trim()===t.slice(0,4000)&&Date.now()-Date.parse(m.t)<30*60000;}).pop();
    if(prev&&!(dupArm[t]&&Date.now()-dupArm[t]<8000)){dupArm[t]=Date.now();live.nextOrigin="";chip("You sent this at "+clk(prev.t)+". Tap again to send it anyway.");return;}
    delete dupArm[t];return _chSendGuard(text);
  };
  /* --- 3. A draft for every ask: "Draft it" on what you owe people --- */
  function tmPerson(pid){var ps=tm().people;for(var i=0;i<ps.length;i++)if(ps[i].id===pid)return ps[i];return null;}
  function oweMsg(p,list){
    return "Draft emails from me for what I owe "+(p?p.name:"my team")+". For each item below: read the email or Teams thread it came from (its source) and my latest emails with that person, then save a reply or new email in my Outlook Drafts using my email playbook (\"Hey <first name>,\" for PCI people, point first, close \"Thanks,\" then \"Brody\", no signature, no em dashes, never promise dates, prices or fixes not already stated). If an item is really a Teams reply, put a short reply in that person's Team card instead of an email. If an item can't be answered by email, or would ask anyone to change NetSuite or ads, say so and skip it. Never send. Then set draft = {subject, link, t} on each item in state.team.people (person id below) and tell me in Live chat with the draft objects.\n\n"
      +list.map(function(x){return "- person "+x.p.id+" ("+x.p.name+"), item "+x.x.id+": “"+x.x.what+"” (since "+(x.x.since||"?")+", source: "+(x.x.source||"?")+")";}).join("\n");
  }
  var _tmItemsBase=tmItems;
  tmItems=function(p,kind,label){
    var h=_tmItemsBase(p,kind,label);if(kind!=="youOwe")return h;
    tmOpen(p.youOwe).forEach(function(x){
      var key=p.id+"|youOwe|"+x.id,at=h.indexOf('data-tmdone="'+esc(key)+'"');if(at<0)return;var end=h.indexOf('</div></li>',at);if(end<0)return;
      var dl=x.draft&&safeLink(x.draft.link),add='<div class="tm-acts">'+(dl?'<span class="draftready">Draft ready</span> <a class="linkbtn" href="'+esc(dl)+'" target="_blank" rel="noopener">Open in Outlook</a>':'<button type="button" class="linkbtn" data-owedraft="'+esc(p.id+"|"+x.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>Draft it</button>')+'</div>'+progHTML("owe:"+p.id+"|"+x.id);
      h=h.slice(0,end)+add+h.slice(end);
    });
    return h;
  };
  var _teamBase=teamHTML;
  teamHTML=function(){
    var h=_teamBase(),all=[];tm().people.forEach(function(p){tmOpen(p.youOwe).forEach(function(x){if(!(x.draft&&x.draft.link))all.push({p:p,x:x});});});
    if(all.length>1&&mcp)h=h.replace('<div class="tm-grid">','<div class="tm-draftall"><button type="button" class="btn" data-owedraftall="1"'+(live.chatSending?' disabled':'')+'>Draft all '+Math.min(all.length,10)+' you owe</button><span class="hint">Claude saves each one in your Outlook Drafts. Nothing is sent.</span></div>'+progHTML("owe:all")+'<div class="tm-grid">');
    return h;
  };
  document.addEventListener("click",function(e){
    var b;
    if((b=e.target.closest("[data-owedraft]"))){var pr=b.dataset.owedraft.split("|"),p=tmPerson(pr[0]),x=p&&(p.youOwe||[]).filter(function(y){return y.id===pr[1];})[0];if(!x||!mcp||live.chatSending)return;progSend("owe:"+p.id+"|"+x.id,oweMsg(p,[{p:p,x:x}]));return;}
    if((b=e.target.closest("[data-owedraftall]"))){if(!mcp||live.chatSending)return;var all=[];tm().people.forEach(function(p){tmOpen(p.youOwe).forEach(function(x){if(!(x.draft&&x.draft.link))all.push({p:p,x:x});});});progSend("owe:all",oweMsg(null,all.slice(0,10)));return;}
  });
  var _twSendBase=twSendBtn;
  twSendBtn=function(x){var h=_twSendBase(x);if(!h&&mcp&&x&&x.replyDraft&&!twChatId(x))h='<span class="hint tw-nolink">No chat link for this one, so copy the draft and send it in Teams.</span>';return h;};
  /* --- 4. Clear the deck --- */
  var deckSel={},deckAll=false;
  function pushedN(t){var n=0;Object.keys(state.days||{}).forEach(function(d){if(d>=todayISO())return;var hit=(state.days[d].blocks||[]).some(function(b){return !b.done&&(b.taskIds||[]).indexOf(t.id)>=0&&!b.carriedFrom;});if(hit)n++;});return n;}
  function deckList(){
    var today=todayISO();
    return state.tasks.filter(function(t){return !t.done&&t.due&&t.due<today&&t.group!=="bugherd"&&t.group!=="cases"&&t.group!=="frozen"&&t.group.indexOf("idea")!==0&&t.assignee!=="claude";})
      .map(function(t){return {t:t,n:pushedN(t)};}).sort(function(a,b){return b.n-a.n||(a.t.due<b.t.due?-1:1);});
  }
  function deckHTML(){
    var L=deckList();if(!L.length)return '';
    var shown=deckAll?L:L.slice(0,10),sel=Object.keys(deckSel).filter(function(k){return deckSel[k];}).length;
    var h='<section class="panel deck" id="sec-deck"><h2>Clear the deck <small><b>'+L.length+'</b> overdue · most pushed first</small></h2>';
    h+='<div class="deck-bar"><label class="toggle"><input type="checkbox" data-deckall="1"'+(sel&&sel>=shown.length?' checked':'')+'> Select all</label>'
      +'<button type="button" class="btn" data-deckdo="done"'+(sel?'':' disabled')+'>Done'+(sel?' ('+sel+')':'')+'</button>'
      +'<button type="button" class="btn ghost" data-deckdo="drop"'+(sel?'':' disabled')+'>Not needed</button>'
      +'<span class="deck-mv"><input type="date" id="deckdate" value="'+esc(nextWorkday())+'" aria-label="Move to date"><button type="button" class="btn ghost" data-deckdo="move"'+(sel?'':' disabled')+'>Move</button></span></div><ul class="deck-list">';
    shown.forEach(function(x){var t=x.t,age=daysBetween(t.due,todayISO());
      h+='<li><input type="checkbox" class="chk" data-decksel="'+esc(t.id)+'"'+(deckSel[t.id]?' checked':'')+' aria-label="Select '+esc(t.title)+'"><div><div class="deck-t"><button type="button" class="tx" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,110))+'</button></div><div class="deck-m">Due '+esc(shortDate(t.due))+' · '+age+' days late'+(x.n?' · <b>pushed '+x.n+'×</b>':'')+(t.from?' · '+esc(t.from):'')+'</div></div></li>';});
    h+='</ul>'+(L.length>10?'<button type="button" class="tx" data-deckmore="1">'+(deckAll?'Show fewer':'Show all '+L.length)+'</button>':'')+'</section>';
    return h;
  }
  document.addEventListener("change",function(e){var el=e.target;
    if(el.dataset&&el.dataset.decksel){deckSel[el.dataset.decksel]=el.checked;render();return;}
    if(el.dataset&&el.dataset.deckall){var L=deckList(),shown=deckAll?L:L.slice(0,10);shown.forEach(function(x){deckSel[x.t.id]=el.checked;});render();return;}
  });
  document.addEventListener("click",function(e){var b;
    if((b=e.target.closest("[data-deckmore]"))){deckAll=!deckAll;render();return;}
    if((b=e.target.closest("[data-deckdo]"))){var how=b.dataset.deckdo,ids=Object.keys(deckSel).filter(function(k){return deckSel[k];}),n=0,dt=(document.getElementById("deckdate")||{}).value||nextWorkday();
      ids.forEach(function(id){var t=findTask(id);if(!t||t.done)return;n++;
        if(how==="move"){t.due=dt;t.update={on:todayISO(),by:"Brody",text:"Moved to "+shortDate(dt)+" in Clear the deck."};return;}
        t.update={on:todayISO(),by:"Brody",text:how==="drop"?"Marked not needed in Clear the deck.":"Marked done in Clear the deck."};logTask(t,how);setTaskDone(t,true);
        if(how==="drop"){t.doneVia="dropped";t.dropped={on:todayISO(),t:nowISO(),title:t.title,from:t.from||"",subject:(t.mail&&t.mail.subject)||""};}else{t.doneVia="deck";}
      });
      deckSel={};if(n){save();chip((how==="move"?"Moved ":how==="drop"?"Let go of ":"Closed ")+n+" task"+(n>1?"s":"")+".");}return;}
  });
  var _cuBase=cuHTML;cuHTML=function(){return deckHTML()+_cuBase();};
  /* --- BugHerd: Not needed also closes it in BugHerd (Brody, Nov 5) --- */
  var _closeTaskBase=closeTask;
  closeTask=function(t,how){_closeTaskBase(t,how);if(how==="drop"&&t&&t.group==="bugherd"&&t.bh&&!t.bh.closeAsk){bhCloseQueue(t);save();}};
  /* --- 2. One-tap OK: NetSuite fix sets get a copy-ready PC prompt once approved; ads decisions get OK buttons --- */
  var _claudeBoxBase=claudeBox;
  claudeBox=function(t){
    var h=_claudeBoxBase(t);
    if(t&&t.approved&&t.approved.system==="netsuite"&&t.pcOnly&&!t.done)
      h+='<div class="claudebox okask"><p class="csum"><strong>Approved '+esc(shortDate(String(t.approved.t).slice(0,10)))+'.</strong> NetSuite imports run in Claude on your PC (it needs your NetSuite login). Paste this there:</p><div class="cacts"><button type="button" class="btn" data-pccopy="'+esc(t.id)+'">Copy PC prompt</button></div></div>';
    return h;
  };
  function pcPrompt(t){return "Ultron task "+t.id+" (“"+t.title+"”) has my OK, approved "+t.approved.t+": "+t.approved.what+"\nUse the netsuite skills. Open the NOT-IMPORTED file the daily alert run built for it, show me the preview (row count and a few old → new examples), and import only after I confirm on screen. Then post what changed in that task's thread on Ultron.";}
  document.addEventListener("click",function(e){var b=e.target.closest("[data-pccopy]");if(!b)return;var t=findTask(b.dataset.pccopy);if(!t||!t.approved)return;var txt=pcPrompt(t);
    (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){chip("Copied. Paste it into Claude on your PC.");},function(){draftBox={text:txt,label:"PC prompt"};render();});});
  function adDecList(){var a=state.ads,dc=a&&a.cuts&&a.cuts.decide;return dc&&Array.isArray(dc.items)?dc.items:[];}
  document.addEventListener("click",function(e){var b=e.target.closest("[data-adok]");if(!b)return;
    var i=+b.dataset.adok,x=adDecList()[i];if(!x)return;var yes=b.dataset.v==="ok";
    if(!yes){x.no={t:nowISO()};save();chip("Noted: not now.");return;}
    var owner=((state.ads.owners||{})[x.g])||"the group owner",id="ad-"+Date.now();
    x.ok={t:nowISO(),taskId:id};
    state.tasks.push({id:id,group:"now",title:clip("Ads OK'd: "+x.text,140),note:"You OK'd this exact change on the Ads tab ("+x.g+", about "+adMoney(x.amt)+" through Dec 31). Claude drafts the change request to "+owner+" in your Outlook Drafts; you send it.",due:todayISO(),done:false,since:todayISO(),source:"ads decision",assignee:"claude",claudeStatus:"queued",
      approved:{what:x.text,system:"ads",t:nowISO()},thread:[{role:"user",text:"OK, go ahead with exactly this change: "+x.text+". Draft the request to "+owner+" (Outlook draft, I send it).",t:nowISO()}]});
    save();chip("Approved. Claude drafts the request to "+owner+" at the next check-in.");});
  function adDecPatch(h){
    var items=adDecList();if(!items.length)return h;
    items.forEach(function(x,i){
      var needle='<div class="qt">'+esc(x.text)+'</div>',at=h.indexOf(needle);if(at<0)return;var end=h.indexOf('</div></div></li>',at);if(end<0)return;
      var st=x.ok?'<span class="draftready">Approved '+esc(clk(x.ok.t))+'</span>':x.no?'<span class="mut">Not now</span>':'<button type="button" class="btn" data-adok="'+i+'" data-v="ok">OK this change</button><button type="button" class="linkbtn" data-adok="'+i+'" data-v="no">Not now</button>';
      h=h.slice(0,end)+'<div class="ad-okrow">'+st+'</div>'+h.slice(end);
    });
    return h;
  }

  /* PC-only approvals: OK records the approval and shows the PC prompt instead of queuing a cloud run that can't reach the files */
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-approve]");if(!b)return;var t=findTask(b.dataset.approve);if(!t||!t.pcOnly||!t.approvalNeeded)return;
    e.stopImmediatePropagation();e.preventDefault();var aw=t.approvalNeeded.what;t.approved={what:aw,system:t.approvalNeeded.system,t:nowISO()};delete t.approvalNeeded;if(!t.thread)t.thread=[];t.thread.push({role:"user",text:"OK, go ahead: "+aw,t:nowISO()});t.claudeStatus="ready";save();chip("Approved. Press Copy PC prompt and paste it into Claude on your PC.");},true);
  var _adsTabBase=adsTabHTML;adsTabHTML=function(){return adDecPatch(_adsTabBase());};
