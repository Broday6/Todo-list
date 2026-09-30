// Renders a video defined in src/ frame-by-frame in headless Chromium and
// encodes it with ffmpeg (H.264, high bitrate), in parallel chunks.
//   node render.mjs <video> [variant] [--still t1,t2,...] [--workers N] [--from s --to s]
import { createRequire } from 'module';
import { spawn, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [video, variantArg] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const variant = variantArg || 'main';
const FF = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });
const FPS = 30;

async function page(browser) {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await p.goto('file://' + path.join(ROOT, 'src/index.html'));
  const info = await p.evaluate(([v, va]) => window.setup(v, va), [video, variant]);
  return { p, info };
}

const browser = await chromium.launch({ args: ['--disable-gpu'] });
const still = opt('--still');
if (still) {
  const { p, info } = await page(browser);
  console.log('duration', info.duration.toFixed(2), 's'); if (opt('--list')) info.shots.forEach(s => console.log(s.t0.toFixed(2).padStart(7), s.d.toFixed(1).padStart(5), s.label));
  for (const t of still.split(',').map(Number)) {
    const url = await p.evaluate(i => window.frame(i), Math.round(t * FPS));
    const f = path.join(OUT, `still_${video}_${variant}_${t}.png`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(f);
  }
  await browser.close(); process.exit(0);
}

const { p: p0, info } = await page(browser);
await p0.close();
const from = Math.round(Number(opt('--from', 0)) * FPS);
const to = Math.round(Number(opt('--to', info.duration)) * FPS);
const workers = Number(opt('--workers', 4));
const per = Math.ceil((to - from) / workers);
console.log(`${video}/${variant}: ${info.duration.toFixed(2)}s, frames ${from}-${to}, ${workers} workers`);
const t0 = Date.now();
let done = 0;
const parts = [];
await Promise.all(Array.from({ length: workers }, async (_, w) => {
  const a = from + w * per, b = Math.min(to, a + per);
  if (a >= b) return;
  const { p } = await page(browser);
  const part = path.join(OUT, `_part_${video}_${variant}_${w}.mp4`);
  parts[w] = part;
  const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a; i < b; i++) {
    const url = await p.evaluate(i => window.frame(i), i);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (++done % 150 === 0) { const el = (Date.now() - t0) / 1000; console.log(`  ${done}/${to - from} frames  ${(done / el).toFixed(1)} fps  eta ${((to - from - done) / (done / el)).toFixed(0)}s`); }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await p.close();
}));
await browser.close();
const list = path.join(OUT, `_list_${video}_${variant}.txt`);
fs.writeFileSync(list, parts.filter(Boolean).map(f => `file '${f}'`).join('\n'));
const silent = path.join(OUT, `_silent_${video}_${variant}.mp4`);
execFileSync(FF, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
parts.filter(Boolean).forEach(f => fs.unlinkSync(f)); fs.unlinkSync(list);
fs.writeFileSync(path.join(OUT, `_shots_${video}_${variant}.json`), JSON.stringify(info, null, 1));
console.log(`video done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
// soundtrack (synthesised) + mux
const NAMES = { cav: 'CAV_Faux-Wood-Beams', cev: 'CEV_Faux-Wood-Beams', mov: 'MOV_Polyurethane' };
const final = path.join(OUT, `${NAMES[video] || video}${variant === 'main' ? '' : '_' + variant.replace('noreviews', 'No-Reviews')}.mp4`);
const wav = path.join(OUT, `_audio_${video}_${variant}.wav`);
execFileSync('python3', [path.join(ROOT, 'audio.py'), video, String((to - from) / FPS), path.join(OUT, `_shots_${video}_${variant}.json`), wav], { stdio: 'inherit' });
execFileSync(FF, ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final]);
fs.unlinkSync(silent); fs.unlinkSync(wav);
console.log('final ->', final);
