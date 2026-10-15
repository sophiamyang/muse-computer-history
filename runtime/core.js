// portal-film runtime · core helpers (window.U). Deterministic: every random value comes from U.rng / U.hash.
(() => {
const W = 1920, H = 1080;
const cache = {};
const U = window.U = {
  W, H,
  clamp: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
  lerp: (a, b, p) => a + (b - a) * p,
  ss: (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); },
  easeIO: p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  easeOut: p => 1 - Math.pow(1 - p, 3),
  easeSine: p => 0.5 - 0.5 * Math.cos(Math.PI * p),
  step: (t, fps) => Math.floor(t * fps) / fps,                     // held animation ("on twos", 8–12 fps looks)
  // mulberry32 seeded PRNG and an integer hash in [0,1)
  rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
  hash(i, j = 0) { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; },
  // smooth value noise in about [-1, 1]
  noise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, s = v => v * v * (3 - 2 * v);
    const n = (i, j) => U.hash(i, j) * 2 - 1, a = n(xi, yi), b = n(xi + 1, yi), c = n(xi, yi + 1), d = n(xi + 1, yi + 1);
    return U.lerp(U.lerp(a, b, s(xf)), U.lerp(c, d, s(xf)), s(yf)); },
  fbm(x, y, o = 4) { let v = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { v += a * U.noise(x * f, y * f); a *= 0.5; f *= 2; } return v; },
  canvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; },
  // build-once layers: U.cached('sky', w, h, g => { ...draw... }) returns the canvas
  cached(key, w, h, fn) { if (!cache[key]) { const c = U.canvas(w, h); fn(c.getContext('2d'), c); cache[key] = c; } return cache[key]; },
  // film grain canvas (cached), drawn with an offset that changes per frame to animate it
  grain(key, density = 0.08, alpha = 0.15, dark = true) { return U.cached('grain_' + key, 512, 512, g => { const r = U.rng(7);
    for (let i = 0; i < 512 * 512 * density; i++) { g.fillStyle = dark ? `rgba(0,0,0,${alpha * r()})` : `rgba(255,255,255,${alpha * r()})`; g.fillRect(r() * 512, r() * 512, 1 + r(), 1 + r()); } }); },
  tile(c, img, ox, oy) { for (let y = -512; y < H + 512; y += 512) for (let x = -512; x < W + 512; x += 512) c.drawImage(img, x + (ox % 512), y + (oy % 512)); },
  // parallel hatching inside the current clip: tone 0..1 -> line weight
  hatch(c, x, y, w, h, angle, gap, color, width = 1) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = color; c.lineWidth = width;
    const d = Math.hypot(w, h), cx = x + w / 2, cy = y + h / 2, ca = Math.cos(angle), sa = Math.sin(angle);
    for (let k = -d; k <= d; k += gap) { c.beginPath(); c.moveTo(cx + ca * -d - sa * k, cy + sa * -d + ca * k); c.lineTo(cx + ca * d - sa * k, cy + sa * d + ca * k); c.stroke(); } c.restore(); },
  rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
  text(c, str, x, y, { font = '32px sans-serif', color = '#222', align = 'left', base = 'alphabetic', alpha = 1 } = {}) { c.save(); c.globalAlpha *= alpha; c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = base; c.fillText(str, x, y); c.restore(); },
  // pixelate a canvas into a new canvas (nearest-neighbour look for 8-bit scenes)
  pixelate(src, px) { const w = Math.max(1, Math.round(src.width / px)), h = Math.max(1, Math.round(src.height / px)), s = U.canvas(w, h), g = s.getContext('2d'); g.drawImage(src, 0, 0, w, h);
    const out = U.canvas(src.width, src.height), o = out.getContext('2d'); o.imageSmoothingEnabled = false; o.drawImage(s, 0, 0, src.width, src.height); return out; },
};
})();
