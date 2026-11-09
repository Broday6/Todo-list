  /* ===== UX pass (Nov 9, Brody: "ui ux and workflow fixes or ways we can improve communication").
     1. Inbox: automated alert emails are not "Needs your reply"; they stay tasks under No reply needed.
     2. Claude tab: a blocked task whose last note says what Brody must do reads "Your step", not "Stuck".
     3. Live chat: says so when a message never started (usage limit, error) or when the chat is waiting on Brody.
     4. Board chats list shows each chat's state.
     5. Sources strip shows only what needs attention. */
  function ux31Alert(m,t){
    var s=String((m&&m.subject)||""),f=String((m&&m.from)||(t&&t.from)||"");
    if(/^\s*(re|fw|fwd)\s*:/i.test(s))return false;
    return /^(E-Commerce (Alert|Lead)\s*:|NS Alert\b|ALERT - |Daily Backorder List)/i.test(s)||(/^PCI Enterprises$/i.test(f)&&/alert/i.test(s));
  }
  var _mFromTask31=mFromTask;
  mFromTask=function(t,grp){var it=_mFromTask31(t,grp);if(it&&it.st==="needs"&&ux31Alert(it.mail,t)){it.st="none";it.alert=true;}return it;};

  CL_LABEL.blocked="Needs you";
  var _ny31=needsYouItems;
  needsYouItems=function(){
    var L=_ny31()||[];
    L.forEach(function(x){
      if(!x||!/>Stuck</.test(x.tag||""))return;
      var m=/^\s*Needs you\b\s*[:,.]?\s*/i.exec(x.d||"");
      if(m){x.tag='<span class="stag warn">Your step</span>';x.d=x.d.slice(m[0].length);x.d=x.d.charAt(0).toUpperCase()+x.d.slice(1);}
    });
    return L;
  };

  var ux31Busy=false,ux31At=0;
  function ux31Fresh(r){return !!(r&&r.at&&Date.now()-r.at<6*3600000);}
  function ux31Watch(){
    var r=live.chatRun;
    if(r&&r.sid){
      var b=String(r.bucket||""),st=/WORKING/.test(b)?"working":/BLOCKED|REQUIRES/.test(b)?"needs you":/FAILED/.test(b)?"failed":/COMPLETED|REVIEW_READY/.test(b)?"done":"";
      var e=bcList().find(function(x){return x.sid===r.sid;});
      if(e&&st&&e.st!==st){e.st=st;save();if(view==="chat")render();}
    }
    if(!r||!mcp||r.fail||r.sid||ux31Busy)return;
    var age=Date.now()-(r.at||0);
    if(age<8000||age>25*60000||Date.now()-ux31At<15000)return;
    ux31At=Date.now();ux31Busy=true;
    mcp.callTool(CCR,"get_trigger",{trigger_id:CHAT_TRIG},{cache:false}).then(function(res){
      ux31Busy=false;
      var p=ccrP(res),t=p&&(p.trigger||p),lr=t&&t.last_run;
      if(!lr||!lr.fired_at||Date.parse(lr.fired_at)<r.at-120000||!/FAIL|ERROR|CANCEL/.test(String(lr.status||"")))return;
      var why=String(lr.failure_reason||"");
      r.fail=(!why||/UNSPECIFIED/.test(why))?"it failed to start":why.replace(/^ROUTINE_RUN_FAILURE_REASON_/,"").toLowerCase().replace(/_/g," ");
      r.done=true;
      var it=chItems().find(function(x){return x.id===r.item;});if(it)it.err=1;
      save();render();
      setTimeout(function(){chip("Claude couldn’t start on your message: "+r.fail+". Open Live chat to send it again.",true);},1600);
    },function(){ux31Busy=false;});
  }
  setInterval(ux31Watch,5000);
  function ux31NoticeHTML(){
    var r=live.chatRun;if(!ux31Fresh(r))return '';
    if(r.fail)return '<p class="ux-note bad" role="status">Claude couldn’t start on your last message: '+esc(r.fail)+'. Nothing was lost. Press <b>Send again</b> under the message'+(/limit/.test(r.fail)?' once the limit resets':'')+'.</p>';
    var b=String(r.bucket||""),l=r.sid?sessLink(r.sid):"";
    if(l&&/BLOCKED|REQUIRES/.test(b))return '<p class="ux-note warn" role="status">Claude is waiting on you in that chat. <a href="'+esc(l)+'" target="_blank" rel="noopener">Open it ↗</a></p>';
    if(l&&/FAILED/.test(b))return '<p class="ux-note bad" role="status">That chat hit an error. <a href="'+esc(l)+'" target="_blank" rel="noopener">Open it ↗</a> or send your message again.</p>';
    return '';
  }
  bcPanelHTML=function(){
    var L=bcList(),TAG={working:"acc","needs you":"warn",failed:"bad",done:"ok"};
    var h='<section class="panel bc" id="sec-bchats"><h2>Your board chats <small>'+L.length+' saved</small></h2>';
    h+='<p class="hint">Every chat Ultron starts for you. In Claude they sit together in your <b>Ultron</b> project (Code tab), titled <b>Ultron · …</b>.</p>';
    if(!L.length)h+='<p class="empty">None yet. The next one you start shows up here with an Open link.</p>';
    else{h+='<ul class="bc-list">'+L.slice(0,15).map(function(x){
      return '<li><a href="'+esc(sessLink(x.sid))+'" target="_blank" rel="noopener"><span class="bc-t">'+esc(x.label||"Board chat")+'</span><span class="bc-w">'+(x.st&&TAG[x.st]?'<span class="stag '+TAG[x.st]+'">'+esc(x.st.charAt(0).toUpperCase()+x.st.slice(1))+'</span> ':'')+esc(bcWhen(x.t))+' · Open ↗</span></a></li>';}).join("")+'</ul>';}
    return h+'</section>';
  };
  srcStripHTML=function(){
    var L=srcList();if(!L.length)return '';
    var probs=L.filter(function(x){return srcState(x)!=="ok";}),ok=L.length-probs.length;
    var h='<section class="srcstrip ux-src'+(probs.length?' has-prob':'')+'" aria-label="Source health">';
    if(!probs.length)return h+'<button type="button" class="srcchip ok" data-view="auto" title="Open source health"><i></i>All '+L.length+' sources ready</button></section>';
    h+='<span class="srcl">Needs a look</span>';
    probs.forEach(function(x){h+='<button type="button" class="srcchip '+srcState(x)+'" data-view="auto" title="Open source health"><i></i>'+esc(x.name)+': '+esc(srcWhy(x))+'</button>';});
    if(ok)h+='<button type="button" class="srcchip ok" data-view="auto" title="Open source health"><i></i>'+ok+' other'+(ok===1?'':'s')+' ready</button>';
    return h+'</section>';
  };
  /* The progress bar used to say "Finished. Claude saved its answer" whenever the run stopped, even when it never
     started or stopped to wait for Brody. Say what actually happened. */
  var _prog31=progState;
  progState=function(key){
    var s=_prog31(key),r=live.chatRun;
    if(!s||!r||r.origin!==key)return s;
    if(r.fail)return {step:0,txt:"Didn’t start: "+r.fail+". Send it again"+(/limit/.test(r.fail)?" once the limit resets.":".")};
    if(!s.done)return s;
    var b=String(r.bucket||"");
    if(/BLOCKED|REQUIRES/.test(b))return {step:2,txt:"Claude stopped to wait for you. Open the chat from Live chat › Your board chats."};
    if(/FAILED/.test(b))return {step:2,txt:"That chat hit an error before it finished. Open it from Live chat › Your board chats, or send again."};
    if(!r.sid&&!r.fin)return {step:0,txt:"No sign that Claude started. Send it again."};
    return s;
  };
