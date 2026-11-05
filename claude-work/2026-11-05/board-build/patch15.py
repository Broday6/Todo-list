import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function chatPending(' not in h:
    J=open(D+'/b15.js').read(); C=open(D+'/b15.css').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    a='text:q.text.slice(0,3000),t:new Date().toISOString(),quick:true}'
    assert h.count(a)==1; h=h.replace(a,'text:"Quick answer (no email or tools yet): "+q.text.slice(0,2950),t:new Date().toISOString(),quick:true}')
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+C+h[j:]
# state edits (idempotent)
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
now=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z'); today='2026-11-05'
W={'al-default_variant-20261029':'Preview, then import the 5 Default Variant SKU fixes in NetSuite (default_variant - edits.csv). The 15 owner rows go to the category group owner by email draft.',
   'al-site_ad-20261102':'Preview, then import the 68 Inaccurate AD Items fixes (site box changes) in NetSuite (site_ad - edits.csv).',
   'al-kit_location-20261029':'Email Andrew G. / Procurement the 50-row Kit Item w/ No Location list (kit_location - owner.csv) so they fix the kit locations in NetSuite. Saved as a draft for you to send.',
   'al-marketing_category-20261104':'Email the category group owner the 6 Products Without Marketing Category rows (marketing_category - owner.csv) so they set the category in NetSuite. Saved as a draft for you to send.'}
for t in s['tasks']:
    if t['id'] in W and not t.get('done') and not t.get('approved') and not t.get('approvalNeeded'):
        t['approvalNeeded']={'what':W[t['id']],'system':'netsuite','t':now}; t['assignee']='claude'; t['claudeStatus']='blocked'; t['pcOnly']=True
    if t['group']=='bugherd' and t.get('dropped') and t.get('bh') and not t['bh'].get('closeAsk'):
        t['bh']['closeAsk']={'t':now}
    if t['id'] in ('al-updated-fields-for-hi0336-s-4-20261030-2-3','al-updated-fields-for-hi0336-s-4-20261030-2-3-4','al-netsuite-csv-import-notificati-20261102-2') and not t.get('done'):
        t['done']=True; t['doneOn']=today; t['doneVia']='cleanup'; t['update']={'on':today,'by':'Claude','text':'Merged: duplicate of the same alert task (Brody OK’d the clean-up Nov 5).'}
s['updated']=now
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
open(out,'w').write(h); print('ok')
