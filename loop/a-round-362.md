# A — Round 362: PERF-10b-ii-a (Play/Stop leaf, reader-only playback hook)

**Result:** implemented as dispatched, no STOP. Evidence is in `a-round-362/`. The A rows in §2.1 that I actually ran are listed below. B-R356-PLAYBACK-SETTER is closed in code, pending C.

## Changed files (exactly 7; `git status` = 7 M, 0 untracked)
1–5. `app/components/arrangement/ArrangementTransport.tsx`, `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementMarkerRow.tsx`, `app/lib/arrangement/__tests__/playback-store.test.ts`, `app/lib/arrangement/__tests__/render-budget.test.tsx`: `patch -p1 < b-round-361/sketch.patch.txt`, applied unchanged. Both patch sha256 values matched `sketch-dispatched.sha256` first.
6. `perf/budgets.interactions.json`: `git apply b-round-361/budgets.patch.txt`, applied unchanged.
7. `docs/implementation/2026/quarter-IV/234-perf-playback-store.md`, per §1.2:
   - l.4 is byte-exact.
   - New `### ეტაპი 4: PERF-10b-ii-a (round 362, D-29z1177)`, containing the premise, the design, the budget table and rules, the MU-A/B/C table and the B-R356 closure.
   - 6 dated bullets in `## შეცვლილი ფაილები`.
   - A stage-4 bullet in `## ტესტირება`.
   - The TODO bullet is split into 10b-ii-a (struck through) and 10b-ii-b.
   - `## ` count is 7.
   - **UC7 wording, disclosed:** the stage-3 clause now reads `UC7 (არსებული, უკვე HEAD-ზე: დამალული active lane … library add-ს მაინც იღებს)`. I kept the original UC7 description after the colon. K14 `uc7-existing` = 1. The exact literal `UC7 (არსებული, უკვე HEAD-ზე)` with a closing paren directly after it does not appear. B/C: if the task meant to replace the whole parenthetical, this is a doc-wording delta.

## §2.1 rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | equals `claims-362-planning-output.txt` (empty diff) | `a-round-362/claims-pre.txt` |
| A-CLAIMS final | <ul><li>K3, K4, K5, K7, K11, K12 and K15 equal the sketch output.</li><li>K1, K6, K8, K9, K10, K13 and K16 equal the planning output.</li><li>K2 = `6fdd82f 7`.</li><li>K14 = `doc234-l4 ef9813ea doc234-h2 7 doc234-stage4 1 doc234-uc7-existing 1`.</li></ul> **PASS** | `a-round-362/claims-final.txt` |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-362/typecheck.log` |
| A-LINT | `npm run lint` rc 0: 205 warnings (≤ 205) and 1 info | `a-round-362/lint.log` |
| Biome scoped (/check) | `biome check` on the 5 code files plus the budgets JSON: rc 0, "Checked 5 files", no fixes. The JSON is excluded by the Biome config, so 5 files were checked, not 6 | `a-round-362/biome-scoped.log` |
| A-TESTS | <ul><li>15 files and 284 tests pass, equal to B's `sketch-covering-final.log`.</li><li>PS4 and RB-PB2 are named in the log.</li><li>The slowest test took 1926 ms. TC10 took 972 ms; B measured 4487 ms against a declared 15000 ms.</li><li>No test is above 50 % of its timeout.</li></ul> | `a-round-362/covering.log` (`covering.clean.log` without ANSI codes) |
| A-PERF-LIB | 40/40 rc 0 | `a-round-362/perf-lib.log` |
| A-PERF | <ul><li>rc 0, `complete` true, `failures` [], 252 rows.</li><li>Asserted rows: 95/95 pass, 0 NEW.</li><li>Play start/stop: 11 ×3, and their `.6x` copies 11 ×3.</li><li>`interact.click.components`: 38 ×3, and its `.6x` copy 38 ×3.</li><li>Rowcmp against C361: 44 DIFF and 137 EQUAL. The DIFF lines are byte-equal to B's `perf-final-rowcmp.txt`, and all are decreases.</li><li>`durationMs` 451609 (≤ 540000).</li></ul> | `a-round-362/perf.log`, `a-round-362/latest-interactions.json`, `a-round-362/perf-rowcmp.txt` |
| A-MUTANT | Not re-run; I cite B's: `b-round-361/mutants/MU-A-render-budget.log`, `b-round-361/perf-mu-b.log` with `perf-mu-b-rowcmp.txt`, and `b-round-361/mutants/MU-C-ps4.log` | — |
| A-REVIEW | `code-reviewer` subagent on the 7 files: no Critical or High. One Medium is already ruled; the Lows are routed (below). No edits after the review | below |
| A-DOC | as §1.2, with the UC7 note above | doc 234 |

**L38 disclosure.** The perf spec was the only perf or test process running, but the scoped Biome run (under 1 s), the doc edits and the code-reviewer subagent (read-only, about 65 s) overlapped it. All deterministic rows still equal B's, and `durationMs` is lower than B's 503995.

## Code-reviewer result (score 8.5/10)
- **Medium:** the doc already says "C round 362 PASS" (l.4, the TODO strike and the `c-round-362.md` reference) before C has run. **Ruled by the task:** §1.2 and lesson L28 require this post-PASS wording. It is not a STOP; C's DOC row checks it.
- **Low, for B:** the mermaid diagram under `## არქიტექტურა` in doc 234 is stale. It still shows `useArrangementIsPlaying → ArrangementTransport`, and `getState → ArrangementMarkerRow` instead of the reader. §1.2 does not grant this section, so I did not edit it.
- **Low, for B:** the stage-1 history text in doc 234 is now stale. The RB-PB2 description says "Transport და follow leaf > 0", a Problems/Solutions line says "Transport-ს რჩება > 0", and the context section names `useArrangementPlaybackStore`. These describe earlier stages; the reviewer suggests a "(superseded in stage 4)" note. Not granted, not edited.
- **Low, for B:** `ArrangementContext.tsx`: the private `useArrangementPlaybackStoreContext()` throws `'useArrangementIsPlaying must be used within an ArrangementProvider'` even when `useArrangementIsPlayingReader` is the caller. This is outside the sketch, so I did not edit it (§1.1).
- **Info (checked fine):**
  - `togglePlayback` and `returnToStart` are stable `useCallback`s, so the memo is effective.
  - `aria-describedby` points at the span created by the leaf's own `useId`.
  - `useArrangementPlaybackStore` has 0 remaining callers in `app/` and `perf/`.
  - The only other `setPlaying(` calls are local `useState` setters in `SfxSceneBuilder.tsx` and `SfxQuickEdit.tsx`, unrelated to the playback store.
  - No assertion was weakened.
  - PS4 only checks export names; a renamed re-export would pass it.
- **Architecture note (for B, verbatim summary):** none for this round. Signal: `ArrangementContext.tsx` keeps gaining one-field store hooks (`useArrangementActiveTrackId`, now `useArrangementIsPlayingReader`). If PERF-10b-ii-b adds more, B could plan a bounded task to move the store-context lookups into `app/lib/arrangement/`. Keep them where they are for now: the provider owns the store lifecycle.

## Known gaps
- I ran no browser behaviour probe (PLAY-STOP, MARKER-NONE, VIDEO-FAIL-STOP-1, G362-AUTH). These are C rows.
- I did not run full vitest, build or `npm run verify`; the root gate runs them.
- The UC7 wording delta and the three doc/code Lows above are not fixed, because they are outside the grant.

## Exact next C checks (§2.2)
- **CLAIMS:** `bash b-round-361/claims-362.sh` must equal `a-round-362/claims-final.txt`.
- **SOURCE-SCOPE:**
  - 7 M and 0 untracked.
  - `patch -p1 -R --dry-run < ../tmp/studio-real-loop/b-round-361/sketch.patch.txt` reverse-applies.
  - `git apply -R --check` of `b-round-361/budgets.patch.txt` passes.
  - Doc 234 is the only doc changed.
- **PERF:** alone, production, compared against `c-round-361/latest-interactions.json` and B's `perf-final-rowcmp.txt`. A's run is `a-round-362/perf-rowcmp.txt`.
- **PERF-LIB** (40/40) and **MUTANT** (C's own: for example an inline-arrow `togglePlayback` prop, or the state span kept in the Transport body).
- **PLAY-STOP** at both viewports, and **MARKER-NONE**: Ctrl+Right while stopped gives "No more markers after the insert marker"; while playing it gives "…after the playhead".
- **VIDEO-FAIL-STOP-1** and **G362-AUTH**.
- **DOCS:**
  - l.4 is byte-exact.
  - 7 `## ` headings.
  - The stage-4 numbers equal the budgets file and `b-round-361/perf-final.log`.
  - UC7 is called existing; see the wording note above.
  - 0 "pending" docs.

## Scope completed
PERF-10b-ii-a only. PERF-10b-ii-b (the C-R320-01 render-budget row and the GATE320-S3 record row) is routed and not started. I did not edit the backlog or feature-status, and I made no commits.
