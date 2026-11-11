  /* ===== Hiring workflow stages and top qualities (Nov 11, patch48; Brody: "I need it to take them through a workflow not
     just continuing to ask them if they are qualified also for each applicant pull me their top qualities form their emails
     and from their resumes"). Stages follow claude-work/routines/hiring-workflow.md. Older stage values on a row are read as
     the new ones. Each candidate row shows loc, fit, top (up to 3), flags and next above its notes. */
  var HZ48_OLD={"Contacted":"Asked","Messaged you":"Replied","Screen":"Phone screen","Interview":"In person"};
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
  function hz48Prof(p){
    var top=Array.isArray(p.top)?p.top.slice(0,3):[],fl=Array.isArray(p.flags)?p.flags.slice(0,2):[];
    if(!top.length&&!p.loc&&!p.fit&&!p.next&&!fl.length)return "";
    var fit=String(p.fit||""),fk=/^strong/i.test(fit)?"s":/^weak/i.test(fit)?"w":fit?"m":"";
    var meta=[p.loc?esc(p.loc):"",fit?'<b class="hz48-fit '+fk+'">'+esc(fit)+'</b>':""].filter(Boolean).join(" · ");
    return '<div class="hz48">'
      +(meta?'<div class="hz48-m">'+meta+'</div>':"")
      +(top.length?'<ul class="hz48-top">'+top.map(function(t){return '<li>'+esc(t)+'</li>';}).join("")+'</ul>':"")
      +(fl.length?'<div class="hz48-fl">Check: '+esc(fl.join("; "))+'</div>':"")
      +(p.next?'<div class="hz48-n'+(/^You:/.test(p.next)?' you':'')+'">Next: '+esc(p.next)+'</div>':"")
      +'</div>';
  }
  var _hzCand48=hzCandHTML;
  hzCandHTML=function(p){
    var h=_hzCand48(p),k='<div class="a-note"><span class="lb">Notes</span>',i=h.indexOf(k);
    return i<0?h:h.slice(0,i+k.length)+hz48Prof(p)+h.slice(i+k.length);
  };
  (function(){
    if(document.getElementById("hz48-css"))return;
    var st=document.createElement("style");st.id="hz48-css";
    st.textContent='.hz48{margin:0 0 6px;font-size:13px;line-height:1.45}'
      +'.hz48-m{color:var(--muted);font-size:12.5px}'
      +'.hz48-fit{font-weight:600}.hz48-fit.s{color:var(--ok)}.hz48-fit.m{color:var(--warn)}.hz48-fit.w{color:var(--muted)}'
      +'.hz48-top{margin:4px 0 0;padding-left:16px;display:grid;gap:2px}'
      +'.hz48-fl{margin-top:4px;color:var(--warn);font-size:12.5px}'
      +'.hz48-n{margin-top:4px;font-size:12.5px;color:var(--muted)}.hz48-n.you{color:var(--accent);font-weight:500}';
    document.head.appendChild(st);
  })();
