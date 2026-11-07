# A round 396 — PERF-13c-ii-b (stage 3 of 3): purchased previews stream; harness proves a preview decodes nothing

No STOP. No commit, push, stash, checkout, install, dev-server restart, browser or perf run (task §5).

## Changed files (exactly the 8 grants; `git status --short` shows only these)
| File | Change |
|---|---|
| `app/lib/arrangement/collection.ts` | +1: `previewUrl: (source) => stemUrls.get(source.id) ?? null,` (§1.1), from sketch |
| `app/lib/arrangement/preview.client.ts` | +1: `element.crossOrigin = 'anonymous';` right after `createAudioElement()`, before `src` (§1.5), from sketch |
| `app/lib/arrangement/__tests__/collection.test.ts` | new describe `PERF-13c-ii-b purchased adapter previewUrl (D-29z1352)`: PV1, PV2 (sketch) |
| `app/lib/arrangement/__tests__/library-preview-stream.test.tsx` | PS27 (13c-i describe), PS28, PS29 (13c-ii-a describe), sketch + **one deviation** (below); PS1–PS26 unchanged |
| `perf/studio-lab-resources.perf.spec.ts` | step `a2`, `measurePreviewStream`/`runPreviewStream`, `classifyPcmProbe` import, `previewStreamTimeoutMs` (sketch) |
| `perf/budgets.resources.json` | 3 assert rows after `res.mem.pcm-live-decode-mib-ready` (sketch) |
| `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md` | l.1 `(rounds 393–396)`; l.4 `**სტატუსი:** Completed (C round 396 PASS)`; project line + `collection.ts` and the 2 perf files; stage-3 text under existing headings (0 new `## `, 7 TEMPLATE headings in order); TODO stage-3 bullet struck as done with the signed-URL premise corrected per §1.2; TODO keeps trickle gap + SRW-21-PLAN rows, adds ARCH-CHECKPOINT-PREVIEW-AFTER-13C and TL-B395-SRW21-MEMO-ADAPTER |
| `docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md` | l.4 only → `**სტატუსი:** Completed (C round 392 PASS)` (`git diff --stat`: 1 line) |

Sketch `b-round-395/sketch-396.patch.txt` (sha256 `91c5d73012eeb0b4…`) applied with `git apply` on clean `cf81dff`.

### Deviation from the sketch (tests only, inside §1.5)
- **PS29 strengthened after a code-review Medium:** the sketch's PS29 checked only the final attribute, so moving `crossOrigin` after `src` (against §1.5 placement) would pass. PS29 now spies on the `HTMLMediaElement.prototype` `src` setter (calls through to the native setter) and asserts `crossorigin` was already `anonymous` when `src` was assigned (`crossOriginAtSrc` = `['anonymous']`). Spy restored by the describe's existing `afterEach(vi.restoreAllMocks)`. No `as`/`any`.
- New mutant **MU-A396-CROSSORIGIN-AFTER-SRC** (line moved after `element.src = url;`): PS29 RED, 1 failed / 27 passed (`a-round-396/mutants/mutant-MU-A396-CROSSORIGIN-AFTER-SRC.log`); pristine after rc 0 (`pristine-after-ps29.log`).
- Row id, title and counts unchanged (K11 equals sketch).

## Commands (logs under `a-round-396/`)
| Command | rc | Log |
|---|---|---|
| claims at start (`b-round-395/claims-396.sh`) | 0, identical to `claims-396-planning-output.txt` | `claims-start.txt` |
| `npm run typecheck` (final) | 0 | `typecheck-2.log` (first run `typecheck.log` rc 0) |
| `npm run lint` (final) | 0 (205 warnings, 1 info repo-wide; 0 errors; scoped Biome on the 4 owned paths reports 0 warnings) | `lint-2.log` |
| `npx biome check` 4 `app/**` paths (final) | 0 | `biome-scoped-2.log` |
| `npx vitest run` covering set (19 files) (final) | 0 — 19 files, 314 tests | `covering-2.log` (first run `covering.log`, same counts) |
| unit mutants `python3 -I b-round-395/mutants/run.py /home/runner/czaba-project/tmp/a396-scratch a-round-396/mutants` (re-run on final tests) | 7/7 RED, pristine rc 0, pristine-after rc 0; identical to `b-round-395/mutants/summary.txt` | `mutants/summary.txt`, `mutants/mutant-*.log` |
| extra mutant MU-A396-CROSSORIGIN-AFTER-SRC | RED (PS29) | `mutants/mutant-MU-A396-CROSSORIGIN-AFTER-SRC.log` |
| claims at end | 0 | `claims-end.txt` |
| `sha256sum -c b-round-395/r396-frozen-sha256.txt` | 0, 0 failures | `frozen-check.log` |
| `sha256sum -c b-round-318/protected-sha256.txt` | 0, 11 OK | `protected-check.log` |
| `grep -rln 'In Progress (stage' docs/implementation \| wc -l` | 4 | — |
| `grep -rn 'C round [0-9]* pending' docs/implementation` | 0 hits | — |

Mutant summary: MU-396-PURCHASED-NO-PREVIEW → PV1,PV2; MU-396-PREVIEW-LIVE-INPUT → PV2; MU-396-UNKNOWN-NOT-NULL → PV1; MU-396-FALLBACK-ANY-COLLECTION → PS27; MU-394-SYNC-THROW-SEEK → PS23,PS28; MU-396-NO-CROSSORIGIN → PS29; MU-394-STALL-SURVIVES-STOP → PS19,PS22,PS28 (all RED).
Scratch copy for mutants: `/home/runner/czaba-project/tmp/a396-scratch` (outside `store/`, `node_modules` symlinked; left in place).

**Timeout headroom (L31):** slowest covering test LRS4 1739 ms (first run) / 1647 ms (final) vs 15 s describe timeout (< 50 %). New rows take ms.

**Claims end vs planning:** only §7 facts differ — K2 `cf81dff 8`; K8 preview-url 1; K9 cross-origin 1 (rest equal); K11 collection-PV 2, stream 28, last PS29, PS27/28/29 = 1; K12 3/4/3/70; K13 doc252 l4/l1 as §3, headings 7, doc248 l4 as §3, in-progress-docs 4; K15 adds `collection.ts`; K19 applies-to-tree no. K10 (provider) and K14 equal. Vs `claims-396-on-sketch.txt` only K2 (sketch tree) and K13 (docs) differ.

## B §5 rows run by A (jsdom)
PV1, PV2, PS27, PS28, PS29 green; PS1–PS26 green, no assert removed or weakened; each named mutant red on its row. A did not run full suite, verify, build, perf spec or browser (task §5) — those are C/gate rows.

## Code review (`code-reviewer` subagent, 2 passes)
**Pass 1 (8 files):** 0 Critical, 0 High.
- **Medium — fixed:** PS29 did not pin before-`src` ordering → fixed as above (inside §1.5, owned test file).
- **Low — fixed (doc):** "credential-free" wording. `crossorigin="anonymous"` = credentials mode `same-origin`: same as `credentials: 'omit'` for cross-origin signed stems, different for same-origin demo URLs. Doc 252 §1.5 text corrected. The **PS29 title** still says "like the credential-free decode fetch" (sketch text); left unchanged to keep row title stable — for B: retitle in a later owned round if wanted.
- **Low — not changed (B signal):** PS28 `onError(3)` value comes from the stubbed getter; real checks are timer/src/offset. Matches B's row spec.
- **Low — not changed (B signal):** the signed URL is now reachable via `collection.previewUrl`; today it only reaches `playLibraryPreviewStream`, stop removes `src`; no wider than the fetch's Network exposure. Keep it out of logs/status strings.
- **Low — deferred already:** restore in `finally` can mask the original perf error = B-R395-PERF-RESTORE-CATCH (deferred §1). No change.
- **Low — outside grants (B signal):** doc 248 TODO (~l.93) still lists PERF-13b-ii as a next step while l.4 now says Completed. Only l.4 granted; not edited. Proposed id: A-R396-REVIEW-DOC248-TODO.
- **Architecture note (signal for B/root, not implemented):** URL stability (seek key) and fallback reset both rely on callers creating exactly one collection object per signed-URL lifetime; neither adapter nor provider enforces it. Proposal: TL-B395-SRW21-MEMO-ADAPTER in SRW-21-PLAN with a row that fails when the adapter is created per render.

**Pass 2 (post-review PS29 change + doc sentence):** 0 Critical/High/Medium. Lows: PS29 also pins a single `src` assignment (accepted); duplicate demo sentence in doc → removed (doc-only edit after pass 2).

## Known gaps / blocked
- **PURCHASED-PREVIEW-BROWSER:** BLOCKED "no mount point: SRW-21 deferred_user" (§1.6); K14 shows 0 non-test callers. Unit PV1/PV2 + provider PS6–PS14 only.
- Perf rows (`res.harness.preview-stream-playing`, `res.mem.pcm-live-preview-*`) not run by A; only B's sketch numbers (1/0/0). C's PERF-RES decides.
- PV1, PV2, PS27, PS28 are jsdom-only (PS28's setter throw cannot be forced in a browser).
- Deferred Lows untouched: A-R394-REVIEW-L3, A-R395-REVIEW-L1, GATE395-L1, GATE395-L3, B-R395-PURCHASED-DUP-URL, B-R395-PERF-RESTORE-CATCH.

## Exact next C checks (task §6)
1. SOURCE-SCOPE start: claims = `a-round-396/claims-end.txt` facts (§7 set); `git status` = 8 grants; frozen manifest 0 failures; protected 11.
2. **PERF-RES alone first:** `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` — assert preview-stream-playing ≥ 1, preview delta ≤ 0, decode-count ≤ 0, `failures` empty, pcm-live-mib-ready ≤ 60, pcm-live-decode-mib-ready ≤ 0; record `res.mem.pcm-*` vs C 395 and B sketch.
3. R8 CROSSORIGIN (element `crossOrigin` = `anonymous`, playing ≥ 1 s, 0 decodes, 0 buffer starts, toggle `Stop`), then R1b, R1, R3, R2, R4, R5, R6, R7 at 1440×900 and 1280×720 (server :5173, warm first).
4. PURCHASED-PREVIEW-BROWSER BLOCKED via K14; AUTH row; DOCS row (doc 252 headings/l.1/l.4/ids; doc 248 1-line diff; 4 `In Progress (stage` files; 0 `pending`). PS29 strengthening and MU-A396-CROSSORIGIN-AFTER-SRC are cited in doc 252 and exist in test + log.

## Scope completed
Task §3 items 1–8 implemented; §5 A rows run green with mutants red. B acceptance that only C or the gate can pass (perf, browser, full verify) is **not** claimed. PERF-13c / backlog not marked complete by A.
