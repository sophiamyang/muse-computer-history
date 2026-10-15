// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:32:53.237Z (revision)
// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:23:56.336Z (revision)
(() => {
  const INK = '#2B2B2B';
  const CREAM = '#F3E9D2';
  const MUSTARD = '#E3A92E';
  const TEAL = '#1F7A7A';
  const TOMATO = '#E0533B';
  const CHARCOAL = '#2B2B2B';

  function rrect(c, x, y, w, h, r) { U.rrect(c, x, y, w, h, r); }

  SCENE({
    id: 'mainframe',
    year: '1969',
    title: 'Mainframes',
    floor: 790,
    width: 1920,
    act: {
      at: 1000,
      dur: 2.2,
      prompt: 'feed in the card',
      hotspot: { x: 1040, y: 520, w: 180, h: 130 },
      pose: u => {
        if (u < 0) return { armR: 0.12, armL: 0.12, elbowR: 0.2, elbowL: 0.2, crouch: 0, lean: 0, lookY: 0 };
        const wind = U.ss(0, 0.30, u);
        const reach = U.ss(0.30, 0.90, u);
        const push = U.ss(0.90, 1.30, u);
        const hold = U.ss(1.30, 2.0, u);
        const armR = U.lerp(0.12, 1.55, reach) + push * 0.35;
        const elbowR = U.lerp(0.2, 0.45, reach) + push * 0.25;
        const crouch = wind * 0.06;
        const lean = U.lerp(0, 0.18, push) + hold * 0.04;
        const lookY = U.lerp(0, -0.30, reach) + push * -0.10;
        return { armR, armL: 0.12 + wind * 0.05, elbowR, elbowL: 0.2, crouch, lean, lookY };
      }
    },
    portals: {
      slot: { x: 1130, y: 575, w: 340, h: 150, r: 12, glow: 'rgba(227,169,46,0.75)' }
    },
    characterStyle: { tint: '#F3E9D2', tintAlpha: 0.2 },
    treat(img) {
      const o = U.canvas(img.width, img.height);
      const g = o.getContext('2d');
      g.shadowColor = 'rgba(43,43,43,0.95)';
      g.shadowBlur = 7;
      g.shadowOffsetX = 0;
      g.shadowOffsetY = 2;
      g.drawImage(img, 0, 0);
      g.shadowBlur = 0;
      g.shadowOffsetX = 0;
      g.shadowOffsetY = 0;
      g.filter = 'saturate(0.82) contrast(1.06) brightness(1.02)';
      g.drawImage(img, 0, 0);
      g.filter = 'none';
      return o;
    },
    shadow: 'rgba(43,43,43,0.28)',
    music: { voice: 'vibes', bpm: 96, root: 62 },
    sfx: [
      { u: 1.05, kind: 'click' },
      { u: 1.35, kind: 'tick' },
      { u: 1.60, kind: 'tick' },
      { u: 1.88, kind: 'tick' }
    ],
    page: {
      heading: 'Programs on paper',
      text: 'Punched cards held the instructions. One card, one step — feed them in and the big machine could calculate for hours.'
    },
    spots: [
      { x: 90, y: 300, w: 240, h: 380, label: 'Tape drives', text: 'Reels of magnetic tape stored data. Operators changed them by hand.' },
      { x: 70, y: 730, w: 340, h: 140, label: 'Teletype', text: 'It printed results line by line, chattering as the paper curled out.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha *= a;
      const bw = 420, bh = 76, bx = 1890 - bw, by = 48;
      c.fillStyle = 'rgba(43,43,43,0.18)';
      rrect(c, bx + 4, by + 4, bw, bh, 14); c.fill();
      c.fillStyle = CREAM;
      rrect(c, bx, by, bw, bh, 14); c.fill();
      c.fillStyle = MUSTARD;
      c.fillRect(bx, by, 10, bh);
      c.fillStyle = CHARCOAL;
      c.font = '700 34px "Courier New", monospace';
      c.textAlign = 'right'; c.textBaseline = 'middle';
      c.fillText('1969', 1890 - 18, by + 26);
      c.font = '700 18px Helvetica, Arial, sans-serif';
      c.fillStyle = TEAL;
      c.fillText('MAINFRAMES', 1890 - 18, by + 52);
      c.fillStyle = TOMATO;
      c.beginPath(); c.arc(bx + 28, by + 38, 6, 0, Math.PI * 2); c.fill();
      c.restore();
    },

    draw(c, s) {
      const bg = U.cached('mainframe_bg3', 1920, 1080, g => {
        g.fillStyle = CREAM; g.fillRect(0, 0, 1920, 1080);
        const rnd = U.rng(1969);
        for (let i = 0; i < 6000; i++) {
          const x = rnd() * 1920, y = rnd() * 1080;
          g.fillStyle = `rgba(43,43,43,${0.035 * rnd()})`;
          g.fillRect(x, y, 1.2, 1.2);
        }
        g.fillStyle = TEAL; g.fillRect(0, 0, 1920, 34);
        g.fillStyle = MUSTARD; g.fillRect(0, 34, 1920, 8);
        g.fillStyle = '#D8C9A8'; g.fillRect(0, 790, 1920, 290);
        g.fillStyle = 'rgba(43,43,43,0.08)'; g.fillRect(0, 790, 1920, 18);
        g.strokeStyle = 'rgba(43,43,43,0.07)'; g.lineWidth = 2;
        for (let x = 0; x < 1920; x += 240) { g.beginPath(); g.moveTo(x, 790); g.lineTo(x, 1080); g.stroke(); }
        for (let y = 850; y < 1080; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke(); }
        g.fillStyle = 'rgba(43,43,43,0.06)'; g.fillRect(0, 42, 40, 748);

        // darker teal backdrop behind Jolly for silhouette contrast - centered on act.at
        g.fillStyle = '#1a5e5e';
        rrect(g, 860, 110, 320, 680, 18); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.12)'; rrect(g, 860, 110, 320, 680, 18); g.fill();
        g.strokeStyle = 'rgba(243,233,210,0.18)'; g.lineWidth = 3; rrect(g, 860, 110, 320, 680, 18); g.stroke();

        // Tape Unit 1
        g.fillStyle = 'rgba(43,43,43,0.18)';
        rrect(g, 48, 148, 260, 650, 18); g.fill();
        g.fillStyle = '#E8DDC2'; rrect(g, 40, 140, 260, 650, 18); g.fill();
        g.strokeStyle = INK; g.lineWidth = 3; rrect(g, 40, 140, 260, 650, 18); g.stroke();
        g.fillStyle = '#2B2B2B'; rrect(g, 60, 170, 220, 420, 12); g.fill();
        g.fillStyle = '#F3E9D2'; g.beginPath(); g.arc(170, 280, 78, 0, 7); g.fill();
        g.beginPath(); g.arc(170, 500, 78, 0, 7); g.fill();
        g.strokeStyle = 'rgba(43,43,43,0.2)'; g.lineWidth = 2; g.beginPath(); g.arc(170, 280, 78, 0, 7); g.stroke();
        g.beginPath(); g.arc(170, 500, 78, 0, 7); g.stroke();
        g.fillStyle = MUSTARD; g.fillRect(60, 610, 220, 22);
        g.fillStyle = TEAL; g.fillRect(60, 640, 220, 10);
        g.fillStyle = INK;
        for (let i = 0; i < 5; i++) g.fillRect(80 + i * 40, 680, 24, 8);

        // Tape Unit 2
        g.fillStyle = 'rgba(43,43,43,0.18)';
        rrect(g, 338, 148, 260, 650, 18); g.fill();
        g.fillStyle = '#E8DDC2'; rrect(g, 330, 140, 260, 650, 18); g.fill();
        g.strokeStyle = INK; g.lineWidth = 3; rrect(g, 330, 140, 260, 650, 18); g.stroke();
        g.fillStyle = '#2B2B2B'; rrect(g, 350, 170, 220, 420, 12); g.fill();
        g.fillStyle = '#F3E9D2'; g.beginPath(); g.arc(460, 280, 78, 0, 7); g.fill();
        g.beginPath(); g.arc(460, 500, 78, 0, 7); g.fill();
        g.strokeStyle = 'rgba(43,43,43,0.2)'; g.lineWidth = 2; g.beginPath(); g.arc(460, 280, 78, 0, 7); g.stroke();
        g.beginPath(); g.arc(460, 500, 78, 0, 7); g.stroke();
        g.fillStyle = MUSTARD; g.fillRect(350, 610, 220, 22);
        g.fillStyle = TOMATO; g.fillRect(350, 640, 220, 10);
        for (let i = 0; i < 5; i++) g.fillRect(370 + i * 40, 680, 24, 8);

        // Processor console - centered, clear of Jolly
        g.fillStyle = 'rgba(43,43,43,0.18)';
        rrect(g, 628, 268, 400, 540, 16); g.fill();
        g.fillStyle = '#D9D0B6'; rrect(g, 620, 260, 400, 540, 16); g.fill();
        g.strokeStyle = INK; g.lineWidth = 3; rrect(g, 620, 260, 400, 540, 16); g.stroke();
        g.fillStyle = '#2B2B2B'; rrect(g, 645, 290, 350, 260, 10); g.fill();
        g.fillStyle = '#B8B0A0';
        for (let i = 0; i < 8; i++) g.fillRect(655 + i * 40, 590, 22, 36);
        g.fillStyle = MUSTARD; rrect(g, 645, 650, 350, 28, 6); g.fill();
        g.fillStyle = INK; g.font = '700 13px "Courier New", monospace'; g.textAlign = 'center';
        g.fillText('SYSTEM 360  •  PROCESSOR', 820, 669);
        g.fillStyle = TEAL; rrect(g, 645, 700, 350, 18, 6); g.fill();

        // Teletype desk - moved LEFT of x=450 to keep Jolly walk path (560..1000) clear
        g.fillStyle = 'rgba(43,43,43,0.18)';
        rrect(g, 78, 738, 340, 140, 12); g.fill();
        g.fillStyle = '#E8DDC2'; rrect(g, 70, 730, 340, 140, 12); g.fill();
        g.strokeStyle = INK; g.lineWidth = 3; rrect(g, 70, 730, 340, 140, 12); g.stroke();
        g.fillStyle = '#2B2B2B'; rrect(g, 90, 760, 300, 70, 8); g.fill();
        g.fillStyle = CREAM;
        for (let r = 0; r < 3; r++) for (let cc = 0; cc < 10; cc++) {
          g.fillRect(102 + cc * 28, 768 + r * 16, 20, 10);
        }
        // paper tray
        g.fillStyle = '#F3E9D2'; rrect(g, 150, 700, 180, 36, 6); g.fill();
        g.strokeStyle = INK; g.lineWidth = 2; rrect(g, 150, 700, 180, 36, 6); g.stroke();

        // Card Reader cabinet - clearly separate from Jolly
        g.fillStyle = 'rgba(43,43,43,0.22)';
        rrect(g, 1108, 538, 560, 270, 18); g.fill();
        g.fillStyle = '#E8DDC2'; rrect(g, 1100, 530, 560, 270, 18); g.fill();
        g.strokeStyle = INK; g.lineWidth = 3.5; rrect(g, 1100, 530, 560, 270, 18); g.stroke();
        g.fillStyle = '#2B2B2B'; rrect(g, 1130, 500, 220, 50, 8); g.fill();
        g.fillStyle = 'rgba(243,233,210,0.9)'; rrect(g, 1140, 510, 200, 20, 4); g.fill();
        g.strokeStyle = 'rgba(243,233,210,0.5)'; g.lineWidth = 1;
        for (let i = 0; i < 4; i++) g.strokeRect(1145, 514 + i * 3, 190, 6);
        g.fillStyle = MUSTARD; rrect(g, 1420, 560, 200, 36, 6); g.fill();
        g.fillStyle = INK; g.font = '700 14px Helvetica, Arial, sans-serif'; g.textAlign = 'center';
        g.fillText('CARD READER', 1520, 583);
        g.fillStyle = '#2B2B2B'; g.beginPath(); g.arc(1440, 610, 10, 0, 7); g.fill();
        g.beginPath(); g.arc(1470, 610, 10, 0, 7); g.fill();
        g.beginPath(); g.arc(1500, 610, 10, 0, 7); g.fill();
        g.fillStyle = INK;
        for (let i = 0; i < 6; i++) g.fillRect(1140 + i * 70, 760, 40, 10);

        g.fillStyle = 'rgba(43,43,43,0.12)'; g.fillRect(0, 90, 1920, 6);
        g.fillStyle = '#F3E9D2'; rrect(g, 820, 78, 280, 22, 8); g.fill();
        g.strokeStyle = INK; g.lineWidth = 2; rrect(g, 820, 78, 280, 22, 8); g.stroke();
      });
      c.drawImage(bg, -s.camX, 0);

      // animated tape reels - visible spin-up
      const speedBase = 0.45;
      const speedBoost = U.ss(0.9, 1.6, s.u) * 3.2;
      const spd = speedBase + speedBoost;
      const reels = [
        { x: 170, y: 280 }, { x: 170, y: 500 },
        { x: 460, y: 280 }, { x: 460, y: 500 }
      ];
      reels.forEach((re, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        const ang = s.now * spd * dir * 1.4 + idx * 0.7;
        c.save();
        c.translate(re.x - s.camX, re.y);
        c.rotate(ang);
        // motion blur ring when fast
        if (s.u > 1.0) {
          c.strokeStyle = 'rgba(43,43,43,0.18)';
          c.lineWidth = 6;
          c.beginPath(); c.arc(0, 0, 58, 0, Math.PI * 2); c.stroke();
          c.strokeStyle = 'rgba(227,169,46,0.22)';
          c.lineWidth = 3;
          c.beginPath(); c.arc(0, 0, 48, 0, Math.PI * 2); c.stroke();
        }
        c.fillStyle = '#2B2B2B';
        c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.fill();
        c.fillStyle = CREAM;
        c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#2B2B2B'; c.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          const a = k * Math.PI * 2 / 3;
          c.beginPath(); c.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); c.lineTo(Math.cos(a) * 58, Math.sin(a) * 58); c.stroke();
        }
        c.strokeStyle = 'rgba(43,43,43,0.25)'; c.lineWidth = 2;
        c.beginPath(); c.arc(0, 0, 58, 0, Math.PI * 2); c.stroke();
        c.restore();
        c.fillStyle = 'rgba(255,255,255,0.32)';
        c.beginPath(); c.arc(re.x - s.camX - 18, re.y - 18, 6, 0, 7); c.fill();
      });
      // tape path lines
      c.strokeStyle = 'rgba(43,43,43,0.30)'; c.lineWidth = 2;
      c.beginPath();
      c.moveTo(170 - s.camX, 338); c.lineTo(170 - s.camX, 442);
      c.moveTo(460 - s.camX, 338); c.lineTo(460 - s.camX, 442);
      c.stroke();
      // yellow tick racing vertically between reels when active
      if (s.u > 0.95) {
        const tickSpeed = 120 + spd * 40;
        const ty = 360 + ((s.now * tickSpeed) % 80);
        c.fillStyle = 'rgba(227,169,46,0.95)';
        c.fillRect(166 - s.camX, ty, 8, 14);
        c.fillRect(456 - s.camX, ty, 8, 14);
        // second tick offset
        const ty2 = 360 + (((s.now * tickSpeed + 40) % 80));
        c.globalAlpha = 0.55;
        c.fillRect(166 - s.camX, ty2, 8, 10);
        c.fillRect(456 - s.camX, ty2, 8, 10);
        c.globalAlpha = 1;
      } else {
        const ty = 360 + ((s.now * 30) % 80);
        c.fillStyle = 'rgba(227,169,46,0.45)';
        c.fillRect(166 - s.camX, ty, 8, 10);
        c.fillRect(456 - s.camX, ty, 8, 10);
      }

      // processor lamps - cascade fast after card entry
      const lampCols = [MUSTARD, TOMATO, TEAL, CREAM];
      const cascadeActive = U.ss(1.0, 1.4, s.u);
      const cascadeT = s.now * 8;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          const lx = 665 + col * 38;
          const ly = 310 + row * 50;
          const idx = row * 8 + col;
          let alpha, colr;
          if (cascadeActive > 0.01) {
            const seq = (idx * 0.35 + cascadeT) % 8;
            const on = seq < 1.2 ? 1 : 0.25;
            alpha = U.lerp(0.3, on, cascadeActive);
            colr = lampCols[idx % 4];
            if (on > 0.9) {
              c.fillStyle = colr; c.globalAlpha = 0.18;
              c.beginPath(); c.arc(lx - s.camX + 11, ly + 11, 18, 0, 7); c.fill();
              c.globalAlpha = 1;
            }
          } else {
            const basePhase = U.hash(idx, 11) * Math.PI * 2;
            const blink = Math.sin(s.now * (0.7 + U.hash(idx, 7) * 0.8) + basePhase) > 0.35 ? 1 : 0.3;
            alpha = blink;
            colr = lampCols[(idx + Math.floor(s.now * 0.4)) % 4];
          }
          c.fillStyle = colr;
          c.globalAlpha = 0.30 + 0.60 * alpha;
          c.fillRect(lx - s.camX, ly, 22, 22);
          c.globalAlpha = 1;
          c.strokeStyle = 'rgba(43,43,43,0.22)'; c.lineWidth = 1.2; c.strokeRect(lx - s.camX, ly, 22, 22);
        }
      }
      for (let i = 0; i < 8; i++) {
        const on = cascadeActive > 0.5 ? (Math.floor(cascadeT + i) % 2 === 0) : (Math.sin(s.now * 0.9 + i * 0.9) > 0);
        c.fillStyle = on ? MUSTARD : '#8a857a';
        c.fillRect(655 + i * 40 - s.camX, 590, 22, 6);
      }

      // teletype paper - 1.6x bigger, pure white, heavy shadow, feeding UP - LEFT side
      const printProg = U.clamp(U.ss(1.1, 2.0, s.u), 0, 1);
      const paperW = 240, paperHBase = 90;
      const extraH = printProg * 60;
      const paperH = paperHBase + extraH;
      const paperX = 170 - s.camX, paperY = 700;
      // paper curl grows with printProg
      const curlOut = extraH * 0.9;
      c.fillStyle = '#FFFFFF';
      c.shadowColor = 'rgba(43,43,43,0.28)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.shadowOffsetX = 3;
      rrect(c, paperX, paperY - paperH + 36, paperW, paperH, 8); c.fill();
      c.shadowBlur = 0; c.shadowOffsetY = 0; c.shadowOffsetX = 0;
      c.strokeStyle = INK; c.lineWidth = 1.8; rrect(c, paperX, paperY - paperH + 36, paperW, paperH, 8); c.stroke();
      // subtle paper lines
      c.strokeStyle = 'rgba(43,43,43,0.06)'; c.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        c.beginPath(); c.moveTo(paperX + 10, paperY - paperH + 36 + i * 18); c.lineTo(paperX + paperW - 10, paperY - paperH + 36 + i * 18); c.stroke();
      }
      c.fillStyle = INK;
      const lines = ['  READY', '  CARD 001 OK', '  RUN  * * *'];
      lines.forEach((txt, i) => {
        if (printProg > i * 0.32) {
          c.font = '700 13px "Courier New", monospace';
          c.textAlign = 'left'; c.textBaseline = 'middle';
          c.globalAlpha = U.ss(i * 0.32, i * 0.32 + 0.12, printProg);
          c.fillText(txt, paperX + 14, paperY - paperH + 54 + i * 18);
          c.globalAlpha = 1;
        }
      });
      // curl out to the right
      c.strokeStyle = 'rgba(43,43,43,0.22)'; c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(paperX + paperW - 2, paperY + 6);
      c.quadraticCurveTo(paperX + paperW + 14 + curlOut + Math.sin(s.now * 1.2) * 2, paperY + 14, paperX + paperW + 8 + curlOut * 0.3, paperY + 26);
      c.stroke();
      c.fillStyle = '#FFFFFF';
      c.beginPath();
      c.moveTo(paperX + paperW - 2, paperY + 6);
      c.quadraticCurveTo(paperX + paperW + 14 + curlOut, paperY + 14, paperX + paperW + 8 + curlOut * 0.3, paperY + 26);
      c.lineTo(paperX + paperW + 4 + curlOut * 0.3, paperY + 30);
      c.quadraticCurveTo(paperX + paperW + 10 + curlOut, paperY + 16, paperX + paperW - 2, paperY + 10);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(43,43,43,0.12)'; c.lineWidth = 1; c.stroke();
      const chatter = s.u > 1.2 && s.u < 2.0 ? (Math.floor(s.now * 12) % 2 === 0 ? TOMATO : MUSTARD) : '#2B2B2B';
      c.fillStyle = chatter;
      c.beginPath(); c.arc(390 - s.camX, 745, 7, 0, 7); c.fill();
      c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.arc(390 - s.camX, 745, 7, 0, 7); c.stroke();

      // card reader slot portal - bright, clearly framed, always visible
      const P = this.portals.slot;
      const glowA = 0.16 + 0.06 * Math.sin(s.now * 1.2);
      const glowBoost = s.u > 0.8 ? 0.14 : 0;
      c.fillStyle = `rgba(227,169,46,${glowA + glowBoost})`;
      rrect(c, P.x - s.camX - 14, P.y - 14, P.w + 28, P.h + 28, P.r + 10); c.fill();
      c.fillStyle = 'rgba(43,43,43,0.22)';
      rrect(c, P.x - s.camX + 4, P.y + 4, P.w, P.h, P.r); c.fill();
      c.fillStyle = MUSTARD;
      rrect(c, P.x - s.camX - 10, P.y - 10, P.w + 20, P.h + 20, P.r + 8); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2.5; rrect(c, P.x - s.camX - 10, P.y - 10, P.w + 20, P.h + 20, P.r + 8); c.stroke();
      c.fillStyle = '#2B2B2B';
      rrect(c, P.x - s.camX - 6, P.y - 6, P.w + 12, P.h + 12, P.r + 4); c.fill();
      c.save();
      rrect(c, P.x - s.camX, P.y, P.w, P.h, P.r); c.clip();
      const grad = c.createLinearGradient(P.x - s.camX, P.y, P.x - s.camX, P.y + P.h);
      grad.addColorStop(0, '#1a1a1a'); grad.addColorStop(0.5, '#2b2b2b'); grad.addColorStop(1, '#111');
      c.fillStyle = grad; c.fillRect(P.x - s.camX, P.y, P.w, P.h);
      s.peek('slot');
      c.fillStyle = 'rgba(227,169,46,0.18)'; c.fillRect(P.x - s.camX, P.y, P.w, P.h);
      c.fillStyle = 'rgba(243,233,210,0.90)'; c.fillRect(P.x - s.camX, P.y + 3, P.w, 3);
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(P.x - s.camX, P.y + P.h - 5, P.w, 4);
      c.restore();
      c.fillStyle = '#8a8a8a';
      [[P.x - 4, P.y - 4], [P.x + P.w + 4, P.y - 4], [P.x - 4, P.y + P.h + 4], [P.x + P.w + 4, P.y + P.h + 4]].forEach(([sx, sy]) => {
        c.beginPath(); c.arc(sx - s.camX, sy, 4, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(sx - s.camX - 1, sy - 1, 1.5, 0, 7); c.fill();
        c.fillStyle = '#8a8a8a';
      });

      // punched card prop - 1.4x bigger 180x110, charcoal shadow, mustard bar, large holes
      const hand = s.hero.hands ? s.hero.hands.R : { x: s.hero.x + 130, y: s.hero.y - 190 };
      const cw = 180, ch = 110;
      let cx, cy, rot = 0;
      let doClip = false;
      if (s.u < 0) {
        cx = hand.x - s.camX - cw / 2 + 18;
        cy = hand.y - ch / 2 - 10;
        rot = -0.06 + Math.sin(s.now * 0.9) * 0.02;
      } else if (s.u < 1.05) {
        const p = U.ss(0.2, 1.05, s.u);
        const sx = hand.x - s.camX - cw / 2 + 18;
        const sy = hand.y - ch / 2 - 10;
        const tx = P.x - s.camX + P.w / 2 - cw / 2;
        const ty = P.y + P.h / 2 - ch / 2;
        cx = U.lerp(sx, tx, U.easeIO(p));
        cy = U.lerp(sy, ty, U.easeIO(p));
        rot = U.lerp(-0.06, 0, p);
      } else {
        const p = U.clamp((s.u - 1.05) / 0.55, 0, 1);
        const tx = P.x - s.camX + P.w / 2 - cw / 2;
        const ty = P.y + P.h / 2 - ch / 2;
        cx = U.lerp(tx, tx + 90, U.easeIO(p));
        cy = ty;
        rot = 0;
        doClip = true;
        c.save();
        rrect(c, P.x - s.camX, P.y, P.w, P.h, P.r); c.clip();
      }
      c.save();
      c.translate(cx + cw / 2, cy + ch / 2);
      c.rotate(rot);
      // 6px charcoal drop shadow
      c.fillStyle = 'rgba(43,43,43,0.32)';
      rrect(c, -cw / 2 + 6, -ch / 2 + 6, cw, ch, 8); c.fill();
      c.fillStyle = '#FFFCF2';
      rrect(c, -cw / 2, -ch / 2, cw, ch, 8); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2.2; rrect(c, -cw / 2, -ch / 2, cw, ch, 8); c.stroke();
      // thick mustard top bar
      c.fillStyle = MUSTARD; c.fillRect(-cw / 2, -ch / 2 + 8, cw, 14);
      // large black holes
      c.fillStyle = '#111';
      for (let col = 0; col < 10; col++) {
        for (let row = 0; row < 4; row++) {
          if (U.hash(col * 7 + row * 13, 99) > 0.35) {
            const hx = -cw / 2 + 18 + col * 15;
            const hy = -ch / 2 + 34 + row * 16;
            c.beginPath(); c.arc(hx, hy, 4.6, 0, Math.PI * 2); c.fill();
          }
        }
      }
      c.fillStyle = INK; c.font = '700 9px "Courier New", monospace'; c.textAlign = 'left';
      c.fillText('001  1969', -cw / 2 + 12, ch / 2 - 12);
      c.restore();
      if (doClip) c.restore();

      // reader indicator lamps
      const active = s.u > 0.9;
      const lampOn = active ? (Math.floor(s.now * 10) % 2 === 0 ? MUSTARD : TOMATO) : '#3a3a3a';
      c.fillStyle = active ? lampOn : '#3a3a3a';
      c.beginPath(); c.arc(1440 - s.camX, 610, 8, 0, 7); c.fill();
      c.fillStyle = active ? '#4ecdc4' : '#3a3a3a';
      c.beginPath(); c.arc(1470 - s.camX, 610, 8, 0, 7); c.fill();

      c.save(); c.globalAlpha = 0.06;
      U.tile(c, U.grain('mainframe_grain3', 0.06, 0.2, true), U.step(s.now, 8) * 97 % 512, 0);
      c.restore();

      const bloom = c.createRadialGradient(960 - s.camX, 90, 10, 960 - s.camX, 90, 400);
      bloom.addColorStop(0, 'rgba(255,252,240,0.18)'); bloom.addColorStop(1, 'rgba(255,252,240,0)');
      c.fillStyle = bloom; c.fillRect(0, 0, 1920, 300);
    },
    front(c, s) {
      const vig = U.cached('mainframe_vig3', 1920, 1080, g => {
        const grd = g.createRadialGradient(960, 540, 600, 960, 540, 1200);
        grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(43,43,43,0.13)');
        g.fillStyle = grd; g.fillRect(0, 0, 1920, 1080);
      });
      c.drawImage(vig, 0, 0);
    }
  });
})();
