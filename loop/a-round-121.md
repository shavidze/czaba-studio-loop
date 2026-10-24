# A round 121 — T12 stage 4b: Waveform Vertical Zoom (view only; T12.18 + Test 7)

**Scope completed by A:** R1–R5 code, WZ1–WZ9 tests, mutations m1–m5, doc 103, code-reviewer + fixes. **C browser rows not claimed** (A ran only a layout fit probe, see below). realVerified for A = false.

## Start / end state
- Start HEAD `0a75ba8757617695d19e0b2a4aaad713bc30c01c`, `git status --porcelain` empty, frozen `sha256sum -c --quiet b-round-120-r121-tree-sha256.txt` (run from `store/`) rc=0.
- End: frozen rc=0 again. `git status --porcelain`:
  ```
   M app/components/arrangement/ArrangementClip.tsx
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
  ?? app/lib/arrangement/__tests__/waveform-zoom.test.tsx
  ?? app/lib/arrangement/waveform-zoom.ts
  ?? docs/implementation/2026/quarter-IV/103-studio-waveform-vertical-zoom.md
  ```
  This is exactly the §2 end state.
- Protected: `git diff --quiet 0a75ba8` is empty for `studio.$productId.tsx`, `api.studio-token.ts`, `lib/auth.ts` and `AuthContext.tsx`.
- Pre-edit greps: `a-round-121/pre-edit-greps.txt`. They match B:
  - direct renders of the lane/clip view appear only in Lane, Workspace, grid-snap-ui, gesture-reentry and gesture-guard;
  - no `.tab(` / `{Tab}`;
  - no test counts grid-control children or comboboxes;
  - grid-snap-ui:387 checks that the transport toolbar has no select.
- There were no untracked files before editing, so the C-R119-01 backup step had nothing to copy.

## Diff summary per file
- `waveform-zoom.ts` (new, 32 lines): the R1 exports with their exact names. `parseWaveformZoom` accepts only the listed levels. `clipWaveformScale` returns gain × z for audio, gain alone for video, and treats an invalid zoom as 1.
- `ArrangementClip.tsx` (+7/−4):
  - optional `waveformZoom?: number` prop, default 1;
  - `peakScale = clipWaveformScale(clip, isVideo, waveformZoom)` replaces `gainScale` in the memo call and its dependency list;
  - the import moved from `clipLinearGain` to `clipWaveformScale`;
  - `buildPeakShape` is unchanged.
- `ArrangementLane.tsx` (+3): the optional prop, its default 1, and the pass-through to `ArrangementClipView`.
- `StudioWorkspace.tsx` (+35):
  - the waveform-zoom import, `useState(WAVEFORM_ZOOM_DEFAULT)` and `data-waveform-zoom` on the grid control;
  - `<select data-testid="arrangement-waveform-zoom">` as the last child of the grid control. It has the exact aria-label and title, the grid-division classes plus `appearance-none`, and the accent classes when not 1×;
  - an inline onChange: parse, ignore `null`, set the state, `setStatus(waveformZoomStatus)`;
  - the `waveformZoom` prop on every `ArrangementLane`;
  - no context, history, localStorage or onKeyDown.
- `waveform-zoom.test.tsx` (new): WZ1–WZ9, **9 tests**.
  - Its video harness mocks `probeVideoFile` / `decodeVideoAudio` and imports a real video, so the video clip has real peaks.
  - It wraps `applySchedule` to count `setClipGain` calls on the handle.
- Doc 103 (new, Georgian, with the TEMPLATE sections).

## Tests (actually run)
- `npx vitest run` on the §4 list: every listed file exists. **24 files / 379 tests passed**, both before and after the review fixes. Output is in `a-round-121/vitest-targeted*.txt`.
- WZ1: B's literals matched on the first run. No literal was edited.
- `npm run typecheck`: 0 errors.
- `npm run lint`: rc=0. The repo's existing warnings remain, and none of them are in the owned files.
- Read-only `npx biome check` on the 5 code files: clean. Biome does not check the `.md` doc.

## Mutations (`a-round-121/mutations.txt`)
Each mutation was a temporary Python string replace, restored with `cp` from a backup and verified by sha256 (all OK).

| ID | Mutation | Red tests |
|---|---|---|
| m1 | video gets the zoom | WZ1, WZ4 |
| m2 | lane passes `waveformZoom={1}` | WZ2, WZ3, WZ8 |
| m3 | `return z` (gain dropped) | WZ1, WZ3 |
| m4 | parse accepts any finite positive number | WZ1 |
| m5 | memo dependency `clip.gainDb` instead of `peakScale` | WZ2, WZ3 |

Each mutation turned at least the tests B named red. Note on order: the mutations ran **before** the review fixes. Those fixes only added assertions, so they cannot weaken any of these results.

## Code-reviewer (real subagent)
- **Verdict:** approve with nits, 9/10. No Critical, High or Medium findings.
- **Fixed this round:**
  - (1) WZ2 now checks the aria-label, the title at 200 % and 100 %, `appearance-none`, and that the accent class is on at 2× and off at 1×.
  - (3) WZ4 and WZ5 now include a positive check: the music lane's `d` changes at 8× / 4×.
- **Accepted and left as they are:**
  - (2) WZ7 uses real 20/30 ms sleeps. They can only make the test pass more slowly, not fail.
  - (4) The loose number parsing is what R1 specifies, and the only input comes from a controlled select.
  - (5) With `appearance-none` the select shows no dropdown arrow. This is the size trade-off the spec requires.
  - (6) "Byte-identical at 1× to round 120" rests on the frozen `clip-gain-waveform` test and on C's sha baseline.
- **Architecture note (for B/root, not acted on):** Signal 4. The workspace gained another view state, and it now threads a fifth view-preference prop (Workspace → Lane → ClipView) next to `folded`, `snapSeconds`, `gridSeconds` and `envelopeMode`.
  - Verdict: **keep**.
  - Proposal for the next ARCH-CHECKPOINT-SRW14-PREFS addendum: one memoized `LaneViewOptions` object prop. It needs a stable identity, because ClipView is wrapped in `memo`. Acceptance: the existing lane and clip tests stay green, plus a render-count test.

## A browser probe (layout only; not a C row)
Scripts and screenshots are in `a-round-121/browser/`, run with Playwright Chromium against :5173.
- At 1440 and 1280:
  - grid row 28 px tall, grid control 224 px wide, `scrollWidth 223 ≤ clientWidth 223`;
  - the select is 28 px wide, ends 210 px from the grid control's left edge, and is the last child;
  - it shows `1×` and `data-waveform-zoom="1"`;
  - after choosing 2×: attribute `2`, status `Waveform Zoom 200% — მხოლოდ ხედი, ხმა არ იცვლება.`;
  - 0 pageerrors.
- The first attempt timed out waiting for the select to become visible. Two later runs found it: a probe 5 s after load, and a re-run that waited for the element to exist rather than to be visible. This is consistent with the known first-load issue, but that was not confirmed.

## Every shell write
1. `mkdir` of `a-round-121/`, `a-round-121/mut/` and `a-round-121/browser/`. Pre-edit grep output was written with `tee` into the loop folder.
2. Mutations m1–m5: a temporary Python replace in `waveform-zoom.ts` (m1, m3, m4), `ArrangementLane.tsx` (m2) and `ArrangementClip.tsx` (m5). Each was restored from `a-round-121/mut/mN.bak` and its sha256 verified.
3. `sed -i` on my own probe script `a-round-121/browser/fit.mjs`, which is outside the repo.
4. The `vitest-list.txt`, `vitest-targeted*.txt` and `mutations.txt` logs, all in the loop folder.

Every lasting edit in `store/` used the Edit or Write tool. One read-only `git stash list` was run by accident while checking lint. It changed nothing.

## Deviations
- None from B's §2–§4.
- Lint (rc=0, 218 warnings elsewhere) was not compared against a baseline count, because that would have needed a stash/checkout. Only the owned files were confirmed clean.

## B acceptance actually passed by A
- §4: typecheck, lint and scoped Biome are clean; the vitest list is green; m1–m5 are red; the reviewer ran; frozen and protected files are OK.
- §2: the end state is exact.

## Next C checks (§5, unchanged)
T121-TARGETED (24 files / 379), AN-REVIEW, SOURCE-SCOPE, WZ-PRESENT (both viewports, the 4 baseline shas at 1×), WZ-T7, WZ-LEVELS, WZ-GAIN, WZ-HISTORY, WZ-AUDIO, WZ-METER, WZ-NEWCLIP, WZ-KEYS, WZ-RELOAD, G121-3, PX-NET/REG-HYD, and the neighbour checks.
