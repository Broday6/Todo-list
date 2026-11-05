  /* ---------- Send in Teams (Brody, Nov 5: "the teams tool should be connected so we can send messages through") ----------
     Only Brody's own double tap sends. Claude never posts on its own. */
  var twArm={},twSending=null;
  function twChatId(x){
    if(x.chatId&&/^19:/.test(x.chatId))return x.chatId;
    var m=/\/l\/message\/([^\/?]+)\//.exec(String(x.webUrl||""));
    if(m){try{var c=decodeURIComponent(m[1]);if(/^19:/.test(c))return c;}catch(e){}}
    return "";
  }
  function twSendBtn(x){
    if(!mcp||!x.replyDraft||!twChatId(x))return '';
    if(twSending===x.id)return '<button type="button" class="btn" disabled>Sending…</button>';
    var armed=twArm[x.id]&&Date.now()-twArm[x.id]<8000;
    return '<button type="button" class="btn'+(armed?' armed':'')+'" data-twsend="'+esc(x.id)+'">'+(armed?'Tap again to send to '+esc((x.from||"").split(" ")[0]||"them"):'Send in Teams')+'</button>';
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-twsend]");if(!b)return;
    var x=twFind(b.dataset.twsend);if(!x||!mcp||twSending)return;
    var ta=document.querySelector('textarea[data-twrt="'+x.id+'"]');if(ta)x.replyDraft=ta.value;
    var text=String(x.replyDraft||"").trim(),cid=twChatId(x);if(!text||!cid)return;
    if(!(twArm[x.id]&&Date.now()-twArm[x.id]<8000)){twArm[x.id]=Date.now();render();setTimeout(function(){if(twArm[x.id]){delete twArm[x.id];render();}},8200);return;}
    delete twArm[x.id];twSending=x.id;render();
    mcp.callTool("Microsoft 365","teams_send_chat_message",{chatId:cid,body:text,bodyType:"text"},{cache:false}).then(function(){
      twSending=null;x.sent={t:new Date().toISOString(),text:clip(text,1500)};x.hint="Looks handled: you replied in Teams "+clk(x.sent.t)+".";delete x.replyDraft;save();chip("Sent in Teams.");
    },function(err){
      twSending=null;render();
      chip((err&&err.code==="not_granted")?"Allow Teams sending for this page, then tap Send again.":"Couldn’t send: "+((err&&err.message)?String(err.message).slice(0,100):"try again"),true);
    });
  });

