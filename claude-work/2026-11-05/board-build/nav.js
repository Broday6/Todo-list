  /* ===== Easier navigation (Nov 5, Brody: "the homepage and some of the pages are hard to navigate") =====
     1. A sticky "Jump to" bar on every long page, built from its sections (Tasks: its groups, plus Collapse all).
     2. Today: Needs your eyes, Cases & alerts fold to one line; the log shows the newest 8.
     3. A Back to top button on long pages. */
  var FOLDK="ultron.fold2",fold2={},logAll=false;
  try{fold2=JSON.parse(localStorage.getItem(FOLDK)||"{}")||{};}catch(e){}
  function foldSec(html,key,defOpen){
    if(!html)return html;
    var s=html.indexOf('<section'),e=html.lastIndexOf('</section>');if(s<0||e<0)return html;
    var h2s=html.indexOf('<h2',s),h2e=html.indexOf('</h2>',h2s);if(h2s<0||h2e<0)return html;
    var open=Object.prototype.hasOwnProperty.call(fold2,key)?!!fold2[key]:defOpen;
    var head=html.slice(s,h2s).replace('<section','<details'+(open?' open':'')+' data-fold2="'+key+'"');
    return html.slice(0,s)+head+'<summary class="fold-sum">'+html.slice(h2s,h2e+5)+'<span class="fold-car" aria-hidden="true"></span></summary>'+html.slice(h2e+5,e)+'</details>'+html.slice(e+10);
  }
  document.addEventListener("toggle",function(e){var d=e.target;if(d&&d.dataset&&d.dataset.fold2){fold2[d.dataset.fold2]=d.open;try{localStorage.setItem(FOLDK,JSON.stringify(fold2));}catch(x){}}},true);
  var _lookBase=lookHTML;
  lookHTML=function(day,isToday,overdue){var h=_lookBase(day,isToday,overdue),n=(h.match(/<li class="lk /g)||[]).length;
    if(n)h=h.replace('<small>calendar, email, hiring, tasks</small>','<small><b>'+n+'</b> things · calendar, email, hiring, tasks</small>');return foldSec(h,"look",false);};
  var _opsBase=opsHTML;opsHTML=function(day){return foldSec(_opsBase(day),"ops",false);};
  var _logBase=logHTML;
  logHTML=function(day,isToday){
    var h=_logBase(day,isToday),n=(h.match(/<li class="lk-/g)||[]).length;
    if(n>8){h=h.replace('<ul class="log log2">','<ul class="log log2'+(logAll?'':' cut')+'">');var e=h.lastIndexOf('</ul></section>');if(e>=0)h=h.slice(0,e)+'</ul><button type="button" class="tx logmore" data-logall="1">'+(logAll?'Show the newest 8':'Show all '+n)+'</button></section>'+h.slice(e+15);}
    return h;
  };
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-logall]");if(b){logAll=!logAll;render();}});
  /* jump bar */
  function jumpText(el){var h=el.querySelector("h2")||el.querySelector(".tm-n,h3")||el;var c=h.cloneNode(true);var sm=c.querySelectorAll("small,button,.fold-car");for(var i=0;i<sm.length;i++)sm[i].remove();return (c.textContent||"").replace(/\s+/g," ").trim().slice(0,32);}
  function buildJump(){
    var pg=document.querySelector(".page");if(!pg)return;
    var old=pg.querySelector(":scope > nav.jump");if(old)old.remove();
    var tops=[],isTasks=pg.classList.contains("page-tasks");
    var cands=pg.querySelectorAll("section.panel, details.panel, article.panel");
    for(var i=0;i<cands.length;i++){var el=cands[i];if(el.parentElement&&el.parentElement.closest(".panel"))continue;if(!el.querySelector("h2,h3,.tm-n"))continue;tops.push({el:el,label:jumpText(el)});}
    if(isTasks){var gs=pg.querySelectorAll(".group > .gh");for(var j=0;j<gs.length;j++){var g=gs[j].parentElement;var lab=(gs[j].querySelector(".gl")||gs[j]).cloneNode(true);var x=lab.querySelectorAll(".car,.cnt");for(var k=0;k<x.length;k++)x[k].remove();var cn=((gs[j].querySelector(".cnt")||{}).textContent||"").trim();if(cn==="0")continue;tops.push({el:g,label:(lab.textContent||"").replace(/\s+/g," ").trim().slice(0,28),cnt:(gs[j].querySelector(".cnt")||{}).textContent||""});}}
    tops=tops.filter(function(t){return t.label;});
    if(tops.length<3)return;
    var nav=document.createElement("nav");nav.className="jump";nav.setAttribute("aria-label","Jump to a section");
    var h='<span class="jump-l">Jump to</span>';
    tops.forEach(function(t,i){var id=t.el.id||("jmp-"+i);t.el.id=id;t.el.setAttribute("data-jumpt","1");h+='<button type="button" data-jumpto="'+id+'">'+esc(t.label)+(t.cnt?' <i>'+esc(t.cnt)+'</i>':'')+'</button>';});
    if(isTasks)h+='<button type="button" class="jump-x" data-foldall="1">Collapse all</button><button type="button" class="jump-x" data-foldall="0">Expand all</button>';
    nav.innerHTML=h;
    var ph=pg.querySelector(":scope > .phead");if(ph&&ph.nextSibling)pg.insertBefore(nav,ph.nextSibling);else pg.insertBefore(nav,pg.firstChild);
    var tb=document.querySelector(".topbar"),th=0;if(tb&&getComputedStyle(tb).display!=="none")th=tb.offsetHeight;nav.style.top=th+"px";
    document.documentElement.style.setProperty("--jump-off",(th+nav.offsetHeight+10)+"px");
    jumpActive();
  }
  function jumpActive(){
    var nav=document.querySelector(".page > nav.jump");if(!nav)return;var bs=nav.querySelectorAll("[data-jumpto]"),cur=null,lim=(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--jump-off"))||120)+4;
    for(var i=0;i<bs.length;i++){var el=document.getElementById(bs[i].dataset.jumpto);if(el&&el.getBoundingClientRect().top<=lim)cur=bs[i];}
    for(var j=0;j<bs.length;j++)bs[j].classList.toggle("on",bs[j]===cur);
    var tt=document.querySelector(".totop");if(tt)tt.classList.toggle("show",window.scrollY>1200);
  }
  window.addEventListener("scroll",function(){if(jumpActive._r)return;jumpActive._r=requestAnimationFrame(function(){jumpActive._r=0;jumpActive();});},{passive:true});
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-jumpto]");
    if(b){var el=document.getElementById(b.dataset.jumpto);if(!el)return;if(el.tagName==="DETAILS"&&!el.open)el.open=true;
      if(el.classList.contains("group")&&el.classList.contains("shut")){var gh=el.querySelector(".gh");if(gh&&gh.dataset.fold){setFold(gh.dataset.fold,false);render();el=document.getElementById(b.dataset.jumpto)||el;}}
      el.scrollIntoView({behavior:"smooth",block:"start"});return;}
    var f=e.target.closest&&e.target.closest("[data-foldall]");
    if(f){var shut=f.dataset.foldall==="1";(GROUPS||[]).forEach(function(g){setFold(g.key,shut);});render();return;}
    var t=e.target.closest&&e.target.closest(".totop");if(t){window.scrollTo({top:0,behavior:"smooth"});}
  });
  var _renderNav=render;
  render=function(){_renderNav.apply(this,arguments);try{buildJump();if(!document.querySelector(".totop")){var b=document.createElement("button");b.type="button";b.className="totop";b.setAttribute("aria-label","Back to top");b.textContent="↑ Top";document.body.appendChild(b);}jumpActive();}catch(e){}};
