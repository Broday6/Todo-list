  /* ===== Queued but not started (Nov 6, Brody: "why didn't they get checked, we need to make sure this doesn't happen again") =====
     Any task given to Claude that has sat in the queue 15+ minutes without a run shows in Waiting on Claude with Start now. */
  function qGivenAt(t){var th=t.thread||[];for(var i=th.length-1;i>=0;i--){if(th[i].role==="user"&&/^Given to Claude/.test(th[i].text||""))return th[i].t;}return t.doSentAt||"";}
  function queuedStale(){return state.tasks.filter(function(t){if(t.done||t.assignee!=="claude"||t.claudeStatus!=="queued"||t.pcOnly)return false;var g=qGivenAt(t),ds=t.doSentAt||"";if(!g)return false;var started=ds&&ds>=g;var age=(Date.now()-Date.parse(g))/60000;return !started&&age>=15;});}
  var _waitQBase=waitClaudeHTML;
  waitClaudeHTML=function(){
    var h=_waitQBase(),q=queuedStale();if(!q.length)return h;
    var rows=q.map(function(t){return '<li class="late"><div class="wq-t">'+esc(clip(t.title,140))+'</div><div class="wq-m">Given to Claude '+esc(clk(qGivenAt(t)))+' · <b>not started yet</b></div><div class="wq-a">'+(mcp?'<button type="button" class="btn" data-qstart="'+esc(t.id)+'">Start now</button>':'')+'<button type="button" class="linkbtn" data-opentask="'+esc(t.id)+'">Open</button></div></li>';}).join("");
    if(h)return h.replace('<ul class="wq-list">','<ul class="wq-list">'+rows);
    return '<section class="panel wq" id="sec-waiting"><h2>Waiting on Claude <small><b>'+q.length+'</b> queued, not started</small></h2><ul class="wq-list">'+rows+'</ul></section>';
  };
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-qstart]");if(!b)return;var t=findTask(b.dataset.qstart);if(!t||!mcp||live.chatSending)return;t.doSentAt=new Date().toISOString();progSend(progKey("do",t.id),doMsg(t));chip("Started.");});
