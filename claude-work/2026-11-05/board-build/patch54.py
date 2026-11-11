import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
if 'function pm54Fix' not in post:
    a="  function runBtnHTML(r){"; assert post.count(a)==1; post=post.replace(a,open(D+"/ux54.js").read()+a)
s=json.loads(st.replace('<\\/','</'))
for x in s['promos']['items']:
  if isinstance(x.get('sites'),str): x['sites']=[p.strip() for p in re.split(r'[,/&+]| and ',x['sites']) if p.strip()]
NOTE=" PROMOS SHAPE (Nov 11, patch54): in state.promos.items, sites is always a list of strings (e.g. [\"AD\",\"PC\"]) and todo a list of {text}; a text value crashed the Promotions tab."
if 'PROMOS SHAPE' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post);print('ok')
