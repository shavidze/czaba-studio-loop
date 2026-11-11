# Sketch review: round 451 (SYS-R450-STORE-STYLE-SCAN)

**Dispatched sketch:** `b-round-450/sketch-451.patch.txt` (v4 = `git diff a8599a2 da459e5` in `/tmp/b451-scratch`), sha256 a555d6e2a995b3c02b2951f476fa6a41e2b702157decdddadf49601af817029f

- **Reviewer:** `tech-lead`, read-only. It worked only on its own clones, `/tmp/tl451` and `/tmp/tl451v3`.
- **Commits:** v1 `5eac614`, v2 `e71703f`, v3 `faa8fc3`, v4 `da459e5`.
- **Superseded evidence:** `b-round-450/v2-superseded/` and `b-round-450/v3-superseded/` (patches, mutant tables and logs, head-mutants, full-suite logs).

## Review 1: v2, sha256 2de2b9fd6530729d04750677a654cad004280ab610045151c341bbb91df9b8e6 (`v2-superseded/sketch-451-v2.patch.txt`)

**Verdict:** APPROVE-WITH-CHANGES. The port preserves every HEAD pin, and all mutants except the M6 control are red.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Medium | When the reviewer read it, the patch file was v1 (`ccf92fe1…`) and lacked the `hasOwn` probe | **Already fixed.** B regenerated the file from `e71703f` before the review read it; the reviewer saw a stale copy. Now superseded by v3 |
| 2 | Medium | Comment blanking ran before string blanking, so `content:"/*"` … `"*/"` hid a real hit | **Fixed in v3.** One-pass tokenizer (`blankCommentsAndQuotedDelimiters`) and a GT4 comment-in-string probe. Mutant N5b restores the two-pass order and turns GT4 red |
| 3 | Medium | The script scanner missed CSS inside `<style>` or string text, a quoted key, `[background-clip:_text]` and a ternary value | **Fixed in v3.** The script pattern includes the whole CSS pattern, quoted or unquoted keys with any value up to `,` `}` or a newline, and `_` in arbitrary classes. GT4b has 14 spellings. Mutants N1c and N1d. The live count stays CinemaCurtainLoader 3 (golden `extra.scriptClipApp`) |
| 4 | Medium | The glow check worked per line, first layer only, with no `inset`, `text-shadow` or `[box-shadow:` | **Fixed in v3.** It scans the whole source, any layer, `inset`, `text-shadow`/`textShadow` and `[box-shadow:`/`[text-shadow:`; it requires blur > 0 and a layer start, so `0 0 0 1px` rings do not count. TS6 has 13 glows and 5 non-glows. Mutants N3c, N3d, N9 and N9b |
| 5 | Medium (pre-existing) | GT5 did not guard `components/audio/Timeline.tsx` or `lib/email.server.ts` (TEAL_ALLOW_LIST dead entries) | **Fixed in v3.** New GT5b checks import specifiers, with positive and negative probes; `components/audio/index.ts` is added to the barrels. Mutants N8b and N8c |
| 6 | Low | `[-webkit-text-fill-color:rgba(0,0,0,0)]` and other alpha-zero colours were missed | **Fixed in v3.** `TRANSPARENT_FILL` accepts any alpha-0 `rgb`/`rgba`, `#rgb0` and `#rrggbb00`, and the class branch reuses it with `_` |
| 7 | Low | No mutant showed that GT1b scans perf | **Fixed:** mutant N1e (perf `bg-clip-text`) turns GT1b red |
| 8 | Low | Allow-list key formats differ; `as const` | **`as const` removed:** a typed `SCRIPT_SCAN_ROOTS` table. **Key format accepted (D-29z1604-f):** GT1b keys carry the root prefix because GT1b scans two roots; the other lists scan one root |
| 9 | info | The walker scans untracked files and follows symlinks; a missing `perf/` throws | Kept: identical to HEAD (golden). Recorded as INFO-TL-R451-WALKER-HOST |
| 10 | info | `app.css` `.code-4` has a teal zero-offset `text-shadow`, and it renders on the live 404 page | Out of scope here. Backlog TL-R451-CODE4-TEAL-TEXT-SHADOW → STORE-2b-3c (live teal CSS) |
| 11 | info | Keeping `store-header-footer.test.tsx` l.124 is fine (DOM vs source) | Agrees with D-29z1604-a |
| Arch | — | The helper mixes the scan engine with policy regexes | Signal SIG-R451-STYLE-SCAN-ENGINE-POLICY (backlog signal, not scheduled). v3 already has one tokenizer and one roots table |

## Review 2: delta v2 → v3, sha256 f1f05ad413f01e67027797bf575f518df84f182944cad3cc8f010c227b9b6e9c (`v3-superseded/sketch-451-v3.patch.txt`; delta `sketch-451-delta-v2-v3.patch.txt` 0386e5e4…)

**Verdict:** APPROVE-WITH-CHANGES. The reviewer verified both shas. On the live tree GT1b gives only CinemaCurtainLoader 3, TS3 0, GT5b 0 and GT1 `.loading-brand` 3; a scan of 354 app sources takes 83 ms. Review-1 items 1, 2, 3 and 7 are closed; 4 and 6 are closed with gaps; 5 is only partly closed; the rulings on 8–11 are accepted.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Medium | The ring guard (blur `[1-9]`) dropped `.5rem`, `0.5px`, `var()` and `${}` blurs, a regression from v2 | **Fixed in v4:** `GLOW_BLUR`. Mutants N9c (TS3) and N9d (TS6) |
| 2 | Medium | GT5b missed relative, namespace and `/index` imports and matched `./Timeline` from any folder | **Fixed in v4:** `resolvedImports` resolves `~/` and relative paths. Barrels `components/audio` and the root `components` (found by the new guard: `components/index.ts` does `export * from './audio'`, 0 importers). 11 positive and 4 negative probes. Mutants N8d, N8e, N8f and N8g |
| 3 | Low | The glow span crossed into the next property | **Fixed:** `SHADOW_VALUE_SPAN` stops at `, key:`; TS6 negative probes; mutant N9e |
| 4 | Low | Quadratic runtime on pathological input | **Fixed:** spans bounded to {0,300} (glow) and {0,200} (inline keys) |
| 5 | Low | A wrapped `backgroundClip:\n 'text'`, `style.webkitBackgroundClip =` and `setProperty` were missed | **Fixed:** the value span crosses newlines, `[:=]`, a `setProperty` alternative; GT4b probes; mutants N10b and N10c |
| 6 | Low | `[filter:drop-shadow(0_0_8px_red)]` was missed | **Fixed:** `drop-shadow(` accepts `_`; TS6 probe |
| 7 | Low | The mutant count was 44, not 46 | **Fixed:** v4 `mutants.txt` has 54 lines (BASE plus 53 mutants), and the task states that |
| 8 | info | Fills written as `hsl(… / 0)`, `color-mix`, `var()`; comments count as hits | Logged INFO-TL-R451-FILL-FORMS (D-29z1604-h); fails safe |

## Review 3: delta v3 → v4, sha256 a555d6e2a995b3c02b2951f476fa6a41e2b702157decdddadf49601af817029f (`sketch-451-delta-v3-v4.patch.txt`)

**Verdict: APPROVE.** No Medium+. Both shas verified (patch `a555d6e2…`; delta `a82baa88…`). Live tree: 16/16 tests pass; GT1b hits only CinemaCurtainLoader with 3; TS3 0; GT5 and GT5b have 0 live importers. `mutants.txt` has exactly 54 lines (1 BASE, 9 P, 11 M, 33 N) and `head-mutants/mutants.txt` 34. All v3 findings 1–7 are closed and 8 is ruled.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Low | A comment inside import braces hides that import from `resolvedImports`; a commented-out import counts | `deferred_low_polish` TL-R451-L1-RESOLVER-COMMENTS (0 live cases) |
| 2 | Low | The side-effect import `import '~/lib/email.server';` is not matched | `deferred_low_polish` TL-R451-L2-SIDE-EFFECT-IMPORT. The task does not claim side-effect coverage |
| 3 | Low | The resolver misses a template-literal `import()`, `~/…/../` paths, a trailing slash and `import{X}from'…'` with no spaces | `deferred_low_polish` TL-R451-L3-RESOLVER-FORMS |
| 4 | Low | `el.style['backgroundClip'] = 'text'` is missed | `deferred_low_polish` TL-R451-L4-BRACKET-KEY |
| 5 | info | `0 0 calc(…)` and concatenated glow values are missed; `const backgroundClip = 'text'` is a false positive | INFO-TL-R451-GLOW-CALC |

**Dispatched:** v4, sha256 a555d6e2a995b3c02b2951f476fa6a41e2b702157decdddadf49601af817029f. Pre-check on v4: typecheck rc 0; lint rc 0 (205 warnings, 1 info); full suite 282 files / 4128 tests passed (`precheck-full.log`).
