  /* ===== Board chats (Nov 9, Brody: "the chats that board spawns we need a group for them to go so i can easily find the chats" /
     "i still dont know where to find these"). Every chat the board starts is recorded in state.chats with its session link,
     listed on the Live chat tab and linked from the task it worked on. In the Claude app they are titled "Ultron · …". */
  function bcList(){if(!Array.isArray(state.chats))state.chats=[];return state.chats;}
  function bcLabel(origin,itemId){
    var o=String(origin||""),m=/^task:(.+)$/.exec(o);
    if(m){var t=(state.tasks||[]).find(function(x){return x.id===m[1];});return t?t.title:"Task "+m[1];}
    var it=chItems().find(function(x){return x.id===itemId;});
    return it?String(it.text||"").replace(/\s+/g," ").slice(0,90):"Board chat";
  }
  function bcRec(){
    var r=live.chatRun;if(!r||!r.sid)return;
    var L=bcList();if(L.some(function(x){return x.sid===r.sid;}))return;
    var o=String(r.origin||""),m=/^task:(.+)$/.exec(o);
    L.unshift({sid:r.sid,t:new Date(r.at||Date.now()).toISOString(),label:bcLabel(o,r.item),origin:o,task:m?m[1]:"",item:r.item||""});
    if(L.length>60)L.length=60;
    var it=chItems().find(function(x){return x.id===r.item;});if(it)it.sid=r.sid;
    if(m){var t=(state.tasks||[]).find(function(x){return x.id===m[1];});if(t)t.chatSid=r.sid;}
    save();
  }
  setInterval(bcRec,4000);
  function bcWhen(iso){var d=new Date(iso);if(isNaN(d))return "";return d.toLocaleDateString([], {month:"short",day:"numeric"})+" "+d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});}
  function bcPanelHTML(){
    var L=bcList(),h='<section class="panel bc" id="sec-bchats"><h2>Your board chats <small>'+L.length+' saved</small></h2>';
    h+='<p class="hint">Every chat Ultron starts for you (Live chat, Give to Claude, Hand off, ⚡, Dig deeper). In the Claude app they are titled <b>Ultron · …</b>; search that to find them.</p>';
    if(!L.length)h+='<p class="empty">None yet. The next one you start shows up here with an Open link.</p>';
    else{h+='<ul class="bc-list">'+L.slice(0,15).map(function(x){return '<li><a href="'+esc(sessLink(x.sid))+'" target="_blank" rel="noopener"><span class="bc-t">'+esc(x.label||"Board chat")+'</span><span class="bc-w">'+esc(bcWhen(x.t))+' · Open ↗</span></a></li>';}).join("")+'</ul>';}
    return h+'</section>';
  }
