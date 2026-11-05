  /* ---------- Live progress for anything sent to the Live chat routine ----------
     Send to Claude, Dig deeper (task or plan block) and Live chat all fire the same
     fresh-session routine. live.chatRun.origin says which button started it, so the
     bar shows up right under that button: Sent, Started, Working (with Claude's own
     one-line summary), Finished. */
  function progKey(kind,id){return kind+":"+id;}
  function progState(key){
    var r=live.chatRun;
    if(live.chatSending&&live.nextOrigin===key)return {step:0,txt:"Sending to Claude…"};
    if(!r||r.origin!==key)return null;
    var secs=Math.round((Date.now()-r.at)/1000),el=secs<60?secs+"s":Math.floor(secs/60)+"m "+(secs%60)+"s";
    if(r.done||r.fin)return {step:3,txt:"Finished after "+el+". Claude saved its answer to the board.",done:true};
    if(/WORKING/.test(r.bucket||""))return {step:2,txt:"Working"+(r.sum?": "+r.sum:"…")+" ("+el+")"};
    if(r.sid)return {step:1,txt:"Claude started ("+el+")…"};
    return {step:0,txt:"Sent. Waiting for Claude to start ("+el+")…"};
  }
  function progInner(key){
    var s=progState(key);if(!s)return '';
    var labels=["Sent","Started","Working","Done"],h='<ol class="pbar'+(s.done?' done':'')+'" aria-label="Progress">';
    labels.forEach(function(l,i){h+='<li class="'+(i<s.step||s.done?'ok':i===s.step?'cur':'')+'"><i></i><span>'+l+'</span></li>';});
    h+='</ol><p class="ptxt" role="status">'+esc(s.txt)+(s.done?' <button type="button" class="linkbtn" data-reloadpage>Reload to see it</button>':'')+'</p>';
    return h;
  }
  function progHTML(key){return '<div class="prog2" data-live-prog="'+esc(key)+'">'+progInner(key)+'</div>';}
  function progSend(key,text){live.nextOrigin=key;chSend(text);}
  /* Finish detection: the fresh routine's last_run gets finished_at when it ends. */
  setInterval(function(){
    var r=live.chatRun;if(!r||!r.origin||r.done||r.fin||!mcp||document.visibilityState==="hidden")return;
    mcp.callTool(CCR,"get_trigger",{trigger_id:CHAT_TRIG},{cache:false}).then(function(res){
      var p=ccrP(res),t=p&&(p.trigger||p),lr=t&&t.last_run;
      if(lr&&lr.fired_at&&Date.parse(lr.fired_at)>=r.at-120000){
        if(lr.session_id&&!r.sid)r.sid=String(lr.session_id).replace(/^cse_/,"session_");
        if(lr.finished_at&&/SUCC|FAIL|ERROR|CANCEL/.test(String(lr.status||""))){r.fin=lr.finished_at;r.done=true;if(/FAIL|ERROR|CANCEL/.test(String(lr.status)))r.failed=true;}
      }
      liveRender();
    },function(){});
  },8000);
  setInterval(function(){if(live.chatRun&&live.chatRun.origin&&!live.chatRun.done)liveRender();},1000);
  document.addEventListener("click",function(e){if(e.target.closest("[data-reloadpage]")){try{location.reload();}catch(x){}}});

