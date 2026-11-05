  /* ==================== Nov 5 build: automate anything, Strety, Teams replies, email replies ==================== */
  var RULES_LINE="Rules: email and Teams replies are drafts only (Outlook Drafts, or reply text in the board for Teams; never post in Teams); BugHerd comments are labelled \"Draft comment, not posted\"; never change NetSuite or Ads without my OK for that exact change; never set task.done.";
  /* ---- Have Claude do it now (any task) ---- */
  function doMsg(t){
    var w=whereFrom(t);
    return "Do task "+t.id+" now: “"+t.title+"”."+(t.note?"\nNote: "+clip(t.note,500):"")+(w.length?"\nWhere it came from: "+w.join("; "):"")+
      "\n\nWork it end to end as far as the rules allow, using my email, Teams, Notion and Asana for context. "+RULES_LINE+" If part of it needs my call, ask one clear question and put it in task.needs. Then set task.assignee to \"claude\", task.claudeStatus to \"ready\" (or \"blocked\" when you need me), task.update to what you did, push the same summary into the task thread, and tell me in Live chat.";
  }
  document.addEventListener("click",function(e){
    var d=e.target.closest("[data-doit]");if(!d)return;
    var t=findTask(d.dataset.doit);if(!t||!mcp||live.chatSending)return;
    t.doSentAt=new Date().toISOString();progSend(progKey("do",t.id),doMsg(t));
  });
  function doItHTML(t){
    if(t.done)return '';
    return '<button type="button" class="btn doit" data-doit="'+esc(t.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+' title="Claude works it right now in a fresh session with your email, Teams and Notion. Drafts only.">⚡ Have Claude do it now</button>';
  }
  /* ---- Strety (from the Monday "Your weekly check-in is ready" email) ---- */
  function st(){var s=state.strety;if(!s||typeof s!=="object")s=state.strety={rocks:[],scorecard:[],todos:[],milestones:[]};["rocks","scorecard","todos","milestones"].forEach(function(k){if(!Array.isArray(s[k]))s[k]=[];});return s;}
  function stDue(x){if(!x.due)return '';var n=daysBetween(todayISO(),x.due);return '<span class="badge'+(n<0?' over':n<=7?' soon':'')+'">'+(n<0?Math.abs(n)+'d overdue':'due '+shortDate(x.due))+'</span>';}
  function stRow(x,kind){
    var tk=x.taskId&&findTask(x.taskId);
    var h='<li class="st-row'+(x.done?' done':'')+'"><div class="st-main"><div class="st-t">'+(okHref(x.url)?'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.title)+'</a>':esc(x.title))+'</div><div class="tm-m">'+esc(x.team||"")+(x.target?' · target '+esc(x.target):'')+'</div></div><div class="st-side">'+stDue(x);
    if(kind!=="scorecard"){
      h+=(tk?'<button type="button" class="linkbtn" data-opentask="'+esc(tk.id)+'">Open task</button>':'<button type="button" class="linkbtn" data-sttask="'+esc(kind+":"+x.id)+'">Make a task</button>');
      h+='<button type="button" class="linkbtn doit-s" data-stdo="'+esc(kind+":"+x.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>⚡ Claude</button>';
    }
    h+='</div>'+progHTML(progKey("st",kind+":"+x.id))+'</li>';
    return h;
  }
  function stretyHTML(){
    var s=st(),today=todayISO(),od=s.todos.filter(function(x){return !x.done&&x.due&&x.due<today;}).length;
    var h='<section class="glance qglance" aria-label="Strety at a glance">'+qCard("Rocks",String(s.rocks.length+(s.more&&s.more.rocks||0)),"due "+(s.rocks[0]&&s.rocks[0].due?shortDate(s.rocks[0].due):"Q1"))+qCard("To-dos",String(s.todos.length+(s.more&&s.more.todos||0)),od+" overdue",od?"bad":"")+qCard("Scorecard",String(s.scorecard.length+(s.more&&s.more.scorecard||0)),"measurables")+qCard("Milestones",String(s.milestones.length+(s.more&&s.more.milestones||0)),"on your Rocks")+'</section>';
    h+='<div class="qcols"><div class="qmainc">';
    h+='<section class="panel"><h2>To-dos <small>'+(od?'<b>'+od+'</b> overdue · ':'')+'oldest first</small></h2><p class="hint">Make a task puts it on your list. ⚡ Claude works it now (drafts only) and tells you what’s left. Close it in Strety when it’s done.</p><ul class="st-list">'+s.todos.slice().sort(function(a,b){return (a.due||"9")<(b.due||"9")?-1:1;}).map(function(x){return stRow(x,"todos");}).join("")+'</ul>'+(s.more&&s.more.todos?'<p class="hint" style="margin:8px 0 0">+ '+s.more.todos+' more in Strety (the email only lists the first few). <a href="'+esc(s.home||"https://2.strety.com")+'" target="_blank" rel="noopener">Open Strety</a></p>':'')+'</section>';
    h+='<section class="panel"><h2>Rocks <small>this quarter</small></h2><ul class="st-list">'+s.rocks.map(function(x){return stRow(x,"rocks");}).join("")+'</ul><h3 class="st-h3">Milestones</h3><ul class="st-list">'+s.milestones.map(function(x){return stRow(x,"milestones");}).join("")+'</ul></section>';
    h+='</div><div class="qside">';
    h+='<section class="panel"><h2>Scorecard <small>your measurables</small></h2><ul class="st-list">'+s.scorecard.map(function(x){return stRow(x,"scorecard");}).join("")+'</ul>'+(s.more&&s.more.scorecard?'<p class="hint" style="margin:8px 0 0">+ '+s.more.scorecard+' more in Strety.</p>':'')+'</section>';
    h+='<section class="panel"><h2>Where this comes from</h2><p class="hint" style="margin:0">Strety has no connector, so this is read from Strety’s Monday “Your weekly check-in is ready” email'+(s.asOf?' ('+esc(shortDate(String(s.asOf).slice(0,10)))+')':'')+'. The Monday morning rebuild refreshes it. Statuses are changed in Strety itself.</p><div class="cacts" style="margin-top:10px">'+(okHref(s.home)?'<a class="btn" href="'+esc(s.home)+'" target="_blank" rel="noopener">Open Strety</a>':'')+(okHref(s.emailLink)?'<a class="linkbtn" href="'+esc(s.emailLink)+'" target="_blank" rel="noopener">✉ The check-in email</a>':'')+'</div></section>';
    h+='</div></div>';
    return h;
  }
  function stFind(key){var p=key.split(":"),s=st(),l=s[p[0]]||[];for(var i=0;i<l.length;i++)if(l[i].id===p[1])return l[i];}
  document.addEventListener("click",function(e){
    var a=e.target.closest("[data-sttask]");
    if(a){var x=stFind(a.dataset.sttask);if(!x)return;var t={id:"st"+Date.now().toString(36),group:"now",title:clip(x.title,120),note:"Strety "+(a.dataset.sttask.split(":")[0]==="rocks"?"Rock":"to-do")+(x.team?" · "+x.team:"")+(x.due?" · due "+x.due:""),due:(x.due&&x.due>=todayISO())?x.due:todayISO(),done:false,since:todayISO(),source:"Strety",sourceLink:okHref(x.url)?x.url:undefined};state.tasks.push(t);x.taskId=t.id;save();chip("Added to This week.");return;}
    var b=e.target.closest("[data-stdo]");
    if(b){var y=stFind(b.dataset.stdo);if(!y||!mcp||live.chatSending)return;
      progSend(progKey("st",b.dataset.stdo),"Work this Strety item now: “"+y.title+"” ("+(y.team||"")+(y.due?", due "+y.due:"")+(y.url?", "+y.url:"")+"). Find the context in my email, Teams and Notion, do what you can as drafts, and tell me in Live chat what is done and what is left. "+RULES_LINE+" Strety itself has no connector, so don't claim anything was changed there.");}
  });
  /* ---- Teams: draft a reply (in-page Claude) + Claude handles it ---- */
  var twDraft={id:null,busy:false,err:""};
  function twReplyHTML(x){
    if(x.done)return '';
    var h='<div class="tw-r">';
    if(x.replyDraft){h+='<textarea class="tw-rt" data-twrt="'+esc(x.id)+'" aria-label="Reply to '+esc(x.from||"")+'">'+esc(x.replyDraft)+'</textarea><div class="cacts"><button type="button" class="btn" data-twcopy="'+esc(x.id)+'">Copy and open Teams</button><button type="button" class="linkbtn" data-twdraft="'+esc(x.id)+'">Redo</button></div>';}
    if(twDraft.busy&&twDraft.id===x.id)h+='<div class="thinking">Drafting…</div>';
    if(twDraft.err&&twDraft.id===x.id)h+='<div class="askerr">'+esc(twDraft.err)+'</div>';
    return h+'</div>';
  }
  function runTwDraft(id){
    var x=twFind(id);if(!x||!sampler||twDraft.busy)return;twDraft={id:id,busy:true,err:""};render();
    var tk=x.taskId&&findTask(x.taskId);
    var p=["Draft Brody's Teams reply. Brody is the E-Commerce Team Lead at PCI Enterprises. Teams style: short, friendly, plain words, no greeting line needed for a 1:1, no em dashes, no brackets, never promise dates, prices or fixes he hasn't stated. If you lack a fact, write the reply so it asks for it or says he'll check.","","MESSAGE:",JSON.stringify({from:x.from,chat:x.chat,on:x.on,gist:x.gist,hint:x.hint||"",task:tk?{title:tk.title,note:tk.note}:null}),"","Reply with ONLY one JSON object: {\"reply\":\"the message text\"}"].join("\n");
    sampler.json(p,{modelTier:"default",cache:false}).then(function(r){twDraft.busy=false;var t=(r&&typeof r.reply==="string")?clip(r.reply,1500):"";if(t)x.replyDraft=t;else twDraft.err="No draft came back.";save();},function(e){twDraft.busy=false;twDraft.err=sampleErr(e);render();});
  }
  document.addEventListener("input",function(e){var t=e.target;if(t&&t.dataset&&t.dataset.twrt){var x=twFind(t.dataset.twrt);if(x)x.replyDraft=t.value;}});
  document.addEventListener("change",function(e){var t=e.target;if(t&&t.dataset&&t.dataset.twrt)save();});
  document.addEventListener("click",function(e){
    var a=e.target.closest("[data-twdraft]");if(a){runTwDraft(a.dataset.twdraft);return;}
    var c=e.target.closest("[data-twcopy]");
    if(c){var x=twFind(c.dataset.twcopy);if(!x)return;var txt=x.replyDraft||"";
      var done=function(){chip("Copied. Paste it in Teams and press Enter.");};
      try{navigator.clipboard.writeText(txt).then(done,function(){chip("Couldn’t copy. Select the text and copy it.",true);});}catch(er){chip("Couldn’t copy. Select the text and copy it.",true);}
      var u=okHref(x.webUrl)&&/^https:\/\/teams\.microsoft\.com\//.test(x.webUrl)?x.webUrl:"https://teams.microsoft.com/";
      try{window.open(u,"_blank","noopener");}catch(er2){}
      return;}
    var h=e.target.closest("[data-twdo]");
    if(h){var y=twFind(h.dataset.twdo);if(!y||!mcp||live.chatSending)return;
      progSend(progKey("tw",y.id),"Handle this Teams message for me: "+(y.from||"")+(y.chat?" in "+y.chat:"")+" ("+(y.on||"")+"): “"+(y.gist||"")+"”. Read the full Teams thread, find what they need in my email, Notion and the board, then write my reply into state.teamsWatch.items (id "+y.id+") as replyDraft, plus any email as an Outlook draft. Never post in Teams. Tell me in Live chat what you found and what the reply says.");}
  });
  /* ---- Email: Claude drafts the reply in Outlook ---- */
  function ibReplyBtn(key,m){
    if(!m||!m.uri||!mcp)return '';
    return '<button type="button" class="linkbtn doit-s" data-ibrep="'+esc(key)+'"'+(live.chatSending?' disabled':'')+'>⚡ Claude drafts the reply</button>';
  }
  document.addEventListener("click",function(e){
    var r=e.target.closest("[data-ibrep]");if(!r)return;
    var key=r.dataset.ibrep,id=key.replace(/^task:/,""),t=findTask(id),m=t&&t.mail;if(!m||!mcp||live.chatSending)return;
    progSend(progKey("rep",key),"Draft my reply to this email and save it in my Outlook Drafts as a reply (create reply draft on "+m.uri+"). Subject: “"+(m.subject||"")+"” from "+(m.from||"")+". Task "+id+": “"+(t.title||"")+"”"+(t.note?" ("+clip(t.note,300)+")":"")+". Follow my email playbook in Notion (\"How Brody writes email\"). Never send. Put the draft link on task.outlookDraft as {subject, toNames, link}, add a draft object to your Live chat reply, and ask if I want to send it.");
  });
  /* ---- Needs you: everything waiting on Brody, loud ---- */
  function nyExtra(){
    var out=[];
    state.tasks.forEach(function(t){
      if(t.done)return;
      if(t.question&&!t.answer)out.push({k:"answer",rank:-2,on:"",t:clip(t.question,160),m:clip(t.title,80),act:'<button type="button" class="btn ny-go" data-'+(t.group==="bugherd"?'view="bugherd"':'opentask="'+esc(t.id)+'"')+'>Answer</button>'});
      else if(t.needs&&t.assignee==="claude"&&t.claudeStatus==="blocked")out.push({k:"answer",rank:-2,on:"",t:"Claude asks: "+clip(t.needs,160),m:clip(t.title,80),act:'<button type="button" class="btn ny-go" data-opentask="'+esc(t.id)+'">Answer</button>'});
      if(t.outlookDraft&&okHref(t.outlookDraft.link)&&!t.done)out.push({k:"send",rank:-1,on:"",t:clip(t.outlookDraft.subject||t.title,120),m:"Draft ready in Outlook"+(t.outlookDraft.toNames?" · to "+(Array.isArray(t.outlookDraft.toNames)?t.outlookDraft.toNames.join(", "):t.outlookDraft.toNames):""),act:'<a class="btn ny-go" href="'+esc(t.outlookDraft.link)+'" target="_blank" rel="noopener">Open draft</a>'});
    });
    var s=state.strety,od=s&&Array.isArray(s.todos)?s.todos.filter(function(x){return !x.done&&x.due&&x.due<todayISO();}).length:0;
    if(od)out.push({k:"strety",rank:6,on:"",t:od+" Strety to-do"+(od>1?"s":"")+" overdue",m:"Close them in Strety or let Claude work them",act:'<button type="button" class="linkbtn" data-view="strety">Strety</button>'});
    return out;
  }
  NY_TAG.answer="Answer";NY_TAG.send="Send";NY_TAG.strety="Strety";

  function twActs(x){
    if(x.done)return '';
    return '<div class="tw-acts2">'+(sampler?'<button type="button" class="linkbtn" data-twdraft="'+esc(x.id)+'"'+(twDraft.busy?' disabled':'')+'>'+(x.replyDraft?'Redo reply':'Draft a reply')+'</button>':'')+(mcp?'<button type="button" class="linkbtn doit-s" data-twdo="'+esc(x.id)+'"'+(live.chatSending?' disabled':'')+'>⚡ Claude handles it</button>':'')+'</div>';
  }
  function blkDoMsg(b){
    var ts=blkTasks(b);
    return "Do plan block "+b.id+" now: "+b.start+" “"+b.title+"”. "+clip(b.sub||"",400)+(ts.length?"\nTasks in it: "+ts.map(function(t){return t.id+" “"+t.title+"”";}).join("; "):"")+
      "\n\nDo the work as far as the rules allow, using my email, Teams, Notion and Asana. "+RULES_LINE+" For each linked task set assignee \"claude\", claudeStatus \"ready\" (or \"blocked\" with task.needs) and task.update. Push a summary into the block's thread (state.days[today].blocks) and tell me in Live chat. Don't tick the block.";
  }
  document.addEventListener("click",function(e){
    var d=e.target.closest("[data-bdo]");if(!d)return;var lb=locateBlock(d.dataset.bdo);if(!lb||!mcp||live.chatSending)return;
    lb.block.doSentAt=new Date().toISOString();progSend(progKey("bdo",lb.block.id),blkDoMsg(lb.block));
  });

