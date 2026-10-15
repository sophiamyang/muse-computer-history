// Ask Muse Spark (Fireworks) to write or revise one scene file.
//   node tools/muse.mjs <scene id> [--fix] [--shot a.png ...] [--note "..."]
// Prompt = muse-spark/prompts/<id>.md (contract + scene brief). --fix adds the current scenes/<id>.js, notes and frames.
// Writes scenes/<id>.js and a full transcript (prompt, reasoning, answer) to muse-spark/transcripts/.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2), id = args[0], has = f => args.includes(f);
const all = f => { const o = []; args.forEach((a, i) => a === f && args[i + 1] && o.push(args[i + 1])); return o; };
const key = process.env.PYROWORKS_API_KEY || process.env.FIREWORKS_API_KEY;
if (!id || !key) { console.error('usage: muse.mjs <scene id> [--fix] [--shot f] [--note t]; needs PYROWORKS_API_KEY'); process.exit(1); }
const file = path.join(root, `scenes/${id}.js`);
let text = fs.readFileSync(path.join(root, `muse-spark/prompts/${id}.md`), 'utf8');
if (has('--fix')) {
  text += `\n\n# REVISION ROUND\nYour current \`scenes/${id}.js\`:\n\`\`\`js\n${fs.readFileSync(file, 'utf8')}\n\`\`\`\n` +
    (all('--shot').length ? `\nAttached: frames rendered from your current file (${all('--shot').map(s => path.basename(s)).join(', ')}). Study them critically.\n` : '') +
    (all('--note').length ? `\nDirector's notes (address every point, change nothing else):\n${all('--note').map(n => '- ' + n).join('\n')}\n` : '') + '\nReturn the complete corrected file.';
}
const content = [{ type: 'text', text }];
for (const f of all('--shot')) content.push({ type: 'image_url', image_url: { url: `data:image/png;base64,${fs.readFileSync(path.resolve(f)).toString('base64')}` } });
const system = 'You are an award-winning animation director and a meticulous creative coder (HTML canvas 2D). You write complete, correct, deterministic code that follows the host contract exactly. Reply with at most 6 short bullet points, then exactly ONE fenced ```js block containing the complete file. Never abbreviate with "..." or placeholders: the file is saved and run as-is.';
const body = { model: 'accounts/fireworks/models/muse-spark-1p2-open', messages: [{ role: 'system', content: system }, { role: 'user', content }], max_tokens: 56000, temperature: 0.5, stream: true };
const t0 = Date.now(); let out = '', reasoning = '', usage = null, finish = null;
for (let attempt = 1; attempt <= 3; attempt++) {
  out = ''; reasoning = '';
  const res = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) { console.error('HTTP', res.status, (await res.text()).slice(0, 400)); if (attempt === 3) process.exit(1); continue; }
  const dec = new TextDecoder(); let buf = '';
  for await (const chunk of res.body) { buf += dec.decode(chunk, { stream: true }); let i;
    while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:') || line === 'data: [DONE]') continue; const j = JSON.parse(line.slice(5)), c = j.choices?.[0];
      if (c?.delta?.content) out += c.delta.content; if (c?.delta?.reasoning_content) reasoning += c.delta.reasoning_content;
      if (c?.finish_reason) finish = c.finish_reason; if (j.usage) usage = j.usage; } }
  if (/```(?:js|javascript)\s*\n/.test(out)) break;
  console.error(`attempt ${attempt}: no code block (finish=${finish}), retrying`);
}
fs.mkdirSync(path.join(root, 'muse-spark/transcripts'), { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(path.join(root, `muse-spark/transcripts/${stamp}-${id}${has('--fix') ? '-fix' : ''}.md`), `# scenes/${id}.js\nfinish=${finish} secs=${((Date.now() - t0) / 1000) | 0} usage=${JSON.stringify(usage)}\n\n## prompt\n${text}\n\n## reasoning\n${reasoning}\n\n## answer\n${out}\n`);
const code = [...out.matchAll(/```(?:js|javascript)\s*\n([\s\S]*?)```/g)].map(m => m[1]).sort((a, b) => b.length - a.length)[0];
if (!code) { console.error('no code block'); process.exit(2); }
if (fs.existsSync(file)) fs.copyFileSync(file, path.join(root, `muse-spark/transcripts/${stamp}-${id}.prev.js`));
fs.writeFileSync(file, `// [Muse Spark: accounts/fireworks/models/muse-spark-1p2-open] ${new Date().toISOString()}${has('--fix') ? ' (revision)' : ''}\n${code}`);
console.log(JSON.stringify({ scene: id, finish, secs: ((Date.now() - t0) / 1000) | 0, tokens: usage?.completion_tokens, lines: code.split('\n').length }));
