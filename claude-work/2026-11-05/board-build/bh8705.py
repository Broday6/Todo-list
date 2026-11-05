import json,re,sys
h=open(sys.argv[1]).read()
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
for t in s['tasks']:
    if t['id']=='bh-8705' and t['done'] and t.get('bh') and not t['bh'].get('closeAsk'):
        t['bh']['closeAsk']={"t":"2026-11-05T18:32:00.000Z","note":"Marked done on the board earlier today"}
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(sys.argv[1],'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):])
