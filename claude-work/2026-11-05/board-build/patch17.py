import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
FULL='{"artifact":{},"sample":{},"downloads":{},"mcp":{"servers":[{"server":"Microsoft 365","tools":["outlook_email_search","read_resource","outlook_send_draft","outlook_send_mail","teams_send_chat_message"]},{"server":"Claude Code Remote","tools":["get_session","get_trigger","fire_trigger"]}]}}'
OLD='{"artifact":{},"sample":{},"mcp":{"servers":[{"server":"Microsoft 365","tools":["outlook_email_search","read_resource","outlook_send_draft","outlook_send_mail"]}]}}'
if 'audit fixes (Nov 5)' not in h:
    J=open(D+'/fix17.js').read(); C=open(D+'/fix17.css').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+C+h[j:]
    n=h.count(OLD); print('cap comments',n); h=h.replace(OLD,FULL)
    a='pendDone();chip("Saved");'
    assert h.count(a)==1; h=h.replace(a,'pendDone();var cc0=document.getElementById("chip");if(!(cc0&&cc0.className.indexOf("show")>=0&&cc0.querySelector(".chip-undo")))chip("Saved");')
    a='chip("Approved. Press Copy PC prompt and paste it into Claude on your PC.");'
    assert h.count(a)==1; h=h.replace(a,'chip("Approved. Open the task and press Copy PC prompt, then paste it into Claude on your PC.");')
# state: strip contact details
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
n=0
for j in ((s.get('hiring') or {}).get('sweep') or {}).get('jobs') or []:
    for p in j.get('people') or []:
        for k in ('email','phone'):
            if k in p: del p[k]; n+=1
EM=re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
def clean(o,path=''):
    global n
    if isinstance(o,dict):
        for k,v in list(o.items()):
            if k=='_note': continue
            if isinstance(v,str):
                nv=re.sub(r'\s*\(nlmailer@netsuite\.com\)','',v)
                nv=EM.sub(lambda mm:'your address' if mm.group(0).lower()=='b.simpson@pcienterprises.com' else mm.group(0),nv)
                if nv!=v: o[k]=nv; n+=1
            else: clean(v)
    elif isinstance(o,list):
        for i,v in enumerate(o):
            if isinstance(v,str):
                nv=re.sub(r'\s*\(nlmailer@netsuite\.com\)','',v)
                if nv!=v: o[i]=nv; n+=1
            else: clean(v)
clean(s['tasks']); clean(s.get('suggestions') or [])
left=[x for x in EM.findall(json.dumps({k:v for k,v in s.items() if k!='_note'}))]
print('cleaned',n,'addresses left outside _note:',len(left),sorted(set(left))[:10])
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
open(out,'w').write(h); print('ok')
