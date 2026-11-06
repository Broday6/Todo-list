  /* ===== Playbooks, modes and Hand off (Nov 6, Brody: "we need this built in almost everything that can be handed off,
     and almost everything in this tool needs to be able to be handed off"; "an automated system where I have a dashboard and you do the job").
     state.playbooks = [{id,name,match,mode,steps,output,done,stop,v,updated}] — the first playbook whose match hits a task is its playbook.
     Modes: auto = Claude takes these on its own every hour and leaves a receipt · plan = Claude writes the steps, Brody approves, then it runs ·
     draft = Claude does the work but everything stays a draft · manual = Brody does it (Hand off still works).
     task.playbook / task.mode override per task. task.autoSkip keeps one task out of auto. */
  var PB_MODES=[["auto","Auto","Claude takes these on its own and leaves a receipt"],["plan","Plan first","Claude shows its steps, you approve, then it runs"],["draft","Draft only","Claude does the work; everything stays a draft"],["manual","Manual","You do these; Hand off still works"]];
  var PB_DEFAULTS=[
    {id:"email",name:"Email reply",match:{needsReply:true},mode:"auto",steps:["Read the email and the whole thread, plus my last emails with that person","Check Notion and the task log for how I answered this kind before","Write the reply in my voice (Hey for PCI people, Hi for outsiders; point first; close Thanks, Brody)","Save it as a reply draft in Outlook"],output:"Outlook reply draft, linked on the receipt",done:"A reply draft that answers every question in the email",stop:"It would promise a date, price, spec or fix not already stated, or ask someone to change NetSuite or ads"},
    {id:"teams",name:"Teams reply",match:{kinds:["teams"]},mode:"auto",steps:["Read the Teams message and the chat around it","Write a short reply in my voice on the board"],output:"Reply text on the board; I send it with Send in Teams",done:"A reply ready for my double tap",stop:"Never post in Teams yourself"},
    {id:"owe",name:"Follow-up I owe someone",match:{kinds:["owe"]},mode:"auto",steps:["Find what I promised and where (email, Teams, meeting)","Gather what they need","Save an Outlook draft to them"],output:"Outlook draft",done:"Draft that delivers what I owe",stop:"It needs a file or decision only I have"},
    {id:"alert",name:"NetSuite alert fix",match:{ids:["al-"],sources:["alerts","watchdog"]},mode:"plan",steps:["Read the alert email and its attachment","Build the fix file named ...-NOT-IMPORTED.csv and commit it","Write the summary: rows, biggest old to new, who owns it","Ask for my OK before anything would change in NetSuite"],output:"NOT-IMPORTED CSV in the repo + summary",done:"File ready and my OK asked for",stop:"Always, before any NetSuite change or any email asking someone to make one"},
    {id:"pricing",name:"Pricing review",match:{ids:["pr"]},mode:"manual",steps:["Summarize what changed and the biggest moves"],output:"Summary in the thread",done:"I have reviewed it",stop:"Pricing decisions stay with me"},
    {id:"bugherd",name:"BugHerd ticket",match:{groups:["bugherd"]},mode:"draft",steps:["Read the BugHerd emails for the ticket","Check the live page","Write the comment labelled Draft comment, not posted","List any data change as field, SKUs, old to new"],output:"Draft comment + any NOT-IMPORTED file",done:"Draft comment ready for me to post",stop:"Never send to Web Dev unless I cleared that ticket; never say a ticket was worked"},
    {id:"case",name:"E-Comm case",match:{groups:["cases"]},mode:"draft",steps:["Read the case alert and any emails about it","Find the item and the issue","Draft the reply or the vendor email in Outlook","Note what I need to update in NetSuite"],output:"Outlook draft + next step for NetSuite",done:"Draft ready and the NetSuite step named",stop:"Any NetSuite change"},
    {id:"ads",name:"Ads change",match:{touches:["ads"],title:"^Ads[: ]"},mode:"plan",steps:["Pull the numbers from the scorecard and the audit","Write the exact change (campaign, item, old to new)","Ask for my OK"],output:"Change sheet for my OK",done:"Change written and my OK asked for",stop:"Always before any ads change; never raise budgets; never judge on ROAS"},
    {id:"abtest",name:"A/B test check",match:{groups:["abtests"]},mode:"manual",steps:["Remind me which SKUs to read in Merchant Center"],output:"Reminder",done:"I logged the read",stop:"Merchant Center reads need my PC"},
    {id:"hiring",name:"Hiring",match:{groups:["hire"]},mode:"manual",steps:["Summarize the candidate and next step"],output:"Summary",done:"I acted",stop:"No Outlook drafts to Handshake candidates"},
    {id:"promo",name:"Promotion prep",match:{kinds:["promo"],title:"promo|sale|black friday|cyber monday"},mode:"draft",steps:["Read the promo details","Draft the emails and banner copy","List what is left to do"],output:"Drafts in the repo or Outlook",done:"Drafts ready",stop:"Prices or dates not stated"},
    {id:"strety",name:"Strety to-do",match:{kinds:["strety"]},mode:"draft",steps:["Work out what the to-do needs","Do the research or draft"],output:"Result in the thread",done:"Result ready to close in Strety",stop:"Strety has no connector; I close it there"},
    {id:"content",name:"Website content",match:{title:"FAQ|nav row|category page|page copy|description|meta title|content for"},mode:"auto",steps:["Read the plan and my notes","Write the content from fact-checked sources only","Commit it to the repo for my OK"],output:"File in the repo",done:"Content ready for my OK; nothing live",stop:"Anything that would change the live site"},
    {id:"research",name:"Research or report",match:{title:"research|report on|audit|analy[sz]e|compare|look into"},mode:"auto",steps:["Gather the facts from email, Notion, Asana and the web","Write the answer or report","Save it where I can find it"],output:"Answer in the thread or a file",done:"The question is answered with sources",stop:"It needs a system only my PC can reach"},
    {id:"general",name:"Anything else",match:{all:true},mode:"plan",steps:["Read the task and my notes","Write the steps you will take"],output:"Depends on the task",done:"The objective in the title is met",stop:"Anything the rules say needs my OK"}
  ];
  function pbList(){if(!Array.isArray(state.playbooks)||!state.playbooks.length)state.playbooks=JSON.parse(JSON.stringify(PB_DEFAULTS)).map(function(p){p.v=1;return p;});return state.playbooks;}
  function pbById(id){var L=pbList();for(var i=0;i<L.length;i++)if(L[i].id===id)return L[i];return null;}
  function pbHit(p,t,kind){var m=p.match||{};if(m.all)return true;
    if(kind&&m.kinds&&m.kinds.indexOf(kind)>=0)return true;
    if(!t)return false;var id=String(t.id||""),src=String(t.source||"").toLowerCase(),title=String(t.title||"");
    if(m.ids&&m.ids.some(function(x){return id.indexOf(x)===0&&(x!=="pr"||/^pr\d/.test(id));}))return true;
    if(m.groups&&m.groups.indexOf(t.group)>=0)return true;
    if(m.sources&&m.sources.some(function(x){return src.indexOf(x)===0;}))return true;
    if(m.touches&&m.touches.indexOf(t.touches)>=0)return true;
    if(m.has&&m.has.some(function(k){return !!t[k];}))return true;
    if(m.needsReply&&t.mail&&!(t.reply&&(t.reply.state==="none"||t.reply.state==="replied"))&&!/^(noreply|no-reply|accountspayable)/i.test(String(t.mail.from||""))&&!/^(al-|pr\d|cs\d)/.test(id))return true;
    if(m.title){try{if(new RegExp(m.title,"i").test(title))return true;}catch(e){}}
    return false;}
  function pbFor(t,kind){var L=pbList();if(t&&t.playbook){var f=pbById(t.playbook);if(f)return f;}for(var i=0;i<L.length;i++)if(pbHit(L[i],t,kind||(t&&t.hoKind)))return L[i];return L[L.length-1];}
  function modeOf(t){return (t&&t.mode)||pbFor(t).mode||"plan";}
  function modeName(m){for(var i=0;i<PB_MODES.length;i++)if(PB_MODES[i][0]===m)return PB_MODES[i][1];return m;}
  /* the brief Claude gets: the playbook and the mode ride along with every hand-off */
  var _doMsgPb=doMsg;
  doMsg=function(t){var m=_doMsgPb(t);if(m.indexOf("PLAYBOOK:")>=0)return m;var p=pbFor(t),md=modeOf(t);
    var add="\n\nPLAYBOOK: "+p.name+" (v"+(p.v||1)+"). Steps: "+(p.steps||[]).map(function(s,i){return (i+1)+") "+s;}).join(" ")+". Results go: "+(p.output||"")+". Done means: "+(p.done||"")+". Always stop and ask when: "+(p.stop||"")+".";
    if((state.myRules||[]).length)add+="\nMY RULES (follow all): "+state.myRules.map(function(r){return r.text;}).join(" | ");
    if(md==="plan"&&!t.planOK)add+="\nMODE: Plan first. Do NOT do the work yet. Write the exact steps you will take into task.workflow as [{text}], post them in the thread starting \"Plan:\", set task.receipt = {at, status:\"plan\", summary:\"Plan ready: <N> steps\"}, set claudeStatus \"plan\", and stop. I approve it on the board and you run it.";
    else if(md==="plan"&&t.planOK)add+="\nMODE: Plan approved on "+t.planOK.slice(0,10)+". Do the steps in task.workflow exactly, in order, then write the receipt.";
    else if(md==="draft")add+="\nMODE: Draft only. Do the work, but everything you make stays a draft for me (Outlook drafts, files in the repo, text in the thread). Change nothing else on the board beyond this task.";
    else add+="\nMODE: Just do it. Carry it out now and write the receipt.";
    return m+add;};
  /* Hand off: anything becomes a task (with where it came from) and goes to Claude right away */
  function handOff(kind,ref){
    var t=null,now=new Date().toISOString();
    if(kind==="task")t=findTask(ref);
    else if(kind==="tw"){var x=twS().items.filter(function(i){return i.id===ref;})[0];if(!x)return;t=findTask("ho-tw-"+x.id)||(function(){var n={id:"ho-tw-"+x.id,group:"now",title:"Reply to "+(x.from||"")+" on Teams: "+clip(x.gist||"",90),note:"Teams"+(x.chat?" · "+x.chat:"")+" · "+(x.on||"")+". "+(x.gist||""),due:todayISO(),done:false,since:todayISO(),source:"Handed off from Teams",hoKind:"teams",teamsItem:x.id};state.tasks.push(n);x.taskId=n.id;return n;})();}
    else if(kind==="owe"){var pr=ref.split("|"),p=tmPerson(pr[0]),o=p&&(p.youOwe||[]).filter(function(y){return y.id===pr[1];})[0];if(!o)return;t=findTask("ho-owe-"+o.id)||(function(){var n={id:"ho-owe-"+o.id,group:"now",title:"Send "+p.short+": "+clip(o.what,100),note:"You owe "+(p.name||p.short)+(o.since?" since "+o.since:"")+". "+(o.source||""),due:todayISO(),done:false,since:todayISO(),source:"Handed off from Team",hoKind:"owe"};state.tasks.push(n);return n;})();}
    else if(kind==="blk"){var cb=locateBlock(ref);if(!cb)return;var b=cb.block,lk=blockTasks(b).filter(function(x){return !x.done;})[0];
      t=lk||findTask("ho-blk-"+b.id)||(function(){var n={id:"ho-blk-"+b.id,group:"now",title:b.title,note:(b.sub||"")+" (from today's plan, "+b.start+")",due:todayISO(),done:false,since:todayISO(),source:"Handed off from the plan"};state.tasks.push(n);return n;})();}
    else if(kind==="promo"){var pm=pms().items.filter(function(i){return i.id===ref;})[0];if(!pm)return;t=findTask("ho-pm-"+pm.id)||(function(){var n={id:"ho-pm-"+pm.id,group:"now",title:"Prep the promotion: "+pm.title,note:(pm.what||"")+(pm.start?" Starts "+pm.start+".":"")+" To-dos: "+(pm.todo||[]).filter(function(x){return !x.done;}).map(function(x){return x.text;}).join("; "),due:todayISO(),done:false,since:todayISO(),source:"Handed off from Promotions",hoKind:"promo"};state.tasks.push(n);return n;})();}
    if(!t||t.done)return;
    t.handedAt=now;t.handedBy="Brody";delete t.autoSkip;
    if(!mcp){t.assignee="claude";t.claudeStatus="queued";save();chip("Handed off. Claude starts at the next run.");return;}
    giveToClaude(t);save();
  }
  function hoBtn(kind,ref,label){return '<button type="button" class="ho-btn" data-ho="'+esc(kind+"|"+ref)+'" title="Claude works it now with its playbook and leaves a receipt">'+(label||"Hand off")+'</button>';}
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-ho]");if(!b)return;e.preventDefault();e.stopPropagation();var v=b.dataset.ho,i=v.indexOf("|");handOff(v.slice(0,i),v.slice(i+1));},true);
  /* After every render, put a Hand off button on everything that can be handed off and doesn't have one yet */
  function hoInject(){
    var root=document.getElementById("root");if(!root||readOnly)return;
    root.querySelectorAll("li").forEach(function(li){
      if(li.querySelector(":scope > .ho-btn, :scope .ho-btn")||li.closest(".dq-card")||li.classList.contains("dq-card"))return;
      var c=li.querySelector(":scope > input[data-tchk], :scope > div > input[data-tchk]")||li.querySelector("input[data-tchk]");
      var kind=null,ref=null;
      if(c&&c.closest("li")===li){var t=findTask(c.dataset.tchk);if(!t||t.done||t.assignee==="claude"||/^idea/.test(t.group||""))return;kind="task";ref=t.id;}
      else if(li.classList.contains("blk")&&li.dataset.id&&!li.classList.contains("done")){kind="blk";ref=li.dataset.id;}
      else{var tw=li.querySelector("[data-twdone]");if(tw&&tw.closest("li")===li){kind="tw";ref=tw.dataset.twdone;}
        var tmd=li.querySelector("[data-tmdone]");if(!kind&&tmd&&tmd.closest("li")===li){var q=tmd.dataset.tmdone.split("|");if(q[1]==="youOwe"){kind="owe";ref=q[0]+"|"+q[2];}}
        var pmt=li.querySelector("[data-pmtask]");if(!kind&&pmt&&pmt.closest("li")===li){kind="promo";ref=pmt.dataset.pmtask;}}
      if(!kind)return;
      var host=li.querySelector(":scope .meta, :scope .qa, :scope .rowacts, :scope .cacts, :scope .tm-acts, :scope .tw-acts2")||li;
      host.insertAdjacentHTML("beforeend",hoBtn(kind,ref));
    });
    root.querySelectorAll("section.focus .facts").forEach(function(f){if(f.querySelector(".ho-btn"))return;var d=f.querySelector("[data-act='blkdone']");if(d)f.insertAdjacentHTML("beforeend",hoBtn("blk",d.dataset.id));});
  }
  var _renderHo=render;
  render=function(){_renderHo.apply(this,arguments);try{hoInject();}catch(e){}};
  /* Plan-first: approve or redirect Claude's plan */
  function planSteps(t){return (t.workflow||[]).map(function(s){return s.text;}).filter(Boolean);}
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-planok],[data-planredo]");if(!b)return;
    var t=findTask(b.dataset.planok||b.dataset.planredo);if(!t)return;
    if(b.dataset.planok){t.planOK=new Date().toISOString();t.claudeStatus="queued";if(t.receipt&&t.receipt.status==="plan")delete t.receipt;(t.thread||(t.thread=[])).push({role:"user",text:"Plan approved. Go ahead.",t:t.planOK});
      if(mcp&&!live.chatSending){t.doSentAt=t.planOK;progSend(progKey("do",t.id),doMsg(t));}save();chip("Plan approved. Claude is running it.");return;}
    var ta=b.closest("li").querySelector("textarea[data-plantext]"),v=String(ta&&ta.value||"").trim();if(!v){chip("Say what to do differently first.",true);if(ta)ta.focus();return;}
    (t.thread||(t.thread=[])).push({role:"user",text:"Change the plan: "+v,t:new Date().toISOString()});t.brief=clip(v,2000);delete t.planOK;t.claudeStatus="queued";
    if(mcp&&!live.chatSending){t.doSentAt=new Date().toISOString();progSend(progKey("do",t.id),doMsg(t)+"\n\nRedo the plan with this change: "+v);}save();chip("Sent. Claude will come back with a new plan.");
  });
  /* Do now gets plan cards and Up next (auto) awareness */
  var _dqItemsPb=dqItems;
  dqItems=function(){var out=_dqItemsPb();
    state.tasks.forEach(function(t){if(!t.done&&t.assignee==="claude"&&t.claudeStatus==="plan"){var st=planSteps(t);
      out.push({k:"decide",rank:-0.5,t:t,tag:"Plan to approve",title:t.title,ctx:(st.length?st.length+" steps: "+st.slice(0,6).map(function(s,i){return (i+1)+". "+s;}).join("  "):"Claude wrote a plan in the thread.")+"  Playbook: "+pbFor(t).name,
        input:'<textarea data-plantext="'+esc(t.id)+'" rows="2" placeholder="Optional: what should Claude do differently?"></textarea>',
        main:'<button type="button" class="btn" data-planok="'+esc(t.id)+'"'+(live.chatSending?' disabled':'')+'>Approve plan</button>',more:'<button type="button" class="linkbtn" data-planredo="'+esc(t.id)+'">Change the plan</button>',prog:progKey("do",t.id)});}});
    out.sort(function(a,b){return a.rank-b.rank||((b.late||0)-(a.late||0));});return out;};
  /* per-task playbook + mode controls inside an opened task */
  var _aboutPb=aboutHTML;
  aboutHTML=function(t){var p=pbFor(t),md=modeOf(t);
    var h='<div class="pbpick"><span class="pbl">How Claude handles this</span><select data-tpb="'+esc(t.id)+'" aria-label="Playbook">'+pbList().map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===p.id?' selected':'')+'>'+esc(x.name)+'</option>';}).join("")+'</select>';
    h+='<select data-tmode="'+esc(t.id)+'" aria-label="Mode"><option value="">Playbook default ('+esc(modeName(p.mode))+')</option>'+PB_MODES.map(function(m){return '<option value="'+m[0]+'"'+(t.mode===m[0]?' selected':'')+'>'+m[1]+'</option>';}).join("")+'</select>';
    if(!t.done&&t.assignee!=="claude")h+=hoBtn("task",t.id,"Hand off now");
    h+='</div>';return h+_aboutPb(t);};
  document.addEventListener("change",function(e){var el=e.target;if(!el.dataset)return;
    if(el.dataset.tpb){var t=findTask(el.dataset.tpb);if(t){if(el.value===pbFor(Object.assign({},t,{playbook:null})).id)delete t.playbook;else t.playbook=el.value;save();chip("Playbook set: "+pbById(el.value).name);}}
    if(el.dataset.tmode!=null){var t2=findTask(el.dataset.tmode);if(t2){if(el.value)t2.mode=el.value;else delete t2.mode;if(el.value==="manual")t2.autoSkip=true;else delete t2.autoSkip;save();chip("Mode: "+(el.value?modeName(el.value):"playbook default"));}}
  });
  function autoEligible(){var L=[];state.tasks.forEach(function(t){if(t.done||t.autoSkip||t.assignee==="claude"||/^idea/.test(t.group||"")||t.group==="frozen"||t.claudeStatus==="send_now")return;if(modeOf(t)!=="auto")return;L.push(t);});return L;}
