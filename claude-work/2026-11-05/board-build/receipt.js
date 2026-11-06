  /* ===== Done-by-Claude receipts (Nov 6, Brody: "when a task is assigned to you, a completed task with easy to read
     ways of when and where the task was completed"; "read the task then carry out the objective").
     task.receipt = {at, status:"done"|"needs_you", summary, did:[], where:[{label,url,kind}], left, prior, log}.
     Older tasks without a receipt get one derived from Claude's last thread message, its draft and its links. */
  var TASK_LOG_URL="https://app.notion.com/p/7b91b874b1ad4562a8c869b1d88bef4b";
  function rcKind(u){u=String(u||"");if(/outlook|office\.com|office365/.test(u))return "outlook";if(/github\.com/.test(u))return "file";if(/notion\.(so|com)/.test(u))return "notion";if(/asana\.com/.test(u))return "asana";if(/claude\.ai\/.*artifact/.test(u))return "board";return "web";}
  var RC_KIND={outlook:"Outlook draft",file:"File",notion:"Notion",asana:"Asana",board:"Board",web:"Link"};
  function rcLabelFor(u,k){try{var x=new URL(u);if(k==="file"){var p=x.pathname.split("/");return p[p.length-1]||"File";}if(k==="web")return x.hostname.replace(/^www\./,"");}catch(e){}return RC_KIND[k]||"Link";}
  function rcOf(t){
    if(!t)return null;
    if(t.receipt&&t.receipt.at)return t.receipt;
    if(t.assignee!=="claude"||!(t.claudeStatus==="ready"||t.claudeStatus==="blocked"))return null;
    var th=(t.thread||[]).filter(function(m){return m&&m.role==="claude"&&m.text;});var last=th[th.length-1];if(!last)return null;
    var txt=String(last.text),where=[],seen={};
    if(t.outlookDraft&&t.outlookDraft.link){where.push({label:"Outlook draft: "+clip(t.outlookDraft.subject||"draft",60),url:t.outlookDraft.link,kind:"outlook"});seen[t.outlookDraft.link]=1;}
    (txt.match(/https?:\/\/[^\s)"'<>]+/g)||[]).forEach(function(u){u=u.replace(/[.,;:]+$/,"");if(seen[u])return;seen[u]=1;var k=rcKind(u);where.push({label:rcLabelFor(u,k),url:u,kind:k});});
    var up=t.update&&typeof t.update==="object"?t.update.text:t.update;
    var first=txt.replace(/https?:\/\/\S+/g,"").split(/\n+/).map(function(s){return s.trim();}).filter(Boolean);
    var sum=up||first[0]||"";if(/^(done|checked)\.?$/i.test(sum)&&first[1])sum=first[1];
    var left=t.claudeStatus==="blocked"?((t.approvalNeeded&&t.approvalNeeded.what)||t.needs||"Claude needs you on this one. Open the thread."):(t.needs&&!t.brief?t.needs:"");
    return {at:last.t||"",status:t.claudeStatus==="blocked"?"needs_you":"done",summary:clip(sum,240),did:[],where:where.slice(0,8),left:left,prior:"",derived:true};
  }
  function rcWhen(iso){if(!iso)return "";var d=new Date(iso);if(isNaN(d))return "";var now=new Date(),mins=Math.round((now-d)/60000);
    var day=d.toDateString()===now.toDateString()?"Today":(new Date(now-864e5).toDateString()===d.toDateString()?"Yesterday":d.toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"}));
    var tm=d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});var ago=mins<1?"just now":mins<60?mins+" min ago":mins<1440?Math.round(mins/60)+" h ago":"";
    return day+" at "+tm+(ago?" · "+ago:"");}
  function rcWhere(w){if(!w||!w.length)return '<p class="rc-none">Nothing outside the board was made. The answer is in the thread.</p>';
    return '<div class="rc-where">'+w.map(function(x){var k=x.kind||rcKind(x.url);return okHref(x.url)?'<a class="rc-link k-'+esc(k)+'" href="'+esc(x.url)+'" target="_blank" rel="noopener"><span class="rc-k">'+esc(RC_KIND[k]||"Link")+'</span>'+esc(clip(x.label||RC_KIND[k]||"Open",70))+'</a>':'<span class="rc-link k-'+esc(k)+'"><span class="rc-k">'+esc(RC_KIND[k]||"Note")+'</span>'+esc(clip(x.label||"",70))+'</span>';}).join("")+'</div>';}
  function receiptHTML(t){
    var r=rcOf(t);if(!r)return '';var need=r.status==="needs_you";
    var h='<section class="rc'+(need?' need':'')+'" aria-label="Claude\'s result"><div class="rc-head"><span class="rc-badge">'+(need?'Needs you':'✓ Done by Claude')+'</span><span class="rc-when">'+esc(rcWhen(r.at))+'</span></div>';
    if(r.summary)h+='<p class="rc-sum">'+esc(r.summary)+'</p>';
    if(r.did&&r.did.length)h+='<h5>What Claude did</h5><ul class="rc-did">'+r.did.slice(0,8).map(function(x){return '<li>'+esc(clip(x,200))+'</li>';}).join("")+'</ul>';
    h+='<h5>Where it is</h5>'+rcWhere(r.where);
    if(r.left)h+='<div class="rc-left"><b>Left for you:</b> '+esc(clip(r.left,300))+'</div>';
    if(r.prior)h+='<p class="rc-prior">'+esc(clip(r.prior,200))+'</p>';
    h+='<div class="rc-acts">'+(t.done?'':'<button type="button" class="btn" data-rcclose="'+esc(t.id)+'">'+(need?'Mark done anyway':'Looks good, mark done')+'</button>')+'<button type="button" class="btn ghost" data-rcthread="'+esc(t.id)+'">Follow up</button>'+(r.log&&okHref(r.log)?'<a class="linkbtn" href="'+esc(r.log)+'" target="_blank" rel="noopener">Notion log</a>':'')+'</div>';
    if(r.derived)h+='<p class="rc-prior">Built from Claude\'s last reply. New runs write a full receipt.</p>';
    return h+'</section>';
  }
  function receiptChip(t){var r=rcOf(t);if(!r||t.done)return '';var need=r.status==="needs_you";
    return '<button type="button" class="rc-chip'+(need?' need':'')+'" data-toggle="'+esc(t.id)+'">'+(need?'Needs you':'✓ Done by Claude')+' <span>'+esc(rcWhen(r.at).split(" · ")[0])+'</span>'+(r.where&&r.where.length?' · '+r.where.length+' link'+(r.where.length>1?'s':''):'')+'</button>';}
  function doneByClaudeList(){var cut=Date.now()-3*864e5;return (state.tasks||[]).map(function(t){var r=rcOf(t);return r&&!t.done&&new Date(r.at).getTime()>cut?{t:t,r:r}:null;}).filter(Boolean).sort(function(a,b){return String(b.r.at).localeCompare(String(a.r.at));});}
  function doneByClaudeHTML(){
    var L=doneByClaudeList();if(!L.length)return '';var need=L.filter(function(x){return x.r.status==="needs_you";}).length;
    var h='<section class="panel dbc" id="sec-dbc"><h2>Done by Claude <small><b>'+(L.length-need)+'</b> done'+(need?' · <b>'+need+'</b> need you':'')+' · last 3 days</small></h2><ul class="dbc-list">';
    L.slice(0,10).forEach(function(x){var t=x.t,r=x.r,nd=r.status==="needs_you";
      h+='<li class="'+(nd?'need':'')+'"><div class="dbc-top"><span class="rc-badge">'+(nd?'Needs you':'✓ Done')+'</span><span class="rc-when">'+esc(rcWhen(r.at))+'</span></div><button type="button" class="tx dbc-t" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,120))+'</button>'+(r.summary?'<p class="dbc-s">'+esc(clip(r.summary,200))+'</p>':'')+(r.where&&r.where.length?rcWhere(r.where.slice(0,4)):'')+(r.left?'<p class="dbc-left"><b>Left for you:</b> '+esc(clip(r.left,160))+'</p>':'')+'</li>';});
    return h+'</ul>'+(L.length>10?'<p class="hint">+'+(L.length-10)+' more on the Tasks tab.</p>':'')+'<p class="hint" style="margin:8px 0 0">Every finished task is also logged in Notion: <a href="'+TASK_LOG_URL+'" target="_blank" rel="noopener">Ultron task log</a>.</p></section>';
  }
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-rcclose],[data-rcthread]");if(!b)return;e.stopPropagation();
    if(b.dataset.rcclose){var c=document.querySelector('input[data-tchk="'+b.dataset.rcclose.replace(/"/g,'\\"')+'"]');if(c&&!c.checked)c.click();return;}
    if(b.dataset.rcthread){var li=b.closest("li.task")||document;var ta=li.querySelector(".threadrow textarea, .fu-box textarea, textarea");if(ta){ta.focus();ta.scrollIntoView({block:"center",behavior:"smooth"});}return;}
  },true);
  var _claudeRowRc=claudeRow;
  claudeRow=function(t){var c=receiptChip(t);return c?c:_claudeRowRc(t);};
  var _aboutRc=aboutHTML;
  aboutHTML=function(t){return receiptHTML(t)+_aboutRc(t);};
  var _focusRc=focusHTML;
  focusHTML=function(day,isToday){var h=_focusRc(day,isToday);if(!isToday)return h;var d=doneByClaudeHTML();if(!d)return h;var w=waitClaudeHTML();if(w&&h.indexOf(w)===0)return w+d+h.slice(w.length);return d+h;};
  /* The brief every Give to Claude / Have Claude do it now run gets: do the work, then write the receipt. */
  var TASK_PROTOCOL="\n\nHOW TO WORK IT (my rule, Nov 6: read the task, then carry out the objective; no plans or promises instead of the work):\n1. Read the task: title, note, my notes, project notes, steps, brief, thread and the source email.\n2. Done before? Search the Notion \"Ultron task log\" (collection://37c61404-440a-4ad3-a642-955873dd6517) and my Notion memory for this task or one like it, and reuse how it was done.\n3. Do it now with the tools you have: save the email as an Outlook draft, build the file and push it, write the Notion page, do the research and put the answer in the thread, update the board. Don't answer with a plan, a list of options or \"I'll do it next run\".\n4. If a rule stops you (NetSuite or Ads OK, Web Dev clearance, a PC-only system, a sign-in), do everything up to that line, then stop and name the one exact thing you need from me.\n5. Write task.receipt = {at:<ISO now>, status:\"done\" or \"needs_you\", summary:<one past-tense line: what is now true>, did:[up to 6 short past-tense lines], where:[{label, url, kind:\"outlook\"|\"file\"|\"notion\"|\"board\"|\"web\"|\"asana\"} for every draft, file, page or record you made or checked], left:<the one thing left for me, or \"\">, prior:<\"Done before on <date>\" or \"\">, log:<the Notion log row url>}. Set claudeStatus \"ready\" (done) or \"blocked\" (needs_you), task.update = {on, by:\"Claude\", text:<summary>}, and post the same in the thread starting \"Done:\" or \"Needs you:\" with the links.\n6. Add one row to the Ultron task log (Task, Task ID, Completed, Status, What I did, Where, How, Left for Brody, Project).\n";
  var _doMsgRc=doMsg;
  doMsg=function(t){var m=_doMsgRc(t);if(m.indexOf("HOW TO WORK IT")>=0)return m;var cut=m.indexOf(" Then set task.assignee");if(cut>0)m=m.slice(0,cut)+" Set task.assignee to \"claude\" and tell me in Live chat in two lines: what you did and where it is.";return m+TASK_PROTOCOL;};
