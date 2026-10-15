// portal-film runtime · character layer (window.CHAR). Two kinds of character:
//
// 1. DRAWN (original characters): a character.js file in the film calls
//      CHARACTER({ height: 300, props: {...}, style: {...}, draw(c, J, P, S) { ... } })
//    The runtime poses a rig (runtime/rig.js) from what the stage says is happening, merges the scene's action
//    overrides (act.pose(u)) and calls draw with the solved joints J, the pose numbers P and the style S
//    (character style merged with scene.characterStyle). c is already translated to the feet and flipped to face
//    the direction of travel. See references/character.md.
//
// 2. IMAGES (existing art that must stay on-model, or someone else's character): a front image and/or sprite sheets
//    with a fixed foot anchor. Code only places, scales, tilts, squashes and fades them, and runs scene.treat.
//      { front: { src, anchor: [ax, ay], height }, sheets: { walk|hop|act_<scene>: { src, grid, cell, anchor, height } },
//        screenHeight: 300 }
(() => {
const CH = window.CHAR = { def: null, cache: {}, drawn: false };
CH.define = def => {
  CH.drawn = typeof def.draw === 'function';
  CH.def = CH.drawn ? Object.assign({ height: 300, props: {}, style: {}, images: [] }, def) : Object.assign({ screenHeight: 300, sheets: {} }, def);
  CH.def.screenHeight = CH.def.screenHeight || CH.def.height;
};
window.CHARACTER = CH.define;
CH.assets = () => { const d = CH.def; if (!d) return []; if (CH.drawn) return d.images || []; const l = []; if (d.front) l.push(d.front.src); for (const k in d.sheets) l.push(d.sheets[k].src); return l; };
CH.has = key => !!(CH.def && !CH.drawn && CH.def.sheets[key]);
CH.frames = key => { const s = CH.def.sheets[key]; return s.grid[0] * s.grid[1]; };

// ---------- drawn ----------
CH.styleFor = scene => ({ ...CH.def.style, ...(scene.characterStyle || {}) });
CH.rig = o => {                                               // pose + joints for a stage pose o
  const H = CH.def.height * (o.scale ?? 1);
  const P = RIG.motionPose(o.motion, o.t || 0, H, o.stride);
  if (o.over) Object.assign(P, o.over);
  P.t = o.t || 0;
  return RIG.solve(P, H, CH.def.props);
};
CH.handsWorld = o => { if (!CH.drawn) return null; const J = CH.rig(o); return { L: RIG.toWorld(o, J.handL), R: RIG.toWorld(o, J.handR), head: RIG.toWorld(o, J.head) }; };
let tbuf = null;
function drawDrawn(c, scene, o) {
  const J = CH.rig(o), S = CH.styleFor(scene), f = o.facing || 1, fx = CH.def.flip === false ? 1 : f;   // flip:false = the character turns itself (3D)
  J.facing = f;
  const paint = g => { g.translate(o.x, o.y); g.rotate(o.rot || 0); g.scale((o.sx || 1) * fx, o.sy || 1); CH.def.draw(g, J, J.P, S); };
  if (!scene.treat) { c.save(); c.globalAlpha *= o.alpha ?? 1; paint(c); c.restore(); return; }
  // scene material pass on a drawn character: paint into a buffer around the character, treat it, composite
  const w = Math.ceil(J.H * 1.8), h = Math.ceil(J.H * 1.7);
  if (!tbuf || tbuf.width < w || tbuf.height < h) tbuf = U.canvas(w, h);
  const g = tbuf.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, tbuf.width, tbuf.height);
  const ox = w / 2, oy = h * 0.88; g.save(); g.translate(ox - o.x, oy - o.y); paint(g); g.restore();
  const crop = U.canvas(w, h); crop.getContext('2d').drawImage(tbuf, 0, 0);
  const out = scene.treat(crop) || crop;
  c.save(); c.globalAlpha *= o.alpha ?? 1; if (out.pixel) c.imageSmoothingEnabled = false; c.drawImage(out, o.x - ox, o.y - oy); c.restore();
}

// ---------- images ----------
function frameCanvas(key, i) {                       // crop one cell of a sheet (cached)
  const ck = `f|${key}|${i}`; if (CH.cache[ck]) return CH.cache[ck];
  const s = CH.def.sheets[key], n = s.grid[0] * s.grid[1], k = ((i % n) + n) % n, img = window.IMG[s.src];
  const [cw, chh] = s.cell, x0 = (k % s.grid[0]) * cw, y0 = Math.floor(k / s.grid[0]) * chh;
  const c = U.canvas(cw, chh); c.getContext('2d').drawImage(img, x0, y0, cw, chh, 0, 0, cw, chh);
  c.ax = s.anchor[0]; c.ay = s.anchor[1]; c.refH = s.height; return (CH.cache[ck] = c);
}
function frontCanvas() {
  if (CH.cache.front) return CH.cache.front;
  const f = CH.def.front, img = window.IMG[f.src], c = U.canvas(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0);
  c.ax = f.anchor[0]; c.ay = f.anchor[1]; c.refH = f.height; return (CH.cache.front = c);
}
// scene material pass, applied once per (scene, image) at native resolution, so zooming never changes the result
function treated(scene, key, i) {
  const src = key && CH.has(key) ? frameCanvas(key, i) : frontCanvas(), ck = `t|${scene.id}|${key && CH.has(key) ? key + '|' + i : 'front'}`;
  if (CH.cache[ck]) return CH.cache[ck];
  let out = src;
  if (scene.treat) { out = scene.treat(src) || src; if (out !== src) { out.ax = out.ax ?? src.ax; out.ay = out.ay ?? src.ay; out.refH = src.refH; } }
  return (CH.cache[ck] = out);
}

// o = { x, y (feet on screen), ground, scale, sx, sy, rot, alpha, key, frame, motion, facing, over, t, shadow }
CH.draw = (c, scene, o) => {
  if (!CH.def || (o.alpha ?? 1) <= 0.001) return;
  const h = CH.def.screenHeight * (o.scale ?? 1);
  c.save();
  if (o.shadow !== false && scene.shadow !== null) {
    const lift = Math.max(0, (o.ground ?? o.y) - o.y), a = 1 / (1 + lift / 120);
    c.globalAlpha = (o.alpha ?? 1) * a; c.fillStyle = scene.shadow || 'rgba(0,0,0,.18)';
    c.beginPath(); c.ellipse(o.x, (o.ground ?? o.y) + 2, h * 0.24 * a, h * 0.04 * a, 0, 0, Math.PI * 2); c.fill();
  }
  c.restore();
  if (CH.drawn) { drawDrawn(c, scene, o); return; }
  const cv = treated(scene, o.key, o.frame | 0), k = h / cv.refH;
  c.save(); c.globalAlpha = o.alpha ?? 1;
  c.translate(o.x, o.y); c.rotate(o.rot || 0); c.scale(o.sx || 1, o.sy || 1);
  if (cv.pixel) c.imageSmoothingEnabled = false;
  c.drawImage(cv, -cv.ax * k, -cv.ay * k, cv.width * k, cv.height * k);
  c.restore();
};
})();
