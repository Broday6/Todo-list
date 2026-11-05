  /* Live last runs (Nov 5): read each routine's real last fire from get_trigger when the Automations tab opens, so the tab never goes stale. */
  var AU_LAST={},auLastBusy=false,auLastAt=0;
  function auCT(iso){try{return new Date(iso).toLocaleDateString("en-CA",{timeZone:"America/Chicago"});}catch(e){return String(iso).slice(0,10);}}
  function auFetchLast(){
    if(auLastBusy||!mcp||Date.now()-auLastAt<600000)return;
    var ids=[];(au().routines||[]).forEach(function(r){if(r.trig&&ids.indexOf(r.trig)<0)ids.push(r.trig);});
    if(!ids.length)return;auLastBusy=true;auLastAt=Date.now();
    var i=0,got=0;
    (function next(){
      if(i>=ids.length){auLastBusy=false;if(got&&view==="auto")render();return;}
      var id=ids[i++];
      mcp.callTool(CCR,"get_trigger",{trigger_id:id},{cache:false}).then(function(res){
        var p=ccrP(res),t=p&&(p.trigger||p);
        if(t&&typeof t==="object"){var lr=t.last_run||{},f=lr.fired_at||t.last_fired_at||"";AU_LAST[id]={on:f?auCT(f):"",at:f,st:String(lr.status||""),enabled:t.enabled!==false};got++;}
      },function(){}).then(function(){setTimeout(next,150);});
    })();
  }
  var _auLiveBase=auLive;
  auLive=function(r){
    var lv=_auLiveBase(r),x=r.trig&&AU_LAST[r.trig];
    if(x&&x.on&&(!lv.on||x.on>=lv.on))lv={on:x.on,ok:/FAIL|ABANDON/.test(x.st)?false:null};
    return lv;
  };
  var _auStateBase=auState;
  auState=function(r){
    var x=r.trig&&AU_LAST[r.trig];
    if(r.retire){var lv=auLive(r);return {k:"bad",t:(x&&x.enabled===false)?"Paused, thanks":"Still running: pause it",on:lv.on};}
    if(x&&x.enabled===false&&r.status!=="paused")return {k:"mut",t:"Turned off",on:auLive(r).on};
    return _auStateBase(r);
  };
  var _autoBase=autoHTML;
  autoHTML=function(){
    auFetchLast();
    var h=_autoBase();
    if(Object.keys(AU_LAST).length)h=h.replace('<span class="au-legend">','<span class="au-legend">Last runs read live · ');
    return h;
  };
