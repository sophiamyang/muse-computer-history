// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:23:15.121Z (revision)
(() => {
  const FLOOR = 860;
  const ACT_AT = 820;
  const PROP_X = 950;
  const PROP_Y = 540;
  const SIGN_X = 1100;
  const SIGN_Y = 630;
  const PORTAL = { x: 1240, y: 300, w: 400, h: 300, r: 30, glow: 'rgba(120,255,200,.7)' };

  function buildBg(g) {
    const W = 320, H = 180;
    const bands = [
      ['#0b3d42', 0, 18],
      ['#124f56', 18, 12],
      ['#1a6a6e', 30, 10],
      ['#2a8a8a', 40, 10],
      ['#3fb0a0', 50, 10],
      ['#7ec8b8', 60, 8],
      ['#f0d080', 68, 8],
      ['#ffb84d', 76, 10],
      ['#ff8c42', 86, 10],
      ['#e86a2c', 96, 6]
    ];
    g.fillStyle = '#0b3d42';
    g.fillRect(0, 0, W, H);
    bands.forEach(b => { g.fillStyle = b[0]; g.fillRect(0, b[1], W, b[2]); });
    g.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < 102; y += 2) g.fillRect(0, y, W, 1);

    g.fillStyle = '#1e2a3a';
    g.fillRect(0, 102, W, 14);
    g.fillStyle = '#2a3a4a';
    for (let x = 0; x < W; x += 16) {
      const h = 6 + (U.hash(x, 11) * 10 | 0);
      g.fillRect(x, 102 - h, 12, h);
      if (U.hash(x, 7) > 0.55) {
        g.fillStyle = '#ffd86a';
        g.fillRect(x + 3, 102 - h + 2, 2, 2);
        g.fillStyle = '#2a3a4a';
      }
    }
    g.fillStyle = '#ffffff';
    const stars = [[40, 12], [88, 18], [140, 10], [200, 22], [260, 14], [300, 20], [180, 28], [70, 30]];
    stars.forEach(p => g.fillRect(p[0], p[1], 1, 1));

    g.fillStyle = '#d8c8a8';
    g.fillRect(0, 108, W, 72);
    g.fillStyle = '#b8a88a';
    g.fillRect(0, 168, W, 12);

    // darker vertical panel behind Jolly's path - 60 low-res wide = 360 screen px
    g.fillStyle = '#7a6a52';
    g.fillRect(106, 108, 60, 60);
    g.fillStyle = '#6a5a42';
    g.fillRect(106, 108, 60, 4);
    g.fillStyle = 'rgba(0,0,0,0.14)';
    g.fillRect(112, 118, 48, 2);
    g.fillRect(112, 124, 48, 1);

    const keys = [
      { x: 6, y: 118, w: 38, h: 10, c: '#e8ddd0' },
      { x: 48, y: 118, w: 28, h: 10, c: '#e8ddd0' },
      { x: 80, y: 118, w: 28, h: 10, c: '#e8ddd0' },
      { x: 112, y: 118, w: 28, h: 10, c: '#e8ddd0' },
      { x: 6, y: 132, w: 44, h: 14, c: '#f0e6d2' },
      { x: 54, y: 132, w: 28, h: 14, c: '#ffffff' },
      { x: 86, y: 132, w: 28, h: 14, c: '#ffffff' },
      { x: 118, y: 132, w: 28, h: 14, c: '#ffffff' },
      { x: 150, y: 132, w: 36, h: 14, c: '#e8ddd0' },
      { x: 86, y: 148, w: 52, h: 16, c: '#fff8e0' },
      { x: 142, y: 148, w: 40, h: 16, c: '#f0e6d2' },
      { x: 6, y: 148, w: 76, h: 16, c: '#d8c8a8' },
    ];
    keys.forEach(k => {
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(k.x + 1, k.y + 1, k.w, k.h);
      g.fillStyle = k.c;
      g.fillRect(k.x, k.y, k.w, k.h);
      g.fillStyle = 'rgba(255,255,255,0.6)';
      g.fillRect(k.x, k.y, k.w, 2);
      g.fillStyle = 'rgba(0,0,0,0.15)';
      g.fillRect(k.x, k.y + k.h - 2, k.w, 2);
    });

    g.fillStyle = '#c9b896';
    g.fillRect(200, 62, 92, 58);
    g.fillStyle = '#a89878';
    g.fillRect(200, 62, 92, 4);
    g.fillRect(200, 62, 4, 58);
    g.fillStyle = '#8a7a5a';
    for (let i = 0; i < 4; i++) g.fillRect(204, 112 + i * 3, 20, 1);
    g.fillStyle = '#2a2a2e';
    g.fillRect(208, 68, 76, 52);

    g.fillStyle = '#c2b090';
    g.fillRect(118, 82, 72, 32);
    g.fillStyle = '#a89878';
    g.fillRect(118, 82, 72, 4);

    g.fillStyle = 'rgba(0,0,0,0.08)';
    for (let i = 0; i < 200; i++) {
      const x = (U.hash(i, 13) * W) | 0;
      const y = 120 + (U.hash(i, 19) * 40) | 0;
      g.fillRect(x, y, 1, 1);
    }
  }

  SCENE({
    id: 'pixel',
    year: '1983',
    title: 'Home computers',
    floor: FLOOR,
    act: {
      at: ACT_AT,
      dur: 2.0,
      prompt: 'bump the drive',
      hotspot: { x: 810, y: 500, w: 280, h: 120 },
      path: u => {
        if (u < 0) return { dx: 0, dy: 0 };
        if (u < 1.6) return { dx: 0, dy: 0 };
        const p = U.ss(1.6, 2.0, u);
        return { dx: 220 * p, dy: -70 * p - 18 * Math.sin(p * Math.PI) };
      },
      pose: u => {
        if (u < 0) return { armR: 0.12, armL: 0.12, crouch: 0, lift: 0, lean: 0, lookY: 0 };
        const crouchA = U.ss(0, 0.28, u) * 0.32;
        const crouchB = U.ss(0.28, 0.55, u) * 0.32;
        const crouch = Math.max(0, crouchA - crouchB);
        const liftUp = U.ss(0.32, 0.62, u) * 0.136;
        const liftDown = U.ss(0.62, 1.0, u) * 0.136;
        const lift = Math.max(0, liftUp - liftDown);
        let armR = 0.12;
        if (u < 0.25) armR = U.lerp(0.12, 1.0, U.ss(0, 0.25, u));
        else if (u < 0.55) armR = U.lerp(1.0, 2.62, U.ss(0.25, 0.55, u));
        else if (u < 0.70) armR = 2.62;
        else armR = U.lerp(2.62, 0.9, U.ss(0.70, 1.3, u));
        const elbowR = u > 0.3 && u < 0.75 ? 0.55 : 0.2;
        const lookY = U.lerp(0, -0.95, U.ss(0.2, 0.5, u));
        const lean = 0.10 * U.ss(0.3, 0.6, u);
        return { armR, armL: 0.18, elbowR, elbowL: 0.2, crouch, lift, lean, lookY };
      }
    },
    portals: { crt: PORTAL },
    characterStyle: { tint: '#ffd9a0', tintAlpha: 0.15 },
    treat(img) { const o = U.pixelate(img, 7); o.pixel = true; return o; },
    shadow: 'rgba(30,20,10,.28)',
    music: { voice: 'chip', bpm: 96, root: 62 },
    sfx: [{ u: 0.58, kind: 'thump' }, { u: 0.85, kind: 'pop' }, { u: 1.35, kind: 'beep' }],
    page: { heading: 'The computer at home', text: 'Keys became desks and screens became rooms. You could type a program and it would answer back.' },
    spots: [
      { x: 1320, y: 620, w: 140, h: 110, label: 'BASIC listing', text: 'Line numbers told the computer what to do first — a recipe you typed yourself.' },
      { x: 420, y: 740, w: 160, h: 100, label: 'Space bar terrace', text: 'The biggest key made the biggest step. Everyone found it with their thumbs.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha = a;
      const x = 1400, y = 48, w = 480, h = 86;
      c.fillStyle = '#1a1a1e';
      c.fillRect(x, y, w, h);
      c.fillStyle = '#ffd86a';
      c.fillRect(x + 4, y + 4, w - 8, h - 8);
      c.fillStyle = '#1a1a1e';
      c.fillRect(x + 8, y + 8, w - 16, 4);
      c.fillRect(x + 8, y + h - 12, w - 16, 4);
      c.fillStyle = '#1a1a1e';
      c.font = '700 28px "Courier New", monospace';
      c.textAlign = 'right';
      c.textBaseline = 'alphabetic';
      c.fillText('1983  ·  HOME COMPUTERS', 1872, 78);
      c.font = '700 14px "Courier New", monospace';
      c.fillStyle = '#3a2a1a';
      c.fillText('8-BIT  COLOR  64K', 1872, 102);
      c.restore();
    },

    draw(c, s) {
      const bgLow = U.cached('pixel_bg_low2', 320, 180, buildBg);
      c.save();
      c.imageSmoothingEnabled = false;
      c.drawImage(bgLow, 0, 0, 1920, 1080);
      c.imageSmoothingEnabled = true;
      c.restore();

      const tw = Math.sin(s.now * 2.2) * 0.5 + 0.5;
      c.fillStyle = `rgba(255,255,255,${0.12 * tw})`;
      c.fillRect(240, 72, 6, 6);
      c.fillRect(1200, 108, 6, 6);
      const scanX = (s.now * 18) % 1920;
      c.fillStyle = 'rgba(255,255,255,0.04)';
      c.fillRect(scanX, 0, 120, 110);

      // contact shadow under Jolly to separate from white keys
      const hx = s.hero.x - s.camX;
      const hy = FLOOR;
      c.save();
      c.globalAlpha = 0.20;
      c.fillStyle = 'rgba(0,0,0,0.45)';
      c.beginPath();
      c.ellipse(hx, hy - 2, 70, 14, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();

      const p = PORTAL;
      c.save();
      U.rrect(c, p.x, p.y, p.w, p.h, p.r);
      c.clip();
      c.fillStyle = '#0e2a26';
      c.fillRect(p.x, p.y, p.w, p.h);
      const pg = c.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 40, p.x + p.w / 2, p.y + p.h / 2, 260);
      pg.addColorStop(0, 'rgba(120,255,180,0.18)');
      pg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = pg;
      c.fillRect(p.x, p.y, p.w, p.h);

      let fade = 0;
      if (s.u >= 0.9) fade = U.ss(0.9, 1.3, s.u);
      const peekAlpha = fade;
      const basicAlpha = 1 - fade;

      if (peekAlpha > 0.001) {
        c.save();
        c.globalAlpha = peekAlpha;
        s.peek('crt');
        c.restore();
      }

      if (basicAlpha > 0.001) {
        c.save();
        c.globalAlpha = basicAlpha;
        const lines = [
          '10 PRINT "HELLO"',
          '20 FOR I=1 TO 10',
          '30 PRINT I;',
          '40 NEXT I',
          '50 GOTO 10'
        ];
        const totalChars = lines.join('\n').length + 12;
        const t = s.now * 9;
        const cur = Math.floor(t % (totalChars + 30));
        let shown = '';
        let count = 0;
        for (let li = 0; li < lines.length; li++) {
          const ln = lines[li];
          if (cur > count + ln.length) {
            shown += ln + '\n';
            count += ln.length + 1;
          } else if (cur > count) {
            shown += ln.slice(0, cur - count);
            break;
          } else break;
        }
        c.shadowColor = 'rgba(120,255,170,0.95)';
        c.shadowBlur = 14;
        c.fillStyle = '#b6ffb8';
        c.font = '700 26px "Courier New", monospace';
        c.textAlign = 'left';
        c.textBaseline = 'top';
        const tx = p.x + 22, ty = p.y + 22;
        const rows = shown.split('\n');
        rows.forEach((row, i) => {
          c.fillText(row, tx, ty + i * 28);
        });
        const blink = Math.floor(s.now * 2) % 2 === 0;
        if (blink) {
          const last = rows[rows.length - 1] || '';
          const cx = tx + last.length * 15.6;
          const cy = ty + (rows.length - 1) * 28;
          c.shadowBlur = 10;
          c.fillRect(cx + 2, cy + 2, 18, 20);
        }
        c.shadowBlur = 0;
        c.restore();
      }

      c.fillStyle = 'rgba(0,0,0,0.10)';
      for (let y = p.y; y < p.y + p.h; y += 6) c.fillRect(p.x, y, p.w, 3);
      c.fillStyle = 'rgba(180,255,200,0.06)';
      for (let y = p.y; y < p.y + p.h; y += 12) c.fillRect(p.x, y, p.w, 1);

      const grad = c.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 80, p.x + p.w / 2, p.y + p.h / 2, 320);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.32)');
      c.fillStyle = grad;
      c.fillRect(p.x, p.y, p.w, p.h);
      c.restore();

      c.save();
      c.fillStyle = 'rgba(120,255,200,.22)';
      c.beginPath();
      c.roundRect(p.x - 30, p.y - 30, p.w + 60, p.h + 60, p.r + 18);
      c.roundRect(p.x, p.y, p.w, p.h, p.r);
      c.fill('evenodd');
      c.fillStyle = '#e8ddd0';
      c.beginPath();
      c.roundRect(p.x - 22, p.y - 22, p.w + 44, p.h + 44, p.r + 14);
      c.roundRect(p.x, p.y, p.w, p.h, p.r);
      c.fill('evenodd');
      c.strokeStyle = '#b8a88a';
      c.lineWidth = 6;
      U.rrect(c, p.x - 22, p.y - 22, p.w + 44, p.h + 44, p.r + 14);
      c.stroke();
      c.fillStyle = '#2a2a2e';
      c.beginPath();
      c.roundRect(p.x - 6, p.y - 6, p.w + 12, p.h + 12, p.r + 4);
      c.roundRect(p.x, p.y, p.w, p.h, p.r);
      c.fill('evenodd');
      c.strokeStyle = 'rgba(255,255,255,0.35)';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(p.x + 30, p.y + 14);
      c.quadraticCurveTo(p.x + p.w / 2, p.y + 6, p.x + p.w - 30, p.y + 14);
      c.stroke();
      const ledOn = Math.floor(s.now * 1.5) % 2 === 0;
      c.fillStyle = ledOn ? '#ff3a3a' : '#7a1a1a';
      c.beginPath();
      c.arc(p.x + p.w + 12, p.y + p.h + 10, 6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255,60,60,0.35)';
      c.beginPath();
      c.arc(p.x + p.w + 12, p.y + p.h + 10, 12, 0, Math.PI * 2);
      c.fill();
      c.restore();

      if (s.u >= 0.9) {
        const pulse = 0.5 + 0.5 * Math.sin(s.now * 3.2);
        c.save();
        c.globalAlpha = 0.38 + 0.22 * pulse;
        c.strokeStyle = 'rgba(120,255,200,0.95)';
        c.lineWidth = 4;
        U.rrect(c, p.x - 34, p.y - 34, p.w + 68, p.h + 68, p.r + 20);
        c.stroke();
        const ax = p.x + p.w / 2;
        const ay = p.y - 46 - pulse * 6;
        c.fillStyle = 'rgba(255,255,255,0.95)';
        c.beginPath();
        c.moveTo(ax, ay + 14);
        c.lineTo(ax - 10, ay - 6);
        c.lineTo(ax + 10, ay - 6);
        c.closePath();
        c.fill();
        c.restore();
      }

      // --- Floppy drive enlarged ---
      const driveCX = PROP_X - s.camX;
      const driveCY = PROP_Y;
      const squash = (s.u > 0.55 && s.u < 0.75) ? 6 * Math.sin(((s.u - 0.55) / 0.2) * Math.PI) : 0;
      const hillY = driveCY - 36 + squash;
      c.fillStyle = '#c2b090';
      c.fillRect(driveCX - 140, hillY, 280, 72);
      c.fillStyle = '#a89878';
      c.fillRect(driveCX - 140, hillY, 280, 6);

      const slotW = 260, slotH = 48;
      const bezelX = driveCX - slotW / 2 - 14;
      const bezelY = driveCY - slotH / 2 - 10;
      const bezelW = slotW + 28;
      const bezelH = slotH + 20;

      // white highlight 8px on top edge
      c.fillStyle = 'rgba(255,255,255,0.95)';
      c.fillRect(bezelX, bezelY - 8, bezelW, 8);
      // thick dark outline
      c.fillStyle = '#1a1a1e';
      U.rrect(c, bezelX - 4, bezelY - 4, bezelW + 8, bezelH + 8, 8);
      c.fill();
      // bezel
      c.fillStyle = '#d8d8de';
      U.rrect(c, bezelX, bezelY, bezelW, bezelH, 6);
      c.fill();
      c.strokeStyle = '#a8a8b0';
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = '#0a0a0e';
      c.fillRect(driveCX - slotW / 2, driveCY - slotH / 2, slotW, slotH);
      c.fillStyle = '#000000';
      c.fillRect(driveCX - slotW / 2 + 8, driveCY - 3, slotW - 16, 6);
      const ledBlink = Math.floor(s.now * 2) % 2 === 0;
      c.fillStyle = ledBlink ? '#ff2a2a' : '#7a1a1a';
      c.beginPath();
      c.arc(driveCX + slotW / 2 - 18, driveCY - slotH / 2 + 10, 7, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255,40,40,0.32)';
      c.beginPath();
      c.arc(driveCX + slotW / 2 - 18, driveCY - slotH / 2 + 10, 13, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#1a1a1e';
      c.font = '700 22px "Courier New", monospace';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillText('DRIVE A:', driveCX, bezelY - 28);

      // pulsing white arrow above drive until bump
      if (s.u < 0.55) {
        const ap = 0.5 + 0.5 * Math.sin(s.now * 3.0);
        c.save();
        c.globalAlpha = 0.75 + 0.25 * ap;
        const ax = driveCX;
        const ay = bezelY - 52 - ap * 6;
        c.fillStyle = '#ffffff';
        c.strokeStyle = 'rgba(0,0,0,0.35)';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(ax, ay + 16);
        c.lineTo(ax - 12, ay - 4);
        c.lineTo(ax - 5, ay - 4);
        c.lineTo(ax - 5, ay - 14);
        c.lineTo(ax + 5, ay - 14);
        c.lineTo(ax + 5, ay - 4);
        c.lineTo(ax + 12, ay - 4);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
      }

      if (s.u > 0.55 && s.u < 0.75) {
        c.fillStyle = 'rgba(255,255,255,0.95)';
        c.fillRect(bezelX, bezelY - 6, bezelW, 6);
        c.fillStyle = 'rgba(255,255,255,0.55)';
        c.fillRect(driveCX - slotW / 2, driveCY - slotH / 2 - 4, slotW, 4);
      }

      // --- Floppy disk enlarged 110x85 ---
      const startX = PROP_X;
      const startY = PROP_Y + 6;
      const endX = SIGN_X;
      const endY = SIGN_Y - 18;
      let fx = startX, fy = startY, fr = 0, visible = false;
      if (s.u < 0.55) {
        visible = false;
      } else if (s.u < 0.85) {
        visible = true;
        const p1 = U.ss(0.55, 0.85, s.u);
        fx = U.lerp(startX, startX + 6, p1);
        fy = U.lerp(startY, startY - 18, p1);
        fr = p1 * 0.35;
      } else if (s.u < 1.35) {
        visible = true;
        const p2 = U.ss(0.85, 1.35, s.u);
        const arcH = 130;
        fx = U.lerp(startX + 6, endX, p2);
        fy = U.lerp(startY - 18, endY, p2) - Math.sin(p2 * Math.PI) * arcH;
        fr = 0.35 + p2 * 2.0;
      } else {
        visible = true;
        fx = endX;
        fy = endY;
        fr = 2.35;
      }
      if (visible) {
        const sx = fx - s.camX;
        const sy = fy;
        if (s.u >= 0.85 && s.u < 1.35) {
          c.fillStyle = 'rgba(255,255,255,0.62)';
          c.beginPath();
          c.arc(sx - 22, sy + 12, 12, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = 'rgba(255,255,255,0.32)';
          c.beginPath();
          c.arc(sx - 38, sy + 18, 8, 0, Math.PI * 2);
          c.fill();
        }
        c.save();
        c.translate(sx, sy);
        c.rotate(fr);
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fillRect(-55 + 10, -42 + 16, 110, 85);
        c.strokeStyle = 'rgba(255,255,255,0.95)';
        c.lineWidth = 4;
        U.rrect(c, -55, -42, 110, 85, 8);
        c.stroke();
        c.fillStyle = '#0e0e12';
        U.rrect(c, -55, -42, 110, 85, 8);
        c.fill();
        c.fillStyle = '#1e1e26';
        U.rrect(c, -52, -39, 104, 79, 6);
        c.fill();
        c.fillStyle = '#fff6d6';
        c.fillRect(-44, -26, 88, 32);
        c.fillStyle = '#ff3a3a';
        c.fillRect(-44, -26, 88, 9);
        c.fillStyle = '#c8d0d8';
        c.fillRect(-20, -42, 40, 22);
        c.fillStyle = '#e8eef4';
        c.fillRect(-20, -42, 40, 5);
        c.fillStyle = '#0a0a0e';
        c.fillRect(-10, -37, 20, 12);
        c.fillStyle = '#0a0a0e';
        c.fillRect(40, -40, 10, 14);
        c.restore();
      }

      // --- DISKS sign hero 200x90 ---
      const signSX = SIGN_X - s.camX;
      const signSY = SIGN_Y;
      const tick = s.u >= 1.35;
      const flash = s.u >= 1.35 && s.u < 1.75;
      const scale = flash ? 1.4 : 1.0;
      c.save();
      c.translate(signSX, signSY);
      c.scale(scale, scale);
      c.fillStyle = '#5a4a3a';
      c.fillRect(-5, -12, 10, 62);
      c.fillStyle = '#0e0e12';
      U.rrect(c, -100, -50, 200, 90, 10);
      c.fill();
      c.fillStyle = flash ? '#ffffff' : '#ffd86a';
      U.rrect(c, -70, -40, 140, 56, 6);
      c.fill();
      c.fillStyle = '#1a1a1e';
      c.font = '700 16px "Courier New", monospace';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillText('DISKS', 0, -16);
      c.fillStyle = '#0a0a0e';
      U.rrect(c, -52, -8, 104, 36, 5);
      c.fill();
      c.fillStyle = flash ? '#ffffff' : '#7affb0';
      c.shadowColor = flash ? 'rgba(255,255,255,0.95)' : 'rgba(120,255,170,0.9)';
      c.shadowBlur = 12;
      c.font = '700 32px "Courier New", monospace';
      c.fillText(tick ? '043' : '042', 0, 20);
      c.shadowBlur = 0;
      c.fillStyle = '#ff2a2a';
      c.beginPath();
      c.arc(84, -38, 5, 0, Math.PI * 2);
      c.fill();
      c.restore();

      if (s.u >= 1.35 && s.u < 1.95) {
        const p1 = U.ss(1.35, 1.95, s.u);
        const yOff = p1 * 40;
        const alpha = 1 - p1;
        c.save();
        c.globalAlpha = alpha;
        c.fillStyle = '#ffffff';
        c.font = '700 28px "Courier New", monospace';
        c.textAlign = 'center';
        c.textBaseline = 'alphabetic';
        c.fillText('+1', signSX, signSY - 62 - yOff);
        c.restore();
      }

      const grain = U.grain('pixel', 0.06, 0.12, true);
      c.save();
      c.globalAlpha = 0.10;
      U.tile(c, grain, U.step(s.now, 8) * 97 % 512, 0);
      c.restore();

      c.fillStyle = `rgba(255,255,255,${0.015 + 0.01 * Math.sin(s.now * 9)})`;
      c.fillRect(0, 0, 1920, 1080);
    },

    front(c, s) {
      c.save();
      c.globalAlpha = 0.08;
      for (let y = 0; y < 1080; y += 4) {
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fillRect(0, y, 1920, 2);
      }
      c.restore();
      c.strokeStyle = 'rgba(0,0,0,0.18)';
      c.lineWidth = 8;
      c.strokeRect(0, 0, 1920, 1080);
    }
  });
})();
