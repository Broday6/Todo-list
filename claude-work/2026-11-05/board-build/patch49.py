import sys,os,re,json,datetime
# usage: patch49.py <board.html> <out.html> [hire49-data.json]  (candidate profile panel; data = {candidates:[{name, profile}]})
f,out=sys.argv[1],sys.argv[2]; data=json.load(open(sys.argv[3],encoding='utf-8')) if len(sys.argv)>3 else {}
h=open(f,encoding='utf-8').read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var HZ48_OLD=' in post, 'patch48 first'
if 'var HZ49=' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux49.js",encoding='utf-8').read()+a)
s=json.loads(st.replace('<\\/','</'))
def key(n): return re.sub(r'[^a-z]','',n.lower())
C=s.get('hiring',{}).get('candidates',[]); by={key(c.get('name','')):c for c in C}; miss=[]
for row in data.get('candidates',[]):
    c=by.get(key(row['name']))
    if c is None: miss.append(row['name']); continue
    c['profile']=row['profile']
s['updated']=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w',encoding='utf-8').write(pre+nj+post); print('ok', len(data.get('candidates',[]))-len(miss), 'profiles; missing:', miss)
