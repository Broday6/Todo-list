  /* ===== Autonomy that moves by itself, and a loud alert when a key routine is off (Nov 10, patch35).
     Brody: "when it works a handful of times I would love it to switch to be fully automated".
     1. After 5 clean runs in a row (counted from the last time the mode changed) a playbook moves straight to the
        highest mode it is allowed (Auto, or Plan first for NetSuite, ads and pricing). Two redos in the last five
        step it back one. It happens when Brody saves something (reviews a result, ticks a task), never on load.
        Auto still means drafts: nothing is sent and nothing changes in NetSuite, Miva or ads without his OK.
     2. A switched-off routine the board depends on shows as a problem on Today, not as a grey "Turned off". */
  var AUTO_NEED=5;
  function pbBase(p,R){
    if(!p.lb||p.lb.mode!==p.mode){p.lb={mode:p.mode,n:R.length};}
    if(p.lb.n>R.length)p.lb.n=R.length;
    return p.lb.n;
  }
  function pbProgress(p){
    var R=pbRecord(p),base=pbBase(p,R),S=R.slice(base),streak=0,i=S.length-1;for(;i>=0&&S[i].clean;i--)streak++;
    var redos=S.slice(-5).filter(function(x){return x.redo;}).length,idx=AP_ORDER.indexOf(p.mode),cap=AP_ORDER.indexOf(apCap(p));
    return {streak:streak,redos:redos,idx:idx,cap:cap,top:AP_ORDER[cap],canUp:idx>=0&&idx<cap,canDown:idx>0};
  }
  function pbAutoLadder(){
    if(readOnly||state.autoLadder===false)return [];
    var moved=[];
    pbList().forEach(function(p){
      var g=pbProgress(p),to=null,why="";
      if(g.redos>=2&&g.canDown){to=AP_ORDER[g.idx-1];why="2 redos in the last 5 runs";}
      else if(g.streak>=AUTO_NEED&&g.canUp){to=g.top;why=g.streak+" clean runs in a row";}
      if(!to||to===p.mode)return;
      var from=p.mode;p.mode=to;p.v=(p.v||1)+1;p.updated=apNow();p.ladder={from:from,to:to,t:apNow(),by:"auto",why:why};
      p.lb={mode:to,n:pbRecord(p).length};
      moved.push({name:p.name,from:from,to:to,why:why});
    });
    if(moved.length){
      var d=state.days&&state.days[state.today];
      moved.forEach(function(m){
        var txt="Autonomy: "+m.name+" moved from "+modeName(m.from)+" to "+modeName(m.to)+" ("+m.why+").";
        if(d){(d.log=d.log||[]).push({t:new Date().toTimeString().slice(0,5),text:txt,kind:"claude",by:"Ultron"});}
      });
      setTimeout(function(){chip(moved.length===1?(moved[0].name+" is now "+modeName(moved[0].to)+": "+moved[0].why+"."):(moved.length+" playbooks changed mode. See Control room, Playbooks."));},1800);
    }
    return moved;
  }
  var _save35=save;
  save=function(){try{pbAutoLadder();}catch(e){}return _save35.apply(this,arguments);};
  var _pbEd35=pbEditorHTML;
  pbEditorHTML=function(){
    var h=_pbEd35(),on=state.autoLadder!==false;
    var bar='<div class="al-bar"><label class="toggle"><input type="checkbox" data-autoladder="1"'+(on?' checked':'')+'> Move playbooks up by themselves</label><span class="tm-m">After '+AUTO_NEED+' clean runs in a row a playbook moves to '+'the highest mode it is allowed; 2 redos in the last 5 step it back. NetSuite, ads and pricing stop at Plan first. Auto still saves drafts only: nothing is sent or changed without you.</span></div>';
    var i=h.indexOf('<ul class="pb-list">');
    return i<0?h:h.slice(0,i)+bar+h.slice(i);
  };
  document.addEventListener("change",function(e){
    var t=e.target;if(!t||!t.dataset||!t.dataset.autoladder)return;
    state.autoLadder=!!t.checked;save();chip(state.autoLadder?"Playbooks will move up by themselves.":"Playbooks only change mode when you change them.");
  });
  function pbProgInject(){
    if(view!=="auto"||ctlTab!=="playbooks")return;
    [].forEach.call(document.querySelectorAll("li.pb-card"),function(li){
      if(li.querySelector(".al-prog"))return;
      var b=li.querySelector("[data-pbmode]");if(!b)return;var p=pbById(String(b.getAttribute("data-pbmode")).split("|")[0]);if(!p)return;
      var g=pbProgress(p),txt="";
      if(state.autoLadder===false)txt="";
      else if(!g.canUp)txt=p.mode==="auto"?"Fully automatic.":"At its highest allowed mode ("+modeName(g.top)+").";
      else txt=Math.min(g.streak,AUTO_NEED)+" of "+AUTO_NEED+" clean runs toward "+modeName(g.top)+".";
      if(p.ladder&&p.ladder.by==="auto"&&p.ladder.t)txt+=" Moved by itself "+shortDate(String(p.ladder.t).slice(0,10))+": "+(p.ladder.why||"")+".";
      if(!txt)return;
      var d=document.createElement("div");d.className="al-prog";d.textContent=txt;
      var used=li.querySelector(".pb-used");(used||li).insertAdjacentElement("afterend",d);
    });
  }
  var _render35=render;
  render=function(){_render35.apply(this,arguments);try{pbProgInject();}catch(e){}};

  /* ---- 2. a key routine that is switched off is a problem ---- */
  var CRIT35={"trig_01JEYvWdaH6L4s8WcDsLrssJ":1,"trig_01TEeBTBTmPV3MxApZH2aeMr":1,"trig_01UqcLyToyZm3yyc7yQyUGdk":1,"trig_01T99AD5i28qLXvSnPtoe66k":1};
  var _auState35=auState;
  auState=function(r){
    var s=_auState35(r),x=r.trig&&AU_LAST[r.trig];
    if(r.trig&&CRIT35[r.trig]&&x&&x.enabled===false&&r.status!=="paused")return {k:"bad",t:"Switched off. Turn it back on",on:s&&s.on};
    return s;
  };
