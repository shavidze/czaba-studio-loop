const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md';
let s = fs.readFileSync(p, 'utf8');
const rep = (from, to) => { if (!s.includes(from)) { console.error('MISSING:', from.slice(0, 90)); process.exit(1); } s = s.split(from).join(to); };

rep('# CURRENT TASK — Round 40: C bugs from the round-39 record — the detail panel content fits its height (unsaved Clip Gain marker, info column overlap, reason lines)',
  '# CURRENT TASK — Round 40: C bugs from the round-39 record — the detail panel content fits its height (unsaved Clip Gain marker, info column overlap; reason lines measured only)');
rep('- Round size: **three tightly related bugs**, one defect family (the detail panel content does not fit its height), **one source file**. No new feature.',
  '- Round size: **two tightly related C bugs**, one defect family (the detail panel content does not fit its height), **one source file**, plus one measurement-only record (DETAIL-REASON-FIT). No new feature.');
rep('The workflow puts C\'s bugs first. The three bugs are one family, in one file (`ArrangementDetailPanel.tsx`):',
  'The workflow puts C\'s bugs first. The two bugs are one family, in one file (`ArrangementDetailPanel.tsx`); the third item is measured only:');
rep('3. **DETAIL-REASON-FIT (Low, B probe only; C confirms).**',
  '3. **DETAIL-REASON-FIT (Low, B probe only; measurement-only this round, no code change).**');
rep('The range group reason (`w-44`) wraps to 2 lines (`b-round-39/measure-reason-1440.txt`).',
  'The range group reason (`w-44`) wraps to 2 lines (`b-round-39/measure-reason-1440.txt`). **Not changed this round:** `truncate` would leave a prefix such as "ვიდეო კლიპს Clip Ga…" as the only visible text, and the full reason would be reachable only by hover `title` or screen-reader browse mode. The inputs are disabled, so keyboard and touch users could not reach it. That is an information loss, not a pure fix. C measures the real states (R40-RS); if C confirms clipping, it becomes a C-evidenced bug with its own design round (for example shorter reason strings).');

rep('| Visible text | Only **`შეუნახავია`**, one line, `text-warning`, `truncate` (so it can never wrap) |',
  '| Visible text | Only **`შეუნახავია`**, as a plain text node, the first child of the marker element. The **marker element itself** (the `<p>`, a flex item in the button row) gets `text-warning truncate min-w-0`, so it can never wrap; `truncate` on an inline span would not work |');
rep('- Keep the full string in one module-level constant (a discoverable name, not exported), used for the visible part, the `sr-only` part and both `title`s, so they cannot drift. The two parts must concatenate to exactly `შეუნახავია — Enter ინახავს, Esc აბრუნებს`.',
  '- Keep the full string and the label in module-level constants (discoverable names, not exported). Derive the `sr-only` part as `FULL.slice(LABEL.length)`, so JSX whitespace trimming cannot drop the leading space. Use them for the visible part, the `sr-only` part and both `title`s, so they cannot drift. The two parts must concatenate to exactly `შეუნახავია — Enter ინახავს, Esc აბრუნებს`.');
rep('- If the A smoke shows that the visible `შეუნახავია` is truncated at 1440×900 (`scrollWidth > clientWidth`), **stop and report**. Do not change font size, slot width or panel height.',
  '- If the A smoke shows that the marker `<p>` is truncated at 1440×900 (`scrollWidth > clientWidth`, or `getBoundingClientRect().width < 69`), **stop and report**. Measure the `<p>`, not an inline span: inline elements report `scrollWidth` 0. Do not change font size, slot width or panel height.');

rep('**B. Reason lines (DETAIL-REASON-FIT).**\n- The Clip Gain reason `<p>` (`arrangement-detail-clip-gain-reason`) and the range reason `<p>` (`arrangement-detail-reason`) get `truncate` and `title` = their own reason text.\n- Their text, `id`, `className` token (`text-dim`) and every `aria-describedby` are unchanged, so screen readers still read the full reason.\n- The disabled input/button `title`s already carry the reason. Unchanged.',
  '**B. Reason lines (DETAIL-REASON-FIT): no change this round.** The Clip Gain reason `<p>` and the range reason `<p>` stay byte-identical. The reason is the information trade-off described in "Why this round". C measures them (R40-RS).');
rep('- (e) `aria-live`: it would announce on every keystroke (MARKER-LIVE-REGION, rejected).',
  '- (e) `aria-live`: it would announce on every keystroke (MARKER-LIVE-REGION, rejected);\n- (f) `truncate` on the disabled reason lines this round: it hides the reason from keyboard and touch users (see above).');

rep('- `truncate` + `title` on the two reason `<p>`s;\n', '');
rep('- the full marker string constant;', '- the marker string constants;');
rep('  - C-R39-01, C-R30-01 and DETAIL-REASON-FIT;', '  - C-R39-01 and C-R30-01, plus DETAIL-REASON-FIT as a measurement-only record (rejected f);');
rep('  - rejected a–e;', '  - rejected a–f;');

rep('| F1 | SFX clip; type `3` | The marker\'s `textContent` = the full string; its first child element has text exactly `შეუნახავია` and class `truncate`; a child with class `sr-only` has exactly ` — Enter ინახავს, Esc აბრუნებს`; `marker.title` = full | red |',
  '| F1 | SFX clip; type `3` | `marker.classList` contains `truncate` and `min-w-0`; `marker.childNodes[0]` is a text node equal to `შეუნახავია`; `marker.querySelector(\'.sr-only\').textContent` is exactly ` — Enter ინახავს, Esc აბრუნებს` (leading space); `marker.textContent` = the full string; `marker.title` = the full string | red |');
rep('| F5 | Video clip selected | The Clip Gain reason `<p>`: class `truncate`, `title` = `textContent` = the video reason; the input\'s `aria-describedby` = its id | red |\n| F6 | A group selection (two clips) | The Clip Gain reason and the range reason (`arrangement-detail-reason`): both `truncate` and `title` = their text; the `aria-describedby` targets are unchanged | red |\n| F7 | No selection | Both reason lines: `truncate`, `title` = text | red |\n',
  '| F5 | Must-not: a video clip selected; then a group selection | The Clip Gain reason `<p>` and the range reason `<p>`: `textContent` = the full reason, no `truncate` class, no `title`; the `aria-describedby` targets are unchanged | green |\n');
rep('- The new tests are green, and A\'s red run matches §2.3: F1–F8 red on the old source, F9 green.',
  '- The new tests are green, and A\'s red run matches §2.3: F1–F4 and F8 red on the old source; F5 and F9 green.');
rep('| (f) | No `truncate` on the Clip Gain reason | F5 / F6 / F7 |\n| (g) | No `title` on the range reason | F6 / F7 |\n',
  '| (f) | `truncate` added to the Clip Gain reason | F5 |\n| (g) | The marker\'s visible label moved into an inline `<span className="truncate">`, with `truncate` removed from the `<p>` | F1 |\n');

rep('  - the marker rect and the visible span\'s `scrollWidth`/`clientWidth`;\n  - the focused input\'s computed `box-shadow`.',
  '  - the marker `<p>` rect and its `scrollWidth`/`clientWidth` (on the `<p>`, not a span);\n  - the focused input\'s computed `box-shadow`.');
rep('4. the smoke geometry (scroller before/after, the marker rect, the span widths, the ring colour);',
  '4. the smoke geometry (scroller before/after, the marker `<p>` rect and widths, the ring colour);');
rep('- the visible span\'s `scrollWidth`/`clientWidth`;', '- the marker `<p>`\'s `scrollWidth`/`clientWidth` and rect width;');
rep('`data-pending="true"`; the visible span reads `შეუნახავია` and is not truncated (`scrollWidth ≤ clientWidth`); the marker height = **16 px** (1 line);',
  '`data-pending="true"`; the marker `<p>` shows `შეუნახავია` and is not truncated (`scrollWidth ≤ clientWidth` **and** rect width ≥ 69 px, B\'s nowrap width; measured on the `<p>`, because an inline span reports 0); the marker height = **16 px** (1 line);');

rep('### 4.2 R40-RS — reason lines (DETAIL-REASON-FIT)', '### 4.2 R40-RS — reason lines (DETAIL-REASON-FIT): measurement only');
rep('| RS-VID | 1440 and 1280, default height: select the video clip | Each reason line is 16 px (1 line); its `title` = the full text; the scroller does not clip it (its bottom ≤ the scroller bottom); the accessible description of the disabled input = the full text |\n| RS-GRP | Select two clips (REAL Shift/Ctrl-click or marquee; name the method) | Both reason lines (range and Clip Gain) are 1 line, with `title` = the full text and unchanged `aria-describedby`; no clipping |\n| RS-NONE | Clear the selection | Both reason lines are 1 line |',
  '| RS-VID | 1440 and 1280, default height: select the video clip | Record each reason line\'s height and line count, the content scroller `clientHeight`/`scrollHeight`, how many px of the reason are clipped (its bottom − the scroller bottom), and a screenshot. The markup must be unchanged (R40-S) |\n| RS-GRP | Select two clips (REAL Shift/Ctrl-click or marquee; name the method) | The same record for both reason lines (range and Clip Gain) |\n| RS-NONE | Clear the selection | The same record |\n\nVerdict: **record only**. A ran no code for this item, so it gets no PASS/FAIL. If a reason line is clipped in a real state, open a C-evidenced bug (Low) with the numbers. B then designs it separately: shorter strings, or another placement that does not hide the reason from keyboard/touch users.');
rep('- the R40-RS and R40-INFO tables (B\'s probe numbers labelled "before, B");', '- the R40-RS measurement record (B\'s probe numbers labelled as B\'s) and the R40-INFO table;');
rep('| Long hint/reason text is shortened to one line with the full text on hover / for screen readers | none | **Not applicable** (CZABA layout) | CZABA layout decision D-29z5 | R40-RS |',
  '| The marker hint is shortened to one visible word, with the full text on hover / for screen readers | none | **Not applicable** (CZABA layout) | CZABA layout decision D-29z5 | R40-PM |');
rep('4. **Re-check (report each):**\n   - grep every test for',
  '4. **Re-check (report each):**\n   - grep every test file under `app/lib/arrangement/__tests__/` (all of them, not a sample) for');
fs.writeFileSync(p, s);
console.log('task fixed');
const left = ['F6', 'F7', 'truncate` + `title` on the two reason'].filter((x) => s.includes(x));
console.log('leftover refs:', left);
