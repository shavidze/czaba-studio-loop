const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/b-round-20.md';
let t = fs.readFileSync(p, 'utf8');
const i = t.indexOf('## 9. Second advisor call');
if (i < 0) throw new Error('no sec 9');
t = t.slice(0, i) + `## 9. Second advisor call

Called after every artifact was written. Advice and action:
- **Fill this section** (it was a placeholder). **Done.**
- **Re-verify the tree from \`store/\`.** A checkpoint command run from \`tmp/\` failed only because of the cwd (the manifest paths are store-relative). **Done:** \`sha256sum -c b-round-20-tree-sha256.txt\` → 50 OK, rc=0; \`git status --short\` → 42 lines.
- **False-FAIL trap in R11-P3.** "272×153 at 288" was the round-13 value, which D-29e/D-29f superseded. **Applied:** the oracle is now the D-29f formula over C's own measured rects (Δ ≤ 0.02, 16:9, inside the body, no overlap) at 1440/288, 1440/480, 1280/288 and 1280/480. The \`c-round-15.md\` §3 values are a reference only. Note that the round-15 1280/288 value is 207.11×116.48, so a fixed 272×153 would have been a false FAIL.
- **The \`d_dock\` clip must be the target clip the dock maps \`live\` to.** **Applied:** \`resolveVideoTarget\` → \`findVideoClipAt\` (\`app/lib/arrangement/video.ts\`). Rows in the 6–8 s gap are out of scope.
- **Optional, applied:**
  - L-mute (R3-V2) is 1 valid run. It is functional (mute flag, RMS, counters), not a drift measurement, so run 2 stays bounded.
  - The export sanity check with the video clip uses internal consistency (duration = projectEnd, NaN 0, FS count) rather than equality with 18.000 s.
- **Confirmed:** backlog v22 without promotion, D-29l, R6-S5 amended to D-25, attestation-only A, the RoundLimit stated. **Decision CONTINUE confirmed.** Not COMPLETE, not BLOCKED.

Incident (B, harmless): one inline \`node -e\` call inside a double-quoted shell string let bash execute the backtick spans as commands. Every one of them failed with "No such file", and one ran \`git status\` outside a repository. Nothing was created or changed. This section was then rewritten through \`b-scripts/b-round-20-sec9.js\`.
`;
fs.writeFileSync(p, t);
console.log('ok');
