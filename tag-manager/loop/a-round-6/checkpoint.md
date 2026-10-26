# A round 6 checkpoint
- [x] Baseline HEAD a8c1b53, tree clean
- [x] tests/main/riff-info-nul.test.ts written (a)-(h)
- [x] red run in /tmp/a-r6-red (export-only patch) -> red-before-fix.log
- [ ] fix metadata.ts
- [x] fix applied (loop strip; regex /\u0000+$/ rejected by biome noControlCharactersInRegex, biome-ignore forbidden); green 8/8
- [ ] npm run check, build, e2e, mutations, review, report
- [x] gate exit 0 (107/50/E2E 7), mutations M1-M4 killed, report a-round-6.md written
