// Ask Muse Spark to review one scene as a viewer: node tools/muse_review.mjs <scene id> <strip.png> [--note "..."]
// Writes shots/review-<id>.json ({ verdict, problems, plan }) and a transcript in muse-spark/transcripts/.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [id, strip] = process.argv.slice(2); const ni = process.argv.indexOf('--note'); const note = ni > 0 ? process.argv[ni + 1] : '';
const key = process.env.PYROWORKS_API_KEY || process.env.FIREWORKS_API_KEY;
const story = fs.readFileSync(path.join(root, 'muse-spark/story.md'), 'utf8');
const spec = fs.readFileSync(path.join(root, `muse-spark/prompts/${id}.md`), 'utf8').split('# YOUR TASK')[1] || '';
const code = fs.readFileSync(path.join(root, `scenes/${id}.js`), 'utf8');
const text = `You are reviewing ONE scene of a 61-second animated film, "A Short History of Computing", as a demanding animation director watching it for the first time. Jolly (a cream plush) travels through the eras of computing by going through objects: each scene is one locked shot where Jolly arrives, does ONE physical action with that era's machine, the machine visibly reacts, and then the camera goes into an object (push) or pulls back out of a screen in the next scene (pull).

The attached image shows five frames of the scene "${id}" in order: arrive, action start, action middle, action end, just before the handover. Judge ONLY what a viewer sees, not the code's intentions:
1. WHERE: within a second, can a viewer tell the era and the place (the medium, the machine)?
2. WHAT: is Jolly's one action readable, and is the prop she uses clearly visible and big enough?
3. CAUSE → EFFECT: does the machine visibly react because of her action (something clearly changes)?
4. THE WAY ON: is the object the camera goes into (or comes out of) clearly visible and readable before the move, and does it make sense that the next era is inside it? Does Jolly go toward the right object?
5. Anything confusing, invisible (e.g. white on white), cluttered, or contradictory (things that look like something else).
${note ? '\nThe film\'s owner said: ' + note + '\n' : ''}
Reply with ONLY a JSON object, no prose: {"verdict": "ok" | "fix", "problems": ["...concrete, visual..."], "plan": ["...concrete changes to the scene: what to draw, where, how big, what moves..."]}. Say "ok" only if a first-time viewer would understand the scene without explanation. Keep the scene's era, action and handover object (from the shot list); fix how they read.

## The film's shot list
${story}

## This scene's brief
${spec.slice(0, 6000)}

## The scene's code (for reference)
\`\`\`js
${code}
\`\`\``;
const body = { model: 'accounts/fireworks/models/muse-spark-1p2-open', messages: [{ role: 'user', content: [{ type: 'text', text }, { type: 'image_url', image_url: { url: `data:image/${strip.endsWith(".jpg") ? "jpeg" : "png"};base64,${fs.readFileSync(path.resolve(strip)).toString('base64')}` } }] }], max_tokens: 24000, temperature: 0.3, stream: true };
const res = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
let out = '', buf = ''; const dec = new TextDecoder();
for await (const ch of res.body) { buf += dec.decode(ch, { stream: true }); let i;
  while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line.startsWith('data:') || line === 'data: [DONE]') continue; const c = JSON.parse(line.slice(5)).choices?.[0]; if (c?.delta?.content) out += c.delta.content; } }
fs.writeFileSync(path.join(root, `muse-spark/transcripts/${new Date().toISOString().replace(/[:.]/g, '-')}-${id}-review.md`), `# review ${id}\n\n## answer\n${out}\n`);
const m = out.match(/\{[\s\S]*\}/); let r; try { r = JSON.parse(m[0]); } catch { r = { verdict: 'unparsed', raw: out.slice(0, 2000) }; }
fs.writeFileSync(path.join(root, `shots/review-${id}.json`), JSON.stringify(r, null, 1));
console.log(id, r.verdict, (r.problems || []).length, 'problems');
