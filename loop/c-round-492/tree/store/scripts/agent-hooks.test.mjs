import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspectEdit } from '../.claude/hooks/inject-primitives.mjs';

test('hook resolves active project from a nested cwd, preserves normal permissions, and deduplicates references', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'czaba-hook-'));
  try {
    fs.mkdirSync(path.join(root, '.claude/primitives'), {recursive:true});
    fs.mkdirSync(path.join(root, 'app/components'), {recursive:true});
    fs.writeFileSync(path.join(root, '.claude/primitives/A.md'), 'A');
    fs.writeFileSync(path.join(root, '.claude/primitives-map.json'), JSON.stringify({primitivesDir:'.claude/primitives',rules:[{pattern:'^app/',primitives:['A.md','A.md']}]}));
    const result = inspectEdit({tool_name:'Edit',cwd:path.join(root,'app'),tool_input:{file_path:'components/A.tsx'}}).hookSpecificOutput;
    assert.equal(result.hookEventName, 'PreToolUse');
    assert.equal(result.permissionDecision, undefined);
    assert.equal(result.additionalContext.split('.claude/primitives/A.md').length, 2);
    assert.deepEqual(inspectEdit({tool_name:'Write',cwd:root,tool_input:{file_path:'../outside.ts'}}), {});
    fs.unlinkSync(path.join(root, '.claude/primitives/A.md'));
    assert.throws(() => inspectEdit({tool_name:'Write',cwd:root,tool_input:{file_path:'app/new.ts'}}));
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
test('unrelated tools produce no permission decision', () => assert.deepEqual(inspectEdit({tool_name:'Read'}), {}));
