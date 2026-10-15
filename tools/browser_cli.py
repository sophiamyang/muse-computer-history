#!/usr/bin/env python3
"""Run portal-film's render.cjs modes that need a browser for a live 3D (WebGL) character.

  tools/browser_cli.py --character poses.png     the pose sheet: the exact `--character` block of render.cjs, run in
                                                  Chromium (same cells, labels and layout; canvas = the browser's)
  tools/browser_cli.py --sheet 16 --out contact.png   contact sheet, the same way
Uses the same headless Chromium settings as scripts/render_browser.py.
"""
import argparse, base64, functools, http.server, re, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

SKILL = Path.home() / 'git/portal-film/portal-film'
FILM = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument('--character'); ap.add_argument('--sheet', type=int); ap.add_argument('--out')
a = ap.parse_args()
src = (SKILL / 'scripts/render.cjs').read_text()

def block(start):   # the body of `if (args.X) { ... return; }` in render.cjs
    i = src.index(start); j = src.index('\n  }\n', i)
    return src[i + len(start):j]

if a.character: body, out = block('if (args.character) {'), a.character
else: body, out = block('if (args.sheet) {'), a.out
# Node canvas -> browser canvas; file writes -> return the PNG
body = body.replace('NC.createCanvas', 'mk').replace('g.STAGE', 'STAGE').replace('g.CHAR', 'CHAR').replace('g.renderFrame', 'renderFrame')
body = re.sub(r"fs\.mkdirSync\([^;]*;\s*", '', body)
body = re.sub(r"fs\.writeFileSync\([^,]+,\s*(\w+)\.toBuffer\('image/png'\)\);", r"return \1.toDataURL('image/png');", body)
body = re.sub(r"console\.error\([^;]*;\s*return;", '', body)
js = f"""async () => {{ const total = await ready, W = 1920, H = 1080, main = document.getElementById('c');
  const mk = (w, h) => {{ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }};
  const args = {{ sheet: {a.sheet or 0}, out: '' }};
  {body}
}}"""
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(FILM)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.on('console', lambda m: m.type == 'error' and print('page:', m.text, file=sys.stderr))
    pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html?render=1')
    url = pg.evaluate(js)
    Path(out).parent.mkdir(parents=True, exist_ok=True); Path(out).write_bytes(base64.b64decode(url.split(',')[1]))
    print('wrote', out, file=sys.stderr); b.close()
srv.shutdown()
