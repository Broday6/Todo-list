import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
if 'patch63' not in post:
    a="  render();\n  setInterval(tick,60000);"; assert post.count(a)==1; post=post.replace(a,open(D+"/ux63.js").read()+a)
s=json.loads(st.replace('<\\/','</'))
for t in s['tasks']: t.setdefault('done',False)
NOTE=" DESIGN (Nov 23, patch63): new calm Today (Now card, Top 3, plan list, Needs you, Sales, This week) and a 6-item sidebar with More; per-browser 'Classic look' switch (localStorage bb.classic63). Ticks still use data-blk."
if 'patch63' not in s['_note']: s['_note']+=NOTE
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post);print('ok')
