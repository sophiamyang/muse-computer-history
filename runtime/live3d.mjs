// portal-film runtime · live 3D characters (browser only). Wraps a three.js character so the film poses and renders
// it every frame like a drawn character: the stage's pose numbers (walk, hop, land, idle, each scene's act.pose) go
// to your pose() function, the model is rendered into a small transparent canvas, and that canvas is placed at the
// character's feet in the scene. Scene styles and treat passes still apply.
//
//   // character3d.mjs (an ES module; list it in film.js as character: 'character3d.mjs')
//   import * as THREE from 'three';
//   import { live3d } from './runtime/live3d.mjs';
//   live3d({
//     height: 300,                 // on-screen standing height, px
//     modelHeight: 1,              // model units from the ground (y = 0) to the top of the head
//     yaw: 0.9,                    // turn toward the walking direction (radians); ~0.8–1.0 makes the rig's "forward"
//                                  // (arms, legs) read as the walking direction while the face stays visible
//     build(scene) { ... return { root, ...anything pose() needs } },   // runs once; Math.random is seeded here
//     pose(m, P, ctx) { ... },     // every draw: set joints from P (armL, armR, legL, legR, crouch, lean, blink, ...)
//   });
//
// Needs the importmap for 'three' in index.html (the template has it). The Node renderer can't run WebGL:
// render MP4s of these films with scripts/render_browser.py.
import * as THREE from 'three';

const mulberry = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export function live3d(opt) {
  const o = Object.assign({ height: 300, modelHeight: 1, yaw: 0.9, pitch: 0.12, frame: 1.6, ssaa: 1.5, lights: true, seed: 7 }, opt);
  const scene = new THREE.Scene();
  if (o.lights) {
    scene.add(new THREE.HemisphereLight(0xfff6ea, 0xc9b9a6, 1.6));
    const d = new THREE.DirectionalLight(0xffffff, 2.2); d.position.set(-1, 2, 2); scene.add(d);
  }
  // build with a seeded Math.random, so anything scattered at random (fur, freckles) is the same on every load
  const realRandom = Math.random; Math.random = mulberry(o.seed);
  let model; try { model = o.build(scene, THREE); } finally { Math.random = realRandom; }
  const root = model.root; scene.add(root);
  const pivot = new THREE.Group(); scene.add(pivot); pivot.add(root);   // yaw/facing on a pivot so build() keeps its own root transform

  // orthographic camera: the frame is `frame` model-heights square, feet at 97 % of its height, so the feet always land
  // on the same pixel (the character's foot point in the scene)
  const F = o.frame * o.modelHeight, cy = 0.47 * F;
  const cam = new THREE.OrthographicCamera(-F / 2, F / 2, F / 2, -F / 2, -20, 20);
  cam.position.set(0, cy, 5); cam.lookAt(0, cy, 0); cam.updateProjectionMatrix();
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposure ?? 0.9;
  const flat = document.createElement('canvas'), fg = flat.getContext('2d');   // 2D copy for silhouette / tint styles

  const def = {
    height: o.height, flip: false, props: o.props || {}, style: o.style || {},
    ready: Promise.resolve(o.ready && o.ready(model)),
    draw(c, J, P, S) {
      const px = Math.max(64, Math.round(J.H * o.frame * o.ssaa));           // render size for this draw
      if (canvas.width !== px) { renderer.setSize(px, px, false); flat.width = flat.height = px; }
      const f = J.facing || 1;
      pivot.rotation.set(o.pitch, f * o.yaw, 0);                             // turn toward the walking direction
      o.pose(model, P, { J, S, THREE, t: P.t || 0, facing: f });
      const r0 = performance.now(); renderer.render(scene, cam); window.__live3dMs = (window.__live3dMs || 0) * 0.9 + (performance.now() - r0) * 0.1;
      const w = J.H * o.frame;                                                // F model units = frame × height px
      let img = canvas;
      if (S.mode === 'silhouette' || S.tint) {
        fg.globalCompositeOperation = 'copy'; fg.globalAlpha = 1; fg.drawImage(canvas, 0, 0);
        fg.globalCompositeOperation = 'source-atop';
        if (S.mode === 'silhouette') { fg.fillStyle = S.ink || '#111'; fg.fillRect(0, 0, px, px); }
        else { fg.globalAlpha = S.tintAlpha ?? 0.35; fg.fillStyle = S.tint; fg.fillRect(0, 0, px, px); }
        img = flat;
      }
      c.drawImage(img, -w / 2, -w * 0.97, w, w);
    },
  };
  window.CHARACTER(def);
  return def;
}
