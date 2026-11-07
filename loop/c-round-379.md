# C round 379 — PERF-11c-iii-c2b (MarkerRow leaf): PASS

**Verdict:** PASS, 0 bugs. `browserVerified` true (LEAF-PROBE, MARKER-BROWSER, G379-AUTH, STUDIO-SMOKE-379 all ran at 1440×900 and 1280×720 against HEAD `3ae2885` on :5174 with its own cacheDir). Evidence in `c-round-379/`; the gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke) are not claimed.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: 4 status lines (3 M + doc 245) at start and end; frozen and protected sha rc 0 | shell, re-run at end |
| CLAIMS | PASS: differs from sketch output only on K2 (4) and K19 (doc present, l.4 correct, 7 RB-LEAF6 mentions); no MISSING | `claims-output.txt` |
| SKETCH-EQUAL | PASS 3/3 OK | |
| ASSERT-COUNT | PASS 214/20 | |
| UNIT | PASS: 145 files / 2,278 tests; shuffle seed 42 on render-budget + markers-ui + markers-move-ui 69 passed. Slowest unchanged-file tests CP12a–d 4.6–5.7 s run under their own 30 s timeouts (doc 167); no changed-file test above 50 % | `unit-145.log`, `unit-shuffle.log` |
| MUTANTS-TREE | PASS: NO-MEMO, ACTIONS-FRESH, MARKERS-FRESH red on RB-LEAF6 at l.981; HEAD-REVERT red at l.966 (name absent); `restored` printed | `mutants/`, `mutants.log` |
| PERF-INTERACT | PASS: 264 rows, 0 FAIL, all count rows equal round 378 except record-only `video.playing.move-components-per-move` median 9.95 (378: 9.883) and `video-trim.playing` min 12.883 (median equal); both no-budget record rows | `perf-interact.log` |
| LEAF-PROBE | PASS: A vs sketch differs only on `LibraryPreviewViewInner` preview-stop (315 vs 316 / 314, record ±3). Attempt 1 hit a cold-start timeout at 1440 for both A and HEAD (environment-invalid, replacement attempt used; kept as `*-attempt1.json`). MarkerRow = 0 on every step; ViewInner 0 on lane-mute, Ctrl+Z, preview start/stop, idle/play; 2 on add, 1 on zoom in/out. Every other leaf equals HEAD | `leaf-A.json`, `leaf-HEAD.json` |
| MARKER-BROWSER | PASS: s0–s17 identical to HEAD at both viewports (flags, editor, menu, focus, status). Focus targets match §1 table (name input after M; flag after add+Enter, F2+Enter, Escape on menu; `arrangement-marker-add` after Delete and after Ctrl+Z) | `marker-A.json`, `marker-HEAD.json` |
| G379-AUTH | PASS: fresh context, `auth_user` null, `/studio-lab` shows the workspace; `/studio/middle-east` shows "Sign in required", 0 workspace, 0 `audio[src]`; `/api/studio-token?product=…&file=…` without token → 401, body has no token (no-param call is 400 by design). Fake bearer → 500 = BLOCKED (backend unavailable) | `auth-smoke-*.json` |
| STUDIO-SMOKE-379 | PASS, equal to HEAD at both viewports: Bass added, play clock ≈ 00:01.46 after 1.5 s, flag A present after every step, name-bar drag moves the clip music→stems and Ctrl+Z returns it, Master Mute on (aria-pressed true) then Ctrl+Z off, preview Play/Stop works | `auth-smoke-*.json`, `auth-smoke-*-{1440,1280}.png` |
| L50-RULING | PASS: 12 hits at 275 296 307 450 606 723 893 919 972 989 992 999. Three are HEAD+70, nine HEAD+71 (sketch v2 adds the `pendingFocusRef` clear above them), as A explained; `l50-focus-origins.txt` lists v1 lines (stale, info for B) | |
| DOCS | PASS: l.4 byte-identical (cmp), `## ` headings equal TEMPLATE's, named rows/mutants/files exist, 0 `C round N pending` | |

**Info for B (no bugs):**
- Undo/Redo toolbar buttons still render MarkerRowViewInner once (equals B's sketch). The task only required 0 for lane-mute, Ctrl+Z and preview, so it is not a failure.
- `l50-focus-origins.txt` sketch lines are v1 (off by one after l.404).
- Unit tests run via `npx vitest` on the whole 145-file set took 207 s.

**Not run / blocked:** fake-bearer 500 (backend unavailable in cloud). Gate rows belong to root.
Side effect note: a temporary `git worktree` for the HEAD copy was added and removed under `c-round-379/`; store source untouched.
