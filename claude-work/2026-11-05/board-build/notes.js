  /* ===== Notes (Nov 6, Brody: "help me find a way to add notes on projects") =====
     Project notes: state.projectNotes[groupKey] = [{id,t,text}], on each Tasks group header.
     Task notes: task.notes = [{id,t,text}], in an opened task, on Claude's picks and BugHerd cards.
     Claude reads both whenever it works a task (taskCtx, doMsg and the routines' _note rule). */
  var noteOpen={},noteText={};
  function pnotes(k){var p=state.projectNotes||(state.projectNotes={});return p[k]||(p[k]=[]);}
  function tnotes(t){return t.notes||(t.notes=[]);}
  function noteList(list,delAttr){return list.length?'<ul class="nt-list">'+list.slice().reverse().map(function(n){return '<li><span class="nt-d">'+esc(shortDate(String(n.t).slice(0,10)))+'</span><span class="nt-x">'+esc(n.text).replace(/\n/g,"<br>")+'</span><button type="button" class="tx nt-del" '+delAttr+'="'+esc(n.id)+'" aria-label="Delete note">×</button></li>';}).join("")+'</ul>':'';}
  function noteBox(key,ph){return '<div class="nt-add"><textarea data-nttext="'+esc(key)+'" rows="2" placeholder="'+esc(ph)+'">'+esc(noteText[key]||"")+'</textarea><button type="button" class="btn ghost" data-ntsave="'+esc(key)+'">Save note</button></div>';}
  function projNotesHTML(g){
    var list=(state.projectNotes&&state.projectNotes[g])||[],k="p:"+g,open=!!noteOpen[k],last=list[list.length-1];
    var h='<div class="pnotes"><button type="button" class="tx nt-tog" data-nttog="'+esc(k)+'" aria-expanded="'+open+'">✎ Project notes'+(list.length?' ('+list.length+')':'')+'</button>'+(!open&&last?'<span class="nt-last">'+esc(clip(last.text,120))+'</span>':'');
    if(open)h+=noteList(list,'data-ntdelp="'+esc(g)+'" data-ntid')+noteBox(k,"Add a note for this whole project: decisions, context, what Claude should know.");
    return h+'</div>';
  }
  function taskNotesHTML(t){
    var list=t.notes||[],k="t:"+t.id;
    return '<div class="tnotes"><h4>Notes <small>'+(list.length?list.length+' · ':'')+'Claude reads these when it works this task</small></h4>'+noteList(list,'data-ntdelt="'+esc(t.id)+'" data-ntid')+noteBox(k,"Add a note: what you decided, who to ask, where the source is.")+'</div>';
  }
  function saveNote(key){
    var txt=String(noteText[key]||"").trim();if(!txt)return;var n={id:"n"+Date.now(),t:new Date().toISOString(),text:clip(txt,2000)};
    if(key.indexOf("p:")===0)pnotes(key.slice(2)).push(n);
    else{var t=findTask(key.slice(2));if(!t)return;tnotes(t).push(n);}
    delete noteText[key];save();chip("Note saved.");
  }
  document.addEventListener("input",function(e){var el=e.target;if(el&&el.dataset&&el.dataset.nttext!=null)noteText[el.dataset.nttext]=el.value;});
  document.addEventListener("keydown",function(e){var el=e.target;if(el&&el.dataset&&el.dataset.nttext!=null&&e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();noteText[el.dataset.nttext]=el.value;saveNote(el.dataset.nttext);}});
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-nttog],[data-ntsave],[data-ntid]");if(!b)return;e.stopPropagation();
    if(b.dataset.nttog){noteOpen[b.dataset.nttog]=!noteOpen[b.dataset.nttog];render();return;}
    if(b.dataset.ntsave){var ta=document.querySelector('textarea[data-nttext="'+b.dataset.ntsave.replace(/"/g,'\\"')+'"]');if(ta)noteText[b.dataset.ntsave]=ta.value;saveNote(b.dataset.ntsave);return;}
    if(b.dataset.ntid){var id=b.dataset.ntid,list=null;if(b.dataset.ntdelp)list=pnotes(b.dataset.ntdelp);else if(b.dataset.ntdelt){var t=findTask(b.dataset.ntdelt);list=t&&t.notes;}
      if(list){for(var i=list.length-1;i>=0;i--)if(list[i].id===id)list.splice(i,1);save();}return;}
  },true);
  var _tasksNotesBase=tasksHTML;
  tasksHTML=function(){var h=_tasksNotesBase.apply(this,arguments);
    (GROUPS||[]).forEach(function(g){var needle='data-fold="'+g.key+'"',at=h.indexOf(needle);if(at<0)return;var end=h.indexOf('</button>',at);if(end<0)return;end+=9;h=h.slice(0,end)+projNotesHTML(g.key)+h.slice(end);});
    return h;};
  var _aboutNotesBase=aboutHTML;
  aboutHTML=function(t){return _aboutNotesBase(t)+taskNotesHTML(t);};
  var _taskCtxNotes=taskCtx;
  taskCtx=function(t){var c=_taskCtxNotes(t);if((t.notes||[]).length)c.myNotes=t.notes.slice(-8).map(function(n){return n.text;});var pn=state.projectNotes&&state.projectNotes[t.group];if(pn&&pn.length)c.projectNotes=pn.slice(-8).map(function(n){return n.text;});return c;};
  var _doMsgNotes=doMsg;
  doMsg=function(t){var m=_doMsgNotes(t),add="";if((t.notes||[]).length)add+="\nMy notes on this task: "+t.notes.slice(-6).map(function(n){return n.text;}).join(" | ");var pn=state.projectNotes&&state.projectNotes[t.group];if(pn&&pn.length)add+="\nMy notes on this project ("+groupLabel(t.group)+"): "+pn.slice(-6).map(function(n){return n.text;}).join(" | ");return add?m.replace("\n\nWork it end to end",add+"\n\nWork it end to end"):m;};
  /* Give to Claude now starts a run right away (Brody: "I assigned these to ultron already, if they didn't trigger check why").
     It used to wait for the next 8:47 / 11:47 / 2:47 check-in. */
  var _giveBase=giveToClaude;
  giveToClaude=function(t){_giveBase(t);if(t&&mcp&&!live.chatSending){t.doSentAt=new Date().toISOString();progSend(progKey("do",t.id),doMsg(t));chip("Given to Claude. It's starting now.");}};
  var _pkGiveBase=pkGive;
  pkGive=function(t){_pkGiveBase(t);};
