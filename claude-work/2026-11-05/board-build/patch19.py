import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function projNotesHTML(' not in h:
    J=open(D+'/notes.js').read(); C=open(D+'/notes.css').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+C+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
NOTE=" NOTES (Brody, Nov 6): task.notes = [{id,t,text}] are Brody's own notes on a task, and state.projectNotes[groupKey] = [{id,t,text}] are his notes on a whole project (a task group such as g5q1 or abtests). Every routine and Live chat run that works, plans or explains a task reads both first and follows them; they override older task.note text. Never edit or delete his notes."
if 'NOTES (Brody, Nov 6)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
open(out,'w').write(h); print('ok')
