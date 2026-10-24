# A round 148 — V-0.5c: video dock + Studio Lab title in English, final RV-4 sweep (ST51)

Implementer: A · Date: 2026-10-24 · Baseline HEAD 34ce5513e6ff9bb337389333401643c0ef197cc0 · No commit/push/stash/install.

## Start checks (all PASS)
- HEAD 34ce551; `git status --short` empty; frozen list 957 `sha256sum -c --quiet` OK.
- 9 granted start hashes OK; 9 start copies byte-identical (cmp); 2 new paths and `zz-rv4-probe.ts` absent.
- SSR baseline: copy of B's probe under `a-round-148/probe/` (loop-folder vitest config, store untouched). `ssr-probe.test.tsx` printed `CALLS []` = **0 console.error calls** at 34ce551 (`ssr-probe2` failed on its mock path only, as in B's run).
- Baseline 12-file run at 34ce551: 210/210 → `a-round-148/vitest-baseline.json`.

## Changed files (exactly the 11 grants; Edit/Write only; no Biome rewrap)
| Path | Change |
|---|---|
| app/lib/arrangement/strings.ts | appended `studioVideoDockStrings` (17 keys, §1.1 literals) |
| app/components/arrangement/ArrangementVideoDock.tsx | 18 uses (l.54,56,203,204,227,881,888,901,909,937,947,955,964,965,976,977,989,990 at 34ce551 numbering) + 1 import (between `panels` and `video` imports). 18 −, 19 + |
| app/routes/studio-lab.tsx | l.8 title `Studio Lab — Demo workspace | CZABA` |
| __tests__/strings.test.ts | imports (`readdirSync`, `statSync`, `relative`, `studioVideoDockStrings`); ST40 → `[]` + `toContain` title; ST47 both loops + dock, route, `./video-dock-strings-ui.test.tsx`; new ST50, ST51 (+ `EXPECTED_VIDEO_DOCK_STRINGS`, `collectWorkspaceSourceFiles`) |
| __tests__/floating-video.test.tsx | l.136, l.137, l.313 |
| __tests__/render-budget.test.tsx | l.370, l.450, l.454 → `No video ·` |
| __tests__/default-track-names-ssr.test.tsx | `expect(consoleErrorSpy).not.toHaveBeenCalled();` last in DS1 and DS2 |
| __tests__/purchased-collection-ui.test.tsx | the two negative assertions (actual lines 298–299; task said 297–298) → `Demo collection` / `no sign-in required` |
| docs/.../120-studio-v0-library-panel-strings.md | l.4 status, l.98 sentence only |
| NEW __tests__/video-dock-strings-ui.test.tsx | VDS1, VDS2, VDS3 (local Latin-only fixture) |
| NEW docs/.../121-studio-v0-video-dock-strings.md | Georgian implementation doc, status `In Progress (C round 148 — ჯერ არ გაშვებულა)` |

## Tests actually run
- `npm run typecheck` exit 0; `npm run lint` exit 0 (pre-existing warnings only, none in changed files); read-only `npx biome check` on the 9 code/test files: 0 diagnostics.
- `npx vitest run` on the 13 files: **215/215** → `a-round-148/vitest.json`.
  Per-file `it` counts vs 34ce551: strings 49→51; video-dock-strings-ui new 3; floating-video 45, render-budget 7, default-track-names-ssr 2, purchased-collection-ui 6, video-fades-ui 10, video-import-status-ui 4, library-video-return-focus 10, ssr-layout-effect 4, workspace-strings-ui 2, video-sync 58, studio-lab-demo 13 — all unchanged.
- New file re-run 3× extra: 3/3 each time.
- **VDS3 reached in jsdom** (no §3.2 exit taken): mocked `probeVideoFile`/`decodeVideoAudio` (no-audio), `readyState` getter → 4, `play` rejects `NotAllowedError`, manual rAF; status exactly `Video playback failed — try MP4 (H.264) or WebM.` and `isPlaying === false`.
- Not run (gate rows): full suite, `npm run verify`, build, e2e.

## Mutations (Edit → run → restore by Edit → sha256 = post-edit; JSON in a-round-148/mutations/)
| ID | Red | Restore |
|---|---|---|
| m107 overviewNote '· Whole project' | ST50, VDS1 | OK |
| m108 l.976/977 ternary branches swapped | floating-video (7 its), VDS1, VDS2 | OK |
| m109 gap literal `ვიდეო არ არის ·` | ST47, ST51, render-budget (2 its) | OK |
| m110 PLAY_FAILED = empty | VDS3 only | OK |
| m111 route Georgian title | ST40, ST47, ST51 | OK |
| m112 `console.error('m112');` first in StudioLabRoute | DS1, DS2 | OK |
| m113 `zz-rv4-probe.ts` = 'ქ' | ST51 only (message names `../zz-rv4-probe.ts`) | rm'd; absent in git status |
Note: per-file sha checked after every restore; frozen-list check run after m113 and at end (no frozen file edited at any time). m108 was re-run after the post-review VDS2 tweak (drag/close by role), against the shipped test files: floating-video 7 red, VDS1 + VDS2 red (`mutations/m108.json` overwritten); restored, dock sha = post-edit, end-sha256 and frozen 957 OK again. m107/m110 not re-run: VDS1 and VDS3 were not touched by the review edit. Byte-level proof of "no other dock token changed": `git diff` on the dock is exactly 18 −/19 + lines (the 18 uses + import), no other hunk.

## End checks
- Frozen 957 OK. `git status --short` = 9 ` M` grants + 2 `??` new files, nothing else; no `zz-rv4-probe.ts`.
- `git diff 34ce551 --` all in-repo `global_forbidden_files` (+ studio.$productId, api.studio-token, auth, AuthContext, Modal, account.downloads, download-routes test, root.tsx, StudioContext): empty.
- `a-round-148/end-sha256.txt` (11 paths); `a-round-148/diff-vs-start.patch` (vs start copies; new files from /dev/null).
- Non-comment Georgian lines: ArrangementVideoDock.tsx 0, studio-lab.tsx 0.

## Code-reviewer (real subagent run)
Verdict: no Critical/High/Medium; 4 Low; score 9/10. Addressed: Low 2 (drag/close now queried by role + name), Low 4 (doc 121 line numbers), Low 1 documented in doc 121 (VDS3 relies on ~50 ms real-time start hold and on stopped-sync setting `video.src` before `togglePlayback`; reordering would hit the 1500 ms seek timeout). Low 3 not changed: `getByText` proves presence, not visual visibility (jsdom has no layout; C COPY-DOCK checks visibility); overview label via `previousElementSibling` (no testid, no ownership to add one).

**Architecture note (verbatim, for B):**
> - Signal 3, the same region changes again and again: `app/lib/arrangement/strings.ts:709`. This is the 24th `studio*Strings` object, and every V-0 round has edited this file, with near-identical names now (`studioVideoStrings` / `studioVideoDockStrings`). **Keep**: it's a leaf module, plain strings, low cost for now. Proposal for the planner: fold this into the already-requested checkpoint, §8(a) and §8(e). No new task.
> - Signal 1, mixed responsibility: `app/lib/arrangement/__tests__/strings.test.ts:2499` (`collectWorkspaceSourceFiles`). A filesystem walk now lives inside the strings unit-test file, next to `normalisedGeorgianLines` and `stripSourceComments`. **Keep** this round. Proposal for the planner: fold it into checkpoint §8(b), the shared Georgian-scan helper. No separate task.
> - This reviews the diff only. It is not a claim that the whole module was checked.

## B acceptance (A part) — truly passed
- §1.1/§1.2 exact strings and codepoints; dock other tokens unchanged (reviewer read-through + diff-vs-start patch). ✔
- §2 ownership only; protected diff empty; probe deleted. ✔
- §3.1 ST50, ST51 (real recursive walk, ≥60 guard); ST40/ST47 edits. ✔
- §3.2 VDS1–VDS3 (VDS3 reachable). ✔
- §3.3 m107–m113 all red as required. ✔
- §3.4 typecheck/lint/Biome 0, 13-file vitest 215/215, counts as allowed, code-reviewer run. ✔
- Not claimed: any C browser row, gate rows.

## Known gaps
- No browser check by A (C's rows). VDS3 timing dependence noted above.
- Task line refs for purchased-collection (297–298) were off by one (actual 298–299); edited the intended assertions.

## Exact next C checks
T148-TARGETED (same 13 files, expect 215), SOURCE-SCOPE (against `a-round-148/end-sha256.txt`), AN-REVIEW, COPY-DOCK (a–d), PLAY-FAIL, VIDEO-SYNC, TITLE-LANG, NO-GEORGIAN, LAYOUT-DOCK, LAYOUT-REST, RV1-RECAPTURE, G148-3, PX-NET/REG-HYD — per current-task.md §4, on http://127.0.0.1:5173/studio-lab.

## Scope status
A-side of V-0.5c complete; awaiting C round 148. Backlog/V-0 not self-marked complete.
