import json,sys,re
src,dst,pj=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
P=json.load(open(pj))
EMAIL=re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+'); PHONE=re.compile(r'\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}')
KEY=[
 ("Thanksgiving","2026-11-26","Stores open; most shoppers browse. Sales start the day before for many retailers."),
 ("Black Friday","2026-11-27","Biggest sale day of the year for home improvement e-commerce."),
 ("Small Business Saturday","2026-11-28",""),
 ("Cyber Monday","2026-11-30","Online-only day. Plan the email and ads the week before."),
 ("Giving Tuesday","2026-12-01",""),
 ("Free Shipping Day","2026-12-14","The last big online push before carrier holiday cutoffs."),
 ("Christmas","2026-12-25",""),
 ("New Year's Day","2027-01-01",""),
]
items=[]
for i,(t,d,w) in enumerate(KEY):
    items.append({"id":f"kd{i+1}","title":t,"start":d,"end":"","sites":[],"kind":"date","status":"","owner":"","what":w,"todo":[],"source":"","link":""})
# Brody's own: the holiday push and seasonal environments from the 2027 goals
items.append({"id":"pm-holiday","title":"Holiday push email: “Decorate for the holidays”","start":"","end":"","sites":["AD"],"kind":"email","status":"planned","owner":"Brody",
  "what":"From your 2027 list (you said yes). A seasonal email that sends shoppers to decor that ships before the holidays.","todo":[{"text":"Pick the send date"},{"text":"Choose the products and landing page"},{"text":"Write the email"}],"source":"Your 2027 objectives (Goals tab)","link":""})
items.append({"id":"pm-seasonal","title":"Seasonal environments on the site","start":"","end":"","sites":["AD"],"kind":"seasonal","status":"idea","owner":"Brody",
  "what":"From your 2027 list (yes, with approval). Seasonal room scenes and banners for the holidays.","todo":[{"text":"Get approval for the first season"}],"source":"Your 2027 objectives (Goals tab)","link":""})
n=0
for it in P.get('items',[]):
    n+=1
    x={"id":f"pm{n}","title":it.get('title',''),"start":it.get('start',''),"end":it.get('end',''),"sites":it.get('sites',[]),"kind":it.get('kind','sale'),
       "status":it.get('status','unclear'),"owner":it.get('owner',''),"what":it.get('what',''),"todo":[{"text":t} for t in it.get('todo',[])],
       "source":it.get('source',''),"link":it.get('link','')}
    for k in ('title','what','source','owner'):
        assert not EMAIL.search(x[k]) and not PHONE.search(x[k]),x[k]
    for t in x['todo']: assert not EMAIL.search(t['text'])
    items.append(x)
old={x['id']:x for x in (st.get('promos') or {}).get('items',[])}
st['promos']={"asOf":P.get('asOf',''),"items":items}
st['_note']+=" state.promos = {asOf, items:[{id, title, start, end, sites, kind (date|sale|email|vendor|seasonal|ads|content), status (idea|planned|running|done|unclear|dropped), owner, what, todo:[{text,done?}], source, link, taskIds?}]}: the Promotions tab. kind \"date\" items are fixed calendar days. Refreshing it: keep ids, statuses Brody set, todo done flags and taskIds; add new promos with new ids; never store email addresses or customer names."
for x in st['automations']['building']:
    if x['name']=="Promotions calendar":
        x['stage']="testing";x['next']="Live with what your email says so far. Next: the morning rebuild adds new promos it finds."
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)
rep('["ads","Ads"],["hiring","Hiring"]','["promo","Promotions"],["ads","Ads"],["hiring","Hiring"]')
rep('["Business",["sales","ads","hiring"]]','["Business",["sales","promo","ads","hiring"]]')
rep('sales:"Sales",ads:"Ads"','sales:"Sales",promo:"Promotions calendar",ads:"Ads"')
rep('"sales","hiring","bugherd","cases","ads"]','"sales","promo","hiring","bugherd","cases","ads"]')
rep("    goals:'<circle","    promo:'<path d=\"M4 12.5V5a1 1 0 0 1 1-1h7.5l7.5 7.5-8.5 8.5z\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.4\"/>',\n    goals:'<circle")
rep("    else if(view===\"auto\"){sub=","    else if(view===\"promo\"){sub='Sales, emails and seasonal pushes on one calendar, with what\\u2019s left to do for each.';}\n    else if(view===\"auto\"){sub=")
rep('    } else if(view==="goals"){\n      h+=goalsHTML();','    } else if(view==="promo"){\n      h+=promoHTML();\n    } else if(view==="goals"){\n      h+=goalsHTML();')
JS=r'''
  /* ---------- Promotions calendar (state.promos) ---------- */
  var PM_ST=[["idea","Idea"],["planned","Planned"],["running","Running"],["done","Done"],["unclear","Not sure"],["dropped","Dropped"]];
  var PM_KIND={sale:"Sale",email:"Email",vendor:"Vendor promo",seasonal:"Seasonal",ads:"Ads",content:"Content",date:"Key date"};
  function pms(){var p=state.promos;if(!p||!Array.isArray(p.items))state.promos=p={items:[]};return p;}
  function pmFind(id){var r=null;pms().items.forEach(function(x){if(x.id===id)r=x;});return r;}
  function pmWhen(x){if(!x.start)return "No date yet";return shortDate(x.start)+(x.end&&x.end!==x.start?" – "+shortDate(x.end):"");}
  function promoHTML(){
    var all=pms().items,today=todayISO();
    var keys=all.filter(function(x){return x.kind==="date";}).sort(function(a,b){return a.start<b.start?-1:1;});
    var pr=all.filter(function(x){return x.kind!=="date"&&x.status!=="dropped";});
    var nextKey=keys.filter(function(k){return k.start>=today;})[0];
    var openTodo=0;pr.forEach(function(x){(x.todo||[]).forEach(function(t){if(!t.done)openTodo++;});});
    var h='<div class="au-head"><span class="cst"><b>'+pr.length+'</b>promotions</span><span class="cst"><b>'+openTodo+'</b>to-dos left</span>'+
      (nextKey?'<span class="au-legend"><strong>'+esc(nextKey.title)+'</strong> in '+daysBetween(today,nextKey.start)+' days ('+esc(shortDate(nextKey.start))+')</span>':'')+'</div>';
    /* month strip: Nov, Dec, Jan */
    var d0=parseISO(today),months=[];for(var m=0;m<3;m++){var dt=new Date(d0.getFullYear(),d0.getMonth()+m,1);months.push(dt);}
    h+='<section class="panel pm-cal"><h2>Next three months <small>key dates and promotions</small></h2><div class="pm-months">';
    months.forEach(function(md){
      var y=md.getFullYear(),mo=md.getMonth(),last=new Date(y,mo+1,0).getDate(),mk=y+"-"+pad(mo+1);
      h+='<div class="pm-month"><h3>'+esc(md.toLocaleDateString(undefined,{month:"long",year:"numeric"}))+'</h3><div class="pm-days">';
      ["S","M","T","W","T","F","S"].forEach(function(w){h+='<span class="pm-wd">'+w+'</span>';});
      for(var i=0;i<md.getDay();i++)h+='<span></span>';
      for(var dd=1;dd<=last;dd++){var iso=mk+"-"+pad(dd);
        var hits=all.filter(function(x){if(x.status==="dropped"||!x.start)return false;var e=x.end||x.start;return iso>=x.start&&iso<=e;});
        var isKey=hits.some(function(x){return x.kind==="date";}),isPromo=hits.some(function(x){return x.kind!=="date";});
        h+='<span class="pm-d'+(iso===today?' today':'')+(iso<today?' past':'')+(isKey?' key':'')+(isPromo?' promo':'')+'"'+(hits.length?' title="'+esc(hits.map(function(x){return x.title;}).join(", "))+'"':'')+'>'+dd+'</span>';}
      h+='</div></div>';
    });
    h+='</div><div class="legend" style="margin-top:10px"><span><i style="background:var(--warn)"></i>Key date</span><span><i style="background:var(--accent)"></i>Promotion running</span></div></section>';
    h+='<div class="tgrid" style="margin-top:16px"><div class="tmain"><section class="panel"><h2>Promotions <small>soonest first</small></h2>';
    var sorted=pr.slice().sort(function(a,b){var x=a.start||"9",y=b.start||"9";return x<y?-1:x>y?1:0;});
    if(!sorted.length)h+='<p class="empty">No promotions yet. Add one below.</p>';
    h+='<ul class="pm-list">';
    sorted.forEach(function(x){
      var past=(x.end||x.start)&&(x.end||x.start)<today;
      h+='<li class="pm-item'+(past||x.status==="done"?' done':'')+'"><div class="pm-top"><div><div class="pm-t">'+esc(x.title)+'</div><div class="pm-m"><b>'+esc(pmWhen(x))+'</b> · '+esc(PM_KIND[x.kind]||x.kind)+((x.sites||[]).length?' · '+esc(x.sites.join(", ")):'')+(x.owner?' · '+esc(x.owner):'')+'</div></div>';
      h+='<select data-pmst="'+esc(x.id)+'" aria-label="Status of '+esc(x.title)+'">'+PM_ST.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===x.status?' selected':'')+'>'+o[1]+'</option>';}).join("")+'</select></div>';
      if(x.what)h+='<div class="pm-w">'+esc(x.what)+'</div>';
      if((x.todo||[]).length){h+='<ul class="pm-todo">';x.todo.forEach(function(t,i){h+='<li class="'+(t.done?'done':'')+'"><label><input type="checkbox" class="chk" data-pmtodo="'+esc(x.id+"|"+i)+'"'+(t.done?' checked':'')+'> <span>'+esc(t.text)+'</span></label></li>';});h+='</ul>';}
      h+='<div class="pm-a">'+(x.source?'<span class="pm-m">'+(safeLink(x.link)?'<a href="'+esc(x.link)+'" target="_blank" rel="noopener">'+esc(x.source)+'</a>':esc(x.source))+'</span>':'')+
        '<button type="button" class="tx" data-pmtask="'+esc(x.id)+'">'+((x.taskIds||[]).length?'Add another task':'Make a task')+'</button>'+
        '<label class="pm-date">Starts <input type="date" data-pmdate="'+esc(x.id)+'|start" value="'+esc(x.start||"")+'"></label><label class="pm-date">Ends <input type="date" data-pmdate="'+esc(x.id)+'|end" value="'+esc(x.end||"")+'"></label></div>';
      h+='</li>';
    });
    h+='</ul>';
    h+='<form class="addrow" data-form="pmadd"><input type="text" name="title" placeholder="Add a promotion: e.g. Black Friday 20% off beams" required aria-label="Promotion"><input type="date" name="start" aria-label="Starts"><input type="date" name="end" aria-label="Ends"><button class="btn ghost" type="submit">Add</button></form>';
    h+='</section></div><div class="tside"><section class="panel"><h2>Key dates</h2><ul class="cl-list">';
    keys.forEach(function(k){var n=daysBetween(today,k.start);h+='<li class="'+(n<0?'pm-pastk':'')+'"><div class="ct">'+esc(k.title)+' <span class="pm-m">'+esc(shortDate(k.start))+(n>=0?' · in '+n+' days':'')+'</span></div>'+(k.what?'<div class="cm">'+esc(k.what)+'</div>':'')+'</li>';});
    h+='</ul></section><p class="hint" style="margin:0">Read from your email and Teams'+(pms().asOf?' on '+esc(shortDate(String(pms().asOf).slice(0,10))):'')+'. Claude only reads; nothing is sent or changed on the sites.</p></div></div>';
    return h;
  }
  document.addEventListener("change",function(e){
    var el=e.target;if(!el.dataset)return;
    if(el.dataset.pmst){var x=pmFind(el.dataset.pmst);if(x){x.status=el.value;save();}return;}
    if(el.dataset.pmtodo){var q=el.dataset.pmtodo.split("|"),x2=pmFind(q[0]);if(x2&&x2.todo[+q[1]]){var td=x2.todo[+q[1]];td.done=el.checked;if(el.checked)logAuto("Promo "+x2.title+": "+td.text,"pm-"+x2.id+"-"+q[1]);else logDrop("pm-"+x2.id+"-"+q[1]);save();}return;}
    if(el.dataset.pmdate){var q2=el.dataset.pmdate.split("|"),x3=pmFind(q2[0]);if(x3){x3[q2[1]]=el.value||"";save();}return;}
  });
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-pmtask]");if(!b)return;
    var x=pmFind(b.dataset.pmtask);if(!x)return;
    var t={id:"pm"+Date.now().toString(36),group:"now",title:clip(x.title,120),note:"From the Promotions calendar: "+pmWhen(x)+(x.what?". "+x.what:""),due:x.start&&x.start>todayISO()?x.start:"",done:false,since:todayISO(),source:"promotions"};
    state.tasks.push(t);(x.taskIds||(x.taskIds=[])).push(t.id);save();chip("Added to This week.");
  });
  document.addEventListener("submit",function(e){
    var f=e.target;if(!f.dataset||f.dataset.form!=="pmadd")return;e.preventDefault();
    var t=String(f.title.value||"").trim();if(!t)return;
    pms().items.push({id:"pmu"+Date.now().toString(36),title:clip(t,140),start:f.start.value||"",end:f.end.value||"",sites:[],kind:"sale",status:"planned",owner:"Brody",what:"",todo:[],source:"Added by you",link:""});
    save();chip("Promotion added.");
  },true);

  function planHTML(day,isToday){'''
rep("\n  function planHTML(day,isToday){",JS)
CSS='''
/* ---------- Promotions ---------- */
.pm-months{display:grid;grid-template-columns:1fr;gap:16px}
@media(min-width:760px){.pm-months{grid-template-columns:repeat(3,1fr)}}
.pm-month h3{margin:0 0 6px;font-size:13px;font-weight:600}
.pm-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;font-family:var(--mono);font-size:12px}
.pm-wd{color:var(--muted);font-size:10.5px}
.pm-d{padding:4px 0;border-radius:4px;color:var(--ink)}
.pm-d.past{color:var(--muted);opacity:.6}
.pm-d.promo{background:var(--accent-soft);color:var(--accent);font-weight:600}
.pm-d.key{box-shadow:inset 0 -3px 0 var(--warn);font-weight:600}
.pm-d.today{outline:2px solid var(--ink);outline-offset:-2px}
.pm-list{list-style:none;margin:0;padding:0}
.pm-item{padding:14px 0;border-top:1px solid var(--line)}
.pm-item:first-child{border-top:0;padding-top:2px}
.pm-item.done{opacity:.6}
.pm-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.pm-top select{padding:4px 6px;border:1px solid var(--line-strong);border-radius:5px;background:var(--panel);font-size:13px}
.pm-t{font-size:15px;font-weight:600;letter-spacing:-.01em}
.pm-m{font-size:12.5px;color:var(--muted)}
.pm-m b{font-family:var(--mono);font-weight:500;color:var(--ink)}
.pm-w{font-size:13.5px;margin-top:4px}
.pm-todo{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:4px;font-size:13.5px}
.pm-todo label{display:flex;gap:8px;align-items:flex-start;cursor:pointer}
.pm-todo li.done span{text-decoration:line-through;color:var(--muted)}
.pm-a{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin-top:10px}
.pm-date{font-size:12px;color:var(--muted);display:inline-flex;gap:4px;align-items:center}
.pm-date input{padding:3px 6px;border:1px solid var(--line-strong);border-radius:5px;background:var(--panel);font-size:12px;font-family:var(--mono)}
.pm-pastk{opacity:.55}
'''
rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok",len(items))
