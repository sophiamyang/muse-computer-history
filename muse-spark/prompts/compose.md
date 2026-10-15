# YOUR TASK: compose the score for "A Short History of Computing", played by REAL SAMPLED INSTRUMENTS

Write ONE Python 3.9 file, `tools/compose.py`, run as `python tools/compose.py plan.json score.json`. It must work on
**Python 3.9**: no `match` statements, no `X | Y` type hints, standard library + numpy only. It composes the music
and writes **score.json**: the notes, instruments and mix for every part. Our renderer plays score.json with a
General MIDI SoundFont (GeneralUser GS: real recorded piano, strings, brass, woodwinds, music box, celesta, vibes,
marimba, harp, timpani, drums…), adds the SoundFont's own reverb and chorus, and masters it. So you are the
**composer and orchestrator**, not a synth programmer. Write it like a real film cue.

## score.json format (exactly)
```json
{ "seconds": <float, the film length>,
  "tracks": [
    { "name": "strings bed", "channel": 1, "program": 48,
      "volume": 96, "pan": 64, "reverb": 70, "chorus": 10,
      "notes": [[t_seconds, midi_note, duration_seconds, velocity_1_127], ...],
      "cc": [[t_seconds, controller, value_0_127], ...],
      "programs": [[t_seconds, program], ...] }
  ] }
```
- `channel` 0–15; **channel 9 is the drum kit** (notes = drum sounds, see the map below). Up to 16 tracks; one
  track per channel. Reuse a channel across eras with `programs` changes only while it is silent (leave ≥ 0.3 s).
- `cc`: use CC11 (expression) for swells, fades and crossfades, CC64 (sustain pedal: 127 on, 0 off) for piano,
  CC1 (modulation) for string vibrato, CC7 only for static track level.
- Times are absolute seconds. Write notes on a musical grid (one tempo for the whole film), then convert to seconds.

## THE MOOD (the most important part of this brief)
The previous score had the **wrong mood**. It was busy and chirpy, with a different gimmick every few seconds, so it
felt like a toy commercial. This film is a small, tender journey, and the music should feel like it:
- **Warm, tender, gently wondrous, a little nostalgic, hopeful.** Think of the music under a beloved animated short:
  a quiet sense of awe, curiosity and affection, rising to joy at the fireworks. It should leave the listener
  smiling, maybe a little moved.
- **Unhurried.** Around 80–88 BPM, mostly legato, lots of air and space, phrases that breathe. Never frantic or
  busy. Light percussion only where an era needs a groove, kept soft.
- **One continuous piece, not nine jingles.** A warm **core** of soft strings (String Ensemble / slow strings) with
  harp or piano carries the harmony through the WHOLE film, so the mood is continuous. Each era adds its **period
  colour** on top, playing the theme: it's the same piece, briefly re-orchestrated, never a hard style switch.
- **Harmony:** lyrical and warm. Major key (D major suggested), added 9ths, maj7s, suspensions that resolve, a
  tender ii–V, an occasional borrowed iv (minor four) for a touch of nostalgia. Smooth voice leading, bass mostly on
  roots with stepwise passing tones.
- **The theme:** one memorable, singable 8-bar melody with a clear, rising hook (a gentle upward reach that feels
  like curiosity), then a cadence that feels like coming home. It should work slowly and softly (music box) and big
  and broad (finale).

## The journey: period colour per era (the lead plays the theme; the strings core stays underneath)
1. 1843 engine: **Music Box (10)** lead, harp (46) arpeggios, very soft high strings. Delicate, wondrous: the film
   opening. Quiet start.
2. 1946 newsreel: **Muted Trumpet (59)** or Clarinet (71) lead, soft and nostalgic, with a gentle swing feel: upright
   bass (32) walking softly, soft brushes (side stick or closed hi-hat at low velocity), a warm brass-section pad
   (French Horn 60) underneath. Nostalgic 1940s warmth, not a brassy fanfare.
3. 1969 mainframe: **Vibraphone (11)** lead with a soft Rhodes (4) and upright bass, a gentle bossa feel (soft
   claves or side stick). Cool and calm.
4. 1983 pixel: **Lead 1 square (80)** at LOW velocity, playing the theme simply, plus a soft arpeggio on Celesta (8)
   or Glockenspiel (9). The strings stay underneath so the mood stays warm: playful but gentle, not a chiptune blast.
5. 1996 web: **Nylon or Clean Electric Guitar (24 or 27)** playing the theme, with a soft Drawbar Organ (16) pad,
   fingered bass (33) and a light, relaxed beat. A friendly, homey 90s feel.
6. 2007 phone: **Marimba (12)** lead, Pizzicato Strings (45), a light shaker or tambourine. Bright and hopeful.
7. 2017 whiteboard: **Acoustic Grand Piano (0)** alone with the strings core: the most intimate, thoughtful moment,
   with sustain pedal. Quiet and lovely.
8. 2026 datacenter: **Pad 2 warm (89)** or Pad 7 halo (94) with a soft pulsing arpeggio (Celesta 8 or Kalimba 108 in
   8ths) and sub bass (Synth Bass 38, soft). Modern, glowing anticipation, building toward the finale.
9. Finale: the **full ensemble**: strings (48 + 49), piano, French horns (60), flute (73) or violin (40) on the
   melody, harp, glockenspiel, timpani (47) and cymbals.
   - 46.95–50.40: Jolly steps out of the laptop into a warm dusk room. A tender restatement on piano and strings.
   - 50.40–51.80: the laptop types "light up the sky?". Hushed, expectant (a held chord, soft celesta).
   - 52.25, 52.70, 53.25: "On it… 3… 2… 1…". A gentle **build**: rising harp or celesta notes on each count,
     string tremolo (44) swelling (CC11), a timpani roll, a suspended cymbal swell (ride cymbal roll or reverse
     cymbal 119) into the downbeat.
   - 53.95: Jolly closes the lid (a soft low timpani note). Then at ~54.2 the **fireworks burst**: the emotional
     peak. The theme's hook in full ensemble, broad and warm, with a crash cymbal and timpani on the downbeat. You may
     modulate up a step here.
   - 54.2–56.4: fireworks over the city. Joyful, soaring, but still warm (not bombastic). Glockenspiel and tinkle
     bell (112) sparkles as the "sparks".
   - 56.4–57.8: the sparks settle into the words "Muse Spark / now on Fireworks". The music softens into the cadence;
     a celesta/glock chime at 57.25.
   - 57.8–61.2: hold on the lockup. A warm final chord (tonic, with an added 9th) sustained in strings and piano, a
     last gentle music-box echo of the hook (bookending the opening), fading out by 61.2 (the picture fades
     60.5–61.2; the master also fades the last 1.6 s).

## Transitions between eras
Each era's section starts at the time in the table (a camera move through an object is happening around then).
Bring each era's colour in **on a downbeat near its section start** and let the previous colour **finish its phrase
and fade with CC11 over about one beat**. The strings core never stops, so there is never a gap. No whooshes or
risers at transitions; a soft harp glissando or celesta flourish is welcome.

## Sound effects as musical touches (from plan.json sfx; play them on real instruments, quietly, in the key)
At each sfx time `t`, write a small note or two on a dedicated "fx" track (or the drum channel) that matches the
on-screen action, in tune and a little under the music (velocity ~50–80):
- tick: Hi Wood Block (76) or claves (75), or a soft celesta note for a crank or typing
- click: Side Stick (37)
- chime: Glockenspiel (9) or Tubular Bells (14), a chord tone, let it ring
- thump: Low Floor Tom (41) or a low Timpani (47) note
- beep: a Celesta (8) or Glockenspiel (9) note; in the finale countdown make the three beeps RISE (e.g. A, B, C♯ or
  scale degrees 5–6–7 leading to the tonic on the fireworks)
- pop: Pizzicato (45) or Marimba (12) staccato note
For 1843 make the crank ticks a soft woodblock and the bell a Tubular Bell. For the fireworks add a few timpani
booms (low, soft) and quick tinkle-bell / glockenspiel sparkles, never harsh.

## Balance and dynamics
- Sections should feel even in loudness (the master levels the whole film, so balance with velocity and CC11): the
  opening a little softer, the finale peak at 54–56 s the loudest, the end soft.
- Melody clearly on top; strings core at moderate level (velocity 50–70, CC11 ~80–100); bass and drums soft.
- Humanise a little, deterministically (velocity ±8, timing ±10 ms; not on the beat-locked drum grid).
- Pan for width: strings spread (violins left of centre, cellos right), lead centre-ish, harp/celesta slightly off.
- Reverb (CC91): generous on strings, harp, piano, music box and celesta (70–100); less on bass and drums (20–40).

## Timeline (absolute seconds from plan.json; read them from the file rather than hard-coding)
A push hands the frame to the next scene when the portal fills (the section changes at that shot's `end`); a pull
when the pull begins (the next shot's `start`).

| # | scene | era | section | on-screen action | out | sfx |
|---|---|---|---|---|---|---|
| 1 | engine | 1843 · Analytical Engine | 0.00–6.30 | 1.70–3.90 | push | tick 2.22, tick 2.75, tick 3.28, tick 3.72, chime 3.78 |
| 2 | newsreel | 1946 · Electronic computer | 6.30–12.35 | 7.75–9.95 | push | click 8.70, thump 9.00 |
| 3 | mainframe | 1969 · Mainframes | 12.35–18.40 | 13.80–16.00 | push | click 14.85, tick 15.15, tick 15.35, tick 15.65 |
| 4 | pixel | 1983 · Home computers | 18.40–24.25 | 19.85–21.85 | push | thump 20.43, pop 20.63, beep 21.27 |
| 5 | web | 1996 · The web | 24.25–28.55 | 25.70–28.10 | pull | click 26.12, beep 26.65, beep 26.95, pop 27.62 |
| 6 | phone | 2007 · Smartphones | 28.55–36.60 | 32.00–34.20 | push | click 32.28, chime 32.85, chime 33.15 |
| 7 | whiteboard | 2017 · Attention | 36.60–42.65 | 38.05–40.25 | push | tick 38.40, tick 38.80, tick 39.40, chime 39.80 |
| 8 | datacenter | 2026 · GPU clusters | 42.65–46.95 | 44.10–46.50 | pull | thump 44.82, tick 45.05, tick 45.25, tick 45.45, tick 45.65, beep 45.95 |
| 9 | finale | Now · Muse Spark on Fireworks | 46.95–61.20 | 50.40–57.80 | end | tick 50.65, tick 50.95, tick 51.25, tick 51.55, beep 52.25, beep 52.70, beep 53.25, thump 53.95, chime 57.25 |

plan.json: `total`, `shots[]`: `scene, year, title, start, end, act, actEnd, out, handover, sfx [{u, kind, t}]`.
Use those values, and express the finale beats as offsets from the finale's `act` (50.40).

## General MIDI programs available (program numbers; GeneralUser GS)
0 Acoustic Grand Piano, 1 Bright Piano, 4 Electric Piano 1 (Rhodes), 5 Electric Piano 2, 6 Harpsichord, 8 Celesta, 9 Glockenspiel, 10 Music Box, 11 Vibraphone, 12 Marimba, 13 Xylophone, 14 Tubular Bells, 16 Drawbar Organ, 17 Percussive Organ, 19 Church Organ, 21 Accordion, 22 Harmonica, 24 Nylon Guitar, 25 Steel Guitar, 26 Jazz Guitar, 27 Clean Electric Guitar, 32 Acoustic Bass (upright), 33 Fingered Electric Bass, 35 Fretless Bass, 38 Synth Bass 1, 40 Violin, 41 Viola, 42 Cello, 43 Contrabass, 44 Tremolo Strings, 45 Pizzicato Strings, 46 Orchestral Harp, 47 Timpani, 48 String Ensemble 1, 49 String Ensemble 2 (slow), 50 Synth Strings 1, 52 Choir Aahs, 53 Voice Oohs, 56 Trumpet, 57 Trombone, 58 Tuba, 59 Muted Trumpet, 60 French Horn, 61 Brass Section, 65 Alto Sax, 66 Tenor Sax, 68 Oboe, 70 Bassoon, 71 Clarinet, 72 Piccolo, 73 Flute, 75 Pan Flute, 79 Ocarina, 80 Lead 1 (square), 81 Lead 2 (sawtooth), 88 Pad 1 (new age), 89 Pad 2 (warm), 90 Pad 3 (polysynth), 91 Pad 4 (choir), 92 Pad 5 (bowed), 94 Pad 7 (halo), 95 Pad 8 (sweep), 98 FX 3 (crystal), 108 Kalimba, 112 Tinkle Bell, 113 Agogo, 114 Steel Drums, 115 Woodblock, 116 Taiko Drum, 117 Melodic Tom, 119 Reverse Cymbal.

## Drum channel (channel 9) note map
35 Acoustic Bass Drum, 36 Bass Drum 1, 37 Side Stick, 38 Acoustic Snare, 39 Hand Clap, 40 Electric Snare, 41 Low Floor Tom, 42 Closed Hi-Hat, 43 High Floor Tom, 44 Pedal Hi-Hat, 45 Low Tom, 46 Open Hi-Hat, 49 Crash Cymbal 1, 51 Ride Cymbal 1, 52 Chinese Cymbal, 53 Ride Bell, 54 Tambourine, 55 Splash Cymbal, 56 Cowbell, 57 Crash Cymbal 2, 59 Ride Cymbal 2, 69 Cabasa, 70 Maracas, 75 Claves, 76 Hi Wood Block, 77 Low Wood Block, 80 Mute Triangle, 81 Open Triangle. (The GS kit also has brushes on program 40 of channel 9: "Brush" kit; use the standard kit, program 0, unless you want brushes.)

## Output
Write score.json and print one line: the number of tracks and notes, the tempo, the key, and the theme's first bar
as note names. Reply with at most 6 short bullet points describing the composition (theme, harmony, how it
travels, the finale), then exactly ONE fenced ```python block with the complete file.
