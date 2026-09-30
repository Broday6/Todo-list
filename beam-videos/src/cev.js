// ─────────────────────────────────────────────────────────────────────────────
//  C.E.V. — Category Explainer Video: Faux Wood Beams (~2:40)
//  The on-screen caption on each shot is the host's script for that shot.
//  A-roll (host) plates mark where the talking-head footage cuts in.
// ─────────────────────────────────────────────────────────────────────────────
VIDEOS.cev = () => {
  const host = (cap, extra) => ({ d: extra?.d || 5, cap, tr: extra?.tr || { type: 'fade', d: .4 }, label: 'Host', draw: (c, t, s, T) => { hostPlate(c, T, t, t > .2 && t < s.d - .3); extra?.over?.(c, t); } });
  const chap = (num, title, sub) => ({ d: 2.5, label: 'Chapter ' + num, tr: { type: 'beam', d: .7 }, draw: (c, t) => chapter(c, t, num, title, sub) });
  const looks = [
    { name: 'Modern Farmhouse', style: 'sawn', finish: 'gray', wall: '#eeebe4', ceil: '#f7f4ee', sofa: '#8b8f86', rug: '#cfc6b6' },
    { name: 'Rustic Lodge', style: 'hewn', finish: 'walnut', wall: '#d8c3a2', ceil: '#eadcc5', sofa: '#7a4b34', rug: '#9d7d5b' },
    { name: 'Clean Contemporary', style: 'smooth', finish: 'espresso', wall: '#e3e3df', ceil: '#f3f3f0', sofa: '#4e5a63', rug: '#b9b7b0' },
  ];

  const shots = [
    // 1 · branded intro
    { d: 5, label: 'Logo intro', draw: (c, t) => { bgInk(c, t); motes(c, t, 60, 2); logoLockup(c, W / 2 - 60, H / 2 - 20, t, { scale: 1.1 }); text(c, 'CATEGORY EXPLAINER', W / 2, H - 170, font('bold', 22), C.muted, 'center', 8, seg(t, 2, .6) * (1 - seg(t, 4.3, .5))); } },

    // 2 · what is the category?
    host('Hey there! Today we’re talking about faux wood beams.', { d: 4.5, tr: { type: 'fade', d: .6 } }),
    { d: 7, label: 'What are they', tr: { type: 'beam', d: .7 }, cap: 'Faux wood beams are decorative ceiling beams that give any room the warmth and character of real timber.', draw: (c, t) => {
      drawSet(c, greatRoom({ style: 'hewn', finish: 'honey', drop: seg(t, .6, 3.2, E.linear) }), camMove(t / 7, [[.4, 1.5, 1.4], [0, 2.3, -8]], [[-.3, 1.6, -.6], [0, 2.9, -9]], 64, 60));
      lowerThird(c, t - 3.4, 'Faux Wood Beams', 'THE CATEGORY', { y: 770, d: 3.4 });
    } },
    { d: 8, label: 'Real wood detail', tr: { type: 'fade', d: .5 }, cap: 'They’re molded from real wood, so every saw mark and knot looks authentic — but they weigh a fraction of the real thing.', draw: (c, t) => {
      macro(c, t, 'sawn', 'honey', { zoom: 1.2, pan: .9, x: .05, y: .5, light: .1 + t * .1 });
      pill(c, 'MOLDED FROM REAL TIMBER', 120, 150, seg(t, .8, .5), { size: 22 });
    } },

    // 3 · why you want it
    chap('01', 'Why beams?', 'Four reasons homeowners love them'),
    { d: 7, label: 'Adds value', tr: { type: 'fade', d: .4 }, cap: 'Beams instantly add architectural character — the kind of detail people notice the moment they walk in.', draw: (c, t) => {
      const cam = camera([.3, 1.6, .8], [0, 2.5, -8], 62);
      beforeAfter(c, t, x => drawSet(x, greatRoom({ drop: 0 }), cam), x => drawSet(x, greatRoom({ style: 'hewn', finish: 'honey' }), cam), lerp(.92, .08, seg(t, .6, 4.5, E.inOutCubic)));
      benefitTile(c, t - 4.8, 1300, 90, 'value', 'Adds value', 'Instant architectural character', { w: 520, h: 300, bg: 'rgba(20,15,10,.85)' });
    } },
    ...looks.map((lk, i) => ({ d: 2.5, label: 'Trendy ' + i, tr: i === 0 ? { type: 'push', d: .5 } : { type: 'fade', d: .5 }, cap: i === 0 ? 'From modern farmhouse to rustic lodge to clean contemporary, beams fit the look you’re going for.' : null, capGroup: 'trend', draw: (c, t) => {
      drawSet(c, greatRoom(lk), camMove((i * 2.5 + t) / 7.5, [[1.2, 1.6, 1], [0, 2.4, -8]], [[-1.2, 1.6, 0], [0, 2.6, -8]], 60, 60));
      lowerThird(c, t - .2, lk.name, `${STYLES.find(s => s.id === lk.style).name.toUpperCase()} · ${FINISHES.find(f => f.id === lk.finish).name.toUpperCase()}`, { y: 770, d: 2.4 });
      if (i === 0) benefitTile(c, t - .3, 1360, 90, 'trend', 'On trend', null, { w: 440, h: 230, bg: 'rgba(20,15,10,.82)' });
    } })),
    { d: 7, label: 'Hides mistakes', tr: { type: 'push', d: .5 }, cap: 'They’re also great at hiding things — drywall seams, cracks, or wiring you’d rather not see.', draw: (c, t) => {
      planCeiling(c, t, seg(t, 2.5, 1.4, E.linear));
      benefitTile(c, t - 4.4, 120, 90, 'hide', 'Hides flaws', null, { w: 440, h: 230, bg: 'rgba(20,15,10,.85)' });
    } },
    { d: 6.5, label: 'Removable', tr: { type: 'fade', d: .4 }, cap: 'And because they mount to simple wood blocks, changing your mind later isn’t a demolition project.', draw: (c, t) => {
      bgPaper(c, t);
      const ph = t < 1.5 ? 4 : lerp(3, 2, seg(t, 1.5, 2.2, E.inOutCubic));
      installSection(c, t, ph, { top: 250, cx: W * .64, s: .85 });
      if (t > 1.5) icon(c, 'lift', W * .64 + 240, 520, 1, seg(t, 1.6, .5), C.accent, 7);
      text(c, 'MOUNTED, NOT BUILT IN', 120, 300, font('bold', 26), C.accent, 'left', 6, seg(t, .2, .5));
      headline(c, ['Change your', 'mind later.'], 120, 420, t - .3, { size: 88, color: [C.ink, '#8a5a2b'] });
      icon(c, 'undo', 200, 690, 1, seg(t, 1, 1), C.accent, 7);
    } },

    // 4 · options
    chap('02', 'Options', 'Textures, sizes & finishes'),
    { d: 6, label: 'Designs', tr: { type: 'fade', d: .4 }, cap: 'Start with a texture: hand hewn, rough sawn, sandblasted, or smooth.', draw: (c, t) => {
      bgInk(c, t);
      text(c, 'TEXTURES', 120, 150, font('bold', 26), C.accent, 'left', 6, seg(t, 0, .4));
      STYLES.forEach((st, i) => {
        const p = seg(t, .4 + i * .9, .9, E.outExpo);
        const y = 200 + i * 172;
        c.save(); c.globalAlpha = p; c.translate((1 - p) * 300, 0);
        beam2D(c, 560, y, 1240, 104, st.id, ['honey', 'walnut', 'gray', 'natural'][i], { dep: 60, u0: .1 + i * .08, sheen: seg(t, .8 + i * .9, 2.5, E.linear) });
        slotText(c, st.name, 500, y + 72, p, font('bold', 50), C.cream, 'right', 0, 50);
        c.restore();
      });
    } },
    { d: 5.5, label: 'Sizes', tr: { type: 'push', d: .5 }, cap: 'Then choose the width, height, and length that fit your space.', draw: (c, t) => {
      bgInk(c, t);
      const g = seg(t, .4, 2.4, E.inOutCubic);
      const len = lerp(700, 1420, g), hgt = lerp(110, 190, seg(t, 1.2, 2, E.inOutCubic));
      const x = W / 2 - len / 2, y = 470 - hgt / 2;
      beam2D(c, x, y, len, hgt, 'hewn', 'walnut', { dep: hgt * .5, u0: .1 });
      dimLine(c, x, y - 60, x + len, y - 60, seg(t, .8, .8), 'LENGTH');
      dimLine(c, x - 110, y, x - 110, y + hgt, seg(t, 1.4, .8), 'HEIGHT');
      pill(c, 'MULTIPLE WIDTHS, HEIGHTS & LENGTHS', W / 2, 700, seg(t, 2.2, .5), { size: 22, align: 'center' });
      text(c, 'SIZES', 120, 150, font('bold', 26), C.accent, 'left', 6);
    } },
    { d: 7.5, label: 'Finishes', tr: { type: 'fade', d: .4 }, cap: 'And pick a finish — natural and honey tones, walnut, espresso, weathered gray, or primed and ready to paint.', draw: (c, t) => {
      bgInk(c, t, { glow: 'rgba(240,184,114,.12)' });
      const step = 1.15, k = Math.min(FINISHES.length - 1, Math.floor(t / step));
      const fin = FINISHES[k], prevF = FINISHES[Math.max(0, k - 1)];
      const wp = k === 0 ? 1 : seg(t - k * step, 0, .45, E.inOutCubic);
      beam2D(c, 170, 300, 1580, 200, 'sawn', prevF.id, { dep: 100, u0: .15 });
      c.save(); c.beginPath(); c.rect(170, 250, 1700 * wp, 480); c.clip(); beam2D(c, 170, 300, 1580, 200, 'sawn', fin.id, { dep: 100, u0: .15, shadow: false }); c.restore();
      text(c, 'FINISHES', 170, 190, font('bold', 26), C.accent, 'left', 6);
      slotText(c, fin.name, 170, 262, seg(t - k * step, 0, .5, E.outExpo), font('bold', 60), C.cream, 'left', 0, 60);
      FINISHES.forEach((f, i) => {
        const x = 170 + i * 150, y = 650, on = i === k;
        c.save(); roundRect(c, x, y, 120, 120, 60); c.clip(); c.drawImage(wood('sawn', f.id), 300, 60, 200, 120, x, y, 120, 120); c.restore();
        c.strokeStyle = on ? C.accent2 : 'rgba(244,236,223,.25)'; c.lineWidth = on ? 6 : 2; roundRect(c, x - (on ? 8 : 0), y - (on ? 8 : 0), 120 + (on ? 16 : 0), 120 + (on ? 16 : 0), 70); c.stroke();
      });
    } },

    // 5 · material  ·  6 · how it's made
    chap('03', 'What they’re made of', 'And why'),
    { d: 7, label: 'Material', tr: { type: 'fade', d: .4 }, cap: 'Our beams are cast from high-density polyurethane: a tough, detailed outer skin over a lightweight core.', draw: (c, t) => {
      bgInk(c, t);
      text(c, 'HIGH-DENSITY POLYURETHANE', 120, 150, font('bold', 26), C.accent, 'left', 6, seg(t, 0, .4));
      materialSection(c, t - .2, { cx: 560, cy: 580, s: 1 });
    } },
    { d: 6.5, label: 'Material benefits', tr: { type: 'push', d: .5 }, cap: 'It won’t rot, and insects have nothing to eat — so the beams keep looking good for years.', draw: (c, t) => {
      bgInk(c, t);
      [['drop', 'Won’t rot', 'Moisture-resistant material'], ['bug', 'Insect-proof', 'Nothing for pests to eat'], ['feather', 'Lightweight', 'Easy to lift and hang']].forEach(([ic, a, b], i) =>
        benefitTile(c, t - .3 - i * .5, 150 + i * 560, 360, ic, a, b, { w: 500, h: 330 }));
    } },
    { d: 9, label: 'How it is made', tr: { type: 'fade', d: .4 }, cap: 'Each beam starts as a mold taken from real timber, then it’s cast, cured, and hand-finished to bring out the grain.', draw: (c, t) => {
      bgInk(c, t, { glow: 'rgba(240,184,114,.1)' });
      moldProcess(c, t, lerp(0, 5, seg(t, .2, 8.4, E.linear)));
    } },

    // 7 · installation overview
    chap('04', 'Installation', 'Four simple steps'),
    ...[
      ['Fasten blocks', 'First, screw mounting blocks into the ceiling joists.', 4.5, t => seg(t, .2, 1.6, E.linear)],
      ['Apply adhesive', 'Next, run a bead of construction adhesive along the top edges of the beam.', 5.5, () => 2],
      ['Lift into place', 'Lift the beam into place — it slides right over the blocks.', 5, t => lerp(2, 3, seg(t, .5, 2.5, E.linear))],
      ['Fasten the sides', 'Then fasten through the sides into the blocks with finish screws or nails.', 5.5, () => 4],
    ].map(([ttl, cap, d, ph], i) => ({ d, cap, label: 'Install ' + (i + 1), tr: i ? { type: 'fade', d: .3 } : { type: 'fade', d: .4 }, draw: (c, t) => {
      bgPaper(c, t);
      installSection(c, i === 3 ? t - .3 : t, ph(t), { top: 270, cx: W * .64, s: .9 });
      text(c, 'INSTALLATION', 120, 170, font('bold', 26), C.accent, 'left', 6);
      text(c, '0' + (i + 1), 120, 420, font('bold', 220), 'rgba(21,17,13,.9)', 'left', -6, seg(t, 0, .4));
      slotText(c, ttl, 124, 520, seg(t, .1, .7, E.outExpo), font('bold', 64), C.ink, 'left', -1, 64);
      [0, 1, 2, 3].forEach(k => { c.fillStyle = k <= i ? C.accent : 'rgba(21,17,13,.15)'; c.fillRect(126 + k * 70, 580, 56, 6); });
      icon(c, ['block', 'glue', 'lift', 'drill'][i], 190, 700, .9, seg(t, .3, .8), C.accent, 7);
    } })),

    // 8 · different from competitors
    chap('05', 'Why faux?', 'Compared with solid timber'),
    { d: 9, label: 'Compare', tr: { type: 'fade', d: .4 }, cap: 'Compared with solid timber, faux beams are a fraction of the weight, don’t need structural support, and won’t twist, check, or rot.', draw: (c, t) => {
      bgInk(c, t);
      compareTable(c, t, [
        ['Weight', 'Very heavy', 'A fraction of the weight'],
        ['Mounting', 'Structural support', 'Mounting blocks'],
        ['Movement', 'Can twist & check', 'Stays straight'],
        ['Moisture & pests', 'Can rot', 'Won’t rot'],
        ['Install', 'Crew & equipment', 'DIY-friendly'],
      ]);
    } },

    // 9 · complementary products  ·  10 · other products
    { d: 7, label: 'Complementary', tr: { type: 'beam', d: .7 }, cap: 'Complete the look with matching accessories: decorative straps, corbels, and beam-style mantels.', draw: (c, t) => {
      bgInk(c, t);
      text(c, 'COMPLETE THE LOOK', 120, 150, font('bold', 26), C.accent, 'left', 6);
      productCard(c, t - .3, 120, 220, 540, 640, 'Decorative Straps', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); beam2D(c, x - 20, y + h / 2 - 70, w + 40, 120, 'hewn', 'walnut', { dep: 40 }); strap(c, x + 150, y + h / 2 - 70, 46, 120); strap(c, x + w - 196, y + h / 2 - 70, 46, 120); });
      productCard(c, t - .7, 690, 220, 540, 640, 'Corbels', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); corbel(c, x + w / 2 - 95, y + 50, 1.05, 'walnut', 'hewn'); });
      productCard(c, t - 1.1, 1260, 220, 540, 640, 'Beam Mantels', (x, y, w, h) => mantelMini(c, x, y, w, h));
    } },
    { d: 6.5, label: 'Other products', tr: { type: 'push', d: .5 }, cap: 'Not quite the right fit? Explore our full ceiling collection, including medallions and ceiling domes.', draw: (c, t) => {
      bgInk(c, t);
      text(c, 'MORE FOR YOUR CEILING', 120, 150, font('bold', 26), C.accent, 'left', 6);
      productCard(c, t - .3, 120, 220, 540, 640, 'Ceiling Medallions', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); medallion(c, x + w / 2, y + h / 2, 200, 1, '#f3efe7', t * .05); });
      productCard(c, t - .7, 690, 220, 540, 640, 'Ceiling Domes', (x, y, w, h) => { c.fillStyle = '#e8dfd0'; c.fillRect(x, y, w, h); ceilingDome(c, x + w / 2, y + h / 2, 200); });
      productCard(c, t - 1.1, 1260, 220, 540, 640, 'And more', (x, y, w, h) => {
        c.fillStyle = 'rgba(244,236,223,.04)'; c.fillRect(x, y, w, h);
        ['ruler', 'layers', 'palette', 'paint'].forEach((ic, k) => icon(c, ic, x + w / 2 + (k % 2 ? 110 : -110), y + h / 2 + (k > 1 ? 110 : -110), .9, seg(t, 1.4 + k * .2, .6)));
      });
    } },

    // 11 · call to action (host)
    { ...host('Find the perfect beams for your space at ArchitecturalDepot.com.', { d: 3, tr: { type: 'fade', d: .4 } }), capGroup: 'cta' },
    { d: 3, label: 'CTA', capGroup: 'cta', tr: { type: 'zoom', d: .4 }, draw: (c, t) => ctaCard(c, t + .6, 'Shop faux wood beams', 'SHOP NOW') },

    // 12 · logo review, phone, website
    { d: 6, label: 'End card', tr: { type: 'fade', d: .6 }, draw: (c, t) => endCard(c, t, { tag: 'Thanks for watching.' }) },
  ];
  const tl = timeline(shots);
  // captions: each shot's `cap` is the host line; the "trend" group shares one caption across its shots
  const cues = [];
  for (const s of tl.shots) {
    if (s.cap) {
      let d = s.d;
      if (s.capGroup) d = tl.shots.filter(x => x.capGroup === s.capGroup).reduce((a, x) => a + x.d, 0);
      cues.push({ t0: s.t0, d, text: s.cap });
    }
  }
  tl.overlay = (c, T) => { const cue = cues.find(q => T >= q.t0 && T < q.t0 + q.d); if (cue) caption(c, T, cue, tl.at(T).label === 'Host' ? 'HOST' : 'HOST · VO'); };
  tl.fadeIn = .4; tl.fadeOut = 1.2;
  return tl;
};
