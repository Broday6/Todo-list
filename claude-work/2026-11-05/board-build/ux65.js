  /* ===== Speed: ticking a task felt slow (Nov 23, patch65; Brody: "there is a big delay when updating tasks within my todo lists")
     Measured: one tick on Tasks cost about 0.7 s of redraw, most of it wasted.
     1. The tick shows at once: save() now draws on the next animation frame instead of before the browser can paint,
        and quick ticks in a row share one redraw.
     2. Pages that the new look replaces (Today, Tasks, Hiring, Sales, This week) no longer build the old page underneath
        first just to throw it away.
     3. The hidden "Jump to" bar is not rebuilt in the new look.
     4. Date labels are cached (they were re-formatted hundreds of times per redraw). */
  var SKIP65=false;
  function skip65(f){return function(){return SKIP65?'':f.apply(this,arguments);};}
  tasksHTML=skip65(tasksHTML);
  cuHTML=skip65(cuHTML);
  needsHTML=skip65(needsHTML);
  hiringHTML=skip65(hiringHTML);
  salesTabHTML=skip65(salesTabHTML);
  setupHTML=skip65(setupHTML);
  focusHTML=skip65(focusHTML);
  glanceHTML=skip65(glanceHTML);
  planHTML=skip65(planHTML);
  nyTopHTML=skip65(nyTopHTML);
  lookHTML=skip65(lookHTML);
  opsHTML=skip65(opsHTML);
  srcStripHTML=skip65(srcStripHTML);
  function replaced65(){
    if(!D63.on)return false;
    if(view==="today")return true;
    if(view==="tasks")return !(P64.tl==="all"&&!P64.q.trim());
    return view==="hiring"||view==="sales"||view==="setup";
  }
  var _buildJump65=buildJump;
  buildJump=function(){if(D63.on)return;return _buildJump65.apply(this,arguments);};
  (function(){
    var sd=shortDate,fd=fmtDate,rw=rcWhen,cs={},cf={},cr={},crMin=0;
    shortDate=function(iso){var k=String(iso);return k in cs?cs[k]:(cs[k]=sd(iso));};
    fmtDate=function(iso){var k=String(iso);return k in cf?cf[k]:(cf[k]=fd(iso));};
    rcWhen=function(iso){var m=Math.floor(Date.now()/60000);if(m!==crMin){cr={};crMin=m;}var k=String(iso);return k in cr?cr[k]:(cr[k]=rw(iso));};
  })();
  var _render65=render,DEFER65=false,PEND65=false;
  render=function(){
    if(DEFER65){if(!PEND65){PEND65=true;(window.requestAnimationFrame||setTimeout)(function(){PEND65=false;render();});}return;}
    SKIP65=replaced65();
    if(SKIP65&&view==="today"){try{auFetchLast();}catch(e){}} /* the skipped nyTopHTML used to start the routine status check */
    try{return _render65.apply(this,arguments);}finally{SKIP65=false;}
  };
  /* the page-replacing wrappers call these builders after the base render, so they must see SKIP65 off: they do,
     because SKIP65 is only true while the base render runs (patch63/64 replace the page after it returns) */
  var _save65=save;
  save=function(){DEFER65=true;try{return _save65.apply(this,arguments);}finally{DEFER65=false;}};
