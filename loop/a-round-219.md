# A round 219 — OSS-LIC: third-party notices + GPL/AGPL runtime licence test

No STOP. TL4 on the real lock finds no copyleft or unknown runtime entry other than `limiter@1.1.5`, which its exception covers. HEAD is `da5ad69a1b771f5f83a043af6cc2e4e058d3355b`. The tree was clean at the start. No frozen file changed.

## 1. Changed files (exactly the 4 granted new files)
- `app/lib/third-party-licenses.ts`: a pure module with no `node:` import, no IO and no React. It exports:
  - `classifyLicenseExpression`, `classifyLicenseField` and `readLicenseFieldText`;
  - `listRuntimeLockEntries` (every non-dev entry) and `listRuntimeLockPackages` (deduped by name@version);
  - `classifyRuntimeLockPackage` and `findCopyleftRuntimePackages`;
  - `THIRD_PARTY_LICENSE_EXCEPTIONS` (only `limiter@1.1.5`, asserted MIT);
  - `THIRD_PARTY_SOURCE_LINKS` and `findThirdPartySourceLink` (prefix rule `lightningcss-`);
  - `isMplLicensedRuntimePackage`, `THIRD_PARTY_NOTICES_REGENERATE_COMMAND` and `renderThirdPartyNotices`.
- `app/lib/__tests__/third-party-licenses.test.ts`: rows TL1–TL7, 51 tests. TL5 is `await expect(renderThirdPartyNotices(realLock)).toMatchFileSnapshot(NOTICES_PATH)`.
- `THIRD_PARTY_NOTICES.md`: generated once with `-u`, never edited by hand. It has 563 table rows (equal to B's count) and these sections:
  - intro;
  - LAME;
  - MPL-2.0 sources (14 names);
  - run-time downloads (`@ffmpeg/core@0.12.6`);
  - license exceptions;
  - the table.
- `docs/implementation/2026/quarter-IV/171-oss-lic-third-party-notices.md`: Georgian, the 7 TEMPLATE headings in order, l.4 byte-exact `**სტატუსი:** Completed (C round 219 PASS)`. It cites only TL1–TL7, and all 7 ids exist in the test file.

## 2. Checks actually run (final code)
| Check | Result | Evidence |
|---|---|---|
| `npx vitest run app/lib/__tests__/third-party-licenses.test.ts` | 51/51 pass; slowest test 10 ms (limit 5 s) | `a-round-219/tl-run-plain.txt` |
| same, with `CI=true` and no `-u` | 51/51 pass | `a-round-219/tl-run-ci.txt` |
| `npm run typecheck` | rc 0 | `a-round-219/typecheck.txt` |
| `npm run lint` | rc 0; 0 diagnostics in the new files (205 warnings elsewhere, pre-existing) | `a-round-219/lint.txt` |
| `npx biome check` on the 2 new `.ts` files (the /check skill, scoped) | rc 0. The first run found 1 formatting issue in the test; it was fixed with a scoped `--write` on my own file. | `a-round-219/biome-scoped.txt` |
| The 10 L23 scanner files (mp3-encoder, strings, export-dialog-a11y-copy, export-progress-ui, store-focus-ring, store-theme-tokens, studio-focus-ring, timeline-cursor-map, panel-radius-ui, studio-theme-obsidian) | 166/166 pass | `a-round-219/l23-scanners-run.txt` |
| `sha256sum -c --quiet b-round-218-r219-tree-sha256.txt` | rc 0 | — |
| `git status --short --untracked-files=all` | exactly the 4 `??` files | — |
| Module grep for `\bas\b`, `\bany\b`, `node:`, `@ts-` | 0 hits | — |
| Importers of the module outside `__tests__` | 0 | — |
| `npm run agents:check` (the first verify step, run alone) | rc 0 | `a-round-219/agents-check.txt` |
| Notices jargon grep: `\bround\b`, `PERF`, `D-<digit>`, dates | 0 hits | — |

Notes on the jargon grep:
- `D-[0-9]` with `-i` falsely matches `BSD-3`.
- Lowercase `perf` hits only the `@firebase/performance*` package names.

Not run, per the speed rules: the full suite, `npm run verify` and `npm run build` (BUNDLE-219 belongs to C and the gate). No browser work was needed for A this round.

## 3. Red-proof mutants (final code)
Each mutant was a temporary edit, followed by a sha256 restore check (OK for all 7). Logs: `a-round-219/mutants/final-{a..g}.log`. The driver is `mutants/apply-mutant.mjs`.

| Mutant | Rows that went red |
|---|---|
| (a) `OR` treated as `AND` | TL1 `(BSD-3-Clause OR GPL-2.0)`, `(MIT OR (GPL-2.0 AND AGPL-3.0))`, `mit or gpl-3.0`; TL4 both rows (node-forge) |
| (b) no `dev` filter | TL2 dev row; TL4 both rows; TL5 |
| (c) `/GPL/i` on the raw string | TL1, including the 3 LGPL cases; TL4 both rows |
| (d) exception ignores the version | TL3 "the same entry at another version" |
| (e) `limiter` row deleted from the notices | TL5 |
| (g) `limiter` exception removed | TL4 both rows, plus TL5 |

Mutant (f), `await` removed from TL5 together with (e), is informational. **Observed, not expected:** vitest 4.0.16 still failed TL5, because it auto-awaits hanging assertions at the end of the test. It printed: "Promise returned by `expect(actual).toMatchFileSnapshot(expected)` was not awaited … this will cause the test to fail in Vitest 3". So the stale file was caught here, but only through vitest's fallback. The `await` remains required.

Earlier mutant logs in the same folder (`a-or-as-and.log` … `g-no-limiter-exception.log`) are from the pre-review code and are superseded by `final-*.log`. My first (g) attempt there broke the file through shell escaping. It was rerun correctly, and its log says so.

## 4. Code review (code-reviewer subagent, actually run; score 8/10, no Critical)
Fixed inside my files:
- **Medium:** deduping before classifying could let a licensed duplicate hide an `inBundle` or licence-less copy of the same name@version. Now the finder checks every entry (`listRuntimeLockEntries`), and only the renderer dedupes. New TL2 row "a licensed duplicate does not hide an inBundle copy".
- **Medium (test gap):** nothing proved that an exception cannot hide a GPL licence. New TL3 row: the entry fails as copyleft and the exception is stale with `entry-has-license`.
- **Low:** an empty or whitespace licence string now counts as no licence. The cell text for no licence is now "(no usable license field in lock)" (not used by the real lock).
- **Low:** extra TL1 rows: `GPL-2.0 WITH`, `()`, `((MIT))`, `GPL-2.0-with-classpath-exception`, `AGPL-3.0`, `mit or gpl-3.0`. Lowercase operators are accepted on purpose.
- **Low:** the TL4 dev anchor no longer relies only on `vitest` being absent. It now checks that no dev-only package name appears in the runtime list, with `vitest` as a known member of that set.
- **Low:** the field `bundling` was renamed to `lockEntryKind`.
- **Low:** the doc now explains code-point version order (`1.10.0` sorts before `1.9.0`).

Not changed. Proposals for B to rule on:
- **R-219-1 (reviewer: Medium, a spec gap).** Non-SPDX spellings `GPLv2`, `GPLv3`, `GPL2` and `AGPLv3` classify `clean`. The id test follows §1.3 to the letter: `/^A?GPL(-|\+|$)/i`. The proposal is per-token `/^A?GPL/i`, which still never matches LGPL. It makes no difference on today's lock. I left it alone because it changes a B ruling.
- **R-219-2 (Low).** Any well-formed single id that is not GPL classifies `clean`, including `LicenseRef-*`, `Proprietary` and `Commercial`. So `clean` means "not GPL/AGPL", not "permissive". B may rule that `LicenseRef-*` and unrecognised ids are `unknown`.
- **R-219-3 (A's ruling on a point the spec does not cover).** Lowercase operators `and`/`or`/`with` are accepted. §1.3 makes only ids case-insensitive. This is the one place where the choice makes the gate more lenient: `mit or gpl-3.0` gives `clean`, where strict SPDX would give `unknown`. The pinning row is TL1 `classifies "mit or gpl-3.0" as clean`. If B rules strict, that row flips to `unknown`.
- **R-219-4 (A's ruling on a point the spec does not cover).** An empty or whitespace `license` string is normalised to "no licence". It still classifies `unknown`, as §1.3 requires. But with a matching exception it is covered and not stale. That reads §1.4's "has a `license` field" as "has a usable one". There is no effect on today's lock.
- **Deliberate addition beyond §1.6.** A generated "License exceptions" section (from the constant), so that `MIT (asserted; see exceptions)` points at something in the file.
- **Low.** A lock key without `node_modules/` (a workspace link target) uses the whole path as its name. A link entry with no version prints `/v/` in its link. Both are cosmetic, and those entries fail anyway.
- **Low (naming).** The prose says "licence" while the headings and identifiers say "License". The spec wording was kept.

**Architecture note (reviewer, for B):** "none. Keep it as one module: it is a single pure unit whose only consumer is the test, with no state, lifecycle or coupling to app code. The prose constants and the parser share a file, but neither has a consumer of its own, so splitting them would add a hop without any benefit."

## 5. Known gaps
- I did not run BUNDLE-219 (`npm run build`) or any browser row; they belong to C. I expect 0 build hits, because nothing imports the module.
- R-219-1 to R-219-4 above are open for a B ruling.
- I did not refetch the LAME and ffmpeg facts from the web. I checked them locally:
  - mp3-encoder README l.94 / l.102 / l.150;
  - `AGFzbQ` count 1 in `dist/modules/build/lame.js`;
  - 0 `.wasm` files in the package;
  - `app/utils/ffmpeg.ts` l.38 has the unpkg `@ffmpeg/core@0.12.6` URL, and `StudioContext.tsx` is its only importer.

## 6. Exact next C checks
- **SCOPE-219:** HEAD `da5ad69`, the 4 `??` files, frozen rc 0.
- **LIC-RUN-219:**
  - plain and `CI=true` runs, 51 tests;
  - `grep -n 'TL[1-7]'` in the test file;
  - TL5 `await` at the `toMatchFileSnapshot` line;
  - the module has no `as`, `any` or `node:`;
  - the tokenizer applies `replace`/`split` to the raw string for tokenizing only, and classification is per token (`COPYLEFT_ID_PATTERN`);
  - the exceptions list is exactly `limiter@1.1.5`.
- **REDPROOF-219:** read `mutants/final-*.log`, then run C's own `zz-copyleft-probe@1.0.0` GPL probe and the `dev: true` probe on copies. TL4's failure output names the offender by `name`, `version` and `lockPath`.
- **NOTICES-INDEP-219:** 563 rows, the licence column equals the lock value except `limiter` (`MIT (asserted; see exceptions)`), code-point order, no `\r`, one trailing `\n`.
- **NOTICES-FACTS-219:** the header against its sources. `www.mp3dev.org` appears only inside backticks. The four LAME links are present. "embedded unmodified" applies to the WASM only, and "bundled and minified" to the JS. The FFmpeg core statement says "not verified".
- **BUNDLE-219:** build and grep for the module.
- **MP3-SMOKE-219, STUDIO-SMOKE-219 and G219-3** in the browser: regression only, since export code is untouched.
- **AN-REVIEW-219:** doc 171.

## 7. Scope completed
B's §2 items 1–4 are implemented, and the A-side checks of §2 pass. Of the C acceptance rows, I passed none myself; they are for C. Not claimed: any C row, the gate, or the backlog as a whole.
