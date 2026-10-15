// portal-film runtime · boot. The film calls FILM({...}) from film.js; this loads its scene files and images, builds the
// timeline and exposes the render contract used by the browser preview and by scripts/render.cjs:
//   window.DURATION, window.renderFrame(t), window.ready (Promise), window.PLAN() (timeline facts as JSON)
(() => {
const loadScript = window.loadScript || ((src, module) => new Promise((ok, no) => { const s = document.createElement('script'); if (module) s.type = 'module'; s.src = src; s.onload = ok; s.onerror = () => no(new Error('script ' + src)); document.head.appendChild(s); }));
const loadImage = window.loadImage || (src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => no(new Error('image ' + src)); im.src = src; }));
window.IMG = {};
let resolveReady, rejectReady; window.ready = new Promise((a, b) => { resolveReady = a; rejectReady = b; });

window.FILM = async cfg => {
  try {
    window.FILM_CFG = cfg;
    for (const s of cfg.scenes) await loadScript(s);
    if (typeof cfg.character === 'string') {                                   // a drawn character: the file calls CHARACTER({...})
      const isModule = /\.mjs$/.test(cfg.character);                           // .mjs = ES module (e.g. a three.js character, live 3D)
      if (isModule && window.NO_MODULES) {
        if (!window.PLAN_ONLY) throw new Error(`${cfg.character} is an ES module (live 3D character): render this film in a browser with scripts/render_browser.py`);
        CHAR.define({ draw() {} });                                              // timing doesn't depend on the character
      } else await loadScript(cfg.character, isModule);
      if (CHAR.def && CHAR.def.ready) await CHAR.def.ready;                   // async setup (building a 3D model)
    }
    else if (cfg.character) CHAR.define(cfg.character);                        // an image character
    if (!CHAR.def) throw new Error('no character: set character in film.js');
    const imgs = [...CHAR.assets(), ...(cfg.images || [])];
    for (const s of Object.values(STAGE.scenes)) for (const src of s.images || []) imgs.push(src);
    await Promise.all([...new Set(imgs)].map(async src => { IMG[src] = await loadImage(src); }));
    for (const s of Object.values(STAGE.scenes)) if (s.setup) await s.setup();
    STAGE.build(cfg.shots.map(x => ({ ...x, out: x.out && { ...x.out } })));
    window.DURATION = STAGE.total;
    const cv = document.getElementById('c'), ctx = cv.getContext('2d');
    window.renderFrame = (t, off = 0) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, U.W, U.H); STAGE.draw(ctx, Math.max(0, Math.min(t, STAGE.total - 1e-6)), off); };
    window.PLAN = () => STAGE.plan();
    renderFrame(0); resolveReady(STAGE.total);
  } catch (e) { console.error(e); rejectReady(e); }
};
})();
