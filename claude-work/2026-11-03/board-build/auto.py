import json,sys,re
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
au=st['automations']
au['asOf']="2026-11-03T18:10:00Z"
au['where']={"here":"Cloud","app":"Claude app","pc-browser":"Your PC · desktop browser","pc-chrome":"Your PC · Chrome","pc":"Your PC"}
au['lives']={"here":"Claude Code routine (cloud)","app":"Claude app routine","pc-browser":"Claude desktop › Scheduled, using the desktop browser","pc-chrome":"Claude desktop › Scheduled, using Chrome (PCI profile)","pc":"Claude desktop › Scheduled"}
R=[
 # cloud
 dict(name="Sales pulse",trig="trig_01LMcYKXkRzyN2nnwKGkcSUB",where="here",when="Weekdays 6:15",days="wd",times=["06:15"],src="pulse",
   what="Counts every order confirmation by site and emails you yesterday's sales (Fri–Sun on Mondays) with the week so far.",out="Email to you · Sales tab",last="2026-11-03",status="ok"),
 dict(name="Inbox triage",trig="trig_01Ah3Ga7TgqSpzoQ1uATtuY2",where="here",when="Weekdays 6:30",days="wd",times=["06:30"],src="triage",
   what="Sorts your inbox, lists to-dos from your five key people, tags mail and writes reply drafts it can finish.",out="Email to you · Outlook drafts · Inbox tab",last="2026-11-03",status="ok"),
 dict(name="Board morning rebuild",trig="trig_01UqcLyToyZm3yyc7yQyUGdk",where="here",when="Weekdays 6:50",days="wd",times=["06:50"],src="rebuild",
   what="Builds today's plan around your meetings, reads the pulse, triage and recap, refreshes Hiring, BugHerd and Handshake, and saves reply drafts.",out="This board",last="2026-11-03",status="ok",
   after="Waits for the 6:15 pulse and 6:30 triage emails, up to 9 minutes."),
 dict(name="Cases & alerts",trig="trig_015ZuN56zFoa7kgJA3rqnGcf",where="here",when="Weekdays 7:20, 12:20, 3:20",days="wd",times=["07:20","12:20","15:20"],src="ops",
   what="Reads the pending-case, pricing and NetSuite/Miva alert emails into the Cases tab. Adds a task only for pricing reviews.",out="Cases tab · pricing tasks",last="2026-11-03",status="ok"),
 dict(name="Daily read of your board",trig="trig_01YDFzojud2Xx8LDnqEFoQPH",where="app",when="Weekdays 7:43",days="wd",times=["07:43"],
   what="Reads this board and sends you a short note: today's plan, what's overdue, who you're waiting on, anything stale.",out="Message in the Claude app",last="2026-11-03",status="ok"),
 dict(name="Marketing Category Report",trig="trig_013u32ahu6VztnY5WiA8ByLo",where="here",when="Weekdays 7:51",days="wd",times=["07:51"],
   what="Splits the “Products Without Marketing Category” file by type and maps each row to a marketing category.",out="CSV files to you",last="2026-11-03",status="ok",
   after="Needs that day's searchresults.csv in the OneDrive folder or uploaded to it."),
 dict(name="Morning brief",trig="trig_019ktoFxgsv4GM6hYtaxBQJG",where="app",when="Every day 8:06",days="all",times=["08:06"],
   what="Your morning brief in the Claude app.",out="Message in the Claude app",last="2026-11-03",status="ok"),
 dict(name="Board check-ins",trig="trig_01AKYLwWAuUEsDnzF2wci73i",where="here",when="Weekdays 8:47, 11:47, 2:47",days="wd",times=["08:47","11:47","14:47"],
   what="Works the tasks you give me, flags tasks that look done, adds new meetings, tops up Handshake and saves reply drafts.",out="This board · Outlook drafts",last="2026-11-03",status="ok",
   after="Also starts when you press “Give to Claude”: the task waits for the next check-in."),
 dict(name="App check-ins",trig="trig_01PvKJ48mpt8o9CpEVikpvez",where="app",when="Every 3 hours, 7:36am to 7:36pm",days="all",times=["07:36","10:36","13:36","16:36","19:36"],
   what="Looks at the last and next 3 hours of mail and calendar and tells you what matters.",out="Message in the Claude app",last="2026-11-03",status="ok"),
 dict(name="Ads refresh",trig="trig_01899VdPf2gAAkjas5rmebWr",where="here",when="Weekdays 11:23",days="wd",times=["11:23"],src="adsRefresh",
   what="Copies the latest ads audit from Asana onto the Ads tab: the portal scoreboard, the daily guard, the proposed cuts and open cards.",out="Ads tab",last="2026-11-03",status="ok",
   after="Only changes the board when the Asana ads board has something new."),
 dict(name="Meeting recaps",trig="trig_0118dmodKjFNLoqVAEak6YvS",where="here",when="Weekdays 4:45",days="wd",times=["16:45"],
   what="Recaps today's meetings from chats, invites and follow-up email, with your action items first.",out="Email to you · inbox tasks the next morning",last="2026-11-02",status="ok"),
 dict(name="Weekly website audit",trig="trig_01652c6RPMTQdanSEpgh33XN",where="here",when="Mondays 10:47",days="mon",times=["10:47"],freq="weekly",
   what="Audits AD plus one rotating PCI site: SEO, product pages, search and 404s. Read-only.",out="Asana Website Audit board",last="2026-11-02",status="ok"),
 dict(name="Notion memory sync",trig="trig_01A9Xm1hJZcUvWy1scHirSi6",where="here",when="Mondays 5:41",days="mon",times=["05:41"],freq="weekly",
   what="Copies your Notion Memory into the NotebookLM knowledge base doc in Drive.",out="Google Drive doc",last="2026-11-02",status="ok"),
 dict(name="Daybook backup",trig="trig_01RNsTfWSxh9W4b5wT9JArYn",where="here",when="Sundays 1:38am",days="sun",times=["01:38"],freq="weekly",
   what="Backs up your Daybook to Google Drive and keeps the 12 newest.",out="Google Drive file",last="2026-11-01",status="ok"),
 # PC
 dict(name="Daily ads + portal guard (AD)",where="pc-browser",when="Tue–Fri 7:30",days="tf",times=["07:30"],src="adsDaily",
   what="Marketing Portal L30 and Google Ads for Architectural Depot. Flags spend jumps, $0 days, disapprovals and target changes. Read-only.",out="Asana ads board · Ads tab",last="2026-10-29",status="failed",
   note="No daily guard since Oct 29: the Marketing Portal showed its login page two days running. Sign in to the portal in the Claude desktop browser, then Run now."),
 dict(name="Handshake daily check",where="pc-chrome",when="Every day 7:35",days="all",times=["07:35"],src="handshake",
   what="Reads your Handshake inbox and the newest applicants on your 3 jobs and puts them on the Hiring tab. Never types a password.",out="Hiring tab · notification",last="2026-10-29",status="failed",
   note="Last read the Handshake inbox Oct 29. It was signed out Nov 1 and blocked Nov 2. Open Chrome (PCI profile), sign in to Handshake once, then Run now."),
 dict(name="Ekena carousel board scan",where="pc-chrome",when="Every 3 hours",days="all",times=[],
   what="Works the Product Carousel Generation board in Asana: research, brief, images, evaluation, upload.",out="Asana tasks · image files",last="2026-10-26",status="unknown",
   note="I can't see this one from the cloud. Last confirmed Oct 26. The carousel build fix is still open (see In the works)."),
 dict(name="Weekly ads + portal audit (AD)",where="pc-browser",when="Mondays 9:30",days="mon",times=["09:30"],freq="weekly",src="adsWeekly",
   what="Search terms, keywords, disapprovals, landing pages, and spend cuts sized through Dec 31. Recommend-only.",out="Asana ads board · Ads tab",last="2026-11-02",status="ok"),
 dict(name="Monthly full ads + portal audit (AD)",where="pc-browser",when="16th, 9:00",days="m16",times=["09:00"],freq="monthly",
   what="Full audit plus spend optimizer: scoreboard, year-end projection and reallocation.",out="Asana ads board · scoreboard",last="2026-10-16",status="ok"),
 dict(name="Pacific Columns daily ads check",where="pc-browser",when="Tue–Fri 7:40",days="tf",times=["07:40"],
   what="Leads, cost per lead and spend changes on the Pacific Columns account and portal. Read-only.",out="Asana Pacific Columns board",last="2026-10-23",status="unknown",
   note="Moved to your PC on Oct 27. I can't see its runs from here; last confirmed Oct 23."),
 dict(name="Pacific Columns weekly ads audit",where="pc-browser",when="Tuesdays 10:40",days="tue",times=["10:40"],freq="weekly",
   what="Structure, keyword overlap, net size and search terms for the lead-gen account. Recommend-only.",out="Asana Pacific Columns board",last="2026-10-20",status="unknown",
   note="Moved to your PC on Oct 27. Last confirmed Oct 20."),
 dict(name="Pacific Columns monthly ads audit",where="pc-browser",when="16th, 10:40",days="m16",times=["10:40"],freq="monthly",
   what="Full lead-gen audit with a proposed target structure.",out="Asana Pacific Columns board",last="2026-10-16",status="ok"),
 dict(name="Group 3 and Group 5 weekly audits",where="pc-chrome",when="Paused",days="",times=[],freq="paused",
   what="Older AD audits built on the ROAS rules you've since replaced.",out="",last="2026-10-12",status="paused",note="Paused until they're rewritten without ROAS (see In the works)."),
]
for r in R:
    r.setdefault('freq','daily')
au['routines']=R
au['building']=[
 dict(name="BugHerd live pull",where="pc-chrome",stage="setup",who="you",
   what="Reads your open BugHerd tickets each weekday at 7:15 and feeds the BugHerd tab and the Bug Herds block.",
   next="Create it in Claude desktop › Scheduled from the bugherd-sweep.md file, then press Run now. A test run filled the BugHerd tab on Oct 30.",
   link="https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-02/pc-tasks/bugherd-sweep.md",src="bugherdSweep"),
 dict(name="NetSuite cases check (search 16559)",where="pc-chrome",stage="setup",who="you",taskId="cn1029-7",
   what="Reads saved search 16559 (Preview only) at 7:10 and 12:10 so the Cases tab shows only cases that are really yours.",
   next="Create it in Claude desktop › Scheduled from the cases-sweep-16559.md file, then press Run now.",
   link="https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-02/pc-tasks/cases-sweep-16559.md",src="casesSweep"),
 dict(name="Carousel build fix and Competitor Watch",where="pc-chrome",stage="setup",who="you",taskId="cn1029-6",
   what="The carousel scan's build step fails, and Competitor Watch needs its API keys before it can run.",
   next="Set Competitor Watch's API keys on your PC. Then I can walk you through the carousel fix."),
 dict(name="Group 3 and Group 5 audits, rewritten",where="pc-chrome",stage="idea",who="claude",
   what="Bring the paused G3 and G5 audits onto the portal-first, no-ROAS rules the AD audit now uses.",
   next="Say go and I'll write the new prompts for you to paste into Claude desktop."),
 dict(name="Day log that fills itself",where="here",stage="building",who="claude",
   what="Ticks, closed tasks and Claude's work land in today's log on their own, with a quick-add box.",
   next="Building now, next on the list."),
 dict(name="Team tab",where="here",stage="building",who="claude",
   what="One card per person (Andrew, Hayden, Lauren, Daniel and others) with what they owe you, what you owe them and their latest Teams and email, kept fresh by the check-ins.",
   next="Building now, after the day log."),
 dict(name="Promotions calendar",where="here",stage="building",who="claude",
   what="Black Friday, Cyber Monday, the holiday email push, seasonal environments and vendor promos on one calendar, with what's due for each.",
   next="Building now, after the Team tab."),
]

newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]

def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)

i0=s.index("  function autoHTML(){")
i1=s.index("  function copyText(t){")
old=s[i0:i1]
lib_start=old.index("    h+='<section class=\"panel\" id=\"au-lib\">")
lib_end=old.index("    h+='</div><div class=\"tside\">';")
libcode=old[lib_start:lib_end]
# library becomes a collapsible section
libcode=libcode.replace("""    h+='<section class="panel" id="au-lib"><h2>My library <small>skills I can run for you</small></h2>';""",
"""    h+='<details class="panel au2-lib" id="au-lib"'+(auQ||auLibOpen?' open':'')+'><summary><h2>Skills you can hand me <small>'+lib.length+' skills · open to browse</small></h2></summary>';""")
libcode=libcode.replace("""Cowork or Claude in Chrome).</p></section>';""","""Cowork or Claude in Chrome).</p></details>';""")
assert "</details>" in libcode
NEW=r'''  /* Live "last ran" from what each job writes into the board (r.src), else the stored r.last. */
  var auLibOpen=false;
  document.addEventListener("toggle",function(e){if(e.target&&e.target.id==="au-lib")auLibOpen=e.target.open;},true);
  function auLive(r){
    var k=r.src,on=null,ok=null,d;
    try{
      if(k==="pulse"||k==="triage"){Object.keys(state.days||{}).forEach(function(x){var v=state.days[x][k==="pulse"?"pulse":"inbox"];if(v&&v.found&&(!on||x>on))on=x;});}
      else if(k==="rebuild"){if(state.today&&state.days[state.today]&&(state.days[state.today].blocks||[]).length)on=state.today;}
      else if(k==="ops"){Object.keys(state.days||{}).forEach(function(x){var v=state.days[x].ops;if(v&&v.asOf&&(!on||x>on))on=x;});}
      else if(k==="adsRefresh"){d=state.ads&&state.ads.asOf;if(d)on=String(d).slice(0,10);}
      else if(k==="adsDaily"||k==="adsWeekly"){((state.ads&&state.ads.runs)||[]).forEach(function(x){var m=k==="adsDaily"?/daily/i.test(x.kind):/weekly|monthly/i.test(x.kind);if(m&&x.on){var dd=String(x.on).slice(0,10);if(!on||dd>on){on=dd;ok=x.ok!==false;}}});}
      else if(k==="handshake"){d=state.hiring&&state.hiring.sweep&&state.hiring.sweep.inbox&&state.hiring.sweep.inbox.asOf;if(d)on=String(d).slice(0,10);}
      else if(k==="bugherdSweep"||k==="casesSweep"){d=state[k]&&state[k].asOf;if(d)on=String(d).slice(0,10);}
    }catch(e){}
    if(r.last&&(!on||r.last>on)){on=r.last;ok=null;}
    return {on:on,ok:ok};
  }
  function auRunsOn(r,iso){
    var dt=parseISO(iso),w=dt.getDay();
    return r.days==="all"||(r.days==="wd"&&w>0&&w<6)||(r.days==="tf"&&w>1&&w<6)||(r.days==="mon"&&w===1)||(r.days==="tue"&&w===2)||(r.days==="sun"&&w===0)||(r.days==="m16"&&dt.getDate()===16);
  }
  function auState(r){
    var lv=auLive(r);
    if(r.status==="paused")return {k:"paused",t:"Paused",on:lv.on};
    if(r.status==="failed"&&!(lv.on&&r.last&&lv.on>r.last))return {k:"bad",t:"Not running",on:lv.on};
    if(lv.ok===false)return {k:"bad",t:"Last run blocked",on:lv.on};
    if(r.status==="unknown")return {k:"mut",t:"Can't see it from here",on:lv.on};
    if(r.status==="late")return {k:"warn",t:"Ran late",on:lv.on};
    if(lv.on){var age=daysBetween(lv.on,todayISO()),lim=r.freq==="weekly"?8:r.freq==="monthly"?32:(r.days==="all"?1:(parseISO(todayISO()).getDay()===1?3:1));
      if(age>lim+1)return {k:"warn",t:"Missed a run",on:lv.on};}
    return {k:"ok",t:"Working",on:lv.on};
  }
  function auTime(t){var p=t.split(":"),h=+p[0],m=p[1];return (h%12||12)+":"+m+(h<12?"am":"pm");}
  function auRow(r){
    var s=auState(r),lv=(au().lives||{})[r.where]||"";
    var h='<li class="au2-row" data-tone="'+s.k+'"><span class="mk" aria-hidden="true"></span><div class="au2-main">';
    h+='<div class="au2-n">'+esc(r.name)+'<span class="au2-st '+s.k+'">'+esc(s.t)+(s.on?' · last '+esc(shortDate(s.on)):'')+'</span></div>';
    h+='<div class="au2-d">'+esc(r.what)+'</div>';
    h+='<dl class="au2-facts"><div><dt>Starts</dt><dd>'+esc(r.when)+(r.after?'. '+esc(r.after):'')+'</dd></div>'+(r.out?'<div><dt>Makes</dt><dd>'+esc(r.out)+'</dd></div>':'')+'<div><dt>Lives</dt><dd>'+esc(lv)+'</dd></div></dl>';
    if(r.note&&s.k!=="ok")h+='<div class="au2-fix">'+esc(r.note)+'</div>';
    return h+'</div></li>';
  }
  function autoHTML(){
    var a=au(),rs=(a.routines||[]),lib=(a.library||[]),bl=(a.building||[]),today=todayISO(),nm=nowMin();
    var sts=rs.map(auState),bad=rs.filter(function(r,i){return sts[i].k==="bad"||sts[i].k==="warn";}),okN=sts.filter(function(x){return x.k==="ok";}).length;
    var h='<div class="au-head"><span class="cst"><b>'+okN+'</b>working</span>'
      +(bad.length?'<span class="cst hot"><b>'+bad.length+'</b>need you</span>':'')
      +'<span class="cst"><b>'+bl.length+'</b>in the works</span>'
      +'<span class="cst"><b>'+lib.length+'</b>skills</span>'
      +'<span class="au-legend">'+(a.asOf?'Checked '+esc(shortDate(String(a.asOf).slice(0,10))):'')+'</span></div>';
    /* today's run order */
    var runs=[];rs.forEach(function(r){if(r.status==="paused"||!auRunsOn(r,today))return;(r.times||[]).forEach(function(t){runs.push({r:r,t:t});});});
    runs.sort(function(x,y){return x.t<y.t?-1:x.t>y.t?1:0;});
    h+='<div class="tgrid" style="margin-top:16px"><div class="tmain">';
    if(bad.length){
      h+='<section class="panel au2-need"><h2>Needs you <small>'+bad.length+'</small></h2><ul class="au2-list">';
      bad.forEach(function(r){h+=auRow(r);});
      h+='</ul></section>';
    }
    [["here","In the cloud","Claude Code routines. They run on a schedule whether or not your PC is on."],["app","In the Claude app","Messages to your phone and desktop."],["pc","On your PC","Claude desktop › Scheduled. The app (and Chrome, for some) must be open."]].forEach(function(g){
      var list=rs.filter(function(r,i){var isPc=r.where.indexOf("pc")===0;return (g[0]==="pc"?isPc:r.where===g[0])&&bad.indexOf(r)<0;});
      if(!list.length)return;
      h+='<section class="panel"><h2>'+g[1]+' <small>'+list.length+'</small></h2><p class="hint">'+g[2]+'</p><ul class="au2-list">';
      list.forEach(function(r){h+=auRow(r);});
      h+='</ul></section>';
    });
'''+libcode+r'''    h+='</div><div class="tside">';
    h+='<section class="panel au2-today"><h2>Today’s run order <small>Central</small></h2>';
    if(!runs.length)h+='<p class="empty">Nothing scheduled today.</p>';
    else{h+='<ol class="au2-tl">';
      runs.forEach(function(x){var mins=+x.t.slice(0,2)*60+ +x.t.slice(3),lv=auLive(x.r),past=mins<=nm,ran=lv.on===today&&past,cls=ran?'ran':past?(x.r.src?'miss':'past'):'next';
        h+='<li class="'+cls+'"><span class="t">'+esc(auTime(x.t))+'</span><span class="n">'+esc(x.r.name)+'</span><span class="s">'+(ran?'✓ ran':past?(x.r.src?'not seen':'not confirmed'):'upcoming')+'</span></li>';});
      h+='</ol><p class="hint" style="margin:8px 0 0">✓ means the board has today’s output from that job. Jobs that only email or message you show “not confirmed” until a check-in sees them run.</p>';}
    h+='</section>';
    h+='<section class="panel au2-wip"><h2>In the works <small>'+bl.length+'</small></h2>';
    var STG={idea:"Idea",building:"Building",setup:"Needs setup",testing:"Testing"};
    if(!bl.length)h+='<p class="empty">Nothing in progress.</p>';
    bl.forEach(function(x){var lv=x.src?auLive({src:x.src}):{};var tk=x.taskId&&findTask(x.taskId);
      h+='<article class="au2-w"><div class="au2-wt"><span class="au2-n">'+esc(x.name)+'</span><span class="stag '+(x.stage==="setup"?"warn":x.stage==="building"?"acc":"")+'">'+esc(STG[x.stage]||x.stage)+'</span></div>';
      h+='<div class="au2-d">'+esc(x.what)+'</div>';
      h+='<div class="au2-next"><b>'+(x.who==="you"?'Next, you:':'Next, Claude:')+'</b> '+esc(x.next)+(lv.on?' Last data '+esc(shortDate(lv.on))+'.':'')+'</div>';
      h+='<div class="au2-wl">'+whereTag(x.where)+(x.link?'<a href="'+esc(x.link)+'" target="_blank" rel="noopener">Setup file</a>':'')+(tk&&!tk.done?'<button type="button" class="tx" data-opentask="'+esc(tk.id)+'">Open the task</button>':'')+'</div></article>';});
    h+='<p class="hint" style="margin:10px 0 0">To add, change or pause a job, tell me in chat or in the Ask box.</p></section>';
    h+='</div></div>';
    return h;
  }
'''
s=s[:i0]+NEW+s[i1:]
CSS='''
/* ---------- Automations v2 ---------- */
.au2-list{list-style:none;margin:0;padding:0}
.au2-row{display:grid;grid-template-columns:10px minmax(0,1fr);gap:10px;padding:12px 0;border-top:1px solid var(--line)}
.au2-row:first-child{border-top:0;padding-top:4px}
.au2-row .mk{width:9px;height:9px;border-radius:50%;margin-top:6px;background:var(--ok)}
.au2-row[data-tone="bad"] .mk{background:var(--bad)}
.au2-row[data-tone="warn"] .mk{background:var(--warn)}
.au2-row[data-tone="mut"] .mk,.au2-row[data-tone="paused"] .mk{background:var(--line-strong)}
.au2-n{font-size:14.5px;font-weight:600;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}
.au2-st{font-size:12px;font-weight:500;color:var(--ok)}
.au2-st.bad{color:var(--bad)}.au2-st.warn{color:var(--warn)}.au2-st.mut,.au2-st.paused{color:var(--muted)}
.au2-d{font-size:13px;color:var(--muted);margin-top:2px}
.au2-facts{display:grid;grid-template-columns:1fr;gap:3px;margin:8px 0 0;font-size:12.5px}
.au2-facts div{display:grid;grid-template-columns:52px minmax(0,1fr);gap:8px}
.au2-facts dt{color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding-top:1px}
.au2-facts dd{margin:0}
.au2-fix{margin-top:8px;padding:8px 10px;border-radius:6px;background:var(--warn-soft);font-size:13px}
.au2-row[data-tone="bad"] .au2-fix{background:var(--bad-soft)}
.au2-need{border-color:var(--bad)}
.au2-lib>summary{list-style:none;cursor:pointer}
.au2-lib>summary::-webkit-details-marker{display:none}
.au2-lib>summary h2{margin:0}
.au2-lib[open]>summary h2{margin-bottom:12px}
.au2-tl{list-style:none;margin:0;padding:0}
.au2-tl li{display:grid;grid-template-columns:62px minmax(0,1fr) auto;gap:8px;padding:6px 0;border-top:1px solid var(--line);font-size:13px;align-items:baseline}
.au2-tl li:first-child{border-top:0}
.au2-tl .t{font-family:var(--mono);font-size:12px;color:var(--muted)}
.au2-tl .s{font-size:12px;color:var(--muted);white-space:nowrap}
.au2-tl li.ran .s{color:var(--ok);font-weight:500}
.au2-tl li.miss .s{color:var(--bad);font-weight:500}
.au2-tl li.next .n{color:var(--muted)}
.au2-w{padding:12px 0;border-top:1px solid var(--line)}
.au2-w:first-of-type{border-top:0;padding-top:2px}
.au2-wt{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:space-between}
.au2-next{font-size:13px;margin-top:6px}
.au2-next b{font-weight:600}
.au2-wl{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin-top:8px;font-size:13px}
'''
rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok")
