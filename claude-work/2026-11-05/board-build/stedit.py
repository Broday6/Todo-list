import sys,re,json,datetime
# apply task field updates (and thread appends) from a JSON file onto a board html
f,out,edits=sys.argv[1],sys.argv[2],json.load(open(sys.argv[3]))
h=open(f).read()
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
for t in s['tasks']:
    e=edits.get(t['id'])
    if not e: continue
    for k,v in e.get('set',{}).items(): t[k]=v
    for msg in e.get('thread',[]):
        if not any(x.get('text')==msg['text'] for x in t.get('thread',[])): t.setdefault('thread',[]).append(msg)
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(h[:m.start(1)]+nj+h[m.end(1):]); print('ok')
