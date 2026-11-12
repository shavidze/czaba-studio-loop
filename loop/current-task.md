# Round 478: DPG-P0-3b, the design reference docs in Obsidian & Brass (last DPG P0 stage)

**Planned by:** B, at the round 477 → 478 planning on 2026-11-12 (`b-round-477.md`).
- **Advisor:** available, consulted after orientation and before hand-off. Its gaps are closed below: lessons read, per-line classes, scan universe, `color-obsidian` location, the full fail list, name→value checks, a mechanical scratch run, docs readers and a C4 probe.
- **Archive:** the round-477 task is `tasks/round-477.md` (byte-identical, `cmp`).
- **What this round is:** DPG-DOCS-UPDATE (policy "DPG-FIX block", P0 item 4, and DPG rule 2 "token change = docs change"). A rewrites the stale teal/orange design reference docs so they state the live `app.css` `@theme` values. **Docs only; no `app/**` file changes.** Regression is not due: `date -u` at planning was 2026-11-12, and `regression-last.json` says on or after 2026-11-13.

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1691: round 477 result.** C PASS, `browserVerified`/`realVerified` true, gate 477 published `10791ac`. DPG-P0-3a (DPG-SPOTLIGHT-FIX + the DPG-LOGO header colour) is C-verified and **awaits the DP gate** (DPG rule 4: not მზადაა until both reviewers give 10/10). GATE460-2 (C3: mutant M7 turns P4 red), A-R460-REVIEW-5 (C1: sketch sha256, comment fix) and the portal guard (C3: mutant M8 turns P1 red; C-R190-INFO I1, A-R190-SIGNALS #1) close. SABA-B-16 stays open (asset unnamed). C's notes (product hero white edge-light, brass "Sign In") are DP-gate inputs, not bugs.
- **D-29z1692: the scope and the four classes of hits (this task).** B ran a hue-range scanner (`b-round-477/tools/hue-scan.py`: hex 3/4/6/8, `rgb[a]`, `hsl[a]` with hue 160–200° = TEAL, hue 25–45° with saturation ≥ 70 % = ORANGE, plus the words teal/cyan/turquoise/orange) over `docs/design` and the Store copy of `docs/technical/store-redesign/direction-decision.md`: **82 hit lines** [K2]. Each line is ruled into one class:
  1. **Our stale tokens and guidance → rewrite** (55 lines): `DESIGN_SYSTEM.md`, `style-guide.md`, `components/button.md`, `audit-design.md` (the design-auditor checklist), `design-tokens.json`, `box-render-specs.md` l.110 [K19], `awwwards-improvements.md` (proposal snippets an agent would copy).
  2. **Competitor facts → keep:** `design-systems-reference.md` SOUNDRAW rows.
  3. **Dated measurements and dated audits → keep the body, add a banner:** `wcag-audit.md` (2025-01-03 ratios; swapping a hex would make a ratio false), `design-audit.md` (2026-01-09), `star-brand-audit.md` (2026-03-07, including its l.168 [K19] description of legacy `--mc-*` CSS), `design-systems-reference.md` (its CZABA row and snippet are the old state it scored). `wcag-audit.md` also gains a new section with ratios B computed for the live palette.
  4. **Not old identity → keep:** `box-render-specs.md` l.54–55 (the Gold pack box colour, a product packaging palette) and `DESIGN_SYSTEM.md` version-history row 2.1 (l.1536, a history record) [K19].

  Classes 2–4 are the **27-line residual list** `b-round-477/residual-478.tsv` (file + exact line text, compared by content, so a banner's line shift does not matter). The residual is deliberate, and root should read it as such.

  This ruling **narrows D-29z1684's "51 total"**: that count came from an exact-value grep; this is the hue-range scan L2 requires.

  **Awwwards snippets:** they are recoloured so nothing teal is left to copy. Their glow advice conflicts with the round-453 no-glow rule; doc 310 records this, and it goes to DPG-INTERACTION-FIX (P2) as SIG-R478-AWWWARDS-GLOW. It is not removed here.
- **D-29z1693: what stays out, by name.** Fonts (Inter / Playfair in these docs [K23]) belong to DPG-FONT-RESOLVE (STORE-2c-2…4). `--color-info` blue and the error reds belong to DPG-COLOR-CONSOLIDATE (P1). `.claude/**` stays root-only (ROOT-REQ-DPG-PRIMITIVES-PATCH, `b-round-475/root-primitives-patch.md`). The 114 hue hit lines in docs outside `docs/design` (legacy Studio component docs describing frozen code, mermaid diagram fills, prompt kits for other industries; `b-round-477/scan/hue-docs-other.txt`) are recorded as signal SIG-R477-DOCS-OUTSIDE-DESIGN for the RETRO 480 primitive and doc staleness check (DPG rule 5). They are not tasked here. History records in `docs/implementation`, `docs/bugs` and `docs/plans` stay.
- **D-29z1694: deviation from L56/L58, stated.** B ships no byte-equal sketch: the Georgian prose is A's to write. Instead every "after" value is the exit of a checker that reads `app.css` at run time, not a number B typed. Each checker is proven four ways: red on HEAD [K2 `unexpected=55`, K3 `FAILS 156`]; green on a synthetic compliant tree (`b-round-477/scan/syn-doc-token.txt` `FAILS 0`, `syn-residual.txt` `unexpected=0`); red again on a one-value mutant (`syn-doc-token-mutant.txt` `FAILS 2`); and the mechanical parts (four banners, the WCAG append, doc 307–309 l.4) on a scratch clone at `10791ac`, `b-round-477/claims-478-mechanical-scratch.txt` (K6 307–309, K10, K12, K13, K20, K21 and K22 green there). `doc-token-check.py` checks three things: (a) every `--color-*` / `--shadow-*` declaration equals `@theme`; (b) every colour literal in the four normative `.md` files exists in `app.css`; (c) **name→value**: on a line that names a colour token (`` `buy` ``, `buy:`), every hex equals that token's value. That last check is what catches `buy (#006AFF)`, a value `app.css` still holds as `--color-blue-60`. One literal is allowlisted with a reason: `hsl(0, 0%, 0%, 0.95)`, the DESIGN_SYSTEM modal backdrop example (HEAD l.1408 [K19]), which is not old identity. The WCAG ratios are the saved output of `b-round-477/tools/wcag-ratios.py` (`b-round-477/wcag-ratios.txt`).

## Rules
- **Read `lessons.md` first,** in particular L2 (colour migration clause), L26 (doc grants cover accuracy; TEMPLATE headings), L28, L29, L56 and L57.
- **Claims (L29):** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-477/claims-478.sh` (`STORE_ROOT=<copy>` runs it on a copy). B's output at HEAD is `b-round-477/claims-478-planning-output.txt`. The required values after A are in the C2 row of §2. The banner text lives in one file, `b-round-477/banner-478.txt` (0 hue hits [K21]).
- **No code reads `docs/`** [K20 `0`]: no test or script under `app`, `perf` or `scripts` reads a file under `docs/`, so no vitest file covers these edits.
- **Screen budget (L39):** nothing on screen changes. No `app/**` file is touched [K9].
- **Tailwind scans `docs/**`** (C-R474-02): no added doc line may contain an arbitrary-value class string such as `bg-[#…]` or `text-[…]` [K8]. Write colours as plain values, `var(--color-…)` or token names (`bg-brand`).
- **Reference-first:** not applicable (docs-only round; policy "Not in scope"). The source of truth for every value is `app/styles/app.css` `@theme`. The source of the brand reasoning is `docs/technical/store-redesign/direction-decision.md` and `docs/design/brand-vision.md` l.27 [K19]. **Do not invent brand reasoning:** every "why" sentence in the new section cites one of those two files.

## Baseline
- **HEAD `10791ac`** (gate 477 published). The working tree is clean [K17: 0 lines].

### Grants (exactly these 16 paths)
| Path | What |
|---|---|
| `docs/design/DESIGN_SYSTEM.md` | (1) The token section (Borders, Brand, Text, Semantic, Commerce, Shadows; HEAD l.1014–1079 [K19]): every `--color-*` / `--shadow-*` declaration equals `app.css` `@theme`. Declare at least brand, brand-hover, brand-foreground, accent, background, surface, elevated, foreground, muted, dim, outline, outline-hover, positive, destructive, warning, info, buy and buy-hover. Drop `--shadow-glow`, which was removed from `app.css` in round 453 [K11]. (2) Replace the section `## რატომ Teal + Orange?` (HEAD l.720–751 [K19]) with `## რატომ Obsidian & Brass?` (exact heading), citing both source files by path. Keep a 60-30-10 block naming Brand (Brass). (3) The "why not pure black" rationale and its token block (HEAD l.704–716 [K19]): the background is warm obsidian `#0E0D0C`; drop the "blue undertone" sentence. (3b) Every other false colour line the checker lists, including the Semantic table (HEAD l.840 and l.844 [K19]) and the `/* OLD */` example (HEAD l.1489 [K19], which becomes `#A39B8E`). (4) Example literals (HEAD l.436 `color:` example, l.1332 focus `box-shadow` [K19]) use live values or `var(--color-brand)` / `rgba(var(--color-brand-rgb), 0.1)`. (5) Add a version-history row starting exactly `\| 2.2 \| 2026-11-12 \|` describing this update; keep row 2.1 as written |
| `docs/design/style-guide.md` | The token table (HEAD l.20–32 [K19]), the 60-30-10 block, the `### Teal + Orange` section and the surface examples (HEAD l.57–59 [K19]) state live hex values. The section becomes one warm accent (brass). The `### Blue Undertone (HSL 220°)` section (HEAD l.52–59 [K19]) describes the warm obsidian neutrals with live hex values |
| `docs/design/components/button.md` | Primary and Accent backgrounds name `#C9A46A`; Hover drops `shadow-glow` [K15] |
| `docs/design/audit-design.md` | Checklist l.9–10 [K19] and the token block (HEAD l.60–85 [K19]) state live values |
| `docs/design/design-tokens.json` | `color.*` and `shadow.*` leaves equal `app.css` (a `var()` token may hold its resolved value). Remove leaves whose token no longer exists (`crystal.*`, `premium.*`, `shadow.glow`, `shadow.glow-accent` [K3]). Typography, spacing and radius are unchanged. It must stay valid JSON |
| `docs/design/box-render-specs.md` | l.110 only [K19]: the obsidian box accent becomes a brass edge glow (`#C9A46A` at 10%). l.54–55 (Gold box) stay [K19] |
| `docs/design/awwwards-improvements.md` | l.71 [K19] → `#C9A46A`; each `rgba(19, 217, 204, a)` → `rgba(var(--color-brand-rgb), a)` with the same alpha |
| `docs/design/design-audit.md`, `docs/design/star-brand-audit.md`, `docs/design/design-systems-reference.md` | **Banner only:** insert, after line 2, the banner line (exact text below) and one empty line, so the banner is line 3 [K13]. No other change; 0 deleted lines [K10] |
| `docs/design/wcag-audit.md` | The same banner, plus `b-round-477/wcag-section-478.md` appended verbatim at the end of the file (after one empty line) [K12]. 0 deleted lines |
| `docs/technical/store-redesign/direction-decision.md` | l.23 and the `## ტოკენები` section (HEAD l.48–56 [K19]) name only tokens that exist in `app.css` (`--color-brand`, `--color-brand-hover`, `--color-brand-rgb`, `--color-background`, `--color-surface`, …): 0 `--color-obsidian-*` / `--color-brass-*` [K4] |
| `docs/implementation/2026/quarter-IV/307-…`, `308-…`, `309-…` | l.4 only, each exactly `**სტატუსი:** Completed (C round 478 PASS)` (L28 final stage of the P0 docs series) [K6] |
| `docs/implementation/2026/quarter-IV/310-dpg-p0-3b-design-docs-brass.md` | New doc, TEMPLATE headings in order [K7]. l.4 exactly `**სტატუსი:** Completed (C round 478 PASS)`. Lists D-29z1692…D-29z1694 and the four classes |

**Accuracy clause (L26):** inside a granted rewrite file, A may also correct any other line that states a false colour value, without changing headings or adding sections. The banner-only files get the banner and nothing else.

**Banner (exact, one line):**

```
> **ისტორიული ჩანაწერი (DPG-P0-3b, 2026-11-12):** ეს დოკუმენტი აღწერს მდგომარეობას თავის თარიღზე. 2026-10-25-დან CZABA-ს პალიტრა Obsidian & Brass-ია; მიმდინარე ტოკენები: `docs/design/DESIGN_SYSTEM.md` და `app/styles/app.css` (`@theme`). ქვემოთ მოცემული ძველი ფერები აღარ გამოიყენება.
```

**Everything else is unchanged:** `app/**`, `.claude/**`, `public/**`, the protected files and every doc not listed.

## 1. A: steps
1. **STOP (L11)** if `claims-478.sh` K1–K23 differ from `b-round-477/claims-478-planning-output.txt` before your first edit. Read `GEORGIAN_DOCS.md` and `DESIGN_TOKENS.md` (it is stale; do not copy its values).
2. **Read the failure lists:**
   - `b-round-477/scan/doc-token-head.txt` (156 fails at HEAD);
   - the output of `python3 -I b-round-477/tools/residual-check.py . b-round-477/residual-478.tsv` (55 unexpected at HEAD).

   Edit until both checkers exit 0. Never edit a residual line, the checkers or `residual-478.tsv`.
3. **Write doc 310** and set doc 307/308/309 l.4.
4. **Run the claims script** and save its output to `a-round-478/claims.txt`. It must show every "after" value in the C2 row.
5. **Checks:**
   - `npm run typecheck` (a sanity check; no TS file changes);
   - `python3 -I -c 'import json;json.load(open("docs/design/design-tokens.json"))'` rc 0.

   No vitest file covers `docs/**` [K20], so there is none to run. The full suite belongs to the gate.
6. **Code-reviewer:** run it once on the diff (more than 3 files) and report Medium+ findings. A finding inside a residual line or a banner-only file is outside the grant: report it, do not fix it.
7. **Report** in `a-round-478.md`. Describe each file's change from its saved diff, `a-round-478/docs.diff.txt` (L56).

## 2. C: what to verify
**Files.** Write `c-round-478.md`, `c-round-478.json` and `c-round-478/progress.json` as you go. The JSON carries all L57 fields. Its `mutantRedOnSketch` is `b-round-477/scan/syn-doc-token-mutant.txt`, noting that this round has a synthetic tree, not a sketch (D-29z1694). Run `python3 -I tools/l57-check.py`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all` | Exactly the 16 granted paths: 11 under `docs/design`, `direction-decision.md`, docs 307–309 modified and 310 new. K9 = 0 |
| C2 | CLAIMS | `bash b-round-477/claims-478.sh` | K1 `HEAD 10791ac`. K2 `hits=27 residual=27 unexpected=0 residual_changed=0`. K3 `FAILS 0`. K4 `0`. K5 all `exists`. K6 307/308/309/310 all `**სტატუსი:** Completed (C round 478 PASS)`. K7 `True`. K8 `0`. K9 `0`. K10 `0` four times. K11 `0`. K12 `13 of 13`. K13 `yes` four times. K14 `section 1`, sources ≥ 1 / ≥ 1, `blue-undertone 0`, `old-heading 0`. K15 `0`. K16 `1`. K17 16 lines. K18 `rc 0`. K19 unchanged from the planning output. K20 `0`. K21 `0`. K22 `0`. K23 unchanged |
| C3 | CHECKERS MEAN SOMETHING | On your own `cp -a` copy of the tree, with `STORE_ROOT=<copy>`: (a) change `--color-brand` in DESIGN_SYSTEM.md to `#13d9cc`; (b) put `rgba(19, 217, 204, 0.3)` back on one awwwards line; (c) delete one residual line in `wcag-audit.md` | (a) K3 `FAILS ≥ 1`; (b) K2 `unexpected=1`; (c) K2 `residual_changed=1`. Then the real tree re-runs green |
| C4 | VALUES TRUE | Independently of B's checker: for 6 tokens (brand, brand-hover, background, surface, foreground, muted), compare the value in DESIGN_SYSTEM.md, style-guide.md and design-tokens.json with `getComputedStyle(document.documentElement).getPropertyValue('--color-…')` on `/` in Chromium | All three docs equal the computed value (case-insensitive hex). B's baseline probe: `b-round-477/c4-computed-head.json` |
| C5 | WCAG SECTION | Recompute the 10 ratios with your own formula from the hex pairs in the new section | Each is within ±0.01 of the doc |
| C6 | REASONING SOURCED | Read `## რატომ Obsidian & Brass?` | Every "why" sentence cites `direction-decision.md` or `brand-vision.md`, and any quote is verbatim (grep it). No teal/orange word, no glow advice |
| C7 | DOC 310 | Headings, l.4, D-IDs | TEMPLATE headings in order; l.4 exact; it names D-29z1692…D-29z1694; every test or row id it names exists (grep) |
| C8 | EMISSION (record) | `git diff -U0 -- docs`, added lines | No arbitrary-value class candidate (K8). Record the count of removed `bg-[#13D9CC]`-style candidates (expected 0 in these files) |
| C9 | AUTH + STUDIO OPENS | `/studio/middle-east` anonymous; `/api/studio-token?product=middle-east&file=x` with no bearer; `/studio-lab` in a fresh context at 1440×900 and 1280×720 | "Sign in required" with 0 audio `src`; 401; `/studio-lab` opens as the demo. The real-owner path is BLOCKED (backend unavailable in cloud) |
| C10 | HOME UNCHANGED | `/` at 1440×900 and 1280×720 after the entrance | Header logo `rgb(201, 164, 106)`; `body` background `rgb(14, 13, 12)` (no app change in a docs-only round) |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:**
- Tailwind candidate extraction from `docs/**` (C8);
- `design-tokens.json` validity;
- the residual files' history (C2 K10, C3c).

## 3. After this round
1. **On C PASS:**
   - DPG-DOCS-UPDATE is C-verified.
   - **DPG P0 is complete** (P0-1…P0-3b), so root re-runs the DP gate (design-philosopher + product-designer).
   - The P0 items stay "awaiting DP gate" until both reviewers give 10/10.
2. **The next planning:**
   1. **REGRESSION-2026-11-13** (due on or after 2026-11-13);
   2. **RETRO 480**;
   3. DPG P1: the DPG-LOGO serif half (on Saba's answer), DPG-BUTTON-CLEANUP, DPG-FOOTER-LINKS, DPG-CSS-DEDUP, DPG-FONT-RESOLVE (= STORE-2c-2…4) and DPG-COLOR-CONSOLIDATE, plus any DP-gate findings root files.
3. **Root, non-blocking for the loop:**
   - ROOT-REQ-DPG-PRIMITIVES-PATCH (the `.claude/**` text). **It should land before the DP-gate re-run.** Otherwise P0 item 4 fails again on `DESIGN_TOKENS.md`;
   - ROOT-REQ-NAV-LOADING-BAR-RENDER;
   - ROOT-REQ-DPG-GATE-REPORT.
