  /* ---------- Plan blocks: email and tool links, plus More info ----------
     Links come from block.links (filled by the morning build), from the tasks a
     block works on (their email, source and BugHerd links), and from tools named
     in the text (NetSuite searches, Outlook Drafts, Handshake, Merchant Center,
     and the board's own tabs). More info opens Explain and Dig deeper. */
  var NS_ACCT="362135", infoBlocks={}, bAsk={id:null,busy:false,err:""};
  var TOOLS=[
    [/\bsearch (\d{4,6})\b/gi,function(m){return {href:"https://"+NS_ACCT+".app.netsuite.com/app/common/search/searchresults.nl?searchid="+m[1],label:"NetSuite search "+m[1]};}],
    [/\bOutlook Drafts\b/i,function(){return {href:"https://outlook.office.com/mail/drafts",label:"Outlook Drafts"};}],
    [/\bHandshake\b/i,function(){return {href:"https://app.joinhandshake.com/emp/conversations",label:"Handshake"};}],
    [/\bMerchant Center\b/i,function(){return {href:"https://merchants.google.com/",label:"Merchant Center"};}],
    [/\bIndeed\b/i,function(){return {href:"https://employers.indeed.com/candidates",label:"Indeed candidates"};}],
    [/\bBugHerd\b|\bBug Herds?\b/i,function(){return {view:"bugherd",label:"BugHerd tab"};}],
    [/\bCases tab\b|^\s*Cases\b/i,function(){return {view:"cases",label:"Cases tab"};}],
    [/\bInbox section\b/i,function(){return {view:"inbox",label:"Inbox"};}],
    [/\bSales section\b|\bdaily metrics\b/i,function(){return {view:"sales",label:"Sales"};}],
    [/\bAds tab\b|\bAndrew's ads\b/i,function(){return {view:"ads",label:"Ads tab"};}],
    [/\bA\/B tests tab\b/i,function(){return {view:"abtests",label:"A/B tests tab"};}],
    [/\binterview\b|\bcandidates?\b/i,function(){return {view:"hiring",label:"Hiring tab"};}]
  ];
  function okHref(u){return typeof u==="string"&&/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(u);}
  function isMailHref(u){return /^https:\/\/outlook\.(office365|office)\.com\//.test(u||"");}
  function toolLinks(text){
    var out=[];text=String(text||"");
    TOOLS.forEach(function(r){
      var re=r[0];
      if(re.global){re.lastIndex=0;var m;while((m=re.exec(text)))out.push(r[1](m));}
      else{var m2=text.match(re);if(m2)out.push(r[1](m2));}
    });
    return out;
  }
  function blkTasks(b){return (b.taskIds||[]).map(findTask).filter(Boolean);}
  function blkLinks(b){
    var out=[],seen={};
    function add(l){if(!l)return;var k=l.href||("view:"+l.view);if(seen[k])return;if(l.href&&!okHref(l.href))return;seen[k]=1;out.push(l);}
    (Array.isArray(b.links)?b.links:[]).forEach(function(l){if(l&&l.href)add({href:l.href,label:clip(l.label||"Open",48),mail:isMailHref(l.href)});});
    blkTasks(b).forEach(function(t){
      if(t.mail&&isMailHref(t.mail.link)&&!/^Inbox triage\b/i.test(t.mail.subject||""))add({href:t.mail.link,label:"Email: "+clip(t.mail.subject||"open",44),mail:true});
      if(okHref(t.sourceLink))add({href:t.sourceLink,label:clip(t.source||"Source",36)});
      if(t.bh&&okHref(t.bh.url))add({href:t.bh.url,label:"BugHerd #"+t.bh.id});
    });
    blkTasks(b).forEach(function(t){if(t.mail&&isMailHref(t.mail.link)&&/^Inbox triage\b/i.test(t.mail.subject||""))add({href:t.mail.link,label:"Triage email",mail:true});});
    toolLinks((b.title||"")+" \n "+(b.sub||"")).forEach(function(l){if(l.view&&qBlkLink(b)&&(l.view==="cases"||l.view==="bugherd"))return;add(l);});
    return out;
  }
  function linkChip(l){
    if(l.view)return '<button type="button" class="linkbtn bl-view" data-view="'+esc(l.view)+'">'+esc(l.label)+'</button>';
    return '<a class="linkbtn'+(l.mail?' bl-mail':' bl-tool')+'" href="'+esc(l.href)+'" target="_blank" rel="noopener">'+(l.mail?'<i aria-hidden="true">✉</i> ':'<i aria-hidden="true">↗</i> ')+esc(l.label)+'</a>';
  }
  function blkLinksHTML(b){
    var ls=blkLinks(b),open=!!infoBlocks[b.id];
    var h='<div class="blinks">'+ls.map(linkChip).join("")+(b.meeting&&!ls.length?'':'<button type="button" class="linkbtn bl-info" data-binfo="'+esc(b.id)+'" aria-expanded="'+open+'">'+(open?'Less':'More info')+'</button>')+'</div>';
    if(open)h+=blkInfoHTML(b);
    return h;
  }
  function blkInfoHTML(b){
    var ts=blkTasks(b),busy=bAsk.busy&&bAsk.id===b.id;
    var h='<div class="binfo">';
    if(ts.length){
      h+='<h4>Tasks in this block</h4><ul class="bitasks">'+ts.map(function(t){var w=whereFrom(t);return '<li><button type="button" class="linkbtn" data-opentask="'+esc(t.id)+'">'+esc(clip(t.title,70))+'</button><span>'+esc(w.length?w.join(" · "):"Source not recorded")+'</span></li>';}).join("")+'</ul>';
    }else h+='<p class="hint" style="margin:0 0 6px">No task is linked to this block'+(isRoutine(b)?' (it’s a daily routine).':'. Dig deeper finds where it came from.')+'</p>';
    var th=b.thread||[];
    if(th.length)h+='<ul class="msgs">'+th.slice(-6).map(function(m){return '<li class="'+(m.role==="claude"?"claude":"user")+'"><span class="who">'+(m.role==="claude"?"Claude":"You")+' · '+esc(msgTime(m.t))+'</span>'+esc(m.text)+'</li>';}).join("")+'</ul>';
    if(busy)h+='<div class="thinking">Thinking…</div>';
    if(bAsk.err&&bAsk.id===b.id)h+='<div class="askerr">'+esc(bAsk.err)+'</div>';
    h+='<div class="cacts"><button type="button" class="btn" data-bexplain="'+esc(b.id)+'"'+(sampler&&!bAsk.busy?'':' disabled')+'>'+(busy?'Thinking…':'Explain this')+'</button>';
    h+='<button type="button" class="btn ghost" data-bdig="'+esc(b.id)+'"'+(mcp&&!live.chatSending?'':' disabled')+'>Dig deeper (email, Teams, Notion)</button></div>';
    if(b.digSentAt)h+='<p class="hint" style="margin:8px 0 0">Sent to Claude '+esc(msgTime(b.digSentAt))+'. The answer lands here and in <button type="button" class="linkbtn" data-view="chat">Live chat</button> in 1 to 2 minutes.</p>';
    return h+'</div>';
  }
  function blkCtx(b){
    return {block:{id:b.id,start:b.start,end:b.end,title:b.title,sub:b.sub,meeting:!!b.meeting,top:!!b.top,links:blkLinks(b).map(function(l){return l.label;})},tasks:blkTasks(b).map(taskCtx)};
  }
  function runBlkExplain(id){
    var lb=locateBlock(id);if(!lb||!sampler||bAsk.busy)return;var b=lb.block;
    bAsk={id:id,busy:true,err:""};if(!b.thread)b.thread=[];
    b.thread.push({role:"user",text:"What does this mean?",t:new Date().toISOString()});render();
    var p=["You are the assistant inside Brody’s work board. Today is "+todayISO()+".","Brody asked what this plan block means. In plain words: what he is meant to do, where it came from (which email, person or tool), why it matters, and what done looks like. Name the email subjects and tools from the data. If the source isn't in the data, say so and tell him to press Dig deeper.","","DATA:",JSON.stringify(blkCtx(b)),"","Reply with ONLY one JSON object: {\"reply\":\"...\"}"].join("\n");
    sampler.json(p,{modelTier:"default",cache:false}).then(function(res){
      var r=(res&&typeof res.reply==="string")?clip(res.reply,4000):"";
      bAsk.busy=false;if(r)b.thread.push({role:"claude",text:r,t:new Date().toISOString()});else bAsk.err="Claude sent an empty answer.";save();
    }).catch(function(e){bAsk.busy=false;bAsk.err=sampleErr(e);render();});
  }
  function blkDigMsg(b){
    var ts=blkTasks(b);
    return "Dig deeper on plan block "+b.id+" ("+b.start+" “"+b.title+"”). Find the emails, Teams messages, Notion pages and tools it refers to, then tell me in plain words what it means and the next step. Put your answer in Live chat and push the same into that block's thread (state.days[today].blocks, role claude). Also add each source you find to block.links as {label, href} using the email's Outlook webLink. Change nothing else on the plan."+
      "\n\nBlock text: "+clip(b.sub||"",500)+(ts.length?"\nLinked tasks: "+ts.map(function(t){return t.id+" “"+t.title+"”";}).join("; "):"");
  }
  document.addEventListener("click",function(e){
    var i=e.target.closest("[data-binfo]");if(i){infoBlocks[i.dataset.binfo]=!infoBlocks[i.dataset.binfo];render();return;}
    var x=e.target.closest("[data-bexplain]");if(x){runBlkExplain(x.dataset.bexplain);return;}
    var d=e.target.closest("[data-bdig]");
    if(d){var lb=locateBlock(d.dataset.bdig);if(!lb||!mcp||live.chatSending)return;lb.block.digSentAt=new Date().toISOString();chSend(blkDigMsg(lb.block));return;}
  });

