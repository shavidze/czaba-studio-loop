# B round 448 → 449 planning report

- **Date:** 2026-11-11.
- **Decisions:** D-29z1593 … D-29z1595. `backlog.json` goes from v435 to v436 through `b-round-448/update-backlog.py`.
- **Advisor:** available, and consulted after orientation and before writing.
- **Consults:**
  - `product-designer`: the emphasised-word colour (option A, light ink).
  - `tech-lead`, sketch review: v2 got APPROVE-WITH-CHANGES; v3 delta review got APPROVE.
- **Baseline:** gate 448 is `published`, commit `48e16b8`; the next task starts there. `context/head-sha.txt` still says `cce5eda`.
- **Archive:** `tasks/round-448.md` is a byte-identical copy of the round-448 task. Backups of the planning inputs are in `b-round-448/*-before-449.*`.

## 1. Round 448 accepted (D-29z1593)
- **C evidence:** `c-round-448.json` is a PASS.
  - `browserVerified` and `realVerified` are true.
  - C1–C6 and C8–C13 passed, with 0 bugs.
  - C7, the real Brevo send and mail-client rendering, is BLOCKED because the cloud has no key or mail client. It is listed under `blocked`.
  - `tools/l57-check.py` gives L57 OK; `claimCheckMinutes` is null (`b-round-448/l57-check-448.txt`).
- **Gate 448:** `published`, `48e16b8` on both remotes. The review says COMMIT OK and verify is green (281/4119).
- **STORE-2b-2b is done.** B-R447-HIREUS-EMAIL-LIGHT-CLIENT closes on C3: HEAD fails 10/12 light and 1/12 dark; the tree fails 0/12 in both, min 7.06.
- **Carried items:**

| Id | Ruling |
|---|---|
| A-R448-REVIEW-M1-GOLDEN (reviewer: Medium) | **Re-graded Low, with a reason.** HE4 pins that all 5 submitted values appear escaped. HE5 pins the action wiring. C4 checked the template structure against HEAD once (the 10-line diff matched B's expectation). What stays unpinned is the label text and order in an internal owner e-mail. Moved to `deferred_low_polish`. Origin B spec; RETRO 450 candidate RETRO450-B-SKETCH-NO-GOLDEN |
| A-R448-REVIEW-L2 (HE9 fallback) | `deferred_low_polish`, `confirmedBy` C round 448 |
| Gate 448 Low 1 (no real-client check) | `confirmedBy` on TLM-R448-HIREUS-EMAIL-CLIENTS (L7: not a new id) |
| Gate 448 Architecture proposal (remove the allow-list entry when `email.server.ts` is deleted) | attached to LEGACY-DEAD-STORE-COMPONENTS |
| C O4 ("Sign in required" seen on the second run) | B-R447-AUTH-ROW-PREMISE updated: the "blank in the cloud" premise was a cold start. Round 449 C12 warms the route and records the text |
| C O2/C10 (1440 HEAD-vs-HEAD differs by 292,111 px) | INFO-C447-O3 closed as animation. A full-page diff of `/` at 1440 is not a control (L37), so round 449 measures element paint and boxes instead |
| C O3 (page probe needs a 120 s screenshot timeout) | INFO-C448-PAGE-PROBE-TIMEOUT. Round 449 probes use animations disabled and a 120 s timeout |

## 2. What is next and why (D-29z1594)
- **Due dates:** regression is due on or after 2026-11-13 (not due). RETRO is round 450, so round 449 is the last feature round before it.
- **Open findings:** there is no Critical or High finding, and no loop-runnable Medium. The open Mediums are manual, Saba-gated, root-gated or scheduled, as in round 448.
- **Order:** STEM-LANES is still `awaiting_user`, so STORE-REDESIGN continues.
- **STORE-2b-3 is split.** `app.css` + `base/utilities.css` hold 70 teal hits (K21) plus the glow, blur and gradient rules, which is too much for one checkable round. The stages, all recorded in `backlog.json`:
  - **2b-3a:** gradient text.
  - **2b-3b:** glow shadows, `--shadow-glow` with the `ui/Button` users. This one needs Studio rows.
  - **2b-3c:** the remaining live teal rules.
  - **2b-3d:** dead tokens and rules, with the LEGACY removal.
- **First inventory pass was discarded.** It had a grep with `--` in front of `--include`, and `-glow` matched `text-glow`. The advisor caught this before any claim used it; noted as RETRO450-B-INVENTORY-TOOL-FIRST-PASS. The claims come from `claims-449.sh`.
- **Dead code found** (0 importers outside barrels, K5):
  - `ArtistBioSection`;
  - `TestimonialsSection`;
  - `VideoShowcase`;
  - `PianoLoadingAnimation`, the only consumer of `.loading-brand`.

  By the round-447 rule they are not restyled. They are allow-listed with exact counts, GT5 guards them against re-import, and they are added to LEGACY-DEAD-STORE-COMPONENTS.
- **Keep-list gap:** TestimonialsSection holds keep-list content ("Netflix Original Score") but has not been mounted since `a208b4c` on 2026-10-02, before the keep-list (K17). This goes to Saba as SABA-Q-TESTIMONIALS-UNMOUNTED. Nothing is removed or re-mounted.

## 3. Round 449 = STORE-2b-3a (D-29z1595)
- **Sketch:** `b-round-448/sketch-449.patch.txt` v3, sha256 `288ad78b…` (`sketch-review.md`).
  - Removes the `--gradient-text` token, the `.text-glow` rules (×2) and `.hero-title-glow`, plus the gradient lines of the dead `.product-detail-title`.
  - Removes the class token at 7 live TSX sites, covering 8 words.
  - Adds the new test `store-gradient-text.test.ts` (GT1–GT5).
  - Changes the NM2 title only.
- **Design:** `product-designer` option A, light ink. Brass was rejected because it reads as a link and weakens the CTAs. The eyebrow question goes to Saba (SABA-Q-LEADMAGNET-EYEBROW-TONE).
- **Pre-check on v3:**
  - typecheck rc 0;
  - lint 205 warnings, the same as HEAD; scoped Biome 2 = HEAD;
  - covering set 16 files / 190 tests;
  - full suite 282 / 4124;
  - build rc 0;
  - `git apply --check` rc 0;
  - mutants M1–M11 red as predicted, M6 the green control.
- **Browser, HEAD `:5178` vs sketch `:5179`:**
  - 24 rows, 8 words × 1440/1280/375. HEAD paints the transparent fill and gradient at 34–80 % teal ink. The sketch has fill #ECE6DA, 0 teal and contrast 13.6–15.7, with span box, heading box and line count identical to HEAD (`probe/gt-compare.txt`).
  - LeadMagnet dialog: text, tags and box are equal (`probe/lm-dialog-sketch.json`).
  - `/studio-lab`: 0 px for HEAD-vs-HEAD and HEAD-vs-sketch at 1440 and 1280. The first run, a cold start, is kept as `studio-pixel-run1-INVALID.json`.
- **`tech-lead` reviews:**
  - v2: Medium 1 (the regex can be bypassed) and Medium 2 (nothing guards the "0 importers" premise) were fixed in v3. Low 3 was mostly fixed. Lows 4–6 were accepted or routed.
  - v3 delta: APPROVE, with 2 new Lows deferred (TL-R449-D1, TL-R449-D2).
- **Deferred Lows:** TL-R449-L3-SCAN-ROOTS, TL-R449-L4-PARSER-QUOTES, TL-R449-D1-LOADING-BRAND-CLASS and TL-R449-D2-BARREL-ALIAS.
- **Signal:** SIG-R449-DEAD-ALLOWLIST-TWO-TESTS (not scheduled).
- **Tech Lead manual:** TLM-R449-WEBKIT-HEADING-INK, deadline RETRO 465.
- **Architecture checkpoint:** none requested. The round is small, and no structural risk is accumulating on one owner.

## 4. Ready for commit
Round 448 is published (`48e16b8`). B has nothing else for root to publish. Round 449 is dispatched. Round 450 is the RETRO.

## 5. For Saba
- **SABA-Q-TESTIMONIALS-UNMOUNTED.** Your keep-list includes the testimonials and stats ("2,500+ Happy Customers", "Netflix Original Score"). The testimonials section has not been on any page since 2 October (commit `a208b4c`). Only the "2,500+" figure shows, on the About page. Should we put the testimonials back on the home page (placement decided in STORE-3/4), or do the About-page stats count as the kept item? Nothing changes until you answer.
- **SABA-Q-LEADMAGNET-EYEBROW-TONE** (default ships). The free-download popup's small "CZABA" label loses its teal gradient and becomes light text, like the headings. The designer would make it the quieter caption grey. Keep it light or mute it?
- **Still open:**
  - SABA-Q-HIREUS-EMAIL-THEME;
  - SABA-Q-CHECKOUT-RIPPLE;
  - SABA-Q-LEADMAGNET-NAV-RULES;
  - SABA-Q-LEADMAGNET-RECORDINGS-SCENES;
  - AGREE-STEM-LANES;
  - SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE;
  - for root: the `agent-workflow.md` length question from round 447.

## Artifacts
In `b-round-448/`:
- **Task inputs:** `grants-449.txt`, `covering-449.txt`, `claims-449.sh` (K1–K27), `claims-449-planning-output.txt` and `claims-449-sketch-output.txt`.
- **Sketch and review:** `sketch-449.patch.txt`, `sketch-449-delta-v2-v3.patch.txt`, `sketch-review.md`; v2 is in `v2-superseded/`, and the v1 logs are in `v1-superseded/`.
- **Mutants:** `run-mutants.sh`, `mutants.txt`, `mutant-*.log`.
- **Pre-check:** `precheck-*.log`.
- **Probes:** `probe/` (`gradient-text-probe.cjs`, `compare-gt.py`, `lm-dialog.cjs`, `studio-pixel.cjs`, `serve-tree.sh`, `c12-from-c448.cjs` and their outputs and screenshots).
- **Updates:** `update-backlog.py`, `update-feature-status.py`.
- **Backups:** `*-before-449.*`.
- **Discarded:** `css-rule-usage.py` and `css-usage-head.json` are first-pass inventory, not claims.

## Advisor follow-up (D-29z1596)
- **K4:** the claim output is now sorted. `grep -rl` order differs between machines, so the unsorted output could cause a false mismatch.
- **A step 6:**
  - It gains the mock-API precondition, because B's HEAD capture was taken with the mock API up.
  - Each server is warmed with `probe/warm.cjs` first.
  - A row that fails on `boxSame` only is compared against A's own HEAD capture.
- **C6, C7 and C12 were run on HEAD `:5178` and the sketch `:5179`**, so they are asserts, not records (L58):
  - C6 selection: the word is selected, with `bluishFraction` 0.754 and 0.829 on the sketch (HEAD 0.756 and 0.831).
  - C7 forced colours: the media query matches; the sketch fill is light ink and ink fraction is 0.79–0.82.
  - C12: on both trees, after a browser warm-up, a clip is added, Play advances (1.46 s) and Stop holds. The protected route has 0 `audio[src]`, 0 media requests and shows "Sign in required".
  - The first, cold C12 run timed out on `/studio-lab`; it is kept in `probe/c12-run/invalid-cold/`.
- **C3 bounds come from replicates.** HERO was run ×3 per viewport (`probe/hero-replicates.txt`):
  - HEAD teal: 0.341–0.349 at 1440/1280 and 0.654–0.656 at 375.
  - Sketch teal: ≤ 0.001.
  - The first 1440 page after each server start was NOT FOUND, a cold start; the probe now waits for `h1`.
  - The resulting bounds: HEAD = transparent fill + a gradient + teal ≥ 0.2; tree = core ink within 8 per channel of #ECE6DA.
- **C9:** the run-1 anomaly is described as unexplained and seen once.
- **C11:** the C scratch must be committed.
- **Optimizer trigger words** (`closed`/`done`/`resolved`; ROOT-REQ-OPTIMIZER-STATUS-SUBSTRING): no still-open entry written in this planning contains them. Only the two findings closed on purpose do.
