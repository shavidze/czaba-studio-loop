# Round 322: PERF-8b. The clip selection (`selectedClipIds`) moves out of the ArrangementContext value into a per-provider zustand store, plus RT-FIX of the three retro-321 lines

**Planned by:** B, at the round 321 → 322 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v281 → `decisions_log_b`):
- **D-29z890: round 321 ruled.** C FAIL, but only on three Low findings with origin B, all in the retro documents (C-R321-01/02/03, rows RT-NUM and RT-IDS). Every browser row PASSES; `browserVerified` and `realVerified` are true; there is no app bug. Gate 321 is `skipped` (C FAIL) [K1]. B corrected `retros/retro-321.md` (§2 below). The three ids stay open until C's RT-FIX row passes. RETRO-321 closes with it.
- **D-29z891: round 322 = RT-FIX + PERF-8b.** Planning is on 2026-11-03, before 2026-11-05, so REGRESSION is not due [K9].
  - PERF-8b keeps the D-29z860 split: **only** `selectedClipIds` moves. `activeTrackId` and the harness clip-click row (`interact.click.components`) stay with PERF-10 (`performance-optimizer`: one traceable change per gain).
  - `tech-lead`'s alternative was one store holding both. It is recorded as signal SIG-R322-ACTIVE-TRACK-STORE for PERF-10, not scheduled.
- **D-29z892: PERF-8b is the final stage of PERF-8.** L28 grants l.4 of doc 230 and of the new doc 231. GATE320-L1 rides here as one doc 230 line. GATE320-S2 gets its browser experiment row (§3.2 S2-VIDEO).
- **D-29z893: L58.** B built only a type-only sketch, not the store migration (§0.3).
  - Under L58, every new **budget** row in `perf/budgets.interactions.json` ships as `record — not run on sketch: B built a type-only sketch`.
  - C's acceptance is relative to the HEAD control in the same run: A's value is **strictly below** the control, and the ratio is only reported. The pass criterion rests on the name rows from B's saved HEAD probe (§0.1): SELECT-NAMES, the provider fiber not rendering, and 0 commits on a re-click. No numeric bound is asserted (L58); round 323 or PERF-10 may assert one from C's measured output.
  - `mutantRedOnSketch` is `null` with that reason.
- **D-29z894: store pattern.** ARCH-CHECKPOINT-PERF8-STORE-PATTERN has no answer from root, so this round follows D-29z193: zustand/vanilla, one store per provider, the same shape as `range-store.ts`.
  - **Shape-change grant:** `selectedClipId` and `selectedClipIds` leave `ArrangementContextValue` and `useArrangement()`. This is the explicit grant, named so the gate reviewer can find it. Precedent: GATE320-C1 / `tasks/round-318.md` l.102.

**Read first:** `lessons.md`. These apply directly:
- L11: STOP;
- L12: no class selectors;
- L23: the scratch pre-check, the type sketch and runtime names;
- L28: doc status lines;
- L29: claims;
- L34: the doc section of a changed budget;
- L37: commit counts are wallclock;
- L38: perf runs alone;
- L49: `setSelection`'s side effects;
- L52: mutants that can fail;
- L56: artifacts;
- L57: C's fields;
- L58: record vs assert.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§9).

**Loop path:** `tmp/studio-real-loop` is a symlink. Search it with `find -L` (L38).

## Baseline
- **HEAD `53c5c79`** (gate 320 published it; gate 321 skipped) with a clean tree [K1, K2].
- **No dependency change:** zustand 5.0.16 is already installed (PERF-8a). There is no `root-deps-request.json`, and the notices are not granted (L35 does not apply).
- **Protected files:** `b-round-318/protected-sha256.txt`, 11/11 OK [K8].

## 0. Why this round

### 0.1 The measurement (L37: premise re-measured at HEAD, dev server)
Probe `b-round-321/click-hooks-probe.mjs`. It diffs the `ArrangementProvider` fiber's hooks per commit and lists the rendered component names. Outputs: `click-hooks-head.json`, `select-same-lane-head.json` [K14].

| Click | Provider hooks changed | Components rendered (dev) |
|---|---|---|
| Harness path: empty point on the Stems lane, then the Music clip's name bar | hook 1 `selectedClipIds` **and** hook 3 `activeTrackId` | prod `interact.click.components` 103 (per commit 101,2,0) [K25] |
| **Selection only:** two clips on one lane (Ctrl+D), click the other clip's name bar | hook 1 only | **105** |
| Re-click of the already-selected clip | hook 1 only, a fresh array with **equal content** | **92**, with nothing visible changing |

- So a selection store cannot lower the harness click row while `activeTrackId` stays in the value (D-29z891).
- The **selection-only click** and the **re-click** are PERF-8b's own scenarios.
- These ten components render in HEAD's selection-only commit [K15]: `ArrangementRuler`, `ArrangementTempoRow`, `ArrangementVideoDock`, `ArrangementLibrary`, `ArrangementLibraryPreview`, `ArrangementMaster`, `ArrangementShortcutSheet`, `ArrangementExportDialog`, `ArrangementTransport` and `StudioWorkspace`.
  - The first eight files contain no selection read [K16].
  - Transport only needs to know whether a clip is selected [K11].
  - `StudioWorkspace` reads the selection at render time [K21, K22].

### 0.2 Mechanism (consults; FACT unless marked)
**State and the value:**
- `selectedClipIds` is provider `useState` [K5].
- It is mirrored in `latestRef` and appears in the value `useMemo` and its deps [K3 = 4 lines; K22: 3 `selectedClipIds,` lines].
- **Every `setSelection` stores the new array**, with no equality check [K10]. `toggleInSelection` always builds a fresh one, so even a re-click rebuilds the value and re-renders every `useArrangement()` consumer.

**Event-time reads:**
- `latestRef.current.selectedClipIds` / `latest.selectedClipIds`: 14 [K4].
- `getSelectedClipIds` and `primarySelectedClipId` read the same mirror.

**Readers through the context:**
- `StudioWorkspace`: the group overviews `useMemo`, the selected-clip detail, the multi-select summary, the "n clips selected" readout and two `current.selectedClip…` reads in handlers [K21, K22; tsc list in §0.3].
- `ArrangementLane` (`isSelected={selectedClipIds.includes(clip.id)}`).
- `ArrangementTransport` (`selectedClipId` truthiness only) [K11].

**GATE320-S2 at HEAD** (`b-round-321/s2-probe.mjs`, `s2-head.json`, `s2-video-head.json`) [K17]:
- **Library add with Enter:** the first commit already shows the new clip, the cleared range and the new selection. No split.
- **Add video** (`+ Your own video`, file `public/videos/hero/1.mp4`, with a range and a selected clip set first): the add clears the range and then the selection [K18 counts the `setRange(null);` sites].
  - **Two commits show the range cleared while the old selection is still drawn**, about 8 ms before the selection clears.
  - 0 rAF frames observed that state in this one run.
  - With both writes as store writes in one tick, React should commit them together. **INFERENCE (tech-lead):** S2-VIDEO proves it or not.

### 0.3 B's pre-check (L23, L58): a type-only sketch, not a store build
**What B ran:** in a scratch copy of HEAD (`git archive`), B removed `selectedClipId`/`selectedClipIds` from `ArrangementContextValue` and from the value literal, then ran `npx tsc --noEmit`. The result is `b-round-321/sketch-type-tsc.log` [K6]:
- **92 errors.**
- **App files:** `StudioWorkspace.tsx` (5), `ArrangementTransport.tsx` (1) and `ArrangementLane.tsx` (1).
- **Tests: 29 files**, listed in `b-round-321/selection-test-files.txt`. HEAD `expect(` total: **4,021** (`b-round-321/expect-count-head.txt`, via `b-round-321/expect-count.py`) [K7].
- `perf/**` and `e2e/**` read no selection field: the grep gave 0 hits.

**The full suite on the same sketch** (L23 RETRO 305): `b-round-321/precheck-full.log`, classified in `b-round-321/precheck-classify.txt` [K27]:
- Test Files: **110 failed, 128 passed (238)**.
- **All 29 listed files fail.**
- **The other 81 failing files** (`b-round-321/precheck-outside-list.txt`) all fail with the same runtime crash: `StudioWorkspace` reads the removed field (`undefined.length`), because the type sketch did not migrate the app readers.
- `self-disabling-focus` also has three assertions on the transport Delete state, which come from Transport's unmigrated `selectedClipId`.
- **What this means:** the 81 files are **not** test-read collisions. They are the covering set for the app change. A runs all of them (A-UNIT), and none of them may need an edit; if one does, §2.4's exception applies.

**Why not a full sketch:** the store migration itself (provider, `StudioWorkspace` subscribers, lane, transport) is the implementation. B did not build it. So no budget number in this task is asserted. Every perf comparison is relative (strictly below the HEAD control C runs in the same session), plus the name rows of §3.2.

### 0.4 What changes for the user
**Nothing visible.** Click, Ctrl/Shift-click, Ctrl+A, marquee, Esc, Delete, Ctrl+D, copy, cut, paste, split, the detail panel, the clip gain fader, transport titles, the group overview marks and the "n clips selected" readout behave exactly as at HEAD. Only the render work of a selection change drops. A re-click of the already-selected clip renders nothing.

### 0.5 Consults / reference / screen budget
- **Consults (D-29z891):** `performance-optimizer` and `tech-lead`, summarised in `b-round-321.md` §3.
- **Not applicable:** reference-first, `product-designer`, the screen budget and the journey row. This is a pure performance round: no visible change and no new persistent element.

## 1. Rulings
| Id | Ruling |
|---|---|
| Store location | New module `app/lib/arrangement/selection-store.ts`, on `createStore` from `zustand/vanilla` (D-29z193) |
| Store lifetime | One store per `ArrangementProvider`, created with `useState(() => …)` like `rangeStore`. **Never a module singleton** |
| Store state | `selectedClipIds: readonly string[]` (starts at the shared `NO_SELECTION`) and `setSelectedClipIds(next)` |
| **Equality guard** | When `next` has the same length and the same ids **in the same order** as the stored array, the store keeps the old reference and notifies nobody. The order matters: in `add` mode `toggleInSelection` moves an id to the end, which changes the primary clip (`.at(-1)`), and that **must** notify |
| Exposure | A new `ArrangementSelectionContext` carries the store. New hooks: `useArrangementSelectionStore()` returns the store, and `useArrangementSelection(selector)` uses `useStore`. A may refine the names (`AGENT_DISCOVERABLE_CODE.md`). Both hooks throw outside the provider, like the range hooks |
| Value shape (grant, D-29z894) | `selectedClipId` and `selectedClipIds` leave `ArrangementContextValue`, the value `useMemo` and its deps (K3 → 0). `selectedClipIds` leaves the `latestRef` shape (K4 → 0). The provider's `useState<readonly string[]>(NO_SELECTION)` goes (K5 → 0). `activeTrackId` **stays** in the value (D-29z891) |
| Writers | `setSelection`, `setSelectedClipId`, `toggleClipSelection`, `selectClips` and `selectAllClips` keep their signatures and stay stable callbacks. `setSelection` writes the store. L49: `setSelection`'s body today has two effects [K10]: the `latestRef` mirror (**dropped**, because the store is the one copy of the truth) and the state write (**moved** into the store). `selectClips`' own same-content check stays |
| Event-time reads | Every read in K4, `getSelectedClipIds`, `primarySelectedClipId` and the two `StudioWorkspace` handler reads (`current.selectedClipIds`, `current.selectedClipId`) read `store.getState()` or the getters at event time |
| Selectors | A selector returns the stored array reference, a primitive or a boolean. **None returns a new array, `Set` or object.** Derived values (`new Set`, `filter`, `.at(-1)`) are computed in a `useMemo` over the raw array. Transport selects one boolean, "a clip is selected", so a change from one selected clip to another does not re-render it |
| Where subscriptions sit | `StudioWorkspace` does **not** subscribe to the selection at its top level. Each of its render-time uses becomes a small subscriber component, or a selector inside the child that needs it: the group overviews `useMemo`, the selected-clip detail and its title, the multi-select summary, and the "n clips selected" readout. `ArrangementLane` may subscribe to the array for its per-clip `includes` (cheap, `tech-lead`/`performance-optimizer`). A clip whose selected flag does not flip must not re-render |
| Ordering with range | Where a handler clears both range and selection, both stay synchronous writes in the same tick, range store first. No `unstable_batchedUpdates` unless S2-VIDEO fails on A's own run. In that case A STOPs (§6) and does not add it unasked |
| `activeTrackId` / harness click row | Out of scope (PERF-10). `interact.click.components` stays `record` |

## 2. Contract

### 2.1 Files (grants, §4)
**New:**
- `app/lib/arrangement/selection-store.ts`
- `app/lib/arrangement/__tests__/selection-store.test.tsx` (it may be split into a `.ts` and a `.tsx` file)
- `docs/implementation/2026/quarter-IV/231-perf-selection-store.md`

**Edited:**
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`
- New small subscriber components may live inside `StudioWorkspace.tsx`, or in **new** files under `app/components/arrangement/` that A names in the report. Each follows `FORWARDREF_COMPONENT.md` where it renders DOM, and uses the `function XInner` + `const X = memo(XInner)` form when memoised (L23)
- The 29 test files of `b-round-321/selection-test-files.txt` [K6]. **Only how they read the selection changes**; every assertion stays (§2.4)
- `perf/studio-lab-interactions.perf.spec.ts`: the new scenario of §2.5 only
- `perf/budgets.interactions.json`: the new rows of §2.5 only
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: the whole `## მეტრიკები` section (L34)
- `docs/implementation/2026/quarter-IV/230-perf-range-store.md`:
  - l.4 → `**სტატუსი:** Completed (C round 322 PASS)` (L28 multi-stage) [K13];
  - **one** new line in `### გადაწყვეტილებები (rulings)` [K20], for GATE320-L1 + GATE320-S2: "D-29z860 (`tasks/round-318.md` l.102, the round-318 grant): `range` leaves `useArrangement()`; read it with `useArrangementRange`. The range is written before the selection in the same tick; after an `await` the two commit separately until PERF-8b (doc 231)"

### 2.2 Selection store behaviour (unit rows, new test file)
| Row | Asserts |
|---|---|
| SS1 | `createArrangementSelectionStore()` starts with `selectedClipIds` equal to `NO_SELECTION`. `setSelectedClipIds(next)` with new content stores exactly `next` by reference |
| SS2 (equality guard) | The same ids in the same order, as a fresh array: `getState().selectedClipIds` keeps the **old** reference and a subscriber is **not** notified. The same ids in another order (`['a','b']` → `['b','a']`) **are** stored and notify once. Mutant **MU-NO-EQUAL-GUARD** (store every `next`) turns the first half red. Mutant **MU-UNORDERED-GUARD** (compare as sets) turns the second half red |
| SS3 | Two stores are independent. Two providers in one tree hold different selections |
| SS4 (provider re-render guard) | Inside `ArrangementProvider` with two clips on **one** track and no range: a probe that calls only `useArrangement()` and counts renders (React `Profiler` or a render counter) **does not re-render** when the selection moves from clip 1 to clip 2 (`toggleClipSelection` or `selectClip`). A probe on `useArrangementSelection((s) => s.selectedClipIds)` re-renders exactly once. Mutant **MU-SELECTION-IN-VALUE** (put `selectedClipIds` back into the value and its deps) turns SS4 red |
| SS5 (re-click) | `selectClip(id)` for the already-selected `id`: 0 renders of both probes. Mutant MU-NO-EQUAL-GUARD turns it red |
| SS6 (stale read) | After a selection change and with no re-render in between, an event-time action that reads the selection uses the **new** selection. Use the context's delete-selected, duplicate or copy, whichever A can drive in jsdom. Mutant **MU-STALE-SELECTION-READ** (one event-time read takes a render-time snapshot) turns SS6 red |
| SS7 (primary clip) | After `toggleClipSelection(a,'add')` and then `toggleClipSelection(b,'add')`, the primary clip is `b`. This is the detail panel's clip, `getPrimarySelectedClipId()` or the existing accessor. After re-adding `a` in `add` mode the primary is `a`, if `toggleInSelection` moves it to the end at HEAD. A states the HEAD behaviour it pins, and the assert equals HEAD |

### 2.3 Completeness (claims after A)
- K3 = 0, K4 = 0, K5 = 0, K10 = 0, K12 = 1.
- K11 becomes the count A leaves in Transport; it must read a boolean selector.
- K21/K22 become the counts A leaves in `StudioWorkspace`. Each one must be inside a subscriber child or a `getState()` read; A lists them.
- `npm run typecheck` rc 0 proves that no context reader is left.

### 2.4 Test files (the 10a rule)
- In each of the 29 files, only the way the test reaches the selection changes: a probe that also calls the new hook, or `getState()` on the store. The `expect(` count per file stays the same or grows.
- **A test whose only change is a removed assertion is a Medium.**
- A runs `python3 -I b-round-321/expect-count.py <store>` before and after. The HEAD output is `b-round-321/expect-count-head.txt`: 29 files, TOTAL 4,021 [K7].
- **Exception:** typecheck or `precheck-full.log` may flag a test outside the list for the selection on `ArrangementContextValue` (a read, or a field in a constructed value literal). A may change only that read or field, must list the file, and the `expect(` rule applies to it too.

### 2.5 Harness scenario and rows (all `record`, D-29z893)
**Scenario:** add a new step at the **end** of the `cpuRate === 1` block, after `measureZoomWheel`, so no existing row's state changes:
- **select same lane (30 clips):** click the name bar of a **visible, unselected** clip on the same lane as the selected one, with no time selection.
- **re-click:** click the same name bar again.

**Rows** (`owner: "PERF-8b"`, `kind: "deterministic"` unless marked):

| Row | Value | Note text (mandatory) |
|---|---|---|
| `interact.harness.select-same-lane-live` | assert `== 1` (a harness self-check, not a budget) | 1 when, after the first click, the clicked clip is the selected clip (read through the detail panel or an accessible state, never a class, L12), the active track is unchanged, and no time selection exists |
| `interact.select.same-lane.30.commits` | `record` (`kind: "wallclock"`, L37) | "record — not run on sketch: B built a type-only sketch" |
| `interact.select.same-lane.30.components` | `record`, per-commit sizes in `detail` | same |
| `interact.select.reclick.30.commits` | `record` | same |
| `interact.select.reclick.30.components` | `record` | same |

The existing rows do not change. `interact.click.*` stays as it is [K25]. If the harness validates `kind` or `op`, A uses the existing spelling.

### 2.6 Doc 231 (Georgian, technical terms in English; TEMPLATE's 7 headings, L26)
- **l.4:** `**სტატუსი:** Completed (C round 322 PASS)` (L28, final stage).
- **Contents:** the mechanism (§0.2), the store, the equality guard and why order matters, the selector rule, and the HEAD → A numbers (C's run).
- **`### გადაწყვეტილებები`:** "D-29z894: `selectedClipId`/`selectedClipIds` leave `useArrangement()`; read them with `useArrangementSelection`".
- **Testing:** it names SS1–SS7, the mutants and C's rows.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-321/claims-322.sh` from the loop root. Its output equals `b-round-321/claims-322-head-output.txt`. K23/K24 are B artifacts and must be unchanged. Any difference is a STOP |
| A-IMPL | §1, §2.2–§2.6 |
| A-CLAIMS-AFTER | K3 0, K4 0, K5 0, K10 0, K12 1, K19 ≥ 5, K8 11; K13 shows no line for doc 230 |
| A-TYPE / A-LINT | `npm run typecheck` rc 0; `npm run lint` rc 0 |
| A-UNIT | `npx vitest run` on: the new selection-store test file(s), the 29 files of `selection-test-files.txt`, the 81 files of `b-round-321/precheck-outside-list.txt`, `range-store` tests, `gesture-reentry`, `status-lifetime`, `meta-shortcuts-ui` and `delete-selection-ui`. All pass. Also `perf/lib/report.test.ts` through a scratch vitest config that includes `perf/**` (as in rounds 312–320). A reports the counts |
| A-EXPECT | `expect-count.py` after ≥ HEAD for every file |
| A-MUTANTS | On a scratch copy, never in `store/`: MU-NO-EQUAL-GUARD, MU-UNORDERED-GUARD, MU-SELECTION-IN-VALUE and MU-STALE-SELECTION-READ each turn their row red. Restored, they are green |
| A-PERF (alone, L38) | Production build on a scratch copy, then `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` once. Report the §2.5 rows, `failures`, and the same rows from a run of the new spec against a HEAD build (the control). If A's `same-lane.30.components` is not below the control, that is a STOP with the per-component breakdown |
| A-REVIEW | `code-reviewer` (3+ files). It checks: <ul><li>no selector builds a new array, `Set` or object;</li><li>no event-time read uses a render snapshot;</li><li>the provider holds no selection state;</li><li>the store is per provider;</li><li>the equality guard is order-sensitive;</li><li>the test diffs change only the read path.</li></ul> A Medium+ inside the grants is fixed and re-reviewed (L11). Architecture notes go to B |

### 3.2 C's rows
C writes `c-round-322.md` and `c-round-322.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified` = 7 (SS1–SS7);
- `mutantsRecorded` = 4;
- `mutantRedOnSketch` = `null`, reason "B built a type-only sketch; mutants not run on a B sketch (D-29z893)";
- `mutantRedOnTree` (C's re-run on A's tree);
- `gateChecksNamed` = 6 (the gate rows below);
- `gateChecksRunOnSketch` = 2: typecheck → `sketch-type-tsc.log`; full vitest → `precheck-full.log`;
- `chainHeadGateRunGreen` = `null`, reason "not a fix-up chain".

**Builds.** Production builds of HEAD `53c5c79` (`git archive`) and of A's tree, each in its own scratch. Never build inside `store/`.

**Browser rows** run at 1440×900 and 1280×720 on `/studio-lab`: the dev server `:5173` (A's tree) or A's production build. Each behaviour row compares A's result with HEAD's: the same visible result and the same status text.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status`, the protected sha | Only the §2.1 paths changed. Protected 11/11 OK |
| CLAIMS | `bash b-round-321/claims-322.sh`, first (L56) | As A-CLAIMS-AFTER; the other lines equal `claims-322-head-output.txt`, except K2 (A's entry count), K11, K19, K21 and K22 |
| RT-FIX | Re-check only the changed lines of `retros/retro-321.md` (`b-round-321/retro-321-fix.diff.txt`): <ul><li>**§9:** re-run C's one-liner; the output equals `b-round-321/asserts-specified-305-320.txt` (K24 `asserts-equal`).</li><li>**§8:** run `python3 -I b-round-321/retro321-mentions-v2.py b-round-320/backlog-before-321.json c-round-322` (the second argument is the output folder; C writes only under `c-round-322/`, L38). Expect 18 ids and 4 strings, equal to B's files (K24); every id in `retro321-mention-ids-v2.txt` has a disposition in §8; also grep the before-copy with C's own extra spellings.</li><li>**§4:** "9 + 2" against `b-round-320/classify.txt` `cat_window`.</li><li>No other line of `retro-321.md` changed: the diff file equals `diff b-round-321/retro-321-before-fix.md retros/retro-321.md`.</li></ul> | All as stated. A gap is a finding against B. C-R321-01/02/03 close on PASS |
| UNIT | A-UNIT's files on C's scratch; the 4 mutants; at least one mutant of C's own | All pass; each mutant red; restored green |
| EXPECT | `expect-count.py` HEAD vs A | No file loses an `expect(` |
| PERF-SELECT (alone, L38) | A's interactions spec on both builds | <ul><li>**Control (HEAD build):** `select.same-lane.30.components` > 50 and `reclick.30.components` > 50, or the row is vacuous (the HEAD dev probe gave 105 / 92 with 2 clips, K14).</li><li>**A:** `select-same-lane-live` = 1; `reclick.30.commits` = 0; `same-lane.30.components` **strictly below** the control. C reports A/control as a ratio (`record`, not a pass bound, D-29z893). The pass criterion is this row together with SELECT-NAMES.</li><li>**`failures` []**.</li><li>Every other deterministic row: **any rise in a drag, click, zoom or play/pause row is a finding.** A load-time row may rise by at most the number of new always-mounted components (the selection Provider and the subscriber components), which A names and counts and C checks. Lower rows are listed</li></ul> |
| PERF-LOAD (alone) | `studio-lab.perf.spec.ts` on A's build, then compare with the HEAD run | `failures` []; the same tolerance as PERF-SELECT |
| SELECT-NAMES (dev) | `node b-round-321/click-hooks-probe.mjs <base> <out> same-lane` (copy to `c-round-322/`) on HEAD and on A's tree | **HEAD:** the ten K15 names are present in the `click-original-same-lane` commit. **A:** none of the ten is present, the provider fiber does not render (`providerRendered` false), and `click-original-again` has 0 commits. On A's tree, read `providerRendered` and the name list only, never the hook indexes: removing the `useState` shifts them. Mutant MU-SELECTION-IN-VALUE on A's tree brings the names back (C runs it on a scratch dev server with its own Vite `cacheDir`, L38) |
| S2-VIDEO (dev) | `node b-round-321/s2-probe.mjs <base> <out> video` on HEAD and A | **HEAD:** ≥ 1 commit with the range cleared and the old selection drawn (K17: 2). **A:** 0 such commits. A 0 on HEAD in C's run makes the row vacuous: report it, and do not mark it PASS. If A shows ≥ 1, GATE320-S2 becomes a Medium finding |
| S-CLICK | Click, Ctrl/Cmd+click, Shift+click, Ctrl+A, Ctrl+drag marquee and Esc on 3 clips over 2 lanes | The same clips selected, the same detail panel and the same status as HEAD |
| S-EDIT | Delete, Ctrl+D, Ctrl+C/Ctrl+V, Ctrl+X, Ctrl+E split on 1 and on 2 selected clips, then Undo/Redo | The same clips, selection after the action and status as HEAD (SS6 in the browser) |
| S-DETAIL | Select 1 clip, then 2 clips | The detail panel shows the primary clip with an enabled clip gain fader, then the multi-select summary and "n clips selected", as at HEAD |
| S-TRANSPORT | Split and Delete transport buttons with no selection, 1 clip, and a range | The same soft-disabled state, titles and labels as HEAD. Today these depend on `selectedClipId` truthiness and the range [K11] |
| S-GROUP | Collapse the Stems group with a selected clip inside, then select another clip | Screenshot compare of the collapsed group's overview row, A vs HEAD, at both viewports: the same pixels in that row. B did not probe a selected-clip mark at HEAD, so the row compares rather than naming a mark |
| S-RANGE | Body-drag a range on a selected clip; click another clip | The range clears and the selection moves in one visible step; the status is as at HEAD |
| G322-AUTH | As G321-AUTH, both viewports | `/studio-lab` anonymous workspace + demo badge, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; `/api/studio-token` with no header → 401 |

**Gate rows.** C does not claim these; they go under `"gate"`: the full vitest, the build in `store/`, Biome, typecheck, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if every row from PERF-SELECT through G322-AUTH ran at the stated viewports. The two perf specs run at their own fixed viewport.

**Ableton conformance:** not applicable. The behaviour is unchanged, and there is no new reference.

## 4. Grants (D-29z891, D-29z894)
A edits only the §2.1 paths.
- **Nothing else:**
  - not `package.json` or the lock;
  - no other `app/**` file;
  - no other `perf/**` file;
  - no config;
  - no protected file;
  - no loop artifact.
- **If another file seems to need changing** (a reader outside the list), A STOPs and names it. The only exception is §2.4's.

## 5. Neighbouring behaviour at risk (C probes)
- **A stale selection in event handlers:** Delete, Ctrl+D, copy, cut, split and lane moves.
- **The primary clip** (`.at(-1)`) after `add`-mode toggles: SS7, S-DETAIL.
- **Range and selection mismatch after an `await`:** S2-VIDEO.
- **Undo/redo restoring or clearing the selection:** it must write the store.
- **The range store, `mixDraftStore`, `positionStore` and the meters:** they must not change. PERF-LOAD's fader rows show this.
- **`activeTrackId`:** unchanged. The library preview's target track and the lane's active mark still follow it.

## 6. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-322.md` and changes nothing else when:
- A-CLAIMS differs;
- A's `same-lane.30.components` is not strictly below the HEAD control, or S2-VIDEO shows a mixed commit on A's tree (A reports the per-commit breakdown);
- a reader outside §2.1 needs a change;
- a test assertion would have to be removed;
- the equality guard breaks a HEAD behaviour (SS7, an effect keyed on the array identity).

## 7. Next
- **After C PASS and gate 322:** PERF-8 is done (8a + 8b). RETRO-321 closes with RT-FIX.
- **Round 323:** REGRESSION if its planning falls on or after 2026-11-05 (it carries the C-R318-06 repro row); otherwise PERF-DRAG-PREVIEW, then PERF-9, PERF-10 (with the C-R320-01 row and SIG-R322-ACTIVE-TRACK-STORE) … PERF-15 → SYS-R2-FAKE-FIDELITY → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).
- **Root:** ARCH-CHECKPOINT-PERF8-STORE-PATTERN is still open and non-blocking. This round is its natural answer point (the PERF-8 boundary).

## 8. Commit readiness
After C PASS and the gate, root publishes the §2.1 paths on top of `53c5c79`.

## 9. Claims (L29 + L56)
Run `bash b-round-321/claims-322.sh` from the loop root (`CLAIMS_STORE` may override the store path). The HEAD output is `b-round-321/claims-322-head-output.txt`.

| Tag | Claim | Now (`53c5c79`) | After A |
|---|---|---|---|
| K1 | gate 321 / gate 320 / published commit | skipped published 53c5c79 | same |
| K2 | HEAD, status entries | 53c5c79 0 | 53c5c79, §2.1 count |
| K3 | value/`latestRef` selection lines in the context | 4 | 0 |
| K4 | `latestRef.current.selectedClipIds` / `latest.selectedClipIds` | 14 | 0 |
| K5 | provider `useState<readonly string[]>(NO_SELECTION)` | 1 | 0 |
| K6 | type-sketch errors / app files / test files | 92 3 29 | — |
| K7 | `expect(` total in the 29 files | 4021 | ≥ 4021 |
| K8 | protected OK | 11 | 11 |
| K9 | regression-last | 2026-11-02 | same |
| K10 | `setSelectedClipIdsState(next);` | 1 | 0 |
| K11 | `selectedClipId` in Transport | 6 | listed by A |
| K12 | `selection-store.ts` exists | 0 | 1 |
| K13 | `In Progress (stage` docs | doc 230 l.4 | none |
| K14 | HEAD hook diffs and dev counts | harness [1,3]; reclick [1]; same-lane [1] 105; reclick 92 | — |
| K15 | ten names live in HEAD's same-lane commit | 10 of 10 | — |
| K16 | selection reads in the 8 selection-free files | 0 ×8 | 0 ×8 |
| K17 | add-video mixed commits at HEAD | 2, 0 frames | — (S2-VIDEO) |
| K18 | `setRange(null);` sites | 15 | listed by A if changed |
| K19 | `"interact.select` rows | 0 | ≥ 5 |
| K20 | doc 230 rulings heading line | 40 | 40 |
| K21 | `selectedClipIds?` in StudioWorkspace | 15 | listed by A |
| K22 | `selectedClipIds,` lines in the context; StudioWorkspace selection deps lines | 3; 2683 2735 2767 | 0; listed by A |
| K23 | round-321 archive equals the old task | archive-equal | same |
| K24 | RT-FIX artifacts reproduce (written to a temp dir, never into `b-round-321/`) | asserts-equal inventory-equal 18 | same |
| K25 | `interact.click.components` rows / mode | 2 record | same |
| K26 | every cited artifact exists (L56) | done | done |
| K27 | sketch full-suite summary / outside-list files / all with the StudioWorkspace crash | 110 failed 128 passed; 81; True | — |
