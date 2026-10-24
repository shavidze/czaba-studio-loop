COMMIT: OK

## Code Review: round-148, the V-0.5c video dock strings (11 paths)

I read the full diff and both new files. The three changes are the string switch in `ArrangementVideoDock.tsx`, the meta title in `studio-lab.tsx` and the new `studioVideoDockStrings` in `strings.ts`. The other 8 paths are tests and docs. Verify passed: 169 test files, 2506/2506 tests, and the build finished. The `Error: useArrangement… must be used within…` lines at verify.log:1171–1204 are stderr from tests, and every file passed. This round is only text changes, so this is a review of the diff, not of the whole module.

### Critical Issues
- None. No auth, purchase or download code is touched. `purchased-collection-ui.test.tsx` only swaps two test assertions. No listener, timer, effect, ref or handler changed. No class, `data-testid` or condition changed.
- I searched `app/` and `e2e/` for all 18 removed Georgian strings, including the old page title. Nothing outside `docs/` still uses them, so no e2e test is left checking for missing text.

### Suggestions (ranked, all Low)
1. **`docs/implementation/2026/quarter-IV/121-studio-v0-video-dock-strings.md:4, :125, :129`** — the doc still says "In Progress (C round 148 — ჯერ არ გაშვებულა)", but `c-round-148.json` is PASS. Round 147 had the same problem (GATE147-S1). **Fix:** set the status to `Completed (C round 148 — PASS, browserVerified; gate 148, <sha>)` and update line 125 the same way as doc 120. This is docs only, so it doesn't block the commit. It can go in this commit or the next round.
2. **`app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx:268-296` (VDS3)** — the test depends on real time: it uses `Date.now()` for `FakeAudioContext.currentTime`, a start hold of about 50 ms, and `waitFor`'s 1000 ms budget. It also relies on the stopped-sync effect setting `src` before `togglePlayback`. Doc 121:117 already records this. It may fail on a slow CI runner. **Fix (later):** use `vi.useFakeTimers({ toFake: ['Date', 'performance'] })` and advance the clock past the hold explicitly, so the test doesn't depend on wall-clock time.
3. **`ArrangementVideoDock.tsx:55, :57`** — `VIDEO_PLAY_FAILED_MESSAGE` and `VIDEO_RETURN_LABEL` are now just aliases for the string keys. This is harmless and keeps the diff small. **Fix (checkpoint, not now):** use `studioVideoDockStrings.*` directly and delete the aliases.
4. **`strings.test.ts` ST51, `collectWorkspaceSourceFiles`** — `statSync` follows symlinks and nothing guards against a loop. No such symlinks exist today, so the risk is close to zero. **Fix (optional):** use `lstatSync`, or `readdirSync(dir, { withFileTypes: true })` with `entry.isDirectory()`, which also saves one syscall per file.
5. **Accessibility, informational:** the region name `Video` (`dockLabel`) is the same text as the caption fallback and the default track name "Video". The names don't clash, because the track button's accessible name is "Video — set as the active track". The visible text `Return` is the start of its accessible name "Return the video to the compact view", so the button meets WCAG 2.5.3 (label in name). The English placeholder text is shorter than the Georgian was, so it is no risk to the `w-40` layout, and C's LAYOUT-DOCK check passed.

### Good Practices Found
- The gap prefix keeps `{' '}` and the `<span ref={timeRef}>` exactly as they were. The per-frame time writer is untouched, and the render-budget test still checks that zero extra renders happen.
- `studioVideoDockStrings` holds only plain strings, and `strings.ts` stays a module with no imports of its own. Importing a constant object adds no render cost.
- ST51 walks the directories instead of using a hand-written file list, and it fails if it finds fewer than 60 files, so it can't pass on an empty list. Mutation m113 showed that a new file is picked up automatically.
- The `default-track-names-ssr` test now checks that the mocked `console.error` was never called, so it can no longer hide errors. That closes gate-141 #2.
- The negative assertions in `purchased-collection-ui` now use the real English demo strings from `collection.ts:17` (`Demo collection`, `no sign-in required`), so they can fail again.
- TypeScript strict holds: no `any` and no type assertions. In the test, `importOriginal<typeof import(...)>` is a generic argument, not a type assertion.
- Tailwind and tokens are unchanged, and no literal colours were added.

### Architecture note
- Signal 3 (one region changed repeatedly at high cost): `app/lib/arrangement/strings.ts:387` adds the 24th `studio*Strings` object. `studioVideoStrings` and `studioVideoDockStrings` have confusingly similar names, and ST tests pin exact key lists.
  - **Keep for now:** the module has no imports, has no runtime state, and is cheap to change. Splitting it now would cost more than it saves.
  - **Proposal for the planner** (the post-V-0 checkpoint already planned in doc 121:130):
    - **Task:** split `strings.ts` by panel: `strings/video.ts`, `strings/library.ts` and so on, with a barrel re-export so existing imports keep working.
    - **Shared helper:** extract one Georgian-scan test helper from `strings.test.ts` that ST40, ST47 and ST51 all use.
    - **Duplicate-literal check:** add one test that every key's value is unique, apart from documented intentional duplicates such as `dockLabel`/`captionFallback`.
    - **Acceptance:** `npm run verify` stays green, and runtime and component code are unchanged.
- No new state, effects or ownership changes, so signals 1, 2 and 4 don't apply.

### Alternative Approach
- This is not critical logic: no auth, checkout or audio pipeline code. The only touch near audio is the `playFailed` status text, and the status path itself is unchanged.

### Score: 9/10