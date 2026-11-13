  /* ===== Sidebar: all tab groups open (Nov 13, patch55; Brody: "Some of the tabs are missing"). patch44 started the
     Plans and Business groups folded, which hid Sales, Hiring, Promotions, Strety, A/B tests, Ads and the G5 plan.
     Every group now starts open; a group Brody folds himself stays folded. Old saved folds are cleared once. */
  try{
    if(!localStorage.getItem("bb.nav55")){localStorage.removeItem("bb.navshut");localStorage.setItem("bb.nav55","1");}
    if(!localStorage.getItem("bb.navshut"))NAVSHUT44={};
  }catch(e){NAVSHUT44={};}

