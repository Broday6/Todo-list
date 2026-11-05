  /* Never lose a tap (Nov 5, Brody: "when I am taking action in the app it is not properly registering").
     A save that clashes with a routine's newer publish used to be dropped silently. Now each save records
     what Brody changed (a diff against the version this page loaded) in this browser; after the reload,
     those exact changes are re-applied onto the newer board and saved again. */
  var PENDKEY="ultron.pending",PEND_BASE=null;
  try{PEND_BASE=JSON.stringify(state);}catch(e){}
  function pIsIdArr(a){return Array.isArray(a)&&a.length>0&&a.every(function(x){return x&&typeof x==="object"&&!Array.isArray(x)&&x.id!=null;});}
  function pDiff(b,m,path,ops){
    if(JSON.stringify(b)===JSON.stringify(m))return;
    var bo=b&&typeof b==="object"&&!Array.isArray(b),mo=m&&typeof m==="object"&&!Array.isArray(m);
    if(bo&&mo){
      Object.keys(m).forEach(function(k){if(!(k in b))ops.push({p:path.concat([k]),o:"set",v:m[k]});else pDiff(b[k],m[k],path.concat([k]),ops);});
      Object.keys(b).forEach(function(k){if(!(k in m))ops.push({p:path.concat([k]),o:"del"});});
      return;
    }
    if(Array.isArray(b)&&Array.isArray(m)&&(pIsIdArr(b)||b.length===0)&&(pIsIdArr(m)||m.length===0)&&(b.length||m.length)){
      var bi={};b.forEach(function(x){bi[x.id]=x;});var mi={};
      m.forEach(function(x){mi[x.id]=1;if(bi[x.id])pDiff(bi[x.id],x,path.concat([{id:x.id}]),ops);else ops.push({p:path,o:"add",v:x});});
      b.forEach(function(x){if(!mi[x.id])ops.push({p:path,o:"rm",id:x.id});});
      return;
    }
    if(Array.isArray(b)&&Array.isArray(m)&&m.length>b.length&&JSON.stringify(m.slice(0,b.length))===JSON.stringify(b)){ops.push({p:path,o:"push",v:m.slice(b.length)});return;}
    ops.push({p:path,o:"set",v:m});
  }
  function pWalk(root,path){
    var cur=root;
    for(var i=0;i<path.length;i++){
      var k=path[i];if(cur==null||typeof cur!=="object")return undefined;
      if(k&&typeof k==="object"){if(!Array.isArray(cur))return undefined;var f=null;for(var j=0;j<cur.length;j++)if(cur[j]&&cur[j].id===k.id){f=cur[j];break;}cur=f;}
      else cur=cur[k];
    }
    return cur;
  }
  function pApply(root,ops){
    var n=0;
    ops.forEach(function(op){
      if(!op.p)return;
      if(op.o==="push"){var pa=pWalk(root,op.p);if(!Array.isArray(pa))return;op.v.forEach(function(x){var js=JSON.stringify(x);if(!pa.some(function(y){return JSON.stringify(y)===js;})){pa.push(x);n++;}});return;}
      if(op.o==="add"||op.o==="rm"){var arr=pWalk(root,op.p);if(!Array.isArray(arr))return;
        if(op.o==="add"){if(!arr.some(function(x){return x&&x.id===op.v.id;})){arr.push(op.v);n++;}}
        else{for(var i=arr.length-1;i>=0;i--)if(arr[i]&&arr[i].id===op.id){arr.splice(i,1);n++;}}
        return;}
      if(!op.p.length)return;
      var par=pWalk(root,op.p.slice(0,-1)),k=op.p[op.p.length-1];
      if(par==null||typeof par!=="object"||(k&&typeof k==="object"))return;
      if(op.o==="del"){if(k in par){delete par[k];n++;}}
      else if(JSON.stringify(par[k])!==JSON.stringify(op.v)){par[k]=op.v;n++;}
    });
    return n;
  }
  function pendMark(){
    if(!PEND_BASE)return;
    try{var ops=[];pDiff(JSON.parse(PEND_BASE),JSON.parse(JSON.stringify(state)),[],ops);
      ops=ops.filter(function(o){return !(o.p.length===1&&o.p[0]==="updated");});
      if(ops.length)localStorage.setItem(PENDKEY,JSON.stringify({at:Date.now(),ops:ops}));}catch(e){}
  }
  function pendDone(){try{localStorage.removeItem(PENDKEY);}catch(e){}try{PEND_BASE=JSON.stringify(state);}catch(e){}}
  (function(){
    var pend=null;try{pend=JSON.parse(localStorage.getItem(PENDKEY)||"null");}catch(e){}
    if(!pend||!pend.ops||Date.now()-pend.at>2*3600000){try{localStorage.removeItem(PENDKEY);}catch(e){}return;}
    var n=0;try{n=pApply(state,pend.ops);}catch(e){}
    if(!n){try{localStorage.removeItem(PENDKEY);}catch(e){}return;}
    var tries=0;(function go(){
      if(art){save();setTimeout(function(){chip("Your last change clashed with an update. It’s re-applied and saved.");},1200);}
      else if(++tries<40)setTimeout(go,250);
    })();
  })();
