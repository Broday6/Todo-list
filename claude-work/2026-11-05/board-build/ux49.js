  /* ===== Candidate profile panel (Nov 11, patch49; Brody: "Allow me to click on their name and get more information it is
     still extremely limited"). Every candidate name on the Hiring tab (Tiers block and candidate rows) opens a panel with
     everything on file: tier and why, next step, top qualities, their replies word for word, the resume (roles, education,
     skills, red flags), the emails we sent and the drafts waiting, links, and notes. Data: candidate.profile (shape in
     claude-work/routines/hiring-workflow.md section 4). The panel sits on document.body, so a re-render doesn't close it. */
  function hz49Btn(p,label){return '<button type="button" class="hz49-name" data-hz49="'+esc(p.id||"")+'" title="Open '+esc(p.name||"")+'\'s profile">'+label+'</button>';}
  var _hzCand49=hzCandHTML;
  hzCandHTML=function(p){
    var h=_hzCand49(p),k='<div class="a-who"><strong>',i=h.indexOf(k),j=i<0?-1:h.indexOf('</strong>',i);
    if(i<0||j<0)return h;
    var nm=h.slice(i+k.length,j);
    return h.slice(0,i)+'<div class="a-who"><strong>'+hz49Btn(p,nm)+h.slice(j);
  };
  var _hz48Tiers49=hz48Tiers;
  hz48Tiers=function(h){
    var o=_hz48Tiers49(h);if(!o)return o;
    h.candidates.forEach(function(p){
      if(!p||!p.id)return;var k='<li><strong>'+esc(p.name||"")+'</strong>';
      o=o.split(k).join('<li><strong>'+hz49Btn(p,esc(p.name||""))+'</strong>');
    });
    return o;
  };
  function hz49Sec(title,body){return body?'<section class="hz49-sec"><h3>'+title+'</h3>'+body+'</section>':"";}
  function hz49List(a){return Array.isArray(a)&&a.length?'<ul>'+a.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>':"";}
  function hz49HTML(p){
    var pr=p.profile||{},t=hz48T(p),o='';
    o+='<div class="hz49-head"><div><h2>'+esc(p.name||"")+'</h2><p class="hz49-sub">'
      +[t?'<b class="hz48-tier t'+t+'">Tier '+esc(HZ48_TIER[t])+'</b>':"",esc(p.stage||""),p.loc?esc(p.loc):"",esc([hzRole(p.role),p.school,p.source].filter(Boolean).join(" · "))].filter(Boolean).join(" · ")
      +'</p></div><button type="button" class="hz49-x" data-hz49x aria-label="Close">×</button></div>';
    o+=hz49Sec("Why this tier",p.tierWhy?'<p>'+esc(p.tierWhy)+'</p>':"");
    o+=hz49Sec("Next step",p.next?'<p class="hz49-next">'+esc(p.next)+(p.interview?' · '+esc(String(p.interview).replace("T"," "))+(p.where?' · '+esc(p.where):''):'')+'</p>':"");
    o+=hz49Sec("Top qualities",hz49List(p.top));
    o+=hz49Sec("Check",hz49List(p.flags));
    if(pr.summary)o+=hz49Sec("Summary",'<p>'+esc(pr.summary)+'</p>');
    var R=Array.isArray(pr.replies)?pr.replies.slice().reverse():[];
    o+=hz49Sec("What they wrote to us"+(R.length?' <small>'+R.length+'</small>':''),R.length?R.map(function(r){
      return '<blockquote class="hz49-q"><div class="hz49-qm">'+esc(r.on||"")+(r.about?' · '+esc(r.about):'')+'</div>'+esc(r.text||"")+'</blockquote>';}).join(""):'<p class="hz49-mute">No reply yet.</p>');
    var res='';
    if(pr.workAuth||pr.city||pr.relocate)res+='<p class="hz49-kv">'+[pr.city?'<span><b>Lives</b> '+esc(pr.city)+'</span>':'',pr.relocate?'<span><b>Relocation</b> '+esc(pr.relocate)+'</span>':'',pr.workAuth?'<span><b>Work auth</b> '+esc(pr.workAuth)+'</span>':''].join("")+'</p>';
    if(Array.isArray(pr.roles)&&pr.roles.length)res+='<ol class="hz49-roles">'+pr.roles.map(function(r){
      return '<li><div class="hz49-rt"><b>'+esc(r.title||"")+'</b>'+(r.org?' · '+esc(r.org):'')+'</div>'+(r.dates?'<div class="hz49-rd">'+esc(r.dates)+'</div>':'')+(r.did?'<div>'+esc(r.did)+'</div>':'')+'</li>';}).join("")+'</ol>';
    if(pr.education)res+='<p><b>Education</b> '+esc(pr.education)+'</p>';
    if(Array.isArray(pr.skills)&&pr.skills.length)res+='<div class="hz49-chips">'+pr.skills.map(function(s){return '<span>'+esc(s)+'</span>';}).join("")+'</div>';
    if(Array.isArray(pr.redFlags)&&pr.redFlags.length)res+='<p class="hz49-rf"><b>Watch for</b></p>'+hz49List(pr.redFlags);
    o+=hz49Sec("Resume"+(pr.resumeOn?' <small>read '+esc(pr.resumeOn)+'</small>':''),res||'<p class="hz49-mute">Resume not read yet.</p>');
    o+=hz49Sec("Emails with us",Array.isArray(pr.emails)&&pr.emails.length?'<ul class="hz49-tl">'+pr.emails.map(function(e){return '<li><span>'+esc(e.on||"")+'</span>'+esc(e.what||"")+'</li>';}).join("")+'</ul>':"");
    o+=hz49Sec("Links",Array.isArray(pr.links)&&pr.links.length?'<p class="hz49-links">'+pr.links.map(function(l){return '<a href="'+esc(l.url||"#")+'" target="_blank" rel="noopener">'+esc(l.label||"Open")+' ↗</a>';}).join("")+'</p>':"");
    o+=hz49Sec("Notes",p.note?'<p class="hz49-note">'+esc(p.note)+'</p>':"");
    return o;
  }
  var HZ49={id:null,last:null};
  function hz49Close(){var w=document.getElementById("hz49");if(w)w.remove();HZ49.id=null;if(HZ49.last&&HZ49.last.focus)try{HZ49.last.focus();}catch(e){}}
  function hz49Open(id){
    var h=hz();if(!h)return;var p=hzFind(h.candidates,id);if(!p)return;
    hz49Close();HZ49.id=id;HZ49.last=document.activeElement;
    var w=document.createElement("div");w.id="hz49";w.className="hz49-wrap";
    w.innerHTML='<div class="hz49-box" role="dialog" aria-modal="true" aria-label="'+esc(p.name||"")+' profile">'+hz49HTML(p)+'</div>';
    document.body.appendChild(w);
    var x=w.querySelector("[data-hz49x]");if(x)x.focus();
  }
  document.addEventListener("click",function(ev){
    var b=ev.target&&ev.target.closest&&ev.target.closest("[data-hz49]");
    if(b){ev.preventDefault();ev.stopPropagation();hz49Open(b.getAttribute("data-hz49"));return;}
    if(ev.target&&ev.target.closest&&ev.target.closest("[data-hz49x]")){hz49Close();return;}
    if(ev.target&&ev.target.id==="hz49")hz49Close();
  },true);
  window.addEventListener("keydown",function(ev){if(ev.key==="Escape"&&HZ49.id){ev.stopPropagation();hz49Close();}},true);
  (function(){
    if(document.getElementById("hz49-css"))return;
    var st=document.createElement("style");st.id="hz49-css";
    st.textContent='.hz49-name{all:unset;cursor:pointer;font-weight:600;color:var(--accent);text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:3px}'
      +'.hz49-name:hover{text-decoration-color:var(--accent)}.hz49-name:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:3px}'
      +'.hz49-wrap{position:fixed;inset:0;z-index:30;background:rgba(10,16,32,.45);display:flex;justify-content:flex-end}'
      +'.hz49-box{width:min(640px,100%);height:100%;overflow-y:auto;background:var(--panel);color:var(--ink);border-left:1px solid var(--line);box-shadow:-12px 0 40px rgba(0,0,0,.2);padding:18px 20px 40px;font-size:14px;line-height:1.5}'
      +'.hz49-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding-bottom:12px;border-bottom:1px solid var(--line);position:sticky;top:-18px;background:var(--panel);padding-top:4px;z-index:1}'
      +'.hz49-head h2{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em}.hz49-sub{margin:3px 0 0;font-size:13px;color:var(--muted)}'
      +'.hz49-x{border:0;background:none;font-size:26px;line-height:1;color:var(--muted);padding:0 4px;cursor:pointer}.hz49-x:hover{color:var(--ink)}'
      +'.hz49-sec{padding:14px 0;border-bottom:1px solid var(--line)}.hz49-sec:last-child{border-bottom:0}'
      +'.hz49-sec h3{margin:0 0 6px;font-size:12.5px;font-weight:600;color:var(--muted);text-transform:none;letter-spacing:0}.hz49-sec h3 small{font-family:var(--mono);font-weight:500;margin-left:4px}'
      +'.hz49-sec p{margin:0 0 6px}.hz49-sec ul{margin:0;padding-left:18px;display:grid;gap:3px}'
      +'.hz49-next{color:var(--accent);font-weight:500}.hz49-mute{color:var(--muted)}'
      +'.hz49-q{margin:0 0 10px;padding:10px 12px;border-left:2px solid var(--accent);background:var(--sunk);border-radius:0 6px 6px 0;white-space:pre-wrap;overflow-wrap:anywhere}'
      +'.hz49-qm{font-family:var(--mono);font-size:11.5px;color:var(--muted);margin-bottom:4px}'
      +'.hz49-kv{display:flex;flex-wrap:wrap;gap:4px 18px;font-size:13px}.hz49-kv b{font-weight:600;color:var(--muted);margin-right:4px}'
      +'.hz49-roles{margin:6px 0 8px;padding-left:20px;display:grid;gap:8px}.hz49-rt{font-size:14px}.hz49-rd{font-family:var(--mono);font-size:11.5px;color:var(--muted)}'
      +'.hz49-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 8px}.hz49-chips span{font-size:12px;padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent)}'
      +'.hz49-rf{margin-top:8px!important;color:var(--warn)}'
      +'.hz49-tl{list-style:none;padding:0!important}.hz49-tl li{display:grid;grid-template-columns:7.5rem minmax(0,1fr);gap:8px;font-size:13px}.hz49-tl span{font-family:var(--mono);font-size:12px;color:var(--muted)}'
      +'.hz49-links{display:flex;flex-wrap:wrap;gap:6px 16px}.hz49-note{white-space:pre-wrap;color:var(--muted);font-size:13px}'
      +'@media(max-width:560px){.hz49-box{padding:14px 16px 32px}.hz49-tl li{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  })();
