# Round 293: FIX-PD-1c2. Fix-up of C-R292-01 (Medium): narrowing the window must stop the library preview

**Planned by:** B, at the round 292 → 293 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z727:** round 292 is closed as **C FAIL**. `browserVerified` and `realVerified` are both true and all 20 specified rows pass. One extra probe failed: C-R292-01 (Medium, caused by this round). Gate 292 is `skipped` and nothing was published. FIX-PD-1c stays **ბაგია**.
- **D-29z728:** rulings on A's round-292 deviations D1–D4, C's INFO items and the code-reviewer Lows (§2).
- **D-29z729:** this round's scope.
- **D-29z730:** an L49 clause about subtree unmounts that leave a sound running (§9).
- **D-29z731:** the order after this round.

**Owner:** A. **Verifier:** C. **Grants:** §4 (3 paths).
- This round touches no Store page, auth, cart, checkout, purchase or protected file.
- The only behaviour change: when the latched narrow state mounts, the existing context action `stopLibraryPreview` is called once.

## Baseline: HEAD `88b23dd` [K1] + A's round-292 working tree (9 paths) [K2]
- Gate 292 is `skipped` ("C taskStatus FAIL") [K1], so HEAD is still `88b23dd`. A's nine round-292 paths are uncommitted on top of it and are **kept**. A builds on them and re-implements nothing (loop policy 6).
- **Frozen list:** `b-round-292-r293-tree-sha256.txt`, 1,162 entries (`git ls-files` + the 4 untracked round-292 files, hashed on the current tree), `sha256sum -c` rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-292/claims-293.sh` **before editing**. Its output must equal `b-round-292/claims-293-output.txt`. Any difference is a STOP (§8).
- **Root publishes rounds 292 + 293 together** after C PASS and the gate: the 9 paths of round 292 plus this round's 3. Two of the three overlap with round 292 (the route and the test file); the doc also overlaps. The union is still 9 paths.

## 0. Read first
1. `lessons.md` (every role), especially L4, L10, L11, L28, L29, L47, L49, L52 and L56.
2. This task.
3. `c-round-292.md` (C-R292-01 and the INFO list) and `a-round-292.md` ("Known gaps").
4. B's sketch: `b-round-292/sketch-route.diff` and `b-round-292/sketch-ng5c.diff`, pre-run on a scratch copy (`b-round-292/sketch-tests.log`). It is a starting point: the test in the sketch is written loosely, and A writes NG5c to the §3.2 contract.
5. A's primitives: `AUDIO_ARCHITECTURE.md` and `REACT_CONTEXT.md` (the route reads `useArrangement`); `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`; `GEORGIAN_DOCS.md`.

## 1. Why, and the promise
**Promise (L55, unchanged from 292):** "a visitor on a phone gets a calm page where they can hear a CZABA preview and send themselves the link, and a desktop user who narrows the window never loses their work." Implied by it: **a narrowed Studio makes no sound that the user cannot see or stop.**

**C-R292-01** (`c-round-292.md`; evidence `c-round-292/c292.json` rows X-LIBRARY-PREVIEW and X-PREVIEW-LIFETIME, `mix-probe.json`, `shots/libpreview-*.png` [K13]):
- At 1440×900 and 1280×720: select library `Bass`, press `Preview`, then resize to 899 px (or 390 px). The preview keeps sounding behind "The Studio works on a computer" until it ends naturally, about 20 s later. Master tap RMS was 0.102 at 0.3 s and 0.103 at 10 s.
- The narrow screen has no control that stops it. After widening, the library button still reads `Stop`.
- Pressing the narrow screen's native Play in that state plays both sources together.
- At HEAD the workspace stayed mounted at 899 px, so the preview's Stop button was reachable. **This is a regression caused by round 292.**

**Cause** (source, claims):
- `StopPlaybackOnNarrow` (`studio-lab.tsx` l.26 [K5]) stops only the transport, through `togglePlayback`, and the route never calls `stopLibraryPreview` [K6].
- The preview runs in the provider (`createLibraryPreviewPlayer`, `preview.client.ts`). The provider **stays mounted** in the latched branch, so nothing stops it.
- **The never-wide branch is not affected.** It unmounts the provider, and the provider's unmount cleanup (`ArrangementContext.tsx` effect l.3904–3949) already calls `previewPlayerRef.current?.stopLibraryPreview()` at l.3937 [K7]. No new row is needed for that path.

## 2. Rulings on round 292 (L10)
| Item | Ruling |
|---|---|
| A D1: the status line is `<output aria-live="polite">`, not `<p role="status">` | **Accepted.** Biome's `useSemanticElements` asks for it, the AX tree exposes `status`, and the workspace footer (`arrangement-status`) uses the same pattern. §3.2 of round 292 is read as "an element with the `status` role". |
| A D2: the "server snapshot false" mutant turns NG9c red, not NG3 | **Accepted.** C confirmed it (`mutants.json` M3). This round's UNIT-MUTANTS row maps it to NG9c. |
| A D3 / C INFO-K14: K14 gains `studio-narrow-gate-ui` | **Accepted** as an expected consequence. |
| A D4: NG9 tolerates one jsdom `muted` prop warning | **Accepted.** Chromium logged 0 hydration warnings at every width (C INFO-D4). |
| C INFO-RESIZE-RECIPE-VACUOUS | **B spec error, acknowledged.** B-RESIZE-KEEP is rewritten below: one clause measures sound with no mute, a separate clause checks state retention. |
| C INFO-DOC218-L4 | Doc 218 l.4 is granted (§4) and must read `Completed (C round 293 PASS)` (L28). |
| A's known gap "library preview on narrow" | That was a Medium regression A found by reading its own change. Under L11 it was a STOP ("a regression against HEAD"), not a note. No new A lesson: L11 already says this. The B-side cause gets an L49 clause (§9). |
| Reviewer Low: after a phone hydration the narrow screen remounts, so a native Play pressed before hydration stops | `deferred_low_polish` as **A-R292-REVIEW-L-NARROW-REMOUNT**. A tried a stable key and reverted it for a good reason: on never-wide → wide, a hidden player kept sounding. |
| Reviewer Low: the TH4 test title still says "only on StudioWorkspace" | `deferred_low_polish` as **A-R292-REVIEW-L-TH4-TITLE**. |
| Reviewer Low: `Preview unavailable.` sits outside the live region | `deferred_low_polish` as **A-R292-REVIEW-L-ERROR-NOT-ANNOUNCED**. |
| Reviewer Low: the latch is a ref written during render; no Safari < 14 `addListener` fallback | Recorded as `architecture_signals` A-R292-REVIEW-RENDER-REF (watch) and info A-R292-REVIEW-SAFARI-LEGACY-MQ. Not scheduled. |
| Reviewer Architecture note: defer source loading until a wide state is confirmed | `architecture_signals` **A-R292-ARCH-DEFER-SOURCE-LOAD**. It extends B-R291-NARROW-PREFETCH (Low, deferred), and both are polish-pass candidates. Not scheduled now. |

## 3. What A changes

### 3.1 `app/routes/studio-lab.tsx`: `StopPlaybackOnNarrow` also stops the library preview
- Destructure `stopLibraryPreview` from `useArrangement()` as well [K7: `stopLibraryPreview: () => void`, a stable `useCallback`].
- Call `stopLibraryPreview()` once, on mount, in its own effect with `[stopLibraryPreview]` as its deps. Keep the call unconditional: it is a no-op when nothing is previewing, because the player call is optional and state is set only when a source id is held (l.1381–1387 [K7]).
- The existing `togglePlayback` effect, guarded by `isPlaying`, stays exactly as it is.
- **Nothing else in the route changes.** That includes the latch, the branches, R1–R8 of round 292, the keys, the focus effect, `meta` and `links`.
- **Sound-source sweep (L49 clause, `SWEEP` [K9]):** every audible source inside the provider, and what silences it when the latched narrow state mounts:

  | Source [K9] | Silenced by |
  |---|---|
  | transport graph (`graph.client.ts` l.214, l.264, incl. the metronome) | `togglePlayback` (existing, NG5b) |
  | library preview (`preview.client.ts` l.39) | **`stopLibraryPreview` (new, NG5c)** |
  | video dock `<video>` (`ArrangementVideoDock.tsx` l.382) | plays only with the transport and unmounts with `StudioWorkspace` |

  `graph.client.ts` l.52 is a type declaration, not a source. There are no other hits.

### 3.2 `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx`: one new row, NG5c
Add it right after NG5b, inside the existing describe, which already has `{ timeout: 15_000 }` [K10].
- **Setup:** wide viewport stub. Use the same `AudioBuffer` stub as NG5b. Use the `demo-soft-impact` library source: it is synthesised on the main thread and is `ready` in this environment [K15]. Bass and Music go through the mocked worker, which never resolves, so a preview of them would take the refusal branch and the row would be vacuous (L52).
- **Steps:**
  1. Select the source.
  2. Activate the library `Preview` toggle (strings `previewPlay`/`previewStop` [K8]).
  3. **Assert before narrowing** that the toggle reads `Stop`. This proves the preview really started.
  4. Narrow, then widen.
  5. Assert the toggle reads `Preview`.
  6. Assert the fake buffer source the preview created has had `stop()` called. Use `vi.spyOn(FakeAudioContext.prototype, 'createBufferSource')` to capture the source, and spy on its `stop`. `createBufferSource` is a prototype method (`helpers/workspace-test-environment.ts` l.52 [K16]), so no helper edit is needed. The helper is frozen: if this spy turns out to be unreachable, that is a STOP.
- **Find the toggle by role and accessible name or text**, scoped to the library preview region. Do not use class selectors (L12). It must not match the transport button (`[data-playing]`).
- **Mutant (L52):** delete the new effect → NG5c red. B's scratch pre-run: green with the fix (16/16 in the file); with the effect removed, red ("expected 1 to be +0" on the after-widen `Stop` count) (`b-round-292/sketch-tests.log`).
- No other row in the file changes.

### 3.3 `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md`
- l.4 becomes exactly `**სტატუსი:** Completed (C round 293 PASS)` (L28).
- Under "პრობლემები და გადაწყვეტები", add one Problem → Solution entry for C-R292-01: the preview kept sounding behind the narrow screen; `StopPlaybackOnNarrow` now also calls `stopLibraryPreview`; the never-wide branch was already covered by the provider cleanup.
- Under testing, cite NG5c.
- Cite only test ids that exist (L26).
- Remove any sentence that says the narrow state stops "all" sound without this fix. Nothing else changes.

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/routes/studio-lab.tsx` | §3.1 only |
| `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` | NG5c only (§3.2) |
| `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md` | l.4 and the §3.3 additions |

**Frozen:** every other entry of `b-round-292-r293-tree-sha256.txt`. That includes A's other round-292 files (`StudioNarrowScreen.tsx`, `useStudioWideViewport.ts`, both `index.ts`, `studio-theme-obsidian.test.tsx`, `library-row-strings-ui.test.tsx`), `ArrangementContext.tsx`, `StudioWorkspace.tsx`, `ArrangementLibrary*.tsx`, `preview.client.ts`, `strings.ts`, `app.css`, every Store file, the 7 protected files [K4], `package.json` and the lock file.

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (the §6 deltas).
- `npm run typecheck` and `npm run lint`; `npx biome check` on the two code paths: rc 0, no new ignore.
- **Covering set:** `npx vitest run` on `studio-narrow-gate-ui`, `library-preview`, `ssr-layout-effect`, `default-track-names-ssr` and `studio-theme-obsidian`. Report the file and test counts, and every test above 50 % of its timeout (L11).
- Run the NG5c mutant yourself and report it.
- The real `code-reviewer` subagent on the 3 changed paths is **required** (speed rules: 3+ changed files). Pass its Architecture note to B.
- **A browser self-check (recommended, not acceptance):** preview `Bass` at 1440, resize to 899, master tap RMS 0 within 300 ms.

## 6. Acceptance (C)
All browser rows run in Playwright Chromium against `http://127.0.0.1:5173/studio-lab`, with fresh contexts and empty storage. Load the page once untimed first (L38). Measure RMS with C's master-tap method from round 292 (`c-round-292/c292.cjs`).

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Differences only in: K2 (still 9 lines); K3 rc 1, failing only on the 3 §4 paths; K5 (new line count and the new destructure); K6 ≥ 1; K10 (lines, rows 16, NG5c 1); K11 `Completed (C round 293 PASS)`. Other K lines identical |
| SOURCE-SCOPE | `git status` + frozen list | the union is still exactly the 9 round-292 paths; `sha256sum -c` on `b-round-292-r293-tree-sha256.txt` fails only on the 3 §4 paths; the 7 protected files are unchanged |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | all pass; NG1–NG9, NG5b, **NG5c**, NG7a–d, NG9b and NG9c present by name; none above 50 % of its timeout |
| UNIT-MUTANTS | scratch copy | (a) the new `stopLibraryPreview` effect deleted → NG5c red; (b) round 292's M9, the `StopPlaybackOnNarrow` child removed → NG5b and NG5c red; (c) "server snapshot false" → NG9c red (D2 ruling) |
| B-NARROW-PREVIEW (C-R292-01) | start 1440×900 and 1280×720 | Select library `Bass`, press `Preview`, and confirm RMS > 0. Resize to 899: RMS is **0 within 300 ms** and stays 0 at +1, +5 and +10 s. Repeat once with a resize to 390. Widen back: the library toggle reads `Preview`, not `Stop`; pressing it plays again (RMS > 0). Re-select `Bass` first if the library selection did not survive; a lost selection alone is not a failure of this fix, but report it. Screenshots: narrow, and after widening |
| B-NARROW-MIX | 1440 → 390 | Library `Bass` preview playing, then resize to 390, then press the narrow screen's native Play. `audio.paused` is false and `currentTime` advances, while the Studio master tap reads 0 (only one source sounds) |
| B-RESIZE-KEEP (rewritten) | start 1440×900 and 1280×720 | **(a) Sound:** add `Night Pulse · Bass` (library Enter) on an **unmuted** lane, Play 1 s (RMS > 0), then resize to 899: RMS 0 within 300 ms, and `studio-narrow-heading` is focused. **(b) State:** back at wide, mute Music, then resize to 899 and back. The clip count is the same, Music is still muted, `data-playing` is `false`, `document.activeElement` is `arrangement-exit`, and Ctrl+Z un-mutes |
| B-NARROW-WIDE | 390×844 → 1440×900 | (292 row, re-run because the route changed) Tab to `Send link`, then resize: workspace visible, `document.activeElement` = `arrangement-exit`; add + Play: `data-playing` true, RMS > 0 |
| B-DESK-SAME | 1280×720, 1440×900 | 0 differing pixels against `b-round-291/probe/desk-5173-*.png` (same method as round 292) |
| B-NARROW-LOAD (short) | 390×844 | direct load: narrow state, `activeElement` body, no `arrangement-exit`, 0 hydration warnings (shows the new effect does nothing on the never-wide path) |
| G293-AUTH | fresh context | `/studio-lab` anonymous (badge at 1440; narrow state at 390), `auth_user` null; `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`; token API 401 without a header, no token |
| DOC-218 | doc | l.4 byte-exact `**სტატუსი:** Completed (C round 293 PASS)`; the C-R292-01 Problem → Solution entry is present; NG5c is cited and exists; every other cited id exists |
| gate | — | the full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows |

**Carried from round 292, not re-run:** B-BOUNDARY, B-THEME, B-AX, B-FOCUS-ORDER, B-PREVIEW, B-SEND, B-AUDIO-ERROR, B-NET and B-JOURNEY-292. They cover files this round does not touch (`StudioNarrowScreen.tsx`, the hook, CSS), and SOURCE-SCOPE proves those files are byte-identical to the tree C passed in round 292. C may re-run any of them if SOURCE-SCOPE shows otherwise.

**Adjacent behaviour that could break:**
- the library preview on a wide window (B-NARROW-PREVIEW widen half; the `library-preview` tests);
- transport stop on narrow (B-RESIZE-KEEP (a), NG5b);
- desktop pixels (B-DESK-SAME);
- the never-wide phone path (B-NARROW-LOAD short).

## 7. Ableton conformity (C reports separately)
- **CZABA requirement:** a narrowed Studio makes no sound the user cannot see or stop.
- **Ableton:** not applicable. Live has no browser or phone version.
- **Reference-first:** not in scope. This is a bug-gate fix-up of a finding from round 292, and that round recorded "no reference found".

## 8. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-293.md` and change nothing else if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- NG5c cannot be made to fail under its mutant;
- the fix needs any path outside §4, especially `ArrangementContext.tsx` or `ArrangementLibrary*.tsx`;
- a Medium+ regression shows in your own check or your reviewer's. A Medium+ regression is a STOP, never a "known gap" note;
- Biome asks for a new ignore.

## 9. Why we missed it (C-found; short)
- **B spec:** §3.3 of round 292 named a single stop action (`togglePlayback`) for the subtree it unmounted. It did not list the other running sound inside the kept provider. L49 covers "a branch that replaces a call", but not "an unmount that replaces a subtree".
- **A self-check:** A saw the gap and wrote it as a note. L11 already makes that a STOP.
- **Rule added (D-29z730):** L49 gains a clause. When a task unmounts or replaces a subtree while a provider stays mounted, B sweeps every running process that subtree controlled (sound sources, timers, workers) by grep, and gives each one a silence/stop row. No new line; lessons.md stays at 59 lines.

## 9b. Deliverables
- **A:** `a-round-293.md`, with:
  - the changed files;
  - the covering-run counts and the timing list;
  - typecheck, lint and Biome;
  - the NG5c mutant result.

  A STOP goes at the top.
- **C:** `c-round-293.md` and `c-round-293.json`, with evidence under `c-round-293/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding.
- **Root:** publish after C PASS and the gate. Changing paths: the 9 round-292 paths (they include this round's 3).

## 10. Claims (`b-round-292/claims-293.sh`; expected output `b-round-292/claims-293-output.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `88b23dd`; gate 292 `skipped`; gate 291 commit `88b23dd` |
| K2 | `git status --short --untracked-files=all` has 9 lines (A's round-292 paths) |
| K3 | frozen list 1162 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | `studio-lab.tsx` 91 lines; `StopPlaybackOnNarrow` at l.26; l.27 `const { isPlaying, togglePlayback } = useArrangement();` |
| K6 | `studio-lab.tsx` has 0 `stopLibraryPreview` mentions |
| K7 | context type `stopLibraryPreview: () => void` l.339; `useCallback` l.1381; the unmount cleanup effect l.3904–3949 stops the preview at l.3937 |
| K8 | `strings.ts` `previewPlay: 'Preview'` l.867, `previewStop: 'Stop'` l.868 |
| K9 | SWEEP: sound-source hits under the provider = `ArrangementVideoDock.tsx:382`, `graph.client.ts:52` (type), `:214`, `:264`, `preview.client.ts:39` |
| K10 | `studio-narrow-gate-ui.test.tsx` 394 lines, 15 `it('NG` rows, 1 `{ timeout: 15_000 }`, 0 NG5c |
| K11 | doc 218 l.4 `**სტატუსი:** Completed (C round 292 PASS)` |
| K12 | 0 quarter-IV docs start with 219 (this round adds no new doc) |
| K13 | C's round-292 evidence exists: `c292.json`, `mix-probe.json`, `shots/libpreview-1440-narrow.png` |
| K14 | B's artifacts exist: `sketch-route.diff`, `sketch-ng5c.diff`, `sketch-tests.log`, `backlog-before-293.json` |
| K15 | NG5b uses `demo-soft-impact` (1 hit) |
| K16 | `workspace-test-environment.ts`: `class FakeAudioContext` l.33, prototype method `createBufferSource()` l.52 |
