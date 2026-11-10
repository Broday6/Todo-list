// Ultron board regression suite. Usage: NODE_PATH=$(npm root -g) node board_tests.js /abs/board.html
// Prints PASS/FAIL per check, a summary, and exits 1 if anything failed.
const fs = require('fs');
const { chromium } = require('playwright');

const file = process.argv[2];
if (!file || !file.startsWith('/') || !fs.existsSync(file)) {
  console.log('FAIL usage: pass an absolute path to board.html');
  process.exit(1);
}
const URL = 'file://' + file;

// ---- read state from the file (never hard-coded) ----
let STATE;
try {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<script id="state" type="application\/json">([\s\S]*?)<\/script>/);
  STATE = JSON.parse(m[1].replace(/<\\\//g, '</'));
} catch (e) {
  console.log('FAIL state-readable: ' + e.message);
  console.log('SUMMARY 0 passed, 1 failed');
  process.exit(1);
}
const CHAT_TRIG = STATE.chat && STATE.chat.trig;
const LOGINS = STATE.logins || [];
const TASK_IDS = (STATE.tasks || []).map(t => t.id);

// ---- page stub (window.claude.use) ----
function stub(o) {
  window.__calls = []; window.__clip = ''; window.__saved = []; window.__opened = [];
  window.open = (u) => { window.__opened.push(u); return {}; };
  const now = new Date().toISOString();
  const mcp = {
    callTool: (s, t, i) => {
      window.__calls.push([t, i && i.trigger_id, i]);
      if (t === 'fire_trigger') {
        if (o.failFire) return Promise.reject({ code: 'tool_error', message: 'fire_trigger: this routine was created via "http_api", not by an agent. Agents can only fire routines they created (via create_trigger).' });
        return Promise.resolve({ payload: {} });
      }
      if (t === 'get_trigger') {
        const off = o.disableId && i && i.trigger_id === o.disableId;
        return Promise.resolve({ payload: { trigger: { id: i.trigger_id, enabled: !off, last_run: { fired_at: now, status: 'ROUTINE_RUN_STATUS_SUCCEEDED' } } } });
      }
      if (t === 'read_resource') return Promise.resolve({ payload: { subject: 'S', from: 'F', text: 'Body text here' } });
      return Promise.resolve({ payload: {} });
    }
  };
  const f = function () { return Promise.resolve({ text: 'x' }); };
  f.json = () => Promise.resolve({ reply: 'x' });
  const dl = { save: (x) => { window.__saved.push(x); return Promise.resolve(); } };
  window.claude = { use: (n) => Promise.resolve(n === 'mcp' ? mcp : n === 'sample' ? f : n === 'artifact' ? { publish: () => Promise.resolve() } : n === 'downloads' ? dl : null) };
  try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t) => { window.__clip = t; return Promise.resolve(); } }, configurable: true }); } catch (e) {}
}

const results = [];
const pageErrors = []; // {ctx, msg}
let browser;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function open(tag, w, h, o) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(stub, o || {});
  const p = await ctx.newPage();
  p.on('pageerror', e => pageErrors.push({ ctx: tag, msg: e.message }));
  await p.goto(URL);
  await p.waitForFunction(() => document.querySelector('[data-view="today"]'), null, { timeout: 15000 });
  await sleep(2500);
  p.tag = tag;
  return p;
}
const go = async (p, v) => { await p.evaluate(v => document.querySelector('[data-view="' + v + '"]').click(), v); await sleep(700); };
const ctl = async (p, t) => { await p.evaluate(t => document.querySelector('[data-ctl="' + t + '"]').click(), t); await sleep(600); };
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth > innerWidth);

function assert(c, msg) { if (!c) throw new Error(msg); }
async function check(name, fn) {
  const t0 = Date.now();
  try { await fn(); results.push([name, true]); console.log('PASS ' + name); }
  catch (e) { results.push([name, false]); console.log('FAIL ' + name + ': ' + String(e && e.message || e).split('\n')[0]); }
}

(async () => {
  browser = await chromium.launch();
  const t0 = Date.now();
  let d, m;
  try {
    d = await open('desktop', 1400, 1000, {});
    m = await open('phone', 390, 800, {});
  } catch (e) {
    console.log('FAIL load: ' + e.message);
    console.log('SUMMARY 0 passed, 1 failed');
    await browser.close(); process.exit(1);
  }

  await check('state-has-chat-trigger', async () => assert(/^trig_/.test(CHAT_TRIG || ''), 'state.chat.trig missing: ' + CHAT_TRIG));

  // ---- overflow ----
  const views = [['today', 'Today'], ['inbox', 'Inbox'], ['tasks', 'Tasks'], ['claude', 'Claude'], ['chat', 'Live chat'], ['auto', 'Control room']];
  for (const [p, label] of [[d, 'desktop'], [m, 'phone']]) {
    for (const [v, vn] of views) {
      await check(`no-overflow ${label} ${vn}`, async () => {
        await go(p, v);
        if (v === 'auto') await ctl(p, 'health');
        const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
        assert(sw[0] <= sw[1], `scrollWidth ${sw[0]} > innerWidth ${sw[1]}`);
      });
    }
  }

  // ---- live chat ----
  await check('chat-box-width desktop >=250', async () => {
    await go(d, 'chat');
    const w = await d.evaluate(() => Math.round(document.querySelector('textarea[name="chq"]').getBoundingClientRect().width));
    assert(w >= 250, 'textarea width ' + w);
  });
  await check('chat-box-width phone >=250', async () => {
    await go(m, 'chat');
    const w = await m.evaluate(() => Math.round(document.querySelector('textarea[name="chq"]').getBoundingClientRect().width));
    assert(w >= 250, 'textarea width ' + w);
  });

  const okp = await open('chat-ok', 1400, 1000, {});
  await check('chat-send fires state.chat.trig', async () => {
    await go(okp, 'chat');
    await okp.fill('textarea[name="chq"]', 'Test message');
    const btn = await okp.$('.ch-form button[type="submit"], .ch-form [data-chsend], .ch-form button');
    assert(btn, 'no Send button in .ch-form');
    const label = (await btn.innerText()).trim();
    assert(/send/i.test(label), 'button label is "' + label + '"');
    await btn.click();
    await sleep(2500);
    const fired = await okp.evaluate(() => window.__calls.filter(c => c[0] === 'fire_trigger').map(c => c[1]));
    assert(fired.length >= 1, 'fire_trigger never called');
    assert(fired.every(x => x === CHAT_TRIG), 'fired ' + JSON.stringify(fired) + ' expected ' + CHAT_TRIG);
  });
  await okp.context().close();

  const fp = await open('chat-fail', 1400, 1000, { failFire: true });
  await check('chat-send failure shows note and Send again', async () => {
    await go(fp, 'chat');
    await fp.fill('textarea[name="chq"]', 'Test message');
    await fp.keyboard.press('Enter');
    await fp.waitForSelector('.ux-note', { timeout: 15000 }).catch(() => {});
    const r = await fp.evaluate(() => {
      const n = document.querySelector('.ux-note');
      const again = [...document.querySelectorAll('button')].some(b => /send again/i.test(b.textContent) && b.offsetParent);
      return { note: n ? n.innerText.trim() : '', again, fired: window.__calls.filter(c => c[0] === 'fire_trigger').length };
    });
    assert(r.fired >= 1, 'fire_trigger not called');
    assert(r.note.length > 5, 'no .ux-note explaining the failure');
    assert(r.again, 'no "Send again" button');
  });
  await fp.context().close();

  // ---- inbox ----
  await check('inbox More menu', async () => {
    await go(d, 'inbox');
    const n = await d.evaluate(() => document.querySelectorAll('.mr-more').length);
    assert(n > 0, 'no .mr-more menus');
    const r = await d.evaluate(() => { const b = document.querySelector('.mrow .mr-more summary'); return !!b; });
    assert(r, 'More summary missing');
    await d.evaluate(() => document.querySelector('.mrow .mr-more summary').click());
    await sleep(300);
    const btns = await d.evaluate(() => [...document.querySelectorAll('.mrow .mr-more[open] .mr-more-b > *')].map(e => e.textContent.trim()));
    assert(btns.length >= 2, 'opened menu shows ' + btns.length + ' buttons');
    assert(await d.evaluate(() => !!document.querySelector('.mrow .mr-more[open] [data-ibread]')), 'no Read email inside menu');
    await d.evaluate(() => document.querySelector('.mrow .mr-more[open] [data-ibread]').click());
    await sleep(900);
    assert(await d.evaluate(() => !!document.querySelector('.mrow .mr-more[open]')), 'menu closed after Read email');
    assert(await d.evaluate(() => !!document.querySelector('.mrow .mr-acts > .cl-done') && !document.querySelector('.mrow .mr-more .cl-done')), 'Done button is not outside the menu');
  });

  // ---- tasks ----
  await check('tasks compact / Full details / show all / search', async () => {
    await go(d, 'tasks');
    const h1 = await d.evaluate(() => ({ cls: document.getElementById('sec-tasks').className, h: document.documentElement.scrollHeight }));
    assert(/\btk-compact\b/.test(h1.cls), 'tk-compact missing by default: ' + h1.cls);
    const btns = await d.evaluate(() => [...document.querySelectorAll('[data-tkall]')].map(b => b.textContent.trim()));
    assert(btns.length > 0 && btns.every(t => /Show all \d+/.test(t)), 'Show all N buttons: ' + JSON.stringify(btns));
    const key = await d.evaluate(() => document.querySelector('[data-tkall]').getAttribute('data-tkall'));
    const vis = () => d.evaluate(k => [...document.querySelectorAll('#sec-tasks .group.' + k + ' li.task')].filter(x => x.offsetParent).length, key);
    const before = await vis();
    await d.evaluate(k => document.querySelector('[data-tkall="' + k + '"]').click(), key); await sleep(600);
    const after = await vis();
    assert(after > before, `Show all did not add rows (${before} -> ${after})`);
    await d.evaluate(k => { const b = document.querySelector('[data-tkall="' + k + '"]'); b && b.click(); }, key); await sleep(400);
    await d.evaluate(() => document.querySelector('[data-tkfull]').click()); await sleep(700);
    const h2 = await d.evaluate(() => ({ cls: document.getElementById('sec-tasks').className, h: document.documentElement.scrollHeight, c: document.querySelector('[data-tkfull]').checked }));
    assert(h2.c, 'Full details checkbox not checked');
    assert(!/\btk-compact\b/.test(h2.cls), 'tk-compact still present with Full details');
    assert(h2.h > h1.h, `page not taller with Full details (${h1.h} -> ${h2.h})`);
    await d.evaluate(() => document.querySelector('[data-tkfull]').click()); await sleep(500);
    await d.fill('#tfilter', 'alert'); await sleep(700);
    const f = await d.evaluate(() => ({ capped: document.querySelectorAll('li.task.tk-cap').length, vis: [...document.querySelectorAll('#sec-tasks li.task')].filter(x => x.offsetParent).length }));
    assert(f.vis > 0, 'search "alert" shows no tasks');
    assert(f.capped === 0, f.capped + ' capped rows while searching');
    await d.fill('#tfilter', '');
  });

  // ---- Claude tab ----
  await check('claude tab: Clear in one sitting + Copy one prompt', async () => {
    await go(d, 'claude');
    const g = await d.evaluate(() => document.querySelectorAll('#sec-sit .sit-g').length);
    assert(g >= 1, 'no groups in #sec-sit');
    const n = await d.evaluate(() => document.querySelectorAll('#sec-sit button').length);
    const has = await d.evaluate(() => [...document.querySelectorAll('#sec-sit button')].some(b => /copy one prompt/i.test(b.textContent)));
    assert(has, 'no "Copy one prompt" button (' + n + ' buttons in section)');
    await d.evaluate(() => [...document.querySelectorAll('#sec-sit button')].find(b => /copy one prompt/i.test(b.textContent)).click());
    await sleep(400);
    const clip = await d.evaluate(() => window.__clip);
    assert(clip && clip.length > 20, 'clipboard empty');
    assert(TASK_IDS.some(id => clip.includes(id)), 'clipboard text has no task id');
  });

  // ---- Control room ----
  await check('control room: every tab renders', async () => {
    await go(d, 'auto');
    const tabs = await d.evaluate(() => [...document.querySelectorAll('[data-ctl]')].map(e => e.dataset.ctl));
    assert(tabs.length >= 5, 'only ' + tabs.length + ' tabs');
    const bad = [];
    for (const t of tabs) {
      const before = pageErrors.length;
      await ctl(d, t); await sleep(300);
      const body = await d.evaluate(() => { const bar = document.querySelector('[data-ctl]').parentElement; const sec = bar.closest('section') || bar.parentElement; return sec.innerText.replace(/\s+/g, ' ').length - bar.innerText.replace(/\s+/g, ' ').length; });
      const errs = pageErrors.length - before;
      if (body < 80 || errs) bad.push(t + '(len ' + body + ', errs ' + errs + ')');
    }
    assert(!bad.length, 'empty or erroring tabs: ' + bad.join(', '));
  });
  await check('control room: Health renders', async () => {
    await go(d, 'auto'); await ctl(d, 'health');
    const r = await d.evaluate(() => { const e = document.getElementById('sec-health'); return e ? e.innerText.length : -1; });
    assert(r > 20, '#sec-health missing or empty (' + r + ')');
  });
  await check('control room: Health renders without state.health', async () => {
    const p = await open('nohealth', 1400, 1000, {});
    const gone = await p.evaluate(() => { delete state.health; delete state.healthLog; return !state.health; });
    assert(gone, 'could not remove state.health in page');
    await go(p, 'auto'); await ctl(p, 'health');
    const r = await p.evaluate(() => { const e = document.getElementById('sec-health'); return e ? e.innerText.length : -1; });
    assert(r > 5, '#sec-health missing without state.health (' + r + ')');
    await p.context().close();
  });
  await check('control room: Log in desktop file', async () => {
    assert(LOGINS.length > 0, 'state.logins is empty');
    await go(d, 'auto'); await ctl(d, 'health');
    await d.evaluate(() => { window.__saved = []; });
    await d.evaluate(() => document.querySelector('#sec-login [data-lgfile]').click()); await sleep(600);
    const s = await d.evaluate(() => window.__saved.map(o => ({ f: o.filename, d: String(o.data) })));
    assert(s.length >= 1, 'nothing saved');
    assert(s[0].f === 'Ultron Log in.cmd', 'filename ' + s[0].f);
    const lines = s[0].d.split(/\r?\n/).filter(l => /^start "" "https:\/\//.test(l));
    assert(lines.length === LOGINS.length, `${lines.length} start lines for ${LOGINS.length} logins`);
  });

  // ---- Routines ----
  await check('routines: no "Missed a run" when get_trigger succeeds', async () => {
    await go(d, 'auto'); await ctl(d, 'routines');
    await sleep(6000);
    const r = await d.evaluate(() => ({ rows: document.querySelectorAll('.au2-row').length, missed: [...document.querySelectorAll('.au2-row')].filter(x => /missed a run/i.test(x.innerText)).map(x => x.querySelector('.au2-n') ? x.querySelector('.au2-n').innerText.split('\n')[0] : '?') }));
    assert(r.rows > 0, 'no routine rows rendered');
    assert(!r.missed.length, 'Missed a run on: ' + r.missed.join(', '));
  });
  await check('today: disabled chat routine shows "switched off"', async () => {
    const p = await open('disabled', 1400, 1000, { disableId: CHAT_TRIG });
    await go(p, 'today');
    await p.waitForFunction(() => /switched off/i.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
    const t = await p.evaluate(() => /switched off/i.test(document.body.innerText));
    assert(t, 'no "switched off" item on Today');
    await p.context().close();
  });

  // ---- Playbooks ----
  await check('playbooks: auto-ladder bar and progress lines', async () => {
    await go(d, 'auto'); await ctl(d, 'playbooks');
    const r = await d.evaluate(() => { const cards = [...document.querySelectorAll('li.pb-card')]; return { bar: !!document.querySelector('.al-bar'), cards: cards.length, noProg: cards.filter(c => !c.querySelector('.al-prog')).map(c => (c.querySelector('.pb-name') || c).textContent.trim().slice(0, 30)), barText: (document.querySelector('.al-bar') || {}).innerText }; });
    assert(r.bar, '.al-bar missing');
    assert(/by themselves/i.test(r.barText || ''), 'bar text: ' + r.barText);
    assert(r.cards > 0, 'no playbook cards');
    assert(!r.noProg.length, 'cards without .al-prog: ' + r.noProg.join(', '));
  });

  // ---- page errors ----
  await check('no page errors in any context', async () => {
    assert(!pageErrors.length, pageErrors.length + ' page error(s): ' + pageErrors.slice(0, 3).map(e => e.ctx + ': ' + e.msg).join(' | '));
  });

  await browser.close();
  const failed = results.filter(r => !r[1]).length;
  console.log(`SUMMARY ${results.length - failed} passed, ${failed} failed (${Math.round((Date.now() - t0) / 1000)}s)`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.log('FAIL runner: ' + e.stack); process.exit(1); });
