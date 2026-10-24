COMMIT: OK. The diff only moves text into the strings module. Behaviour, timing, listeners and render paths are unchanged, and no auth, purchase or download code is touched.

I checked this diff, not the whole module. Gate evidence: verify passed (159 test files, 2434 tests, typecheck clean, build ✓), and `c-round-133.json` is PASS with browser checks done and no failures. Only the backend-dependent 403 check was blocked.

## Code Review: round 133 — V-0.2c3 lane-move and track-group strings

### Critical Issues
- None.

### Findings, ranked (none block the commit)
1. **Low — the new doc's status line is already out of date.** `docs/implementation/2026/quarter-IV/109-studio-v0-lane-move-group-strings.md:4` still says the browser check is waiting for C round 133 (`ბრაუზერის შემოწმება C-ის რაუნდ 133-ს ელოდება`). C round 133 is PASS. Doc 108 had the same drift and this round's diff fixes it (GATE132-S5), so the gap would just repeat.
   **Fix:** before committing, change line 4 to the doc 108 wording: `C round 133 — PASS, browserVerified; gate 133 — <sha>`. Also update line 128 under ტესტირება, which says the same thing.
2. **Low — group rename messages are still Georgian and not tracked anywhere.** `app/components/arrangement/StudioWorkspace.tsx:953` (`სახელი ცარიელია — დარჩა «…»`) and `:963` (`ჯგუფის სახელი: «…».`). After this round, creating and ungrouping a group give English messages with `“…”` quotes, but renaming the same group still gives Georgian with `«…»`. Doc 109's TODO lists only "ჯგუფის header-ისა და ისტორიის label-ები" (the group header and history labels), not these two messages. `StudioWorkspace.tsx` is frozen, so this is not something to fix now.
   **Fix:** add a tracking ID, e.g. GATE133-GROUP-RENAME, to V-0.3 or V-0.4 in doc 109's TODO. When it is done, add `renamed` and `renameEmpty` formatters to `studioTrackGroupStrings` that use `quoted()`.
3. **Low, already tracked as GATE130-S1 — the "no room" text on the drop preview is still Georgian.** `app/components/arrangement/ArrangementLane.tsx:893` (`' · აქ ადგილი არ არის'`) now differs from the status line's `No room here`. Tests `grid-snap-loop-drop.test.tsx:441` and `:551` check the Georgian text.
   **Fix (V-0.4):** use `studioLaneMoveStrings.noRoom`, not a new string, and update those two tests in the same change.
4. **Info, existed before this round — an old refusal stays on screen after a successful fold (C-R133-L1).** In `StudioWorkspace.tsx`, `toggleSelectedTrackGroupsCollapse` only calls `setStatus` when it refuses. After a refusal followed by a successful fold, the status still says "select a group". This round's English makes that more noticeable.
   **Fix (separate task):** on a successful fold or unfold, clear the status or show a short confirmation. Add a UI test that does a refusal, then a successful fold, and checks the status.
5. **Info — accepted mixed-language messages.** For example `Group “ჯგუფი 1” created: მუსიკა, სტემები.` This follows decisions R1 and R3 (D-29z98) and both are tracked (GATE133-GROUP-PREFIX, -LANE-RELEASE-MIXED, -LANE-HINT-MIXED). No action now.

### What tests can't catch, checked by reading the code
- **Import order:** `strings.ts` has no imports (confirmed with grep), so the new `selection.ts`/`groups.ts` → `./strings` imports create no cycle. The module-level constants can't load as `undefined`.
- **Identity checks:** `GROUP_MOVE_BLOCKED_MESSAGE` is still a single shared string. `ArrangementContext.tsx:1758` uses it with `setStatus(keyRepeat ? () => MSG : MSG)` and `ArrangementClip.tsx:519/566` index the map by key, so nothing compared the old Georgian text literally.
- **Rendering, timers, listeners:** none changed. All values are constants or pure formatters, with nothing new created per render.
- **Accessibility:** the live-region text changed, but its behaviour did not. Repeat announcements are still covered by the `status-announcement-ui` tests.
- **TS strict:** no `any`, no `@ts-ignore`, no `as`. Semicolons are present. No styles or Tailwind changed.

### Suggestions
- ST22 checks for Georgian characters with `GEORGIAN_CODEPOINT`. That pattern doesn't cover Mtavruli (U+1C90–1CBF) or Nuskhuri (U+2D00–2D2F). This was already noted for checkpoint (f). It doesn't matter now, but widen the range before V-0.4 removes the prefix exemption.
- `track-groups-ui.test.tsx:304-310` checks each message both against the constant and against a hand-written literal. That is intentional (GATE130-S3), and it is useful because it catches a change that would break both at once.

### Good Practices Found
- Export names, `Record<ClipLaneMoveRefusal, string>` typing and function signatures are unchanged, so no frozen importer needed editing.
- ST22 removes exactly one Georgian line from the scan (the default group name `TRACK_GROUP_NAME_PREFIX`, line 3) and checks that this line appears exactly once. The exemption can't quietly grow.
- Formatters only insert ready-made values; the choice between singular and plural stays in `groups.ts` (rule R6).
- Each string change was checked by breaking it on purpose and confirming the tests fail (m19–m23), including the UI-level literals.

### Architecture note
- Signal 2 (coupling), at `app/lib/arrangement/selection.ts:3` and `app/lib/arrangement/groups.ts:2`: the selection and grouping logic now imports the text module. **Keep.** The dependency runs one way into a module with no imports, it adds no state or lifecycle, and the gain is one place for all UI text. Moving text back next to the logic would undo the V-0.2 goal of a single strings module.
- `strings.ts` now holds 12 objects. Length is not a signal by itself. Whether to split it before V-0.3 is already queued as checkpoint addendum (e)/(f) in `b-round-130-checkpoint-request.md`. No new proposal for the planner.

### Alternative Approach
Not applicable: this is a text-only change with no auth, checkout or audio logic. One option was considered: have the UI components read the strings module directly and drop the re-exported constants. Verdict: the current approach is better because it keeps the frozen importers unchanged.

### Score: 9/10
One point off for the stale status in doc 109 (finding 1) and the untracked rename messages (finding 2). Both are documentation or tracking gaps, not code defects.