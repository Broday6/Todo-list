  /* ===== Hiring workflow stages, A-D tiers and top qualities (Nov 11, patch48; Brody: "I need it to take them through a
     workflow not just continuing to ask them if they are qualified also for each applicant pull me their top qualities form
     their emails and from their resumes" and "in the hiring tab put teris of people with why they are in those tears so A,
     b ,c,d if it is c or d they arent hired"). Stages and tiers follow claude-work/routines/hiring-workflow.md. Older stage
     values on a row are read as the new ones. A Tiers block sits above the candidate rows; each row shows tier, loc, top (up
     to 3), flags and next above its notes. */
  var HZ48_OLD={"Contacted":"Asked","Messaged you":"Replied","Screen":"Phone screen","Interview":"In person"};
  var HZ48_TIER={A:"A · move forward",B:"B · backup",C:"C · not hired",D:"D · not hired"};
  HZ_STAGE=["Replied","Phone screen","In person","Offer","New","Asked","Hired","Passed","No reply"];
  HZ_TONE["Replied"]="warn";HZ_TONE["Phone screen"]="acc";HZ_TONE["In person"]="acc";HZ_TONE["New"]="mut";
  HZ_TONE["Asked"]="mut";HZ_TONE["No reply"]="done";
  var _hz48=hz;
  hz=function(){
    var h=_hz48();if(!h)return h;
    h.candidates.forEach(function(p){if(p&&HZ48_OLD[p.stage])p.stage=HZ48_OLD[p.stage];if(p&&!p.stage)p.stage="New";});
    return h;
  };
  hzActive=function(p){return p.stage!=="Passed"&&p.stage!=="Hired"&&p.stage!=="No reply";};
  var _hzStats48=hzStats;
  hzStats=function(h){
    var s=_hzStats48(h);
    s.msgs=h.candidates.filter(function(p){return hzActive(p)&&(p.stage==="Replied"||/^You:/.test(p.next||""));}).length;
    return s;
  };
  function hz48T(p){var t=String(p.tier||"").toUpperCase();return HZ48_TIER[t]?t:"";}
  function hz48Prof(p){
    var top=Array.isArray(p.top)?p.top.slice(0,3):[],fl=Array.isArray(p.flags)?p.flags.slice(0,2):[],t=hz48T(p);
    if(!top.length&&!p.loc&&!t&&!p.next&&!fl.length)return "";
    var meta=[t?'<b class="hz48-tier t'+t+'">Tier '+esc(HZ48_TIER[t])+'</b>':"",p.loc?esc(p.loc):""].filter(Boolean).join(" · ");
    return '<div class="hz48">'
      +(meta?'<div class="hz48-m">'+meta+'</div>':"")
      +(t&&p.tierWhy?'<div class="hz48-why">Why: '+esc(p.tierWhy)+'</div>':"")
      +(top.length?'<ul class="hz48-top">'+top.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>':"")
      +(fl.length?'<div class="hz48-fl">Check: '+esc(fl.join("; "))+'</div>':"")
      +(p.next?'<div class="hz48-n'+(/^You:/.test(p.next)?' you':'')+'">Next: '+esc(p.next)+'</div>':"")
      +'</div>';
  }
  var _hzCand48=hzCandHTML;
  hzCandHTML=function(p){
    var h=_hzCand48(p),k='<div class="a-note"><span class="lb">Notes</span>',i=h.indexOf(k);
    return i<0?h:h.slice(0,i+k.length)+hz48Prof(p)+h.slice(i+k.length);
  };
  function hz48Tiers(h){
    var by={A:[],B:[],C:[],D:[]},none=0;
    h.candidates.forEach(function(p){if(p.role&&p.role!=="ecom")return;var t=hz48T(p);if(t)by[t].push(p);else if(hzActive(p))none++;});
    if(!by.A.length&&!by.B.length&&!by.C.length&&!by.D.length)return "";
    var o='<div class="hz-block hz48-tiers"><h3>Tiers <small>E-Commerce · A and B move forward, C and D aren\'t hired</small></h3>';
    ["A","B","C","D"].forEach(function(t){
      var L=by[t];if(!L.length)return;
      o+='<div class="hz48-tg t'+t+'"><h4>Tier '+esc(HZ48_TIER[t])+' <small>'+L.length+'</small></h4><ul>'
        +L.map(function(p){return '<li><strong>'+esc(p.name||"")+'</strong>'+(p.loc?' <span class="hz48-loc">'+esc(p.loc)+'</span>':'')
          +(p.tierWhy?'<span class="hz48-tw">'+esc(p.tierWhy)+'</span>':'')
          +(p.stage?'<span class="hz48-st">'+esc(p.stage)+(p.next?' · Next: '+esc(p.next):'')+'</span>':'')+'</li>';}).join("")
        +'</ul></div>';
    });
    if(none)o+='<p class="hz-foot">'+none+' E-Commerce candidate'+(none===1?'':'s')+' not tiered yet.</p>';
    return o+'</div>';
  }
  var _hiringHTML48=hiringHTML;
  hiringHTML=function(){
    var o=_hiringHTML48.apply(this,arguments),h=hz(),k='<div class="hz-block"><h3>Candidates',i;
    if(!h||typeof o!=="string")return o;i=o.indexOf(k);
    return i<0?o:o.slice(0,i)+hz48Tiers(h)+o.slice(i);
  };
  (function(){
    if(document.getElementById("hz48-css"))return;
    var st=document.createElement("style");st.id="hz48-css";
    st.textContent='.hz48{margin:0 0 6px;font-size:13px;line-height:1.45}'
      +'.hz48-m{color:var(--muted);font-size:12.5px}.hz48-why{margin-top:2px;font-size:12.5px}'
      +'.hz48-tier{font-weight:600}.hz48-tier.tA{color:var(--ok)}.hz48-tier.tB{color:var(--accent)}.hz48-tier.tC,.hz48-tier.tD{color:var(--muted)}'
      +'.hz48-top{margin:4px 0 0;padding-left:16px;display:grid;gap:2px}'
      +'.hz48-fl{margin-top:4px;color:var(--warn);font-size:12.5px}'
      +'.hz48-n{margin-top:4px;font-size:12.5px;color:var(--muted)}.hz48-n.you{color:var(--accent);font-weight:500}'
      +'.hz48-tiers{display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:900px){.hz48-tiers{grid-template-columns:1fr 1fr}.hz48-tiers>h3,.hz48-tiers>.hz-foot{grid-column:1/-1}}'
      +'.hz48-tg{border:1px solid var(--line);border-radius:10px;padding:10px 12px;min-width:0}'
      +'.hz48-tg.tA{border-left:3px solid var(--ok)}.hz48-tg.tB{border-left:3px solid var(--accent)}.hz48-tg.tC,.hz48-tg.tD{border-left:3px solid var(--line-strong)}'
      +'.hz48-tg h4{margin:0 0 6px;font-size:13px;font-weight:600;display:flex;gap:8px;align-items:baseline}.hz48-tg h4 small{font-family:var(--mono);font-weight:500;color:var(--muted)}'
      +'.hz48-tg ul{list-style:none;margin:0;padding:0}.hz48-tg li{padding:7px 0;border-top:1px solid var(--line);font-size:13.5px;overflow-wrap:anywhere}.hz48-tg li:first-child{border-top:0;padding-top:0}'
      +'.hz48-loc{color:var(--muted);font-size:12.5px;margin-left:6px}.hz48-tw{display:block;margin-top:1px}.hz48-st{display:block;margin-top:1px;font-size:12px;color:var(--muted)}'
      +'.hz48-tg.tC li,.hz48-tg.tD li{color:var(--muted)}';
    document.head.appendChild(st);
  })();
