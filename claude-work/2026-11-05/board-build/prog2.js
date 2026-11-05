  /* The board reloads whenever anyone saves it (your own Send included), which used to
     wipe the progress bar. Keep the run in this browser and pick it back up after a reload. */
  var RUNKEY="ultron.run";
  function runPersist(){try{var r=live.chatRun;if(r&&r.origin)localStorage.setItem(RUNKEY,JSON.stringify(r));}catch(e){}}
  setTimeout(function(){
    try{var r=JSON.parse(localStorage.getItem(RUNKEY)||"null");
      if(r&&r.origin&&!live.chatRun&&Date.now()-r.at<20*60000){live.chatRun=r;liveRender();if(typeof schedPoll==="function")schedPoll(1500);}
    }catch(e){}
  },0);
  setInterval(runPersist,1000);

