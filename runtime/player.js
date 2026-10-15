// portal-film runtime · live player (browser only; skipped with ?render=1). Plays the film in real time in one of
// three modes, records it to a video file, and keeps the score in sync.
//
//   film       plays straight through (scrub, pause). The default.
//   storybook  stops at each scene's action until the viewer clicks the hotspot (or presses Space), and before each
//              handover until they click the portal. Living details and the character's idle keep moving.
//   play       like storybook, and the character only walks while → (or D, or a held touch) is down.
//   explore    you are in the scene: it waits at each action and each portal like storybook, but hints only appear
//              after a few seconds (cfg.hintDelay, default 2.5) or after a click in the wrong place; hovering a place
//              you can click highlights it; scene.spots [{x,y,w,h,label,text}] are extra places to click for a note.
//              Used by site.html.
//   pages      click-through: each scene is a page; its action plays by itself, then it waits for "next" (a click
//              anywhere, →, Space, or PLAYER.next()) before the handover. Used by site.html.
//
// URL: ?mode=storybook|play, ?autoplay=1, ?perf=1 (or #storybook / #play / #perf where query strings are dropped);
// #t26 opens paused at 2.6 s (handy for review links). Record captures the canvas (no overlay hints) plus the score to a .webm
// (or .mp4 where the browser records mp4). Scenes can set act.hotspot {x,y,w,h} and act.prompt / portal prompt text
// (shot.out.prompt); defaults: a box around the character, "click".
(() => {
if (/render=1/.test(location.search)) return;
const Q = new URLSearchParams(location.search), HASH = (location.hash || '').slice(1).split(/[^a-z0-9]+/i);   // #storybook, #play, #perf, #storybook-perf also work
const $ = id => document.getElementById(id);
const E = id => $(id) || { style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} } };   // controls are optional (custom pages)

ready.then(total => {
  const ST = STAGE, cfg = window.FILM_CFG || {}, main = $('c');
  // ---- overlay for hints (not part of the film frame, so recordings stay clean) ----
  const ov = $('overlay'), oc = ov.getContext('2d');
  // ---- gates: where interactive modes wait ----
  const gates = [];
  ST.shots.forEach((sh, k) => {
    const a = sh.start + sh.aLocal;
    gates.push({ k, kind: 'act', t: a, sh });
    if (sh.out) gates.push({ k, kind: 'out', t: a + sh.D + 0.05, sh });
  });
  const state = { t: 0, off: 0, mode: Q.get('mode') || ['storybook', 'play', 'film'].find(m => HASH.includes(m)) || cfg.mode || 'film', playing: false, gate: null, done: new Set(), walkKey: false, last: 0 };

  // ---- audio: the score file, if film.js names one (cfg.audio) ----
  let audio = null, actx = null, dest = null;
  if (cfg.audio) { audio = new Audio(cfg.audio); audio.preload = 'auto'; audio.crossOrigin = 'anonymous'; }
  const ensureAudioGraph = () => {
    if (!audio || actx) return;
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); const src = actx.createMediaElementSource(audio);
      dest = actx.createMediaStreamDestination(); src.connect(actx.destination); src.connect(dest); } catch (e) { console.warn('audio graph', e); }
  };
  const shotAt = t => ST.shots.find(sh => t >= sh.start && t < sh.end) || ST.shots[ST.shots.length - 1];
  const syncAudio = () => {
    if (!audio) return;
    if (!state.playing) { if (!audio.paused) audio.pause(); return; }
    if (audio.paused) audio.play().catch(() => {});
    audio.volume = state.gate ? Math.max(0.25, 1 - (state.off - state.gateOff0) / 4) : 1;   // waits get quieter
    if (state.gate) {                                   // waiting: loop the bar leading into the gate
      const bpm = (shotAt(state.t).sc.music || {}).bpm || 92, bar = 4 * 60 / bpm;
      if (audio.currentTime > state.gate.t + 0.02) audio.currentTime = Math.max(0, state.gate.t - bar + (audio.currentTime - state.gate.t));
      return;
    }
    if (Math.abs(audio.currentTime - state.t) > 0.12) audio.currentTime = state.t;
  };

  // ---- hotspots ----
  const heroBox = (sh, local) => { const p = ST.pose(sh, local), camX = ST.camAt(sh, local), h = CHAR.def.screenHeight * p.scale;
    return { x: p.x - camX - h * 0.4, y: p.y - h * 1.05, w: h * 0.8, h: h * 1.1 }; };
  const gateBox = g => {
    if (g.kind === 'act') return g.sh.act.hotspot || heroBox(g.sh, g.t - g.sh.start);
    return g.sh.out.type === 'push' ? g.sh.out.portal : { x: 0, y: 0, w: U.W, h: U.H };
  };
  const gatePrompt = g => g.kind === 'act' ? (g.sh.act.prompt || 'click') : (g.sh.out.prompt || (g.sh.out.type === 'push' ? 'go in' : 'click anywhere to step back'));
  const inBox = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  const resolveGate = () => { if (!state.gate) return; state.done.add(state.gate); state.gate = null; };

  // ---- spots: extra places to click in a scene (explore / storybook) ----
  const spotListeners = [];
  const activeSpots = () => {
    if (state.mode === 'film' || state.mode === 'pages') return [];
    const sh = shotAt(state.t), local = state.t - sh.start, next = ST.shots[ST.shots.indexOf(sh) + 1];
    if (local < sh.Lin + sh.E || (next && state.t >= next.start)) return [];            // not during handovers
    const dx = -(ST.camAt(sh, local) - sh.cam0);
    return (sh.sc.spots || []).map(sp => ({ ...sp, x: sp.x + dx, spot: sp, scene: sh.scene }));
  };
  const pill = (text, x, y, a = 1) => {                  // a hint label that reads on any background
    oc.save(); oc.globalAlpha = a; oc.font = '600 28px system-ui, sans-serif'; const w = oc.measureText(text).width + 36, h = 46;
    oc.fillStyle = 'rgba(16,14,12,.72)'; U.rrect(oc, x - w / 2, y - h / 2 - 9, w, h, h / 2); oc.fill();
    oc.fillStyle = '#fff'; oc.textAlign = 'center'; oc.fillText(text, x, y + 1); oc.restore(); };
  const wrapText = (c, text, x, y, w, lh) => { let line = ''; for (const word of text.split(' ')) { const tryL = line ? line + ' ' + word : word;
    if (c.measureText(tryL).width > w && line) { c.fillText(line, x, y); y += lh; line = word; } else line = tryL; } if (line) c.fillText(line, x, y); };

  // ---- the loop ----
  const step = now => {
    const dt = Math.min(0.1, (now - state.last) / 1000); state.last = now;
    if (state.playing) {
      if (state.gate) state.off += dt;
      else {
        let adv = dt;
        if (state.mode === 'play') {                     // walking only while the key is held
          const sh = shotAt(state.t), local = state.t - sh.start, walking = local >= sh.Lin + sh.E && local < sh.aLocal;
          if (walking && !state.walkKey) { adv = 0; state.off += dt; }
        }
        let nt = state.t + adv;
        if (state.mode !== 'film') { const g = gates.find(g => !state.done.has(g) && (state.mode !== 'pages' || g.kind === 'out') && g.t > state.t - 1e-6 && g.t <= nt); if (g) { nt = g.t; if (state.autoNext === g.k && g.kind === 'out') { state.done.add(g); state.autoNext = null; } else { state.gate = g; state.gateOff0 = state.off; } } }
        state.t = nt;
        if (state.t >= total) { state.t = total; state.playing = false; if (rec) stopRecording(); }
      }
    }
    draw(); syncAudio();
    requestAnimationFrame(step);
  };
  let ms = 0;
  let draw = () => {
    const r0 = performance.now(); renderFrame(state.t, state.off); ms = ms * 0.9 + (performance.now() - r0) * 0.1;
    oc.clearRect(0, 0, ov.width, ov.height);
    if (state.gate && state.mode === 'pages') {          // pages: only a quiet pulse on the object we'll go through
      const b = gateBox(state.gate), k = 0.5 + 0.5 * Math.sin(performance.now() / 400);
      if (b.w < U.W) { oc.save(); oc.strokeStyle = `rgba(255,255,255,${0.25 + 0.35 * k})`; oc.lineWidth = 3; U.rrect(oc, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 14); oc.stroke(); oc.restore(); }
    } else if (state.gate && state.mode === 'explore') { // explore: hints wait, hover answers
      const b = gateBox(state.gate), waited = state.off - state.gateOff0, now = performance.now();
      const hinted = waited > (cfg.hintDelay ?? 2.5) || now - (state.missAt || -1e9) < 6000, hover = state.hover && inBox(b, state.hover.x, state.hover.y);
      const full = b.w >= U.W;
      if (hinted || hover) {
        const k = 0.5 + 0.5 * Math.sin(now / 420), a = hover ? 0.85 : 0.35 + 0.35 * k;
        oc.save(); oc.shadowColor = 'rgba(0,0,0,.45)'; oc.shadowBlur = 14;
        if (!full) { oc.strokeStyle = `rgba(255,255,255,${a})`; oc.lineWidth = hover ? 4 : 3; U.rrect(oc, b.x - 8, b.y - 8, b.w + 16, b.h + 16, 18); oc.stroke(); }
        oc.restore(); pill(gatePrompt(state.gate), full ? U.W / 2 : b.x + b.w / 2, full ? U.H - 80 : Math.max(56, b.y - 30), Math.min(1, a + 0.25));
      }
      if (state.ripple && now - state.ripple.at < 600) { const r = (now - state.ripple.at) / 600; oc.save(); oc.strokeStyle = `rgba(255,255,255,${0.6 * (1 - r)})`; oc.lineWidth = 3; oc.beginPath(); oc.arc(state.ripple.x, state.ripple.y, 10 + 50 * r, 0, 7); oc.stroke(); oc.restore(); }
    } else if (state.gate) {                            // a soft pulsing ring and the prompt
      const b = gateBox(state.gate), k = 0.5 + 0.5 * Math.sin(performance.now() / 300);
      oc.save(); oc.strokeStyle = `rgba(255,255,255,${0.55 + 0.35 * k})`; oc.lineWidth = 4; oc.shadowColor = 'rgba(0,0,0,.5)'; oc.shadowBlur = 12;
      if (b.w < U.W) { U.rrect(oc, b.x - 8, b.y - 8, b.w + 16, b.h + 16, 18); oc.stroke(); }
      oc.restore(); pill(gatePrompt(state.gate), b.w < U.W ? b.x + b.w / 2 : U.W / 2, b.w < U.W ? Math.max(60, b.y - 32) : U.H - 70, 1);
    }
    const spotsNow = activeSpots();
    if (spotsNow.length && state.hover) for (const sp of spotsNow) if (inBox(sp, state.hover.x, state.hover.y)) {
      oc.save(); oc.strokeStyle = 'rgba(255,255,255,.7)'; oc.lineWidth = 3; oc.setLineDash([10, 8]); U.rrect(oc, sp.x - 6, sp.y - 6, sp.w + 12, sp.h + 12, 14); oc.stroke();
      oc.restore(); pill(sp.label || 'look', sp.x + sp.w / 2, Math.max(48, sp.y - 26), 1); }
    if (state.note && performance.now() - state.note.at < 5000 && !spotListeners.length) {   // no page to show notes: draw a card
      const n = state.note, w = 560; oc.save(); oc.globalAlpha = Math.min(1, (5000 - (performance.now() - n.at)) / 400);
      oc.fillStyle = 'rgba(20,18,15,.82)'; U.rrect(oc, U.W / 2 - w / 2, U.H - 230, w, 150, 16); oc.fill();
      oc.fillStyle = '#fff'; oc.font = '600 28px system-ui, sans-serif'; oc.textAlign = 'left'; oc.fillText(n.spot.label || '', U.W / 2 - w / 2 + 28, U.H - 186);
      oc.font = '24px system-ui, sans-serif'; oc.fillStyle = 'rgba(255,255,255,.85)'; wrapText(oc, n.spot.text || '', U.W / 2 - w / 2 + 28, U.H - 146, w - 56, 32); oc.restore(); }
    if (state.mode === 'play' && !state.gate && state.playing) {
      const sh = shotAt(state.t), local = state.t - sh.start;
      if (local >= sh.Lin + sh.E && local < sh.aLocal && !state.walkKey) { oc.save(); oc.font = '600 30px system-ui, sans-serif'; oc.textAlign = 'center'; oc.fillStyle = 'rgba(255,255,255,.9)'; oc.shadowColor = 'rgba(0,0,0,.5)'; oc.shadowBlur = 10; oc.fillText('hold → to walk', U.W / 2, U.H - 70); oc.restore(); }
    }
    E('time').textContent = state.t.toFixed(2) + ' / ' + total.toFixed(2) + ((Q.get('perf') || HASH.includes('perf')) ? `  ·  ${ms.toFixed(0)} ms/frame` + (window.__live3dMs != null ? ` (3D ${window.__live3dMs.toFixed(0)})` : '') : '');
    if (state.mode === 'film' && document.activeElement !== E('scrub')) E('scrub').value = state.t;
  };

  // ---- input ----
  const toFilm = e => { const r = ov.getBoundingClientRect(); return { x: (e.clientX - r.left) * U.W / r.width, y: (e.clientY - r.top) * U.H / r.height }; };
  ov.addEventListener('pointermove', e => {
    const p = toFilm(e); state.hover = p;
    const over = (state.gate && inBox(gateBox(state.gate), p.x, p.y) && gateBox(state.gate).w < U.W) || activeSpots().some(sp => inBox(sp, p.x, p.y));
    ov.style.cursor = over ? 'pointer' : (state.mode === 'explore' ? 'default' : 'pointer');
  });
  ov.addEventListener('pointerleave', () => { state.hover = null; });
  ov.addEventListener('pointerdown', e => {
    ensureAudioGraph();
    if (!state.playing) { play(); return; }
    const p = toFilm(e), sp = activeSpots().find(sp => inBox(sp, p.x, p.y));
    if (sp) { state.note = { spot: sp.spot, at: performance.now() }; for (const fn of spotListeners) fn(sp.spot, sp.scene, { x: sp.x, y: sp.y, w: sp.w, h: sp.h }); return; }
    if (state.gate) { if (state.mode === 'pages' || inBox(gateBox(state.gate), p.x, p.y)) resolveGate(); else { state.missAt = performance.now(); state.ripple = { x: p.x, y: p.y, at: performance.now() }; } return; }
    if (state.mode === 'play') state.walkKey = true;
    if (state.mode === 'pages') next();                // pages: a click on the picture turns the page
  });
  ov.addEventListener('pointerup', () => { if (state.mode === 'play') state.walkKey = false; });
  addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); ensureAudioGraph(); if (state.gate) resolveGate(); else if (state.mode === 'film' || !state.playing) toggle(); }
    if (e.key === 'ArrowRight' || e.key === 'd') { state.walkKey = true; if (state.mode === 'pages') next(); }
    if (e.key === 'ArrowLeft' && state.mode === 'pages') prev();
  });
  addEventListener('keyup', e => { if (e.key === 'ArrowRight' || e.key === 'd') state.walkKey = false; });

  const play = () => { ensureAudioGraph(); if (state.t >= total) restart(); state.playing = true; E('play').textContent = 'pause'; document.body.classList.add('playing'); if (actx && actx.state === 'suspended') actx.resume(); };
  const pause = () => { state.playing = false; E('play').textContent = 'play'; document.body.classList.remove('playing'); };
  const toggle = () => state.playing ? pause() : play();
  const restart = () => { state.t = 0; state.off = 0; state.gate = null; state.done.clear(); if (audio) audio.currentTime = 0; };
  E('play').onclick = toggle;
  E('restart').onclick = () => { restart(); draw(); };
  E('scrub').max = total; E('scrub').oninput = () => { state.t = +E('scrub').value; state.gate = null; state.done = new Set(gates.filter(g => g.t < state.t)); };
  const modeSel = E('mode'); modeSel.value = state.mode;
  const applyMode = () => { state.mode = modeSel.value; E('scrub').disabled = state.mode !== 'film'; state.gate = null; state.done = new Set(gates.filter(g => g.t < state.t)); };
  modeSel.onchange = applyMode; applyMode();
  E('full').onclick = () => { const w = $('stage'); (w.requestFullscreen || w.webkitRequestFullscreen || (() => {})).call(w); };

  // ---- record ----
  let rec = null, chunks = [];
  const pickType = () => ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
  const startRecording = () => {
    if (!window.MediaRecorder) { alert('This browser cannot record a canvas; use a screen recorder, or render the MP4 with scripts/render_browser.py'); return; }
    ensureAudioGraph();
    const stream = main.captureStream(30);
    if (dest) dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
    const type = pickType(); rec = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 12e6 } : {}); chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = () => {                                 // download it; where downloads are blocked (sandboxed pages), show it to save by hand
      const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' }), url = URL.createObjectURL(blob), name = (cfg.title || 'film').replace(/[^\w-]+/g, '_') + (blob.type.includes('mp4') ? '.mp4' : '.webm');
      const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      let box = $('recording'); if (!box) { box = document.createElement('div'); box.id = 'recording'; box.style.cssText = 'max-width:1200px;margin:8px auto;padding:0 16px;display:grid;gap:6px'; document.body.appendChild(box); }
      box.innerHTML = `<span>Recording: ${name} (${(blob.size / 1e6).toFixed(1)} MB). If it didn't download, right-click the video and choose "Save video as".</span><video controls style="width:100%;max-width:640px" src="${url}"></video>`;
      rec = null; E('rec').textContent = '● record'; };
    if (state.mode === 'film') restart();
    rec.start(250); E('rec').textContent = '■ stop'; play();
  };
  const stopRecording = () => { if (rec && rec.state !== 'inactive') rec.stop(); };
  E('rec').onclick = () => rec ? stopRecording() : startRecording();

  document.addEventListener('visibilitychange', () => { if (document.hidden && state.playing && !rec) pause(); });   // no sound from hidden tabs
  addEventListener('pagehide', () => { if (audio) audio.pause(); });
  const at = HASH.map(h => /^t(\d+)$/.exec(h)).find(Boolean); if (at) { state.t = Math.min(total, +at[1] / 10); state.done = new Set(gates.filter(g => g.t < state.t)); }   // #t26 = open paused at 2.6 s
  // ---- API for pages built around the film (chapters, custom controls): window.PLAYER ----
  const listeners = [];
  // the page is the scene that holds the frame: it changes halfway through each handover
  const pageOf = () => { let k = 0; ST.shots.forEach((sh, i) => { if (state.t >= sh.start + (i ? sh.Lin * 0.5 : 0)) k = i; }); return k; };
  const next = () => {                                   // pages: finish this page's action, then go through the object
    ensureAudioGraph(); if (!state.playing) play();
    if (state.gate) { resolveGate(); return; }
    state.autoNext = pageOf();                           // no skipping (that would cut): pass the gate as soon as we reach it
  };
  const prev = () => { const k = pageOf(), sh = ST.shots[k], back = state.t - sh.start < sh.Lin + 1.5 ? Math.max(0, k - 1) : k, to = ST.shots[back];
    state.autoNext = null; seek(back === 0 ? 0 : to.start + to.Lin * 0.999); play(); };
  const seek = t => { state.t = Math.max(0, Math.min(total, t)); state.gate = null; state.done = new Set(gates.filter(g => g.t < state.t - 1e-6)); if (audio) audio.currentTime = state.t; draw(); };
  window.PLAYER = {
    total, shots: ST.shots.map((sh, k) => ({ k, scene: sh.scene, year: sh.sc.year || '', title: sh.sc.title || '', prompt: sh.act.prompt || '', start: sh.start, act: sh.start + sh.aLocal, end: sh.end })),
    get t() { return state.t; }, get playing() { return state.playing; }, get mode() { return state.mode; }, get waiting() { return !!state.gate; },
    shotAt: t => ST.shots.indexOf(shotAt(t ?? state.t)),
    play, pause, toggle, seek, restart: () => { restart(); draw(); },
    chapter: k => { const sh = ST.shots[k]; if (sh) { seek(k === 0 ? 0 : sh.start + sh.Lin * 0.999); play(); } },   // jump to a scene as it takes the frame
    setMode: m => { E('mode').value = m; state.mode = m; E('scrub').disabled = m !== 'film'; state.gate = null; state.done = new Set(gates.filter(g => g.t < state.t)); },
    record: () => rec ? stopRecording() : startRecording(),
    next, prev, get page() { return pageOf(); },
    onTick: fn => listeners.push(fn),
    onSpot: fn => spotListeners.push(fn),                // fn(spot, sceneId, boxInFilmPx) when a scene spot is clicked
    get muted() { return !!(audio && audio.muted); }, set muted(v) { if (audio) audio.muted = !!v; }, hasAudio: !!audio,
    get prompt() { return state.gate ? gatePrompt(state.gate) : ''; },
    get hinting() { return !!state.gate && (state.off - state.gateOff0 > (cfg.hintDelay ?? 2.5) || performance.now() - (state.missAt || -1e9) < 6000); },
  };
  const tick0 = draw; draw = () => { tick0(); for (const fn of listeners) fn(window.PLAYER); };   // eslint-disable-line no-func-assign
  draw(); requestAnimationFrame(t => { state.last = t; step(t); });
  if (Q.get('autoplay') === '1') play();
}).catch(e => { document.body.insertAdjacentHTML('beforeend', `<pre style="color:#f88;padding:16px">${(e && e.stack) || e}</pre>`); });
})();
