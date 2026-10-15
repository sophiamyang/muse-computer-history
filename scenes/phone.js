// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T17:22:30.253Z (revision)
(() => {
  const FLOOR = 840;
  const PHONE = { x: 260, y: 464, w: 190, h: 336, r: 24 };
  const TABLET = { x: 1080, y: 330, w: 520, h: 340, r: 20 };
  const PANE_W = 260, PANE_H = 560, PANE_Y = 270;
  const PANE_X0 = 1080;
  const SLIDE = 380;

  function slideAmt(u){
    if(u<0) return 0;
    return U.lerp(0, SLIDE, U.ss(0.25, 0.78, u));
  }

  SCENE({
    id: 'phone',
    year: '2007',
    title: 'Smartphones',
    floor: FLOOR,
    act: {
      at: 735,
      dur: 2.2,
      prompt: 'slide the pane',
      hotspot: { x: 1088, y: 460, w: 140, h: 160 },
      facing: 1,
      path: u => {
        if(u<0) return {dx:0,dy:0};
        const sld = slideAmt(u);
        const walkTo = U.lerp(0, 368, U.ss(0.0, 0.55, u));
        const follow = sld * 0.92;
        const hopFwd = U.lerp(0, 90, U.ss(1.55, 2.05, u));
        const hopLift = U.ss(1.6, 1.85, u) - U.ss(1.85, 2.1, u);
        return { dx: walkTo + follow*U.ss(0.45,1.0,u) + hopFwd, dy: -hopLift*42 };
      },
      pose: u => {
        const grab = U.ss(0.05, 0.50, u);
        const push = U.ss(0.30, 0.78, u);
        const hop = U.ss(1.55, 2.05, u);
        let armR = U.lerp(0.12, 2.35, grab);
        armR = U.lerp(armR, 2.45, push*0.35);
        armR = U.lerp(armR, 1.95, hop);
        const elbowR = U.lerp(0.2, 0.35, grab) + 0.08*U.ss(0.4,0.7,u);
        const armL = U.lerp(0.12, 0.30, U.ss(0.2,0.7,u));
        const lean = U.lerp(0, 0.18, U.ss(0.2,0.65,u)) * (1-0.6*hop);
        const crouch = U.lerp(0, 0.07, U.ss(0.0,0.22,u)) - U.lerp(0,0.05,U.ss(0.22,0.45,u)) + U.lerp(0,0.06,U.ss(1.60,1.82,u));
        const lift = U.lerp(0, 0.12, U.ss(1.60,1.82,u)) - U.lerp(0,0.12,U.ss(1.82,2.05,u));
        const lookY = U.lerp(0, -0.18, grab) + U.lerp(0, -0.20, hop);
        return { armR, armL, elbowR, elbowL: 0.2, crouch, lean, lookY, lift };
      }
    },
    portals: {
      phone: { x: PHONE.x, y: PHONE.y, w: PHONE.w, h: PHONE.h, r: PHONE.r },
      tablet: { x: TABLET.x, y: TABLET.y, w: TABLET.w, h: TABLET.h, r: TABLET.r, glow: 'rgba(255,255,255,.6)' }
    },
    characterStyle: {},
    music: { voice: 'marimba', bpm: 96, root: 62 },
    sfx: [{ u: 0.32, kind: 'click' }, { u: 0.82, kind: 'chime' }, { u: 1.02, kind: 'chime' }, { u: 1.22, kind: 'chime' }],
    page: { heading: 'The computer in your pocket', text: 'Touchscreen phones put a whole computer, and the web, in your pocket. You touched the glass instead of pointing at it.' },
    spots: [
      { x: 1480, y: 210, w: 140, h: 100, label: 'Gel signs', text: 'Rounded bubble labels made every showroom feel friendly and futuristic.' },
      { x: 420, y: 560, w: 140, h: 120, label: 'Glass vitrine', text: 'Phones floated on clear stands, as if the future needed no support.' }
    ],
    badge(c,s,a){
      c.save();
      c.globalAlpha *= a;
      const bx = 1410, by = 48, bw = 480, bh = 64, r=22;
      c.fillStyle = 'rgba(255,255,255,0.96)';
      U.rrect(c, bx, by, bw, bh, r); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.08)'; c.lineWidth = 1.5; U.rrect(c, bx, by, bw, bh, r); c.stroke();
      c.fillStyle = 'rgba(0,0,0,0.06)';
      U.rrect(c, bx+6, by+6, bw-12, 10, 10); c.fill();
      c.textAlign='right';
      c.fillStyle='#111';
      c.font='700 28px Helvetica, Arial, sans-serif';
      c.fillText('2007 · Smartphones', 1890, 88);
      c.fillStyle='rgba(0,0,0,0.35)';
      c.fillRect(1860, 96, 30, 2);
      c.restore();
    },

    draw(c,s){
      const bg = U.cached('phone_bg4',1920,1080, g=>{
        let gr = g.createLinearGradient(0,0,0,760);
        gr.addColorStop(0,'#ffffff'); gr.addColorStop(0.5,'#f7f8fb'); gr.addColorStop(1,'#eef2f7');
        g.fillStyle=gr; g.fillRect(0,0,1920,760);
        g.fillStyle='#e6eaf2';
        g.fillRect(520, 140, 520, 520);
        g.fillStyle='rgba(0,0,0,0.04)'; g.fillRect(520,140,520,8);
        g.fillStyle='#d8dde8';
        g.fillRect(980, 140, 760, 520);
        g.fillStyle='rgba(0,0,0,0.04)'; g.fillRect(980, 140, 760, 8);
        g.fillStyle='rgba(255,255,255,0.55)'; g.fillRect(980, 652, 760, 12);
        g.strokeStyle='rgba(0,0,0,0.035)'; g.lineWidth=1;
        for(let x=0;x<1920;x+=320){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,760); g.stroke(); }
        g.fillStyle='#f2f3f7'; g.fillRect(0,0,1920,110);
        g.fillStyle='rgba(0,0,0,0.06)'; g.fillRect(0,106,1920,6);
        const sx=[420,760,1120,1480];
        sx.forEach(x=>{
          g.fillStyle='#1a1d24'; g.beginPath(); g.ellipse(x,92,44,16,0,0,Math.PI*2); g.fill();
          g.fillStyle='#2e3440'; g.beginPath(); g.ellipse(x,96,30,10,0,0,Math.PI*2); g.fill();
          g.fillStyle='#cbd3e2'; g.beginPath(); g.arc(x,98,5,0,Math.PI*2); g.fill();
        });
        let fg = g.createLinearGradient(0,760,0,1080);
        fg.addColorStop(0,'#E8ECF2'); fg.addColorStop(0.5,'#dde3ee'); fg.addColorStop(1,'#cbd5e6');
        g.fillStyle=fg; g.fillRect(0,760,1920,320);
        g.fillStyle='rgba(255,255,255,0.85)'; g.fillRect(0,760,1920,3);
        g.fillStyle='rgba(0,0,0,0.09)'; g.fillRect(210, 800, 290, 18);
        g.fillStyle='rgba(0,0,0,0.11)'; g.fillRect(1060, 800, 560, 20);
        g.fillStyle='rgba(0,0,0,0.07)'; g.fillRect(700, 800, 520, 14);
        g.fillStyle='#ffffff';
        U.rrect(g, 210, 680, 290, 120, 14); g.fill();
        g.strokeStyle='rgba(0,0,0,0.07)'; g.lineWidth=1; U.rrect(g,210,680,290,120,14); g.stroke();
        g.fillStyle='#d0d6e6'; U.rrect(g, 700, 740, 520, 18, 9); g.fill();
        g.fillStyle='#9aa6c2'; g.fillRect(700,748,520,4);
        g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(710, 744, 500, 2);
        g.fillRect(710, 750, 500, 2);
        g.fillStyle='#ffffff';
        U.rrect(g, 1060, 680, 560, 120, 16); g.fill();
        g.strokeStyle='rgba(0,0,0,0.07)'; U.rrect(g,1060,680,560,120,16); g.stroke();
        g.fillStyle='rgba(0,0,0,0.06)'; g.fillRect(1060, 680, 560, 10);
        g.fillRect(210, 680, 290, 10);
        g.fillStyle='rgba(255,255,255,0.75)'; U.rrect(g, 40, 220, 160, 420, 18); g.fill();
        g.strokeStyle='rgba(0,0,0,0.07)'; U.rrect(g,40,220,160,420,18); g.stroke();
        g.fillStyle='rgba(255,255,255,0.55)'; U.rrect(g, 1720, 220, 160, 420, 18); g.fill();
        g.strokeStyle='rgba(0,0,0,0.07)'; U.rrect(g,1720,220,160,420,18); g.stroke();
        function miniPhone(x,y){
          g.fillStyle='#0f1114'; U.rrect(g,x,y,60,100,12); g.fill();
          g.fillStyle='#1a1e24'; U.rrect(g,x+4,y+4,52,92,10); g.fill();
          // glass highlight
          g.fillStyle='rgba(255,255,255,0.14)'; U.rrect(g,x+4,y+4,52,28,10); g.fill();
          g.fillStyle='#2a2f38'; g.beginPath(); g.arc(x+30,y+88,7,0,Math.PI*2); g.fill();
          g.fillStyle='rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x+30,y+88,2.2,0,Math.PI*2); g.fill();
          g.strokeStyle='rgba(255,255,255,0.15)'; g.lineWidth=1; U.rrect(g,x+4,y+4,52,92,10); g.stroke();
        }
        miniPhone(56,250); miniPhone(56,370); miniPhone(56,490);
        miniPhone(1736,250); miniPhone(1736,370); miniPhone(1736,490);
        function gel(x,y,w,h,txt){
          let gg=g.createLinearGradient(x,y,x,y+h);
          gg.addColorStop(0,'#ffffff'); gg.addColorStop(1,'#e6ebf5');
          g.fillStyle=gg; U.rrect(g,x,y,w,h,h/2); g.fill();
          g.fillStyle='#5a8cff'; U.rrect(g,x,y,w,h,h/2); g.fill();
          g.fillStyle='rgba(255,255,255,0.35)'; U.rrect(g,x,y,w, h*0.45, h/2); g.fill();
          g.fillStyle='#fff'; g.font='700 13px Helvetica, Arial, sans-serif'; g.textAlign='center'; g.textBaseline='middle';
          g.fillText(txt, x+w/2, y+h/2+1);
        }
        gel(62, 600, 116, 28, 'touch');
        gel(1742, 600, 116, 28, 'new');
        g.fillStyle='rgba(0,0,0,0.70)'; g.font='600 42px Helvetica, Arial, sans-serif'; g.textAlign='left';
        g.fillText('Hello.', 820, 190);
        g.fillStyle='rgba(0,0,0,0.45)'; g.font='400 18px Helvetica, Arial, sans-serif';
        g.fillText('The future fits in your hand.', 820, 220);
      });
      c.drawImage(bg, -s.camX, 0);

      c.save();
      c.fillStyle='rgba(0,0,0,0.18)';
      c.beginPath(); c.ellipse(s.hero.x - s.camX, FLOOR+6, 90, 14, 0,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(0,0,0,0.10)';
      c.beginPath(); c.ellipse(s.hero.x - s.camX, FLOOR+6, 140, 20, 0,0,Math.PI*2); c.fill();
      c.restore();

      // PHONE pull portal - true black glass, no dim overlay
      c.save();
      // outer white bezel
      c.fillStyle='#ffffff';
      U.rrect(c, PHONE.x-14, PHONE.y-18, PHONE.w+28, PHONE.h+36, 30); c.fill();
      c.strokeStyle='rgba(0,0,0,0.10)'; c.lineWidth=1.4; U.rrect(c, PHONE.x-14, PHONE.y-18, PHONE.w+28, PHONE.h+36, 30); c.stroke();
      // soft outer glow
      c.save();
      c.shadowColor='rgba(120,160,255,0.35)'; c.shadowBlur=22;
      c.strokeStyle='rgba(120,160,255,0.18)'; c.lineWidth=6; U.rrect(c, PHONE.x-14, PHONE.y-18, PHONE.w+28, PHONE.h+36, 30); c.stroke();
      c.restore();
      // black glass body
      c.fillStyle='#0b0d10';
      U.rrect(c, PHONE.x, PHONE.y, PHONE.w, PHONE.h, PHONE.r); c.fill();
      c.save();
      U.rrect(c, PHONE.x, PHONE.y, PHONE.w, PHONE.h, PHONE.r); c.clip();
      let hg = c.createLinearGradient(PHONE.x, PHONE.y, PHONE.x, PHONE.y+PHONE.h);
      hg.addColorStop(0,'#f0f2f8'); hg.addColorStop(1,'#e6eaf2');
      c.fillStyle=hg; c.fillRect(PHONE.x, PHONE.y, PHONE.w, PHONE.h);
      c.fillStyle='rgba(0,0,0,0.06)'; c.fillRect(PHONE.x, PHONE.y, PHONE.w, 22);
      c.fillStyle='rgba(0,0,0,0.30)'; c.fillRect(PHONE.x+14, PHONE.y+9, 34, 4);
      c.fillRect(PHONE.x+PHONE.w-28, PHONE.y+7, 16, 8);
      const cols=['#ffb3c1','#a8d8ff','#ffe08a','#b5e8c8','#ffd0a8','#c8b8ff'];
      for(let row=0;row<4;row++) for(let col=0;col<3;col++){
        const ix = PHONE.x+18+col*58, iy= PHONE.y+44+row*58;
        c.fillStyle=cols[(row*3+col)%cols.length]; U.rrect(c, ix, iy, 44,44,12); c.fill();
        c.fillStyle='rgba(255,255,255,0.28)'; U.rrect(c, ix, iy, 44,14,12); c.fill();
      }
      c.fillStyle='rgba(255,255,255,0.85)'; U.rrect(c, PHONE.x+12, PHONE.y+ PHONE.h-56, PHONE.w-24, 44, 14); c.fill();
      for(let i=0;i<4;i++){
        c.fillStyle=cols[i]; U.rrect(c, PHONE.x+20+i*42, PHONE.y+PHONE.h-48, 32,28,8); c.fill();
      }
      // glass highlight
      c.fillStyle='rgba(255,255,255,0.18)';
      c.beginPath(); c.moveTo(PHONE.x, PHONE.y); c.lineTo(PHONE.x+70, PHONE.y); c.lineTo(PHONE.x+30, PHONE.y+PHONE.h); c.lineTo(PHONE.x, PHONE.y+PHONE.h); c.closePath(); c.fill();
      c.restore();
      // home button
      c.fillStyle='#ffffff'; c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1;
      c.beginPath(); c.arc(PHONE.x+PHONE.w/2, PHONE.y+PHONE.h+14, 10,0,Math.PI*2); c.fill(); c.stroke();
      c.fillStyle='rgba(0,0,0,0.08)'; c.beginPath(); c.arc(PHONE.x+PHONE.w/2, PHONE.y+PHONE.h+14, 6,0,Math.PI*2); c.stroke();
      c.fillStyle='rgba(255,255,255,0.55)'; U.rrect(c, PHONE.x-14, PHONE.y-18, PHONE.w+28, 10, 30); c.fill();
      c.restore();

      // TABLET push portal - drawn BEFORE pane so pane can cover it at start (only left half covered)
      const tb = TABLET;
      c.fillStyle='#e6e9ef'; c.fillRect(tb.x+ tb.w/2 -16, tb.y+ tb.h+6, 32, 26);
      c.fillStyle='#c2c9db'; c.fillRect(tb.x+ tb.w/2 -16, tb.y+ tb.h+18, 32, 4);
      c.fillStyle='rgba(0,0,0,0.10)'; c.beginPath(); c.ellipse(tb.x+tb.w/2, 800, 160, 14,0,0,Math.PI*2); c.fill();
      const sld = slideAmt(s.u);
      const wake = U.ss(0.95, 1.25, s.u);

      c.save();
      c.fillStyle='#ffffff';
      U.rrect(c, tb.x-14, tb.y-14, tb.w+28, tb.h+28, tb.r+10); c.fill();
      c.strokeStyle='rgba(0,0,0,0.08)'; c.lineWidth=1.4; U.rrect(c, tb.x-14, tb.y-14, tb.w+28, tb.h+28, tb.r+10); c.stroke();
      c.fillStyle='#0f1114';
      U.rrect(c, tb.x-6, tb.y-6, tb.w+12, tb.h+12, tb.r+4); c.fill();
      c.save();
      U.rrect(c, tb.x, tb.y, tb.w, tb.h, tb.r); c.clip();
      c.fillStyle='#0a0c0f'; c.fillRect(tb.x, tb.y, tb.w, tb.h);
      if(wake>0){
        c.save();
        c.globalAlpha = wake;
        s.peek('tablet');
        c.restore();
        c.save();
        c.globalAlpha = wake;
        let tg = c.createLinearGradient(tb.x, tb.y, tb.x, tb.y+tb.h);
        tg.addColorStop(0,'#ffffff'); tg.addColorStop(1,'#eef2ff');
        c.fillStyle=tg; c.fillRect(tb.x, tb.y, tb.w, tb.h);
        c.fillStyle='rgba(0,0,0,0.05)'; c.fillRect(tb.x, tb.y, tb.w, 30);
        c.fillStyle='rgba(0,0,0,0.12)'; c.fillRect(tb.x+18, tb.y+10, 80, 8);
        c.fillRect(tb.x+tb.w-60, tb.y+10, 40, 8);
        const cardCols=['#ffb3c1','#a8d8ff','#ffe08a'];
        for(let i=0;i<3;i++){
          const cx = tb.x+22+i*164, cy= tb.y+52;
          const pop = U.ss(1.0 + i*0.08, 1.22 + i*0.08, s.u);
          const sc = U.lerp(0.92, 1.0, pop);
          c.save();
          c.globalAlpha = pop;
          c.translate(cx+78, cy+78);
          c.scale(sc, sc);
          c.translate(-(cx+78), -(cy+78));
          c.fillStyle='#fff'; U.rrect(c, cx, cy, 156, 200, 16); c.fill();
          c.strokeStyle='rgba(0,0,0,0.06)'; c.lineWidth=1; U.rrect(c, cx, cy, 156, 200, 16); c.stroke();
          c.fillStyle=cardCols[i]; U.rrect(c, cx+12, cy+12, 132, 90, 12); c.fill();
          c.fillStyle='rgba(0,0,0,0.09)'; c.fillRect(cx+12, cy+124, 100, 10);
          c.fillRect(cx+12, cy+144, 76, 7);
          c.fillStyle=cardCols[i]; U.rrect(c, cx+12, cy+164, 56, 18, 9); c.fill();
          c.restore();
        }
        c.fillStyle='rgba(255,255,255,0.18)';
        c.beginPath(); c.moveTo(tb.x, tb.y); c.lineTo(tb.x+160, tb.y); c.lineTo(tb.x+60, tb.y+tb.h); c.lineTo(tb.x, tb.y+tb.h); c.closePath(); c.fill();
        c.restore();
      }
      c.restore();
      c.fillStyle='#f1f3f8'; c.beginPath(); c.arc(tb.x+tb.w/2, tb.y+tb.h+10, 7,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1; c.beginPath(); c.arc(tb.x+tb.w/2, tb.y+tb.h+10, 7,0,Math.PI*2); c.stroke();
      if(wake>0.05){
        c.save();
        c.shadowColor='rgba(255,255,255,0.95)'; c.shadowBlur=26;
        c.strokeStyle=`rgba(255,255,255,${0.65*wake})`; c.lineWidth=3; U.rrect(c, tb.x-14, tb.y-14, tb.w+28, tb.h+28, tb.r+10); c.stroke();
        c.shadowBlur=0;
        c.strokeStyle=`rgba(120,160,255,${0.18*wake})`; c.lineWidth=10; U.rrect(c, tb.x-14, tb.y-14, tb.w+28, tb.h+28, tb.r+10); c.stroke();
        c.restore();
      }
      c.restore();

      // SPOTLIGHT CONES - stronger warm
      const spotsX=[420,760,1120,1480];
      const onTimes=[0.68,0.86,1.04,1.22];
      spotsX.forEach((sx,i)=>{
        const tOn = onTimes[i];
        const a = U.ss(tOn, tOn+0.15, s.u);
        if(a<=0) return;
        c.save();
        c.globalAlpha = 0.42 * a;
        c.fillStyle='#ffe9a8';
        c.beginPath();
        c.moveTo(sx-18, 108);
        c.lineTo(sx+18, 108);
        c.lineTo(sx+110, 760);
        c.lineTo(sx-110, 760);
        c.closePath(); c.fill();
        c.globalAlpha = 0.20 * a;
        c.fillStyle='#fff2c2';
        c.beginPath();
        c.moveTo(sx-28, 108);
        c.lineTo(sx+28, 108);
        c.lineTo(sx+150, 760);
        c.lineTo(sx-150, 760);
        c.closePath(); c.fill();
        c.restore();
        c.save();
        c.globalAlpha = 0.45 * a;
        c.fillStyle='#fff0b0';
        c.beginPath(); c.ellipse(sx, 770, 92, 20, 0,0,Math.PI*2); c.fill();
        c.globalAlpha = 0.24 * a;
        c.fillStyle='#ffe9a8';
        c.beginPath(); c.ellipse(sx, 770, 150, 30, 0,0,Math.PI*2); c.fill();
        c.restore();
        if(a>0.5){
          c.save(); c.globalAlpha=0.9*a;
          c.fillStyle='#fff'; c.beginPath(); c.arc(sx, 98, 4,0,Math.PI*2); c.fill();
          c.fillStyle='rgba(255,240,180,0.6)'; c.beginPath(); c.arc(sx, 98, 8,0,Math.PI*2); c.fill();
          c.restore();
        }
      });

      // FROSTED GLASS PANE - starts at tablet left edge, slides RIGHT off it
      const paneX = PANE_X0 + sld;
      c.fillStyle='#d0d6e6'; U.rrect(c, 700, 740, 520, 18, 9); c.fill();
      c.fillStyle='#9aa6c2'; c.fillRect(700, 748, 520, 4);
      c.fillStyle='rgba(0,0,0,0.22)'; c.fillRect(710, 744, 500, 2);
      c.fillStyle='rgba(0,0,0,0.18)'; c.fillRect(710, 750, 500, 2);
      c.save();
      c.fillStyle='rgba(0,0,0,0.18)';
      c.fillRect(paneX+10, 800, PANE_W-20, 16);
      c.fillStyle='rgba(0,0,0,0.10)';
      c.fillRect(paneX-6, 800, PANE_W+12, 22);
      c.restore();
      c.save();
      U.rrect(c, paneX, PANE_Y, PANE_W, PANE_H, 14); c.clip();
      c.fillStyle='rgba(210,225,245,0.92)'; c.fillRect(paneX, PANE_Y, PANE_W, PANE_H);
      c.fillStyle='rgba(160,180,210,0.32)';
      for(let i=0;i<90;i++){
        const rx = U.hash(i,11), ry=U.hash(i,12);
        const sz = 10 + 10*U.hash(i,13);
        c.fillRect(paneX+ rx*PANE_W, PANE_Y+ ry*PANE_H, sz, sz);
      }
      c.strokeStyle='rgba(255,255,255,0.55)'; c.lineWidth=1.2;
      for(let i=0;i<5;i++){
        const x = paneX+ 34 + i*42 + Math.sin(s.now*0.6+i)*1.2;
        c.beginPath(); c.moveTo(x, PANE_Y+18); c.lineTo(x, PANE_Y+PANE_H-18); c.stroke();
      }
      const hx = paneX + 14, hy = PANE_Y + PANE_H/2 - 70;
      c.fillStyle='#ffffff'; U.rrect(c, hx, hy, 22, 140, 11); c.fill();
      c.strokeStyle='rgba(40,50,70,0.85)'; c.lineWidth=2.2; U.rrect(c, hx, hy, 22, 140, 11); c.stroke();
      c.fillStyle='rgba(0,0,0,0.08)'; U.rrect(c, hx+4, hy+8, 14, 124, 7); c.fill();
      c.fillStyle='rgba(255,255,255,0.75)'; c.fillRect(paneX+5, PANE_Y+10, 4, PANE_H-20);
      c.restore();
      c.strokeStyle='#3d4559'; c.lineWidth=8; U.rrect(c, paneX, PANE_Y, PANE_W, PANE_H, 14); c.stroke();
      c.strokeStyle='rgba(255,255,255,0.95)'; c.lineWidth=1.2; U.rrect(c, paneX+8, PANE_Y+8, PANE_W-16, PANE_H-16, 10); c.stroke();
      const roll = sld * 0.18;
      c.fillStyle='#7d8aa6';
      c.beginPath(); c.arc(paneX+42, 754, 11,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(paneX+PANE_W-42, 754, 11,0,Math.PI*2); c.fill();
      c.save();
      c.translate(paneX+42, 754); c.rotate(roll*0.12);
      c.strokeStyle='#4a556e'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(-7,0); c.lineTo(7,0); c.moveTo(0,-7); c.lineTo(0,7); c.stroke();
      c.restore();
      c.save();
      c.translate(paneX+PANE_W-42, 754); c.rotate(roll*0.12);
      c.strokeStyle='#4a556e'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(-7,0); c.lineTo(7,0); c.moveTo(0,-7); c.lineTo(0,7); c.stroke();
      c.restore();
      c.fillStyle='#eef2f8'; c.beginPath(); c.arc(paneX+42, 754, 4,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(paneX+PANE_W-42, 754, 4,0,Math.PI*2); c.fill();

      const anyOn = U.ss(0.68,0.85,s.u);
      if(anyOn>0){
        c.save(); c.globalAlpha=0.07*anyOn; c.fillStyle='#fff8d0'; c.fillRect(0,0,1920,120); c.restore();
      }
      c.save(); c.globalAlpha=0.035;
      U.tile(c, U.grain('phone_grain4',0.06,0.12,true), U.step(s.now,8)*97%512, 0);
      c.restore();
    },
    front(c,s){
      const v = U.cached('phone_vig4',1920,1080,g=>{
        let gr=g.createRadialGradient(960,540,600,960,540,1250);
        gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,0.07)');
        g.fillStyle=gr; g.fillRect(0,0,1920,1080);
      });
      c.drawImage(v,0,0);
    }
  });
})();

