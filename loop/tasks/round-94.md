# CURRENT TASK — Round 94: Lows batch part 2 — collection load status (empty collection, swap reset) + purchased MP3 names test (D-29z59)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-93.md` (exact copy, sha256 `71eaa863…`). Rationale: `b-round-93.md`. Decision record: D-29z59 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** three tightly related Lows in one load path (the `ArrangementProvider` collection load effect and the copy it reads), one owner (A):
  1. **COLLECTION-EMPTY-STATUS:** with `collection.sources.length === 0`, `settle` never runs, so the status stays on `…იტვირთება…` forever.
  2. **GATE92-S1-STATUS-NOT-RESET-ON-SWAP:** when the `collection` prop changes, the effect resets the source states but not the status, so the old `…მზადაა` text stays until the new load settles.
  3. **GATE92-S2-PURCHASED-MP3-NAMES-TEST** (test gap): the purchased MP3 file names (`czaba-studio.mp3`, `czaba-studio-range.mp3`) are only covered by code reading.
  Plus doc 081 l.4 (gate 93 suggestion 1), one line in `docs/technical/arrangement-workspace.md`, and one new implementation doc.

## Why this round
- **C round 93: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 93: published**, commit `85fcb059b8d35ce854559610178b42c5894e1f69` on both remotes (reviewer 9/10, no Critical/High/Medium). GATE91-S1, A-R86-L7 and A-R86-L8 are closed.
- **C has no open bug.** `regression-last.json` = 2026-10-21; today is 2026-10-23, so the regression round is not due yet (due on or after 2026-10-24). **Round 95 is the regression round** if it is planned on or after 2026-10-24.
- The SRW-21 route mount is still blocked by the auth owner. These two load-effect bugs are exactly what the future purchased mount will hit (a token refresh can create a new collection object). They are fixed now, before the mount, on the demo-safe path.

## Baseline (measured by B, 2026-10-23)
- **HEAD `85fcb059b8d35ce854559610178b42c5894e1f69`** (gate 93 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-93-r94-tree-sha256.txt`, **518** entries, **518/518 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the four owned existing files below.
  - It includes `purchased-collection-ui.test.tsx`, `export-mp3.test.tsx`, every `export-*` test and every other `__tests__` file. **Only `collection.test.ts` PC9 is granted** (see §1).
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-93-r94-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-93-r94-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/contexts/ArrangementContext.tsx` | `140f17ec` | 3380 | owned (L1 only: the load effect l.3000–3016) |
  | `app/lib/arrangement/collection.ts` | `210cfdc0` | 118 | owned (L2 only: the copy interface and the two copy objects, l.4–29) |
  | `app/lib/arrangement/__tests__/collection.test.ts` | `456335d4` | 393 | owned (PC9 l.371–392 only: add the `empty` key) |
  | `docs/implementation/2026/quarter-IV/081-studio-lab-export-dialog-names-and-notes.md` | `944c6480` | 68 | owned (l.4 only) |
  | `docs/technical/arrangement-workspace.md` | `e6465055` | 45 | owned (l.44 only) |

- **Protected (frozen, never edited):** `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`), the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`). Also frozen this round: `app/data/studio-lab-demo.ts` (`69ac90f7`), `StudioWorkspace.tsx` (`1270f6c5`), `ArrangementExportDialog.tsx` (`0040e050`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-94/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

### L2 — one new copy field (`collection.ts` l.4–29 only)
Add `empty: string` to `WorkspaceCollectionCopy`, and these exact values:
- demo: `დემო კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.`
- purchased: `შეძენილ კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.`

Nothing else in `collection.ts` changes: not `workspaceCollectionCopy`, not the factory (it still throws on empty stems), not the adapter.

### L1 — the load effect (`ArrangementContext.tsx` l.3000–3016 only)
At the start of the effect (before the source loop):
1. `const copy = workspaceCollectionCopy(collection.origin);` (hoist the existing l.3014 line; `settle` uses the same `copy`).
2. If `collection.sources.length === 0`: `setStatus(copy.empty)` and return the existing cleanup (`() => controller.abort()`). No `loadSource` call.
3. Otherwise `setStatus(copy.loading)`, then the existing code unchanged.

**What must not change:**
- the `useState` initializer at l.533 (SSR and the first client render still show the loading text, so there is no hydration change);
- the effect deps `[collection, getDecodeContext, patchSourceState]` (B checked: both callbacks have `[]` deps, so the effect re-runs only when `collection` changes);
- the abort guards (`if (controller.signal.aborted) return;`) in `then`/`catch`, the per-source patches, peaks, buffers, the `ready` and `failed(n)` texts, file names, every other `setStatus`.

**Why this is safe on mount (B grep at `85fcb05`):** no effect declared before l.3000 calls `setStatus`, and the app does not use `StrictMode`. So on first mount the new `setStatus(copy.loading)` sets the value the state already has. A must re-check this grep and report it. If you find a mount-time status that the new line would overwrite, stop and report; do not work around it.

**Smallest honest choice for an empty collection (B decision):** a new `empty` text rather than `ready`. The `ready` text says "choose a lane and add sound", which is false when the library is empty. Neither `/studio-lab` nor the purchased factory can produce an empty collection today, so this is a guard for the contract, not a visible demo change.

### PC9 grant (`collection.test.ts` l.371–392 only)
Add `empty: '<exact text>'` to both `toStrictEqual` objects. Nothing else in that file changes.

### New test — `app/lib/arrangement/__tests__/collection-load-status.test.tsx`
Mount `ArrangementProvider` + `StudioWorkspace` (+ a probe) the way `purchased-collection-ui.test.tsx` does. Copy the stubs and the mount helper; never import from a test file. Use `view.rerender(...)` with a **new collection object** for swaps. For MP3, mock `~/lib/arrangement/mp3-encoder.client` the way `export-mp3.test.tsx` l.37–44 does. Exact strings only (`toBe` on the full status text).

- **LS1 empty demo:** a literal `WorkspaceCollection` with `origin: 'demo'`, `sources: []` and a `loadSource` spy. After mount + flush, the status is exactly the demo `empty` text, `loadSource` was never called, and no `console.error`.
- **LS2 empty purchased-origin:** the same with `origin: 'purchased'` (a literal object; the factory refuses empty stems) → exactly the purchased `empty` text.
- **LS3 swap resets status:** mount demo collection A (one source, resolves) → exactly demo `ready`. Rerender with purchased-origin collection B whose loads are deferred → after one `act` flush the status is exactly purchased `loading` (not demo `ready`), and B's library row shows its loading state. Resolve B → exactly purchased `ready`.
- **LS4 stale settle is ignored:** mount A with a deferred load. Rerender with B (deferred) before A resolves. A's `loadSource` signal is `aborted === true`. Resolve A late (success, and in a second sub-case a rejection) → the status is still exactly purchased `loading`, A's source state is not written. Then resolve B → purchased `ready`.
- **LS5 swap to empty and back:** A ready → rerender with an empty purchased-origin collection → exactly purchased `empty`. Rerender with a new non-empty demo collection → demo `loading`, then demo `ready`.
- **LS6 no spurious reset:** mount demo A → ready. Call `togglePlayback()` with no clips → status exactly `დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.`. Rerender with the **same** collection object and different children → the status is unchanged and `loadSource` call count is unchanged.
- **LS7 mount lock:** demo mount: the first render shows exactly demo `loading` (before any flush), then demo `ready`. One failing source among two → exactly `failed(1)` text (the existing contract is unchanged).
- **PM1 purchased MP3 names (GATE92-S2):** the PW5 setup (purchased collection, one clip on `drums`, `renderArrangementWav` mocked, encoder mocked to return an MP3 blob). `exportMp3()` → downloads `['czaba-studio.mp3']`; `exportMp3({ start: 1, end: 3 })` → `'czaba-studio-range.mp3'`; `exportMp3(undefined, { includeWav: true })` → `['czaba-studio.wav', 'czaba-studio.mp3']`. Each ends with `exportState.phase === 'done'`.

**Fail-before:** run the new file against the baseline `ArrangementContext.tsx` and `collection.ts` (snapshots, in scratch). Report exactly which tests are red. B expects LS1, LS2, LS3, LS5 red; LS4, LS6, LS7 and PM1 are preservation locks that pass on both.

**Mutation proofs** (scratch copy; each must turn at least one listed test red):

| ID | Mutation | Expected red |
|---|---|---|
| a | drop the `setStatus(copy.loading)` line | LS3 (and LS5's return to `loading`) |
| b | drop the empty branch (back to "loading forever") | LS1, LS2, LS5 |
| c | the empty branch sets `copy.ready` | LS1, LS2 |
| d | the empty branch uses the demo copy regardless of origin | LS2, LS5 |
| e | remove the `controller.signal.aborted` guard in `then` | LS4 |
| f | the MP3 `fileStem` at l.2907 hardcoded to `'czaba-studio-lab'` | PM1 |

### Docs
- `081-studio-lab-export-dialog-names-and-notes.md` **l.4 only** → `**სტატუსი:** C PASS (Round 93), გამოქვეყნდა 85fcb05 (D-29z58)`.
- `docs/technical/arrangement-workspace.md` **l.44 only** → one Georgian line: the empty collection shows the origin's `empty` text, and a collection change resets the status to the new origin's loading text (COLLECTION-EMPTY-STATUS and GATE92-S1 closed in round 94, pending C).
- New `docs/implementation/2026/quarter-IV/082-studio-workspace-collection-load-status.md`, written per `docs/implementation/TEMPLATE.md` (Georgian, every section). Status line: `**სტატუსი:** Round 94 — C-ის შემოწმებას ელოდება (D-29z59)`. It records the two status rules, why `empty` is not `ready`, that both are unit-only in the browser today (and why), the MP3 names test, and what remains in the Lows batch.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/contexts/ArrangementContext.tsx` | L1 only (l.3000–3016) |
| `app/lib/arrangement/collection.ts` | L2 only (l.4–29) |
| `app/lib/arrangement/__tests__/collection.test.ts` | PC9 l.371–392: add `empty` keys only |
| `app/lib/arrangement/__tests__/collection-load-status.test.tsx` | **new** (LS1–LS7, PM1) |
| `docs/implementation/2026/quarter-IV/081-studio-lab-export-dialog-names-and-notes.md` | l.4 only |
| `docs/technical/arrangement-workspace.md` | l.44 only |
| `docs/implementation/2026/quarter-IV/082-studio-workspace-collection-load-status.md` | **new** |

**Expected end state: 5 M + 2 ??**, and all 518 frozen entries unchanged.
- **If any frozen test turns red, stop and report; do not edit it.**

## 2. Pre-flight for A
- **Primitives:** `REACT_CONTEXT.md` (provider effect), `AUDIO_ARCHITECTURE.md` (load path), `AGENT_DISCOVERABLE_CODE.md` (new field), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. **Prompts:** `new-test.md`.
- **Verify the baseline before the first edit:** HEAD `85fcb05`; clean status; frozen 518/518; the five owned hashes; LF/CR.
- **Checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `npx biome check` on the owned code and test files (no `--write`). Save `npx biome lint <owned files>` to `a-round-94/biome-lint-owned.txt`.
  - **Targeted vitest:** the new file; `collection.test.ts`; `purchased-collection-ui.test.tsx`; `export-mp3.test.tsx`; and every `__tests__` file that asserts a collection status text (grep for `იტვირთება`, `მზადაა`, `ვერ ჩაიტვირთა — დეტალები` and `arrangement-status`) or rerenders `ArrangementProvider`. Write the list to `a-round-94/targeted-list.txt`. Do not run the full suite.
- **A's own smoke (not C evidence), 1440×900:** `/studio-lab` shows the demo loading text, then the demo ready text; one console capture with no hydration warning.
- **Code-reviewer: required** (7 changed files). Ask it to check effect ordering on mount, the stale-settle path after a swap, and SSR/hydration of the status. Pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-94*`. **B** owns the planning artifacts. **Root** owns gates, commits and pushes.
- **Protected (never edited):** see Baseline. Purchase protection and the studio-token flow are untouched. The purchased route is **not** mounted in this round.
- **`/studio-lab`** stays the public **demo-only** workspace: demo badge; no purchased audio; no token or R2 requests; user video stays local; unpkg only after an MP3 export click.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Collection load status text (empty, reset on collection change) | none (CZABA's own web collection loader; Live has no equivalent loading status for a purchased collection) | — | **არ ეხება** | DEMO-LOAD-REG, STATUS-PERSIST, AN-REVIEW |
| Export file names | none (CZABA naming) | — | **არ ეხება** | EXPORT-REG, AN-REVIEW |

## 5. C acceptance (real browser, Playwright Chromium 1.57, `/studio-lab` anonymous)

**Setup:** check `env-status.json` and that `:5173` returns 200. Do one warm-up load first (ENV-VITE-REOPTIMIZE-RELOAD: visit `/` alone, never in parallel with other sessions). Use a fresh incognito context per session, with the demo setup from rounds 90–93 (`c-round-93/tools/lib93.cjs`).

| ID | Viewport | Action | Pass evidence |
|---|---|---|---|
| DEMO-LOAD-REG (primary) | 1280 and 1440 | (a) Fetch the SSR HTML of `/studio-lab`. (b) Hold every demo audio request with route interception, then release. (c) Abort one demo audio file | (a) The `arrangement-status` text in the SSR HTML is exactly `დემო კოლექცია იტვირთება…`. (b) The status is exactly that text while held, then exactly the demo `ready` text after release. (c) Exactly `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. Same results as C round 92 DEMO-LOAD |
| STATUS-PERSIST | 1440 | After ready: do one user action that sets a known status (for example Ctrl+L with no range → `Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.`; record the exact text you get). Then wait 5 s, open and close Export, and resize 1440 → 1280 → 1440 | The status stays exactly that text through every step, and each demo audio URL was requested **exactly once** in the session (the load effect did not re-run) |
| EMPTY-SWAP-REACH | — | Try to reach an empty collection or a collection swap on `/studio-lab` | B expects **unreachable**: the route passes one fixed demo collection and the purchased mount is blocked. Write **unit-only (LS1–LS5)** with that reason. That is not a FAIL and not a PASS of the browser half |
| EXPORT-REG | 1280: WAV range 4–9; 1440: MP3 project | Base demo setup | `suggestedFilename` `czaba-studio-lab-range.wav` / `czaba-studio-lab.mp3`; the files parse (RIFF PCM 24-bit/48k/2ch; MP3 decodes); done texts as in round 93 |
| PX-NET | all sessions | — | No request to any R2/workers.dev host, `/api/studio-token`, `/api/recording-*` or `/api/download`; 0 `Authorization` headers; no unpkg request before the first MP3 click; audio only from the demo files |
| REG-HYD | all sessions | — | No hydration warning and no non-noise console error |
| G94-3 | 1440 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace; `/api/studio-token?…` anonymous → 401; the header link opens `/studio-lab` with the demo badge; fake-Bearer 403 → BLOCKED if the backend is unavailable |
| AN-REVIEW | — | Read `collection-load-status.test.tsx`; in a scratch copy, re-run A's mutations **a**, **b** and **f** | Each turns red as A's table says. Every LS/PM row asserts exact texts, counts or file names, not only rendering. The PC9 diff only adds `empty` |
| T94-TARGETED | — | A's `a-round-94/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | — | Start = end | HEAD `85fcb05`; 5 M + 2 ??; frozen 518/518; A's end hashes; the `git diff -U0` hunks touch only the granted regions (context l.3000–3016, collection.ts l.4–29, PC9, doc 081 l.4, workspace doc l.44); protected hashes as in Baseline |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the production bundle (PROD-MP3-UNVERIFIED).
- **Neighbour behaviour that could break:** the first-render loading text (SSR/hydration), the failed-count text, status messages from user actions (must not be wiped by the load effect), demo export names, the library row states.
- **Known and intended (not new bugs):** everything listed in round 93 §5; the 1-LSB WAV jitter (C-R84-L1); the demo row `შეცდომა: Failed to fetch` on an aborted demo load (C-R92-N1, Lows part 3); the demo-mix clipping alert.

## 6. After this round
- **If C PASS:** COLLECTION-EMPTY-STATUS, GATE92-S1 and GATE92-S2 close (the first two as unit-proven, browser-unreachable until the SRW-21 mount).
- **Round 95:** the **regression round** if planned on or after 2026-10-24 (it will be): every done/c_pass item at both viewports plus `npm run test:e2e:smoke`; A fixes only what C finds.
- **Then Lows part 3:** C-R92-N1 (demo network failure → Georgian text, `app/data/studio-lab-demo.ts`), GATE90-S3/S4/S5, A-R88-REVIEW-EDGES, GATE89-S3/S4/S6, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER, then the grid/tempo Lows → R21-I2 full regression → T12 → VISUAL-A-OBSIDIAN. Optional and info-level Lows do not gate T12. Scope is not reduced.
- **Architecture:** the round-93 reviewer and A both propose one shared test harness for the arrangement tests (`FakeAudioBuffer` is now in 61 files). Recorded as signal ARCH-R93-TEST-HARNESS; not scheduled in this round; added to the pending q14 checkpoint request.
