#!/usr/bin/env python3
"""Render given film times in Chromium (?render=1) and report any errors per time.  tools/probe.py 1.5,8.2 [--out dir]"""
import base64, functools, http.server, sys, threading, json
from pathlib import Path
from playwright.sync_api import sync_playwright
FILM = Path(__file__).resolve().parent.parent
times = [float(x) for x in sys.argv[1].split(',')]; out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else None
scale = float(sys.argv[sys.argv.index('--scale') + 1]) if '--scale' in sys.argv else 0.5
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(FILM)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080}); errs = []
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text)); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html?render=1'); pg.evaluate('ready')
    if out: Path(out).mkdir(parents=True, exist_ok=True)
    for t in times:
        r = pg.evaluate(f"""() => {{ const t0 = performance.now(); try {{ renderFrame({t}); }} catch (e) {{ return {{ err: String(e.stack || e).split('\\n').slice(0, 3).join(' | ') }}; }}
          const c = document.getElementById('c'), o = document.createElement('canvas'); o.width = 1920 * {scale}; o.height = 1080 * {scale};
          o.getContext('2d').drawImage(c, 0, 0, o.width, o.height); return {{ ms: Math.round(performance.now() - t0), png: o.toDataURL('image/png') }}; }}""")
        if 'err' in r: print(f't={t}: ERROR {r["err"]}')
        else:
            print(f't={t}: {r["ms"]} ms')
            if out: (Path(out) / f't{t:06.2f}.png').write_bytes(base64.b64decode(r['png'].split(',')[1]))
    for e in errs[:5]: print('console:', e[:300])
    b.close()
srv.shutdown()
