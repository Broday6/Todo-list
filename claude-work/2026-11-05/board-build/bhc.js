  /* ---------- Done on a BugHerd ticket closes it in BugHerd too (Brody, Nov 5) ----------
     Ticking Done marks task.bh.closeAsk. The "Ultron — BugHerd close" scheduled task on Brody's PC opens each
     queued ticket with Claude in Chrome, sets it to Done, and writes bh.closedAt (or bh.closeErr). */
  function bhCloseQueue(t){
    t.bh.closeAsk={t:new Date().toISOString()};delete t.bh.closeErr;delete t.bh.closedAt;
  }
  function bhCloseTag(t){
    if(!t||!t.bh||!t.bh.closeAsk)return '';
    if(t.bh.closedAt)return '<span class="badge done">Closed in BugHerd</span>';
    if(t.bh.closeErr)return '<span class="badge over" title="'+esc(t.bh.closeErr)+'">Not closed in BugHerd</span>';
    return '<span class="badge soon" title="Your PC closes it in BugHerd with Claude in Chrome at its next run">Queued to close in BugHerd</span>';
  }

