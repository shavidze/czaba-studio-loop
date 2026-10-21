**I couldn't write the report file.** This session only had read and search tools (Read, Glob, Grep), so `C:/Apps/czaba-project/tmp/studio-real-loop/root-pre-push-review.md` does not exist. The full review is below, ready to save to that path. Nothing in the source or git was changed.

I also did not run tsc, vitest, Biome or the build. Every test result quoted below comes from A's command output in `a-round-3.md` ┬º2/┬º4. The pre-push hook will run build and typecheck again.

---

# Root Pre-Push Review ΓÇö Studio Lab (anonymous demo route `/studio-lab`)

Reviewer: code-reviewer (read-only) ┬╖ Date: 2026-10-07

**Scope:**
- `app/components/arrangement/**`
- `app/contexts/ArrangementContext.tsx`
- `app/data/studio-lab-demo.ts`
- `app/lib/arrangement/**`
- `app/routes/studio-lab.tsx`
- `app/types/arrangement.ts`
- `docs/implementation/2026/quarter-IV/010-ΓÇª`, `011-ΓÇª` and `012-ΓÇª`

**Out of scope:** the purchased/auth route and the 4 protected files (`account.downloads.tsx`, `api.studio-token.ts`, `studio.$productId.tsx`, `download-routes.test.ts`).

## Verdict

- **No release-blocking regression or security issue was found in scope.** Every file in scope is new (untracked). It does not change any existing module. The shared modules it imports (`~/lib/sfx-edit`, `~/lib/sfx-video.client`, `~/components/ui`, `~/lib/utils`) are only read, not edited.
- **The feature is not finished.** By A's own measurements, RF3-1, RF3-2 and R5-L6 still fail. These are already recorded in A ┬º10. They block the *next round's acceptance*, not this intermediate testing commit.
- **The real pre-push risk is commit scope, not the code** (see ┬º3).

## 1. Release-blocking (regression / security): none, with evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Secrets / env | None | No `process.env`, `import.meta.env`, keys or tokens in any scoped file (grep). |
| Auth / token / PII storage | None | No `localStorage`, `sessionStorage`, `apiClient`, `useAuth`, `Authorization` or `studio-token` (grep). |
| R2 / backend calls | None | The only network call is `studio-lab-demo.ts:59`: `fetch('/middle-east.mp3' \| '/videos/hero/hero-music.mp3', { credentials: 'omit' })`. Both files exist in `public/`. Synthetic sources are generated locally. |
| User video files | Local only | `video.client.ts:52` uses `URL.createObjectURL`. Nothing is uploaded. The file name is shown only as React text (escaped). |
| XSS | None | No `dangerouslySetInnerHTML` or `innerHTML`. Status and error strings render as text nodes. |
| SEO / exposure | OK | `studio-lab.tsx:9` sets `robots: noindex`. No nav or sitemap links `/studio-lab` (grep shows only the route file itself). |
| TypeScript strictness | OK | No `any`, `@ts-ignore`, `as X` assertions or non-null `!` (grep). |
| Design tokens | OK | Every colour class resolves to an `app.css` token (`brand`, `accent`, `outline`, `muted`, `dim`, `elevated`, `muted-bg`, `positive`, `destructive`). Inline `style` is used only for computed px positions. |
| Cleanup | OK | Details below. |
| Export honesty | OK | Details below. |

**Cleanup details:**
- **Blob URLs:** revoked on unmount (`ArrangementContext.tsx:1268-1274`), on abort or failure (`:1086, :1097, :1118`) and on probe failure (`video.client.ts:67`).
- **Audio:** `AudioContext.close()` on unmount (`:1328-1341`). Retired graphs are disconnected (`:389-398`). Ended loop sources are released in `appendPlan` (`graph.client.ts:119-126`).
- **Video element:** the rate is reset on unmount (`ArrangementVideoDock.tsx:104-110`).
- **Window listeners:** the marquee listeners are cleaned up on unmount (`StudioWorkspace.tsx:112`).

**Export honesty details:**
- `renderArrangementWav` renders `planSchedule(arr, 0)` over `0..projectEnd`. The loop is ignored, as specified.
- The dialog states this (`ArrangementExportDialog.tsx:122-127`).
- "24-bit" is true: the encoder writes 24 bits per sample (`sfx-edit.ts:130`).
- Export is refused while video audio is still decoding.
- If the project has no audible clip, the dialog says the WAV will be silence.

## 2. Unfinished feature scope (already recorded by A, carried over, not new)

| ID | Status | Source |
| --- | --- | --- |
| **RF3-1** | **FAIL**: not 15/15. Same-load runs 5/6, fresh-load runs 3/4. The worst run, k2, had median 0.15 and max 0.63. The R2-V3 layout was not measured. | A ┬º6, ┬º10 |
| **RF3-2** | **FAIL**: `play()` lands 22ΓÇô30 ms after `startAt` (more than 1 frame). \|d\| reaches 0.055ΓÇô0.096 in the first 300 ms (limit 0.06). | A ┬º6 |
| **R5-L6** | **FAIL**: wrap seeks take 0.3ΓÇô1 s headless, so video drift after a wrap goes over 0.1. | A ┬º7 |
| R5-L3 (partial) | Master-tap Γëñ ΓêÆ60 dBFS and the brace-past-`projectEnd` case were not measured. | A ┬º10 |
| R5-L5, R5-E1, R6-S2 (marquee while playing), R6-S3 (heard while playing) | Implemented; only unit tests cover them. | A ┬º10 |
| G3-R, G3-3, G3-shots | A did not re-run them in round 3. My static grep supports G3-3, but it is not runtime proof. | A ┬º10 |

**Correction needed for an honest commit (Medium, docs):** `docs/ΓÇª/012-studio-lab-loop-multiselect.md`
- Line 122 says the multi-select and brace smoke "ßâºßâòßâößâÜßâÉßâñßâößâáßâÿ ßâ¢ßâ¥ßâíßâÉßâÜßâ¥ßâôßâ£ßâößâÜßâÉßâô ßâ¢ßâúßâ¿ßâÉßâ¥ßâæßâí". But R6-S2 while playing and R6-S3 heard while playing were not measured.
- The TODO section (lines 124ΓÇô129) lists RF3-2 and R5-L6, but omits:
  - RF3-1 (the failing run counts, with R2-V3 unmeasured);
  - R5-L3 (master tap);
  - R5-L5, R5-E1, R6-S2 and R6-S3 (unit tests only).
- Add those IDs so the doc matches `a-round-3.md` ┬º10.

The status lines in 010, 011 and 012 already say "In Progress ΓÇª C-ßâÿßâí ßâôßâÉßâ¢ßâ¥ßâúßâÖßâÿßâôßâößâæßâößâÜßâÿ ßâ¿ßâößâ¢ßâ¥ßâ¼ßâ¢ßâößâæßâÉ ßâ»ßâößâá ßâÉßâá ßâ⌐ßâÉßâóßâÉßâáßâößâæßâúßâÜßâÉ", which is accurate.

## 3. Commit scope (pre-push blocker, process)

`git status` (A ┬º2) shows work by other agents in the same tree:
- ` M` (modified): `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`. These are the protected purchased/auth files. Nobody has reviewed these edits.
- `??` (untracked): `.agents/`, `.codex/`, `AGENTS.md`, `.claude/agents/ableton-arrangement-expert.md`. None of them are in `.gitignore` (grep found no match).

**Do not use `git add -A`, `git add .` or `commit -a`.** Stage only these exact paths:
```
git add app/components/arrangement app/contexts/ArrangementContext.tsx app/data/studio-lab-demo.ts app/lib/arrangement app/routes/studio-lab.tsx app/types/arrangement.ts docs/implementation/2026/quarter-IV/010-studio-lab-arrangement-core.md docs/implementation/2026/quarter-IV/011-studio-lab-video-transport.md docs/implementation/2026/quarter-IV/012-studio-lab-loop-multiselect.md
git diff --cached --name-only
```
`git diff --cached --name-only` must list only those paths.

Commit format: `feat(studio): ΓÇª`, with no Co-Authored-By line.

Biome: A reports 0 errors and 218 warnings. The warnings are all pre-existing and outside these paths (A ┬º2). The pre-push hook should pass.

## 4. Per-file findings

### Medium
- **M1 ΓÇö `ArrangementContext.tsx:365-387, 466-491`:** loop iterations are refilled only from the rAF (`requestAnimationFrame`) tick, which looks 0.5 s ahead.
  - In a hidden tab, rAF stops, so loop audio goes silent about 0.5 s later and the playhead freezes.
  - When the tab is visible again, a single re-anchor resumes playback, and the H1 fix prevents a burst of stacked iterations. A documents this gap.
  - Not a blocker for a demo. The fix is in ┬º5.
- **M2 ΓÇö `ArrangementContext.tsx:1361-1476`:** `position` is part of the single context value, so every consumer re-renders on every animation frame while playing. That includes 4├ù `ArrangementLane`, Transport, Library, VideoDock, LoopBrace and ExportDialog.
  - `ArrangementClipView` is memoised, which limits the damage.
  - This competes for the main thread with the video decoder. The RF3 failures were attributed to load (CPU at 90%).
  - Consider a separate position context or subscription before tuning sync constants further.
- **M3 ΓÇö docs 012:** the honesty gap described in ┬º2.

### Low
- **L1 ΓÇö `StudioWorkspace.tsx:230-243` with `ArrangementLoopBrace.tsx:81-93` and `ArrangementClip.tsx:241-267`:** Ctrl+Z or Ctrl+Y during an active pointer gesture is not guarded.
  - On release, the gesture commits using its stale `before` snapshot, which can create an entry that reverts the undo.
  - If the brace unmounts mid-drag (for example, an undo removes the loop), `previewActiveRef` stays `true`, so the next video import waits up to 30 s (`:1089-1095`).
  - Suggestion: ignore undo and redo while a gesture is active, or cancel the gesture on undo.
- **L2 ΓÇö `transport.ts:26`:** a reschedule during the initial hold window keeps `holdUntil = previous.holdUntil`. `isTransportRunning` (and so the video `play()`) can fire up to about 50 ms before the new graph's audio `startAt`. Only edits made inside the first ~50 ms after Play hit this; it does not affect a plain fresh Play.
- **L3 ΓÇö `StudioWorkspace.tsx:265`:** Delete and Backspace ignore `event.repeat`, so holding the key deletes repeatedly. Each delete is a separate entry and can be undone.
- **L4 ΓÇö `ArrangementLoopBrace.tsx:55-59` and `ArrangementClip.tsx:158-162`:** if `setPointerCapture` throws, the function returns but leaves the gesture state set.
- **L5 ΓÇö `ArrangementLoopBrace.tsx:116, 120`:** two `biome-ignore` directives. This is a documented deviation (A ┬º9.1). They are tool directives, not prose comments, so they are accepted.
- **L6 ΓÇö `ArrangementExportDialog.tsx:98`:** "ßâÿßâÆßâÿßâòßâö graph ßâáßâÉßâ¬ ßâôßâÉßâÖßâòßâáßâÿßâíßâÉßâí" is slightly inaccurate when the loop is on. The loop note on line 122 mitigates it.
- **L7 ΓÇö `model.ts:415`:** history size is unbounded. Snapshots share structure, so this is acceptable for a demo.
- **L8 ΓÇö `ArrangementContext.tsx:566-576`:** `new AudioContext` is not wrapped. In a browser without Web Audio, Play throws into the root ErrorBoundary instead of showing a status message. The route has no ErrorBoundary of its own.

## 5. Good practices found
- **Pure, tested core:** `loop.ts`, `selection.ts`, `transport.ts`, `video.ts` and `model.ts` have no DOM. A reports 140 tests passing in these modules.
- Loop ops return the same object reference on a no-op, so no-ops never create history entries.
- The loop is part of the snapshot. `isSameArrangement` compares the loop, so undo and redo cover it.
- **Loop wraps are scheduled ahead:**
  - `appendPlan` adds each iteration on the same track gains;
  - each source is truncated at `loop.end`;
  - the old handle is stopped at the handoff `startAt`;
  - there is no rAF stop/restart, which avoids pitfall P7 (prototype).
- The H1 fix (no burst of stacked iterations after a stall) is in place.
- **D-16 (video sync rules) is implemented as written:**
  - pending/`seeking` guard;
  - constant lead;
  - soft sync via quantised `playbackRate`, reset on pause, seek, source change and unmount;
  - `play()` waits for `isTransportRunning`.
- The selection is kept outside history and filtered after undo and redo.
- Pointer capture with thresholds; marquee and brace gestures never seek.

## 6. Alternative approaches (Studio audio pipeline)
- **Loop wrap**
  - Current: lookahead `appendPlan` against a single anchor; `loopTimelinePosition` maps the unwrapped time.
  - Alternative: on a rAF tick, `seek()`/restart at `loop.end` (the prototype's approach).
  - Verdict: keep the current approach. The alternative gives jitter of a frame or more, doubled or missing sources, and audible gaps. The current one is sample-continuous by construction.
- **Lookahead driver**
  - Current: a 0.5 s horizon refilled from rAF.
  - Alternative: refill from a timer-driven scheduler independent of rAF, such as a Worker `setInterval` or an AudioWorklet clock, with a 1ΓÇô2 s horizon.
  - Verdict: the alternative fixes M1. Do it as a follow-up, not in this commit.
- **Video sync**
  - Current: quantised `playbackRate` soft sync with a pending-seek guard and hard seeks only for jumps or drift above 0.3 s.
  - Alternative: hard seeks only.
  - Verdict: keep the current approach. A's diagnostic shows every run fails with rate writes blocked (median 0.076ΓÇô0.137). The remaining failures are tied to decoder stalls under load, so the next lever is M2 (render load), not more seeking.

## 7. Score: 6/10
- The code quality, the security hygiene and the honesty of the audio and export behaviour are solid, about 7-level work.
- It is held to 6 because:
  - three acceptance IDs (RF3-1, RF3-2, R5-L6) fail by the implementer's own measurements;
  - several items are covered only by unit tests;
  - doc 012 slightly overstates the smoke results;
  - the M2 render load probably contributes to the sync failures.
- It is acceptable as an **intermediate testing commit** if staged by explicit paths (┬º3) and with the doc 012 TODO corrected.

---

Several MCP connectors need authorisation before they can be used: Atlassian, Gmail, Google Calendar, Google Drive, Microsoft 365, Similarweb, Klaviyo, and the marketing plugin's Amplitude and Slack. Authorise them in your claude.ai connector settings, or via `/mcp` in an interactive session. None of them were needed for this review.

## Root (Claude) 2026-10-18 — rounds 50-58 → cb12805

See `root-review-r50-58.md`: COMMIT OK, no Critical/High/Medium; 4 Low findings for B to schedule; browser probes MN-DISMISS-BUTTON / MN-REPOSITION / MN-FOLLOW / G-3 still required.

## Root gate round 64 (2026-10-19)
COMMIT OK. Review with findings for B: loop-v2/gates/round-64/review.md


## Root gate round 65 (2026-10-19)
COMMIT OK. Review with findings for B: loop-v2/gates/round-65/review.md

## Root note — ფაზა 2 რიგშია (2026-10-20)

მომხმარებელმა `post_current_stage_queue`-ში T12-ის შემდეგ ჩაამატა `PHASE2-VIDEO-SCORING` (SRW-40…44), სპეციფიკაცია: `docs/technical/studio-real-workspace/phase-2-requirements.md`. ფაზა 1 პრიორიტეტია, შემდეგ T12. ფაზა 2 ახლა არ დაგეგმო, არ დაიწყო და მიმდინარე დავალებებს არ შეურიო; არსებული ელემენტები არ შეცვალო. ფაზა 2 იხსნება მხოლოდ მას შემდეგ, რაც root ჩანაწერში მომხმარებლის დასტურს დააფიქსირებს; მანამდე, ფაზა 1-ისა და T12-ის დასრულებისას, დაწერე BLOCKED: „phase 2 awaiting user go-ahead“.

## Root note: visual refresh A queued (2026-10-21)

The user approved `VISUAL-A-OBSIDIAN` in `post_current_stage_queue` (spec: `docs/technical/studio-real-workspace/visual-direction-a.md`). Order: phase 1, then T12, then VISUAL-A-OBSIDIAN (no further go-ahead needed), then BLOCKED for phase 2. Do not plan, start or mix it into phase 1 or T12 work. When it opens: colors, icons, typography and button surfaces only; positions, sizes, behaviour and shortcuts stay, except the approved moves M1, M3, M4 and M2 = Studio UI entirely in English through one strings module. M5 (per-track colors) is not approved.
