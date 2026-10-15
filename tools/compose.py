# [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T14:55:22.668Z (revision)
# [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] 2026-10-14T14:51:03.343Z
import json
import sys
import os
import numpy as np

BPM = 84
BEAT = 60.0 / BPM
BAR = 4 * BEAT
KEY = "D major"
ROOT_PC = 2  # D

# Theme: 8 bars = 32 beats, singable rising hook
# (beat_offset, midi, dur_beats)
THEME = [
    (0, 62, 1.0),   # D4
    (1, 64, 1.0),   # E4
    (2, 66, 1.5),   # F#4
    (3.5, 67, 0.5), # G4
    (4, 69, 2.0),   # A4
    (6, 67, 1.0),   # G4
    (7, 66, 1.0),   # F#4
    (8, 64, 1.5),   # E4
    (9.5, 62, 0.5), # D4
    (10, 64, 2.0),  # E4
    (12, 66, 1.0),  # F#4
    (13, 67, 1.0),  # G4
    (14, 69, 1.5),  # A4
    (15.5, 71, 0.5),# B4
    (16, 69, 1.0),  # A4
    (17, 67, 1.0),  # G4
    (18, 66, 1.5),  # F#4
    (19.5, 64, 0.5),# E4
    (20, 62, 2.0),  # D4
    (22, 67, 1.0),  # G4
    (23, 69, 1.0),  # A4
    (24, 71, 2.0),  # B4
    (26, 69, 1.0),  # A4
    (27, 67, 1.0),  # G4
    (28, 66, 2.0),  # F#4
    (30, 64, 1.0),  # E4
    (31, 62, 1.0),  # D4
]

# Chord progression per bar (8 bars loop) - warm D major with borrowed iv
# each entry: root midi (C2=36) and triad intervals
# FIXED: Gm root was 53 (F) -> 55 (G). All roots checked: D=50, E=52, G=55, A=57, B=59
CHORDS = [
    {"root": 50, "name": "D", "tones": [0, 4, 7]},      # D F# A
    {"root": 55, "name": "G", "tones": [0, 4, 7]},      # G B D
    {"root": 59, "name": "Bm", "tones": [0, 3, 7]},     # B D F#
    {"root": 57, "name": "A", "tones": [0, 4, 7]},      # A C# E
    {"root": 55, "name": "G", "tones": [0, 4, 7]},      # G
    {"root": 52, "name": "Em", "tones": [0, 3, 7]},     # E G B
    {"root": 55, "name": "Gm", "tones": [0, 3, 7]},     # borrowed iv (G minor) G-Bb-D FIXED root 53->55
    {"root": 50, "name": "D", "tones": [0, 4, 7]},      # D
]

# voicing helpers
def chord_pitches(bar_idx, octave_shift=0):
    c = CHORDS[bar_idx % len(CHORDS)]
    root = c["root"] + octave_shift * 12
    pitches = []
    for iv in c["tones"]:
        pitches.append(root + iv)
    # add 9th on tonic bars
    if bar_idx % 8 == 0 or bar_idx % 8 == 7:
        pitches.append(root + 14)  # 9th (E)
    return pitches

def midi_to_name(midi):
    names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    n = names[midi % 12]
    octv = midi // 12 - 1
    return "{}{}".format(n, octv)

def beat_to_sec(b):
    return b * BEAT

def sec_to_beat(s):
    return s / BEAT

def quantize_downbeat(sec):
    # nearest bar start
    b = sec_to_beat(sec)
    bar = round(b / 4.0)
    return bar * BAR

def make_track(name, channel, program, volume, pan, reverb, chorus):
    return {
        "name": name,
        "channel": channel,
        "program": program,
        "volume": volume,
        "pan": pan,
        "reverb": reverb,
        "chorus": chorus,
        "notes": [],
        "cc": [],
        "programs": []
    }

def add_note(track, t, pitch, dur, vel, rng, humanize=True):
    if humanize:
        # deterministic jitter +-10ms, vel +-8
        dt = (rng.random() - 0.5) * 0.02
        dv = int((rng.random() - 0.5) * 16)
        t = t + dt
        if t < 0:
            t = 0
        vel = vel + dv
        if vel < 1:
            vel = 1
        if vel > 127:
            vel = 127
    # clamp
    if dur < 0.05:
        dur = 0.05
    track["notes"].append([float(t), int(pitch), float(dur), int(vel)])

def add_cc(track, t, cc, val):
    track["cc"].append([float(t), int(cc), int(val)])

def main():
    if len(sys.argv) < 3:
        print("usage: python tools/compose.py plan.json score.json")
        sys.exit(1)
    plan_path = sys.argv[1]
    out_path = sys.argv[2]

    # load plan
    if os.path.exists(plan_path):
        with open(plan_path, "r") as f:
            plan = json.load(f)
        total = float(plan.get("total", 61.2))
        shots = plan.get("shots", [])
    else:
        total = 61.2
        shots = []

    # fallback sections if shots empty - use table
    if not shots:
        tbl = [
            (0.00, 6.30, "engine", 1843),
            (6.30, 12.35, "newsreel", 1946),
            (12.35, 18.40, "mainframe", 1969),
            (18.40, 24.25, "pixel", 1983),
            (24.25, 28.55, "web", 1996),
            (28.55, 36.60, "phone", 2007),
            (36.60, 42.65, "whiteboard", 2017),
            (42.65, 46.95, "datacenter", 2026),
            (46.95, 61.20, "finale", 2026),
        ]
        shots = []
        for s, e, scene, year in tbl:
            shots.append({"scene": scene, "year": year, "title": scene, "start": s, "end": e, "act": s, "actEnd": e, "out": "push", "handover": "push", "sfx": []})
        sfx_map = [
            (2.22, "tick"), (2.75, "tick"), (3.28, "tick"), (3.72, "tick"), (3.78, "chime"),
            (8.70, "click"), (9.00, "thump"),
            (14.85, "click"), (15.15, "tick"), (15.35, "tick"), (15.65, "tick"),
            (20.43, "thump"), (20.63, "pop"), (21.27, "beep"),
            (26.12, "click"), (26.65, "beep"), (26.95, "beep"), (27.62, "pop"),
            (32.28, "click"), (32.85, "chime"), (33.15, "chime"),
            (38.40, "tick"), (38.80, "tick"), (39.40, "tick"), (39.80, "chime"),
            (44.82, "thump"), (45.05, "tick"), (45.25, "tick"), (45.45, "tick"), (45.65, "tick"), (45.95, "beep"),
            (50.65, "tick"), (50.95, "tick"), (51.25, "tick"), (51.55, "tick"), (52.25, "beep"), (52.70, "beep"), (53.25, "beep"), (53.95, "thump"), (57.25, "chime"),
        ]
        for t, kind in sfx_map:
            for sh in shots:
                if sh["start"] <= t < sh["end"]:
                    if "sfx" not in sh:
                        sh["sfx"] = []
                    sh["sfx"].append({"u": "", "kind": kind, "t": t})
                    break

    # collect all sfx flat
    all_sfx = []
    for sh in shots:
        for s in sh.get("sfx", []):
            all_sfx.append((float(s["t"]), s["kind"]))

    # sort shots by start
    shots = sorted(shots, key=lambda x: x["start"])

    # --- FIX (2): derive MUSIC SECTION boundaries from push/pull handover ---
    # push: section changes at shot's end; pull: at next shot's start
    n = len(shots)
    boundaries = [0.0] * (n + 1)
    boundaries[0] = float(shots[0]["start"])
    for i in range(n - 1):
        out = shots[i].get("out", "")
        handover = shots[i].get("handover", "")
        # treat handover field if out missing
        is_push = (out == "push" or handover == "push")
        is_pull = (out == "pull" or handover == "pull")
        if is_push:
            boundaries[i + 1] = float(shots[i]["end"])
        elif is_pull:
            boundaries[i + 1] = float(shots[i + 1]["start"])
        else:
            # default to push semantics
            boundaries[i + 1] = float(shots[i]["end"])
    boundaries[n] = float(shots[-1]["end"])
    # clamp to total
    if boundaries[n] > total:
        boundaries[n] = total
    # build sections from boundaries
    sections = []
    for i in range(n):
        s = float(boundaries[i])
        e = float(boundaries[i + 1])
        if e <= s:
            # ensure monotonic; fallback to shot end
            e = float(shots[i]["end"])
        sections.append((s, e, shots[i].get("scene", ""), shots[i].get("year", 0)))

    rng = np.random.RandomState(42)

    # create tracks
    strings_bed = make_track("strings bed", 1, 48, 96, 64, 80, 10)
    strings2 = make_track("strings 2 trem", 2, 49, 90, 58, 85, 10)
    harp = make_track("harp celesta", 3, 46, 92, 70, 85, 10)
    lead = make_track("lead theme", 4, 10, 100, 64, 75, 10)
    bass = make_track("bass", 5, 32, 88, 64, 30, 5)
    pad = make_track("pad brass", 6, 60, 80, 64, 60, 10)
    drums = make_track("drums", 9, 0, 90, 64, 30, 5)
    fx = make_track("fx sparkles", 10, 9, 85, 64, 70, 10)
    piano = make_track("piano", 0, 0, 90, 60, 80, 10)
    timpani = make_track("timpani", 11, 47, 95, 64, 60, 5)

    tracks = [piano, strings_bed, strings2, harp, lead, bass, pad, drums, fx, timpani]

    # program maps per era in order
    era_names = ["1843", "1946", "1969", "1983", "1996", "2007", "2017", "2026", "finale"]
    lead_prog_map = {
        "1843": 10,
        "1946": 59,
        "1969": 11,
        "1983": 80,
        "1996": 24,
        "2007": 12,
        "2017": 0,
        "2026": 89,
        "finale": 73
    }
    bass_prog_map = {
        "1843": 32,
        "1946": 32,
        "1969": 32,
        "1983": 33,
        "1996": 33,
        "2007": 33,
        "2017": 32,
        "2026": 38,
        "finale": 38
    }
    pad_prog_map = {
        "1843": 60,
        "1946": 60,
        "1969": 16,
        "1983": 16,
        "1996": 16,
        "2007": 89,
        "2017": 89,
        "2026": 89,
        "finale": 94
    }
    harp_prog_map = {
        "1843": 46,
        "1946": 46,
        "1969": 46,
        "1983": 8,
        "1996": 46,
        "2007": 46,
        "2017": 46,
        "2026": 8,
        "finale": 46
    }

    # build programs lists using SECTION boundaries (not shot starts)
    # ensure program change on last silent moment before section's first downbeat
    # we place change at section start; previous notes end >=0.3s earlier via effective_end
    lead_programs = []
    bass_programs = []
    pad_programs = []
    harp_programs = []
    for idx, (s, e, scene, year) in enumerate(sections):
        era = era_names[idx] if idx < len(era_names) else era_names[-1]
        lp = lead_prog_map.get(era, 10)
        bp = bass_prog_map.get(era, 32)
        pp = pad_prog_map.get(era, 60)
        hp = harp_prog_map.get(era, 46)
        if not lead_programs or lead_programs[-1][1] != lp:
            lead_programs.append([float(s), int(lp)])
        if not bass_programs or bass_programs[-1][1] != bp:
            bass_programs.append([float(s), int(bp)])
        if not pad_programs or pad_programs[-1][1] != pp:
            pad_programs.append([float(s), int(pp)])
        if not harp_programs or harp_programs[-1][1] != hp:
            harp_programs.append([float(s), int(hp)])

    lead["programs"] = lead_programs
    bass["programs"] = bass_programs
    pad["programs"] = pad_programs
    harp["programs"] = harp_programs
    piano["programs"] = [[0.0, 0]]
    strings_bed["programs"] = [[0.0, 48]]
    strings2["programs"] = [[0.0, 49], [52.5, 44]]
    fx["programs"] = [[0.0, 9], [54.2, 112]]
    timpani["programs"] = [[0.0, 47]]
    drums["programs"] = [[0.0, 0]]

    total_beats = sec_to_beat(total)
    total_bars = int(np.ceil(total_beats / 4.0)) + 2

    # --- strings bed continuous ---
    for bar in range(total_bars):
        t = bar * BAR
        if t >= total + 1:
            break
        pitches = chord_pitches(bar, octave_shift=0)
        add_cc(strings_bed, t, 11, 85)
        add_cc(strings_bed, t + BAR * 0.5, 11, 96)
        add_cc(strings_bed, t + BAR * 0.95, 11, 85)
        add_cc(strings_bed, t, 1, 20)
        add_cc(strings_bed, t + BAR * 0.5, 1, 35)
        for i, p in enumerate(pitches):
            vp = p
            if vp < 48:
                vp += 12
            if vp > 69:
                vp -= 12
            dur = BAR * 0.98
            vel = 58 + (i * 2)
            if t < 6.3:
                vel -= 6
            if 54.0 < t < 56.5:
                vel += 8
            if t > 57.8:
                vel -= 10
            add_note(strings_bed, t + i * 0.02, vp, dur, vel, rng)

    # strings2 doubles an octave higher, softer, and tremolo at finale
    for bar in range(total_bars):
        t = bar * BAR
        if t >= total:
            break
        pitches = chord_pitches(bar, octave_shift=1)
        for p in pitches[:2]:
            vp = p
            if vp > 76:
                vp -= 12
            dur = BAR * 0.95
            vel = 42
            if 54.0 < t < 56.5:
                vel = 55
            add_note(strings2, t, vp, dur, vel, rng)

    # harp arpeggios continuous - THINNED to gentle quarter-note broken chords (4 per bar)
    for bar in range(total_bars):
        t = bar * BAR
        if t >= total:
            break
        pitches = chord_pitches(bar, octave_shift=1)
        base = sorted(pitches)
        # 4-note quarter pattern: root, third, fifth, octave
        pattern = [
            base[0],
            base[1] if len(base) > 1 else base[0] + 4,
            base[2] if len(base) > 2 else base[0] + 7,
            base[0] + 12
        ]
        for i in range(4):
            nt = t + i * BEAT
            if nt >= total:
                break
            p = pattern[i % len(pattern)]
            while p < 60:
                p += 12
            while p > 84:
                p -= 12
            vel = 52
            if t < 6.3:
                vel = 46
            add_note(harp, nt, p, BEAT * 0.85, vel, rng)
        add_cc(harp, t, 11, 90)

    # bass line: root per bar with walking for 1946
    for bar in range(total_bars):
        t = bar * BAR
        if t >= total:
            break
        c = CHORDS[bar % len(CHORDS)]
        root = c["root"] - 12
        if 6.3 <= t < 12.35:
            for i in range(4):
                nt = t + i * BEAT
                if i == 0:
                    p = root
                elif i == 1:
                    p = root + 2
                elif i == 2:
                    p = root + 4
                else:
                    p = root + 5
                add_note(bass, nt, p, BEAT * 0.85, 62, rng)
        elif 12.35 <= t < 18.4:
            add_note(bass, t, root, BEAT * 1.8, 60, rng)
            add_note(bass, t + 2 * BEAT, root + 7, BEAT * 1.8, 58, rng)
        else:
            add_note(bass, t, root, BAR * 0.9, 60, rng)
        add_cc(bass, t, 11, 85)

    # pad brass / warm pad sustained
    for bar in range(total_bars):
        t = bar * BAR
        if t >= total:
            break
        pitches = chord_pitches(bar, octave_shift=0)
        for p in pitches[:3]:
            vp = p - 12
            add_note(pad, t, vp, BAR * 0.95, 45, rng)
        add_cc(pad, t, 11, 75)
        if 54.0 < t < 56.5:
            add_cc(pad, t, 11, 95)

    # piano: chords in whiteboard and finale, plus soft comp elsewhere
    for bar in range(total_bars):
        t = bar * BAR
        if t >= total:
            break
        if 36.6 <= t < 42.65 or t >= 46.95:
            pitches = chord_pitches(bar, octave_shift=1)
            for p in pitches:
                vp = p
                add_note(piano, t, vp, BAR * 0.9, 62, rng)
            add_cc(piano, t, 11, 90)
            add_cc(piano, t, 64, 127)
            add_cc(piano, t + BAR * 0.9, 64, 0)
        elif t < 6.3:
            pitches = chord_pitches(bar, octave_shift=1)
            for p in pitches[:2]:
                add_note(piano, t, p, BAR * 0.8, 38, rng)

    # lead melody per section - uses SECTION boundaries and fixes Gm clash
    for idx, (s, e, scene, year) in enumerate(sections):
        era = era_names[idx] if idx < len(era_names) else era_names[-1]
        down = quantize_downbeat(s)
        if abs(down - s) > 1.0:
            down = s
        if down < s - 0.5:
            down = down + BAR
        # ensure first downbeat at or after section start
        if down < s:
            # move to next bar
            while down < s:
                down += BAR
        start_beat = sec_to_beat(down)
        end_beat = sec_to_beat(e)
        effective_end_beat = end_beat - 0.4 / BEAT
        loop_len = 32
        beats_needed = effective_end_beat - start_beat
        loops = int(np.ceil(beats_needed / loop_len)) + 1 if beats_needed > 0 else 0
        for lp in range(loops):
            base_beat = start_beat + lp * loop_len
            for (off, pitch, dur_beats) in THEME:
                ab = base_beat + off
                if ab < start_beat - 0.01:
                    continue
                if ab >= effective_end_beat:
                    break
                # FIX (1): avoid B natural over Gm (Bb)
                bar_idx = int(ab // 4)
                chord = CHORDS[bar_idx % len(CHORDS)]
                adj_pitch = pitch
                if chord["name"] == "Gm" and (pitch % 12) == 11:
                    # B natural -> Bb
                    adj_pitch = pitch - 1
                t = beat_to_sec(ab)
                dur = dur_beats * BEAT * 0.92
                vel_map = {
                    "1843": 62,
                    "1946": 72,
                    "1969": 68,
                    "1983": 58,
                    "1996": 70,
                    "2007": 70,
                    "2017": 72,
                    "2026": 60,
                    "finale": 85
                }
                vel = vel_map.get(era, 70)
                if 46.95 <= t < 50.4:
                    vel = 62
                if 54.2 <= t < 56.4:
                    vel = 88
                if beat_to_sec(ab + dur_beats) > e:
                    dur = max(0.1, e - t - 0.05)
                add_note(lead, t, adj_pitch, dur, vel, rng)
        add_cc(lead, max(s, e - BEAT), 11, 90)
        add_cc(lead, e, 11, 40)

    # drums light percussion per era
    for bar in range(total_bars):
        t = bar * BAR
        if t >= total:
            break
        if 6.3 <= t < 12.35:
            add_note(drums, t + 1 * BEAT, 37, 0.1, 45, rng, humanize=False)
            add_note(drums, t + 3 * BEAT, 37, 0.1, 45, rng, humanize=False)
            for i in range(8):
                add_note(drums, t + i * BEAT * 0.5, 42, 0.1, 28, rng, humanize=False)
        elif 12.35 <= t < 18.4:
            add_note(drums, t, 75, 0.1, 40, rng, humanize=False)
            add_note(drums, t + 1.5 * BEAT, 75, 0.1, 40, rng, humanize=False)
            add_note(drums, t + 2 * BEAT, 37, 0.1, 35, rng, humanize=False)
        elif 18.4 <= t < 24.25:
            for i in range(4):
                add_note(drums, t + i * BEAT, 42, 0.1, 30, rng, humanize=False)
        elif 24.25 <= t < 28.55:
            add_note(drums, t, 36, 0.1, 50, rng, humanize=False)
            add_note(drums, t + 1 * BEAT, 37, 0.1, 40, rng, humanize=False)
            add_note(drums, t + 2 * BEAT, 36, 0.1, 45, rng, humanize=False)
            add_note(drums, t + 3 * BEAT, 37, 0.1, 40, rng, humanize=False)
        elif 28.55 <= t < 36.6:
            for i in range(8):
                add_note(drums, t + i * BEAT * 0.5, 54, 0.1, 35, rng, humanize=False)
        elif 42.65 <= t < 46.95:
            add_note(drums, t + 1 * BEAT, 37, 0.1, 30, rng, humanize=False)
            add_note(drums, t + 3 * BEAT, 37, 0.1, 30, rng, humanize=False)

    # finale special drums/timpani/cymbals
    roll_start = 52.25
    roll_end = 53.95
    rt = roll_start
    while rt < roll_end:
        add_note(timpani, rt, 45, 0.2, 55, rng)
        rt += 0.12
        add_cc(timpani, rt, 11, int(70 + (rt - roll_start) / (roll_end - roll_start) * 30))
    add_note(timpani, 53.95, 33, 1.2, 90, rng)
    add_note(timpani, 54.2, 38, 1.5, 100, rng)
    add_note(timpani, 54.9, 45, 0.8, 70, rng)
    add_note(timpani, 55.6, 43, 0.8, 70, rng)
    add_note(drums, 54.2, 49, 1.5, 100, rng, humanize=False)
    add_note(drums, 54.2, 57, 1.5, 90, rng, humanize=False)
    for i in range(8):
        tt = 52.5 + i * 0.2
        vel = 30 + i * 8
        add_note(drums, tt, 51, 0.3, vel, rng, humanize=False)
    add_note(drums, 53.0, 49, 0.8, 60, rng, humanize=False)

    # sfx handling
    for (t, kind) in all_sfx:
        if kind == "tick":
            add_note(drums, t, 76, 0.15, 60, rng, humanize=False)
            add_note(fx, t, 72, 0.3, 55, rng)
        elif kind == "click":
            add_note(drums, t, 37, 0.15, 65, rng, humanize=False)
        elif kind == "chime":
            p = 74 if t > 57 else 69
            add_note(fx, t, p, 1.2, 65, rng)
            add_note(fx, t, p + 7, 1.2, 50, rng)
        elif kind == "thump":
            add_note(drums, t, 41, 0.4, 70, rng, humanize=False)
            add_note(timpani, t, 38, 0.6, 70, rng)
        elif kind == "beep":
            if abs(t - 52.25) < 0.05:
                p = 69
            elif abs(t - 52.70) < 0.05:
                p = 71
            elif abs(t - 53.25) < 0.05:
                p = 73
            else:
                p = 67
            add_note(fx, t, p, 0.4, 70, rng)
        elif kind == "pop":
            add_note(fx, t, 67, 0.3, 60, rng)
            add_note(drums, t, 37, 0.1, 50, rng, humanize=False)
        else:
            add_note(drums, t, 76, 0.15, 55, rng, humanize=False)

    # finale sparkles 54.2-56.4 glock/tinkle
    spark_times = [54.4, 54.7, 55.0, 55.3, 55.6, 55.9, 56.1]
    for st in spark_times:
        PENT = [86, 88, 90, 93, 95, 98]
        k = int(rng.random() * 4)
        p = PENT[k]
        add_note(fx, st, p, 0.5, 65, rng)
        add_note(fx, st + 0.15, PENT[k + 2], 0.4, 55, rng)

    # harp glissando at transitions: soft flourish at each section start
    for (s, e, scene, year) in sections:
        if s == 0:
            continue
        gt = s - 0.1
        if gt < 0:
            continue
        for i in range(6):
            add_note(harp, gt + i * 0.06, 60 + i * 2, 0.3, 50, rng)

    # finale rising harp notes on countdown
    for (tt, pitch) in [(52.25, 69), (52.70, 71), (53.25, 73)]:
        add_note(harp, tt, pitch, 0.6, 75, rng)
        add_note(harp, tt, pitch + 12, 0.6, 65, rng)

    # final chime at 57.25
    add_note(fx, 57.25, 74, 1.5, 70, rng)
    add_note(fx, 57.25, 78, 1.5, 60, rng)

    # final chord hold 57.8-61.2 tonic Dadd9
    final_start = 57.8
    final_pitches = [50, 54, 57, 62, 64]
    for p in final_pitches:
        add_note(strings_bed, final_start, p, 3.4, 60, rng)
        add_note(strings2, final_start, p + 12, 3.4, 50, rng)
        add_note(piano, final_start, p + 12, 3.4, 55, rng)
        add_note(pad, final_start, p, 3.4, 45, rng)
    add_cc(strings_bed, final_start, 11, 90)
    add_cc(strings_bed, 60.5, 11, 70)
    add_cc(strings_bed, 61.0, 11, 30)
    add_cc(piano, final_start, 11, 85)
    add_cc(piano, 61.0, 11, 20)

    # music box echo of hook at 59.5
    echo = [(0, 69), (0.5, 71), (1.0, 73), (1.5, 74)]
    for off, p in echo:
        add_note(fx, 59.5 + off, p, 0.6, 55, rng)

    # ensure all tracks sorted by time
    for tr in tracks:
        tr["notes"] = sorted(tr["notes"], key=lambda x: x[0])
        tr["cc"] = sorted(tr["cc"], key=lambda x: x[0])
        tr["programs"] = sorted(tr["programs"], key=lambda x: x[0])

    total_notes = sum(len(tr["notes"]) for tr in tracks)

    score = {
        "seconds": float(total),
        "tracks": tracks
    }

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w") as out:
        json.dump(score, out, indent=2)

    first_bar_names = " ".join(midi_to_name(p) for (_, p, _) in THEME[:4])
    print("tracks={} notes={} tempo={} key={} theme_first_bar='{}'".format(len(tracks), total_notes, BPM, KEY, first_bar_names))
    # print program changes per channel for verification
    for tr in tracks:
        if tr["programs"]:
            print("channel {} '{}' programs: {}".format(tr["channel"], tr["name"], tr["programs"]))

if __name__ == "__main__":
    main()
