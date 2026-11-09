  /* ===== Reliability pass (Nov 9, patch32; Brody: "improve automations headaches and other problems that we were having").
     1. Live chat again fires a routine the board is allowed to start (CHAT_TRIG is set by patch32.py).
     2. A message that doesn't send keeps its reason and says what happens next (the hourly run answers it).
     3. "Clear in one sitting": every task waiting on Brody, grouped by the one sign-in or answer that clears it,
        with one copy-paste prompt per sign-in for Claude on his PC.
     4. Routine status never says "Missed a run" from a stale saved date: cloud routines are judged on live data
        (cached per browser), PC jobs on the newest run receipt. */

  /* ---- 2. failed sends ---- */
  function ux32Why(s){
    s=String(s||"").replace(/^Couldn’t reach Claude:\s*/,"");
    if(/can only fire routines they created|created via/i.test(s))return "the board isn’t allowed to start that routine";
    if(/limit/i.test(s))return "usage limit reached";
    return s.slice(0,140);
  }
  var _chFire32=chFire;
  chFire=function(item){
    _chFire32(item);
    var n=0,iv=setInterval(function(){
      n++;
      if(live.chatSending&&n<240)return;
      clearInterval(iv);
      if(item&&item.err&&live.chatErr&&!/Allow Claude Code Remote/.test(live.chatErr)){item.why=ux32Why(live.chatErr);save();if(view==="chat")render();}
      else if(item&&!item.err&&item.why){delete item.why;}
    },250);
  };
  var _notice32=ux31NoticeHTML;
  ux31NoticeHTML=function(){
    var h=_notice32(),it=chItems(),last=it[it.length-1];
    if(!h&&last&&last.role==="user"&&last.err)h='<p class="ux-note bad" role="status">Your last message didn’t reach Claude'+(last.why?': '+esc(last.why):'')+'. It’s saved. Press <b>Send again</b> under it, or leave it: the hourly check (weekdays, 12 past the hour, 7 to 5) answers messages that didn’t send.</p>';
    return h;
  };

  /* ---- 3. Clear in one sitting ---- */
  var SIT_BLOB="https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/";
  var SIT_G=[
    {k:"answer",n:"Just your answer",s:"No sign-in needed. Answer on the task and Claude carries on."},
    {k:"miva",n:"Miva admin",s:"Sign in to the AD Miva admin on your PC once.",re:/\bmiva\b/i,pc:1},
    {k:"netsuite",n:"NetSuite",s:"Sign in to NetSuite on your PC once.",re:/netsuite/i,pc:1},
    {k:"pa",n:"Power Automate",s:"One flow fix clears these.",re:/power automate/i},
    {k:"teams",n:"Teams",s:"The replies are written. Copy, paste and send.",re:/\bteams\b/i},
    {k:"pc",n:"Claude on your PC",s:"Scheduled tasks and prompts that only run on your PC.",re:/scheduled task|run now|claude code on your pc|pc prompt|on your pc|setx|api key/i,pc:1}
  ];
  function sitStep(t){if(/\?\s*$/.test(String(t.blockedBy||""))&&!/\?\s*$/.test(String(t.unlockBy||t.needs||"")))return String(t.blockedBy);return String(t.unlockBy||t.needs||(t.goAsk&&t.goAsk.what?"Say go: "+t.goAsk.what:"")||t.blockedBy||t.note||"");}
  function sitKind(t){
    var u=String(t.unlockBy||t.needs||""),b=String(t.blockedBy||""),i;
    if(/^wd-/.test(t.id))return "pc";
    if(t.pcOnly&&t.goAsk&&!t.unlockBy)return "answer";
    if(/^\s*(say|ok|tell me|pick|choose|decide|approve)\b/i.test(u)||/\?\s*$/.test(u))return "answer";
    if(SIT_G[3].re.test(u))return "pa";
    for(i=1;i<SIT_G.length;i++)if(SIT_G[i].re.test(u))return SIT_G[i].k;
    if(!u)for(i=1;i<SIT_G.length;i++)if(SIT_G[i].re.test(b))return SIT_G[i].k;
    return "answer";
  }
  function sitPrompt(t){
    var urls=[],r=t.receipt;
    if(r&&r.where)r.where.forEach(function(w){if(w&&w.url)urls.push(String(w.url));});
    (t.thread||[]).forEach(function(m){var x=String((m&&m.text)||"").match(/https:\/\/github\.com\/Broday6\/todo-list\/blob\/[^\s)"']+/g);if(x)urls=urls.concat(x);});
    for(var i=urls.length-1;i>=0;i--){var u=urls[i].replace(/[.,;]+$/,"");if(u.indexOf(SIT_BLOB)===0&&/prompt/i.test(u)&&/\.md$/i.test(u))return u;}
    return "";
  }
  function sitList(){
    var G={},n=0;
    (state.tasks||[]).forEach(function(t){
      if(!t||t.done||t.dropped)return;
      if(!(t.unlockBy||t.needs||t.blockedBy||/^wd-/.test(t.id)||(t.pcOnly&&t.goAsk)))return;
      var k=sitKind(t);(G[k]=G[k]||[]).push(t);n++;
    });
    return {G:G,n:n};
  }
  function sitText(k){
    var g=SIT_G.filter(function(x){return x.k===k;})[0],L=sitList().G[k]||[];if(!g||!L.length)return "";
    var s="I'm signed in to "+(k==="pc"?"this PC":g.n+" on this PC")+". Work these "+L.length+" task"+(L.length===1?"":"s")+" from Ultron, my work board, in one sitting, in this order. Board: https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7\n\n";
    s+="Rules: show me the exact change and wait for my OK before anything is changed in NetSuite, Miva or the ads accounts. Never send email and never post in Teams. Import files are named \"...-NOT-IMPORTED.csv\". Never type passwords; if a sign-in page appears, stop and tell me.\n\n";
    s+="For each task: read the task and its thread on the board first, do the step, then write the result into that task's thread on the board (start it \"Done:\" or \"Needs you:\") and update its receipt. If something doesn't match what the task says, stop and ask me.\n";
    L.forEach(function(t,i){
      var p=sitPrompt(t);
      s+="\n"+(i+1)+". "+t.id+": "+t.title+"\n   Step: "+sitStep(t)+"\n";
      if(p)s+="   Prompt file in the todo-list repo (branch claude/brodys-board-v2-fuviv5): "+p.slice(SIT_BLOB.length)+" . Follow it exactly.\n";
    });
    return s;
  }
  function sitHTML(){
    var S=sitList();if(!S.n)return '';
    var signins=SIT_G.filter(function(g){return g.k!=="answer"&&(S.G[g.k]||[]).length;}).length;
    var h='<section class="panel sit" id="sec-sit"><h2>Clear in one sitting <small>'+S.n+' task'+(S.n===1?'':'s')+' wait on you'+(signins?' · '+signins+' sign-in'+(signins===1?'':'s'):'')+'</small></h2>';
    h+='<p class="hint">Everything Claude can’t finish alone, grouped by the one thing that clears it. Do a group in one go instead of opening each task.</p>';
    SIT_G.forEach(function(g){
      var L=S.G[g.k]||[];if(!L.length)return;
      h+='<div class="sit-g"><h3>'+esc(g.n)+' <span class="stag '+(g.k==="answer"?'acc':'warn')+'">'+L.length+'</span><small>'+esc(g.s)+'</small></h3><ul>';
      L.forEach(function(t){
        var p=sitPrompt(t);
        h+='<li><div><div class="sit-t">'+esc(clip(t.title,90))+'</div><div class="sit-s">'+esc(clip(sitStep(t),230))+'</div></div><span class="sit-b">'+(p?'<a class="linkbtn" href="'+esc(p)+'" target="_blank" rel="noopener">PC prompt ↗</a>':'')+'<button type="button" class="linkbtn" data-opentask="'+esc(t.id)+'">Open</button></span></li>';
      });
      h+='</ul>';
      if(g.pc)h+='<div class="sit-a"><button type="button" class="btn" data-sitcopy="'+g.k+'">Copy one prompt for '+(L.length===1?'this task':'all '+L.length)+'</button><span class="sit-s">Paste it into Claude on your PC after you sign in.</span></div>';
      if(g.k==="teams")h+='<div class="sit-a"><button type="button" class="btn ghost" data-view="team">Open the Team tab</button></div>';
      h+='</div>';
    });
    return h+'</section>';
  }
  function sitMiniHTML(){
    var S=sitList();if(!S.n)return '';
    var parts=[];SIT_G.forEach(function(g){var c=(S.G[g.k]||[]).length;if(c)parts.push(g.k==="answer"?c+' need only your answer':esc(g.n)+' clears '+c);});
    return '<section class="panel sit-mini"><h2>Waiting on you <small>'+S.n+' task'+(S.n===1?'':'s')+'</small></h2><p>'+parts.join(' · ')+'</p><button type="button" class="btn ghost" data-view="claude" data-sitgo="1">Clear them in one sitting</button></section>';
  }
  var _claudeTab32=claudeTabHTML;
  claudeTabHTML=function(){var s=sitHTML();return (s?'<div class="sit-wrap">'+s+'</div>':'')+_claudeTab32();};
  var _nyTop32=nyTopHTML;
  nyTopHTML=function(){return ((view==="today"||!view)?sitMiniHTML():'')+_nyTop32();};
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-sitcopy]");
    if(b){var s=sitText(b.dataset.sitcopy);if(s)copyText(s);return;}
    if(e.target.closest("[data-sitgo]"))setTimeout(function(){var el=document.getElementById("sec-sit");if(el&&el.scrollIntoView)el.scrollIntoView({block:"start"});},80);
  });

  /* ---- 4. routine status from live data and run receipts ---- */
  var AUK32="ultron.aulast";
  try{var c32=JSON.parse(localStorage.getItem(AUK32)||"null");
    if(c32&&c32.at&&Date.now()-c32.at<36*3600000&&c32.d)Object.keys(c32.d).forEach(function(k){if(!AU_LAST[k])AU_LAST[k]=c32.d[k];});}catch(e){}
  setInterval(function(){try{if(Object.keys(AU_LAST).length)localStorage.setItem(AUK32,JSON.stringify({at:Date.now(),d:AU_LAST}));}catch(e){}},20000);
  var RUNJOB32={adsDaily:"Ads daily check (AD)",adsWeekly:"Ads weekly audit (AD)"};
  function ux32RunOf(r){
    var want=RUNJOB32[r.src]||r.name,hourly=/hourly/i.test(r.name||""),best=null;
    (state.runs||[]).forEach(function(x){
      if(!x||!x.at||x.status==="skipped")return;var j=String(x.job||"");
      if(j===want||(hourly&&/^Ultron hourly/.test(j))){if(!best||String(x.at)>String(best.at))best=x;}
    });
    return best;
  }
  var _auLive32=auLive;
  auLive=function(r){
    var lv=_auLive32(r),x=ux32RunOf(r);
    if(x){var d=auCT(x.at);if(!lv.on||d>=lv.on)lv={on:d,ok:x.status==="failed"?false:null};}
    return lv;
  };
  var _auState32=auState;
  auState=function(r){
    var s=_auState32(r);
    if(s&&s.t==="Missed a run"&&r.trig&&!AU_LAST[r.trig])return {k:"mut",t:(mcpTried&&!mcp)?"Can’t check from this view":"Checking…",on:s.on};
    return s;
  };
