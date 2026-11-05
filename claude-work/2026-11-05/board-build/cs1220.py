import json,re,sys
h=open(sys.argv[1]).read()
while not h.startswith("<!doctype html>\n<html"):
    i=h.index("<!doctype html>\n<html",10); h=h[i:]
    if h.endswith("\n</body></html>"): h=h[:-len("\n</body></html>")]
m=re.search(r'(<script id="state" type="application/json">)(.*?)(</script>)',h,re.S)
raw=m.group(2); s=json.loads(raw.replace('<\\/','</'))
NOW="2026-11-05T18:30:00.000Z"
L="https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJiBJeEAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
U="mail:///messages/AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU_Hcc2AAAAAAEMAABCgVnAZCBUTa752dU_Hcc2AAJiBJeEAAA%3D"
new=0
if not any(t['id']=='cs0980079' for t in s['tasks']):
    s['tasks'].append({"id":"cs0980079","group":"cases","title":"Case 0980079: Drawing Clarification/Revision · CW Ohio Inc.","note":"Not Started · created Nov 5 · SO 03-4246528 · PO 06-4052717015 · online 07_03524567. Next: this is a big-box special order, so under your Oct 30 rule it goes to Kody Goss (change Assigned To only, don't work it).","done":False,"since":"2026-11-05","source":"search 16559 alert 2026-11-05","mail":{"uri":U,"link":L,"subject":"ALERT - ECOM - Pending Cases - New Case Created","from":"Brian Thompson","on":"2026-11-05T17:50:19Z"},"case":{"no":"0980079","issue":"Drawing Clarification/Revision","vendor":"CW Ohio Inc.","status":"Not Started","created":"2026-11-05","group":"","leader":"","order":"03-4246528","onlineOrder":"07_03524567","po":"06-4052717015"}}); new=1
o=s['opsLatest']; c=o['cases']
if not any(x['no']=='0980079' for x in c['items']):
    c['items'].insert(0,{"no":"0980079","issue":"Drawing Clarification/Revision","vendor":"CW Ohio Inc.","on":"2026-11-05T17:50:19Z","link":L}); c['count']=len(c['items'])
o['pricing']=[{"name":"Item Group List Prices need updating (search 11921)","what":"Grouped List Price on some item groups doesn't match the sum of their components' online prices. Your open task covers it.","on":"2026-11-05T17:00:51Z","link":"https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJiBJd%2FAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"}]
o['asOf']=NOW; o['day']='2026-11-05'
d=s['days']['2026-11-05']
d['ops']={k:v for k,v in o.items() if k!='day'}
op=[t for t in s['tasks'] if t['id'].startswith('cs') and not t['done']]
op.sort(key=lambda t:(t.get('case') or {}).get('created',''))
for b in d['blocks']:
    if b['title'].startswith('Cases') and not b.get('done'):
        b['sub']="Daily · 20 min. %d open from search 16559, oldest first: %s. Details on the Cases tab."%(len(op),", ".join(t['case']['no'] for t in op))
s.setdefault('cases',{})['refreshedAt']=NOW
bh=s['bugherd']; bs=bh.get('checkedAt'); bh['checkedAt']=NOW; bh['refreshedAt']=NOW; bh['lastCheck']={"on":NOW,"since":bs,"emails":0,"newTickets":[],"comments":0,"moves":0}
d['log'].append({"t":"12:30","text":"Cases & BugHerd check: %d new case (0980079, CW Ohio, a Home Depot special order, so it goes to Kody) (%d open), 1 pricing, 0 new fix alerts, 0 FYI; BugHerd 0 new, 0 comments, 0 moves."%(new,len(op)),"kind":"claude","by":"Claude"})
s['updated']=NOW
lead=raw[:len(raw)-len(raw.lstrip())]; trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
js=json.dumps(s,indent=ind,ensure_ascii=False,separators=(None if ind else (',',':'))).replace('</','<\\/')
open(sys.argv[2],'w').write(h[:m.start(2)]+lead+js+trail+h[m.end(2):]); print('ok',new,len(op))
