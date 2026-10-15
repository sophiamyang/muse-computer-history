#!/usr/bin/env python3
"""Click through site.html once as a visitor, in Chrome, at a given viewport. Real mouse clicks on the screen
positions of each prop, spot and object. Screenshots at every stop + a JSON report of layout checks.
  tools/walk_site.py desktop|phone [--port 8768]"""
import json, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright
name = sys.argv[1]; port = 8768
VP = {'desktop': dict(viewport={'width': 1440, 'height': 900}),
      'phone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)}[name]
out = Path(__file__).resolve().parent.parent / 'shots' / f'walk-{name}'; out.mkdir(parents=True, exist_ok=True)
INFO = """() => { const P = PLAYER, k = P.shotAt(), sh = STAGE.shots[k], r = document.getElementById('stage').getBoundingClientRect(), s = r.width / 1920;
  const local = P.t - sh.start, kind = !P.waiting ? 'none' : (local < sh.aLocal + 0.01 ? 'act' : 'out');
  const toScr = b => b && { x: r.left + b.x * s, y: r.top + b.y * s, w: b.w * s, h: b.h * s };
  const b = kind === 'act' ? sh.act.hotspot : kind === 'out' ? (sh.out.type === 'push' ? sh.out.portal : null) : null;
  const rect = el => { const q = el.getBoundingClientRect(); return { x: q.left, y: q.top, w: q.width, h: q.height }; };
  const cap = document.getElementById('caption'), top = document.querySelector('.top');
  return { k, scene: sh.scene, t: P.t, waiting: P.waiting, kind, prompt: P.prompt, hinting: P.hinting, pull: kind === 'out' && sh.out.type === 'pull',
    box: toScr(b), spots: (sh.sc.spots || []).map(sp => ({ label: sp.label, ...toScr(sp) })),
    caption: cap.classList.contains('hide') ? null : rect(cap), captionText: document.getElementById('cap-head').textContent,
    topbar: getComputedStyle(top).opacity > 0.5 ? rect(top) : null, vw: innerWidth, vh: innerHeight,
    end: !document.getElementById('end').hidden }; }"""
def overlap(a, b): return a and b and not (a['x'] + a['w'] <= b['x'] or b['x'] + b['w'] <= a['x'] or a['y'] + a['h'] <= b['y'] or b['y'] + b['h'] <= a['y'])
def onscreen(a, i): return a['x'] >= 0 and a['y'] >= 0 and a['x'] + a['w'] <= i['vw'] and a['y'] + a['h'] <= i['vh']
report, issues = [], []
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=['--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(**VP); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(f'http://localhost:{port}/site.html?walk={time.time()}'); pg.wait_for_function('window.PLAYER && document.getElementById("enter")', timeout=90000)
    time.sleep(1.5); pg.screenshot(path=str(out / '00-intro.png'))
    i0 = pg.evaluate(INFO); enter = pg.locator('#enter').bounding_box()
    pg.mouse.click(enter['x'] + enter['width'] / 2, enter['y'] + enter['height'] / 2)
    n, t_end = 1, time.time() + 900
    seen_cap = set()
    while time.time() < t_end:
        i = pg.evaluate(INFO)
        if i['caption'] and i['scene'] not in seen_cap:   # caption: check nothing clickable is under it right now
            seen_cap.add(i['scene']); time.sleep(0.8); pg.screenshot(path=str(out / f'{n:02d}-{i["scene"]}-caption.png')); n += 1
        if i['end']:
            time.sleep(0.8); pg.screenshot(path=str(out / f'{n:02d}-end.png')); report.append({'end': True}); break
        if not i['waiting']: time.sleep(0.15); continue
        time.sleep(2.9)                                    # let the hint appear (hintDelay 2.5)
        i = pg.evaluate(INFO)
        shot = out / f'{n:02d}-{i["scene"]}-{i["kind"]}.png'; pg.screenshot(path=str(shot)); n += 1
        row = {k: i[k] for k in ('scene', 'kind', 'prompt', 'hinting', 'pull', 'box', 'caption', 'captionText')}; row['shot'] = shot.name
        if i['box']:
            if not onscreen(i['box'], i): issues.append(f"{name} {i['scene']} {i['kind']}: box off screen {i['box']}")
            if overlap(i['box'], i['caption']): issues.append(f"{name} {i['scene']} {i['kind']}: box under the caption")
            if overlap(i['box'], i['topbar']): issues.append(f"{name} {i['scene']} {i['kind']}: box under the top bar")
            if min(i['box']['w'], i['box']['h']) < 40: issues.append(f"{name} {i['scene']} {i['kind']}: box only {i['box']['w']:.0f}x{i['box']['h']:.0f} px on screen")
        if i['kind'] == 'act':                             # explore the spots first, like a visitor would
            for sp in i['spots']:
                if not onscreen(sp, i): issues.append(f"{name} {i['scene']} spot '{sp['label']}' off screen")
                if overlap(sp, i['caption']): issues.append(f"{name} {i['scene']} spot '{sp['label']}' under the caption")
                pg.mouse.click(sp['x'] + sp['w'] / 2, sp['y'] + sp['h'] / 2); time.sleep(0.6)
                note = pg.evaluate("() => { const n = document.getElementById('note'); const q = n.getBoundingClientRect(); return { show: n.classList.contains('show'), head: document.getElementById('note-head').textContent, x: q.left, y: q.top, w: q.width, h: q.height, vw: innerWidth, vh: innerHeight }; }")
                if not note['show'] or note['head'] != sp['label']: issues.append(f"{name} {i['scene']} spot '{sp['label']}' did not open its note")
                elif not onscreen(note, note): issues.append(f"{name} {i['scene']} note '{sp['label']}' off screen")
                pg.screenshot(path=str(out / f'{n:02d}-{i["scene"]}-spot-{sp["label"].replace(" ", "_")}.png')); n += 1
            row['spots'] = [s['label'] for s in i['spots']]
        report.append(row)
        if i['box']: pg.mouse.click(i['box']['x'] + i['box']['w'] / 2, i['box']['y'] + i['box']['h'] / 2)
        else: pg.mouse.click(i['vw'] / 2, i['vh'] / 2)     # pull: click anywhere
        time.sleep(0.4)
        if pg.evaluate('PLAYER.waiting') and pg.evaluate(INFO)['kind'] == i['kind'] and pg.evaluate(INFO)['scene'] == i['scene']:
            issues.append(f"{name} {i['scene']} {i['kind']}: the click at the box centre did not pass the gate")
    else: issues.append(f'{name}: timed out before the end card')
    if errs: issues += [f'{name} console: {e[:200]}' for e in errs[:5]]
    b.close()
json.dump({'report': report, 'issues': issues}, open(out / 'report.json', 'w'), indent=1)
print(json.dumps(issues, indent=1)); print(len(report), 'stops')
