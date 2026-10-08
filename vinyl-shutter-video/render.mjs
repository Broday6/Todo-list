// Renders the scenes to clips/<scene>.mp4 (30 fps, 1920x1080), or stills for review.
//   node render.mjs                      -> all scenes
//   node render.mjs s04 s05              -> selected scenes
//   node render.mjs --stills s04@1,3.5   -> PNG stills into stills/
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try { const p = join(ROOT, decodeURIComponent(req.url.split('?')[0])); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.error('[page error]', e));
await page.goto(`http://localhost:${port}/index.html`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
const durations = await page.evaluate(() => window.SCENES);

const args = process.argv.slice(2);
if (args[0] === '--stills') {
  await mkdir(join(ROOT, 'stills'), { recursive: true });
  for (const spec of args.slice(1)) {
    const [id, times] = spec.split('@');
    for (const t of times.split(',').map(Number)) {
      await page.evaluate(([i, tt]) => window.renderFrame(i, tt), [id, t]);
      await page.screenshot({ path: join(ROOT, 'stills', `${id}_${t}.png`) });
      console.log('still', id, t);
    }
  }
} else {
  await mkdir(join(ROOT, 'clips'), { recursive: true });
  const ids = args.length ? args : Object.keys(durations);
  for (const id of ids) {
    const n = Math.round(durations[id] * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', join(ROOT, 'clips', `${id}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < n; f++) {
      await page.evaluate(([i, tt]) => window.renderFrame(i, tt), [id, f / FPS]);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 30 === 0) console.log(id, `${f}/${n}`, ((Date.now() - t0) / (f + 1)).toFixed(0) + 'ms/frame');
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', id);
  }
}
await browser.close();
server.close();
