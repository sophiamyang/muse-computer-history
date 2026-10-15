// Render a score JSON with real sampled instruments (General MIDI SoundFont via spessasynth_core).
//   node tools/render_score.mjs score.json out.f32 [soundfont.sf2]
// score.json: { tracks: [ { name, channel (0-15; 9 = GM drum kit), program (0-127), bank?,
//               volume? (CC7, default 100), pan? (CC10, 0-127, 64 centre), expression? (CC11), reverb? (CC91),
//               chorus? (CC93), notes: [[t_sec, midi, dur_sec, velocity 1-127], ...],
//               cc?: [[t_sec, controller, value], ...], programs?: [[t_sec, program], ...] } ], seconds: total }
// Times are absolute seconds (a fixed 120 BPM / 480 ppq grid, so 1 s = 960 ticks). Writes interleaved stereo
// float32 at 48 kHz; tools/master.py levels and limits it into the final WAV.
import fs from 'node:fs';
import path from 'node:path';
import { BasicMIDI, SoundBankLoader, SpessaSynthProcessor, SpessaSynthSequencer } from 'spessasynth_core';

const [inFile, outFile, sfFile = path.join(path.dirname(new URL(import.meta.url).pathname), '../.tools/sf/GeneralUser-GS.sf2')] = process.argv.slice(2);
const score = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const PPQ = 480, TPS = 960;                            // ticks per second at 120 BPM
const tk = s => Math.max(0, Math.round(s * TPS));

// ---------- standard MIDI file (format 1) ----------
const vlq = n => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
const chunk = (id, data) => [...Buffer.from(id), (data.length >>> 24) & 255, (data.length >>> 16) & 255, (data.length >>> 8) & 255, data.length & 255, ...data];
function trackBytes(events) {                          // events: [tick, order, bytes[]]; order sorts same-tick events
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out = []; let last = 0;
  for (const [t, , bytes] of events) { out.push(...vlq(t - last), ...bytes); last = t; }
  out.push(0, 0xff, 0x2f, 0);                          // end of track
  return chunk('MTrk', out);
}
const tracks = [trackBytes([[0, 0, [0xff, 0x51, 3, 0x07, 0xa1, 0x20]]])];   // tempo 500000 µs/quarter = 120 BPM
let end = 0;
for (const tr of score.tracks) {
  const ch = tr.channel & 15, ev = [];
  const cc = (t, c, v) => ev.push([tk(t), 1, [0xb0 | ch, c & 127, Math.max(0, Math.min(127, Math.round(v)))]]);
  if (tr.bank != null) { cc(0, 0, tr.bank); cc(0, 32, 0); }
  if (ch !== 9 || tr.program) ev.push([0, 2, [0xc0 | ch, (tr.program || 0) & 127]]);
  cc(0, 7, tr.volume ?? 100); cc(0, 10, tr.pan ?? 64); cc(0, 11, tr.expression ?? 127); cc(0, 91, tr.reverb ?? 40); cc(0, 93, tr.chorus ?? 0);
  for (const [t, p] of tr.programs || []) ev.push([tk(t), 2, [0xc0 | ch, p & 127]]);
  for (const [t, c, v] of tr.cc || []) cc(t, c, v);
  for (const [t, n, d, v] of tr.notes || []) {
    if (!(d > 0) || n < 0 || n > 127) continue;
    const a = tk(t), b = Math.max(a + 1, tk(t + d));
    ev.push([a, 4, [0x90 | ch, n, Math.max(1, Math.min(127, Math.round(v)))]]);
    ev.push([b, 3, [0x80 | ch, n, 0]]);                // note-offs sort before note-ons on the same tick
    end = Math.max(end, t + d);
  }
  tracks.push(trackBytes(ev));
}
const header = chunk('MThd', [0, 1, (tracks.length >> 8) & 255, tracks.length & 255, (PPQ >> 8) & 255, PPQ & 255]);
const smf = new Uint8Array([...header, ...tracks.flat()]);
fs.writeFileSync(outFile.replace(/\.f32$/, '') + '.mid', smf);

// ---------- render (the spessasynth_core README's MIDI-to-wav pipeline) ----------
const sr = 48000;
const bank = SoundBankLoader.fromArrayBuffer(fs.readFileSync(sfFile).buffer);
const midi = BasicMIDI.fromArrayBuffer(smf.buffer);
const synth = new SpessaSynthProcessor(sr, { eventsEnabled: false });
synth.soundBankManager.addSoundBank(bank, 'main');
await synth.processorInitialized;
synth.setSystemParameter('autoAllocateVoices', true);
const seq = new SpessaSynthSequencer(synth);
seq.loadNewSongList([midi]); seq.play();
const total = Math.max(score.seconds || 0, end) + 3;
const n = Math.ceil(sr * total), L = new Float32Array(n), R = new Float32Array(n);
for (let i = 0; i < n; i += 128) { seq.processTick(); synth.process(L, R, i, Math.min(128, n - i)); }
const inter = new Float32Array(n * 2);
for (let i = 0; i < n; i++) { inter[2 * i] = L[i]; inter[2 * i + 1] = R[i]; }
fs.writeFileSync(outFile, Buffer.from(inter.buffer));
let pk = 0; for (let i = 0; i < inter.length; i++) pk = Math.max(pk, Math.abs(inter[i]));
console.log(JSON.stringify({ tracks: score.tracks.length, notes: score.tracks.reduce((a, t) => a + (t.notes || []).length, 0), seconds: +total.toFixed(2), peak: +pk.toFixed(3) }));
