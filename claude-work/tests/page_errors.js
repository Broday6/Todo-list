const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push('ERR '+(e.stack||e.message).slice(0,600)));p.on('console',m=>{if(m.type()==='error')errs.push('CON '+m.text().slice(0,200))});await p.goto('file://'+process.argv[2]);await p.waitForTimeout(5000);
const txt=await p.evaluate(()=>document.body.innerText.slice(0,300));console.log('BODY',txt.replace(/\n/g,' | '));
const tabs=await p.$$eval('.tabset button, nav button',bs=>bs.map(b=>b.textContent.trim()).slice(0,40));console.log('TABS',tabs.length);
for(const t of ['Today','Tasks','This week','Hiring','Inbox','Claude']){try{const el=await p.$(`.tabset button:has-text("${t}"), nav button:has-text("${t}")`);if(el){await el.click();await p.waitForTimeout(700);}}catch(e){errs.push('CLICK '+t+' '+e.message.slice(0,80))}}
console.log(errs.join('\n')||'no errors');await b.close();})();
