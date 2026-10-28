# A round 220: PERF-16b-i (legacy MP3 export on the shared LAME encoder, plus C-R219-01)

**No STOP.** HEAD was `c54a534` and the tree was clean at the start; frozen `sha256sum -c` gave rc 0 at the start and the end. StudioContext and ArrangementContext were not touched. No covering test is failing or above 50 % of its timeout.

## 1. Changed files (8 grants `M` + 2 new `??`; `git status` shows exactly these 10)
| File | Change |
|---|---|
| `app/utils/ffmpeg.ts` | Thin facade. Its only export is `convertWavToMp3(wavBlob, bitrate = '320k')`. A `Map` maps 128k/192k/320k to 128000/192000/320000. Any other string throws `Unsupported MP3 bitrate: <value>` **before** `import('~/lib/arrangement/mp3-encoder.client')`. Every call runs `loadArrangementMp3Encoder()`, then `encode(wavBlob, undefined, { bitrate })`. Errors are not wrapped. One TODO line, as B dictated. No `@ffmpeg`, `unpkg`, `FFmpeg` or debug logging. |
| `app/lib/arrangement/mp3-encoder.client.ts` | `ArrangementMp3EncodeOptions { bitrate?: number }` and `export const ARRANGEMENT_MP3_BITRATES: readonly number[]`. In `encode(wav, onProgress?, options?)` the value is `options?.bitrate ?? 320000`, validated before `new Input`, and then `new Quality({ bitrate })`. Nothing else changed. |
| `app/utils/__tests__/ffmpeg.test.ts` (new) | LF1–LF5. The mock is registered with `vi.doMock` after `vi.resetModules()` on every import, so LF2 can assert that the encoder module factory **never ran** (see §3, mutant i). |
| `app/lib/arrangement/__tests__/mp3-encoder.test.ts` | ME10, ME11 (256000 and 0), ME12 (two concurrent encodes at 320k and 128k, one reset rejects both with `Conversion was canceled.` and cancels each once, then a fresh load encodes). Existing rows are unchanged. |
| `app/lib/arrangement/__tests__/export-progress-ui.test.tsx` | Only the `loadFFmpeg` removal: the import, the mock factory key, the const, the reset and the PU5 expectation. Five `-` lines and two `+` lines; no other assertion changed. |
| `app/lib/third-party-licenses.ts` | Removed `NOTICES_RUNTIME_DOWNLOADS_SECTION` and its renderer slot. New intro (S3). `COPYLEFT_ID_PATTERN = /^A?GPL(?:V?\d|[-+]|$)/i`. `LicenseRef-` (case-insensitive) → unknown. |
| `app/lib/__tests__/third-party-licenses.test.ts` | TL1: the 10 rows from §1.5. TL5: `existsSync` comes before the snapshot. TL6: "there is no run-time downloads section". TL8: a repo scan plus a named mutant (tmpdir). |
| `THIRD_PARTY_NOTICES.md` | Regenerated with `-u`, never edited by hand. The diff against `c54a534` is only the intro (3 lines) and the removed section (6 lines). The file still has 563 table rows, and the `@ffmpeg/ffmpeg` and `@ffmpeg/util` rows are still present. 0 `unpkg`, 0 `@ffmpeg/core`. |
| `docs/technical/diagrams/studio-audio-pipeline.md` | Only l.5, §7, §10 and §12 changed (`git diff` hunks at l.5, 273, 282, 316, 424, 521, 542, 555 and 565, all inside the granted sections). There is now an `Encoder` participant instead of `FFmpeg`. E3/E4 are about encoder load and encode. The §12 CDN node and its edge are gone, and `FFW` became `MP3E`. 0 `loadFFmpeg`, `31MB` or `unpkg` in the file. |
| `docs/implementation/2026/quarter-IV/172-perf-16b-i-legacy-mp3-shared-encoder.md` (new) | The 7 TEMPLATE `##` headings in order. l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 220 PASS)`. It covers every §2 item 9 topic. Every cited row exists (LF1–5, ME4, ME9–12, TL1, TL5, TL6, TL8). |

## 2. Checks actually run (on the final tree)
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0 (205 warnings and 1 info repo-wide). `npx biome check` / `npx biome lint` on the 7 owned code paths: clean. A `--write` reformatted only my own new test code (Biome reported "Fixed 3 files" among `ffmpeg.test.ts`, `mp3-encoder.test.ts` and `third-party-licenses.test.ts`; all three are grants or new files). All 9 mutant logs end with `match=yes` (or `removed: yes` for h).
- Covering run, `npx vitest run` on the 13 files from §2 (ffmpeg, mp3-encoder, export-progress-ui, export-mp3, strings, third-party-licenses, plus the 7 repo-scan files): **13/13 files, 255/255 tests pass.**
  - The verbose log is `a-round-220/covering-run.log` (from the pre-review run; the post-review run gave the same 255/255).
  - Slowest: MX10 850 ms (A) vs 698 ms (gate 219), MX1 654 ms, and PNR3a 591 ms. Describe timeouts are 15 s, otherwise the 5 s default. All are below 20 % of their limit.
- `CI=true npx vitest run app/lib/__tests__/third-party-licenses.test.ts`: 63/63, without `-u`. The environment already has `CI=true`; the plain run also passes.
- Frozen `sha256sum -c --quiet b-round-219-r220-tree-sha256.txt`: rc 0.
- `grep -rn "@ffmpeg/\|unpkg" app --include=*.ts --include=*.tsx`, excluding `__tests__`: **0 hits.**
- Not run, per the speed rules: the full suite, `npm run verify`, `npm run build`, and any browser check (C rows).

## 3. Red-proof (logs in `a-round-220/mutant-*.log`, each with the sha before and after restore; all match=yes)
| Mutant | Result |
|---|---|
| (a) `'192k'` → 320000 | LF1 192k red (1 failed) |
| (b) no reject | LF2 ×4 red (re-run after the doMock change: still red) |
| (c) static `import { loadArrangementMp3Encoder } …` in the facade | ME9 red |
| (d) encoder ignores `options.bitrate` | ME10 + ME12 red |
| (e) validate after `new Input` | ME11 ×2 red |
| (f) old pattern `/^A?GPL(-\|\+\|$)/i` | TL1 `GPLv3`, `AGPLv3` and 3 others red (5 failed) |
| (g) `LicenseRef-` → clean | TL1 `LicenseRef-Proprietary` red |
| (h) temporary `app/utils/zz-tl8-mutant.ts` with the old l.38 URL (created by A, removed after, `removed: yes`) | TL8 repo scan red, naming the file (re-run after the TL8 widening: still red) |
| (i) extra, A's own: `import()` moved before validation | LF2 ×4 red. **My first LF2 version stayed green against this mutant**, because a `vi.mock` factory result survives `vi.resetModules`. I changed the test to use `vi.doMock`, and (i) is now red. |

## 4. Code review (real `code-reviewer` subagent; score 8.5/10; no Critical, High or Medium)
- **Low, fixed:** doc 172 named only "MP3 encoder reset during …" for the race. It now also names `Conversion was canceled.` during `execute()`, citing ME12.
- **Low, fixed:** TL8's pattern was narrower than C's SOURCE-GREP. It is now `/unpkg|@ffmpeg\//`, so it is a superset of §1.4 and equal to the grep, and doc 172 says so. Mutant (h) was re-run and is red.
- **Low, fixed:** TL5 `existsSync` blocks `-u` on a deleted file. Doc 172 now says: create an empty file first.
- **nit, not changed:** the classifier treats `GPLv`, `AGPLv` and `GPL.3` as clean. No lock spelling uses them, and this is consistent with R-219-2. **For B** if it wants them tightened.
- **nit, not changed:** the §7 diagram does not show the reject-before-import branch. Doc 172's diagram does.
- The reviewer had no shell, so it could not run `git diff`. I checked its two unverified points myself: the export-progress-ui diff is only the `loadFFmpeg` removal, and the notices diff is only the intro and the removed section.

**Architecture note (for B/root, not acted on):**
1. The three bitrates are listed twice: as strings in the facade, and as numbers in `ARRANGEMENT_MP3_BITRATES`. The reviewer says **keep**: a static import would break the lazy-chunk boundary, and drift fails safely because the encoder rejects.
2. `resetArrangementMp3Encoder()` is module-wide while there are two consumers. **Keep** under D-29z230. Proposal for the 16b-ii export-pipeline checkpoint: decide on a per-call `AbortSignal`. That needs ArrangementContext to be unfrozen. It must preserve the generation check, the `isCancelled` gating and ME4/ME12.

## 5. Known gaps / not done
- No browser verification by A. FACADE-REAL-220, LAB-MP3-220, STUDIO-SMOKE-220, BUNDLE-220, PERF-RUN-220 and G220-3 are C's rows. LEGACY-UI-220 is BLOCKED (backend unavailable in cloud).
- No Mermaid parse was run: `mermaid` is not in `node_modules`. The edited blocks reuse the existing syntax: one participant per name, no dangling arrows, and the `CDN` node and its edge were removed together. C's AN-REVIEW `mermaid.parse` is the real check.
- `onFFmpegProgress` and `loadFFmpeg` are gone. The intermediate MP3 progress in the legacy Studio is still 85 → 100 % (LEGACY-MP3-PROGRESS debt, as ruled).

## 6. Exact next C checks
1. SCOPE-220: HEAD `c54a534`, the 10 paths above, frozen rc 0.
2. UNIT-220: the 13 files, plus the licence test with `CI=true`. Grep LF1–LF5, ME10–ME12, TL8 and the 10 TL1 rows. TL5 `existsSync` is at l.364, before the `await expect`.
3. REDPROOF-220: my logs (a)–(i), plus C's own probes (1)–(3).
4. NOTICES-220, FACADE-REAL-220 (the first `'256k'` call must request no `mp3-encoder.client` chunk), LAB-MP3-220, STUDIO-SMOKE-220, BUNDLE-220, PERF-RUN-220, SOURCE-GREP-220 (A saw 0 hits), G220-3, AN-REVIEW-220 (`mermaid.parse` on §7, §10, §12).

## 7. B acceptance status
- **Passed by A's own checks:** every §2 item (1–9); typecheck; lint; the covering run; the licence test with `CI=true`; mutants (a)–(h) (plus (i)); frozen sha; git status scope; the code-reviewer run with its findings addressed.
- **Not claimed:** every browser or C row, and the gate rows. The whole of PERF-16b is **not** complete: 16b-ii remains.
