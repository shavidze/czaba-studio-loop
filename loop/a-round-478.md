# A round 478 — DPG-P0-3b, design reference docs in Obsidian & Brass

**Scope completed:** the task's §1 steps 1–7. Docs only; `app/**`, `.claude/**`, `public/**` and the protected files are untouched (K9 `0`). Nothing is committed.

## Pre-flight
- Step 1 STOP check: `claims-478.sh` before the first edit was byte-identical to `b-round-477/claims-478-planning-output.txt` (`a-round-478/claims-before.txt`). There was no STOP.
- **Read before the edits:**
  - `lessons.md` (L2, L26, L28, L29, L56, L57, L58);
  - `.claude/primitives/GEORGIAN_DOCS.md`;
  - `.claude/primitives/DESIGN_TOKENS.md` (stale; no values copied);
  - the `app/styles/app.css` `@theme`;
  - the source of both checkers;
  - the `TEMPLATE.md` headings only.
- **Read late:**
  - the `pre-flight` skill and the `/check` command, after the edits; their items are checked below;
  - `context/active-summary.md`, only skimmed at the end.
- **Not read:** `context/active-backlog.json`. The task was self-contained and docs-only.
- **Pre-flight items, after the edits:**
  - Assumptions: docs-only; values come from `@theme`.
  - Smallest version: the files are edited only where the checkers or the grant require it.
  - Surgical scope: the 16 granted paths, K9 `0`.
  - Success: the commands were defined by the task (K2/K3 green).
- **`/check`:** I ran `npm run lint` and `npm run typecheck`. The full `npm run verify` belongs to the gate under the speed rules.

## Changed files (16 = the grant; full diff in `a-round-478/docs.diff.txt`, numstat in `a-round-478/numstat.txt`)

| File | Change |
|---|---|
| `docs/design/DESIGN_SYSTEM.md` | **Token section:** Color System (Backgrounds, Borders, Brand, Text, Semantic, Commerce) and Shadows now equal `@theme`. Added `brand-foreground`, `muted-bg`, `outline-strong`, `brand-rgb`, `shadow-card` and `shadow-elevated`. Removed `--shadow-glow`, from both the Shadows block and the Primary Button hover example (old l.1155, found by the code-reviewer).<br>**Rationale block:** "why not #000" now describes warm obsidian `#0E0D0C`; the blue-undertone sentence is gone.<br>**New section:** `## რატომ Obsidian & Brass?` replaces the old heading. Every reason in it cites `direction-decision.md` or `brand-vision.md`, with verbatim quotes. It keeps the 60-30-10 block with "Brand (Brass)". The foreground row is labelled "Foreground (Text)", not "Ivory": "Ivory & Ink" is the rejected direction B in `direction-decision.md`, and neither source uses "Ivory" for `#ECE6DA`.<br>**Other lines:** the Semantic table rows positive and buy; the l.436 example `#C9A46A`; the focus `box-shadow` uses `rgba(var(--color-brand-rgb), 0.1)`; the `/* OLD */` example is `#A39B8E`. A new version row `| 2.2 | 2026-11-12 |` sits above row 2.1, which is unchanged |
| `docs/design/style-guide.md` | The token table uses live hex and gains a labelled `brand-hover` row (`#D9B87F`), so C4 can find it by name. The 60-30-10 block reads "brand (brass)". `### Brass — ერთი თბილი აქცენტი` and `### Warm Obsidian Neutrals` replace the two old sections, with live hex |
| `docs/design/components/button.md` | Primary and Accent backgrounds are `#C9A46A`. Hover no longer has `shadow-glow` |
| `docs/design/audit-design.md` | Checklist l.9–10 use live hex. The text and background lines now name tokens and point to the quick reference: the hex values were removed so the checker's per-line name→value rule holds. The quick-reference block uses live hex |
| `docs/design/design-tokens.json` | `color.*` and `shadow.*` equal `@theme`; `glow.*` holds the resolved `var()` value. `crystal.*`, `premium.*`, `shadow.glow` and `shadow.glow-accent` are removed. Valid JSON |
| `docs/design/box-render-specs.md` | l.110 only: brass edge glow `#C9A46A` at 10% |
| `docs/design/awwwards-improvements.md` | l.71 is `#C9A46A`. All 6 teal rgba values became `rgba(var(--color-brand-rgb), a)` with the same alpha |
| `docs/design/design-audit.md`, `star-brand-audit.md`, `design-systems-reference.md` | Banner as line 3, plus one empty line. 0 deletions |
| `docs/design/wcag-audit.md` | Banner as line 3. `b-round-477/wcag-section-478.md` appended verbatim after one empty line. 0 deletions |
| `docs/technical/store-redesign/direction-decision.md` | l.23 and `## ტოკენები` now name only `@theme` tokens, with their values. 0 `--color-obsidian-*` / `--color-brass-*` |
| docs 307, 308, 309 | l.4 is `**სტატუსი:** Completed (C round 478 PASS)` |
| doc 310 (new) | Has the TEMPLATE headings in order, l.4 exact, and D-29z1692…D-29z1694 with the four classes |

## Checks actually run
- `bash b-round-477/claims-478.sh`, final run after the last edit, output in `a-round-478/claims.txt`:
  - K1 `HEAD 10791ac`
  - K2 `hits=27 residual=27 unexpected=0 residual_changed=0`
  - K3 `FAILS 0`
  - K4 `0`; K5 all `exists`
  - K6 307–310 all `**სტატუსი:** Completed (C round 478 PASS)`
  - K7 `True`; K8 `0`; K9 `0`
  - K10 `0` four times; K11 `0`
  - K12 `13 of 13`; K13 `yes` four times
  - K14 `section 1 sources 4/3 blue-undertone 0 old-heading 0`
  - K15 `0`; K16 `1`
  - K17 `status-lines 16` (the 16 granted paths)
  - K18 `rc 0`; K19 and K23 identical to the planning output
  - K20 `0`; K21 `0`; K22 `0`
- **K8 and the untracked doc 310:** K8 reads only the tracked diff, so I checked doc 310 by hand. Its arbitrary-class grep finds 0.
- `npm run typecheck`: rc 0 (`a-round-478/typecheck.log`).
- `npm run lint`: rc 0, with 191 warnings and 1 info. All are pre-existing: Biome does not check `docs/` (`a-round-478/lint.log`).
- `python3 -I -c 'import json;json.load(open("docs/design/design-tokens.json"))'`: rc 0.
- **Biome:** `npx biome check docs/design/design-tokens.json` reports the path as ignored by the Biome config, so no Biome run applies to these files.
- **Vitest:** none. Per K20, no code reads `docs/`, so no test covers these files. The full suite and verify belong to the gate.
- **Browser:** not used by A. C4, C9 and C10 are C's rows.

## Code-reviewer (actual subagent, run once on the diff; score 7/10)

**Fixed:**
- **H1:** the leftover `box-shadow: var(--shadow-glow)` in the DESIGN_SYSTEM Primary Button hover is removed.
- **M5:** doc 310's context now says STORE-2a (doc 158) moved `@theme`. Its direction-decision line now mentions the values as well as the names.
- **L7:** the pre-existing 60-30-10 "why" sentence inside the new section now cites `brand-vision.md`, with a verbatim quote.
- **L8:** the warm-obsidian sentence cites `direction-decision.md`, with a verbatim quote.
- **L10:** Georgian closing quotes are now `“`.

**Not changed, with the reason:**
- **H2 (status lines claim a PASS before C):** this is deliberate. L28 and the grant require exactly `Completed (C round 478 PASS)`, and K6 checks it byte for byte.
- **M3 (the banner date "2026-10-25-დან" is contested):** the banner is B's exact text, and the claims check its bytes. Sources: `direction-decision.md` l.3 says 2026-11-05, doc 158 says 2026-10-25. For B.
- **M4 (`docs/design/components/card.md:135,137`):** these lines use the old cool-neutral `hsl(220, …, a)` (4-argument) values. The file is not in the grant. I ran `hue-scan.py` on `card.md`: `TOTAL 0`. The reason is an inference: hue 220 is outside the scanner's 160–200° teal range. For B, as a follow-up signal.
- **L6 (`style-guide.md` l.10 and l.136, glow advice such as `hover-glow`):** not a colour value, so it is outside the accuracy clause. For B: extend SIG-R478-AWWWARDS-GLOW to `style-guide.md` (DPG-INTERACTION-FIX, P2).
- **L9 (the `wcag-audit.md` banner says "the old colours below", but the appended live section is also below):** the banner text is exact. For B.
- **L11 (`design-audit.md` now has two blank lines after the banner):** the banner-only rule. For B.

**Architecture notes, as proposals for B and root only:**
- Fonts: the docs say Inter/Playfair, but `app.css` uses Instrument Sans / IBM Plex Mono. This is already in DPG-FONT-RESOLVE.
- `direction-decision.md:18` quotes `brand-vision.md` as "(ოქროსფერი)"; the source says "(ოქროსფერი/ელექტრული ლურჯი)". This is a small docs fix outside the round 478 grant (only l.23 and `## ტოკენები` were granted).
- `.claude/primitives/DESIGN_TOKENS.md` is still stale (ROOT-REQ-DPG-PRIMITIVES-PATCH).

## Known gaps
- No browser check by A (C4, C9, C10).
- The open review items M3, M4, L6, L9 and L11 are outside the grant, as listed above.

## Exact next C checks
C1 to C10 as written in the task §2:
- C3 mutants on a `cp -a` copy with `STORE_ROOT`.
- C4: the six tokens in DESIGN_SYSTEM.md, style-guide.md and design-tokens.json against `getComputedStyle` on `/`. style-guide states all six by name in its token table.
- C5: the WCAG ratios.
- C6: the quotes in `## რატომ Obsidian & Brass?`. Grep `brand-vision.md` l.27, plus `direction-decision.md` for "dark theme + gold accent" and the l.11 sentence.
- C7: doc 310.
- C8: the emission count, including doc 310 (untracked).

## Acceptance I truly passed
- §1 steps 1–7 (as A).
- The claims values in the C2 row, as listed above.

C's rows and the gate are not claimed.
