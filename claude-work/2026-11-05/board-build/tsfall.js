  /* ===== Send in Teams fallback (Nov 6: "Couldn't send: FORBIDDEN: Missing scope 'ChatMessage.Send'").
     Your company hasn't granted the Microsoft 365 connector permission to send Teams messages (an IT admin setting),
     so the button copies the reply and opens the chat in Teams instead. One tap to copy+open, one to mark it sent. */
  function u6TeamsDirect(){try{return localStorage.getItem("ul.teamsDirect")==="1";}catch(e){return false;}}
  function u6ChatUrl(x){var cid=twChatId(x);if(x.webUrl&&/^https:\/\/teams\.microsoft\.com\//.test(x.webUrl))return x.webUrl;return cid?"https://teams.microsoft.com/l/chat/"+encodeURIComponent(cid)+"/conversations":"https://teams.microsoft.com/";}
  var _twSendBtnU6=twSendBtn;
  twSendBtn=function(x){if(u6TeamsDirect())return _twSendBtnU6(x);if(!x||!x.replyDraft)return '';
    return '<button type="button" class="btn" data-u6tcopy="'+esc(x.id)+'" title="Copies your reply and opens this chat in Teams. Paste and send there.">Copy and open in Teams</button>'+(x.copiedAt&&!x.sent?'<button type="button" class="linkbtn" data-u6tsent="'+esc(x.id)+'">I sent it</button>':'');};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-u6tcopy],[data-u6tsent]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();
    var x=twFind(b.dataset.u6tcopy||b.dataset.u6tsent);if(!x)return;
    if(b.dataset.u6tsent){x.sent={t:u6now(),text:clip(String(x.replyDraft||""),1500),manual:true};x.hint="Looks handled: you replied in Teams "+clk(x.sent.t)+".";delete x.replyDraft;delete x.copiedAt;save();chip("Marked as sent.");return;}
    var ta=document.querySelector('textarea[data-twrt="'+x.id+'"]');if(ta)x.replyDraft=ta.value;var text=String(x.replyDraft||"").trim();if(!text)return;
    var done=function(ok){x.copiedAt=u6now();save();chip(ok?"Reply copied. Paste it in the Teams chat that just opened, then tap I sent it.":"Teams opened. Select the reply text on the card and copy it.",!ok);};
    try{window.open(u6ChatUrl(x),"_blank","noopener");}catch(er){}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){done(true);},function(){done(false);});else done(false);},true);
  var _chipU6=chip;
  chip=function(msg,err){if(err&&/ChatMessage\.Send|Missing scope/i.test(String(msg||""))){try{localStorage.removeItem("ul.teamsDirect");}catch(e){}render();return _chipU6("Your company hasn’t allowed Claude to send Teams messages. Use Copy and open in Teams instead.",true);}return _chipU6(msg,err);};
