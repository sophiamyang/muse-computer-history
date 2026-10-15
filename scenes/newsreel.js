// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:23:20.778Z (revision)
(() => {
  const FLOOR = 830;
  const ACT_AT = 1020;
  const PROP_X = ACT_AT + 130;
  const PROP_Y = FLOOR - 188;
  const TUBE = { x: 1310, y: 300, w: 280, h: 360, r: 70 };
  const REEL_ANCHOR = { x: 210, y: 310 };

  SCENE({
    id: 'newsreel',
    year: '1946',
    title: 'Electronic computer',
    floor: FLOOR,
    act: {
      at: ACT_AT,
      dur: 2.2,
      prompt: 'plug in the cable',
      hotspot: { x: PROP_X - 80, y: PROP_Y - 80, w: 160, h: 160 },
      pose: u => {
        const wind = U.ss(0, 0.28, u);
        const reach = U.ss(0.18, 0.95, u);
        const crouch = 0.14 * U.ss(0, 0.22, u) * (1 - U.ss(0.3, 0.65, u));
        const armR = U.lerp(0.12, 1.68, reach);
        const lean = 0.18 * U.ss(0.25, 0.9, u);
        const lookY = -0.38 * U.ss(0.2, 0.85, u);
        const lift = 0.04 * U.ss(1.35, 1.9, u);
        return {
          armR: armR,
          armL: 0.12 + 0.12 * wind,
          elbowR: 0.35 + 0.55 * reach,
          elbowL: 0.18,
          crouch: crouch,
          lean: lean,
          lookY: lookY,
          lift: lift
        };
      }
    },
    portals: {
      tube: { x: TUBE.x, y: TUBE.y, w: TUBE.w, h: TUBE.h, r: TUBE.r, glow: 'rgba(255,240,200,.8)' }
    },
    characterStyle: {},
    treat(img) {
      const o = U.canvas(img.width, img.height);
      const g = o.getContext('2d');
      g.filter = 'grayscale(1) contrast(1.1) brightness(1.02)';
      g.drawImage(img, 0, 0);
      g.filter = 'none';
      return o;
    },
    shadow: 'rgba(0,0,0,.28)',
    music: { voice: 'brass', bpm: 96, root: 62 },
    sfx: [{ u: 0.95, kind: 'click' }, { u: 1.15, kind: 'thump' }],
    page: {
      heading: 'The electronic brain',
      text: 'Wires and switches could now calculate at electronic speed. Plug in the right pattern and the machine came to life.'
    },
    spots: [
      { x: 210, y: 360, w: 160, h: 140, label: 'Reel to reel', text: 'Numbers came in on punched cards or paper tape. One snag and the whole run stopped.' },
      { x: 760, y: 520, w: 140, h: 120, label: 'Patch board', text: 'Programming meant moving cables by hand — the code you could touch.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha = a;
      c.fillStyle = 'rgba(245,243,235,0.96)';
      U.rrect(c, 1410, 42, 470, 78, 2);
      c.fill();
      c.strokeStyle = 'rgba(30,30,30,0.95)';
      c.lineWidth = 2.2;
      c.stroke();
      c.strokeStyle = 'rgba(30,30,30,0.35)';
      c.lineWidth = 1;
      U.rrect(c, 1416, 48, 458, 66, 1);
      c.stroke();
      c.fillStyle = '#111';
      c.font = '700 28px "Times New Roman", Georgia, serif';
      c.textAlign = 'right';
      c.textBaseline = 'middle';
      c.fillText('1946  ·  ELECTRONIC COMPUTER', 1865, 82);
      c.restore();
    },

    draw(c, s) {
      const bg = U.cached('newsreel_bg3', 1920, 1080, g => {
        g.fillStyle = '#d9d6cc';
        g.fillRect(0, 0, 1920, 1080);
        const wg = g.createLinearGradient(0, 0, 0, 700);
        wg.addColorStop(0, '#e8e6df');
        wg.addColorStop(0.55, '#d7d3c6');
        wg.addColorStop(1, '#c2bdb0');
        g.fillStyle = wg;
        g.fillRect(0, 0, 1920, 740);
        g.fillStyle = '#b8b3a3';
        g.fillRect(0, 700, 1920, 18);
        g.fillStyle = '#9e998c';
        g.fillRect(0, 718, 1920, 6);
        const fg = g.createLinearGradient(0, 724, 0, 1080);
        fg.addColorStop(0, '#9e9b92');
        fg.addColorStop(0.25, '#8a867e');
        fg.addColorStop(1, '#6f6c64');
        g.fillStyle = fg;
        g.fillRect(0, 724, 1920, 356);
        g.strokeStyle = 'rgba(0,0,0,0.09)';
        g.lineWidth = 2;
        for (let x = -200; x < 2100; x += 140) {
          g.beginPath(); g.moveTo(x, 724); g.lineTo(x - 120, 1080); g.stroke();
        }
        for (let y = 780; y < 1080; y += 70) {
          g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke();
        }
        // solid darker backdrop behind Jolly for contrast
        g.fillStyle = '#3a3732';
        U.rrect(g, 870, 400, 340, 360, 18); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.55)';
        g.lineWidth = 2;
        U.rrect(g, 870, 400, 340, 360, 18); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.06)';
        U.rrect(g, 878, 408, 324, 344, 14); g.fill();
        // subtle inner highlight line
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(878, 408, 324, 2);

        g.fillStyle = '#2a2a2a';
        g.fillRect(48, 150, 980, 520);
        g.fillStyle = '#3a3a3a';
        g.fillRect(56, 158, 964, 504);
        g.fillStyle = '#1e1e1e';
        for (let i = 1; i < 4; i++) g.fillRect(56 + i * 241, 158, 6, 504);
        for (let p = 0; p < 4; p++) {
          const px = 72 + p * 241;
          g.fillStyle = '#e9e6dc';
          U.rrect(g, px + 28, 178, 170, 92, 10); g.fill();
          g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
          g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 1.2;
          g.beginPath(); g.arc(px + 113, 250, 52, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
          g.fillStyle = '#111';
          g.beginPath(); g.arc(px + 12, 172, 4, 0, 7); g.fill();
          g.beginPath(); g.arc(px + 214, 172, 4, 0, 7); g.fill();
          for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
              const lx = px + 18 + col * 34;
              const ly = 300 + row * 44;
              g.fillStyle = '#0f0f0f';
              g.beginPath(); g.arc(lx + 14, ly + 14, 13, 0, 7); g.fill();
              g.fillStyle = '#2b2b2b';
              g.beginPath(); g.arc(lx + 14, ly + 14, 10, 0, 7); g.fill();
            }
          }
          g.fillStyle = '#111';
          U.rrect(g, px + 10, 545, 200, 100, 8); g.fill();
          g.fillStyle = '#2b2b2b';
          U.rrect(g, px + 14, 549, 192, 92, 6); g.fill();
          for (let r2 = 0; r2 < 3; r2++) for (let c2 = 0; c2 < 4; c2++) {
            g.fillStyle = '#050505';
            g.beginPath(); g.arc(px + 42 + c2 * 42, 572 + r2 * 26, 9, 0, 7); g.fill();
          }
        }
        g.fillStyle = '#2f2f2f';
        U.rrect(g, 1220, 180, 460, 540, 14); g.fill();
        g.fillStyle = '#3d3d3d';
        U.rrect(g, 1228, 188, 444, 524, 12); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.35)';
        for (let y = 210; y < 680; y += 18) g.fillRect(1248, y, 404, 6);
        g.fillStyle = '#f5f2e8';
        U.rrect(g, 320, 78, 1280, 62, 4); g.fill();
        g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
        g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 1;
        U.rrect(g, 326, 84, 1268, 50, 2); g.stroke();
        g.fillStyle = '#111';
        g.font = '700 30px "Times New Roman", Georgia, serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('THE  MIGHTY  ELECTRONIC  BRAIN', 960, 110);
        g.font = '600 11px "Times New Roman", serif';
        g.fillStyle = '#333';
        g.fillText('—  NEWSREEL  NO. 47  —', 960, 132);
        // reel-to-reel source
        g.fillStyle = '#1e1e1e';
        U.rrect(g, 90, 170, 250, 170, 12); g.fill();
        g.fillStyle = '#2b2b2b';
        U.rrect(g, 96, 176, 238, 158, 10); g.fill();
        for (let k = 0; k < 2; k++) {
          const rx = 155 + k * 110, ry = 255;
          g.fillStyle = '#c8c6c0';
          g.beginPath(); g.arc(rx, ry, 46, 0, 7); g.fill();
          g.strokeStyle = '#5a5a5a'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#e8e6df';
          g.beginPath(); g.arc(rx, ry, 38, 0, 7); g.fill();
          g.strokeStyle = '#9a9a9a'; g.lineWidth = 3;
          for (let a = 0; a < 3; a++) {
            const ang = a * Math.PI * 2 / 3;
            g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + Math.cos(ang) * 32, ry + Math.sin(ang) * 32); g.stroke();
          }
          g.fillStyle = '#222';
          g.beginPath(); g.arc(rx, ry, 12, 0, 7); g.fill();
          g.fillStyle = '#555';
          g.beginPath(); g.arc(rx, ry, 5, 0, 7); g.fill();
        }
        g.strokeStyle = '#111'; g.lineWidth = 5;
        g.beginPath(); g.moveTo(155, 212); g.quadraticCurveTo(210, 192, 265, 212); g.stroke();
        g.strokeStyle = '#3a3a3a'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(155, 212); g.quadraticCurveTo(210, 192, 265, 212); g.stroke();
        g.strokeStyle = 'rgba(20,20,20,0.9)'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(155, 298); g.lineTo(155, 318); g.stroke();
        g.beginPath(); g.moveTo(265, 298); g.lineTo(265, 318); g.stroke();
        // tube stand base
        g.fillStyle = '#1a1a1a';
        U.rrect(g, 1300, 640, 300, 84, 10); g.fill();
        g.fillStyle = '#4a4a4a';
        U.rrect(g, 1310, 648, 280, 20, 6); g.fill();
        g.fillStyle = '#0f0f0f';
        U.rrect(g, 1375, 610, 150, 36, 8); g.fill();
        g.fillStyle = '#2a2a2a';
        U.rrect(g, 1385, 618, 130, 20, 6); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 8;
        g.beginPath(); g.moveTo(1028, 220); g.lineTo(1220, 220); g.stroke();
        g.beginPath(); g.moveTo(1028, 240); g.lineTo(1220, 240); g.stroke();
        g.fillStyle = '#222';
        g.fillRect(680, 800, 520, 14);
        g.fillStyle = '#333';
        g.fillRect(680, 803, 520, 6);
      });
      c.drawImage(bg, -s.camX, 0);

      const u = s.u;
      const flare = U.clamp(U.ss(0.95, 1.35, u) * 1.0 + U.ss(1.35, 1.9, u) * 0.25, 0, 1);
      const cascade = U.clamp((u - 0.95) * 1.7, 0, 1);

      // warm throw from tube when flaring - stronger
      if (flare > 0.02) {
        const tx = TUBE.x + TUBE.w / 2, ty = TUBE.y + TUBE.h / 2;
        const rg = c.createRadialGradient(tx, ty, 20, tx, ty, 800);
        rg.addColorStop(0, `rgba(255,240,180,${0.42 * flare})`);
        rg.addColorStop(0.3, `rgba(255,220,140,${0.22 * flare})`);
        rg.addColorStop(1, 'rgba(255,220,140,0)');
        c.fillStyle = rg;
        c.fillRect(0, 0, 1920, 1080);
        c.fillStyle = `rgba(255,230,150,${0.24 * flare})`;
        c.fillRect(0, 724, 1920, 356);
      }

      // contact shadow under Jolly
      c.fillStyle = 'rgba(0,0,0,0.24)';
      c.beginPath(); c.ellipse(ACT_AT, FLOOR + 8, 120, 18, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.14)';
      c.beginPath(); c.ellipse(ACT_AT, FLOOR + 8, 78, 10, 0, 0, 7); c.fill();

      // socket plate 160x160 bright cream plate at mitten height
      c.save();
      c.fillStyle = 'rgba(0,0,0,0.28)';
      U.rrect(c, PROP_X - 82, PROP_Y - 82, 164, 164, 20); c.fill();
      c.fillStyle = '#c9a84a';
      U.rrect(c, PROP_X - 80, PROP_Y - 80, 160, 160, 18); c.fill();
      c.fillStyle = '#fdf8e2';
      U.rrect(c, PROP_X - 74, PROP_Y - 74, 148, 148, 16); c.fill();
      c.strokeStyle = '#7a6e2e'; c.lineWidth = 3;
      U.rrect(c, PROP_X - 74, PROP_Y - 74, 148, 148, 16); c.stroke();
      // screws
      c.fillStyle = '#5a4e2a';
      c.beginPath(); c.arc(PROP_X - 62, PROP_Y - 62, 5, 0, 7); c.fill();
      c.beginPath(); c.arc(PROP_X + 62, PROP_Y - 62, 5, 0, 7); c.fill();
      c.beginPath(); c.arc(PROP_X - 62, PROP_Y + 62, 5, 0, 7); c.fill();
      c.beginPath(); c.arc(PROP_X + 62, PROP_Y + 62, 5, 0, 7); c.fill();
      // dark hole 28px
      c.fillStyle = '#070707';
      c.beginPath(); c.arc(PROP_X, PROP_Y, 28, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.12)';
      c.beginPath(); c.arc(PROP_X - 6, PROP_Y - 6, 6, 0, 7); c.fill();
      const plugged = u >= 0.95;
      if (!plugged) {
        c.strokeStyle = 'rgba(200,170,40,0.98)';
        c.lineWidth = 6;
        c.beginPath(); c.arc(PROP_X, PROP_Y, 36, 0, 7); c.stroke();
      } else {
        c.strokeStyle = 'rgba(255,210,60,1)';
        c.lineWidth = 6;
        c.beginPath(); c.arc(PROP_X, PROP_Y, 36, 0, 7); c.stroke();
      }
      // INPUT lamp 10px with halo
      const blinkOn = Math.sin(s.now * 3.2) > 0;
      const lampOn = plugged ? true : blinkOn;
      c.fillStyle = lampOn ? 'rgba(255,60,40,0.98)' : 'rgba(80,20,15,0.9)';
      c.beginPath(); c.arc(PROP_X + 52, PROP_Y - 52, 10, 0, 7); c.fill();
      if (lampOn) {
        c.fillStyle = 'rgba(255,80,60,0.32)';
        c.beginPath(); c.arc(PROP_X + 52, PROP_Y - 52, 20, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.92)';
        c.beginPath(); c.arc(PROP_X + 50, PROP_Y - 54, 3, 0, 7); c.fill();
      }
      c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(PROP_X + 52, PROP_Y - 52, 10, 0, 7); c.stroke();
      c.fillStyle = '#2a2410';
      c.font = '700 12px "Courier New", monospace';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('INPUT A', PROP_X, PROP_Y + 62);
      c.restore();

      // panel lamps: off near-black 16px, on bright yellow 18px with 24px halo
      for (let p = 0; p < 4; p++) {
        const px = 72 + p * 241;
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 6; col++) {
            const lx = px + 18 + col * 34;
            const ly = 300 + row * 44;
            const order = p * 30 + row * 6 + col;
            const onT = U.ss(order * 0.012, order * 0.012 + 0.28, cascade);
            const isOn = cascade > 0 && onT > 0.5;
            if (isOn) {
              c.fillStyle = 'rgba(255,235,120,0.38)';
              c.beginPath(); c.arc(lx + 14, ly + 14, 24, 0, 7); c.fill();
              c.fillStyle = 'rgba(255,245,160,0.55)';
              c.beginPath(); c.arc(lx + 14, ly + 14, 20, 0, 7); c.fill();
              c.fillStyle = 'rgba(255,230,90,1)';
              c.beginPath(); c.arc(lx + 14, ly + 14, 18, 0, 7); c.fill();
              c.fillStyle = 'rgba(255,255,255,0.9)';
              c.beginPath(); c.arc(lx + 11, ly + 10, 5, 0, 7); c.fill();
            } else {
              c.fillStyle = '#0d0d0d';
              c.beginPath(); c.arc(lx + 14, ly + 14, 16, 0, 7); c.fill();
              c.fillStyle = 'rgba(255,255,255,0.07)';
              c.beginPath(); c.arc(lx + 12, ly + 11, 3, 0, 7); c.fill();
            }
          }
        }
      }

      // meters needles swing
      for (let p = 0; p < 4; p++) {
        const px = 72 + p * 241;
        const cx = px + 113, cy = 250;
        const idleAng = -Math.PI * 0.82 + Math.sin(s.now * 0.6 + p * 1.1) * 0.04;
        const swingAng = -Math.PI * 0.12 - p * 0.08;
        const ang = plugged ? U.lerp(idleAng, swingAng, U.ss(0.95, 1.45, u)) : idleAng;
        c.save();
        c.translate(cx, cy);
        c.rotate(ang);
        c.strokeStyle = '#111';
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(48, 0); c.stroke();
        c.fillStyle = '#c0392b';
        c.beginPath(); c.arc(48, 0, 3, 0, 7); c.fill();
        c.fillStyle = '#111';
        c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill();
        c.restore();
        c.fillStyle = 'rgba(255,255,255,0.18)';
        c.beginPath(); c.ellipse(cx - 18, cy - 18, 18, 10, -0.6, 0, 7); c.fill();
      }

      // cable and plug logic
      const hand = s.hero.hands ? s.hero.hands.R : { x: s.hero.x + 110, y: s.hero.y - 190 };
      const hx = hand.x - s.camX;
      const hy = hand.y;
      const floorPlug = { x: ACT_AT + 18, y: FLOOR - 10 };
      let plugX, plugY;
      if (u < 0) {
        plugX = floorPlug.x; plugY = floorPlug.y;
      } else if (u < 0.95) {
        plugX = hx; plugY = hy;
      } else {
        plugX = PROP_X; plugY = PROP_Y;
      }

      const sag = 32 + 8 * Math.sin(s.now * 0.8);
      const midX = (REEL_ANCHOR.x + plugX) / 2;
      const midY = Math.max(REEL_ANCHOR.y, plugY) + sag;
      function drawCablePath() {
        c.beginPath();
        c.moveTo(REEL_ANCHOR.x, REEL_ANCHOR.y);
        c.quadraticCurveTo(midX, midY, plugX, plugY);
      }
      // drop shadow under cable
      c.save();
      c.strokeStyle = 'rgba(0,0,0,0.22)';
      c.lineWidth = 22;
      c.lineCap = 'round'; c.lineJoin = 'round';
      drawCablePath(); c.stroke();
      c.restore();
      c.save();
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = '#0a0a0a'; c.lineWidth = 20; drawCablePath(); c.stroke();
      c.strokeStyle = '#f5ecd0'; c.lineWidth = 16; drawCablePath(); c.stroke();
      c.strokeStyle = '#c9a84a'; c.lineWidth = 5; drawCablePath(); c.stroke();
      c.restore();

      // plug body 44x28
      if (!plugged) {
        const pop = (u >= 0.85 && u < 0.95) ? 1 + 0.2 * U.ss(0.85, 0.95, u) * 2 : 1;
        const isInHand = u >= 0;
        const sc = isInHand ? 1.2 * pop : pop;
        c.save();
        c.translate(plugX, plugY);
        c.scale(sc, sc);
        c.rotate(u < 0 ? 0.05 : 0.28);
        c.fillStyle = '#0f0f0f';
        U.rrect(c, -22, -14, 44, 28, 7); c.fill();
        c.fillStyle = '#d8b84a';
        U.rrect(c, -20, -12, 40, 24, 6); c.fill();
        c.fillStyle = '#f5e6a0';
        U.rrect(c, -18, -9, 34, 7, 2); c.fill();
        c.fillStyle = '#8a7a3a';
        c.fillRect(20, -8, 14, 6);
        c.fillRect(20, 2, 14, 6);
        c.fillStyle = 'rgba(255,255,255,0.6)';
        U.rrect(c, -16, -9, 16, 4, 1); c.fill();
        c.restore();
        if (u < 0) {
          c.fillStyle = 'rgba(0,0,0,0.2)';
          c.beginPath(); c.ellipse(plugX, plugY + 12, 28, 7, 0, 0, 7); c.fill();
        }
      } else {
        const popAlpha = 1 - U.ss(0.95, 1.15, u);
        if (popAlpha > 0.01) {
          c.save();
          c.globalAlpha = popAlpha;
          c.strokeStyle = 'rgba(255,220,80,0.95)';
          c.lineWidth = 4;
          c.beginPath(); c.arc(PROP_X, PROP_Y, 38 + (1 - popAlpha) * 22, 0, 7); c.stroke();
          c.strokeStyle = 'rgba(255,240,150,0.6)';
          c.lineWidth = 2;
          c.beginPath(); c.arc(PROP_X, PROP_Y, 48 + (1 - popAlpha) * 22, 0, 7); c.stroke();
          c.restore();
        }
        c.fillStyle = '#1a1a1a';
        U.rrect(c, PROP_X - 14, PROP_Y - 10, 28, 20, 4); c.fill();
        c.fillStyle = '#c9a84a';
        U.rrect(c, PROP_X - 12, PROP_Y - 8, 24, 16, 3); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.5)';
        U.rrect(c, PROP_X - 10, PROP_Y - 6, 10, 3, 1); c.fill();
      }

      // vacuum tube portal - boosted
      const tp = TUBE;
      const glowInt = 0.35 + 0.55 * flare + 0.06 * Math.sin(s.now * 1.1);
      c.save();
      c.fillStyle = `rgba(255,240,200,${0.52 * glowInt})`;
      c.beginPath(); c.ellipse(tp.x + tp.w / 2, tp.y + tp.h / 2, tp.w * 0.92, tp.h * 0.72, 0, 0, 7); c.fill();
      c.fillStyle = `rgba(255,240,200,${0.22 * glowInt})`;
      c.beginPath(); c.ellipse(tp.x + tp.w / 2, tp.y + tp.h / 2, tp.w * 1.38, tp.h * 1.05, 0, 0, 7); c.fill();
      c.restore();

      c.save();
      U.rrect(c, tp.x, tp.y, tp.w, tp.h, tp.r);
      c.clip();
      const scale = U.lerp(1, 1.06, U.ss(1.1, 1.9, u));
      c.save();
      c.translate(tp.x + tp.w / 2, tp.y + tp.h / 2);
      c.scale(scale, scale);
      c.translate(-(tp.x + tp.w / 2), -(tp.y + tp.h / 2));
      c.filter = 'contrast(1.35) saturate(1.35) brightness(1.08)';
      s.peek('tube');
      c.filter = 'none';
      c.restore();
      c.fillStyle = `rgba(255,220,140,${0.14 - 0.08 * flare})`;
      c.fillRect(tp.x, tp.y, tp.w, tp.h);
      const filFlick = 0.7 + 0.3 * Math.sin(s.now * 6) * 0.5 + flare * 0.6;
      c.strokeStyle = `rgba(255,180,60,${0.92 * filFlick})`;
      c.lineWidth = 2.8;
      c.beginPath();
      const fx = tp.x + tp.w / 2;
      const fy = tp.y + tp.h * 0.62;
      c.moveTo(fx - 24, fy - 38); c.lineTo(fx - 11, fy); c.lineTo(fx, fy - 36); c.lineTo(fx + 11, fy); c.lineTo(fx + 24, fy - 38);
      c.stroke();
      if (flare > 0.02) {
        const flashA = U.clamp(flare, 0, 1);
        const flashPeak = 1 - U.ss(0.95, 1.2, u);
        // near-white flash for 0.25s
        c.fillStyle = `rgba(255,250,235,${0.92 * flashA * flashPeak})`;
        c.fillRect(tp.x, tp.y, tp.w, tp.h);
        c.fillStyle = `rgba(255,255,255,${0.55 * flashA * flashPeak})`;
        c.beginPath(); c.ellipse(fx, fy - 14, 44 * flashA, 64 * flashA, 0, 0, 7); c.fill();
        // settle to amber glow
        c.fillStyle = `rgba(255,210,100,${0.28 * flare * (1 - flashPeak)})`;
        c.fillRect(tp.x, tp.y, tp.w, tp.h);
      }
      c.restore();

      c.strokeStyle = 'rgba(20,20,20,0.98)';
      c.lineWidth = 6;
      U.rrect(c, tp.x, tp.y, tp.w, tp.h, tp.r); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.9)';
      c.lineWidth = 2;
      U.rrect(c, tp.x + 5, tp.y + 5, tp.w - 10, tp.h - 10, tp.r - 4); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.62)';
      c.lineWidth = 2;
      U.rrect(c, tp.x + 3, tp.y + 3, tp.w - 6, tp.h - 6, tp.r - 2); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.24)';
      U.rrect(c, tp.x + 22, tp.y + 18, 18, tp.h - 36, 9); c.fill();
      c.fillStyle = '#1a1a1a';
      U.rrect(c, tp.x + 30, tp.y + tp.h - 18, tp.w - 60, 14, 4); c.fill();
      c.fillStyle = '#4a4a4a';
      c.fillRect(tp.x + 36, tp.y + tp.h - 14, tp.w - 72, 4);
      c.fillStyle = '#e8e6df';
      U.rrect(c, 1386, 682, 128, 22, 3); c.fill();
      c.fillStyle = '#111';
      c.font = '700 10px "Courier New", monospace';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('VACUUM  TUBE  6L6', 1450, 693);
    },

    front(c, s) {
      c.fillStyle = 'rgba(255,255,255,0.05)';
      c.fillRect(0, 0, 1920, 1080);
      const vig = U.cached('newsreel_vig3', 1920, 1080, g => {
        const rg = g.createRadialGradient(960, 540, 520, 960, 540, 1300);
        rg.addColorStop(0, 'rgba(0,0,0,0)');
        rg.addColorStop(0.72, 'rgba(0,0,0,0)');
        rg.addColorStop(1, 'rgba(0,0,0,0.42)');
        g.fillStyle = rg;
        g.fillRect(0, 0, 1920, 1080);
        const cg = g.createRadialGradient(0, 0, 0, 0, 0, 900);
        cg.addColorStop(0, 'rgba(0,0,0,0.22)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = cg; g.fillRect(0, 0, 960, 540);
        const cg2 = g.createRadialGradient(1920, 0, 0, 1920, 0, 900);
        cg2.addColorStop(0, 'rgba(0,0,0,0.22)'); cg2.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = cg2; g.fillRect(960, 0, 960, 540);
      });
      c.drawImage(vig, 0, 0);
      c.fillStyle = 'rgba(0,0,0,0.88)';
      c.fillRect(0, 0, 18, 1080);
      c.fillRect(1902, 0, 18, 1080);
      c.fillStyle = 'rgba(255,255,255,0.92)';
      for (let y = 20; y < 1080; y += 54) {
        U.rrect(c, 3, y, 12, 28, 3); c.fill();
        U.rrect(c, 1905, y, 12, 28, 3); c.fill();
      }
      const stepT = U.step(s.now, 8);
      c.save();
      c.globalAlpha = 0.09;
      c.strokeStyle = 'rgba(255,255,255,0.9)';
      c.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const x = (U.hash(i, 11) * 1920 + stepT * (40 + i * 23)) % 1920;
        const alpha = 0.04 + 0.06 * U.hash(i, 7);
        c.globalAlpha = alpha;
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x + U.hash(i, 3) * 6 - 3, 1080); c.stroke();
      }
      c.restore();
      c.save();
      const dustT = U.step(s.now, 6);
      for (let i = 0; i < 18; i++) {
        const rx = U.hash(i, 21);
        const ry = U.hash(i, 22);
        const x = (rx * 1920 + dustT * 18) % 1920;
        const y = (ry * 1080 + dustT * 12) % 1080;
        const sz = 1 + U.hash(i, 5) * 1.5;
        c.fillStyle = U.hash(i, 8) > 0.5 ? `rgba(255,255,255,${0.18})` : `rgba(0,0,0,${0.12})`;
        c.fillRect(x, y, sz, sz);
      }
      c.restore();
      c.save();
      c.globalAlpha = 0.04;
      c.fillStyle = '#000';
      for (let y = 0; y < 1080; y += 4) c.fillRect(0, y, 1920, 1);
      c.restore();
      const grain = U.grain('newsreel', 0.09, 0.14, true);
      c.save();
      c.globalAlpha = 0.22;
      const gx = (U.step(s.now, 8) * 97) % 512;
      const gy = (U.step(s.now * 0.7, 8) * 53) % 512;
      U.tile(c, grain, gx, gy);
      c.restore();
      const flick = 0.015 * Math.sin(s.now * 3.2) + 0.012 * Math.sin(s.now * 7.1 + 1.3);
      c.fillStyle = `rgba(255,255,255,${Math.abs(flick)})`;
      c.fillRect(0, 0, 1920, 1080);
      c.strokeStyle = 'rgba(0,0,0,0.35)';
      c.lineWidth = 2;
      c.strokeRect(18, 0, 1884, 1080);
    }
  });
})();
