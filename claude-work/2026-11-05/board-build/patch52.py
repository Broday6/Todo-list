import sys,os,re
f,out=sys.argv[1],sys.argv[2]
h=open(f).read(); D=os.path.dirname(os.path.abspath(__file__))
m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
pre,st,post=h[:m.start(1)],m.group(1),h[m.end(1):]
assert 'var LR47=' in post and 'hz49HTML' in post, 'needs patch47 and the hiring profile (patch49)'
if 'var TP52=' not in post:
    a="  function runBtnHTML(r){"
    assert post.count(a)==1; post=post.replace(a,open(D+"/ux52.js").read()+a)
    css=("/* patch52 task card, same look as the candidate profile panel (patch49) */\n"
      ".tp-wrap{position:fixed;inset:0;z-index:30;background:rgba(10,16,32,.45);display:flex;justify-content:flex-end}\n"
      "body.tp-on{overflow:hidden}\n"
      ".tp-card{width:min(640px,100%);height:100%;overflow-y:auto;background:var(--panel);color:var(--ink);border-left:1px solid var(--line);box-shadow:-12px 0 40px rgba(0,0,0,.2);padding:18px 20px 40px;font-size:14px;line-height:1.5}\n"
      ".tp-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:4px 0 12px;border-bottom:1px solid var(--line);position:sticky;top:-18px;background:var(--panel);z-index:1}\n"
      ".tp-title{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.3;overflow-wrap:anywhere}\n"
      ".tp-sub{margin:5px 0 0;font-size:13px;color:var(--muted)}.tp-sub .stag{margin-right:4px}.tp-over{color:var(--bad);font-weight:500}\n"
      ".tp-card .mx{border:0;background:none;font-size:26px;line-height:1;color:var(--muted);padding:0 4px;cursor:pointer}.tp-card .mx:hover{color:var(--ink)}\n"
      ".tp-next{margin:14px 0 0;padding:10px 12px;border-left:2px solid var(--warn);background:var(--warn-soft);border-radius:0 6px 6px 0}\n"
      ".tp-next b{display:block;font-size:12.5px;font-weight:600;color:var(--warn)}\n"
      ".tp-acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0 2px}\n"
      ".tp-acts .btn,.tp-acts .ho-btn{padding:7px 12px;font-size:13px}\n"
      ".tp-main section{padding:14px 0;border-bottom:1px solid var(--line)}.tp-main section:last-child{border-bottom:0}\n"
      ".tp-card h3{margin:0 0 6px;font-size:12.5px;font-weight:600;color:var(--muted)}.tp-card h3 small{font-family:var(--mono);font-weight:500;margin-left:4px}\n"
      ".tp-main p{margin:0 0 6px;white-space:pre-wrap;overflow-wrap:anywhere}\n"
      ".tp-rc ul{margin:6px 0 0;padding-left:18px;display:grid;gap:3px}\n"
      ".tp-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}\n"
      ".tp-warn{color:var(--warn);font-size:13px}\n"
      ".tp-th{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}\n"
      ".tp-th li{padding:9px 11px;border-radius:0 6px 6px 0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13.5px;background:var(--sunk);border-left:2px solid var(--line-strong)}\n"
      ".tp-th li.c{border-left-color:var(--accent)}\n"
      ".tp-th li span{display:block;font-family:var(--mono);font-size:11.5px;color:var(--muted);margin-bottom:3px}\n"
      ".tp-main textarea{width:100%;padding:9px 11px;border:1px solid var(--line-strong);border-radius:6px;background:var(--bg);font-size:14px;resize:vertical}\n"
      ".tp-side dl{margin:0;display:grid;grid-template-columns:7.5rem minmax(0,1fr);gap:6px 10px}\n"
      ".tp-f{display:contents}.tp-f dt{font-size:12.5px;font-weight:600;color:var(--muted)}.tp-f dd{margin:0;font-size:13.5px;overflow-wrap:anywhere}\n"
      ".tp-side h3+dl{margin-top:2px}.tp-runs{list-style:none;margin:6px 0 0;padding:0;font-size:12.5px;display:grid;gap:4px}\n"
      ".tp-runs li{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-family:var(--mono)}\n"
      "li.task .title,.dq-title,.w44-t{cursor:pointer}\n"
      "@media(max-width:560px){.tp-card{padding:14px 16px 32px}.tp-side dl{grid-template-columns:1fr}}\n")
    i=pre.index('<style id="style">'); j=pre.index('</style>',i); pre=pre[:j]+css+pre[j:]
open(out,'w').write(pre+st+post); print('ok')
