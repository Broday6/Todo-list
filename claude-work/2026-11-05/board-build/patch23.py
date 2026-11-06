import sys,os,re,json,datetime
# patch23: follow-ups and notes start real runs; status never shows Done when Brody's newest word is newer (Nov 6)
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function fuLastBrody(' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,open(D+'/fu2.js').read()+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+open(D+'/fu2.css').read()+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
NOTE=(" FOLLOW-UPS ARE INSTRUCTIONS (Brody, Nov 6: \"I have offered up follow up notes to multiple tasks and it doesn't seem like you are taking them\"). "
 "Any user message in task.thread, any task.notes entry, or an OK/No that is newer than Claude's last thread message and receipt is a pending instruction: act on it with tools (TASK COMPLETION PROTOCOL), then write a new receipt. Never answer it with only words or say it can't be done from chat. "
 "MARK DONE WHEN ASKED: when Brody's newest instruction on a task asks to mark it done or complete, set task.done true, doneOn TODAY, doneVia \"asked\" (this is the one exception to never setting task.done). "
 "A 'No, don't make this change' means stop: change nothing, leave it for Brody to close.")
if 'FOLLOW-UPS ARE INSTRUCTIONS' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
open(out,'w').write(h); print('ok')
