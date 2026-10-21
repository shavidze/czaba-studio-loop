const fs = require('fs');
const path = require('path');
const loop = path.join(__dirname, '..');
const planFile = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
const taskFile = path.join(loop, 'current-task.md');

const patch = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    const parts = s.split(from);
    if (parts.length !== 2) throw new Error(`${path.basename(file)}: ${parts.length - 1} matches for ${from.slice(0, 70)}`);
    s = parts.join(to);
  }
  fs.writeFileSync(file, s);
};

patch(planFile, [
  [
    '- standby swap-ის შემდეგ soft sync იყენებს **settle band-ს ≤ 0.008 წმ** და settle gain-ს, rate-ის უცვლელ დიაპაზონში [0.5, 2.0];',
    '- standby swap-ის შემდეგ soft sync იყენებს **settle band-ს ≤ 0.008 წმ** და settle gain-ს **K ≤ 10** (D-19-ის K ∈ [2, 5] მხოლოდ settle-ის დროს ფართოვდება; მდგრადი K უცვლელია), rate-ის უცვლელ დიაპაზონში [0.5, 2.0]. K = 4-ით დროის მუდმივა 0.25 წმ-ია და −0.05-დან +300-ზე ≈ −0.02 რჩება, რაც C-მ გაზომა; 0.01-მდე მისვლას K ≈ 8 სჭირდება (პიკზე rate ≈ 1.4);',
  ],
  [
    '- ლოგიკა pure helper-ია `video-sync.ts`-ში, დეტერმინისტული სიმულაციის ტესტით: მოდელირებული 30 ms-იანი post-start freeze +300 ms-ზე |d| ≤ 0.01-მდე უნდა მივიდეს;',
    '- ლოგიკა pure helper-ია `video-sync.ts`-ში, დეტერმინისტული სიმულაციის ტესტით: მოდელირებული 30 ms-იანი post-start freeze +300 ms-ზე |d| ≤ 0.01-მდე უნდა მივიდეს, stall escalation-ის გარეშე (settle-ის rate `VIDEO_STALL_LAG_RATE`-ს შეიძლება მიუახლოვდეს, ამიტომ ტესტი და verdict run-ები 0 escalation-ს ამოწმებს);',
  ],
  [
    'Verdict: R10-W1, H3 წესით',
    'Verdict: R12-W1 (= R10-W1-ის წესი H3 ფორმით)',
  ],
  ['| Clip Gain, ტრეკის Volume-ისგან ცალკე | SRW-13 | 9 |', '| Clip Gain, ტრეკის Volume-ისგან ცალკე | SRW-13 | 15 |'],
  ['| Pan | SRW-13 | 9 |', '| Pan | SRW-13 | 15 |'],
  ['| SRW-18 | 13 |', '| SRW-18 | 19 |'],
  ['| SRW-19 | 14 |', '| SRW-19 | 20 |'],
  ['| Bars/Beats + Metronome | SRW-15 | 10 |', '| Bars/Beats + Metronome | SRW-15 | 16 |'],
  ['| Markers/Locators | SRW-16 | 11 |', '| Markers/Locators | SRW-16 | 17 |'],
  ['| Tempo | SRW-15 | 10 |', '| Tempo | SRW-15 | 16 |'],
  ['| SRW-17 | 12 |', '| SRW-17 | 18 |'],
  ['| SRW-14 | 10 |', '| SRW-14 | 16 |'],
  ['| SRW-13 | 9 | კომპრესორი', '| SRW-13 | 15 | კომპრესორი'],
]);

patch(taskFile, [
  [
    '  - C-R7-01 open, resolved by D-19a in round 12.',
    '  - C-R7-01 open, routed to round 12 under D-19a (no PASS, no "resolved").',
  ],
  [
    '  - the cap is the largest height in **[120, 280]** that still leaves the ruler, the loop strip, the scrollbar and every lane at its auto-fit minimum fully visible;',
    '  - the cap is the largest height in **[120, 280]** that still leaves the ruler, the loop strip, the scrollbar and every lane at its auto-fit minimum fully visible;\n  - **compute the cap from an invariant frame:** column height = scroller `clientHeight` + the panel\'s current rendered height. Both are known at any instant. Never derive it from the live scroller alone: opening the panel shrinks the scroller, which would lower the cap again (a feedback loop). A unit test proves the cap is the same whether it is computed with the panel collapsed or open;',
  ],
  [
    '  - No per-frame work, and no layout read in a rAF.',
    '  - No per-frame work, and no layout read in a rAF.\n  - **Transition transient:** the detail panel\'s 300 ms height transition fires the observer on each animation frame. Either recompute once after the transition settles (`transitionend` or the next frame after the last size change), or allow the transient and keep each recompute free of React renders when the heights do not change. State which. C counts lane renders during one detail toggle and reports the number; more than one lane render per changed height value is a FAIL of R11-P2a.',
  ],
  [
    '     - Every §3.3 frozen file matches `a-round-11/gates/frozen-start.txt`.',
    '     - Every §3.3 frozen file matches its start hash. **C uses its own round-10 end hashes** (`c-round-10/frozen-check.txt`, `c-round-10/hashes.txt`, and its `cmp` of the dock, `video-sync.ts` and `video-sync.test.ts` against `a-round-10/bak/*.base.*`) wherever they cover the file. A\'s `a-round-11/gates/frozen-start.txt` is used only for the rest.',
  ],
  [
    '  - After a standby swap, the soft-sync controller uses a tighter settle band (≤ 0.008 s) and a settle gain within the unchanged rate band [0.5, 2.0]. It does so until |d| first falls inside the settle band, or for 1.0 s, or until the next seek, swap or pause; then the 0.02 s deadband resumes.',
    '  - After a standby swap, the soft-sync controller uses a tighter settle band (≤ 0.008 s) and a settle gain **K ≤ 10** (D-19\'s K ∈ [2, 5] widens only during settle) within the unchanged rate band [0.5, 2.0]. It does so until |d| first falls inside the settle band, or for 1.0 s, or until the next seek, swap or pause; then the 0.02 s deadband and the steady-state K resume. With K = 4 the time constant is 0.25 s, which leaves about −0.02 at +300 ms (C\'s measurement), so about K ≈ 8 is needed.',
  ],
  [
    '  - The logic is a pure helper in `video-sync.ts`, with a deterministic simulation test: a modelled 30 ms post-start freeze must reach |d| ≤ 0.01 by +300 ms.',
    '  - The logic is a pure helper in `video-sync.ts`, with a deterministic simulation test: a modelled 30 ms post-start freeze must reach |d| ≤ 0.01 by +300 ms with **0 stall escalations** (a settle rate near 1.5 approaches `VIDEO_STALL_LAG_RATE`).',
  ],
  [
    '  - Verdict: R10-W1 under H3. Regressions: R3-V1 steady state (no rate hunting), RF5-3, R2-V3, and `multiPlayingMaxMs` ≤ 17.',
    '  - Verdict: **R12-W1** (the R10-W1 rule under H3), with 0 escalations in the verdict runs. Regressions: R3-V1 steady state (no rate hunting), RF5-3, R2-V3, and `multiPlayingMaxMs` ≤ 17.',
  ],
]);

const backlogFile = path.join(loop, 'backlog.json');
const b = JSON.parse(fs.readFileSync(backlogFile, 'utf8'));
if (b.version !== 12) throw new Error('expected v12');
const s03 = b.items.find((i) => i.id === 'SRW-03');
const r701 = s03.open_bugs.find((x) => x.id === 'C-R7-01');
r701.routed_to = r701.routed_to
  .replace('and a settle gain inside the unchanged rate band [0.5, 2.0]', 'and a settle gain K <= 10 (D-19 K in [2, 5] widens only during settle; K = 4 leaves about -0.02 at +300, about K 8 needed) inside the unchanged rate band [0.5, 2.0]')
  .replace('reaches |d| <= 0.01 by +300 ms)', 'reaches |d| <= 0.01 by +300 ms with 0 stall escalations)')
  .replace('Verdict R10-W1 under H3', 'Verdict R12-W1 (the R10-W1 rule under H3) with 0 escalations');
if (!r701.routed_to.includes('K <= 10') || !r701.routed_to.includes('R12-W1')) throw new Error('routed_to patch');
const pr12 = b.planned_rounds.find((r) => r.round === 12);
pr12.items = ['C-R7-01 under D-19a: post-swap settle band (<= 0.008 s) + settle gain K <= 10 inside the unchanged rate band, pure helper in video-sync.ts with a deterministic freeze simulation test (0 escalations); verdict R12-W1 = R10-W1 rule under H3'];
const st2 = b.items.find((i) => i.id === 'SRW-11B').stages.find((x) => x.stage === 2);
st2.note += ' The cap is computed from the invariant column height (scroller clientHeight + panel rendered height), so opening the panel does not lower it; the detail transition transient must not cause more than one lane render per changed height value.';
fs.writeFileSync(backlogFile, `${JSON.stringify(b, null, 2)}\n`);

console.log('advice fixes applied');
