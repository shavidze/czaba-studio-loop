# C — Round 213: GATE212-B1 (CP12 split, test-only). Verdict: **PASS**

browserVerified = realVerified = **true**. Bugs: **0**. Gate rows are not claimed. Env: `env-status.json` gives store 200; `:5173/studio-lab` returned 200; the `:5199` mock was not running (curl 000).

Evidence: `c-round-213/out/`, `c-round-213/shots/`, `c-round-213/tools/`. The source stayed read-only. The mutant ran only in `/tmp/c213scratch`, which was deleted afterwards.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SCOPE-213 (start + end) | **PASS** | See below. |
| COVERAGE-213 | **PASS** | See below. |
| LOAD-213 | **PASS** | See below. |
| DOC-213 | **PASS** | See below. |
| AN-REVIEW-213 | **PASS** | See below. |
| G213-3 (browser) | **PASS** | See below. |
| STUDIO-SMOKE-213 (browser) | **PASS** | See below. |
| gate | not claimed | Root gate: full vitest (CP12a–d inside 30 s under gate load), typecheck, build, Biome, `npm run verify`, e2e smoke. |

### SCOPE-213 (start + end)
- HEAD is `28a274c` at start and at end.
- `git status` shows the round-212 set only (7 M + 2 ??) and nothing new.
- `sha256sum -c` of the 1,057-file list: rc 0 at start and at end.
- The 2 grants differ from their start copies, as expected.
- Test-file diff hunks: `213a214,219` (the constant), `901,902c907,924`, `906c928`, `926a949,956` and `955d984`. All of them are inside the CP12 block, so CP1–CP11 and CP13–CP17 are byte-identical.
- Doc 167 differs only at `70c70` and `110c110`; l.4 is unchanged.
- Evidence: `out/scope-end.txt`.

### COVERAGE-213
- **Independent coverage computation** (`out/coverage-calc.txt`): 841 values, equal to `range(-600, 241)`, 841 unique. Chunk sizes are 210/210/210/211. `CLIP_GAIN_MIN_DB` = -60 and `CLIP_GAIN_MAX_DB` = 24 (`model.ts:21-22`).
- **Old vs new `expect` lists.** Every old `expect` is present:
  - `gainOf cm -6`, `mismatches []` and `undoLabel null` are in CP12a–d;
  - the Shift-fine `fineDb` ×2, `viaPointer toEqual expected` and `viaPending toEqual viaPointer` (×3 anchors), and `undoLabel null` are in CP12e;
  - CP12-COVER adds a `toEqual` of its own.
- The loop step is `tenth++` (0.1 dB). The describe timeout is still `{ timeout: 30_000 }` at l.503, and no per-test timeout was added.
- **File alone:** 25/25 on both runs (`out/file-run1.log`, `file-run2.log`). Times in ms:

  | Run | COVER | a | b | c | d | e |
  |---|---|---|---|---|---|---|
  | 1 | 1 | 2463 | 3004 | 2649 | 2204 | 163 |
  | 2 | 1 | 2633 | 2705 | 2811 | 2317 | 184 |

- **C's own mutant C1** (`out/mutant-C1.diff`, `mutant-C1.log`):
  - Change: in the scratch `ArrangementContext.tsx` l.466 (`withMixOverride`, the clip-gain branch), a single-clip override of exactly -30 dB now writes -29.9.
  - Result: **only CP12b is red** (`expected [ 'single -30: -29.9 vs -30' ] to deeply equal []`). The other 24 tests passed, including CP12a, CP12c, CP12d and CP12e.

### LOAD-213
- Command: `npx vitest run app/lib/arrangement app/components app/hooks --reporter=verbose`.
- Conditions: no other vitest, Playwright or Chromium process was running (`ps`), but the idle `:5173` dev server was up. The machine has 4 CPUs (`nproc`). The gate runs with a different process mix.
- Result: rc 0, 155/155 files, 2236/2236 tests, 130 s wall (`out/covering-run.clean.log`).
- CP12 times in ms: COVER 1, **a 4209, b 4184, c 4380, d 4162** (all < 12 s), e 483.
- **5 slowest single tests:**
  1. CP12c — 4380 ms
  2. CP12a — 4209 ms
  3. CP12b — 4184 ms
  4. CP12d — 4162 ms
  5. `mixer-onstate-colour-ui` DXM3 — 1912 ms

  Nothing else is above 15 s.

### DOC-213
- l.70 is Problem → Solution and gives A's numbers.
- The cited ids exist in the test file: CP12-COVER (1), CP12e (1), `CP12_SLIDER_CHUNKS` (3) and `CP12%s` (1).
- "33.3 s" matches `gates/round-212/verify.log` l.552 (33332 ms). "33.8 s" and `maxWorkers: 4` match `a-round-212.md` and `vitest.config.ts:8`.
- l.110 is the new TODO. l.4 is unchanged: `In Progress (C round 212 check pending)`.

### AN-REVIEW-213
- The added lines contain no `any`, ` as `, `@ts-*`, `biome-ignore` or `timeout` (`out/added-lines.txt`; grep rc 1).
- Semicolons are present.
- `npm run typecheck` rc 0.
- `npx biome check` on the 2 paths: rc 0, "No fixes applied".

### G213-3 (browser)
Evidence: `out/g213-3.json` and the `shots/g213-3-*.png` files.
- **`/studio-lab`, fresh contexts at 1440 and 1280:** `auth_user` null, 0 cookies, the workspace renders, and the "Demo collection — no sign-in required" badge is shown. 0 forbidden requests and 0 `Authorization` headers.
- **`/studio/middle-east`, at 1440 and 1280:** "Sign in required" is shown, there is no workspace, and there are 0 `audio[src]`.
- **`/api/studio-token`:**
  - with no header: **401**;
  - with a fake Bearer: **500** "Unable to prepare Studio access", because the mock was not running, which the task allows. No set-cookie, 0 context cookies.
  - **No token was issued.**
- 0 page errors and 0 hydration warnings.
- Harness note: the first attempt stopped inside C's own script (`document.body` was null during an evaluate, from a dev-server reload). The counted run is the rerun with the existing retry wrapper.

### STUDIO-SMOKE-213 (browser)
Evidence: `out/smoke-{1440,1280}.json` and the `shots/smoke-*` files.

Flow at each viewport, in a fresh context with no credentials:
1. Add the demo clip from the Library (0 → 1 clip).
2. Click the clip to select it.
3. Expand the detail panel if needed. It started **collapsed at 1280** and expanded at 1440; both ended expanded.
4. Drag the Clip Gain fader 8 px with the real mouse, then release.
5. Undo with the toolbar button.

Results:
- **Both viewports:** the value went from 0.0 to +7.0 dB, and the field and the fader agreed.
- **One history entry:** during the drag the top entry was still "Undo: Add …". After release it was "Undo: Clip Gain".
- **Undo:** the value went back to 0.0 / fader 0. The top entry returned to "Undo: Add …" and Redo became "Redo: Clip Gain".
- 0 page errors and 0 non-environment console errors.
- Disclosure: a first 1440 attempt used a 30 px drag (clamped to +24.0) and an early verdict rule that wrongly required an empty Undo stack, so the existing "Undo: Add" entry counted against it. Its own data showed the same behaviour: one "Undo: Clip Gain" entry, and Undo restored 0.0. I then changed the drag to 8 px and the rule to "top entry before → 'Undo: Clip Gain' → back to the same top entry with 'Redo: Clip Gain'", and reran both viewports. Those reruns are the counted results.

## Product / Ableton
- **CZABA requirement:** the CP12 timeout that blocked publishing the verified SABA-B-5 fix is split as ruled (D-29z201), with no check lost. Whether it fits inside 30 s under the gate's full parallel load is for the gate to confirm.
- **Ableton conformance:** does not apply (test-only round).

## Back to B
- No bugs.
- Signal only (not a finding): under the covering load, CP12a–d now take about 4.2–4.4 s each on this runner, against a 30 s timeout. Under the gate's ≈2.1× load that is roughly 9 s, which leaves wide headroom. B-R212-TIMEOUT-HEADROOM can use these numbers.
