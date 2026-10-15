// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:33:16.353Z (revision)
(() => {
  const COPPER = '#B8733A';
  const GRAPHITE = '#2E3136';
  const AMBER = '#F2A93B';
  const FLOOR = 790;
  const BELT_Y = 780;
  const BELT_H = 80;

  // Pedestal positioned so PIVOT is at act.at+230, floor-200 (mitten height)
  // Lever arm 170px swings from up-left (toward Jolly) to down-right (away)
  const PIVOT_X = 1010; // act.at (780) + 230
  const PIVOT_Y = FLOOR - 200; // 590
  const PED_W = 160;
  const PED_H = 160;
  const PED_X = PIVOT_X - PED_W + 30; // 880 so pivot is on right side of pedestal
  const PED_Y = PIVOT_Y - 30; // 560
  const LEVER_LEN = 170;

  function leverHandlePos(u) {
    // up-left (-135deg) toward Jolly -> down-right (45deg) away from her
    const START = -2.356194490192345; // -135deg
    const END = 0.7853981633974483; // 45deg
    let t = 0;
    if (u >= 0) t = U.clamp(u / 0.75, 0, 1);
    const eased = U.easeIO(t);
    let ang = U.lerp(START, END, eased);
    if (u > 0.75) ang += Math.sin((u - 0.75) * 22) * 0.08 * Math.exp(-(u - 0.75) * 6);
    return { x: PIVOT_X + Math.cos(ang) * LEVER_LEN, y: PIVOT_Y + Math.sin(ang) * LEVER_LEN, ang };
  }

  function drawRack(c, ox, oy, w, h, depth, isForeground) {
    c.fillStyle = isForeground ? '#3a3e44' : '#2f333a';
    c.beginPath();
    c.moveTo(ox, oy);
    c.lineTo(ox + depth, oy - depth * 0.55);
    c.lineTo(ox + w + depth, oy - depth * 0.55);
    c.lineTo(ox + w, oy);
    c.closePath();
    c.fill();
    c.fillStyle = isForeground ? '#2E3136' : '#262a30';
    c.fillRect(ox, oy, w, h);
    c.fillStyle = isForeground ? '#25282d' : '#1e2126';
    c.beginPath();
    c.moveTo(ox + w, oy);
    c.lineTo(ox + w + depth, oy - depth * 0.55);
    c.lineTo(ox + w + depth, oy - depth * 0.55 + h);
    c.lineTo(ox + w, oy + h);
    c.closePath();
    c.fill();
    c.strokeStyle = isForeground ? COPPER : 'rgba(184,115,58,0.85)';
    c.lineWidth = isForeground ? 2.5 : 1.8;
    c.strokeRect(ox, oy, w, h);
    c.beginPath();
    c.moveTo(ox + w, oy);
    c.lineTo(ox + w + depth, oy - depth * 0.55);
    c.stroke();
    c.fillStyle = isForeground ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.3)';
    const slatH = isForeground ? 14 : 10;
    const gap = isForeground ? 32 : 24;
    for (let i = 0; i < (isForeground ? 4 : 3); i++) {
      const vy = oy + (isForeground ? 38 : 28) + i * gap;
      c.fillRect(ox + 12, vy, w - 24, slatH);
      c.fillStyle = 'rgba(255,255,255,0.06)';
      c.fillRect(ox + 12, vy + slatH, w - 24, 2);
      c.fillStyle = isForeground ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.3)';
    }
    c.fillStyle = isForeground ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)';
    c.fillRect(ox + 10, oy + h - 28, w - 20, 16);
    c.fillStyle = isForeground ? '#1a1d21' : '#1e2126';
    c.fillRect(ox + 14, oy + h - 24, w - 28, 8);
  }

  SCENE({
    id: 'datacenter',
    year: '2026',
    title: 'GPU clusters',
    floor: FLOOR,
    width: 1920,
    act: {
      at: 780,
      dur: 2.4,
      prompt: 'pull the lever',
      hotspot: { x: 815, y: 395, w: 150, h: 150 },
      facing: 1,
      path: u => {
        if (u < 0) return { dx: 0, dy: 0 };
        const ride = U.clamp((u - 1.05) / 1.0, 0, 1);
        const dx = 300 * U.easeSine(ride);
        const targetDy = -70;
        const settle = U.lerp(0, targetDy, U.ss(0.95, 1.35, u));
        const hopPhase = U.clamp((u - 0.95) / 0.45, 0, 1);
        const hop = Math.sin(hopPhase * Math.PI) * -38;
        return { dx, dy: settle + hop };
      },
      pose: u => {
        if (u < 0) return { armR: 0.12, armL: 0.12, elbowR: 0.2, elbowL: 0.2, crouch: 0, lean: 0, lookY: 0 };
        const ant = U.ss(0, 0.30, u);
        const pull = U.ss(0.30, 0.95, u);
        const hold = U.ss(0.95, 1.3, u);
        let crouch = U.lerp(0, 0.16, ant) * (1 - pull * 0.85);
        if (u > 0.9) crouch = U.lerp(crouch, 0.04, hold);
        let armR = U.lerp(0.12, 1.62, ant);
        armR = U.lerp(armR, 0.92, pull);
        armR = U.lerp(armR, 0.55, U.ss(1.0, 1.5, u));
        let elbowR = U.lerp(0.2, 0.55, ant);
        elbowR = U.lerp(elbowR, 1.05, pull);
        let lean = U.lerp(0, 0.20, ant) * (1 - pull * 0.4);
        lean = U.lerp(lean, -0.06, U.ss(1.0, 1.6, u));
        let lift = 0;
        if (u > 0.95 && u < 1.4) lift = Math.sin(U.clamp((u - 0.95) / 0.45, 0, 1) * Math.PI) * 0.09;
        let lookY = U.lerp(0, -0.20, ant);
        lookY = U.lerp(lookY, 0.12, pull);
        return { armR, armL: 0.18, elbowR, elbowL: 0.25, crouch, lean, lift, lookY };
      }
    },
    portals: {},
    characterStyle: { tint: '#F2A93B', tintAlpha: 0.12 },
    shadow: 'rgba(0,0,0,0.32)',
    music: { voice: 'pad', bpm: 96, root: 62 },
    sfx: [
      { u: 0.70, kind: 'thump' },
      { u: 0.95, kind: 'tick' },
      { u: 1.15, kind: 'tick' },
      { u: 1.35, kind: 'tick' },
      { u: 1.55, kind: 'tick' },
      { u: 1.85, kind: 'beep' }
    ],
    page: {
      heading: 'Thousands of chips, one thought',
      text: 'GPUs let computers learn from vast amounts of text and images at once, turning training into a factory line of tokens.'
    },
    spots: [
      { x: 1180, y: 285, w: 140, h: 140, label: 'Cable trays', text: 'Overhead trays carry power and fibre to every rack, like streets above the servers.' },
      { x: 210, y: 360, w: 150, h: 180, label: 'GPU rack', text: 'Each rack holds dozens of processors working in parallel to train large models.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha *= a;
      const bx = 1410, by = 48, bw = 470, bh = 78;
      c.fillStyle = '#2E3136';
      U.rrect(c, bx, by, bw, bh, 10); c.fill();
      c.strokeStyle = COPPER; c.lineWidth = 2.5; U.rrect(c, bx, by, bw, bh, 10); c.stroke();
      const pulse = 0.6 + 0.4 * Math.sin(s.now * 3.2);
      c.fillStyle = `rgba(242,169,59,${0.7 + 0.3 * pulse})`;
      c.beginPath(); c.arc(bx + 22, by + bh / 2, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = AMBER; c.beginPath(); c.arc(bx + 22, by + bh / 2, 3.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e8e0d4';
      c.font = '700 28px "Courier New", monospace';
      c.textAlign = 'right'; c.textBaseline = 'middle';
      c.fillText('2026  ·  GPU CLUSTERS', bx + bw - 18, by + bh / 2 + 1);
      c.fillStyle = COPPER; c.fillRect(bx + 44, by + bh - 3, bw - 62, 2);
      c.restore();
    },

    draw(c, s) {
      const bg = U.cached('datacenter_bg4', 1920, 1080, g => {
        let gr = g.createLinearGradient(0, 0, 0, 420);
        gr.addColorStop(0, '#1e2126'); gr.addColorStop(1, '#2a2e35');
        g.fillStyle = gr; g.fillRect(0, 0, 1920, 420);
        g.strokeStyle = 'rgba(184,115,58,0.14)'; g.lineWidth = 1;
        for (let y = 0; y < 380; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke(); }
        for (let x = 0; x < 1920; x += 140) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 380); g.stroke(); }
        g.fillStyle = 'rgba(242,169,59,0.10)';
        for (let x = 80; x < 1920; x += 220) { g.fillRect(x, 18, 120, 8); }
        g.fillStyle = '#3d4148'; g.fillRect(0, 88, 1920, 14); g.fillRect(0, 168, 1920, 14);
        g.fillStyle = '#2a2e35';
        for (let x = 40; x < 1920; x += 90) { g.fillRect(x, 88, 6, 14); g.fillRect(x, 168, 6, 14); }
        g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = 3;
        for (let i = 0; i < 10; i++) {
          const x = 120 + i * 175;
          g.beginPath(); g.moveTo(x, 102); g.quadraticCurveTo(x + 18, 145, x + 36, 102); g.stroke();
          g.beginPath(); g.moveTo(x + 50, 182); g.quadraticCurveTo(x + 62, 220, x + 78, 182); g.stroke();
        }
        g.fillStyle = '#262a30'; g.fillRect(0, 360, 1920, 110);
        g.fillStyle = 'rgba(184,115,58,0.25)'; g.fillRect(0, 360, 1920, 3);
        gr = g.createLinearGradient(0, 470, 0, 1080);
        gr.addColorStop(0, '#3a3e44'); gr.addColorStop(0.18, '#34373e'); gr.addColorStop(1, '#2b2e33');
        g.fillStyle = gr; g.fillRect(0, 470, 1920, 610);
        g.strokeStyle = 'rgba(184,115,58,0.07)'; g.lineWidth = 1;
        for (let y = 520; y < 1080; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y - 180); g.stroke(); }
        for (let x = 0; x < 1920; x += 48) {
          g.fillStyle = x % 96 === 0 ? 'rgba(242,169,59,0.18)' : 'rgba(0,0,0,0.0)';
          g.fillRect(x, 1066, 48, 14);
        }
        g.fillStyle = 'rgba(184,115,58,0.35)'; g.fillRect(0, 1064, 1920, 2);
      });
      c.drawImage(bg, 0, 0);

      // darker backdrop behind Jolly for silhouette (does not cover pedestal)
      c.fillStyle = 'rgba(18,20,24,0.52)';
      c.fillRect(520, 380, 300, 320);
      const pg = c.createLinearGradient(520, 0, 820, 0);
      pg.addColorStop(0, 'rgba(18,20,24,0)'); pg.addColorStop(0.22, 'rgba(18,20,24,0.52)'); pg.addColorStop(0.85, 'rgba(18,20,24,0.52)'); pg.addColorStop(1, 'rgba(18,20,24,0)');
      c.fillStyle = pg; c.fillRect(520, 380, 300, 320);

      // ---- RACKS ----
      const bgRow = { y: 368, x0: 80, count: 5, w: 122, h: 138, depth: 16 };
      const fgRow = { y: 470, x0: 60, count: 4, w: 182, h: 210, depth: 26 };

      for (let i = 0; i < bgRow.count; i++) {
        const ox = bgRow.x0 + i * 168;
        const oy = bgRow.y;
        drawRack(c, ox, oy, bgRow.w, bgRow.h, bgRow.depth, false);
        for (let li = 0; li < 3; li++) {
          const lx = ox + 16 + li * 32;
          const ly = oy + 10;
          const breath = 0.5 + 0.5 * Math.sin(s.now * 1.8 + i * 0.7 + li);
          c.fillStyle = `rgba(242,169,59,${0.18 * breath})`;
          c.beginPath(); c.arc(lx, ly, 3, 0, Math.PI * 2); c.fill();
        }
      }
      for (let i = 0; i < 3; i++) {
        const ox = 1180 + i * 168;
        const oy = bgRow.y + 18;
        drawRack(c, ox, oy, bgRow.w, bgRow.h, bgRow.depth, false);
        for (let li = 0; li < 3; li++) {
          const lx = ox + 16 + li * 32;
          const ly = oy + 10;
          const breath = 0.5 + 0.5 * Math.sin(s.now * 1.8 + i * 0.7 + li + 2);
          c.fillStyle = `rgba(242,169,59,${0.18 * breath})`;
          c.beginPath(); c.arc(lx, ly, 3, 0, Math.PI * 2); c.fill();
        }
      }

      const waveT = U.clamp((s.u - 0.35) / 0.9, 0, 1);
      const waveX = U.lerp(-200, 2100, U.easeOut(waveT));
      const waveWidth = 420;

      for (let i = 0; i < fgRow.count; i++) {
        const ox = fgRow.x0 + i * 228;
        const oy = fgRow.y;
        const w = fgRow.w, h = fgRow.h;
        const cx = ox + w / 2;
        const dist = Math.abs(cx - waveX);
        const waveBoost = Math.max(0, 1 - dist / waveWidth) * (s.u > 0.3 ? 1 : 0);
        drawRack(c, ox, oy, w, h, fgRow.depth, true);
        if (waveBoost > 0.02) {
          c.fillStyle = `rgba(242,169,59,${0.38 * waveBoost})`;
          c.fillRect(ox + 1, oy + 1, w - 2, h - 2);
          c.fillStyle = `rgba(242,169,59,${0.60 * waveBoost})`;
          c.fillRect(ox + w - 3, oy, 5, h);
          c.fillStyle = `rgba(255,230,150,${0.50 * waveBoost})`;
          c.fillRect(ox + w - 1, oy + 12, 2, h - 24);
          c.fillStyle = `rgba(255,220,120,${0.35 * waveBoost})`;
          c.fillRect(ox, oy - 2, w, 4);
        }
        c.fillStyle = '#e8e0d4';
        c.font = '700 12px "Courier New", monospace';
        c.textAlign = 'center';
        c.fillText('GPU-' + (i + 1), ox + w / 2, oy + h - 10);
        for (let li = 0; li < 3; li++) {
          const lx = ox + 28 + li * 52;
          const ly = oy + 14;
          const breath = 0.55 + 0.45 * Math.sin(s.now * 2.2 + i * 0.9 + li * 1.1);
          const intensity = U.clamp(breath * 0.65 + waveBoost * 0.95, 0, 1);
          const r = 5 + waveBoost * 7;
          c.fillStyle = `rgba(242,169,59,${0.24 * intensity + waveBoost * 0.20})`;
          c.beginPath(); c.arc(lx, ly, r + 7, 0, Math.PI * 2); c.fill();
          c.fillStyle = `rgba(255,${190 + 30 * intensity},${50},${0.98})`;
          c.beginPath(); c.arc(lx, ly, r, 0, Math.PI * 2); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.92)';
          c.beginPath(); c.arc(lx - 1.2, ly - 1.2, 1.5, 0, Math.PI * 2); c.fill();
        }
        const fx = ox + w - 28;
        const fy = oy + 58;
        const speed = s.u > 0.6 ? 16 : 6;
        const ang = s.now * speed + i * 1.2;
        c.save();
        c.translate(fx, fy);
        c.rotate(ang);
        c.strokeStyle = waveBoost > 0.3 ? 'rgba(242,169,59,0.85)' : 'rgba(200,200,200,0.65)';
        c.lineWidth = waveBoost > 0.3 ? 2.8 : 2.2;
        for (let b = 0; b < 3; b++) {
          c.rotate(Math.PI * 2 / 3);
          c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -14); c.stroke();
        }
        c.restore();
        c.fillStyle = '#1a1d21'; c.beginPath(); c.arc(fx, fy, 5, 0, Math.PI * 2); c.fill();
        c.strokeStyle = waveBoost > 0.25 ? `rgba(242,169,59,${0.45 * waveBoost})` : 'rgba(255,255,255,0.18)';
        c.lineWidth = waveBoost > 0.25 ? 2 : 1.2;
        c.beginPath(); c.arc(fx, fy, waveBoost > 0.25 ? 19 : 14, 0, Math.PI * 2); c.stroke();
      }

      if (s.u > 0.35) {
        const wash = Math.max(0, 1 - Math.abs(waveX - 960) / 900) * 0.14 * U.clamp((s.u - 0.35) / 0.35, 0, 1) * (1 - U.clamp((s.u - 1.6) / 0.6, 0, 1));
        if (wash > 0.001) {
          c.fillStyle = `rgba(242,169,59,${wash})`;
          c.fillRect(0, 360, 1920, 320);
        }
      }

      // ---- TOKEN CONVEYOR BELT (80px tall, readable) ----
      c.fillStyle = 'rgba(0,0,0,0.30)';
      c.fillRect(0, BELT_Y + BELT_H, 1920, 14);
      c.fillStyle = '#1a1e23';
      U.rrect(c, -8, BELT_Y, 1936, BELT_H, 12); c.fill();
      c.fillStyle = '#252a31';
      U.rrect(c, 0, BELT_Y + 6, 1920, BELT_H - 12, 10); c.fill();
      c.strokeStyle = COPPER; c.lineWidth = 3; U.rrect(c, -8, BELT_Y, 1936, BELT_H, 12); c.stroke();
      c.strokeStyle = 'rgba(184,115,58,0.38)'; c.lineWidth = 1; U.rrect(c, 2, BELT_Y + 8, 1916, BELT_H - 16, 8); c.stroke();

      const beltSpeed = s.u > 0.6 ? U.lerp(90, 280, U.ss(0.6, 1.4, s.u)) : 90;
      const beltOff = (s.now * beltSpeed) % 160;
      c.strokeStyle = 'rgba(184,115,58,0.20)'; c.lineWidth = 2;
      for (let x = -160 + (beltOff % 160); x < 1920; x += 80) {
        c.beginPath(); c.moveTo(x, BELT_Y + 16); c.lineTo(x + 36, BELT_Y + 16); c.stroke();
        c.beginPath(); c.moveTo(x + 12, BELT_Y + BELT_H - 16); c.lineTo(x + 48, BELT_Y + BELT_H - 16); c.stroke();
      }
      const tokenCount = 9;
      const tileW = 78, tileH = 36;
      const labels = ['TOK', '0110', 'TOK', '1011', 'TOK', '0101', 'TOK', '1100', 'TOK'];
      for (let i = 0; i < tokenCount; i++) {
        let tx = (i * 210 - beltOff * 1.35) % 1920;
        if (tx < -100) tx += 1920;
        if (tx > 1920) continue;
        const ty = BELT_Y + (BELT_H - tileH) / 2;
        const isAmber = i % 2 === 0;
        // motion streak when fast
        if (s.u > 0.9) {
          c.fillStyle = `rgba(242,169,59,${0.12 * U.clamp((s.u - 0.9) / 0.5, 0, 1)})`;
          U.rrect(c, tx - 18, ty + 8, tileW + 12, 6, 3); c.fill();
        }
        c.fillStyle = 'rgba(0,0,0,0.22)';
        U.rrect(c, tx + 2, ty + 4, tileW, tileH, 6); c.fill();
        c.fillStyle = isAmber ? AMBER : '#e8e0d4';
        U.rrect(c, tx, ty, tileW, tileH, 6); c.fill();
        c.strokeStyle = isAmber ? '#a66a1a' : '#b8a99a'; c.lineWidth = 1.4; U.rrect(c, tx, ty, tileW, tileH, 6); c.stroke();
        c.fillStyle = '#2E3136';
        c.font = '800 14px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(labels[i % labels.length], tx + tileW / 2, ty + tileH / 2 + 1);
        if (!isAmber) {
          c.fillStyle = AMBER; c.beginPath(); c.arc(tx + tileW - 10, ty + 10, 4, 0, Math.PI * 2); c.fill();
        }
      }
      c.fillStyle = '#3a3e44';
      c.beginPath(); c.arc(20, BELT_Y + BELT_H / 2, 24, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(1900, BELT_Y + BELT_H / 2, 24, 0, Math.PI * 2); c.fill();
      c.strokeStyle = COPPER; c.lineWidth = 2.8;
      c.beginPath(); c.arc(20, BELT_Y + BELT_H / 2, 24, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(1900, BELT_Y + BELT_H / 2, 24, 0, Math.PI * 2); c.stroke();
      const spin = s.now * (s.u > 0.6 ? 14 : 5);
      [20, 1900].forEach(rx => {
        c.save(); c.translate(rx, BELT_Y + BELT_H / 2); c.rotate(spin);
        c.strokeStyle = 'rgba(242,169,59,0.95)'; c.lineWidth = 2.8; c.beginPath(); c.moveTo(0, -13); c.lineTo(0, 13); c.stroke();
        c.beginPath(); c.moveTo(-13, 0); c.lineTo(13, 0); c.stroke(); c.restore();
        c.fillStyle = '#1a1d21'; c.beginPath(); c.arc(rx, BELT_Y + BELT_H / 2, 6, 0, Math.PI * 2); c.fill();
      });

      // ---- PEDESTAL + LEVER (pivot at act.at+230, floor-200) ----
      c.fillStyle = 'rgba(0,0,0,0.26)';
      c.beginPath(); c.ellipse(PED_X + PED_W / 2, BELT_Y + 6, 72, 14, 0, 0, Math.PI * 2); c.fill();
      let pedScale = 1;
      if (s.u > 0.68 && s.u < 0.85) {
        const p = U.clamp((s.u - 0.68) / 0.17, 0, 1);
        pedScale = 1 + Math.sin(p * Math.PI) * 0.06;
      }
      c.save();
      c.translate(PED_X + PED_W / 2, PED_Y + PED_H);
      c.scale(pedScale, pedScale);
      c.translate(-(PED_X + PED_W / 2), -(PED_Y + PED_H));
      const pd = 18;
      c.fillStyle = '#4a4e56';
      c.beginPath();
      c.moveTo(PED_X, PED_Y + PED_H - 42);
      c.lineTo(PED_X + pd, PED_Y + PED_H - 42 - pd * 0.55);
      c.lineTo(PED_X + PED_W + pd, PED_Y + PED_H - 42 - pd * 0.55);
      c.lineTo(PED_X + PED_W, PED_Y + PED_H - 42);
      c.closePath(); c.fill();
      c.strokeStyle = COPPER; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#2E3136';
      c.fillRect(PED_X, PED_Y + PED_H - 42, PED_W, 42);
      c.strokeStyle = COPPER; c.lineWidth = 2; c.strokeRect(PED_X, PED_Y + PED_H - 42, PED_W, 42);
      c.fillStyle = '#25282d';
      c.beginPath();
      c.moveTo(PED_X + PED_W, PED_Y + PED_H - 42);
      c.lineTo(PED_X + PED_W + pd, PED_Y + PED_H - 42 - pd * 0.55);
      c.lineTo(PED_X + PED_W + pd, PED_Y + PED_H - pd * 0.55);
      c.lineTo(PED_X + PED_W, PED_Y + PED_H);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(184,115,58,0.6)'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#3a3e44';
      c.fillRect(PED_X + 46, PED_Y + 34, 48, PED_H - 76);
      c.fillStyle = COPPER; c.fillRect(PED_X + 46, PED_Y + 34, 48, 5);
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(PED_X + 46, PED_Y + 34 + 5, 48, 8);
      // high-contrast amber label bar with cream text
      c.fillStyle = AMBER;
      U.rrect(c, PED_X + 8, PED_Y + PED_H - 34, PED_W - 16, 26, 6); c.fill();
      c.strokeStyle = '#1a1d21'; c.lineWidth = 1.4; U.rrect(c, PED_X + 8, PED_Y + PED_H - 34, PED_W - 16, 26, 6); c.stroke();
      c.fillStyle = '#fff8e6';
      c.font = '900 19px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('TOKENS', PED_X + PED_W / 2, PED_Y + PED_H - 21);
      const indPulse = 0.5 + 0.5 * Math.sin(s.now * 3.5);
      const indBoost = s.u > 0.6 ? 1 : indPulse;
      c.fillStyle = `rgba(242,169,59,${0.45 + 0.35 * indBoost})`;
      c.beginPath(); c.arc(PED_X + PED_W / 2, PED_Y + 18, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = AMBER; c.beginPath(); c.arc(PED_X + PED_W / 2, PED_Y + 18, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(PED_X + PED_W / 2 - 1, PED_Y + 16, 1.5, 0, Math.PI * 2); c.fill();
      c.restore();

      // lever arc guide (up-left to down-right)
      c.save();
      c.strokeStyle = COPPER; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.arc(PIVOT_X, PIVOT_Y, 52, -2.356, 0.785); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 8; c.globalAlpha = 0.35;
      c.beginPath(); c.arc(PIVOT_X, PIVOT_Y, 52, -2.356, 0.785); c.stroke();
      c.globalAlpha = 1;
      c.restore();

      const hp = leverHandlePos(s.u);
      c.save();
      c.translate(PIVOT_X, PIVOT_Y);
      c.rotate(hp.ang);
      let lg = c.createLinearGradient(0, -10, 0, 10);
      lg.addColorStop(0, '#e8a04a'); lg.addColorStop(0.5, COPPER); lg.addColorStop(1, '#7a3f12');
      c.fillStyle = lg;
      c.beginPath(); c.roundRect(0, -10, LEVER_LEN, 20, 7); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(0, 5, LEVER_LEN, 6);
      const hx = LEVER_LEN, hy = 0;
      c.fillStyle = '#1a1d21';
      c.beginPath(); c.arc(hx, hy, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = AMBER;
      c.beginPath(); c.arc(hx, hy, 20, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#1a1d21'; c.lineWidth = 2.2; c.beginPath(); c.arc(hx, hy, 20, 0, Math.PI * 2); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.96)';
      c.beginPath(); c.arc(hx - 6, hy - 6, 5.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.38)';
      c.beginPath(); c.arc(hx - 2.5, hy - 2.5, 2.2, 0, Math.PI * 2); c.fill();
      if (s.u < 0) {
        const hint = 0.6 + 0.4 * Math.sin(s.now * 2.8);
        c.strokeStyle = `rgba(242,169,59,${0.32 + 0.18 * hint})`;
        c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, 28 + 4 * hint, 0, Math.PI * 2); c.stroke();
        c.fillStyle = `rgba(242,169,59,${0.10 * hint})`;
        c.beginPath(); c.arc(hx, hy, 32 + 4 * hint, 0, Math.PI * 2); c.fill();
      }
      c.restore();
      c.fillStyle = '#6a6e76'; c.beginPath(); c.arc(PIVOT_X, PIVOT_Y, 14, 0, Math.PI * 2); c.fill();
      c.strokeStyle = COPPER; c.lineWidth = 1.8; c.beginPath(); c.arc(PIVOT_X, PIVOT_Y, 14, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#2E3136'; c.beginPath(); c.arc(PIVOT_X, PIVOT_Y, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(PIVOT_X - 2, PIVOT_Y - 2, 2.4, 0, Math.PI * 2); c.fill();

      c.save(); c.globalAlpha = 0.05;
      U.tile(c, U.grain('datacenter4'), U.step(s.now, 8) * 97 % 512, 0);
      c.restore();
    },

    front(c, s) {
      // Laptop pull-frame: thick bezel visible from frame 1
      c.save();
      // outer laptop bezel 22px near-black
      c.strokeStyle = '#121212';
      c.lineWidth = 22;
      U.rrect(c, 11, 11, 1898, 1058, 18); c.stroke();
      // inner highlight 2px white 7%
      c.strokeStyle = 'rgba(255,255,255,0.07)';
      c.lineWidth = 2;
      U.rrect(c, 22, 22, 1876, 1036, 14); c.stroke();
      // top glass reflection
      const rg = c.createLinearGradient(0, 11, 0, 160);
      rg.addColorStop(0, 'rgba(255,255,255,0.11)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.roundRect(11, 11, 1898, 130, [18, 18, 0, 0]); c.fill();
      // desk / keyboard hint at bottom 40px
      c.fillStyle = 'rgba(18,20,24,0.92)';
      c.fillRect(11, 1028, 1898, 40);
      c.fillStyle = 'rgba(255,255,255,0.06)';
      for (let x = 420; x < 1500; x += 56) {
        c.fillRect(x, 1036, 40, 14);
        c.fillRect(x + 2, 1052, 40, 6);
      }
      c.fillStyle = 'rgba(255,255,255,0.04)';
      c.fillRect(760, 1040, 400, 2);
      // centered amber power LED
      const pPulse = 0.6 + 0.4 * Math.sin(s.now * 2.4);
      c.fillStyle = `rgba(242,169,59,${0.35 + 0.25 * pPulse})`;
      c.beginPath(); c.arc(960, 1054, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = AMBER; c.beginPath(); c.arc(960, 1054, 4.5, 0, Math.PI * 2); c.fill();
      // hinge line
      c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(11, 1028); c.lineTo(1909, 1028); c.stroke();
      c.restore();

      const vig = U.cached('datacenter_vig4', 1920, 1080, g => {
        const gr = g.createRadialGradient(960, 540, 620, 960, 540, 1300);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.22)');
        g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
      });
      c.drawImage(vig, 0, 0);
      if (s.u > 1.0) {
        c.fillStyle = `rgba(242,169,59,${0.08 * U.ss(1.0, 1.3, s.u)})`;
        c.fillRect(0, BELT_Y + BELT_H - 2, 1920, 4);
      }
    }
  });
})();
