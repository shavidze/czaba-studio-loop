# A round 3 checkpoint
- [x] Baseline: HEAD c76856791126602a3016e133bd91a5f0ff2ced5b, tree clean.
- [x] Read task, summary, metadata.ts, SchemaEditor.tsx, fixtures, test harness, primitives.
- [ ] riff-chunks.ts helper
- [ ] contract tests + renderer test (red before field)
- [ ] add field (green)
- [ ] ffprobe CLI + check.yml step
- [ ] e2e spec
- [ ] docs
- [ ] full verify + code review + report

## Finding before code
- Task text says ICMT size 26. Observed (B's own script, rerun in /tmp/a3exp): ICMT payload hex = 28 bytes; Buffer.byteLength("მძიმე კარი") = 28; LIST/INFO size 74 = 4+(8+8)+(8+10)+(8+28). B miscounted; semantics (UTF-8, no NUL, pad outside size) match. Proceeding with size === byteLength (28); flag for B.
- [x] riff-chunks.ts, contract test, renderer test written; red log recorded (red-before-field.log, RERUN 2 is the authoritative one)
- [x] field added (1-line diff, biome clean); new tests green
- [x] Finding: tests/renderer/setup.ts (frozen) replaces window with a plain object -> React change events dead in jsdom; workaround via vi.hoisted in schema-editor.test.ts
- [x] check-ffprobe-tags.ts + check.yml step; CLI exit 0/1 paths exercised
- [x] e2e spec written
- [x] docs written (contract doc, primitive, plan 002)
- [x] code-reviewer run; fixes applied (T1-1b odd-size, T1-9d, RIFF size header, toStrictEqual, plan :27); red RERUN 3 recorded
- [x] final verify exit 0 (verify.log); report a-round-3.md written. DONE
