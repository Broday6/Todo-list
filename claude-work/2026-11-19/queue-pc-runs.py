# Brody, Nov 19 ~9:50 CT: "Run these": ads guard, ads audit, BugHerd sweep, Handshake. Queue them for the PC worker (Job C).
import json,re,sys
from datetime import datetime,timezone
h=open(sys.argv[1]).read();m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
s=json.loads(m.group(2).replace('<\\/','</'));T={t['id']:t for t in s['tasks']}
NOW=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
B="https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/"
jobs=[("pc1119-1","Run the daily ads + portal guard (AD) now","Run the steps of the Claude desktop scheduled task \"Daily ads + portal guard (AD)\" now, read-only, in the built-in browser (then the PCI Chrome profile if it shows a login page). Post to Asana and the board exactly as that task does. Never change Google or Microsoft Ads."),
 ("pc1119-2","Run the monthly full ads + portal audit (AD) now (missed Nov 16)","Run the steps of the Claude desktop scheduled task \"Monthly full ads + portal audit (AD)\" now, read-only, in the built-in browser (then the PCI Chrome profile). It failed Nov 16 because of sign-ins; Brody is signed in now. Recommend only; never change ads."),
 ("pc1119-3","Run the BugHerd live sweep now (last read 20 days ago)","Follow "+B+"2026-11-02/pc-tasks/bugherd-sweep.md exactly, in the PCI Chrome profile (Brody is signed in to BugHerd). Read-only; write state.bugherdSweep on the board."),
 ("pc1119-4","Run the Handshake daily check now","Run the steps of the Claude desktop scheduled task \"Handshake daily check\" now (read-only on Handshake; write state.hiring.sweep; never message a candidate; names, school, role and gist only). If Handshake shows a login page, set this pcJob to needs_signin and ask Brody in one line to log in, then retry on the next run.")]
for i,title,step in jobs:
  if i in T: continue
  s['tasks'].insert(0,{"id":i,"group":"now","title":title,"note":"Brody asked Nov 19 to run this now. Queued for the PC worker (Job C, runs at :05 and :35).","due":"2026-11-19","done":False,"since":"2026-11-19","source":"Brody asked in chat, Nov 19","from":"Brody","assignee":"claude","claudeStatus":"queued","pcJob":{"t":NOW,"by":"Brody","step":step,"status":"queued","key":i},"thread":[{"role":"claude","text":"Queued for the PC worker at Brody's request. Nothing has run yet; this shows the PC's result when it does.","t":NOW}]})
s['updated']=NOW
j=json.dumps(s,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
open(sys.argv[2],'w').write(h[:m.start(2)]+j+h[m.end(2):]);print('ok')
