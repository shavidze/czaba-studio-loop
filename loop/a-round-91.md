# A round 91 — SRW-20 stage 3b-2 (D-29z56): honest WAV + MP3 note, honest MP3 timeout text, in-place clamp in the WAV worker

Implementer: A (Claude Opus 5.5) · Date: 2026-10-22 · Task: `current-task.md` (round 91)
Scope completed: G1, G2, N1, T1, the four test-declaration grants, new IP1–IP5 test file, doc 078 l.4, new doc 079. Nothing outside the §1 grant table was edited. No commit/push/server start-stop.

## Baseline (verified before the first edit)
HEAD `35c8403…`, `git status` empty, frozen list 506/506 OK, all eight owned hashes matched the task table, LF/CR=0.

## Changed files (end state: 8 M + 2 ??, frozen 506/506 OK after the edits)
| File | Change | end sha256 prefix |
|---|---|---|
| `app/lib/arrangement/export-wav.ts` | new export `encodeArrangementWavInPlace` (measure → clamp in the given arrays → `encodeSfxWav` on the same arrays); `encodeArrangementWav` byte-identical | `74dd4f6f` |
| `app/lib/arrangement/export-wav.worker.ts` | import + call swapped to the in-place variant; Biome wrapped the call's arguments (same callback body, progress throttle, complete/transfer and error path unchanged) | `51cc32db` |
| `app/components/arrangement/ArrangementExportDialog.tsx` | `BOTH_FORMAT_NOTE` only (Biome wrapped it onto 2 lines; l.32–33) | `b93710cd` |
| `app/contexts/ArrangementContext.tsx` | timeout literal l.2856 only | `2b8b8639` |
| `app/lib/arrangement/__tests__/export-mp3.test.tsx` | `BOTH_NOTE` (now l.53–54, wrapped) and `LOAD_TIMEOUT_MESSAGE` (now l.64–65; string line 65) | `f2cdbe21` |
| `app/lib/arrangement/__tests__/export-progress-ui.test.tsx` | `LOAD_TIMEOUT_MESSAGE` string line l.67 | `4c47dfd4` |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | l.455 literal only | `790af7ab` |
| `app/lib/arrangement/__tests__/export-wav-in-place.test.ts` | **new**, IP1–IP5 (helpers copied, not imported, from frozen `export-wav.test.ts`) | `9bbc46cb` |
| `docs/implementation/2026/quarter-IV/078-studio-lab-export-cancel.md` | l.4 status → `**სტატუსი:** C PASS (Round 90), გამოქვეყნდა 35c8403 (D-29z55)` | `ce84a27d` |
| `docs/implementation/2026/quarter-IV/079-studio-lab-export-notes-and-memory.md` | **new**, TEMPLATE sections, Georgian | `bd76912d` |

Full hashes: `a-round-91/end-hashes.txt`. Diff hunks (`git diff -U0`): dialog `-32 +32,2`; context `-2856 +2856`; export-mp3 `-53 +53,2` and `-64 +65`; export-progress-ui `-67 +67`; export-range-ui `-455 +455`; doc 078 `-4 +4`. Formatting was applied by piping `biome format` stdin→stdout (no `--write`); the only formatter changes were inside granted declarations / the G2 call.

## Tests and checks actually run
- `npx vitest run` targeted list (`a-round-91/targeted-list.txt`, 66 files = round-90 list ∪ new file ∪ grep of tests importing `export-wav`/`.worker`/`.client` → `export-cancel.test.ts`, `export-wav.test.ts`, new file): **66 files, 1134 tests, all passed** (`a-round-91/targeted-result.txt`). Frozen EW1–EW7, PU*, MX*, CU*, EC*, TR*, focus/footer tests all green.
- `npm run typecheck`: exit 0 (`typecheck.txt`).
- `npm run lint`: exit 0 (218 repo-wide warnings + 1 info, pre-existing; `lint.txt`).
- Scoped `npx biome check` on the 8 owned code/test files: exit 0, no diagnostics (`biome-check-owned.txt`).
- GATE90-S7: `npx biome lint` on the same 8 files saved to `a-round-91/biome-lint-owned.txt`: no diagnostics.
- Full suite / `npm run verify` not run (speed rules: gate).

### Mutation proofs (scratch copy `a-round-91/mut/<id>/`, own `cacheDir`; run over export-wav-in-place, export-wav, export-mp3, export-range-ui, export-progress-ui)
| ID | Mutation | Red | log |
|---|---|---|---|
| orig | none | 47/47 green | `mut-orig.txt` |
| a | in-place clamps into a new `Float32Array` | IP2, IP4 | `mut-a.txt` |
| b | measure after clamp (in-place) | IP1, IP4, IP5, EW7 | `mut-b.txt` |
| c | worker keeps `encodeArrangementWav` | IP4 | `mut-c.txt` |
| d | `encodeArrangementWav` delegates to in-place without copy | IP5, EW1 | `mut-d.txt` |
| e | N1 constant reverted | MX1, XU5 (export-range-ui l.452–457 test) | `mut-e.txt` |
| f | T1 literal reverted | MX6, PU2 ×2, PU4 ×2, PU5 | `mut-f.txt` |

## A's own smoke (NOT C evidence), Playwright Chromium, `:5173/studio-lab`
- Probe copied from `b-round-90/probe/` to `a-round-91/probe/` (`OUT` → `a-round-91/probe/out`). State is in-memory per launch (the probe uses no storage state; no `a-browse.json` was needed).
- **10M WAV at 1440×900, one run:** renderer before RSS/HWM 344/437 MB, after 739/964 MB → **ΔHWM 527 MB** (B baseline on `35c8403`: 739/748/748). File `czaba-studio-lab.wav` 175 237 100 B, RIFF PCM 24-bit/48 kHz/2 ch, 29 206 176 frames, NaN 0, RMS 0.1724364596, exact status `WAV შეიქმნა: 10:08.462, 24-bit · 48 kHz · stereo.`, 0 console errors (`probe/out/mem-5-run1.json`). A first attempt aborted in setup (`arrangement-ruler` null on the first cold load after the edits); the retry was clean. This is one run, not C's 3-run acceptance.
- **Note at 1280×900:** the `both` label text is exactly `WAV + MP3 · ორი ფაილი` + new N1 note; classes `block text-xs text-muted`; note scrolls into view, `elementFromPoint` hits it, rect 431–874 px (inside 1280); footer buttons visible (`probe/out/note-1280.png`, `note-smoke.log`).

## Code review (real `code-reviewer` subagent, read-only)
- **Score 9/10, no Critical, no blocker.** Verified measure-before-clamp, byte identity (float32 store, -0, NaN), `encodeArrangementWav` unchanged, worker diff only the call, only caller of the in-place variant is the worker, frozen EW7 safe (oracle built before the handler call), IP1–IP5 discriminate (value checks, not only identity), constants match spec character for character, doc 079 has all TEMPLATE sections. The reviewer had no shell, so it did not re-run tests or `git diff` (A ran them, see above).
- **Findings and how A handled them:**
  - Info — SharedArrayBuffer edge of the ownership contract: **addressed** by one clause in doc 079's contract paragraph (no code change; frozen client already transfers only `ArrayBuffer`).
  - Low — clamp expression now exists twice (`export-wav.ts` l.52 and l.68): **kept** (spec allowed it; IP5 byte-compare catches drift).
  - Info — IP4 uses `testChannels(200_000)` unnecessarily: **kept** (EW7 parity, runtime only).
- **Architecture note (verbatim, for B):**
  > One signal, #3 (repeated costly change). Each user-facing export string is locked in the component or context plus up to three test files: `export-mp3.test.tsx` l.53/64, `export-progress-ui.test.tsx` l.66, and `export-range-ui.test.tsx` l.455 next to `ArrangementExportDialog.tsx` l.32 and `ArrangementContext.tsx` l.2856. So one wording change means up to four coordinated edits. **Keep:** the cost is low, the string locks are what C's exact-text acceptance relies on, and the topic is already part of the q14 `useArrangementExport` checkpoint. This is a data point for the planner, not a proposal.
  > `export-wav.ts` gaining a second encoder is the same responsibility, and the worker is still a thin adapter. Neither is a signal.

## Acceptance (only what A truly checked)
- A-side grants: done as listed; frozen 506/506; 8 M + 2 ??.
- T91-TARGETED: passed by A (66/1134). C re-runs.
- MEM-WAV10 / WAV5-REG / CX-WAVPHASE-R / NOTE-BOTH / TIMEOUT-TEXT / MEM-CANCEL / PX-NET / REG-HYD / G91-3: **not claimed** — C rows. A's smoke only hints MEM-WAV10 and NOTE-BOTH.

## Known gaps
- Not browser-reachable: the no-Worker fallback (unchanged) and the worker's in-place identity (IP4 unit only; MEM-WAV10 is the browser proof).
- GATE90-S1 (cancel retained memory) untouched; MEM-CANCEL is C measurement only.
- The browser may still block the second download in WAV + MP3; the note now says so, behaviour unchanged.

## Exact next C checks
1. SOURCE-UNCHANGED: HEAD `35c8403`, 8 M + 2 ??, `sha256sum -c` frozen 506/506, end hashes = `a-round-91/end-hashes.txt`, hunks as listed above.
2. MEM-WAV10 ×3 at 1440 (ΔHWM ≤ 639 MB; A smoke saw 527).
3. WAV5-REG at 1280 and 1440 (overload warning text proves measure-before-clamp in the worker).
4. CX-WAVPHASE-R, NOTE-BOTH (both viewports + WAV+MP3 export), TIMEOUT-TEXT (120 s + same-page retry), MEM-CANCEL, PX-NET, REG-HYD, G91-3, T91-TARGETED.
