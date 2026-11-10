// node test_split.js   (NODE_PATH=$(npm root -g))
const {chromium}=require('playwright');const fs=require('fs');const crypto=require('crypto');
const D='/tmp/claude-0/-home-user-Todo-list/e03bc8fd-12d9-5672-bb2d-91785f6b127a/scratchpad/split/';
const R={},errs=[],fails=[];const ok=(name,cond,info)=>{R[name]=cond?'PASS':'FAIL'+(info?' '+info:'');if(!cond)fails.push(name);};
const T=new Date('2026-11-10T15:30:00Z');
const stub=()=>{window.__pub=[];const now=new Date().toISOString();const f=function(){return Promise.resolve({text:'x'})};f.json=()=>Promise.resolve({reply:'x'});
 window.claude={use:(n)=>Promise.resolve(n==='mcp'?{callTool:(s,t,i)=>t==='get_trigger'?Promise.resolve({payload:{trigger:{id:i.trigger_id,enabled:true,last_run:{fired_at:now,status:'ROUTINE_RUN_STATUS_SUCCEEDED'}}}}):Promise.resolve({payload:{}})}:n==='sample'?f:n==='artifact'?{publish:(h)=>{window.__pub.push(h);return Promise.resolve();}}:n==='downloads'?{save:(o)=>{window.__dl=o;return Promise.resolve();}}:null)};};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const stateOf=html=>{const a=html.indexOf('<script id="state" type="application/json">')+43;const b=html.indexOf('</script>',a);return JSON.parse(html.slice(a,b).replace(/<\\\//g,'</'));};
(async()=>{const b=await chromium.launch();
const open=async(file,w,fixed,tag)=>{const ctx=await b.newContext({viewport:{width:w,height:900}});await ctx.addInitScript(stub);const p=await ctx.newPage();
 if(fixed)await p.clock.setFixedTime(T);
 p.on('pageerror',e=>errs.push((tag||file.replace(D,''))+': '+e.message));await p.goto('file://'+file);await p.waitForTimeout(2500);return {p,ctx};};
const view=async(p,v)=>{await p.evaluate(v=>document.querySelector('[data-view="'+v+'"]').click(),v);await p.waitForTimeout(700);};
const VIEWS=['today','inbox','tasks','claude','chat','auto'];
// 1. visible text per tab: split vs patched single vs original single
const texts={};
for(const [name,file] of [['orig',D+'board_single.html'],['single',D+'board_patched.html'],['split',D+'out/index.html']])for(const [w,t] of [[1400,'d'],[390,'m']]){
 const {p,ctx}=await open(file,w,true,name+'-'+t);
 for(const v of VIEWS){await view(p,v);const s=await p.evaluate(()=>document.getElementById('root').innerText);texts[name+t+v]=[s.length,sha(s)];}
 if(name==='split'){R['split_'+t+'_scripts']=await p.evaluate(()=>[document.querySelectorAll('script[src]').length,!!(window.ULTRON_SHELL&&window.ULTRON_SHELL.up),window.ULTRON_SHELL.js]);
   R['split_'+t+'_overflow']=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);}
 await ctx.close();}
for(const t of ['d','m'])for(const v of VIEWS){const a=texts['split'+t+v],s=texts['single'+t+v],o=texts['orig'+t+v];
 ok('text_'+t+'_'+v,a[1]===s[1]&&a[1]===o[1],JSON.stringify({split:a,single:s,orig:o}));}

// 2. self-save round trip, split mode
{const {p,ctx}=await open(D+'out/index.html',1400,false,'save-split');
 const before=await p.evaluate(()=>JSON.parse(document.getElementById('state').textContent).autoLadder);
 await view(p,'auto');await p.evaluate(()=>document.querySelector('[data-ctl="playbooks"]').click());await p.waitForTimeout(700);
 const after=await p.evaluate(()=>{const c=document.querySelector('[data-autoladder]');c.click();return c.checked;});await p.waitForTimeout(1600);
 const pub=await p.evaluate(()=>window.__pub.slice());
 const h=pub[0]||'';const idx=fs.readFileSync(D+'out/index.html','utf8');
 ok('splitSave_published_once',pub.length===1,String(pub.length));
 ok('splitSave_small',h.length>0&&h.length<idx.length+5000,'pub '+h.length+' index '+idx.length);
 ok('splitSave_markers',h.includes('<style id="style">/* ultron:split build=')&&h.includes('<script id="app">/* ultron:split build=')&&!h.includes('function pageSource('));
 const s1=stateOf(h);ok('splitSave_state_changed',s1.autoLadder===after,before+'->'+s1.autoLadder);
 // shell outside the state element is identical to index.html's
 const cut=x=>{const a=x.indexOf('<script id="state"'),e=x.indexOf('</script>',a);return [x.slice(0,a),x.slice(e)];};
 const [hp,hs]=cut(h),[ip,is]=cut(idx);ok('splitSave_shell_identical',hp===ip&&hs===is,'prefixEq '+(hp===ip)+' suffixEq '+(hs===is));
 fs.mkdirSync(D+'fx/rt',{recursive:true});fs.writeFileSync(D+'fx/rt/index.html',h);fs.copyFileSync(D+'out/app.js',D+'fx/rt/app.js');fs.copyFileSync(D+'out/app.css',D+'fx/rt/app.css');
 await p.evaluate(()=>document.querySelector('[data-autoladder]').click());await p.waitForTimeout(1600);
 const pub2=await p.evaluate(()=>window.__pub.slice());ok('splitSave_second_tick',pub2.length===2&&stateOf(pub2[1]).autoLadder===!after);
 // Download app still works
 await p.evaluate(()=>{const e=document.querySelector('[data-dlapp]');if(e)e.click();});await p.waitForTimeout(500);
 const dl=await p.evaluate(()=>window.__dl);ok('downloadApp',!!dl&&dl.filename==='Ultron.html'&&/Open Ultron/.test(dl.data),dl?dl.filename:'no [data-dlapp] / no save');
 await ctx.close();
 const r=await open(D+'fx/rt/index.html',1400,false,'rt');
 const st=await r.p.evaluate(()=>[!!(window.ULTRON_SHELL&&window.ULTRON_SHELL.up),JSON.parse(document.getElementById('state').textContent).autoLadder,document.getElementById('root').innerText.length]);
 ok('splitSave_reload_renders',st[0]&&st[2]>500&&st[1]===after,JSON.stringify(st));await r.ctx.close();}
// 3. self-save, single-file mode
{const {p,ctx}=await open(D+'board_patched.html',1400,false,'save-single');
 const before=await p.evaluate(()=>JSON.parse(document.getElementById('state').textContent).autoLadder);
 await view(p,'auto');await p.evaluate(()=>document.querySelector('[data-ctl="playbooks"]').click());await p.waitForTimeout(700);
 const after=await p.evaluate(()=>{const c=document.querySelector('[data-autoladder]');c.click();return c.checked;});await p.waitForTimeout(1600);
 const h=(await p.evaluate(()=>window.__pub.slice()))[0]||'';
 ok('singleSave_full',h.length>1800000&&h.includes('function pageSource(')&&!h.includes('ultron:split build='),String(h.length));
 fs.writeFileSync(D+'fx/single_saved.html',h);await ctx.close();
 const r=await open(D+'fx/single_saved.html',1400,false,'single-rt');
 const st=await r.p.evaluate(()=>[!window.ULTRON_SHELL,JSON.parse(document.getElementById('state').textContent).autoLadder,document.getElementById('root').innerText.length]);
 ok('singleSave_reload_renders',st[0]&&st[2]>500&&st[1]===after,JSON.stringify(st));await r.ctx.close();}
// 4. external writer replaced only the state JSON
{const {p,ctx}=await open(D+'fx/ext/index.html',1400,false,'ext');await view(p,'tasks');
 const st=await p.evaluate(()=>[!!window.ULTRON_SHELL.up,JSON.parse(document.getElementById('state').textContent)._extWriterProbe,document.getElementById('root').innerText.includes('EXTWRITER')]);
 ok('externalWriter',st[0]&&st[1]==='written by fixtures.py'&&st[2],JSON.stringify(st));await ctx.close();}
// 5. failures: missing app.js, missing app.css, app.js crashes at boot, stale cached app.js
for(const fx of ['noj','noc','crash','stale']){const {p,ctx}=await open(D+'fx/'+fx+'/index.html',1400,false,'fx-'+fx);await p.waitForTimeout(1500);
 const st=await p.evaluate(()=>{const r=document.getElementById('root');const al=document.querySelector('[role=alert]');return {txt:r.innerText.trim(),vis:!!al&&al.getBoundingClientRect().height>0,pub:window.__pub.length,failed:!!(window.ULTRON_SHELL&&window.ULTRON_SHELL.failed)};});
 ok('fallback_'+fx,st.txt==="Ultron's code didn't load. Reload the page."&&st.vis&&st.pub===0&&st.failed,JSON.stringify(st));await ctx.close();}
// 6. old shell (older build) with newer app.js: boots, and the next save heals the shell's build id
{const {p,ctx}=await open(D+'fx/oldshell/index.html',1400,false,'oldshell');
 const up=await p.evaluate(()=>!!window.ULTRON_SHELL.up);
 await view(p,'auto');await p.evaluate(()=>document.querySelector('[data-ctl="playbooks"]').click());await p.waitForTimeout(700);
 await p.evaluate(()=>document.querySelector('[data-autoladder]').click());await p.waitForTimeout(1600);
 const h=(await p.evaluate(()=>window.__pub.slice()))[0]||'';const js=fs.readFileSync(D+'out/app.js','utf8');const jb=/build=(\d{14})/.exec(js)[1];
 ok('oldShell_boots_and_heals',up&&h.includes('build='+jb)&&!h.includes('20261101000000'),'up '+up+' len '+h.length);await ctx.close();}
ok('no_page_errors',errs.filter(e=>!/boom at boot|older than the page/.test(e)).length===0,JSON.stringify(errs));
console.log(JSON.stringify(R,null,1));console.log('FAILS',fails,'errs',errs);await b.close();})();
