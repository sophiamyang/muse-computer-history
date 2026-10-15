// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:31:47.561Z (revision)
// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:28:43.792Z (revision)
// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:22:20.083Z (revision)
(() => {
  const INK = '#111314';
  const ORANGE = '#F56A2B';
  const BOARD = '#f6f6f3';
  const YELLOW = '#ffeaa6';
  const TRAY = '#e9ecef';

  function rrect(c, x, y, w, h, r) { U.rrect(c, x, y, w, h, r); }

  function handMarker(g, x, y, w, h, col) {
    g.save();
    g.fillStyle = col;
    rrect(g, x, y, w, h, 4); g.fill();
    g.fillStyle = 'rgba(255,255,255,.92)';
    g.fillRect(x + 6, y + 6, w - 12, 9);
    g.fillStyle = '#222';
    g.beginPath(); g.moveTo(x + w - 2, y + h / 2 - 3); g.lineTo(x + w + 10, y + h / 2 - 1); g.lineTo(x + w + 10, y + h / 2 + 3); g.lineTo(x + w - 2, y + h / 2 + 5); g.closePath(); g.fill();
    g.restore();
  }

  SCENE({
    id: 'whiteboard',
    year: '2017',
    title: 'Attention',
    floor: 790,
    width: 1920,
    act: {
      at: 680,
      dur: 2.2,
      prompt: 'fill in the blank',
      hotspot: { x: 1160, y: 330, w: 270, h: 150 },
      path: u => {
        if (u < 0) return { dx: 0, dy: 0 };
        const walk = U.ss(1.25, 2.05, u);
        return { dx: 480 * walk, dy: 0 };
      },
      pose: u => {
        if (u < 0) return { armR: 0.12, elbowR: 0.2, crouch: 0, lean: 0, lookY: -0.2 };
        const write = U.ss(0.05, 0.7, u);
        const hold = U.ss(1.15, 1.55, u);
        let armR = U.lerp(0.12, 2.15, write);
        if (u > 0.15 && u < 0.7) armR += Math.sin(u * 20) * 0.06;
        if (u > 0.7) armR = U.lerp(2.15, 2.05, U.ss(0.7, 1.3, u));
        const elbowR = U.lerp(0.2, 0.55, write) + (u > 0.2 && u < 0.65 ? Math.sin(u * 18) * 0.08 : 0);
        const lean = U.lerp(0, 0.14, write) - 0.02 * hold;
        const lookY = U.lerp(-0.15, -0.55, U.ss(0.1, 0.6, u));
        const crouch = 0.04 * U.ss(0, 0.25, u);
        return { armR, elbowR, crouch, lean, lookY };
      }
    },
    portals: {
      circle: { x: 1168, y: 268, w: 280, h: 280, r: 140, shape: 'circle', glow: 'rgba(245,106,43,0.65)' }
    },
    characterStyle: { tint: '#ffffff', tintAlpha: 0.08 },
    shadow: 'rgba(0,0,0,0.18)',
    music: { voice: 'piano', bpm: 96, root: 62 },
    sfx: [
      { u: 0.25, kind: 'tick' },
      { u: 0.55, kind: 'tick' },
      { u: 1.35, kind: 'chime' },
      { u: 1.75, kind: 'chime' }
    ],
    page: {
      heading: 'The model looks back',
      text: 'Attention lets a model weigh every word at once. To fill “it”, it looks hardest at “cat” — the word that gives the pronoun its meaning.'
    },
    spots: [
      { x: 1480, y: 680, w: 170, h: 160, label: 'Sticky notes', text: 'Q K V — query, key and value. The ingredients of attention, borrowed from retrieval.' },
      { x: 70, y: 120, w: 220, h: 220, label: 'Attention grid', text: 'Each row asks a word who it attends to. Darker means stronger focus.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha = a;
      c.fillStyle = 'rgba(255,255,255,0.96)';
      rrect(c, 1520, 42, 370, 78, 12); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2.4; rrect(c, 1520, 42, 370, 78, 12); c.stroke();
      c.fillStyle = ORANGE; c.beginPath(); c.arc(1548, 81, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = INK;
      c.font = '700 28px "Courier New", monospace';
      c.textAlign = 'right'; c.textBaseline = 'middle';
      c.fillText('2017 · Attention', 1870, 82);
      c.restore();
    },

    draw(c, s) {
      const bg = U.cached('whiteboard_bg3', 1920, 1080, g => {
        g.fillStyle = BOARD; g.fillRect(0, 0, 1920, 1080);
        const vg = g.createRadialGradient(960, 540, 650, 960, 540, 1350);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.07)'); g.fillStyle = vg; g.fillRect(0, 0, 1920, 1080);
        g.fillStyle = '#dfe6e9'; g.fillRect(0, 0, 1920, 18); g.fillRect(0, 0, 18, 1080); g.fillRect(1902, 0, 18, 1080);
        g.fillStyle = '#b2bec3'; g.fillRect(0, 18, 1920, 4); g.fillRect(18, 0, 4, 1080);
        g.save(); g.globalAlpha = 0.12; g.fillStyle = INK;
        g.font = '400 22px "Courier New", monospace';
        g.fillText('softmax( QKᵀ / √d ) V', 90, 98);
        g.font = '400 16px "Courier New", monospace';
        g.fillText('seq2seq  →  attention is all you need', 90, 122);
        g.restore();
        g.fillStyle = TRAY; g.fillRect(0, 1008, 1920, 72);
        g.fillStyle = '#ced6db'; g.fillRect(0, 1008, 1920, 10);
        g.strokeStyle = 'rgba(0,0,0,0.14)'; g.lineWidth = 2; g.strokeRect(0, 1008, 1920, 72);
        handMarker(g, 760, 1032, 110, 18, '#111314');
        handMarker(g, 890, 1032, 110, 18, ORANGE);
        handMarker(g, 1020, 1032, 110, 18, '#0984e3');
        handMarker(g, 1150, 1032, 110, 18, '#00b894');
        g.fillStyle = '#636e72'; U.rrect(g, 620, 1028, 90, 28, 6); g.fill();
        g.fillStyle = '#b2bec3'; U.rrect(g, 620, 1028, 90, 12, 6); g.fill();
        function sticky(x, y, w, h, rot) {
          g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot);
          g.fillStyle = YELLOW; g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = 14; g.shadowOffsetY = 7;
          U.rrect(g, -w / 2, -h / 2, w, h, 8); g.fill(); g.shadowColor = 'transparent';
          g.fillStyle = 'rgba(0,0,0,0.09)'; g.fillRect(-w / 2, -h / 2, w, 12);
          g.restore();
        }
        sticky(1460, 660, 208, 182, 0.05);
        sticky(1680, 690, 188, 168, -0.04);
        g.save(); g.fillStyle = 'rgba(17,19,20,0.88)'; g.font = '700 19px "Courier New", monospace';
        g.translate(1564, 750); g.rotate(0.05); g.fillText('Q = query', -52, 0); g.fillText('K = key', -46, 24); g.fillText('V = value', -52, 48); g.restore();
        g.save(); g.fillStyle = 'rgba(17,19,20,0.88)'; g.font = '700 17px "Courier New", monospace';
        g.translate(1774, 770); g.rotate(-0.04); g.fillText('heads = 8', -48, 0); g.fillText('d = 512', -44, 22); g.restore();
        const gx = 70, gy = 130, gs = 220;
        g.save();
        g.fillStyle = 'rgba(255,255,255,0.98)'; U.rrect(g, gx - 12, gy - 28, gs + 24, gs + 48, 12); g.fill();
        g.strokeStyle = INK; g.lineWidth = 2.5; U.rrect(g, gx - 12, gy - 28, gs + 24, gs + 48, 12); g.stroke();
        g.fillStyle = INK; g.font = '800 13px "Courier New", monospace'; g.textAlign = 'center';
        g.fillText('SELF-ATTENTION', gx + gs / 2, gy - 10);
        const cols = 8;
        const cell = gs / cols;
        for (let r = 0; r < cols; r++) for (let col = 0; col < cols; col++) {
          const v = U.hash(r * 10 + col, 77);
          let a = 0.10 + v * 0.20;
          if (r === 1) a = 0.14 + v * 0.35;
          if (r === 1 && col === 1) a = 0.88;
          if (r === col) a = Math.max(a, 0.48);
          g.fillStyle = r === 1 && col === 1 ? ORANGE : `rgba(17,19,20,${a})`;
          g.fillRect(gx + col * cell + 1, gy + r * cell + 1, cell - 2, cell - 2);
        }
        g.strokeStyle = 'rgba(17,19,20,0.28)'; g.lineWidth = 1;
        for (let i = 0; i <= cols; i++) {
          g.beginPath(); g.moveTo(gx + i * cell, gy); g.lineTo(gx + i * cell, gy + gs); g.stroke();
          g.beginPath(); g.moveTo(gx, gy + i * cell); g.lineTo(gx + gs, gy + i * cell); g.stroke();
        }
        g.font = '700 10px "Courier New", monospace'; g.fillStyle = 'rgba(17,19,20,0.75)'; g.textAlign = 'center';
        const labels = ['the', 'cat', 'nap', 'bec', '___', 'was', 'tir', ' .'];
        for (let i = 0; i < cols; i++) g.fillText(labels[i], gx + i * cell + cell / 2, gy + gs + 14);
        g.restore();
        g.fillStyle = ORANGE; g.beginPath(); g.arc(300, 380, 6, 0, 7); g.fill();
        g.fillStyle = INK; g.font = '700 12px "Courier New", monospace'; g.textAlign = 'left';
        g.fillText('strongest link', 314, 384);
        g.fillStyle = INK; g.font = '700 16px "Courier New", monospace'; g.textAlign = 'left';
        g.fillText('lab — 2017', 90, 62);
      });
      c.drawImage(bg, 0, 0);

      const lineY = 410;
      const words = [
        { t: 'the', x: 120 },
        { t: 'cat', x: 300 },
        { t: 'napped', x: 480 },
        { t: 'because', x: 800 },
        { t: '___', x: 1168, isBlank: true, w: 260 },
        { t: 'was', x: 1470 },
        { t: 'tired', x: 1645 },
        { t: '.', x: 1880 }
      ];

      c.save();
      const bandGrad = c.createLinearGradient(0, 300, 0, 560);
      bandGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bandGrad.addColorStop(0.5, 'rgba(0,0,0,0.035)');
      bandGrad.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = bandGrad;
      c.fillRect(0, 300, 1920, 260);
      c.restore();

      c.save();
      c.fillStyle = INK;
      c.font = '700 78px "Courier New", monospace';
      c.textBaseline = 'alphabetic';
      c.textAlign = 'left';
      const jitter = Math.sin(s.now * 1.1) * 0.35;
      for (const w of words) {
        if (w.isBlank) {
          const bx = w.x, bw = w.w, by = lineY + 18;
          c.save();
          c.strokeStyle = INK; c.lineWidth = 5; c.lineCap = 'round';
          c.beginPath();
          c.moveTo(bx, by + jitter);
          c.quadraticCurveTo(bx + bw / 2, by + jitter + 1.5, bx + bw, by + jitter);
          c.stroke();
          c.restore();
        } else {
          c.fillText(w.t, w.x, lineY + jitter * (w.x % 2 ? 1 : -1) * 0.3);
        }
      }
      c.restore();

      const wordCenters = {
        the: { x: 180, y: lineY },
        cat: { x: 360, y: lineY },
        napped: { x: 610, y: lineY },
        because: { x: 960, y: lineY },
        it: { x: 1298, y: lineY },
        was: { x: 1530, y: lineY },
        tired: { x: 1745, y: lineY }
      };

      const u = s.u;
      // 0.0-0.7 write "it"
      let writeProg = 0;
      if (u >= 0) writeProg = U.clamp(U.ss(0.0, 0.7, u), 0, 1);
      const iProg = U.clamp(writeProg * 2.2, 0, 1);
      const tProg = U.clamp((writeProg - 0.45) * 2.0, 0, 1);
      const itX = 1298 - 38, itY = lineY;

      if (writeProg > 0) {
        c.save();
        c.fillStyle = INK;
        c.font = '700 92px "Courier New", monospace';
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        if (iProg > 0) {
          c.save(); c.globalAlpha = iProg;
          c.fillText('i', itX, itY);
          if (iProg > 0.85) {
            const dA = U.ss(0.85, 1.0, iProg);
            c.globalAlpha = dA;
            c.beginPath(); c.arc(itX + 16, itY - 62, 6 * dA, 0, Math.PI * 2); c.fill();
          }
          c.restore();
        }
        if (tProg > 0) {
          c.save(); c.globalAlpha = tProg;
          c.fillText('t', itX + 38, itY);
          c.restore();
        }
        c.restore();
      }

      const portal = this.portals.circle;
      const cx = portal.x + portal.w / 2;
      const cy = portal.y + portal.h / 2;
      const rx = portal.w / 2, ry = portal.h / 2;

      // 0.7-1.2 circle draws, interior stays board
      let circleProg = 0;
      if (u >= 0) circleProg = U.ss(0.7, 1.2, u);

      if (circleProg > 0) {
        c.save();
        c.strokeStyle = 'rgba(245,106,43,0.28)';
        c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round';
        c.globalAlpha = 0.9;
        c.beginPath();
        const steps = 72;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2 * circleProg;
          if (t > Math.PI * 2 * circleProg) break;
          const wob = Math.sin(t * 3) * 2.5 + Math.cos(t * 5) * 1.5;
          const x = cx + Math.cos(t - Math.PI * 0.35) * (rx + wob * 0.25);
          const y = cy + Math.sin(t - Math.PI * 0.35) * (ry + wob * 0.25);
          if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
        c.strokeStyle = ORANGE;
        c.lineWidth = 8; c.globalAlpha = 0.98;
        c.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2 * circleProg;
          if (t > Math.PI * 2 * circleProg) break;
          const wob = Math.sin(t * 3) * 2.5 + Math.cos(t * 5) * 1.5;
          const x = cx + Math.cos(t - Math.PI * 0.35) * (rx + wob * 0.25);
          const y = cy + Math.sin(t - Math.PI * 0.35) * (ry + wob * 0.25);
          if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
      } else {
        // at rest: readable 2.5px ~60% opacity, empty interior
        c.save(); c.strokeStyle = 'rgba(245,106,43,0.60)'; c.lineWidth = 2.5;
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.stroke(); c.restore();
      }

      // Jolly separation: ground shadow + body glow
      const heroX = s.hero ? s.hero.x : this.act.at;
      const heroFloor = s.floor || 790;
      c.save();
      c.fillStyle = 'rgba(0,0,0,0.14)';
      c.beginPath(); c.ellipse(heroX, heroFloor + 8, 110, 22, 0, 0, Math.PI * 2); c.fill();
      const bodyGrad = c.createRadialGradient(heroX, heroFloor - 165, 40, heroX, heroFloor - 165, 220);
      bodyGrad.addColorStop(0, 'rgba(0,0,0,0.10)');
      bodyGrad.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = bodyGrad;
      c.beginPath(); c.ellipse(heroX, heroFloor - 165, 180, 190, 0, 0, Math.PI * 2); c.fill();
      c.restore();

      // marker in hand - large 90x18, visible from start
      const hand = s.hero && s.hero.hands ? s.hero.hands.R : { x: this.act.at + 120, y: s.floor - 210 };
      const hx = hand.x - (s.camX || 0), hy = hand.y;
      if (s.u > -0.3) {
        const targetX = itX + 22;
        const targetY = itY - 22;
        const ang = Math.atan2(targetY - hy, targetX - hx);
        const showLen = 90;
        c.save();
        c.translate(hx, hy);
        c.rotate(ang);
        c.fillStyle = 'rgba(0,0,0,0.18)';
        rrect(c, 1, -7, showLen, 18, 6); c.fill();
        c.fillStyle = '#0f1112';
        rrect(c, 0, -9, showLen, 18, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.92)';
        c.fillRect(8, -6, showLen - 22, 5);
        c.fillStyle = ORANGE;
        c.beginPath(); c.moveTo(showLen - 2, -7); c.lineTo(showLen + 12, -1); c.lineTo(showLen + 12, 1); c.lineTo(showLen - 2, 7); c.closePath(); c.fill();
        c.fillStyle = '#ff8a4a';
        c.beginPath(); c.moveTo(showLen + 12, -1); c.lineTo(showLen + 16, 0); c.lineTo(showLen + 12, 1); c.closePath(); c.fill();
        c.restore();
        if (s.u > 0.05 && s.u < 0.7 && writeProg > 0 && writeProg < 1) {
          c.save(); c.fillStyle = INK; c.globalAlpha = 0.95;
          c.beginPath(); c.arc(targetX, targetY, 4, 0, Math.PI * 2); c.fill(); c.restore();
        }
      }

      // 1.2-1.9 attention arcs spring ABOVE sentence, never through letters
      let arcProg = 0;
      if (u >= 0) arcProg = U.ss(1.2, 1.9, u);
      if (arcProg > 0) {
        const weights = [
          { key: 'the', w: 0.06 },
          { key: 'cat', w: 0.42 },
          { key: 'napped', w: 0.14 },
          { key: 'because', w: 0.08 },
          { key: 'was', w: 0.07 },
          { key: 'tired', w: 0.23 }
        ];
        // text top estimation for 78px Courier on alphabetic baseline
        const textTop = lineY - 62;
        const startX = wordCenters.it.x;
        const startY = textTop - 10;
        c.save();
        for (let i = 0; i < weights.length; i++) {
          const wt = weights[i];
          const target = wordCenters[wt.key];
          const isCat = wt.key === 'cat';
          const stagger = i * 0.12;
          const prog = U.clamp((arcProg * 1.35 - stagger * 0.45), 0, 1);
          if (prog <= 0) continue;
          const eased = U.easeOut(prog);
          const sx = startX, sy = startY;
          const ex = target.x, ey = textTop - 10;
          const dist = Math.abs(sx - ex);
          const mx = (sx + ex) / 2;
          const my = textTop - 60 - 0.35 * dist;
          const lw = isCat ? 8.5 : 3.8 + wt.w * 6;
          c.strokeStyle = isCat ? ORANGE : 'rgba(17,19,20,0.92)';
          c.lineWidth = lw * eased;
          c.lineCap = 'round';
          c.globalAlpha = 0.95 * eased;
          c.beginPath();
          c.moveTo(sx, sy);
          const curEx = U.lerp(sx, ex, eased);
          const curEy = U.lerp(sy, ey, eased);
          const curMx = U.lerp(sx, mx, eased);
          const curMy = U.lerp(sy, my, eased);
          c.quadraticCurveTo(curMx, curMy, curEx, curEy);
          c.stroke();
          if (eased > 0.92) {
            c.save();
            c.fillStyle = isCat ? ORANGE : INK;
            c.globalAlpha = (eased - 0.92) * 12.5 * 0.95;
            const ang = Math.atan2(ey - my, ex - mx);
            c.translate(curEx, curEy);
            c.rotate(ang);
            c.beginPath(); c.moveTo(0, 0); c.lineTo(-14, -6); c.lineTo(-14, 6); c.closePath(); c.fill();
            c.restore();
          }
        }
        c.restore();
        if (arcProg > 0.55) {
          const a = U.ss(0.55, 0.85, arcProg);
          // place label above the cat arc peak
          const catX = wordCenters.cat.x;
          const catDist = Math.abs(startX - catX);
          const catMx = (startX + catX) / 2;
          const catMy = textTop - 60 - 0.35 * catDist;
          c.save();
          c.globalAlpha = a;
          c.fillStyle = 'rgba(255,255,255,0.96)';
          rrect(c, catMx - 85, catMy - 28, 170, 36, 10); c.fill();
          c.strokeStyle = ORANGE; c.lineWidth = 2; rrect(c, catMx - 85, catMy - 28, 170, 36, 10); c.stroke();
          c.fillStyle = ORANGE; c.font = '800 20px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('0.42 → cat', catMx, catMy - 10);
          c.restore();
        }
      }

      // 1.9-2.4 ONLY NOW fade peek inside circle - arcs stay visible on top
      let peekAlpha = 0;
      if (u >= 0) peekAlpha = U.clamp(U.ss(1.9, 2.4, u), 0, 1);
      if (peekAlpha > 0) {
        c.save();
        c.beginPath(); c.ellipse(cx, cy, rx - 5, ry - 5, 0, 0, Math.PI * 2); c.clip();
        c.globalAlpha = peekAlpha;
        s.peek('circle');
        c.fillStyle = 'rgba(245,106,43,0.06)'; c.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
        c.restore();
        const pulse = 0.55 + 0.45 * Math.sin(s.now * 3.2);
        c.save(); c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 2.5 + pulse * 1.2; c.globalAlpha = 0.75 + pulse * 0.15;
        c.beginPath(); c.ellipse(cx, cy, rx - 2, ry - 2, 0, 0, Math.PI * 2); c.stroke(); c.restore();
        c.save(); c.strokeStyle = ORANGE; c.lineWidth = 2; c.globalAlpha = 0.9;
        c.beginPath(); c.ellipse(cx, cy, rx - 6, ry - 6, 0, 0, Math.PI * 2); c.stroke(); c.restore();
      }

      c.save(); c.globalAlpha = 0.05;
      U.tile(c, U.grain('whiteboard'), U.step(s.now, 8) * 97 % 512, 0);
      c.restore();
    },

    front(c, s) {
      c.save(); c.globalAlpha = 0.03;
      const grd = c.createLinearGradient(0, 0, 1920, 0);
      grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.5, 'rgba(0,0,0,0.4)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = grd;
      c.fillRect(0, 0, 1920, 12);
      c.restore();
    }
  });
})();
