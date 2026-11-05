import re,json,sys,os
f,out,NOW=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
FJ=open(D+'/feat.js').read(); FC=open(D+'/feat.css').read()
def rep(a,b,n=1):
    global h
    c=h.count(a); assert c==n,(a[:100],c); h=h.replace(a,b)
if 'function stretyHTML' not in h:
    A='  document.addEventListener("click",function(e){if(e.target.closest("[data-nyall]")){nyAll=!nyAll;render();}});\n'
    rep(A,A+FJ)
    rep("    out.sort(function(a,b){return a.rank-b.rank||(a.k===\"teams\"","    out=out.concat(nyExtra());\n    out.sort(function(a,b){return a.rank-b.rank||(a.k===\"teams\"")
    rep("""(x.hint?' · <span style="color:var(--ok)">'+esc(x.hint)+'</span>':'')+'</div></div>';""","""(x.hint?' · <span style="color:var(--ok)">'+esc(x.hint)+'</span>':'')+'</div>'+twActs(x)+twReplyHTML(x)+progHTML(progKey("tw",x.id))+'</div>';""")
    rep("""    if(l)h+='<a class="linkbtn" href="'+esc(l)+'" target="_blank" rel="noopener">Open in Outlook</a>';\n    return h;""","""    if(l)h+='<a class="linkbtn" href="'+esc(l)+'" target="_blank" rel="noopener">Open in Outlook</a>';\n    if(!/^Brody\\b/.test(m.from||"")&&!/^Inbox triage\\b/i.test(m.subject||""))h+=ibReplyBtn(key,m)+progHTML(progKey("rep",key));\n    return h;""")
    rep("""    h+='</div>'+progHTML(progKey("dig",t.id));""","""    h+=doItHTML(t)+'</div>'+progHTML(progKey("dig",t.id))+progHTML(progKey("do",t.id));""")
    rep(""">Dig deeper (email, Teams, Notion)</button></div>';""",""">Dig deeper (email, Teams, Notion)</button>'+(b.meeting?'':'<button type="button" class="btn doit" data-bdo="'+esc(b.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>\\u26A1 Have Claude do this</button>')+'</div>'+progHTML(progKey("bdo",b.id));""")
    rep('["cases","Cases"],','["cases","Cases"],["strety","Strety"],')
    rep('["Focus",["today","inbox","team","bugherd","cases",','["Focus",["today","inbox","team","bugherd","cases","strety",')
    rep('var KEYORDER=["today","inbox","team","tasks","goals","week","claude","auto","sales","promo","hiring","bugherd","cases","ads","abtests","chat"];','var KEYORDER=["today","inbox","team","tasks","goals","week","claude","auto","sales","promo","hiring","bugherd","cases","ads","abtests","chat","strety"];')
    rep('var VIEW_TITLE={today:"Today",','var VIEW_TITLE={strety:"Strety",today:"Today",')
    rep("  var ICON={\n","  var ICON={\n    strety:'<path d=\"M6 21V4M6 4h11l-2.5 4L17 12H6\"/>',\n")
    rep("    } else if(view===\"abtests\"){\n      h+=abtestsHTML();","    } else if(view===\"strety\"){\n      h+=stretyHTML();\n    } else if(view===\"abtests\"){\n      h+=abtestsHTML();")
    rep("    else if(view===\"chat\"){sub=","    else if(view===\"strety\"){sub='Your Rocks, Scorecard, To-dos and Milestones from Strety. Make a task or let Claude work one.';}\n    else if(view===\"chat\"){sub=")
    m=re.search(r'<style id="style">',h); i=h.index('</style>',m.end()); h=h[:i]+"\n/* ---------- Nov 5: Needs you, automate, Strety, Teams replies ---------- */\n"+FC+h[i:]
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
if not s.get('strety'):
    s['strety']=json.load(open(D+'/strety.json'))
N1=" STRETY (Nov 5): state.strety holds Brody's Strety Rocks, Scorecard, To-dos and Milestones, read from Strety's Monday email \"Your weekly check-in is ready\" (noreply@strety.com). The Monday morning rebuild re-reads that email and replaces rocks/scorecard/todos/milestones (keep each item's id and taskId when the title matches; set asOf, emailLink, and more.{rocks,scorecard,todos,milestones} from the \"+ N others\" lines). Strety has no connector: never claim anything changed in Strety."
N2=" TEAMS LINKS (Nov 5): when adding a teamsWatch item, also store webUrl (the message's Teams webUrl from chat search) so the board can open that chat. A teamsWatch item's replyDraft is Brody's reply text, written by the board or by Live chat; never post it."
N3=" PUBLISH CHECK (Nov 5): the file you publish must start with '<!doctype html>\\n<html lang' (one document, not wrapped in another). If it starts with '<!doctype html><html><head><meta charset=utf8>', unwrap it first (step 1)."
for n in (N1,N2,N3):
    if n[:25] not in s['_note']: s['_note']+=n
d=s['days'][s['today']]
if not any('Strety tab' in (l.get('text') or '') for l in d['log']):
    d['log'].append({"t":"11:20","text":"New: Strety tab; ⚡ Have Claude do it now on every task and plan block; Draft a reply and Claude handles it on Teams messages; Claude drafts the reply on emails; a live progress bar on everything you send to Claude; a louder Needs you panel (answers and drafts to send first).","kind":"claude","by":"Claude"})
s['updated']=NOW
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(out,'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):]); print('ok')
