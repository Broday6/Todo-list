import json,sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
TAG='<script id="state" type="application/json">'
a=s.find(TAG);a2=s.find('>',a)+1;b=s.find('</script>',a2)
raw=s[a2:b];lead=raw[:len(raw)-len(raw.lstrip())];trail=raw[len(raw.rstrip()):]
ind=1 if raw.lstrip().startswith('{\n') else None
st=json.loads(raw.replace('<\\/','</'))
st['_note']+=" A promotion can carry emailTaskId: the task \"Write the emails for <promo>\" that its “Write the emails” button gave to Claude (task.promoId points back). Those tasks are worked by the check-in like any assigned task: campaign copy only from Brody's brief, saved as files in the repo and one Outlook draft to Brody himself; nothing goes to customers or anyone else."
newraw=json.dumps(st,ensure_ascii=False,indent=ind).replace('</','<\\/')
s=s[:a2]+lead+newraw+trail+s[b:]
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:70],s.count(old))
    s=s.replace(old,new)
# button + inline form per promo
rep("""        '<button type="button" class="tx" data-pmtask="'+esc(x.id)+'">'+((x.taskIds||[]).length?'Add another task':'Make a task')+'</button>'+""",
"""        pmMailBtn(x)+'<button type="button" class="tx" data-pmtask="'+esc(x.id)+'">'+((x.taskIds||[]).length?'Add another task':'Make a task')+'</button>'+""")
rep("""      h+='</li>';
    });
    h+='</ul>';
    h+='<form class="addrow" data-form="pmadd">""","""      h+=pmMailBox(x);
      h+='</li>';
    });
    h+='</ul>';
    h+='<form class="addrow" data-form="pmadd">""")
JS=r'''
  /* ---------- Promotions: "Write the emails" hands the campaign emails to Claude ---------- */
  var pmMailOpen={};
  function pmMailTask(x){var t=x.emailTaskId&&findTask(x.emailTaskId);return t||null;}
  function pmMailBtn(x){
    var t=pmMailTask(x);
    if(t&&!t.done){var lab=t.claudeStatus==="ready"?"Emails ready: review":t.claudeStatus==="blocked"?"Emails: Claude needs you":"Emails: with Claude";
      return '<button type="button" class="btn pm-mailbtn '+esc(t.claudeStatus||"")+'" data-opentask="'+esc(t.id)+'">'+esc(lab)+'</button>';}
    return '<button type="button" class="btn pm-mailbtn" data-pmmail="'+esc(x.id)+'" aria-expanded="'+(pmMailOpen[x.id]?'true':'false')+'">'+(t?'Write more emails':'Write the emails')+'</button>';
  }
  function pmMailBox(x){
    if(!pmMailOpen[x.id])return '';
    var isVendor=x.kind==="vendor";
    var h='<form class="pm-mail" data-form="pmmail" data-id="'+esc(x.id)+'"><div class="pm-mt">Claude writes the campaign emails for you to review. Nothing is sent: you get the copy as files and one Outlook draft to yourself.</div>';
    h+='<div class="pm-mrow"><label>How many emails<select name="n">'+[["1","1 email"],["2","2: announce and last call"],["3","3: announce, reminder, last call"],["4","4: teaser, announce, reminder, last call"]].map(function(o){return '<option value="'+o[0]+'"'+(o[0]==="3"?' selected':'')+'>'+o[1]+'</option>';}).join("")+'</select></label>';
    h+='<label>Sites<input type="text" name="sites" value="'+esc((x.sites||[]).join(", ")||"AD")+'" placeholder="AD, Ekena"></label></div>';
    h+='<label class="pm-mfull">The offer <span>exactly what customers get. Claude won’t make up a discount, price or date.</span><input type="text" name="offer" placeholder="e.g. 20% off faux wood beams, Nov 24 to Nov 30, code BF20"></label>';
    h+='<label class="pm-mfull">Anything else <span>products to feature, tone, who it’s for, send dates</span><textarea name="notes" rows="2"></textarea></label>';
    if(isVendor)h+='<p class="pm-mwarn">Vendor promo: the emails only promote it. Setting up the promo price in NetSuite still needs your OK separately.</p>';
    h+='<div class="pm-ma"><button class="btn" type="submit">Give to Claude</button><button class="btn ghost" type="button" data-pmmail="'+esc(x.id)+'">Cancel</button><span class="pm-m">Starts at the next check-in, '+esc(nextCheckin())+'.</span></div></form>';
    return h;
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-pmmail]");if(!b)return;
    pmMailOpen[b.dataset.pmmail]=!pmMailOpen[b.dataset.pmmail];render();
  });
  document.addEventListener("submit",function(e){
    var f=e.target;if(!f.dataset||f.dataset.form!=="pmmail")return;e.preventDefault();
    var x=pmFind(f.dataset.id);if(!x)return;
    var n=+f.n.value||3,sites=String(f.sites.value||"").trim()||"AD",offer=String(f.offer.value||"").trim(),notes=String(f.notes.value||"").trim();
    var when=pmWhen(x),day=todayISO(),id="pe"+Date.now().toString(36);
    var steps=[
      "Read this promotion on the Promotions tab ("+x.title+", "+when+") and its source email"+(x.source?" ("+x.source+")":"")+".",
      "Find the last 3 campaign emails "+sites+" sent (in your mail, e.g. the Halloween Sale emails) and match their voice, length and layout.",
      "Write "+n+" email"+(n>1?"s":"")+": for each, 3 subject lines, preview text, headline, body, button text and where it links, plus a suggested send date inside the promo dates. Use only the offer in the brief; no made-up discounts, prices or dates.",
      "Save each email as an HTML file in the repo under claude-work/"+day+"/"+id+"-emails/ and post the links in this task's thread.",
      "Save one Outlook draft addressed to you only, with all "+n+" emails in it, so you can review and pass it on for Active Campaign. Never to anyone else."
    ];
    var t={id:id,group:"now",title:clip("Write the emails for "+x.title,140),note:"From the Promotions calendar: "+when+". "+n+" email"+(n>1?"s":"")+" for "+sites+"."+(x.what?" "+clip(x.what,300):""),
      due:day,done:false,since:day,source:"promotions",promoId:x.id,assignee:"claude",claudeStatus:"queued",
      workflow:steps.map(function(s2){return {text:s2};}),
      thread:[{role:"user",text:"Given to Claude from the Promotions tab.",t:new Date().toISOString()}]};
    var brief=[];if(offer)brief.push("Offer: "+offer);if(notes)brief.push("Notes: "+notes);brief.push("Sites: "+sites+". Emails: "+n+".");
    t.brief=brief.join("\n");
    if(!offer){t.needs="What's the offer? The emails can't name a discount, price or date you haven't given.";delete t.brief;if(notes)t.brief="Notes: "+notes+"\nSites: "+sites+". Emails: "+n+".";}
    state.tasks.push(t);x.emailTaskId=id;(x.taskIds||(x.taskIds=[])).push(id);pmMailOpen[x.id]=false;
    logAuto("Gave to Claude: emails for "+x.title,id);
    save();chip(offer?"Given to Claude. It starts at the next check-in, "+nextCheckin()+".":"Given to Claude. It will ask you for the offer before writing.");
  },true);

  function planHTML(day,isToday){'''
rep("\n  function planHTML(day,isToday){",JS)
CSS='''
/* ---------- promo emails ---------- */
.pm-mailbtn{padding:5px 11px;font-size:12.5px}
.pm-mailbtn.ready{background:var(--ok);border-color:var(--ok)}
.pm-mailbtn.blocked{background:var(--warn);border-color:var(--warn)}
.pm-mail{margin-top:10px;padding:12px 14px;border:1px solid var(--accent);border-radius:8px;background:var(--accent-soft);display:flex;flex-direction:column;gap:10px;font-size:13px}
.pm-mt{font-size:13px}
.pm-mrow{display:flex;flex-wrap:wrap;gap:10px}
.pm-mail label{display:flex;flex-direction:column;gap:3px;font-size:12px;font-weight:600;color:var(--muted)}
.pm-mail label span{font-weight:400}
.pm-mrow label{flex:1 1 180px}
.pm-mail input,.pm-mail select,.pm-mail textarea{padding:7px 9px;border:1px solid var(--line-strong);border-radius:6px;background:var(--panel);font-size:13.5px;font-weight:400;color:var(--ink);width:100%}
.pm-mwarn{margin:0;padding:6px 9px;border-radius:6px;background:var(--warn-soft);font-size:12.5px}
.pm-ma{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
'''
rep("\n/* ---------- clean-up, last update, idea triage ---------- */",CSS+"\n/* ---------- clean-up, last update, idea triage ---------- */")
open(dst,"w").write(s)
print("ok")
