# C — Round 99 verification: one held Enter adds exactly one clip

Verifier: C · Date: 2026-10-23 · Target: `http://127.0.0.1:5173/studio-lab` · Playwright with installed Chromium, a fresh incognito context per scenario, no credentials. Source was read-only. No commit, push or server start/stop.

**Verdict: PASS.** `browserVerified=true`, `realVerified=true`. Bugs: 0. Blocked: the G99-3 fake-Bearer sub-check (backend unavailable in cloud).

## Source state (start and end of C phase)
- HEAD `736db33c339bcef4757535d60524c2f92d7e6587`. Status: 4 M + 2 ?? as expected.
- Frozen list: 528/528 OK. A's `end-hashes.txt`: 6/6 OK. Protected file prefixes unchanged (`fa2cf0bc 13914809 caa388e7 0995ae78 741c2341 ddb70919 56f5b76f bf9ee257 23468664 280fe7f2`).
- `git diff -U0` hunks:
  - `ArrangementLibrary.tsx` @@ -245,2 +245,4;
  - `StudioWorkspace.tsx` @@ -1967 +1967,3;
  - `ArrangementLibraryPreview.tsx` @@ -306,0 +307,5;
  - doc 086 @@ -4 +4.

  All four are inside the allowed ranges.
- The end hashes are identical to the start hashes (`c-round-99/start-hashes.txt`).

## Browser rows
"Held Enter" here is `keyboard.down('Enter')` ×3, 50 ms apart, then `up`, then 1.2 s.
- A capture-phase recorder logged `key`, `repeat` and the active element, plus clicks.
- A bubble listener installed after app load read `defaultPrevented` late (per C-R98-N4).

| ID | VP | Result | Evidence |
|---|---|---|---|
| HOLD-ROW | 1280 | PASS | 3 keydowns on `BUTTON#demo-middle-east`: `repeat` false/true/true. Clips 0 → **1**. Status `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.` After blur + one Ctrl+Z: 0. `shots/holdrow-1280x720.png` |
| HOLD-ROW | 1440 | PASS | Same keydowns and the same status. 0 → **1** → Ctrl+Z → 0. `shots/holdrow-1440x900.png` |
| HOLD-BODY | 1280 | PASS | After the status click, `activeElement` = BODY. 3 keydowns on BODY (false/true/true). Clips 0 → **1**. The late listener saw `defaultPrevented=true` on all 3. |
| HOLD-BODY | 1440 | PASS | Same as 1280 (0 → 1). The first attempt was invalid: the page navigated during setup, before any action. One re-run replaced it. |
| HOLD-PLUS | 1280, 1440 | PASS | Focus by `locator.focus()`. 3 keydowns on ＋ დამატება. The first (`repeat=false`) was not prevented and made exactly **1 click** on ＋. The 2 repeats had `defaultPrevented=true` (both early and late bubble). Clips 0 → **1**. Focus stayed on ＋. `shots/holdplus-*.png` |
| FRESH-ADD | 1280 | PASS | Two row `press('Enter')`: 0 → 2 (both `repeat=false`). Two ＋ clicks: 2 → 4. Focus ＋ + `press('Enter')`: 4 → 5 (`repeat=false`, 1 click). Row dblclick: 5 → 6. |
| HELD-ARROW-REG | 1280 | PASS | ArrowDown ×3 held (false/true/true): middle-east → hero-music → soft-impact → **slow-rise** (focus and `aria-selected`). Clips 0 → 0. |
| SPACE-REG | 1280 | PASS | 1 clip; focus BODY. Play → Space → **Pause**, position 00:00.000 → 00:00.972 (transport really ran) → Space → **Play**, position 00:01.050. |
| CLOSE-HOLD-REG | 1280 | PASS | Focus on დახურვა after 3 ms. First Enter clicked დახურვა once. The 2 repeats landed on toolbar Export, with no click on Export. After that the dialog was closed, focus was on `Export` and there were 0 clips. |
| EXPORT-REG | 1280 | PASS | After HOLD-ROW and Ctrl+Z, one fresh Enter brought clips to 1, then WAV export ran. Exactly 1 download, `czaba-studio-lab.wav`, 29,189,420 B. RIFF/WAVE, PCM tag 1, 48 kHz, 2 ch, 24-bit, 4,864,896 frames = **101.352 s** (matches clip length 01:41.352 and the status `WAV შეიქმნა: 01:41.352, 24-bit · 48 kHz · stereo.`). NaN 0, RMS 0.172, peak 1.0. |
| PX-NET | all 11 sessions | PASS | 0 requests to studio-token/R2/recording-*/download from pages; 0 `Authorization` headers (`out/px-net-agg.json`). |
| REG-HYD | all sessions | PASS | 0 non-noise console errors/warnings, 0 pageerror. 20 noise lines are cart/`ERR_CONNECTION_REFUSED`, expected in the cloud. |
| G99-3 | 1440 anon | PASS (partial) | The header link opened `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` showed "Sign in required", 0 workspace and 0 audio. `/api/studio-token` returned **401** `{"error":"Please sign in to access Studio."}`. The fake-Bearer sub-check is **BLOCKED** (backend unavailable in cloud). |

## Offline rows
- **AN-REVIEW: PASS.** I re-ran the mutations independently in my own scratch (`c-round-99/mut`, cacheDir in scratch) with my own replacements (`tools/mut99.cjs`, `out/mut99.json`):

  | Run | Red tests |
  |---|---|
  | control | none, 8/8 |
  | fail-before (B snapshots) | HA1, HA3, HA5, HA8 |
  | a | HA1, HA8 |
  | b | HA3 |
  | c | HA5 |
  | g | HA6 |

  This is identical to A's table and §1.
  - The new test has no `as` and no `@ts-`, and uses 43 `toBe`.
  - It also has 3 `toEqual`: on `{key, repeat}` objects and on an id array. Those are exact structural comparisons, so I accept them.
  - The `'q'` claim holds: no `'q'`/`KeyQ` in the arrangement components, lib or context outside tests.
- **T99-TARGETED: PASS.** `npx vitest run $(cat a-round-99/targeted-list.txt)` gave **55 files, 969 tests** passing, exit 0 (`out/targeted-c.log`). Re-running the §2 grep gives the same 55 files; none is missing.
- **SOURCE-UNCHANGED: PASS** (see above).
- **Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Ableton correspondence
- Held Enter adds one clip: **დაუდასტურებელი** (no source was consulted). This is CZABA's own SRW-12 R12-L2 rule.
- Space on a focused button: **დაუდასტურებელი**.

The CZABA requirement is met. No Ableton claim is made.

## Notes for B
- **N1:** the 1440 HOLD-BODY first attempt was invalid because of an environment navigation (`Execution context was destroyed` in setup). It used 1 of the 2 extra attempts. The probable cause: G99-3 was running at the same time against the same dev server and loaded `/` and `/studio/middle-east` for the first time in this job. Vite's dependency re-optimization reloads every connected client. That makes this an environment artifact, not app behaviour; don't run G rows at the same time as held-key measurements.
- **N2:** the WAV has 30 full-scale samples (peak 1.0). This is the same pre-existing demo-content pattern as C r97 N3 and C r98 (486). It is not from this round.
- **N3:** HOLD-ROW repeats are stopped at the row (`stopPropagation`), so window listeners don't see them. This is expected.
- **N4:** `root-pre-push-review.md` and `publication-checkpoint.json` are from round 3 (2026-10-07) and stale. They add no remaining findings for this round.
- **N5:** `B-R98-H1-PREVIEW-TOGGLE-HOLD` (held Enter on ▶ მოუსმინე) was not probed. It is still a hypothesis.
- Doc 087 has the TEMPLATE sections and records the three paths, the rejected alternatives, the doc 085 boundary and the H1 hypothesis. Doc 086 l.4 is updated.
