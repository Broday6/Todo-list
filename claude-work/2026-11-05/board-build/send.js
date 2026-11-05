  /* ---------- Send a question's answer to Claude now ----------
     The answer box used to save on blur and wait for the next check-in.
     "Send to Claude" saves it and hands it to the Live chat routine at once. */
  function ansSendHTML(t){
    var h='<div class="qsend"><button type="button" class="btn" data-bhsend="'+esc(t.id)+'"'+(live.chatSending?' disabled':'')+'>'+(t.answerSentAt&&t.answer?'Send again':'Send to Claude')+'</button>';
    if(t.answerWorkedAt&&(!t.answeredAt||t.answerWorkedAt>=t.answeredAt))h+='<span class="qsent ok">Claude worked your answer '+esc(msgTime(t.answerWorkedAt))+'. See the task thread.</span>';
    else if(t.answerSentAt)h+='<span class="qsent">Sent '+esc(msgTime(t.answerSentAt))+'. Claude’s reply lands in Live chat and this task’s thread in 1 to 2 minutes.</span>';
    else if(!mcp&&mcpTried)h+='<span class="qsent">Saves your answer; the next check-in works it.</span>';
    return h+'</div>';
  }
  function ansMsg(t){
    var b=t.bh||{};
    return "Answer from Brody on task "+t.id+(b.id?" (BugHerd #"+b.id+")":"")+": “"+t.title+"”.\n\nQuestion: "+(t.question||"")+"\n\nMy answer: "+t.answer+
      "\n\nWork it now. Do what my answer says (research, checks, comparisons), then prep what comes next as drafts only: a BugHerd comment labelled \"Draft comment, not posted\" on the task, and any email (for example to a vendor) as an Outlook draft for me to send. Never post in BugHerd, move the ticket or send it to Web Dev, and never change NetSuite. Tell me what you found in Live chat, push the same into that task's thread, and set task.answerWorkedAt to now.";
  }
  document.addEventListener("mousedown",function(e){if(e.target.closest("[data-bhsend]"))e.preventDefault();});
  document.addEventListener("click",function(e){
    var s=e.target.closest("[data-bhsend]");if(!s)return;
    var t=findTask(s.dataset.bhsend);if(!t)return;
    var li=s.closest("li"),ta=li&&li.querySelector('textarea[data-bhq]');
    var v=String(ta?ta.value:(t.answer||"")).trim();
    if(!v){chip("Type your answer first.",true);if(ta)ta.focus();return;}
    if(v!==t.answer){t.answer=clip(v,2000);t.answeredAt=new Date().toISOString();}
    if(!mcp){save();chip("Saved. The next check-in works it.");return;}
    if(live.chatSending)return;
    t.answerSentAt=new Date().toISOString();
    if(!t.thread)t.thread=[];
    t.thread.push({role:"user",text:"Answer: "+t.answer,t:t.answerSentAt});
    chSend(ansMsg(t));
    chip("Sent to Claude.");
  });

