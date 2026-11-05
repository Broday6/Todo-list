  /* Follow up on any answer (Nov 5, Brody: "I need ways to follow up on prompts you give back").
     A box under each Claude answer: quick answers, Claude's answer on BugHerd cards, and plan-block
     explanations. Task threads and Live chat already have their own box. */
  live.fuText=live.fuText||{};
  function fuPrev(key){
    var q=live.quick,txt="";
    var m=/^ans:(.+)$/.exec(key);if(m){var t=findTask(m[1]);var x=t&&bestReply(t);if(x)txt=x.text;}
    if(!txt&&q&&q.origin===key&&q.text)txt=q.text;
    return txt;
  }
  function fuHTML(key,ph){
    return '<div class="fu"><textarea data-fuq="'+esc(key)+'" rows="1" placeholder="'+esc(ph||"Follow up on this answer…")+'" aria-label="Follow up">'+esc(live.fuText[key]||"")+'</textarea><button type="button" class="btn ghost" data-fusend="'+esc(key)+'"'+((/^blk:/.test(key)?sampler:mcp||sampler)?'':' disabled')+'>Follow up</button></div>';
  }
  function fuSlot(key){
    if(/^ans:/.test(key)){var t=findTask(key.slice(4));if(t&&bestReply(t))return '';}
    var q=live.quick;if(!q||q.origin!==key||q.busy||!q.text)return '';
    return fuHTML(key);
  }
  var _progHTMLBase=progHTML;
  progHTML=function(key){return _progHTMLBase(key)+'<div class="fuslot" data-fu-slot="'+esc(key)+'">'+fuSlot(key)+'</div>';};
  var _qPaintBase=qPaint;
  qPaint=function(){_qPaintBase();var q=live.quick;if(!q||q.busy)return;var sl=document.querySelectorAll('[data-fu-slot]');for(var i=0;i<sl.length;i++)if(sl[i].getAttribute("data-fu-slot")===q.origin&&!sl[i].firstChild)sl[i].innerHTML=fuSlot(q.origin);};
  var _bhReplyBase=bhReplyHTML;
  bhReplyHTML=function(t){var h=_bhReplyBase(t);return h?h+fuHTML("ans:"+t.id,"Ask a follow-up about this ticket…"):h;};
  var _blkInfoBase=blkInfoHTML;
  blkInfoHTML=function(b){var h=_blkInfoBase(b);if((b.thread||[]).some(function(m){return m.role==="claude";}))h=h.replace(/<\/div>$/,fuHTML("blk:"+b.id,"Ask a follow-up about this block…")+'</div>');return h;};
  function fuDesc(key){
    var m=/^([a-z]+):(.+)$/.exec(key)||[];var kind=m[1],id=m[2];
    if(kind==="chat")return {text:"his Live chat",task:null};
    var t=id&&findTask(id.replace(/^task:/,""));
    if(t)return {text:"task "+t.id+" (“"+t.title+"”)",task:t};
    var lb=id&&locateBlock(id);if(lb)return {text:"plan block "+lb.block.id+" (“"+lb.block.title+"”)",task:null,block:lb.block};
    return {text:key,task:null};
  }
  function fuSend(key){
    var text=String(live.fuText[key]||"").trim();if(!text)return;
    if(/^blk:/.test(key)){runBlkFollow(key.slice(4),text);return;}
    if(!mcp){chip("Follow-ups need Claude Code Remote allowed for this page.",true);return;}
    if(live.chatSending)return;
    var d=fuDesc(key),prev=fuPrev(key);
    var msg="Follow-up from Brody about "+d.text+".\n\nYour last answer to him:\n"+(prev?clip(prev,1800):"(not on the board)")+"\n\nHis follow-up: "+text+
      "\n\nAnswer the follow-up directly. Same rules as always: drafts only, never send, never post in BugHerd or move tickets, never change NetSuite or ads without his OK for that exact change. Put your answer in Live chat"+(d.task?" and push the same into task "+d.task.id+"'s thread (role claude)":"")+".";
    if(d.task){if(!d.task.thread)d.task.thread=[];d.task.thread.push({role:"user",text:"Follow-up: "+clip(text,2000),t:new Date().toISOString()});}
    delete live.fuText[key];
    progSend(key,msg);
    chip("Follow-up sent.");
  }
  function runBlkFollow(id,text){
    var lb=locateBlock(id);if(!lb||!sampler||bAsk.busy)return;var b=lb.block;
    delete live.fuText["blk:"+id];
    bAsk={id:id,busy:true,err:""};if(!b.thread)b.thread=[];
    b.thread.push({role:"user",text:clip(text,2000),t:new Date().toISOString()});render();
    var p=["You are the assistant inside Brody’s work board. Today is "+todayISO()+".","Brody is following up on a plan block you explained. Answer his latest message in plain words, using only the data and the conversation. If it needs his email or tools, say so and tell him to press Dig deeper. No em dashes.","","DATA:",JSON.stringify(blkCtx(b)),"","CONVERSATION:",b.thread.slice(-10).map(function(m){return (m.role==="claude"?"Claude: ":"Brody: ")+m.text;}).join("\n\n"),"","Reply with ONLY one JSON object: {\"reply\":\"...\"}"].join("\n");
    sampler.json(p,{modelTier:"default",cache:false}).then(function(res){
      var r=(res&&typeof res.reply==="string")?clip(res.reply,4000):"";
      bAsk.busy=false;if(r)b.thread.push({role:"claude",text:r,t:new Date().toISOString()});else bAsk.err="Claude sent an empty answer.";save();
    }).catch(function(e){bAsk.busy=false;bAsk.err=sampleErr(e);render();});
  }
  document.addEventListener("input",function(e){var t=e.target;if(t&&t.dataset&&t.dataset.fuq!=null)live.fuText[t.dataset.fuq]=t.value;});
  document.addEventListener("keydown",function(e){var t=e.target;if(t&&t.dataset&&t.dataset.fuq!=null&&e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();live.fuText[t.dataset.fuq]=t.value;fuSend(t.dataset.fuq);}});
  document.addEventListener("mousedown",function(e){if(e.target.closest&&e.target.closest("[data-fusend]"))e.preventDefault();});
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-fusend]");if(!b)return;var k=b.dataset.fusend,ta=document.querySelector('textarea[data-fuq="'+k.replace(/"/g,'\\"')+'"]');if(ta)live.fuText[k]=ta.value;fuSend(k);});
