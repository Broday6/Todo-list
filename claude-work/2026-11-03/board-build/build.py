import json,sys
src=sys.argv[1] if len(sys.argv)>1 else "base.html"
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b]
lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
T={t['id']:t for t in st['tasks']}
ON="2026-11-03"; NOW="2026-11-03T15:00:00Z"
def upd(t,text): t['update']={'on':ON,'by':'Claude','text':text}

# ---------- 1. direct closures (each one can be brought back from the Clean-up panel) ----------
def close(i,how,why):
    t=T.get(i)
    if not t or t.get('done'): return
    t['done']=True;t['doneOn']=ON
    if how=='drop':
        t['doneVia']='dropped'
        t['dropped']={'on':ON,'t':NOW,'title':t['title'],'from':t.get('from',''),'subject':(t.get('mail') or {}).get('subject','')}
    else: t['doneVia']='cleanup'
    t['cleanupApplied']={'how':how,'why':why,'on':ON}
    upd(t,('Closed as done: ' if how=='done' else 'Closed as not needed: ')+why)
for i in ['t7','t8','t9']: close(i,'done',"You said on Nov 3 that the Q3 Rocks are all done.")
for i in ['al-netsuite-csv-import-notificati-20261029-2','al-netsuite-csv-import-bracket-de-20261028-2','al-netsuite-csv-import-hi-metal-s-20261028-2']:
    close(i,'drop',"Duplicate. The cases check added it a second time after you ticked the first one.")
close('al-updated-fields-for-hi0336-s-4-20261030-2','drop',"Duplicate of the same alert task, which is still open.")
close('hs-2026-11-01','drop',"Replaced by the Nov 2 Handshake sign-in task.")
close('wk-int1','done',"The phone interview was Oct 6.")
close('in1030-2','done',"The meeting with Hayden was Oct 30.")
close('wk-search','done',"The Algolia demo was Oct 8.")
close('w1b','done',"First screens were booked (Jaden and Maryssa).")
close('cn1029-3','done',"The daily alert runs are working: the Inaccurate AD, Ekena and Miva tasks came in Nov 2.")
for i in ['cl-sg1026-1','cl-sg1026-2']:
    close(i,'drop',"Covered by the daily alert tasks, as your Oct 29 note said to do once the alert run worked.")

# ---------- 2. recommendations for Brody to decide ----------
REC=[
 ('t19guv','drop','',"A Sep 3 reminder. Search terms are now covered by the Monday ads audit."),
 ('w1','drop','',"Same job as the recurring “Find people to interview” task."),
 ('t7fp22','redate','',"A recurring hiring task with an old Sep 11 date. Clearing the date stops it showing as overdue."),
 ('cl-sg1023-4','drop','',"These BugHerd tickets are listed on the BugHerd tab now."),
 ('cn1029-1','done','',"Looks sent: “RE: New Navigation Dropdowns” went to Paul and Tory on Oct 30 with the attachment."),
 ('in1029-3','done','',"Lauren fixed the kit price on Oct 29."),
 ('in1026-3','drop','',"Pending cases belong to Kody, so this doesn’t need a task."),
 ('te3fsma','done','',"The job postings are live on Handshake."),
 ('t10','redate','2026-11-09',"Interviews are still going this week. Moving it to Monday."),
 ('t11','redate','2026-11-16',"The offer can only go out after interviews. Moving it to Nov 16."),
 ('cl1022-4','redate','2026-11-09',"No date and no update since Oct 22. Give it a date or let it go."),
 ('cn1029-9','redate','2026-11-09',"No date and no update since Oct 29."),
 ('cn1029-5','redate','2026-11-09',"No date. It takes about 10 minutes at claude.ai."),
 ('pr1028-1','redate','2026-11-09',"Overdue since Oct 28 and no update since."),
 ('in1026-4','redate','2026-11-09',"Overdue since Oct 26. Andrew is waiting to hear: deactivate the parent or rebuild it."),
 ('ts8f3qk','claude','',"Claude can check your mail to see whether Daniel sent the motif emails, and draft a nudge if he hasn’t."),
 ('cn1029-8','claude','',"Claude can draft the email to Ryan with his 341 open conflicts, grouped the way Notion has them."),
 ('wk-fable','idea','',"A nice-to-have with no deadline, so it fits better in Ideas."),
 ('t13','idea','',"A second navigation redesign is a bigger project. Park it in Ideas, or add it to your 2027 goals."),
 ('t14','drop','',"Covered by “Kits: name a model kit and walk Claude through one”, which is the live version of this."),
 ('t15','drop','',"The Ekena carousel pipeline already runs on the Product Carousel board, so this is mostly built."),
 ('t8qt1r','ask','',"There’s no date or note beyond “Kill the full collection.” Is it still needed?"),
]
for i,rec,to,why in REC:
    t=T.get(i)
    if not t or t.get('done'): continue
    t['cleanup']={'rec':rec,'to':to,'why':why,'on':ON}

# ---------- 3. Claude can do these (Brody gives them to Claude) ----------
CAN={
 'cn1029-8':("Draft the email to Ryan with his open spec conflicts from Notion, grouped by type, saved to your Outlook Drafts for you to send. Nothing in Notion changes.",
   ["Read the Notion “Spec review – conflicts & decisions” database and count the open rows by type.",
    "Draft a short email to Ryan that explains what he needs to decide and links the Notion view.",
    "Save it to your Outlook Drafts and post the link in this task's thread."]),
 'in1103-1':("Keep this week's list of broken tools from your email and Teams, and re-check each one once IT says it's fixed. Nothing is sent to Web Dev.",
   ["Read Daniel's “Temporary System and Tool Disruptions” email and this week's replies.",
    "List each tool or page that's broken, with who reported it and when.",
    "Each check-in, add new breaks and mark the ones IT says are fixed, in this task's thread."]),
 'g5q1-06':("Draft the email to Paul with the 4 new-page nav rows from the build kit, saved to your Outlook Drafts for you to check and send.",
   ["Pull the 4 nav rows from the nav proposal sheet in the G5 build kit.",
    "Draft the email to Paul in your style.",
    "Save it to your Outlook Drafts and post the link in this task's thread."]),
 'g5q1-07':("Draft the email asking procurement to add Pearl's missing shelves, saved to your Outlook Drafts. You decide whether to send it; nothing changes in NetSuite.",
   ["List the missing shelves and surrounds from the G5 plan.",
    "Draft the email to procurement in your style.",
    "Save it to your Outlook Drafts and post the link in this task's thread."]),
}
for i,(how,steps) in CAN.items():
    t=T.get(i)
    if t and not t.get('done') and not t.get('claudeCan') and t.get('assignee')!='claude':
        t['claudeCan']={'how':how,'steps':steps}
        upd(t,"Claude can do this now. Use “Give to Claude” if you want it.")
for i,rec,to,why in REC:
    t=T.get(i)
    if t and t.get('cleanup') and 'update' not in t: upd(t,"In Clean-up: "+why)

st['_note']=st.get('_note','')+" task.update = {on,by,text}: the latest thing that happened on a task. Set it whenever a routine changes or reports on a task. task.cleanup = {rec,to,why,on,decided?} is a Clean-up suggestion for Brody; task.cleanupApplied = {how,why,on} marks a task Claude closed in a clean-up (Brody can bring it back). Idea tasks may carry interest: \"yes\"|\"no\"."

newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]

# ---------- app code ----------
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:60],s.count(old))
    s=s.replace(old,new)

JS=r'''
  /* ---------- Clean-up panel, last-update lines, idea triage ---------- */
  var CU_LABEL={done:"Done",drop:"Not needed",redate:"Move date",claude:"Give to Claude",idea:"Move to Ideas",keep:"Keep",ask:"Keep"};
  var CU_ORDER={done:0,drop:1,claude:2,redate:3,idea:4,ask:5};
  function cuOpen(){return state.tasks.filter(function(t){return t.cleanup&&!t.cleanup.decided&&!t.done;}).sort(function(a,b){var r=function(t){var k=CU_ORDER[t.cleanup.rec];return k==null?9:k;};return r(a)-r(b);});}
  function cuApplied(){return state.tasks.filter(function(t){return t.cleanupApplied;});}
  function cuRecLabel(c){if(c.rec==="redate")return c.to?"Move to "+shortDate(c.to):"Clear the date";return CU_LABEL[c.rec]||c.rec;}
  function cuHTML(){
    var list=cuOpen(),done=cuApplied();
    if(!list.length&&!done.length)return '';
    var h='<section class="panel cu" id="sec-cleanup"><h2>Clean-up <small>'+(list.length?'<b>'+list.length+'</b> for you to decide · ':'')+(done.length?done.length+' already closed':'')+'</small></h2>';
    if(list.length){
      h+='<p class="hint">Claude went through every open task. The blue button is the suggestion. One click applies it, and you can still undo it.</p><ul class="cu-list">';
      list.forEach(function(t){
        var c=t.cleanup;
        h+='<li class="cu-row" data-task="'+esc(t.id)+'"><div class="cu-t">'+esc(t.title)+'<span class="cu-g">'+esc(groupLabel(t.group))+(t.due?' · due '+esc(shortDate(t.due)):'')+'</span></div>';
        h+='<div class="cu-why">'+esc(c.why)+'</div><div class="cu-acts">';
        var opts=c.rec==="ask"?["keep","drop"]:[c.rec].concat(["done","drop","redate","claude","idea","keep"].filter(function(x){return x!==c.rec;}));
        opts.forEach(function(o,ix){
          if(o==="claude"&&!canClaude(t))return;
          if(o==="idea"&&t.group.indexOf("idea-")===0)return;
          var lab=o===c.rec?cuRecLabel(c):(o==="redate"?"Next Mon":CU_LABEL[o]);
          h+='<button type="button" class="'+(ix===0&&c.rec!=="ask"?'btn':'linkbtn')+'" data-cu="'+o+'" data-id="'+esc(t.id)+'"'+(o==="redate"&&o!==c.rec?' data-to="'+nextMonday()+'"':(o==="redate"?' data-to="'+esc(c.to||"")+'"':''))+'>'+esc(lab)+'</button>';
        });
        h+='</div></li>';
      });
      h+='</ul>';
    }
    if(done.length){
      h+='<details class="cu-done"'+(list.length?'':' open')+'><summary>Closed in the clean-up ('+done.length+')</summary><ul class="cu-list">';
      done.forEach(function(t){
        var c=t.cleanupApplied;
        h+='<li class="cu-row small"><div class="cu-t">'+esc(t.title)+'<span class="cu-g">'+(t.done?(c.how==="drop"?'Not needed':'Done'):'Back on your list')+'</span></div><div class="cu-why">'+esc(c.why)+'</div>'+
          (t.done?'<div class="cu-acts"><button type="button" class="linkbtn" data-close="reopen" data-id="'+esc(t.id)+'">Bring back</button></div>':'')+'</li>';
      });
      h+='</ul></details>';
    }
    return h+'</section>';
  }
  function cuApply(t,how,to){
    if(!t)return;
    var c=t.cleanup||(t.cleanup={});
    c.decided={how:how,on:todayISO()};
    if(how==="done"||how==="drop"){t.update={on:todayISO(),by:"Brody",text:how==="done"?"Marked done in Clean-up.":"Marked not needed in Clean-up."};closeTask(t,how);return;}
    if(how==="redate"){t.due=to||"";t.update={on:todayISO(),by:"Brody",text:to?"Moved to "+shortDate(to)+" in Clean-up.":"Date cleared in Clean-up."};save();chip(to?"Moved to "+shortDate(to)+".":"Date cleared.");return;}
    if(how==="claude"){t.update={on:todayISO(),by:"Brody",text:"Given to Claude in Clean-up."};giveToClaude(t);return;}
    if(how==="idea"){t.group="idea-other";t.due="";t.update={on:todayISO(),by:"Brody",text:"Moved to Ideas in Clean-up."};save();chip("Moved to Ideas: Other.");return;}
    t.update={on:todayISO(),by:"Brody",text:"Kept in Clean-up."};save();chip("Kept.");
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-cu]");
    if(b){cuApply(findTask(b.dataset.id),b.dataset.cu,b.dataset.to);return;}
    var iv=e.target.closest("[data-interest]");
    if(iv){var t=findTask(iv.dataset.id);if(!t)return;var v=iv.dataset.interest;
      if(t.interest===v)delete t.interest;else t.interest=v;
      t.update={on:todayISO(),by:"Brody",text:t.interest==="yes"?"Marked interested.":t.interest==="no"?"Marked not now.":"Interest cleared."};
      save();chip(t.interest==="yes"?"Marked interested. It shows on Goals too.":t.interest==="no"?"Marked not now. It moves to the bottom.":"Cleared.");return;}
  });
  function lastUpdate(t){
    var best=null;
    function take(on,by,text){if(!on||!text)return;var d=String(on).slice(0,10);if(!best||d>=best.on)best={on:d,by:by,text:text};}
    if(t.update)take(t.update.on,t.update.by,t.update.text);
    (t.thread||[]).forEach(function(m){if(m&&m.t&&m.text&&m.text!=="Given to Claude.")take(m.t,m.role==="claude"?"Claude":"You",m.text);});
    if(t.answeredAt&&t.answer)take(t.answeredAt,"You",t.answer);
    return best;
  }
  function updLine(t){
    if(t.done||t.group.indexOf("idea-")===0)return '';
    var u=lastUpdate(t);
    if(u)return '<div class="tupd"><b>'+esc(shortDate(u.on))+'</b> · '+esc(u.by==="Brody"?"You":u.by)+': '+esc(clip(u.text,140))+'</div>';
    if(t.since)return '<div class="tupd stale">Added '+esc(shortDate(String(t.since).slice(0,10)))+' · no update since</div>';
    return '';
  }
  function interestBtns(t){
    if(t.done||t.group.indexOf("idea-")!==0)return '';
    return '<span class="ivbtns"><button type="button" class="ivb'+(t.interest==="yes"?' on yes':'')+'" data-interest="yes" data-id="'+esc(t.id)+'" aria-pressed="'+(t.interest==="yes")+'">Interested</button><button type="button" class="ivb'+(t.interest==="no"?' on no':'')+'" data-interest="no" data-id="'+esc(t.id)+'" aria-pressed="'+(t.interest==="no")+'">Not now</button></span>';
  }
  function ideaSort(a,b){var r=function(t){return t.interest==="yes"?0:t.interest==="no"?2:1;};return r(a)-r(b)||byDue(a,b);}
  function interestHTML(){
    var list=state.tasks.filter(function(t){return !t.done&&t.group.indexOf("idea-")===0&&t.interest==="yes";});
    var h='<section class="panel ob-ideas"><h2>Ideas you’re interested in <small>'+list.length+'</small></h2>';
    if(!list.length)return h+'<p class="empty">None yet. On the Tasks tab, open the Backlog and press “Interested” on any idea you want to chase. It shows up here.</p></section>';
    h+='<ul class="cl-list">';
    list.forEach(function(t){h+='<li><div class="ct">'+esc(t.title)+'</div><div class="cm">'+esc(groupLabel(t.group))+(t.note?' · '+esc(clip(t.note,140)):'')+'</div><div class="cacts">'+interestBtns(t)+'</div></li>';});
    return h+'</ul></section>';
  }

  function tasksHTML(){'''
rep("\n  function tasksHTML(){",JS)
# cleanup panel on top of tasks tab
rep("      h+=needsHTML();\n      h+=tasksHTML();","      h+=cuHTML();\n      h+=needsHTML();\n      h+=tasksHTML();")
rep("      h+=goalsHTML();\n","      h+=goalsHTML();\n      h+=interestHTML();\n")
# idea sort + counts
rep("      var open=all.filter(function(t){return !t.done;}).sort(byDue);","      var open=all.filter(function(t){return !t.done;}).sort(g.key.indexOf(\"idea-\")===0?ideaSort:byDue);")
rep("""        h+='<div class="backlog"><h3><span>Backlog</span><span>'+(q?'matches':ideaTotal+' ideas')+'</span></h3>';""",
"""        var ivY=state.tasks.filter(function(t){return !t.done&&t.group.indexOf("idea-")===0&&t.interest==="yes";}).length,ivN=state.tasks.filter(function(t){return !t.done&&t.group.indexOf("idea-")===0&&t.interest==="no";}).length;
        h+='<div class="backlog"><h3><span>Backlog</span><span>'+(q?'matches':ideaTotal+' ideas · '+ivY+' interested · '+(ideaTotal-ivY-ivN)+' not sorted yet')+'</span></h3><p class="hint">Press “Interested” on ideas you want to chase. They go to the top and show on Goals. “Not now” sends one to the bottom.</p>';""")
# task row: update line + interest buttons + idea dim
rep("""    var h='<li class="task'+(t.done?' done':'')+(openTasks[t.id]?' open':'')+'" data-task="'+esc(t.id)+'">';""",
"""    var h='<li class="task'+(t.done?' done':'')+(openTasks[t.id]?' open':'')+(t.interest==="no"&&!t.done?' iv-no':'')+'" data-task="'+esc(t.id)+'">';""")
rep("""+(t.note?'<div class="note">'+esc(t.note)+'</div>':'')+claudeRow(t)+'</div>';
    h+='<div class="meta">'""","""+(t.note?'<div class="note">'+esc(t.note)+'</div>':'')+updLine(t)+claudeRow(t)+interestBtns(t)+'</div>';
    h+='<div class="meta">'""")
# redate by Brody records an update
rep("""    if(rd){var rdt=findTask(rd.dataset.redate);if(rdt){rdt.due=rd.dataset.to||"";save();}return;}""",
"""    if(rd){var rdt=findTask(rd.dataset.redate);if(rdt){rdt.due=rd.dataset.to||"";rdt.update={on:todayISO(),by:"Brody",text:rdt.due?"Moved to "+shortDate(rdt.due)+".":"Date cleared."};save();}return;}""")
rep('''    if(how==="reopen"){setTaskDone(t,false);delete t.dropped;save();chip("Back on your list.");return;}''','''    t.update={on:todayISO(),by:"Brody",text:how==="reopen"?"Brought back.":how==="drop"?"Marked not needed.":"Marked done."};
    if(how==="reopen"){setTaskDone(t,false);delete t.dropped;save();chip("Back on your list.");return;}''')
# group labels
rep('{key:"rocks",label:"Rocks",sub:"Due Sep 30"}','{key:"rocks",label:"Q3 Rocks",sub:"All done. You closed the quarter on Nov 3"}')
rep('{key:"frozen",label:"Frozen until Oct 1",sub:"Not lower priority. Frozen."}','{key:"frozen",label:"Parked during Q3",sub:"Held back so the Q3 Rocks got done. The freeze ended Oct 1. Decide each one in Clean-up"}')

CSS='''
/* ---------- clean-up, last update, idea triage ---------- */
.cu{border-color:var(--accent)}
.cu-list{list-style:none;margin:0;padding:0}
.cu-row{display:grid;grid-template-columns:minmax(0,1fr);gap:3px;padding:11px 0;border-top:1px solid var(--line)}
.cu-row:first-child{border-top:0}
.cu-t{font-size:14px;font-weight:500;overflow-wrap:anywhere}
.cu-g{display:inline-block;margin-left:8px;font-size:12px;font-weight:400;color:var(--muted)}
.cu-why{font-size:13px;color:var(--muted)}
.cu-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px}
.cu-acts .btn{padding:5px 11px;font-size:12.5px}
.cu-row.small{padding:8px 0}
.cu-done{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}
.cu-done summary{cursor:pointer;color:var(--muted);font-size:13px;font-weight:500}
.tupd{font-size:12px;color:var(--muted);margin-top:3px;overflow-wrap:anywhere}
.tupd b{font-family:var(--mono);font-weight:500;color:var(--ink)}
.tupd.stale{color:var(--warn)}
.ivbtns{display:inline-flex;gap:4px;margin-top:5px}
.ivb{font-size:12px;padding:2px 9px;border:1px solid var(--line-strong);border-radius:999px;background:var(--panel);color:var(--muted);font-weight:500}
.ivb:hover{border-color:var(--ink);color:var(--ink)}
.ivb.on.yes{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
.ivb.on.no{background:var(--sunk);color:var(--ink)}
.task.iv-no .title{color:var(--muted);font-weight:400}
.ob-ideas{margin-top:16px}
'''
rep("\n</style>",CSS+"</style>")
open("out.html","w").write(s)
print("ok",len(s))
