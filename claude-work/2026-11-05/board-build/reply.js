  /* Claude's answer on the card (Nov 5, Brody: "I got nothing with the bugherd one"). The work landed in
     Live chat and the thread, but the card only said "see the thread", so it looked like nothing came back. */
  function taskReplies(t){
    var re=new RegExp("on task "+String(t.id).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b"),ids={},out=[];
    chItems().forEach(function(m){if(m.role==="user"&&re.test(m.text||""))ids[m.id]=1;});
    chItems().forEach(function(m){if(m.role==="claude"&&m.re&&ids[m.re])out.push({t:m.t,text:m.text,draft:m.draft});});
    (t.thread||[]).forEach(function(m){if(m.role==="claude"&&!out.some(function(o){return o.t===m.t;}))out.push({t:m.t,text:m.text});});
    out.sort(function(a,b){return a.t<b.t?-1:a.t>b.t?1:0;});
    return out;
  }
  function bestReply(t){
    var rs=taskReplies(t);if(!rs.length)return null;
    var since=t.answeredAt||"";for(var i=0;i<rs.length;i++)if(!since||rs[i].t>=since){var x=rs[i];if(!x.draft){for(var j=rs.length-1;j>=0;j--)if(rs[j].draft){x={t:x.t,text:x.text,draft:rs[j].draft};break;}}return x;}
    return rs[rs.length-1];
  }
  function bhReplyHTML(t){
    var x=bestReply(t);if(!x)return '';
    var d=x.draft,ok=d&&/^https:\/\/outlook\.(office365|office)\.com\//.test(String(d.link||""));
    return '<div class="bhrep"><b>Claude’s answer · '+esc(msgTime(x.t))+'</b><div class="bhrep-t">'+esc(x.text).replace(/\n/g,"<br>")+'</div>'
      +(ok?'<div class="bhrep-d">Draft ready: '+esc(d.subject||"")+(d.toNames?' to '+esc([].concat(d.toNames).join(", ")):'')+' <a class="linkbtn" href="'+esc(d.link)+'" target="_blank" rel="noopener">Open in Outlook</a></div>':'')+'</div>';
  }
  var _ansSendBase=ansSendHTML;
  ansSendHTML=function(t){
    var h=_ansSendBase(t).replace('. See the task thread.</span>','. Its answer is below.</span>');
    return h+bhReplyHTML(t);
  };
  /* don't resend an answer Claude already worked (each resend is a full run) */
  document.addEventListener("click",function(e){
    var s=e.target.closest&&e.target.closest("[data-bhsend]");if(!s)return;
    var t=findTask(s.dataset.bhsend);if(!t)return;
    var li=s.closest("li"),ta=li&&li.querySelector('textarea[data-bhq]'),v=String(ta?ta.value:(t.answer||"")).trim();
    if(v&&v===t.answer&&t.answerWorkedAt&&t.answeredAt&&t.answerWorkedAt>=t.answeredAt&&bestReply(t)){
      e.stopImmediatePropagation();e.preventDefault();chip("Claude already worked this answer. Its reply is on the card. Change your answer to send a new one.");
    }
  },true);
  /* progress bar: also finish when the board itself shows the reply, and never sit on "waiting" forever */
  function runAnswered(r){
    try{
      if(r.item&&chItems().some(function(m){return m.role==="claude"&&m.re===r.item;}))return true;
      var mm=/^(ans|dig|do):(.+)$/.exec(r.origin||"");if(mm){var t=findTask(mm[2]);var w=t&&(mm[1]==="ans"?t.answerWorkedAt:null);if(w&&Date.parse(w)>=r.at-60000)return true;
        if(t&&(t.thread||[]).some(function(m){return m.role==="claude"&&Date.parse(m.t)>=r.at-60000;}))return true;}
    }catch(e){}
    return false;
  }
  var _progStateBase=progState;
  progState=function(key){
    var r=live.chatRun;
    if(r&&r.origin===key&&!r.done&&runAnswered(r)){r.done=true;r.fin=r.fin||new Date().toISOString();r.onBoard=true;runPersist();}
    var s=_progStateBase(key);
    if(s&&s.done&&r&&r.onBoard)s.txt="Done. Claude’s answer is on the board.";
    else if(s&&!s.done&&r&&Date.now()-r.at>8*60000)s.txt="No finish signal after 8 minutes. Check Live chat; the answer may already be there.";
    return s;
  };
