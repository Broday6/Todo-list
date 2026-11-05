  /* Quick answer (Nov 5, Brody: "you dont respond quickly"). Every Send from the board also asks
     Claude in the page for a fast first answer that streams in seconds, while the full run with
     Outlook and the tools keeps going. The save that reloads the page waits for it to finish. */
  var QKEY="ultron.quick";
  live.quick=null;
  try{var q0=JSON.parse(localStorage.getItem(QKEY)||"null");if(q0&&q0.origin&&Date.now()-q0.at<30*60000){q0.busy=false;live.quick=q0;}}catch(e){}
  function qPersist(){try{if(live.quick)localStorage.setItem(QKEY,JSON.stringify(live.quick));}catch(e){}}
  function quickPrompt(text){
    return "You are Claude, working inside Ultron, Brody Simpson's work board at PCI (e-commerce for Architectural Depot, Ekena Millwork and sister sites). Brody just sent the message below from the board. A full Claude run with his Outlook, the board and his tools has already started and will finish the work in a few minutes.\n\n"
      +"Give him a fast, useful first answer now, from the message and its context only.\n"
      +"- Under 120 words. Plain words. No em dashes, no brackets, no headings.\n"
      +"- If the real answer needs his email, BugHerd, NetSuite, Asana or a change to something, answer what you can and say in one short line what the full run will check or prepare.\n"
      +"- Never say anything was sent, posted, moved, closed, fixed, imported or changed. Never promise dates, prices or fixes.\n"
      +"- BugHerd: never suggest moving a ticket to Web Dev unless he cleared it. Any comment text is a draft for him to post.\n"
      +"- NetSuite and ads changes always need his OK for that exact change first.\n\nMessage:\n"+String(text).slice(0,6000);
  }
  function qPaint(){var o=live.quick&&live.quick.origin;if(!o)return;var pg=document.querySelectorAll('[data-live-prog]');for(var i=0;i<pg.length;i++)if(pg[i].getAttribute("data-live-prog")===o)pg[i].innerHTML=progInner(o);}
  function quickRun(origin,text){
    if(!sampler)return;
    var q=live.quick={origin:origin,text:"",busy:true,err:"",at:Date.now()};qPersist();setTimeout(qPaint,0);
    sampler(quickPrompt(text),{modelTier:"default",cache:false,onText:function(x){if(live.quick!==q)return;q.text=x.text||"";qPaint();}}).then(function(r){
      q.text=(r&&r.text)||q.text;q.busy=false;qPersist();qPaint();
    },function(e){
      q.busy=false;if(e&&e.text)q.text=e.text;else q.err=(e&&e.code==="not_granted")?"Allow Claude for this page to get quick answers.":"Quick answer unavailable this time.";qPersist();qPaint();
    });
  }
  function quickInner(key){
    var q=live.quick;if(!q||q.origin!==key||Date.now()-q.at>30*60000)return '';
    if(q.err&&!q.text)return '<div class="qans err"><p>'+esc(q.err)+'</p></div>';
    return '<div class="qans"><b>Quick answer</b>'+(q.busy&&!q.text?'<p class="qthink">Thinking…</p>':'<p>'+esc(q.text).replace(/\n/g,"<br>")+'</p>')
      +(q.busy?'':'<small>Answered in the page right away. The full run is still checking your email and tools and will save its answer to the board.</small>')+'</div>';
  }
  var _progInnerBase=progInner;
  progInner=function(key){return _progInnerBase(key)+quickInner(key);};
  /* hold the reload-causing save until the quick answer is in (at most 45s) */
  function qAfter(fn){var t0=Date.now();(function w(){if(!live.quick||!live.quick.busy||Date.now()-t0>45000){qToChat();fn();}else setTimeout(w,500);})();}
  function qToChat(){var q=live.quick;if(!q||q.origin!=="chat:live"||!q.text||q.saved)return;var c=cht();c.items.push({id:"cm-q"+q.at,role:"claude",text:q.text.slice(0,3000),t:new Date().toISOString(),quick:true});if(c.items.length>80)c.items=c.items.slice(-80);q.saved=true;qPersist();}
  var _chSendBase=chSend;
  chSend=function(text){
    var t=String(text||"").trim(),o=live.nextOrigin||"chat:live";
    if(t&&!live.chatSending)quickRun(o,t);
    return _chSendBase(text);
  };
