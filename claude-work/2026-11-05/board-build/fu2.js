  /* ===== Follow-ups are instructions, and status tells the truth (Nov 6, Brody: "I have offered up follow up notes to multiple
     tasks and it doesn't seem like you are taking them. They are tasks you are showing as completed that aren't completed").
     1) Anything Brody writes on a task (thread box, Follow up box, a note, OK or No) starts a real Claude run that acts on it,
        not just a quick answer. 2) A task never shows "Done by Claude" when Brody's newest word on it is newer than Claude's. */
  function fuLastBrody(t){
    var best=null;(t.thread||[]).forEach(function(m){if(m&&m.role==="user"&&m.t&&(!best||m.t>best.t))best={t:m.t,text:String(m.text||""),kind:"thread"};});
    (t.notes||[]).forEach(function(n){if(n&&n.t&&(!best||n.t>best.t))best={t:n.t,text:String(n.text||""),kind:"note"};});
    return best;}
  function fuLastClaude(t){if(t.receipt&&t.receipt.at&&t.receipt.status!=="answered")return t.receipt.at;var c="";(t.thread||[]).forEach(function(m){if(m&&m.role==="claude"&&m.t&&m.t>c&&!/^Quick answer/i.test(String(m.text||"")))c=m.t;});return c;}  /* only a real run counts: receipts are written by full runs; quick in-page answers never close a follow-up */
  var _rcOfFu=rcOf;
  rcOf=function(t){var r=_rcOfFu(t);if(!t)return r;if(!r){if(t.assignee!=="claude"||t.done)return r;r={where:[],at:"",status:"working"};}var b=fuLastBrody(t),c=fuLastClaude(t);
    if(!b||b.t<=c)return r;
    var o={};for(var k in r)o[k]=r[k];o.at=b.t;o.derived=false;o.did=[];
    if(/^No, don.t make this change/i.test(b.text)){o.status="stopped";o.summary="You said no: "+clip(b.text.replace(/^No, don.t make this change:\s*/i,""),200);o.left="Nothing was changed. Close it, or tell Claude a different way to handle it.";return o;}
    if(/^OK, go ahead/i.test(b.text)&&t.pcOnly){o.status="needs_you";o.summary="You approved it. This one runs on your PC.";o.left="Open the task, press Copy PC prompt and paste it into Claude on your PC.";return o;}
    if(/^Given to Claude/i.test(b.text)||/^Plan approved/i.test(b.text)){o.status="working";o.summary="Claude is working on it.";o.left="";return o;}
    var sent=t.doSentAt&&t.doSentAt>=b.t;
    o.status="followup";o.sent=!!sent;o.fuText=b.text.replace(/^(Follow-up|Answer):\s*/i,"");
    o.summary=(sent?"Claude is working on your follow-up: ":"Your follow-up hasn’t been sent to Claude yet: ")+"“"+clip(o.fuText,180)+"”";
    o.left=sent?"":"Press Send to Claude so it acts on it.";return o;};
  var RC_BADGE={done:"✓ Done by Claude",needs_you:"Needs you",followup:"Follow-up pending",stopped:"Stopped by you",working:"Claude is working",plan:"Plan to approve",answered:"Claude is working"};
  var _receiptHTMLFu=receiptHTML;
  receiptHTML=function(t){var r=rcOf(t);if(!r)return '';if(r.status==="done"||r.status==="needs_you"&&!/runs on your PC/.test(r.summary||""))return _receiptHTMLFu(t);
    var h='<section class="rc need rc-'+esc(r.status)+'" aria-label="Where this stands"><div class="rc-head"><span class="rc-badge">'+esc(RC_BADGE[r.status]||r.status)+'</span><span class="rc-when">'+esc(rcWhen(r.at))+'</span></div>';
    h+='<p class="rc-sum">'+esc(r.summary||"")+'</p>';if(r.left)h+='<div class="rc-left"><b>Next:</b> '+esc(r.left)+'</div>';
    h+='<div class="rc-acts">';
    if(r.status==="followup"&&!r.sent)h+='<button type="button" class="btn" data-fugo="'+esc(t.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>Send to Claude</button>';
    if(r.status==="stopped")h+='<button type="button" class="btn" data-dqdrop="'+esc(t.id)+'">Close it</button>';
    if(!t.done&&r.status!=="stopped")h+='<button type="button" class="btn ghost" data-dqdone="'+esc(t.id)+'">Mark done</button>';
    h+='</div>'+progHTML(progKey("do",t.id));
    return h+'</section>';};
  var _receiptChipFu=receiptChip;
  receiptChip=function(t){var r=rcOf(t);if(!r||t.done)return '';if(r.status==="done"||r.status==="needs_you")return _receiptChipFu(t);
    return '<button type="button" class="rc-chip need" data-toggle="'+esc(t.id)+'">'+esc(RC_BADGE[r.status]||r.status)+' <span>'+esc(rcWhen(r.at).split(" · ")[0])+'</span></button>';};
  var _dbcListFu=doneByClaudeList;
  doneByClaudeList=function(){return _dbcListFu().filter(function(x){var r=rcOf(x.t);return r&&(r.status==="done"||r.status==="needs_you");}).map(function(x){return {t:x.t,r:rcOf(x.t)};});};
  /* run Claude on the newest instruction */
  function fuRun(t,text,why){
    if(!t||!mcp)return false;if(live.chatSending){chip("Claude is still sending the last request. Try again in a few seconds.",true);return false;}
    t.doSentAt=new Date().toISOString();if(t.assignee!=="claude"){t.assignee="claude";}t.claudeStatus="queued";
    progSend(progKey("do",t.id),doMsg(t)+"\n\nNEWEST INSTRUCTION FROM ME ("+(why||"follow-up")+", "+new Date().toLocaleString()+"). It overrides older text on the task. Act on it now with your tools, the same way you would a new assignment: don't just answer it, and don't say you can't do it from chat. If it asks you to mark the task done, do that (set task.done true, doneOn today, doneVia \"asked\") and say so. Then update the receipt.\n\""+clip(text,2000)+"\"");
    return true;}
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-fugo]");if(!b)return;var t=findTask(b.dataset.fugo);if(!t)return;var r=rcOf(t);var txt=(r&&r.fuText)||((fuLastBrody(t)||{}).text)||"";if(fuRun(t,txt,"follow-up I left earlier")){save();chip("Sent. Claude is acting on your follow-up.");}});
  /* the task thread box: keep the quick answer, and also start a real run that acts on it */
  var _runTaskAskFu=runTaskAsk;
  runTaskAsk=function(id){var q=String((tAsk&&tAsk.text)||"").trim();_runTaskAskFu(id);var t=findTask(id);if(q&&t&&mcp)setTimeout(function(){if(fuRun(t,q,"message in the task thread"))save();},50);};
  var _taskPromptFu=taskPrompt;
  taskPrompt=function(t,q){var p=_taskPromptFu(t,q);var note="\n\nIMPORTANT: a full Claude run with email, Teams, Notion and repo access has ALREADY been started for this message and will carry it out. Your reply is only a quick acknowledgment: say in one or two sentences what that run will do. Never say you can't do it from this chat.";return typeof p==="string"?p+note:p;};
  /* the Follow up box under answers: turn the question into an instruction */
  var _progSendFu=progSend;
  progSend=function(key,text){var m=/^Follow-up from Brody about task (\S+?) \(/.exec(String(text||""));
    if(m){var t=findTask(m[1]);var f=/His follow-up: ([\s\S]*?)\n\nAnswer the follow-up/.exec(text);if(t&&f){t.doSentAt=new Date().toISOString();t.assignee="claude";t.claudeStatus="queued";
      return _progSendFu(key,doMsg(t)+"\n\nNEWEST INSTRUCTION FROM ME (follow-up, "+new Date().toLocaleString()+"). It overrides older text on the task. Act on it now with your tools: don't just answer it. If it asks you to mark the task done, do that (task.done true, doneOn today, doneVia \"asked\"). Then update the receipt.\n\""+clip(f[1],2000)+"\"");}}
    return _progSendFu(key,text);};
  /* a note on a task Claude has touched goes to Claude right away */
  var _saveNoteFu=saveNote;
  saveNote=function(key){var txt=String(noteText[key]||"").trim();_saveNoteFu(key);if(!txt||key.indexOf("t:")!==0)return;var t=findTask(key.slice(2));if(!t||t.done)return;
    var touched=t.assignee==="claude"||t.receipt||(t.thread||[]).some(function(m){return m.role==="claude";});
    if(touched&&fuRun(t,txt,"note I added")){save();chip("Note saved and sent to Claude.");}};
  /* OK on a cloud approval starts Claude now instead of waiting for the next check-in */
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-approve]");if(!b)return;var id=b.dataset.approve;
    setTimeout(function(){var t=findTask(id);if(!t||t.pcOnly||!t.approved||t.claudeStatus!=="queued")return;if(Date.now()-new Date(t.approved.t).getTime()>5000)return;if(fuRun(t,"OK, go ahead: "+(t.approved.what||""),"approval")){save();chip("Approved. Claude is doing it now.");}},120);});
  /* Do now: follow-ups that weren't sent, and things you stopped */
  var _dqItemsFu=dqItems;
  dqItems=function(){var out=_dqItemsFu().filter(function(x){if(!x.t)return true;var r=rcOf(x.t);return !(x.k==="claude"&&r&&r.status!=="done");});
    state.tasks.forEach(function(t){if(t.done)return;var r=rcOf(t);if(!r)return;
      if(r.status==="followup"&&!r.sent)out.push({k:"decide",rank:-0.8,t:t,tag:"Follow-up not sent",title:t.title,ctx:"You wrote: “"+clip(r.fuText,220)+"”",main:'<button type="button" class="btn" data-fugo="'+esc(t.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>Send to Claude</button>',prog:progKey("do",t.id)});
      else if(r.status==="stopped")out.push({k:"decide",rank:2.5,t:t,tag:"Stopped by you",title:t.title,ctx:r.summary,main:'<button type="button" class="btn" data-dqdrop="'+esc(t.id)+'">Close it</button>',more:'<button type="button" class="linkbtn" data-dqopen="'+esc(t.id)+'">Tell Claude another way</button>'});
      else if(r.status==="needs_you"&&/runs on your PC/.test(r.summary||""))out.push({k:"decide",rank:0.5,t:t,tag:"Run on your PC",title:t.title,ctx:r.left,main:'<button type="button" class="btn" data-dqopen="'+esc(t.id)+'">Open it</button>',more:'<button type="button" class="linkbtn" data-dqdone="'+esc(t.id)+'">It’s done</button>'});});
    out.sort(function(a,b){return a.rank-b.rank||((b.late||0)-(a.late||0));});return out;};
  RULES_LINE=RULES_LINE.replace("never set task.done.","never set task.done unless I ask you to mark that task done (then set done, doneOn today, doneVia \"asked\").");
