import sys,os,re,json,datetime
# patch27: Teams replies without the ChatMessage.Send permission: copy box + plain chat link, or send through Brody's own Power Automate flow (Nov 8)
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function u6Flow(' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,open(D+"/tsfall2.js").read()+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+open(D+'/tsfall2.css').read()+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
NOTE=(" TEAMS SENDING (Nov 8): the Microsoft 365 connector lacks ChatMessage.Send, so Claude never sends Teams messages and the board cannot post directly. When state.sourceSetup.teamsflow.done is true, Brody's double-tapped Send in Teams emails the reply to Brody himself with subject 'ULTRON-TEAMS <chatId>' and his own Power Automate flow posts it. Routines never send those emails.")
if 'TEAMS SENDING (Nov 8)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(h[:m.start(1)]+nj+h[m.end(1):]); print('ok')
