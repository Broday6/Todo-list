import sys,os,re,json,datetime
# usage: patch50.py <board.html> <out.html>  (Hiring tab tier list: one horizontal row per tier, A on top)
f,out=sys.argv[1],sys.argv[2]
h=open(f,encoding='utf-8').read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var HZ49=' in post, 'patch49 first'
if 'var HZ50_ROWS=' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux50.js",encoding='utf-8').read()+a)
s=json.loads(st.replace('<\\/','</'))
s['updated']=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w',encoding='utf-8').write(pre+nj+post); print('ok')
