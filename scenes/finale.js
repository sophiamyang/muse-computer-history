// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:24:26.404Z (revision)
(() => {
  const INK = '#121212';
  const GLOW = '#F56A2B';
  const FLARE = '#FB2D74';
  const BLOOM = '#7A155C';
  const PLUM = '#F0ACD6';

  function mixHex(a, b, t) {
    const ah = a.replace('#',''), bh = b.replace('#','');
    const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
    const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
  }

  const WIN = { x: 380, y: 70, w: 1160, h: 560 };
  const LAP = { x: 900, y: 500, w: 520, h: 340, r: 8 };

  const BURSTS = [
    { x: 220, y: 240, r: 273, c: GLOW, t: 3.9 },
    { x: 480, y: 200, r: 338, c: FLARE, t: 4.2 },
    { x: 740, y: 270, r: 234, c: PLUM, t: 4.5 },
    { x: 960, y: 190, r: 340, c: GLOW, t: 4.85 },
    { x: 1180, y: 250, r: 260, c: FLARE, t: 5.15 },
    { x: 620, y: 310, r: 221, c: PLUM, t: 5.45 },
    { x: 1040, y: 300, r: 247, c: GLOW, t: 5.75 },
    { x: 360, y: 280, r: 208, c: FLARE, t: 5.95 },
  ];

  let textTargets = null;
  function getTargets() {
    if (textTargets) return textTargets;
    const cw = 900, ch = 260;
    const can = U.canvas(cw, ch);
    const g = can.getContext('2d');
    g.clearRect(0, 0, cw, ch);
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '700 96px Georgia, "Times New Roman", serif';
    g.fillText('Muse Spark', cw / 2, 92);
    g.font = '500 34px Georgia, serif';
    g.fillText('now on Fireworks', cw / 2, 170);
    const data = g.getImageData(0, 0, cw, ch).data;
    const pts = [];
    const step = 6;
    for (let y = 0; y < ch; y += step) {
      for (let x = 0; x < cw; x += step) {
        const a = data[(y * cw + x) * 4 + 3];
        if (a > 120) {
          if (U.hash(x, y) > 0.35) pts.push({ x: x - cw / 2, y: y - ch / 2 });
        }
      }
    }
    textTargets = pts.slice(0, 420);
    return textTargets;
  }

  SCENE({
    id: 'finale',
    year: 'Now',
    title: 'Muse Spark on Fireworks',
    floor: 860,
    width: 1920,
    act: {
      at: 680,
      dur: 7.4,
      prompt: 'ask the laptop',
      hotspot: { x: 900, y: 500, w: 520, h: 340 },
      facing: 1,
      pose: u => {
        if (u < 0) return { armR: 0.12, armL: 0.12, crouch: 0, lookY: 0.1 };
        if (u < 1.4) {
          const t = U.ss(0, 0.4, u);
          return {
            armR: U.lerp(0.12, 0.95, t) + Math.sin(u * 14) * 0.04,
            armL: U.lerp(0.12, 0.35, t),
            elbowR: 0.6,
            lean: 0.08 * t,
            lookY: 0.35,
            crouch: 0.02 * t
          };
        }
        if (u < 3.0) {
          const w = U.ss(1.4, 1.9, u);
          return {
            armR: U.lerp(0.95, 0.45, w),
            armL: 0.25,
            elbowR: 0.4,
            lookY: U.lerp(0.35, 0.15, w),
            lean: 0.04
          };
        }
        if (u < 3.8) {
          const t = U.ss(3.0, 3.7, u);
          return {
            armR: U.lerp(0.45, 1.65, U.easeIO(t)),
            armL: U.lerp(0.25, 0.18, t),
            elbowR: U.lerp(0.4, 0.55, t),
            lean: U.lerp(0.04, 0.12, t),
            lookY: U.lerp(0.15, 0.25, t),
            crouch: 0.04 * Math.sin(t * 3.14)
          };
        }
        if (u < 6.0) {
          const t = U.ss(3.8, 4.4, u);
          return {
            armR: U.lerp(1.65, 1.9, t) + Math.sin(u * 2.2) * 0.08,
            armL: 0.12,
            elbowR: 0.5,
            lean: U.lerp(0.12, -0.08, t),
            lookY: U.lerp(0.25, -0.65, t),
            crouch: 0
          };
        }
        const wave = Math.sin(u * 6) * 0.35 * U.ss(6.0, 6.4, u) * (1 - U.ss(7.0, 7.4, u) * 0.5);
        return {
          armR: 1.85 + wave,
          armL: 0.12,
          elbowR: 0.9 + wave * 0.3,
          lookY: -0.6,
          lean: -0.06,
          crouch: 0
        };
      }
    },
    portals: {
      laptop: { x: LAP.x, y: LAP.y, w: LAP.w, h: LAP.h, r: LAP.r, glow: 'rgba(245,106,43,0.45)' }
    },
    characterStyle: { tint: '#F56A2B', tintAlpha: 0.08 },
    shadow: 'rgba(18,18,18,0.22)',
    music: { voice: 'full', bpm: 96, root: 62 },
    sfx: [
      { u: 0.25, kind: 'tick' },
      { u: 0.55, kind: 'tick' },
      { u: 0.85, kind: 'tick' },
      { u: 1.15, kind: 'tick' },
      { u: 1.85, kind: 'beep' },
      { u: 2.30, kind: 'beep' },
      { u: 2.85, kind: 'beep' },
      { u: 3.55, kind: 'thump' },
      { u: 6.85, kind: 'chime' }
    ],
    page: {
      heading: 'Light up the sky',
      text: 'We taught computers to count, then to connect. Now we ask them to help us imagine — and the sky answers.'
    },
    spots: [
      { x: 142, y: 700, w: 140, h: 140, label: 'Desk plant', text: 'A pothos that has survived every operating system since 2012.' },
      { x: 1480, y: 620, w: 120, h: 140, label: 'Desk lamp', text: 'Warm light for late ideas — the original dark mode was just a lamp.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha *= a;
      const bw = 480, bh = 58, bx = 1890 - bw, by = 48;
      c.fillStyle = 'rgba(244,240,236,0.98)';
      U.rrect(c, bx, by, bw, bh, 29); c.fill();
      c.strokeStyle = 'rgba(18,18,18,0.10)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = GLOW; c.beginPath(); c.arc(bx + 20, by + 29, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = INK;
      c.font = '700 26px Helvetica, Arial, sans-serif';
      c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('Now', bx + 38, by + 30);
      c.fillStyle = 'rgba(18,18,18,0.28)'; c.fillRect(bx + 108, by + 16, 1.5, 26);
      c.fillStyle = INK;
      c.font = '600 22px Helvetica, Arial, sans-serif';
      c.fillText('Muse Spark on Fireworks', bx + 122, by + 30);
      c.restore();
    },

    draw(c, s) {
      const bg = U.cached('finale_bg5', 1920, 1080, g => {
        g.fillStyle = '#F4F0EC'; g.fillRect(0, 0, 1920, 1080);
        let wg = g.createRadialGradient(1620, 620, 80, 960, 540, 1500);
        wg.addColorStop(0, '#F4F0EC');
        wg.addColorStop(0.32, '#EDE6DE');
        wg.addColorStop(0.58, '#D8CEC0');
        wg.addColorStop(0.78, '#CFC6BC');
        wg.addColorStop(1, '#9E948A');
        g.fillStyle = wg; g.fillRect(0, 0, 1920, 860);
        let vg = g.createRadialGradient(960, 540, 600, 960, 540, 1300);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(28,22,18,0.22)');
        g.fillStyle = vg; g.fillRect(0, 0, 1920, 1080);
        const rng = U.rng(99);
        for (let i = 0; i < 2500; i++) {
          g.fillStyle = `rgba(18,18,18,${0.012 * rng()})`;
          g.fillRect(rng() * 1920, rng() * 700, 1.5, 1.5);
        }
        g.fillStyle = '#E8DDD3';
        U.rrect(g, WIN.x - 18, WIN.y - 18, WIN.w + 36, WIN.h + 36, 14); g.fill();
        g.strokeStyle = '#D9C8B6'; g.lineWidth = 2; g.stroke();
        g.fillStyle = '#EFE7DE';
        g.fillRect(WIN.x - 18, WIN.y + WIN.h + 6, WIN.w + 36, 22);
        g.fillStyle = 'rgba(18,18,18,0.08)'; g.fillRect(WIN.x - 18, WIN.y + WIN.h + 6, WIN.w + 36, 6);
        const deskY = 860;
        let gr = g.createLinearGradient(0, deskY, 0, 1080);
        gr.addColorStop(0, '#D9C2A3'); gr.addColorStop(0.2, '#C9AD8E'); gr.addColorStop(1, '#A88B6A');
        g.fillStyle = gr; g.fillRect(0, deskY, 1920, 220);
        g.strokeStyle = 'rgba(80,50,30,0.09)'; g.lineWidth = 1;
        for (let y = deskY + 12; y < 1080; y += 18) {
          g.beginPath();
          for (let x = 0; x < 1920; x += 20) {
            const n = U.noise(x * 0.008, y * 0.05) * 6;
            if (x === 0) g.moveTo(x, y + n); else g.lineTo(x, y + n);
          }
          g.stroke();
        }
        g.fillStyle = '#B89A7A';
        g.fillRect(0, deskY, 1920, 28);
        g.fillStyle = '#E9D9C2';
        g.fillRect(0, deskY, 1920, 8);
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillRect(0, deskY + 2, 1920, 2);
        g.fillStyle = 'rgba(60,35,18,0.22)';
        g.fillRect(0, deskY + 28, 1920, 6);
        g.fillStyle = 'rgba(60,35,18,0.12)';
        g.fillRect(0, deskY + 34, 1920, 10);
        g.fillStyle = '#1A1A1A';
        g.beginPath(); g.arc(1620, deskY - 2, 38, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2B2B2B'; g.fillRect(1612, deskY - 140, 16, 140);
        g.fillStyle = '#E8DDD3';
        g.beginPath(); g.moveTo(1580, 700); g.lineTo(1660, 700); g.lineTo(1648, 730); g.lineTo(1592, 730); g.closePath(); g.fill();
        g.fillStyle = 'rgba(18,18,18,0.08)'; g.fillRect(1592, 718, 56, 12);
        g.fillStyle = '#C9AD8E'; U.rrect(g, 120, deskY - 130, 110, 110, 18); g.fill();
        g.fillStyle = '#B89A7A'; U.rrect(g, 120, deskY - 130, 110, 22, 10); g.fill();
        g.fillStyle = '#6A8A5A';
        for (let i = 0; i < 7; i++) {
          const lx = 175 + Math.cos(i * 0.9) * 42;
          const ly = deskY - 130 - 18 - Math.sin(i * 1.1) * 22;
          g.beginPath(); g.ellipse(lx, ly, 34, 18, -0.4 + i * 0.18, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = '#7FA06E';
        for (let i = 0; i < 5; i++) {
          const lx = 175 + Math.cos(i * 1.2 + 0.5) * 28;
          const ly = deskY - 150 - i * 8;
          g.beginPath(); g.ellipse(lx, ly, 26, 14, 0.2, 0, Math.PI * 2); g.fill();
        }
      });
      c.drawImage(bg, 0, 0);

      // window sky
      c.save();
      U.rrect(c, WIN.x, WIN.y, WIN.w, WIN.h, 10); c.clip();
      const skyT = 0.5 + 0.5 * Math.sin(s.now * 0.18);
      let sg = c.createLinearGradient(0, WIN.y, 0, WIN.y + WIN.h);
      sg.addColorStop(0, mixHex('#2A2522', '#2F2824', skyT));
      sg.addColorStop(0.45, '#3A2C26');
      sg.addColorStop(0.62, '#6B4A3A');
      sg.addColorStop(0.82, '#C97A3A');
      sg.addColorStop(1, '#E9A86A');
      c.fillStyle = sg; c.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
      // strong horizon band 120px
      let hg = c.createLinearGradient(0, WIN.y + WIN.h - 120, 0, WIN.y + WIN.h);
      hg.addColorStop(0, 'rgba(233,168,106,0)');
      hg.addColorStop(0.35, 'rgba(233,168,106,0.55)');
      hg.addColorStop(1, 'rgba(255,210,150,0.85)');
      c.fillStyle = hg; c.fillRect(WIN.x, WIN.y + WIN.h - 120, WIN.w, 120);
      // city silhouette
      c.fillStyle = '#121212';
      c.beginPath();
      c.moveTo(WIN.x, WIN.y + WIN.h);
      const buildings = [
        [0, 180, 90], [90, 220, 70], [160, 160, 110], [270, 200, 80], [350, 140, 120],
        [470, 190, 90], [560, 170, 100], [660, 210, 70], [730, 150, 130], [860, 180, 90],
        [950, 200, 80], [1030, 160, 100], [1130, 190, 30]
      ];
      for (const b of buildings) {
        const x = WIN.x + b[0], w = b[2], h = b[1];
        c.lineTo(x, WIN.y + WIN.h - h);
        c.lineTo(x + w * 0.3, WIN.y + WIN.h - h - 18);
        c.lineTo(x + w * 0.6, WIN.y + WIN.h - h);
        c.lineTo(x + w, WIN.y + WIN.h - h);
        c.lineTo(x + w, WIN.y + WIN.h);
      }
      c.lineTo(WIN.x + WIN.w, WIN.y + WIN.h);
      c.closePath(); c.fill();
      // bright windows 8x10 alpha 0.85 with twinkle
      for (let i = 0; i < 110; i++) {
        const rx = U.hash(i, 11), ry = U.hash(i, 17);
        const wx = WIN.x + 20 + rx * (WIN.w - 40);
        const wy = WIN.y + WIN.h - 40 - ry * 180;
        if (wy > WIN.y + WIN.h - 210) {
          const tw = 0.7 + 0.3 * Math.sin(s.now * 0.9 + i * 1.7);
          const flick = U.hash(i, 5) > 0.82 ? (1 + 0.5 * Math.sin(s.now * 3 + i)) : 1;
          c.fillStyle = `rgba(255,220,150,${0.85 * tw * flick})`;
          c.fillRect(wx, wy, 8, 10);
          // warm glow around window
          c.fillStyle = `rgba(255,190,110,${0.12 * tw})`;
          c.fillRect(wx - 2, wy - 2, 12, 14);
        }
      }
      // two larger warm light clusters
      for (let k = 0; k < 2; k++) {
        const cx = WIN.x + (k === 0 ? 320 : 880);
        const cy = WIN.y + WIN.h - 110;
        let cg = c.createRadialGradient(cx, cy, 10, cx, cy, 70);
        cg.addColorStop(0, 'rgba(255,210,140,0.35)');
        cg.addColorStop(1, 'rgba(255,210,140,0)');
        c.fillStyle = cg;
        c.beginPath(); c.arc(cx, cy, 70, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = 'rgba(244,240,236,0.07)';
      for (let i = 0; i < 4; i++) {
        const cx = WIN.x + 200 + i * 300 + Math.sin(s.now * 0.08 + i) * 20;
        const cy = WIN.y + 90 + Math.cos(s.now * 0.06 + i) * 8;
        c.beginPath(); c.ellipse(cx, cy, 90, 22, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(cx + 40, cy + 6, 60, 16, 0, 0, Math.PI * 2); c.fill();
      }
      c.restore();

      // fireworks
      const flashCols = [];
      let burstPeak = 0;
      c.save();
      U.rrect(c, WIN.x, WIN.y, WIN.w, WIN.h, 10); c.clip();
      for (const b of BURSTS) {
        const age = s.u - b.t;
        if (age < -0.35 || age > 2.2) continue;
        if (age < 0) {
          const p = U.ss(-0.35, 0, age);
          const rx = b.x + (U.hash(b.x, b.y) - 0.5) * 10;
          const ry = U.lerp(WIN.y + WIN.h - 10, b.y, p);
          c.fillStyle = b.c;
          c.globalAlpha = 0.9 * p;
          c.beginPath(); c.arc(WIN.x + rx, ry, 3, 0, Math.PI * 2); c.fill();
          c.strokeStyle = b.c; c.globalAlpha = 0.35 * p; c.lineWidth = 2;
          c.beginPath(); c.moveTo(WIN.x + rx, ry); c.lineTo(WIN.x + rx, ry + 18); c.stroke();
          c.globalAlpha = 1;
          continue;
        }
        const expand = U.easeOut(U.clamp(age / 0.45, 0, 1));
        const radius = b.r * expand;
        const fade = 1 - U.ss(0.6, 1.5, age);
        if (age >= 0 && age < 0.9) {
          const f = Math.exp(-age * 2.8) * 0.9;
          flashCols.push({ c: b.c, a: f });
          burstPeak = Math.max(burstPeak, f);
        }
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 0.30 * fade;
        let halo = c.createRadialGradient(WIN.x + b.x, b.y, 0, WIN.x + b.x, b.y, radius * 1.35);
        halo.addColorStop(0, b.c);
        halo.addColorStop(0.35, BLOOM);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = halo;
        c.beginPath(); c.arc(WIN.x + b.x, b.y, radius * 1.35, 0, Math.PI * 2); c.fill();
        c.restore();
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 0.98 * fade;
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(WIN.x + b.x, b.y, 38 * (1 - expand * 0.45), 0, Math.PI * 2); c.fill();
        c.globalAlpha = 0.55 * fade;
        c.beginPath(); c.arc(WIN.x + b.x, b.y, 55 * (1 - expand * 0.3), 0, Math.PI * 2); c.fill();
        c.restore();
        const N = 78;
        for (let i = 0; i < N; i++) {
          const ang = (i / N) * Math.PI * 2 + U.hash(b.x + i, b.y) * 0.7;
          const spd = 0.65 + U.hash(i, b.x) * 0.95;
          const r = radius * spd * (0.55 + 0.45 * U.hash(i, b.y));
          const grav = age * age * 42;
          const px = WIN.x + b.x + Math.cos(ang) * r;
          const py = b.y + Math.sin(ang) * r + grav;
          const a = fade * (0.65 + 0.35 * U.hash(i, b.y * 2));
          c.save();
          c.globalCompositeOperation = 'lighter';
          c.globalAlpha = a;
          c.strokeStyle = b.c;
          c.lineWidth = 2.5;
          c.beginPath();
          c.moveTo(px, py);
          c.lineTo(px - Math.cos(ang) * 14, py - Math.sin(ang) * 14 - 3);
          c.stroke();
          c.fillStyle = (i % 3 === 0) ? '#fff' : b.c;
          c.beginPath(); c.arc(px, py, 2.1, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        if (age > 0.12 && age < 0.95) {
          c.save();
          c.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 14; k++) {
            const sx = WIN.x + b.x + (U.hash(k, b.x) - 0.5) * radius * 1.3;
            const sy = b.y + (U.hash(k, b.y) - 0.5) * radius * 1.3 + age * 18;
            const tw = 0.5 + 0.5 * Math.sin(s.now * 8 + k);
            c.globalAlpha = 0.6 * fade * tw;
            c.fillStyle = '#fff';
            c.beginPath(); c.arc(sx, sy, 1.4, 0, Math.PI * 2); c.fill();
          }
          c.restore();
        }
      }
      if (s.u >= 5.6) {
        const targets = getTargets();
        const t = U.clamp((s.u - 6.0) / 1.4, 0, 1);
        const e = U.easeIO(t);
        const centerX = WIN.x + WIN.w / 2;
        const centerY = WIN.y + WIN.h / 2 + 10;
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < targets.length; i++) {
          const pt = targets[i];
          const b = BURSTS[i % BURSTS.length];
          const sx = WIN.x + b.x + (U.hash(i, 7) - 0.5) * 220;
          const sy = b.y + (U.hash(i, 13) - 0.5) * 140;
          const tx = centerX + pt.x;
          const ty = centerY + pt.y;
          const x = U.lerp(sx, tx, e) + Math.sin(s.now * 1.2 + i) * (1 - e) * 6;
          const y = U.lerp(sy, ty, e) + Math.cos(s.now * 1.1 + i) * (1 - e) * 6;
          const a = 0.45 + 0.55 * e;
          const col = [GLOW, FLARE, PLUM, '#fff'][i % 4];
          c.globalAlpha = a * (0.7 + 0.3 * U.hash(i, 2));
          c.fillStyle = col;
          const sz = U.lerp(2.2, 1.4, e);
          c.beginPath(); c.arc(x, y, sz, 0, Math.PI * 2); c.fill();
          if (e > 0.85) {
            c.fillStyle = 'rgba(255,255,255,0.9)';
            c.beginPath(); c.arc(x, y, 0.7, 0, Math.PI * 2); c.fill();
          }
        }
        c.restore();
        if (t > 0.55) {
          const ta = U.ss(0.55, 0.95, t);
          c.save();
          c.globalAlpha = ta;
          let back = c.createRadialGradient(centerX, centerY + 12, 40, centerX, centerY + 12, 420);
          back.addColorStop(0, 'rgba(18,18,18,0.55)');
          back.addColorStop(0.55, 'rgba(18,18,18,0.38)');
          back.addColorStop(1, 'rgba(18,18,18,0)');
          c.fillStyle = back;
          c.beginPath(); c.ellipse(centerX, centerY + 12, 420, 140, 0, 0, Math.PI * 2); c.fill();
          c.shadowColor = GLOW; c.shadowBlur = 24;
          c.fillStyle = '#fff';
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.font = '700 92px Georgia, "Times New Roman", serif';
          c.fillText('Muse Spark', centerX, centerY - 18);
          c.shadowBlur = 0;
          let tg = c.createLinearGradient(centerX - 300, 0, centerX + 300, 0);
          tg.addColorStop(0, '#fff'); tg.addColorStop(0.5, '#FFE6F0'); tg.addColorStop(1, '#fff');
          c.fillStyle = tg; c.fillText('Muse Spark', centerX, centerY - 18);
          c.fillStyle = '#F4F0EC';
          c.font = '600 40px Georgia, serif';
          c.fillText('now on Fireworks', centerX, centerY + 66);
          c.restore();
        }
      }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2;
      U.rrect(c, WIN.x, WIN.y, WIN.w, WIN.h, 10); c.stroke();
      c.strokeStyle = 'rgba(18,18,18,0.08)'; c.lineWidth = 1;
      U.rrect(c, WIN.x - 1, WIN.y - 1, WIN.w + 2, WIN.h + 2, 11); c.stroke();
      // window frame outer glow when bursts peak
      if (burstPeak > 0.15) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = burstPeak * 0.35;
        c.strokeStyle = GLOW;
        c.lineWidth = 10;
        c.shadowColor = GLOW; c.shadowBlur = 24;
        U.rrect(c, WIN.x - 6, WIN.y - 6, WIN.w + 12, WIN.h + 12, 14); c.stroke();
        c.restore();
      }
      // per-burst additive wash tinting walls/desk
      for (const f of flashCols) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = Math.min(0.10, f.a * 0.10);
        c.fillStyle = f.c;
        c.fillRect(0, 0, 1920, 1080);
        c.restore();
      }
      // desk surface faint reflection of bursts
      if (burstPeak > 0.1) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = burstPeak * 0.10;
        let rg = c.createLinearGradient(0, 860, 0, 920);
        rg.addColorStop(0, GLOW);
        rg.addColorStop(1, 'rgba(245,106,43,0)');
        c.fillStyle = rg;
        c.fillRect(WIN.x, 860, WIN.w, 60);
        c.restore();
      }
      // thump flash 0.18 alpha for 0.15s
      const thumpAge = s.u - 3.55;
      if (thumpAge >= 0 && thumpAge < 0.15) {
        const tf = 1 - thumpAge / 0.15;
        c.save(); c.globalAlpha = 0.18 * tf; c.fillStyle = '#FFF0E0'; c.fillRect(0, 0, 1920, 1080); c.restore();
      } else if (thumpAge >= -0.05 && thumpAge < 0) {
        // pre-flash anticipation
        const pf = U.ss(-0.05, 0, thumpAge);
        c.save(); c.globalAlpha = 0.06 * pf; c.fillStyle = '#FFF0E0'; c.fillRect(0, 0, 1920, 1080); c.restore();
      }
      const lidT = U.clamp(U.ss(3.0, 3.8, s.u), 0, 1);
      if (lidT > 0.01) {
        c.save();
        c.globalAlpha = lidT * 0.10;
        c.fillStyle = '#1A120E';
        c.fillRect(0, 0, 1920, 1080);
        c.restore();
      }

      // subtle warm glow under Jolly for silhouette (replaces grey rect)
      c.save();
      c.globalAlpha = 1;
      let jg = c.createRadialGradient(680, 860, 10, 680, 860, 140);
      jg.addColorStop(0, 'rgba(245,106,43,0.14)');
      jg.addColorStop(0.5, 'rgba(245,106,43,0.07)');
      jg.addColorStop(1, 'rgba(245,106,43,0)');
      c.fillStyle = jg;
      c.beginPath(); c.ellipse(680, 860, 200, 40, 0, 0, Math.PI * 2); c.fill();
      c.restore();

      // lamp pool with burst flicker 1.0 -> 1.15x
      const burstFlick = 1 + burstPeak * 0.15;
      const lampFlick = (0.96 + 0.04 * Math.sin(s.now * 1.1) + 0.02 * Math.sin(s.now * 2.3)) * burstFlick;
      c.save();
      c.globalAlpha = 0.18 * lampFlick;
      let lg = c.createRadialGradient(1620, 700, 20, 1620, 700, 520);
      lg.addColorStop(0, 'rgba(245,106,43,0.85)'); lg.addColorStop(0.35, 'rgba(245,106,43,0.28)'); lg.addColorStop(1, 'rgba(245,106,43,0)');
      c.fillStyle = lg;
      c.beginPath(); c.ellipse(1620, 700, 520, 420, 0, 0, Math.PI * 2); c.fill();
      c.restore();
      c.save();
      c.globalAlpha = 0.16 * lampFlick;
      let lg2 = c.createRadialGradient(1620, 860, 20, 1620, 860, 380);
      lg2.addColorStop(0, 'rgba(245,106,43,0.55)'); lg2.addColorStop(1, 'rgba(245,106,43,0)');
      c.fillStyle = lg2;
      c.beginPath(); c.ellipse(1620, 860, 380, 160, 0, 0, Math.PI * 2); c.fill();
      c.restore();
      c.save(); c.globalAlpha = 0.11 * lampFlick; c.fillStyle = '#F56A2B';
      c.beginPath(); c.moveTo(1592, 730); c.lineTo(1648, 730); c.lineTo(1820, 860); c.lineTo(1420, 860); c.closePath(); c.fill();
      c.restore();

      if (lidT < 0.9) {
        const glowA = (1 - lidT) * 0.14;
        c.save();
        let sg2 = c.createRadialGradient(1160, 700, 40, 1160, 700, 300);
        sg2.addColorStop(0, 'rgba(255,248,240,0.9)'); sg2.addColorStop(1, 'rgba(255,248,240,0)');
        c.globalAlpha = glowA;
        c.fillStyle = sg2;
        c.beginPath(); c.ellipse(1160, 700, 300, 160, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      // laptop with perspective lid closing onto base
      const lidEase = U.easeIO(lidT);
      const angle = lidEase * Math.PI * 0.5;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const hingeY = LAP.y + LAP.h;
      const screenH = LAP.h;
      const topY = hingeY - screenH * cosA;
      const persp = 0.18 * sinA;
      const baseX = LAP.x - 16, baseW = LAP.w + 32, baseY = hingeY, baseH = 22;

      // closed lid readable slab when lidT >= 0.88
      if (lidT >= 0.88) {
        const closedY = hingeY - 22;
        // soft drop shadow 12px
        c.save();
        c.fillStyle = 'rgba(0,0,0,0.25)';
        c.beginPath();
        U.rrect(c, baseX + 6, closedY + 8, baseW, 22, 8);
        c.fill();
        c.restore();
        // base slab
        c.fillStyle = '#2B2B2B';
        U.rrect(c, baseX, closedY, baseW, 22, 8); c.fill();
        // top highlight #3A3A3A
        c.fillStyle = '#3A3A3A';
        U.rrect(c, baseX, closedY, baseW, 10, 8); c.fill();
        // front edge #B89A7A 4px
        c.fillStyle = '#B89A7A';
        c.fillRect(baseX + 8, closedY + 18, baseW - 16, 4);
        // 2px white edge highlight
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.fillRect(baseX + 10, closedY + 2, baseW - 20, 2);
        // subtle lid seam line
        c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
        U.rrect(c, baseX, closedY, baseW, 22, 8); c.stroke();
        // keep footprint shadow on desk
        c.fillStyle = 'rgba(18,18,18,0.14)';
        c.fillRect(baseX + 8, baseY + 6, baseW, 10);
      } else {
        // open / closing perspective
        c.fillStyle = 'rgba(18,18,18,0.14)';
        c.fillRect(baseX + 8, baseY + 6, baseW, 10);
        c.fillStyle = '#2B2B2B';
        U.rrect(c, baseX, baseY, baseW, baseH, 6); c.fill();
        c.fillStyle = '#3A3A3A'; U.rrect(c, baseX, baseY, baseW, 6, 6); c.fill();
        c.fillStyle = '#1E1E1E'; U.rrect(c, baseX + 12, baseY + 4, baseW - 24, baseH - 8, 4); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.06)'; U.rrect(c, baseX + baseW / 2 - 28, baseY + 6, 56, 8, 3); c.fill();

        c.save();
        const lidLeft = LAP.x, lidRight = LAP.x + LAP.w;
        const topInset = persp * LAP.w * 0.5;
        const curLeftTop = lidLeft + topInset, curRightTop = lidRight - topInset;
        const curTop = topY;
        const curBottom = hingeY;

        c.fillStyle = '#1A1A1A';
        c.beginPath();
        c.moveTo(curLeftTop - 6, curTop - 6);
        c.lineTo(curRightTop + 6, curTop - 6);
        c.lineTo(lidRight + 6, curBottom + 2);
        c.lineTo(lidLeft - 6, curBottom + 2);
        c.closePath(); c.fill();

        const sx = curLeftTop, sw = curRightTop - curLeftTop, sh = curBottom - curTop;
        const bright = 1 - U.ss(0.55, 0.88, lidT);
        c.save();
        c.beginPath();
        c.moveTo(curLeftTop, curTop);
        c.lineTo(curRightTop, curTop);
        c.lineTo(lidRight, curBottom);
        c.lineTo(lidLeft, curBottom);
        c.closePath(); c.clip();
        c.globalAlpha = bright;
        c.fillStyle = '#FFFBF6'; c.fillRect(sx, curTop, sw, sh);
        // chrome bar 26px
        c.fillStyle = '#FFF8F0'; c.fillRect(sx, curTop, sw, 26);
        c.fillStyle = '#E8DDD3'; c.fillRect(sx, curTop + 26, sw, 1);
        c.fillStyle = '#D9C8B6'; c.beginPath(); c.arc(sx + 14, curTop + 13, 4, 0, 7); c.fill();
        c.beginPath(); c.arc(sx + 26, curTop + 13, 4, 0, 7); c.fill();
        c.beginPath(); c.arc(sx + 38, curTop + 13, 4, 0, 7); c.fill();
        // white field 64px high
        const fieldY = curTop + 38;
        const fieldH = 64;
        c.fillStyle = '#FFFFFF'; U.rrect(c, sx + 12, fieldY, sw - 24, fieldH, 10); c.fill();
        c.strokeStyle = 'rgba(245,106,43,0.95)'; c.lineWidth = 2.5; c.stroke();
        const q = 'light up the sky?';
        const qLen = Math.max(0, Math.min(q.length, Math.floor(U.ss(0, 1.4, s.u) * q.length + 0.5)));
        c.textAlign = 'left'; c.textBaseline = 'middle';
        if (s.u >= 0) {
          c.fillStyle = '#121212';
          c.font = '600 42px Helvetica, Arial, sans-serif';
          const txt = q.slice(0, qLen);
          c.fillText(txt, sx + 22, fieldY + fieldH / 2 + 1);
          if (qLen < q.length || (s.u < 1.4 && Math.floor(s.now * 2) % 2 === 0)) {
            const tw = c.measureText(txt).width;
            c.fillStyle = GLOW;
            c.fillRect(sx + 22 + tw + 5, fieldY + 12, 2.5, fieldH - 24);
          }
        }
        if (s.u >= 1.4) {
          let ans = 'On it…';
          if (s.u >= 1.85) ans = 'On it… 3…';
          if (s.u >= 2.30) ans = 'On it… 3… 2…';
          if (s.u >= 2.85) ans = 'On it… 3… 2… 1…';
          let pop = 1;
          if (s.u >= 1.85 && s.u < 2.05) pop = 1 + 0.28 * (1 - U.ss(1.85, 2.05, s.u));
          if (s.u >= 2.30 && s.u < 2.50) pop = 1 + 0.28 * (1 - U.ss(2.30, 2.50, s.u));
          if (s.u >= 2.85 && s.u < 3.05) pop = 1 + 0.28 * (1 - U.ss(2.85, 3.05, s.u));
          // scale to 1.28 on number beats
          if (pop > 1.05) pop = 1.28;
          c.save();
          c.translate(sx + 22, fieldY + fieldH + 32);
          c.scale(pop, pop);
          if (pop > 1.02) { c.shadowColor = GLOW; c.shadowBlur = 16; }
          c.fillStyle = '#6B4A3A';
          c.font = '700 36px Helvetica, Arial, sans-serif';
          c.textAlign = 'left'; c.textBaseline = 'middle';
          c.fillText(ans, 0, 0);
          c.restore();
        }
        if (lidT > 0.75) {
          const lineA = (1 - U.ss(0.75, 0.92, lidT));
          c.globalAlpha = lineA * 0.9;
          c.fillStyle = '#FFF8F0';
          c.fillRect(sx + sw * 0.15, curBottom - 6, sw * 0.7, 4);
        }
        c.restore();
        c.save(); c.globalAlpha = 0.07 * (1 - lidT) * bright;
        let gg = c.createLinearGradient(sx, curTop, sx + sw, curTop + sh);
        gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = gg; c.fillRect(sx, curTop, sw, sh);
        c.restore();
        if (lidT > 0.15 && lidT < 0.85) {
          const hx = (curLeftTop + curRightTop) / 2 + 10;
          const hy = curTop + 2;
          c.save();
          c.globalAlpha = 0.95;
          c.fillStyle = '#F5E6D3';
          c.beginPath(); c.ellipse(hx, hy, 14, 10, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = 'rgba(18,18,18,0.12)';
          c.beginPath(); c.ellipse(hx, hy + 3, 10, 4, 0, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        if (lidT > 0.12 && lidT < 0.95) {
          const thick = sinA * 8;
          c.fillStyle = '#2A2A2A';
          c.beginPath();
          c.moveTo(curLeftTop - 6, curTop - 6);
          c.lineTo(curLeftTop - 6 + thick * 0.3, curTop - 6 - thick * 0.4);
          c.lineTo(curRightTop + 6 - thick * 0.3, curTop - 6 - thick * 0.4);
          c.lineTo(curRightTop + 6, curTop - 6);
          c.closePath(); c.fill();
        }
        c.restore();
        c.fillStyle = 'rgba(255,255,255,0.08)';
        c.fillRect(baseX + 30, baseY - 1, baseW - 60, 2);
      }

      // redesigned fireworks.ai sign 360x80
      const signOn = U.clamp(U.ss(6.6, 7.1, s.u), 0, 1);
      const signX = WIN.x + WIN.w + 24, signY = WIN.y + 80, signW = 360, signH = 80;
      c.save();
      c.globalAlpha = 0.98;
      c.fillStyle = '#121212';
      U.rrect(c, signX, signY, signW, signH, 14); c.fill();
      if (signOn > 0.01) {
        c.save();
        c.globalAlpha = signOn * (0.85 + 0.15 * Math.sin(s.now * 2.2));
        c.strokeStyle = GLOW; c.lineWidth = 3; c.shadowColor = GLOW; c.shadowBlur = 20;
        U.rrect(c, signX, signY, signW, signH, 14); c.stroke();
        c.restore();
        c.save(); c.globalAlpha = signOn * 0.15; c.fillStyle = GLOW;
        U.rrect(c, signX, signY, signW, signH, 14); c.fill(); c.restore();
      } else {
        c.strokeStyle = 'rgba(244,240,236,0.18)'; c.lineWidth = 1.5;
        U.rrect(c, signX, signY, signW, signH, 14); c.stroke();
      }
      c.fillStyle = signOn > 0.3 ? '#F4F0EC' : 'rgba(244,240,236,0.75)';
      c.font = '700 32px Helvetica, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('fireworks.ai', signX + signW / 2 - 10, signY + signH / 2 + 1);
      // 8px GLOW dot pulsing 0->1 between 6.6-7.1
      const dotA = signOn;
      c.globalAlpha = 0.95 * (0.5 + 0.5 * dotA);
      c.fillStyle = GLOW;
      c.beginPath(); c.arc(signX + signW - 28, signY + signH / 2, 8, 0, Math.PI * 2); c.fill();
      if (dotA > 0.5) {
        c.save(); c.shadowColor = GLOW; c.shadowBlur = 12; c.globalAlpha = dotA;
        c.fillStyle = GLOW;
        c.beginPath(); c.arc(signX + signW - 28, signY + signH / 2, 8, 0, Math.PI * 2); c.fill(); c.restore();
      }
      c.restore();

      const grain = U.grain('finale', 0.06, 0.10, true);
      c.save(); c.globalAlpha = 0.07;
      U.tile(c, grain, U.step(s.now, 8) * 97 % 512, U.step(s.now, 8) * 53 % 512);
      c.restore();

      const vig = U.cached('finale_vig5', 1920, 1080, g => {
        const gr = g.createRadialGradient(960, 540, 600, 960, 540, 1300);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(18,18,18,0.16)');
        g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
      });
      c.drawImage(vig, 0, 0);
    },
    front(c, s) {
      if (s.u > 3.8 && s.u < 7.4) {
        let f = 0;
        for (const b of BURSTS) {
          const age = s.u - b.t;
          if (age >= 0 && age < 1.0) f = Math.max(f, Math.exp(-age * 1.8) * 0.5);
        }
        if (f > 0.02) {
          c.save(); c.globalAlpha = f * 0.14; c.fillStyle = GLOW;
          c.fillRect(0, 860, 1920, 18);
          c.restore();
        }
      }
    }
  });
})();
