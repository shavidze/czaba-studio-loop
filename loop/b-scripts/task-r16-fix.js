const fs = require('fs');
function edit(p, pairs) {
  let t = fs.readFileSync(p, 'utf8');
  for (const [from, to] of pairs) {
    const n = t.split(from).length - 1;
    if (n !== 1) throw new Error(p + ': expected one match for ' + from.slice(0, 70) + ' got ' + n);
    t = t.replace(from, to);
  }
  fs.writeFileSync(p, t);
}
edit('C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md', [
  [
    '   - `a-round-11.md`, deviation 9.',
    '   - `a-round-11.md`, the deviations list, item 9 (l.356; also reviewer L12 at l.315).',
  ],
  [
    '  - deviation 9: `a-round-11.md` (deviation 9) and `backlog.json` → `open_findings` → `a-r11-dev-9-fold-during-gesture`.',
    '  - deviation 9: `a-round-11.md` l.356 (item 9) and `backlog.json` → `open_findings` → `a-r11-dev-9-fold-during-gesture`.',
  ],
  [
    '  - the timeline scroller height at no selection now equals the round-15 "selected" layout. At 1280×720 expect the lanes and cap that C measured with a selection (lanes 60, cap 142), now constant;',
    '  - the timeline scroller height at no selection now equals the round-15 "selected" layout where a selection added a footer row. At 1280×720 expect the lanes and cap that C measured with a selection (lanes 60, cap 142), now constant. C-R11-02\'s evidence is 1280-only: at 1440×900 the selected-clip text may share a row today, and then `basis-full` adds a permanent ~20 px row there that a selection did not add before (see §1.4a);',
  ],
  [
    '   - **Stop and report to B** if either of these happens:',
    '   - **Footer cost (report, not a stop).** Report the no-selection footer `offsetHeight` in round 15 (measured before your edit) and in round 16 at both viewports. If a viewport (expected: possibly 1440) gains a row that a selection did not add before, record the cost in px, and its effect on lanes, cap and library body, in the report and in doc 025. It is the accepted price of Δ 0 (D-29g).\n   - **Stop and report to B** if either of these happens:',
  ],
  [
    '3. The C-R11-02 repro: at 1280×720 the lanes and the cap no longer jump. Report the constant values (expect lanes 60 and cap 142 if the line used its own row).',
    '3. The C-R11-02 repro: at 1280×720 the lanes and the cap no longer jump. Report the constant values (expect lanes 60 and cap 142 if the line used its own row).\n   - **Footer cost:** compare the no-selection footer `offsetHeight` against round 15 at both viewports (C\'s round-15 runs or A\'s pre-edit measurement). Report any added row and its px, and check it against A\'s §1.4a record. This is the D-29g price and not a failure, unless it is undisclosed or differs from A\'s number.',
  ],
]);
edit('C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md', [
  [
    '  - A კოდამდე footer-ის `offsetHeight`-ს ზომავს:',
    '  - **ფასი:** C-R11-02-ის მტკიცებულება მხოლოდ 1280-ზეა. 1440×900-ზე selected-clip ტექსტი დღეს შეიძლება სხვა ხაზთან ერთ row-ში ეტევა. მაშინ `basis-full` იქ მუდმივ ~20 px-იან row-ს დაამატებს, რომელსაც არჩევა ადრე არ ამატებდა: ხაზები და body ამდენით მცირდება. ეს Δ 0-ის მიღებული ფასია. A მას ზომავს და doc 025-ში წერს; ეს გაჩერების მიზეზი არ არის.\n  - A კოდამდე footer-ის `offsetHeight`-ს ზომავს:',
  ],
]);
console.log('task + plan refined');
