  /* ===== Cleanup (Nov 10, patch44; Brody: "clean up the board I need an easier way to see the tasks that claude is currently
     working on a way to open up that chat from the tool and I need better organization in the tool it is very confusing right now").
     1. "Claude at work" page: what Claude is doing right now, what it stopped on, what it finished, each with Open chat.
        Board tasks come from state (runs, receipts, claudeStatus); every other Claude chat comes live from list_sessions.
        A task's chat link is task.chatSid (saved by this browser when it starts the chat) or task.receipt.session
        (stamped by the routine itself from $CLAUDE_CODE_REMOTE_SESSION_ID).
     2. Sidebar: five short groups; Plans and Business fold shut, a shut group still shows the page you're on.
     3. Today: Claude card replaces the Working column; Do now cards stay short until you press Answer;
        What changed, Today's log and Log in move into one "More for today" fold at the bottom. */

  /* ---- 1. Claude at work ---- */
  TABS.splice(1,0,["work","Claude at work"]);VIEW_TITLE.work="Claude at work";KEYORDER.splice(1,0,"work");
  ICON.work='<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>';
  try{var w44h=String(location.hash||"").slice(1),w44s=localStorage.getItem("bb.view");if(w44h==="work"||(!isTab(w44h)&&w44s==="work"))view="work";}catch(e){}
  var W44={sess:null,at:0,err:"",busy:false};
  function w44Sid(t){
    if(!t)return "";
    var s=t.chatSid||(t.receipt&&t.receipt.session)||"";
    if(!s&&Array.isArray(t.runs))for(var i=t.runs.length-1;i>=0;i--){if(t.runs[i]&&t.runs[i].sid){s=t.runs[i].sid;break;}}
    if(!s){var c=bcList().find(function(x){return x.task===t.id;});if(c)s=c.sid;}
    var r=live.chatRun;if(!s&&r&&r.sid&&String(r.origin||"")==="do:"+t.id)s=r.sid;
    return String(s||"").replace(/^cse_/,"session_");
  }
  /* bcRec saves the chat's sid on the task; also stamp it on the run it belongs to */
  setInterval(function(){
    var r=live.chatRun;if(!r||!r.sid)return;var m=/^(?:do|task):(.+)$/.exec(String(r.origin||""));if(!m)return;
    var t=findTask(m[1]);if(!t)return;var ch=false;
    if(t.chatSid!==r.sid){t.chatSid=r.sid;ch=true;}
    var R=t.runs||[],last=R[R.length-1];if(last&&!last.sid&&Date.parse(last.t)>=(r.at||0)-120000){last.sid=r.sid;ch=true;}
    if(ch)save();
  },5000);
  function w44Tasks(){
    var out={work:[],need:[],plan:[],done:[]},today=new Date();today.setHours(0,0,0,0);
    state.tasks.forEach(function(t){
      if(!t)return;var rc=t.receipt,R=t.runs||[],last=R[R.length-1];
      if(t.done){if(rc&&rc.at&&new Date(rc.at)>=today)out.done.push({t:t,at:rc.at});return;}
      var st=last?u6RunState(t,last,null):null;
      if(st&&st.k==="acc"){out.work.push({t:t,at:last.t,lab:"Working · "+agoTxt(last.t),why:last.why});return;}
      if(t.assignee==="claude"&&t.claudeStatus==="queued"){out.work.push({t:t,at:t.doSentAt||t.handedAt||"",lab:"Queued",queued:true});return;}
      if(st&&st.stall){out.need.push({t:t,at:last.t,lab:"No answer yet",d:"Started "+agoTxt(last.t)+" ago and hasn’t reported back. Open the chat to see where it is."});return;}
      if(t.claudeStatus==="plan"){out.plan.push({t:t,at:(rc&&rc.at)||"",lab:"Plan to OK"});return;}
      if(t.claudeStatus==="blocked"){out.need.push({t:t,at:(rc&&rc.at)||(t.update&&t.update.on)||"",lab:"Needs you"});return;}
      if(rc&&rc.at&&new Date(rc.at)>=today&&rc.status==="done")out.done.push({t:t,at:rc.at});
    });
    ["work","need","plan","done"].forEach(function(k){out[k].sort(function(a,b){return String(b.at).localeCompare(String(a.at));});});
    return out;
  }
  function w44Detail(t){
    var rc=t.receipt,u=t.update;
    var s=(rc&&rc.left)||(rc&&rc.summary)||(u&&u.text)||t.unlockBy||t.why||t.note||"";
    if(Array.isArray(s))s=s.join(" ");
    return clip(String(s).replace(/^\s*(Needs you|Plan|Done)\s*[:,.]\s*/i,""),180);
  }
  function w44Fetch(force){
    if(!mcp||W44.busy)return;if(!force&&Date.now()-W44.at<55000)return;
    W44.busy=true;
    mcp.callTool(CCR,"list_sessions",{limit:40,mine:true},{cache:false}).then(function(res){
      W44.busy=false;W44.at=Date.now();W44.err="";
      var p=ccrP(res),d=p&&((p.ccr&&p.ccr.data)||p.data||p.sessions);W44.sess=Array.isArray(d)?d:[];
      if(view==="work"||view==="today")render();
    },function(e){W44.busy=false;W44.at=Date.now();W44.err=(e&&e.code==="not_granted")?"grant":"fail";if(view==="work")render();});
  }
  setInterval(function(){if(view==="work"||view==="today")w44Fetch(false);},15000);
  function w44Chats(){
    var L=(W44.sess||[]).filter(function(s){return s&&s.id&&s.session_status!=="SESSION_STATUS_ARCHIVED";});
    var mine={};state.tasks.forEach(function(t){var x=w44Sid(t);if(x)mine[x]=t;});
    var out={work:[],need:[],done:[]},now=Date.now();
    L.forEach(function(s){
      var b=String(s.status_bucket||""),up=Date.parse(s.updated_at||s.created_at||0)||0,pt=s.post_turn_summary||{};
      var row={s:s,t:mine[s.id]||null,at:s.updated_at||s.created_at,title:s.title||"Claude chat",d:s.task_summary||pt.needs_action||pt.recent_action||""};
      if(/WORKING/.test(b))out.work.push(row);
      else if(/BLOCKED/.test(b)&&now-up<7*864e5){row.d=pt.needs_action||row.d;out.need.push(row);}
      else if(/COMPLETED|REVIEW_READY/.test(b)&&now-up<24*36e5){row.d=pt.recent_action||row.d;out.done.push(row);}
    });
    return out;
  }

  /* where each chat runs, what it can reach, where it's at (Brody, Nov 10: "see chats that ultron is working on where they are at what they have access too") */
  W44.info={};W44.trig=null;
  var W44NAME={Microsoft_365:"Outlook & Teams",Notion:"Notion",Google_Drive:"Drive",Google_Sheets:"Sheets",Gmail:"Gmail",Asana:"Asana",Claude_Docs:"Docs",Google_Calendar:"Google Calendar",github:"GitHub","claude-code-remote":"start other chats",Claude_Code_Remote:"start other chats",Claude_in_Chrome:"Chrome",claude_browser:"Chrome"};
  function w44Acc(names,where){
    var L=[],seen={};names.forEach(function(n){var k=W44NAME[n]||n.replace(/_/g," ");if(!seen[k]){seen[k]=1;L.push(k);}});
    var pc=where==="pc"||L.indexOf("Chrome")>=0;
    return (pc?"On your PC":"In the cloud")+" · can use "+(L.length?L.join(", "):"files and the web")+(pc?" · NetSuite and Miva only if you’re signed in":" · can’t reach NetSuite, Miva, ads or the Marketing Portal (those need your PC)");
  }
  function w44Trig(){
    if(W44.trig||!mcp||W44.trigBusy)return;W44.trigBusy=true;
    mcp.callTool(CCR,"get_trigger",{trigger_id:CHAT_TRIG},{cache:false}).then(function(res){var p=ccrP(res),t=p&&(p.trigger||p);
      W44.trig=((t&&t.mcp_connections)||[]).map(function(c){return c.name;});if(view==="work")render();},function(){W44.trigBusy=false;});
  }
  function w44Info(sid,force){
    if(!sid||!mcp)return null;var x=W44.info[sid];
    if(x&&(x.busy||Date.now()-x.at<(force?15000:90000)))return x.v||null;
    W44.info[sid]={busy:true,at:Date.now(),v:x&&x.v};
    mcp.callTool(CCR,"get_session",{session_id:sid},{cache:false}).then(function(res){
      var p=ccrP(res),c=p&&(p.ccr||p.session||p)||{},em=c.external_metadata||{},th=em.turn_handoff||{},tools=th.tools||[],cu=em.context_usage||{};
      var names=[];tools.forEach(function(t){var m=/^mcp__([^_]+(?:_[^_]+)*?)__/.exec(String(t));if(m)names.push(m[1]);});
      if(tools.some(function(t){return /^WebSearch$|^WebFetch$/.test(t);}))names.push("web search");
      var b=String(c.status_bucket||""),pt=c.post_turn_summary||{};
      W44.info[sid]={busy:false,at:Date.now(),v:{
        st:/WORKING/.test(b)?"Working":/BLOCKED/.test(b)?"Waiting on you":/FAILED/.test(b)?"Failed":/COMPLETED|REVIEW_READY/.test(b)?"Finished":"Idle",
        now:c.task_summary||pt.needs_action||pt.recent_action||"",
        acc:w44Acc(names.length?names:(W44.trig||[]),c.environment_kind==="bridge"?"pc":"cloud"),
        ctx:cu.max_tokens?Math.round(100*cu.used_tokens/cu.max_tokens):null}};
      if(view==="work")render();
    },function(){W44.info[sid]={busy:false,at:Date.now(),v:x&&x.v};});
    return x&&x.v||null;
  }
  function w44InfoHTML(sid,fallbackCloud){
    var v=sid?w44Info(sid):null;
    if(v)return '<div class="w44-i"><b>'+esc(v.st)+'</b>'+(v.now?' · '+esc(clip(v.now,150)):'')+'<br><span>'+esc(v.acc)+(v.ctx!=null?' · memory '+v.ctx+'% full':'')+'</span></div>';
    return '';
  }
  function w44Btns(sid,tid){
    var h='';
    if(sid)h+='<a class="btn w44-open" href="'+esc(sessLink(sid))+'" target="_blank" rel="noopener">Open chat ↗</a>';
    if(tid)h+='<button type="button" class="btn ghost" data-opentask="'+esc(tid)+'">Open task</button>';
    return h;
  }
  function w44Row(tag,cls,title,d,when,acts,sub,extra){
    return '<li class="w44-r"><div class="w44-l"><span class="stag '+cls+'">'+esc(tag)+'</span>'+(when?'<span class="w44-w">'+esc(when)+'</span>':'')+'</div>'
      +'<div class="w44-b"><div class="w44-t">'+esc(title)+'</div>'+(sub?'<div class="w44-s">'+esc(sub)+'</div>':'')+(d?'<div class="w44-d">'+esc(d)+'</div>':'')+(extra||'')+'</div>'
      +'<div class="w44-a">'+acts+'</div></li>';
  }
  function w44When(iso){if(!iso)return "";var x=rcWhen(iso)||"";return x.split(" · ").slice(0,2).join(" · ");}
  function w44Data(){
    var T=w44Tasks(),C=w44Chats(),seen={};
    function taskRows(arr,cls){return arr.map(function(x){var t=x.t,sid=w44Sid(t);if(sid)seen[sid]=1;
      var lab=x.lab||"Done";
      var sub=x.queued?"Waits for Claude’s next check-in (weekdays at :12 past the hour)":(x.why&&x.why!=="start"?"Your "+x.why:"");
      return {at:x.at,html:w44Row(lab,cls,t.title,x.d||w44Detail(t),w44When(x.at),w44Btns(sid,t.id)+(sid?'':'<span class="w44-nl" title="Chats started before Nov 10 didn’t save their link. New ones do.">No chat link</span>'),sub,(cls==='ok'?'':w44InfoHTML(sid,true)))};});}
    function chatRows(arr,cls,lab){return arr.filter(function(x){return !seen[x.s.id];}).map(function(x){seen[x.s.id]=1;
      return {at:x.at,html:w44Row(lab,cls,x.t?x.t.title:x.title,x.d,w44When(x.at),w44Btns(x.s.id,x.t&&x.t.id),x.t?"":"Claude chat",(cls==='ok'?'':w44InfoHTML(x.s.id,false)))};});}
    function by(a){return a.sort(function(p,q){return String(q.at).localeCompare(String(p.at));});}
    var lc=live.chatRun,lcRows=[];
    if(lc&&!lc.done&&!lc.fail&&!/^(?:do|task):/.test(String(lc.origin||""))&&Date.now()-(lc.at||0)<30*60000){
      var it=chItems().find(function(m){return m.id===lc.item;});if(lc.sid)seen[lc.sid]=1;
      lcRows.push({at:new Date(lc.at).toISOString(),html:w44Row("Working","acc",it?clip(String(it.text||"").replace(/\s+/g," "),110):"Your Live chat message","","started "+agoTxt(new Date(lc.at).toISOString())+" ago",(lc.sid?w44Btns(lc.sid,""):'')+'<button type="button" class="btn ghost" data-view="chat">Live chat</button>',"Live chat")});
    }
    var work=by(taskRows(T.work,"acc").concat(lcRows,chatRows(C.work,"acc","Working")));
    var need=by(taskRows(T.need,"warn").concat(taskRows(T.plan,"warn"),chatRows(C.need,"warn","Needs you")));
    var done=by(taskRows(T.done,"ok").concat(chatRows(C.done,"ok","Finished")));
    return {work:work,need:need,done:done};
  }
  function w44Sec(id,title,small,rows,empty,max){
    var h='<section class="panel w44" id="'+id+'"><h2>'+esc(title)+' <small>'+rows.length+(small?' · '+esc(small):'')+'</small></h2>';
    if(!rows.length)return h+'<p class="empty">'+esc(empty)+'</p></section>';
    var shown=W44["all_"+id]?rows:rows.slice(0,max);
    h+='<ul class="w44-list">'+shown.map(function(x){return x.html;}).join("")+'</ul>';
    if(rows.length>shown.length)h+='<button type="button" class="more" data-w44all="'+id+'">Show all '+rows.length+'</button>';
    return h+'</section>';
  }

  /* why Claude is stopped (Brody, Nov 10: "look at alot of my problems or tasks that arent being completed to see what can be improved").
     Most stops are a PC step (Miva, NetSuite, Strety, Marketing Portal) the cloud can't reach, while the PC worker skips
     because nothing is queued for it. "Send to the PC worker" puts the step in task.pcJob; the PC worker's Job C runs it. */
  function w44Why(t){
    var x=[t.unlockBy,(t.receipt&&t.receipt.left),(t.update&&t.update.text),t.blockedBy].map(function(v){return Array.isArray(v)?v.join(" "):String(v||"");}).join(" ");
    if(/\bPC\b|sign in|signed in|Chrome|Miva|NetSuite|Strety|Marketing Portal|Merchant Center/i.test(x))return "pc";
    if(t.claudeStatus==="plan"||/\b(OK|go|approve|pick|choose|which|confirm|say go)\b/i.test(x))return "ask";
    if(/\b(reply|waiting (on|for)|vendor|procurement)\b/i.test(x))return "wait";
    return "other";
  }
  function w44Stuck(){
    var T=w44Tasks(),G={pc:[],ask:[],wait:[],other:[]};
    T.need.concat(T.plan).forEach(function(x){G[w44Why(x.t)].push(x.t);});return G;
  }
  function w44StuckHTML(){
    var G=w44Stuck(),n=G.pc.length+G.ask.length+G.wait.length+G.other.length;if(!n)return '';
    var pcq=G.pc.filter(function(t){return !t.pcJob;}),pcIn=G.pc.length-pcq.length;
    var h='<section class="panel w44-why" id="w44-why"><h2>Why Claude is stopped <small>'+n+' tasks</small></h2><ul class="w44-list">';
    if(G.pc.length)h+='<li class="w44-r"><div class="w44-l"><span class="stag warn">'+G.pc.length+' need your PC</span></div><div class="w44-b"><div class="w44-t">The next step is in Miva, NetSuite, Strety or the Marketing Portal</div><div class="w44-d">The cloud can’t reach those. Instead of pasting a prompt for each one, queue them for the PC worker: it runs every 30 minutes on weekdays and does the reads and drafts. Changes in NetSuite or Miva still wait for your Go in Approvals.'+(pcIn?' '+pcIn+' already queued.':'')+'</div></div><div class="w44-a">'+(pcq.length?'<button type="button" class="btn" data-w44pc="1">Send '+pcq.length+' to the PC worker</button>':'<span class="w44-nl">All queued</span>')+'</div></li>';
    if(G.ask.length)h+='<li class="w44-r"><div class="w44-l"><span class="stag warn">'+G.ask.length+' need your answer</span></div><div class="w44-b"><div class="w44-t">Claude asked a question or wrote a plan for your OK</div><div class="w44-d">'+esc(G.ask.slice(0,3).map(function(t){return clip(t.title,50);}).join(" · "))+'</div></div><div class="w44-a"><button type="button" class="btn ghost" data-view="claude">Answer them</button></div></li>';
    if(G.wait.length)h+='<li class="w44-r"><div class="w44-l"><span class="stag">'+G.wait.length+' waiting on someone</span></div><div class="w44-b"><div class="w44-t">Waiting on a reply from a person or vendor</div><div class="w44-d">'+esc(G.wait.slice(0,3).map(function(t){return clip(t.title,50);}).join(" · "))+'</div></div><div class="w44-a"><button type="button" class="btn ghost" data-view="inbox">Inbox</button></div></li>';
    if(G.other.length)h+='<li class="w44-r"><div class="w44-l"><span class="stag">'+G.other.length+' other</span></div><div class="w44-b"><div class="w44-t">Stopped for another reason</div><div class="w44-d">'+esc(G.other.slice(0,3).map(function(t){return clip(t.title,50);}).join(" · "))+'</div></div><div class="w44-a"></div></li>';
    return h+'</ul></section>';
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-w44pc]");if(!b)return;
    var n=0,now=new Date().toISOString();
    w44Stuck().pc.forEach(function(t){if(t.pcJob)return;var st=(t.receipt&&t.receipt.left)||t.unlockBy||(t.update&&t.update.text)||t.title;
      t.pcJob={t:now,by:"Brody",step:clip(Array.isArray(st)?st.join(" "):String(st),600),status:"queued"};
      (t.thread=t.thread||[]).push({role:"user",t:now,text:"Sent to the PC worker: do the PC step on your next run (reads, research and drafts now; any NetSuite or Miva change waits for my Go)."});n++;});
    save();chip("Queued "+n+" for the PC worker. It picks them up on its next run (every 30 min, weekdays).");render();
  });
  function workHTML(){
    w44Fetch(false);var D=w44Data();
    var h='<div class="w44-wrap">';
    if(W44.err==="grant")h+='<p class="ux-note">To list your other Claude chats here, allow <b>Claude Code Remote</b> for this page when it asks. Board tasks still show below.</p>';
    w44Trig();var tl=(W44.trig&&W44.trig.length)?W44.trig:["Microsoft_365","Notion","Google_Drive","Google_Sheets","Gmail","Asana"];
    h+='<p class="w44-acc"><b>Board chats</b> (the ones Ultron starts for a task or Live chat): '+esc(w44Acc(tl,"cloud"))+'. Chats on your PC show their own access on the row.</p>';
    h+=w44StuckHTML();
    h+=w44Sec("w44-now","Working on now","each one is a Claude chat you can open",D.work,"Claude isn’t working on anything right now. Hand a task off from Tasks or Do now, or type in Live chat.",20);
    h+=w44Sec("w44-need","Stopped for you","open the chat or the task to answer",D.need,"Nothing is waiting on you.",8);
    h+=w44Sec("w44-done","Finished","today’s board tasks and chats from the last 24 hours",D.done,"Nothing finished yet today.",8);
    h+='<details class="panel w44-more"><summary>All board chats</summary>'+bcPanelHTML().replace(/^<section[^>]*>/,'').replace(/<\/section>$/,'')+'</details>';
    return h+'</div>';
  }
  function w44Head(){
    var D=w44Data();
    var sub='<b>'+D.work.length+'</b> working now · <b>'+D.need.length+'</b> stopped for you · <b>'+D.done.length+'</b> finished'+(W44.at?' · checked '+esc(agoTxt(new Date(W44.at).toISOString()))+'':'');
    var acts='<button type="button" class="btn ghost" data-w44ref="1">Refresh</button><button type="button" class="btn ghost" data-view="chat">Live chat</button><a class="btn" href="https://claude.ai/code" target="_blank" rel="noopener">All Claude chats ↗</a>';
    return pageHeadHTML("",VIEW_TITLE.work,sub,acts);
  }
  var _render44=render;
  render=function(){
    if(view!=="work"){_render44.apply(this,arguments);try{w44Post();}catch(e){}return;}
    view="claude";try{_render44.apply(this,arguments);}finally{view="work";}
    var pg=document.querySelector("main .page");
    if(pg){pg.className="page page-work";var ft=pg.querySelector(":scope > footer");pg.innerHTML=w44Head()+workHTML()+(ft?ft.outerHTML:"");}
    document.querySelectorAll('.snav [data-view],.bnav [data-view]').forEach(function(b){var on=b.dataset.view==="work";b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
    try{buildJump();}catch(e){}
  };
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("[data-w44all],[data-w44ref]");if(!a)return;
    if(a.dataset.w44ref){W44.at=0;w44Fetch(true);chip("Checking your chats…");return;}
    W44["all_"+a.dataset.w44all]=true;render();
  });

  /* ---- 2. Sidebar groups ---- */
  var NAV44=[["Start here",["today","work","approvals","inbox"]],["Your work",["tasks","bugherd","cases","team","week"]],["Claude",["chat","claude","auto"]],["Plans",["g5","goals","strety"]],["Business",["sales","ads","promo","abtests","hiring"]]];
  var NAVSHUT44={"Plans":1,"Business":1};try{var ns44=JSON.parse(localStorage.getItem("bb.navshut")||"null");if(ns44&&typeof ns44==="object")NAVSHUT44=ns44;}catch(e){}
  TABS.forEach(function(tb){var k=tb[0];if(!NAV44.some(function(g){return g[1].indexOf(k)>=0;})&&NAVGROUPS.some(function(g){return g[1].indexOf(k)>=0;}))NAV44[1][1].push(k);});
  VIEW_TITLE.claude=VIEW_TITLE.claude||"Claude";
  (function(){for(var i=0;i<TABS.length;i++){if(TABS[i][0]==="claude")TABS[i][1]="Answer & hand off";VIEW_TITLE.claude="Answer & hand off";if(TABS[i][0]==="auto")TABS[i][1]="Control room";}})();
  PRIMARY=["today","work","inbox","tasks"];
  var _side44=sideHTML;
  sideHTML=function(c){
    var keep=NAVGROUPS;
    NAVGROUPS=NAV44.map(function(g){var k=g[1].filter(isTab);return [g[0],NAVSHUT44[g[0]]?k.filter(function(x){return x===view;}):k];});
    var h;try{h=_side44.apply(this,arguments);}finally{NAVGROUPS=keep;}
    NAV44.forEach(function(g){
      var shut=!!NAVSHUT44[g[0]],n=0,bad=false;
      if(shut)g[1].forEach(function(k){var x=c&&c[k];if(x&&x.n&&!isNaN(+x.n)){n+=+x.n;if(x.bad)bad=true;}});
      h=h.replace('<div class="slabel">'+esc(g[0])+'</div>','<button type="button" class="slabel s44" data-navtog="'+esc(g[0])+'" aria-expanded="'+(shut?'false':'true')+'"><span>'+esc(g[0])+'</span>'+(shut&&n?'<i class="s44n'+(bad?' bad':'')+'">'+n+'</i>':'')+'<b aria-hidden="true">'+(shut?'▸':'▾')+'</b></button>');
    });
    return h;
  };
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-navtog]");if(!b)return;e.stopPropagation();
    var g=b.dataset.navtog;if(NAVSHUT44[g])delete NAVSHUT44[g];else NAVSHUT44[g]=1;
    try{localStorage.setItem("bb.navshut",JSON.stringify(NAVSHUT44));}catch(er){}
    render();
  },true);

  /* ---- 3. Today: Claude card, short Do now, one fold for the rest ---- */
  var DQOPEN44={},MORE44=false;try{MORE44=localStorage.getItem("bb.today.more")==="1";}catch(e){}
  function w44Post(){
    if(view!=="today")return;
    var pg=document.querySelector("main .page-today");if(!pg)return;
    w44Fetch(false);
    var D=w44Data();
    var st=pg.querySelector('[data-ccgo="working"]');
    if(st){st.removeAttribute("data-ccgo");st.setAttribute("data-view","work");var b=st.querySelector("b");if(b)b.textContent=D.work.length;var sp=st.querySelector("span");if(sp)sp.textContent="Claude working";}
    var col=pg.querySelector("#cc-working");
    if(col){
      col.innerHTML='<h3>Claude is working on <small>'+D.work.length+'</small></h3>'
        +(D.work.length?'<ul class="w44-list w44-mini">'+D.work.slice(0,4).map(function(x){return x.html;}).join("")+'</ul>':'<p class="empty">Nothing right now.</p>')
        +(D.need.length?'<p class="w44-needs"><b>'+D.need.length+'</b> stopped for you</p>':'')
        +'<button type="button" class="more" data-view="work">See everything Claude is doing →</button>';
    }
    /* Do now: answer box opens on demand */
    pg.querySelectorAll("#sec-dq .dq-card").forEach(function(card){
      var inn=card.querySelector(".dq-in");if(!inn)return;
      var ta=inn.querySelector("textarea"),key=((card.querySelector(".dq-title")||{}).textContent||"").trim().slice(0,80);
      if(DQOPEN44[key]||(ta&&ta.value.trim()))return;
      card.classList.add("dq-short");
      var acts=card.querySelector(".dq-acts");if(!acts||acts.querySelector("[data-dqans]"))return;
      var btn=document.createElement("button");btn.type="button";btn.className="btn";btn.dataset.dqans=key;btn.textContent="Answer";
      acts.insertBefore(btn,acts.firstChild);
    });
    /* fold the long, look-back sections into one */
    if(!pg.querySelector("details.more44")){
      var parts=["#sec-chg","#sec-log","#sec-login-mini"].map(function(s){return pg.querySelector(s);}).filter(Boolean);
      if(parts.length){
        var d=document.createElement("details");d.className="panel more44";if(MORE44)d.open=true;
        d.innerHTML='<summary>More for today <small>'+parts.map(function(p){var h=p.querySelector("h2");return h?esc((h.childNodes[0]&&h.childNodes[0].textContent||h.textContent).trim()):"";}).filter(Boolean).join(" · ")+'</small></summary><div class="more44-b"></div>';
        var ft=pg.querySelector(":scope > footer");pg.insertBefore(d,ft||null);
        var box=d.querySelector(".more44-b");parts.forEach(function(p){box.appendChild(p);});
        d.addEventListener("toggle",function(){MORE44=d.open;try{localStorage.setItem("bb.today.more",d.open?"1":"0");}catch(e){}});
      }
      /* the now/next card goes to the top of Today */
      var fc=pg.querySelector("section.focus"),top=pg.querySelector(".tday-top");
      if(fc&&top)top.insertBefore(fc,top.firstChild);
      try{buildJump();}catch(e){}
    }
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-dqans]");if(!b)return;
    DQOPEN44[b.dataset.dqans]=1;var card=b.closest(".dq-card");if(card){card.classList.remove("dq-short");b.remove();var ta=card.querySelector(".dq-in textarea");if(ta)ta.focus();}
  });

