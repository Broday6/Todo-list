  /* ===== Fixes from the Nov 5 click-test audit ===== */
  /* 1-2. hhmm was declared twice (minutes vs Date); the later one broke Pull into today and drag-to-reschedule. */
  hhmm=function(x){if(x instanceof Date)return pad(x.getHours())+":"+pad(x.getMinutes());var m=Math.round(+x||0);return pad(Math.floor(m/60))+":"+pad(m%60);};
  /* 4. Claude drafts the reply: college rows (key "college:<id>") */
  document.addEventListener("click",function(e){
    var r=e.target.closest&&e.target.closest("[data-ibrep]");if(!r)return;var key=r.dataset.ibrep;if(!/^college:/.test(key))return;
    e.stopImmediatePropagation();var id=key.slice(8),c=((state.hiring&&state.hiring.colleges)||[]).filter(function(x){return x.id===id;})[0],m=c&&c.mail;
    if(!m||!mcp||live.chatSending)return;
    progSend(progKey("rep",key),"Draft my reply to this college email and save it in my Outlook Drafts as a reply (create reply draft on "+m.uri+"). Subject: “"+(m.subject||"")+"” from "+(m.from||c.name)+". College row "+c.id+" ("+c.name+"): status "+(c.status||"")+", next step “"+(c.next||"")+"”"+(c.heard?", they said: "+clip(c.heard,200):"")+". Follow my email playbook in Notion (\"How Brody writes email\"). Never send. Put the draft on that hiring college row as row.reply = {state:\"draft\", link, subject, at} and add a draft object to your Live chat reply.");
  },true);
  /* composer: don't lose typed text to a stray backdrop click or Escape */
  var mailArm=0;
  function mailHasText(){var ta=document.querySelector(".mailbox textarea.mbody");return !!(ta&&String(ta.value||"").trim());}
  function mailGuard(e){if(!mail||mail.sending||!mailHasText())return false;if(Date.now()-mailArm<4000){mailArm=0;return false;}mailArm=Date.now();e.stopImmediatePropagation();e.preventDefault();chip("You have a draft here. Press again to close it, or use ×.");return true;}
  document.addEventListener("click",function(e){if(e.target&&e.target.dataset&&e.target.dataset.mailbg)mailGuard(e);},true);
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&mail)mailGuard(e);},true);
  /* hidden errors: show jump-bar problems in the console instead of swallowing them */
  var _buildJumpRaw=buildJump;buildJump=function(){try{_buildJumpRaw();}catch(err){try{console.error("Ultron jump bar:",err);}catch(x){}}};
  /* 5. Back to top: toggle on every page, with or without a jump bar */
  var _jumpActiveRaw=jumpActive;jumpActive=function(){var tt=document.querySelector(".totop");if(tt)tt.classList.toggle("show",window.scrollY>1200);_jumpActiveRaw();};
