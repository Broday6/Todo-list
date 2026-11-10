  /* ===== Open the Ultron chat behind each task (Nov 10, patch47; Brody: "Under claude at work i need to be able to open the
     ultron chat that it is working through"). The board chat routine reports its newest run (fired_at + session_id) through
     get_trigger. When that run fired within 2 minutes after a task's newest start, it is that task's chat: save it on the task
     (chatSid and the run's sid) so the Open chat button stays. Rows still without a link get "Find it in chat history". */
  var LR47={at:0,busy:false,lr:null};
  function lr47Fetch(){
    if(!mcp||LR47.busy||Date.now()-LR47.at<30000)return;LR47.busy=true;
    mcp.callTool(CCR,"get_trigger",{trigger_id:CHAT_TRIG},{cache:false}).then(function(res){
      LR47.busy=false;LR47.at=Date.now();var p=ccrP(res),t=p&&(p.trigger||p);LR47.lr=(t&&t.last_run)||null;
      if(t&&t.mcp_connections&&!(W44.trig&&W44.trig.length))W44.trig=t.mcp_connections.map(function(c){return c.name;});
      if(lr47Match()&&(view==="work"||view==="today"))render();
    },function(){LR47.busy=false;LR47.at=Date.now();});
  }
  function lr47Match(){
    var lr=LR47.lr;if(!lr||!lr.session_id||!lr.fired_at)return false;
    var f=Date.parse(lr.fired_at),sid=String(lr.session_id).replace(/^cse_/,"session_"),hit=false;
    state.tasks.forEach(function(t){
      if(!t||!Array.isArray(t.runs))return;
      for(var i=t.runs.length-1;i>=0;i--){var r=t.runs[i];if(!r||r.why==="done")continue;var d=f-Date.parse(r.t);
        if(d>=-10000&&d<=120000){if(r.sid!==sid){r.sid=sid;t.chatSid=sid;hit=true;}}break;}
    });
    if(hit)save();return hit;
  }
  setInterval(function(){if(view==="work"||view==="today")lr47Fetch();},10000);
  function lr47Start(t){var R=(t&&t.runs)||[];for(var i=R.length-1;i>=0;i--)if(R[i]&&R[i].why!=="done")return R[i].t;return "";}
  var _w44Btns47=w44Btns;
  w44Btns=function(sid,tid){
    var h=_w44Btns47(sid,tid);if(sid||!tid)return h;
    var t=findTask(tid),st=lr47Start(t);
    return h+'<a class="linkbtn" href="https://claude.ai/code/routines" target="_blank" rel="noopener" title="This chat started before the board saved links. In Routines, open “Ultron board chats” and pick the run'+(st?' at '+esc(new Date(st).toLocaleString([], {weekday:"short",hour:"numeric",minute:"2-digit"})):'')+'.">Find it in chat history ↗</a>';
  };
  /* the old "No chat link" note is replaced by the button above */
  var _w44Row47=w44Row;
  w44Row=function(){var h=_w44Row47.apply(this,arguments);return h.replace(/<span class="w44-nl"[^>]*>No chat link<\/span>/,'');};
  /* the board's own task fires: bcRec only matched "task:" origins; also save "do:" runs (patch44 covers it) and check the routine right after a fire */
  var _progSend47=progSend;
  progSend=function(key,text){var r=_progSend47.apply(this,arguments);if(/^do:/.test(String(key||""))){setTimeout(function(){LR47.at=0;lr47Fetch();},9000);setTimeout(function(){LR47.at=0;lr47Fetch();},25000);}return r;};

