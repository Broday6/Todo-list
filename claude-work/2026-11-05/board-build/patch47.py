import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var RP45=' in post, 'patch45 first'
if 'var LR47=' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux47.js").read()+a)
s=json.loads(st.replace('<\\/','</'))
# backfill: routine last runs matched to task starts (get_trigger fired_at vs task.runs start)
BF={'ho-blk-n10-7':('2026-11-10T21:42','session_01DpWgXW7hFw6PzDPPesWtVM'),'g5q1-16':('2026-11-10T19:55','session_01DpWgXTQtmVC3kMzSnELE6Z')}
for t in s['tasks']:
  if t['id'] in BF:
    pfx,sid=BF[t['id']]
    for r in t.get('runs',[]):
      if r.get('t','').startswith(pfx) and r.get('why')!='done': r['sid']=sid
    t['chatSid']=sid
    if t.get('receipt'): t['receipt']['session']=sid
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok')
