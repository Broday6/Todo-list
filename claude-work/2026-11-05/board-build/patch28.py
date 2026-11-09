import sys,re,json,datetime
# patch28 (Nov 9): Today's radar refreshes Routine last-runs live (it only did on the Automations tab, so cloud jobs showed "missed a run" when they hadn't).
f,out=sys.argv[1],sys.argv[2]
h=open(f).read()
a='if(got&&view==="auto")render();'
if a in h: assert h.count(a)==1; h=h.replace(a,'if(got&&(view==="auto"||view==="today"||!view))render();')
b='nyTopHTML=function(){if(view==="today"||!view){'
if b in h and (b+'auFetchLast();') not in h: assert h.count(b)==1; h=h.replace(b,b+'auFetchLast();')
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S);s=json.loads(m.group(1).replace('<\\/','</'))
R={r.get('name'):r for r in s['automations']['routines']}
def bump(n,d):
  r=R.get(n)
  if r and (r.get('last') or '')<d: r['last']=d
bump('Morning brief','2026-11-09'); bump('Heartbeat','2026-11-08'); bump('Meeting recaps — weekday afternoons','2026-11-06')
g=R.get('Daily ads + portal guard (AD)')
if g and (g.get('last') or '')<'2026-11-09': g['note']="Nov 9: no daily guard has run since the Nov 4 evening run, which hit the Marketing Portal login page. Sign in to the portal (and Google and Microsoft Ads), then Run now in Claude desktop › Scheduled. Portal spend numbers are off right now, so treat spend % as unreliable until you say it's fixed."
lc=R.get('Ultron — live chat (fresh session, Outlook + Notion)')
if lc and 'usage limit' not in (lc.get('note') or ''): lc['note']=((lc.get('note') or '')+" Nov 9 8:47am CT run failed: usage limit reached. Live chat, Give to Claude and ⚡ buttons fail until the limit resets.").strip()
s['automations']['asOf']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
if (s['strety'].get('asOf') or '')<'2026-11-09':
  s['strety']['asOf']='2026-11-09'
  s['strety']['emailLink']="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJksP%2BbAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
NOTE=" RADAR (Nov 9): Today's Also-on-your-radar refreshes Routine last runs live via get_trigger (patch28); routines' stored last dates are only a fallback."
if 'RADAR (Nov 9)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(h[:m.start(1)]+nj+h[m.end(1):]);print('ok')
