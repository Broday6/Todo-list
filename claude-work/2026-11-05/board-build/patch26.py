import sys,os,re,json,datetime
# patch26: G5 plan tab, ratings→lessons, hand-off brief, reference cards, bulk + scheduled hand-off,
# recurring work, one-tap asks, links on tasks, run history + retry, duplicate finder (Nov 6)
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function g5HTML(' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,open(D+'/p26.js').read()+open(D+'/tsfall.js').read()+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+open(D+'/p26.css').read()+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
if not s.get('g5plan'): s['g5plan']=json.load(open(D+'/g5plan.json'))
if not s.get('refCards'):
    s['refCards']=[
     {"id":"c-owners","title":"Category owners by group","always":True,"body":"G1: Flex Trim. G2: AFCO and Turncraft (Andrew Gonzalez). G3: ACP (Hayden Clow). G4: Builder's Edge and Mid-America (Lauren Milkie). G5: Beams, Mantels, Hardware, Fasteners & Adhesives incl. Pearl Mantels and Brass Accents (Brody)."},
     {"id":"c-who","title":"Who does what","always":True,"body":"Brody: G5 category owner; approves every live change, applies ad changes, sends emails, signs in to Miva and NetSuite. Claude: data pulls, audits, Miva/NetSuite files, copy and FAQs, fact checks, reports, drafts. Paul: nav import (we can also build categories in Miva ourselves). Web dev: 301s and template fixes. Procurement: product names, new items, vendor images. Ryan: product-fact rulings (install kit, exterior use, textures). Ethan: assortment and Barron/AZ line plan. Hayden: faux stone cross-link, mantel legs category. LAS: shipping salients vs NetSuite lead times. Tory: website back-end errors (feeds, indexing, Athos) - don't ping Brody about those."},
     {"id":"c-voice","title":"How to address people","always":True,"body":"Hey <first name> for PCI people; Hi <first name> for anyone outside PCI. Point first, match their length, close with Thanks, then Brody. No signature block, no em dashes, no brackets or TBD. Never promise dates, prices, specs, SKUs or fixes that aren't already stated."},
     {"id":"c-sites","title":"Sites","always":False,"body":"Architectural Depot (architecturaldepot.com; blocks bots, use the product feed), HomeOver, Ekena Millwork (ekenamillwork.com), Millwork.com, FauxBeams.com. Ekena products come first in recommendations."},
     {"id":"c-searches","title":"NetSuite saved searches","always":False,"body":"14837 product data (Brody's main search). 15585 sales by item. 16559 ECOM pending cases (alerts assigned to Brody are his cases). 14668 daily item alert. 11921 item group list prices. Preview only, never save a search."},
     {"id":"c-vendors","title":"Vendors and lines (G5 and related)","always":False,"body":"Pearl Mantels (mantels, shelves, surrounds; G5). Brass Accents (hardware; G5). AmeriCraft, ForgeCraft, Heritage, TimberThane, Endurathane (beams, mantels, hardware lines). Barron Designs and AZ Faux (beam lines planned for Q2-Q3). Add lead times and contacts' names as you learn them."}]
if not s.get('recurring'):
    s['recurring']=[
     {"id":"r-g5mon","title":"Monday G5 check: portal scoreboard, Google Ads by group, dead-search check","every":"weekly","day":"mon","playbook":"research","mode":"auto","on":True,"note":"From the G5 plan's weekly rhythm. Read the newest 'Ultron feed:' ads emails if they exist; recommend only, never change ads."},
     {"id":"r-g5ok","title":"15-minute review of everything waiting on your OK","every":"weekly","day":"mon","playbook":"general","mode":"manual","on":True,"note":"Open Do now › Decide."},
     {"id":"r-g5month","title":"Monthly G5 scorecard: sales by item (15585) attach rates, new-page sales, spend vs 7.5%","every":"monthly","day":"mon","playbook":"research","mode":"auto","on":True,"note":"Update the 'Now' column of state.g5plan.scorecard from the 15585 email and the portal; recommend only."},
     {"id":"r-g5qtr","title":"Quarterly G5 refresh: re-run the deep dive and competitor check, reset next quarter","every":"quarterly","day":"mon","playbook":"research","mode":"plan","on":True,"note":"End-of-quarter review from the G5 plan."}]
NOTE=(" NOV 6 TOOLS: state.g5plan is the Group 5 game plan (quarters → months → items {text,who,taskId}, scorecard rows [measure,baseline,q1,oct,source,now], decisions [{text,answer,on}]); the monthly scorecard job fills scorecard[i][5] and never edits Brody's decisions. "
 "task.rating {v:'up'|'down',note} and playbook.lessons [{t,text,taskId}] are Brody's feedback: follow every lesson for that playbook. task.handoff {goal,done,where} is his brief: it defines done. task.links [{url}] are sources to read first (OneDrive/SharePoint/email links via Microsoft 365 read_resource). "
 "state.refCards [{title,body,always}] are reference facts: read the 'always' cards and any matching card before working a task; never store emails or phone numbers there. "
 "task.handoffAt (ISO) schedules a hand-off: the Auto hand-off job starts any task whose handoffAt has passed and has no handoffFired (set handoffFired when you start it). "
 "state.recurring [{id,title,every,day,playbook,mode,on,last}] creates task 'rc-<id>-<YYYYMMDD>' on its day (weekly/weekdays/monthly first week/quarterly Jan-Apr-Jul-Oct first week); the Auto hand-off job creates it if the board hasn't, then treats it like any task. "
 "task.runs [{t,why}] is run history; a run with no newer receipt after 25 minutes is stalled. state.dupIgnore lists task-id pairs Brody said are not duplicates.")
if 'NOV 6 TOOLS' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(h[:m.start(1)]+nj+h[m.end(1):]); print('ok')
