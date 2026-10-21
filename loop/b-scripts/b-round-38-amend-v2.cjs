const fs = require('fs');
const rep = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(file + ' missing: ' + a.slice(0, 80));
    s = s.replace(a, b);
  }
  fs.writeFileSync(file, s);
};
rep('current-task.md', [
  [
    "- **B's scratch probe** (`../tmp/studio-real-loop/b-round-38/probe/`, a copy of `app/` outside `store/`): with all three candidate changes (`probe-context.diff`, `probe-panel.diff`), vitest gives **70 files / 1290 passed** (`probe-all-run.txt`). **No frozen test pins the stale status, the missing marker or the flush order.** These diffs show that the design is feasible. They are not code to copy, and they contain no tests.",
    "- **B's scratch probe** (`../tmp/studio-real-loop/b-round-38/probe/`, a copy of `app/` outside `store/`):\n  - With the final design (`probe-context-v2.diff` + `probe-panel.diff`), vitest gives **1289 passed + 1 timeout** (`probe-v2-run.txt`). The timeout is `track-layout` \"folds a lane…\", 5450 ms under full-suite load; that file re-run alone gives 36/36 twice.\n  - The earlier wrapper variant (`probe-context.diff`) gave 1290/1290, but Biome flagged **≈27 new `useExhaustiveDependencies` warnings**: a wrapped `setStatus` is no longer a stable setter. So it is **rejected**; see §0.2 decision 1.\n  - The v2 behaviour probe (`probe-st.test.snippet`): the old code keeps the refusal; v2 restores `X` (S1, S5) and keeps `Y` (S3).\n  - **No frozen test pins the stale status, the missing marker or the flush order.**\n  - These diffs show that the design is feasible. They are not code to copy, and they contain no tests.",
  ],
  [
    "| A refusal is shown while status **S** (not a refusal) is shown | Unchanged: the refusal shows immediately. **S is remembered.** |\n| A second refusal (of either kind) during the same gesture period | The status shows that refusal. The remembered S stays the status from before the **first** refusal. |\n| The pointer-gesture count returns to **0** (the last gesture ends by commit, cancel, abort, window blur or any `release`) **and the status is still a refusal** | The status becomes **S** again, exactly as it was. The remembered S is cleared. |\n| The count returns to 0, but another non-refusal status **T** was set after the refusal | **T** stays. The remembered S is cleared. |",
    "| Any non-refusal status is shown (committed to state) | It is remembered as the **last non-refusal status** L. |\n| A refusal is shown | Unchanged: it shows immediately. L is not overwritten. |\n| A second refusal (of either kind) | The status shows that refusal; L is unchanged. |\n| The pointer-gesture count returns to **0** (the last gesture ends by commit, cancel, abort, window blur or any `release`) **and the current status is a refusal** | The status becomes **L**, exactly as it was. |\n| The count returns to 0 and the current status is **not** a refusal (another status T was set after the refusal) | **T** stays. |\n| Refusal → T → a second refusal → release | The status becomes **T** (the most recent non-refusal status). |",
  ],
  [
    "1. **Where the restore lives:** in the context, with a status ref, a \"status before refusal\" ref, and a `setStatus` wrapper with the same signature. It runs at the point where `beginPointerGesture`'s release takes the count to 0 (l.1322–1325).\n   - Do not add per-call-site restores.\n   - Do not use timers.\n   - Do not clear the status on `applyEdit`: a later edit with no status of its own would then blank the line.",
    "1. **Where the restore lives:** in the context, and **the raw `useState` setter stays untouched**.\n   - A `useLayoutEffect([status])` copies every non-refusal status into a ref (`lastNonRefusalStatusRef` or a similar discoverable name).\n   - Where `beginPointerGesture`'s release takes the count to 0 (l.1322–1325), call the functional form `setStatus((current) => (isRefusal(current) ? ref.current : current))`.\n   - The functional updater sees a refusal queued in the same `act` or tick (probe \"S1-same-act\").\n   - **Do not wrap `setStatus` in a `useCallback`.** A wrapper is not a stable setter for Biome, and it adds ≈27 `useExhaustiveDependencies` warnings (B probe). Fixing those would mean touching ~15 deps arrays outside scope.\n   - Do not add per-call-site restores.\n   - Do not use timers.\n   - Do not clear the status on `applyEdit`: a later edit with no status of its own would then blank the line.\n   - **Accepted edge:** `claimPointerGesture`'s same-pointer re-claim (l.1333–1341) releases the old gesture before it counts the new one. So the count touches 0 for an instant and the restore runs during that hand-off. This is harmless, because the refusal condition really did end. Record it in doc 038's problems list.",
  ],
  [
    "- `const [status, setStatusState] = useState(INITIAL)`, plus a status ref, a \"status before refusal\" ref (`string | null`), and a stable `setStatus(message: string)` that keeps them in sync with the §0.1 rules.\n- In `beginPointerGesture`'s release, when the count reaches 0, apply the restore rule.",
    "- Keep `const [status, setStatus] = useState(…)` exactly as it is.\n- Add one ref for the last non-refusal status, initialised to the initial status, and one `useLayoutEffect([status])` that updates it for non-refusal values.\n- In `beginPointerGesture`'s release, when the count reaches 0, call `setStatus` with the functional restore of §0.2 decision 1.\n- Biome must report no new diagnostic in this file. B's probe of this design: `Checked 1 file … No fixes applied`.",
  ],
  ['  - the status state/wrapper/refs near l.473;', '  - one ref + one `useLayoutEffect` near l.473; the raw `useState` line is unchanged;'],
  [
    '| `app/contexts/ArrangementContext.tsx` | A | §2.1 only: the status state/wrapper/refs, the release restore, the `previewTrackVolume` flush |',
    '| `app/contexts/ArrangementContext.tsx` | A | §2.1 only: the last-non-refusal ref + layout effect, the release restore, the `previewTrackVolume` flush |',
  ],
  [
    "| S5 | `'X'`; gesture; edit refusal, then undo refusal; release | `'X'` (the status before the first refusal) |",
    "| S5 | `'X'`; gesture; edit refusal, then undo refusal; release | `'X'` |\n| S5b | `'X'`; gesture; refusal; `setStatus('T')`; second refusal; release | `'T'` (the most recent non-refusal) |",
  ],
  [
    '| (b) | Restore even when another status was set after the refusal | S3 |',
    '| (b) | Restore even when the current status is not a refusal | S3 |\n| (b2) | Remember the status from before the first refusal instead of the most recent non-refusal | S5b |',
  ],
  [
    "- Every `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` / `setStatus(GESTURE_UNDO_BLOCKED_MESSAGE)` call site (grep `app/`) goes through the context's `setStatus`. If one bypasses it, **stop and report**.",
    "- Every `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` / `setStatus(GESTURE_UNDO_BLOCKED_MESSAGE)` call site (grep `app/`) sets the context's `status` state; the Lane/Master/DetailPanel get `setStatus` from `useArrangement()`. If one keeps its own status state, **stop and report**.\n- Run `npx biome check app/contexts/ArrangementContext.tsx` before and after: there must be no new diagnostic.",
  ],
  [
    '- The new tests are green, and A\'s red run matches §2.5: S1–S5, S7–S9, PM1–PM4, PM6 and PO1 are red on the old source; S6, PM5, PO2 and PO3 are green.',
    "- The new tests are green, and A's red run matches §2.5: S1, S2, S4, S5, S5b, S7–S9, PM1–PM4, PM6 and PO1 are red on the old source; S3, S6, PM5, PO2 and PO3 are green (S3 is green on old code, because it shows the newer status, as B's probe confirmed).",
  ],
]);
const plan = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
rep(plan, [
  [
    '  - **უარის status:** `GESTURE_EDIT_BLOCKED_MESSAGE` ან `GESTURE_UNDO_BLOCKED_MESSAGE`. პირველი უარის წინ ნაჩვენები status ინახება. როცა ბოლო pointer gesture მთავრდება (count → 0: commit, cancel, abort, window blur) და status ისევ უარის ტექსტია, ბრუნდება შენახული status. თუ უარის შემდეგ სხვა status დაიწერა, ის რჩება. status ცარიელი არ ხდება. `setStatus`-ის სიგნატურა უცვლელია, ამიტომ Lane/Master/DetailPanel-ის უარებიც იფარება.',
    '  - **უარის status:** `GESTURE_EDIT_BLOCKED_MESSAGE` ან `GESTURE_UNDO_BLOCKED_MESSAGE`. ბოლო არა-უარის status ref-ში ინახება (`useLayoutEffect([status])`). როცა ბოლო pointer gesture მთავრდება (count → 0: commit, cancel, abort, window blur) და მიმდინარე status უარის ტექსტია, ის ბოლო არა-უარის status-ს უბრუნდება (functional `setStatus`); თუ უარის შემდეგ სხვა status დაიწერა, ის რჩება; უარი → T → მეორე უარი → release = T. status ცარიელი არ ხდება. raw `useState` setter უცვლელია — wrapper უარყოფილია, რადგან Biome-ს ≈27 ახალ `useExhaustiveDependencies` warning-ს აძლევს (B-ის probe). Lane/Master/DetailPanel-ის უარებიც იფარება. მიღებული edge: `claimPointerGesture`-ის same-pointer re-claim-ისას count წამიერად 0-ს ეხება და აღდგენა სწორედ მაშინ ხდება — უვნებელია.',
  ],
  [
    '- **B-ის probe:** სამივე კანდიდატური ცვლილება `store/`-ის გარეთ scratch ასლში (`b-round-38/probe/`) → vitest 70/1290 მწვანე.',
    '- **B-ის probe:** `store/`-ის გარეთ scratch ასლში (`b-round-38/probe/`) საბოლოო დიზაინი (`probe-context-v2.diff` + `probe-panel.diff`) → 1289 passed + 1 timeout (`track-layout` 5450 ms დატვირთვისას; ცალკე 36/36 ×2), Biome სუფთა; ქცევის probe (`probe-st.test.snippet`): ძველი კოდი უარს ტოვებს, v2 აღადგენს.',
  ],
]);
const b = JSON.parse(fs.readFileSync('backlog.json', 'utf8'));
const d = b.items.find((i) => i.id === 'SRW-13').decisions_round39;
d.status_restore = 'refusal status = GESTURE_EDIT_BLOCKED_MESSAGE or GESTURE_UNDO_BLOCKED_MESSAGE. The raw useState setter stays; a useLayoutEffect([status]) keeps the last non-refusal status in a ref; when the pointer gesture count returns to 0, setStatus(current => refusal ? ref : current). Refusal -> T -> second refusal -> release = T. Never empty. A useCallback setStatus wrapper was rejected: B probe showed ~27 new Biome useExhaustiveDependencies warnings. Accepted edge: same-pointer re-claim in claimPointerGesture touches count 0 briefly and restores then (harmless).';
d.probe = 'B scratch copy b-round-38/probe/ (outside store/, node_modules junction): final design (probe-context-v2.diff + probe-panel.diff) -> 1289 passed + 1 load timeout (track-layout fold test 5450 ms; alone 36/36 twice), Biome clean on the context file; behaviour probe probe-st.test.snippet: old code keeps the refusal, v2 restores X (S1, S5) and keeps Y (S3). Earlier wrapper variant 1290/1290 but ~27 Biome warnings -> rejected. No frozen-test amendment authorised or needed';
b.advisor_used_by_B += ' ; round 38 -> 39 second call (after writing): Biome check of the planned setStatus wrapper -> B probe confirmed ~27 new useExhaustiveDependencies warnings, task amended to the raw-setter + useLayoutEffect + functional restore design (re-probed: Biome clean, behaviour red/green confirmed); toggleTrackMute refusal confirmed (l.2029); same-pointer re-claim edge recorded';
fs.writeFileSync('backlog.json', `${JSON.stringify(b, null, 2)}\n`);
rep('feature-status.md', [
  [
    '- **B-ის probe:** სამივე ცვლილება scratch ასლში — vitest 1290/1290; frozen ტესტის ცვლილება არ არის.',
    '- **B-ის probe:** საბოლოო დიზაინი scratch ასლში — 1289 + 1 დატვირთვის timeout (ცალკე 36/36 ×2), Biome სუფთა; `setStatus`-ის wrapper უარყოფილია (≈27 Biome warning); frozen ტესტის ცვლილება არ არის.',
  ],
]);
console.log('amended');
