import sys,re,json,datetime
# patch36 (Nov 10, data only): corrections from the summary accuracy audit. Adds one task listing the drafts the
# morning triage counted as sent, and fixes the screening count on today's FYI line.
f,out=sys.argv[1],sys.argv[2]
h=open(f).read()
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
T=s['tasks']
if not any(t['id']=='ms1110-1' for t in T):
    T.append({"id":"ms1110-1","group":"inbox","done":False,"due":"2026-11-10","since":"2026-11-10","source":"summary audit 2026-11-10",
      "title":"About 30 drafts in Outlook were never sent: send, fix or delete them",
      "note":("The morning triage counted several of these as sent. As of 7:30 am they were all still in Drafts. "
              "1) Phone-screen invites to Byron, Maneesha, Kirsten and Douglas: the text says \"tomorrow, Tuesday, Nov 10\", so change the day and times before sending. "
              "2) The screening question to 20 Indeed applicants (the triage said 15). Daniel forwarded Kalee, Cindy and Cynthia to Garrett as possible Sales fits, so check with him before sending those three. "
              "3) Procurement: the kick plate request (two versions, Oct 29 and Nov 5), the pack size request and two description fixes. The triage has shown \"waiting on Procurement\" for these since Nov 6, but none went out. "
              "4) The Full Stack follow-up to Daniel and Tory. "
              "5) The \"biggest wins\" email to Andrew, Hayden and Lauren. You posted that request in Teams on Monday, so this draft is probably spare. "
              "6) Interview follow-ups for Jaden and Maryssa: there are two versions of each on purpose (went well, went poorly). Send one and delete the other."),
      "why":"People are waiting on things you think went out. The triage reported drafts as sent, so nothing reminded you.",
      "unlockBy":"Open Outlook Drafts and go down this list: send, fix or delete each one.",
      "reply":{"state":"none","note":"A list of your own unsent drafts."}})
d=(s.get('days') or {}).get('2026-11-10')
if d and d.get('inbox') and d['inbox'].get('fyi'):
    F=d['inbox']['fyi']
    for i,x in enumerate(F):
        if isinstance(x,str) and 'sent the screening question to 15 applicants' in x:
            F[i]=x.replace('sent the screening question to 15 applicants','sent the screening question to 15 applicants (Outlook Drafts has 20)')
    note='Checked this morning’s summaries against your mailbox: 39 of 60 claims were right, 8 were wrong (drafts counted as sent, a waiting line for requests never sent). The fixes are in the task “About 30 drafts in Outlook were never sent”.'
    if not any(isinstance(x,str) and x.startswith('Checked this morning') for x in F): F.insert(1,note)
    lg=d.setdefault('log',[])
    if not any('Summary check' in str(x.get('text','')) for x in lg):
        lg.append({'t':'08:20','text':'Summary check: read today’s triage, recap and pulse against Outlook. 8 of 60 claims were wrong, all about drafts counted as sent or waiting lines never sent. Added one task listing the unsent drafts; the digest rules are tightened.','kind':'claude','by':'Claude'})
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(h[:m.start(1)]+nj+h[m.end(1):]);print('ok')
