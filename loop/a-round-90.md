# A round 90 — SRW-20 stage 3b-1: export Cancel in every phase, abort on unmount, L5 reset, GATE89-S1 (D-29z55)

Implementer: A (Claude Opus 5.5) · 2026-10-22 · HEAD `eb1d0c0` (unchanged, nothing committed)

## Scope completed
All of §1 C1–C5 + docs as granted. Nothing outside the Files table was edited. Protected files are unchanged:
- `Modal.tsx` `741c2341`
- `ffmpeg.ts` `0995ae78`
- `StudioContext.tsx` `caa388e7`
- `mp3-encoder.client.ts` `ddb70919`
- the auth and route files

Frozen list: **505/505 OK** at the end.

## Baseline (verified before the first edit)
- HEAD `eb1d0c0319b2…`, clean tree, frozen 505/505.
- The 5 owned hashes matched (`b83b5693`, `41e4b11d`, `ba33aeeb`, `39975c69`, `0c224abd`).

## Changed files (end state: 5 M + 4 ??)
| File | sha256 (8) | What |
|---|---|---|
| `app/lib/arrangement/export-cancel.ts` (new) | `07826749` | The 2 messages, `ArrangementExportCancelledError`, `isArrangementExportCancelledError`, `raceArrangementExportAbort` |
| `app/lib/arrangement/graph.client.ts` | `de385544` | `signal` option; suspend points when `onProgress` **or** `signal`; no resume after an abort; a rejected `resume()` (including a sync throw) rejects the render (GATE89-S1); `suspend()` rejection still ignored; `startRendering` raced against abort + resume failure; pre-abort check before the `OfflineAudioContext`; signal passed to the worker |
| `app/lib/arrangement/export-wav.client.ts` | `b56ca58e` | Pre-aborted → reject, no Worker (also covers the no-Worker fallback). Abort → handlers nulled, `terminate()` once, reject. The listener is removed on complete, fail and abort. Existing paths and messages are unchanged |
| `app/contexts/ArrangementContext.tsx` | `c487b71b` | `'cancelled'` phase; `exportAbortRef` run token; `signal.aborted` checked after every await and in every catch; progress writes gated on the signal; `finally` clears only when the ref is the own controller; encoder reset-on-abort listener from load-phase entry (`{ once: true }`); the import `.then` resets when aborted; load race against abort; encode race against abort; L5 reset on a non-cancel `encode` rejection; `cancelExport`; a separate `[]` unmount effect that aborts |
| `app/components/arrangement/ArrangementExportDialog.tsx` | `0c28ea0b` | `გაუქმება` button (`data-testid="arrangement-export-cancel"`, the same classes as დახურვა) only while rendering, before დახურვა; `cancelled` → `role="status"` + `text-muted` |
| `app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx` | `8fd007ba` | TR1–TR5 amended plus a `cancelButton` helper. The diff hunks stay within the helper and the TR1–TR5 range; TS1, TS2 and TR6 are byte-identical |
| `app/lib/arrangement/__tests__/export-cancel.test.ts` (new) | `b15ef366` | EC1–EC4 (19 tests) |
| `app/lib/arrangement/__tests__/export-cancel-ui.test.tsx` (new) | `e850f4eb` | CU1–CU9 (11 tests) |
| `docs/implementation/2026/quarter-IV/078-studio-lab-export-cancel.md` (new) | `126569d7` | Georgian doc per TEMPLATE; status line as required; includes the C2 limitation and the unverified memory hypothesis |

Full end hashes: `a-round-90/end-hashes.txt`.

## Tests actually run
- **Targeted vitest:** `a-round-90/targeted-list.txt` (65 files) contains:
  - the a-round-89 list;
  - the 2 new files;
  - every importer of `graph.client`, `export-wav.client` or `export-cancel` under `app/`.

  Result: **65 files, 1129 tests passed** (`a-round-90/targeted-result-final.txt`).
- **Frozen tests:** after C1–C5 and before the TR edits, the frozen export tests failed only in TR1–TR4, which is the round-89 two-stop expectation B pre-authorised. All other frozen export tests (focus, footer, progress-ui, mp3, wav, range, graph) stayed green; none was edited.
- **Type and lint checks:**
  - `npm run typecheck` exit 0.
  - `npm run lint` exit 0. The 218 warnings are the pre-existing repo baseline; none are in owned files.
  - Scoped `npx biome check` on the 8 owned code and test files: clean.
  - Formatting went through stdin→stdout; no `--write` was used.
- **Not run (speed rules, gate rows):** the full vitest suite, `npm run verify`, the build, e2e smoke and the production bundle.

## Mutation proofs (scratch copies `a-round-90/mut/<id>/`, `cacheDir` set to the scratch folder, script `a-round-90/scripts/{mutate.mjs,run-mut.sh}`, outputs `a-round-90/mut-*.txt`; re-run after the review edits)
| ID | Mutation | Red (final run) | Expected | Killed |
|---|---|---|---|---|
| orig | none | 44/44 pass | — | — |
| a | cancelExport does not abort | 7 incl. CU1, CU3 (both), CU4–CU6 | CU1, CU3 | ✓ |
| b | no aborted check before downloads | CU1, CU6, CU7-render | CU1, CU4 | ✓ (CU1); **CU4 stays green** because `encode` is also raced against the abort, so the mp3 path has a second guard |
| c | suspend point always resumes | EC2 ×2 | EC2 | ✓ |
| d | worker ignores the signal | 5 EC4/EC2 | EC4 | ✓ |
| e | no encoder reset on abort | CU3 (hanging load), CU4, CU7-mp3 | CU3, CU4 | ✓ |
| f | load catch writes after cancel | CU3 ×2 | CU2 or CU3 | ✓ |
| g | finally clears progress unconditionally | CU6 | CU6 | ✓ |
| h | no unmount abort | CU7 ×2 | CU7 | ✓ |
| i | L5 reset removed | CU8 | CU8 | ✓ |
| j | resume rejection swallowed | EC3 (hangs to the 5 s timeout) | EC3 | ✓ |
| k | Cancel rendered outside a render | CU1, CU9 | CU1 | ✓ |
| l | Cancel removed from tab stops (two-stop trap) | TR1–TR5, CU9 | TR1, TR4 | ✓ |
| m (review) | worker pre-abort check removed | EC2 post-render, EC4 ×2 | — | ✓ |
| n (review) | `work.catch` no-op removed | EC1 pre-aborted late rejection | — | ✓ |

## A's own Playwright smoke (not C evidence)
`a-round-90/pw/smoke90.cjs` → `pw/smoke-output.json`, screenshots `pw/cancel-mp3-{1280,1440}.png`. Setup: `:5173/studio-lab`, state file `a-browse.json`, 5M = `00:00.000 — 05:04.406`.

| VP | Phase at click | Status after (ms incl. polling) | Downloads 15 s | Focus | Other |
|---|---|---|---|---|---|
| 1280 | WAV `რენდერი · 4%` | `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.` status, `text-muted`, no alert (96 ms) | 0 | დახურვა | Progress gone, Cancel gone, buttons `[დახურვა, WAV-ის ექსპორტი]` enabled |
| 1280 | MP3 `MP3-ის შექმნა · 0%` | encoder message (76 ms) | 0 | დახურვა | — |
| 1440 | WAV `რენდერი · 4%` | plain message (103 ms) | 0 | დახურვა | — |
| 1440 | MP3 `MP3-ის შექმნა · 0%` | encoder message (71 ms) | 0 | დახურვა | — |

- 0 non-noise console errors at both viewports.
- unpkg requests: only `ffmpeg-core.js` and `ffmpeg-core.wasm`, after the MP3 click.
- No source file changed after the smoke: the 5 source hashes listed above are the ones the smoke ran against. Only `export-cancel.test.ts` and `export-cancel-ui.test.tsx` were edited after the review.
- The smoke did **not** cover re-export after a cancel, CX-LOAD, CX-ESC, CX-UNMOUNT or TRAP-CANCEL in the browser. Those are for C.

## Code review (actual `code-reviewer` subagent, 9 files)
- **Result:** no Critical/High/Medium, score 9/10. The reviewer had no shell, so it diffed against B's snapshots.
- **Findings and how each was handled:**
  1. **Low — EC2 "after startRendering" passed for the wrong reason.** **Fixed:** the test now aborts inside `onProgress('render', 1)`, and mutation m proves it.
  2. **Low — EC1 did not cover the no-op catch.** **Fixed:** added the pre-aborted + late-rejection case, and mutation n proves it.
  3. **Low — CU7's "no React warning" cannot fail (React 18).** **Reworded** to "logs no console error". The real guards are 0 downloads and the reset count.
  4. **Low — "loads again" is always true with this mock.** Accepted, not changed. The reset counts carry L5 and the abort reset.
  5. **Low — the gated CU3 depends on test order.** The title now states that it runs first while the gate is closed. Not moved to a new file, because no file grant exists for that.
  6. **Low — the CU9 Enter keyDown was a no-op.** Removed; the title now says click. Real Enter is C's CX-KEYS.
  7. **Low — a suspended `OfflineAudioContext` may stay in memory.** This is the hypothesis already in doc 078. Suggested C evidence: tab memory after about 3 render-phase cancels on 5M.
  8. **Info — the post-race aborted check in graph is effectively unreachable.** Kept as a cheap guard.
- **Architecture note (verbatim, for B; not acted on):**
  > Signals 3 and 4 apply: `ArrangementContext.tsx:2751-2954` now holds a run token, an abort listener, an encoder slot, a timeout and the download step, and this region has changed in rounds 86–90. Keep it for this round, because the spec forbids extraction. Proposal for planner B, already covered by q14: move `exportMp3`/`exportWav` into a pure `lib/arrangement/export-orchestration.ts` that takes a `signal` and returns an outcome (`done | error | cancelled`), so the context keeps only the ref, the state writes and the download; acceptance is CU1–CU9 and PU/MX unchanged.

## B acceptance criteria status (A side only)
- **Met and evidenced by unit tests and mutations:**
  - C1–C5 behaviour;
  - EC1–EC4, CU1–CU9, TR1–TR5;
  - mutation table a–l;
  - 5 M + 4 ??, frozen 505/505;
  - typecheck, lint and scoped Biome.
- **Not claimed:**
  - every §5 C browser row (CX-*, TRAP-CANCEL, PX-NET, REG-HYD, G90-3);
  - the gate rows (full suite, verify, build, e2e smoke, production bundle);
  - R20-X4 as a whole.
- **Unit only, not reachable in a browser:**
  - GATE89-S1;
  - L5;
  - the no-`suspend` fallback.

## Known gaps / limitations
- A render-phase cancel stops the CPU only at the next suspend point (≤ 1/20 of the length). Without `suspend` (Firefox) the render runs to its end in the background and is discarded. Whether Chromium frees a suspended, dropped context before unload is **unverified**.
- Mutation b does not turn CU4 red (see table). CU4 is still guarded by the encode race; B may want a dedicated test for the pre-download check on the mp3 path.
- `a-round-90/mut/*` holds scratch copies of `app/` with `node_modules` symlinks into `store/node_modules`. Vite `cacheDir` pointed at the scratch folder. No tracked file is affected.
- The download `try/catch` at the end of `exportMp3` has no `signal.aborted`-first line. I left it as is: the block is synchronous and comes after the pre-download aborted check, so a cancel cannot reach it.
- Escape does not cancel (intended contract). The encoder reloads after a load/mp3 cancel (intended).

## Exact next C checks
1. Run SOURCE-UNCHANGED at the start and the end:
   - HEAD `eb1d0c0`;
   - `git status --short` = 5 M + 4 ?? as listed;
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-89-r90-tree-sha256.txt` → 505/505;
   - end hashes match `a-round-90/end-hashes.txt`.
2. T90-TARGETED: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-90/targeted-list.txt)` → 65 files / 1129 tests.
3. Browser rows in this order:
   - CX-RENDER (re-export → 24-bit/48k/2ch, `ceil(304.406×48000)` frames);
   - CX-WAVPHASE (A could not target the wav phase; may be unreachable on 5M);
   - CX-LOAD (route unpkg to never respond);
   - CX-MP3 (then the next MP3 succeeds);
   - CX-BOTH;
   - CX-MP3-RENDER (no new unpkg request);
   - CX-KEYS;
   - TRAP-CANCEL;
   - CX-ESC;
   - CX-UNMOUNT (`window.__cx` sentinel);
   - CX-DONE-REG;
   - PX-NET;
   - REG-HYD;
   - G90-3;
   - one VIS-RENDER sample at 1280 with Cancel in the row.
4. Optional evidence for review finding 7: `performance.memory` / tab memory after 3 render-phase cancels on 5M.
