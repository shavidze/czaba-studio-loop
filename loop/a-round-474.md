# A round 474: DPG-P0-1 (teal purge, brass gradient and glow tokens)

**Status:** implemented within the grant. **No implementation STOP.** code-reviewer was run (actual subagent): 1 High, 3 Medium and Lows. All in-grant findings are fixed (see below).

**Needs B ruling on C10 (B spec gap, not an A deviation).** C10 allows only K1, K2b, K13 and K13b to differ from planning. B's own required edits also change three more claims:
- **K16:** the count of `toHaveLength(26)` goes 1 → 0, because ST3 now pins 29 as the task requires;
- **K17:** the `--color-brand-rgb` line moves 142 → 133, because the 7 decorative tokens, their comment and a blank line were deleted;
- **K18:** LT7's `toBeGreaterThanOrEqual(5)` count goes 1 → 0, because LT7 was replaced as the task requires.

C10 read literally therefore FAILs on a correct tree. **K10 is unchanged.** The evidence is `a-round-474/claims-end.txt`.

## Preconditions (L11)
- **K1/K2:** at start, the `claims-474.sh` output is byte-identical to `b-round-473/claims-474-planning-output.txt` (`a-round-474/claims-start.txt`, empty `diff`). The sketch sha256 is `239e1da1…`, and `git apply --check` gave rc 0.
- **Read in full:** TAILWIND_FIRST, DESIGN_TOKENS, TESTING_QUALITY_GATES, GEORGIAN_DOCS and AGENT_DISCOVERABLE_CODE (first 80 lines: naming rules); also `lessons.md`.
- **Read in part:**
  - BUG_HUNTING_TESTS: the headings and the "Frontend Bug-Hunting" section;
  - FORWARDREF_COMPONENT: the first 80 lines;
  - AUDIO_ARCHITECTURE: headings only.

  The hook mapped the last two for `StemControl.tsx`. Its only change is the sketch's class string, so the component's structure and audio code are untouched.

## Changed files (working tree)
| Path | Change |
|---|---|
| `app/styles/app.css` | Sketch only. sha `1e293c8b…` = `sketch-474-files-sha256.txt` |
| `app/styles/base/utilities.css` | Sketch only. sha `9ddb7321…` = sketch |
| `app/components/audio/StemControl.tsx` | Sketch only. sha `98b2dfd8…` = sketch |
| `app/components/audio/StemsPlayerModal.tsx` | Sketch only. sha `0aed60c1…` = sketch |
| `app/lib/__tests__/helpers/style-scan.ts` | One new export, `hueRangeColourHits`, with private helpers and constants appended at the end. `git diff` shows **0 removed lines**, so every existing export is byte-identical |
| `app/lib/__tests__/store-teal-sweep.test.ts` | §1.3 edits, plus HUE1, HUE2 and HUE3 |
| `app/lib/__tests__/store-live-teal.test.ts` | §1.3 edits, plus LT11 |
| `app/lib/__tests__/store-theme-tokens.test.ts` | §1.3 edits, plus ST3b and GR1 |
| `docs/implementation/2026/quarter-IV/307-dpg-p0-1-teal-purge-brass-tokens.md` | New. l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 3; C round 474 PASS)`. Its 7 `## ` headings match TEMPLATE in order |

- The 4 source shas were re-checked after every mutant and at the end (`SHAS-OK`).
- `git status`: 8 modified files and 1 untracked (doc 307).
- No protected file was touched.

## Test edits: each removed assertion and its replacement (L4)
**store-teal-sweep**
- **`TEAL_ALLOW_LIST`:** the StemsPlayerModal (1) and StemControl (1) entries are removed; only `StudioTrack.tsx` 1 remains.
  - Replacement: both files are in `GRANTED_TEAL_FREE_SOURCES`. TS2 now checks that they are scanned, and TS3 checks each for 0 teal, 0 glow tokens and 0 zero-offset glow. This is stronger than the allow-list entry.
- **New HUE1:** over all non-test `app/**` `.css/.ts/.tsx` files, the files holding hue-range colours are exactly `{StudioTrack.tsx: 1, styles/studio.css: 4, styles/pages/studio.css: 4}`. The row is non-vacuous: at least 200 sources are scanned, and `app.css`, `utilities.css` and every granted file are named.
- **New HUE2.**
  - **Flagged:** 25 fixtures, each with exactly 1 hit. They cover every form listed in §1.3, plus three `_`-bounded Tailwind forms (`shadow-[0_0_12px_#…]`, `linear-gradient(…#…_0%…)`, `[color:_teal]`), unitless `hwb(175 8 15)`, SVG `<animate to="#13d9cc">`, and a named colour after a `/\/*/` regex literal.
  - **Clean:** 12 fixtures return `[]`. They are:
    - `#c9a46a`, `#d9b87f`, brass rgba, `#404040`, `hsl(38, 95%, 55%)`;
    - a `.slider-thumb-teal` selector, `// Cyan`, `/* Cyan glow */`;
    - `href="#add"`, `url(#bed)`, `&#1dc;`, `'audio/*'`.
  - Class-shaped fixtures are built with `.join('')`, so Tailwind does not emit them.
- **New HUE3:** `app.css` scans to `[]`. With one `rgba(19, 217, 204, 0.2)` rule added, the scan returns exactly that hit. This is the in-test form of the HUE3 mutant.

**store-live-teal**
- **`CSS_TEAL_ALLOW_LIST`:** removed `styles/app.css` (14) and `styles/base/utilities.css` (3). Replacements:
  - LT3 now reports any teal in those files as `unexpected`;
  - **new LT11** asserts `countTealHits` = 0 for both files;
  - **LT4** gains `toContain(STORE_CSS_PATH)`, which restores the "app.css is scanned" check that the allow-list keys used to give.
  - The two `studio.css` entries stay at 4/4.
- **`TEAL_RULE_ALLOW_LIST`:** all 9 entries removed, so it is now `{}`. Replacement: LT5, with an empty allow-list, fails on any teal in any rule of either file. This is stronger.
- **LT6:** unchanged.
- **LT7 replaced its first assertions.**
  - Old: `deadRuleKeys()` equals the 6 dead keys, and `@theme` holds at least 5 teal declarations, each one a dead token.
  - New:
    - `deadRuleKeys()` is `[]`;
    - each of the 6 former dead rules still exists, with `countTealHits` = 0 and `hueRangeColourHits` = `[]` (reviewer M fix, so the row can fail);
    - `@theme` teal declarations are `[]`;
    - each of the 5 former teal theme tokens matches `var(--color-brand…)`.
  - **Every other LT7 group is kept unchanged:** each rule names its token, the consumer lists, the unmounted consumers, overlay-only `AudioPreviewButton` (default, branch and every call tag), and keyframe ownership. Together they keep the screen-budget guarantee that the brass-swapped rules render nowhere.
  - No constants or helpers were deleted, because LT8 and LT10 use `tokenPattern`, `elementTags`, `THEME_TOKEN_NAMES` and others.

**store-theme-tokens**
- **The 7 decorative keys** left `STORE_2B_EXEMPT_COLOUR_KEYS` and now sit in `REMOVED_DECORATIVE_COLOUR_KEYS`. Replacement: **new ST3b**. Each key is absent from the parsed `@theme`, and `app.css` contains no `--color-(crystal|premium)-`.
- **`--color-glow-primary`, `--color-glow-secondary` and `--color-video-sync`** left the exempt list. ST3 checks **29** keys (it was 26) and asserts that these 3 are among them.
- **New GR1.**
  - For each of the 5 gradient keys:
    - the value starts with `linear-` or `radial-gradient(`;
    - it contains no `hsl(`, no `#` and no numeric `rgb(`;
    - after whitelist stripping, the remainder is `''`.
  - The whitelist allows only `var(--color-(brand|brand-hover|background|surface|elevated))`. This was narrowed after the reviewer's Low finding.
  - GR1 pins the deliberate collapse: `--gradient-primary` = `--gradient-accent` = brass-hover → brass, and `--color-glow-secondary` = `var(--color-brand-hover)`.
  - Five leak strings must leave a non-empty remainder: hsl, hex, numeric rgba, oklch and `var(--color-info)`.

## Checks (logs in `a-round-474/`, all on the final tree)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0 (`lint.log`) |
| Biome check on the 8 owned code paths | rc 0 (`biome-owned.log`). `biome format --write` was applied to my 4 test/helper files only. Biome processes 6 files, because the CSS is outside its scope. 8 warnings in StemControl and StemsPlayerModal (`useButtonType`, `useKeyWithClickEvents`, `noUnusedVariables`) predate this round, sit outside the sketch's granted lines, and were not edited |
| Covering: `npx vitest run $(cat b-round-473/covering-474.txt)` | **14 files, 158 tests passed**, 6.56 s (`vitest-covering.log`). On the sketch alone, before the test edits: 5 failed and 147 passed, exactly LT3, LT5, LT7, TS2 and ST3 (`vitest-sketch-only.log`, matching K4). No test is near its timeout |
| `npm run build` | rc 0 (`build.log`) |
| Built CSS teal selectors: tree vs HEAD `58fc56e` (separate `git archive` build in `a-round-474/head-src`) | **Identical, 21 = 21** (`teal-classes-head.txt` / `-tree.txt`). All come from old docs that Tailwind scans. My first doc-307 draft added `.bg-[#13d9cc]`; I removed it before the comparison |
| `claims-474.sh` at end (`claims-end.txt`) | Last line `L58 OK`. Differences from planning: **K1** 9 status lines; **K2b** `FAIL(expected after A applied: reverse-ok)`; **K13 TOTAL 20**; **K13b 9**. Three more differences follow directly from granted edits, and **C10's list did not name them**: **K16** `toHaveLength(26)` count 1→0 (now 29, sketch count line unchanged: checked 29), **K17** `--color-brand-rgb` line 142→133 (the 9 deleted decorative lines), **K18** LT7 `toBeGreaterThanOrEqual(5)` 1→0 (the replaced lower bound). K10 unchanged |
| `hue-scan-v2.py` on live `app/` | TOTAL 20, matching `app-counts-sketch.txt`. The line set equals `scan/hue-lines-sketch.txt` (only the line order differs) |

## Mutants (`a-round-474/mutants/`): each applied and reverted with the editor
| Mutant | Edit | Red |
|---|---|---|
| HUE3 | app.css gets `.hue3-mutant { background: rgba(19, 217, 204, 0.2); }` | **HUE1**, HUE3, LT3, **LT11**, LT5 (`HUE3.log`) |
| M-GR1 | `--gradient-primary` first stop → `hsl(175, 85%, 46%)` | **GR1** (`M-GR1.log`) |
| M-ST | `--color-crystal-cyan: #22d3ee;` re-added | **ST3b**, ST3, HUE1, HUE3 (`M-ST.log`) |
| M-TS | StemControl Solo → `bg-teal-500` | **TS1**, TS3, **HUE1** (`M-TS.log`) |
| M-UNDERSCORE (extra) | hex lookahead restored to `(?![\w-])` | **HUE2** (`M-UNDERSCORE.log`) |

## code-reviewer (actual subagent), score 7/10, and dispositions
- **High:** `_` neighbours hid hex and named colours (Tailwind arbitrary values). **Fixed.** Guards are now `[A-Za-z0-9…]`, with 3 new fixtures and the M-UNDERSCORE mutant red.
- **Medium:** a hex in `href="#add"` or `url(#bed)` counted as a colour. **Fixed** with a lookbehind and 3 clean fixtures. `href=` and `url(` are excluded; `to=` is deliberately **not** excluded (advisor), because SVG `<animate to="#…">` holds a colour. A flagged fixture covers it. Not fixed: a CSS **ID selector** `#bed {}` would still count. It fails safe, with 0 occurrences today.
- **Medium:** the LT7 `deadRuleKeys()` check could never fail. **Fixed:** per-rule teal and hue assertions.
- **Medium:** the `.stems-loader-list` scrollbar is live on the protected legacy `/studio/$productId` (`StemsLoadingAnimation`), so teal → brass is a visible change there. **Recorded in doc 307.** B's task already named it (§2, "What could break nearby"), and C6 probes the rule. That page is backend-blocked. Saba's frozen-legacy question SABA-Q-DPG-LEGACY-STUDIO-TEAL is related, so B may want to mention it there.
- **Low:**
  - Fixed:
    - comment stripping after `\` (regex literal), with a fixture;
    - hwb without `%`;
    - GR1 narrowed;
    - the doc's named-colour wording.
  - Not fixed (recorded):
    - `rad`/`turn` hue units;
    - `lab`/`lch`/`oklab`/`color()`;
    - `var(--teal-500)`;
    - HUE1 does not cover `perf/` (TS5 still checks perf with the fixed teal list).
- **Info:** the conversion math (rgb→hsl, hwb and OKLab constants) was checked correct, and `var()` in `@theme` is valid.
- **Architecture note (proposal for B/root only, not done):** `style-scan.ts` now mixes the import-graph walker, the CSS rule parser and a colour-conversion subsystem. Proposal: extract `hueRangeColourHits` into `helpers/colour-scan.ts` with a re-export, plus its own conversion unit tests. Reviewer verdict: keep for now, because it is test-only and cheap.

## Contrast (L15)
- StemControl Solo active: `text-background` `#0e0d0c` on `bg-brand` `#c9a46a`. The luminances are 0.4001 and 0.0041, so the ratio is **8.32:1** (≥ 4.5).
- This is arithmetic only: the component is unreachable [K5].
- StemsPlayerModal spinner, `text-brand` on `bg-surface` `#161412`: **7.88:1**. Also arithmetic only, for the same reason.
- **The one live boundary:** the `.stems-loader-list` scrollbar thumb on the legacy `/studio/$productId` loader. It sits over a `hsl(0 0% 100% / 0.03)` track. I assumed the page background `#0e0d0c` and did **not** verify the ancestor background.

  | Thumb | Old teal `hsl(175 85% 46%)` vs track | New brass vs track |
  |---|---|---|
  | At rest, α 0.4 | 2.59:1 | **2.28:1** |
  | Hover, α 0.6 | 4.36:1 | 3.59:1 |

  - At rest, the thumb was already below 3:1 and the new brass value is slightly lower.
  - The sketch is byte-for-byte, so A did not change it. See SIG-R474-LEGACY-LOADER-SCROLLBAR.

## Acceptance status (A's side only)
- §1 steps 1–8: done.
- C rows C1–C10 are C's and are not claimed here. A ran no browser.
- The gate row (full verify) is not claimed.

## Known gaps / signals for B and root
- **SIG-R474-DOCS-TAILWIND-TEAL:** Tailwind v4 scans `docs/**` and `.claude/**`. Old component docs (`docs/technical/components/StudioTrack.md`, `SFXComponents.md`, `TransportBar.md`, `FXProductDetail.md`, `docs/technical/video-sync.md`) and `.claude/primitives/TAILWIND_FIRST.md` emit 21 unused teal or `#13D9CC` utilities into production CSS. This is unchanged from HEAD. DPG rule 1 is exhaustive, so it may want an `@source not` rule or a docs sweep. That is outside this grant.
- **SIG-R474-LEGACY-LOADER-SCROLLBAR (for B to rule on):**
  - The sketch's `utilities.css` hunk makes the legacy `/studio/$productId` stems-loader scrollbar brass. This is the only visible change, and it sits on a frozen legacy Studio page next to its teal waveform and slider.
  - D-29z1675 says frozen legacy teal is listed, not edited. B's §2 nevertheless named this change.
  - The thumb's resting contrast drops from 2.59:1 to 2.28:1 (see Contrast).
  - B can keep the change as ruled, or fold it into SABA-Q-DPG-LEGACY-STUDIO-TEAL.
- **LEGACY-DEAD:** the pre-existing Biome a11y warnings in StemsPlayerModal and StemControl. The component is unreachable.
- **Not run by A (speed rules):** repo-wide `npm run check`, the full suite and `npm run verify`. These are gate rows.

## Exact next C checks
- **C1:** 8 modified files + doc 307 only. The 4 source shas equal `sketch-474-files-sha256.txt`.
- **C2:** K13 = 20 and K13b = 9.
- **C3:** read the test diffs against the list above, and re-run HUE3, M-GR1, M-ST and M-TS (optionally M-UNDERSCORE).
- **C4:** 14/14 covering files.
- **C5–C7 and C9:** browser and arithmetic rows.
- **C10:** expect the 3 extra explained diffs (K16, K17, K18) on top of K1, K2b, K13 and K13b. These need B's ruling (see top).
- **Housekeeping:** the HEAD `git archive` copy was deleted after the comparison. Its evidence is kept in `head-build.log` and `teal-classes-head.txt`, and its 21 selectors equal the tree's, re-checked after the last edit.
