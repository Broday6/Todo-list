// ─────────────────────────────────────────────────────────────────────────────
//  Graphics library: brand pieces, product renders, diagrams, icons, host.
// ─────────────────────────────────────────────────────────────────────────────
const VIDEOS = {};
const BRAND = { name: 'EKENA', sub: 'MILLWORK', url: 'ArchitecturalDepot.com', phone: '(000) 000-0000' };

// ── backgrounds ─────────────────────────────────────────────────────────────
function bgInk(ctx, t = 0, o = {}) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, o.a || '#211a14'); g.addColorStop(1, o.b || '#120e0a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // slow drifting light pool
  const x = W * (.3 + .1 * Math.sin(t * .3)), y = H * (.35 + .05 * Math.cos(t * .23));
  const r = ctx.createRadialGradient(x, y, 0, x, y, W * .7);
  r.addColorStop(0, o.glow || 'rgba(208,138,60,.16)'); r.addColorStop(1, 'rgba(208,138,60,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  if (o.grid !== false) {
    ctx.save(); ctx.strokeStyle = 'rgba(244,236,223,.035)'; ctx.lineWidth = 1;
    for (let gx = 0; gx <= W; gx += 120) { ctx.beginPath(); ctx.moveTo(gx + .5, 0); ctx.lineTo(gx + .5, H); ctx.stroke(); }
    for (let gy = 0; gy <= H; gy += 120) { ctx.beginPath(); ctx.moveTo(0, gy + .5); ctx.lineTo(W, gy + .5); ctx.stroke(); }
    ctx.restore();
  }
}
function bgPaper(ctx, t = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#f7f1e7'); g.addColorStop(1, '#ebe2d3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(W * .7, H * .2, 0, W * .7, H * .2, W * .8);
  r.addColorStop(0, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
}

// floating dust motes in a light beam — cheap atmosphere
function motes(ctx, t, n = 60, seed = 3, col = '255,236,200') {
  const R = rng(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x0 = R() * W, y0 = R() * H, sp = .2 + R() * .6, r = .8 + R() * 2.2, ph = R() * TAU;
    const x = (x0 + t * 12 * sp + Math.sin(t * .5 + ph) * 20) % W, y = (y0 - t * 8 * sp + H) % H;
    ctx.fillStyle = `rgba(${col},${(.15 + .35 * R()) * (.5 + .5 * Math.sin(t * 1.3 + ph))})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ── 2D product render of a beam (front + underside, optional hollow end) ──
function beam2D(ctx, x, y, len, hgt, style, finish, o = {}) {
  const tex = wood(style, finish);
  const dep = o.dep ?? hgt * .8, ox = dep * (o.ox ?? .28), oy = dep * (o.oy ?? .42);
  const u0 = (o.u0 || 0) * tex.width, ul = Math.min(tex.width - u0, tex.width * (o.ul || len / 1600));
  ctx.save();
  if (o.shadow !== false) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 40;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + 10, y + 10, len - 20, hgt + oy - 10); ctx.restore();
  }
  // underside (parallelogram), texture sheared
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, y + hgt); ctx.lineTo(x + len, y + hgt); ctx.lineTo(x + len + ox, y + hgt + oy); ctx.lineTo(x + ox, y + hgt + oy); ctx.closePath(); ctx.clip();
  ctx.setTransform(ctx.getTransform().multiply(new DOMMatrix([len / ul, 0, ox / (tex.height * .4), oy / (tex.height * .4), x - u0 * len / ul, y + hgt])));
  ctx.drawImage(tex, 0, 0, tex.width, tex.height * .4, 0, 0, tex.width, tex.height * .4);
  ctx.restore();
  ctx.fillStyle = 'rgba(15,8,3,.38)';
  ctx.beginPath(); ctx.moveTo(x, y + hgt); ctx.lineTo(x + len, y + hgt); ctx.lineTo(x + len + ox, y + hgt + oy); ctx.lineTo(x + ox, y + hgt + oy); ctx.closePath(); ctx.fill();
  // front face
  ctx.drawImage(tex, u0, tex.height * .45, ul, tex.height * .5, x, y, len, hgt);
  const g = ctx.createLinearGradient(0, y, 0, y + hgt);
  g.addColorStop(0, 'rgba(255,240,215,.16)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,5,2,.28)');
  ctx.fillStyle = g; ctx.fillRect(x, y, len, hgt);
  // edge highlight
  ctx.fillStyle = 'rgba(255,235,205,.35)'; ctx.fillRect(x, y + hgt - 2, len, 2);
  // end: hollow U-channel (the honest product profile) or sealed
  if (o.end === 'cut') {
    // freshly cut end: shows the U-channel walls and the foam core inside them
    const ex = x + len, tw_ = Math.max(8, ox * .22), R = rng(77);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(ex, y); ctx.lineTo(ex + ox, y + oy); ctx.lineTo(ex + ox, y + hgt + oy); ctx.lineTo(ex, y + hgt); ctx.closePath();
    ctx.fillStyle = '#e6d8bd'; ctx.fill(); ctx.clip();
    for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(150,120,80,${.2 + R() * .25})`; ctx.beginPath(); ctx.arc(ex + R() * ox, y + R() * (hgt + oy), 1 + R() * 2.5, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(ex + tw_ * .3, y + tw_ * .5 * oy / ox); ctx.lineTo(ex + ox - tw_ * .3, y + oy - tw_ * .5 * oy / ox); ctx.lineTo(ex + ox - tw_ * .3, y + hgt + oy - hgt * .12); ctx.lineTo(ex + tw_ * .3, y + hgt - hgt * .12); ctx.closePath();
    ctx.fillStyle = '#1e1510'; ctx.fill();
    ctx.restore();
  }
  if (o.end === 'hollow' || o.end === 'sealed') {
    const ex = x + len, t = Math.max(4, hgt * .09);
    ctx.beginPath(); ctx.moveTo(ex, y); ctx.lineTo(ex + ox, y + oy); ctx.lineTo(ex + ox, y + hgt + oy); ctx.lineTo(ex, y + hgt); ctx.closePath();
    const fin = FINISHES.find(f => f.id === finish);
    ctx.fillStyle = rgba(mixc(hex(fin.dark), [0, 0, 0], .2)); ctx.fill();
    if (o.end === 'hollow') {
      ctx.beginPath(); ctx.moveTo(ex, y); ctx.lineTo(ex + ox * .82, y + oy * .82); ctx.lineTo(ex + ox * .82, y + hgt + oy * .82 - t); ctx.lineTo(ex, y + hgt - t); ctx.closePath();
      ctx.fillStyle = '#1a120c'; ctx.fill();
    }
  }
  if (o.sheen) { // travelling specular sweep
    const sx = x + (o.sheen * 1.6 - .3) * len;
    const sg = ctx.createLinearGradient(sx - 160, 0, sx + 160, 0);
    sg.addColorStop(0, 'rgba(255,240,210,0)'); sg.addColorStop(.5, 'rgba(255,240,210,.22)'); sg.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = sg; ctx.fillRect(x, y, len, hgt + oy); ctx.restore();
  }
  ctx.restore();
}

// macro close-up of a texture with moving light + rack focus
function macro(ctx, t, style, finish, o = {}) {
  const tex = wood(style, finish, 'macro');
  const z = o.zoom ?? 1.25, px = (o.pan ?? 1) * t * 60;
  const sw = W / z, sh = H / z;
  const sx = clamp((tex.width - sw) * (o.x ?? .2) + px, 0, tex.width - sw), sy = clamp((tex.height - sh) * (o.y ?? .5), 0, tex.height - sh);
  ctx.save();
  if (o.blur) ctx.filter = `blur(${o.blur}px)`;
  if (o.rot) { ctx.translate(W / 2, H / 2); ctx.rotate(o.rot); ctx.scale(1.25, 1.25); ctx.translate(-W / 2, -H / 2); }
  ctx.drawImage(tex, sx, sy, sw, sh, 0, 0, W, H);
  ctx.restore();
  // raking light sweep
  const lx = W * (-.2 + 1.4 * ((o.light ?? t * .35) % 1));
  const g = ctx.createLinearGradient(lx - 500, 0, lx + 500, H * .3);
  g.addColorStop(0, 'rgba(255,225,180,0)'); g.addColorStop(.5, 'rgba(255,225,180,.28)'); g.addColorStop(1, 'rgba(255,225,180,0)');
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  const v = ctx.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(0,0,0,.35)'); v.addColorStop(.3, 'rgba(0,0,0,0)'); v.addColorStop(.7, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ── brand: logo mark built from three beams (stand-in for the real logo) ──
function logoMark(ctx, cx, cy, s, p, finish = 'honey') {
  // an "E" assembled from beams: vertical post + three rails
  const bars = [
    { x: -60, y: -80, w: 34, h: 160, d: 0 },
    { x: -60, y: -80, w: 130, h: 30, d: .12 },
    { x: -60, y: -15, w: 100, h: 30, d: .24 },
    { x: -60, y: 50, w: 130, h: 30, d: .36 },
  ];
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const tex = wood('hewn', finish);
  bars.forEach((b, i) => {
    const q = E.outBack(clamp((p - b.d) / .5));
    if (q <= 0) return;
    ctx.save();
    const vertical = b.h > b.w;
    ctx.beginPath(); ctx.rect(b.x, b.y, vertical ? b.w : b.w * q, vertical ? b.h * q : b.h); ctx.clip();
    if (vertical) { ctx.translate(b.x, b.y); ctx.rotate(Math.PI / 2); ctx.drawImage(tex, 200 * i, 60, 900, 120, 0, -b.w, b.h, b.w); }
    else ctx.drawImage(tex, 300 * i, 60, 900, 120, b.x, b.y, b.w, b.h);
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    if (!vertical) ctx.fillRect(b.x, b.y + b.h - 4, b.w * q, 4);
  });
  ctx.restore();
}
function logoLockup(ctx, cx, cy, t, o = {}) {
  const s = o.scale || 1;
  logoMark(ctx, cx - 250 * s, cy, s, seg(t, 0, 1.2, E.linear));
  staggerText(ctx, BRAND.name, cx - 150 * s, cy + 22 * s, t - .45, font('bold', 118 * s), o.color || C.cream, { track: 16 * s, stagger: .05, dur: .7, dy: 30 });
  const pl = seg(t, 1.0, .8, E.outExpo);
  ctx.fillStyle = C.accent; ctx.fillRect(cx - 146 * s, cy + 52 * s, 540 * s * pl, 4 * s);
  text(ctx, BRAND.sub, cx - 146 * s, cy + 104 * s, font('normal', 34 * s), o.sub || C.muted, 'left', 22 * s, seg(t, 1.2, .6));
}

function endCard(ctx, t, o = {}) {
  bgInk(ctx, t);
  motes(ctx, t, 40, 9);
  logoLockup(ctx, W / 2 - 60, H / 2 - 90, t, { scale: 1 });
  const a = seg(t, 1.6, .7);
  ctx.save(); ctx.globalAlpha = a;
  const y = H / 2 + 150;
  ctx.fillStyle = 'rgba(244,236,223,.08)'; roundRect(ctx, W / 2 - 520, y - 44, 1040, 88, 44); ctx.fill();
  text(ctx, BRAND.url, W / 2 - 40, y + 13, font('bold', 38), C.cream, 'right', 2);
  ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(W / 2, y, 6, 0, TAU); ctx.fill();
  text(ctx, BRAND.phone, W / 2 + 40, y + 13, font('normal', 38), C.cream, 'left', 3);
  if (o.tag) text(ctx, o.tag, W / 2, y + 110, font('italic', 32, SERIF), C.muted, 'center', 1);
  ctx.restore();
}

// ── typographic building blocks ─────────────────────────────────────────────
function kicker(ctx, s, x, y, t, color = C.accent, align = 'left') {
  const p = seg(t, 0, .6, E.outExpo);
  const w = tw(ctx, s, font('bold', 24), 6);
  const x0 = align === 'center' ? x - w / 2 : x;
  ctx.fillStyle = color; ctx.fillRect(x0 - (align === 'center' ? 0 : 0), y + 14, w * p, 3);
  slotText(ctx, s, x, y, p, font('bold', 24), color, align, 6, 28);
}

function headline(ctx, lines, x, y, t, o = {}) {
  const size = o.size || 96, lh = size * 1.05, f = font(o.weight || 'bold', size, o.face || SANS);
  lines.forEach((ln, i) => {
    const p = seg(t, (o.delay || 0) + i * .12, .9, E.outExpo);
    const col = Array.isArray(o.color) ? o.color[i] : (o.color || C.cream);
    slotText(ctx, ln, x, y + i * lh, p, f, col, o.align || 'left', o.track ?? -1, size);
  });
}

function chapter(ctx, t, num, title, sub, o = {}) {
  bgInk(ctx, t);
  const tex = wood('hewn', 'honey');
  // a beam slides across as the chapter underline
  const p = seg(t, .1, 1, E.inOutExpo);
  ctx.save(); ctx.beginPath(); ctx.rect(0, H / 2 + 60, W * p, 34); ctx.clip();
  ctx.drawImage(tex, 0, 60, 1600, 110, 0, H / 2 + 60, W, 34); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(0, H / 2 + 90, W * p, 4);
  text(ctx, num, 160, H / 2 + 20, font('bold', 260), 'rgba(208,138,60,.9)', 'left', -8, seg(t, .2, .6));
  headline(ctx, [title], 560, H / 2 - 30, t - .25, { size: 110 });
  if (sub) text(ctx, sub, 566, H / 2 + 170, font('italic', 44, SERIF), C.muted, 'left', 0, seg(t, .7, .8));
}

// captions: the host / VO script, word-by-word
function caption(ctx, T, cue, tag = 'HOST') {
  if (!cue) return;
  const lt = T - cue.t0, d = cue.d;
  const a = Math.min(inv(0, .25, lt), 1 - inv(d - .25, d, lt));
  if (a <= 0) return;
  const f = font('bold', 38);
  const lines = wrap(ctx, cue.text, f, 1300);
  const words = cue.text.split(' ').length;
  const rate = words / Math.max(1, d - .6); // words per second across the shot
  const shown = Math.floor((lt - .15) * rate) + 1;
  const lh = 52, bh = lines.length * lh + 36, by = H - 80 - bh;
  ctx.save(); ctx.globalAlpha = a;
  const wmax = Math.max(...lines.map(l => tw(ctx, l, f))) + 70;
  ctx.fillStyle = 'rgba(14,10,7,.72)'; roundRect(ctx, W / 2 - wmax / 2, by, wmax, bh, 14); ctx.fill();
  ctx.fillStyle = C.accent; roundRect(ctx, W / 2 - wmax / 2 + 20, by - 18, tw(ctx, tag, font('bold', 18), 4) + 28, 34, 17); ctx.fill();
  text(ctx, tag, W / 2 - wmax / 2 + 34, by + 5, font('bold', 18), C.ink, 'left', 4);
  let wi = 0;
  lines.forEach((ln, i) => {
    const lw = tw(ctx, ln, f); let x = W / 2 - lw / 2;
    for (const w of ln.split(' ')) {
      const on = wi < shown; ctx.font = f;
      text(ctx, w, x, by + 18 + (i + 1) * lh - 14, f, on ? C.cream : 'rgba(244,236,223,.32)');
      x += ctx.measureText(w + ' ').width; wi++;
    }
  });
  ctx.restore();
}

// lower-third label used over footage
function lowerThird(ctx, t, title, sub, o = {}) {
  const x = o.x ?? 120, y = o.y ?? H - 250;
  const p = seg(t, 0, .7, E.outExpo), out = o.d ? 1 - seg(t, o.d - .4, .4, E.inCubic) : 1;
  if (p * out <= 0) return;
  ctx.save(); ctx.globalAlpha = out;
  if (o.scrim !== false) { const g = ctx.createRadialGradient(x + 200, y, 0, x + 200, y, 700); g.addColorStop(0, `rgba(12,8,5,${.62 * p})`); g.addColorStop(1, 'rgba(12,8,5,0)'); ctx.fillStyle = g; ctx.fillRect(0, y - 500, x + 1000, 800); }
  ctx.fillStyle = C.accent; ctx.fillRect(x, y - 70, 6, 120 * p);
  slotText(ctx, title, x + 30, y, p, font('bold', 60), C.cream, 'left', 0, 60);
  if (sub) slotText(ctx, sub, x + 32, y + 46, seg(t, .15, .7, E.outExpo), font('normal', 30), C.cream, 'left', 2, 30);
  ctx.restore();
}

// "pill" label
function pill(ctx, s, x, y, a = 1, o = {}) {
  const f = font('bold', o.size || 26), w = tw(ctx, s, f, 3) + 44, h = (o.size || 26) * 1.8;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = o.bg || 'rgba(20,15,10,.75)'; roundRect(ctx, x - (o.align === 'center' ? w / 2 : 0), y - h / 2, w, h, h / 2); ctx.fill();
  if (o.stroke !== false) { ctx.strokeStyle = o.stroke || C.accent; ctx.lineWidth = 2; ctx.stroke(); }
  text(ctx, s, x + (o.align === 'center' ? 0 : w / 2), y + (o.size || 26) * .36, f, o.color || C.cream, 'center', 3);
  ctx.restore();
  return w;
}

// ── line icons (drawn in a 100×100 box) ─────────────────────────────────────
function icon(ctx, name, x, y, s = 1, p = 1, color = C.accent2, lw = 5) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-50, -50);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha *= clamp(p * 2);
  const L = (pts) => drawPath(ctx, pts, p, color, lw);
  const arc = (cx, cy, r, a0, a1) => { ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + (a1 - a0) * p); ctx.stroke(); };
  switch (name) {
    case 'value': L([[10, 80], [35, 55], [55, 68], [88, 30]]); L([[66, 30], [88, 30], [88, 52]]); break;
    case 'trend': L([[50, 10], [58, 40], [90, 50], [58, 60], [50, 90], [42, 60], [10, 50], [42, 40], [50, 10]]); break;
    case 'hide': arc(50, 50, 30, Math.PI * 1.1, Math.PI * 1.9); L([[14, 50], [50, 72], [86, 50]]); L([[18, 82], [82, 18]]); break;
    case 'undo': arc(50, 55, 30, Math.PI * 1.15, Math.PI * 2.8); L([[20, 25], [24, 46], [44, 42]]); break;
    case 'feather': L([[20, 85], [80, 20]]); L([[80, 20], [60, 70], [30, 75]]); L([[80, 20], [30, 40], [25, 75]]); break;
    case 'drop': L([[50, 10], [75, 50], [72, 70], [50, 88], [28, 70], [25, 50], [50, 10]]); break;
    case 'bug': arc(50, 55, 22, 0, TAU); L([[30, 40], [15, 30]]); L([[70, 40], [85, 30]]); L([[28, 60], [12, 64]]); L([[72, 60], [88, 64]]); L([[15, 15], [85, 85]]); break;
    case 'detail': arc(42, 42, 26, 0, TAU); L([[62, 62], [86, 86]]); L([[32, 42], [52, 42]]); break;
    case 'stable': L([[10, 70], [90, 70]]); L([[20, 50], [80, 50]]); L([[30, 30], [70, 30]]); break;
    case 'saw': L([[10, 70], [70, 20], [90, 40], [30, 90], [10, 70]]); L([[25, 72], [30, 67]]); L([[35, 63], [40, 58]]); L([[45, 54], [50, 49]]); break;
    case 'ruler': L([[15, 70], [70, 15], [85, 30], [30, 85], [15, 70]]); L([[35, 50], [42, 57]]); L([[48, 37], [55, 44]]); L([[61, 24], [68, 31]]); break;
    case 'palette': arc(50, 50, 36, 0, TAU); [[38, 32], [60, 30], [70, 50], [34, 58]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 6 * p, 0, TAU); ctx.fill(); }); break;
    case 'layers': L([[50, 15], [90, 35], [50, 55], [10, 35], [50, 15]]); L([[10, 52], [50, 72], [90, 52]]); L([[10, 69], [50, 89], [90, 69]]); break;
    case 'drill': L([[15, 40], [60, 40], [60, 60], [15, 60], [15, 40]]); L([[60, 50], [90, 50]]); L([[30, 60], [25, 88], [45, 88], [45, 60]]); break;
    case 'paint': L([[15, 20], [75, 20], [75, 40], [15, 40], [15, 20]]); L([[75, 30], [88, 30], [88, 55], [48, 55], [48, 85]]); break;
    case 'check': L([[20, 52], [42, 74], [82, 28]]); break;
    case 'cross': L([[25, 25], [75, 75]]); L([[75, 25], [25, 75]]); break;
    case 'star': { ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 44, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(50 + Math.cos(a) * r, 52 + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); break; }
    case 'block': L([[20, 30], [80, 30], [80, 70], [20, 70], [20, 30]]); L([[35, 20], [35, 40]]); L([[65, 20], [65, 40]]); break;
    case 'glue': L([[30, 20], [70, 20], [65, 70], [35, 70], [30, 20]]); L([[50, 70], [50, 88]]); break;
    case 'lift': L([[50, 85], [50, 20]]); L([[30, 40], [50, 20], [70, 40]]); break;
  }
  ctx.restore();
}

// icon + title + body tile
function benefitTile(ctx, t, x, y, ic, title, body, o = {}) {
  const p = seg(t, 0, .8, E.outExpo);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 40);
  const w = o.w || 520, h = o.h || 300;
  ctx.fillStyle = o.bg || 'rgba(244,236,223,.06)'; roundRect(ctx, x, y, w, h, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(244,236,223,.12)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(208,138,60,.14)'; ctx.beginPath(); ctx.arc(x + 80, y + 80, 48, 0, TAU); ctx.fill();
  icon(ctx, ic, x + 80, y + 80, .62, seg(t, .15, .9, E.outCubic));
  text(ctx, title, x + 40, y + 185, font('bold', o.ts || 42), C.cream, 'left', 0);
  if (body) wrap(ctx, body, font('normal', 26), w - 80).forEach((l, i) => text(ctx, l, x + 40, y + 230 + i * 34, font('normal', 26), C.muted));
  ctx.restore();
}

// ── install section diagram (end view of a U-channel beam on a block) ──────
// phase 0..4: 0 bare, 1 block fastened, 2 adhesive, 3 beam lifted, 4 fastened
function installSection(ctx, t, phase, o = {}) {
  const cx = o.cx ?? W / 2, top = o.top ?? 250, s = o.s ?? 1;
  const fin = FINISHES.find(f => f.id === (o.finish || 'honey'));
  ctx.save(); ctx.translate(cx, top); ctx.scale(s, s);
  // joists + drywall
  for (let i = -2; i <= 2; i++) { ctx.fillStyle = '#b8935f'; ctx.fillRect(i * 240 - 30, -200, 60, 200); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(i * 240 + 20, -200, 10, 200); }
  ctx.fillStyle = '#ece5d8'; ctx.fillRect(-620, 0, 1240, 26); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(-620, 22, 1240, 4);
  text(ctx, 'JOIST', 0, -150, font('bold', 20), 'rgba(20,12,6,.65)', 'center', 4);
  text(ctx, 'CEILING', 500, 18, font('bold', 16), 'rgba(20,12,6,.5)', 'center', 4);
  const bw = 300, bh = 240, wall = 22, blkW = bw - 2 * wall - 6, blkH = 130;
  // mounting block
  const pb = phase >= 1 ? 1 : seg(t, 0, 1, E.outCubic) * (phase >= .5 ? 1 : 0);
  const blockY = 26 + (1 - E.outBack(clamp(phase))) * 260;
  if (phase > 0) {
    ctx.fillStyle = '#d9b27a'; ctx.fillRect(-blkW / 2, blockY, blkW, blkH);
    ctx.strokeStyle = 'rgba(90,60,30,.5)'; ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-blkW / 2 + 8, blockY + 16 + k * 20); ctx.bezierCurveTo(-40, blockY + 10 + k * 20, 40, blockY + 26 + k * 20, blkW / 2 - 8, blockY + 16 + k * 20); ctx.stroke(); }
    // screws up into joist
    const sp = clamp(phase - 1 + .0001) > 0 ? 1 : seg(t, .9, .8, E.outCubic);
    for (const sx of [-50, 50]) {
      const len = 200 * (phase >= 1 ? sp : 0);
      ctx.fillStyle = '#6f7277'; ctx.fillRect(sx - 4, blockY + blkH - 12 - len, 8, len);
      if (len > 0) { ctx.fillStyle = '#50535a'; ctx.fillRect(sx - 10, blockY + blkH - 14, 20, 6); }
    }
  }
  // adhesive beads on the beam's top edges
  const beamLift = phase >= 3 ? 1 : phase >= 2 ? 0 : -1;
  const lift = phase < 3 ? 0 : E.inOutCubic(clamp(phase - 2));
  const beamY = lerp(26 + 300, 26, lift);
  if (phase >= 2) {
    const tex = wood(o.style || 'hewn', o.finish || 'honey');
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-bw / 2, beamY); ctx.lineTo(-bw / 2 + wall, beamY); ctx.lineTo(-bw / 2 + wall, beamY + bh - wall); ctx.lineTo(bw / 2 - wall, beamY + bh - wall); ctx.lineTo(bw / 2 - wall, beamY); ctx.lineTo(bw / 2, beamY); ctx.lineTo(bw / 2, beamY + bh); ctx.lineTo(-bw / 2, beamY + bh); ctx.closePath();
    ctx.save(); ctx.clip(); ctx.drawImage(tex, 400, 20, 400, 200, -bw / 2, beamY, bw, bh); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-bw / 2, beamY, bw, bh); ctx.restore();
    ctx.strokeStyle = 'rgba(20,10,4,.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    // beads
    const bp = phase >= 3 ? 1 : seg(t, .2, .9, E.outBack);
    ctx.fillStyle = '#f4f1ea';
    for (const sx of [-bw / 2 + wall / 2, bw / 2 - wall / 2]) { ctx.beginPath(); ctx.ellipse(sx, beamY - 2, 15 * bp, 13 * bp * (1 - lift * .6), 0, Math.PI, 0); ctx.fill(); }
    if (phase >= 3.95 || phase >= 4) {
      const fp = phase >= 4 ? seg(t, .1, .8, E.outCubic) : 0;
      for (const side of [-1, 1]) {
        const x0 = side * (bw / 2 + 60), x1 = side * (blkW / 2 - 10);
        ctx.fillStyle = '#6f7277'; const xa = lerp(x0, x1, fp);
        ctx.fillRect(Math.min(side * (bw / 2 + 60), xa), beamY + 70 - 3, Math.abs(xa - side * (bw / 2 + 60)), 6);
        ctx.fillStyle = '#50535a'; ctx.fillRect(side > 0 ? xa + (bw / 2 + 60 - xa) - 6 : side * (bw / 2 + 60), beamY + 62, 6, 16);
      }
    }
  }
  ctx.restore();
}

// ── host character (flat illustration) in a small studio set ───────────────
function hostPlate(ctx, T, lt, talking, o = {}) {
  // set: warm wall, beams overhead, shelf, plant, soft key light
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#d8c8b0'); g.addColorStop(1, '#b59f82');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const push = 1 + lt * .012;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
  // ceiling beams in simple perspective
  const tex = wood('hewn', o.finish || 'walnut');
  for (let i = 0; i < 3; i++) {
    const y = 40 + i * 70, h = 46 - i * 10, x0 = -100 + i * 120, x1 = W + 100 - i * 120;
    ctx.drawImage(tex, 0, 70, 1600, 110, x0, y, x1 - x0, h);
    ctx.fillStyle = `rgba(20,10,4,${.15 + i * .08})`; ctx.fillRect(x0, y, x1 - x0, h);
    ctx.fillStyle = 'rgba(40,25,10,.25)'; ctx.fillRect(x0, y + h, x1 - x0, 10);
  }
  // shelf + plant + frame
  ctx.fillStyle = '#6b4a30'; ctx.fillRect(1250, 560, 420, 16);
  ctx.fillStyle = '#8f7a63'; ctx.fillRect(1290, 470, 60, 90); ctx.fillStyle = '#5d6e52';
  for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(1320 + Math.sin(k * 1.7) * 40, 440 - k * 12, 16, 40, Math.sin(k * 2.1) * .8, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#efe6d6'; ctx.fillRect(1440, 420, 150, 140); ctx.fillStyle = '#c9b89e'; ctx.fillRect(1455, 435, 120, 110);
  beam2D(ctx, 1460, 470, 100, 26, 'sawn', 'gray', { shadow: false, dep: 16 });
  // bokeh
  const R = rng(4);
  for (let k = 0; k < 14; k++) { ctx.fillStyle = `rgba(255,240,210,${.06 + R() * .08})`; ctx.beginPath(); ctx.arc(R() * W, 300 + R() * 500, 20 + R() * 50, 0, TAU); ctx.fill(); }
  // host
  const cx = o.x ?? 760, base = H + 40;
  const breathe = Math.sin(T * 2.1) * 4, sway = Math.sin(T * .9) * 6;
  ctx.save(); ctx.translate(cx + sway, 0);
  // torso
  ctx.fillStyle = '#3e5566';
  ctx.beginPath(); ctx.moveTo(-270, base); ctx.bezierCurveTo(-260, 720 + breathe, -170, 640 + breathe, 0, 635 + breathe); ctx.bezierCurveTo(170, 640 + breathe, 260, 720 + breathe, 270, base); ctx.closePath(); ctx.fill();
  // plaid lines
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 10;
  for (let k = -6; k < 7; k++) { ctx.beginPath(); ctx.moveTo(k * 50, 600); ctx.lineTo(k * 50, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-300, 680 + k * 50); ctx.lineTo(300, 680 + k * 50); ctx.stroke(); }
  ctx.restore();
  // collar + neck
  ctx.fillStyle = '#c98f6b'; ctx.fillRect(-42, 560 + breathe, 84, 90);
  ctx.fillStyle = '#2f4250'; ctx.beginPath(); ctx.moveTo(-60, 640 + breathe); ctx.lineTo(0, 700 + breathe); ctx.lineTo(60, 640 + breathe); ctx.lineTo(40, 625 + breathe); ctx.lineTo(0, 660 + breathe); ctx.lineTo(-40, 625 + breathe); ctx.closePath(); ctx.fill();
  // head
  const nod = talking ? Math.sin(T * 5.3) * 2.5 : 0;
  ctx.save(); ctx.translate(0, 440 + breathe * .6 + nod); ctx.rotate(Math.sin(T * .7) * .03);
  ctx.fillStyle = '#d9a17c'; ctx.beginPath(); ctx.ellipse(0, 0, 115, 140, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c98f6b'; ctx.beginPath(); ctx.ellipse(-112, 10, 18, 30, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(112, 10, 18, 30, 0, 0, TAU); ctx.fill();
  // hair + beard shadow
  ctx.fillStyle = '#3a2a1f';
  ctx.beginPath(); ctx.moveTo(-118, -20); ctx.bezierCurveTo(-130, -150, 120, -175, 120, -30); ctx.bezierCurveTo(90, -90, -40, -110, -118, -20); ctx.fill();
  ctx.fillStyle = 'rgba(58,42,31,.25)'; ctx.beginPath(); ctx.ellipse(0, 70, 95, 70, 0, 0, Math.PI); ctx.fill();
  // eyes + blink
  const blink = (T * 1000 % 3700) < 130 ? .1 : 1;
  ctx.fillStyle = '#2a1d14';
  ctx.beginPath(); ctx.ellipse(-42, -8, 10, 12 * blink, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(42, -8, 10, 12 * blink, 0, 0, TAU); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#3a2a1f'; ctx.lineCap = 'round';
  const brow = talking ? Math.max(0, Math.sin(T * 3.1)) * 6 : 0;
  ctx.beginPath(); ctx.moveTo(-64, -42 - brow); ctx.lineTo(-22, -46 - brow); ctx.stroke(); ctx.beginPath(); ctx.moveTo(22, -46 - brow); ctx.lineTo(64, -42 - brow); ctx.stroke();
  // mouth
  const open = talking ? Math.abs(Math.sin(T * 13.7) * .6 + Math.sin(T * 7.1) * .4) : 0;
  ctx.fillStyle = '#6e2f25'; ctx.beginPath(); ctx.ellipse(0, 62, 34, 4 + open * 20, 0, 0, TAU); ctx.fill();
  if (!talking) { ctx.strokeStyle = '#6e2f25'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 45, 32, .3, Math.PI - .3); ctx.stroke(); }
  ctx.restore();
  // gesture hand
  const gp = talking ? clamp(Math.sin(lt * .9 + 1) * 1.4) : 0;
  if (gp > 0) {
    ctx.save(); ctx.translate(230, 900 - gp * 170); ctx.rotate(-.3);
    ctx.fillStyle = '#3e5566'; ctx.fillRect(-50, 40, 100, 300);
    ctx.fillStyle = '#d9a17c'; ctx.beginPath(); ctx.ellipse(0, 0, 55, 65, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-50, -70, 20, 60); ctx.fillRect(-24, -84, 20, 70); ctx.fillRect(2, -80, 20, 66); ctx.fillRect(28, -64, 18, 54);
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
  // key light falloff
  const kl = ctx.createRadialGradient(cx, 420, 50, cx, 420, 1100); kl.addColorStop(0, 'rgba(255,245,230,.12)'); kl.addColorStop(1, 'rgba(30,20,10,.35)');
  ctx.fillStyle = kl; ctx.fillRect(0, 0, W, H);
  // previz slate
  pill(ctx, 'A-ROLL · HOST ON CAMERA', 70, 70, .9, { size: 20, bg: 'rgba(20,15,10,.6)' });
}

// ── ornamental products (for complementary/other products + material video) ─
function medallion(ctx, cx, cy, r, p = 1, col = '#f1ede5', rot = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r * p, 0, TAU); ctx.fill(); ctx.shadowColor = 'transparent';
  const petals = 16;
  for (let ring = 0; ring < 3; ring++) {
    const rr = r * (.85 - ring * .25) * p;
    for (let i = 0; i < petals; i++) {
      const a = i / petals * TAU + ring * .2;
      ctx.save(); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, -rr, 0, -rr * .5);
      g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(1, 'rgba(255,255,255,.4)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -rr * .72, rr * .13, rr * .26, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, rr * .45, 0, TAU); ctx.stroke();
  }
  const cg = ctx.createRadialGradient(-r * .05, -r * .05, 0, 0, 0, r * .18 * p); cg.addColorStop(0, '#fff'); cg.addColorStop(1, 'rgba(0,0,0,.2)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, r * .16 * p, 0, TAU); ctx.fill();
  ctx.restore();
}

function corbel(ctx, x, y, s, finish = 'walnut', style = 'hewn') {
  // scroll bracket profile filled with wood texture
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const path = new Path2D('M0 0 L180 0 L180 40 C120 50 110 90 150 130 C185 165 150 220 100 205 C60 195 70 150 100 150 C80 140 40 140 30 200 L30 420 L0 420 Z');
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = 12; ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#000'; ctx.fill(path); ctx.shadowColor = 'transparent';
  ctx.save(); ctx.clip(path); ctx.rotate(Math.PI / 2); ctx.drawImage(wood(style, finish), 0, 0, 900, 240, -20, -220, 460, 240); ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 180, 0); g.addColorStop(0, 'rgba(255,240,220,.2)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = g; ctx.fill(path);
  ctx.restore();
}

function strap(ctx, x, y, w, h) {
  // black iron strap wrapped around a beam face with bolts
  ctx.save();
  ctx.fillStyle = '#23201d'; ctx.fillRect(x, y - 6, w, h + 12);
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
  ctx.fillStyle = g; ctx.fillRect(x, y - 6, w, h + 12);
  for (const by of [y + h * .25, y + h * .75]) {
    ctx.fillStyle = '#3c3935'; ctx.beginPath(); ctx.arc(x + w / 2, by, w * .22, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(x + w / 2 - 3, by - 3, w * .08, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function crownProfile(ctx, x, y, s, col = '#efeae1') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const p = new Path2D('M0 0 L40 0 L40 20 C80 20 90 40 100 60 C115 95 150 110 190 115 L190 140 L170 140 C120 135 90 110 70 80 C60 60 50 45 20 45 L20 60 L0 60 Z');
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
  ctx.fillStyle = col; ctx.fill(p); ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(0, 0, 190, 140); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
  ctx.fillStyle = g; ctx.fill(p);
  ctx.restore();
}

// generic card with a title under a drawn product
function productCard(ctx, t, x, y, w, h, title, drawFn, o = {}) {
  const p = seg(t, 0, .8, E.outExpo);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.4); ctx.translate(0, (1 - p) * 60);
  ctx.fillStyle = o.bg || 'rgba(244,236,223,.07)'; roundRect(ctx, x, y, w, h, 22); ctx.fill();
  ctx.strokeStyle = 'rgba(244,236,223,.12)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.save(); ctx.beginPath(); roundRect(ctx, x, y, w, h - 90, 22); ctx.clip(); drawFn(x, y, w, h - 90); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, y + h - 90, w, 1);
  text(ctx, title, x + 32, y + h - 36, font('bold', 34), C.cream);
  if (o.tag) pill(ctx, o.tag, x + w - 32 - tw(ctx, o.tag, font('bold', 18), 3) - 44, y + h - 46, 1, { size: 18 });
  ctx.restore();
}

// ── transitions ─────────────────────────────────────────────────────────────
// beam wipe: a huge beam sweeps across and the next shot is revealed behind it
function beamWipe(ctx, p, drawOld, dir = 1) {
  const e = E.inOutCubic(p);
  const slant = 300, bw = 260;
  const x = lerp(-bw - slant, W + slant, e);
  // old shot is kept on the far side of the beam
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(W + 400, 0); ctx.lineTo(W + 400, H); ctx.lineTo(x - slant, H); ctx.closePath(); ctx.clip();
  drawOld(); ctx.restore();
  // the beam itself (angled)
  const tex = wood('sawn', 'honey');
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetX = 30;
  ctx.beginPath(); ctx.moveTo(x - bw, 0); ctx.lineTo(x, 0); ctx.lineTo(x - slant, H); ctx.lineTo(x - slant - bw, H); ctx.closePath();
  ctx.fillStyle = '#6b4020'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.clip();
  ctx.translate(x - bw - slant / 2, H / 2); ctx.rotate(Math.PI / 2 + Math.atan2(slant, H)); ctx.drawImage(tex, 0, 20, 1600, 200, -H * .75, -bw * .75, H * 1.5, bw * 1.5);
  ctx.restore();
  const g = ctx.createLinearGradient(x - bw, 0, x, 0);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - bw, 0); ctx.lineTo(x, 0); ctx.lineTo(x - slant, H); ctx.lineTo(x - slant - bw, H); ctx.closePath();
  g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.8, 'rgba(255,230,190,.12)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
}

// ── offscreen helper ────────────────────────────────────────────────────────
const _offs = {};
function offscreen(name) {
  if (!_offs[name]) { const c = document.createElement('canvas'); c.width = W; c.height = H; _offs[name] = c; }
  const c = _offs[name], x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
  return [c, x];
}

// before / after slider between two drawings
function beforeAfter(ctx, t, drawBefore, drawAfter, split) {
  drawAfter(ctx);
  const [bc, bx] = offscreen('before'); drawBefore(bx);
  const x = W * split;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip(); ctx.drawImage(bc, 0, 0); ctx.restore();
  ctx.fillStyle = C.cream; ctx.fillRect(x - 2, 0, 4, H);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 20;
  ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(x, H / 2, 38, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 10, H / 2 - 12); ctx.lineTo(x - 22, H / 2); ctx.lineTo(x - 10, H / 2 + 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 10, H / 2 - 12); ctx.lineTo(x + 22, H / 2); ctx.lineTo(x + 10, H / 2 + 12); ctx.stroke();
  pill(ctx, 'BEFORE', 70, 90, clamp(split * 3), { size: 22 });
  pill(ctx, 'AFTER', W - 70 - 140, 90, clamp((1 - split) * 3), { size: 22 });
}

// looking straight up at a ceiling: flaws, then a beam slides over them
function planCeiling(ctx, t, cover) {
  ctx.fillStyle = '#efe9df'; ctx.fillRect(0, 0, W, H);
  const R = rng(12);
  for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},${R() * .05})`; ctx.fillRect(R() * W, R() * H, 2 + R() * 4, 2 + R() * 4); }
  const y0 = 390, y1 = 690;
  // taped seam
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, 470, W, 60);
  ctx.fillStyle = 'rgba(120,100,80,.18)'; ctx.fillRect(0, 468, W, 3); ctx.fillRect(0, 530, W, 3);
  // crack
  ctx.strokeStyle = 'rgba(70,55,40,.8)'; ctx.lineWidth = 3; ctx.beginPath();
  let x = 180, y = 560; ctx.moveTo(x, y);
  for (let i = 0; i < 28; i++) { x += 22 + R() * 20; y = clamp(y + (R() - .5) * 28, 560, 660); ctx.lineTo(x, y); }
  ctx.stroke();
  // surface wiring in a raceway
  ctx.fillStyle = '#d8d3cb'; ctx.fillRect(900, 420, 1020, 26); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(900, 442, 1020, 4);
  for (let k = 0; k < 5; k++) { ctx.fillStyle = '#bdb6aa'; ctx.fillRect(960 + k * 190, 414, 14, 38); }
  const labels = [['Crack', 420, 640], ['Drywall seam', 180, 450], ['Surface wiring', 1250, 395]];
  labels.forEach(([s, lx, ly], i) => pill(ctx, s, lx, ly, seg(t, .3 + i * .35, .4) * (1 - seg(t, 2.6, .4)), { size: 22, bg: 'rgba(160,50,30,.85)', stroke: false }));
  // beam (seen from below) slides in
  const p = E.inOutCubic(cover);
  if (p > 0) {
    const tex = wood('hewn', 'walnut');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    ctx.fillStyle = '#3d2415'; ctx.fillRect(-20 + (p - 1) * W, y0, W + 40, y1 - y0); ctx.restore();
    ctx.drawImage(tex, 0, 10, 1600, 220, -20 + (p - 1) * W, y0, W + 40, y1 - y0);
    const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.15, 'rgba(0,0,0,0)'); g.addColorStop(.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
    ctx.fillStyle = g; ctx.fillRect((p - 1) * W, y0, W, y1 - y0);
  }
  if (cover >= 1) pill(ctx, '✓  HIDDEN', W / 2, 800, seg(t, 3.6, .4), { size: 28, align: 'center', bg: C.ink });
}

// cut-away of the U-channel profile: skin, core, channel
function materialSection(ctx, t, o = {}) {
  const cx = o.cx ?? 620, cy = o.cy ?? 560, s = o.s ?? 1;
  const bw = 520, bh = 420, wall = 52;
  const p = seg(t, 0, 1, E.outExpo);
  ctx.save(); ctx.translate(cx, cy + (1 - p) * 60); ctx.scale(s, s); ctx.globalAlpha *= p;
  const U = new Path2D(`M${-bw / 2} ${-bh / 2} L${-bw / 2 + wall} ${-bh / 2} L${-bw / 2 + wall} ${bh / 2 - wall} L${bw / 2 - wall} ${bh / 2 - wall} L${bw / 2 - wall} ${-bh / 2} L${bw / 2} ${-bh / 2} L${bw / 2} ${bh / 2} L${-bw / 2} ${bh / 2} Z`);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 25; ctx.fillStyle = '#e9dcc2'; ctx.fill(U); ctx.restore();
  // foam cells
  ctx.save(); ctx.clip(U);
  const R = rng(31);
  for (let i = 0; i < 1400; i++) { const x = (R() - .5) * bw, y = (R() - .5) * bh, r = 1.5 + R() * 4.5; ctx.fillStyle = `rgba(150,120,80,${.12 + R() * .2})`; ctx.beginPath(); ctx.ellipse(x, y, r, r * .8, R() * 3, 0, TAU); ctx.fill(); }
  // dense skin with wood texture on outside
  const tex = wood(o.style || 'hewn', o.finish || 'walnut');
  ctx.lineWidth = 22; ctx.strokeStyle = ctx.createPattern(tex, 'repeat'); ctx.stroke(U);
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(40,20,5,.6)'; ctx.stroke(U);
  ctx.restore();
  ctx.restore();
  // callouts
  const calls = o.calls || [
    ['Open channel fits over a mounting block', 0, -bh / 2 + 60],
    ['Lightweight rigid core', bw / 2 - wall / 2, -40],
    ['Wood-grain texture, molded from real timber', bw / 2, 80],
    ['Dense, durable outer skin', bw / 2 - 8, bh / 2 - 6],
  ];
  calls.forEach(([label, px, py], i) => {
    const q = seg(t, .6 + i * .45, .7, E.outCubic);
    if (q <= 0) return;
    const ax = cx + px * s, ay = cy + py * s, lx = 1040, ly = 330 + i * 130;
    drawPath(ctx, [[ax, ay], [lx - 40, ly], [lx, ly]], q, C.accent2, 3);
    ctx.fillStyle = C.accent2; ctx.beginPath(); ctx.arc(ax, ay, 8 * q, 0, TAU); ctx.fill();
    text(ctx, label, lx + 20, ly + 12, font('bold', 34), C.cream, 'left', 0, inv(.5, 1, q));
  });
}

// casting process in section view; u runs 0 → 5
function moldProcess(ctx, t, u, o = {}) {
  const cx = W / 2 + (o.dx || 0), by = o.by ?? 800, bw = 1200, bh = 330;
  const tex = wood('hewn', 'walnut'), raw = '#efe3c8';
  const tIn = by - bh + 40, tH = 170, tW = 960;
  const st = Math.floor(clamp(u, 0, 4.999));
  // tray walls
  ctx.fillStyle = '#5b6b75'; ctx.fillRect(cx - bw / 2 - 24, by - bh, 24, bh + 24); ctx.fillRect(cx + bw / 2, by - bh, 24, bh + 24); ctx.fillRect(cx - bw / 2 - 24, by, bw + 48, 24);
  const sil = clamp(u - .15), lift = clamp(u - 1.2), pour = clamp(u - 2.1), exp = clamp(u - 2.9), demold = clamp(u - 3.6), fin = clamp(u - 4.2);
  // silicone mold material
  if (sil > 0) {
    const lvl = lerp(by, by - bh + 10, E.inOutCubic(sil));
    ctx.fillStyle = '#8fa5b1'; ctx.fillRect(cx - bw / 2, lvl, bw, by - lvl);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(cx - bw / 2, lvl, bw, 6);
  }
  // cavity (after the timber is lifted out) shows the imprinted grain
  if (lift > 0) {
    ctx.save(); ctx.globalAlpha = clamp(lift * 3);
    ctx.fillStyle = '#48575f'; ctx.fillRect(cx - tW / 2, tIn - 30, tW, tH + 30);
    ctx.globalAlpha *= .3; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(tex, 0, 120, 1600, 110, cx - tW / 2, tIn, tW, tH); ctx.restore();
  }
  // liquid fills, then expands
  if (pour > 0 && demold < 1) {
    const fill = E.inOutSine(clamp(pour * 1.2)) * .55 + E.outCubic(exp) * .45;
    const top = lerp(tIn + tH, tIn - 30, fill);
    ctx.fillStyle = rgba(mixc(hex('#d9a24f'), hex(raw), exp));
    ctx.fillRect(cx - tW / 2, top, tW, tIn + tH - top);
    if (exp > 0) { const R = rng(5); for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${.25 * (1 - exp)})`; ctx.beginPath(); ctx.arc(cx - tW / 2 + R() * tW, top + R() * (tIn + tH - top), 2 + R() * 6, 0, TAU); ctx.fill(); } }
    if (pour < .85) { ctx.fillStyle = '#d9a24f'; ctx.fillRect(cx - 280 - 7, 0, 14, top); }
  }
  // the timber master (stage 0-1) or the finished cast beam (4-5)
  if (lift < 1) {
    const ty = tIn - E.inOutCubic(lift) * 700;
    ctx.save(); ctx.globalAlpha = 1 - lift;
    ctx.drawImage(tex, 0, 110, 1600, 120, cx - tW / 2, ty, tW, tH); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(cx - tW / 2, ty + tH - 12, tW, 12);
    ctx.restore();
  }
  if (demold > 0) {
    const ty = tIn - 30 - E.inOutCubic(demold) * 330;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20 * demold;
    ctx.fillStyle = raw; ctx.fillRect(cx - tW / 2, ty, tW, tH + 30); ctx.restore();
    ctx.save(); ctx.globalAlpha = .5; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(wood('hewn', 'primed'), 0, 110, 1600, 120, cx - tW / 2, ty, tW, tH + 30); ctx.restore();
    if (fin > 0) {
      const bx = cx - tW / 2 + tW * E.inOutSine(fin);
      ctx.save(); ctx.beginPath(); ctx.rect(cx - tW / 2, ty, bx - (cx - tW / 2), tH + 30); ctx.clip();
      ctx.drawImage(wood('hewn', o.finish || 'honey'), 0, 110, 1600, 120, cx - tW / 2, ty, tW, tH + 30); ctx.restore();
      // brush
      ctx.save(); ctx.translate(bx, ty + (tH + 30) / 2 + Math.sin(t * 18) * 30); ctx.rotate(-.35);
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-14, -210, 28, 150); ctx.fillStyle = '#b7b1a7'; ctx.fillRect(-26, -64, 52, 30); ctx.fillStyle = '#2d1e12'; ctx.fillRect(-26, -34, 52, 44);
      ctx.restore();
    }
  }
  const labels = o.labels || ['Mold taken from real timber', 'Mold taken from real timber', 'Liquid polyurethane poured in', 'Expands & cures into a rigid form', 'Demolded & hand-finished'];
  const li = u < 1.2 ? 0 : u < 2.1 ? 1 : u < 2.9 ? 2 : u < 3.6 ? 3 : 4;
  const num = [1, 1, 2, 3, 4][li];
  text(ctx, '0' + num, 120, 250, font('bold', 120), C.accent, 'left', -4);
  text(ctx, labels[li], 300, 225, font('bold', 52), C.cream);
}

function compareTable(ctx, t, rows, o = {}) {
  const x0 = 180, y0 = 250, cw = [620, 480, 480], rh = 110;
  const hx = [x0, x0 + cw[0], x0 + cw[0] + cw[1]];
  const hp = seg(t, 0, .6, E.outExpo);
  ctx.save(); ctx.globalAlpha = hp;
  ctx.fillStyle = 'rgba(208,138,60,.16)'; roundRect(ctx, hx[2] - 10, y0 - 70, cw[2], rh * rows.length + 90, 20); ctx.fill();
  text(ctx, o.a || 'SOLID TIMBER', hx[1] + 20, y0 - 20, font('bold', 28), C.muted, 'left', 4);
  text(ctx, o.b || 'FAUX BEAMS', hx[2] + 20, y0 - 20, font('bold', 28), C.accent2, 'left', 4);
  ctx.restore();
  rows.forEach(([label, a, b], i) => {
    const p = seg(t, .4 + i * .55, .7, E.outExpo);
    if (p <= 0) return;
    const y = y0 + i * rh;
    ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * -60, 0);
    ctx.fillStyle = 'rgba(244,236,223,.1)'; ctx.fillRect(x0, y + rh - 1, cw[0] + cw[1] + cw[2] - 20, 1);
    text(ctx, label, x0, y + 66, font('bold', 38), C.cream);
    icon(ctx, 'cross', hx[1] + 44, y + 54, .42, seg(t, .6 + i * .55, .5), '#c9674d', 9);
    text(ctx, a, hx[1] + 90, y + 64, font('normal', 30), C.muted);
    icon(ctx, 'check', hx[2] + 44, y + 54, .5, seg(t, .75 + i * .55, .5), C.accent2, 9);
    text(ctx, b, hx[2] + 90, y + 64, font('bold', 30), C.cream);
    ctx.restore();
  });
}

function ceilingDome(ctx, cx, cy, r) {
  const g = ctx.createRadialGradient(cx - r * .2, cy - r * .25, r * .1, cx, cy, r);
  g.addColorStop(0, '#fffdf8'); g.addColorStop(.7, '#e6ddcf'); g.addColorStop(1, '#bfb4a2');
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 6;
  for (const k of [.92, .8]) { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, TAU); ctx.stroke(); }
}

function mantelMini(ctx, x, y, w, h) {
  ctx.fillStyle = '#d7ccbb'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#9a9185'; ctx.fillRect(x + w * .22, y + h * .5, w * .56, h * .5);
  ctx.fillStyle = '#1d1511'; ctx.fillRect(x + w * .36, y + h * .64, w * .28, h * .36);
  const g = ctx.createRadialGradient(x + w / 2, y + h * .95, 5, x + w / 2, y + h * .95, w * .2); g.addColorStop(0, 'rgba(255,150,60,.9)'); g.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = g; ctx.fillRect(x + w * .3, y + h * .7, w * .4, h * .3);
  beam2D(ctx, x + w * .16, y + h * .38, w * .68, h * .11, 'hewn', 'walnut', { dep: h * .06, shadow: true });
}

// CTA: url bar + button click
function ctaCard(ctx, t, line1, line2) {
  bgInk(ctx, t);
  motes(ctx, t, 40, 21);
  headline(ctx, [line1], W / 2, 400, t, { size: 96, align: 'center' });
  const p = seg(t, .5, .8, E.outExpo);
  ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 40);
  ctx.fillStyle = 'rgba(244,236,223,.95)'; roundRect(ctx, W / 2 - 520, 500, 1040, 110, 55); ctx.fill();
  text(ctx, BRAND.url, W / 2 - 460, 572, font('bold', 44), C.ink, 'left', 1);
  const press = seg(t, 2.2, .15) - seg(t, 2.35, .25);
  const bw = 300, bx = W / 2 + 520 - bw - 12;
  ctx.fillStyle = C.accent; roundRect(ctx, bx, 512 + press * 4, bw, 86, 43); ctx.fill();
  text(ctx, line2, bx + bw / 2, 568 + press * 4, font('bold', 34), C.ink, 'center', 2);
  // cursor
  const cp = seg(t, 1.1, 1.1, E.inOutCubic);
  const mx = lerp(W / 2 + 700, bx + bw / 2 + 10, cp), my = lerp(820, 560, cp);
  ctx.translate(mx, my); ctx.scale(1 - press * .15, 1 - press * .15);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.lineTo(12, 35); ctx.lineTo(22, 56); ctx.lineTo(30, 52); ctx.lineTo(20, 32); ctx.lineTo(36, 32); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  if (t > 2.3) { const rp = seg(t, 2.3, .6); ctx.strokeStyle = `rgba(240,184,114,${1 - rp})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(bx + bw / 2 + 10, 560, 20 + rp * 80, 0, TAU); ctx.stroke(); }
}

// ── material-video pieces ───────────────────────────────────────────────────
function crownRun(ctx, x, y, s, len, col = '#f0ebe2') {
  // crown moulding seen in elevation: a run of shaded bands (fillet, cove, bead, ogee)
  const bands = [[10, .95, .8], [8, .6, .6], [34, .55, 1.05], [6, .75, .75], [12, 1.1, .7], [6, .6, .6], [40, 1.05, .6], [10, .8, .8]];
  const base = hex(col);
  ctx.save(); ctx.translate(x, y);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 24 * s; ctx.shadowOffsetY = 12 * s;
  const total = bands.reduce((a, b) => a + b[0], 0) * s;
  ctx.fillStyle = col; ctx.fillRect(0, 0, len, total); ctx.shadowColor = 'transparent';
  let yy = 0;
  for (const [h, a, b] of bands) {
    const g = ctx.createLinearGradient(0, yy, 0, yy + h * s);
    g.addColorStop(0, rgba(base.map(c => clamp(c * a, 0, 255)))); g.addColorStop(1, rgba(base.map(c => clamp(c * b, 0, 255))));
    ctx.fillStyle = g; ctx.fillRect(0, yy, len, h * s); yy += h * s;
  }
  // mitred end showing the profile
  ctx.fillStyle = rgba(base.map(c => c * .82));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-26 * s, 18 * s); ctx.bezierCurveTo(-30 * s, 60 * s, -6 * s, 70 * s, -12 * s, total - 10 * s); ctx.lineTo(0, total); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function balance(ctx, t, tilt, o = {}) {
  const cx = W / 2, cy = 380, arm = 560;
  ctx.save();
  ctx.fillStyle = '#3a2f26'; ctx.beginPath(); ctx.moveTo(cx - 90, 900); ctx.lineTo(cx + 90, 900); ctx.lineTo(cx + 20, cy); ctx.lineTo(cx - 20, cy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a211b'; ctx.fillRect(cx - 200, 890, 400, 30);
  ctx.translate(cx, cy); ctx.rotate(tilt);
  ctx.fillStyle = '#b9a07a'; roundRect(ctx, -arm, -12, arm * 2, 24, 12); ctx.fill();
  ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fill();
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(side * (arm - 40), 0); ctx.rotate(-tilt);
    ctx.strokeStyle = '#8f7a5c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-170, 200); ctx.moveTo(0, 0); ctx.lineTo(170, 200); ctx.stroke();
    ctx.fillStyle = '#6f5c45'; ctx.fillRect(-190, 200, 380, 16);
    if (side < 0) { // solid timber: a dense block
      ctx.drawImage(wood('smooth', 'walnut'), 0, 60, 900, 120, -170, 90, 340, 110);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-170, 90, 340, 110);
      text(ctx, 'SOLID TIMBER', 0, 250, font('bold', 24), C.cream, 'center', 4);
    } else {
      beam2D(ctx, -170, 110, 340, 72, 'hewn', 'honey', { dep: 34, shadow: false, end: 'hollow' });
      text(ctx, 'POLYURETHANE', 0, 250, font('bold', 24), C.accent2, 'center', 4);
    }
    ctx.restore();
  }
  ctx.restore();
}

function droplets(ctx, t, x0, y0, len, hgt, n = 26) {
  const R = rng(19);
  for (let i = 0; i < n; i++) {
    const dx = x0 + 40 + R() * (len - 80), start = R() * 2.2, r = 9 + R() * 12;
    const lt = t - start; if (lt < 0) continue;
    const fall = clamp(lt / .45);
    const sy = y0 + R() * hgt * .8 + 10;
    let y = lerp(-40, sy, E.inQuad(fall)), x = dx;
    if (fall >= 1) { const roll = Math.max(0, lt - .8 - R() * 1.2); y += roll * roll * 120; x += roll * 18; }
    if (y > y0 + hgt + 60) continue;
    const rr = fall < 1 ? r * .7 : r;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 4, rr, rr * .85, 0, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(x - rr * .3, y - rr * .35, 1, x, y, rr);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.25, 'rgba(210,230,240,.35)'); g.addColorStop(1, 'rgba(160,190,210,.18)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rr * (fall < 1 ? .7 : 1), rr * (fall < 1 ? 1.2 : .85), 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function termites(ctx, t, tx, ty) {
  const R = rng(8);
  for (let i = 0; i < 9; i++) {
    const a0 = R() * TAU, dist = 300 + R() * 120, sp = .6 + R() * .4;
    // walk in toward the beam, sniff, turn back
    const ph = (t * sp + R()) % 3;
    const k = ph < 1.3 ? E.outCubic(ph / 1.3) : ph < 1.7 ? 1 : 1 - E.inCubic((ph - 1.7) / 1.3);
    const r = lerp(dist, 170, k);
    const x = tx + Math.cos(a0) * r * 1.9, y = ty + Math.sin(a0) * r * .8;
    const head = ph < 1.7 ? a0 + Math.PI : a0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(head); ctx.scale(1.8, 1.8);
    ctx.strokeStyle = '#3b2a1c'; ctx.lineWidth = 2;
    for (let l = -1; l <= 1; l++) { const w = Math.sin(t * 20 + i + l) * 4; ctx.beginPath(); ctx.moveTo(l * 6, -4); ctx.lineTo(l * 6 + w, -14); ctx.moveTo(l * 6, 4); ctx.lineTo(l * 6 - w, 14); ctx.stroke(); }
    ctx.fillStyle = '#6b4a2e'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3b2a1c'; ctx.beginPath(); ctx.arc(15, 0, 6, 0, TAU); ctx.fill();
    ctx.restore();
    if (ph > 1.3 && ph < 1.9) text(ctx, '?', x, y - 44, font('bold', 44), C.accent2, 'center', 0, inv(1.3, 1.5, ph) * (1 - inv(1.7, 1.9, ph)));
  }
}

function magnifier(ctx, t, style, finish, lx, ly, r = 230, z = 2.6) {
  const tex = wood(style, finish, 'macro');
  ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, r, 0, TAU); ctx.clip();
  const sw = W / 1.2, sh = H / 1.2;
  const bx = (lx / W) * sw + 200, by = (ly / H) * sh + 60; // matching point in texture
  ctx.drawImage(tex, bx - r / z, by - r / z, 2 * r / z, 2 * r / z, lx - r, ly - r, 2 * r, 2 * r);
  const g = ctx.createRadialGradient(lx - r * .3, ly - r * .4, 0, lx, ly, r);
  g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.7, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = g; ctx.fillRect(lx - r, ly - r, 2 * r, 2 * r);
  ctx.restore();
  ctx.save();
  ctx.lineWidth = 22; ctx.strokeStyle = '#2b241e'; ctx.beginPath(); ctx.arc(lx, ly, r + 11, 0, TAU); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(lx, ly, r + 2, -2.4, -1.2); ctx.stroke();
  ctx.translate(lx, ly); ctx.rotate(.75); ctx.fillStyle = '#2b241e'; roundRect(ctx, r + 14, -24, 240, 48, 20); ctx.fill(); ctx.fillStyle = C.accent; ctx.fillRect(r + 14, -24, 26, 48);
  ctx.restore();
}

// beam drawn in vertical strips so it can bend/twist (for the "solid wood moves" demo)
function warpedBeam(ctx, x, y, len, hgt, style, finish, bend, crack) {
  const [oc, ox] = offscreen('warp');
  beam2D(ox, 20, 60, len, hgt, style, finish, { dep: hgt * .45, shadow: false });
  const strip = 6;
  for (let sx = 0; sx < len + 40; sx += strip) {
    const u = sx / len, off = Math.sin(Math.PI * u) * bend - bend * .3, tw_ = Math.sin(Math.PI * u) * bend * .012;
    ctx.save(); ctx.translate(x + sx, y + off); ctx.transform(1, tw_, 0, 1, 0, 0);
    ctx.drawImage(oc, 20 + sx, 0, strip + 1, hgt * 1.6 + 60, 0, -60, strip + 1, hgt * 1.6 + 60);
    ctx.restore();
  }
  if (crack > 0) {
    const R = rng(3); let px = x + len * .3, py = y + hgt * .45 + Math.sin(Math.PI * .3) * bend - bend * .3;
    ctx.save(); ctx.strokeStyle = 'rgba(20,10,4,.85)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py);
    const steps = Math.floor(22 * crack);
    for (let i = 0; i < steps; i++) { px += 18; const u = (px - x) / len; py = y + hgt * .45 + (R() - .5) * 10 + Math.sin(Math.PI * u) * bend - bend * .3; ctx.lineTo(px, py); }
    ctx.stroke(); ctx.restore();
  }
}

function sawBlade(ctx, x, y, r, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = '#b9bcc0'; ctx.beginPath();
  for (let i = 0; i < 48; i++) { const q = i / 48 * TAU; ctx.lineTo(Math.cos(q) * r, Math.sin(q) * r); ctx.lineTo(Math.cos(q + .07) * (r + 14), Math.sin(q + .07) * (r + 14)); }
  ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(-r * .3, -r * .3, 0, 0, 0, r); g.addColorStop(0, '#e7e9eb'); g.addColorStop(1, '#8d9196');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r - 6, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4a4d52'; ctx.beginPath(); ctx.arc(0, 0, r * .18, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.arc(r * .55, 0, r * .12, 0, TAU); ctx.stroke(); }
  ctx.restore();
}

function roller(ctx, x, y, col) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = '#555'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(60, -150); ctx.lineTo(60, -320); ctx.stroke();
  ctx.fillStyle = '#2f2a25'; roundRect(ctx, 45, -440, 30, 130, 12); ctx.fill();
  ctx.fillStyle = col; roundRect(ctx, -70, -150, 140, 60, 26); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(-60, -142, 120, 12);
  ctx.restore();
}
