  /* ===== Board crash guard (Nov 19, patch57; Brody: "THE BOARD IS CHRASHED ... this should never happen").
     Cause: a writer outside the page (the PC worker's Handshake run, and a Barron copy run) saved a task receipt with
     "where" and "did" as plain text instead of lists. The receipt drawer called w.map on text, threw, and the whole
     page rendered blank. Same failure as Nov 11. Fix: every receipt (and promo) is put in the right shape before each
     draw, and if a draw still throws, the page repairs the data once and retries, then shows a visible error card
     instead of a blank screen. One bad record can no longer take the board down. */
  function rc57List(v){if(v==null||v==="")return[];if(Array.isArray(v))return v;if(typeof v==="string")return v.split(/\s*\n+\s*|\s*;\s+/).filter(Boolean);return[v];}
  function rc57Where(v){return rc57List(v).map(function(x){
    if(typeof x==="string"){var u=(x.match(/https?:\/\/\S+/)||[""])[0];return{label:x.replace(u,"").trim()||x,url:u};}
    return x&&typeof x==="object"?x:{label:String(x),url:""};});}
  function rc57Fix(r){if(!r||typeof r!=="object")return;
    ["did","unsure"].forEach(function(k){if(k in r&&!Array.isArray(r[k]))r[k]=rc57List(r[k]).map(String);});
    if("where" in r)r.where=rc57Where(r.where);
    if(Array.isArray(r.did))r.did=r.did.map(function(x){return typeof x==="string"?x:(x&&x.text)||JSON.stringify(x);});}
  function board57Fix(){
    (state.tasks||[]).forEach(function(t){if(!t)return;rc57Fix(t.receipt);
      if(Array.isArray(t.receipts))t.receipts.forEach(rc57Fix);
      if(t.thread!=null&&!Array.isArray(t.thread))t.thread=[];
      if(t.taskIds!=null&&!Array.isArray(t.taskIds))t.taskIds=rc57List(t.taskIds);});
    var D=state.days||{};Object.keys(D).forEach(function(k){var d=D[k];if(!d)return;
      if(d.blocks!=null&&!Array.isArray(d.blocks))d.blocks=[];
      (d.blocks||[]).forEach(function(b){if(b&&b.taskIds!=null&&!Array.isArray(b.taskIds))b.taskIds=rc57List(b.taskIds);rc57Fix(b&&b.receipt);});
      if(d.log!=null&&!Array.isArray(d.log))d.log=[];});
    try{if(typeof pm54Fix==="function")pm54Fix();}catch(e){}
  }
  var _render57=render,_r57fail=0;
  render=function(){
    try{board57Fix();}catch(e){}
    try{var out=_render57.apply(this,arguments);_r57fail=0;return out;}
    catch(e){
      console.error("Ultron render failed, repairing and retrying:",e);
      try{board57Fix();return _render57.apply(this,arguments);}catch(e2){
        _r57fail++;
        var app=document.getElementById("app")||document.body;
        var msg='<div style="max-width:720px;margin:40px auto;padding:20px 22px;border:1px solid #C42F1C;border-radius:12px;background:#FCE8E4;color:#0F1B33;font:15px system-ui,sans-serif">'+
          '<b>Ultron hit a data problem and stopped drawing.</b><p style="margin:8px 0 0">'+String(e2&&e2.message||e2).replace(/[<>&]/g,"")+'</p>'+
          '<p style="margin:8px 0 0;color:#5A6781">Your data is safe. Tell Claude "the board is crashed" and it will fix the record.</p></div>';
        try{var host=document.querySelector(".wrap")||app;host.insertAdjacentHTML("afterbegin",msg);}catch(e3){}
      }
    }
  };
