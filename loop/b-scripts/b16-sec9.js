const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/b-round-16.md';
let t = fs.readFileSync(p, 'utf8');
const i = t.indexOf('## 9. Second advisor call');
if (i < 0) throw new Error('no sec9');
t = t.slice(0, i) + `## 9. Second advisor call

I made it after all the artifacts were written. The advisor confirmed CONTINUE and found the chain consistent:
- the archive is equal to the round-16 task;
- the backlog closes only the IDs that C evidenced;
- the 46-file reference equals C's G16-2 diff set;
- the plan, board, task and b-next agree on round 17;
- the guard 3/4 reasoning holds against the probe. It counts by function name, the SimpleMemo fiber's type is the inner function, and a memo bail-out is not counted.

I applied these before reporting (script \`b-scripts/task-r17-fix.js\`; backup \`b-scripts/current-task.before-r17-fix.md\`):
1. **R17-P1.1 line count.** A fixed two-line height makes \`offsetHeight\` constant, so it cannot count lines. C now counts content lines as \`round(scrollHeight / line-height)\` and compares that with A's pre-code count. The ellipsis is required only when \`scrollHeight > offsetHeight\`. The stop condition names the pre-code measurement.
2. **The title whitespace.** \`title\` is exactly \`აქტიური ხაზი: \${name}\${note}\`, with no trailing space. C compares it after \`.trim()\` with the \`textContent\` before \`·\`, because the JSX \`{' '}\` leaves a trailing space. This prevents a literal-criterion FAIL of the D-19b/D-29g class. R17-U asserts the same.
3. **Board ID.** In \`feature-status.md\`, the SRW-12 row cited \`R17-R\`; it now cites R17-P3.
`;
fs.writeFileSync(p, t);
console.log('sec9 ok');
