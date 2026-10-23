# CURRENT TASK — Round 96: Lows batch part 3b — refusal text for a failed library source (C-R95-N1) + doc 083 status line (GATE95-S1)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-95.md` (exact copy, sha256 `cbd38d1a…`). Rationale: `b-round-95.md`. Decision record: D-29z61 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one Low that C saw in the browser, plus one doc status line. One owner (A).
  1. **C-R95-N1-FAILED-SOURCE-ADD-TEXT:** C round 95 aborted `/middle-east.mp3`. The library row then correctly shows `შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)`, but pressing Enter on that row sets the status to `„Middle East — საჯარო preview“ ჯერ არ ჩატვირთულა.` ("not loaded yet"). That wording suggests the file is still loading and will arrive if the user waits. It never will. The same text is used by the preview refusal (`ArrangementContext.tsx` l.1201) and the add refusal (l.1314).
  2. **GATE95-S1-DOC083-STATUS:** doc 083 l.4 still says the round is waiting for C. C round 95 passed and gate 95 published it.

## Why this round
- **C round 95: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 95: published**, commit `e3e528821292705a8298e4fcc2f90986375496e4` on both remotes (reviewer 9/10, no Critical or High).
- C's only new finding is C-R95-N1 (Low, browser-reachable). C findings come first.
- `regression-last.json` is 2026-10-21 and today is 2026-10-23 (2 days), so the regression round is not due yet. **The first round planned on or after 2026-10-24 is the regression round.**

## Baseline (measured by B, 2026-10-23)
- **HEAD `e3e528821292705a8298e4fcc2f90986375496e4`** (gate 95 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-95-r96-tree-sha256.txt`, **524** entries, **524/524 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the two owned existing files (`app/contexts/ArrangementContext.tsx`, doc 083).
  - Frozen and relevant here:
    - `ArrangementLibrary.tsx` (`a2b6f78d`), `ArrangementLibraryPreview.tsx` (`c6efc0ef`), `ArrangementLane.tsx` (`00632dcd`), `app/data/studio-lab-demo.ts` (`0d53059f`);
    - `collection-load-status.test.tsx` (`215e6113`), `grid-snap-loop-drop.test.tsx` (`fe3e8702`) and every other `__tests__` file. **No existing test file is granted.**
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-95-r96-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-95-r96-snapshots/` (`SHA256SUMS.txt`). Both are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/contexts/ArrangementContext.tsx` | `c98fc743` | 3385 | owned (E1 only; see §1) |
  | `docs/implementation/2026/quarter-IV/083-studio-lab-demo-loader-error-text.md` | `923dc48b` | 78 | owned (l.4 only) |

- **Protected (frozen, never edited):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`)
  - `app/routes/api.studio-token.ts` (`13914809`)
  - `app/contexts/StudioContext.tsx` (`caa388e7`)
  - `app/utils/ffmpeg.ts` (`0995ae78`)
  - `app/components/ui/Modal.tsx` (`741c2341`)
  - `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`)
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs and fail-before in a scratch copy (`a-round-96/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-95/` scratch scripts as a model; do not edit A round 95 files.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

### E1 — refusal text for a failed source (`app/contexts/ArrangementContext.tsx`, two blocks only)
Allowed hunks:
- (a) the `startLibraryPreview` refusal block, baseline l.1199–1203;
- (b) the `addSourceToActiveTrack` refusal block, baseline l.1312–1316;
- (c) optionally, one new module-level `const` or non-exported function for the text, placed with the other module-level message constants (baseline l.158–186). Nothing else in this file changes. The load effect (l.3000–3051) in particular stays as it is.

Behaviour:
1. If the source exists and `sourceStates[source.id]?.status === 'error'`, the status is exactly `„${source.title}“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. Use the same `„“` quotes and the same em dash (U+2014) as the existing texts.
2. If the source exists and is still loading (the state is missing or `status === 'loading'`, or the preview path has no buffer yet), the status stays exactly `„${source.title}“ ჯერ არ ჩატვირთულა.`. This is unchanged.
3. An unknown id or no selection keeps `ჯერ ბიბლიოთეკაში აირჩიე ხმა.`. This is unchanged.
4. Preview path: `stopLibraryPreview()` is still called before the status is set, exactly as now, so an earlier preview stops.
5. No clip is added and the history does not change. No loader error text, URL or stack is copied into the status; the row already shows the detail.

**What must not change:**
- `dropLibrarySource` (l.1379, `ეს ხმა ჯერ არ ჩატვირთულა — დაელოდე და სცადე თავიდან.`) and the drop-ghost label in `ArrangementLane.tsx` (frozen). Their tests in `grid-snap-loop-drop.test.tsx` l.541/547 must stay green.
- The ready path of preview and add, `refuseEditDuringGesture`, and `AUDIO_ON_VIDEO_LANE_MESSAGE`.
- `useArrangement()` keeps the same shape: no new field and no new export.

**Why this is the smallest honest choice (B decision):** the status must not promise that a failed file will still arrive. The new text names the source and reuses the vocabulary of the collection `failed` status the user has already seen (`… ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`). A retry button would be a new feature, so it is not added. The drop and ghost texts are left alone for two reasons. An error row is `draggable=false` (C round 95), so a real user cannot reach them on a failed source. They also guard the race in which a drag starts before loading finishes.

### New test — `app/lib/arrangement/__tests__/failed-source-refusal.test.tsx`
Mount `ArrangementProvider` with your own `WorkspaceCollection`, the same way `collection-load-status.test.tsx` does. Copy what you need; never import from a test file. The collection has three sources:
- `ok` resolves to a buffer;
- `bad` has a `loadSource` that rejects with `new Error('ფაილი ვერ ჩაიტვირთა (ქსელი)')`;
- `slow` stays pending until the test settles it.

Read the state through `useArrangement()`. Assert exact strings with `toBe`. Use no type assertions, including `as const`. Restore all stubs in `afterEach`.

- **FS1 add on failed:** after `bad` reaches `error`, `addSourceToActiveTrack('bad')` sets the status to exactly `„<bad title>“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. The total clip count does not change, and the status does not contain `(ქსელი)`.
- **FS2 add via selection:** `selectSource('bad')` followed by `addSourceToActiveTrack()` with no argument gives the same text.
- **FS3 add while loading:** while `slow` is pending, `addSourceToActiveTrack('slow')` gives exactly `„<slow title>“ ჯერ არ ჩატვირთულა.` (unchanged).
- **FS4 preview on failed:** start a preview of `ok`; `libraryPreviewSourceId` is `'ok'`. Harness model: `app/lib/arrangement/__tests__/library-preview.test.tsx` (frozen) already starts a real preview in jsdom, and its toggle shows `■ შეჩერება`. Copy its fake AudioContext and clock setup; do not import it. If the preview cannot be started, stop and report; do not weaken FS4. Then call `startLibraryPreview('bad', 0)`: `libraryPreviewSourceId` becomes `null` and the status is exactly the failed text for `bad`.
- **FS5 preview while loading:** `startLibraryPreview('slow', 0)` gives the unchanged loading text.
- **FS6 unknown id:** `addSourceToActiveTrack('nope')` gives exactly `ჯერ ბიბლიოთეკაში აირჩიე ხმა.`.
- **FS7 ready add:** `addSourceToActiveTrack('ok')` adds exactly one clip. The status is neither the failed text nor the loading text.
- **FS8 late failure:** `slow` first refuses with the loading text. The test then rejects it with an error, and the next `addSourceToActiveTrack('slow')` gives the failed text. This proves the text follows the current state, not a cached one.

**Fail-before:** in scratch, run the new file against the baseline snapshot of `ArrangementContext.tsx`. B expects **FS1, FS2, FS4 and FS8 red**. FS3, FS5, FS6 and FS7 lock existing behaviour and pass on both versions. Report the exact list and explain any difference.

**Mutations (scratch only; each must turn at least one named test red):**
- a: remove the error branch in the add block → FS1/FS2/FS8
- b: remove the error branch in the preview block → FS4
- c: invert the branch so that loading gets the failed text → FS3/FS5
- d: drop the `stopLibraryPreview()` call before the failed-text status in the preview block → FS4 (`libraryPreviewSourceId` stays `'ok'`)
- e: change one character of the failed text → FS1
- f: append `state.error` to the status → FS1 (`(ქსელი)` must not appear)

Record the red tests for each mutation and an unmutated control run.

### Docs
- **Doc 083 l.4:** `**სტატუსი:** C PASS (Round 95), გამოქვეყნდა e3e5288 (D-29z60)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/084-studio-failed-source-refusal-text.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z61). Record why the drop and ghost texts were not changed.
- `docs/technical/arrangement-workspace.md` is **not** owned this round (frozen).

## 2. Checks A runs (speed rules)
- `npm run typecheck`, `npm run lint`
- `npx vitest run app/lib/arrangement/__tests__/failed-source-refusal.test.tsx app/lib/arrangement/__tests__/collection-load-status.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx app/lib/arrangement/__tests__/library-preview.test.tsx`. Add any other existing test file that greps for `ჯერ არ ჩატვირთულა`, `addSourceToActiveTrack` or `startLibraryPreview` (`grep -rl` under `app/`). Write the final list to `a-round-96/targeted-list.txt`.
- Read-only Biome on the two code files (`npx biome check <files>`).
- **code-reviewer** is required (4 changed or new files). Hand its Architecture note to B verbatim.
- No full suite and no `npm run verify`: those belong to the gate.
- **Expected end state:** `git status --short` shows exactly **2 M** (`app/contexts/ArrangementContext.tsx`, doc 083) and **2 ??** (the new test file and doc 084). The frozen list stays 524/524. Write `a-round-96/end-hashes.txt` with the 4 files.

## 3. What C verifies (browser first, Playwright Chromium, fresh incognito context, no credentials)
Every row runs at **1280×720 and 1440×900** unless noted. Record the exact texts.
- `F(t)` = `„t“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`
- `ME` = `Middle East — საჯარო preview`
- `HERO` = `CZABA hero — საჯარო preview`

| ID | Action | PASS evidence |
|---|---|---|
| **FAIL-ADD** (primary) | `page.route('**/middle-east.mp3', r => r.abort())`, load `/studio-lab`, wait for `failed(1)`, click the ME row, press Enter | The status is exactly `F(ME)`. The clip count is 0 before and 0 after. `ჯერ არ ჩატვირთულა` does not appear in the status. The row still shows `შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)`. Screenshot. |
| **FAIL-PREVIEW** (primary) | Same abort. Select a ready synthetic row and start its preview (`arrangement-library-preview-toggle`); confirm `▶ ისმის`. Then use ArrowUp/ArrowDown or a click until the ME row is selected. | The preview stops: no row shows `▶ ისმის`, and the preview toggle is disabled for ME. The status is exactly `F(ME)`. Optional: a meter or analyser reading shows that the preview sound stopped. |
| **FAIL-DBL** (1280 only) | Same abort. Double-click the ME row. | The status is exactly `F(ME)`. The clip count is unchanged. |
| **FAIL-BOTH** (1440 only) | Abort both demo URLs. Press Enter on each failed row. | ME gives `F(ME)` and the hero row gives `F(HERO)`. The `failed(2)` status still appears first, as before. |
| **LOADING-REG** | Hold `/middle-east.mp3` pending (a route that delays its fulfil by at least 5 s). Press Enter on the row while it shows `იტვირთება…`. Then let the request complete. | While it is loading, the status is exactly `„ME“ ჯერ არ ჩატვირთულა.` (unchanged). After the load completes, Enter adds one clip. |
| **READY-REG** | Normal load. Press Enter on ME. Preview a synthetic row. | ME adds 1 clip on `music`, and the preview shows `▶ ისმის`. Ready behaviour is unchanged. |
| **DEMO-LOAD-REG** | Normal load | The status reaches exactly the demo `ready` text. All 9 rows show durations. Each demo URL is requested exactly once. |
| **PX-NET** | all sessions | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G96-3** | anonymous | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows sign-in and no workspace. `/api/studio-token` returns 401. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`. |
| **AN-REVIEW** | review A's tests | The fail-before list matches §1, or the difference is explained. C re-runs mutations a, b and d in its own scratch and gets the same red tests. Assertions are exact `toBe`, and the new file has no `as`. |
| **T96-TARGETED** | `npx vitest run $(cat a-round-96/targeted-list.txt)` | All pass. Record the files and test counts. |
| **SOURCE-UNCHANGED** | start and end | HEAD `e3e5288`; 2 M + 2 ??; frozen 524/524; A's end hashes match. The `git diff -U0` hunks in `ArrangementContext.tsx` lie only inside baseline l.1199–1203, l.1312–1316 and at most one module-level constant block in l.158–186. Doc 083 changes only at l.4. |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- the ready add and preview paths;
- the loading refusal text, which must stay the old text;
- the preview stopping when the selection moves to a row that is not ready;
- the drop refusal text and the ghost label, which are untouched and covered by `grid-snap-loop-drop.test.tsx`;
- clip count and history: a refusal never adds a clip or an Undo entry.

## 4. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Refusal text when a failed library file is added | none | — | CZABA's own web loader status text. Live's browser has no comparable network-loaded file that fails to fetch. | არ ეხება |

No Ableton claim is made.

## 5. Report (A)
Write `a-round-96.md` and `a-round-96-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
