// portal-film runtime · stage (window.STAGE): scenes, shots, timing, the character's path, camera, and the
// "through the object" handovers between scenes.
//
//   push: the camera travels into an object in this scene; the next scene is already playing inside it, irises open,
//         blooms to fill the frame.
//   pull: we pull back from this scene and find it was on a screen (the portal) inside the next scene; the screen keeps
//         showing it for a moment ("afterglow"), then returns to its own picture.
//
// Scenes register with SCENE({...}); the film registers shots with FILM({...}) (see SKILL.md for both interfaces).
(() => {
const { W, H, clamp, lerp, ss, easeOut, easeSine } = U;
const ST = window.STAGE = { Tr: 1.6, RATE: 0.85, AFTER: 1.1, scenes: {}, shots: [] };
window.SCENE = def => { ST.scenes[def.id] = Object.assign({ floor: 760, width: W, cam: 0 }, def); };

const cover = p => { const cx = p.x + p.w / 2, cy = p.y + p.h / 2, w = Math.max(p.w, p.h * W / H), h = w * H / W; return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy }; };
const irisRect = (p, k) => { const cx = p.x + p.w / 2, cy = p.y + p.h / 2; return { ...p, x: cx - p.w * k / 2, y: cy - p.h * k / 2, w: p.w * k, h: p.h * k, r: (p.r || 0) * k }; };

// ---------- timeline ----------
ST.build = shots => {
  shots.forEach((sh, k) => {                                           // portal by name: push -> this scene's object, pull -> the next scene's
    if (!sh.out || typeof sh.out.portal !== 'string') return;
    const owner = ST.scenes[sh.out.type === 'push' ? sh.scene : (shots[k + 1] || {}).scene], p = owner && owner.portals && owner.portals[sh.out.portal];
    if (!p) throw new Error(`shot ${k} (${sh.scene}): no portal "${sh.out.portal}" in scene ${owner ? owner.id : '?'}`);
    sh.out.portal = p; sh.out.glow = sh.out.glow ?? p.glow;
  });
  shots.forEach(sh => { if (sh.out && sh.out.portal) { const Z = W / cover(sh.out.portal).w; sh.tr = Math.max(ST.Tr, ST.RATE * Math.log(Z)); } });  // deeper zoom = longer handover
  let start = 0;
  shots.forEach((sh, k) => {
    const sc = ST.scenes[sh.scene]; if (!sc) throw new Error('no scene ' + sh.scene);
    const act = sc.act || { at: 900, dur: 1.5 };
    Object.assign(sh, { k, sc, act, floor: sc.floor, camMax: Math.max(0, sc.width - W) });
    sh.cam0 = clamp(sh.cam ?? sc.cam ?? 0, 0, sh.camMax);
    sh.entry = sh.entry || (k === 0 ? 'open' : shots[k - 1].out && shots[k - 1].out.type === 'pull' ? 'stepOut' : 'fly');
    sh.Lin = k ? shots[k - 1].tr : 0;
    sh.E = sh.entry === 'fly' ? 0.55 : sh.entry === 'stepOut' ? 0.95 : (sh.hold ?? 0.8);   // 'open': hold the establishing frame first
    sh.P = sh.pre ?? 0.9;
    sh.aLocal = sh.Lin + sh.E + sh.P; sh.D = act.dur;
    const last = k === shots.length - 1, type = sh.out && sh.out.type;
    sh.Q = last ? 0 : type === 'push' ? (sh.post ?? 0.8) : (sh.post ?? 0.45);
    sh.len = sh.aLocal + sh.D + sh.Q + (last ? (sh.tail ?? 3) : sh.tr);
    sh.start = start; sh.end = start + sh.len; start = sh.end - (last ? 0 : sh.tr);
    sh.entryX = act.at - (sh.walkIn ?? 380);
  });
  shots.forEach((sh, k) => { const prev = shots[k - 1]; if (prev && prev.out.type === 'pull') { const p = prev.out.portal, R = cover(p); sh.inFrom = { x: R.cx + sh.cam0, y: p.y + p.h - 8, s: R.w / W }; } });
  ST.shots = shots; ST.total = shots[shots.length - 1].end;
  shots.forEach(precomputeCam);
  return ST;
};

// ---------- character pose ----------
const actOffset = (sh, u) => sh.act.path ? sh.act.path(clamp(u, 0, sh.D)) : { dx: 0, dy: 0 };
function actFrame(sh, u) { const f = sh.act.frames; if (!f) return Math.min(7, Math.floor(clamp(u / sh.D) * 8));
  if (typeof f === 'function') return f(u); let r = f[0][1]; for (const [a, i] of f) if (u >= a) r = i; return r; }
function pose(sh, local) {
  const K = k => (sh.sc.sheets && sh.sc.sheets[k]) || k;              // scene.sheets: { walk: 'walk_ink', hop: 'hop_ink' }
  const F = sh.floor, a0 = sh.aLocal, a1 = a0 + sh.D, drawn = CHAR.drawn, sprites = CHAR.has(K('walk')), rigged = drawn || sprites;
  const actKey = sh.act.key || ('act_' + sh.scene), hasAct = CHAR.has(actKey), hasHop = CHAR.has(K('hop'));
  const stride = (sh.stride ?? 18) * CHAR.def.screenHeight / 300;
  const actPose = u => sh.act.pose ? sh.act.pose(clamp(u, 0, sh.D)) : null;
  const dir = (a, b) => (b < a - 0.5 ? -1 : 1);
  let x, y = F, rot = 0, sx = 1, sy = 1, scale = 1, alpha = 1, walked = -1, key = sprites ? K('walk') : null, frame = 0;
  let motion = { kind: 'stand' }, facing = 1, over = null;
  if (local < sh.Lin + sh.E) {                                         // arriving
    if (sh.entry === 'fly') { const T0 = sh.Lin + sh.E, f = easeSine(clamp(local / T0)), cam = ST.camAt(sh, local), x0 = W / 2 + cam;
      x = lerp(x0, sh.entryX, f); y = lerp(F - 260, F, f) - Math.sin(Math.PI * f) * 70; scale = lerp(0.5, 1, f); rot = rigged ? 0 : 0.3 * (1 - f);
      motion = { kind: 'land', u: f }; facing = dir(x0, sh.entryX);
      if (hasHop) { key = K('hop'); frame = local < sh.Lin + sh.E * 0.25 ? 3 : Math.min(7, 4 + Math.floor(clamp((local - sh.Lin - sh.E * 0.25) / (sh.E * 0.75)) * 4)); }
      else if (!drawn) { const land = clamp((local - (T0 - 0.18)) / 0.18); sy = 1 - 0.14 * Math.sin(land * Math.PI); sx = 1 + 0.1 * Math.sin(land * Math.PI); } }
    else if (sh.entry === 'stepOut') { const u = clamp((local - sh.Lin) / sh.E), p = sh.inFrom, f = easeOut(u);
      x = lerp(p.x, sh.entryX, f); y = lerp(p.y, F, f) - Math.sin(Math.PI * Math.min(1, u * 1.05)) * 90; scale = lerp(p.s, 1, f); alpha = local < sh.Lin ? 0 : ss(0, 0.12, u);
      motion = { kind: 'land', u: 0.25 + 0.75 * u }; facing = dir(p.x, sh.entryX);
      if (hasHop) { key = K('hop'); frame = Math.min(7, 2 + Math.floor(u * 6)); } }
    else { x = sh.entryX; facing = dir(sh.entryX, sh.act.at); }
  } else if (local < a0) {                                             // walking to the mark, slowing down
    const u = clamp((local - sh.Lin - sh.E) / sh.P); x = lerp(sh.entryX, sh.act.at, 1 - Math.pow(1 - u, 2.2)); walked = Math.abs(x - sh.entryX);
    facing = dir(sh.entryX, sh.act.at);
  } else if (local < a1) {                                             // the action
    const u = local - a0, o = actOffset(sh, u); x = sh.act.at + (o.dx || 0); y = F + (o.dy || 0);
    motion = { kind: 'act', u }; over = actPose(u); facing = sh.act.facing ?? 1;
    if (hasAct) { key = actKey; frame = actFrame(sh, u); }
    else if (!rigged) rot = 0.09 * ss(0, 0.25, u) * (1 - ss(sh.D - 0.35, sh.D, u));
    if (sh.act.path && (o.dx || 0) !== 0 && !hasAct) { walked = Math.abs(o.dx); if (sh.act.facing == null) facing = o.dx < 0 ? -1 : 1; }
  } else {                                                             // after the action
    const o = actOffset(sh, sh.D), u = clamp((local - a1) / Math.max(1e-6, sh.Q)); x = sh.act.at + (o.dx || 0);
    facing = sh.act.facing ?? (o.dx < 0 ? -1 : 1);
    if (sh.out && sh.out.type === 'push' && sh.Q > 0) {
      const camX = ST.camAt(sh, local), p = sh.out.portal, px = p.x + p.w / 2 + camX, py = p.y + p.h / 2, go = clamp((u - 0.2) / 0.8);
      facing = dir(x, px); x = lerp(x, px, easeSine(go)); y = lerp(F, py + 40, easeSine(go)) - Math.sin(go * Math.PI) * 160; scale = lerp(1, 0.32, Math.pow(go, 1.4)); alpha = 1 - ss(0.82, 1, go);
      motion = { kind: 'hop', u };
      if (hasHop) { key = K('hop'); frame = u < 0.22 ? 0 : u < 0.36 ? 1 : u < 0.7 ? 2 : 3; }
      else if (!drawn) { rot = 0.35 * go; const prep = clamp(u / 0.2); sy = 1 - 0.14 * Math.sin(prep * Math.PI); sx = 1 + 0.1 * Math.sin(prep * Math.PI); }
    } else {                                                           // pull or the last scene: hold the action's last pose, relax it
      const rel = ss(0, 0.9, local - a1); over = actPose(sh.D);
      if (over && drawn) { const B = RIG.BASE; over = Object.fromEntries(Object.entries(over).map(([k, v]) => [k, typeof v === 'number' && typeof B[k] === 'number' ? lerp(v, B[k], rel) : v])); }
      motion = { kind: 'act', u: sh.D + (local - a1) };
      if (hasAct && !sh.out) { key = actKey; frame = CHAR.frames(actKey) - 1; }
    }
  }
  if (walked >= 0) {
    if (drawn) { const base = motion.kind === 'act' ? over : null; motion = { kind: 'walk', dist: walked }; over = base ? walkSafe(base) : null; }
    else if (sprites) frame = Math.floor(walked / stride);
    else { const ph = walked / 62 * Math.PI, s2 = Math.abs(Math.sin(ph)); y -= s2 * 9; rot += Math.sin(ph) * 0.055; sy *= 1 - 0.035 * (1 - s2); sx *= 1 + 0.025 * (1 - s2); } }
  const back = drawn ? (sh.standBack ?? 0) : key ? (sh.spriteBack ?? 0) : (sh.standBack ?? 45);   // an image puppet stands back a little so props stay visible
  return { x: x - back * facing, y, ground: F, scale, sx, sy, rot, alpha, key, frame, motion, facing, over, t: local };
}
// while walking during an action, keep the action's arms and face but let the legs walk
const walkSafe = o => { const r = { ...o }; for (const k of ['legL', 'legR', 'kneeL', 'kneeR', 'footL', 'footR', 'crouch', 'lift']) delete r[k]; return r; };
ST.pose = pose;

// ---------- camera: locked unless the character would leave the frame (forward only, smoothed) ----------
function precomputeCam(sh) {
  const R = 60, n = Math.ceil(sh.len * R) + 2, raw = new Float64Array(n); let mx = sh.cam0;
  for (let k = 0; k < n; k++) { const loc = k / R; let tx = sh.cam0;
    if (loc >= sh.aLocal && loc <= sh.aLocal + sh.D) tx = Math.max(tx, sh.act.at + (actOffset(sh, loc - sh.aLocal).dx || 0) - (sh.followAt ?? 1450));
    mx = Math.min(sh.camMax, Math.max(mx, tx)); raw[k] = mx; }
  const sig = 0.3 * R, K = Math.ceil(sig * 3), ker = []; let ks = 0; for (let j = -K; j <= K; j++) { const w = Math.exp(-j * j / (2 * sig * sig)); ker.push(w); ks += w; }
  const sm = new Float64Array(n); for (let k = 0; k < n; k++) { let a = 0; for (let j = -K; j <= K; j++) a += ker[j + K] * raw[clamp(k + j, 0, n - 1)]; sm[k] = a / ks; }
  sh._cam = { R, sm };
}
ST.camAt = (sh, local) => { const { R, sm } = sh._cam, f = clamp(local * R, 0, sm.length - 1), k = Math.floor(f), u = f - k; return sm[k] + (sm[Math.min(k + 1, sm.length - 1)] - sm[k]) * u; };

// ---------- one scene, one frame ----------
// opt.off: extra ambient time (seconds the viewer spent waiting in an interactive mode). Film time stays put while
// s.now = s.t + off keeps living details and the character's idle moving.
const frameState = (c, sh, local, off) => {
  const camX = ST.camAt(sh, local), p = pose(sh, local); p.t = local + off;
  const hands = CHAR.drawn ? CHAR.handsWorld(p) : null;           // drawn characters: props can hold on to a hand
  const s = { t: local, now: local + off, u: local - sh.aLocal, camX, W, H, floor: sh.floor, shot: sh,
    hero: { x: p.x, y: p.y, facing: p.facing, hands, scale: p.scale, alpha: p.alpha, motion: p.motion },
    inAct: local >= sh.aLocal && local < sh.aLocal + sh.D, peek: (name, alpha = 1) => ST.peek(c, sh, name, alpha, camX) };
  return { s, p, camX };
};
ST.renderScene = (c, sh, local, opt = {}) => {
  const sc = sh.sc, { s, p, camX } = frameState(c, sh, local, opt.off || 0);
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
  sc.draw(c, s);
  if (!opt.noHero) CHAR.draw(c, sc, { ...p, x: p.x - camX, shadow: p.scale > 0.6 });
  if (sc.front && !opt.noFront) sc.front(c, s);
  c.restore();
};
ST.drawHero = (c, sh, local, off = 0) => { const camX = ST.camAt(sh, local), p = pose(sh, local); p.t = local + off; CHAR.draw(c, sh.sc, { ...p, x: p.x - camX, shadow: p.scale > 0.6 }); };
ST.drawFront = (c, sh, local, off = 0) => { if (!sh.sc.front) return; const { s } = frameState(c, sh, local, off); c.save(); sh.sc.front(c, s); c.restore(); };

function shapePath(c, p, R, b) {
  c.beginPath();
  if (p.shape === 'circle') { const r0 = Math.min(p.w, p.h) / 2, r1 = Math.hypot(R.w, R.h) / 2; c.arc(R.cx, R.cy, lerp(r0, r1, b), 0, Math.PI * 2); return; }
  U.rrect(c, lerp(p.x, R.x, b), lerp(p.y, R.y, b), lerp(p.w, R.w, b), lerp(p.h, R.h, b), lerp(p.r || 0, 0, b));
}
const bufs = {}; const buf = k => bufs[k] || (bufs[k] = U.canvas());

// s.peek('name'): draw, inside this scene's portal, the world on the other side of it, cached per portal:
//  - push portal: the scene the push will enter (its first frame, no character), so the object already holds it
//  - pull portal: the scene we pulled back from (its last frame, no character), so after the afterglow the object
//    keeps showing that world as a still picture (a poster, a map, a paused screen)
const peeks = {};
ST.peek = (c, sh, name, alpha, camX) => {
  const p = sh.sc.portals && sh.sc.portals[name]; if (!p) return;
  const S = ST.shots, kp = S.findIndex(x => x.scene === sh.scene && x.out && x.out.type === 'push' && x.out.portal === p);
  const kq = S.findIndex((x, i) => x.out && x.out.type === 'pull' && x.out.portal === p && S[i + 1] && S[i + 1].scene === sh.scene);
  const inner = kp >= 0 ? S[kp + 1] : kq >= 0 ? S[kq] : null, at = kp >= 0 ? 0 : inner && inner.len - inner.tr;
  if (!inner) return;
  const key = sh.scene + '|' + name;
  if (!peeks[key]) { const b = U.canvas(); ST.renderScene(b.getContext('2d'), inner, at, { noHero: true }); peeks[key] = b; }
  const R = cover(p); c.save(); c.globalAlpha *= alpha; c.translate(-(camX - sh.cam0), 0); shapePath(c, p, R, 0); c.clip(); c.drawImage(peeks[key], R.x, R.y, R.w, R.h); c.restore();
};

// ---------- the frame at film time t ----------
ST.draw = (c, t, off = 0) => {
  const S = ST.shots; let k = S.findIndex(sh => t >= sh.start && t < sh.end); if (k < 0) k = S.length - 1;
  let tr = null;
  if (k + 1 < S.length && t >= S[k + 1].start) tr = { a: S[k], b: S[k + 1], p: (t - S[k + 1].start) / S[k].tr };
  else if (k > 0 && t < S[k - 1].end) tr = { a: S[k - 1], b: S[k], p: (t - S[k].start) / S[k - 1].tr };
  if (!tr) {
    const sh = S[k], local = t - sh.start, prev = S[k - 1], glow = prev && prev.out.type === 'pull' && local < prev.tr + ST.AFTER;
    ST.renderScene(c, sh, local, glow ? { noHero: true, noFront: true, off } : { off });
    if (glow) {                                                        // the screen we pulled back from keeps playing a moment
      const port = prev.out.portal, R = cover(port), a = 1 - ss(prev.tr + ST.AFTER - 0.45, prev.tr + ST.AFTER, local);
      const B = buf('B'), gb = B.getContext('2d'); gb.setTransform(1, 0, 0, 1, 0, 0); gb.clearRect(0, 0, W, H); ST.renderScene(gb, prev, t - prev.start, { noHero: true, off });
      c.save(); c.globalAlpha = a; shapePath(c, port, R, 0); c.clip(); c.drawImage(B, R.x, R.y, R.w, R.h); c.restore();
      ST.drawHero(c, sh, local, off); ST.drawFront(c, sh, local, off);   // character, then foreground, over the fading picture
    }
    ST.badge(c, sh, local, 1); ST.endFade(c, t); return;
  }
  const { a, b, p } = tr, out = a.out, push = out.type === 'push';
  const outer = push ? a : b, inner = push ? b : a;
  const q = push ? easeSine(p) : easeSine(1 - p);                     // 0 = outer at rest, 1 = portal fills the frame
  const port = out.portal, R = cover(port), Zmax = W / R.w, z = Math.pow(Zmax, q);
  const ax = lerp(R.cx, W / 2, q), ay = lerp(R.cy, H / 2, q);          // travel tracks log-zoom: no late sideways lurch
  const A = buf('A'), B = buf('B'), ga = A.getContext('2d'), gb = B.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.clearRect(0, 0, W, H); ST.renderScene(ga, outer, t - outer.start, { off });
  gb.setTransform(1, 0, 0, 1, 0, 0); gb.clearRect(0, 0, W, H); ST.renderScene(gb, inner, t - inner.start, { off });
  c.save(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  c.translate(ax, ay); c.scale(z, z); c.translate(-R.cx, -R.cy);
  const soft = Math.sin(Math.PI * q) * 2.2;                            // ~2 px blur at the fastest moment: no texture shimmer
  if (soft > 0.05) { c.save(); c.filter = `blur(${soft.toFixed(2)}px)`; c.drawImage(A, 0, 0); c.restore(); } else c.drawImage(A, 0, 0);
  const bl = ss(0.7, 1, q), iris = push ? ss(0, 0.22, p) : 1, portI = iris < 1 ? irisRect(port, iris) : port;
  if (out.glow) { c.save(); shapePath(c, portI, R, bl); c.shadowColor = out.glow; c.shadowBlur = 40 / z; c.lineWidth = 6 / z; c.strokeStyle = out.glow; c.globalAlpha = (1 - bl) * 0.9; c.stroke(); c.restore(); }
  if (iris > 0.001) { c.save(); shapePath(c, portI, R, bl); c.clip(); c.drawImage(B, R.x, R.y, R.w, R.h); c.restore(); }
  c.restore();
  ST.badge(c, a, t - a.start, 1 - ss(0.25, 0.45, p)); ST.badge(c, b, t - b.start, ss(0.55, 0.75, p));
};

// year + title badge, top right (scene.badge(c, s, alpha) overrides the look)
ST.badge = (c, sh, local, a) => {
  if (a <= 0.001 || window.FILM_CFG.badges === false) return; const sc = sh.sc;
  if (sh.badgeOut != null && local > sh.aLocal + sh.badgeOut) a *= 1 - ss(sh.aLocal + sh.badgeOut, sh.aLocal + sh.badgeOut + 0.4, local);
  if (a <= 0.001) return;
  c.save(); c.globalAlpha = a;
  if (sc.badge) { sc.badge(c, { t: local }, a); c.restore(); return; }
  if (!sc.year && !sc.title) { c.restore(); return; }
  const F1 = '600 50px sans-serif', F2 = '500 26px sans-serif', y1 = sc.year ? 104 : 0, bh = sc.year ? 116 : 70;
  c.font = F1; const w1 = sc.year ? c.measureText(sc.year).width : 0; c.font = F2; const w2 = c.measureText(sc.title || '').width;
  const bw = Math.max(w1, w2) + 48; c.fillStyle = sc.badgeBg || 'rgba(250,247,240,.85)'; U.rrect(c, 1890 - bw, 48, bw, bh, 14); c.fill();
  if (sc.year) U.text(c, sc.year, 1866, y1, { font: F1, color: sc.badgeInk || '#1d1c1a', align: 'right' });
  U.text(c, sc.title || '', 1866, sc.year ? 146 : 92, { font: F2, color: sc.badgeInk || '#1d1c1a', align: 'right' });
  c.restore();
};
ST.endFade = (c, t) => { const d = window.FILM_CFG.fade ?? 0.7, a = ss(ST.total - d, ST.total, t); if (a > 0) { c.save(); c.fillStyle = `rgba(0,0,0,${a})`; c.fillRect(0, 0, W, H); c.restore(); } };

// timeline + handover facts for the score, the gate and humans
ST.plan = () => ({
  total: ST.total,
  shots: ST.shots.map(sh => ({ scene: sh.scene, year: sh.sc.year, title: sh.sc.title, start: sh.start, end: sh.end, act: sh.start + sh.aLocal, actEnd: sh.start + sh.aLocal + sh.D,
    out: sh.out ? sh.out.type : null, handover: sh.tr || 0, zoom: sh.out ? W / cover(sh.out.portal).w : 1,
    peakZoomPerFrame: sh.out ? Math.exp(Math.PI / 2 * Math.log(W / cover(sh.out.portal).w) / sh.tr / 30) - 1 : 0,
    music: sh.sc.music || null, sfx: (sh.sc.sfx || []).map(e => ({ ...e, t: sh.start + sh.aLocal + e.u })) })),
});
})();
