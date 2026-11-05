import re,json,sys,os
f,out,NOW=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
BJ=open(D+'/blk.js').read(); BC=open(D+'/blk.css').read()
def rep(a,b):
    global h
    n=h.count(a); assert n==1,(a[:90],n); h=h.replace(a,b)
if 'function blkLinksHTML' not in h:
    rep("  function qBlkLink(b){\n",BJ+"  function qBlkLink(b){\n")
    rep("+(b.sub?'<div class=\"sub\">'+esc(b.sub)+'</div>':'')+qBlkLink(b)+","+(b.sub?'<div class=\"sub\">'+esc(b.sub)+'</div>':'')+qBlkLink(b)+blkLinksHTML(b)+")
    m=re.search(r'<style id="style">',h); i=h.index('</style>',m.end()); h=h[:i]+"\n/* ---------- plan block links and more info ---------- */\n"+BC+h[i:]
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
L=json.load(open(D+'/links.json'))
for b in s['days']['2026-11-05']['blocks']:
    if b['id'] in L:
        have={x['href'] for x in b.get('links',[])}
        b.setdefault('links',[]).extend([x for x in L[b['id']] if x['href'] not in have])
NOTE=" PLAN BLOCK LINKS (Nov 5): when you build or change plan blocks, give each block that cites an email, draft or tool a links array of {label, href}: the Outlook webLink for each cited email or draft (label \"Email: subject\"), and the tool URL for tools (NetSuite saved searches are https://362135.app.netsuite.com/app/common/search/searchresults.nl?searchid=N). Put the original email, not the triage digest, when you can find it. A Live chat message that starts \"Dig deeper on plan block\" names a block id: answer in Live chat, push the answer into that block's thread, and add the sources you found to block.links."
if 'PLAN BLOCK LINKS (Nov 5)' not in s['_note']: s['_note']+=NOTE
d=s['days'][s['today']]
if not any('More info' in (l.get('text') or '') for l in d['log']):
    d['log'].append({"t":"10:58","text":"Plan blocks now show their email and tool links (envelope = email, arrow = tool, plus board tabs) and a More info button with Explain this and Dig deeper.","kind":"claude","by":"Claude"})
s['updated']=NOW
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(out,'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):]); print('ok')
