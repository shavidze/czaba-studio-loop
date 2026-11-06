# A round 358 — PERF-10a re-dispatch with the C-R357-01 ruling (b)

STATUS: DONE (A scope) — handed to C. No STOP. Nothing committed or pushed.

## Changed files this round (on top of A's round-357 tree, kept as-is; nothing reverted)
- `app/components/arrangement/StudioWorkspace.tsx` — B's `b-round-357/sketch/source-delta.patch.txt` (sha256 198a5fc2…, matches `patches.sha256`) applied with `git apply`, unmodified: leaf `syncedRef` prev-value guard; `syncFollowWithPlayback(isPlaying, atMount = false)` with `previewText !== null || atMount` string write; mount `useEffect` after `syncFollowWithPlayback` (after tempo-seed).
- `app/lib/arrangement/__tests__/follow-remount-ui.test.tsx` — new, B's `tests-delta.patch.txt` (sha256 aec9083c…, matches) applied unmodified (RM1, RM2).
- `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` — l.4 `**სტატუსი:** In Progress (stage 1 of 3; C round 358 PASS)`; approach items 4 (transition-only leaf) and 6 (mount sync after tempo-seed, string write); rejected alternative (a); mermaid edge; new test file in the files list; problem/solution C-R357-01; tests RM1/RM2 and M-B5/M-B6; C rows incl. REMOUNT, PRE-REMOUNT, G358-AUTH; TODO C358 values + A-R357-TEMPO-SEED-REMOUNT-DUP. 7 TEMPLATE `## ` headings in order. Cited ids RM1, RM2, PS1–PS3, RB-PB1, RB-PB2, FW-PB1 all grep-present in `app/lib/arrangement/__tests__`. `grep -rl 'C round [0-9]* pending' docs/implementation` = 0.
- `git status --short --untracked-files=all`: **57** entries (56 + new test). No `perf/**`, `package.json`, protected or root-lane file touched (K2 outside-root-lanes 0, K6 11/11).

## §3.1 rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: byte-identical to `b-round-357/claims-358-planning-output.txt` | `a-round-358/claims-pre.txt` |
| A-RM-RED | PASS: tests delta applied **first** → RM1 red (received text has the "Tempo 90 BPM from “Slow stem” …" append), RM2 red (expected 3, got 2) = `b-round-357/rm-on-atree.log`; after source delta → 2/2 green | `a-round-358/rm-before-delta.log`, `rm-after-delta.log` |
| A-TYPE | PASS: `npm run typecheck` rc 0 | `a-round-358/typecheck.log` |
| A-LINT | PASS: `npm run lint` rc 0, 205 warnings (≤ 205), 1 info. Scoped Biome `check` on the 2 owned code files rc 0, no fixes | `a-round-358/lint.log`, `biome-owned.log` |
| A-COVER | PASS: `npx vitest run $(cat b-round-357/cover-paths.txt)` → 71 files, **1290/1290**, 123 s. Slowest CP12a 6560 ms vs 30 000 ms describe timeout (< 50 %) | `a-round-358/cover.log` |
| A-MUTANT (scratch `/home/runner/a358-scratch`, removed after) | PASS: M-B1 3, M-B2 2, M-B3 18, M-B4 9 red — red-name sets **identical** to `b-round-357/mutants/sketch-m-b{1,2,3,4}-red.txt`. M-B5 (mount effect deleted) and M-B6 (`|| atMount` dropped): RM1 + RM2 red. `store/` status byte-equal before/after | `a-round-358/make-mutants.py`, `mutant-m-b{1..6}.log`, `mutant-m-b{1..6}-red.txt`, `store-status-before-mutants.txt` |
| A-PERF | PASS (below) | `a-round-358/perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c356.txt` |
| A-REVIEW | PASS: actual `code-reviewer` subagent on the full diff; 0 Critical/High/Medium (below) | below |
| A-CLAIMS final | PASS: K2 `d49536b 57 outside-root-lanes-since-d49536b 0`; K4 `StudioWorkspace:11`; K14 `raw-useArrangement-in-tests 72`; K17 `1 1 1 1`; K18 `2028 / 2353 order seed-first`; K19 `rm-rows 2 strict-mode-in-entry 0`; every other K = planning output. Vs sketch output only K2 differs (scratch git) | `a-round-358/claims-final.txt`, `claims-final-vs-planning.diff`, `claims-final-vs-sketch.diff` |
| A-DOC | PASS (as above) | doc 234 |

## A-PERF
Production build on :5188 via `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`; no vitest/tsc/build/browser job ran concurrently. **Caveat (honest note):** the read-only `code-reviewer` subagent (Read/Glob/Grep only) was running during part of this perf run. All deterministic rows came out exactly as predicted, so I kept the run instead of repeating it.
- rc 0, `1 passed (8.1m)`; `complete` true; `failures` []; 252 rows; asserted 84 / pass 84; **`durationMs` 473232** (≤ 540000).
- `perf-rowcmp.py` vs C356: rc 0; **DIFF only** `interact.play.start-components`, `.6x`, `interact.play.stop-components`, `.6x`: 70 → **28** [28, 28, 28] (= 357 §0.3); 177 EQUAL; 0 NEW. `start/stop-commits` 1, `start-sources` 1 (1× and 6×).
- `store/` status still 57 after the run (`test-results/` is git-ignored).

## Code-reviewer (actual subagent, full diff incl. round-357 files; score 8.5/10)
No Critical/High/Medium. It verified: the mount effect runs after tempo-seed; the ref is written by the leaf's layout effect before passive effects; `syncFollowWithPlayback` has stable deps, so the effect runs once per mount; the string write bumps `statusSequence` as on HEAD; the leaf is a no-op at mount and the leaf is always rendered; no StudioWorkspace effect depends on status in the same commit; TS strict is clean; there is no security surface. No code changed after the review, so no re-review is owed.

New Lows (proposed ids for B; **not fixed**: test edits beyond B's given patch are outside the ruled delta):
- **A-R358-REVIEW-RM1-SEQ (Low):** RM1 checks only the final text. Adding `statusSequence === before + 2` (seed + Follow) would separate "seed appended, then overwritten" from "seed never fired".
- **A-R358-REVIEW-LEAF-GATE-COVER (Low):** the new rows do not pin "one status write per Stop transition while mounted" (leaf double-fire). Existing Follow coverage (M-B3: 18 red, M-B4: 9 red across the 47 Follow files) exercises transitions, but no row pins the sequence on a mounted Stop. C's optional mutant (remove the prev-value guard) is the matching probe.
- Stale-snapshot write-skip on transitions (`StudioWorkspace.tsx` ~2329–2334). Same as HEAD; the reviewer asks that **A-R357-REVIEW-SPLIT-RENDER-LATENT** explicitly cover "the write is skipped", not only "stale text". No new id.
- `useWorkspaceProbe` builds a new object per render (Info). Already in A-R357-REVIEW-FWPB1-TIMING; no new id.

**Architecture note (proposal for B/root, not an instruction):** Follow sync is now a separate lifecycle inside StudioWorkspace: the leaf (~912–936), `committedIsPlayingRef` (~1047), `syncFollowWithPlayback` (~2321–2350) and the mount effect (~2352). Verdict: keep this round, because the mount position must stay where it is to match HEAD. A possible bounded task: extract a `useFollowPlaybackSync` hook owned by StudioWorkspace that keeps the same effect order. Its rows would be RM1 with the sequence check, RM2, a new Stop-transition sequence row, and the existing Follow tests unchanged. This joins A-R357-ARCH-PLAYBACK-SPLIT-HOOKS.

## Known gaps
- I ran no browser row (that is C's). REMOUNT, PRE-REMOUNT and the other browser rows are unverified by A.
- The perf run overlapped with the read-only reviewer agent (see caveat). C's PERF run is the authoritative one.
- I did not run the full vitest suite or `npm run verify` (speed rules: gate rows).
- My production perf build ran on :5188, and mutants used a separate scratch with a `node_modules` symlink. :5173 was not restarted by me; if it serves a stale optimise (504 Outdated Optimize Dep), warm it up or restart it (L38).

## Exact next C checks
1. CLAIMS: `bash b-round-357/claims-358.sh` from the loop root; it should equal `a-round-358/claims-final.txt`.
2. SOURCE-SCOPE: 57 entries. Diff the `StudioWorkspace.tsx` hunks against `b-round-357/sketch/source-delta.patch.txt` (applied verbatim).
3. UNIT: the A-COVER command (71 files). REMOUNT-ANNOUNCE = RM2.
4. MUTANT: C's own, with predictions written first. Suggested: remove the leaf's prev-value guard (expected behaviour-equivalent at mount; check a Stop sequence).
5. PERF alone, compared with `a-round-358/perf-rowcmp-vs-c356.txt`.
6. REMOUNT: `c-round-357/remount-probe3.mjs` on this tree at 1440×900. All 7 step texts should equal `c-round-357/remount3-head.json`, with final `data-playing` false.
7. PRE-REMOUNT record row on HEAD and the tree (tempo seed after resize; typed 100 BPM survives?). This informs the severity of A-R357-TEMPO-SEED-REMOUNT-DUP.
8. PLAY-BEHAVIOUR, FOLLOW, VIDEO-SYNC, VIDEO-FAIL-STOP, NARROW (357 §2.2), and G358-AUTH at both viewports.
9. DOCS: l.4 byte-exact, headings order, cited ids, 0 `pending`.

## Scope completed
Only the §2.1 delta of round 358: B's two patches applied verbatim, and doc 234 updated. Every §3.1 A row passed as listed above. C-R357-01 is fixed in jsdom (RM1/RM2); its browser half is pending C. Not claimed: any C row, browser verification, or completion of PERF-10a or the backlog. For B: the lesson candidate in §5 stays parked for RETRO 368.
