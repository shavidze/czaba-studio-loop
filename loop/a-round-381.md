# A round 381: PERF-13a, the perf harness measures live decoded PCM

No STOP. The scope in §2 of the task is implemented. No `app/**` file changed. Browser, perf and mutant rows were not run by A; they belong to C.

## Changed files (all 5 are in `b-round-380/grants-381.txt`)
| File | Change |
|---|---|
| `perf/lib/pcm-live.ts` (new) | `installPcmLiveRegistry` (self-contained init script, 4 creation points → `{ ref: WeakRef, origin }`, `window.__czabaPcm.read(probe)`), `summarizePcmLive`, `pcmLiveProblems`, `readPcmLiveAfterGc` (probe evaluate → GC, 100 ms, GC → one read evaluate that marks and releases the probe) |
| `perf/lib/pcm-live.test.ts` (new) | PL1, PL2, PL3 (valid / missing alone / probe alone / count alone / order), PL4 |
| `perf/studio-lab-resources.perf.spec.ts` | +33 lines: imports, `addInitScript(installPcmLiveRegistry)`, 1× `beginStep('pcm ready')` after the existing ready heap block (`waitForCollectionReady` → listbox option count → `readPcmLiveAfterGc` → problems + 3 samples), and the after-export delta inside the existing after-export `if (record)` block |
| `perf/budgets.resources.json` | 4 rows inserted after `res.mem.backing-after-export-delta-mib`; insert-only diff (+44), all other rows byte for byte |
| `docs/implementation/2026/quarter-IV/247-perf-pcm-live-baseline.md` (new) | l.4 `**სტატუსი:** In Progress (stage 1 of 4; C round 381 PASS)`, 7 TEMPLATE headings in order |

Design notes:
- The probe exclusion lives in pure code: entries carry `probe: boolean`, and `summarizePcmLive` skips it (this is what makes PL4 a real unit row).
- "pcm registry missing" returns alone (an early return).
- `expectedCount` uses `studioLibraryPanelStrings.listLabel` ('Sounds'), imported from `app/lib/arrangement/strings` and only read, so there is no literal.
- The spec's extra `beginStep('pcm ready')` adds one `stepMs` key and labels an abort as `aborted at pcm ready`.
- I checked that the transpiled init script is self-contained (esbuild output: no module refs).

## Checks actually run
- `npm run typecheck`: rc 0 (`a-round-381/typecheck.log`).
- `npm run lint`: rc 0. It reports 205 warnings and 1 info that were already there, and Biome checks `app/**` only (L30) (`a-round-381/lint.log`).
- Budgets JSON parse: OK. 65 rows, 7 `res.mem.*`.
- `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs`: **3 files, 48 tests pass** (pcm-live 8, report 34, zoom-probe 6).
- Unit mutant **MU-13A-SUM-NO-CHANNELS**: rc 1, red = `PL1: sums length × channels × 4 …`, `restored` (`a-round-381/mutants/out/summary.txt`, run on a scratch copy, which was then removed).
- The anchors of both browser mutants match exactly once in `perf/lib/pcm-live.ts` (python count check). I did not run them.
- The `instanceof AudioBuffer` grep was not re-run. I added no such check.
- Doc: `grep -rn 'C round [0-9]* pending' docs/implementation` → 0.
- SOURCE-SCOPE pre-run: `sha256sum -c --quiet` on `b-round-380/r381-frozen-sha256.txt` → rc 0, on `b-round-318/protected-sha256.txt` → rc 0. `git status`: exactly the 5 granted paths.
- CLAIMS pre-run: `bash b-round-380/claims-381.sh` → `a-round-381/claims.txt`, rc 0, 0 `MISSING`. The diff vs `claims-381-output.txt` differs in K2 (0→5) and K15 (247 present), as B expected. **It also differs in K8, K10 and K16, and each of these follows from a change the task mandates:** K8 `res.mem` rows 3→7; K10 line numbers shifted, plus a 4th `addInitScript` (`installPcmLiveRegistry`); K16 lists doc 247 (`In Progress (stage 1 of 4 …)`). K7 (`instanceof AudioBuffer`) is unchanged.
- Report-write order: `latest-resources.json` is written before the `expect(report.failures)` line, so a mutant run still leaves the JSON. Even so, the runner now greps both the JSON and the playwright log (`json-hits` / `log-hits`).
- `waitForCollectionReady` after `waitForLibraryReady` is the same pattern the stem-cache spec uses (`openStudio`, l.177–181). The `Sounds` label is the `role="listbox"` `aria-label` (`ArrangementLibrary.tsx:839`).
- After the advisor review, only the budget notes and scenario strings changed: `x` → `×` to match the task's wording. JSON re-parsed, the diff is still insert-only (0 removed lines), and the perf lib vitest was re-run (3 files, 48 tests pass) along with typecheck (rc 0). No `.ts` code changed after the code-reviewer.

## Mutant runner (for C)
`a-round-381/mutants/run-mutants-381.sh`, run as `TREE=<cp -a copy, node_modules symlinked> OUT=<abs> MODE=unit|browser|all`. Each mutant applies one anchored replace, checks the anchor count is 1, runs its command, and restores the file. The script prints `restored` after comparing against a pristine copy. Browser mode runs the PERF-RES playwright command and greps `test-results/perf/latest-resources.json` for the expected strings below.

| Mutant | Edit | Expected |
|---|---|---|
| MU-13A-SUM-NO-CHANNELS (unit, A ran it) | `entry.length * entry.numberOfChannels * 4` → `entry.length * 4` | PL1 red |
| MU-13A-NO-DECODE-WRAP (browser, C) | delete `  proto.decodeAudioData = trackedDecode;` | `pcm live count 7 ≠ 9 library sources` |
| MU-13A-NO-CTOR-WRAP (browser, C) | delete `  window.AudioBuffer = TrackedAudioBuffer;` | `pcm registry did not count its probe buffer` **and** `pcm live count 2 ≠ 9 library sources` |

Basis: B's probe shows 7 `ctor` and 2 `decode` buffers. `new AudioBuffer(` appears in `app/data/studio-lab-demo.ts:122` (the demo sources). `ArrangementContext.tsx:1133` is the metronome, created only on playback.

## code-reviewer (run, 7.5/10, no Critical or High)
- **M1, existing rows may shift.** `waitForCollectionReady` plus 2 GCs now run before Add, in the 1× pass only, so Add and export-1 can no longer overlap a decode still in flight. This placement is mandated by task §2.3. **C: compare `res.dom.page-1`, `res.export.1.*`, `res.export.2.*` and `res.mem.backing-after-export-delta-mib` with `c-round-380/perf-res.log`.** A new abort path is also possible: `aborted at pcm ready` when the collection status is not ready within 15 s.
- **M2, the `perf/lib/*.test.ts` files are not in `test:run` or `verify`** (`vitest.config.ts` includes `app/**` only). This was already true before this round (GATE304-M1); the config is outside the grants. → For B/root.
- **M3, no proof that unreachable buffers disappear.** The probe is held strongly, so a strong-ref regression would go unseen. Fixing it means a fourth problem string or a second probe, which changes the guard B ruled, so it is **not implemented (L11)**. → Proposal for B: a dropped probe that must be absent after GC ×2. It is recorded in doc 247's TODO as a proposal.
- L1: after export, `pcmLiveProblems` is not applied. The spec rules only the delta there; a count check after export could fire on a legitimately live render buffer. Not changed.
- L2: whether the after-export delta stays deterministic depends on the app state. The task pre-rules it (C records both values).
- L3: WeakRef tracks the JS wrapper, so a buffer reachable only from C++ is missed. At ready this is fine, because `buffersRef` holds every buffer. This is now stated in doc 247.
- L-doc: the doc overstated what the probe proves. Fixed in doc 247 (wording only).
- Rejected: "the callback form makes a new unhandled rejection". `.then` handles the native promise and the caller gets the derived one, so the number of unhandled promises equals the native case. The doc claim holds.
- L-drift: the spec's `resourceSequence` text does not mention the pcm step. Not changed, because the task says "nothing else in the spec changes". → Info for B.
- After the review, only doc wording changed (L-doc, L3, the M3 proposal). No code changed after the review.

### For B (proposals)
- Add `perfLibraryListLabel` to `perf/lib/app-labels.ts` (not granted). The spec imports `studioLibraryPanelStrings.listLabel` from `app/lib/arrangement/strings` directly.
- The spec's `resourceSequence` text should mention the pcm step.
- M2: put `perf/lib/*.test.ts` into a gate config. M3: add a dropped-probe guard.

### Architecture note (for B/root, not acted on)
The count guard ("live = library sources") is the only proof that the `decode` wrap is still live. 13b's eviction will break that equality by design. Proposal, before or inside 13b: a decode probe that does not depend on the library state (the harness decodes a tiny WAV, keeps it, and asserts that one `'decode'` entry exists), plus a count rule that matches the eviction policy.

## Known gaps
- No browser run, perf run or browser mutant run by A (speed rules). PERF-RES, PCM-PROBE-BROWSER, HARNESS-MUTANTS and G381-AUTH are C's.
- Nothing has shown yet that the registry leaves the existing rows unchanged (M1).

## Next C checks (task §4)
SOURCE-SCOPE (5 status lines, all in the grants, none under `app/`; both sha checks), CLAIMS, UNIT-PERF-LIB (3 files / 48 tests), PERF-RES (0 problems, existing rows vs `c-round-380/perf-res.log`, new rows ≈ 124.0 / 9 / 92.2 / delta recorded), PCM-PROBE-BROWSER, HARNESS-MUTANTS (`MODE=browser` on a copy, alone), G381-AUTH, DOCS.

## Acceptance (§3, A's part) actually passed
- [x] typecheck rc 0, lint rc 0
- [x] budgets JSON parses
- [x] perf lib scratch-config: 3 files pass, PL1–PL4 included
- [x] mutant runner written; MU-13A-SUM-NO-CHANNELS red on PL1, restored
- [x] code-reviewer run; Mediums handled as above (none fixed in code: M1 is C's measurement, M2 and M3 go to B)
- [ ] Browser and perf rows: not run (C)
