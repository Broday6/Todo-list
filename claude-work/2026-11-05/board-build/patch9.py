import re,sys,os,json
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
J=open(D+'/aulast.js').read()
if 'var AU_LAST=' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
# state
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
a=s['automations']
LAST={"trig_01LMcYKXkRzyN2nnwKGkcSUB":"2026-11-05","trig_01Ah3Ga7TgqSpzoQ1uATtuY2":"2026-11-05","trig_01UqcLyToyZm3yyc7yQyUGdk":"2026-11-05",
"trig_01MYXtzwUPSaeoWoADbywfUY":"2026-11-05","trig_015ZuN56zFoa7kgJA3rqnGcf":"2026-11-05","trig_01YDFzojud2Xx8LDnqEFoQPH":"2026-11-05",
"trig_013u32ahu6VztnY5WiA8ByLo":"2026-11-05","trig_019ktoFxgsv4GM6hYtaxBQJG":"2026-11-05","trig_01AKYLwWAuUEsDnzF2wci73i":"2026-11-05",
"trig_01PvKJ48mpt8o9CpEVikpvez":"2026-11-05","trig_01899VdPf2gAAkjas5rmebWr":"2026-11-05","trig_01TEeBTBTmPV3MxApZH2aeMr":"2026-11-05",
"trig_01JEYvWdaH6L4s8WcDsLrssJ":"2026-11-05","trig_0118dmodKjFNLoqVAEak6YvS":"2026-11-04"}
for r in a['routines']:
    t=r.get('trig')
    if t in LAST and (r.get('last') or '')<LAST[t]: r['last']=LAST[t]
    if t=="trig_015ZuN56zFoa7kgJA3rqnGcf":
        r['retire']=True
        r['note']="Still firing (it ran at 12:20 today) and it still lists the old alert-email cases. Claude can't edit or pause it. Pause it at claude.ai/code/routines/trig_015ZuN56zFoa7kgJA3rqnGcf; the new \"Cases, alerts & BugHerd check\" already does its job."
if not any(r.get('trig')=="trig_01CAub7W29N3DzeQAyU1iCEY" for r in a['routines']):
    i=next(k for k,r in enumerate(a['routines']) if r.get('trig')=="trig_01YDFzojud2Xx8LDnqEFoQPH")
    a['routines'].insert(i,{"name":"Weekday login check","trig":"trig_01CAub7W29N3DzeQAyU1iCEY","where":"here","when":"Weekdays 7:42","days":"wd","times":["07:42"],"freq":"daily",
      "what":"Opens NetSuite, the Marketing Portal, Google Ads and Microsoft Ads in your Chrome and pings you with which ones need you to sign in. It never types a password.",
      "out":"Push notification","last":"","status":"ok","after":"Set up Nov 5; first run Fri Nov 6 at 7:42. If it can't reach your PC's Chrome it still pings you with the four sites to sign into."})
if not any(b.get('name','').startswith('BugHerd close') for b in a['building']):
    a['building'].insert(0,{"name":"BugHerd close (Done on Ultron marks Done in BugHerd)","where":"pc-chrome","stage":"setup","who":"you",
      "what":"When you tick a BugHerd task done on Ultron, the ticket is queued. This PC task sets only those queued tickets to Done in BugHerd, hourly on weekdays, and writes back Closed or Not closed.",
      "next":"Create it in Claude desktop › Scheduled from bugherd-close-pc-task.md (weekdays hourly 8:05 to 5:05, Chrome \"Pci-Browser\"), then press Run now.",
      "link":"https://github.com/Broday6/todo-list/blob/claude/brodys-board-v2-fuviv5/claude-work/2026-11-05/bugherd-close-pc-task.md"})
a['asOf']="2026-11-05T18:50:00.000Z"
import datetime
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
ind=None
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(2)]+nj+h[m.end(2):]
open(out,'w').write(h); print('ok',len(h))
