# A — Round 65 report: SRW-15 stage 1 (FB-09 + FB-11), project BPM and bars/beats ruler (grid only, D-29z30)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-19 · Task: `current-task.md` (round 65).
**I make no PASS claim.** C owns acceptance. I did no commit, push, deploy or install. I did not start or stop the dev server or the backend.

## 1. Pre-flight, baseline, red run

**Pre-flight gate (posted before code):**
- Assumptions:
  - Tempo is a non-history view preference: `useState` in StudioWorkspace next to snap/grid.
  - The bars strip is display-only.
  - Commit happens only on blur. Enter blurs; Escape sets a skip flag and blurs.
  - Nothing in audio, the seconds ruler or the model changes.
- Smallest version: `tempo.ts` (~85 lines), `ArrangementTempoRow.tsx` (~165 lines), 4 StudioWorkspace edits (+21/−1), two test files.
- Files: only the six in §3.1.
- Success: both new files fail first (red run); afterwards vitest 91/1605, tsc 0, build rc 0, 0 Biome diagnostics on owned files, `npm run verify` rc 0.

**Read before the first edit:**
- `rules/read-primitives.md`;
- primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS;
- `prompts/studio-feature.md`, `new-component.md`, `new-test.md`;
- `docs/implementation/TEMPLATE.md`;
- `skills/pre-flight/SKILL.md`.

I did not consult design-philosopher (optional).

**Baseline (before any edit, ~15:45 +04):**
- HEAD `f9d768cad3550c9529a2969523fb6b2da945d5b7`; `git status --short` was empty.
- Frozen list: 0 not-OK (424/424).
- Snapshot `StudioWorkspace.tsx: OK`; `cmp` same.
- Protected files 4/4 OK.
- `node.exe` 7.
- `:5173/studio-lab` 200; `:5199/api/products` 200.

**Red run** (`a-round-65/red-run.txt`): both test files were written before any source file. Both failed with `Failed to resolve import "../tempo"` (Test Files 2 failed, no tests ran).

## 2. Diff summary (all files LF, CR=0; measured on the final files, `a-round-65/end-state.txt`)

| File | Change | LF lines |
|---|---|---|
| `app/lib/arrangement/tempo.ts` (new) | Exports `TEMPO_BPM_MIN/MAX/BEATS_PER_BAR`, `TEMPO_INVALID_MESSAGE`, `TEMPO_EMPTY_HINT`, type `BarsRulerMark`, `parseTempoBpm`, `formatTempoBpm`, `tempoStatusMessage`, `barsRulerMarks`. Pure; imports only `RULER_*` from `./view`. Times are computed from the index. A finite/positive guard was added after review. | 87 |
| `app/components/arrangement/ArrangementTempoRow.tsx` (new) | **Header cell:** `BPM`, input with the §0.1(7) attributes and title, `4/4`. **Draft logic:** `draft: string \| null`; blur is the only commit path; Enter → blur; Escape → `skipCommitRef` + reset + blur; `onFocus` resets the ref. **Strip:** `memo` `ArrangementBarsRuler({seconds, pxPerSecond, bpm})`, display-only, no context or store; marks carry `data-kind`/`data-time`/`style.left`; tokens `border-outline`, `text-muted`, `bg-surface`, `bg-background`, `ring-brand`. | 166 |
| `app/components/arrangement/StudioWorkspace.tsx` | Exactly the enumerated edits (diff `a-round-65/diff-studioworkspace.patch`, +21/−1): 2 imports; `tempoBpm` state; `changeTempo`/`rejectTempo`; guard (0) `!(event.target instanceof Node && focused.contains(event.target))`; `<ArrangementTempoRow>` between the seconds-ruler row and the loop row. | 1832 |
| `app/lib/arrangement/__tests__/tempo.test.ts` (new) | T1–T10 | 147 |
| `app/lib/arrangement/__tests__/tempo-ui.test.tsx` (new) | U1–U12, one `describe` with `{ timeout: 15_000 }`. The harness is copied from `grid-snap-ui.test.tsx`, which is unchanged. | 470 |
| `docs/implementation/2026/quarter-IV/058-studio-lab-tempo-bars-ruler.md` (new) | Georgian doc 058 with the §2.5 sections. | 141 |

`git status --short` at the end: exactly 6 lines (1 `M` and 5 `??`), as §3.1 expects.

## 3. Tests (alone run, final files: `a-round-65/alone-owned-test.txt`)

- **T1–T10:** all passed, each ≤ 1 ms.
- **U1–U12:** all passed. Durations:

  | Test | ms |
  |---|---|
  | U1 | 453 |
  | U2 | 236 |
  | U3 | 195 |
  | U4 | 144 |
  | U5 | 231 |
  | U6 | 174 |
  | U7 | 152 |
  | U8 | 116 |
  | U9 | 135 |
  | U10 | 76 |
  | U12 | 127 |
  | U11 | 130 |

- Total 22/22, duration 6.56 s. No test took over 3 s.

**Test notes:**
- **U3:** collects the seconds-ruler tick `style.left` list from direct `div` children, excluding the handle and its sibling playhead line. It also checks that the model is deep-equal (`structuredClone` before), that `undoLabel` is null, that the Undo title is unchanged, and that `data-snap`/`data-grid-seconds` are unchanged.
- **U12:** has both halves. A pointerdown inside the field keeps focus with no commit and no status. A pointerdown on a lane body still blurs the field.
- **U11:** sets the zoom through the real `arrangement-zoom` slider (`sliderPositionFromZoom(40)+12`). It reads `live(api).pxPerSecond` and asserts it is no longer 40. It then checks every mark's left ≈ `data-time × zoom`, that the strip width equals the seconds-ruler width, and that the strip width equals `secondsBefore × zoom`.

## 4. Mutations a–n (`a-round-65/mutations.txt`, script `a-round-65/mut.mjs`)

**Setup:**
- Scratch: `a-round-65/scratch/` (a copy of `app/`, a `node_modules` junction and my own `vitest.config.mts`).
- Files run: `tempo`, `tempo-ui`, `render-budget`, `track-layout`, `fader-focus-order`, `pending-status`.
- Unmutated: 6 files, 92/92 passed.
- After the run, all three source files in scratch were restored (`restored=true`).
- The table below is the run on the **final** files, after the review fixes.

| # | Mutation | Killed |
|---|---|---|
| a | 999 bound removed | T3, U5 |
| b | `,` not accepted | T2 |
| c | `barStep` always 1 | T7, T9 |
| d | beats when `barStep > 1` | T7, T9 |
| e | right-edge label suppression removed | T7 |
| f | bar time = `k × round(240/bpm, 3)` | T5, U2 |
| g | default tempo 120 | U1, U12 |
| h | Escape commits (skip flag removed) | U6 |
| i | blur does not commit | U2–U9, U11, U12 (10 tests) |
| j | strip fixed at 40 px/s | U11 |
| k | same-value commit writes the status | U9 |
| l | invalid path keeps the typed text | U5 |
| m | `contains` guard removed | U12 |
| n | guard made `!isTypingTarget(focused)` (never blur a typing target) | U12 |

There were no survivors.

**Strengthening for (a), done in advance:**
- §2.2's literal T3 list (`'1000'`) and U5 (`1000`, `abc`) cannot catch mutation (a). The regex `^\d{1,3}…` already rejects `1000`, so the 999 check only matters for values from 999.01 to 999.99.
- I added `'999.5'` to T3 and as a third value in U5.
- Proof: `a-round-65/mut-a-without-999.5.txt`. With mutation (a) and without `'999.5'`, 22/22 pass, so (a) survives.
- This is strengthening within §2.2, not a rewritten assertion. **B:** please add `999.5` to the spec lists, or confirm.

## 5. Browser smoke (gstack; not a PASS claim). Evidence: `a-round-65/smoke.txt`, `smoke-1440-bpm90.png`

**Daemon:**
- The gstack CLI daemon failed once (`Server failed to start within 15s`).
- Per harness_rules I started my **own** `server-node.mjs`:
  - `BROWSE_PARENT_PID=0`, state `tmp/studio-real-loop/a-browse.json` (orchestrator path);
  - log `a-round-65/daemon.log`; PID 33456, port 23585.
- `browse chain` (JSON on stdin) printed nothing on this host, so I ran the commands one by one.
- `browse stop` printed "Unable to connect" and PID 33456 was still running. I checked its command line (`server-node.mjs`, my PID) and ended it with `taskkill /PID 33456 /F`. The state file is gone and `node.exe` is back to 7.
- I killed no other process. I did no `$B restart`.

**Steps** (1440×900, `/studio-lab`, wait for the selector + 4 s, ENV-EXT-LOAD-HANG):

| | Before | After clicking the field, typing `90`, Enter |
|---|---|---|
| `data-bpm` | `''` | `90` |
| Bar marks | 0 | — |
| Strip text | the hint | — |
| Header text | `BPM4/4` | — |
| Status | — | verbatim `ტემპი 90 BPM · 4/4 — ტაქტების სახაზავი განახლდა. მხოლოდ ბადეა: აუდიო არ იწელება.` |
| Field focus | — | not focused |
| Zoom | — | 40 px/წმ |

- Before: 4 lanes, demo badge present, `scrollWidth` 1440 = viewport.
- After, bars relative to the strip's left edge:

  | Bar | `data-time` | Offset (px) |
  |---|---|---|
  | `1` | 0 | 0 |
  | `2` | 2.666667 | 106.66 |
  | `3` | 5.333333 | 213.33 |
  | `4` | 8 | 320 |

- Chrome row order: seconds ruler → bars → third row. The probe did not label the third row (the brace testid appears only once a loop exists; the row holds `arrangement-loop-strip`). The screenshot shows it is the Loop row.
- `scrollWidth` was still 1440 after the change.
- **Network** (166 requests): the only API request was `GET http://localhost:5199/api/cart` (pending/CORS), which root allows. There were no `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 requests.
- **Console errors:** only the CORS errors for `/api/cart`. No hydration warning appeared in `console --errors`. This is not a REG-HYD verdict; that is C's.

## 6. Code review (real `code-reviewer` subagent, read-only). Score 8.5/10; no Critical, High or Medium findings

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Low | `barsRulerMarks` hangs on `Infinity` for `seconds` or `bpm` (the guard let it through) | **Fixed:** `Number.isFinite` on all three inputs plus `> 0`. The UI could not reach this. |
| 2 | Low | In U5's loop the status check only bites on the first value | **Fixed:** `pressG()` before each value, plus `expect(status).not.toBe(TEMPO_INVALID_MESSAGE)` first |
| 3 | Info | U11's `Math.round(width/zoom)` check was a tautology | **Fixed:** now `stripWidth ≈ secondsBefore × zoom`, plus the existing ruler-width equality |
| 4 | Info | `'999.5'` is not in the frozen lists | Kept on purpose (§4); reported to B |
| 5 | Info | The `contains` guard also affects a focused grid-division `<select>`: a pointerdown on it no longer blurs it | Intended by §0.1(10). The loop brace, range inputs and the library search/faders outside the scroller are unchanged. **C:** FOCUS-REG may cover the select. |
| 6 | Info | `key={mark.time}` is unique | No change |
| 7 | Info | The input is 16 px tall (`h-4`), below the WCAG 2.5.8 24 px target; `ring-1` vs the select's `ring-2` | Not changed: the spec fixes the `h-5` cell, and a `ring-2` would be clipped by the cell's `overflow-hidden`. Forwarded to B/Tech Lead (R65-T). |

After the fixes:
- The two test files were re-run alone: 22/22.
- Mutations a–n were re-run on the final files with the same kills (§4).
- Biome on owned files and tsc were re-run.
- `npm run verify` was re-run (§7).

**Architecture note (for B and root, not implemented):**
- Signal 4: `tempoBpm` is new state in an existing owner, StudioWorkspace (l.333, l.843–850). The reviewer says **keep for now**: same lifecycle as snap/grid, no refs, and the memo strip contains the render cost.
- **Proposal:** fold "where tempo lives" into **ARCH-CHECKPOINT-SRW14-PREFS (a)**. Decide it before SRW-15 stage 2, because the metronome needs the BPM inside the audio pipeline and SRW-14 stage 5 needs it inside grid/snap.
- Also confirmed: (c) the copied harness. `tempo-ui.test.tsx` is one more file that copies the fake audio classes.

## 7. Command tails

```
tsc --noEmit                                        → rc=0 (a-round-65/tsc.txt)
npx biome check <5 owned files>                     → Checked 5 files … No fixes applied. rc=0 (biome-owned.txt)
npx biome check ./app                               → Found 4 errors / 218 warnings / 1 info (biome-app.txt)
  errors (biome-app-errors.txt): auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts — all `format` (baseline CRLF)
npx vitest run (before the review fixes)            → Test Files 91 passed (91), Tests 1605 passed (1605) (vitest-full.txt)
npm run build (before the review fixes)             → ✓ built in 5.26s, rc=0 (build.txt)
npm run verify #1 (before the review fixes)         → verify rc=0, 91/1605, 0 "Test timed out" (verify.txt)
npm run verify #2 (FINAL files)                     → verify rc=0, Test Files 91 passed, Tests 1605 passed, ✓ built ×2, 0 "Test timed out" (verify-final.txt)
node.exe: 7 before verify #2, 8 right after it (Biome still running), 7 at the end (end-state.txt)
End: HEAD f9d768c…; frozen 0 not-OK; protected 4/4 OK; :5173 200; :5199 200
```

- Verify #2 runs lint, tsc, the full vitest suite and build on the final tree. I did not run a separate `npx vitest run` or `npm run build` after the review fixes; verify #2 covers both.
- I did not run `npm run test:e2e:smoke` (root's) and did not run PW in parallel.
- **Biome info:** one earlier combined owned-file run printed "Found 1 info". Every later run, per file and combined, showed 0 diagnostics, including the final run. I could not reproduce it.

## 8. Deviations and known gaps

1. **`'999.5'` added to T3 and U5** (§4). This is strengthening against a proven survivor and is within §2.2.
2. **Browse state path:** `tmp/studio-real-loop/a-browse.json`, per the orchestrator override, instead of the round folder.
3. **`browse chain` did not work** on this host (empty output, rc 0). I ran the commands one by one.
4. **The empty-strip hint is anchored at left-2 in the strip.** If the view is scrolled right, the hint is off-screen; the BPM field stays visible in the sticky cell. Not in the spec; noted for B.
5. **The input is 16 px tall** (reviewer #7); a Tech Lead feel check is R65-T.
6. **The `<select>` focus change** from the shared guard (reviewer #5) is intended. No existing test covers it.
7. **Scratch:** `a-round-65/scratch/` holds a `node_modules` junction. I deleted nothing; root decides whether to remove it.

## 9. Exact next checks for C (from §4; I verified none in a real browser beyond the smoke)

- **R65-S:**
  - `diff -u` StudioWorkspace against the snapshot: only the enumerated edits (also in `diff-studioworkspace.patch`).
  - `tempo.ts`: pure, imports only `./view`.
  - The strip is `memo` with 3 props, no context or store, no pointer handlers.
  - The UI literals are byte-exact.
  - All owned files are LF.
- **R65-U:**
  - Red run in C's own scratch.
  - Mutations a–n, plus (o) the strip placed above the seconds ruler and (p) 0.1 rounding, which `'120.25'` in T2 should kill.
- **G65-1:** tsc, build, Biome 4/218/1, vitest 91/1605, verify rc 0.
- **G65-2:**
  - Protected 4/4 and frozen 424/424.
  - 6 status lines.
- **§4.6:** TB-DEFAULT\*, TB-SET90\*, TB-120, TB-SECONDS\*, **TB-NOSTRETCH** (WAV sha256 identical across no BPM / 90 / 120 on a non-empty fixture), TB-INVALID, TB-DECIMAL, TB-ESC, TB-CLEAR, TB-KEYS\* (including a click inside the focused field), FOCUS-REG (and the focused grid select), TB-ZOOM, TB-UNDO, TB-LAYOUT\* at both viewports, TB-SNAP-REG.
- **§4.7:** LB-LOADING-REG, RU-REG, REG-HYD.
- **G65-3:** token rows 401/403.

## 10. Scope completed and B acceptance status

**Done by A:**
- §0.1/§0.3 implemented.
- §2.2 tests: 22, all passing.
- §2.3 mutations a–n: all killed.
- §2.4 self-check, Biome, real code review, verify.
- One browser smoke.
- §2.5 doc 058.
- This report.

**No B/C acceptance row is marked PASS by A.** The §4 rows are C's.

**Carried follow-ups for C and B** (from `root-pre-push-review.md` and `publication-checkpoint.json`, as listed in §4.10; not touched this round):
- Root push of `f9d768c` to `shavidze/czaba-store` (ROOT-PUSH-R64-SHAVIDZE).
- Video sync: RF3-1, RF3-2, R5-L6 (C-R27-01).
- M1: loop refill is rAF-only, so a hidden tab goes silent.
- M2: per-frame position re-render.
- Lows L1–L4, L6–L8.
- SRW-21: the purchased loader hardcodes `middle-east`.
- The SRW-23 scrollbar check at both viewports.
- SRW-11/12 parity.
- ROOT-R64-L2…L6.
- ARCH-CHECKPOINT-SRW14-PREFS (a)–(d), now with a BPM consumer.
