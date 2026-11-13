# Sketch review: round 491 (B-R487-PROFILE-EDITOR-NARROW-OVERFLOW)

**Dispatched sketch:** `b-round-490/sketch-491.patch.txt`, sha256 `a3b6e637eedddbe284b15fec1897d6586f7e125c246fafdde28de5fc55090561` (v2).
**Reviewed versions:** v1 `9fd04bda06775d07ca66f7e10eab9cb35a04679ca3aa6fb5304e68c70b1498af` (`b-round-490/sketch-491-v1.patch.txt`), full review; v2 = v1 + docs-only delta (`b-round-490/sketch-491-v1-to-v2.diff.txt`), delta re-review.
**Reviewer:** `tech-lead` (read-only), both times on a copy of B's scratch `/tmp/b491-scratch` (clone at `53ff249`).

## Verdict
- v1 `9fd04bda…`: **APPROVE** (no Critical/High/Medium; 4 Lows).
- v2 `a3b6e637…`: **APPROVE** (delta docs-only; every new sentence true; `html, body { overflow-x: hidden; }` in `app/styles/app.css` is why the horizontal-scroll metric cannot reveal the bug).

## Findings and B's rulings
| # | Sev | Finding | Ruling |
|---|---|---|---|
| TL-R491-L1 | Low | Only Chromium measured; WebKit/Firefox from the CSS spec | Adopted in v2: doc 317 TODO says Chromium-only; real phone + WebKit/Firefox = TLM-R491-PHONE-NAME-EDITOR (deadline RETRO 495) |
| TL-R491-L2 | Low | No durable automated guard (jsdom cannot lay out; class asserts are forbidden, L12) | Adopted as a doc TODO and a backlog Low `B-R491-NARROW-EDITOR-E2E-GUARD` (role-based 375 px Playwright test with a signed-in stub; smoke config has none today). Not this round: browser rows + HEAD red + DOM mutant red are the acceptance (TESTING_QUALITY_GATES "fails before, passes after") |
| TL-R491-L3 | Low | 320 px shows about 8–9 characters per input | Accepted; long value scrolls inside the input (probe `longTyped`) |
| TL-R491-L4 | Low | Doc 317 "no horizontal scroll" does not distinguish HEAD and sketch | Adopted in v2 (sentence marked as non-evidence) |
| TL-R491-V2-OPT | Low (optional) | Cite the `app.css` html/body clip instead of "the row" in doc 317 l.39 | Not adopted: the sentence is true as written (tech-lead v2), and a further edit would need a third review for no behaviour change. Recorded here only |

- **`shrink-0` on the buttons:** tech-lead advises against it (the button's own automatic minimum is 32 px; the token would be unverifiable). Matches B's v0 run `probe/mutants-variant.json` (v0 build): `MB_no_shrink_0` and `MC_no_flex_1` PASS (survive), `V2_min_w_0_only` PASS, `V2_minus_min_w_0` RED; v0 tokens dropped.
- **Architecture note:** keep. A two-class change inside `ProfileContent` needs no extraction. ARCH-CHECKPOINT-ACCOUNT-PROFILE stays requested for round 492 (PasswordModal).

## Mutants (browser DOM mutants on the production build of the sketch; `probe/mut-491.mjs`)
- Summary `b-round-490/mutants/mutants-summary.txt` (= `probe/mutants-sketch.txt`): `M0` PASS at 375 and 320; `MA_no_min_w_0` (remove `min-w-0` from both inputs) RED at 375 and 320 (Save right edge 392, Cancel 436, beyond the viewport).
- HEAD control: `probe/headprod-narrow.json` (production build of `53ff249`): at 375/360/320 Save and Cancel are `offscreen`, click and tap send 0 PUT and the editor stays open.
- Rejected v0 (`min-w-0 flex-1 sm:w-40 sm:flex-none` + `shrink-0`): mutants removing `flex-1` or `shrink-0` stayed green (redundant tokens). Its mutant run is `probe/mutants-variant.json` (keys MB_no_shrink_0, MC_no_flex_1 pass=true); rationale in D-29z1754.
