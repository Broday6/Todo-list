import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
if 'patch64' not in post:
    a="  render();\n  setInterval(tick,60000);"; assert post.count(a)==1; post=post.replace(a,open(D+"/ux64.js").read()+a)
s=json.loads(st.replace('<\\/','</'))
for t in s['tasks']: t.setdefault('done',False)
NOTE=" PAGES (Nov 23, patch64): new-look Tasks (smart lists), Hiring (waiting on you, pipeline by stage, applicants, colleges), Sales (hero, trend, sites) and This week (Top 3, days, projects). Classic content stays under Tasks > All tasks and Hiring > Full tracker."
if 'patch64' not in s['_note']: s['_note']+=NOTE
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post);print('ok')
