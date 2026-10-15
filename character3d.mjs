// Jolly, live in 3D: Sophia's own three.js model (github.com/sophiamyang/muse-mascot, index.html), wrapped for the film
// with runtime/live3d.mjs. build() is the model-building code from index.html, copied unchanged (lights, fur, body,
// face, eyes, smile, arms, legs, looks); only the page around it is left out (renderer, camera, orbit controls, ground,
// contact shadow, swatch buttons, click-to-hop, the animation loop). pose() maps the film's pose numbers onto the
// model's own rig: bodyRig (lift, squash, lean), the two arm pivots, the two leg hips and the eyes (blink).
// The cream look ('sand' in LOOKS) in every scene; each era restyles Jolly with characterStyle / treat, not here.
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { live3d } from './runtime/live3d.mjs';

live3d({
  height: 330, modelHeight: 1, yaw: 0.62, pitch: 0.1, exposure: 0.88, lights: false,

  build(scene) {
    // ===== from muse-mascot/index.html, lines 67–85 (unchanged) =====
    // ---------- lights ----------
    const LIGHT_DIR = new THREE.Vector3(-1.0, 2.0, 2.0).normalize();
    const key = new THREE.DirectionalLight(0xFFF1DE, 2.2);
    key.position.copy(LIGHT_DIR).multiplyScalar(4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 10;
    key.shadow.intensity = 0.35;
    key.shadow.camera.left = key.shadow.camera.bottom = -1.5;
    key.shadow.camera.right = key.shadow.camera.top = 1.5;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xE8ECFF, 0.6);
    fill.position.set(2.5, 1.2, 1.5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xFFFFFF, 1.1);
    rim.position.set(0.5, 2, -3);
    scene.add(rim);
    const SKY = new THREE.Color(0xFFF6EA), GROUND = new THREE.Color(0xC9B9A6);
    scene.add(new THREE.HemisphereLight(SKY, GROUND, 1.0));

    // ===== from muse-mascot/index.html, lines 116–492 (unchanged) =====
    // ---------- fur (shell texturing) ----------
    const SHELLS = 48;
    // Plush reads as soft when the pile is dense, fine and low-contrast, with gentle lumps and a
    // bright fuzzy sheen at grazing angles, not when individual long strands are visible.
    const furVert = /* glsl */`
      uniform float uH, uLen, uTime, uFaceOn;
      uniform vec2 uFaceC, uFaceR;
      varying vec2 vUv; varying vec3 vN; varying vec3 vWP; varying vec3 vObj; varying float vLump;
      void main() {
        vUv = uv; vObj = position;
        vec3 p = position;
        float mask = 1.0, hood = 0.0;
        if (uFaceOn > 0.5 && p.z > 0.0) {
          vec2 q = abs((p.xy - uFaceC) / uFaceR); float e = pow(pow(q.x, 3.0) + pow(q.y, 3.0), 1.0 / 3.0);
          mask = smoothstep(0.85, 1.15, e);
          hood = exp(-pow((e - 1.2) / 0.25, 2.0)); // a slightly thicker ring framing the face, like a hood
        }
        // soft lumps across the surface, like a plush that has been hugged a lot
        float lump = sin(p.x * 21.0 + sin(p.y * 13.0)) * sin(p.y * 17.0 + sin(p.z * 19.0)) * sin(p.z * 23.0 + sin(p.x * 11.0));
        vLump = lump;
        vec3 wn = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(p, 1.0);
        float L = uLen * mask * (1.0 + 0.35 * hood) * (0.85 + 0.3 * lump);
        float sway = sin(uTime * 1.2 + wp.y * 7.0 + wp.x * 5.0) * 0.05;
        wp.xyz += wn * L * uH + vec3(sway, -0.25, sway * 0.6) * L * uH * uH;
        vN = wn; vWP = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`;
    const furFrag = /* glsl */`
      uniform float uH, uFaceOn;
      uniform vec2 uDensity, uFaceC, uFaceR;
      uniform vec3 uRoot, uTip, uLightDir, uSky, uGround;
      varying vec2 vUv; varying vec3 vN; varying vec3 vWP; varying vec3 vObj; varying float vLump;
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main() {
        float h = uH;
        // face mask per pixel; smaller than the face panel so the fur fringe overlaps its edge
        float mask = 1.0;
        if (uFaceOn > 0.5 && vObj.z > 0.0) { vec2 q = abs((vObj.xy - uFaceC) / uFaceR); mask = smoothstep(0.85, 1.0, pow(pow(q.x, 3.0) + pow(q.y, 3.0), 1.0 / 3.0)); }
        vec2 st = vUv * uDensity;
        // strands lean into the centre of small 5x5 clumps toward their tips
        // clump grid is rotated against the strand grid so the two don't beat into visible rows
        const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
        vec2 cs = ROT * st / 5.0, ci = floor(cs);
        vec2 cc = ci + 0.5 + (vec2(hash(ci + 1.7), hash(ci + 5.3)) - 0.5) * 0.8;
        st += transpose(ROT) * (cc - cs) * 5.0 * 0.5 * h;
        vec2 cell = floor(st);
        float r = hash(cell);
        float a = 1.0;
        if (h > 0.0) {
          if (mask < 0.02 || h > mask) discard;
          vec2 f = fract(st) - 0.5 - (vec2(hash(cell + 7.1), hash(cell + 3.7)) - 0.5) * 0.3;
          float len = mix(0.7, 1.0, r);
          if (h > len) discard;
          float rad = 0.8 * pow(1.0 - h / len, 0.6);
          float d = length(f);
          if (d > rad) discard;
          a = smoothstep(rad, rad * 0.4, d) * mix(1.0, 0.6, h);
        }
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vWP);
        vec3 base = mix(uRoot, uTip, pow(h, 0.6)) * mix(0.96, 1.04, r) * (1.0 + 0.05 * vLump);
        base = mix(uTip * 0.9, base, mask); // any skin peeking at the face edge matches the fur tips
        float ndl = dot(n, uLightDir);
        float diff = pow(clamp(ndl * 0.5 + 0.5, 0.0, 1.0), 2.0);
        vec3 hemi = mix(uGround, uSky, n.y * 0.5 + 0.5);
        float ao = mix(0.9, 1.0, h) * mix(0.88, 1.0, smoothstep(0.12, 0.5, vWP.y)); // light skin so fur partings don't read as gray specks
        ao = mix(1.0, ao, mask); // bare skin at the face edge isn't in the fur's shadow
        float fresnel = pow(1.0 - max(dot(n, v), 0.0), 4.0);
        vec3 sheen = uTip * fresnel * (0.25 + 0.35 * clamp(ndl + 0.3, 0.0, 1.0));
        vec3 col = base * (diff * 0.8 + hemi * 0.26) * ao + sheen * 0.8;
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`;

    const LOOKS = {
      sand:   { root: 0xD8B088, tip: 0xFAE4C6, face: 0xF3D9C8, blush: 'rgba(240,138,138,', sole: 0xD8BEA4 },
      purple: { root: 0x7A62D6, tip: 0xD2C4FF, face: 0xF6F0FF, blush: 'rgba(244,150,185,', sole: 0xE3D3C0 },
    };
    const FUR = { root: new THREE.Color(), tip: new THREE.Color(), skin: new THREE.Color() };
    const furMaterials = [], strandMeshes = [];

    // ---------- strand fur ----------
    // Real hair strands: thin camera-facing ribbons instanced at points scattered evenly over the
    // surface (no UV grid, so no streaks or seams), bent by gravity and a smooth flow field so
    // neighbours clump into tufts, and lit with Kajiya-Kay hair shading.
    const SEGS = 4;
    const strandGeo = new THREE.InstancedBufferGeometry();
    {
      const t = [], side = [], idx = [];
      for (let i = 0; i <= SEGS; i++) { t.push(i / SEGS, i / SEGS); side.push(-1, 1); }
      for (let i = 0; i < SEGS; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      strandGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Array(t.length * 3).fill(0), 3));
      strandGeo.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
      strandGeo.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
      strandGeo.setIndex(idx);
    }
    const strandVert = /* glsl */`
      attribute float aT, aSide;
      attribute vec3 aRoot, aNrm;
      attribute vec4 aRnd;
      uniform float uLen, uWidth, uTime;
      varying float vT, vRnd; varying vec3 vTan, vN, vWP;
      void main() {
        vec3 wRoot = (modelMatrix * vec4(aRoot, 1.0)).xyz;
        vec3 wn = normalize(mat3(modelMatrix) * aNrm);
        vec3 up = abs(wn.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 t1 = normalize(cross(wn, up)), t2 = cross(wn, t1);
        float ang = aRnd.x * 6.2832;
        vec3 rt = cos(ang) * t1 + sin(ang) * t2;
        // smooth flow over the surface: nearby strands lean the same way and gather into tufts
        vec3 q = aRoot * 26.0;
        vec3 flow = vec3(sin(q.y + 1.7 * sin(q.z)), sin(q.z + 1.3 * sin(q.x)), sin(q.x + 1.9 * sin(q.y)));
        flow = mat3(modelMatrix) * flow;
        flow -= wn * dot(flow, wn);
        float L = uLen * aRnd.y;
        vec3 dir = normalize(wn + rt * 0.3 + flow * 0.3);
        float sway = sin(uTime * 1.4 + wRoot.y * 9.0 + wRoot.x * 6.0) * 0.06;
        vec3 bend = vec3(sway, -0.45, sway * 0.5) + flow * 0.15;
        float t = aT;
        vec3 p = wRoot + L * (dir * t + bend * t * t);
        vec3 T = normalize(dir + 2.0 * bend * t);
        vec3 V = normalize(cameraPosition - p);
        // strands pointing straight at the camera make cross(T, V) vanish; fall back to a surface tangent
        vec3 c = cross(T, V);
        vec3 sideV = dot(c, c) > 1e-6 ? normalize(c) : t1;
        p += sideV * aSide * uWidth * (1.0 - 0.85 * t) * 0.5;
        vT = t; vRnd = aRnd.z; vTan = T; vN = wn; vWP = p;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`;
    const strandFrag = /* glsl */`
      uniform vec3 uRoot, uTip, uLightDir, uSky, uGround;
      varying float vT, vRnd; varying vec3 vTan, vN, vWP;
      void main() {
        // MSAA can sample just outside a strand and extrapolate vT below 0; pow() of that is NaN (black specks)
        float t = clamp(vT, 0.0, 1.0);
        vec3 T = normalize(vTan), N = normalize(vN), L = uLightDir;
        vec3 V = normalize(cameraPosition - vWP), H = normalize(L + V);
        float nl = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
        float tl = dot(T, L), th = dot(T, H);
        float kk = sqrt(max(1.0 - tl * tl, 0.0));
        float diff = mix(0.4, 1.0, nl * nl) * (0.7 + 0.3 * kk);
        float spec = pow(sqrt(max(1.0 - th * th, 0.0)), 60.0) * 0.06 * nl;
        vec3 hemi = mix(uGround, uSky, N.y * 0.5 + 0.5);
        vec3 base = mix(uRoot, uTip, pow(t, 0.45)) * (0.95 + 0.08 * vRnd);
        float ao = mix(0.86, 1.0, t) * mix(0.88, 1.0, smoothstep(0.1, 0.5, vWP.y));
        vec3 col = base * (diff * 0.95 + hemi * 0.45) * ao + spec;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`;

    function addFur(mesh, { len = 0.03, count = 20000, width = 0.0022, face = null } = {}) {
      // the skin under the fur: the old fur shader at height 0, so it shades like the fur roots
      const skin = new THREE.ShaderMaterial({
        vertexShader: furVert, fragmentShader: furFrag,
        uniforms: {
          uH: { value: 0 }, uLen: { value: 0 }, uTime: { value: 0 },
          uDensity: { value: new THREE.Vector2(1, 1) },
          uFaceOn: { value: face ? 1 : 0 },
          uFaceC: { value: face ? face.c : new THREE.Vector2() },
          uFaceR: { value: face ? face.r : new THREE.Vector2(1, 1) },
          uRoot: { value: FUR.skin }, uTip: { value: FUR.tip },
          uLightDir: { value: LIGHT_DIR }, uSky: { value: SKY }, uGround: { value: GROUND },
        },
      });
      mesh.material = skin; mesh.castShadow = true;

      const sampler = new MeshSurfaceSampler(new THREE.Mesh(mesh.geometry)).build();
      const roots = new Float32Array(count * 3), nrms = new Float32Array(count * 3), rnd = new Float32Array(count * 4);
      const p = new THREE.Vector3(), n = new THREE.Vector3();
      let k = 0;
      while (k < count) {
        sampler.sample(p, n);
        let lenK = 1;
        if (face && p.z > 0) { // keep the face clear; shorten strands at its edge into a soft fringe
          const qx = Math.abs((p.x - face.c.x) / face.r.x), qy = Math.abs((p.y - face.c.y) / face.r.y);
          const e = Math.cbrt(qx ** 3 + qy ** 3);
          if (e < 0.97) continue;
          lenK = THREE.MathUtils.smoothstep(e, 0.9, 1.05); // full-length fringe that overlaps the face edge
        }
        roots.set([p.x, p.y, p.z], k * 3); nrms.set([n.x, n.y, n.z], k * 3);
        rnd.set([Math.random(), (0.6 + 0.4 * Math.random()) * lenK, Math.random(), Math.random()], k * 4);
        k++;
      }
      const g = strandGeo.clone();
      g.setAttribute('aRoot', new THREE.InstancedBufferAttribute(roots, 3));
      g.setAttribute('aNrm', new THREE.InstancedBufferAttribute(nrms, 3));
      g.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnd, 4));
      g.instanceCount = count;
      const mat = new THREE.ShaderMaterial({
        vertexShader: strandVert, fragmentShader: strandFrag, side: THREE.DoubleSide,
        uniforms: {
          uLen: { value: len }, uWidth: { value: width }, uTime: { value: 0 },
          uRoot: { value: FUR.root }, uTip: { value: FUR.tip },
          uLightDir: { value: LIGHT_DIR }, uSky: { value: SKY }, uGround: { value: GROUND },
        },
      });
      furMaterials.push(mat);
      const strands = new THREE.Mesh(g, mat);
      strands.frustumCulled = false; // instance positions are built in the shader
      strandMeshes.push(strands);
      mesh.add(strands);
    }

    // lathe with arc-length-spaced rows, so fur strands stay round instead of stretching
    function lathe(points, rows, segs) {
      // LatheGeometry's UV seam starts facing +z; turn it to the back so it never shows from the front
      return new THREE.LatheGeometry(new THREE.SplineCurve(points).getSpacedPoints(rows), segs).rotateY(Math.PI);
    }
    function capsuleGeo(r, len) {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI / 2; pts.push(new THREE.Vector2(Math.max(Math.cos(a) * r, 0.001), Math.sin(a) * r - len / 2)); }
      for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI / 2; pts.push(new THREE.Vector2(Math.max(Math.cos(a) * r, 0.001), Math.sin(a) * r + len / 2)); }
      return lathe(pts, 40, 48);
    }

    // ---------- the character (y up, ground at y=0, faces +z, total height 1.0) ----------
    const muse = new THREE.Group();
    const bodyRig = new THREE.Group(); // squash/stretch pivot at the feet
    muse.add(bodyRig);
    scene.add(muse);

    // tall bean / gumdrop: widest at the hips, gently narrowing into a domed hood, no neck
    const bodyGeo = lathe([
      new THREE.Vector2(0.001, 0.13), new THREE.Vector2(0.2, 0.14), new THREE.Vector2(0.3, 0.19),
      new THREE.Vector2(0.33, 0.29), new THREE.Vector2(0.32, 0.41), new THREE.Vector2(0.29, 0.53),
      new THREE.Vector2(0.265, 0.62), new THREE.Vector2(0.262, 0.72), new THREE.Vector2(0.248, 0.83),
      new THREE.Vector2(0.2, 0.93), new THREE.Vector2(0.1, 0.985), new THREE.Vector2(0.001, 1.0),
    ], 72, 96);
    bodyGeo.scale(1, 1, 0.9);
    bodyGeo.computeVertexNormals();
    const body = new THREE.Mesh(bodyGeo);
    bodyRig.add(body);
    bodyRig.updateMatrixWorld(true);

    // big peach face set into the hood; faces straight ahead with a slight upward tilt
    const FACE_Y = 0.765, FACE_RX = 0.21, FACE_RY = 0.152;
    const ray = new THREE.Raycaster();
    ray.set(new THREE.Vector3(0, FACE_Y, 3), new THREE.Vector3(0, 0, -1));
    const surfZ = ray.intersectObject(body, false)[0].point.z;
    const faceMat = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, emissiveIntensity: 0.45, toneMapped: false });
    // curve the panel to follow the head, so its edges tuck into the fur instead of standing proud
    const PANEL_D = 0.1;
    const panelGeo = new THREE.SphereGeometry(1, 64, 32);
    {
      const pos = panelGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const a = Math.atan2(pos.getY(i), pos.getX(i));
        const rs = Math.pow(Math.abs(Math.cos(a)) ** 3 + Math.abs(Math.sin(a)) ** 3, -1 / 3);
        pos.setX(i, pos.getX(i) * rs); pos.setY(i, pos.getY(i) * rs);
        const wx = pos.getX(i) * FACE_RX, wy = pos.getY(i) * FACE_RY;
        pos.setZ(i, pos.getZ(i) - (wx * wx * 0.9 + wy * wy * 0.25) / PANEL_D);
      }
      panelGeo.computeVertexNormals();
    }
    const panel = new THREE.Mesh(panelGeo, faceMat);
    panel.scale.set(FACE_RX, FACE_RY, PANEL_D);
    panel.rotation.x = 0.06;
    panel.position.set(0, FACE_Y, surfZ - 0.062);
    panel.castShadow = true;
    bodyRig.add(panel);
    panel.updateMatrixWorld(true);

    addFur(body, { len: 0.04, count: 300000, face: { c: new THREE.Vector2(0, FACE_Y + 0.022), r: new THREE.Vector2(FACE_RX * 0.86, FACE_RY * 0.72) } });

    function onPanel(x, y, lift = 0) {
      ray.set(new THREE.Vector3(x, y, 3), new THREE.Vector3(0, 0, -1));
      const h = ray.intersectObject(panel, false)[0];
      const n = h.face.normal.clone().transformDirection(panel.matrixWorld);
      return { p: h.point.addScaledVector(n, lift), n };
    }
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0B0908, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 });
    const eyes = [-1, 1].map(s => {
      const { p, n } = onPanel(s * 0.1, FACE_Y + 0.012, -0.007);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.028, 32, 16), eyeMat);
      e.position.copy(p);
      e.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      e.scale.set(1, 1, 0.6);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      glint.position.set(0.008, 0.009, 0.022); // eye-local, so it blinks along with the eye
      e.add(glint);
      bodyRig.add(e);
      return e;
    });
    {
      // the smile is a tube traced point by point onto the curved face, so none of it sinks into the surface
      const R = 0.03, bottom = FACE_Y - 0.037, half = Math.PI * 0.38, pts = [];
      for (let i = 0; i <= 24; i++) {
        const a = -half + (2 * half * i) / 24;
        pts.push(onPanel(R * Math.sin(a), bottom + R * (1 - Math.cos(a)), 0.0012).p);
      }
      const smileMat = new THREE.MeshStandardMaterial({ color: 0x1E1814, roughness: 0.6 });
      const TUBE = 0.0034;
      bodyRig.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, TUBE, 10), smileMat));
      for (const end of [pts[0], pts[pts.length - 1]]) { // rounded caps
        const cap = new THREE.Mesh(new THREE.SphereGeometry(TUBE, 12, 8), smileMat);
        cap.position.copy(end);
        bodyRig.add(cap);
      }
    }
    // blush is painted into the face panel's own texture so it follows the curved surface
    function faceTexture(L) {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
      const g = c.getContext('2d');
      g.fillStyle = '#' + new THREE.Color(L.face).getHexString(THREE.SRGBColorSpace);
      g.fillRect(0, 0, 1024, 512);
      // SphereGeometry UVs: the front (+z) is u = 0.25; blush sits at x = ±0.63, y = -0.18 of the panel radius
      for (const s of [-1, 1]) {
        const xl = s * 0.6, yl = -0.22, a = Math.atan2(yl, xl);
        const rs = Math.pow(Math.abs(Math.cos(a)) ** 3 + Math.abs(Math.sin(a)) ** 3, -1 / 3);
        const th = Math.acos(yl / rs), u = 0.25 + Math.asin(xl / rs / Math.sin(th)) / (2 * Math.PI), v = 1 - th / Math.PI;
        g.save();
        g.translate(u * 1024, (1 - v) * 512);
        g.scale(1, 0.8);
        const grd = g.createRadialGradient(0, 0, 0, 0, 0, 46);
        grd.addColorStop(0, L.blush + '.8)'); grd.addColorStop(0.5, L.blush + '.45)'); grd.addColorStop(1, L.blush + '0)');
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, 46, 0, Math.PI * 2); g.fill();
        g.restore();
      }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      return t;
    }

    // long mitten arms hanging close to the sides, pivoting at the shoulder
    const arms = [-1, 1].map(s => {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.27, 0.62, 0.02);
      pivot.rotation.z = s * 0.3;
      const len = s < 0 ? 0.17 : 0.28;
      const geo = capsuleGeo(0.07, len);
      { // mitten: slimmer at the shoulder, fuller toward the hand
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const k = THREE.MathUtils.clamp(0.5 - pos.getY(i) / (len + 0.14), 0, 1);
          const w = 0.88 + 0.28 * k;
          pos.setX(i, pos.getX(i) * w); pos.setZ(i, pos.getZ(i) * w * 0.9);
        }
        geo.computeVertexNormals();
      }
      const arm = new THREE.Mesh(geo);
      arm.position.y = -(len / 2 + 0.05);
      pivot.add(arm);
      addFur(arm, { len: 0.034, count: 32000 });
      bodyRig.add(pivot);
      return pivot;
    });

    // thick stubby legs with tan suede soles
    const soleMat = new THREE.MeshStandardMaterial({ roughness: 1 });
    const legs = [-1, 1].map(s => {
      const hip = new THREE.Group();
      hip.position.set(s * 0.125, 0.27, 0.0);
      const leg = new THREE.Mesh(capsuleGeo(0.11, 0.05));
      leg.position.y = -0.135;
      addFur(leg, { len: 0.03, count: 24000 });
      hip.add(leg);
      const sole = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), soleMat);
      sole.scale.set(0.095, 0.02, 0.1);
      sole.position.set(0, -0.255, 0.0);
      sole.castShadow = true;
      hip.add(sole);
      bodyRig.add(hip);
      return hip;
    });

    function setLook(name) {
      const L = LOOKS[name];
      FUR.root.setHex(L.root); FUR.tip.setHex(L.tip); FUR.skin.copy(FUR.root).lerp(FUR.tip, 0.85);
      const ft = faceTexture(L);
      faceMat.map = ft; faceMat.emissiveMap = ft;
      faceMat.color.set(0xffffff); faceMat.emissive.set(0xffffff);
      faceMat.needsUpdate = true;
      soleMat.color.setHex(L.sole);
      document.querySelectorAll('#swatches button').forEach(b => b.setAttribute('aria-pressed', b.dataset.look === name));
    }

    setLook('sand');   // the cream look (labelled "Cream" on the model page)

    // Offline renders (?render=1, render_browser.py) run WebGL in software, where ~410k strands cost ~10 s a frame.
    // Fix the model's own level-of-detail step (its checkPerf: keep 60 % of the strands and widen them by 1/√0.6 to
    // keep coverage) at two steps for renders, as live.md suggests; the live website keeps every strand.
    let lod = 1;
    const RENDER_LOD_STEPS = /render=1/.test(location.search) ? 2 : 0;
    for (let i = 0; i < RENDER_LOD_STEPS; i++) {
      lod *= 0.6;
      for (const m of strandMeshes) {
        m.geometry.instanceCount = Math.floor(m.geometry.attributes.aRoot.count * lod);
        m.material.uniforms.uWidth.value /= Math.sqrt(0.6);
      }
    }
    return { root: muse, bodyRig, arms, legs, eyes, furMaterials };
  },

  // P: the film's pose numbers (runtime/rig.js). Angles are radians from straight down; + swings forward.
  // The model faces +z; live3d turns it toward the direction of travel, so its +x side (arms[1], the long mitten
  // arm) is the side it turns toward: that arm leads the actions (armR), arms[0] follows armL.
  pose(m, P, { t }) {
    for (const mat of m.furMaterials) mat.uniforms.uTime.value = t;            // fur sway from film time, not a clock
    const crouch = P.crouch || 0, breathe = Math.sin(t * 2.0) * 0.01;          // the model's own idle breathing
    const sy = 1 + breathe - 0.14 * crouch, sxz = 1 - breathe * 0.6 + 0.09 * crouch;
    m.bodyRig.position.y = P.lift || 0;
    m.bodyRig.scale.set(sxz, sy, sxz);
    m.bodyRig.rotation.x = 0.55 * ((P.lean || 0) + 0.3 * crouch) - 0.12 * (P.lookY || 0);   // no neck: looking up tips her back a little
    m.bodyRig.rotation.z = Math.sin(t * 0.9) * 0.035;                           // the model's slow weight shift
    // arms: pivots at the shoulders. Forward swing on x; the model's resting outward angle (±0.3) on z, opening a
    // little as the arm rises so the mitten clears the body.
    const arm = (pivot, side, a, e) => { const up = a + 0.5 * (e || 0);
      pivot.rotation.set(-up, 0, side * (0.3 + 0.25 * Math.min(1, Math.max(0, up) / 2.5))); };
    arm(m.arms[1], 1, P.armR ?? 0.12, P.elbowR);
    arm(m.arms[0], -1, P.armL ?? 0.12, P.elbowL);
    // legs: hips swing forward on x; knees fold into the hip (the legs are single capsules)
    m.legs[1].rotation.x = -(P.legR || 0) + 0.3 * (P.kneeR || 0);
    m.legs[0].rotation.x = -(P.legL || 0) + 0.3 * (P.kneeL || 0);
    m.eyes.forEach(e => (e.scale.y = 1 - 0.9 * (P.blink || 0)));
  },
});
