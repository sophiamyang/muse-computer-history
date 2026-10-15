#!/usr/bin/env python3
"""Objective checks on a score: tools/audio_report.py plan.json score.wav [--png spectro.png]
Per section: RMS, spectral centroid, onset rate, detected key (Krumhansl chroma). Whole file: peak, clipping, DC,
gaps (quiet windows), clicks (sample jumps far above the local level), sections' crossfade dips."""
import json, sys, wave
import numpy as np
from scipy import signal
plan = json.load(open(sys.argv[1])); S = plan['shots']; total = plan['total']
w = wave.open(sys.argv[2]); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, w.getnchannels()).astype(np.float64) / 32768
m = x.mean(1); db = lambda v: 20 * np.log10(max(v, 1e-9))
b = [0.0] + [a['end'] if a['out'] == 'push' else c['start'] for a, c in zip(S, S[1:])] + [total]
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]); MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
def key(seg):
    f, t, Z = signal.stft(seg, sr, nperseg=8192); P = np.abs(Z) ** 2; ch = np.zeros(12)
    for i, fr in enumerate(f):
        if 60 < fr < 4000: ch[int(round(12 * np.log2(fr / 440) + 9)) % 12] += P[i].sum()
    best = max([(np.corrcoef(np.roll(MAJ, k), ch)[0, 1], NAMES[k] + ' maj') for k in range(12)] + [(np.corrcoef(np.roll(MIN, k), ch)[0, 1], NAMES[k] + ' min') for k in range(12)])
    return best[1], best[0]
def onsets(seg):
    f, t, Z = signal.stft(seg, sr, nperseg=1024, noverlap=512); A = np.log1p(np.abs(Z)); flux = np.maximum(0, np.diff(A, axis=1)).sum(0)
    pk, _ = signal.find_peaks(flux, height=flux.mean() + 1.5 * flux.std(), distance=4); return len(pk) / max(1e-6, len(seg) / sr)
print(f"duration {len(x) / sr:.2f} s  peak {db(np.abs(x).max()):.1f} dBFS  clipped {(np.abs(x) > 0.999).sum()}  DC {x.mean():+.4f}  overall RMS {db(np.sqrt((m ** 2).mean())):.1f} dB")
rows = []
for i, sh in enumerate(S):
    seg = m[int(b[i] * sr):int(b[i + 1] * sr)]; r = db(np.sqrt((seg ** 2).mean()))
    f, P = signal.welch(seg, sr, nperseg=4096); cen = (f * P).sum() / P.sum(); k, kc = key(seg)
    rows.append(r); print(f"{i + 1} {sh['scene']:10} {b[i]:6.2f}-{b[i + 1]:6.2f}  RMS {r:6.1f} dB  centroid {cen:6.0f} Hz  onsets {onsets(seg):4.1f}/s  key {k} ({kc:.2f})")
print(f"section RMS spread {max(rows) - min(rows):.1f} dB")
hop = int(0.05 * sr); win = np.array([np.sqrt((m[i:i + hop] ** 2).mean()) for i in range(0, int(total * sr) - hop, hop)])
gaps = [i * 0.05 for i in range(len(win)) if db(win[i]) < -45 and i * 0.05 < total - 0.8]
print('quiet 50 ms windows (< -45 dB) before the end fade:', len(gaps), (f'first at {gaps[0]:.2f} s' if gaps else ''))
d = np.abs(np.diff(m)); loc = np.convolve(np.abs(m), np.ones(480) / 480, 'same')[1:] + 1e-4; cl = np.where((d > 0.25) & (d > 8 * loc))[0]
print('click candidates:', len(cl), ', '.join(f'{c / sr:.3f}' for c in cl[:8]))
for t in b[1:-1]:
    a = m[int((t - 0.6) * sr):int((t + 0.6) * sr)]; ww = [db(np.sqrt((a[j:j + hop] ** 2).mean())) for j in range(0, len(a) - hop, hop)]
    print(f'  boundary {t:6.2f}: min {min(ww):6.1f} dB, around {np.median(ww):6.1f} dB')
if '--png' in sys.argv:
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    f, t, Z = signal.stft(m, sr, nperseg=4096, noverlap=3072); A = 20 * np.log10(np.abs(Z) + 1e-7)
    fig, ax = plt.subplots(figsize=(18, 6)); ax.pcolormesh(t, f, A, vmin=A.max() - 80, vmax=A.max(), shading='auto', cmap='magma'); ax.set_yscale('symlog', linthresh=200); ax.set_ylim(40, 16000)
    for i, sh in enumerate(S): ax.axvline(b[i], color='w', lw=.6); ax.text(b[i] + .2, 12000, sh['scene'], color='w', fontsize=9)
    for sh in S:
        for e in sh['sfx']: ax.plot(e['t'], 60, 'c|', ms=12)
    ax.set_xlabel('s'); fig.tight_layout(); fig.savefig(sys.argv[sys.argv.index('--png') + 1], dpi=80)
