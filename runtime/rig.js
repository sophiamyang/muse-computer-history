// portal-film runtime · rig (window.RIG): a small 2D skeleton for characters drawn in code.
//
// The stage says what the character is doing (stand, walk, hop, land, act); RIG turns that into pose numbers, merges
// the scene's action overrides (act.pose(u)), and solves joint positions. The character's own draw function then
// paints limbs, body and face on those joints in the scene's style. Feet are planted: the hip height comes from the
// legs, so crouching and striding lower the body by themselves.
//
// Coordinates: origin at the point between the feet, x toward where the character faces, y down (negative = up),
// pixels at the on-screen size. Angles for limbs are measured from straight down; positive swings forward.
(() => {
const { clamp, lerp, ss } = U;

// proportions as fractions of the standing height
const PROPS = { leg: 0.40, thigh: 0.5, torso: 0.27, headR: 0.17, neck: 0.02, upperArm: 0.15, foreArm: 0.14, shoulderW: 0.085, hipW: 0.05, foot: 0.07 };

// default pose numbers (radians unless noted)
const BASE = { lift: 0, crouch: 0, lean: 0, headTilt: 0, armL: 0.12, armR: 0.12, elbowL: 0.25, elbowR: 0.25,
  legL: 0, legR: 0, kneeL: 0.04, kneeR: 0.04, footL: 0, footR: 0, blink: 0, look: 0.25, lookY: 0, mouth: 'smile', breathe: 0 };

const RIG = window.RIG = { PROPS, BASE };

// pose numbers from what the stage says is happening. m = motion {kind, u, dist}, t = seconds, H = height in px
RIG.motionPose = (m, t, H, stride) => {
  const P = { ...BASE };
  P.breathe = Math.sin(t * 1.7) * 0.5 + 0.5;
  P.armL += Math.sin(t * 1.7) * 0.03; P.armR += Math.sin(t * 1.7 + 0.4) * 0.03;
  const bt = (t + 0.8) % 3.6; P.blink = bt < 0.13 ? Math.sin(bt / 0.13 * Math.PI) : 0;   // deterministic blink every 3.6 s
  const k = m && m.kind;
  if (k === 'walk') {
    const ph = (m.dist || 0) / (stride || 0.62 * H) * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph);
    P.legL = 0.42 * s; P.legR = -0.42 * s;
    P.kneeL = 0.08 + 0.75 * Math.max(0, c) * Math.max(0, s + 0.3); P.kneeR = 0.08 + 0.75 * Math.max(0, -c) * Math.max(0, -s + 0.3);
    P.footL = 0.25 * Math.max(0, -s); P.footR = 0.25 * Math.max(0, s);
    P.armL = -0.38 * s + 0.08; P.armR = 0.38 * s + 0.08; P.elbowL = 0.35 + 0.2 * Math.max(0, -s); P.elbowR = 0.35 + 0.2 * Math.max(0, s);
    P.lean = 0.06; P.headTilt = -0.03;
  } else if (k === 'hop') {                               // u: 0 crouch .. .22 push off .. .36 air .. 1
    const u = m.u || 0, crouch = u < 0.22 ? ss(0, 0.22, u) : 1 - ss(0.22, 0.32, u), air = ss(0.26, 0.4, u);
    P.crouch = crouch * 0.85; P.lean = 0.25 * crouch + 0.1 * air;
    P.armL = lerp(-0.5 * crouch, 2.5, air); P.armR = lerp(-0.5 * crouch, 2.7, air); P.elbowL = P.elbowR = lerp(0.3, 0.15, air);
    P.legL = lerp(P.legL, 0.55, air); P.legR = lerp(P.legR, 0.25, air); P.kneeL = lerp(P.kneeL, 1.3, air); P.kneeR = lerp(P.kneeR, 0.9, air);
    P.mouth = air > 0.5 ? 'open' : 'smile'; P.look = 0.6; P.lookY = -0.4 * air;
  } else if (k === 'land') {                              // u: 0 in the air .. .8 touch down .. 1 recovered
    const u = m.u || 0, air = 1 - ss(0.62, 0.8, u), give = Math.sin(clamp((u - 0.74) / 0.26) * Math.PI);
    P.armL = lerp(0.9, 2.2, air); P.armR = lerp(1.1, 2.0, air); P.elbowL = P.elbowR = 0.25;
    P.legL = 0.45 * air; P.legR = 0.15 * air; P.kneeL = 1.0 * air; P.kneeR = 0.7 * air;
    if (air < 0.5) { P.armL = lerp(BASE.armL, P.armL, air * 2); P.armR = lerp(BASE.armR, P.armR, air * 2); }
    P.crouch = 0.6 * Math.max(0, give); P.mouth = air > 0.3 ? 'open' : 'smile';
  }
  return P;
};

// solve joints for pose P at height H (px). Returns points in the character's local frame.
RIG.solve = (P, H, props = PROPS) => {
  const pr = { ...PROPS, ...props }, L = pr.leg * H, th = L * pr.thigh, sh = L - th;
  const leg = (a, knee, foot, side) => {
    const ta = a + P.crouch * 0.95, sa = ta - knee - P.crouch * 1.9;   // knee bends backward
    const kx = Math.sin(ta) * th, ky = Math.cos(ta) * th, ax = kx + Math.sin(sa) * sh, ay = ky + Math.cos(sa) * sh;
    return { side, kx, ky, ax, ay, foot };
  };
  const l = leg(P.legL, P.kneeL, P.footL, 'L'), r = leg(P.legR, P.kneeR, P.footR, 'R');
  const drop = Math.max(l.ay, r.ay);                       // the lower foot stands on the ground
  const hip = { x: 0, y: -drop - P.lift * H };
  const lean = P.lean + P.crouch * 0.3, T = pr.torso * H * (1 + 0.012 * P.breathe);
  const neck = { x: hip.x + Math.sin(lean) * T, y: hip.y - Math.cos(lean) * T };
  const headR = pr.headR * H, ht = lean * 0.5 + P.headTilt;
  const head = { x: neck.x + Math.sin(ht) * (headR * 0.92 + pr.neck * H), y: neck.y - Math.cos(ht) * (headR * 0.92 + pr.neck * H), r: headR, tilt: ht };
  const sw = pr.shoulderW * H, hw = pr.hipW * H;
  const shL = { x: neck.x - sw * Math.cos(lean), y: neck.y + 0.035 * H - sw * Math.sin(lean) }, shR = { x: neck.x + sw * Math.cos(lean), y: neck.y + 0.035 * H + sw * Math.sin(lean) };
  const arm = (s, a, e) => { const ua = pr.upperArm * H, fa = pr.foreArm * H, a1 = a, a2 = a + e;
    const el = { x: s.x + Math.sin(a1) * ua, y: s.y + Math.cos(a1) * ua }; return { sh: s, el, hand: { x: el.x + Math.sin(a2) * fa, y: el.y + Math.cos(a2) * fa } }; };
  const aL = arm(shL, P.armL, P.elbowL), aR = arm(shR, P.armR, P.elbowR);
  const hpL = { x: hip.x - hw * 0.4, y: hip.y }, hpR = { x: hip.x + hw * 0.4, y: hip.y };
  const lg = (hp, g) => { const knee = { x: hp.x + g.kx, y: hp.y + g.ky }, ankle = { x: hp.x + g.ax, y: hp.y + g.ay };
    const fl = pr.foot * H, toe = { x: ankle.x + Math.cos(g.foot) * fl, y: ankle.y - Math.sin(g.foot) * fl }; return { hip: hp, knee, ankle, toe }; };
  return { H, P, hip, neck, head, lean, armL: aL, armR: aR, legL: lg(hpL, l), legR: lg(hpR, r), handL: aL.hand, handR: aR.hand };
};

// ---------- drawing helpers for character code ----------
// a limb through points, with ink outline: width w (px), outline lw, colours fill/ink
RIG.limb = (c, pts, w, fill, ink, lw = 0) => {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const path = () => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y); };
  if (lw > 0 && ink) { path(); c.strokeStyle = ink; c.lineWidth = w + lw * 2; c.stroke(); }
  if (fill) { path(); c.strokeStyle = fill; c.lineWidth = w; c.stroke(); }
  c.restore();
};
// filled shape with outline: fn(c) builds the path
RIG.shape = (c, fn, fill, ink, lw = 0) => { c.beginPath(); fn(c); if (fill) { c.fillStyle = fill; c.fill(); } if (lw > 0 && ink) { c.strokeStyle = ink; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); } };
// local -> world (for props that hold onto a hand): o = {x, y, scale, sx, sy, rot, facing}
RIG.toWorld = (o, p) => { const f = o.facing || 1, x = p.x * f * (o.sx || 1), y = p.y * (o.sy || 1), r = o.rot || 0;
  return { x: o.x + x * Math.cos(r) - y * Math.sin(r), y: o.y + x * Math.sin(r) + y * Math.cos(r) }; };
})();
