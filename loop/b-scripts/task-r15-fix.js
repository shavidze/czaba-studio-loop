const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md';
let t = fs.readFileSync(p, 'utf8');
function rep(a, b) {
  const i = t.indexOf(a);
  if (i < 0 || t.indexOf(a, i + 1) >= 0) throw new Error('match: ' + a.slice(0, 60));
  t = t.slice(0, i) + b + t.slice(i + a.length);
}
rep('**R15-P3 (inset cleanup).** After each of ✕, Esc and ◀ from an expanded video:',
  '**R15-P3 (inset cleanup).** After each of ✕ and Esc from an expanded video, and after ◀ followed by ▶ (the body is not rendered while the library is a rail):');
rep('   - open Export; focus the Modal\'s X',
  '   - with a non-empty project (so `WAV-ის ექსპორტი` is enabled), open Export; focus the Modal\'s X');
rep('   - a row taller than the free upper part of the body exists, so it could never be fully uncovered.',
  `   - a row taller than the free upper part of the body exists, so it could never be fully uncovered.

   **Mechanism probe (before code, browser only, no source edit).** At 1280/480 with the video expanded, use \`$B js\` to set inline \`paddingBottom\` and \`scrollPaddingBottom\` = 148.5 px on the listbox. Then focus the first option and press real ArrowDown through the list. Record whether every focused row's centre stays above the box. Option focus is a plain \`.focus()\` (\`ArrangementLibrary.tsx\` l.194), so Chrome should honour \`scroll-padding\`. If it does not, stop and report to B: R15-P2.4 would need a narrow allowance.`);
fs.writeFileSync(p, t);
console.log('task fixed');
