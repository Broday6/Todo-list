import json,re,sys
h=open('b.html').read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
NOW='2026-11-16T15:05:00.000Z'
CASE_STEPS=["Read the case alert, the case in search 16559 and any emails about it","Find the item and its Marketing Product Category in NetSuite; that gives the category group (G1–G5) and its leader","Work out the root cause: what about the listing, data or setup let this case happen (wrong drawing, dimension, description, option or lead time)","Draft one email to that category leader asking them to fix the root cause, not the case: the case number, the item, what's wrong and where, and what the fix should be","Note the case's own next step for Brody (status, quick note) in one line; never draft a customer or vendor reply unless Brody asks"]
pb=s.get('playbooks');items=pb if isinstance(pb,list) else (pb or {}).get('items',[])
for p in items:
  if p.get('id')=='case':
    p['steps']=CASE_STEPS;p['output']="One Outlook draft to the category leader asking for the root-cause fix, plus the case's next step";p['done']="Root-cause email drafted to the right category leader and the case's next step named";p['stop']="Any NetSuite change; any customer or vendor reply";p['v']=p.get('v',1)+1;p['updated']=NOW
  if p.get('id')=='blk-cases':
    p['steps']=["Read the open case tasks (group cases) and the emails about each","For each case, find the item's Marketing Product Category and its category leader","Draft one root-cause email per leader (several cases for the same leader go in one email), asking them to fix why the case happened, not the case itself","Note the case's own next step for Brody, one line each"];p['output']="Root-cause drafts to category leaders plus each case's next step";p['v']=p.get('v',1)+1;p['updated']=NOW
g=s['emailGuide']
if not any(t.get('type','').startswith('Case root cause') for t in g['types']):
  g['types'].insert(0,{"type":"Case root cause (to a category leader)","how":"Hey <first name>, case <#> came in on <item/SKU> (<Marketing Product Category>). The root cause is <what's wrong in the listing or data, and where>. Can you please fix <the root cause> so this doesn't happen again? Then what Brody checked (short bullets or a table: case #, SKU, what's wrong, what the page or NetSuite shows). Thanks, Brody. Goes to the leader of the item's category group (G1 Moulding, Brackets & Corbels, Door & Window Trim: no leader yet, ask Brody; G2 Columns, Balustrade, Railing, Ventilation: Andrew Gonzalez; G3 Wall, Ceiling & Decorative Accents, Siding: Hayden Clow; G4 Shutters, Exterior Millwork, Yard & Garden: Lauren Milkie; G5 Beams, Mantels, Hardware: Brody, so no email, make it a task). Never a reply to the customer or vendor, and never asks anyone to work the case itself."})
g['updated']='2026-11-16'
NOTE=" CASE EMAILS (Brody, Nov 16): when Claude writes an email about a case, it finds the item's Marketing Product Category, and emails that category's leader asking them to fix the ROOT CAUSE (why the case happened), not the case itself. See emailGuide type 'Case root cause'."
if 'CASE EMAILS (Brody, Nov 16)' not in s['_note']:s['_note']+=NOTE
s['updated']=NOW
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open('out.html','w').write(h[:m.start(1)]+nj+h[m.end(1):]);print('ok',[p['id'] for p in items if p.get('id') in('case','blk-cases')])
