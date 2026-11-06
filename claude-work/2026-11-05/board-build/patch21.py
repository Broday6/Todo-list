import sys,os,re,json,datetime
# patch21: Ultron Light theme + Done-by-Claude receipts + task completion protocol (Nov 6)
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
i=h.index('<style id="style">')+len('<style id="style">'); j=h.index('</style>',i)
css=h[i:j]
if 'Ultron Light (Nov 6' not in css:
    a=css.find('/* ================= Ultron =================')
    endm='@media (max-width:720px){.ptitle{font-size:30px}.ft{font-size:25px}}'
    b=css.find(endm,a)
    if a>=0 and b>a: css=css[:a]+css[b+len(endm):]
    # dark-theme leftovers in later patches -> light tokens
    css=re.sub(r'linear-gradient\(180deg,\s*#(?:121620|1C0E13|1A0E13|0F1218|11141B)\s*(?:0%)?,\s*#(?:0D1016|0E1117|0C0F14)\s*(?:100%)?\)','var(--panel)',css)
    for k in ['07080B','0A0C10','10131A','0C0F14','121620','0E1117','0D1016','11141B','0F1218','08090C','170A0E','0B0C11']:
        css=re.sub('#'+k+r'\b','var(--panel)',css,flags=re.I)
    for k in ['161A22','1D222C','1E2430','1C0E13','1A0E13','2B323E']:
        css=re.sub('#'+k+r'\b','var(--sunk)',css,flags=re.I)
    for k in ['C9D0DB','CBD2DC','E4E8EF','F2F4F8','F4F6FA','C6CDD8','B9C2D0']:
        css=re.sub('#'+k+r'\b','var(--ink)',css,flags=re.I)
    for k in ['FF9AA3','FFB0B7']:
        css=re.sub('#'+k+r'\b','var(--accent)',css,flags=re.I)
    for k in ['6F7888','5F6878','7C8596','8B94A5']:
        css=re.sub('#'+k+r'\b','var(--muted)',css,flags=re.I)
    css=re.sub(r'rgba\(255,\s*45,\s*63,','rgba(37,87,214,',css)
    css=re.sub(r'rgba\(8,\s*9,\s*12,\s*\.9\d?\)','rgba(255,255,255,.95)',css)
    css=re.sub(r'rgba\(3,\s*4,\s*6,\s*\.7\)','rgba(16,24,40,.35)',css)
    css+=open(D+'/light.css').read()
    h=h[:i]+css+h[j:]
if 'function receiptHTML(' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,open(D+'/receipt.js').read()+a)
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
NOTE=(" TASK COMPLETION PROTOCOL (Brody, Nov 6: \"read the task then carry out the objective\"; \"a completed task with easy to read ways of when and where the task was completed\"). Any run that works a task assigned to Claude: "
 "1) read the title, note, task.notes, state.projectNotes[group], workflow, brief, thread and source; "
 "2) search the Notion \"Ultron task log\" (collection://37c61404-440a-4ad3-a642-955873dd6517) and Notion memory for the same or a similar task and reuse its How; "
 "3) carry out the objective now with the tools available (Outlook draft, file pushed to the repo, Notion page, research answer in the thread, board update); never reply with a plan, options or 'I'll do it next run' instead of the work; "
 "4) if a rule stops you (NetSuite or Ads OK, Web Dev clearance, PC-only system, sign-in), do everything up to that line and name the one exact thing Brody must do; "
 "5) write task.receipt = {at, status:'done'|'needs_you', summary (one past-tense line), did:[<=6 lines], where:[{label,url,kind:'outlook'|'file'|'notion'|'board'|'web'|'asana'}], left, prior, log}, set claudeStatus 'ready' (done) or 'blocked' (needs_you), task.update {on,by:'Claude',text:summary}, and a thread message starting 'Done:' or 'Needs you:'; "
 "6) add a row to the Ultron task log (Task, Task ID, Completed, Status, What I did, Where, How, Left for Brody, Project). Never set task.done; Brody closes it from the receipt.")
if 'TASK COMPLETION PROTOCOL' not in s['_note']: s['_note']+=NOTE
RC=json.load(open(D+'/receipts21.json')) if os.path.exists(D+'/receipts21.json') else {}
for t in s['tasks']:
    if t['id'] in RC and not (t.get('receipt') or {}).get('at'):
        r=RC[t['id']]
        if t.get('outlookDraft',{}).get('link') and not any(w.get('kind')=='outlook' for w in r['where']):
            r['where'].insert(0,{'label':'Outlook draft: '+t['outlookDraft'].get('subject','draft'),'url':t['outlookDraft']['link'],'kind':'outlook'})
        t['receipt']=r
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
open(out,'w').write(h); print('ok')
