  /* ===== Teams sending, take 2 (Nov 8, Brody: "I am hitting a wall when trying to send teams messages").
     The connector can't send Teams (IT hasn't granted ChatMessage.Send), and the artifact viewer can block the clipboard
     and pop-up windows. So: (a) the reply opens in a box with Copy and a plain link to the exact Teams message;
     (b) once Brody builds the Power Automate flow (Control room › Sources), Send in Teams emails the reply to Brody
     himself with subject "ULTRON-TEAMS <chatId>" and his flow posts it to that chat as him. Double tap, as always. */
  var u6tOpen={},u6tArm={},u6tBusy=null;
  function u6Flow(){var s=state.sourceSetup||{};return !!(s.teamsflow&&s.teamsflow.done);}
  if(typeof UL_SRC_LIST!=="undefined"&&!UL_SRC_LIST.some(function(x){return x.id==="teamsflow";}))UL_SRC_LIST.splice(1,0,{id:"teamsflow",name:"Send Teams replies (Power Automate)",what:"Your own flow posts board replies into the right Teams chat as you, so Send in Teams works without IT. Still only on your double tap.",step:"Build the 4-step flow in Power Automate (about 10 minutes), send one test, then tick I set this up.",link:UL_SRC_REPO.replace("sources-setup/","sources-setup/")+"teams-send-flow.md"});
  twSendBtn=function(x){if(!x||!x.replyDraft)return '';var id=esc(x.id);
    if(u6Flow()){if(u6tBusy===x.id)return '<button type="button" class="btn" disabled>Sending…</button>';var armed=u6tArm[x.id]&&Date.now()-u6tArm[x.id]<8000;return '<button type="button" class="btn'+(armed?' armed':'')+'" data-u6tflow="'+id+'">'+(armed?'Tap again to send to '+esc((x.from||"").split(" ")[0]||"them"):'Send in Teams')+'</button>';}
    var h='<button type="button" class="btn" data-u6topen="'+id+'">'+(u6tOpen[x.id]?'Hide':'Reply in Teams')+'</button>';
    if(u6tOpen[x.id]){var url=x.webUrl&&/^https:\/\/teams\.microsoft\.com\//.test(x.webUrl)?x.webUrl:u6ChatUrl(x);
      h+='<div class="u6-tbox"><p class="hint">Copy your reply, open the chat, paste and send.</p><textarea readonly id="u6tt-'+id+'" rows="3">'+esc(x.replyDraft)+'</textarea><div class="u6-tacts"><button type="button" class="btn ghost" data-u6tcp="'+id+'">Copy</button><a class="btn ghost" href="'+esc(url)+'" target="_blank" rel="noopener">Open the chat in Teams</a><button type="button" class="linkbtn" data-u6tsent="'+id+'">I sent it</button></div></div>';}
    return h;};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-u6topen],[data-u6tcp],[data-u6tflow]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();var d=b.dataset,x=twFind(d.u6topen||d.u6tcp||d.u6tflow);if(!x)return;
    var ta=document.querySelector('textarea[data-twrt="'+x.id+'"]');if(ta)x.replyDraft=ta.value;
    if(d.u6topen){u6tOpen[x.id]=!u6tOpen[x.id];render();return;}
    if(d.u6tcp){var box=document.getElementById("u6tt-"+x.id),text=String(x.replyDraft||"");if(box){box.focus();box.select();}
      var ok=false;try{ok=document.execCommand&&document.execCommand("copy");}catch(er){}
      if(ok){x.copiedAt=u6now();chip("Copied. Open the chat, paste and send.");return;}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){x.copiedAt=u6now();chip("Copied. Open the chat, paste and send.");},function(){chip("The text is selected: press Ctrl+C (Cmd+C on Mac) to copy it.",true);});
      else chip("The text is selected: press Ctrl+C (Cmd+C on Mac) to copy it.",true);return;}
    if(d.u6tflow){var text2=String(x.replyDraft||"").trim(),cid=twChatId(x);if(!text2||!cid||!mcp||u6tBusy)return;
      if(!(u6tArm[x.id]&&Date.now()-u6tArm[x.id]<8000)){u6tArm[x.id]=Date.now();render();setTimeout(function(){if(u6tArm[x.id]){delete u6tArm[x.id];render();}},8200);return;}
      delete u6tArm[x.id];u6tBusy=x.id;render();
      mailSelf().then(function(me){if(!me)throw {code:"noself"};return mcp.callTool(MS,"outlook_send_mail",{to:[me],subject:"ULTRON-TEAMS "+cid,body:text2,bodyType:"text"},{cache:false});}).then(function(){
        u6tBusy=null;x.sent={t:u6now(),text:clip(text2,1500),via:"flow"};x.hint="Looks handled: you replied in Teams "+clk(x.sent.t)+".";delete x.replyDraft;save();chip("Sent. Your flow posts it in Teams in a few seconds.");
      },function(er){u6tBusy=null;render();chip("Couldn’t hand it to your flow: "+((er&&er.message)?String(er.message).slice(0,90):"try again")+". Use Reply in Teams instead.",true);});return;}
  },true);
