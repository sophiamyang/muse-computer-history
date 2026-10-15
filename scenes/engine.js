// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T18:39:57.400Z (revision)
// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:23:47.291Z (revision)
(() => {
  const INK = '#1a1208';
  const PAPER = '#f6eed6';
  const BRASS = '#8c6a2e';
  const BRASS2 = '#b8943a';
  const BRASS_DARK = '#6e4f1e';

  // crank centre derived from act.at +175 , floor-175  (act.at 1080, floor 860)
  const CX = 1255;
  const CY = 685;
  const CR = 75;

  function gearShape(c, x, y, r, teeth, ang, inner) {
    c.save();
    c.translate(x, y);
    c.rotate(ang);
    c.fillStyle = '#d8b86a';
    c.strokeStyle = INK;
    c.lineWidth = 3;
    c.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.42) / teeth) * Math.PI * 2;
      const a2 = ((i + 0.58) / teeth) * Math.PI * 2;
      const ro = r + 13;
      const ri = r - 1;
      if (i === 0) c.moveTo(Math.cos(a0) * ri, Math.sin(a0) * ri);
      c.lineTo(Math.cos(a0) * ro, Math.sin(a0) * ro);
      c.lineTo(Math.cos(a1) * ro, Math.sin(a1) * ro);
      c.lineTo(Math.cos(a2) * ri, Math.sin(a2) * ri);
    }
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = '#fdf6df';
    c.strokeStyle = INK;
    c.lineWidth = 2.4;
    c.beginPath();
    c.arc(0, 0, inner, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.strokeStyle = 'rgba(26,18,8,0.35)';
    c.lineWidth = 1.8;
    for (let i = 0; i < 4; i++) {
      c.save();
      c.rotate((Math.PI / 2) * i);
      c.beginPath();
      c.moveTo(inner * 0.35, 0);
      c.lineTo(inner, 0);
      c.stroke();
      c.restore();
    }
    c.fillStyle = '#c0392b';
    c.strokeStyle = INK;
    c.lineWidth = 1.6;
    c.beginPath();
    c.arc(r - 12, 0, 7, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = INK;
    c.beginPath();
    c.arc(0, 0, 7, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function archedWindow(g, x, y, w, h) {
    const r = w / 2;
    g.save();
    g.fillStyle = '#efe6c8';
    g.strokeStyle = INK;
    g.lineWidth = 2.6;
    g.beginPath();
    g.moveTo(x, y + h);
    g.lineTo(x, y + r);
    g.arc(x + r, y + r, r, Math.PI, 0);
    g.lineTo(x + w, y + h);
    g.closePath();
    g.fill();
    g.stroke();
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + r, y + h);
    g.moveTo(x, y + r);
    g.lineTo(x + w, y + r);
    g.stroke();
    g.save();
    g.beginPath();
    g.moveTo(x, y + h);
    g.lineTo(x, y + r);
    g.arc(x + r, y + r, r, Math.PI, 0);
    g.lineTo(x + w, y + h);
    g.closePath();
    g.clip();
    U.hatch(g, x, y, w, h, Math.PI / 4, 8, 'rgba(26,18,8,0.18)', 1);
    g.restore();
    g.restore();
  }

  function crankTheta(s) {
    const p = U.clamp(s.u < 0 ? 0 : s.u / 1.4, 0, 1);
    // eased 0..1 over 1.4s, one full turn
    const e = s.u < 0 ? 0 : U.easeIO(p);
    return -Math.PI / 2 + e * Math.PI * 2;
  }

  SCENE({
    id: 'engine',
    year: '1843',
    title: 'Analytical Engine',
    floor: 860,
    width: 1920,
    act: {
      at: 1080,
      dur: 2.2,
      prompt: 'turn the crank',
      hotspot: { x: CX - 75, y: CY - 75, w: 150, h: 150 },
      facing: 1,
      path: u => ({ dx: 0, dy: 0 }),
      pose: u => {
        if (u < 0) return { armR: 0.12, armL: 0.12, elbowR: 0.2, elbowL: 0.2, crouch: 0, lean: 0, lookY: 0 };
        const p = U.clamp(u / 1.4, 0, 1);
        const e = U.easeIO(p);
        const theta = -Math.PI / 2 + e * Math.PI * 2;
        // armR high when knob up, low when down
        const armR = 1.55 - 0.65 * Math.sin(theta);
        const elbowR = 0.45 + 0.25 * Math.abs(Math.cos(theta));
        const lean = 0.08 + 0.04 * Math.sin(theta);
        const lookY = -0.18 - 0.08 * Math.sin(theta);
        if (u <= 1.4) {
          return { armR, armL: 0.18, elbowR, elbowL: 0.2, crouch: 0.04 * U.ss(0, 0.3, u), lean, lookY };
        } else {
          const t = U.ss(1.4, 2.2, u);
          return {
            armR: U.lerp(armR, 1.2, t),
            armL: U.lerp(0.18, 0.35, t),
            elbowR: U.lerp(elbowR, 0.35, t),
            elbowL: 0.25,
            crouch: 0,
            lean: U.lerp(lean, 0.12, t),
            lookY: U.lerp(lookY, -0.35, t)
          };
        }
      }
    },
    portals: {
      wheels: { x: 1297, y: 347, w: 420, h: 280, r: 10, glow: 'rgba(255,200,60,0.65)' }
    },
    characterStyle: { tint: '#7a5a32', tintAlpha: 0.35 },
    treat(img) {
      const o = U.canvas(img.width, img.height);
      const g = o.getContext('2d');
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.strokeStyle = 'rgba(26,18,8,0.11)';
      g.lineWidth = 1;
      for (let i = -img.height; i < img.width + img.height; i += 7) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + img.height, img.height);
        g.stroke();
      }
      return o;
    },
    shadow: 'rgba(26,18,8,0.35)',
    music: { voice: 'music_box', bpm: 96, root: 62 },
    sfx: [
      { u: 0.35, kind: 'tick' },
      { u: 0.70, kind: 'tick' },
      { u: 1.05, kind: 'tick' },
      { u: 1.40, kind: 'tick' },
      { u: 2.08, kind: 'chime' }
    ],
    page: {
      heading: 'The engine that could count',
      text: 'Babbage imagined a brass brain of wheels and punched cards that followed instructions — the idea of a programmable computer, long before electronics.'
    },
    spots: [
      { x: 118, y: 132, w: 380, h: 420, label: 'Arched windows', text: 'Daylight for draughtsmen. Every line of the Engine was first drawn by hand.' },
      { x: 760, y: 610, w: 210, h: 120, label: 'Punched cards', text: 'Stiff cards with holes told the Engine which operation to do next.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha = a;
      const bx = 1410, by = 48, bw = 480, bh = 96;
      c.fillStyle = PAPER;
      c.strokeStyle = INK;
      c.lineWidth = 2;
      U.rrect(c, bx, by, bw, bh, 6);
      c.fill();
      c.stroke();
      c.lineWidth = 1;
      c.strokeStyle = 'rgba(26,18,8,0.35)';
      U.rrect(c, bx + 4, by + 4, bw - 8, bh - 8, 4);
      c.stroke();
      c.save();
      c.beginPath();
      U.rrect(c, bx + 4, by + 4, bw - 8, bh - 8, 4);
      c.clip();
      U.hatch(c, bx, by, bw, bh, Math.PI / 4, 9, 'rgba(26,18,8,0.08)', 0.9);
      c.restore();
      c.fillStyle = INK;
      c.textAlign = 'right';
      c.textBaseline = 'alphabetic';
      c.font = '600 28px "Times New Roman", Georgia, serif';
      c.fillText('1843  ·  Analytical Engine', 1890, 78);
      c.fillStyle = 'rgba(26,18,8,0.75)';
      c.font = 'italic 600 13px "Times New Roman", Georgia, serif';
      c.fillText('DRAWN & ENGRAVED FOR THE WORKSHOP', 1890, 102);
      c.strokeStyle = INK;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(1460, 88);
      c.lineTo(1520, 88);
      c.moveTo(1660, 88);
      c.lineTo(1720, 88);
      c.stroke();
      c.beginPath();
      c.arc(1590, 88, 3, 0, Math.PI * 2);
      c.fill();
      c.restore();
    },

    draw(c, s) {
      const bg = U.cached('engine_bg4', 1920, 1080, g => {
        g.fillStyle = PAPER;
        g.fillRect(0, 0, 1920, 1080);
        const rng = U.rng(1843);
        for (let i = 0; i < 7000; i++) {
          g.fillStyle = `rgba(26,18,8,${0.035 * rng()})`;
          g.fillRect(rng() * 1920, rng() * 1080, 1.2, 0.9);
        }
        g.strokeStyle = 'rgba(26,18,8,0.55)';
        g.lineWidth = 2;
        g.strokeRect(28, 28, 1864, 1024);
        g.strokeStyle = 'rgba(26,18,8,0.18)';
        g.lineWidth = 1;
        g.strokeRect(32, 32, 1856, 1016);
        g.fillStyle = '#fffaf0';
        g.strokeStyle = INK;
        g.lineWidth = 2;
        U.rrect(g, 560, 42, 800, 54, 8);
        g.fill();
        g.stroke();
        g.fillStyle = INK;
        g.textAlign = 'center';
        g.font = '600 18px "Times New Roman", Georgia, serif';
        g.fillText('THE ANALYTICAL ENGINE — VIEW OF THE WORKSHOP & STORE', 960, 74);

        archedWindow(g, 130, 150, 306, 425);
        archedWindow(g, 500, 150, 306, 425);
        g.fillStyle = '#e8dcc0';
        g.fillRect(110, 575, 740, 16);
        g.strokeStyle = INK;
        g.lineWidth = 2;
        g.strokeRect(110, 575, 740, 16);

        g.save();
        g.beginPath();
        g.rect(36, 80, 920, 500);
        g.moveTo(130, 575); g.lineTo(130, 258); g.arc(283, 258, 153, Math.PI, 0); g.lineTo(436, 575); g.closePath();
        g.moveTo(500, 575); g.lineTo(500, 258); g.arc(653, 258, 153, Math.PI, 0); g.lineTo(806, 575); g.closePath();
        g.clip('evenodd');
        U.hatch(g, 36, 80, 920, 500, Math.PI / 5, 7, 'rgba(26,18,8,0.16)', 1);
        g.restore();

        g.save();
        g.beginPath(); g.rect(36, 720, 1884, 296); g.clip();
        g.fillStyle = '#efe2c2';
        g.fillRect(36, 720, 1884, 296);
        U.hatch(g, 36, 720, 1884, 296, 0, 6, 'rgba(26,18,8,0.14)', 1);
        g.restore();
        g.strokeStyle = 'rgba(26,18,8,0.55)';
        g.lineWidth = 1;
        for (let y = 760; y < 1016; y += 32) {
          g.beginPath(); g.moveTo(36, y); g.lineTo(1920, y); g.stroke();
        }
        for (let x = 36; x < 1920; x += 200) {
          g.beginPath(); g.moveTo(x, 720); g.lineTo(x + 36, 1016); g.stroke();
        }

        g.fillStyle = '#e9ddbf';
        g.fillRect(80, 700, 760, 24);
        g.strokeStyle = INK;
        g.lineWidth = 2.2;
        g.strokeRect(80, 700, 760, 24);
        g.save();
        g.beginPath(); g.rect(80, 700, 760, 24); g.clip();
        U.hatch(g, 80, 700, 760, 24, 0, 5, 'rgba(26,18,8,0.16)', 1);
        g.restore();

        const ex = 960, ey = 280, ew = 860, eh = 520;
        g.fillStyle = '#dcc99e';
        g.fillRect(ex, ey, ew, eh);
        g.fillStyle = '#c9b48a';
        g.fillRect(ex, ey, 320, eh);
        g.strokeStyle = INK;
        g.lineWidth = 3;
        g.strokeRect(ex, ey, ew, eh);
        g.lineWidth = 1.8;
        g.strokeStyle = 'rgba(26,18,8,0.65)';
        g.strokeRect(ex + 16, ey + 16, ew - 32, eh - 32);
        g.save();
        g.beginPath(); g.rect(ex + 2, ey + 2, ew - 4, eh - 4); g.clip();
        U.hatch(g, ex, ey, ew, eh, Math.PI / 2, 6, 'rgba(26,18,8,0.14)', 1);
        g.restore();
        g.save();
        g.beginPath(); g.rect(ex, ey, 110, eh); g.rect(ex + ew - 110, ey, 110, eh); g.clip();
        U.hatch(g, ex, ey, ew, eh, Math.PI / 2, 4, 'rgba(26,18,8,0.22)', 1.1);
        g.restore();
        g.strokeStyle = INK;
        g.lineWidth = 1.2;
        for (let i = 1; i < 4; i++) {
          const fx = ex + 28 + i * 22;
          g.beginPath(); g.moveTo(fx, ey + 20); g.lineTo(fx, ey + eh - 20); g.stroke();
          const fx2 = ex + ew - 28 - i * 22;
          g.beginPath(); g.moveTo(fx2, ey + 20); g.lineTo(fx2, ey + eh - 20); g.stroke();
        }
        // darker panel behind Jolly for silhouette
        g.save();
        g.beginPath(); g.rect(965, ey + 18, 215, eh - 36); g.clip();
        U.hatch(g, 965, ey, 215, eh, Math.PI / 2.2, 3.5, 'rgba(26,18,8,0.18)', 1);
        U.hatch(g, 965, ey, 215, eh, 0, 7, 'rgba(26,18,8,0.10)', 0.9);
        g.restore();
        g.strokeStyle = 'rgba(26,18,8,0.45)';
        g.lineWidth = 1.2;
        g.strokeRect(965, ey + 18, 215, eh - 36);

        g.fillStyle = '#dcc99e';
        g.fillRect(ex, ey + eh, ew, 70);
        g.strokeStyle = INK;
        g.lineWidth = 3;
        g.strokeRect(ex, ey + eh, ew, 70);
        g.save();
        g.beginPath(); g.rect(ex, ey + eh, ew, 70); g.clip();
        U.hatch(g, ex, ey + eh, ew, 70, 0, 4, 'rgba(26,18,8,0.20)', 1.1);
        g.restore();

        g.fillStyle = '#fffaf0';
        U.rrect(g, 460, 900, 1000, 84, 6); g.fill();
        g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
        g.fillStyle = INK;
        g.textAlign = 'center';
        g.font = '600 20px "Times New Roman", Georgia, serif';
        g.fillText('Fig. 1 — The Store and Mill, with punched Card apparatus and ringing Bell.', 960, 932);
        g.font = 'italic 14px "Times New Roman", Georgia, serif';
        g.fillStyle = 'rgba(26,18,8,0.8)';
        g.fillText('Engraved after the original drawings in the possession of Mr. Babbage.  London, 1843.', 960, 958);
        g.strokeStyle = INK;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(700, 942); g.lineTo(760, 942);
        g.moveTo(1200, 942); g.lineTo(1260, 942);
        g.stroke();
        g.fillStyle = INK;
        g.beginPath(); g.arc(730, 942, 2.5, 0, 7); g.fill(); g.beginPath(); g.arc(1230, 942, 2.5, 0, 7); g.fill();
      });
      c.drawImage(bg, -s.camX, 0);

      const shimmer = 0.5 + 0.5 * Math.sin(s.now * 0.7);
      c.save();
      c.globalAlpha = 0.03 * shimmer;
      c.fillStyle = '#fff8e0';
      c.fillRect(32, 32, 1856, 1016);
      c.restore();

      // portal
      const portal = this.portals.wheels;
      const pulseGlow = 0.25 + 0.30 * (0.5 + 0.5 * Math.sin(s.now * 1.4 * Math.PI * 2));
      c.save();
      c.shadowColor = `rgba(255,200,60,${pulseGlow})`;
      c.shadowBlur = 30;
      c.fillStyle = `rgba(255,200,60,${0.12 + pulseGlow * 0.14})`;
      U.rrect(c, portal.x - 8, portal.y - 8, portal.w + 16, portal.h + 16, portal.r + 6);
      c.fill();
      c.restore();

      c.save();
      c.fillStyle = BRASS;
      U.rrect(c, portal.x - 10, portal.y - 10, portal.w + 20, portal.h + 20, portal.r + 8);
      c.fill();
      c.strokeStyle = INK;
      c.lineWidth = 3.2;
      c.stroke();
      c.strokeStyle = BRASS2;
      c.lineWidth = 2.2;
      U.rrect(c, portal.x - 7, portal.y - 7, portal.w + 14, portal.h + 14, portal.r + 5);
      c.stroke();
      c.fillStyle = '#fffaf0';
      U.rrect(c, portal.x - 4, portal.y - 4, portal.w + 8, portal.h + 8, portal.r + 3);
      c.fill();
      c.strokeStyle = BRASS2;
      c.lineWidth = 2;
      c.stroke();
      c.restore();

      c.save();
      U.rrect(c, portal.x, portal.y, portal.w, portal.h, portal.r);
      c.clip();
      s.peek('wheels');
      c.fillStyle = 'rgba(255,248,220,0.28)';
      c.fillRect(portal.x, portal.y, portal.w, portal.h);
      c.fillStyle = '#fdf6df';
      c.globalAlpha = 0.92;
      c.fillRect(portal.x, portal.y, portal.w, portal.h);
      c.globalAlpha = 1;
      const crankP = U.clamp(s.u < 0 ? 0 : s.u <= 1.4 ? s.u / 1.4 : 1, 0, 1);
      const stepIdx = Math.floor(crankP * 4 + 0.001);
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 3; row++) {
          const wx = portal.x + 18 + col * 98;
          const wy = portal.y + 18 + row * 78;
          const idx = col * 3 + row;
          const baseDigit = (3 + idx * 7) % 10;
          const digit = (baseDigit + stepIdx) % 10;
          const digit2 = (digit + 5) % 10;
          c.strokeStyle = INK;
          c.lineWidth = 2.2;
          c.beginPath(); c.arc(wx + 32, wy + 28, 30, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.arc(wx + 32, wy + 28, 19, 0, Math.PI * 2); c.stroke();
          c.fillStyle = INK;
          c.font = '700 22px "Courier New", monospace';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(String(digit), wx + 32, wy + 20);
          c.font = '700 16px "Courier New", monospace';
          c.fillStyle = 'rgba(26,18,8,0.75)';
          c.fillText(String(digit2), wx + 32, wy + 36);
          c.save();
          c.beginPath(); c.arc(wx + 32, wy + 28, 19, 0, Math.PI * 2); c.clip();
          U.hatch(c, wx, wy, 64, 56, Math.PI / 4, 5, 'rgba(26,18,8,0.13)', 0.9);
          c.restore();
          c.strokeStyle = INK;
          c.lineWidth = 1.1;
          for (let t = 0; t < 10; t++) {
            const a = (t / 10) * Math.PI * 2;
            c.beginPath();
            c.moveTo(wx + 32 + Math.cos(a) * 23, wy + 28 + Math.sin(a) * 23);
            c.lineTo(wx + 32 + Math.cos(a) * 28, wy + 28 + Math.sin(a) * 28);
            c.stroke();
          }
          const frac = crankP * 4 - stepIdx;
          if (s.u > 0 && s.u < 1.45 && frac < 0.18 && frac >= 0) {
            c.save();
            c.globalAlpha = 0.22 * (1 - frac / 0.18);
            c.fillStyle = '#ffcc33';
            c.beginPath(); c.arc(wx + 32, wy + 28, 30, 0, Math.PI * 2); c.fill();
            c.restore();
          }
        }
      }
      const pulse = 0.6 + 0.4 * Math.sin(s.now * 1.4 * Math.PI * 2);
      c.fillStyle = `rgba(255,220,80,${0.07 * pulse})`;
      c.fillRect(portal.x, portal.y, portal.w, portal.h);
      c.restore();

      c.save();
      c.strokeStyle = BRASS2;
      c.lineWidth = 3;
      U.rrect(c, portal.x, portal.y, portal.w, portal.h, portal.r);
      c.stroke();
      c.strokeStyle = 'rgba(255,240,180,0.95)';
      c.lineWidth = 1.2;
      U.rrect(c, portal.x + 2, portal.y + 2, portal.w - 4, portal.h - 4, portal.r - 1);
      c.stroke();
      c.fillStyle = BRASS2;
      const rivets = [[portal.x - 2, portal.y - 2], [portal.x + portal.w + 2, portal.y - 2], [portal.x - 2, portal.y + portal.h + 2], [portal.x + portal.w + 2, portal.y + portal.h + 2]];
      rivets.forEach(([rx, ry]) => { c.beginPath(); c.arc(rx, ry, 4.5, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); });
      c.restore();

      c.save();
      c.fillStyle = '#fffaf0';
      U.rrect(c, portal.x + 70, portal.y + portal.h + 10, 280, 22, 4);
      c.fill();
      c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
      c.fillStyle = INK;
      c.font = '700 11px "Times New Roman", serif';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillText('THE STORE — FIGURE WHEELS  →', portal.x + 210, portal.y + portal.h + 25);
      c.restore();

      // punched card chain
      let cardShift;
      if (s.u < 0) cardShift = 0;
      else {
        const q = Math.floor(U.clamp(s.u / 1.4, 0, 1) * 4 + 0.0001);
        const frac = U.clamp(s.u / 1.4, 0, 1) * 4 - q;
        const eased = U.ss(0, 1, frac);
        cardShift = q * 30 + eased * 30;
        if (s.u > 1.4) cardShift = 120 + Math.min(20, (s.u - 1.4) * 30);
      }
      let highlightT = 0;
      if (s.u >= 1.95 && s.u <= 2.25) highlightT = U.clamp((s.u - 1.95) / 0.30, 0, 1);

      c.save();
      c.fillStyle = '#dcc99e';
      c.fillRect(980, 680, 820, 64);
      c.strokeStyle = INK;
      c.lineWidth = 2.4;
      c.strokeRect(980, 680, 820, 64);
      c.save();
      c.beginPath(); c.rect(980, 680, 820, 64); c.clip();
      U.hatch(c, 980, 680, 820, 64, 0, 5, 'rgba(26,18,8,0.10)', 1);
      c.restore();
      for (let i = -1; i < 8; i++) {
        const cx0 = 1000 + i * 120 - cardShift;
        if (cx0 < 960 || cx0 > 1780) continue;
        c.fillStyle = '#ffffff';
        c.fillRect(cx0, 688, 120, 48);
        c.strokeStyle = INK;
        c.lineWidth = 2;
        c.strokeRect(cx0, 688, 120, 48);
        c.fillStyle = INK;
        for (let hx = 0; hx < 4; hx++) {
          for (let hy = 0; hy < 2; hy++) {
            const hx0 = cx0 + 18 + hx * 24 + (hy * 6);
            const hy0 = 702 + hy * 18;
            const hasHole = U.hash(i * 10 + hx, hy) > 0.35;
            if (hasHole) { c.beginPath(); c.arc(hx0, hy0, 5, 0, 7); c.fill(); }
            else { c.strokeStyle = 'rgba(26,18,8,0.28)'; c.lineWidth = 1.1; c.beginPath(); c.arc(hx0, hy0, 5, 0, 7); c.stroke(); c.fillStyle = INK; }
          }
        }
        c.fillStyle = INK;
        c.font = '700 9px "Courier New", monospace';
        c.textAlign = 'center';
        c.textBaseline = 'alphabetic';
        c.fillText('No.' + (12 + i), cx0 + 60, 730);
      }
      if (highlightT > 0) {
        const hx = 980 + highlightT * 820;
        c.save();
        c.globalAlpha = 0.55 * (1 - highlightT * 0.5);
        c.fillStyle = '#ffb84d';
        c.fillRect(hx - 40, 680, 80, 64);
        c.globalAlpha = 0.25 * (1 - highlightT * 0.5);
        c.fillRect(hx - 80, 680, 160, 64);
        c.restore();
      }
      c.fillStyle = BRASS;
      c.strokeStyle = INK; c.lineWidth = 2;
      c.beginPath(); c.arc(992, 712, 14, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.arc(1788, 712, 14, 0, 7); c.fill(); c.stroke();
      c.restore();

      // gears driven by crank
      const gearAng1 = crankP * Math.PI * 2 * 1.0;
      const gearAng2 = -crankP * Math.PI * 2 * 1.2;
      const gearAng3 = crankP * Math.PI * 2 * 0.9;
      gearShape(c, 1035, 770, 68, 20, gearAng1, 24);
      gearShape(c, 1185, 775, 60, 16, gearAng2, 20);
      gearShape(c, 1320, 770, 60, 18, gearAng3, 20);
      const quarter = crankP * 4;
      const qFrac = quarter - Math.floor(quarter);
      if (s.u > 0 && s.u < 1.45 && qFrac < 0.12) {
        c.save();
        c.globalAlpha = 0.20 * (1 - qFrac / 0.12);
        c.fillStyle = '#ffcc33';
        c.beginPath(); c.arc(1035, 770, 82, 0, 7); c.fill();
        c.beginPath(); c.arc(1185, 775, 72, 0, 7); c.fill();
        c.beginPath(); c.arc(1320, 770, 72, 0, 7); c.fill();
        c.restore();
      }

      // bell
      const bellX = 1507, bellY = 310;
      let bellSwing = 0;
      if (s.u > 1.95) {
        const t = s.u - 1.95;
        bellSwing = Math.sin(t * 22) * 0.44 * Math.exp(-t * 2.5);
      } else {
        bellSwing = Math.sin(s.now * 0.6) * 0.015;
      }
      c.save();
      c.translate(bellX, bellY);
      c.rotate(bellSwing);
      if (Math.abs(bellSwing) > 0.12) {
        c.save();
        c.globalAlpha = 0.18;
        c.rotate(bellSwing * 0.3);
        c.fillStyle = BRASS2;
        c.beginPath(); c.moveTo(-32, 0); c.lineTo(32, 0); c.lineTo(24, 36); c.lineTo(-24, 36); c.closePath(); c.fill();
        c.restore();
      }
      c.strokeStyle = INK;
      c.lineWidth = 2.2;
      c.beginPath(); c.moveTo(-26, -14); c.lineTo(26, -14); c.stroke();
      c.fillStyle = BRASS;
      c.fillRect(-28, -16, 56, 8);
      c.strokeRect(-28, -16, 56, 8);
      c.fillStyle = BRASS2;
      c.beginPath(); c.moveTo(-32, 0); c.lineTo(32, 0); c.lineTo(24, 36); c.lineTo(-24, 36); c.closePath(); c.fill(); c.stroke();
      c.save();
      c.beginPath(); c.moveTo(-32, 0); c.lineTo(32, 0); c.lineTo(24, 36); c.lineTo(-24, 36); c.closePath(); c.clip();
      U.hatch(c, -32, 0, 64, 36, Math.PI / 4, 5, 'rgba(26,18,8,0.24)', 1.1);
      c.restore();
      c.fillStyle = INK;
      c.beginPath(); c.arc(0, 38, 5, 0, 7); c.fill();
      c.restore();
      if (s.u >= 2.05 && s.u <= 2.30) {
        const tt = (s.u - 2.05) / 0.25;
        for (let ri = 0; ri < 2; ri++) {
          const rr = 28 + tt * 32 + ri * 14;
          const ra = (1 - tt) * 0.55;
          c.save();
          c.strokeStyle = `rgba(255,200,60,${ra})`;
          c.lineWidth = 3 - ri;
          c.beginPath(); c.arc(bellX, bellY + 18, rr, 0, Math.PI * 2); c.stroke();
          c.restore();
        }
        c.save();
        c.globalAlpha = (1 - tt) * 0.9;
        c.fillStyle = '#ffb800';
        c.strokeStyle = INK;
        c.lineWidth = 1.4;
        c.translate(bellX + 48, bellY - 8);
        c.rotate(-0.15);
        for (let i = 0; i < 5; i++) {
          c.save();
          c.rotate((i / 5) * Math.PI * 2);
          c.beginPath();
          c.moveTo(0, -10); c.lineTo(3, -3); c.lineTo(10, 0); c.lineTo(3, 3); c.lineTo(0, 10); c.lineTo(-3, 3); c.lineTo(-10, 0); c.lineTo(-3, -3); c.closePath();
          c.fill(); c.stroke();
          c.restore();
        }
        c.fillStyle = INK;
        c.font = '800 14px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('DING', 0, 4);
        c.restore();
      }

      // crank wheel + arm BEHIND Jolly (knob drawn in front())
      const theta = crankTheta(s);
      // progress arc
      if (s.u > 0 && s.u < 1.5) {
        const p2 = U.clamp(s.u / 1.4, 0, 1);
        const e2 = U.easeIO(p2);
        const endA = -Math.PI / 2 + e2 * Math.PI * 2;
        c.save();
        c.strokeStyle = 'rgba(140,106,46,0.28)';
        c.lineWidth = 12;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(CX - s.camX, CY, CR, -Math.PI / 2, endA, false);
        c.stroke();
        c.strokeStyle = 'rgba(255,220,80,0.35)';
        c.lineWidth = 3;
        c.beginPath();
        c.arc(CX - s.camX, CY, CR, -Math.PI / 2, endA, false);
        c.stroke();
        c.restore();
      }
      c.save();
      // wheel body
      c.translate(CX - s.camX, CY);
      c.fillStyle = '#fdf6df';
      c.strokeStyle = INK;
      c.lineWidth = 2.8;
      c.beginPath(); c.arc(0, 0, CR, 0, Math.PI * 2); c.fill(); c.stroke();
      c.lineWidth = 2;
      c.beginPath(); c.arc(0, 0, 60, 0, Math.PI * 2); c.stroke();
      c.save();
      c.beginPath(); c.arc(0, 0, 60, 0, Math.PI * 2); c.clip();
      U.hatch(c, -60, -60, 120, 120, Math.PI / 4, 7, 'rgba(26,18,8,0.09)', 1);
      c.restore();
      // 4 spokes
      c.strokeStyle = INK;
      c.lineWidth = 2.6;
      for (let i = 0; i < 4; i++) {
        c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -60); c.stroke();
        c.rotate(Math.PI / 2);
      }
      // rigid arm from centre to rim at theta
      const ax = Math.cos(theta) * CR;
      const ay = Math.sin(theta) * CR;
      c.strokeStyle = BRASS_DARK;
      c.lineWidth = 10;
      c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(ax, ay); c.stroke();
      c.strokeStyle = BRASS2;
      c.lineWidth = 6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(ax, ay); c.stroke();
      c.strokeStyle = INK;
      c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(ax, ay); c.stroke();
      c.restore();
      // centre boss
      c.save();
      c.translate(CX - s.camX, CY);
      c.fillStyle = INK;
      c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = BRASS2;
      c.beginPath(); c.arc(0, 0, 6, 0, Math.PI * 2); c.fill();
      c.restore();
      // crank knob — drawn in draw() so Jolly (between draw and front) covers it when overlapping
      {
        const hx = CX + Math.cos(theta) * CR - s.camX;
        const hy = CY + Math.sin(theta) * CR;
        c.save();
        c.fillStyle = BRASS;
        c.strokeStyle = INK;
        c.lineWidth = 2.8;
        c.beginPath(); c.arc(hx, hy, 18, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = BRASS_DARK;
        c.beginPath(); c.arc(hx, hy, 11, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.95)';
        c.beginPath(); c.arc(hx + 4, hy - 4, 4.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,240,160,0.55)';
        c.beginPath(); c.arc(hx, hy, 18, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(26,18,8,0.18)';
        c.beginPath(); c.ellipse(hx, hy + 18, 14, 5, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      c.save();
      c.fillStyle = '#1a1208';
      U.rrect(c, CX - 58 - s.camX, CY + 92, 116, 22, 4); c.fill();
      c.fillStyle = '#fffaf0';
      c.font = '700 11px "Times New Roman", serif';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillText('TURN  ·  CRANK', CX - s.camX, CY + 107);
      c.restore();

      if (s.hero) {
        c.save();
        c.globalAlpha = 0.22 * (s.hero.alpha ?? 1);
        c.fillStyle = 'rgba(26,18,8,0.35)';
        c.beginPath();
        c.ellipse(s.hero.x - s.camX, 860, 90, 18, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      if (s.now < 0.8) {
        const reveal = U.ss(0, 0.8, s.now);
        const yReveal = 32 + reveal * 1016;
        c.save();
        c.fillStyle = PAPER;
        c.fillRect(32, yReveal, 1856, 1016 - (yReveal - 32));
        c.strokeStyle = INK;
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(32, yReveal); c.lineTo(1888, yReveal); c.stroke();
        c.fillStyle = INK;
        c.beginPath(); c.moveTo(1888 - 40, yReveal - 8); c.lineTo(1888 - 12, yReveal); c.lineTo(1888 - 40, yReveal + 8); c.closePath(); c.fill();
        c.restore();
      }
      const grain = U.grain('engine', 0.06, 0.10, true);
      c.save();
      c.globalAlpha = 0.14;
      U.tile(c, grain, U.step(s.now, 6) * 97 % 512, U.step(s.now, 6) * 53 % 512);
      c.restore();
    },
    front(c, s) {
      const vig = U.cached('engine_vig4', 1920, 1080, g => {
        const grd = g.createRadialGradient(960, 540, 600, 960, 540, 1200);
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, 'rgba(26,18,8,0.16)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 1920, 1080);
      });
      c.drawImage(vig, 0, 0);
      c.save();
      c.globalAlpha = 0.08;
      c.fillStyle = INK;
      c.fillRect(28, 1048, 1864, 4);
      c.restore();
    }
  });
})();
