# CURRENT TASK — Round 45: SRW-13 polish part 1 — no SSR `useLayoutEffect` warnings from Studio, a technical `biome-ignore` reason in the library, and five doc notes

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-15
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorisation 2026-10-13; behavioural reverse-engineering 2026-10-14).
- Decision record: **D-29z10** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-44.md`.
- Round size: **two Low hygiene items and five doc-only notes. None of them changes behaviour.** The plan's polish row is split in two (the plan allows this). EXPORT-DIALOG-FOCUS-RESTORE changes focus management, so it goes alone in **round 46**. SRW-14 stage 1 is **round 47**.

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B's gates (2026-10-15 13:09). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **20–22** at B's gates. Every A and C run records `tasklist | grep -ci node.exe`. On a timeout under load, re-run that file alone and report both runs.
>
> **Browse rules** (`backlog.harness_rules`):
> - Never use `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure you may use the approved fallback: your own `browse/dist/server-node.mjs`, started with `BROWSE_PARENT_PID=0`, a fresh state file and a log in your round folder. Record the command, PID and log. Never kill a process you did not start.
> - For screenshots inside a short window, use CDP `Page.captureScreenshot`.
> - **New in round 45:**
>   - Delays use bash `sleep` or in-page `performance.now()`. **`$B wait N` did not delay** in round 44.
>   - Loop tests put the playhead inside the loop explicitly.
>   - Exact ruler clicks use the labelled 2 px marker-span technique (`c-round-44.md` §4).

## Why this round

**Round 44 result** (`c-round-44.md`, `c-round-44.json`): **C PASS on every contracted ID, bugs `[]`**:
- **G44-1:** tsc 0; vitest **77 files / 1351**; build; `npm run verify` exit 0; Biome shows only the 2 baseline CRLF errors and 218 warnings.
- **G44-2** passed.
- **G44-3:** anonymous `/studio-lab` opened directly and via the header link:
  - 0 token, recording, download or R2 requests; 0 Authorization headers;
  - token → 401; a fake Bearer → 500 with no token;
  - `/studio/middle-east` → "Sign in required".
- **R44-S:** C also checked git history and found no reader of the latch beyond its own guard.
- **R44-U:** mutations a–f and C's extras g/h were all caught.
- **R44-TR:** play/stop/resume Δ 0.000; the end stop at 23.000 → restart from 0; 5 loop wraps with audio after each wrap; seek; preview handover.
- **R44-REG:** Volume double-click at 100 % → 0 entries, also during playback with 0 new source starts; drag, keys, Mute, Master, and Delete with fader focus.
- **R44-Doc** passed.

**Closed by C evidence:** R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY. **SRW-13 stage 4c is done.**

**Closed by root evidence:** ROOT-ROUND43-CHECKPOINT-RECORD (`publication-checkpoint.json` → `round43Checkpoint`).

**New:**
- **SETTRACKMIX-NAN-IDENTITY** (Low, pre-existing): `setTrackMix` has no `isFinite` guard and returns a new object even when nothing changes. It is fixed in the first round that opens `model.ts`.
- **ROOT-ROUND44-CHECKPOINT** (root): the 3 round-44 paths are C PASS and checkpoint-ready, but uncommitted.

**Today, measured by B** (HEAD `2c0f800` plus the round-44 working copy; `b-round-44/ssr-warn-sample.txt`):
- One `curl http://127.0.0.1:5173/studio-lab` adds **exactly 7** lines `Warning: useLayoutEffect does nothing on the server …` to root's dev-server stderr (`tmp/studio-real-loop/r42-vite.err.log`: 336 → 343).
- The first component frame of each warning:

| # | Frame | Source site (bare `useLayoutEffect(`) |
|---|---|---|
| 1 | `ArrangementProvider` | `ArrangementContext.tsx` l.475 (keeps `lastNonRefusalStatusRef` in step with the status) |
| 2 | `StudioWorkspace` | `StudioWorkspace.tsx` l.669 (applies the pending zoom/scroll view after `pxPerSecond` changes) |
| 3–4 | `ArrangementDetailPanel` | `ArrangementDetailPanel.tsx` l.618 (start open/closed, decided once) and l.629 (cap-resize bookkeeping) |
| 5–7 | `ArrangementDetailContentInner` | `ArrangementDetailPanel.tsx` l.253 (start/end text), l.261 (content-mounted ref), l.268 (Clip Gain text) |

`ArrangementContext.tsx` l.410 already has the isomorphic alias pattern (`usePositionWriterEffect`) for its three position writers. Those do not warn.

**LIB-SEP-REASON:** `ArrangementLibrary.tsx` l.549 reads `// biome-ignore lint/a11y/useSemanticElements: B task §9 requires a focusable role=separator queried by attribute`. The reason names a process, not a technical reason. It is the same class as root L6.

**Doc notes** (all Low, doc-only; evidence in `backlog.open_findings`):
- DOC015-DELETE-GAP-NOTE;
- DOC034-UNREACHABLE-NOTE;
- DOC035-NOTES;
- DOC036-R37-TAIL;
- DOC036-ROUND-REF.

## Baseline

B verified on 2026-10-15 13:09 (`b-round-44/gates.txt`, `tsc.txt`, `vitest.txt`):
- HEAD **`2c0f800`**; `git ls-remote` shows both master remotes at `2c0f800`.
- `git status --short` is exactly the 3 **uncommitted round-44 paths**, at C's shas:
  - ` M app/contexts/ArrangementContext.tsx` `623f381e`
  - `?? app/lib/arrangement/__tests__/context-hygiene.test.tsx` `63b5dbe5`
  - `?? docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md` `5dadac1f`
- **Update 13:24 (B, after the gates): starting point (b) now holds.** Root committed the 3 round-44 paths as **`ca85109`** (`perf(studio): skip unchanged volume previews`; exactly those 3 files). B re-checked against `ca85109`: the 3 shas match C's, the tree is clean, 386 OK, all 8 snapshot shas match. At 13:24 `TCzaba` master was `ca85109` and `shavidze` master was still `2c0f800` (root push in progress; root's item, not a gate for A/C). The text below is kept as written at 13:09.
- **Two valid starting points.** Accept either:
  - (a) the state above;
  - (b) a newer root commit that contains exactly those 3 paths at those shas, with a clean tree.

  In both cases the 3 shas must match. **Nobody but root stages or commits them.**
- **Frozen list:** `../tmp/studio-real-loop/b-round-44-tree-sha256.txt` → **386 OK**. Run it from `store/`.
  - It is the round-43 list of 391, minus the 7 files opened this round (`StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementLibrary.tsx`, docs 015/034/035/036), plus `context-hygiene.test.tsx` and doc 041.
  - `ArrangementContext.tsx` is not in the list; it is checked against its snapshot.
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-44-snapshots/`, `SHA256SUMS.txt` inside) = the working copy at dispatch:

  | File | sha |
  |---|---|
  | `ArrangementContext.tsx` | `623f381e` |
  | `StudioWorkspace.tsx` | `7fe98434` |
  | `ArrangementDetailPanel.tsx` | `61834b2a` |
  | `ArrangementLibrary.tsx` | `dcfcf532` |
  | doc 015 | `befdfd03` |
  | doc 034 | `c26afb41` |
  | doc 035 | `88330af8` |
  | doc 036 | `294326f8` |

- Other checks:
  - protected files 4/4 OK;
  - tsc **0**;
  - vitest **77 files / 1351 passed** (`node.exe` 20);
  - `/studio-lab` 200.
- Biome `./app` (C round 44):
  - **2 errors**, both the root CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. **Do not touch them.**
  - 218 warnings and 1 info.
  - Your files must add 0 errors and 0 warnings.
- **Before you edit:** confirm (a) or (b), 386 OK, and every snapshot sha. If anything differs, **stop and report**.
- Do not touch new untracked paths; record any you see. `.kilo/` shows only as ignored.

**Rules:**
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 SSR-LAYOUT-EFFECT-WARN — one shared isomorphic layout effect, used at the 7 bare sites

**Chosen form** (B, D-29z10): a new hook file **`app/hooks/useIsomorphicLayoutEffect.ts`**:
- It exports `useIsomorphicLayoutEffect`, defined as `typeof window === 'undefined' ? useEffect : useLayoutEffect`. This is the same expression as the existing `usePositionWriterEffect`.
- **Why a shared hook rather than seven local aliases:** 7 sites in 3 files is not a one-time abstraction, and one definition keeps the server/client choice in one place.
- Consumers import it by path: `~/hooks/useIsomorphicLayoutEffect`. That is the `useRelativeFaderDrag` precedent. **`app/hooks/index.ts` is not edited.**

**Replace exactly these calls** (bare `useLayoutEffect(` → `useIsomorphicLayoutEffect(`). The callback bodies and dependency arrays are byte-identical:
- `ArrangementContext.tsx` l.475;
- `StudioWorkspace.tsx` l.669;
- `ArrangementDetailPanel.tsx` l.253, l.261, l.268, l.618, l.629.

Drop `useLayoutEffect` from each file's `react` import if it becomes unused there. In `ArrangementContext.tsx` it stays, because `usePositionWriterEffect` still uses it.

**`usePositionWriterEffect` (ArrangementContext l.410) and its three call sites stay untouched.**
- Consolidating it into the shared hook is an explicit **non-goal**. The playhead and meter writers are the sensitive part, and re-verifying them is not worth a rename.
- This leaves two identical expressions in one file; that is intended. Record it in doc 042. A reviewer finding on it gets "accepted, D-29z10".

**Client behaviour must not change:**
- In the browser `typeof window !== 'undefined'`, so every site is still a layout effect with the same timing.
- On the server, neither kind of effect runs. The change only removes the warning.
- The hook count and order are identical on server and client, so hydration is unaffected.

**Stop condition:** stop and report if any of these is true:
- a bare `useLayoutEffect(` call exists in `app/components/arrangement/**` or `app/contexts/ArrangementContext.tsx` beyond the 7 above (B grep: none);
- the node-environment SSR test (§2.3) cannot render the `/studio-lab` route at all.

### 0.2 LIB-SEP-REASON — the `biome-ignore` reason is technical

- `ArrangementLibrary.tsx` l.549 keeps the same suppression, `lint/a11y/useSemanticElements`. Only the text after the colon changes.
- The new reason states the technical cause and names no process, task, role or round. For example: `no native element is a focusable, keyboard-adjustable splitter; <hr> cannot take focus or aria-valuenow`. A may word it, in English, on one line.
- **Nothing else changes in the file:** not the separator's attributes, not the handlers, not the classes, not the `data-testid`.

### 0.3 Doc notes (doc-only; no other text in these docs changes)

| ID | Doc | Change |
|---|---|---|
| DOC036-ROUND-REF | `036-studio-lab-track-pan.md` l.468 | In place: `ეტაპ 4b-ში (round 37) რჩება` → stage 4b-1 is **round 38**. The double-click reset shipped there (C round 38 PASS). |
| DOC036-R37-TAIL | `036-…` l.436, the clause `… უცვლელია და ღიად რჩება (A-R36-REVIEW-1, B-ს ეკუთვნის; შესაძლოა ეტაპი 4b).` | In place: the path was closed in round 37 by D-29z2 (see the Round 37 section). The l.513 sentence stays as a historical note. |
| DOC035-NOTES (1) | `035-studio-lab-clip-gain.md` l.4 status | From "C pending" → **C PASS (round 30, `c-round-30.md`)**, plus the later rounds that changed this doc's behaviour, if A finds them in the doc. |
| DOC035-NOTES (2) | doc 035 l.26 scenario | The quoted status must equal the real one. It is built at `ArrangementDetailPanel.tsx` l.360 as `Clip Gain: ${selection.title} — …`. Take the exact `selection.title` for `სრული მიქსი` on the demo from the source or the live page (it carries the collection prefix). |
| DOC035-NOTES (3) | doc 035, a new short dated note at the end | The accepted pointer/keyboard asymmetry at `0 dB` with dirty text (A round 30 §6.2a; C round 30 §10): a mouse click discards the dirty text → **1** entry; Tab → reset → Enter commits first → **2** entries. Accepted by contract. |
| DOC034-UNREACHABLE-NOTE | `034-studio-lab-delete-keeps-gap.md`, a new short dated note at the end (or directly under the round-29 no-op bullets at l.181–182) | The non-zero Cut Time no-op and the "silent window with later clips" are **code paths only**: UI ranges are always clip-bounded (detail-panel clamp, range-gesture clamp). Provider tests and C round 29's mutation (d) cover them; no browser path reaches them (C round 29 §4, §6). |
| DOC015-DELETE-GAP-NOTE | `015-studio-lab-navigation.md`, a new short dated note at the end | Since SRW-24 (user request 2026-10-11, `delete-selection-update.md`): Delete/Backspace on a time range **leaves a gap**; only Ctrl+Shift+X cuts time and closes it; Ctrl+Shift+L extends the range to all lanes. |

**Rules:**
- Georgian; technical terms in English.
- The notes cite their evidence files.
- Old text is not rewritten, except the three in-place fixes named above.

### 0.4 Unchanged / out of this round

**Unchanged:**
- every other line of the four source files, including `usePositionWriterEffect`;
- every exported name and type;
- `app/hooks/index.ts`;
- `ArrangementExportDialog.tsx`, `model.ts`, `ArrangementLane.tsx`, `ArrangementMaster.tsx`;
- every existing test file;
- docs 001–041, apart from the five notes.

**Out of this round** (queued, not deferred scope):
- **round 46 — EXPORT-DIALOG-FOCUS-RESTORE alone.** Capture the opener in the layout phase. The focusable filter skips `[hidden]` (jsdom-testable; never `offsetParent`).
- **round 47 — SRW-14 stage 1 (FB-13):**
  - the grid model;
  - Snap on/off with a visible state and a shortcut;
  - divisions;
  - clip move first.

  B prepares the Ableton source table (Live 12 manual, grid/snap section, via gstack `/browse`).
- **then:** SRW-14 later stages → SRW-15 (FB-09/FB-11; a grid only, never audio stretch) → SRW-16 (FB-10) → SRW-17 (FB-12) → SRW-18 (FB-06) → SRW-19 (FB-07) → SRW-20 → R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, SETTRACKMIX-NAN-IDENTITY (with the first `model.ts` round) → the SRW-21 adapter → the full regression and root review → T12.
- **waiting for the Tech Lead:** C-R41-01 (TL-Q-VIEWPORT), C-R23-01/C-R38-01, C-R27-01, C-R6-02, C-R8-01, and the manual checks.

**Out of scope for the whole project:**
- plugins and effects, including compressor, limiter and normalise;
- pitch;
- multiple video layers;
- audio time-stretch.

Grid tempo (later) is never audio stretch.

**What could be affected (C checks):**
- **Detail panel:**
  - the start-open decision at load;
  - the start/end text following the clip or range;
  - the Clip Gain text following the selection;
  - the panel resize and cap.
- **Zoom:** zoom in/out, Fit and zoom-back restore the scroll position (l.669).
- **Status:** the gesture-refusal status restores the last non-refusal status (l.475).
- **Hydration:** no hydration or React warning in the browser console after load.
- **Library:** the separator still resizes by keyboard and pointer.
- **Frozen suites:** `detail-panel*`, `navigation*`/zoom, `gesture-guard`, `pending-status`, `render-budget`, `library*`.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-hook.md`, `prompts/new-test.md`, `prompts/studio-feature.md`; `docs/implementation/TEMPLATE.md`;
   - then run the `pre-flight` skill.

   Note: `prompts/new-hook.md` has a barrel-export checklist item. This task overrides it with the `useRelativeFaderDrag` precedent (no `index.ts` edit). Record that.
2. **Check the baseline and report it before any edit:**
   - HEAD and `git status --short`, and which starting point holds, (a) or (b);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-44-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `(cd ../tmp/studio-real-loop/b-round-44-snapshots && sha256sum -c SHA256SUMS.txt)` against the working files (or compare each sha);
   - protected 4/4;
   - `node.exe`.
3. **Read:**
   - `ArrangementContext.tsx` l.1–20 (imports), l.405–412, l.468–482;
   - `StudioWorkspace.tsx` l.1–20, l.640–680;
   - `ArrangementDetailPanel.tsx` l.1–20, l.240–280, l.600–660;
   - `ArrangementLibrary.tsx` l.540–565;
   - `app/routes/studio-lab.tsx` (the tree that is server-rendered);
   - `app/hooks/useRelativeFaderDrag.ts` (style precedent);
   - one existing test that mocks `@remix-run/react` (e.g. `context-hygiene.test.tsx` l.78);
   - the five doc locations of §0.3.
4. **Re-check (report each):**
   - `grep -rn "useLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx` → exactly the 7 sites of §0.1 (stop condition);
   - `grep -rn "useLayoutEffect" app --include=*.tsx --include=*.ts | grep -v __tests__`: list any site outside Studio. **Do not change those**; record them for B;
   - `npx biome check` on the 4 source files **before** the first edit: record the diagnostics.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

- The diff is limited to §0.1 and §0.2.
- **Rules:**
  - no comments except the one granted pragma (§2.3); no new exports other than `useIsomorphicLayoutEffect`;
  - no `any`, no type assertions, no `@ts-ignore`; semicolons;
  - no reformatting and no reordering of unrelated lines.

### 2.2 Docs

**Doc 042 (new):** `docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`.
- **Header:** date; status `Round 45 — D-29z10; C-ის შემოწმებას ელოდება`; the project.
- **კონტექსტი:** B's measurement (7 per request, the table above) and LIB-SEP-REASON.
- **მიდგომა:**
  - why a shared hook rather than 7 local aliases;
  - why `usePositionWriterEffect` is left alone;
  - why client timing is unchanged;
  - why the test needs the node environment and the pragma grant.
- **შეცვლილი ფაილები**, with no code fragments.
- **პრობლემები და გადაწყვეტები:** Problem → Solution.
- **ტესტირება:** red/green, the C IDs.
- **The Ableton table** (§4.7).
- **TODO:** round 46 (export focus), round 47 (SRW-14 stage 1).
- **The five doc notes** of §0.3, in their own docs.

### 2.3 Tests (in `store/`)

**(1) New `app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx`: real server rendering.**
- **First line:** exactly `// @vitest-environment node`. **Narrow grant, round 45 only** (`backlog.narrow_grants`). It is a vitest tool pragma, in the same class as `biome-ignore`. No other comment.
- **B checked (13:24):** `vitest.config.ts` has **no `setupFiles`**, so a node-environment file runs no DOM setup; no existing test imports `app/routes/studio-lab.tsx`, and that route imports only components, the provider, `studio-lab-demo` and `model` (no CSS or asset import). If the import or render still fails in node, that is the §0.1 stop condition.
- **Why the pragma:** `vitest.config.ts` is jsdom-only and frozen. In jsdom `window` exists, so the hook selects `useLayoutEffect`, and React's server renderer always warns about it. A jsdom SSR test therefore could never go green. With the node environment, `window` is undefined, as in the real dev SSR.
- **Setup:**
  - mock `@remix-run/react` as the existing suites do (copy, do not import). **Precedent (B checked 13:3x):** `all-lane-clipboard.test.tsx` l.14–20 mocks only `Link` and renders `StudioWorkspace` under `ArrangementProvider` alone; no file in `app/components/arrangement/` or `ArrangementContext.tsx` uses a root-provided hook (`useToast`/`useAuth`/`useCart`/`useAnalytics`: grep 0), so no other wrapper is needed;
  - spy on `console.error`, and restore it afterwards;
  - `renderToString` (from `react-dom/server`) the **default export of `app/routes/studio-lab.tsx`**.

| ID | Case | Expected | On the snapshots |
|---|---|---|---|
| SSR1 | `renderToString(<StudioLabRoute />)` | 0 `console.error` calls whose formatted text contains `useLayoutEffect does nothing on the server` | **red**: 7 |
| SSR2 | same render | the HTML contains `data-testid="arrangement-ruler"` and `data-testid="arrangement-detail-panel"` (B confirmed both in the live dev SSR of `/studio-lab` at 13:24) | green (must-not pin: the render is real, not empty) |
| SSR3 | `typeof window` inside the test | `'undefined'` (guards against someone dropping the pragma) | green |

**(2) New `app/hooks/__tests__/useIsomorphicLayoutEffect.test.ts` (jsdom, the default):**

| ID | Case | Expected | On the snapshots |
|---|---|---|---|
| ISO1 | import the hook | `useIsomorphicLayoutEffect === useLayoutEffect` (from `react`) | red (module missing) |
| ISO2 | timing: a test component whose `useIsomorphicLayoutEffect` callback records whether a sibling `useEffect` has run yet | the layout callback runs before the passive one | red (module missing) |

**Red/green runs:**
- Write the tests first.
- Run SSR1–SSR3 against the **snapshot** sources: the untouched working copy before your first edit, or a scratch copy outside `store/`. SSR1 must be red with **7** matching calls, and SSR2/SSR3 green → `a-round-45/red-run.txt`. Report the failure text and the 7 frames (component names from the component stack).
- ISO1/ISO2 are red because the module is missing; report that.
- Then the green run → `a-round-45/green-run.txt`.

**A's own mutations** (scratch copy outside `store/`) → `a-round-45/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | the hook is always `useLayoutEffect` | SSR1 (7) |
| (b) | the hook is always `useEffect` | ISO1 and ISO2 |
| (c) | one site, e.g. DetailPanel l.629, reverted to bare `useLayoutEffect` | SSR1 (exactly 1) |
| (d) | the inverted condition (`typeof window !== 'undefined' ? useEffect : useLayoutEffect`) | SSR1 and ISO1 |
| (e) | the pragma removed | SSR3 (and SSR1) |

If a mutation survives, strengthen the test (never the code) and report it.

**Test rules:**
- no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards only), no comments other than the granted pragma;
- exact strings come from the rendered output, the source or exported constants;
- no snapshot tests; no fake timers.

**LIB-SEP-REASON has no unit test.** No test can pin a suppression comment. Acceptance is static (§4.1).

### 2.4 After the code

- **Self-check:** run the frozen suites of §4.6 and the full `npx vitest run` (1351 plus your new `it` count).
- **Biome:**
  - `npx biome check --write` **only** on the files you own;
  - then a read-only `npx biome check ./app`: exactly the 2 baseline CRLF errors, ≤ 218 warnings, and **no** new `useSemanticElements` diagnostic (the suppression must still match).
- **Review:** run the `code-reviewer` agent on the diff. Report its findings and your dispositions.
- **Browser smoke** (A; one run; a fresh state file under `a-round-45/`; not a PASS claim):
  - load `/studio-lab` at 1440×900;
  - the console has no React or hydration warning;
  - the detail panel opens on a clip and shows the start/end text;
  - zoom in → zoom-back restores the scroll.
- **Dev-server warning count** (A, read-only):
  - `grep -c "useLayoutEffect does nothing on the server" ../tmp/studio-real-loop/r42-vite.err.log`;
  - one `curl -s -o /dev/null http://127.0.0.1:5173/studio-lab`, wait 3 s, count again;
  - report the Δ (expected 0).

  If the file does not grow on a request at all (root changed the log), report "not measurable" and do not search for other logs.
- **Mutations:** only in a scratch copy outside `store/`. Remove a `node_modules` directory junction with `cmd /c rmdir` only (never `rm -rf`).
- **`/check`:** `npm run verify`. Do not run `npm run test:e2e:smoke`; it starts its own dev server.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch

Starting point (a) or (b) of the Baseline section, with the 3 round-44 paths at C's shas. Do not stage, commit, revert or edit those 3 paths, except the one §0.1 site at l.475 in `ArrangementContext.tsx` plus its import line.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/hooks/useIsomorphicLayoutEffect.ts` | A | new (§0.1) |
| `app/contexts/ArrangementContext.tsx` | A | the l.475 site and the import of the new hook only |
| `app/components/arrangement/StudioWorkspace.tsx` | A | the l.669 site and the import lines only |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | the 5 sites and the import lines only |
| `app/components/arrangement/ArrangementLibrary.tsx` | A | the `biome-ignore` reason text only (§0.2) |
| `app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx` | A | new (§2.3; the one pragma line) |
| `app/hooks/__tests__/useIsomorphicLayoutEffect.test.ts` | A | new (§2.3) |
| `docs/implementation/2026/quarter-IV/015-…`, `034-…`, `035-…`, `036-…` | A | the §0.3 notes only |
| `docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md` | A | new (§2.2) |
| `../tmp/studio-real-loop/a-round-45.md`, `a-round-45/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-45.md`, `c-round-45.json`, `c-round-45/` | C | report, runs, shots, gates |
| fresh browse state files and daemon logs in the own round folder | A / C | browse state |

- `a-round-44/`, `c-round-44/` and `b-round-44/` are read-only.
- **Expected `git status --short` at the end, starting point (b) (HEAD `ca85109`, the expected case):** the list below **without** the two round-44 `??` lines, and ` M app/contexts/ArrangementContext.tsx` is then only the l.475 site + import.
- The same list at starting point (a):
  - ` M app/components/arrangement/ArrangementDetailPanel.tsx`
  - ` M app/components/arrangement/ArrangementLibrary.tsx`
  - ` M app/components/arrangement/StudioWorkspace.tsx`
  - ` M app/contexts/ArrangementContext.tsx` (round 44 + the l.475 site)
  - ` M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md`
  - ` M docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md`
  - ` M docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md`
  - ` M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`
  - `?? app/hooks/__tests__/useIsomorphicLayoutEffect.test.ts`
  - `?? app/hooks/useIsomorphicLayoutEffect.ts`
  - `?? app/lib/arrangement/__tests__/context-hygiene.test.tsx` (round 44, unchanged)
  - `?? app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx`
  - `?? docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md` (round 44, unchanged)
  - `?? docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md`

  At (b), the two round-44 `??` lines are absent. If root changes something meanwhile, record it as foreign and do not touch it.

### 3.3 Frozen this round

- All **386** files in `b-round-44-tree-sha256.txt`, and everything else under `store/`.
- This includes:
  - `app/hooks/index.ts`, `ArrangementExportDialog.tsx`, `model.ts`, `ArrangementLane.tsx`, `ArrangementMaster.tsx`, `useRelativeFaderDrag.ts`, `vitest.config.ts`;
  - every existing test;
  - docs 001–041, apart from the §0.3 notes.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (`studio-lab.tsx` is **read and imported** by the test, not edited);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright and vitest configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs (`react-dom/server` is already part of `react-dom`);
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting earlier work;
- in-place mutation of `store/` files for experiments;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:**
- 1440×900 (and 1280×720 for R45-REG-DP); fresh load (`viewport`, then `goto`, then the setup chain).
- **Layout L45** = L44: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4; Master at 0 dB.

**Harness rules:**
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC** (label it): `PointerEvent` dispatch with an explicit `pointerId` (C uses **41**), `dblclick` dispatch, `.blur()`, `.focus()`, a native value setter + `input`/`change`.
- C may read state through the existing `window.__c` reader and the DOM. Label it. No source instrumentation.
- Mutations run only in a scratch copy outside `store/`.
- Every run and gate records `node.exe`.

**Checkpoint order if the session may end:** G45-2 → R45-S → R45-U → R45-SSR → R45-REG → the rest. Write `c-round-45/checkpoint.md` as you go.

### 4.1 R45-S — static (read-only)

- **Source diffs:** `diff -u` each opened source file against its `b-round-44-snapshots/` copy:
  - each of the 7 sites changes **only** the identifier `useLayoutEffect` → `useIsomorphicLayoutEffect`;
  - the bodies and dependency arrays are byte-identical;
  - the import lines change as needed;
  - **`usePositionWriterEffect` and its 3 call sites are unchanged.**
- **The hook file:** one export; it imports `useEffect` and `useLayoutEffect` from `react`; the expression is `typeof window === 'undefined' ? useEffect : useLayoutEffect`.
- **The library line:** `ArrangementLibrary.tsx` differs from its snapshot on **one line only**, the `biome-ignore` line:
  - same rule `lint/a11y/useSemanticElements`;
  - the reason names no process, task, role, round or section sign (`B`, `task`, `§`, `round`);
  - the separator element and its attributes are byte-identical.
- **Greps:**
  - `grep -rn "useLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx` → **0**;
  - `grep -rn "useIsomorphicLayoutEffect(" …` → 7 call sites.
- **Lists:**
  - 386 OK;
  - the 3 round-44 paths are at C's shas, except `ArrangementContext.tsx`, whose diff against the `623f381e` snapshot is only the l.475 site and the import.
- **Banned content:** no `any`, `@ts-ignore`, type assertion, `//` comment (other than the one pragma line and the reworded `biome-ignore`), hardcoded colour or extra export in the diff or the new tests.

### 4.2 R45-U — unit tests and mutations

- The new tests are green.
- A's red run matches §2.3: SSR1 red with **7** matches whose frames are the 7 of the table; SSR2/SSR3 green; ISO red because the module is missing. Otherwise A explains each difference with the failure text.
- The frozen suites of §4.6 are green.

**C's mutations** (scratch copy outside `store/`; each must make a test fail):

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | the snapshot source files (all four) | SSR1 (7) |
| (b) | the hook is always `useLayoutEffect` | SSR1 |
| (c) | the hook is always `useEffect` | ISO1/ISO2 |
| (d) | one DetailPanel site reverted | SSR1 (exactly 1) |
| (e) | the pragma removed | SSR3 |
| (f) | the `StudioWorkspace` site reverted | SSR1 (exactly 1; the frame is `StudioWorkspace`) |

### 4.3 R45-SSR — real dev-server SSR (read-only)

- **Find the log.** Root's dev server writes stderr to `../tmp/studio-real-loop/r42-vite.err.log` (B: 336 → 343 for one request at 13:05). Confirm it is the live log: its size grows on a request.
- **Measure:**
  1. Count `useLayoutEffect does nothing on the server` → `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab` (200) → `sleep 3` → count again.
  2. Repeat **3×**.
  3. **Expected:** Δ = **0** each time.
  4. Then do the same for `/` (the homepage) once, as a control. Record the Δ and its frames. Non-Studio warnings are recorded for B and are not a FAIL of this round.
- **If the log does not grow at all on any request** (no stderr capture), record R45-SSR as **not run (not measurable)**. R45-U SSR1 then stands alone. Do not restart the server.
- **Also:** `curl -s http://127.0.0.1:5173/studio-lab | wc -c`, and the NUL count and offsets (the C-R23-01 record). The size and offsets may stay the same, because only effect identifiers changed; record them either way.

### 4.4 R45-REG — neighbouring behaviour (REAL where possible)

| ID | Steps | Expected |
|---|---|---|
| REG-HYD | fresh load of `/studio-lab` at 1440×900; read the console | no hydration-mismatch error and no React warning (the known root `GET /api/cart` refusal is allowed and recorded) |
| REG-DP | REAL click on the music clip → detail panel; read the start/end inputs; REAL click on the SFX clip; then a range selection on music 8–10 s (label it) | the start/end text follows the clip (7 / 23 → 4 / …) and then the range (8.000 / 10.000) without a stale value; Clip Gain text shows the selected clip's value (0.0 dB) |
| REG-DP-START | fresh load at **1280×720** and at 1440×900 | the panel's start-open decision equals round 41/44 at each size (record open/closed and height; compare with `c-round-41.md` R41-RV / the round-44 shots) |
| REG-DP-RESIZE | SYNTHETIC drag of the detail separator (pointerId 41) up and back | the height follows and stays within the cap; no console error |
| REG-CG | Clip Gain on the SFX clip: REAL type `3` + REAL Enter → `+3.0 dB`, one `Clip Gain` entry; REAL Ctrl+Z → 0.0 dB | the text follows each change (l.268 site) |
| REG-ZOOM | REAL zoom-in twice (the existing control or key used in earlier rounds) → scroll to around 10 s → REAL zoom-back | `scrollLeft` returns to the value before the zoom-in (±1 px; the l.669 site) |
| REG-REFUSAL | note the status S0 → SYNTHETIC fader drag on music Volume (pointerId 41, not released) → REAL Ctrl+Z (refused during a gesture) → SYNTHETIC `pointerup` (41) | while held: the status is the undo-refusal text (`GESTURE_UNDO_BLOCKED_MESSAGE`, read from the DOM) and nothing is undone; after the release the status is no longer the refusal text but the last non-refusal status (S0, or the fader's own status if the drag wrote one); the release path is `ArrangementContext.tsx` l.1318–1323, fed by the l.475 site. If Ctrl+Z is not refused with this focus, use the refusal path C used in rounds 39–41 and label it |
| REG-LIB | REAL focus on the library separator → REAL ArrowLeft/ArrowRight; SYNTHETIC pointer drag | the width changes; `aria-valuenow` follows; unchanged from earlier rounds |
| REG-PLAY | REAL Space → about 3 s → REAL Space | the playhead and the Master meter move and stop (`usePositionWriterEffect` untouched; a smoke only) |

### 4.5 R45-Doc

- **Doc 042** exists, follows `TEMPLATE.md`, is in Georgian and matches the code (the shared hook; `usePositionWriterEffect` untouched; why the pragma). It has the §4.7 table.
- **The five §0.3 notes** say what the table says, cite their evidence, and change no other line. C diffs each doc against its snapshot.
- In doc 035, the quoted status string equals the live status after REG-CG's Enter (or the `სრული მიქსი` variant, read live).

### 4.6 Gates and frozen suites

**G45-1:**
- tsc 0;
- vitest = 1351 + the new `it` count, 0 failures (record `node.exe`; re-run a timed-out file alone and report both runs);
- the build passes;
- Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218, plus 1 info.

**G45-2:**
- protected 4/4 OK;
- 386 OK;
- `git status --short` = §3.2;
- HEAD at the start and at the end.

**G45-3:** anonymous `/studio-lab`, opened directly and via the header link, in a **fresh** browse state:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
- media is only the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

**Known and allowed:** the root `CartContext` `GET /api/cart`; the root GA consent-denied events; GTM; the dev-module requests; the homepage hero image from `images.unsplash.com`; Google Fonts.

**Frozen suites** (A self-check, C G45-1):
- the two new files;
- `context-hygiene`, `render-budget`, `ArrangementContext.test.ts`, `pending-status`, `gesture-guard`, `clip-gain`, `master-ui`, `fader-guards`;
- every `detail-panel*` suite and every navigation/zoom suite under `app/lib/arrangement/__tests__/`: list them with `ls` and run them all;
- every library suite (`ls app/lib/arrangement/__tests__ | grep -i librar`);
- `export-dialog-focus`.

**Not re-run this round** (not PASS):
- exports and WAV integrity;
- video sync and C-R27-01;
- the full find sound → add → fit video → export flow;
- the FB-01..FB-16 stage regression.

### 4.7 Ableton source and compliance (workflow addendum 2026-10-11)

No Live behaviour is involved. There is no new browsing and no video.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Server rendering does not select layout effects | none | **Not applicable** (React SSR in CZABA's web stack; never presented as Live behaviour) | D-29z10 §0.1 | R45-U, R45-SSR, R45-REG |
| A lint suppression gives a technical reason | none | **Not applicable** (developer hygiene) | D-29z10 §0.2 | R45-S |
| Docs describe the shipped Delete/gap, Cut Time, Clip Gain and Pan behaviour accurately | none new (the behaviours' own sources are in docs 015/034/035/036 and `delete-selection-update.md`) | **Not applicable** for the notes themselves; the documented behaviours keep their earlier verdicts | D-29z10 §0.3 | R45-Doc |

C gives two verdicts per row. Never write "Ableton does it this way" for a not-applicable row.

### 4.8 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- **C-R41-01** (Low, 1024×768, TL-Q-VIEWPORT; not re-run);
- C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
- C-R23-01 + C-R38-01 (Tech Lead). Record the NUL count and offsets and the hydrated U+FFFD `aria-label`s. Round 44: 64 312 bytes; **3 NUL** at 11729, 28025, 28026; **1** U+FFFD label (library collapse).

**Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66 (watch: the Master meter width), A-R43-REVIEW-ROOTFONT. **To the Tech Lead:** A-R33-REVIEW-TOUCH (with R38-T).

**Open Low items:**
- EXPORT-DIALOG-FOCUS-RESTORE (round 46);
- R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY;
- DETAIL-RESET-SHRINK (info); ESC-DESELECT-NOTE (record).

**Root items** (`root-pre-push-review.md` 2026-10-07: M1–M3, L1–L4 and L6–L8 **closed**, L5 accepted, nothing else open from it; `publication-checkpoint.json`):
- ROOT-ROUND44-CHECKPOINT: the round-44 paths are C PASS and uncommitted. Round 45 becomes checkpoint-ready only after C PASS.
- GSTACK-ACL; the ignored `.kilo/`; `npm run test:e2e:smoke` (root only); SRW-21 (the purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths.
- The export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap.
- GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset.
- Dev-server availability; ENV-BROWSE-DAEMON (not reproduced in round 44); machine load.

**Tech Lead manual checks:** R23-1 (including the detail scroller), R23-2; R38-T (with A-R38-REVIEW-TOUCH and A-R33-REVIEW-TOUCH); R35-T, R30-T, R31-T, R33-T, R34-T; TL-Q-FB05-FB11, TL-Q-VIEWPORT.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-44-tree-sha256.txt | grep -vc ': OK$'
for f in app/contexts/ArrangementContext.tsx app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementDetailPanel.tsx app/components/arrangement/ArrangementLibrary.tsx; do sha256sum "$f"; done
grep -rn "useLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx
grep -rn "useIsomorphicLayoutEffect(" app/components/arrangement app/contexts/ArrangementContext.tsx
npx vitest run app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx app/hooks/__tests__/useIsomorphicLayoutEffect.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-44-snapshots/ArrangementLibrary.tsx app/components/arrangement/ArrangementLibrary.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
grep -c "useLayoutEffect does nothing on the server" ../tmp/studio-real-loop/r42-vite.err.log
tasklist | grep -ci node.exe
```

(`diff -u` the three other source files and the four docs against their snapshots in the same way.)

- If a test path above does not exist, report it and run the rest.
- Do not create test files other than the two named in §2.3.
- C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- If it is down, say so and do the offline items (G45-1/2, R45-S, R45-U, R45-Doc).
- Use gstack `/browse` with a fresh state file under `c-round-45/` (fallback per the header).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-45.md`:**
1. the pre-flight gate, including the §1.4 re-checks and the starting point (a)/(b);
2. the red run (per case, with the 7 frames), A's mutations (a)–(e), and the green run;
3. the diff summary;
4. the smoke result and the dev-server Δ;
5. the code-reviewer findings and your dispositions;
6. the verbatim command tails, including `node.exe`;
7. the deviations and the §2.4 self-check results;
8. any non-Studio `useLayoutEffect` site you found (for B; unchanged).

Do not claim PASS. If you hit a stop condition, stop and report. Do not widen or narrow the change to avoid it.

**C → `c-round-45.md` and `c-round-45.json`** (the usual schema). For each ID: PASS, FAIL (with a bug ID) or **not run** (with the reason). Include:
- the R45-S diff verdicts;
- the R45-U mutation table;
- R45-SSR with the counts;
- R45-REG with labelled REAL/SYNTHETIC steps;
- R45-Doc per note;
- the Ableton two-verdict table (§4.7);
- the gates, the C-R23-01/C-R38-01 record and the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 46 — EXPORT-DIALOG-FOCUS-RESTORE (alone):**
  - capture the opener in the layout phase, using the new `useIsomorphicLayoutEffect`;
  - a red-first jsdom test: a later sibling layout effect moves focus before the passive effects run; on close, focus must return to the real opener;
  - `exportDialogFocusableElements` skips elements inside `[hidden]`;
  - the 19-case `export-dialog-focus` suite stays green.
- **Round 47 — SRW-14 stage 1 (FB-13):**
  - the grid model (`grid.ts`, a seconds grid without tempo);
  - Snap on/off with a visible state and a shortcut;
  - divisions;
  - applied to clip move first.

  Later stages: trim, range, playhead, paste and clip-edge snap. Then SRW-15 (bars/beats, project BPM as a grid only, a metronome that is not exported). B prepares the Ableton source table (Live 12 manual, grid/snap section) with gstack `/browse` when it writes that task.
- **TL-Q-VIEWPORT / C-R41-01:** if the Tech Lead puts widths below 1280 in scope, it is scheduled next (candidate in `b-round-41.md` §4).
- **C-R23-01 / C-R38-01:** as soon as the Tech Lead answers.
- **C-R27-01:** when the quiet-Chrome result arrives.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 45 -StartPhase A` and a higher limit.
