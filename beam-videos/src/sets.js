// ─────────────────────────────────────────────────────────────────────────────
//  Sets: procedural rooms that show the beams in application.
//  Units are metres. y is up, the camera usually looks down -z.
// ─────────────────────────────────────────────────────────────────────────────
let _planks;
const planks = () => _planks || (_planks = plankTexture(5));

function tiledPlane(p0, p1, p3, tex, nx, ny, opt = {}) {
  const f = plane(p0, p1, p3, opt.color || '#a07850', nx, ny, opt);
  for (const c of f) { c.tex = tex; c.uv = [[0, 0], [tex.width, 0], [tex.width, tex.height], [0, tex.height]]; c.segs = 2; }
  return f;
}

// soft contact shadow either side of a ceiling beam (stacked translucent strips)
function ceilingAO(x0, x1, zc, halfW, yc, axis = 'x', strength = .28) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const w0 = halfW + i * .06, w1 = halfW + (i + 1) * .06, a = strength * (1 - i / 4);
    for (const s of [-1, 1]) {
      const za = zc + s * w0, zb = zc + s * w1;
      const pts = axis === 'x'
        ? [[x0, yc, Math.min(za, zb)], [x1, yc, Math.min(za, zb)], [x1, yc, Math.max(za, zb)], [x0, yc, Math.max(za, zb)]]
        : [[Math.min(za, zb), yc, x0], [Math.max(za, zb), yc, x0], [Math.max(za, zb), yc, x1], [Math.min(za, zb), yc, x1]];
      out.push({ p: pts, n: [0, -1, 0], color: '#2a1d12', alpha: a, double: true, lum: 1 / .9 });
    }
  }
  return out;
}

function sofa(x, z, col = '#6f7a63', rot = false) {
  const f = [];
  const b = (c, s) => f.push(...box(c, s[0], s[1], s[2], { color: col }));
  if (!rot) {
    b([x, .22, z], [2.4, .44, .95]); b([x, .62, z - .38], [2.4, .5, .2]);
    b([x - 1.12, .45, z], [.22, .5, .95]); b([x + 1.12, .45, z], [.22, .5, .95]);
  } else {
    b([x, .22, z], [.95, .44, 2.4]); b([x - .38, .62, z], [.2, .5, 2.4]);
    b([x, .45, z - 1.12], [.95, .5, .22]); b([x, .45, z + 1.12], [.95, .5, .22]);
  }
  return f;
}

function windowPanel(x, y, z, w, h, axis = 'z', glow = 1) {
  // bright glass rectangle set into a wall (axis = wall normal axis)
  const hw = w / 2, hh = h / 2, out = [];
  const pts = axis === 'x'
    ? [[x, y - hh, z + hw], [x, y - hh, z - hw], [x, y + hh, z - hw], [x, y + hh, z + hw]]
    : [[x - hw, y - hh, z], [x + hw, y - hh, z], [x + hw, y + hh, z], [x - hw, y + hh, z]];
  out.push({ p: pts, n: axis === 'x' ? [1, 0, 0] : [0, 0, 1], color: '#fffaf0', emit: true, bloom: 'rgba(255,236,200,.9)', bloomR: 90 * glow, double: true });
  // mullions
  const mul = (a, b) => out.push(...box(a, ...b, { color: '#e8dfd0', lum: 1.2 }));
  if (axis === 'x') { mul([x + .02, y, z], [.04, h, .06]); mul([x + .02, y, z], [.04, .06, w]); }
  else { mul([x, y, z + .02], [.06, h, .04]); mul([x, y, z + .02], [w, .06, .04]); }
  return out;
}

let WALL = '#e6dccd', CEIL = '#f2ebe0', RUG = '#b9a88e';

// ── Set A: great room with parallel beams ─────────────────────────────────
// build(p) where p ∈ [0,1] drives beams dropping into place (0 = bare ceiling)
function greatRoom(o = {}) {
  const style = o.style || 'hewn', finish = o.finish || 'honey';
  const Wd = 9, D = 12, Hc = 3.4;
  const WALL = o.wall || '#e6dccd', CEIL = o.ceil || '#f2ebe0';
  const shell = [
    ...tiledPlane([-Wd / 2, 0, 1], [Wd / 2, 0, 1], [-Wd / 2, 0, -D], planks(), 5, 7, { color: '#9c7249' }), // floor faces up? winding check below
    ...plane([-Wd / 2, Hc, -D], [Wd / 2, Hc, -D], [-Wd / 2, Hc, 1], CEIL, 10, 14),                            // ceiling (faces down)
    ...plane([-Wd / 2, 0, -D], [Wd / 2, 0, -D], [-Wd / 2, Hc, -D], WALL, 10, 5),                            // back wall
    ...plane([-Wd / 2, 0, 1], [-Wd / 2, 0, -D], [-Wd / 2, Hc, 1], WALL, 12, 5),                             // left wall
    ...plane([Wd / 2, 0, -D], [Wd / 2, 0, 1], [Wd / 2, Hc, -D], WALL, 12, 5),                               // right wall
  ];
  // fix normals so each plane faces into the room
  for (const f of shell) {
    const c = v3.mul(f.p.reduce((s, p) => v3.add(s, p), [0, 0, 0]), .25);
    const toCenter = v3.sub([0, Hc / 2, -D / 2], c);
    if (v3.dot(f.n, toCenter) < 0) f.n = v3.mul(f.n, -1);
  }
  const decals = [
    ...windowPanel(-Wd / 2 + .01, 1.7, -3.5, 1.6, 2.2, 'x'),
    ...windowPanel(-Wd / 2 + .01, 1.7, -7, 1.6, 2.2, 'x'),
    ...windowPanel(0, 1.55, -D + .01, 3.2, 2.1, 'z'),
    { p: [[-1.9, .005, -4.2], [1.9, .005, -4.2], [1.9, .005, -7.4], [-1.9, .005, -7.4]].reverse(), n: [0, 1, 0], color: o.rug || RUG, lum: 1 },
  ];
  const n = o.count || 6;
  const beams = [], ao = [];
  const drop = o.drop ?? 1;
  for (let i = 0; i < n; i++) {
    const z = -1 - i * (D - 2) / (n - 1) * .95;
    const pi = E.outBack(clamp(drop * (n + 2) / 2 - i * .5)); // staggered drop
    const bh = .28, bw = .22;
    const y = Hc - bh / 2 + (1 - pi) * -1.6;
    if (pi <= 0) continue;
    beams.push(...beam([0, y, z], Wd, bw, bh, style, finish, 'x', { uOff: (i * .13) % .6 }));
    if (pi > .9) ao.push(...ceilingAO(-Wd / 2, Wd / 2, z, bw / 2, Hc - .002, 'x', .3 * inv(.9, 1, pi)));
  }
  const props = o.props === false ? [] : [
    ...sofa(0, -7.9, o.sofa || '#7b826c'),
    ...box([0, .2, -5.8], [1.4, .4, .7], { color: '#5a4030' }),
  ];
  const L = {
    ambient: .62, sun: v3.norm([.8, .35, .1]), sunI: .28, tint: '#fff4e6',
    points: [{ p: [-3.4, 1.9, -5.2], i: .9, k: .25 }, { p: [0, 1.8, -10.5], i: .6, k: .25 }],
  };
  return { layers: [shell, decals, [...ao], [...props, ...beams]], L };
}

// ── Set B: coffered ceiling grid ─────────────────────────────────────────
function cofferRoom(o = {}) {
  const style = o.style || 'smooth', finish = o.finish || 'espresso';
  const Wd = 8, D = 10, Hc = 3.1;
  const shell = [
    ...tiledPlane([-Wd / 2, 0, 1], [Wd / 2, 0, 1], [-Wd / 2, 0, -D], planks(), 4, 6),
    ...plane([-Wd / 2, Hc, -D], [Wd / 2, Hc, -D], [-Wd / 2, Hc, 1], '#f4efe6', 10, 12),
    ...plane([-Wd / 2, 0, -D], [Wd / 2, 0, -D], [-Wd / 2, Hc, -D], '#dcd3c3', 8, 4),
    ...plane([-Wd / 2, 0, 1], [-Wd / 2, 0, -D], [-Wd / 2, Hc, 1], '#e4dbcc', 10, 4),
    ...plane([Wd / 2, 0, -D], [Wd / 2, 0, 1], [Wd / 2, Hc, -D], '#e4dbcc', 10, 4),
  ];
  for (const f of shell) {
    const c = v3.mul(f.p.reduce((s, p) => v3.add(s, p), [0, 0, 0]), .25);
    if (v3.dot(f.n, v3.sub([0, Hc / 2, -D / 2], c)) < 0) f.n = v3.mul(f.n, -1);
  }
  const decals = [...windowPanel(Wd / 2 - .01, 1.6, -5, 2.4, 2, 'x')];
  const beams = [], ao = [], bh = .24, bw = .2, p = o.drop ?? 1;
  const xs = [-2.7, -.9, .9, 2.7], zs = [-.6, -3.4, -6.2, -9];
  xs.forEach((x, i) => {
    const pi = E.outCubic(clamp(p * 2.2 - i * .25));
    if (pi > 0) { beams.push(...beam([x, Hc - bh / 2 - (1 - pi) * 1.2, -D / 2 + .5], D + 1, bw, bh, style, finish, 'z', { uOff: i * .1 })); ao.push(...ceilingAO(-D, 1, x, bw / 2, Hc - .002, 'z', .22 * pi)); }
  });
  zs.forEach((z, i) => {
    const pi = E.outCubic(clamp(p * 2.2 - .6 - i * .25));
    if (pi > 0) { beams.push(...beam([0, Hc - bh / 2 + .01 - (1 - pi) * 1.2, z], Wd, bw * .9, bh * .95, style, finish, 'x', { uOff: .3 + i * .1 })); ao.push(...ceilingAO(-Wd / 2, Wd / 2, z, bw / 2, Hc - .002, 'x', .22 * pi)); }
  });
  const props = [
    ...box([0, .38, -5.2], [3, .06, 1.2], { color: '#3b2c22' }),
    ...box([-1.3, .19, -5.2], [.1, .38, 1], { color: '#2e2219' }), ...box([1.3, .19, -5.2], [.1, .38, 1], { color: '#2e2219' }),
    ...[-1, 0, 1].flatMap(k => [...box([k, .25, -4.2], [.45, .5, .45], { color: '#c9b79a' }), ...box([k, .25, -6.2], [.45, .5, .45], { color: '#c9b79a' })]),
  ];
  const L = { ambient: .64, sun: v3.norm([-.7, .3, .2]), sunI: .25, tint: '#fff6ea', points: [{ p: [3.5, 1.7, -5], i: .8, k: .3 }] };
  return { layers: [shell, decals, ao, [...props, ...beams]], L };
}

// ── Set C: vaulted ceiling with a ridge + rafters ────────────────────────
function vaultRoom(o = {}) {
  const style = o.style || 'sawn', finish = o.finish || 'walnut';
  const Wd = 9, D = 12, Hw = 2.8, Hr = 5.2;
  const shell = [
    ...tiledPlane([-Wd / 2, 0, 1], [Wd / 2, 0, 1], [-Wd / 2, 0, -D], planks(), 5, 7),
    ...plane([-Wd / 2, Hw, 1], [-Wd / 2, Hw, -D], [0, Hr, 1], '#efe7da', 12, 6),   // left slope
    ...plane([0, Hr, 1], [0, Hr, -D], [Wd / 2, Hw, 1], '#efe7da', 12, 6),          // right slope
    ...plane([-Wd / 2, 0, -D], [Wd / 2, 0, -D], [-Wd / 2, Hw, -D], WALL, 8, 4),
    ...plane([-Wd / 2, 0, 1], [-Wd / 2, 0, -D], [-Wd / 2, Hw, 1], WALL, 10, 4),
    ...plane([Wd / 2, 0, -D], [Wd / 2, 0, 1], [Wd / 2, Hw, -D], WALL, 10, 4),
  ];
  // gable triangle on back wall
  shell.push({ p: [[-Wd / 2, Hw, -D], [Wd / 2, Hw, -D], [0, Hr, -D], [0, Hr, -D]], n: [0, 0, 1], color: WALL });
  for (const f of shell) {
    const c = v3.mul(f.p.reduce((s, p) => v3.add(s, p), [0, 0, 0]), .25);
    if (v3.dot(f.n, v3.sub([0, 2, -D / 2], c)) < 0) f.n = v3.mul(f.n, -1);
  }
  const decals = [...windowPanel(0, 3.4, -D + .01, 1.6, 1.3, 'z', 1.1), ...windowPanel(-1.6, 1.4, -D + .01, 1.2, 2, 'z'), ...windowPanel(1.6, 1.4, -D + .01, 1.2, 2, 'z')];
  const beams = [], p = o.drop ?? 1;
  const pr = E.outCubic(clamp(p * 2));
  if (pr > 0) beams.push(...beam([0, Hr - .18 - (1 - pr) * 1.5, -D / 2 + .5], D + 1, .26, .32, style, finish, 'z'));
  // rafters follow the slope: build as rotated quads manually
  const n = 7;
  for (let i = 0; i < n; i++) {
    const z = -.5 - i * (D - 1) / (n - 1);
    const pi = E.outCubic(clamp(p * 2 - .4 - i * .12));
    if (pi <= 0) continue;
    for (const s of [-1, 1]) {
      const a = [s * (Wd / 2), Hw - .02, z], b = [s * .15, Hr - .05, z];
      const dn = v3.norm([s * (Hr - Hw), -(Wd / 2), 0].map((q, k) => k === 1 ? -Math.abs(q) : q));
      const off = v3.mul(dn, .24 * pi);
      const hw = .1;
      const tex = wood(style, finish);
      const bot = [v3.add(v3.add(a, off), [0, 0, hw]), v3.add(v3.add(b, off), [0, 0, hw]), v3.add(v3.add(b, off), [0, 0, -hw]), v3.add(v3.add(a, off), [0, 0, -hw])];
      const uvF = [[0, 30], [tex.width * .8, 30], [tex.width * .8, 110], [0, 110]];
      beams.push({ p: s > 0 ? bot : [bot[1], bot[0], bot[3], bot[2]], n: dn, tex, uv: uvF, color: '#5a3a24', double: true });
      for (const zz of [hw, -hw]) {
        const side = [v3.add(a, [0, 0, zz]), v3.add(b, [0, 0, zz]), v3.add(v3.add(b, off), [0, 0, zz]), v3.add(v3.add(a, off), [0, 0, zz])];
        beams.push({ p: side, n: [0, 0, Math.sign(zz)], tex, uv: [[0, 140], [tex.width * .8, 140], [tex.width * .8, 220], [0, 220]], color: '#5a3a24', double: true });
      }
    }
  }
  const props = [...sofa(0, -7.6, '#8a7f6b'), ...box([0, .2, -5.6], [1.2, .4, .7], { color: '#4a3526' })];
  const L = { ambient: .62, sun: v3.norm([.3, -.6, .7]), sunI: .3, tint: '#fff3e2', points: [{ p: [0, 2.4, -10.8], i: .9, k: .18 }] };
  return { layers: [shell, decals, [], [...props, ...beams]], L };
}

// ── Set D: fireplace wall with a beam mantel ─────────────────────────────
function mantelWall(o = {}) {
  const style = o.style || 'hewn', finish = o.finish || 'walnut';
  const shell = [
    ...tiledPlane([-4, 0, 2], [4, 0, 2], [-4, 0, -3], planks(), 4, 3),
    ...plane([-4, 0, -3], [4, 0, -3], [-4, 4.5, -3], '#d9cfbf', 10, 6),
  ];
  for (const f of shell) { const c = v3.mul(f.p.reduce((s, p) => v3.add(s, p), [0, 0, 0]), .25); if (v3.dot(f.n, v3.sub([0, 1.5, 0], c)) < 0) f.n = v3.mul(f.n, -1); }
  // stone-ish firebox surround + opening
  const surround = [...box([0, .75, -2.85], [2.6, 1.5, .3], { color: '#8d857a' })];
  const opening = [{ p: [[-.6, .15, -2.69], [.6, .15, -2.69], [.6, 1.05, -2.69], [-.6, 1.05, -2.69]], n: [0, 0, 1], color: '#1b1410', lum: 1 }];
  const glow = [{ p: [[-.45, .18, -2.68], [.45, .18, -2.68], [.45, .42, -2.68], [-.45, .42, -2.68]], n: [0, 0, 1], color: '#ff9440', emit: true, bloom: 'rgba(255,140,50,.9)', bloomR: 50 }];
  const p = o.drop ?? 1, pi = E.outBack(clamp(p));
  const mantel = pi > 0 ? beam([0, 1.72 + (1 - pi) * .8, -2.75], 2.9, .3, .26, style, finish, 'x', { skip: [] }) : [];
  const decor = [...box([-.9, 2.3, -2.95], [.5, .7, .04], { color: '#b8ad98' }), ...box([.7, 1.98, -2.8], [.18, .26, .18], { color: '#6d7a6a' })];
  const L = { ambient: .6, sun: v3.norm([.4, .5, .8]), sunI: .3, tint: '#fff1de', points: [{ p: [0, .4, -2.3], i: .25, k: 3 }, { p: [2.5, 2.4, 1], i: .5, k: .15 }] };
  return { layers: [shell, [], [], [...surround, ...decor, ...mantel], [...opening, ...glow]], L };
}

function drawSet(ctx, set, cam, bg = '#1a140f') {
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (const layer of set.layers) render3D(ctx, layer, cam, set.L);
}

// camera path helper: ease between two poses
function camMove(t, a, b, fovA = 55, fovB = fovA, e = E.inOutSine) {
  const k = e(clamp(t));
  return camera(v3.lerp(a[0], b[0], k), v3.lerp(a[1], b[1], k), lerp(fovA, fovB, k));
}
