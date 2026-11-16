import json,re,sys
s=json.load(open('s.json'));T={t['id']:t for t in s['tasks']}
TODAY='2026-11-16';NOW='2026-11-16T14:40:00.000Z'
def ok(i):return i if i in T else None
G5=[t['id'] for t in s['tasks'] if t['group']=='g5q1' and t['id'].startswith('g5q1')]
G5AD=[t['id'] for t in s['tasks'] if t['id'].startswith('g5ad-')]
MC=[i for i in ['abt-02','abt-03','abt-w2-0','abt-w2-1','abt-w2-2','mcf-01','mcf-03','mcf-04','mcf-06','mcf-07'] if i in T]
ALERT=[i for i in ['mc-2026-11-11','al-site_ad-20261109','al-site_miva-20261109','al-site_ekena-20261109','al-default_variant-20261029','al-category_images-20261102','al-kit_location-20261111'] if i in T]
HIRE=[i for i in ['hire1116','t11','t7fp22','w1','hr1109-dc'] if i in T]
wp={"weekOf":"2026-11-16","builtAt":NOW,"showOn":TODAY,
 "away":{"from":"2026-11-12","to":"2026-11-13","label":"Thu Nov 12 – Fri Nov 13"},
 "headline":"You were out Thursday and Friday. Nothing broke, but hiring is the most time-sensitive thing this week: two interviews today, two more Tuesday, two strong candidates waiting since Nov 10, and an offer you planned for today. Black Friday is next week, and four G5 November items are overdue.",
 "top":["Hiring: send Regina's and Maneesha's invites, interview Ashanti at 10:00, decide on an offer","Black Friday: get the AD sale email and the Advaning promo pricing moving (due Nov 23–24)","G5 November: re-date or finish the 5 overdue items, and the 10 wrong facts due Friday"],
 "catchup":[
  {"text":"Microsoft 365 was down for Claude Thursday from about 11:20 to Friday morning, so Thursday's order emails stopped arriving. Last week shows $1,125,174 (-20%), but it's understated; check NetSuite for the real number.","tone":"warn","view":"sales","viewLabel":"Sales"},
  {"who":"Daniel","text":"Asked if Google Analytics Task Assistant is worth a look. Claude already drafted a reply; it's in your Outlook Drafts.","taskId":ok("in1116-1"),"tone":"acc"},
  {"who":"Daniel","text":"TimberCraft framed shutters: all sites will show the 3/4\" board vs the full 1 1/2\" depth (Ryan raised it). Algolia is on hold for a few weeks. He wants to go after Lynn Cove Foundry's customers at 25% less."},
  {"who":"Daniel","text":"Still hasn't confirmed whether Simon's weight calculator is right for the Heritage U-beams (you asked Nov 11).","tone":"warn"},
  {"who":"Ethan","text":"Waiting since Nov 11 on the PVC Brackets descriptions and category page; you told him you'd do it. He also said \"let's chat Monday\".","taskId":ok("in1112-1"),"tone":"warn"},
  {"who":"Cases","text":"4 new case alerts from Brian (CW Ohio, AFCO, Alpha Systems, Flex Trim East); 6 cases are open now.","view":"cases","viewLabel":"Cases"},
  {"who":"NetSuite","text":"The 9,811-row Beams Marketing categories import expired Friday at 5:00 with nothing imported. The 189 Kit rows are also stopped at Save & Run. Both need your go in Approvals.","taskId":ok("mc-2026-11-11"),"view":"approvals","viewLabel":"Approvals","tone":"warn"},
  {"who":"You","text":"The scheduled week wrap-up went to Daniel and Ethan Friday at 1:16; you told them you meant to cancel it this week."},
  {"who":"Team","text":"Lauren is out Thu–Fri this week (back Mon Nov 23) and Fri Dec 4–Mon Dec 7. Thanksgiving potluck Fri Nov 20 at noon."}],
 "timeSensitive":[
  {"when":"2026-11-16T10:00","text":"Ashanti Yow, in-person interview (Creative Lounge)","sub":"Tier A. Daniel, Ethan, Alejandra, Hayden, Lauren and Andrew join.","tone":"bad"},
  {"when":"2026-11-16T13:00","text":"Regina Ogundeinde, phone screen","sub":"Send the \"That works\" draft and the Teams invite first: it isn't on your calendar.","taskId":ok("hire1116"),"tone":"bad"},
  {"when":"2026-11-16","text":"Offer decision for the E-Commerce role","sub":"You set \"Offer out\" for today. Decide after Ashanti, or re-date it to after Tuesday's calls.","taskId":ok("t11"),"tone":"warn"},
  {"when":"2026-11-17T09:00","text":"Byron Brown, phone screen (invite sent, accepted)"},
  {"when":"2026-11-17T11:00","text":"PPC Ad Review with Lauren and the team"},
  {"when":"2026-11-17T13:00","text":"Maneesha Kotagiri, phone call","sub":"Her reply is a draft and there's no invite yet. Send today.","tone":"warn"},
  {"when":"2026-11-18","text":"Merchant Center beam test: 2-week check","taskId":ok("abt-02")},
  {"when":"2026-11-19T11:00","text":"E-Commerce L-10 (you run it; Lauren is out)"},
  {"when":"2026-11-20","text":"G5: replace the 10 wrong facts on beam and mantel category pages; send web dev the template-fix list","taskId":ok("g5q1-08"),"tone":"warn"},
  {"when":"2026-11-20","text":"Merchant Center: clear the 31.8K Limited products; get site sales showing as Google promotions","taskId":ok("mcf-06")},
  {"when":"2026-11-20T11:00","text":"AI Training (you run it)"},
  {"when":"2026-11-23","text":"Advaning Black Friday & Cyber Monday promo starts","sub":"Set up the promo pricing and confirm with Advaning.","view":"promo","viewLabel":"Promotions","tone":"warn"},
  {"when":"2026-11-24","text":"AD Black Friday sale email goes out","sub":"Content still TBD; Daniel offered to build it in Active Campaign.","view":"promo","viewLabel":"Promotions","tone":"warn"},
  {"when":"2026-11-26","text":"Thanksgiving; Black Friday Nov 27, Cyber Monday Nov 30"}],
 "hiring":[
  {"text":"Regina (today 1:00) and Maneesha (Tue 1:00): send both \"That works\" drafts and both Teams invites.","taskId":ok("hire1116"),"tone":"bad"},
  {"text":"Lybah Nawaz (SMU) and Daniela Sanchez (UNT), both tier A, have waited in Handshake since Nov 10. Paste the phone-screen message (on the hiring task).","link":"https://app.joinhandshake.com/emp/conversations","linkLabel":"Handshake ↗","tone":"warn"},
  {"text":"Tier B, yes or pass: Theophilus Ewunuga, Adam Hill, Andrew Baez, Ruofan (Greta) Wang, Lilly Davila, Kirsten Sheffield, Gabriel Azcarate.","view":"hiring","viewLabel":"Hiring"},
  {"text":"17 new E-Commerce applicants on Handshake since Thursday (215 total). Claude profiles them; skim the A's.","view":"hiring","viewLabel":"Hiring"},
  {"text":"Kirsten, Douglas and Gabriel apology drafts from Nov 11 are still unsent. Send or delete."},
  {"text":"Colleges: TVCC (job description never attached, since Oct 22) and Dallas College (PDFs missing, since Oct 26) are waiting on you.","taskId":ok("hr1109-dc"),"tone":"warn"}],
 "cleanup":[
  {"text":"4 copies of the hiring summary task (Nov 11, 12, 13, 16). Keep today's, tick the other three.","taskId":ok("hire1111")},
  {"text":"About 20 old \"Hand off\" and block tasks from Nov 9–13 (Check and respond to emails, Bug Herds, Wrap...) still open under Now. Tick or clear them."},
  {"text":"3 \"Scheduled tasks need you\" items (Nov 5, 10, 11) are stale.","taskId":ok("wd-2026-11-11")},
  {"text":"About 30 unsent drafts in Outlook; send, fix or delete.","taskId":ok("ms1110-1")}],
 "projects":[
  {"id":"p-hire","name":"Hire the E-Commerce specialist","status":"Interviews this week","tone":"bad","why":"Your top time-sensitive item. 4 tier-A candidates are booked or ready.","next":["Ashanti in person today; offer decision after","Phone screens: Regina Mon, Byron and Maneesha Tue","Book Lybah and Daniela","Pick yes or pass on the 7 tier-B candidates"],"taskIds":[i for i in HIRE if i!='hr1109-dc'],"due":"2026-11-16","view":"hiring","viewLabel":"Hiring"},
  {"id":"p-bf","name":"Black Friday and Cyber Monday","status":"Due next week","tone":"warn","why":"Biggest sales week of the year. Advaning's promo starts Nov 23, the AD sale email goes Nov 24, Cyber Monday email Dec 1.","next":["Set up Advaning promo pricing and confirm with them","Decide the AD Black Friday offer and get the email built (Daniel offered Active Campaign)","Get site sales showing as Google promotions in Merchant Center"],"taskIds":[i for i in ['mcf-07'] if i in T],"due":"2026-11-23","view":"promo","viewLabel":"Promotions"},
  {"id":"p-g5","name":"G5 Q1: fix and launch","status":"5 November items overdue","tone":"warn","why":"Clear the known problems and ship the new beam and mantel pages before fireplace season.","next":["Miva one-product category test, then the 33-product cleanup","Faux Metal Beams page fix (open it in a Code chat on your PC)","Name the Searchspring admin and load the redirects","Answer the Pearl shelves plan; restart the 10 wrong facts (due Fri)","Send web dev the template-fix list (due Fri)"],"taskIds":G5,"due":"2026-11-20","link":(s.get('g5plan') or {}).get('link'),"view":"g5","viewLabel":"G5 plan"},
  {"id":"p-mc","name":"Merchant Center beam tests and feed","status":"Checks due","tone":"acc","why":"Wave 1 hits its 2-week check Wednesday; wave 2 edits are waiting on your check; 31.8K products are Limited.","next":["Check wave 2 edits","Wave 1 2-week check Wed","Heritage Timber inside-opening fix (pushed twice)","Clear the Limited products (shipping weights)"],"taskIds":MC,"due":"2026-11-18","view":"abtests","viewLabel":"A/B tests"},
  {"id":"p-data","name":"NetSuite data fixes and imports","status":"Waiting on your go","tone":"acc","why":"Marketing categories (9,811 Beams + 189 Kits) and the inaccurate-items fixes are built and held for you.","next":["Give the go on the Beams and Kit imports in Approvals","Say go to preview the AD (68) and Miva (71) inaccurate-item fixes"],"taskIds":ALERT,"view":"approvals","viewLabel":"Approvals"},
  {"id":"p-ads","name":"G5 ads cleanup","status":"Not started","why":"9 ad fixes from the G5 audit: negatives, BMU split, weak beams group, Microsoft impressions drop.","next":["Pick 2 for this week (ask before any change goes live)"],"taskIds":G5AD,"view":"ads","viewLabel":"Ads"},
  {"id":"p-quote","name":"Sales quote tool","status":"Waiting on you","why":"Built from Ryan's Custom Quoting sheet; your note to Daniel about it is still an unsent draft.","next":["Send Daniel the Custom Quoting note (in Drafts)","Run /ultron bt1104-4 on your PC to finish the reusable skill"],"taskIds":[i for i in ['bt1104-4'] if i in T]}],
 "days":[
  {"date":"2026-11-16","label":"Mon Nov 16","focus":"Setup day: catch up, hiring, set the week","meetings":["10:00 Ashanti Yow interview (in person)","1:00 Regina Ogundeinde phone screen"],"due":["Offer decision (Offer out)","Regina and Maneesha invites"]},
  {"date":"2026-11-17","label":"Tue Nov 17","focus":"Hiring calls, then G5: Miva test and Faux Metal page","meetings":["9:00 Byron Brown phone screen","11:00 PPC Ad Review","1:00 Maneesha Kotagiri call","2:00 Andrew weekly sync (tentative)"],"due":["Book Lybah and Daniela"]},
  {"date":"2026-11-18","label":"Wed Nov 18","focus":"Black Friday: Advaning pricing and the AD email plan","meetings":["9:30–12:00 Product Category Group Meetings (tentative)"],"due":["Beam test 2-week check"]},
  {"date":"2026-11-19","label":"Thu Nov 19","focus":"G5: the 10 wrong facts and the web dev template list","meetings":["11:00 E-Commerce L-10 (you run it)"],"note":["Lauren out Thu–Fri"]},
  {"date":"2026-11-20","label":"Fri Nov 20","focus":"Merchant Center Limited products and Google promotions; weekly review","meetings":["11:00 AI Training (you run it)","12:00 Thanksgiving potluck","2:00 Team Leads Weekly (tentative)"],"due":["10 wrong facts","Web dev template list","Limited products","Google promotions"]}]}
s['weekPlan']=wp
NOTE=" WEEK PLAN (Nov 16, patch56): state.weekPlan = {weekOf (Monday), builtAt, showOn, away {from,to,label}|null, headline, top [3 strings], catchup [items], timeSensitive [items with when], hiring [items], cleanup [items], projects [{id,name,status,tone,why,next[],taskIds[],due,view,link}], days [{date,label,focus,meetings[],due[],note[]}]}. An item is {text, sub?, who?, when?, tone (bad|warn|acc|ok)?, taskId?, link?, view?}. All list fields are arrays. Built every Monday by the morning rebuild (and on the first day back after time off); shown on the This week tab."
if 'WEEK PLAN' not in s['_note']:s['_note']+=NOTE
# today's blocks: setup day
def B(i,st,en,title,sub,**k):
  b={"id":"n16s-%d"%i,"start":st,"end":en,"title":title,"sub":sub,"done":False};b.update(k);return b
blocks=[
 B(1,"08:30","08:50","Catch up: read This week","Setup day. The This week tab has what happened Thu–Fri, what's time-sensitive, hiring, and your big projects. Read it top to bottom before anything else.",top=False),
 B(2,"08:50","09:10","Send Regina's invite (today 1:00) and Maneesha's (Tue 1:00)","Both \"That works\" replies are still in Drafts and neither Teams invite is on your calendar.",taskIds=["hire1116"],top=True),
 B(3,"09:10","09:30","Inbox and team check-in","Daniel's GA reply is drafted (in Drafts); answer Ethan's \"let's chat Monday\"; the 9:00 check-in goes from your PC. Work the rest from the Inbox tab.",links=[{"label":"Email: Inbox triage, Nov 16","href":"https://outlook.office365.com/owa/?ItemID=AAMkADJhMDgxZWU2LTgyOWItNGQ1Yi04ODVlLWM2OWMzNjZiYmNjNwBGAAAAAABmwyNIACz2SpY5pr7g3vkZBwBCgVnAZCBUTa752dU%2BHcc2AAAAAAEMAABCgVnAZCBUTa752dU%2BHcc2AAJoyJS8AAA%3D&exvsurl=1&viewmodel=ReadMessageItem"}]),
 B(4,"09:30","09:55","Prep for Ashanti's interview","Re-read her application; agree with Daniel what an offer would look like if it goes well."),
 B(5,"10:00","11:00","Ashanti Yow - Interview","Creative Lounge - Heath, in person. With Daniel, Alejandra, Ethan, Hayden, Lauren and Andrew.",meeting=True),
 B(6,"11:00","11:20","Debrief Ashanti and decide on the offer","Your \"Offer out\" task is dated today. Offer now, or re-date it until after Tuesday's calls (Byron, Maneesha).",taskIds=["t11"],top=True),
 B(7,"11:20","12:00","Hiring: book the next calls","Paste the phone-screen message to Lybah and Daniela in Handshake (waiting since Nov 10); yes or pass on the 7 tier-B; send or delete the Nov 11 apology drafts.",taskIds=["t7fp22","w1"],links=[{"label":"Handshake conversations","href":"https://app.joinhandshake.com/emp/conversations"}]),
 B(8,"12:40","13:00","Last week's numbers","Fri–Sun $361,170 (-9%); last week $1,125,174 (-20%, understated by Thursday's email gap). Check NetSuite for Thursday. Details in the Sales tab."),
 B(9,"13:00","13:30","Phone interview: Regina Ogundeinde","Teams, 10–20 minutes. Only if the invite went out at 8:50.",meeting=True),
 B(10,"13:30","14:15","Set the week: projects","Go through Big projects on This week. For each, confirm this week's steps; re-date the 5 overdue G5 November items; pick 2 G5 ads fixes. Ultron builds Tue–Fri from what you keep.",top=True),
 B(11,"14:15","14:45","Black Friday plan","Advaning promo starts Nov 23: set the pricing and confirm with them. AD Black Friday email goes Nov 24: decide the offer and ask Daniel to build it in Active Campaign.",links=[]),
 B(12,"14:45","15:15","Approvals: give the go or decline","Everything waiting on you, including the 9,811 Beams and 189 Kit Marketing category imports (the Beams card expired Friday) and the inaccurate-item previews.",taskIds=["mc-2026-11-11"]),
 B(13,"15:30","15:50","Cases — complete 10","6 open from search 16559: 0981370, 0981535, 0981538, 0981677, 0981981, 0982016. Oldest first."),
 B(14,"15:50","16:20","Clean up the board","4 duplicate hiring tasks, about 20 old hand-off and block tasks from last week, 3 stale \"Scheduled tasks need you\" items. Tick what's done so this week starts clean."),
 B(15,"16:40","17:00","Wrap","Log what got done. Tomorrow: Byron 9:00, PPC Ad Review 11:00, Maneesha 1:00, Andrew sync 2:00, then G5 Miva test and Faux Metal page. If there's time today: PVC Brackets for Ethan (Claude can draft it), Bug Herds."),
]
d=s['days'][TODAY];old={b['id'] for b in d['blocks']}
used={b['id'] for k,dd in s['days'].items() for b in dd.get('blocks',[])}|{t['id'] for t in s['tasks']}
for b in blocks:
  assert b['id'] not in used,b['id']
  for i in b.get('taskIds',[]):assert i in T,i
d['replacedBlocks']=[x['id'] for x in d['blocks']]
d['blocks']=blocks
s['updated']=NOW
json.dump(s,open('s2.json','w'))
h=open(sys.argv[1]).read();m=re.search(r'<script id="state" type="application/json">(.*?)</script>',h,re.S)
nj=json.dumps(s,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open(sys.argv[2],'w').write(h[:m.start(1)]+nj+h[m.end(1):]);print('ok',len(blocks),'projects',[(p['name'],len(p['taskIds'])) for p in wp['projects']])
