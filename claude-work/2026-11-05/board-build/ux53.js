  /* ===== Done tasks leave the board (Nov 11, patch53; Brody: "when a task is marked done we remove it" … "be careful
     deleting"). Brody then: "dont delete in 3 days delete after 2 weeks but store what task was done. so we can look back on it and
     remove after the end of a quarter". A done task already drops off every list when you tick it. Two weeks after its done
     date it leaves state.tasks and a record goes to state.doneArchive {id,title,group,from,doneOn,summary,where}; the Done
     this quarter panel (Week tab) reads it, and routines use it so a closed item is never re-added. Records from before the
     current quarter (state.quarter.start) are cleared. Never pruned: BugHerd, case, hiring and A/B-test tasks, recurring tasks,
     and done tasks with no done date. The full task text is in the Notion task log; the Nov 11 batch is saved in the repo. */
  var PRUNE53_KEEP={bugherd:1,cases:1,hire:1,abtests:1};
  function prune53(){
    var cut=new Date();cut.setDate(cut.getDate()-14);var cutISO=cut.getFullYear()+"-"+pad(cut.getMonth()+1)+"-"+pad(cut.getDate());
    var gone={},keep=[],A=state.doneArchive||(state.doneArchive=[]);
    state.tasks.forEach(function(t){
      var d=String(t.doneOn||"").slice(0,10);
      if(t.done&&d&&d<=cutISO&&!PRUNE53_KEEP[t.group]&&!t.recurring){
        gone[t.id]=1;var rc=t.receipt||{};
        A.push({id:t.id,title:clip(t.title,160),group:t.group,from:t.from||"",doneOn:d,summary:clip(rc.summary||(t.update&&t.update.text)||"",240),where:(rc.where||[]).slice(0,3)});
      }else keep.push(t);
    });
    var qs=(state.quarter&&state.quarter.start)||"";if(qs){var n0=A.length;state.doneArchive=A=A.filter(function(x){return !x.doneOn||x.doneOn>=qs;});if(A.length!==n0)gone.__q=1;}
    var ids=Object.keys(gone).filter(function(i){return i!=="__q";});if(!ids.length)return gone.__q?-1:0;
    state.tasks=keep;
    Object.keys(state.days||{}).forEach(function(k){var d=state.days[k];if(!d||k===state.today)return;
      (d.blocks||[]).forEach(function(b){if(b.taskIds)b.taskIds=b.taskIds.filter(function(i){return !gone[i];});});
      var ib=d.inbox;if(ib){(ib.people||[]).forEach(function(p){if(p.taskIds)p.taskIds=p.taskIds.filter(function(i){return !gone[i];});});
        if(ib.other)ib.other=ib.other.filter(function(i){return !gone[i];});(ib.meetings||[]).forEach(function(m){if(m.taskIds)m.taskIds=m.taskIds.filter(function(i){return !gone[i];});});}});
    (state.suggestions||[]).forEach(function(g){if(g.taskId&&gone[g.taskId])g.taskId=null;if(g.relatedTaskIds)g.relatedTaskIds=g.relatedTaskIds.filter(function(i){return !gone[i];});});
    ((state.teamsWatch&&state.teamsWatch.items)||[]).forEach(function(x){if(x.taskId&&gone[x.taskId])delete x.taskId;});
    if(state.claudePicks&&state.claudePicks.items)state.claudePicks.items=state.claudePicks.items.filter(function(x){return !gone[x.taskId];});
    state.tasks.forEach(function(t){if(t.relatedTaskIds)t.relatedTaskIds=t.relatedTaskIds.filter(function(i){return !gone[i];});});
    return ids.length;
  }
  setTimeout(function(){try{var k="bb.prune53",d=todayISO(),last="";try{last=localStorage.getItem(k)||"";}catch(e){}
    if(last===d)return;var n=prune53();try{localStorage.setItem(k,d);}catch(e){}if(n>0){save();chip("Moved "+n+" task"+(n>1?"s":"")+" done 2+ weeks ago to Done this quarter.");}else if(n<0)save();}catch(e){}},6000);

  /* Done this quarter: look back at what got finished (Week tab) */
  function done53HTML(){
    var qs=(state.quarter&&state.quarter.start)||"",live=state.tasks.filter(function(t){return t.done&&t.doneOn&&String(t.doneOn).slice(0,10)>=qs;}).map(function(t){var rc=t.receipt||{};return {id:t.id,title:t.title,from:t.from||"",doneOn:String(t.doneOn).slice(0,10),summary:rc.summary||"",where:(rc.where||[]).slice(0,3),live:1};});
    var all=live.concat((state.doneArchive||[]).filter(function(x){return !qs||x.doneOn>=qs;}));
    all.sort(function(a,b){return String(b.doneOn).localeCompare(String(a.doneOn));});
    var h='<details class="panel dn53" id="sec-done53"'+(D53open?' open':'')+'><summary><b>Done this quarter</b> <small>'+all.length+' task'+(all.length===1?'':'s')+(state.quarter&&state.quarter.name?' · '+esc(state.quarter.name):'')+'</small></summary>';
    if(!all.length)return h+'<p class="empty">Nothing yet.</p></details>';
    var by={};all.forEach(function(x){var k=x.doneOn.slice(0,7);(by[k]=by[k]||[]).push(x);});
    Object.keys(by).sort().reverse().forEach(function(k){var d=new Date(k+"-15T12:00:00");h+='<h3>'+esc(d.toLocaleDateString([], {month:"long",year:"numeric"}))+' <small>'+by[k].length+'</small></h3><ul class="dn53-l">'+by[k].map(function(x){
      return '<li><span class="dn53-d">'+esc(shortDate(x.doneOn))+'</span><div><div class="dn53-t">'+(x.live?'<button type="button" class="linkbtn dn53-o" data-opentask="'+esc(x.id)+'">'+esc(x.title)+'</button>':esc(x.title))+'</div>'+(x.from?'<div class="dn53-m">'+esc(x.from)+'</div>':'')+(x.summary?'<div class="dn53-m">'+esc(clip(x.summary,200))+'</div>':'')+((x.where||[]).length?'<div class="dn53-w">'+x.where.map(function(w){var u=w&&(w.url||w.href);return u&&/^https:\/\//.test(u)?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(clip(w.label||"Link",40))+' ↗</a>':'';}).join(" ")+'</div>':'')+'</div></li>';}).join("")+'</ul>';});
    return h+'<p class="hint">Tasks leave your lists when you tick them and move here after 2 weeks. This list clears when the quarter ends.</p></details>';
  }
  var D53open=false;
  document.addEventListener("toggle",function(e){if(e.target&&e.target.id==="sec-done53")D53open=e.target.open;},true);
  var _render53=render;
  render=function(){_render53.apply(this,arguments);try{if(view==="week"){var pg=document.querySelector("main .page");if(pg&&!pg.querySelector("#sec-done53")){var ft=pg.querySelector(":scope > footer"),w=document.createElement("div");w.innerHTML=done53HTML();pg.insertBefore(w.firstChild,ft||null);}}}catch(e){}};

