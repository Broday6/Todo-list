  /* ===== Claude's picks (Nov 6, Brody: "what tasks would claude like to take it should be thinking that daily") =====
     state.claudePicks = {day, items:[{taskId, why}], skipped:{taskId:day}}. The morning rebuild writes today's picks;
     if it hasn't, the panel falls back to open tasks tagged "Claude can do this". Take it = Give to Claude. */
  function picksList(){
    var cp=state.claudePicks||{},today=todayISO(),sk=cp.skipped||{},out=[];
    function ok(t){return t&&!t.done&&t.assignee!=="claude"&&!t.pcOnly&&sk[t.id]!==today;}
    if(cp.day===today)(cp.items||[]).forEach(function(x){var t=findTask(x.taskId);if(ok(t))out.push({t:t,why:x.why||((t.claudeCan||{}).how)||""});});
    if(!out.length)state.tasks.filter(function(t){return ok(t)&&t.claudeCan&&t.claudeCan.how&&t.group!=="bugherd"&&t.group!=="cases"&&t.group.indexOf("idea")!==0;})
      .sort(function(a,b){return (a.due||"9999")<(b.due||"9999")?-1:1;}).slice(0,6).forEach(function(t){out.push({t:t,why:t.claudeCan.how});});
    return out;
  }
  function picksHTML(){
    var L=picksList();if(!L.length)return '';
    var h='<section class="panel picks" id="sec-picks"><h2>Claude wants to take these <small><b>'+L.length+'</b> today · drafts and prep only, nothing is sent</small></h2><ul class="pk-list">';
    L.forEach(function(x){var t=x.t;
      h+='<li><div><div class="pk-t"><button type="button" class="tx" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,110))+'</button></div><div class="pk-w">'+esc(clip(x.why,200))+(t.due?' · due '+esc(shortDate(t.due)):'')+'</div></div><div class="pk-a"><button type="button" class="btn" data-pktake="'+esc(t.id)+'">Take it</button><button type="button" class="linkbtn" data-pkskip="'+esc(t.id)+'">Not today</button></div></li>';});
    h+='</ul>'+(L.length>1?'<button type="button" class="btn ghost pk-all" data-pkall="1">Give all '+L.length+' to Claude</button>':'')+'<p class="hint" style="margin:8px 0 0">Claude starts at the next check-in ('+esc(nextCheckin())+'). Anything that would change NetSuite or ads still stops and asks you first.</p></section>';
    return h;
  }
  function pkGive(t){if(!t||t.done)return;t.assignee="claude";t.claudeStatus="queued";if((!Array.isArray(t.workflow)||!t.workflow.length)&&t.claudeCan&&Array.isArray(t.claudeCan.steps))t.workflow=t.claudeCan.steps.map(function(x){return {text:String(x)};});if(!t.thread)t.thread=[];t.thread.push({role:"user",text:"Given to Claude from Claude's picks.",t:new Date().toISOString()});logAuto("Gave to Claude: "+t.title,t.id);}
  document.addEventListener("click",function(e){var b;
    if((b=e.target.closest&&e.target.closest("[data-pktake]"))){var t=findTask(b.dataset.pktake);if(t)giveToClaude(t);return;}
    if((b=e.target.closest&&e.target.closest("[data-pkskip]"))){var cp=state.claudePicks||(state.claudePicks={});cp.skipped=cp.skipped||{};cp.skipped[b.dataset.pkskip]=todayISO();save();return;}
    if((b=e.target.closest&&e.target.closest("[data-pkall]"))){var L=picksList();L.forEach(function(x){pkGive(x.t);});save();chip("Gave "+L.length+" to Claude. It starts at the next check-in, "+nextCheckin()+".");return;}
  });
  var _focusPk=focusHTML;
  focusHTML=function(day,isToday){var h=_focusPk(day,isToday);if(!isToday)return h;var w=waitClaudeHTML(),p=picksHTML();if(w&&h.indexOf(w)===0)return w+p+h.slice(w.length);return p+h;};
