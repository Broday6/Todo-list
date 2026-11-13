// Every tab must be visible in the sidebar on a fresh load and must open when clicked (Nov 13: folded groups hid 8 tabs).
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
await p.goto('file://'+require('path').resolve(process.argv[2]));await p.waitForTimeout(2500);
const need=['today','work','approvals','inbox','tasks','bugherd','cases','team','week','chat','claude','auto','g5','goals','strety','sales','ads','promo','abtests','hiring'];
const vis=await p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-view]')].filter(e=>e.offsetParent).map(e=>e.dataset.view))]);
const missing=need.filter(v=>!vis.includes(v));let bad=[];
for(const v of vis){errs.length=0;try{await p.locator('[data-view="'+v+'"]:visible').first().click({timeout:3000});}catch(e){bad.push(v+' (not clickable)');continue;}await p.waitForTimeout(250);
 const on=await p.evaluate(()=>{const e=document.querySelector('[data-view].on');return e?e.dataset.view:''});if(on!==v||errs.length)bad.push(v+(errs.length?' ('+errs[0]+')':''));}
await b.close();
if(missing.length||bad.length){console.log('FAIL tabs: missing ['+missing.join(',')+'] not opening ['+bad.join('; ')+']');process.exit(1);}
console.log('PASS tabs: all '+vis.length+' visible and open');})();
