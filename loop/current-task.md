# CURRENT TASK — Round 104: an identical status sentence set again is announced again (GATE96-S2) + doc 091 status line (GATE103-S5)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned at 07:20 UTC)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-103.md` (exact copy of the round 103 task). Rationale: `b-round-103.md`. Decision record: D-29z69 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one Low a11y bug with one behaviour change, plus one doc status line. One owner (A).
  1. **GATE96-S2 (Low, a11y, pre-existing).** `status` is a plain `useState` string (`ArrangementContext.tsx` l.535). When the same sentence is set twice (Space twice on an empty project, Enter twice on a failed library row, Fit twice…), React bails out, nothing in the DOM changes, and the `aria-live="polite"` `<output>` (`StudioWorkspace.tsx` l.2440–2446) says nothing the second time. A screen-reader user gets no feedback for the repeated action.
     - **Evidence:** `gates/round-96/review.md` finding 2; source at `3b6178b`.
  2. **GATE103-S5 (housekeeping):** doc 091 l.4 still says the round is waiting for C. C round 103 passed and gate 103 published it at `3b6178b`.
- **Not in this round (still open, not deferred):** GATE103-S1 (conditional), GATE103-S2/S3, A-R103-EW5-TITLE-NIT, the grid/tempo Lows, the marker Lows, GATE102-S3/S4, GATE98-S2, R21-I2, SRW-21-PREMOUNT and the SRW-21 mount (auth owner's release), T12, VISUAL-A-OBSIDIAN.
- **Frozen this round:** every app file except the ones in the Baseline table, every existing test file, every protected file.

## Why this round
- **C round 103: PASS.** `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 103: published**, commit `3b6178b758253d5098cea19f07c43e4799cb9299` on both remotes (reviewer 9/10).
- **No C bug is open.** GATE96-S2 is next in the published order (D-29z67 / D-29z68: "Then: GATE96-S2; …").
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21; B planned this on 2026-10-23 (07:20 UTC): 2 days, the rule needs 3. **The next B planning on or after 2026-10-24 is the regression round, whatever this round leaves open.**
- **Why not new feature scope:** every SRW item FB-01..FB-16 is implemented and C-passed in the browser. What remains is Tech Lead manual checks (external), the SRW-21 purchased mount (auth owner's release), and T12 / VISUAL-A-OBSIDIAN, which start only after the original scope is confirmed done.

## Baseline (measured by B, 2026-10-23)
- **HEAD `3b6178b758253d5098cea19f07c43e4799cb9299`** (gate 103 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-103-r104-tree-sha256.txt`, **535** entries = every tracked `app/**`, `docs/implementation/**` and `vite.config.ts` file (538) **except** the 3 owned tracked files below.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-103-r104-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-103-r104-snapshots/` (`SHA256SUMS.txt`). All LF, CR=0.

  | File | sha256 prefix | lines | permission |
  |---|---|---|---|
  | `app/contexts/ArrangementContext.tsx` | `db7a477d` | 3397 | **owned, narrow:** (a) l.535 `useState` → `useReducer` with the new reducer (plus the `useReducer` import and the new module import); (b) `statusSequence: number` added to `ArrangementContextValue` (after `status: string;` l.247) and to **both** value sites (l.3130 and l.3231). **Nothing else.** l.536–541 (`lastNonRefusalStatusRef`), the l.1484 functional `setStatus((current) => …)` and every `setStatus(...)` call site stay byte-identical. |
  | `app/components/arrangement/StudioWorkspace.tsx` | `ac9c0815` | 2518 | **owned, narrow:** the `useArrangement()` destructure (l.436–450) gains `statusSequence`; the status `<output>` (l.2440–2446) renders its text inside one keyed `<span>`. **Nothing else.** |
  | `docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md` | `e489e5f4` | 102 | l.4 only |

  New files (untracked at the end):
  - `app/lib/arrangement/status-announcement.ts`
  - `app/lib/arrangement/__tests__/status-announcement.test.ts`
  - `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx`
  - `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md`
- **Expected end state:** `git status --short` = **3 M + 4 ??** (the three owned tracked files and the four new files). Nothing else.
- **Protected (frozen, never edited; hashes re-checked by B at `3b6178b`):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`);
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-104/mut/`, `node_modules` symlink, Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if HEAD differs, the tree is dirty at the start, or a frozen file changed.

## 1. What changes (A)

Read first: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `FORWARDREF_COMPONENT.md` (component edit), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/new-test.md`. There are no styling changes.

### T1 — pure reducer (`app/lib/arrangement/status-announcement.ts`, new)
- **Exports** (names per `AGENT_DISCOVERABLE_CODE.md`):
  - `interface ArrangementStatusEntry { readonly text: string; readonly sequence: number }`;
  - `type ArrangementStatusUpdate = string | ((current: string) => string)`;
  - `createArrangementStatusEntry(text: string): ArrangementStatusEntry` → `{ text, sequence: 0 }`;
  - `reduceArrangementStatus(previous: ArrangementStatusEntry, next: ArrangementStatusUpdate): ArrangementStatusEntry`.
- **`reduceArrangementStatus` rules:**
  - **string:** always a **new** object `{ text: next, sequence: previous.sequence + 1 }`, **including when `next === previous.text`**. This is the fix.
  - **function:** `text = next(previous.text)`. If `text === previous.text`, return **`previous` itself** (the same object, so React bails out exactly as today). Otherwise return `{ text, sequence: previous.sequence + 1 }`.
  - It is pure: no time, no refs, no globals. StrictMode may call it twice.
- **Why the function branch differs (B decision):** the only functional caller is the post-gesture restore at `ArrangementContext.tsx` l.1484. It is internal bookkeeping, not a user action, and must keep today's no-render behaviour when nothing changes.

### T2 — context (`ArrangementContext.tsx`, narrow)
- **Replace l.535** with `useReducer(reduceArrangementStatus, collection.origin, (origin) => createArrangementStatusEntry(workspaceCollectionCopy(origin).loading))` (or an equivalent lazy init with the same initial text), destructured as `[statusEntry, setStatus]`. Then add `const status = statusEntry.text;` and `const statusSequence = statusEntry.sequence;`.
  - The dispatch is named `setStatus`, so **every existing call site stays untouched**.
  - `useReducer`'s dispatch is stable, so Biome's `useExhaustiveDependencies` adds **0** warnings. In B's probe, a `useCallback` wrapper instead produced 29 new warnings, so do not use one.
  - The public type `setStatus: (message: string) => void` (l.329) stays as it is; the dispatch is assignable to it.
- **Add `statusSequence`:**
  - `statusSequence: number;` in `ArrangementContextValue`, directly after `status: string;`;
  - `statusSequence,` directly after `status,` in both value sites: the value object and its dependency list. B's probe found exactly 2 occurrences of `status,` followed by `sourceStates,`.
- **No other line changes.** If something else seems necessary, stop and report to B.

### T3 — live region (`StudioWorkspace.tsx`, narrow)
- Destructure `statusSequence` next to `status` (l.444–445).
- Inside the existing `<output … aria-live="polite" data-testid="arrangement-status">`, render `<span key={statusSequence}>{status}</span>` instead of the bare `{status}`.
- **Hard constraint:** the `<output>` element itself is **never keyed, re-mounted or conditionally rendered**.
  - Screen readers often do not announce a live region that is replaced; they do announce one whose content changes.
  - Its classes, attributes and position stay byte-identical.
- The `textContent` of `[data-testid=arrangement-status]` is unchanged in every state, because existing tests read it.

### Tests — two new files (no existing test file changes)
**Rules for all new tests:**
- Assert exact values (`toBe`, `toEqual`, `toBeNull`).
- No type assertions (no `as`, including `as const`), no `@ts-` directives and no `any`.

**`status-announcement.test.ts` (pure):**
- **SA1:** `createArrangementStatusEntry('x')` equals `{ text: 'x', sequence: 0 }`.
- **SA2:** a different string gives a new object with the exact text and sequence + 1.
- **SA3:** **the same string** gives a **new** object (`not.toBe(previous)`) with the same text and sequence + 1. Twice in a row gives sequence + 2.
- **SA4:** an updater that returns the current text gives **the same object** (`toBe(previous)`).
- **SA5:** an updater that returns a different text gives a new object with sequence + 1, and the updater received `previous.text` exactly once.

**`status-announcement-ui.test.tsx`** (provider + `StudioWorkspace` mount). Copy a mount fixture from an existing workspace test such as `failed-source-refusal.test.tsx`; do not import from it.
- **SU1 — Space twice on an empty arrangement.**
  1. Mount with an empty initial arrangement and settled loads, and record `const region = getByTestId('arrangement-status')`.
  2. Press Space, on `document.body` or the workspace root (whichever the existing Space tests use). The textContent must be exactly `დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.`
  3. Capture `region.firstElementChild` as `first`, and attach a `MutationObserver` to `region` (`childList: true, subtree: true, characterData: true`).
  4. Press Space again, then check:
     - the textContent is the same exact text;
     - `getByTestId('arrangement-status')` is **the same node** as `region` (`toBe`);
     - `region.firstElementChild` is **not** `first` (a new span);
     - the observer recorded at least one record with `type === 'childList'` and an added node whose `textContent` is the exact text. Read the records with `observer.takeRecords()` after the `act(...)` that presses Space; do not rely on the asynchronous callback.
- **SU2 — Enter twice on a failed library row** (the reviewer's repro).
  - Use a collection where one source fails to load (copy the failing-source setup of `failed-source-refusal.test.tsx`), and activate the failed row twice, the same way the FS tests do.
  - Both times, the textContent is exactly `„<title>“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`
  - The second activation replaces the inner span (as in SU1), and the region node is the same.
- **SU3 — the region is stable across distinct texts.** After two different status texts in a row, the `<output>` node is the same object, has `aria-live="polite"`, and has exactly one element child.
- **SU4 — the post-gesture restore stays silent.** Use the public API:
  1. Claim a pointer gesture, trigger `GESTURE_EDIT_BLOCKED_MESSAGE` (an edit during the gesture), then release it. The status text is the pre-gesture text again (as today).
  2. Claim and release again with nothing refused. The inner span is the **same** node before and after this second release: an unchanged restore causes no bump.
- **Provider render counts:** do not add new render-count oracles. The existing ones (`render-budget.test.tsx`, `context-hygiene.test.tsx` PV1–PV8) must stay green unchanged.

**Fail-before** (scratch, against the snapshots of the two app files). B expects:
- SA1–SA5 red: the module is missing, so the file fails to import. Report it as such.
- **SU1, SU2 and SU3 red.** On the baseline the `<output>` holds bare text with **zero** element children: `firstElementChild` is `null` both times (so `not.toBe(first)` fails), the observer records nothing on the identical second press, and SU3's "exactly one element child" fails.
- SU4 green.

Report the exact list and explain any difference.

**Mutations** (scratch only; record the red tests for each, plus an unmutated control):
- **m1:** the reducer returns `previous` for an identical string → SA3, SU1, SU2 red.
- **m2:** the `key` is removed from the span → SU1, SU2 red.
- **m3:** the key moves onto the `<output>` and the span is removed → the SU1/SU2 region-identity assertions and SU3 red.
- **m4:** the function branch always bumps → SA4 and SU4 red.
- **m5:** `statusSequence` is left out of the value's dependency list → report what turns red. B expects SU1/SU2, or none. If none, say so; the gate reviewer then judges whether the dependency list needs a direct test.

### Docs
- **Doc 091 l.4:** `**სტატუსი:** C PASS (Round 103), გამოქვეყნდა 3b6178b (D-29z68)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc 092** `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z69). Record:
  - the problem: React bails out → no DOM change → no announcement;
  - why a reducer with a sequence;
  - why an inner keyed span and not a keyed `<output>`;
  - the rejected options:
    - clear-and-set would break `lastNonRefusalStatusRef`;
    - a `useCallback` wrapper adds 29 lint warnings;
    - a time threshold would be an invented timing contract;
  - that a drag readout repeating the same clamped text now changes the DOM on each move, at the same rate distinct readouts already did;
  - that the collection-swap status reset (round 94) now also bumps the sequence, which is correct;
  - that a real screen reader is the Tech Lead check R104-T.

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint`, with 0 diagnostics in the owned and new files.
- `npx biome check <owned + new code/test files>`, without `--write`.
- **Targeted vitest** (the context change reaches every provider mount):
  - write the list: `grep -rlE "ArrangementProvider|StudioWorkspace|useArrangement\b|status-announcement" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-104/targeted-list.txt`;
  - run it: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-104/targeted-list.txt)`.
  - B's grep at `3b6178b` gives **67** existing files; B's probe ran 1113/1113 green with the reducer change. With the two new files, expect **69**.
- Do **not** run the full suite or `npm run verify`; the root gate runs them.
- **Code-reviewer:** 7 files change, so run it. Pass its Architecture note through verbatim.

## 2. Acceptance — what C checks (real Chromium)
**Setup for every browser row unless stated:**
- a fresh incognito context on `/studio-lab` at the stated viewport;
- Decline consent, then wait for the library to settle;
- C installs a `MutationObserver` (init script or `page.evaluate`) on `[data-testid=arrangement-status]`. For every record it logs the type, a timestamp and the added nodes' text. C also keeps a JS reference to the `<output>` node and checks whether it was ever replaced.

| ID | Steps | PASS when |
|---|---|---|
| **SR-REPEAT-SPACE** (primary; 1280 and 1440) | Empty project (0 clips). Do **not** click the timeline (an empty-lane click runs the marquee finish and seeks). Put focus on `body` with `page.evaluate(() => document.activeElement?.blur())` (record `document.activeElement`). Press Space, wait 500 ms, press Space again. | <ul><li>After each press the status text is exactly `დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.`</li><li>The second press produces at least one `childList` record inside the region, adding a node with that exact text.</li><li>The `<output>` node is the same object before and after (never replaced), and is still `aria-live="polite"`.</li><li>Nothing plays: the transport time does not advance between and after the two presses.</li><li>CDP `Accessibility.getFullAXTree`: the number of AX nodes whose name or text equals the status sentence is the **same** after press 1 and after press 2 (record the count; `<output>` may expose the text both as its name and as a StaticText child, so no absolute number is required).</li><li>Take a screenshot.</li></ul> |
| **SR-REPEAT-FAILED-ROW** (1280) | `context.route` aborts `**/videos/hero/hero-music.mp3` (C's harness; the app's real failure path runs). Wait until that row shows its failed state. Focus the row with the keyboard and press Enter, wait 500 ms, press Enter again. | <ul><li>Both times the text is exactly `„<row title>“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.` (record the title).</li><li>The second Enter produces a `childList` record with that text, and the `<output>` node is unchanged.</li><li>0 clips are added.</li></ul> |
| **SR-REGION-STABLE** (1280) | Middle East row → Enter (1 clip), then Space (play), then Space (pause). | <ul><li>Three distinct status texts appear in order.</li><li>The `<output>` node is the same object throughout and always has exactly one element child.</li><li>Real audio still plays: the transport time advances while playing.</li></ul> |
| **SR-DRAG-STREAM** (1280) | 1 clip (Middle East). Real mouse drag of the clip's fade-in handle far beyond its limit, so that the readout clamps; at least 40 pointermoves; then release. | <ul><li>Record the pointermove count and the number of **added element nodes** in the region (React replaces a keyed span with a remove plus an insert, so raw `childList` records are about twice that; `characterData` records are not counted). Added element nodes ≤ pointermoves + 2 (no amplification).</li><li>The fade ends at its clamp, and there is exactly one new history entry. Ctrl+Z restores fade-in 0.</li><li>No pageerror.</li><li>**Report only:** the longest task during the drag (PerformanceObserver `longtask`). A long task ≥ 200 ms is a bug only if it reproduces in 3/3 drags (a shared runner can produce a single GC pause).</li></ul> |
| **SR-TEXT-REG** (1280) | Middle East → Enter; Fit (record the shortcut used); select the clip and press Delete; Ctrl+Z. | <ul><li>Each status text matches the string the source at `3b6178b` produces for that action (C may read the strings from source).</li><li>The status line is one line high at 1280 for each of them; record its rect.</li></ul> |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no pageerror and no non-noise console error (the cart/connection noise is expected). The aborted hero-music request in SR-REPEAT-FAILED-ROW may log one network error; record it verbatim. |
| **G104-3** | anonymous, run alone, after all rows | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in and no workspace.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`.</li></ul> |
| **AN-REVIEW** (offline) | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs m1, m2, m3 and m4 in its own scratch, with its own mutation strings, and gets the same red tests.</li><li>Assertions are exact, and the added lines have no `as`, `@ts-` or `any`.</li></ul> |
| **T104-TARGETED** | `npx vitest run $(cat a-round-104/targeted-list.txt)` | All pass. C re-runs the grep from §1 and reports any missing file (expect 69). |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD is `3b6178b`, with 3 M + 4 ??.</li><li>The frozen list is 535/535, and A's end hashes match.</li><li>The `git diff -U0` of `ArrangementContext.tsx` touches only the import block, l.535, the interface after l.247 and the two value sites. l.536–541, l.1484–1488 and every `setStatus(` call line are unchanged.</li><li>The `StudioWorkspace.tsx` diff touches only the destructure and the `<output>` content.</li><li>Doc 091 changes only at l.4.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- **Provider re-renders on identical text (new).** Every `setStatus(string)` now renders the provider, even when the text is the same. B's probe shows the existing render oracles stay green; SR-DRAG-STREAM checks the drag path in the browser.
- **The live region is replaced instead of updated (m3).** SR-REPEAT-* checks region identity.
- **The post-gesture restore starts announcing (m4).** SU4 checks this.
- **The status text or the footer layout drifts.** SR-TEXT-REG checks this.
- **Hydration.** The initial sequence is 0 on both server and client; REG-HYD checks this.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A repeated status message is announced again to assistive tech | None consulted. Live's status bar (manual §3.2, captured in `b-round-37/ableton-live-concepts-20261013.txt`) says nothing about screen readers. | — | CZABA's own accessibility rule for its browser status line. No Ableton claim. | არ ეხება |

## 4. Report (A)
Write `a-round-104.md` and `a-round-104/a-round-104-summary.json` as you go (the harness writes `a-round-104-result.json`). Include:
- the changed files with their end sha256 (`a-round-104/end-hashes.txt`);
- the exact commands you ran and their results;
- the fail-before list and the mutation table (m1–m5);
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

A may run its own pre-edit/post-edit browser check of SR-REPEAT-SPACE in `a-round-104/`. It is A's own check, not C's acceptance.

If you stop early, write a checkpoint with the next step.
