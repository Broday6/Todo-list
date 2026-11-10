  /* ===== UI pass 2 (Nov 9, patch33; Brody: "continue to improve the ui and ux").
     1. Tasks: rows are compact until opened (title, one line of why, one line of what unblocks it). "Full details" brings it all back.
     2. Inbox: each row shows its main actions; the rest sit under More.
     3. Claude tab: "Clear in one sitting" shows 3 per group with Show all. */

  /* ---- 1. compact task rows ---- */
  var tkFull=false;try{tkFull=localStorage.getItem("ultron.tkfull")==="1";}catch(e){}
  var _tasks33=tasksHTML;
  tasksHTML=function(){
    var h=_tasks33.apply(this,arguments);
    if(!tkFull)h=h.replace('class="panel tasks-panel"','class="panel tasks-panel tk-compact"');
    return h.replace('> Show done</label>','> Show done</label><label class="toggle" title="Show every line on every task"><input type="checkbox" data-tkfull="1"'+(tkFull?' checked':'')+'> Full details</label>');
  };
  document.addEventListener("change",function(e){
    var t=e.target;if(!t||!t.dataset||!t.dataset.tkfull)return;
    tkFull=!!t.checked;try{localStorage.setItem("ultron.tkfull",tkFull?"1":"0");}catch(x){}render();
  });

  /* ---- 2. inbox rows: main actions, then More ---- */
  var mrMore={};
  var _mActs33=mActs;
  mActs=function(it){
    var raw=_mActs33(it);
    try{
      var t=document.createElement("template");t.innerHTML=raw;
      var pri=[],rest=[],keep=[];
      [].slice.call(t.content.childNodes).forEach(function(n){
        if(n.nodeType!==1)return;
        if(n.classList.contains("prog2")){keep.push(n);return;}
        var inner=n.querySelector&&n.querySelector(".cl-done");
        if(inner&&inner!==n){inner.parentNode.removeChild(inner);pri.push(inner);if(n.children.length)rest.push(n);return;}
        var txt=String(n.textContent||"").trim();
        if(n.classList.contains("pri")||n.classList.contains("cl-done")||n.hasAttribute("data-mailopen")||n.hasAttribute("data-ibrep")||/^Nudge/.test(txt))pri.push(n);
        else rest.push(n);
      });
      if(rest.length<2||!pri.length)return raw;
      var out=document.createElement("div"),key=String(it.key||"");
      pri.forEach(function(n){out.appendChild(n);});
      var d=document.createElement("details");d.className="mr-more";d.setAttribute("data-mrmore",key);if(mrMore[key])d.setAttribute("open","");
      var s=document.createElement("summary");s.className="linkbtn";s.textContent="More";d.appendChild(s);
      var box=document.createElement("div");box.className="mr-more-b";rest.forEach(function(n){box.appendChild(n);});d.appendChild(box);
      out.appendChild(d);
      keep.forEach(function(n){out.appendChild(n);});
      return out.innerHTML;
    }catch(e){return raw;}
  };
  document.addEventListener("toggle",function(e){
    var d=e.target;if(d&&d.getAttribute&&d.getAttribute("data-mrmore")!==null){if(d.open)mrMore[d.getAttribute("data-mrmore")]=1;else delete mrMore[d.getAttribute("data-mrmore")];}
  },true);

  /* ---- 3. Clear in one sitting: 3 per group, Show all ---- */
  var sitAll={};
  sitHTML=function(){
    var S=sitList();if(!S.n)return '';
    var signins=SIT_G.filter(function(g){return g.k!=="answer"&&(S.G[g.k]||[]).length;}).length;
    var h='<section class="panel sit" id="sec-sit"><h2>Clear in one sitting <small>'+S.n+' task'+(S.n===1?'':'s')+' wait on you'+(signins?' · '+signins+' sign-in'+(signins===1?'':'s'):'')+'</small></h2>';
    h+='<p class="hint">Everything Claude can’t finish alone, grouped by the one thing that clears it. Do a group in one go instead of opening each task.</p>';
    SIT_G.forEach(function(g){
      var L=S.G[g.k]||[];if(!L.length)return;
      var all=!!sitAll[g.k]||L.length<=4,show=all?L:L.slice(0,3);
      h+='<div class="sit-g"><h3>'+esc(g.n)+' <span class="stag '+(g.k==="answer"?'acc':'warn')+'">'+L.length+'</span><small>'+esc(g.s)+'</small></h3><ul>';
      show.forEach(function(t){
        var p=sitPrompt(t);
        h+='<li><div><div class="sit-t">'+esc(clip(t.title,90))+'</div><div class="sit-s">'+esc(clip(sitStep(t),170))+'</div></div><span class="sit-b">'+(p?'<a class="linkbtn" href="'+esc(p)+'" target="_blank" rel="noopener">PC prompt ↗</a>':'')+'<button type="button" class="linkbtn" data-opentask="'+esc(t.id)+'">Open</button></span></li>';
      });
      h+='</ul><div class="sit-a">';
      if(L.length>4)h+='<button type="button" class="tx" data-sitall="'+g.k+'">'+(all?'Show fewer':'Show all '+L.length)+'</button>';
      if(g.pc)h+='<button type="button" class="btn" data-sitcopy="'+g.k+'">Copy one prompt for '+(L.length===1?'this task':'all '+L.length)+'</button><span class="sit-s">Paste it into Claude on your PC after you sign in.</span>';
      if(g.k==="teams")h+='<button type="button" class="btn ghost" data-view="team">Open the Team tab</button>';
      h+='</div></div>';
    });
    return h+'</section>';
  };
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-sitall]");if(!b)return;
    var k=b.dataset.sitall;if(sitAll[k])delete sitAll[k];else sitAll[k]=1;render();
  });

  /* ---- 4. long task groups show 8, then "Show all" ---- */
  var tkAll={},TK_CAP=8;
  function tkCapApply(){
    if(view!=="tasks"||tkFull||cOnly||String(tfilter||"").trim())return;
    var groups=document.querySelectorAll("#sec-tasks .group:not(.shut)");
    [].forEach.call(groups,function(g){
      var key=(g.className.split(" ")[1]||""),ul=g.querySelector("ul.tasks");if(!ul||g.querySelector("[data-tkall]"))return;
      var rows=[].filter.call(ul.children,function(li){return li.classList&&li.classList.contains("task");});
      if(rows.length<=TK_CAP+2)return;
      var all=!!tkAll[key];
      if(!all)rows.forEach(function(li,i){if(i>=TK_CAP&&!li.classList.contains("open"))li.classList.add("tk-cap");});
      var b=document.createElement("button");b.type="button";b.className="tx tk-allbtn";b.setAttribute("data-tkall",key);
      b.textContent=all?"Show fewer":"Show all "+rows.length;
      ul.parentNode.insertBefore(b,ul.nextSibling);
    });
  }
  var _render33=render;
  render=function(){_render33.apply(this,arguments);try{tkCapApply();}catch(e){}};
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-tkall]");if(!b)return;
    var k=b.getAttribute("data-tkall");if(tkAll[k])delete tkAll[k];else tkAll[k]=1;render();
  });
