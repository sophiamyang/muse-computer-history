#!/bin/sh
# The score: Muse Spark's composition (tools/compose.py) -> sampled instruments (GeneralUser GS via spessasynth_core) -> master.
set -e
cd "$(dirname "$0")/.."
.tools/venv/bin/python tools/compose.py build/plan.json build/score.json
node tools/render_score.mjs build/score.json shots/score.f32
.tools/venv/bin/python tools/master.py build/plan.json shots/score.f32 media/score.wav
