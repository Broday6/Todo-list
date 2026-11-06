import sys,os,re,json,datetime
# patch25: Control room › Sources (no-API-key sources: OneDrive folder, NetSuite and ads emails, feed links) (Nov 6)
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
if 'function ulSourcesHTML(' not in h:
    a="  function runBtnHTML(r){"
    assert h.count(a)==1; h=h.replace(a,open(D+'/src.js').read()+a)
    i=h.index('<style id="style">'); j=h.index('</style>',i); h=h[:j]+open(D+'/src.css').read()+h[j:]
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
s=json.loads(m.group(1).replace('<\\/','</'))
s.setdefault('sourceSetup',{}).setdefault('onedrive',{'made':'2026-11-06','root':'OneDrive/Ultron'})
NOTE=(" SOURCES (Brody, Nov 6; no API keys). Read these before saying something is 'on Brody's PC': "
 "(1) OneDrive folder Ultron (driveId b!LN5adUZFFUmwCM4RCoXuHCht3pbHyKVPgKw_iraYXUYSOfavCzHcRbmh3jvrE_A8, folder item 015H7N5V37VWB4OSRAGBE26P7HSZIJGMMN; subfolders '1 Build kits and plans', '2 NetSuite exports', '3 Ads and analytics reports', '4 Drop anything for Claude'), read with Microsoft 365 read_resource file:///<driveId>/<itemId> or the path Ultron/...; "
 "(2) Outlook emails whose subject starts 'Ultron feed:' (NetSuite saved searches 14837 product data and 15585 sales by item; Google Ads and Microsoft Ads scheduled reports; analytics) with CSV attachments: read the newest one; "
 "(3) product feed URLs in state.sourceSetup.feeds.urls {ad,ho,ek}: fetch them to check live titles, prices and availability; "
 "(4) Teams search already covers channels. state.sourceSetup[id].done says which Brody has set up (Control room › Sources); never edit state.sourceSetup. (state.sources is the separate Source health record.)")
if 'SOURCES (Brody, Nov 6' not in s['_note']: s['_note']+=NOTE
s['updated']=datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(out,'w').write(h[:m.start(1)]+nj+h[m.end(1):]); print('ok')
