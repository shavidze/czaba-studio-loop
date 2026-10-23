# A — Round 115: T12 stage 2, multi-clip Clip Gain (T12.7) + GATE114-S1/S2/S5

Implementer: A (Claude Opus 5.5) · Date: 2026-10-23 · Task: `current-task.md` (round 115, D-29z80)

## Start state
- HEAD `38c0e212e8630f6965ceafedebc03435d2fd47f7`; `git status` was clean.
- Frozen list `b-round-114-r115-tree-sha256.txt`: `sha256sum -c --quiet` gave **OK** at the start.

## End state
- Frozen list: **OK** at the end. Protected files, by SHA-256 prefix:
  - `studio.$productId.tsx` `fa2cf0bc`
  - `api.studio-token.ts` `13914809`
  - `auth.ts` `56f5b76f`
  - `AuthContext.tsx` `bf9ee257`
- These are unchanged versus `38c0e21`, as are `model.ts`, `fader.ts` and `useRelativeFaderDrag.ts`.
- `git status --short` matches the expected end state:
  - ` M` `ArrangementDetailPanel.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, doc 098, and the five granted tests (`clip-gain-fader`, `clip-gain`, `detail-panel-fit`, `detail-panel-reason`, `pending-status`).
  - `??` `clip-gain-multi.ts`, `clip-gain-multi.test.tsx`, doc 099.
- `git diff --stat 38c0e21` (tracked files): 9 files, +413/−97. New files: 114 + 676 + 92 lines.
- No commit, push, stash, checkout, deploy, server restart, `npm run check` or `npm run format`.
- I did run `biome format --write` and one `biome check --write` (import order only) on my own owned files. Neither touched other files.

## R11 mechanism and why
- **Mechanism:** the existing pending slot is generalised to a **member-set key**: `clipGainMemberKeyRef` plus `clipGainMemberIdsRef`. `ClipGainFaderGesture.clipId` became `memberKey`.
  - The key is the sorted ids, so one clip's key is just its id.
  - Commit, begin and blur now live in key-based internals (`commitClipGainPending`, `beginClipGainGesture`, `blurClipGainPending`).
- The stage-1 functions keep their signatures and are thin wrappers. `previewClipGainFader` is the one exception: its body is unchanged apart from the renamed ref.
- **New set-based functions:** `previewClipGainMembers`, `setClipGainMembers`, `commitClipGainMembers`, `beginClipGainMembersGesture`, `blurClipGainMembers`.
- **Why:**
  - There is still one Clip Gain pending machine, so there is no second flush path to wire into the roughly 10 flush sites.
  - Single-clip behaviour is unchanged by construction. CF1–CF14 are green with only the granted edits.
  - Volume/Master pending machines were not merged (ARCH-R81 is untouched).
- **Previews:** `delta = anchor − max(before)`, where `before = clipGainBeforeRef ?? present`. The targets are computed from `before` and written onto the live `present`.
- **Multi status:** `Clip Gain: N კლიპი — {range}.` is set in the context when the commit really writes an entry. It has to be there because the drag commit happens in the window-capture `pointerup`, before the panel's handler runs.

## Range node and measured layout (my own Playwright probe; a sanity check, not C acceptance)
- **Placement:** the range node (`data-testid="arrangement-detail-clip-gain-range"`, mono, `whitespace-nowrap`) sits **beside the field on the field's row**, inside the existing label. No new row.
- **First probe failed (real finding):** at 1280 the worst case `−60.0 … +24.0 dB` (115.2 px) squeezed the field from 80 to 72.8 px. The range text ended exactly at the block edge.
- **Fix:** the field got `shrink-0` and the block widened from **`w-48` to `w-52`** (208 px). That is within the `w-56` cap; reported per R12.
- **Measured after the fix:**

| Viewport | State | Block w × h | `scrollW` / `clientW` | Range node | Field w | All 4 controls inside the panel box |
|---|---|---|---|---|---|---|
| 1440×900 | single | 208 × 91 | 208 / 208 | — | 80 | yes |
| 1440×900 | multi worst case | 208 × 91 | 208 / 208 | 115.2 px | 80 | yes |
| 1280×720 | single | 208 × 67 | 208 / 208 | — | 80 | yes |
| 1280×720 | multi worst case | 208 × 67 | 208 / 208 | 115.2 px | 80 | yes |

  Block height is the same in single and multi states at each viewport.
- **One real drag at 1440:**
  - Fader w = 96 px, +20 px drag: stems/SFX went from −6/+1 to +11.5/+18.5 (Δ 17.5 = 20/96 × 84). The difference stayed 7.0.
  - Status read `Clip Gain: 2 კლიპი — +11.5 … +18.5 dB.`; one Ctrl+Z restored −6/+1.
  - The app used **Shift** as the multi-select modifier.
- **Probe hygiene:** 0 pageerror, 0 hydration, 0 forbidden requests, 0 `Authorization` headers.
- **Caveat:** the probe ran before the final code-review fixes. Those fixes change no layout or classes.
- Evidence: `a-round-115/probe/out/layout-probe.json`, `multi-worst-*.png`, `multi-drag-1440x900.png`.

## Diff summary per file
- **`app/lib/arrangement/clip-gain-multi.ts` (new):**
  - `clipGainMemberKey` and `clipGainMemberSpan` (audio members only, `gainDb ?? 0`).
  - `clipGainShiftTargets`: one shared delta, clamped `[−60 − min, +24 − max]`, snapped to 0.1, then `normalizeClipGainDb`.
  - `applyClipGainTargets`: same object returned on no-op; 0 removes the key.
  - `shiftClipGainsDb`, `setClipGainsDb`, `formatClipGainRange`, `formatClipGainMembersStatus`.
- **`ArrangementContext.tsx`:** the R11 changes above, plus 5 new value/interface members. Everything else is unchanged.
- **`ArrangementDetailPanel.tsx`:**
  - `ArrangementDetailGroup` gained `clipIds`, `hasNonAudioClip`, `minClipGainDb`, `maxClipGainDb`.
  - R1 reason text.
  - Display: `value` = max, `aria-valuetext` = range text, field `""` when mixed, `title` = range text, `aria-describedby` = range node id (plus the pending id when both apply).
  - Multi paths for field commit, Escape, double-click reset and the `0 dB` button. The single-clip `0 dB` disabled rule (`gainDb === undefined`) is kept; multi uses "all members 0.0".
  - R8: `clipGainDragIdsRef` is captured in `beginGesture` and used by preview, commit and blur while a gesture is active.
  - R9: the number field uses `step={DETAIL_CLIP_GAIN_STEP_DB}`.
  - R12: `w-52`, field `shrink-0`.
- **`StudioWorkspace.tsx`:** the `detailGroup` memo computes the 4 new fields; 5 new props are passed. Nothing else.
- **Docs:**
  - 098: l.4 now reads "Round 114 — C PASS (`c-round-114.json`, gate 114 `38c0e21`)." and the file table says CF1–CF14 (R10).
  - 099 (new): Georgian, follows the template, l.4 as specified in §2.

## Every granted test line changed, and why
Each now selects an audio clip plus `v1`/`v` on the video track. Every assertion keeps its strength: disabled, exact R1 text, and linked `aria-describedby`/`title`.

| File | Line | Change |
|---|---|---|
| `clip-gain-fader.test.tsx` | 34 | `GROUP_REASON` text → R1 |
| `clip-gain-fader.test.tsx` | 429 | CF8 `['m1','s1']` → `['m1','v1']` |
| `clip-gain.test.tsx` | 59 | `GROUP_REASON` → R1 |
| `clip-gain.test.tsx` | 782 | `['a','c']` → `['a','v']` (l.783 unchanged; it asserts with the constant) |
| `detail-panel-reason.test.tsx` | 23 | constant → R1 |
| `detail-panel-reason.test.tsx` | 249 (RF1), 336 (RF6) | → `['m1','v1']` |
| `detail-panel-fit.test.tsx` | 26 | constant → R1 |
| `detail-panel-fit.test.tsx` | 306 (F5) | → `['m1','v1']` |
| `pending-status.test.tsx` | 507 (PM5) | → `['m1','v1']` |

- `detail-panel-reason.test.tsx` l.328 and `detail-panel-fit.test.tsx` l.329 are untouched, as instructed.
- No other frozen test needed editing.
- During the work, `status-announcement-ui` HE4 (frozen) failed. The cause was my own change of the single-clip `0 dB` disabled rule: HE4's clip has an explicit `gainDb: 0`. I restored the stage-1 rule instead of touching the test. HE4 is green.

## Tests and checks (all actually run)
- **`clip-gain-multi.test.tsx`: 14/14 pass** (MG1–MG13 plus MG14). MG14 was added after code review: blur and pointercancel in the middle of a multi drag revert every member and write no entry.
- **Targeted vitest list: 18 files, 323/323 pass.** List in `a-round-115/targeted-list.txt`, log in `a-round-115/vitest-targeted.log`.
  - Files: `clip-gain-multi`, `clip-gain-fader`, `clip-gain`, `detail-panel-reason`, `detail-panel-fit`, `pending-status`, `fader-click`, `fader-guards`, `fader-touch`, `fader-focus-order`, `self-disabling-focus`, `status-announcement-ui`, `detail-panel-polish`, `master-ui`, `track-group-mix-ui`, `pan-release-recovery`, `context-hygiene`, `gesture-guard`.
- **`npm run typecheck`:** exit 0.
- **`npm run lint`:** exit 0 (218 warnings, 1 info). None of the warnings are in my changed files: the scoped `biome check` on the 10 owned files exits 0 with no diagnostics.
- **Not run (the gate's job):** the full suite, `npm run verify`, build, `test:e2e:smoke`.

## Mutation results
All were temporary local edits, restored from copies with hashes verified OK. Logs: `a-round-115/mut-*.log`; script: `a-round-115/mutate.py`.

| Mutation | Turns red |
|---|---|
| m1: per-member clamp instead of a shared delta | MG1, MG5 |
| m2: delta computed from the before-max but applied to the live gains (cumulative) | MG4 (two-move), MG5, MG11 |
| m3: video members included | MG1 (MG10 stays green because the panel's R1 guard disables the controls first) |
| m4: commit on every move | MG4, MG5, MG11, MG14 |
| m5: ids read from the latest render (R8 reverted) | **MG11 (group→group case only)** |
| m6: anchor at min | MG3, MG7 (MG5 stays green) |
| r2: revert the review fix "Enter on an unchanged mixed field" | MG9 |
| r8: revert the review fix "silent double-click at 0.0" | MG8 |

Honest notes:
- **m2:** my first form ("baseline = live present") survived. It is semantically equivalent, because the anchor is absolute and the delta is recomputed from the live max. The reported form is the real cumulative bug.
- **m5:** the content `key` changes on single→single, single→group and group→single, so the hook stops the drag on remount. Those two MG11 cases pass with or without the capture. Only the third case I added (group→group, same `'group'` key) proves R8, and the test title says so.

## Code review (the code-reviewer subagent actually ran)
**Score 8.5/10, no Critical or High findings.**

Addressed this round:
- **#2 (Low):** Enter on an untouched mixed field showed the "invalid number" message. It now shows `Clip Gain უცვლელია: {range}.`
- **#5 (Low):** the anchor is now read via `clipGainMemberSpan`, so it follows the same audio-only rule as R2.
- **#8 (Info):** a multi double-click at 0.0 is now silent, like a single clip.
- **#7 (Info):** added MG14 and made the MG11 title honest.

Left open (Low; for B/C):
- **#1 dead zone at the floor:** after the block stops at −60, the hook's anchor keeps going to −60. On the way back about (max − min) dB of pointer travel does nothing, about 10× that with Shift. Cause: the frozen hook. Passing a computed `min` would break the 84-dB scale (MG4, MC-DRAG). **C should not report this as new in MC-CLAMP/MC-FINE; B can decide on it at stage 3 or 4.**
- **#3:** text typed in the field can carry over between two different mixed groups, because the content key stays `'group'`. This needs a group change without a field blur, which I could not reach through the normal UI.
- **#4:** `clipGainDragIdsRef` is only cleared lazily. Harmless today; if another claim aborts the Clip Gain gesture, the refusal status is still rewritten on each move.
- **#6:** `applyClipGainTargets` is exported without the audio-only filter (today it only receives filtered targets).
- ~~**Observation:** a group that contains video shows the range node next to the disabled controls when its audio members differ.~~ **Fixed after the review (R3 "only when mixed").** A group containing video no longer feeds the gain span. It shows stage 1's disabled look (field `0.0`, `aria-valuetext` `0.0 dB`, no range node). MG10 now asserts this with `['m1','s1','v1']`.

**After this last change, I re-ran:**
- Targeted 18 files: 323/323 pass.
- typecheck: exit 0. lint: exit 0. Scoped biome: exit 0.
- Mutations m5 and m6 on the final panel: still red. Originals restored, hashes OK.
- Frozen list: OK, run as the last step. `git status` matches the expected end state.

**Smoke-suite check:** `test:e2e:smoke` runs only `e2e/agent-system-smoke.spec.ts` (from `playwright.smoke.config.ts`). A grep of `e2e/` for `ერთ აუდიო კლიპზე`, `clip-gain`, `w-48`, `arrangement-detail-group` and `Clip Gain` found **no matches**, so the smoke suite does not depend on the changed text or DOM.

**Architecture note (for B/root, not this round):**
- Signal 4 (two new refs on the context): keep. They belong under ARCH-R81.
- Signals 1 and 3: the Clip Gain block in `ArrangementDetailPanel` was rewritten in rounds 114 and 115, and stages 3 and 4 will touch it again. The reviewer proposes, **after T12 stage 4**, one bounded extraction into `ArrangementDetailClipGain` plus a `useClipGainTargets` hook (owning captured ids, anchor reading and single/multi routing). Acceptance would be CF1–CF14 and MG1–MG14 unchanged and green. Cost: medium; panel only.

## Deviations
- **Block width:** `w-48` → `w-52`, which R12 allows; field `shrink-0`.
- **Group field name:** `hasNonAudioClip` instead of B's suggested `hasVideo` (A's naming per §2).
- **Hook `min` not changed for mixed members:** R4 said A *may* pass it. Doing so would change the drag scale and break the MG4 and MC-DRAG formulas.
- **Native `<input type=range>` `min` stays −60:** React restores the controlled value when the context rejects a change.
- **MG14 added** (beyond MG1–MG13), after code review.
- **MG11 has a third case (group→group).**
- **Extra status:** a multi `0 dB` button press with nothing to change shows `Clip Gain უცვლელია: 0.0 dB.`, which mirrors the single-clip button.

## B acceptance criteria — what I can truthfully mark
- **Passed (jsdom/static):**
  - R1–R11, with R12 measured by my own probe.
  - MG1–MG13 (plus MG14), the mutation proof m1–m6, the granted-edit rules, the frozen list, typecheck, lint, and the targeted list.
- **Not mine to claim:**
  - All C browser rows: MC-*, G-T2-MULTI, NB-*, PX-NET, REG-HYD, G115-3, MC-SELECT-MIDDRAG, MC-BLUR-DISABLED.
  - Gate rows: full suite, build, verify, smoke.

## Exact next C checks (pointers)
- **MC-LAYOUT:** expect a block width of 208 (`w-52`). Range node: `[data-testid=arrangement-detail-clip-gain-range]`.
- **Multi-select:** Shift+click on the clip header selected two clips in my probe.
- **Clicking a member of a live multi-selection keeps the group.** To set per-clip gains through the field, first click a non-member clip (e.g. music), then the target.
- **MC-CLAMP / MC-FINE:** expect the known dead zone when returning from the floor (review #1). It is not new.
- **MC-STATUS:** the status after a drag is set by the context, e.g. `Clip Gain: 2 კლიპი — +11.5 … +18.5 dB.`
- **MC-SELECT-MIDDRAG:** Ctrl+A while the fader is focused may not change the selection. If it doesn't, the row is inconclusive per §4; MG11 covers it in jsdom.
- **MC-VIDEO-MIX / MC-BLUR-DISABLED:** expect the R1 reason text exactly.

## Scope completed
Round 115 implementation (T12 stage 2 plus GATE114-S1/S2/S5) is complete and waiting for C. This report is not a whole-backlog completion claim.
