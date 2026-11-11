  /* ===== Promotions tab guard (Nov 11, patch54; Brody: "The promotion tab no longer works"). An hourly run wrote
     promo pm12's sites as the text "AD, PC" instead of a list, and the tab crashed on x.sites.join. Text sites, owners
     and to-dos are turned into the right shape before the tab draws, so one bad record can't take the tab down. */
  function pm54Fix(){
    var P=state.promos,L=P&&(Array.isArray(P)?P:P.items);if(!Array.isArray(L))return;
    L.forEach(function(x){if(!x)return;
      if(typeof x.sites==="string")x.sites=x.sites.split(/\s*[,/&+]\s*|\s+and\s+/).filter(Boolean);
      else if(x.sites!=null&&!Array.isArray(x.sites))x.sites=[];
      if(typeof x.todo==="string")x.todo=x.todo?[{text:x.todo}]:[];
      else if(x.todo!=null&&!Array.isArray(x.todo))x.todo=[];
      if(Array.isArray(x.todo))x.todo=x.todo.map(function(t){return typeof t==="string"?{text:t}:t;}).filter(Boolean);
    });
  }
  var _render54=render;
  render=function(){try{pm54Fix();}catch(e){}return _render54.apply(this,arguments);};

