import sys,os,re,json,datetime
# patch33 (Nov 9): UI pass 2. Compact task rows with a "Full details" switch, a More menu on inbox rows,
# 3-per-group lists on "Clear in one sitting". Optional third argument: a JSON file of inbox tasks to add
# (the missed-mail sweep's results); tasks whose mail.uri or id already exists are skipped.
f,out=sys.argv[1],sys.argv[2]
extra=sys.argv[3] if len(sys.argv)>3 else None
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'function ux32Why(' in post, 'patch32 first'
if 'var tkFull=false' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux33.js").read()+a)
    css=(".tk-compact li.task:not(.open) .note,.tk-compact li.task:not(.open) .tupd{display:none}\n"
         ".tk-compact li.task:not(.open) .twhy,.tk-compact li.task:not(.open) .tunlock{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}\n"
         ".tk-compact li.task:not(.open){padding-top:9px;padding-bottom:9px}\n"
         ".mr-acts{align-items:flex-start}.mr-more{display:inline-block;position:relative;vertical-align:top}.mr-more>summary{list-style:none;cursor:pointer;display:inline-block}.mr-more>summary::-webkit-details-marker{display:none}\n"
         ".mr-more>summary::after{content:' ▾';color:var(--muted)}.mr-more[open]>summary::after{content:' ▴'}\n"
         ".mr-more-b{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}\n"
         ".mr-more[open]{display:block;flex:1 1 100%}\n"
         "li.task.tk-cap{display:none}.tk-allbtn{margin:8px 0 4px 34px}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
s=json.loads(st.replace('<\\/','</'))
added=0
if extra and os.path.exists(extra):
    ids={t['id'] for t in s['tasks']}; uris={(t.get('mail') or {}).get('uri') for t in s['tasks']}
    for t in json.load(open(extra)):
        if t['id'] in ids or ((t.get('mail') or {}).get('uri') in uris and (t.get('mail') or {}).get('uri')): continue
        s['tasks'].append(t); ids.add(t['id']); added+=1
    if added:
        s['mailSweep']={'asOf':'2026-11-10T01:57:00Z','seen':177,'added':added,'by':'manual test run'}
        for t in s['tasks']:
            if t['id']=='iv1109-1':
                th=t.setdefault('thread',[])
                if not any('free Wednesday afternoon' in str(x.get('text','')) for x in th):
                    th.append({'role':'claude','t':'2026-11-10T02:10:00.000Z','text':'From the mail sweep: Daniel replied Monday at 12:44 pm, "Bring her in", and said he is free Wednesday afternoon and all day Friday.'})
        d=s['days'].get('2026-11-09')
        if d is not None:
            d.setdefault('log',[]).append({'t':'20:10','text':'Mail sweep test: read 177 emails since Friday 6 am and added 6 tasks (11 new Indeed applicants, 2 asks from Andrew, the Vantage sample orders, a Drive access request, Daniel\u2019s OK on the Ekena policy).','kind':'claude','by':'Claude'})
NOTE=" UI PASS 2 (Nov 9, patch33): task rows are compact until opened (title, one line of why, one line of unlockBy), so put the most useful sentence first in task.why and task.unlockBy. Inbox rows show Write reply / Read draft / Claude drafts the reply / Done and keep the rest under More. MAIL SWEEP: state.mailSweep = {asOf, seen, added} is the hourly's missed-mail sweep stamp; the next sweep reads mail after asOf. Sweep tasks are ms<MMDD>-<n> with source 'missed-mail sweep <date>'; a grouped applicants task carries applicantsThrough (ISO) so the next sweep only counts newer applications."
if 'UI PASS 2 (Nov 9, patch33)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post); print('ok added',added)
