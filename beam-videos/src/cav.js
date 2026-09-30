// ─────────────────────────────────────────────────────────────────────────────
//  C.A.V. — Category Ad Video: Faux Wood Beams (40 s, cut to a 120 BPM grid)
//  Variants: 'main' (with review) and 'noreviews' (Amazon-safe)
// ─────────────────────────────────────────────────────────────────────────────
VIDEOS.cav = (variant = 'main') => {
  const beat = .5;
  const shots = [
    // 1–3 · opening close-up details
    { d: 1.5, label: 'Detail 1', draw: (c, t) => { macro(c, t, 'hewn', 'honey', { zoom: 1.35, pan: 2.2, x: .1, y: .45, light: .15 + t * .5 }); } },
    { d: 1.5, label: 'Detail 2', tr: { type: 'flash', d: .3 }, draw: (c, t) => { macro(c, t, 'sawn', 'walnut', { zoom: 1.6, pan: -1.5, x: .6, y: .5, blur: 14 * (1 - seg(t, 0, .7, E.outCubic)), rot: -.06, light: .5 + t * .4 }); } },
    { d: 1.0, label: 'Detail 3', tr: { type: 'flash', d: .25 }, draw: (c, t) => {
      // tilt-shift hero angle on a beam edge: blurred copy + sharp focus band
      const drawBeam = () => { c.save(); c.translate(W / 2, H / 2); c.rotate(-.13); c.scale(1.9 + t * .08, 1.9 + t * .08); beam2D(c, -700 - t * 60, -110, 1400, 150, 'blast', 'gray', { dep: 120, u0: .2, sheen: .3 + t * .5, shadow: false }); c.restore(); };
      bgInk(c, t, { grid: false });
      c.save(); c.filter = 'blur(10px)'; drawBeam(); c.restore();
      c.save(); c.beginPath(); c.rect(0, H * .3, W, H * .38); c.clip(); drawBeam(); c.restore();
    } },
    // 4 · title
    { d: 3, label: 'Title', tr: { type: 'zoom', d: .35 }, draw: (c, t) => {
      bgInk(c, t);
      motes(c, t, 50, 5);
      beam2D(c, 260 - t * 40, 560, 1400, 150, 'hewn', 'honey', { sheen: seg(t, .3, 2.2, E.linear), u0: .05, shadow: true, dep: 90, end: 'none' });
      c.save(); c.globalAlpha = .0; c.restore();
      kicker(c, 'FEATURING', W / 2, 300, t - .1, C.accent, 'center');
      staggerText(c, 'Faux Wood Beams', W / 2, 450, t - .25, font('bold', 150), C.cream, { align: 'center', stagger: .035, dur: .7, dy: 60, track: -2 });
    } },
    // 5–7 · finished spaces
    { d: 2, label: 'Great room', tr: { type: 'beam', d: .6 }, draw: (c, t) => {
      drawSet(c, greatRoom({ style: 'hewn', finish: 'honey' }), camMove(t / 2, [[0.6, 1.5, 1.2], [0, 2.4, -8]], [[-.2, 1.7, -1], [0, 2.8, -9]], 64, 60));
      lowerThird(c, t - .2, 'Great Rooms', 'HAND HEWN · HONEY PECAN', { d: 1.8 });
    } },
    { d: 2, label: 'Vaulted', tr: { type: 'flash', d: .25 }, draw: (c, t) => {
      drawSet(c, vaultRoom({ style: 'sawn', finish: 'walnut' }), camMove(t / 2, [[1.2, 1.2, .6], [0, 3.6, -9]], [[-.8, 1.9, -.4], [0, 3.9, -9]], 62, 60));
      lowerThird(c, t - .2, 'Vaulted Ceilings', 'ROUGH SAWN · WALNUT', { d: 1.8 });
    } },
    { d: 2, label: 'Coffered', tr: { type: 'flash', d: .25 }, draw: (c, t) => {
      drawSet(c, cofferRoom({ style: 'smooth', finish: 'espresso' }), camMove(t / 2, [[-2.2, 1.4, .4], [1, 2.8, -7]], [[-1, 1.5, .2], [2.2, 2.6, -7]], 64, 62));
      lowerThird(c, t - .2, 'Coffered Grids', 'SMOOTH · ESPRESSO', { d: 1.8 });
    } },
    // 8–10 · installation b-roll with title
    ...[['Fasten blocks', 'Screw mounting blocks into the joists', 0, 1], ['Add adhesive', 'Run a bead along the top edges', 2, 2], ['Lift & secure', 'Slide over the blocks, fasten the sides', 2, 4]]
      .map(([ttl, sub, a, b], i) => ({ d: 2, label: 'Install ' + (i + 1), tr: i === 0 ? { type: 'push', d: .5 } : { type: 'fade', d: .2 }, draw: (c, t) => {
        bgPaper(c, t);
        const ph = i === 0 ? seg(t, 0, 1.2, E.linear) : i === 1 ? 2 : lerp(2, 4, seg(t, 0, 1.6, E.linear));
        installSection(c, i === 2 ? t - 1.2 : t, i === 2 && ph >= 3.99 ? 4 : ph, { top: 360, s: 1.05, cx: W * .64 });
        text(c, 'INSTALLS IN 3 STEPS', 120, 170, font('bold', 26), C.accent, 'left', 6);
        text(c, '0' + (i + 1), 120, 420, font('bold', 220), 'rgba(21,17,13,.9)', 'left', -6, seg(t, 0, .4));
        slotText(c, ttl, 124, 520, seg(t, .1, .7, E.outExpo), font('bold', 64), C.ink, 'left', -1, 64);
        text(c, sub, 126, 580, font('normal', 30), '#6c5b48', 'left', 0, seg(t, .3, .6));
        [0, 1, 2].forEach(k => { c.fillStyle = k <= i ? C.accent : 'rgba(21,17,13,.15)'; c.fillRect(126 + k * 70, 640, 56, 6); });
      } })),
    // 11 · designs
    { d: 3, label: 'Designs', tr: { type: 'beam', d: .6 }, draw: (c, t) => {
      bgInk(c, t);
      text(c, 'DESIGNS', 120, 160, font('bold', 26), C.accent, 'left', 6, seg(t, 0, .4));
      STYLES.forEach((st, i) => {
        const p = seg(t, .15 + i * beat * .5, .7, E.outExpo);
        const y = 230 + i * 205;
        c.save(); c.globalAlpha = p; c.translate((1 - p) * 300, 0);
        beam2D(c, 560, y, 1240, 120, st.id, ['honey', 'walnut', 'gray', 'natural'][i], { dep: 60, u0: .1 + i * .08, sheen: seg(t, .6 + i * .15, 1.6, E.linear) });
        slotText(c, st.name, 500, y + 80, p, font('bold', 50), C.cream, 'right', 0, 50);
        c.restore();
      });
    } },
    // 12 · colors
    { d: 3, label: 'Colors', tr: { type: 'flash', d: .25 }, draw: (c, t) => {
      bgInk(c, t, { glow: 'rgba(240,184,114,.12)' });
      const k = Math.min(FINISHES.length - 1, Math.floor(t / beat));
      const fin = FINISHES[k], prevF = FINISHES[Math.max(0, k - 1)];
      const wp = k === 0 ? 1 : seg(t - k * beat, 0, .3, E.outExpo);
      beam2D(c, 170, 330, 1580, 220, 'sawn', prevF.id, { dep: 110, u0: .15 });
      c.save(); c.beginPath(); c.rect(170, 250, 1700 * wp, 520); c.clip(); beam2D(c, 170, 330, 1580, 220, 'sawn', fin.id, { dep: 110, u0: .15, shadow: false }); c.restore();
      text(c, 'COLORS', 170, 190, font('bold', 26), C.accent, 'left', 6);
      slotText(c, fin.name, 170, 260, wp, font('bold', 60), C.cream, 'left', 0, 60);
      FINISHES.forEach((f, i) => {
        const x = 170 + i * 150, y = 800, on = i === k;
        const sw = wood('sawn', f.id);
        c.save(); roundRect(c, x, y, 120, 120, 60); c.clip(); c.drawImage(sw, 300, 60, 200, 120, x, y, 120, 120); c.restore();
        c.strokeStyle = on ? C.accent2 : 'rgba(244,236,223,.25)'; c.lineWidth = on ? 6 : 2; roundRect(c, x - (on ? 8 : 0), y - (on ? 8 : 0), 120 + (on ? 16 : 0), 120 + (on ? 16 : 0), 70); c.stroke();
      });
    } },
    // 13 · sizes
    { d: 3, label: 'Sizes', tr: { type: 'push', d: .45 }, draw: (c, t) => {
      bgInk(c, t);
      const g = seg(t, .2, 1.6, E.inOutCubic);
      const len = lerp(700, 1420, g), hgt = lerp(110, 190, seg(t, .5, 1.4, E.inOutCubic));
      const x = W / 2 - len / 2, y = 470 - hgt / 2;
      beam2D(c, x, y, len, hgt, 'hewn', 'walnut', { dep: hgt * .5, u0: .1 });
      dimLine(c, x, y - 60, x + len, y - 60, seg(t, .4, .8), 'LENGTH');
      dimLine(c, x - 110, y, x - 110, y + hgt, seg(t, .7, .8), 'HEIGHT');
      pill(c, 'MULTIPLE WIDTHS, HEIGHTS & LENGTHS', W / 2, 700, seg(t, 1.1, .5), { size: 22, align: 'center' });
      text(c, 'SIZES', 120, 160, font('bold', 26), C.accent, 'left', 6);
      headline(c, ['Built to fit your space'], W / 2, 900, t - .8, { size: 64, align: 'center' });
    } },
    // 14 · creative uses
    { d: 3, label: 'Creative uses', tr: { type: 'beam', d: .6 }, draw: (c, t) => {
      drawSet(c, mantelWall({ style: 'hewn', finish: 'walnut', drop: seg(t, .1, .9, E.linear) }), camMove(t / 3, [[1.3, 1.3, 1.6], [0, 1.5, -2.8]], [[.3, 1.55, .9], [0, 1.6, -2.8]], 50, 44));
      lowerThird(c, t - .5, 'Beam Mantels', 'CREATIVE USES', { d: 2.5 });
      ['Mantels', 'Headers', 'Accent walls'].forEach((s, i) => pill(c, s, 1380 + 0 * i, 180 + i * 80, seg(t, .9 + i * .25, .4), { size: 26 }));
    } },
    // 15 · unique feature: lightweight
    { d: 2.5, label: 'Lightweight', tr: { type: 'flash', d: .25 }, draw: (c, t) => {
      bgInk(c, t, { glow: 'rgba(240,184,114,.18)' });
      const fl = Math.sin(t * 2.2) * 14, lift = seg(t, 0, 1, E.outBack) * 60;
      beam2D(c, 360, 520 - lift + fl, 1200, 150, 'blast', 'natural', { dep: 70, u0: .3, sheen: seg(t, .3, 2, E.linear) });
      c.save(); c.globalAlpha = .35 * (1 - lift / 120); c.fillStyle = '#000'; c.beginPath(); c.ellipse(W / 2, 860, 560 - lift, 26, 0, 0, TAU); c.fill(); c.restore();
      icon(c, 'feather', 250, 240, 1, seg(t, .1, .8));
      headline(c, ['Real-wood look.', 'A fraction of the weight.'], 340, 230, t - .1, { size: 72, color: [C.cream, C.accent2] });
    } },
    // 16 · review (or Amazon-safe alternative)
    variant === 'noreviews'
      ? { d: 3.5, label: 'Benefit recap', tr: { type: 'fade', d: .3 }, draw: (c, t) => {
        bgInk(c, t);
        headline(c, ['Designed to install', 'in an afternoon.'], W / 2, 420, t, { size: 96, align: 'center', color: [C.cream, C.accent2] });
        [['block', 'Mounting blocks'], ['glue', 'Adhesive'], ['drill', 'Finish screws']].forEach(([ic, lb], i) => {
          const x = W / 2 - 420 + i * 420, p = seg(t, .6 + i * .25, .6, E.outBack);
          c.save(); c.globalAlpha = clamp(p); icon(c, ic, x, 700, .9 * p); text(c, lb, x, 810, font('bold', 30), C.cream, 'center', 1); c.restore();
        });
      } }
      : { d: 3.5, label: 'Review', tr: { type: 'fade', d: .3 }, draw: (c, t) => {
        bgInk(c, t);
        for (let i = 0; i < 5; i++) icon(c, 'star', W / 2 - 200 + i * 100, 330, .9 * seg(t, .1 + i * .08, .5, E.outBack), 1, C.accent2);
        headline(c, ['“Paste your top customer', 'review here — keep it short.”'], W / 2, 560, t - .3, { size: 72, align: 'center', face: SERIF, weight: 'italic' });
        text(c, '— VERIFIED CUSTOMER NAME', W / 2, 760, font('bold', 26), C.muted, 'center', 5, seg(t, 1, .5));
        pill(c, 'REVIEW PLACEHOLDER', W / 2, 870, seg(t, 1.2, .5) * .8, { size: 18, align: 'center' });
      } },
    // 17 · logo
    { d: 3, label: 'Logo', tr: { type: 'fade', d: .4 }, draw: (c, t) => { endCard(c, t, {}); } },
  ];
  const tl = timeline(shots);
  tl.fadeIn = .25; tl.fadeOut = .5;
  return tl;
};
