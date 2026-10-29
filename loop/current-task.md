# Round 237: SABA-B-11a-FIX-2 — the seed status survives the collection's ready write, the seed search closes when nothing can seed, and no leading space

**Planned by:** B, at the round 236 → 237 planning, 2026-10-28/29 (planning closed 2026-10-29). **Decisions:** D-29z339…D-29z345.

**Type:** bug round, three tightly related items in one code path: the status write of the SABA-B-11a tempo seed (stage 1, published in round 234 as `c95b8a8`) and the provider's collection-load status that overwrites it.

| Id | Severity | Origin | One line |
|---|---|---|---|
| **A-R234-REVIEW-M1** (+ merged **B-R235-READY-CLOBBER**) | Medium | A round 234 code-reviewer; gate 234 suggestion 1; B round-236 planning probe | The provider writes the plain string `copy.ready` / `copy.failed(n)` when the last source settles, and `copy.loading` when its load effect starts. Both overwrite any status written in between: the placement + seed status after a fast Add, and the seed status written at mount. **Reproduced deterministically by B at `ecaf0e4`** with a 4 s route delay on the two demo MP3s (§0.3). |
| **GATE234-S2** | Low (fixed now, same effect) | gate 234 suggestion 2 (= A-R234-REVIEW-L1) | In a collection with no music/stem BPM source, the seed search never closes. `findAssetTempoSeed` rebuilds two Maps on every clips/tracks change for the whole session. |
| **GATE234-S3** | Low (fixed now, same line) | gate 234 suggestion 3 | `[status, ...parts].join(' ')` yields a leading space when the status is empty. |

Two doc-only grants ride along. They are not extra bugs; they keep the feature docs true:
- **C-R236-02** (Low): doc 183's `playFromRuler` bullet. Both A and C asked for the ruling (L10).
- Doc 182's stale problem bullet and its TODO bullet about this very bug.

**Read first:** `lessons.md` in full.
- Directly relevant: L23 (B's pre-check, §0.2), L29 (recipes B ran in Chromium, §0.3), L31 (timeouts), L26 and L28 (doc headings and status), L44 (one new Saba question), L48 (wait for ready; **this round deliberately does not wait**, §0.3).
- For A: L11, L32 and L33 (STOP), L12 (no class selectors), L40 (testid elements).

**Not this round:**
- **C-R236-01** (Low): a stale `playPastEnd` status during playback. Its code is `togglePlayback`, which is not in the grants → `deferred_low_polish` (D-29z340).
- Gate-236 suggestions 1, 2 and 5 (mixed-zone double-click; a right-click writing `pressInStripRef`; `playbackEndedAtRef`) → `deferred_low_polish` or notes (D-29z340).
- The gate-236 Architecture notes (a pure play-from decision helper; the hook passing `pressTarget` to `onRulerDoubleClick`) are signals, not tasks (D-29z343).
- SABA-B-11b (next feature stage), the Insert Marker model (10a, which also carries C-R235-02), SABA-B-7 (`awaiting_user`).
- The purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 `deferred_user`).

## 0. Baseline and scope

**Baseline:** HEAD = `ecaf0e4bd9c99081c2db7a4cd97497562d00193d`. This is gate 236 `published`, its `commit`. At the start, `git status --short --untracked-files=all` must be empty. B's check is in `b-round-236/git-status-at-planning.txt`: HEAD `ecaf0e4`, 0 changed paths.
- If HEAD differs or any path is dirty at the start: **STOP** (L11). One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-236-r237-tree-sha256.txt` lists **1,090** tracked files: every tracked file except the 9 grants and the 4 root files. From `store/`, `sha256sum -c --quiet` gives rc 0 at planning.
- The frozen set includes every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- It also includes `.claude/**`, `CLAUDE.md` and every config file.
- Frozen code worth naming: `app/lib/arrangement/status-announcement.ts` (the reducer already accepts `(current) => string`; it does not change), `strings.ts`, `ArrangementTempoRow.tsx`, `useRulerNavigation.ts`, `app/data/studio-lab-demo.ts`.
- Frozen tests: every test except the three granted files and the new file, including `collection-load-status.test.tsx`, `purchased-collection-ui.test.tsx`, `status-announcement.test.ts` and `bars-ruler-ui.test.tsx`.

**Root-owned, must equal HEAD:** `b-round-236-r237-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes are in `b-round-236-r237-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants
| # | Path | Change |
|---|---|---|
| 1 | `app/contexts/ArrangementContext.tsx` | §2.2 only. <ul><li>The interface member becomes `setStatus: (update: ArrangementStatusUpdate) => void;`. The type is already imported. The value object already passes the reducer dispatch through, so it does not change.</li><li>The collection import adds `loadingCollectionStatus` and `settledCollectionStatus`.</li><li>In the load effect, `setStatus(copy.loading)` becomes `setStatus((current) => loadingCollectionStatus(current, copy))`.</li><li>In `settle`, the plain-string write becomes a functional write through `settledCollectionStatus` (with `failed` captured in a `const` first).</li><li>The empty-collection write `setStatus(copy.empty)` and every other member are unchanged.</li></ul> |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | §2.3 only. <ul><li>The import from `tempo-seed`.</li><li>A `collectionHasTempoSource` `useMemo` placed right before the seed effect.</li><li>The seed effect's first guard and dependency list.</li><li>Its final `setStatus`, which becomes functional with an empty-part filter.</li></ul> Nothing else in the tempo, grid or Snap block. |
| 3 | `app/lib/arrangement/collection.ts` | §2.1: two new exported pure functions, placed before `workspaceCollectionCopy`. The copy objects are unchanged. |
| 4 | `app/lib/arrangement/tempo-seed.ts` | §2.4: new export `hasAssetTempoSource(sources)`, placed before `findAssetTempoSeed`. `findAssetTempoSeed` and `catalogueTempoBpm` are unchanged. |
| 5 | `app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx` | §2.5: rows TU9–TU11 and their helpers **appended after the existing `describe`**. TU1–TU8 and everything above them stay byte-identical. |
| 6 | `app/lib/arrangement/__tests__/collection.test.ts` | §2.5: the `../collection` import gains the two names. Rows CR1–CR4 are appended in new `describe` blocks at the end. Every existing row is byte-identical. |
| 7 | `app/lib/arrangement/__tests__/tempo-seed.test.ts` | §2.5: the `../tempo-seed` import gains `hasAssetTempoSource`. Row TS7 is appended in a new `describe`. TS1–TS6 are byte-identical. |
| 8 | `docs/implementation/2026/quarter-IV/182-saba-b-11a-tempo-seed.md` | Only two bullets may change (§2.6). l.4 and the rest are unchanged. <ul><li>In `## პრობლემები და გადაწყვეტები`: the **first** bullet ("context-ის `setStatus` მხოლოდ string-ს იღებს …").</li><li>In `## TODO / შემდეგი ნაბიჯები`: the **last** bullet ("Mount-ზე … B-ს გადაწყვეტილება.").</li></ul> |
| 9 | `docs/implementation/2026/quarter-IV/183-saba-b-11a-bars-ruler.md` | Only the bullet **"`playFromRuler`"** in `## მიდგომა` (l.38–41 at `ecaf0e4`) may change (§2.6, C-R236-02). l.4 and the rest are unchanged. |
| N1 | `app/lib/arrangement/__tests__/tempo-seed-search-ui.test.tsx` | New file (§2.5): rows TQ1 and TQ2. |
| N2 | `docs/implementation/2026/quarter-IV/185-saba-b-11a-seed-status-fix.md` | New implementation doc (§2.6). |

The grants' start hashes are in `b-round-236-r237-granted-start-sha256.txt`. The lists are in `b-round-236-r237-grants.txt` and `b-round-236-r237-new-files.txt`. Neither N1 nor N2 exists at HEAD.

Before editing, read:
- `REACT_CONTEXT.md` (a context member type);
- `AUDIO_ARCHITECTURE.md` (the provider's load path);
- `AGENT_DISCOVERABLE_CODE.md` (three new exports);
- `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests);
- `GEORGIAN_DOCS.md` (docs 182, 183 and 185).

### 0.2 B's collision pre-check (L23, done)
B applied a sketch of §2 to a scratch copy: `git archive ecaf0e4` → `/tmp/b236-scratch`, with `node_modules` symlinked. That copy is outside the repo and the loop folder. The code edits are scripted in `b-round-236/sketch.py`. The full diff, with the sketch tests, is `b-round-236/precheck-scratch.diff`. `git apply --check -p1` on a fresh `git archive ecaf0e4` copy gives rc 0. **A may apply it as is**, then write the docs.
- **Static checks:** `npx tsc --noEmit` rc 0. `npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement/StudioWorkspace.tsx` is clean (213 files, no fixes).
- **Widening the type is safe:** `setStatus` props typed `(message: string) => void` in `ArrangementClip.tsx` l.117, `ArrangementClipEnvelope.tsx` l.45 and `ArrangementDetailPanel.tsx` l.103 accept the wider function (parameter contravariance). `tsc` confirms this. No test builds a hand-made context value.
- **Covering set:** `b-round-236/covering-files.txt` holds **121** test files. They are every test that mentions `ArrangementProvider`, `StudioWorkspace`, `setStatus`, `tempo-seed`, `workspaceCollectionCopy`, the collection loading/ready texts, `studio-lab`, `status-announcement` or the `collection` module. **All 121 files and 1,715 tests are green** on the sketch, in 157 s (`b-round-236/precheck-covering.log`). There is no red row, so no frozen test needs a grant.
  - LS1–LS7 (`collection-load-status`) stay green. In particular, LS3/LS3b ("a collection swap resets the status to loading") and LS6 ("a rerender keeps a user status") hold under the new rules.
  - After that run, B changed the failure rule to "failed wins" (D-29z339). B then re-ran `collection`, `collection-load-status`, `tempo-seed-ui`, `purchased-collection-ui`, `label-status-colour-ui`, `library-row-strings-ui`, `tempo-seed-search-ui` and `tempo-seed`, and all were green.
- **Mutants run by B on the sketch** (script `b-round-236/mutants.sh`, logs `b-round-236/mutant-*.log`; A re-runs them, §4):
  - **MU-RC** (restore the plain-string settle write) → TU9 and TU10 red.
  - **MU-LD** (restore the plain `setStatus(copy.loading)`) → TU10 red.
  - **MU-F** (drop the empty-part filter) → TU11 red.
  - **MU-S2** (drop the `collectionHasTempoSource` guard) → TQ1 red.
  - **MU-SR** (keep the render-time `workspaceRef.current.status` read, with the filter) → **0 red**. It is equivalent under every reachable order, because the status write and the clip change commit in the same render. It is recorded, not required. The functional form stays because it reads the reducer's current text by construction (D-29z341).
- **Keep these true:**
  - TU1–TU8 stay byte-identical, so TU2's exact text and TU8's mount seed still hold;
  - do not change `status-announcement.ts`;
  - do not touch the empty-collection write.

### 0.3 Recipes, signals and timeouts (L29, L31, L48)
**Recipes (L29).** B ran these in Chromium at both viewports against the baseline on `:5173` and the scratch build on `:5174`. Script: `b-round-236/probe/readyrace.cjs`. Outputs: `readyrace-baseline.json` and `readyrace-scratch.json`. There were 0 page errors.
- **Make the race deterministic:** before `goto`, use `page.route` to delay `**/middle-east.mp3` and `**/hero-music.mp3` by 4,000 ms, then `route.continue()` (mode `delay`). In mode `fail`, `**/hero-music.mp3` is answered by `route.fulfill({ status: 404 })` after 4,000 ms instead. These are the only two fetched demo sources (`app/data/studio-lab-demo.ts` l.19–22); the rest are synthesized.
- **Select the pulse reliably:** click `[data-source-id="demo-stem-pulse"]` until its `aria-selected` is `"true"` (up to 40 × 100 ms). The first click can land before hydration, and then Add places the default source (`demo-middle-east`), with no seed. B's first baseline run hit exactly this.
- **Then** click the enabled button whose text starts with `Add`. Record the status history with a `MutationObserver` on `[data-testid="arrangement-status"]`, installed right after the element appears. Read the final text 7 s later.
- **Do not wait for `Demo collection ready` in these rows.** That wait is exactly what hides the bug (L48 is inverted here on purpose).
- **Baseline (`ecaf0e4`), both viewports:**
  - **delay:** Add at ≈1.5 s → status placement + seed. At ≈5.6 s it is replaced by the bare `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` **This is the bug.**
  - **fail:** at ≈5.2 s → `1 sound in the demo collection failed to load — details are in the library.`
  - **idle** (no Add): `Loading …` → ready.
  - `data-bpm` is 120 in both Add modes.
- **Scratch (the sketch), both viewports:**
  - **delay:** the final status is exactly `“ღამის პულსი · პულსი” added to the Music track at 00:00.000. Tempo 120 BPM from “ღამის პულსი · პულსი” — bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/4 (G)`, and the history has **no** ready entry after the Add;
  - **fail:** the exact `failed(1)` text (D-29z339);
  - **idle:** `Loading …` → the exact ready text (unchanged).
- **Rejected variant, kept as evidence:** `probe/statusbox-append-variant-*.{png,json}`. It **appended** `failed(1)` to the seed status. At 1280 that gives a 2-line, 32 px status box (16 px at 1440). See §1.
- **Signals:**
  - status text: `[data-testid="arrangement-status"]`;
  - tempo: `[data-testid="arrangement-bars-ruler"]` `data-bpm`;
  - Snap: `[data-testid="arrangement-grid-control"]` `data-snap`;
  - the source row's failure detail: inside `[data-source-id="demo-hero-music"]`, the text `Error: File failed to load (404)`. Its render branch is `ArrangementLibrary.tsx` l.130–131 (`state.status === 'error'` → `studioSourceLoadStrings.rowError(state.error)`, with `httpFailed(404)` from `studio-lab-demo.ts`). The row is listed under the default `All` filter.
- **Validity of a race attempt (all race rows, HEAD control included):** the attempt is valid only if the last status entry **before** the Add is still `Loading the demo collection…`. Otherwise the sources settled before the Add (for example on a cold Vite compile; B's first warm-up run at 1440 added at 4.29 s against a 4 s delay), and the row would pass vacuously. Such an attempt is environment-invalid: keep it as evidence and repeat it with the delay raised to 8,000 ms. At most 2 extra attempts are allowed (the sync-measurement budget rule). If no valid attempt remains, the row is FAIL-unverified, not PASS.

**Timeouts (L31).** In gate 236 (`gates/round-236/verify.log`), `tempo-seed-ui.test.tsx` declares `{ timeout: 15_000 }`. On the sketch its 11 rows took 3.1 s in total, with the slowest row (TU3) at 0.6 s. TQ1/TQ2 take 0.33 s together, and `collection.test.ts` 63 ms. No covering test is near its limit. The slowest covering tests, CP12a–d, are unchanged code.

**Testids (L40).** No element with a `data-testid` changes.

## 1. Why
- **A-R234-REVIEW-M1 / B-R235-READY-CLOBBER.** The provider owns the status. Its source-load effect writes plain strings at two moments:
  - at the start (`setStatus(copy.loading)`, `ArrangementContext.tsx` l.3657 at `ecaf0e4`);
  - when the last source settles (`setStatus(failed === 0 ? copy.ready : copy.failed(failed))`, l.3670).

  Anything the user caused in between is lost. That includes the placement + seed status after a fast Add (B's probe: replaced about 4 s later with a 4 s source delay; about 1–2 s after load without one), and a plain placement message. The seed written at mount (initial arrangement with a BPM clip; the purchased route later) is lost as well. Child effects run before the parent's, so the provider's own `copy.loading` write lands right after the seed.
- **Decision D-29z339 (smallest honest behaviour):**
  - **ready** replaces only the loading text: the bare loading text, or a loading prefix that the mount seed appended to. A status the user caused after loading began is kept, because the user's own action already shows that the Studio responds.
  - **failed(n) always wins**, as today. A load failure is the one fact the user cannot see elsewhere at a glance. B also tried appending it (§0.3): that gives a 2-line status at 1280. The seed's facts stay reachable without the status: the BPM field shows 120, the Snap button shows on, and the BPM title says "audio is not stretched".
  - **loading** keeps a status that already starts with this collection's loading text (the mount seed). Anything else becomes loading, as today. This keeps LS3/LS3b's swap reset.
- **One trade-off goes to Saba (L44):** if the viewer acts before every source has loaded, the ready line "… Press ? for shortcuts." does not appear in that session. The `Shortcuts ?` footer button and the tooltips still teach the keys (CALM-1). This is `SABA-Q-READY-AFTER-ACTION`. The default above holds until he answers.
- **GATE234-S2.** `hasAssetTempoSource(collection.sources)` is memoised per collection. When it is false, the effect returns before any Map is built. It does **not** close `tempoSeedOpenRef` permanently, because a later collection with BPM sources must still seed.
- **GATE234-S3.** The functional write filters empty parts, so an empty current status gives no leading space.

## 2. Changes

### 2.1 `collection.ts` (grant 3)
```ts
export function loadingCollectionStatus(current: string, copy: WorkspaceCollectionCopy): string
// current === copy.loading || current.startsWith(`${copy.loading} `) ? current : copy.loading

export function settledCollectionStatus(current: string, copy: WorkspaceCollectionCopy, failed: number): string
// settled = failed === 0 ? copy.ready : copy.failed(failed)
// current === copy.loading                   -> settled
// current starts with `${copy.loading} `     -> `${settled} ${rest}`
// otherwise                                  -> failed === 0 ? current : settled
```
The exact bodies are in `precheck-scratch.diff`. The names follow `AGENT_DISCOVERABLE_CODE.md`: they say what they return.

### 2.2 `ArrangementContext.tsx` (grant 1)
- `setStatus: (update: ArrangementStatusUpdate) => void;`
- In the load effect: `setStatus((current) => loadingCollectionStatus(current, copy));`
- In `settle`: `const failedCount = failed;` then `setStatus((current) => settledCollectionStatus(current, copy, failedCount));`

### 2.3 `StudioWorkspace.tsx` (grant 2)
- `const collectionHasTempoSource = useMemo(() => hasAssetTempoSource(collection.sources), [collection.sources]);`, right before the seed effect.
- The first guard becomes `if (!collectionHasTempoSource || !tempoSeedOpenRef.current || tempoBpmRef.current !== null) return;`.
- The deps become `[arrangement.clips, arrangement.tracks, collection.sources, collectionHasTempoSource]`.
- The final write becomes `workspaceRef.current.setStatus((current) => [current, ...parts].filter((part) => part.length > 0).join(' '));`.

### 2.4 `tempo-seed.ts` (grant 4)
`export function hasAssetTempoSource(sources: readonly WorkspaceSource[]): boolean`, which returns `sources.some((source) => catalogueTempoBpm(source) !== null)`.

### 2.5 Tests (grants 5–7, N1)
| Row | File | Case | Expected |
|---|---|---|---|
| TU9 | `tempo-seed-ui` | A collection whose non-`stem-90` sources wait on a gate. Add `stem-90` while loading, then release the gate | Before the release, the status is exactly placement + seed + `Snap on — grid 1/4 (G)`. After the release, the status is **the same text**. Red on MU-RC. |
| TU10 | `tempo-seed-ui` | The same deferred collection, with an initial arrangement holding `stem-90` at 2 s | At mount: `Loading the demo collection… <seed> <Snap on>`. After the release: `Demo collection ready. … Press ? for shortcuts. <seed> <Snap on>`. Red on MU-RC and MU-LD. |
| TU11 | `tempo-seed-ui` | `setStatus('')`, then `commitArrangement` adds a `stem-90` clip (no placement status) | The status is exactly `<seed> <Snap on>`, with no leading space. Red on MU-F. |
| CR1–CR4 | `collection` | The pure functions: bare loading → ready / failed(n) (both origins); a loading prefix is swapped; another status is kept (0 failed) or replaced by failed(n); `loadingCollectionStatus` keeps its own prefix and resets anything else, including another origin's prefix | As listed |
| TS7 | `tempo-seed` | `hasAssetTempoSource` | false for `[]`, for SFX-with-BPM + music-without, and for an out-of-range BPM; true for a stem at 90 and for music at 128.004 |
| TQ1 | N1 | `vi.mock('../tempo-seed')` wraps the real `findAssetTempoSeed` in `vi.fn`. A collection with no music/stem BPM; three `commitArrangement` clip changes | `findAssetTempoSeed` was never called. Red on MU-S2. |
| TQ2 | N1 | The control: the same plus a BPM stem | Called at mount and on a later change. After the seed, a further change adds no call. |

### 2.6 Docs
**N2 (doc 185):**
- written in Georgian with technical terms in English, and the L26 headings;
- l.4 exactly `**სტატუსი:** Completed (C round 237 PASS)`;
- it records:
  - the three ids and the merged B-R235-READY-CLOBBER;
  - the three status rules and why failure wins (the 2-line evidence);
  - the child-before-parent effect order that clobbered the mount seed;
  - why MU-SR is equivalent;
  - the same-origin stale-prefix edge (§6);
  - `SABA-Q-READY-AFTER-ACTION`;
  - "no reference found" (§3);
- it cites only tests that exist (TU9–TU11, CR1–CR4, TS7, TQ1–TQ2, LS3/LS3b/LS6/LS7).

**Grant 8 (doc 182):**
- The first problem bullet now says the seed writes through the functional `setStatus`, and points to doc 185.
- The last TODO bullet says the mount clobber is fixed in round 237 (doc 185). Do not delete it without a replacement line.

**Grant 9 (doc 183, C-R236-02):** the `playFromRuler` bullet now says `playFromRuler` forwards to the context's `playFrom(time)`:
- while playing, it seeks;
- stopped at or past the end with no active loop, it shows `playPastEnd` and does not play;
- otherwise, `seekTo` + `togglePlayback`.

It points to doc 184.

A checks every doc grant with `git diff -U0`: each hunk lies inside its granted bullet.

## 3. Reference: how the reference product does it
**No reference found.** This is a contract between two writers of CZABA's own status line. Live 12's Status Bar is not documented as having a "collection loaded" message that competes with a user action.
- **Searched:** WebSearch on 2026-10-28 (UTC, during this planning), "Ableton Live 12 manual status bar messages bottom of screen". It returned no manual section, only a 2004 forum feature request.
- The previous Live references for the seed (`tasks/round-234.md` §3) and the scrub strip (`tasks/round-236.md` §3) are unchanged by this round.
- **The rule that binds instead:** the CALM-2 rule "facts that move must stay reachable" (`calm-studio-review.md`). The seed's facts stay in the BPM field, the Snap state and the BPM title, and the ready line's key hint stays in `Shortcuts ?` and the tooltips.

| Behaviour | Source | CZABA decision | C check |
|---|---|---|---|
| A user action before load completes keeps its status | none (CZABA contract) | D-29z339; Saba question `SABA-Q-READY-AFTER-ACTION` | C-RACE-DELAY-237 |
| A load failure always shows | none | D-29z339 (failure wins) | C-RACE-FAIL-237 |
| An idle load shows the ready hint | CALM-2 first-run status | Unchanged | C-IDLE-237 |

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. `npm run typecheck` rc 0. `npx biome check` on every changed code and test file is clean.
2. Run `npx vitest run $(cat ../tmp/studio-real-loop/b-round-236/covering-files.txt) app/lib/arrangement/__tests__/tempo-seed-search-ui.test.tsx`. Everything must be green. Any test above 50 % of its timeout goes at the top of the report (L32).
3. Apply MU-RC, MU-LD, MU-F, MU-S2 and MU-SR. `b-round-236/mutants.sh <a scratch copy> <out dir>` is the reference; run it on a copy, never on `store/`. Report the red rows for each mutant, and say that MU-SR is equivalent. The final files contain no mutant.
4. Run the `code-reviewer` (3+ files changed). Pass its Architecture note to B.
5. Do your own Playwright run of `b-round-236/probe/readyrace.cjs` against `:5173` at both viewports, plus full-window screenshots after the delay-mode Add. There is no new persistent text (L39).
6. Write `a-round-237.md`: changed files, the tests run with counts, the mutants, the reviewer result, and any STOP at the top.

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720, fresh context per row)
| Row | What | Pass when |
|---|---|---|
| C-SCOPE-237 | HEAD, status, hashes | <ul><li>HEAD is `ecaf0e4`;</li><li>only the 9 grants are `M`, plus the 2 new files;</li><li>`sha256sum -c` on the frozen and root lists gives rc 0;</li><li>protected files: `git diff --quiet HEAD` gives rc 0;</li><li>docs 182/183: every `git diff -U0` hunk lies inside a granted bullet, checked by content, and both l.4 lines are unchanged;</li><li>`tempo-seed-ui`, `collection.test.ts`, `tempo-seed.test.ts`: no removed line except the two import lines.</li></ul> |
| C-UNIT-237 | `tempo-seed-ui` (TU1–TU11), `tempo-seed-search-ui` (TQ1–TQ2), `tempo-seed` (TS1–TS7), `collection` (incl. CR1–CR4), `collection-load-status` (LS*), `purchased-collection-ui`, `label-status-colour-ui`, `library-row-strings-ui`, `status-announcement` | All green. The full suite is a gate row. |
| C-MUT-237 | C re-runs MU-RC once on a scratch copy outside the repo | TU9 and TU10 red; the repo status is unchanged before and after. |
| C-RACE-DELAY-237 | The §0.3 delay recipe (no ready wait), status `MutationObserver`. Only valid attempts count (§0.3 validity rule) | <ul><li>The final status (≥ 6 s after Add) is exactly `“ღამის პულსი · პულსი” added to the Music track at 00:00.000. Tempo 120 BPM from “ღამის პულსი · პულსი” — bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/4 (G)`.</li><li>No status entry after the Add starts with `Demo collection ready`.</li><li>`data-bpm` is 120 and `data-snap` is on.</li><li>No status entry starts with a space.</li><li>A HEAD control (a `git archive` copy on another port) shows the bare ready text as the last entry.</li></ul> |
| C-RACE-FAIL-237 | The §0.3 fail recipe. Only valid attempts count (§0.3 validity rule) | <ul><li>The final status is exactly `1 sound in the demo collection failed to load — details are in the library.`</li><li>Tempo 120 and Snap on are still set.</li><li>The `demo-hero-music` library row contains `Error: File failed to load (404)`.</li><li>The status box is one line at both viewports (height recorded).</li></ul> |
| C-IDLE-237 | A fresh load with no action and no route delay; then the L48 "wait for ready, then seed" recipe | <ul><li>`Loading the demo collection…` → exactly `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.`</li><li>After the seed: exactly placement + seed + `Snap on — grid 1/4 (G)` (the same text as round 234's TU2-shaped row).</li></ul> |
| C-PLACEMENT-237 | The delay recipe with `demo-soft-impact` (SFX, no BPM) instead of the pulse. Only valid attempts count (§0.3 validity rule) | <ul><li>The final status is exactly that clip's placement text, not the ready text.</li><li>No tempo: `data-bpm` is absent or empty, and Snap is unchanged.</li><li>No leading space.</li></ul> |
| C-S2-237 | GATE234-S2 | Unit only: TQ1 green and MU-S2 red in A's report. It cannot be reached in `/studio-lab`, because the demo collection has BPM stems. Say so; it is not BLOCKED. |
| C-FIX1-REG-237 | Round-236 key rows | <ul><li>A strip click at 4.1 s plays from 4.000, measured from the source start (L48).</li><li>A strip double-click at 3 s plays, with no `Fit:`.</li><li>A lower-zone double-click gives the exact Fit text.</li><li>A strip click at 15.95 s gives the exact `playPastEnd` text and does not play.</li><li>Space then plays from 0.</li></ul> |
| C-BUDGET-237 | L39 | Persistent text lines outside the timeline are unchanged against HEAD at both viewports (empty, seeded). |
| C-REF-237 | §3 | "No reference found" is stated, with the search. `SABA-Q-READY-AFTER-ACTION` is in `backlog.json` as `awaiting_user`. C-R236-01 and the gate-236 Lows are in `deferred_low_polish`. |
| AN-REVIEW-237 | Docs 185, 182 and 183 | <ul><li>Doc 185: L26 headings, l.4 byte-exact, cites only existing row ids (grep).</li><li>Docs 182/183: only the granted bullets changed; l.4 is still `Completed (C round 235 PASS)` in both.</li><li>Doc 183's `playFromRuler` bullet now matches `ArrangementContext.tsx` `playFrom`.</li></ul> |
| LAB-SMOKE-237 | `/studio-lab` | It loads. Play/Pause with Space works, and the export dialog opens and exports WAV. 0 page errors. |
| C-SHOTS-237 | Evidence | Before (HEAD) and after full-window screenshots at both viewports, delay mode, 6 s after Add. |
| Auth | Standing check | A fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Every other `setStatus` caller** still passes a string and must behave as before: placement, Snap, tempo, Fit, `playPastEnd`, the gesture refusals and their duplicate guard (`reduceArrangementStatus` with `gestureActive`).
- **The live region:** the status `sequence` increments only when the text changes. A ready write that keeps the current text makes no new announcement; this is by design. C notes whether the screen-reader live region repeats.
- **Purchased origin:** the same rules with the purchased copy (CR1, `purchased-collection-ui`). In the browser it is backend-blocked: list it, do not run it.
- **Seed one-shot, typed tempo wins, hand-chosen grid and Snap:** TU4–TU6 unchanged.
- **The empty-collection text** (LS1/LS2) is unchanged.
- **Known edge, recorded and not fixed:** `loadingCollectionStatus` keeps any status that already starts with the same origin's loading text. A same-origin collection swap that arrives while a stale `Loading the demo collection… <seed>` text is still shown would not reset it. The next settle still swaps that prefix for ready or failed. This cannot be reached in `/studio-lab`, which has one collection. LS3/LS3b start from the ready or a user text. Doc 185 states this edge, and C notes it; it is not a FAIL.

## 7. Outcomes for B's next planning
- **PASS and gate published:** A-R234-REVIEW-M1 (+ B-R235-READY-CLOBBER), GATE234-S2, GATE234-S3 and C-R236-02 close. Round 238 is **SABA-B-11b** (the zone-adaptive grid, Live 6.10; closes ABL-R-8), unless the REGRESSION round is due (on or after 2026-10-30), in which case that goes first.
- **FAIL:** a fix-up on the same grants.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.

## 8. Root notes
- New Saba question: `SABA-Q-READY-AFTER-ACTION` (`backlog.json`, `awaiting_user`).
- `b-round-234-checkpoint-request.md` (ARCH-CHECKPOINT-TEMPO-GRID) has a second addendum with the gate-236 signals. It is still non-blocking. Question 2 is answered by this round's design unless the checkpoint objects. **Please run it before SABA-B-11b (round 238).**
- B's scratch dev server on `:5174` shared the symlinked `store/node_modules/.vite` cache and re-optimised it once. No tracked file changed.
