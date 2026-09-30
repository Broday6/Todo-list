// ─────────────────────────────────────────────────────────────────────────────
//  M.O.V. — Material Overview Video: Polyurethane (~2:12, voice-over)
//  Benefits are said out loud; limitations are shown, not said:
//   · the hollow U-channel + mounting block (decorative, not structural)
//   · the foam core revealed when a piece is cut
// ─────────────────────────────────────────────────────────────────────────────
VIDEOS.mov = () => {
  const chap = (num, title, sub) => ({ d: 2.5, label: 'Chapter ' + num, tr: { type: 'beam', d: .7 }, draw: (c, t) => chapter(c, t, num, title, sub) });
  const hype = [
    ['BEAMS', (c, t) => beam2D(c, 260 - t * 60, 420, 1400, 190, 'hewn', 'honey', { dep: 110, sheen: t / 1.1, u0: .1 })],
    ['MEDALLIONS', (c, t) => medallion(c, W / 2, H / 2 + 20, 300 * (1 + t * .06), 1, '#f2eee6', t * .4)],
    ['MOULDING', (c, t) => crownRun(c, 420 - t * 80, 400, 2.4, 1200)],
    ['CORBELS', (c, t) => corbel(c, W / 2 - 110, 230 - t * 20, 1.25 + t * .05, 'walnut', 'hewn')],
    ['DETAIL', (c, t) => { macro(c, t, 'blast', 'gray', { zoom: 1.5 + t * .2, pan: 2, x: .3, light: .2 + t * .6 }); }],
  ];
  const shots = [
    // 1 · hype intro: products made from the material
    ...hype.map(([word, fn], i) => ({ d: 1.1, label: 'Hype ' + word, tr: i ? { type: 'flash', d: .22 } : null, draw: (c, t) => {
      bgInk(c, t, { glow: 'rgba(240,184,114,.2)' });
      c.save(); c.globalAlpha = .07; text(c, word, W / 2 + 200 - t * 300, H / 2 + 150, font('bold', 360), C.cream, 'center', -10); c.restore();
      c.save(); const z = 1.08 - E.outCubic(clamp(t / 1.1)) * .08; c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); fn(c, t); c.restore();
    } })),
    { d: 2.5, label: 'Title slam', tr: { type: 'flash', d: .3 }, draw: (c, t) => {
      bgInk(c, t); motes(c, t, 60, 7);
      kicker(c, 'MATERIAL OVERVIEW', W / 2, 400, t, C.accent, 'center');
      staggerText(c, 'POLYURETHANE', W / 2, 570, t - .05, font('bold', 180), C.cream, { align: 'center', stagger: .03, dur: .5, dy: 0, scale: 1.8, track: 6, fromCenter: true });
      c.fillStyle = C.accent; const p = seg(t, .6, .8, E.outExpo); c.fillRect(W / 2 - 420 * p, 620, 840 * p, 5);
    } },

    // 2 · voice-over intro
    { d: 9.5, label: 'VO intro', tr: { type: 'zoom', d: .4 }, cap: 'This is high-density polyurethane — especially perfect for projects that need the look of carved wood or timber, without the weight or the upkeep.', draw: (c, t) => {
      macro(c, t, 'hewn', 'walnut', { zoom: 1.1, pan: .5, x: .1, light: .2 + t * .05 });
      c.fillStyle = 'rgba(14,10,7,.55)'; c.fillRect(0, 0, W, H);
      headline(c, ['Polyurethane'], 120, 360, t - .3, { size: 130 });
      text(c, 'Especially perfect for projects that need the look of', 126, 450, font('italic', 44, SERIF), C.cream, 'left', 0, seg(t, 1.2, .8));
      text(c, 'wood — without the weight or the upkeep.', 126, 505, font('italic', 44, SERIF), C.accent2, 'left', 0, seg(t, 1.6, .8));
      materialSection(c, t - 2.2, { cx: 1480, cy: 420, s: .55, calls: [] });
    } },

    // 3 · in application
    { d: 8.5, label: 'Application', tr: { type: 'beam', d: .7 }, cap: 'You’ll find it overhead as ceiling beams and medallions, and around the home as crown moulding, corbels, and trim.', draw: (c, t) => {
      bgInk(c, t, { grid: false });
      const panels = [
        [60, 60, 'Ceiling beams', (x, y, w, h) => { const [oc, ox] = offscreen('app'); drawSet(ox, cofferRoom({ style: 'hewn', finish: 'honey' }), camMove(t / 8.5, [[-1.5, 1.5, .5], [1, 2.6, -7]], [[-.5, 1.6, 0], [1.6, 2.7, -7]], 62)); c.drawImage(oc, x, y, w, h); }],
        [990, 60, 'Medallions', (x, y, w, h) => { c.fillStyle = '#efe8dc'; c.fillRect(x, y, w, h); medallion(c, x + w / 2, y + h / 2 - 40, 150, 1, '#f5f1ea', t * .03); c.strokeStyle = '#444'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w / 2, y + h / 2 - 40); c.lineTo(x + w / 2, y + h - 90); c.stroke(); c.fillStyle = '#2f2a25'; c.beginPath(); c.moveTo(x + w / 2 - 70, y + h - 30); c.lineTo(x + w / 2 + 70, y + h - 30); c.lineTo(x + w / 2 + 30, y + h - 90); c.lineTo(x + w / 2 - 30, y + h - 90); c.closePath(); c.fill(); }],
        [60, 560, 'Crown moulding', (x, y, w, h) => { c.fillStyle = '#e4dccd'; c.fillRect(x, y, w, h); c.fillStyle = '#f3eee6'; c.fillRect(x, y, w, 110); crownRun(c, x + 40 - t * 20, y + 110, 1.6, 900); }],
        [990, 560, 'Corbels & trim', (x, y, w, h) => { c.fillStyle = '#ddd3c2'; c.fillRect(x, y, w, h); c.fillStyle = '#5a3a24'; c.fillRect(x + 80, y + 90, w - 160, 36); corbel(c, x + 150, y + 126, .55, 'walnut', 'hewn'); corbel(c, x + w - 250, y + 126, .55, 'walnut', 'hewn'); }],
      ];
      panels.forEach(([x, y, label, fn], i) => {
        const p = seg(t, i * .35, .9, E.outExpo);
        if (p <= 0) return;
        const w = 870, h = 460;
        c.save(); c.globalAlpha = p; c.beginPath(); roundRect(c, x, y + (1 - p) * 50, w, h, 18); c.clip();
        c.translate(x + w / 2, y + h / 2 + (1 - p) * 50); const z = 1 + t * .006; c.scale(z, z); c.translate(-x - w / 2, -y - h / 2);
        fn(x, y, w, h); c.restore();
        pill(c, label, x + 30, y + 50, p, { size: 24 });
      });
    } },

    // 4 · why you'd want it
    chap('01', 'Why polyurethane?', 'The material benefits'),
    { d: 8, label: 'Lightweight', tr: { type: 'fade', d: .4 }, cap: 'It’s lightweight. A polyurethane beam can be lifted into place by one or two people — no heavy framing required.', draw: (c, t) => {
      bgInk(c, t);
      const tilt = -.22 * E.outElastic(clamp((t - .5) / 2));
      balance(c, t, tilt);
      text(c, 'LIGHTWEIGHT', 120, 150, font('bold', 26), C.accent, 'left', 6);
      icon(c, 'feather', 1740, 150, .9, seg(t, .3, .8));
    } },
    { d: 7, label: 'Moisture', tr: { type: 'push', d: .5 }, cap: 'It resists moisture and won’t rot, so it’s at home in kitchens, bathrooms, and covered outdoor spaces.', draw: (c, t) => {
      bgInk(c, t, { glow: 'rgba(150,190,210,.14)' });
      beam2D(c, 200, 360, 1520, 210, 'sawn', 'honey', { dep: 90, u0: .2 });
      droplets(c, t, 200, 360, 1520, 210, 34);
      text(c, 'MOISTURE-RESISTANT', 120, 150, font('bold', 26), C.accent, 'left', 6);
      ['Kitchens', 'Bathrooms', 'Covered porches'].forEach((s, i) => pill(c, s, 200 + i * 300, 760, seg(t, 2.5 + i * .4, .5), { size: 26 }));
    } },
    { d: 4.5, label: 'Insects', tr: { type: 'fade', d: .3 }, cap: 'And termites and other insects have nothing to eat.', draw: (c, t) => {
      bgInk(c, t);
      beam2D(c, W / 2 - 500, 470, 1000, 150, 'hewn', 'walnut', { dep: 70, u0: .3 });
      termites(c, t, W / 2, 560);
      text(c, 'INSECT-PROOF', 120, 150, font('bold', 26), C.accent, 'left', 6);
      icon(c, 'bug', 1740, 150, .9, seg(t, .3, .8));
    } },
    { d: 6.5, label: 'Detail', tr: { type: 'fade', d: .4 }, cap: 'It holds incredibly fine detail, capturing every saw mark and grain line from the original wood.', draw: (c, t) => {
      macro(c, t, 'blast', 'natural', { zoom: 1.2, pan: 0, x: .2, y: .5, light: .3 + t * .08 });
      c.fillStyle = 'rgba(14,10,7,.25)'; c.fillRect(0, 0, W, H);
      const lx = lerp(560, 1340, E.inOutSine(clamp(t / 6))), ly = 470 + Math.sin(t * .9) * 90;
      magnifier(c, t, 'blast', 'natural', lx, ly, 230, 2.6);
      pill(c, 'FINE DETAIL', 120, 120, seg(t, .3, .5), { size: 24 });
    } },
    { d: 6.5, label: 'Stable', tr: { type: 'push', d: .5 }, cap: 'It stays stable, too — no twisting, cupping, or splitting as the seasons change.', draw: (c, t) => {
      bgInk(c, t);
      const season = Math.floor(t / 1.1) % 2;
      const cyc = Math.sin(t / 1.1 * Math.PI);
      text(c, season ? 'WINTER' : 'SUMMER', W / 2, 150, font('bold', 30), season ? '#9fc3d6' : C.accent2, 'center', 8);
      text(c, 'SOLID WOOD', 200, 320, font('bold', 26), C.muted, 'left', 5);
      warpedBeam(c, 200, 360, 1300, 120, 'smooth', 'natural', cyc * 26 * seg(t, .5, 2), seg(t, 2.6, 2.5, E.linear));
      text(c, 'POLYURETHANE', 200, 640, font('bold', 26), C.accent2, 'left', 5);
      beam2D(c, 220, 680, 1300, 120, 'smooth', 'natural', { dep: 54 });
      icon(c, 'check', 1640, 740, .8, seg(t, 3, .6), C.accent2, 9);
    } },
    { d: 6, label: 'Workable', tr: { type: 'fade', d: .4 }, cap: 'And it cuts, drills, and fastens with ordinary woodworking tools.', draw: (c, t) => {
      bgInk(c, t);
      const cutX = 1080, cp = seg(t, .6, 2.2, E.inOutSine), done = t > 2.8;
      const slide = seg(t, 3, 1.4, E.inOutCubic);
      // left piece shows the fresh cut end once the blade is through
      beam2D(c, 200, 430, cutX - 200, 170, 'sawn', 'natural', { dep: 150, ox: .55, oy: .35, u0: .1, end: done ? 'cut' : 'none', shadow: true });
      c.save(); c.translate(slide * 380, slide * 40); c.rotate(slide * .05);
      beam2D(c, cutX + 4, 430, 620, 170, 'sawn', 'natural', { dep: 150, ox: .55, oy: .35, u0: .6 });
      c.restore();
      if (!done || t < 3.2) {
        const by = lerp(80, 760, cp);
        sawBlade(c, cutX + 2, by, 190, t * 30);
        if (cp > .15 && cp < .95) { const R = rng(Math.floor(t * 30)); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(235,220,190,${R() * .8})`; c.beginPath(); c.arc(cutX + R() * 260, 520 + (R() - .5) * 200, 2 + R() * 4, 0, TAU); c.fill(); } }
      }
      text(c, 'WORKS LIKE WOOD', 120, 150, font('bold', 26), C.accent, 'left', 6);
      ['saw', 'drill'].forEach((ic, i) => icon(c, ic, 1600 + i * 150, 150, .8, seg(t, .3 + i * .2, .6)));
    } },

    // 5 · products we make from it
    { d: 7.5, label: 'Products', tr: { type: 'beam', d: .7 }, cap: 'We use polyurethane for faux wood beams, ceiling medallions, crown moulding, corbels, ceiling domes, and more.', draw: (c, t) => {
      bgInk(c, t);
      text(c, 'MADE FROM POLYURETHANE', 120, 120, font('bold', 26), C.accent, 'left', 6);
      const cards = [
        ['Faux Wood Beams', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); beam2D(c, x - 40, y + h / 2 - 50, w + 80, 90, 'hewn', 'honey', { dep: 40 }); }],
        ['Ceiling Medallions', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); medallion(c, x + w / 2, y + h / 2, 120, 1, '#f3efe7', t * .05); }],
        ['Crown Moulding', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); crownRun(c, x + 40, y + h / 2 - 60, 1.1, 480); }],
        ['Corbels', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); corbel(c, x + w / 2 - 55, y + 20, .55, 'walnut', 'hewn'); }],
        ['Ceiling Domes', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); ceilingDome(c, x + w / 2, y + h / 2, 120); }],
        ['And more', (x, y, w, h) => { ['layers', 'ruler', 'paint', 'palette'].forEach((ic, k) => icon(c, ic, x + w / 2 + (k % 2 ? 80 : -80), y + h / 2 + (k > 1 ? 70 : -70), .7, seg(t, 2.6 + k * .15, .6))); }],
      ];
      cards.forEach(([title, fn], i) => productCard(c, t - .2 - i * .28, 120 + (i % 3) * 570, 160 + Math.floor(i / 3) * 350, 540, 330, title, fn));
    } },

    // 6 · how it's made
    chap('02', 'How it’s made', 'From real timber to finished piece'),
    { d: 13.5, label: 'How it is made', tr: { type: 'fade', d: .4 }, cap: 'It starts with a mold taken from real wood. Liquid polyurethane is poured in, where it expands and cures into a dense, rigid form. Then each piece is demolded and finished by hand.', draw: (c, t) => {
      bgInk(c, t, { glow: 'rgba(240,184,114,.1)' });
      moldProcess(c, t, lerp(0, 5, seg(t, .3, 12.6, E.linear)), { finish: 'walnut' });
    } },

    // 7 · finishes
    { d: 8, label: 'Finishes', tr: { type: 'push', d: .5 }, cap: 'Pieces come either factory-finished in realistic wood tones, or primed and ready for your own paint color.', draw: (c, t) => {
      bgInk(c, t);
      // left: primed → painted with a roller
      const rp = seg(t, .8, 2.4, E.inOutSine), rx = lerp(160, 900, rp);
      text(c, 'PRIMED FOR PAINT', 160, 250, font('bold', 26), C.accent, 'left', 6);
      beam2D(c, 160, 330, 740, 170, 'smooth', 'primed', { dep: 80 });
      c.save(); c.beginPath(); c.rect(160, 300, rx - 160, 400); c.clip(); beam2D(c, 160, 330, 740, 170, 'smooth', 'sage', { dep: 80, shadow: false }); c.restore();
      if (rp > 0 && rp < 1) roller(c, rx, 420 + Math.sin(t * 9) * 20, '#96a48a');
      // right: factory finishes cycling
      const k = Math.floor(t / 1.3) % 5, fin = FINISHES[k];
      text(c, 'FACTORY-FINISHED', 1020, 250, font('bold', 26), C.accent, 'left', 6);
      beam2D(c, 1020, 330, 740, 170, 'hewn', fin.id, { dep: 80, sheen: (t % 1.3) / 1.3 });
      text(c, fin.name, 1020, 620, font('bold', 44), C.cream, 'left', 0, seg(t % 1.3, 0, .3));
    } },

    // 8 · general installation (the hollow profile is shown, not discussed)
    { d: 10.5, label: 'Installation', tr: { type: 'fade', d: .4 }, cap: 'Installation is straightforward. Most pieces go up with construction adhesive and finish nails, and beams slide over simple mounting blocks — no structural work involved.', draw: (c, t) => {
      bgInk(c, t);
      text(c, 'GENERAL INSTALLATION', 120, 120, font('bold', 26), C.accent, 'left', 6);
      productCard(c, t - .2, 120, 170, 840, 640, 'Adhesive + finish nails', (x, y, w, h) => {
        c.fillStyle = '#e4dccd'; c.fillRect(x, y, w, h); c.fillStyle = '#f3eee6'; c.fillRect(x, y, w, 150);
        const up = E.outCubic(seg(t, .8, 1.4, E.linear)); crownRun(c, x + 60, y + 150 + (1 - up) * 120, 1.7, 800);
        for (let k = 0; k < 4; k++) { const q = seg(t, 2.4 + k * .3, .2); if (q > 0) { c.fillStyle = `rgba(40,30,20,${q})`; c.beginPath(); c.arc(x + 180 + k * 120, y + 200, 5, 0, TAU); c.fill(); } }
      });
      productCard(c, t - .6, 980, 170, 820, 640, 'Beams over mounting blocks', (x, y, w, h) => {
        c.fillStyle = '#efe8dc'; c.fillRect(x, y, w, h);
        c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
        installSection(c, t - 4, lerp(1, 3, seg(t, 1.6, 3.4, E.linear)) >= 2.99 ? 4 : lerp(1, 3, seg(t, 1.6, 3.4, E.linear)), { cx: x + w / 2, top: y + 170, s: .75 });
        c.restore();
      });
    } },

    // 9 · conclusion
    { d: 8.5, label: 'Recap', tr: { type: 'beam', d: .7 }, cap: 'Lightweight, moisture resistant, richly detailed, and easy to install — polyurethane gives you the look of real wood, minus the hassle.', draw: (c, t) => {
      bgInk(c, t); motes(c, t, 40, 11);
      headline(c, ['The look of real wood,', 'minus the hassle.'], W / 2, 300, t - .2, { size: 88, align: 'center', color: [C.cream, C.accent2] });
      [['feather', 'Lightweight'], ['drop', 'Moisture-resistant'], ['detail', 'Richly detailed'], ['stable', 'Stays stable'], ['drill', 'Easy to install']].forEach(([ic, lb], i) =>
        benefitTile(c, t - .9 - i * .35, 120 + i * 342, 520, ic, lb, null, { w: 320, h: 250, ts: 32 }));
    } },

    // 10 · other materials
    { d: 9, label: 'Other materials', tr: { type: 'push', d: .5 }, cap: 'If this material doesn’t sound like it’s for you, we make products out of a number of materials, including real wood and PVC.', draw: (c, t) => {
      bgInk(c, t);
      text(c, 'OTHER MATERIALS', 120, 150, font('bold', 26), C.accent, 'left', 6);
      productCard(c, t - .6, 120, 210, 780, 600, 'Real Wood', (x, y, w, h) => { c.drawImage(wood('smooth', 'natural', 'macro'), 200, 100, 900, 560, x, y, w, h); });
      productCard(c, t - 1, 1020, 210, 780, 600, 'PVC', (x, y, w, h) => { c.drawImage(wood('sawn', 'primed', 'macro'), 300, 200, 900, 560, x, y, w, h); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, w, h); });
    } },

    // 11 · logo review
    { d: 6, label: 'End card', tr: { type: 'fade', d: .6 }, draw: (c, t) => endCard(c, t, { tag: 'Learn about every material we make.' }) },
  ];
  const tl = timeline(shots.map(s => s.tr === null ? { ...s, tr: undefined } : s));
  const cues = tl.shots.filter(s => s.cap).map(s => ({ t0: s.t0, d: s.d, text: s.cap }));
  tl.overlay = (c, T) => { const cue = cues.find(q => T >= q.t0 && T < q.t0 + q.d); if (cue) caption(c, T, cue, 'VO'); };
  tl.fadeIn = .3; tl.fadeOut = 1.2;
  return tl;
};
