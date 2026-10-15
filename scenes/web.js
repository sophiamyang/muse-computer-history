// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:37:08.194Z (revision)
(() => {
  const FLOOR = 860;
  const ACT_AT = 760;
  const DX = 1150, DY = 388, DW = 520, DH = 360;
  const BW = 220, BH = 64;
  const BX = 1190, BY = 600;
  const PX = DX + 30, PY = DY + 110, PW = 460, PH = 56;

  function bevelBtn(c, x, y, w, h, pressed, bright) {
    c.save();
    if (bright) {
      c.fillStyle = pressed ? '#0033aa' : '#0055FF';
      U.rrect(c, x, y, w, h, 6); c.fill();
      if (pressed) {
        c.fillStyle = 'rgba(0,0,0,0.35)';
        U.rrect(c, x, y, w, h, 6); c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 2;
        U.rrect(c, x + 1, y + 1, w - 2, h - 2, 6); c.stroke();
      } else {
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x + 2, y + h - 2); c.lineTo(x + 2, y + 2); c.lineTo(x + w - 2, y + 2); c.stroke();
        c.strokeStyle = 'rgba(0,0,0,0.35)';
        c.beginPath(); c.moveTo(x + w - 2, y + 2); c.lineTo(x + w - 2, y + h - 2); c.lineTo(x + 2, y + h - 2); c.stroke();
      }
    } else {
      c.fillStyle = pressed ? '#a8a8a8' : '#c0c0c0';
      U.rrect(c, x, y, w, h, 6); c.fill();
      c.strokeStyle = pressed ? '#808080' : '#ffffff'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x + 2, y + h - 2); c.lineTo(x + 2, y + 2); c.lineTo(x + w - 2, y + 2); c.stroke();
      c.strokeStyle = pressed ? '#ffffff' : '#404040';
      c.beginPath(); c.moveTo(x + w - 2, y + 2); c.lineTo(x + w - 2, y + h - 2); c.lineTo(x + 2, y + h - 2); c.stroke();
    }
    c.restore();
  }

  function drawGlobe(c, cx, cy, r, t, alpha) {
    const step = U.step(t, 8);
    const rot = step * 1.8;
    c.save();
    c.globalAlpha *= alpha;
    c.fillStyle = '#000033';
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#00ff99'; c.lineWidth = 1.4;
    for (let lat = -60; lat <= 60; lat += 30) {
      const yo = r * Math.sin(lat * Math.PI / 180);
      c.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.08) {
        const x = cx + Math.cos(a + rot) * r * 0.92;
        const y = cy + yo;
        if (a === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }
    for (let m = 0; m < 6; m++) {
      const base = (m / 6) * Math.PI + rot;
      c.beginPath();
      for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 0.06) {
        const x = Math.cos(a) * Math.cos(base) * r * 0.92;
        const y = Math.sin(a) * r * 0.92;
        const px = cx + x, py = cy + y;
        if (a === -Math.PI / 2) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
    }
    c.strokeStyle = '#00ff99'; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    c.restore();
  }

  SCENE({
    id: 'web',
    year: '1996',
    title: 'The web',
    floor: FLOOR,
    width: 1920,
    act: {
      at: ACT_AT,
      dur: 2.4,
      prompt: 'press Connect',
      hotspot: { x: BX, y: BY - 28, w: 220, h: 120 },
      path: u => {
        if (u < 0) return { dx: 0, dy: 0 };
        const hop = U.ss(1.65, 2.2, u);
        const dx = hop * 140;
        return { dx, dy: 0 };
      },
      pose: u => {
        if (u < 0) return { armR: 0.12, armL: 0.12, crouch: 0, lift: 0, lean: 0, lookY: 0 };
        const pressIn = U.ss(0.15, 0.42, u);
        let armR = U.lerp(0.12, 1.7, pressIn);
        if (u >= 0.42 && u < 0.62) armR = 1.7;
        if (u >= 0.62) armR = U.lerp(1.7, 0.35, U.ss(0.62, 1.0, u));
        if (u > 1.6) armR = U.lerp(0.35, 1.05, U.ss(1.6, 1.9, u));
        const crouch = (u > 0.2 && u < 0.5 ? 0.08 * U.ss(0.2, 0.35, u) * (1 - U.ss(0.35, 0.5, u)) : 0) + (u > 1.55 ? 0.14 * U.ss(1.55, 1.75, u) * (1 - U.ss(1.95, 2.15, u)) : 0);
        const lift = u > 1.65 ? Math.sin(U.ss(1.65, 2.3, u) * Math.PI) * 0.27 : 0;
        const lean = U.lerp(0, 0.18, pressIn) * (1 - U.ss(0.62, 0.95, u));
        const lookY = U.lerp(0, -0.35, U.ss(0, 0.4, u)) + (u > 1.9 ? U.lerp(0, -0.1, U.ss(1.9, 2.2, u)) : 0);
        return { armR, armL: 0.12, elbowR: 0.18, crouch, lift, lean, lookY };
      },
      facing: 1,
    },
    portals: {},
    characterStyle: { tint: '#d8d8ff', tintAlpha: 0.12 },
    shadow: 'rgba(0,0,0,0.28)',
    music: { voice: 'organ', bpm: 96, root: 62 },
    sfx: [
      { u: 0.42, kind: 'click' },
      { u: 0.95, kind: 'beep' },
      { u: 1.25, kind: 'beep' },
      { u: 1.92, kind: 'pop' },
    ],
    page: {
      heading: 'Welcome to the Web',
      text: 'Home pages turned the internet into neighbourhoods — anyone could build a corner, link it up, and invite the world in.'
    },
    spots: [
      { x: 1480, y: 260, w: 180, h: 180, label: 'Spinning globe', text: 'Every 90s home page had a spinning globe. It meant: you are now worldwide.' },
      { x: 900, y: 285, w: 180, h: 110, label: 'Visitor counter', text: 'Hit counters made every visit count, literally. Somebody had to be visitor number one.' }
    ],
    badge(c, s, a) {
      c.save();
      c.globalAlpha = a;
      const x = 1280, y = 48, w = 640, h = 88;
      c.fillStyle = '#c0c0c0';
      U.rrect(c, x, y, w, h, 6); c.fill();
      c.strokeStyle = '#ffffff'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x + 4, y + h - 4); c.lineTo(x + 4, y + 4); c.lineTo(x + w - 4, y + 4); c.stroke();
      c.strokeStyle = '#808080';
      c.beginPath(); c.moveTo(x + w - 4, y + 4); c.lineTo(x + w - 4, y + h - 4); c.lineTo(x + 4, y + h - 4); c.stroke();
      c.fillStyle = '#000080';
      c.fillRect(x + 8, y + 8, w - 16, 30);
      U.text(c, '1996  \u00B7  The web', x + 16, y + 26, { font: '700 20px "Courier New", monospace', color: '#ffffff', align: 'left', base: 'middle' });
      U.text(c, 'MY_HOME.HTML', x + 16, y + 62, { font: '700 15px "Courier New", monospace', color: '#000000', align: 'left', base: 'middle' });
      for (let i = 0; i < 2; i++) {
        const bx = x + w - 32 - i * 26, by = y + 12;
        c.fillStyle = '#c0c0c0'; U.rrect(c, bx, by, 20, 18, 2); c.fill();
        c.strokeStyle = '#404040'; c.lineWidth = 1; U.rrect(c, bx, by, 20, 18, 2); c.stroke();
        U.text(c, i === 0 ? '\u00D7' : '\u2013', bx + 10, by + 11, { font: '700 13px sans-serif', color: '#000', align: 'center', base: 'middle' });
      }
      c.restore();
    },

    draw(c, s) {
      const bg = U.cached('web_bg5', 1920, 1080, g => {
        g.fillStyle = '#c0c0c0';
        g.fillRect(0, 0, 1920, 1080);
        g.fillStyle = 'rgba(0,0,0,0.05)';
        for (let y = 0; y < 1080; y += 4) for (let x = 0; x < 1920; x += 4) if ((x + y) % 8 === 0) g.fillRect(x, y, 1, 1);
        g.fillStyle = '#000080'; g.fillRect(0, 0, 1920, 28);
        g.fillStyle = '#ffffff'; g.font = '700 14px "Courier New", monospace'; g.textAlign = 'left'; g.textBaseline = 'middle';
        g.fillText('  \u25C9  Web Navigator \u2014 [Jolly\u2019s Home Page]', 10, 14);
        g.fillStyle = '#c0c0c0'; g.fillRect(0, 28, 1920, 42);
        g.fillStyle = '#ffffff'; U.rrect(g, 12, 34, 420, 28, 2); g.fill();
        g.strokeStyle = '#808080'; g.lineWidth = 1; U.rrect(g, 12, 34, 420, 28, 2); g.stroke();
        g.fillStyle = '#000'; g.font = '12px "Courier New", monospace'; g.fillText('http://www.myhomepage.net/~jolly/', 20, 50);
        ['Back', 'Home'].forEach((lb, i) => {
          const bx = 480 + i * 110;
          g.fillStyle = '#c0c0c0'; U.rrect(g, bx, 34, 96, 28, 3); g.fill();
          g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx + 2, 60); g.lineTo(bx + 2, 36); g.lineTo(bx + 94, 36); g.stroke();
          g.strokeStyle = '#404040'; g.beginPath(); g.moveTo(bx + 94, 36); g.lineTo(bx + 94, 60); g.lineTo(bx + 2, 60); g.stroke();
          g.fillStyle = '#000'; g.font = '700 12px sans-serif'; g.textAlign = 'center'; g.fillText(lb, bx + 48, 50);
        });
        g.fillStyle = '#c0c0c0'; g.fillRect(14, 86, 220, 760);
        g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(14, 846); g.lineTo(14, 86); g.lineTo(234, 86); g.stroke();
        g.strokeStyle = '#808080'; g.beginPath(); g.moveTo(234, 86); g.lineTo(234, 846); g.lineTo(14, 846); g.stroke();
        ['MY LINKS', 'GUESTBOOK', 'MY PETS', 'COOL GIFS'].forEach((t, i) => {
          const by = 110 + i * 54;
          g.fillStyle = '#c0c0c0'; U.rrect(g, 30, by, 188, 36, 4); g.fill();
          g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(32, by + 34); g.lineTo(32, by + 2); g.lineTo(216, by + 2); g.stroke();
          g.strokeStyle = '#404040'; g.beginPath(); g.moveTo(216, by + 2); g.lineTo(216, by + 34); g.lineTo(32, by + 34); g.stroke();
          g.fillStyle = '#000080'; g.font = '700 13px sans-serif'; g.textAlign = 'center'; g.fillText(t, 124, by + 22);
        });
        g.fillStyle = '#0000ff'; g.font = '14px "Times New Roman", serif'; g.textAlign = 'left';
        ['\u2605 My favourite links', '\u2605 Sign my guestbook!', '\u2605 Free midi files'].forEach((t, i) => {
          const ly = 360 + i * 26; g.fillText(t, 30, ly); g.fillRect(30, ly + 3, g.measureText(t).width, 1);
        });
        g.fillStyle = '#808080'; g.fillRect(260, 710, 1180, 2);
        g.fillStyle = '#ffffff'; g.fillRect(260, 712, 1180, 2);
        g.save(); g.translate(260, 730); g.scale(0.8, 0.8);
        const uw = 420, uh = 44;
        g.fillStyle = '#ffff00'; g.fillRect(0, 0, uw, uh);
        g.fillStyle = '#000'; for (let x = 0; x < uw; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 12, uh); g.lineTo(x + 20, uh); g.lineTo(x + 8, 0); g.closePath(); g.fill(); }
        g.fillStyle = '#ffff00'; g.fillRect(60, 8, uw - 120, uh - 16);
        g.fillStyle = '#000'; g.font = '700 14px sans-serif'; g.textAlign = 'center'; g.fillText('\u26A0  UNDER CONSTRUCTION  \u26A0', uw / 2, 26);
        g.restore();
        g.fillStyle = '#c0c0c0'; g.fillRect(0, 1020, 1920, 60);
        g.fillStyle = '#ffffff'; g.fillRect(0, 1020, 1920, 2);
        const jx = ACT_AT + 95;
        const grad = g.createRadialGradient(jx, FLOOR - 160, 40, jx, FLOOR - 160, 380);
        grad.addColorStop(0, 'rgba(0,0,90,0.26)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad; g.beginPath(); g.arc(jx, FLOOR - 140, 360, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(0,0,90,0.13)'; g.fillRect(jx - 200, 300, 400, 560);
      });
      c.drawImage(bg, 0, 0);

      c.save();
      c.globalAlpha = 0.38;
      const mqY = 86, mqH = 28;
      c.fillStyle = '#000080'; c.fillRect(250, mqY, 1190, mqH);
      c.fillStyle = '#808080'; c.fillRect(250, mqY, 1190, 2);
      c.fillStyle = '#ffffff'; c.fillRect(250, mqY + mqH - 2, 1190, 2);
      c.beginPath(); c.rect(252, mqY, 1186, mqH); c.clip();
      const marqueeText = '  \u2605  Welcome to my home page!  \u2605  Thanks for visiting!  \u2605  Last updated: 12 Aug 1996  \u2605  Welcome to my home page!  \u2605  ';
      c.font = '700 16px "Courier New", monospace';
      const tw = c.measureText(marqueeText).width;
      const off = (s.now * 90) % tw;
      c.fillStyle = '#ffff00'; c.textAlign = 'left'; c.textBaseline = 'middle';
      for (let x = -off; x < 1186 + tw; x += tw) c.fillText(marqueeText, 252 + x, mqY + mqH / 2 + 1);
      c.restore();

      c.save();
      c.globalAlpha = 0.38;
      c.textAlign = 'center';
      c.fillStyle = '#0000ff'; c.font = '700 42px "Times New Roman", serif'; c.fillText("Jolly's Home Page", 860, 190);
      c.fillStyle = '#ff00ff'; c.font = 'italic 18px "Times New Roman", serif'; c.fillText('~ welcome to my corner of the cyberspace ~', 860, 218);
      c.restore();

      drawGlobe(c, 1580, 360, 62, s.now, 0.38);
      c.save(); c.globalAlpha = 0.38;
      c.fillStyle = '#000080'; c.font = '700 11px sans-serif'; c.textAlign = 'center'; c.fillText('AROUND THE WORLD', 1580, 440);
      c.restore();

      c.save();
      const spot = c.createRadialGradient(DX + DW / 2, DY + 120, 40, DX + DW / 2, DY + 120, 520);
      spot.addColorStop(0, 'rgba(0,0,90,0.22)'); spot.addColorStop(1, 'rgba(0,0,90,0)');
      c.fillStyle = spot;
      c.beginPath(); c.ellipse(DX + DW / 2, FLOOR - 40, 420, 320, 0, 0, Math.PI * 2); c.fill();
      c.restore();

      const push = U.clamp(U.ss(1.85, 2.2, s.u), 0, 1) * 0.04;
      if (push > 0) {
        c.save();
        c.translate(DX + DW / 2, DY + DH / 2);
        c.scale(1 + push, 1 + push);
        c.translate(-(DX + DW / 2), -(DY + DH / 2));
      }

      const ccx = 800, ccy = 275;
      c.save();
      c.fillStyle = '#000000'; U.rrect(c, ccx, ccy, 340, 88, 6); c.fill();
      c.fillStyle = '#222'; U.rrect(c, ccx + 6, ccy + 6, 328, 76, 4); c.fill();
      const baseCount = 12540;
      let add = 0;
      if (s.u > 0.6) { const p = U.clamp(U.ss(0.6, 1.6, s.u), 0, 1); add = Math.floor(p * 7); }
      const countStr = String(baseCount + Math.max(0, add)).padStart(6, '0');
      const prevAdd = s.u > 0.6 ? Math.floor(U.clamp(U.ss(0.6, 1.6, s.u - 0.02), 0, 1) * 7) : 0;
      for (let i = 0; i < 6; i++) {
        const dx2 = ccx + 18 + i * 52;
        const digitChanged = add !== prevAdd && i >= 6 - String(add).length && add > 0;
        const scale = digitChanged ? 1.25 : 1;
        c.save();
        c.translate(dx2 + 20, ccy + 30);
        c.scale(scale, scale);
        c.fillStyle = '#111'; U.rrect(c, -20, -22, 42, 56, 3); c.fill();
        if (digitChanged) { c.fillStyle = 'rgba(0,255,120,0.42)'; U.rrect(c, -20, -22, 42, 56, 3); c.fill(); }
        c.fillStyle = '#00FF66'; c.font = '700 42px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(countStr[i], 0, 2);
        c.restore();
      }
      c.fillStyle = '#c0c0c0'; c.font = '700 14px sans-serif'; c.textAlign = 'center'; c.fillText('VISITORS SINCE 1995', ccx + 170, ccy + 96);
      c.restore();

      const enterLit = U.clamp(U.ss(1.85, 2.1, s.u), 0, 1);
      const enterX = 830, enterY = 900;
      c.save();
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = 'rgba(0,0,0,0.10)'; c.beginPath(); c.ellipse(enterX, enterY + 22, 240, 14, 0, 0, Math.PI * 2); c.fill();
      c.save();
      c.translate(enterX, enterY);
      c.scale(1, 0.85);
      if (enterLit > 0.01) {
        c.shadowColor = 'rgba(255,120,0,0.95)'; c.shadowBlur = 24 * enterLit;
        c.fillStyle = 'rgba(255,' + Math.round(102 + 80 * enterLit) + ',0,1)';
      } else c.fillStyle = '#0000FF';
      c.font = '900 130px "Times New Roman", serif';
      c.fillText('ENTER', 0, 0);
      c.shadowBlur = 0;
      c.restore();
      c.fillStyle = enterLit > 0.5 ? '#FF6600' : '#0000FF';
      if (enterLit > 0.3) {
        c.fillRect(enterX - 260, enterY + 42, 520, 5);
        if (enterLit > 0.6 && Math.floor(s.now * 6) % 2 === 0) {
          c.fillStyle = '#FF6600'; c.globalAlpha = 0.9; c.fillRect(enterX - 266, enterY - 48, 532, 6); c.fillRect(enterX - 266, enterY + 48, 532, 6);
        }
      } else {
        c.fillStyle = '#0000FF'; c.fillRect(enterX - 260, enterY + 42, 520, 4);
      }
      c.restore();

      c.save();
      const jx = s.hero.x;
      c.fillStyle = 'rgba(0,0,0,0.22)';
      c.beginPath(); c.ellipse(jx, FLOOR + 6, 110, 18, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 2; c.beginPath(); c.ellipse(jx, FLOOR + 6, 112, 19, 0, 0, Math.PI * 2); c.stroke();
      c.restore();

      c.save();
      c.fillStyle = 'rgba(0,0,0,0.22)';
      c.beginPath(); U.rrect(c, DX + 8, DY + 8, DW, DH, 8); c.fill();
      c.fillStyle = '#c0c0c0'; U.rrect(c, DX, DY, DW, DH, 8); c.fill();
      const grad = c.createLinearGradient(DX, DY, DX, DY + 32);
      grad.addColorStop(0, '#000080'); grad.addColorStop(1, '#0000cc');
      c.fillStyle = grad; U.rrect(c, DX + 4, DY + 4, DW - 8, 32, 4); c.fill();
      c.fillStyle = '#ffffff'; c.font = '700 15px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('  \u260E  Connect to the Web', DX + 12, DY + 20);
      for (let i = 0; i < 2; i++) {
        const bxx = DX + DW - 30 - i * 26, byy = DY + 10;
        c.fillStyle = '#c0c0c0'; U.rrect(c, bxx, byy, 20, 18, 2); c.fill();
        c.strokeStyle = '#404040'; c.lineWidth = 1; U.rrect(c, bxx, byy, 20, 18, 2); c.stroke();
        c.fillStyle = '#000'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText(i === 0 ? '\u00D7' : '\u2013', bxx + 10, byy + 11);
      }
      c.fillStyle = '#000'; c.font = '14px sans-serif'; c.textAlign = 'left';
      c.fillText('Dialing... 56k modem', DX + 18, DY + 58);
      c.fillText('Username:  jolly@homepage.net', DX + 18, DY + 80);
      c.fillStyle = '#ffffff'; U.rrect(c, PX, PY, PW, PH, 4); c.fill();
      c.strokeStyle = '#404040'; c.lineWidth = 2; U.rrect(c, PX, PY, PW, PH, 4); c.stroke();
      c.strokeStyle = '#808080'; c.lineWidth = 1; U.rrect(c, PX + 2, PY + 2, PW - 4, PH - 4, 3); c.stroke();
      const prog = U.clamp(U.ss(0.5, 1.85, s.u), 0, 1);
      if (prog > 0) {
        c.save(); U.rrect(c, PX + 3, PY + 3, (PW - 6) * prog, PH - 6, 3); c.clip();
        const pg = c.createLinearGradient(PX, PY, PX + PW, PY);
        pg.addColorStop(0, '#000080'); pg.addColorStop(1, '#0055FF');
        c.fillStyle = pg; c.fillRect(PX + 3, PY + 3, PW - 6, PH - 6);
        c.fillStyle = 'rgba(255,255,255,0.28)';
        const stripeOff = (s.now * 140) % 24;
        for (let x = PX - 24 + stripeOff; x < PX + PW; x += 24) {
          c.beginPath(); c.moveTo(x, PY + 3); c.lineTo(x + 12, PY + 3); c.lineTo(x + 6, PY + PH - 3); c.lineTo(x - 6, PY + PH - 3); c.closePath(); c.fill();
        }
        c.restore();
      }
      c.fillStyle = '#000'; c.font = '700 28px "Courier New", monospace'; c.textAlign = 'right'; c.textBaseline = 'middle';
      c.fillText(Math.round(prog * 100) + '%', PX + PW - 10, PY + PH / 2 + 1);
      const isPressed = s.u > 0.32 && s.u < 0.58;
      const pulse = 0.5 + 0.5 * Math.sin(s.now * 4);
      if (!isPressed) {
        c.save(); c.shadowColor = 'rgba(255,220,0,0.95)'; c.shadowBlur = 14 * (0.7 + 0.3 * pulse); c.fillStyle = 'rgba(255,220,0,0.0)';
        U.rrect(c, BX - 7, BY - 7, BW + 14, BH + 14, 10); c.fill(); c.restore();
        c.save(); c.globalAlpha = 0.85 + 0.15 * pulse; c.strokeStyle = 'rgba(255,220,0,0.95)'; c.lineWidth = 4; U.rrect(c, BX - 7, BY - 7, BW + 14, BH + 14, 10); c.stroke(); c.restore();
      }
      let bxDraw = BX, byDraw = BY, bwDraw = BW, bhDraw = BH;
      if (isPressed) {
        const sc = 0.94;
        bxDraw = BX + BW * (1 - sc) / 2 + 3;
        byDraw = BY + BH * (1 - sc) / 2 + 3;
        bwDraw = BW * sc; bhDraw = BH * sc;
      }
      bevelBtn(c, bxDraw, byDraw, bwDraw, bhDraw, isPressed, true);
      if (isPressed) {
        c.save(); c.fillStyle = 'rgba(0,0,0,0.22)'; U.rrect(c, bxDraw, byDraw, bwDraw, bhDraw, 6); c.fill(); c.restore();
        if (s.u > 0.32 && s.u < 0.42) {
          c.save(); c.globalAlpha = 0.55 * (1 - U.ss(0.32, 0.42, s.u)); c.fillStyle = '#ffffff'; U.rrect(c, bxDraw, byDraw, bwDraw, bhDraw, 6); c.fill(); c.restore();
        }
      }
      c.fillStyle = '#ffffff'; c.font = '700 22px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('Connect', bxDraw + bwDraw / 2, byDraw + bhDraw / 2 + 1);
      if (!isPressed) { c.save(); c.strokeStyle = 'rgba(255,255,255,0.95)'; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.strokeRect(bxDraw + 8, byDraw + 8, bwDraw - 16, bhDraw - 16); c.setLineDash([]); c.restore(); }
      bevelBtn(c, DX + DW - 160, BY, 130, 48, false, false);
      c.fillStyle = '#404040'; c.font = '700 14px sans-serif'; c.textAlign = 'center'; c.fillText('Cancel', DX + DW - 95, BY + 24);
      c.fillStyle = prog >= 1 ? '#008000' : '#404040'; c.font = '700 18px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      let status = 'Ready to dial.';
      if (s.u > 0.5 && s.u < 1.85) status = 'Negotiating... \u2593\u2593\u2593';
      if (prog >= 1) status = 'Connected! Welcome! \u2605';
      c.fillText(status, DX + 18, DY + 320);
      if (s.u > 0.5 && s.u < 1.85 && Math.floor(s.now * 3) % 2 === 0) {
        c.fillStyle = '#000'; c.fillRect(DX + 18 + c.measureText(status).width + 6, DY + 308, 10, 14);
      }
      c.restore();

      if (s.u > 0.38 && s.u < 0.62) {
        const hand = s.hero.hands ? s.hero.hands.R : { x: s.hero.x + 120, y: s.hero.y - 190 };
        const hx = hand.x, hy = hand.y;
        const a = 1 - U.ss(0.38, 0.62, s.u);
        c.save();
        c.globalAlpha = a;
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(hx, hy, 8, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(255,220,0,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy, 14, 0, Math.PI * 2); c.stroke();
        for (let k = 0; k < 4; k++) {
          const ang = k * Math.PI / 2 + s.now * 6;
          c.beginPath(); c.moveTo(hx + Math.cos(ang) * 10, hy + Math.sin(ang) * 10); c.lineTo(hx + Math.cos(ang) * 18, hy + Math.sin(ang) * 18); c.stroke();
        }
        c.restore();
      }

      if (push > 0) c.restore();

      c.save(); c.globalAlpha = 0.08; c.fillStyle = '#000';
      for (let y = 0; y < 1080; y += 4) c.fillRect(0, y, 1920, 1);
      c.restore();
      const grain = U.grain('web', 0.06, 0.12, true);
      const gx = U.step(s.now, 8) * 97 % 512;
      c.save(); c.globalAlpha = 0.07; U.tile(c, grain, gx, 0); c.restore();
    },

    front(c, s) {
      c.save();
      c.strokeStyle = 'rgba(10,10,14,0.92)'; c.lineWidth = 10;
      U.rrect(c, 6, 6, 1908, 1068, 18); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.10)'; c.lineWidth = 1.5;
      U.rrect(c, 12, 12, 1896, 1056, 14); c.stroke();
      const rg = c.createLinearGradient(0, 0, 600, 1080);
      rg.addColorStop(0, 'rgba(255,255,255,0.09)'); rg.addColorStop(0.35, 'rgba(255,255,255,0.0)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(700, 0); c.lineTo(320, 1080); c.lineTo(0, 1080); c.closePath();
      c.fill();
      const vig = U.cached('web_vig3', 1920, 1080, g => {
        const grd = g.createRadialGradient(960, 540, 600, 960, 540, 1300);
        grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.08)');
        g.fillStyle = grd; g.fillRect(0, 0, 1920, 1080);
      });
      c.globalAlpha = 1; c.drawImage(vig, 0, 0);
      c.restore();
    }
  });
})();
