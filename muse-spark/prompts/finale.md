# You are writing ONE scene of a portal film (portal-film runtime). Follow this contract exactly.

The film "A Short History of Computing" is 9 calm scenes joined by handovers *through objects*: the camera pushes into
an object in a scene, where the next scene is already playing, or pulls back to show that the last scene was on a screen
in the next one. The runtime (`runtime/*.js`) owns the timeline, the character, the camera moves, badges' placement
and the fades. Your file only registers the scene with `SCENE({...})` and draws its world on a 1920×1080 canvas 2D.

The film plays two ways from the same code:
1. a **video**, where everything plays by itself, and
2. a **website** (site.html), where the visitor is inside the scene: Jolly waits; the visitor clicks the PROP
   (`act.hotspot`) to make the action happen, then clicks the OBJECT (the portal) to travel. While waiting, film time
   `s.t`/`s.u` stops but `s.now` keeps running, so **drive every living detail (blinking lamps, steam, reels, grain
   offsets, marquee, clouds) with `s.now`, and the action and its reactions with `s.u`.**

## File shape

A plain script (not a module; no imports, no exports). It calls `SCENE({ ... })` once. Everything you need is global:
`U` (helpers, source below), `SCENE`. Keep all helper functions and constants INSIDE the object or inside an IIFE
around the SCENE call, so names never collide with other scene files (they all share one global scope):

```js
(() => {
  const INK = '#2b1d10';            // your constants
  function gear(c, x, y, r, a) {}   // your helpers
  SCENE({ id: '…', … });
})();
```

## The interface (from references/scenes.md)
# Scenes

## Interface

```js
SCENE({
  id: 'workshop',            // used by shots and by act sheet keys (act_workshop)
  year: '1903', title: 'the bicycle shop',   // badge; omit year for a title-only badge, omit both for none
  badge(c, s, a) {},         // optional: draw your own badge instead
  floor: 790,                // ground line for the character (screen y)
  width: 1920,               // > 1920 only if the action walks far; the camera follows forward-only, smoothed
  act: {
    at: 1000,                // x of the action mark (world px)
    dur: 2.0,                // seconds
    path: u => ({ dx, dy }), // optional: movement during the action (u = seconds since act start)
    pose: u => ({ armR: 2.0, lookY: -0.5 }),   // drawn character: body/face during the action (see character.md)
    facing: 1,               // optional: which way to face during the action (-1 = left)
    hotspot: { x, y, w, h }, // website: what the visitor clicks to make the action happen (the prop); prompt: its hint
    frames: [[0, 0], [0.4, 1], [1.2, 2]],  // image character with act sheets: [time, frame] steps, or u -> frame
    key: 'act_workshop',     // optional: which sheet (default act_<id>)
  },
  portals: { window: { x, y, w, h, r, shape?, glow? } },
  images: ['assets/poster.png'],    // optional extra images; they load into IMG[src]
  setup() {},                // optional, once after images load
  characterStyle: { mode, ink, ... },   // drawn character: this scene's medium (see character.md)
  treat(img) { return canvas },     // optional character material pass (see below)
  shadow: 'rgba(0,0,0,.2)',  // contact shadow colour; null for none (e.g. scenes floating in space)
  music: { voice, bpm, root }, sfx: [{ u, kind }],   // for score.py
  page: { heading, text },  // website: caption when this scene takes the frame
  spots: [{ x, y, w, h, label, text }],   // website: extra things to click for a short note
  draw(c, s) {}, front(c, s) {},
});
```

`s` (the frame state): `t` seconds since this shot started, `now` the same plus any time the viewer spent waiting in an
interactive mode (use it for living details), `u` seconds since the action started (negative before),
`inAct`, `camX` (subtract from world x), `hero` `{x, y, facing, scale, alpha, motion, hands}` (world px; `hands.L/R` and
`hands.head` for drawn characters; scale and alpha follow hops, fly-ins and step-outs, so held props can match), `floor`, `W`, `H`, `peek(name, alpha)`, `shot`. Use `s.hero` to attach props to the character (a kite
string from the hand, a cup in the hand, a speech bubble by the head, a shadow on a wall).



## Drawing patterns

- **Cache everything static.** `U.cached('key', w, h, g => {...})` builds a layer once; draw it with
  `c.drawImage(bg, -s.camX, 0)`. Re-drawing thousands of grains per frame is slow and invites shimmer.
- **Living details, slow and smooth.** Steam, waves, dust in a light beam, a blinking cursor, a ticking clock, a drifting
  cloud. Drive them with `s.now` through sines and `U.noise` (not `s.t`, which pauses while an interactive viewer decides);
  keep periods ≥ 1.5 s. Small, continuous motion keeps a
  locked frame alive; the gate warns about "dead air" (nothing moving for 2.5 s).
- **No flicker.** Never re-seed random per frame (`U.rng(frame)` = TV snow). For grain/noise, draw a cached grain tile
  with an offset that changes at most every few frames: `U.tile(c, U.grain('k'), U.step(s.t, 8) * 97 % 512, 0)`.
  Stepped looks (8–12 fps) are fine when the whole scene steps together.
- **Depth with layers**: background in `draw`, then the character, then `front` (foreground objects, vignette, a
  window frame, rain on glass). Put a table edge or plant in `front` to seat the character in the space.
- **`U.hatch` and `U.rrect` start a new path**, so build the outline you want to stroke after calling them, not before.
- **Foreground and pulls:** while a pull's old picture fades out of its object (~1 s), the runtime draws the scene,
  then the fading picture, then the character, then `front()` — so props in `front()` stay on top as they should.
- **Text** with `U.text(c, str, x, y, { font, color, align })`. Keep words short; the film is watched, not read.
- **Medium per scene**: give each scene its own visual language (engraving hatches via `U.hatch`, pixel art via
  `U.pixelate`, flat print colours, glossy gradients, chalk on blackboard). Consistent palette inside a scene, contrast
  between scenes.

**Rings and holes:** because `U.rrect` (and `U.hatch`) start a new path, never build a ring from two `U.rrect` calls. Build the two shapes with raw path calls (`c.rect`, `c.arc`, `c.roundRect`) in ONE path, then `c.fill('evenodd')`.

## Your scene's numbers (hard requirements)

- Canvas 1920×1080, `width: 1920` (one locked frame; do not set width).
- **Jolly** (the character, a cream plush drawn by the runtime as live 3D, NOT by you) stands with her feet on `floor`
  (screen y) and is **330 px tall, about 230 px wide**. Feet centre x = `act.at` during the action. She faces RIGHT
  during the action. Her lead mitten (right side of the picture) reaches about 110–150 px right of her centre: at
  shoulder height (≈ floor − 190) with `armR ≈ 1.6`, up to ≈ floor − 300 with `armR ≈ 2.6`, down at ≈ floor − 120 with
  `armR ≈ 0.9`. So put the prop she touches at about `act.at + 130`, at the height that matches the arm pose you give
  her. She walks in from about 380 px left of `act.at` before the action.
- Her pose numbers in `act.pose(u)` (u = seconds since the action started; ease every change with `U.ss` / `U.lerp`,
  nothing may jump between frames): `armR`, `armL` (radians from straight down, + = forward/up; 0.12 = hanging),
  `elbowR`, `elbowL` (folded into the shoulder), `crouch` (0..1, a squash), `lift` (fraction of height, e.g. 0.12 = a hop
  of 40 px; use for jumps), `lean` (forward tilt, radians, ±0.3), `lookY` (−1 up … 1 down; tips her body slightly).
  `mouth`, `look` and `headTilt` have no effect on her. Give her anticipation (a small crouch or wind-up), the action,
  and a beat of hold.
- **Restyling Jolly for your era** (she keeps her shape and cream look; only the material changes):
  - `characterStyle: { tint: '#rrggbb', tintAlpha: 0.0–0.6 }` washes her with a colour (sepia ink, warm print, CRT glow…)
  - `characterStyle: { mode: 'silhouette', ink: '#111' }` makes her one flat colour (use only if your medium is
    a silhouette medium; she stays recognisable by her shape)
  - `treat(img) { … return canvas }` is a pixel pass on her rendered image each frame (e.g.
    `const o = U.pixelate(img, 8); o.pixel = true; return o;` for pixel art; filters like
    `g.filter = 'grayscale(1) contrast(1.15)'` for a newsreel; a hatching overlay drawn `source-atop` for an engraving).
    It runs EVERY FRAME on a ~600×560 canvas, so keep it light (one or two drawImage passes, no per-pixel JS loops).
  - Go light: Jolly must stay clearly a cream plush with a peach face and black eyes in every scene, except where the
    medium is truly black-and-white (newsreel: grey tones are fine).
- `act.dur` is given below; the action and its reaction must finish inside it.
- `act.hotspot: { x, y, w, h }` = the PROP the visitor clicks (screen px at rest), drawn and clearly visible, at least
  120×120 px, not overlapping the badge (top right, x > 1380, y < 200) or the bottom-left caption area
  (x < 760, y > 860). `act.prompt` = a short invitation in the scene's world (given below).
- Portals: `{ x, y, w, h, r }` (r = corner radius) or add `shape: 'circle'`. The zoom into a portal is
  1920 / max(w, h·16/9) and must be between **3× and 8×**, so the portal's cover width (max(w, h·16/9)) must be between
  **240 and 640 px**. Draw a clear frame, bezel or rim around it, bright against its surroundings, so a viewer sees the
  object *before* the camera moves. Keep it within ~450 px horizontally of `act.at` and clear of the badge and of
  Jolly's body. Add `glow: 'rgba(…)'` for screens and lamps.
- **Push portal** (an object in YOUR scene that the camera goes into): call `s.peek('name')` inside your draw where the
  object's opening is, so the object already shows the next world at rest. Draw the frame/bezel around it yourself, after
  the peek.
- **Pull portal** (rule: owned by the NEXT scene). If your scene owns a pull portal, the previous scene was "on" this
  object: during the handover the runtime draws the previous scene inside the portal rect; afterwards your `draw` shows
  the object's own picture (or `s.peek('name')` for a still of the previous world).
- `spots: [{ x, y, w, h, label, text }]`: 1–2 extra things to click on the website, each on a visible object in your
  scene (not the prop, not the portal), at least 90×90 px. `label` = 1–4 words; `text` = ONE short line (max ~110
  characters): a fact or a gentle joke about the era. Only facts you are sure of; avoid exact numbers unless certain.
- `page: { heading, text }`: the website caption when the scene takes the frame. `heading` 2–6 words; `text` one or two
  sentences (max ~220 characters) on what this era added to computing, for a general audience, warm and plain. No dates
  you're unsure of.
- **Badge**: write your own `badge(c, s, a)` (top right; the runtime sets globalAlpha, you draw) styled in your era's
  medium, showing the year and era name exactly as given below, right-aligned to x = 1890, top at y ≈ 48, max 480 px
  wide and 130 px tall.
- `music: { voice, bpm, root }` and `sfx: [{ u, kind }]` as given below; `u` = seconds after the action starts, matching
  the moments in your action (kinds: tick, click, chime, whoosh, thump, beep, pop).
- `shadow`: a contact shadow colour that suits your medium (`'rgba(…)'`), or leave the default.

## Rules
- Deterministic: no Math.random, no Date. Use `U.rng(seed)` (only inside `U.cached` builders), `U.hash(i, j)`, `U.noise`.
- Cache all static drawing with `U.cached('<sceneid>_bg', 1920, 1080, g => {…})` and draw it with `c.drawImage(bg, 0, 0)`.
  A frame must draw in under ~12 ms: animate only the moving parts.
- No flicker: grain/noise must be a cached tile drawn with an offset that changes at most ~8 times a second
  (`U.tile(c, U.grain('k'), U.step(s.now, 8) * 97 % 512, 0)`). Slow, smooth living details (periods ≥ 1.5 s).
- Calm locked frame: never move or zoom the whole picture.
- Text: system fonts only (Georgia, "Times New Roman", "Courier New", Helvetica, Arial, monospace, serif, sans-serif).
- No real brands, logos, product names or trademarked UI (no real operating systems, phones, browsers, games, app
  icons). Generic, invented devices and pages only. No other characters or people (no hands, no silhouettes of people).
- Keep `c` state balanced (every save has a restore). Never leave a clip, transform, filter, alpha or composite mode set.
- Your scene must look unmistakably like its medium and era at a glance, be beautiful, and keep small things moving.

## Reference: runtime/core.js (window.U)
```js
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

```

## Reference: three complete example scenes from the starter film (kitchen → postcard seaside → TV in the living room)
```js
// Scene: a kitchen in the morning. The postcard on the wall is the portal into the seaside.
SCENE({
  id: 'kitchen', year: '7:40', title: 'a kitchen, morning',
  page: { heading: 'A postcard on the wall', text: 'Every morning Pip looks at the same postcard. Today it looks back.' },   // the caption on the click-through page (site.html)
  floor: 790,
  act: {                                                // the character stops here, looks up at the postcard and points
    at: 1030, dur: 1.8,
    hotspot: { x: 1150, y: 280, w: 280, h: 200 }, prompt: 'look at the postcard',   // explore: click the postcard
    pose: u => ({ armR: U.lerp(0.12, 2.1, U.ss(0.3, 0.7, u)), elbowR: 0.15, lookY: -0.7 * U.ss(0, 0.3, u), headTilt: -0.18 * U.ss(0, 0.3, u),
      mouth: u > 0.8 ? 'o' : 'smile' }),
  },
  portals: { postcard: { x: 1170, y: 300, w: 240, h: 160, r: 4 } },
  spots: [{ x: 455, y: 440, w: 150, h: 120, label: 'The kettle', text: 'Still warm. Pip makes tea before every trip.' }],
  music: { voice: 'piano', bpm: 92, root: 62 },         // read by scripts/score.py
  sfx: [{ u: 0.2, kind: 'tick' }, { u: 1.2, kind: 'chime' }],

  draw(c, s) {
    const bg = U.cached('kitchen_bg', 1920, 1080, g => {
      let gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, '#f4ead8'); gr.addColorStop(0.73, '#ecdcc0'); gr.addColorStop(0.731, '#c9a77f'); gr.addColorStop(1, '#a8845e');
      g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
      for (let x = 0; x < 1920; x += 64) { g.fillStyle = x % 128 ? 'rgba(0,0,0,.03)' : 'rgba(0,0,0,.05)'; g.fillRect(x, 790, 64, 290); }   // floorboards
      g.fillStyle = '#fbf6ec'; g.fillRect(140, 180, 420, 360); g.strokeStyle = '#b89d78'; g.lineWidth = 14; g.strokeRect(140, 180, 420, 360);   // window
      gr = g.createLinearGradient(140, 180, 560, 540); gr.addColorStop(0, '#cfe3ee'); gr.addColorStop(1, '#f7e9c8'); g.fillStyle = gr; g.fillRect(147, 187, 406, 346);
      g.fillStyle = '#b89d78'; g.fillRect(343, 187, 14, 346); g.fillRect(147, 353, 406, 12);
      g.fillStyle = '#d8c4a4'; g.fillRect(0, 560, 760, 230); g.fillStyle = '#8f6f50'; g.fillRect(0, 548, 780, 22);                // counter
      for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(80,60,40,.25)'; g.lineWidth = 2; g.strokeRect(20 + i * 125, 590, 110, 180); }
      for (let y = 380; y < 548; y += 28) for (let x = 0; x < 780; x += 28) { g.strokeStyle = 'rgba(120,100,80,.12)'; g.strokeRect(x, y, 28, 28); }  // tiles
      g.fillStyle = '#5a6e7a'; U.rrect(g, 470, 470, 120, 80, 18); g.fill(); g.fillRect(500, 452, 60, 22);                         // kettle
      g.fillStyle = '#e7dccb'; U.rrect(g, 1540, 170, 300, 620, 18); g.fill(); g.strokeStyle = '#c6b49a'; g.lineWidth = 4; g.stroke();  // fridge
      g.beginPath(); g.moveTo(1540, 420); g.lineTo(1840, 420); g.stroke(); g.fillStyle = '#b8a68c'; g.fillRect(1570, 300, 12, 90); g.fillRect(1570, 450, 12, 120);
    });
    c.drawImage(bg, -s.camX, 0);
    const sun = 0.5 + 0.5 * Math.sin(s.now * 0.6);                                                    // slow light breathing, no flicker
    c.save(); c.globalAlpha = 0.10 + 0.04 * sun; c.fillStyle = '#fff4d6'; c.beginPath(); c.moveTo(147, 533); c.lineTo(553, 533); c.lineTo(1000, 1080); c.lineTo(420, 1080); c.closePath(); c.fill(); c.restore();
    for (let i = 0; i < 3; i++) { const k = (s.now * 0.35 + i / 3) % 1; c.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; c.beginPath(); c.arc(530 + Math.sin(k * 6 + i) * 10, 450 - k * 120, 10 + k * 18, 0, 7); c.fill(); }  // steam
    // the postcard: the next world is already in it
    const p = this.portals.postcard;
    c.save(); c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = '#fff'; U.rrect(c, p.x - 10, p.y - 10, p.w + 20, p.h + 20, 6); c.fill(); c.restore();
    s.peek('postcard');
    c.fillStyle = '#c0392b'; c.beginPath(); c.arc(p.x + p.w / 2, p.y - 2, 9, 0, 7); c.fill();                                       // pin
  },
});


// Scene: the painted seaside inside the postcard. The character walks the shoreline flying a kite.
// Its material pass (treat) makes the character look painted too, so it belongs to this medium.
SCENE({
  id: 'seaside', year: '', title: 'greetings from the sea',
  page: { heading: 'Inside the postcard', text: 'The sea is painted, the wind is real, and the kite goes up on the first try.' },   // the caption on the click-through page (site.html)
  floor: 820,
  act: {                                                                    // walks along the shore while the kite flies
    at: 760, dur: 2.6, prompt: 'fly the kite', path: u => ({ dx: 260 * U.easeSine(u / 2.6), dy: 0 }),
    pose: u => ({ armR: U.lerp(0.12, 2.5, U.ss(0, 0.5, u)), elbowR: 0.2, lookY: -0.5, mouth: 'open' }),
  },
  characterStyle: { ink: '#5a4636', line: 0.8, coat: '#f0c060', scarf: '#4aa59a' },   // softer, printed-card colours
  spots: [{ x: 1370, y: 210, w: 180, h: 180, label: 'The sun', text: 'Painted on in one stroke, like everything on a postcard.' }],
  music: { voice: 'music_box', bpm: 100, root: 67 },
  sfx: [{ u: 0.0, kind: 'whoosh' }, { u: 1.4, kind: 'chime' }],
  treat(img) {                                                              // warm, soft, slightly faded: like printed card
    const o = U.canvas(img.width, img.height), g = o.getContext('2d');
    g.filter = 'saturate(0.75) sepia(0.25) contrast(0.95)'; g.drawImage(img, 0, 0); g.filter = 'none';
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,214,170,.10)'; g.fillRect(0, 0, o.width, o.height);
    return o;
  },
  shadow: 'rgba(120,80,40,.18)',

  draw(c, s) {
    const bg = U.cached('sea_bg', 1920, 1080, g => {
      let gr = g.createLinearGradient(0, 0, 0, 640); gr.addColorStop(0, '#9fd0e6'); gr.addColorStop(1, '#f6dfb8'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 640);
      g.fillStyle = '#ffe7a8'; g.beginPath(); g.arc(1460, 300, 90, 0, 7); g.fill();
      const r = U.rng(3); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${0.05 * r()})`; g.beginPath(); g.arc(r() * 1920, r() * 640, 6 + r() * 30, 0, 7); g.fill(); }  // paper-soft sky
      gr = g.createLinearGradient(0, 600, 0, 760); gr.addColorStop(0, '#5aa3b8'); gr.addColorStop(1, '#8cc5c9'); g.fillStyle = gr; g.fillRect(0, 600, 1920, 170);
      gr = g.createLinearGradient(0, 740, 0, 1080); gr.addColorStop(0, '#ecd3a4'); gr.addColorStop(1, '#d9b67f'); g.fillStyle = gr; g.fillRect(0, 760, 1920, 320);
      for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,80,40,${0.06 * r()})`; g.fillRect(r() * 1920, 760 + r() * 320, 2, 2); }   // sand grain
      g.fillStyle = 'rgba(255,255,255,.9)'; g.font = 'italic 600 64px serif'; g.fillText('Greetings from the sea', 120, 140);
    });
    c.drawImage(bg, -s.camX, 0);
    for (let k = 0; k < 4; k++) {                                            // waves roll in slowly
      const y = 640 + k * 30, ph = s.now * (0.5 + k * 0.15);
      c.strokeStyle = `rgba(255,255,255,${0.35 - k * 0.06})`; c.lineWidth = 3; c.beginPath();
      for (let x = 0; x <= 1920; x += 20) c.lineTo(x, y + Math.sin(x / 90 + ph + k) * 4); c.stroke();
    }
    const fx = 1920 * ((s.now * 0.04 + 0.1) % 1); c.strokeStyle = '#3d4b55'; c.lineWidth = 3;    // a gull drifts across
    c.beginPath(); c.moveTo(fx - 18, 230); c.quadraticCurveTo(fx - 8, 218, fx, 230); c.quadraticCurveTo(fx + 8, 218, fx + 18, 230); c.stroke();
    // the kite rises during the act; its string ends at the character's raised hand
    const up = U.ss(0, 0.8, s.u), hand = s.hero.hands ? s.hero.hands.R : { x: s.hero.x + 40, y: s.hero.y - 210 }, hx = hand.x - s.camX, hy = hand.y;
    if (s.u > 0) { const kx = hx + 260 + Math.sin(s.now * 1.3) * 20, ky = hy - 120 - 260 * up + Math.cos(s.now * 1.7) * 14;
      c.strokeStyle = 'rgba(60,60,60,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo((hx + kx) / 2, hy - 20, kx, ky + 50); c.stroke();
      c.save(); c.translate(kx, ky); c.rotate(Math.sin(s.now * 1.1) * 0.12); c.fillStyle = '#e8594a'; c.beginPath(); c.moveTo(0, -50); c.lineTo(38, 0); c.lineTo(0, 50); c.lineTo(-38, 0); c.closePath(); c.fill();
      c.fillStyle = '#f2c14e'; c.beginPath(); c.moveTo(0, -50); c.lineTo(38, 0); c.lineTo(0, 0); c.closePath(); c.fill(); c.restore(); }
  },
  front(c, s) {                                                              // card edge vignette, drawn over the character too
    const v = U.cached('sea_vig', 1920, 1080, g => { const gr = g.createRadialGradient(960, 540, 500, 960, 540, 1150); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(90,60,30,.28)'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); });
    c.drawImage(v, 0, 0);
  },
});


// Scene: a living room in the evening. The seaside was playing on this TV all along; the character steps out of it.
SCENE({
  id: 'livingroom', year: '21:15', title: 'a living room, evening',
  page: { heading: 'Home by the TV', text: 'It was on the television all along. Pip steps out, waves goodnight.' },   // the caption on the click-through page (site.html)
  floor: 840,
  act: {                                                // waves goodnight
    at: 1330, dur: 2.0, prompt: 'say goodnight',
    pose: u => { const up = U.ss(0, 0.35, u); return { armR: U.lerp(0.12, 1.5, up), elbowR: U.lerp(0.25, 1.35, up) + 0.4 * Math.sin(u * 8) * U.ss(0.3, 0.6, u), look: 0.6, mouth: 'open' }; },
  },
  portals: { tv: { x: 640, y: 330, w: 440, h: 250, r: 16, glow: 'rgba(150,200,255,.8)' } },
  spots: [{ x: 220, y: 240, w: 160, h: 140, label: 'The lamp', text: 'Left on for whoever comes home last.' }],
  music: { voice: 'vibes', bpm: 84, root: 60 },
  sfx: [{ u: 0.3, kind: 'chime' }],

  draw(c, s) {
    const bg = U.cached('lr_bg', 1920, 1080, g => {
      let gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, '#2c3348'); gr.addColorStop(0.76, '#3b4058'); gr.addColorStop(0.761, '#5a4a44'); gr.addColorStop(1, '#3e322e'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
      g.fillStyle = '#4a3c36'; g.fillRect(560, 600, 600, 60); g.fillRect(590, 660, 30, 180); g.fillRect(1100, 660, 30, 180);   // TV stand
      g.fillStyle = '#16181e'; U.rrect(g, 620, 312, 480, 290, 22); g.fill();                                                    // TV body
      g.fillStyle = '#6b4f6e'; U.rrect(g, 1240, 600, 560, 200, 40); g.fill(); g.fillStyle = '#7d5f80'; U.rrect(g, 1260, 520, 520, 120, 40); g.fill();   // sofa
      g.fillStyle = '#b48c5a'; g.fillRect(290, 340, 10, 500); g.fillStyle = '#f3d9a3'; g.beginPath(); g.moveTo(230, 340); g.lineTo(360, 340); g.lineTo(330, 250); g.lineTo(260, 250); g.closePath(); g.fill();  // lamp
    });
    c.drawImage(bg, -s.camX, 0);
    const warm = c.createRadialGradient(295, 320, 20, 295, 320, 620); warm.addColorStop(0, 'rgba(255,214,150,.35)'); warm.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = warm; c.fillRect(0, 0, 1920, 1080);
    // the TV's own picture (after the afterglow hands it back): a calm test card
    const p = this.portals.tv; c.save(); U.rrect(c, p.x, p.y, p.w, p.h, p.r); c.clip();
    const cols = ['#d7d7d7', '#d7d24a', '#4ad7d2', '#4ad74f', '#d74ad2', '#d74a4a', '#4a4ad7'];
    cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(p.x + i * p.w / 7, p.y, p.w / 7 + 1, p.h); });
    c.fillStyle = 'rgba(20,24,40,.35)'; c.fillRect(p.x, p.y, p.w, p.h); c.restore();
    for (let i = 0; i < 26; i++) {                                           // dust drifting through the lamp light, so the room breathes
      const r = U.hash(i, 9), y = 820 - ((s.now * (8 + 10 * r) + 600 * U.hash(i, 3)) % 600), x = 200 + 200 * U.hash(i, 5) + Math.sin(s.now * 0.4 + i) * 20;
      c.fillStyle = `rgba(255,230,180,${0.25 + 0.25 * Math.sin(s.now + i)})`; c.beginPath(); c.arc(x, y, 1.5 + 2 * r, 0, 7); c.fill();
    }
    const glow = c.createRadialGradient(860, 455, 50, 860, 455, 520); glow.addColorStop(0, 'rgba(150,200,255,.18)'); glow.addColorStop(1, 'rgba(150,200,255,0)'); c.fillStyle = glow; c.fillRect(0, 0, 1920, 1080);
  },
});

```


# YOUR TASK: write `scenes/finale.js`, scene 9 of 9

- `id: 'finale'`, `year: 'Now'`, `title: 'Muse Spark on Fireworks'` (badge shows "Now · Muse Spark on Fireworks")
- `act.dur: 7.4`; `act.prompt: 'ask the laptop'`
- music: `{"voice": "full", "bpm": 96, "root": 62}`; sfx: tick for typing (a few), beep on each count 3, 2, 1, thump when the lid closes, chime when the words form

## The scene
NOW: a WARM DUSK ROOM. Palette: warm neutrals #F4F0EC and #121212 with Fireworks colours Glow #F56A2B, Flare #FB2D74, Bloom #7A155C, Plum #F0ACD6 (no blue-purple gradients, no neon violet). A big window (at least 1000×520) over a city skyline at dusk (warm charcoal sky warming to amber at the horizon, warm window lights in the buildings), a desk across the bottom of the frame (its top surface is the floor Jolly stands on), a desk lamp with a warm pool of light, a plant. A generic LAPTOP open on the desk (dark aluminium, no logo, a plain warm text field UI on its screen). At the start Jolly STEPS OUT OF THE LAPTOP SCREEN (the runtime does this, the screen is the pull portal) onto the desk and walks to her mark beside it. ACTION (s.u from 0 to 7.4, then the film holds 3.4 s more while s.u keeps increasing; keep everything driven by s.u so it holds still at the end): 0.0–1.4 the laptop types 'light up the sky?' (letters appear one by one, cursor blink); 1.4–3.0 it answers 'On it… 3… 2… 1…' (each count lands on a beat); 3.0–3.8 Jolly reaches and CLOSES THE LID (the lid rotates down onto the base, the screen light goes out); 3.8–6.0 FIREWORKS burst over the city outside the window: 6–9 big bursts (radius 120–260 px) with bright cores, sparkle trails, gravity droop, additive glow ('lighter'), in Glow/Flare/Plum with Bloom halos, the room flashing warm; 6.0–7.4 the sparks settle into the words 'Muse Spark' (large elegant serif, luminous) with 'now on Fireworks' below (smaller), sampled from text drawn on an offscreen canvas, inside the window; and a 'fireworks.ai' sign (a lit sign on the wall or in the window frame, ~44 px text, glowing border) lights up. After s.u = 7.4 everything holds steady and readable (only a gentle shimmer) until the fade. Jolly turns to look at the sky and gives a small wave.

## Jolly in this medium
characterStyle {} (her natural cream; the room light can warm her: tint '#F56A2B' tintAlpha 0.08).

## Portals
ONE portal: 'laptop' (the PULL portal: the laptop SCREEN, about 360×225 px, r≈8, on the desk near the centre; the previous scene (the datacenter) is shown in it during the pull, and Jolly steps out of its bottom edge onto the desk). Its rect must stay exactly where the open screen is drawn. After the pull, draw your own laptop UI in it. Put act.at about 260–380 px left of the laptop's centre so she stands beside it and the screen text is never hidden behind her; she reaches right to close the lid.


## Neighbours (for continuity)
- previous scene: "2026 · GPU clusters"
- next scene: none (the film ends here; the website shows an end card after it)

Return the complete file.