import sys,re,json,datetime
# patch30 (Nov 9): board chats fire the new "Ultron board chats" routine Brody created in his Ultron Code project.
OLD,NEW="trig_01JEYvWdaH6L4s8WcDsLrssJ","trig_0198zV2xEbNR8HrCf183tLAg"
f,out=sys.argv[1],sys.argv[2]
h=open(f).read()
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,post=h[:m.start(1)],h[m.end(1):]
k='CHAT_TRIG="'+OLD+'"';n=pre.count(k)+post.count(k);pre=pre.replace(k,'CHAT_TRIG="'+NEW+'"');post=post.replace(k,'CHAT_TRIG="'+NEW+'"');print('code repl',n)
s=json.loads(m.group(1).replace('<\\/','</'))
if isinstance(s.get('chat'),dict) and s['chat'].get('trig')==OLD: s['chat']['trig']=NEW
for r in s.get('automations',{}).get('routines',[]):
  if r.get('trig')==OLD: r['trig']=NEW; r['name']='Ultron board chats'; r['note']=(r.get('note') or '')+' Nov 9: moved to the new routine in the Ultron project ('+NEW+').'
NOTE=" CHAT ROUTINE (Nov 9): Live chat / Give to Claude / Hand off / ⚡ / Dig deeper fire trig_0198zV2xEbNR8HrCf183tLAg (\"Ultron board chats\", in Brody's Ultron Code project). The old trig_01JEYvWdaH6L4s8WcDsLrssJ is retired."
if 'CHAT ROUTINE (Nov 9)' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(pre+nj+post);print('ok')
