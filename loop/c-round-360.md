# C round 360 — PERF-10a-BUDGETS: PASS (browserVerified true)

Baseline HEAD a977b97, tree = A's 3 modified files (no untracked). Evidence in `c-round-360/`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equals A's final | claims.txt |
| SOURCE-SCOPE | PASS: 3 files; budgets patch reverse-applies; sha256 728ed85b… = dispatched; doc 232 +1 line; no app/ or perf/lib change | git diff --stat |
| PERF (production, alone) | PASS: rc 0, complete, failures [], 252 rows, **93/93** asserted, 0 NEW, 181 deterministic rows EQUAL to C359, none higher. Nine rows: play 1/28/1/1/28; fades 3/2/2/2, all ×3 equal. durationMs 418424 (≤540000) | perf.log, latest-interactions.json, perf-rowcmp-vs-c359.txt |
| PERF-LIB | PASS 40/40 | perf-lib.log |
| MUTANT MU-C (own, scratch) | Predicted first (progress.json): Ruler subscribing to `useArrangementIsPlaying` → start/stop-components > 28. Observed 30×3 on exactly those two rows, 2 failures out of 93; commits 1, sources 1, fade rows unchanged. Scratch deleted, store unchanged | mutant-MU-C.diff, mutant-perf.log, mutant-results/ |
| VIDEO-FAIL-STOP-2 | PASS: clip start 4.000; afterPlay playing true; final playing false, pos 00:04.002, status "Video playback failed — try MP4 (H.264) or WebM." First attempt timed out at cold-server "ready" (environment, kept), replacement passed | vfs-v2-1440x900.json |
| VIDEO-FAIL-STOP-3 | PASS: manual status "Follow paused by manual navigation…", mode paused, playing true; final stopped at 00:04.002 with failure text; Follow back to on / aria-pressed true | vfs-v3-1440x900.json |
| VIDEO-FAIL-STOP-1 | PASS: videoFail row playing false + failure text at both viewports; 1280 rows fully equal to C359; 1440 differs only by 1 px scrollLeft / 11 ms pos (follow jitter, info) | beh-tree-*.json |
| G360-AUTH | PASS: `/studio-lab` opens demo in a fresh context with no auth_user; `/studio/middle-east` shows sign-in required, 0 audio elements; unauthenticated token GET 401; no token in body (both viewports) | auth.json |

**Blocked:** fake-bearer token request returns 500 (fails closed) because the mock backend is down in cloud; 403 not observable. Not a pass, not an A fault.

**Gate rows (not claimed):** full vitest, typecheck, build, Biome, verify, e2e smoke.

**Finding (Low, origin B spec):** C-R360-NOTE-STALE: stale/contradictory `note` text in the sha-pinned budgets file (A's review Lows 1–2; fade.playing is [2,2,2] again). Doc-only → deferred_low_polish.

**Untested (info):** the 0-commit side of `== 1` has no mutant (TL-R360-3).
Ableton conformance: not applicable. L57: check exits 0.
