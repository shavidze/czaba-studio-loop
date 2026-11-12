import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const requireFile = p => { if (!fs.existsSync(path.join(root, p))) throw new Error('Missing agent reference: ' + p); };
const map = JSON.parse(read('.claude/primitives-map.json'));
for (const rule of map.rules) {
  new RegExp(rule.pattern);
  for (const ref of rule.primitives) requireFile(path.join(map.primitivesDir, ref));
}
for (const doc of ['AGENTS.md', 'CLAUDE.md']) {
  const text = read(doc);
  if (text.includes('.Codex/')) throw new Error(doc + ': stale .Codex path');
  for (const match of text.matchAll(/`(\.(?:claude|agents)\/[^\s`]+\.(?:md|json))`/g)) requireFile(match[1]);
}
const names = ['flow-sage', 'relational-architect', 'polyphony-conductor', 'first-visit-host', 'consequence-tester'];
for (const name of names) {
  const text = read('.claude/agents/' + name + '.md');
  if (!text.includes('name: ' + name) || !text.includes('tools: Read, Glob, Grep') || !text.includes('philosophy-review-contract.md')) throw new Error('Invalid review role: ' + name);
}
requireFile('.claude/references/philosophy-review-contract.md');
for (const file of fs.readdirSync(path.join(root, '.claude/agents'))) {
  const text = read('.claude/agents/' + file);
  if (/C:\/Apps\/|\/c\/Users\//.test(text)) throw new Error('Machine-specific agent path: ' + file);
  for (const match of text.matchAll(/`(\.claude\/(?:primitives|references)\/[^\s`]+)`/g)) requireFile(match[1]);
  const mirror = '.codex/agents/' + file.replace(/\.md$/, '.toml');
  requireFile(mirror);
  const instructions = read(mirror).match(/developer_instructions = """\r?\n?([\s\S]*?)"""/);
  const unescape = s => s.replace(/\\(["\\rnt])/g, (_, c) => ({r:'\r', n:'\n', t:'\t', '"':'"', '\\':'\\'})[c]);
  const normalize = s => s.replace(/\r/g, '').replace(/\bClaude\b/g, 'Codex').trim();
  if (!instructions || normalize(unescape(instructions[1])) !== normalize(text.replace(/^---[\s\S]*?\n---\r?\n/, ''))) throw new Error('Codex agent mirror drift: ' + mirror);
}
function walk(dir) {
  return fs.readdirSync(path.join(root, dir), {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(dir + '/' + e.name) : [dir + '/' + e.name]);
}
for (const file of walk('.agents/skills')) {
  const mirror = file.replace('.agents/skills/', '.claude/skills/');
  requireFile(mirror);
  const normalize = s => s.replace(/\r\n/g, '\n').trimEnd();
  if (normalize(read(file)) !== normalize(read(mirror))) throw new Error('Skill adapter drift: ' + file);
}
console.log('Agent references, review roles and skill mirrors passed.');
