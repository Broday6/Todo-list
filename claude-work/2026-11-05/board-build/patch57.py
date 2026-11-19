import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
if 'function board57Fix' not in post:
    a="  function runBtnHTML(r){"; assert post.count(a)==1; post=post.replace(a,open(D+"/ux57.js").read()+a)
s=json.loads(st.replace('<\\/','</'))
def L(v):
    if v is None or v=="": return []
    if isinstance(v,list): return v
    if isinstance(v,str): return [x for x in re.split(r'\s*\n+\s*|\s*;\s+',v) if x]
    return [v]
n=0
for t in s['tasks']:
    r=t.get('receipt')
    if isinstance(r,dict):
        for k in ('did','unsure'):
            if k in r and not isinstance(r[k],list): r[k]=[str(x) for x in L(r[k])];n+=1
        if 'where' in r and (not isinstance(r['where'],list) or any(isinstance(x,str) for x in r['where'])):
            w=[]
            for x in L(r['where']):
                if isinstance(x,str):
                    u=(re.search(r'https?://\S+',x) or [None])[0] if re.search(r'https?://\S+',x) else ""
                    w.append({"label":x.replace(u,"").strip() or x,"url":u})
                else: w.append(x)
            r['where']=w;n+=1
NOTE=" RECEIPT SHAPE (Nov 19, patch57; the board went blank again): every task.receipt has did and unsure as LISTS of strings and where as a LIST of {label,url,kind?}. Never plain text. The page now repairs bad shapes before drawing, but every writer (cloud runs and the PC worker) must still write lists."
if 'patch57' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post);print('ok fixed fields',n)
