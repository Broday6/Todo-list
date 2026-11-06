import sys,os,re,json,datetime
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function queuedStale(' not in h:
    J=open(D+'/qguard.js').read()
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,J+a)
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
now=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z');today='2026-11-06'
T={t['id']:t for t in s['tasks']}
NOTE=" TORY OWNS WEBSITE BACK-END ERRORS (Brody, Nov 6): Athos/feed indexing failures and website back-end errors are Tory's. Never add tasks, plan blocks, suggestions, Needs-you items or pings for them; mention them at most as one FYI line."
if 'TORY OWNS' not in s['_note']: s['_note']+=NOTE
# G5 audit suggestions as tasks
SRC="Ads audit scorecard (Oct 29)"
ADD=[
 ("g5ad-01","Ads: add the G5 exact-negative lists (Beams Shopping 28, Real Wood/Instock 12, BMU 6, Faux Metal 15)","From the Oct 29 audit: post wraps, shiplap/paneling/trim, other suppliers, retailer names alone; trim and faux-material searches in real-wood campaigns; ceiling tile/tongue and groove in BMU; wood-look searches in Faux Metal I Beams ($74 L30, 0.07 conv). Recommend-only: Claude builds the sheet, you OK it, then it's applied.",{'how':"Build one sheet of all 61 G5 exact negatives by campaign from the Oct 29 audit, for your OK. Nothing changes in Google Ads.",'steps':["Pull the 4 negative lists from the Oct 29 audit scorecard","Check each against current search terms on the Ads tab","Write one sheet by campaign: negative, match type, why","Save it to the repo and link it in the task's thread for your OK"]}),
 ("g5ad-02","Ads: split BMU - Search's single ad group into themed ad groups","AG:BMU:Category holds 50+ broad keywords. Split into themed groups, each with its own ad and landing page. Recommend-only.",None),
 ("g5ad-03","Ads: give weak-converting beams their own product group in Beams Shopping","Landing-page data shows some beams convert well below the rest. Separate product group (or campaign) with a higher target; keep best sellers at 400%. Recommend-only.",None),
 ("g5ad-04","Review the BMRDS3 (Reclaimed Axed Cut) page: price, images, reviews, lead time","1,142 clicks for 8 conversions (0.70%), less than half the beam average.",{'how':"Review the live BMRDS3 page against the best-converting beam pages and list concrete fixes (price, images, reviews, lead time).",'steps':["Open the live BMRDS3 page and 2 top-converting beam pages","Compare price display, image count, reviews and lead time","List the fixes in order of impact in the task's thread"]}),
 ("g5ad-05","Check the 'Shipping cost value too high' flags on beam SKUs","Merchant Center flags ~32K products for shipping cost too high; beam SKUs in Beams Shopping and Real Wood Beams are affected. Ties to mcf-06.",None),
 ("g5ad-06","Find why Microsoft Faux Wood Beams Shopping impressions halved (534K to 271K)","Spend -62%, conversions 40 to 19. Recommend-only.",None),
 ("g5ad-07","Ads cleanup: remove Beams - Barron Designs and Beams Ad Rotation","Barron Designs paused Sep 18 after $986 for 1 conversion; Barron is out of business. Recommend-only.",None),
 ("g5ad-08","Decide whether Faux Beam Videos (Demand Gen) comes back","Paused Sep 15 after 12.7 conversions on $790 (Aug 29 to Sep 15). Your call.",None),
 ("g5ad-09","Hardware, Fasteners & Adhesives PMax: add 2 long headlines (fact-checked)","It has 3 long headlines; value -46% on the prior 30 days. Claude can write fact-checked options for your OK.",{'how':"Write 4 fact-checked long-headline options for the Hardware PMax for you to pick 2. Nothing uploads.",'steps':["Read the current Hardware PMax headlines on the Ads tab","Write 4 long headlines from facts NetSuite backs","List them in the task's thread for you to pick 2"]}),
]
for tid,title,note,cc in ADD:
    if tid in T: continue
    t={'id':tid,'group':'g5q1','title':title,'note':note,'due':'','done':False,'since':today,'source':SRC,'touches':'ads' if title.startswith('Ads:') else None}
    if t['touches'] is None: del t['touches']
    if cc: t['claudeCan']=cc
    s['tasks'].append(t)
t=T.get('g5q1-04')
if t is not None:
    t.setdefault('notes',[])
    if not any('Oct 29 audit' in n['text'] for n in t['notes']):
        t['notes'].append({'id':'n'+str(int(datetime.datetime.utcnow().timestamp()*1000)),'t':now,'text':"Oct 29 audit adds: fix the duplicate first tiles and thin reviews on /faux-metal-beams.html, add 3 images (17 of 20), and add 15 exact negatives for wood-look searches before any budget comes back. Plan decision #7: fix the page and keep the campaign, or move its spend to BMU Search."})
s['updated']=now
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
h=h[:m.start(1)]+nj+h[m.end(1):]
open(out,'w').write(h); print('ok')
