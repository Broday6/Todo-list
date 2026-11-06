import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function picksHTML(' not in h:
    J=open(D+'/picks.js').read(); C=open(D+'/picks.css').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+C+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
T={t['id']:t for t in s['tasks']}
CC={
 'in1106-1':{'how':"Read Andrew's Teams question and the Gable Vent campaigns on the Ads tab, then draft a recommendation and a short Teams reply for you to send.",'steps':["Read Andrew's Teams message about splitting Gable Vent PMax by install method","Check the Gable Vent lines on the Ads tab and the G2 cuts","Write a short recommendation with the trade-offs, never judged on ROAS","Draft a Teams reply for you in the task's thread; you send it"]},
 'in1105-5':{'how':"Read the Athos emails and feed counts, say whether the Ekena item drop looks real, and draft your reply to Athos in Outlook Drafts.",'steps':["Read the Athos indexing emails for ekenamillwork.com and myhomesupply.com","Compare the item counts they report with the last good feed","Say whether the 25% drop looks real or like a feed error","Save a draft reply to Athos in your Outlook Drafts; you send it"]},
 'g5q1-16':{'how':"Write fact-checked FAQ drafts for the 7 category pages that still lack one, in a doc for your OK. Nothing goes live.",'steps':["Pull the facts for the 7 pages from the G5 build kit","Write 4 to 6 FAQs per page in your voice, no promises on dates or prices","Fact-check every answer against the build kit","Save the doc in the repo and link it in the task's thread for your OK"]},
}
for k,v in CC.items():
    if k in T and not T[k].get('claudeCan') and not T[k].get('done'): T[k]['claudeCan']=v
picks=[('mcf-05',"Due tomorrow. A short email to Daniel asking for the two admin switches, saved in your Drafts."),
       ('in1106-1',"Andrew is waiting on you. I'll write a recommendation and a Teams reply you can send."),
       ('in1105-5',"Athos paused Ekena indexing. I'll check whether the drop is real and draft your reply."),
       ('g5q1-06',"Paul needs the 4 nav rows. I'll draft the email from the build kit."),
       ('g5q1-07',"Fireplace season. I'll draft the ask to procurement for Pearl's missing shelves."),
       ('g5q1-16',"I'll write the 7 missing category FAQs for your OK. Nothing goes live.")]
cp=s.get('claudePicks') or {}
if cp.get('day')!='2026-11-06':
    s['claudePicks']={'day':'2026-11-06','items':[{'taskId':a,'why':b} for a,b in picks if a in T],'skipped':cp.get('skipped',{})}
NOTE=" CLAUDE PICKS (Brody, Nov 6: \"what tasks would claude like to take, it should be thinking that daily\"): every morning rebuild writes state.claudePicks = {day:<today>, items:[{taskId, why}], skipped} with up to 6 open tasks Claude can genuinely do today (drafts, research, files, board work; tag task.claudeCan on any pick that lacks it), most valuable first: deadlines, then someone waiting, then Rock work. why is one plain line, at most 140 characters, in first person (\"I'll draft...\"). Skip tasks assigned to Claude, pcOnly tasks, and anything needing NetSuite, BugHerd, Handshake, Merchant Center or ads logins. Keep skipped (Brody's Not today taps). Never assign a pick yourself: Brody taps Take it on the Today page."
if 'CLAUDE PICKS' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
open(out,'w').write(h); print('ok',len(s['claudePicks']['items']))
