"""Board v5: trim old days to an archive file, a "Needs you" list on Today, Teams items linked to tasks, Friday wrap-up link.
usage: python3 v5.py <in.html> <out.html> <archive.json> <today YYYY-MM-DD>"""
import json,sys,datetime
src,dst,arch,TODAY=sys.argv[1:5]
s=open(src).read()
if not s.startswith("<!doctype html>\n<html"):
    i=s.find("<!doctype html>\n<html");s=s[i:]
    if s.endswith("\n</body></html>"):s=s[:-len("\n</body></html>")]
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
t0=datetime.date.fromisoformat(TODAY)
CUT=(t0-datetime.timedelta(days=14)).isoformat()
# yesterday-ish: keep ops for the last 2 calendar days that have them
days=st['days'];ks=sorted(days)
archive={"note":"Days archived from Brody's board. Each entry is the day exactly as it was on the board.","cut":CUT,"days":{},"ops":{}}
try:
    old=json.load(open(arch))
    archive["days"].update(old.get("days",{}));archive["ops"].update(old.get("ops",{}))
except Exception: pass
moved=0;opsMoved=0
for k in ks:
    d=days[k]
    if k<CUT and not d.get('archived'):
        archive["days"][k]=d
        stub={"archived":True,"log":[],
              "blocks":[{"id":x.get("id"),"start":x.get("start",""),"end":x.get("end",""),"title":x.get("title",""),"done":True,**({"taskIds":x["taskIds"]} if x.get("taskIds") else {})} for x in d.get("blocks",[]) if x.get("done") and not x.get("meeting")]}
        p=d.get("pulse")
        if p and p.get("found"): stub["pulse"]={"found":True,"label":p.get("label",""),"dollars":p.get("dollars"),"orders":p.get("orders")}
        w=[x for x in ((d.get("inbox") or {}).get("waiting") or []) if x.get("closed")]
        if w: stub["inbox"]={"waiting":[{"who":x.get("who",""),"what":x.get("what",""),"closed":x["closed"],**({"mail":{"subject":x["mail"].get("subject","")}} if x.get("mail") else {})} for x in w]}
        days[k]=stub;moved+=1
recent=[k for k in sorted(days) if days[k].get('ops')]
for k in recent[:-2]:
    archive["ops"][k]=days[k].pop('ops');opsMoved+=1
st['_note']+=f" Days before the last 14 are archived to claude-work/board-archive/days.json in Broday6/todo-list (branch claude/brodys-board-v2-fuviv5); on the board they are stubs {{archived:true, blocks: ticked work blocks only, pulse summary, closed waiting lines}}. days[*].ops is kept only for the newest 2 days. state.fridayWrap = {{on, subject, link}}: the Friday wrap-up draft saved to Brody's Outlook Drafts."
for x in st['automations']['building']:
    if x['name']=="Teams watch": x['next']="Live. Items the morning triage already turned into tasks are linked, not repeated."
st['automations']['building'].append({"name":"Friday wrap-up","where":"here","stage":"testing","who":"claude","what":"Fridays at 3:12, one Outlook draft to you only: the week's wins, what slipped, next week's promo dates and your Rocks.","next":"First one this Friday, Nov 6."})
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]
json.dump(archive,open(arch,"w"),ensure_ascii=False,indent=1)
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)
if "function nyTopHTML" not in s:
    rep("<div class=\"tside\">'+lookHTML(day,isToday,overdue)+opsHTML(day)","<div class=\"tside\">'+nyTopHTML()+lookHTML(day,isToday,overdue)+opsHTML(day)")
    # Teams items linked to a task (e.g. from the morning triage) are "on your list", not counted again
    rep("var w=twS(),open=w.items.filter(function(x){return !x.done;}),asks=open.filter(function(x){return x.kind!==\"fyi\";});",
        "var w=twS(),open=w.items.filter(function(x){return !x.done;}),asks=open.filter(function(x){var tk=x.taskId&&findTask(x.taskId);return x.kind!==\"fyi\"&&!(tk&&!tk.done);});")
    rep("<div class=\"tw-g\">'+esc(x.gist||\"\")+'</div><div class=\"tm-m\">'+esc(twWhen(x.on))+'</div></div>';",
        "<div class=\"tw-g\">'+esc(x.gist||\"\")+'</div><div class=\"tm-m\">'+esc(twWhen(x.on))+(tk&&!tk.done?' · already on your list':'')+(x.hint?' · <span style=\"color:var(--ok)\">'+esc(x.hint)+'</span>':'')+'</div></div>';")
    # Friday wrap-up link on the wins panel
    rep("    h+='<p class=\"hint\">Log a win from Today’s log (pick “Win”). Closed tasks and team items land here on their own.</p>';",
        "    h+='<p class=\"hint\">Log a win from Today’s log (pick “Win”). Closed tasks and team items land here on their own. Fridays at 3:12 Claude saves this as a draft to you.</p>';\n    var fw=state.fridayWrap;if(fw&&fw.on&&fw.on>=weekMon(todayISO()))h+='<p class=\"pm-mt\" style=\"margin:0 0 10px\">Friday wrap-up saved to your Outlook Drafts'+(safeLink(fw.link)?': <a href=\"'+esc(fw.link)+'\" target=\"_blank\" rel=\"noopener\">'+esc(fw.subject||\"open it\")+'</a>':'.')+'</p>';")
    JS=r'''
  /* ---------- Today: one "Needs you" list across Teams, Team, Clean-up, Automations, Promotions, Claude ---------- */
  var nyAll=false;
  function nyItems(){
    var out=[],today=todayISO();
    twS().items.forEach(function(x){if(x.done||x.kind==="fyi")return;var tk=x.taskId&&findTask(x.taskId);if(tk&&!tk.done)return;
      out.push({k:"teams",rank:0,on:x.on||"",t:(x.from||"")+": "+(x.gist||""),m:"Teams"+(x.chat?" · "+x.chat:"")+" · "+twWhen(x.on),act:'<button type="button" class="linkbtn" data-twdone="'+esc(x.id)+'">Got it</button>'});});
    tm().people.forEach(function(p){tmOpen(p.youOwe).forEach(function(x){var age=x.since?daysBetween(x.since,today):0;
      out.push({k:"owe",rank:1,on:x.since||"",t:"You owe "+p.short+": "+x.what,m:(x.since?age+" days · ":"")+(x.source||""),act:'<button type="button" class="linkbtn" data-view="team">Team</button>'});});});
    ((au().routines)||[]).forEach(function(r){var s2=auState(r);if(s2.k!=="bad"&&s2.k!=="warn")return;
      out.push({k:"auto",rank:2,on:"",t:r.name+": "+s2.t.toLowerCase(),m:clip(r.note||"",120),act:'<button type="button" class="linkbtn" data-view="auto">Fix</button>'});});
    pms().items.forEach(function(x){if(x.kind==="date"||x.status==="done"||x.status==="dropped"||!x.start)return;var n=daysBetween(today,x.start);if(n<0||n>10)return;
      var td=(x.todo||[]).filter(function(t){return !t.done;});if(!td.length&&x.emailTaskId)return;
      out.push({k:"promo",rank:3,on:x.start,t:x.title+" starts "+shortDate(x.start),m:td.length?td.length+" to-do"+(td.length>1?"s":"")+" left: "+td[0].text:"No emails yet",act:'<button type="button" class="linkbtn" data-view="promo">Open</button>'});});
    var cu=cuOpen().length;if(cu)out.push({k:"clean",rank:4,on:"",t:cu+" clean-up decision"+(cu>1?"s":"")+" on your tasks",m:"One click each",act:'<button type="button" class="linkbtn" data-view="tasks">Decide</button>'});
    var back=state.tasks.filter(function(t){return !t.done&&t.assignee==="claude"&&(t.claudeStatus==="ready"||t.claudeStatus==="blocked");});
    if(back.length)out.push({k:"claude",rank:5,on:"",t:back.length+" task"+(back.length>1?"s":"")+" back from Claude",m:back.slice(0,2).map(function(t){return clip(t.title,40);}).join(" · "),act:'<button type="button" class="linkbtn" data-view="claude">Review</button>'});
    out.sort(function(a,b){return a.rank-b.rank||(a.k==="teams"?(a.on<b.on?1:-1):(a.on<b.on?-1:1));});
    return out;
  }
  var NY_TAG={teams:"Teams",owe:"You owe",auto:"Automation",promo:"Promo",clean:"Clean-up",claude:"Claude"};
  function nyTopHTML(){
    var all=nyItems();if(!all.length)return '';
    var list=nyAll?all:all.slice(0,5);
    var h='<section class="panel nytop"><h2>Needs you <small>'+all.length+' across your tabs</small></h2><ul class="ny2">';
    list.forEach(function(x){h+='<li class="ny2-'+x.k+'"><span class="stag">'+NY_TAG[x.k]+'</span><div><div class="ny2-t">'+esc(x.t)+'</div>'+(x.m?'<div class="tm-m">'+esc(x.m)+'</div>':'')+'</div>'+x.act+'</li>';});
    h+='</ul>'+(all.length>5?'<button type="button" class="tx" data-nyall="1" style="margin-top:6px">'+(nyAll?'Show top 5':'Show all '+all.length)+'</button>':'')+'</section>';
    return h;
  }
  document.addEventListener("click",function(e){if(e.target.closest("[data-nyall]")){nyAll=!nyAll;render();}});

  function planHTML(day,isToday){'''
    rep("\n  function planHTML(day,isToday){",JS)
    CSS='''
/* ---------- Today: Needs you ---------- */
.nytop{border-color:var(--warn)}
.ny2{list-style:none;margin:0;padding:0}
.ny2 li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 10px;align-items:start;padding:9px 0;border-top:1px solid var(--line);font-size:13.5px}
.ny2 li:first-child{border-top:0;padding-top:2px}
.ny2 .stag{margin-top:1px}
.ny2-t{font-weight:500;overflow-wrap:anywhere}
.ny2-teams .stag{background:var(--accent-soft);color:var(--accent)}
.ny2-owe .stag{background:var(--warn-soft);color:var(--warn)}
.ny2-auto .stag{background:var(--bad-soft);color:var(--bad)}
@media(max-width:560px){.ny2 li{grid-template-columns:auto minmax(0,1fr)}.ny2 li>button{grid-column:2;justify-self:start}}
'''
    rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok moved",moved,"ops",opsMoved,"size",len(s))
