  /* ===== Tier list (Nov 11, patch50; Brody: "Build this like a Teirlist where the teirlists are horizontal with all the people
     stacked and then the teirs are verticale with A teir being at the top"). Replaces the Tiers block: one horizontal row per
     tier, stacked A, B, C, D top to bottom (plus a "Not tiered" row when needed), each row a lettered label and the people as
     cards side by side. Cards are ordered by stage (In person first); clicking a name opens the profile panel (patch49). */
  var HZ50_ROWS=[["A","Move forward"],["B","Backup"],["C","Not hired"],["D","Not hired"],["?","Not tiered"]];
  var HZ50_ORD=["In person","Phone screen","Offer","Replied","New","Asked","No reply","Passed","Hired"];
  function hz50Card(p){
    var loc=String(p.loc||"").split(" · ")[0],why=p.tierWhy||"",nx=String(p.next||"").replace(/^You:\s*/,"You: ");
    return '<li class="hz50-card'+(/^You:/.test(p.next||"")?' you':'')+'" title="'+esc(why)+'">'
      +'<div class="hz50-nm">'+hz49Btn(p,esc(p.name||""))+'</div>'
      +(loc?'<div class="hz50-loc">'+esc(loc)+'</div>':'')
      +'<div class="hz50-st"><span>'+esc(p.stage||"")+'</span>'+(nx&&!/^None/.test(nx)?' · '+esc(nx):'')+'</div>'
      +'</li>';
  }
  hz48Tiers=function(h){
    var by={A:[],B:[],C:[],D:[],"?":[]};
    h.candidates.forEach(function(p){
      if(!p||(p.role&&p.role!=="ecom"))return;
      var t=hz48T(p);if(t)by[t].push(p);else if(hzActive(p))by["?"].push(p);
    });
    if(!by.A.length&&!by.B.length&&!by.C.length&&!by.D.length)return "";
    var o='<div class="hz-block hz50"><h3>Tier list <small>E-Commerce · A and B move forward, C and D aren\'t hired · click a name for the full profile</small></h3><div class="hz50-list">';
    HZ50_ROWS.forEach(function(r){
      var L=by[r[0]];if(r[0]==="?"&&!L.length)return;
      L.sort(function(a,b){return hzRank(HZ50_ORD,a.stage)-hzRank(HZ50_ORD,b.stage)||String(a.name).localeCompare(String(b.name));});
      var k=r[0]==="?"?"n":r[0];
      o+='<section class="hz50-row t'+k+'" aria-label="Tier '+esc(r[0])+': '+esc(r[1])+'">'
        +'<div class="hz50-lab"><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span><i>'+L.length+'</i></div>'
        +(L.length?'<ul class="hz50-cards">'+L.map(hz50Card).join("")+'</ul>':'<div class="hz50-empty">Nobody in this tier.</div>')
        +'</section>';
    });
    return o+'</div></div>';
  };
  (function(){
    if(document.getElementById("hz50-css"))return;
    var st=document.createElement("style");st.id="hz50-css";
    st.textContent='.hz50-list{display:flex;flex-direction:column;border:1px solid var(--line-strong);border-radius:10px;overflow:hidden}'
      +'.hz50-row{display:grid;grid-template-columns:96px minmax(0,1fr);min-height:92px;border-top:1px solid var(--line-strong)}.hz50-row:first-child{border-top:0}'
      +'.hz50-lab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:10px 6px;text-align:center;color:#fff}'
      +'.hz50-lab b{font-size:34px;line-height:1;font-weight:700;letter-spacing:-.02em}.hz50-lab span{font-size:11.5px;font-weight:600;opacity:.92}.hz50-lab i{font-style:normal;font-family:var(--mono);font-size:11px;opacity:.85}'
      +'.hz50-row.tA .hz50-lab{background:#157A4A}.hz50-row.tB .hz50-lab{background:#1D4ED8}.hz50-row.tC .hz50-lab{background:#A65F00}.hz50-row.tD .hz50-lab{background:#C42F1C}.hz50-row.tn .hz50-lab{background:#5A6781}'
      +'.hz50-row.tA{background:var(--ok-soft)}.hz50-row.tB{background:var(--accent-soft)}.hz50-row.tC{background:var(--warn-soft)}.hz50-row.tD{background:var(--bad-soft)}.hz50-row.tn{background:var(--sunk)}'
      +'.hz50-cards{list-style:none;margin:0;padding:10px;display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start}'
      +'.hz50-card{flex:0 1 158px;min-width:130px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:8px 10px;box-shadow:0 1px 2px rgba(15,27,51,.06)}'
      +'.hz50-card.you{border-color:var(--accent)}'
      +'.hz50-nm{font-size:14px;line-height:1.3}.hz50-loc{font-size:12px;color:var(--muted);margin-top:2px}'
      +'.hz50-st{font-size:11.5px;color:var(--muted);margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.hz50-st span{font-weight:600;color:var(--ink)}'
      +'.hz50-card.you .hz50-st{color:var(--accent)}'
      +'.hz50-row.tC .hz50-card,.hz50-row.tD .hz50-card{opacity:.8}'
      +'.hz50-empty{padding:14px;font-size:13px;color:var(--muted);align-self:center}'
      +'@media(max-width:560px){.hz50-row{grid-template-columns:56px minmax(0,1fr)}.hz50-lab b{font-size:26px}.hz50-lab span{font-size:10px}.hz50-card{flex:1 1 140px;min-width:0}}';
    document.head.appendChild(st);
  })();
