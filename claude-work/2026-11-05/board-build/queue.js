  /* ===== Do now (Nov 6, Brody: "it still isn't great, not super easy to use and doesn't help me all that much;
     we need to make sure the actions work well with it"). Today opens on ONE list of decisions. Every card has one
     main button that finishes the job right there (no jumping to another tab), using the same handlers the tabs use:
     closeTask (with Undo), data-approve/deny, data-bhsend, data-owedraft, data-twdraft, data-pktake, giveToClaude. */
  var dqFilter="all",dqAll=false,dqOpen={};
  function dqTaskOK(t){return t&&!t.done&&!/^idea/.test(t.group||"")&&t.group!=="frozen";}
  function dqItems(){
    var out=[],today=todayISO();
    state.tasks.forEach(function(t){
      if(!dqTaskOK(t))return;
      var mine=t.assignee==="claude",r=rcOf(t);
      if(t.approvalNeeded&&!t.approved){out.push({k:"decide",rank:0,t:t,tag:"Your OK",title:t.title,ctx:"Claude is waiting for your OK: "+clip(t.approvalNeeded.what,220),
        main:'<button type="button" class="btn" data-approve="'+esc(t.id)+'">OK, go ahead</button>',more:'<button type="button" class="linkbtn" data-deny="'+esc(t.id)+'">No, stop</button>'});return;}
      if(t.question&&!t.answer){out.push({k:"decide",rank:1,t:t,tag:"Answer",title:clip(t.question,200),ctx:t.title,
        input:'<textarea data-bhq="'+esc(t.id)+'" rows="2" placeholder="Type your answer. Claude starts working as soon as you send it."></textarea>',
        main:'<button type="button" class="btn" data-bhsend="'+esc(t.id)+'"'+(live.chatSending?' disabled':'')+'>Send to Claude</button>',prog:progKey("ans",t.id)});return;}
      if(mine&&t.claudeStatus==="blocked"&&!t.approvalNeeded){var q=(r&&r.left)||t.needs||"Claude is stuck on this one.";out.push({k:"decide",rank:2,t:t,tag:"Claude asks",title:t.title,ctx:clip(q,240),
        input:'<textarea data-dqtext="'+esc(t.id)+'" rows="2" placeholder="Your answer or the go-ahead. Claude picks it back up right away."></textarea>',
        main:'<button type="button" class="btn" data-dqans="'+esc(t.id)+'"'+(live.chatSending?' disabled':'')+'>Send to Claude</button>',more:'<button type="button" class="linkbtn" data-dqdone="'+esc(t.id)+'">Mark done</button>',prog:progKey("do",t.id)});return;}
      if(r&&r.status==="done"){out.push({k:"claude",rank:3,t:t,tag:"✓ Done by Claude",title:t.title,ctx:(r.summary||"")+(r.left?" Left for you: "+r.left:""),when:r.at,where:r.where,
        main:'<button type="button" class="btn" data-dqdone="'+esc(t.id)+'">Looks good, mark done</button>',more:'<button type="button" class="linkbtn" data-dqfu="'+esc(t.id)+'">Follow up</button>'});return;}
      if(mine&&(t.claudeStatus==="queued"))return;
      if(t.outlookDraft&&okHref(t.outlookDraft.link)){out.push({k:"reply",rank:4,t:t,tag:"Draft ready",title:clip(t.outlookDraft.subject||t.title,140),ctx:"In your Outlook Drafts"+(t.outlookDraft.toNames?" · to "+[].concat(t.outlookDraft.toNames).join(", "):"")+". Read it, send it from Outlook, then mark it sent.",
        main:'<a class="btn" href="'+esc(t.outlookDraft.link)+'" target="_blank" rel="noopener">Open draft</a>',more:'<button type="button" class="linkbtn" data-dqdone="'+esc(t.id)+'">I sent it</button>'});return;}
      if(t.mail&&t.reply&&t.reply.state!=="replied"&&t.reply.state!=="none"&&!t.reply.link&&t.group!=="bugherd"){out.push({k:"reply",rank:5,t:t,tag:"Needs a reply",title:t.title,ctx:(t.mail.from?"From "+t.mail.from+" · ":"")+clip(t.mail.subject||"",120),
        main:'<button type="button" class="btn" data-dqgive="'+esc(t.id)+'"'+(mcp?'':' disabled')+'>Have Claude draft it</button>',more:'<button type="button" class="linkbtn" data-dqdone="'+esc(t.id)+'">Already handled</button>'});return;}
      if(t.due&&t.due<=today&&!mine&&t.group!=="bugherd"){var late=daysBetween(t.due,today);out.push({k:"due",rank:late>0?6:7,t:t,tag:late>0?late+(late>1?" days late":" day late"):"Due today",title:t.title,ctx:clip(t.note||"",200),late:late,
        main:'<button type="button" class="btn" data-dqdone="'+esc(t.id)+'">Done</button>',more:'<button type="button" class="linkbtn" data-dqgive="'+esc(t.id)+'"'+(mcp?'':' disabled')+'>Give to Claude</button><button type="button" class="linkbtn" data-dqmove="'+esc(t.id)+'">Tomorrow</button><button type="button" class="linkbtn" data-dqdrop="'+esc(t.id)+'">Not needed</button>'});}
    });
    tm().people.forEach(function(p){tmOpen(p.youOwe).forEach(function(x){var dl=x.draft&&safeLink(x.draft.link);
      out.push({k:"reply",rank:5.5,tag:"You owe "+p.short,title:x.what,ctx:(x.since?"Since "+shortDate(x.since)+" · ":"")+(x.source||""),
        main:dl?'<a class="btn" href="'+esc(dl)+'" target="_blank" rel="noopener">Open draft</a>':'<button type="button" class="btn" data-owedraft="'+esc(p.id+"|"+x.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>Have Claude draft it</button>',
        more:'<button type="button" class="linkbtn" data-tmdone="'+esc(p.id+"|youOwe|"+x.id)+'">Done</button>',prog:"owe:"+p.id+"|"+x.id});});});
    twS().items.forEach(function(x){if(x.done||x.kind==="fyi")return;var tk=x.taskId&&findTask(x.taskId);if(tk&&!tk.done)return;
      var draft=x.replyDraft?'<textarea class="tw-rt" data-twrt="'+esc(x.id)+'" rows="3">'+esc(x.replyDraft)+'</textarea>':'';
      out.push({k:"reply",rank:5.8,tag:"Teams",title:(x.from||"")+": "+(x.gist||""),ctx:(x.chat||"1:1")+" · "+twWhen(x.on),input:draft,
        main:x.replyDraft?(twSendBtn(x)||'<button type="button" class="btn" data-twdone="'+esc(x.id)+'">Got it</button>'):(sampler?'<button type="button" class="btn" data-twdraft="'+esc(x.id)+'">Draft a reply</button>':'<button type="button" class="btn" data-twdone="'+esc(x.id)+'">Got it</button>'),
        more:x.replyDraft||!sampler?'':'<button type="button" class="linkbtn" data-twdone="'+esc(x.id)+'">Got it</button>'});});
    out.sort(function(a,b){return a.rank-b.rank||((b.late||0)-(a.late||0));});
    return out;
  }
  var DQ_TABS=[["all","Everything"],["decide","Decide"],["claude","Claude finished"],["reply","Replies"],["due","Due"]];
  function dqCard(x){
    var t=x.t,id=t?t.id:"";
    var h='<li class="dq-card dq-'+x.k+'"><div class="dq-top"><span class="dq-tag">'+esc(x.tag)+'</span>'+(x.when?'<span class="rc-when">'+esc(rcWhen(x.when))+'</span>':'')+'</div>';
    h+=t?'<button type="button" class="dq-title" data-dqopen="'+esc(id)+'" aria-expanded="'+(!!dqOpen[id])+'">'+esc(clip(x.title,200))+'</button>':'<div class="dq-title">'+esc(clip(x.title,200))+'</div>';
    if(x.ctx)h+='<p class="dq-ctx">'+esc(x.ctx)+'</p>';
    if(x.where&&x.where.length)h+=rcWhere(x.where.slice(0,4));
    if(x.input)h+='<div class="dq-in">'+x.input+'</div>';
    h+='<div class="dq-acts">'+x.main+(x.more||'')+(t?'<button type="button" class="tx dq-more" data-dqopen="'+esc(id)+'">'+(dqOpen[id]?'Hide details':'Details')+'</button>':'')+'</div>';
    if(x.prog)h+=progHTML(x.prog);
    if(t&&dqOpen[id]){openTasks[id]=true;h+='<ul class="tasks dq-full">'+taskRow(t)+'</ul>';}
    return h+'</li>';
  }
  function dqHTML(){
    var all=dqItems(),cnt={};all.forEach(function(x){cnt[x.k]=(cnt[x.k]||0)+1;});
    var list=dqFilter==="all"?all:all.filter(function(x){return x.k===dqFilter;});
    var shown=dqAll?list:list.slice(0,8);
    var working=state.tasks.filter(function(t){return !t.done&&t.assignee==="claude"&&t.claudeStatus==="queued";});
    var h='<section class="panel dq" id="sec-dq"><div class="dq-head"><h2>Do now</h2><p class="dq-sum">'+(all.length?'<b>'+all.length+'</b> thing'+(all.length>1?'s':'')+' for you'+(cnt.decide?' · <b>'+cnt.decide+'</b> waiting on your call':'')+(cnt.claude?' · <b>'+cnt.claude+'</b> finished by Claude':''):'You’re clear. Nothing needs you right now.')+'</p></div>';
    h+='<div class="dq-tabs" role="tablist">'+DQ_TABS.map(function(d){var n=d[0]==="all"?all.length:(cnt[d[0]]||0);if(d[0]!=="all"&&!n)return '';return '<button type="button" role="tab" class="dq-tab'+(dqFilter===d[0]?' on':'')+'" data-dqf="'+d[0]+'" aria-selected="'+(dqFilter===d[0])+'">'+d[1]+' <span>'+n+'</span></button>';}).join("")+'</div>';
    if(working.length)h+='<p class="dq-working"><span class="live" aria-hidden="true"></span>Claude is working on '+working.length+': '+working.slice(0,3).map(function(t){return '<button type="button" class="tx" data-dqopen="'+esc(t.id)+'">'+esc(clip(t.title,50))+'</button>';}).join(", ")+(working.length>3?' and '+(working.length-3)+' more':'')+'</p>';
    h+=shown.length?'<ul class="dq-list">'+shown.map(dqCard).join("")+'</ul>':'<p class="empty">Nothing here.</p>';
    if(list.length>8)h+='<button type="button" class="btn ghost dq-all" data-dqall="1">'+(dqAll?'Show fewer':'Show all '+list.length)+'</button>';
    return h+'</section>';
  }
  function dqSendAnswer(t,txt){
    if(!t.thread)t.thread=[];var now=new Date().toISOString();
    t.thread.push({role:"user",text:"Answer: "+txt,t:now});t.brief=clip(txt,2000);
    var q=t.needs||(t.receipt&&t.receipt.left)||"";delete t.needs;if(t.receipt)t.receipt.status="answered";
    t.claudeStatus="queued";t.doSentAt=now;
    progSend(progKey("do",t.id),doMsg(t)+"\n\nMy answer"+(q?" to “"+clip(q,200)+"”":"")+": "+txt+"\nPick it up from where you stopped and finish it.");
  }
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-dqf],[data-dqall],[data-dqopen],[data-dqdone],[data-dqdrop],[data-dqmove],[data-dqgive],[data-dqans],[data-dqfu]");if(!b)return;
    var d=b.dataset,t;
    if(d.dqf){dqFilter=d.dqf;dqAll=false;render();return;}
    if(d.dqall){dqAll=!dqAll;render();return;}
    if(d.dqopen){var id=d.dqopen;dqOpen[id]=!dqOpen[id];if(!dqOpen[id])delete openTasks[id];render();return;}
    if(d.dqdone){t=findTask(d.dqdone);if(t){delete dqOpen[t.id];closeTask(t,"done");}return;}
    if(d.dqdrop){t=findTask(d.dqdrop);if(t){delete dqOpen[t.id];closeTask(t,"drop");}return;}
    if(d.dqmove){t=findTask(d.dqmove);if(t){var was=t.due;t.due=nextWorkday(todayISO());t.update={on:todayISO(),by:"Brody",text:"Moved to "+shortDate(t.due)+"."};save();chip("Moved to "+shortDate(t.due)+".");}return;}
    if(d.dqgive){t=findTask(d.dqgive);if(t){if(!mcp){chip("Claude can’t be reached from this view. Try again in the app.",true);return;}giveToClaude(t);save();}return;}
    if(d.dqans){t=findTask(d.dqans);if(!t)return;var ta=b.closest("li").querySelector('textarea[data-dqtext]');var v=String(ta&&ta.value||"").trim();
      if(!v){chip("Type your answer first.",true);if(ta)ta.focus();return;}
      if(!mcp){t.brief=clip(v,2000);(t.thread||(t.thread=[])).push({role:"user",text:"Answer: "+v,t:new Date().toISOString()});t.claudeStatus="queued";save();chip("Saved. The next check-in picks it up.");return;}
      if(live.chatSending){chip("Claude is still sending the last request. Try again in a few seconds.",true);return;}
      dqSendAnswer(t,v);save();chip("Sent. Claude is on it.");return;}
    if(d.dqfu){t=findTask(d.dqfu);if(!t)return;dqOpen[t.id]=true;render();setTimeout(function(){var li=document.querySelector('[data-dqopen="'+t.id.replace(/"/g,'\\"')+'"]');li=li&&li.closest("li.dq-card");var ta=li&&li.querySelector(".dq-full .threadrow textarea, .dq-full textarea");if(ta){ta.focus();ta.scrollIntoView({block:"center",behavior:"smooth"});}},60);return;}
  });
  /* Today: Do now first, then Now/Next and the plan. The separate Waiting / Done by Claude / Picks / Needs you panels fold into it. */
  var _focusDq=focusHTML;
  focusHTML=function(day,isToday){var h=_focusDq(day,isToday);if(!isToday)return h;
    [waitClaudeHTML(),doneByClaudeHTML(),picksHTML()].forEach(function(s){if(s)h=h.replace(s,"");});
    var p=picksHTML(),pk=p?'<details class="panel dq-picks"><summary>Claude can take '+picksList().length+' more task'+(picksList().length>1?'s':'')+' for you</summary>'+p.replace(/^<section[^>]*>/,"").replace(/<\/section>$/,"")+'</details>':'';
    var w=waitClaudeHTML();
    return '<div class="dq-wrap"><div class="dq-main">'+dqHTML()+'</div><div class="dq-side">'+h+(w?'<div class="dq-wait">'+w+'</div>':'')+pk+'</div></div>';};
  var _nyTopDq=nyTopHTML;
  nyTopHTML=function(){if(view==="today"||!view){var other=nyItems().filter(function(x){return x.k==="auto"||x.k==="promo"||x.k==="clean"||x.k==="strety";});if(!other.length)return '';
    return '<section class="panel nytop"><h2>Also on your radar</h2><ul class="ny2">'+other.map(function(x){return '<li class="ny2-'+x.k+'"><span class="stag">'+NY_TAG[x.k]+'</span><div><div class="ny2-t">'+esc(x.t)+'</div>'+(x.m?'<div class="tm-m">'+esc(x.m)+'</div>':'')+'</div>'+x.act+'</li>';}).join("")+'</ul></section>';}
    return _nyTopDq();};
