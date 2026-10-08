// Vinyl shutter installation video — every frame is rendered from this file.
// Units are inches. The house wall faces +Z; the studio/bench set lives at x≈1000–2000.
// window.renderFrame(sceneId, t) poses the whole world deterministically for time t (seconds).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W = 1920, H = 1080;

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (a, b, t) => clamp((t - a) / (b - a));
const ss = (a, b, t) => { const x = lin(a, b, t); return x * x * (3 - 2 * x); };
const eio = (a, b, t) => { const x = lin(a, b, t); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const mix = (a, b, k) => a + (b - a) * k;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const vmix = (a, b, k) => a.clone().lerp(b, k);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// piecewise keyframes: [[t, value], ...] with eased interpolation; value is number or Vector3
function keys(list, t) {
  if (t <= list[0][0]) return clone(list[0][1]);
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) {
      const k = eio(list[i - 1][0], list[i][0], t);
      const a = list[i - 1][1], b = list[i][1];
      return typeof a === 'number' ? mix(a, b, k) : vmix(a, b, k);
    }
  }
  return clone(list[list.length - 1][1]);
}
const clone = v => typeof v === 'number' ? v : v.clone();

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#cfdbe6');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, W / H, 1, 6000);

// ---------- procedural textures ----------
function canvasTex(w, h, draw, srgb = true, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
}
function grain(ctx, w, h, seed, vertical, strength) {
  const r = rng(seed);
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    const g = 128 + (r() - .5) * strength;
    ctx.strokeStyle = `rgb(${g},${g},${g})`; ctx.lineWidth = 0.5 + r() * 2.5; ctx.globalAlpha = .35;
    ctx.beginPath();
    if (vertical) { const x = r() * w; ctx.moveTo(x, 0); ctx.bezierCurveTo(x + (r() - .5) * 8, h * .33, x + (r() - .5) * 8, h * .66, x + (r() - .5) * 6, h); }
    else { const y = r() * h; ctx.moveTo(0, y); ctx.bezierCurveTo(w * .33, y + (r() - .5) * 6, w * .66, y + (r() - .5) * 6, w, y + (r() - .5) * 4); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
const vinylBump = canvasTex(256, 1024, (c, w, h) => grain(c, w, h, 7, true, 70), false, [1, 1]);
const sidingBump = canvasTex(1024, 128, (c, w, h) => grain(c, w, h, 11, false, 60), false, [6, 1]);
const benchMap = canvasTex(1024, 512, (c, w, h) => {
  const r = rng(5);
  c.fillStyle = '#b48759'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const y = r() * h; const d = r();
    c.strokeStyle = d > .5 ? 'rgba(120,80,45,.35)' : 'rgba(215,175,130,.25)'; c.lineWidth = .6 + r() * 3;
    c.beginPath(); c.moveTo(0, y);
    for (let x = 0; x <= w; x += 64) c.lineTo(x, y + Math.sin(x * .01 + i) * 3 + (r() - .5) * 2);
    c.stroke();
  }
  for (let p = 0; p < 4; p++) { c.fillStyle = 'rgba(80,50,25,.10)'; c.fillRect(0, p * h / 4, w, 2); }
}, true, [1, 1]);
const blindsMap = canvasTex(64, 512, (c, w, h) => {
  for (let y = 0; y < h; y += 8) {
    const g = c.createLinearGradient(0, y, 0, y + 8);
    g.addColorStop(0, '#f4f4f2'); g.addColorStop(.7, '#e2e2df'); g.addColorStop(1, '#b9b9b5');
    c.fillStyle = g; c.fillRect(0, y, w, 8);
  }
}, true, [1, 3]);
const tapeMap = canvasTex(1024, 64, (c, w, h) => {
  c.fillStyle = '#e8c33a'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#222';
  for (let i = 0; i < w; i += 8) { const L = i % 128 === 0 ? 30 : i % 64 === 0 ? 22 : i % 32 === 0 ? 16 : 9; c.fillRect(i, 0, 1.5, L); }
}, true, [1, 1]);
const leafAlpha = canvasTex(1024, 1024, (c, w, h) => {
  const r = rng(21);
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.strokeStyle = '#fff';
  for (let b = 0; b < 7; b++) {
    let x = r() * w * .4, y = r() * h, a = r() * 1.2 - .2;
    c.lineWidth = 6; c.beginPath(); c.moveTo(x, y);
    for (let s = 0; s < 26; s++) {
      x += Math.cos(a) * 30; y += Math.sin(a) * 30; a += (r() - .5) * .35; c.lineTo(x, y);
      for (let l = 0; l < 2; l++) {
        c.save(); c.translate(x, y); c.rotate(a + (l ? 1 : -1) * (0.6 + r() * .6));
        c.beginPath(); c.ellipse(26, 0, 26, 10, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }
    c.stroke();
  }
}, false, [1, 1]);

// ---------- materials ----------
const M = {
  siding: new THREE.MeshStandardMaterial({ color: '#d7d3ca', roughness: .78, bumpMap: sidingBump, bumpScale: .4 }),
  trim: new THREE.MeshStandardMaterial({ color: '#f6f5f1', roughness: .45 }),
  shutter: new THREE.MeshStandardMaterial({ color: '#2e3133', roughness: .52, bumpMap: vinylBump, bumpScale: .35, envMapIntensity: .8 }),
  glass: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .03, metalness: .1, transparent: true, opacity: .24, envMapIntensity: 1.8 }),
  blinds: new THREE.MeshStandardMaterial({ color: '#b4b7ba', map: blindsMap, roughness: .7, emissive: '#ffffff', emissiveMap: blindsMap, emissiveIntensity: .16 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: .9 }),
  foundation: new THREE.MeshStandardMaterial({ color: '#b3aea6', roughness: .95 }),
  mulch: new THREE.MeshStandardMaterial({ color: '#5a4434', roughness: 1 }),
  bush: new THREE.MeshStandardMaterial({ color: '#4f6a3a', roughness: .85, bumpMap: vinylBump, bumpScale: 2, flatShading: true }),
  studio: new THREE.MeshStandardMaterial({ color: '#e6e5e2', roughness: .95 }),
  bench: new THREE.MeshStandardMaterial({ map: benchMap, roughness: .7 }),
  stud: new THREE.MeshStandardMaterial({ color: '#d9bf92', roughness: .8 }),
  steel: new THREE.MeshStandardMaterial({ color: '#c9cdd1', metalness: 1, roughness: .28 }),
  blackPlastic: new THREE.MeshStandardMaterial({ color: '#1d1f21', roughness: .55 }),
  toolBody: new THREE.MeshStandardMaterial({ color: '#3a4046', roughness: .45 }),
  toolAccent: new THREE.MeshStandardMaterial({ color: '#c96a2b', roughness: .5 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#141516', roughness: .9 }),
  alu: new THREE.MeshStandardMaterial({ color: '#b9bfc5', metalness: .85, roughness: .35 }),
  vial: new THREE.MeshStandardMaterial({ color: '#d7e85a', roughness: .1, transparent: true, opacity: .85 }),
  pencil: new THREE.MeshStandardMaterial({ color: '#e0b032', roughness: .5 }),
  wood: new THREE.MeshStandardMaterial({ color: '#e6c79a', roughness: .8 }),
  graphite: new THREE.MeshStandardMaterial({ color: '#3b3d40', roughness: .4, metalness: .3 }),
  tape: new THREE.MeshStandardMaterial({ map: tapeMap, roughness: .45, metalness: .2, side: THREE.DoubleSide }),
  markOnShutter: new THREE.MeshBasicMaterial({ color: '#9aa0a6' }),
  markOnWall: new THREE.MeshBasicMaterial({ color: '#4a4b4d' }),
  hole: new THREE.MeshBasicMaterial({ color: '#0b0b0b' }),
  dish: new THREE.MeshStandardMaterial({ color: '#fafafa', roughness: .35 }),
};
const ACCENT = '#f5a524';
const accentMat = () => new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, depthTest: false, toneMapped: false });

const shadowAll = o => o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
function box(w, h, d, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; }
function cyl(r1, r2, h, mat, seg = 32) { return new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); }

// ---------- house exterior ----------
const house = new THREE.Group(); scene.add(house);
const WIN = { x0: -22, x1: 22, y0: 36, y1: 108 };  // casing outer bounds
const siding = new THREE.Group(); house.add(siding);
{
  const exp = 7, half = 260, y0 = 8;
  for (let i = 0; i < 30; i++) {
    const yb = y0 + i * exp;
    const addBoard = (xa, xb) => {
      const b = box(xb - xa, exp + .9, .55, M.siding, (xa + xb) / 2, yb + (exp + .9) / 2, .32);
      b.rotation.x = -0.06;            // bottom edge stands proud: lap shadow line
      b.castShadow = b.receiveShadow = true; siding.add(b);
    };
    if (yb + exp + .9 > 40.5 && yb < 103.5) { addBoard(-half, WIN.x0 + .2); addBoard(WIN.x1 - .2, half); }
    else addBoard(-half, half);
  }
  const fnd = box(520, 8, 6, M.foundation, 0, 4, -1.5); fnd.receiveShadow = true; house.add(fnd);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 200), M.mulch); ground.rotation.x = -Math.PI / 2; ground.position.z = 100; ground.receiveShadow = true; house.add(ground);
  const backing = box(520, 230, 1, M.dark, 0, 115, -7); house.add(backing);
}
siding.updateMatrixWorld(true);
const sidingBox = new THREE.Box3().setFromObject(siding);
const WZ = sidingBox.max.z + 0.03;                // shutter back face sits here
const ray = new THREE.Raycaster();
function wallZ(x, y) { ray.set(V(x, y, 50), V(0, 0, -1)); const hit = ray.intersectObject(siding, true)[0]; return hit ? hit.point.z : WZ; }

// window: casing, sill, jambs, two sashes with 2x2 grids, glass, blinds
{
  const g = new THREE.Group(); house.add(g);
  const cd = 1.6;   // casing projection
  g.add(box(44, 4, cd, M.trim, 0, 106, cd / 2));
  g.add(box(4, 68, cd, M.trim, -20, 72, cd / 2));
  g.add(box(4, 68, cd, M.trim, 20, 72, cd / 2));
  g.add(box(48, 2.2, 3.2, M.trim, 0, 37.1, 1.4));   // sill
  g.add(box(44, 2, cd, M.trim, 0, 39, cd / 2 - .2));
  // jambs (recess)
  g.add(box(.6, 64, 5, M.trim, -17.7, 72, -1.5)); g.add(box(.6, 64, 5, M.trim, 17.7, 72, -1.5));
  g.add(box(36, .6, 5, M.trim, 0, 103.7, -1.5)); g.add(box(36, .6, 5, M.trim, 0, 40.3, -1.5));
  const sash = (yc, z) => {
    const s = new THREE.Group(); s.position.set(0, yc, z); g.add(s);
    const w = 35.2, h = 31.6, d = 1.4;
    s.add(box(2.2, h, d, M.trim, -w / 2 + 1.1, 0, 0)); s.add(box(2.2, h, d, M.trim, w / 2 - 1.1, 0, 0));
    s.add(box(w, 2.2, d, M.trim, 0, h / 2 - 1.1, 0)); s.add(box(w, 2.2, d, M.trim, 0, -h / 2 + 1.1, 0));
    s.add(box(.8, h, .8, M.trim, 0, 0, .1)); s.add(box(w, .8, .8, M.trim, 0, 0, .1));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w - 4, h - 4), M.glass); gl.position.z = -.1; s.add(gl);
  };
  sash(88, -.6); sash(56.3, -1.9);
  const blinds = new THREE.Mesh(new THREE.PlaneGeometry(36, 64), M.blinds); blinds.position.set(0, 72, -3.6); g.add(blinds);
  shadowAll(g);
}
// foundation shrubs: dense instanced leaves around a dark core
{
  const r = rng(3);
  const spots = [[-150, 15, 22], [-120, 17, 20], [-90, 15, 22], [-62, 16, 20], [-34, 13, 26], [-8, 15, 22], [18, 14, 24], [44, 13, 26], [70, 16, 20], [96, 14, 24], [124, 16, 21], [152, 15, 22]];
  const PER = 450;
  const leaf = new THREE.SphereGeometry(1, 7, 4); leaf.scale(1.6, .4, .9);
  const leavesI = new THREE.InstancedMesh(leaf, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .75 }), spots.length * PER);
  const o = new THREE.Object3D(), col = new THREE.Color(); let n = 0;
  const core = new THREE.MeshStandardMaterial({ color: '#22301a', roughness: 1 });
  spots.forEach(([x, s, z]) => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), core); c.scale.set(s * 1.2, s * .9, s * .95); c.position.set(x, s * .55, z); c.castShadow = true; house.add(c);
    for (let i = 0; i < PER; i++) {
      const u = r() * 2 - 1, th = r() * Math.PI * 2, rr = Math.sqrt(1 - u * u), k = .88 + r() * .2;
      const d = V(rr * Math.cos(th), Math.abs(u) * (u < -.4 ? -.4 : 1) , rr * Math.sin(th));
      o.position.set(x + d.x * s * 1.3 * k, s * .55 + d.y * s * k, z + d.z * s * k);
      o.rotation.set(r() * 6.3, r() * 6.3, r() * 6.3); o.scale.setScalar(1.0 + r() * .6);
      o.updateMatrix(); leavesI.setMatrixAt(n, o.matrix);
      col.setHSL(.24 + r() * .06, .3 + r() * .2, .14 + r() * .12 + Math.max(0, d.y) * .07); leavesI.setColorAt(n, col); n++;
    }
  });
  leavesI.castShadow = leavesI.receiveShadow = true; house.add(leavesI);
}

// ---------- shutter ----------
const SH = { w: 15, h: 72, d: 1.0 };
// fastener locations on the shutter face (local coords): through the stiles at the top and bottom rails
const MOUNTS = [V(-6, 34.25, 0), V(6, 34.25, 0), V(-6, -33.75, 0), V(6, -33.75, 0)];
function raisedPanel(w, h) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: .12, bevelEnabled: true, bevelThickness: .28, bevelSize: 1.05, bevelSegments: 1 });
  return g;
}
function makeShutter() {
  const root = new THREE.Group();              // origin: centre of back face
  const body = new THREE.Group(); root.add(body);
  const { w, h, d } = SH; const st = 3, tr = 3.5, mr = 3, br = 4.5;
  body.add(box(w, h, .45, M.shutter, 0, 0, .225));                       // back sheet
  body.add(box(st, h, d, M.shutter, -w / 2 + st / 2, 0, d / 2));
  body.add(box(st, h, d, M.shutter, w / 2 - st / 2, 0, d / 2));
  body.add(box(w - 2 * st, tr, d, M.shutter, 0, h / 2 - tr / 2, d / 2));
  body.add(box(w - 2 * st, br, d, M.shutter, 0, -h / 2 + br / 2, d / 2));
  body.add(box(w - 2 * st, mr, d, M.shutter, 0, (h / 2 - tr + -h / 2 + br) / 2 + 0, d / 2));
  const openW = w - 2 * st, inner = h - tr - br - mr, ph = inner / 2;
  const mid = (h / 2 - tr + -h / 2 + br) / 2;
  [mid + mr / 2 + ph / 2, mid - mr / 2 - ph / 2].forEach(yc => {
    const p = new THREE.Mesh(raisedPanel(openW - 3.2, ph - 3.2), M.shutter); p.position.set(0, yc, .48); body.add(p);
  });
  // inner sticking bevel (thin chamfer strips around each opening)
  shadowAll(body);
  const decals = new THREE.Group(); root.add(decals);
  root.userData.marks = []; root.userData.holes = []; root.userData.fasteners = [];
  MOUNTS.forEach(p => {
    const mk = makeMark(M.markOnShutter); mk.position.set(p.x, p.y, d + .01); decals.add(mk); root.userData.marks.push(mk);
    const ho = new THREE.Mesh(new THREE.CircleGeometry(.17, 24), M.hole); ho.position.set(p.x, p.y, d + .015); decals.add(ho); root.userData.holes.push(ho);
    const f = makeFastener(); f.position.set(p.x, p.y, d); decals.add(f); root.userData.fasteners.push(f);
  });
  return root;
}
function makeMark(mat) {
  const g = new THREE.Group();
  const a = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .09), mat), b = new THREE.Mesh(new THREE.PlaneGeometry(.09, 1.3), mat);
  g.add(a, b); g.userData.parts = [a, b]; return g;
}
function makeFastener() {                       // colour-matched head, shank pointing -z
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(.36, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.shutter);
  head.rotation.x = Math.PI / 2; head.scale.set(1, .35, 1); g.add(head);
  const slot = box(.42, .07, .1, M.rubber, 0, 0, .12); g.add(slot); const slot2 = box(.07, .42, .1, M.rubber, 0, 0, .12); g.add(slot2);
  const shank = cyl(.11, .07, 2.6, M.shutter, 12); shank.rotation.x = Math.PI / 2; shank.position.z = -1.3; g.add(shank);
  shadowAll(g); return g;
}
function setMark(mk, k) { mk.visible = k > 0; mk.userData.parts[0].scale.x = clamp(k * 2); mk.userData.parts[1].scale.y = clamp(k * 2 - 1); }

const shutterL = makeShutter(), shutterR = makeShutter();
scene.add(shutterL, shutterR);
const L_POS = V(-30.5, 72, WZ), R_POS = V(30.5, 72, WZ);
function shutterState(s, { marks = 0, holes = 0, fast = [0, 0, 0, 0], markK } = {}) {
  s.userData.marks.forEach((m, i) => setMark(m, markK ? markK[i] : (i < marks ? 1 : 0)));
  s.userData.holes.forEach((h, i) => h.visible = i < holes);
  s.userData.fasteners.forEach((f, i) => { const k = fast[i]; f.visible = k > 0; f.position.z = SH.d + (1 - k) * 4.2; f.rotation.z = -k * 18; });
}
const localToWorld = (s, p) => { s.updateMatrixWorld(true); return s.localToWorld(V(p.x, p.y, SH.d)); };

// wall decals (pencil marks + pilot holes) at the left shutter's final mount points
const wallDecals = new THREE.Group(); scene.add(wallDecals);
const wallMarks = [], wallHoles = [], WALL_PTS = [];
MOUNTS.forEach(p => {
  const x = L_POS.x + p.x, y = L_POS.y + p.y, z = wallZ(x, y);
  WALL_PTS.push(V(x, y, z));
  const mk = makeMark(M.markOnWall); mk.position.set(x, y, z + .02); wallDecals.add(mk); wallMarks.push(mk);
  const ho = new THREE.Mesh(new THREE.CircleGeometry(.13, 24), M.hole); ho.position.set(x, y, z + .03); wallDecals.add(ho); wallHoles.push(ho);
});

// ---------- tools ----------
function makeDrill() {                    // bit tip at origin, tool body extends toward +z
  const g = new THREE.Group();
  const spin = new THREE.Group(); g.add(spin);
  const bit = cyl(.12, .12, 3.2, M.steel, 12); bit.rotation.x = Math.PI / 2; bit.position.z = 1.6; spin.add(bit);
  const flute = new THREE.Mesh(new THREE.TorusGeometry(.14, .03, 6, 40, Math.PI * 14), M.steel); // hint of flutes
  flute.visible = false; spin.add(flute);
  const driver = new THREE.Group(); spin.add(driver);   // driver tip variant
  const chuck = cyl(.75, .55, 1.8, M.blackPlastic, 24); chuck.rotation.x = Math.PI / 2; chuck.position.z = 4.0; spin.add(chuck);
  const ring = cyl(.78, .78, .3, M.steel, 24); ring.rotation.x = Math.PI / 2; ring.position.z = 3.4; spin.add(ring);
  const barrel = cyl(1.35, 1.35, 6.5, M.toolBody, 32); barrel.rotation.x = Math.PI / 2; barrel.position.z = 8.1; g.add(barrel);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.35, 24, 12), M.toolBody); cap.scale.z = .5; cap.position.z = 11.35; g.add(cap);
  const band = cyl(1.38, 1.38, 1.0, M.toolAccent, 32); band.rotation.x = Math.PI / 2; band.position.z = 5.6; g.add(band);
  const handle = new THREE.Mesh(new RoundedBoxGeometry(2.0, 6.0, 2.3, 3, .5), M.rubber); handle.position.set(0, -3.6, 9.2); handle.rotation.x = -.22; g.add(handle);
  const trig = box(.6, 1.2, .7, M.toolAccent, 0, -1.7, 7.7); g.add(trig);
  const batt = new THREE.Mesh(new RoundedBoxGeometry(3.0, 1.9, 4.2, 3, .35), M.toolBody); batt.position.set(0, -7.4, 9.6); g.add(batt);
  const battBand = box(3.02, .4, 4.22, M.toolAccent, 0, -6.6, 9.6); g.add(battBand);
  shadowAll(g); g.userData.spin = spin; g.userData.bit = bit; return g;
}
function makePencil() {                   // tip at origin, body toward +z
  const g = new THREE.Group();
  const body = cyl(.2, .2, 6.5, M.pencil, 6); body.rotation.x = Math.PI / 2; body.position.z = 4.2; g.add(body);
  const cone = cyl(.2, .05, .9, M.wood, 6); cone.rotation.x = -Math.PI / 2; cone.position.z = .5; g.add(cone);
  const lead = cyl(.05, .01, .15, M.graphite, 8); lead.rotation.x = -Math.PI / 2; lead.position.z = .05; g.add(lead);
  shadowAll(g); return g;
}
function makeTape() {                      // case centred at origin; blade exits along +x on the bench plane
  const g = new THREE.Group();
  const cs = new THREE.Mesh(new RoundedBoxGeometry(3.2, 3.0, 1.6, 4, .7), M.toolBody); g.add(cs);
  const face = cyl(1.1, 1.1, .1, M.alu, 32); face.rotation.x = Math.PI / 2; face.position.z = .82; g.add(face);
  const clip = box(.8, .3, 1.7, M.toolAccent, -.4, 1.5, 0); g.add(clip);
  const blade = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), M.tape); blade.rotation.x = -Math.PI / 2; g.add(blade);
  const hook = box(.12, .5, 1.05, M.steel, 0, -1.3, 0); g.add(hook);
  shadowAll(g); g.userData.blade = blade; g.userData.hook = hook;
  g.userData.setLen = L => {      // blade lies on the bench surface (y = -1.5 relative to case centre)
    blade.scale.set(Math.max(L, .01), 1, 1); blade.position.set(1.6 + L / 2, -1.48, 0);
    tapeMap.repeat.set(L / 12, 1); hook.position.set(1.6 + L, -1.3, 0);
  };
  g.userData.setLen(0.2);
  return g;
}
function makeLevel(len = 24) {              // long axis along x
  const g = new THREE.Group();
  g.add(box(len, 1.5, .8, M.alu));
  g.add(box(len, .2, .82, M.toolAccent, 0, .65, 0));
  const win = box(2.6, .9, .84, M.blackPlastic, 0, 0, 0); g.add(win);
  const vial = cyl(.28, .28, 2.2, M.vial, 16); vial.rotation.z = Math.PI / 2; vial.position.z = .2; g.add(vial);
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 8), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .1 }));
  bubble.scale.x = 1.6; bubble.position.set(0, 0, .44); g.add(bubble);
  [-.45, .45].forEach(x => g.add(box(.05, .6, .9, M.rubber, x, 0, 0)));
  shadowAll(g); g.userData.bubble = bubble; return g;
}
function makeBits() {
  const g = new THREE.Group();
  const caseM = new THREE.Mesh(new RoundedBoxGeometry(5.2, .7, 3.2, 3, .25), M.blackPlastic); g.add(caseM);
  [.10, .12, .14, .16, .19, .22].forEach((r, i) => {
    const b = cyl(r, r, 2.0 + i * .2, M.steel, 12); b.rotation.z = Math.PI / 2; b.position.set(0, .48, -1.2 + i * .48); g.add(b);
  });
  shadowAll(g); return g;
}
const drill = makeDrill(), pencil = makePencil(), tape = makeTape(), level = makeLevel(), bits = makeBits();
const vLevel = makeLevel(24);    // level used against the shutter
scene.add(drill, pencil, tape, level, bits, vLevel);

// chips / dust
const CHIPS = 40;
const chips = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .05, .12), new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: .9 }), CHIPS);
chips.castShadow = true; scene.add(chips);
const dummy = new THREE.Object3D();
function emitChips(origin, up, t0, t1, t, seed, color) {
  chips.material.color.set(color);
  const r = rng(seed); let n = 0;
  for (let i = 0; i < CHIPS; i++) {
    const birth = mix(t0, t1, r()), age = t - birth, ang = r() * Math.PI * 2, sp = 2 + r() * 4;
    if (age < 0 || age > 1.2 || t < t0) { dummy.scale.setScalar(0); }
    else {
      const side = V(Math.cos(ang), 0, Math.sin(ang));
      if (Math.abs(up.y) < .5) side.set(Math.cos(ang), Math.sin(ang), 0);
      const p = origin.clone().addScaledVector(side, sp * age * .9).addScaledVector(up, sp * age * .6);
      if (Math.abs(up.y) > .5) p.y += -9 * age * age * .4; else p.y += -16 * age * age;
      dummy.position.copy(p); dummy.rotation.set(age * 9 + i, age * 7, i); dummy.scale.setScalar(1);
    }
    dummy.updateMatrix(); chips.setMatrixAt(n++, dummy.matrix);
  }
  chips.instanceMatrix.needsUpdate = true;
}
function hideChips() { dummy.scale.setScalar(0); dummy.updateMatrix(); for (let i = 0; i < CHIPS; i++) chips.setMatrixAt(i, dummy.matrix); chips.instanceMatrix.needsUpdate = true; }

// ---------- studio set: sweep, bench, parts dish ----------
const studio = new THREE.Group(); scene.add(studio);
{
  // seamless cove: floor -> radius -> back wall
  const R = 60, depth = 260, wallH = 300, segs = 80;
  const geo = new THREE.PlaneGeometry(2200, 1, 1, segs);
  const pos = geo.attributes.position;
  const total = depth + Math.PI / 2 * R + wallH;
  for (let i = 0; i < pos.count; i++) {
    const v = (pos.getY(i) + .5) * total; let y, z;
    if (v < depth) { y = 0; z = 200 - v; }
    else if (v < depth + Math.PI / 2 * R) { const a = (v - depth) / R; y = R - Math.cos(a) * R; z = 200 - depth - Math.sin(a) * R; }
    else { y = R + (v - depth - Math.PI / 2 * R); z = 200 - depth - R; }
    pos.setXYZ(i, pos.getX(i) + 1500, y, z);
  }
  geo.computeVertexNormals();
  const sweep = new THREE.Mesh(geo, M.studio); sweep.material.side = THREE.DoubleSide; sweep.receiveShadow = true; studio.add(sweep);
  // workbench at x=1000
  const top = box(150, 1.6, 38, M.bench, 1000, 33.2, 0); studio.add(top);
  [[-70, -16], [70, -16], [-70, 16], [70, 16]].forEach(([x, z]) => studio.add(box(3, 32.4, 3, M.stud, 1000 + x, 16.2, z)));
  studio.add(box(146, 3, 2, M.stud, 1000, 6, -16)); studio.add(box(146, 3, 2, M.stud, 1000, 6, 16));
  shadowAll(studio); sweep.castShadow = false;
}
const BENCH_Y = 34;
// support blocks for the shutter on the bench
const blocks = new THREE.Group(); scene.add(blocks);
[-22, 22].forEach(x => blocks.add(box(3.5, 3.5, 26, M.stud, 1000 + x, BENCH_Y + 1.75, 0)));
shadowAll(blocks);
// parts dish with supplied hardware
const dish = new THREE.Group(); scene.add(dish);
{
  const pts = [V(0, 0, 0), V(4.2, 0, 0), V(4.6, .9, 0), V(4.75, .95, 0), V(4.4, .2, 0), V(0, .2, 0)].map(p => new THREE.Vector2(p.x, p.y));
  const d = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), M.dish); dish.add(d);
  const r = rng(9);
  for (let i = 0; i < 9; i++) {
    const f = makeFastener(); f.scale.setScalar(1.4);
    f.rotation.set((r() - .5) * .15, r() * Math.PI * 2, 0, 'YXZ');
    f.position.set((r() - .5) * 4.0, .42 + i * .04, (r() - .5) * 4.0); dish.add(f);
  }
  shadowAll(dish);
}
dish.position.set(2046, 0, 28);

// ---------- instructional graphics ----------
const rings = [];
for (let i = 0; i < 8; i++) {
  const r = new THREE.Mesh(new THREE.RingGeometry(.9, 1.15, 48), accentMat()); r.renderOrder = 10; scene.add(r); rings.push(r);
}
function ring(i, pos, k, size = 1) {   // k: 0..1 pulse progress, billboarded
  const r = rings[i]; r.visible = k > 0 && k < 1;
  r.position.copy(pos); r.quaternion.copy(camera.quaternion);
  r.scale.setScalar(size * (0.6 + k * 1.4)); r.material.opacity = Math.sin(Math.PI * k) * .95;
}
function ringHold(i, pos, a, size = 1) { const r = rings[i]; r.visible = a > 0; r.position.copy(pos); r.quaternion.copy(camera.quaternion); r.scale.setScalar(size); r.material.opacity = a; }
const guides = [];
for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 1, 8), accentMat()); m.renderOrder = 10; scene.add(m); guides.push(m); }
function guide(i, a, b, k, op = 1) {  // draw a segment from a toward b, k=reveal
  const g = guides[i]; g.visible = k > 0 && op > 0;
  const end = vmix(a, b, k), mid = vmix(a, end, .5), len = a.distanceTo(end);
  g.position.copy(mid); g.scale.set(1, Math.max(len, .001), 1);
  g.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); g.material.opacity = op * .95;
}

// leaf shadows on the wall (invisible caster, shadow only)
const leafMat = new THREE.MeshBasicMaterial({ alphaMap: leafAlpha, transparent: true, alphaTest: .5, colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
const leaves = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), leafMat);
leaves.castShadow = true; leaves.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: leafAlpha, alphaTest: .5, side: THREE.DoubleSide });
scene.add(leaves);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#e6eef7', '#8d8172', .55); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e5', 2.7); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
const SUN_DIR = V(-.55, .62, .56).normalize();
function setSun(target, half, intensity = 2.7, dir = SUN_DIR) {
  sun.target.position.copy(target); sun.position.copy(target).addScaledVector(dir, 400);
  const c = sun.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = 50; c.far = 900; c.updateProjectionMatrix();
  sun.intensity = intensity;
  leaves.visible = target.x < 500; leaves.position.copy(target).addScaledVector(dir, 120).add(V(-150 - target.x, 50, 0)); leaves.lookAt(leaves.position.clone().add(dir));
}

// ---------- overlay (HTML text) ----------
const overlay = document.getElementById('overlay'), scrim = document.getElementById('scrim');
function setScrim(side, a) {
  scrim.style.opacity = a;
  scrim.style.background = side === 'left'
    ? 'linear-gradient(90deg, rgba(20,22,24,.42) 0%, rgba(20,22,24,.22) 32%, rgba(20,22,24,0) 55%)'
    : 'radial-gradient(ellipse 70% 62% at 0% 0%, rgba(20,22,24,.55) 0%, rgba(20,22,24,.28) 50%, rgba(20,22,24,0) 100%)';
}
// blocks: {html, x, y, w, t0, t1, cls}
function showBlocks(blocks, t) {
  overlay.innerHTML = '';
  for (const b of blocks) {
    const d = document.createElement('div'); d.className = 'blk ' + (b.cls || 'shadow');
    d.innerHTML = b.html; d.style.left = b.x + 'px'; d.style.top = b.y + 'px'; if (b.w) d.style.width = b.w + 'px';
    const kin = eio(b.t0, b.t0 + .7, t), kout = b.t1 ? 1 - ss(b.t1 - .5, b.t1, t) : 1;
    d.style.opacity = Math.min(kin, kout);
    d.style.transform = `translateY(${(1 - kin) * 28}px)`;
    overlay.appendChild(d);
  }
}
function label(text, small, pos3, a, dy = 0) {
  const p = pos3.clone().project(camera);
  const d = document.createElement('div'); d.className = 'label';
  d.innerHTML = text + (small ? `<small>${small}</small>` : '');
  d.style.left = ((p.x + 1) / 2 * W) + 'px'; d.style.top = ((1 - p.y) / 2 * H + dy) + 'px'; d.style.opacity = a;
  overlay.appendChild(d);
}
const stepBlock = (n, title, sub, x = 120, y = 330, w = 820) => ({
  html: `<div class="kicker">Step ${n}</div><div class="h2" style="margin-top:22px">${title}</div>` + (sub ? `<div class="sub">${sub}</div>` : ''), x, y, w, t0: .35,
});

// ---------- world reset ----------
function reset() {
  [drill, pencil, tape, level, bits, vLevel, dish, blocks].forEach(o => { o.visible = false; });
  shutterL.visible = shutterR.visible = true;
  shutterL.rotation.set(0, 0, 0); shutterR.rotation.set(0, 0, 0);
  shutterL.position.copy(L_POS); shutterR.position.copy(R_POS);
  shutterState(shutterL, { marks: 0, holes: 4, fast: [1, 1, 1, 1] });
  shutterState(shutterR, { marks: 0, holes: 4, fast: [1, 1, 1, 1] });
  wallMarks.forEach(m => setMark(m, 0)); wallHoles.forEach(h => h.visible = false);
  rings.forEach(r => r.visible = false); guides.forEach(g => g.visible = false);
  drill.userData.spin.rotation.z = 0; drill.rotation.set(0, 0, 0);
  hideChips(); setScrim('left', 0);
  scene.background.set('#cfdbe6');
  M.siding.color.set('#d7d3ca');
}
function look(pos, target, fov = 32, sx = 0, sy = 0) {   // sx/sy: move the subject right/down by that fraction of the frame
  camera.position.copy(pos); camera.fov = fov;
  if (sx || sy) camera.setViewOffset(W, H, -sx * W, -sy * H, W, H); else camera.clearViewOffset();
  camera.updateProjectionMatrix(); camera.lookAt(target); camera.updateMatrixWorld();
}
// shutter lying face-up on the bench, top toward -x
function onBench(s, x = 1000) {
  s.position.set(x, BENCH_Y + 3.5, 0); s.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
}
function pointDrillDown(d) { d.rotation.set(-Math.PI / 2, 0, Math.PI); }   // bit down, handle toward camera(+z)
function aimInto(obj, dirOut, roll = 0) {    // orient tool so its +z axis (body) points along dirOut (away from work)
  obj.quaternion.setFromUnitVectors(V(0, 0, 1), dirOut.clone().normalize());
  if (roll) obj.rotateZ(roll);
}

// ---------- scenes ----------
const SCENES = {
  // 01 — hero
  s01: { dur: 7, f(t) {
    setSun(V(0, 72, 0), 140);
    look(V(mix(-52, -48, ss(0, 7, t)), 74, mix(265, 222, eio(0, 7, t))), V(mix(-52, -48, ss(0, 7, t)), 72, 0));
    setScrim('left', .9);
    showBlocks([
      { html: '<div class="h1" style="font-size:150px">HOW TO</div><div class="h2" style="font-size:78px;margin-top:6px">Install Vinyl Shutters</div>', x: 120, y: 330, w: 1000, t0: .5 },
    ], t);
  } },
  // 02 — what's included (studio)
  s02: { dur: 6.5, f(t) {
    scene.background.set('#e6e5e2');
    shutterL.position.set(1994, 36, -10); shutterL.rotation.set(0, .22, 0);
    shutterR.position.set(2014, 36, -14); shutterR.rotation.set(0, .22, 0);
    shutterState(shutterL, { holes: 0, fast: [0, 0, 0, 0] }); shutterState(shutterR, { holes: 0, fast: [0, 0, 0, 0] });
    dish.visible = true;
    setSun(V(2015, 36, 0), 120, 2.3, V(-.45, .7, .55).normalize());
    const k = eio(3.0, 4.6, t);
    const p = vmix(V(1990, 48, 168), V(2052, 27, 62), k), tg = vmix(V(2004, 37, -12), V(2046, 1, 28), k);
    p.x += ss(0, 3, t) * 4;
    look(p, tg, 32, mix(.21, .2, k), mix(0, .12, k));
    showBlocks([
      { html: `<div class="kicker">What's Included</div><div class="h2" style="margin-top:22px">Matching pair of<br>vinyl shutters</div>`, x: 120, y: 360, w: 820, t0: .35, t1: 3.0, cls: 'dark' },
      { html: `<div class="kicker">What's Included</div><div class="h2" style="margin-top:22px">Supplied installation<br>hardware</div><div class="sub" style="color:#55585b">Use the fasteners that come with your shutters.</div>`, x: 120, y: 330, w: 820, t0: 4.4, cls: 'dark' },
    ], t);
  } },
  // 03 — tools
  s03: { dur: 7, f(t) {
    shutterL.visible = shutterR.visible = false;
    scene.background.set('#e6e5e2');
    setSun(V(1000, 34, 0), 60, 2.5, V(-.4, .8, .45).normalize());
    look(V(1006, BENCH_Y + 56, 40), V(1006, BENCH_Y, 3));
    const fall = (a) => eio(a, a + .7, t);
    const kd = fall(.6); drill.visible = kd > 0; drill.rotation.set(0, Math.PI / 2 + .25, Math.PI / 2); drill.position.set(984, BENCH_Y + 1.4 + (1 - kd) * 40, 6);
    const kb = fall(.95); bits.visible = kb > 0; bits.position.set(1001, BENCH_Y + .35 + (1 - kb) * 40, 5); bits.rotation.set(0, .1, 0);
    const kt = fall(1.3); tape.visible = kt > 0; tape.userData.setLen(.2); tape.position.set(1013, BENCH_Y + 1.5 + (1 - kt) * 40, 5); tape.rotation.set(0, -.2, 0);
    const kp = fall(1.65); pencil.visible = kp > 0; pencil.rotation.set(0, Math.PI / 2 + .12, 0); pencil.position.set(1021, BENCH_Y + .2 + (1 - kp) * 40, 5.5);
    const kl = fall(2.0); level.visible = kl > 0; level.rotation.set(-Math.PI / 2, 0, 0); level.position.set(1004, BENCH_Y + .4 + (1 - kl) * 40, 14.5);
    setScrim('corner', .8);
    showBlocks([{ html: `<div class="kicker">Before You Start</div><div class="h2" style="margin-top:22px">Tools You'll Need</div>`, x: 120, y: 90, w: 900, t0: .35 }], t);
    const la = s => ss(s, s + .5, t);
    label('Drill / Driver', '', V(991, BENCH_Y, 10), la(1.6));
    label('Drill Bits', '', V(1001, BENCH_Y, 8.6), la(1.9));
    label('Tape Measure', '', V(1013, BENCH_Y, 8.6), la(2.3));
    label('Pencil', '', V(1024.5, BENCH_Y, 8.6), la(2.6));
    label('Level', '', V(1004, BENCH_Y, 17.2), la(3.0));
    overlay.querySelectorAll('.label').forEach(l => { l.style.color = '#fff'; l.style.textShadow = '0 2px 8px rgba(0,0,0,.6)'; });
  } },
  // 04 — position shutter
  s04: { dur: 7.5, f(t) {
    setSun(V(-40, 72, 0), 110);
    shutterR.visible = false;
    look(V(mix(-63, -58, ss(0, 7.5, t)), 74, mix(162, 148, eio(0, 7.5, t))), V(mix(-63, -58, ss(0, 7.5, t)), 72, 0));
    setScrim('left', .9);
    shutterState(shutterL, { holes: 0, fast: [0, 0, 0, 0] });
    const x = keys([[.3, -92], [2.4, L_POS.x]], t), z = keys([[2.4, WZ + 7], [3.1, WZ]], t);
    shutterL.position.set(x, 72, z);
    vLevel.visible = t > 3.2; vLevel.rotation.set(0, 0, Math.PI / 2);
    vLevel.position.set(-38 - .8, 72, WZ + .4 + (1 - eio(3.2, 3.9, t)) * 12);
    vLevel.userData.bubble.position.x = keys([[3.9, .55], [4.7, 0]], t);
    if (t > 4.8) {
      const a = 1 - ss(7.0, 7.5, t);
      guide(0, V(-41, 108, WZ + 1.7), V(-15, 108, WZ + 1.7), eio(4.8, 5.5, t), a);
      guide(1, V(-41, 36, WZ + 1.7), V(-15, 36, WZ + 1.7), eio(5.0, 5.7, t), a);
    }
    showBlocks([stepBlock(1, 'Position Shutter', 'Hold it beside the window trim. Check it is plumb and lines up with the top and bottom of the trim.', 120, 320, 760)], t);
  } },
  // 05 — mark mounting points (on the bench)
  s05: { dur: 8, f(t) {
    shutterR.visible = false; blocks.visible = true; scene.background.set('#e6e5e2');
    onBench(shutterL);
    const mk = [lin(2.3, 2.9, t), lin(3.5, 4.0, t), lin(6.3, 6.6, t), lin(6.9, 7.2, t)];
    shutterState(shutterL, { holes: 0, fast: [0, 0, 0, 0], markK: mk });
    const P = MOUNTS.map(p => localToWorld(shutterL, p));
    setSun(V(1000, 37, 0), 60, 2.5, V(-.4, .8, .45).normalize());
    const pan = eio(4.5, 5.9, t);
    const tg = vmix(V(P[0].x, P[0].y, 0), V(P[2].x, P[2].y, 0), pan);
    look(tg.clone().add(V(0, 40, 32)), tg, 32, .2, .17);
    setScrim('corner', .7);
    tape.visible = t < 4.7; tape.rotation.set(0, Math.PI, 0);
    const bladeL = keys([[.5, .2], [1.7, P[0].x - 964 + .3], [4.0, P[0].x - 964 + .3], [4.5, .2]], t);
    tape.userData.setLen(bladeL);
    tape.position.set(964 + 1.6 + bladeL + .1, P[0].y + 1.5, P[0].z - 1.4);
    pencil.visible = true;
    const pp = keys([[1.6, V(990, 62, 14)], [2.3, P[0]], [2.9, P[0]], [3.5, P[1]], [4.0, P[1]], [4.6, V(1004, 55, 14)], [5.8, V(1040, 55, 14)], [6.3, P[2]], [6.6, P[2]], [6.9, P[3]], [7.2, P[3]], [7.8, V(1056, 62, 14)]], t);
    const wig = (t > 2.3 && t < 2.9) || (t > 3.5 && t < 4.0) || (t > 6.3 && t < 6.6) || (t > 6.9 && t < 7.2) ? Math.sin(t * 40) * .25 : 0;
    pencil.position.copy(pp).add(V(wig, .02, 0));
    aimInto(pencil, V(.35, 1, .45));
    for (let i = 0; i < 4; i++) { const s0 = [2.9, 4.0, 6.6, 7.2][i]; ring(i, P[i], lin(s0, s0 + .7, t), 1.1); }
    showBlocks([stepBlock(2, 'Mark Mounting Points', "Measure and mark each location shown in the manufacturer's instructions.", 120, 80, 860)], t);
  } },
  // 06 — drill shutter holes (on the bench)
  s06: { dur: 7.5, f(t) {
    shutterR.visible = false; blocks.visible = true; scene.background.set('#e6e5e2');
    onBench(shutterL);
    const holes = t > 2.3 ? (t > 4.3 ? 2 : 1) : 0;
    shutterState(shutterL, { marks: 4, holes: 0, fast: [0, 0, 0, 0] });
    shutterL.userData.holes.forEach((h, i) => h.visible = i < holes || (i >= 2 && t > 5.6));
    shutterL.userData.marks.forEach((m, i) => { if (i < holes || (i >= 2 && t > 5.6)) m.visible = false; });
    const P = MOUNTS.map(p => localToWorld(shutterL, p));
    setSun(V(1000, 37, 0), 70, 2.5, V(-.4, .8, .45).normalize());
    const k = eio(5.0, 7.0, t);
    const tg = vmix(V(P[0].x, P[0].y, 0), V(1000, P[0].y, 0), k);
    look(tg.clone().add(vmix(V(10, 40, 40), V(0, 82, 74), k)), tg, 32, mix(.2, .04, k), mix(.2, .22, k));
    setScrim('corner', .7);
    drill.visible = true; pointDrillDown(drill);
    const above = p => p.clone().add(V(0, 2.2, 0)), deep = p => p.clone().add(V(0, -.8, 0));
    const dp = keys([[0, V(990, 72, 20)], [1.0, above(P[0])], [1.3, P[0]], [2.3, deep(P[0])], [2.7, above(P[0])], [3.2, above(P[1])], [3.4, P[1]], [4.3, deep(P[1])], [4.7, above(P[1])], [5.6, V(1045, 80, 10)]], t);
    drill.position.copy(dp);
    const spinning = (t > 1.25 && t < 2.5) || (t > 3.35 && t < 4.5);
    drill.userData.spin.rotation.z = spinning ? t * 60 : 0;
    if (t > 1.3 && t < 2.9) emitChips(P[0].clone().add(V(0, .1, 0)), V(0, 1, 0), 1.35, 2.3, t, 1, '#3a3d40');
    else if (t > 3.4 && t < 5.0) emitChips(P[1].clone().add(V(0, .1, 0)), V(0, 1, 0), 3.45, 4.3, t, 2, '#3a3d40');
    else hideChips();
    ring(2, P[2], lin(5.6, 6.4, t), 1.6); ring(3, P[3], lin(5.8, 6.6, t), 1.6);
    showBlocks([stepBlock(3, 'Drill Mounting Holes', 'Support the shutter on a flat surface and drill through at each mark.', 120, 80, 860)], t);
  } },
  // 07 — prepare the wall
  s07: { dur: 8, f(t) {
    setSun(V(-30, 80, 0), 90);
    shutterR.visible = false;
    shutterState(shutterL, { holes: 4, fast: [0, 0, 0, 0] });
    const off = eio(2.6, 3.6, t);
    shutterL.position.set(L_POS.x - off * 120, 72, WZ + off * 8);
    const WP = WALL_PTS;
    wallMarks.forEach((m, i) => setMark(m, i < 2 ? lin(i ? 1.9 : 1.0, i ? 2.3 : 1.4, t) : (t > 2.3 ? 1 : 0)));
    pencil.visible = t < 3.0;
    pencil.position.copy(keys([[0, V(-10, 120, 24)], [.9, WP[0]], [1.4, WP[0]], [1.6, WP[0].clone().add(V(0, 0, 2))], [1.9, WP[1]], [2.3, WP[1]], [2.9, V(-4, 118, 28)]], t));
    aimInto(pencil, V(.55, .25, 1));
    drill.visible = t > 3.3; aimInto(drill, V(.5, .1, 1), 0);
    const ins = p => p.clone().add(V(0, 0, -.7)), out = p => p.clone().add(V(0, 0, 2));
    drill.position.copy(keys([[3.3, V(10, 112, 40)], [4.0, out(WP[0])], [4.2, WP[0]], [4.9, ins(WP[0])], [5.2, out(WP[0])], [5.6, out(WP[1])], [5.8, WP[1]], [6.4, ins(WP[1])], [6.8, V(14, 112, 40)]], t));
    drill.userData.spin.rotation.z = (t > 4.15 && t < 5.0) || (t > 5.75 && t < 6.5) ? t * 60 : 0;
    wallHoles.forEach((h, i) => h.visible = i === 0 ? t > 4.8 : i === 1 ? t > 6.3 : t > 7.0);
    wallMarks.forEach((m, i) => { if (wallHoles[i].visible) m.visible = false; });
    if (t > 4.2 && t < 5.6) emitChips(WP[0].clone().add(V(0, 0, .3)), V(0, 0, 1), 4.25, 4.9, t, 3, '#d7d3ca');
    else if (t > 5.8 && t < 7.2) emitChips(WP[1].clone().add(V(0, 0, .3)), V(0, 0, 1), 5.85, 6.4, t, 4, '#d7d3ca');
    else hideChips();
    const k = eio(6.5, 8, t);
    const tg = vmix(V(-30.5, 106, WZ), V(-30.5, 72, WZ), k);
    look(tg.clone().add(vmix(V(-30, 6, 44), V(-62, 8, 120), k)), tg, 32, mix(.2, .17, k), mix(.14, .04, k));
    setScrim('corner', .9);
    if (t > 7.0) { ring(2, WP[2], lin(7.0, 7.8, t), 1.5); ring(3, WP[3], lin(7.1, 7.9, t), 1.5); }
    showBlocks([stepBlock(4, 'Prepare Mounting Surface', 'Hold the shutter in place and mark through each hole. Then drill the wall as your instructions direct.', 120, 80, 860)], t);
  } },
  // 08 — align
  s08: { dur: 6.5, f(t) {
    setSun(V(-30, 72, 0), 100);
    shutterR.visible = false;
    shutterState(shutterL, { holes: 4, fast: [0, 0, 0, 0] });
    wallHoles.forEach(h => h.visible = true);
    const x = keys([[.2, -60], [2.0, L_POS.x]], t), z = keys([[0, WZ + 10], [3.4, WZ + 10], [4.4, WZ]], t);
    shutterL.position.set(x, 72, z);
    look(V(mix(-126, -120, ss(0, 6.5, t)), 86, 104), V(-31, 72, 4), 32, .14, .06);
    const P = MOUNTS.map(p => localToWorld(shutterL, p));
    const a = 1 - ss(4.0, 4.4, t);
    for (let i = 0; i < 4; i++) guide(i, P[i], WALL_PTS[i], eio(2.2 + i * .15, 3.0 + i * .15, t), a);
    for (let i = 0; i < 4; i++) ring(i, P[i], lin(4.4 + i * .1, 5.2 + i * .1, t), 1.4);
    setScrim('corner', .9);
    showBlocks([stepBlock(5, 'Align Shutter', 'Return the shutter to position and line up its holes with the holes in the wall.', 120, 80, 760)], t);
  } },
  // 09 — secure
  s09: { dur: 8, f(t) {
    setSun(V(-30, 80, 0), 90);
    shutterR.visible = false;
    wallHoles.forEach(h => h.visible = true);
    const f = [eio(.9, 2.2, t), eio(2.6, 3.9, t), eio(5.4, 6.2, t), eio(6.4, 7.2, t)];
    shutterState(shutterL, { holes: 4, fast: f });
    const P = MOUNTS.map(p => localToWorld(shutterL, p));
    const pan = eio(4.1, 5.3, t);
    const tg = V(-30.5, mix(105.5, 39, pan), WZ);
    look(tg.clone().add(V(-32, 8, 44)), tg, 32, .2, .12);
    setScrim('corner', .9);
    drill.visible = true; aimInto(drill, V(.5, .1, 1));
    const head = (i, k) => P[i].clone().add(V(0, 0, (1 - k) * 4.2 + .1));
    drill.position.copy(keys([[0, V(-8, 116, 34)], [.9, head(0, 0)], [2.2, head(0, 1)], [2.6, head(1, 0)], [3.9, head(1, 1)], [4.6, V(-6, 82, 30)], [5.4, head(2, 0)], [6.2, head(2, 1)], [6.4, head(3, 0)], [7.2, head(3, 1)], [8, V(-4, 44, 30)]], t));
    drill.userData.spin.rotation.z = f.some(k => k > 0 && k < 1) ? t * 50 : 0;
    drill.userData.bit.scale.y = .55;
    ring(4, P[0], lin(2.2, 2.9, t), 1.1); ring(5, P[1], lin(3.9, 4.6, t), 1.1);
    ring(6, P[2], lin(6.2, 6.9, t), 1.1); ring(7, P[3], lin(7.2, 7.9, t), 1.1);
    showBlocks([stepBlock(6, 'Secure Shutter', "Drive the supplied fasteners through each hole, following the manufacturer's instructions.", 120, 80, 820)], t);
  } },
  // 10 — repeat on the right
  s10: { dur: 8, f(t) {
    setSun(V(0, 72, 0), 140);
    look(V(-48, 74, 236), V(-48, 72, 0));
    setScrim('left', .9);
    const x = keys([[.4, 96], [2.4, R_POS.x]], t), z = keys([[2.4, WZ + 7], [3.1, WZ]], t);
    shutterR.position.set(x, 72, z);
    const f = [0, 1, 2, 3].map(i => eio(3.6 + i * .7, 4.2 + i * .7, t));
    shutterState(shutterR, { holes: 4, fast: f });
    const P = MOUNTS.map(p => localToWorld(shutterR, p));
    for (let i = 0; i < 4; i++) ring(i, P[i], lin(4.2 + i * .7, 4.9 + i * .7, t), 2.6);
    showBlocks([{ html: `<div class="kicker">Step 7</div><div class="h2" style="margin-top:22px">Repeat on Opposite Side</div><div class="sub">Follow the same steps for a matched, aligned pair.</div>`, x: 120, y: 320, w: 820, t0: .35 }], t);
  } },
  // 11 — final reveal
  s11: { dur: 8.5, f(t) {
    setSun(V(0, 72, 0), 150);
    const k = eio(0, 8.5, t);
    const ang = mix(.42, 0, k), dist = mix(190, 250, k), cx = mix(-10, -50, k);
    look(V(cx + Math.sin(ang) * dist, mix(60, 74, k), Math.cos(ang) * dist), V(cx, mix(68, 72, k), 0));
    setScrim('left', .9 * ss(4, 5.5, t));
    showBlocks([{ html: `<div class="h2" style="font-size:96px">A Simple Upgrade.</div><div class="h2" style="font-size:96px">A Beautiful Finish.</div>`, x: 120, y: 300, w: 1000, t0: 4.8 }], t);
  } },
};

window.SCENES = Object.fromEntries(Object.entries(SCENES).map(([k, v]) => [k, v.dur]));
window.renderFrame = (id, t) => {
  reset();
  drill.userData.bit.scale.y = 1;
  SCENES[id].f(t);
  renderer.render(scene, camera);
  return true;
};
await document.fonts.load('700 40px Poppins'); await document.fonts.load('600 40px Poppins'); await document.fonts.load('500 40px Poppins');
window.ready = true;
