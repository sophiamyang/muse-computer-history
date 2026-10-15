#!/usr/bin/env python3
"""Master the rendered score: tools/master.py plan.json in.f32 out.wav [--lufs -16]
Levels the mix to a target loudness (simple K-weighted-ish RMS), applies a look-ahead peak limiter at -1 dBFS,
fades the tail into the picture's fade to black and writes a 48 kHz 16-bit WAV of length total + 1.0 s."""
import json, sys, wave
import numpy as np
from scipy import signal
plan, src, out = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
target = float(sys.argv[sys.argv.index('--lufs') + 1]) if '--lufs' in sys.argv else -16.0
SR = 48000; total = plan['total']; N = int((total + 1.0) * SR)
x = np.fromfile(src, '<f4').reshape(-1, 2).astype(np.float64)
x = np.vstack([x, np.zeros((max(0, N - len(x)), 2))])[:N]
x -= x.mean(0)                                                       # no DC
# loudness: high-shelf + high-pass weighting (approximate K-weighting), then RMS over the film
b, a = signal.butter(2, 60, 'high', fs=SR); kw = signal.lfilter(b, a, x, axis=0)
b, a = signal.butter(1, 1500, 'high', fs=SR); kw = kw + 0.6 * signal.lfilter(b, a, kw, axis=0)
lvl = 10 * np.log10(np.mean(kw[:int(total * SR)] ** 2) + 1e-12)
x *= 10 ** ((target - lvl) / 20)
# look-ahead limiter: gain = min over a 5 ms window of (ceiling / |x|), smoothed
ceil = 10 ** (-1.0 / 20); la = int(0.005 * SR)
pk = np.abs(x).max(1); need = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
g = need.copy()
for k in range(1, la + 1): g[:-k] = np.minimum(g[:-k], need[k:])  # look ahead
rel = np.exp(-1 / (0.08 * SR)); sm = np.empty_like(g); cur = 1.0
for i in range(len(g)):                                                # attack instant (already looked ahead), release 80 ms
    cur = g[i] if g[i] < cur else cur * rel + g[i] * (1 - rel); sm[i] = cur
x *= sm[:, None]
x = np.clip(x, -ceil, ceil)
# tail: fade with the picture (fade to black over the last 0.7 s); a longer musical fade from total - 1.6
f0, f1 = int((total - 1.6) * SR), int(total * SR)
fade = np.ones(N); fade[f0:f1] = np.cos(np.linspace(0, np.pi / 2, f1 - f0)) ** 2; fade[f1:] = 0
x *= fade[:, None]
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
print(f'{out}: {N / SR:.2f} s, loudness {target:.1f} (from {lvl:.1f}), peak {20 * np.log10(np.abs(x).max() + 1e-9):.1f} dBFS, limiter max reduction {20 * np.log10(sm.min()):.1f} dB')
