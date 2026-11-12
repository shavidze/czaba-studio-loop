import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function inspectEdit(input) {
  if (!['Edit', 'Write'].includes(input.tool_name)) return {};
  let root = path.resolve(input.cwd || process.cwd());
  while (!fs.existsSync(path.join(root, '.claude/primitives-map.json'))) {
    const parent = path.dirname(root);
    if (parent === root) throw new Error('No project primitives map found; start in the repository.');
    root = parent;
  }
  const supplied = input.tool_input?.file_path;
  if (typeof supplied !== 'string') throw new Error('Edit/Write is missing file_path.');
  const target = path.relative(root, path.resolve(input.cwd || root, supplied)).split(path.sep).join('/');
  if (target === '..' || target.startsWith('../') || path.isAbsolute(target)) return {};
  const map = JSON.parse(fs.readFileSync(path.join(root, '.claude/primitives-map.json'), 'utf8'));
  const refs = [...new Set(map.rules.filter(rule => new RegExp(rule.pattern, 'i').test(target)).flatMap(rule => rule.primitives))];
  if (!refs.length) return {};
  const paths = refs.map(ref => {
    const resolved = path.resolve(root, map.primitivesDir, ref);
    const relative = path.relative(root, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.statSync(resolved).isFile()) throw new Error('Invalid or missing primitive: ' + ref);
    return relative.split(path.sep).join('/');
  });
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: 'Before editing ' + target + ', read these project references: ' + paths.join(', ') + '. This reminder does not establish compliance; inspect the diff and run the required checks.' } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf8'));
    process.stdout.write(JSON.stringify(inspectEdit(input)));
  } catch (error) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'Primitive check failed: ' + error.message } }));
  }
}
