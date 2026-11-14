# Doc 322 ledger (L26), round 501 sketch v2 (`sketch-501.patch.txt`)

Every declarative sentence of doc 322 → test row / browser row / claim / log. Line numbers are on the sketch file.

| Doc line | Statement | Evidence |
|---|---|---|
| 4 | status `In Progress (stage 2b-2 of DPG-BUTTON-CLEANUP-2; C round 501 PASS)` | L28 form; K15; C11 byte check |
| 9–12 | three hand-rolled brass `<button>` sites; FD has three cards and toggles a form | K3, K4, K6, K25 (3 items); B2B2-1 (3 buttons), B2B2-2 (toggle) |
| 14 | scanner 109/44 at HEAD, 104/41 on the sketch | K11 at HEAD; `scan-sketch.txt` |
| 18 | CTA pill / form submit default shape (product-designer) | `consult-product-designer.md`; K10 precedent |
| 19 | FD: primary lg pill, type button, aria-expanded | B2B2-1 (class, type, aria-expanded), B2B2-2; M1–M4; browser `sketch.out` FD rows (mouse) + `sketch-journey.out` step 3 (keyboard Enter) |
| 20 | NL: primary lg, submit, disabled while busy, h-14 = 56 px field | B2B2-4; M6, M7, M10; `sketch.out` NL field h 56 = button h 56 (1440/1280/375) |
| 21 | HU: primary lg fullWidth, submit, disabled while busy | B2B2-5, ST5; M12, M14, M15; `sketch.out` HU 832×48 |
| 22 | copy unchanged, no `isLoading` | B2B2-4/5 text rows; M11 (isLoading → red); K7, K9 (Loading... in Button) |
| 23 | HU white spinner → Loader2, dark text colour; both spinners `motion-reduce:animate-none` | B2B2-5 (`lucide-loader-circle`, no border-white), B2B2-4; M9, M13, M19, M30; `sketch.out` busy svg color rgb(14, 13, 12) |
| 25 | D1 FD 50→48, 500→600, hover token, width 150→152 (1440) | `head.out` vs `sketch.out` (FD box 150×50 / 152×48, fs 16px/500 vs /600, hover rgb(217, 184, 127)) |
| 26 | D2 NL radius 12→8, padding 32→24, h 56, widths 140→124 / field 424→440 (1440), busy 0.7→0.5 and no hover | `head.out` vs `sketch.out` NL rows; busy rows (op 0.7 pe auto vs op 0.5 pe none) |
| 27 | D3 HU 58→48, 16→8, padding 16/0→12/24, hover token, busy no hover | `head.out` vs `sketch.out` HU rows + busy rows |
| 28 | D5 press opacity 1→0.9 (measured); all three gain `shadow-sm`, box-shadow HEAD `none` → sketch `rgba(4, 5, 6, 0.3) 0px 1px 2px 0px` | `sketch.out` press opacity 0.90… vs `head.out`; `probe/head/head.json` and `probe/sketch/sketch.json` key `rest.boxShadow` (all 9 rows each); B2B2-0 oracles contain `shadow-sm` |
| 29 | D4 "Send Download Link" unchanged (NONBRAND) | K25 (raw `bg-foreground` class still present); B2B2-2 (type submit) |
| 30 | Saba questions | `consult-product-designer.md` |
| 36–39 | diagram: three sites; NL used by `_index.tsx` | K12 sweep; `app/routes/_index.tsx` imports NewsletterSection (grep in K-sweep source list); B2B2-6 one Button per file |
| 44–49 | changed files (DESIGN_SYSTEM: two shape rows + the two-shapes sentence) | `sketch-501.patch.txt` `--stat` (7 files) |
| 53 | no class merge; className only adds h-14 | Button.tsx builder (K9); B2B2-0 oracle ends in `h-14` |
| 54 | isLoading rewrites copy | K9 |
| 55 | ST5 now 0 `bg-brand` attributes + Button line; dark text by primary asserts | K8; ST5 red on M12, M14, M15, M16, M18 |
| 56 | busy state held by `page.route` in the probe | `probe/measure-501.mjs`, `probe/nav-501.mjs` |
| 57 | B2B2-0 five oracles; (mutant list now includes M31, the ST5-only isolation) B2B2-1…5 class/type/text/disabled/icon order; NL and HU order vs field; fresh-element rerender; B2B2-6 brace-aware scanner; B2B2-7 self-test; mutants M1–M20, M26–M28, M30 red | test file rows; `mutants-501.txt` |
| 62–66 | A's expected numbers: typecheck rc 0, lint 179 warnings, Biome 5 files 1 warning, covering 15 files / 179 tests | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log`, `precheck-covering.log` |
| 68 | full suite 298 / 4,337 rc 0 | `precheck-full.log` |
| 69 | build rc 0 | `precheck-build-sketch.log` (CSS `app-B4X5hQCC.css`) |
| 70 | mutants M1–M20, M26–M28, M30, M31 all red | `mutants-501.txt` |
| 71 | browser compare scopes (rest/hover 3 viewports; focus/press 1440/1280; busy 1440; journey) | `head.out`, `sketch.out`, `head-journey.out`, `sketch-journey.out` |
| 72 | contrast rest 8.32, hover 10.28 | `sketch.out` (`c 8.32`, hover `10.28`) |
| 74 | A runs no browser rows | task §3 |
| 75 | C round 501 acceptance | `c-round-501.json` (pending C) |
| 79–85 | TODO items | backlog `DPG-BUTTON-CLEANUP-2` substages; SIG-R498-BUTTONLINK-WRAPPER |

Open/deferred findings on the touched files grepped for contradictions: TL-R501-FD-ARIA-CONTROLS (new, Low, deferred; doc does not claim aria-controls). No other open finding names the three files' button lines.
