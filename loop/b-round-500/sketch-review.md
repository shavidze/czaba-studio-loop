# Sketch review, round 501 (DPG-BUTTON-CLEANUP-2 stage 2b-2)

## Review 1: tech-lead (adversarial), sketch v1
- Reviewed: `b-round-500/sketch-501-v1.patch.txt` sha256 `b489d49521b8eab602755507ecb23545ab657a5cea07e2e4e014a7caf3c90976`.
- Verdict (v1): CHANGES-REQUIRED.
- Findings and B's rulings (all fixed in v2):
  1. Medium: B2B2-6 regex `/<button\b[^>]*>/` stops at the `>` of `=>`; a raw brass FD `<button>` with the arrow `onClick` before `className` (the HEAD shape) passed (reviewer M20 green). **Fixed:** brace-aware `openingTags` scanner (copy of the IL3 scanner in `store-internal-links.test.ts`) + `hasSolidBrass`; B2B2-6 asserts 0 raw brass tags and exactly 1 `<Button` per file; B2B2-7 self-tests the scanner on the HEAD shape; B mutant M20 (HEAD raw button restored, Button import kept) is RED on B2B2-1/2/3/6.
  2. Low: `loader: undefined as unknown` (type assertion on a new line). **Fixed:** `type RemixState` + `vi.hoisted((): RemixState => …)`.
  3. Low: doc 322 viewport overclaim and incomplete deltas. **Fixed:** testing bullet scoped (rest/hover 1440/1280/375; focus/press 1440/1280; busy 1440); D1 `shadow-sm`; D2 widths 140→124 / field 424→440; D3 padding, hover, busy pointer-events; new D5 press opacity.
  4. Low: icon order/identity, FD form membership unpinned (reviewer M25–M28 green). **Fixed:** `expectIconThenLabel` (svg first with `lucide-download` / `lucide-send` / `lucide-loader-circle`, then the label span) on FD, NL busy, HU idle and busy; FD `closest('form')` null; B mutants M26, M27, M28, M30 RED. **Ruled (not pinned in jsdom):** spinner pixel size (reviewer M25) — C's browser rows read the busy box; the icon size is a visual, not a contract.
  5. Info: FD `aria-expanded` without `aria-controls` — optional for a disclosure; recorded as Low TL-R501-FD-ARIA-CONTROLS in `deferred_low_polish`.
  6. Info (pre-existing, untouched): inline `style` in hire-us.tsx, JSX comments, Biome label warning — not this stage.
- Matrix (site × attribute × state): reviewer's table, with the v1 UNPINNED cells closed by items 1 and 4 above. Remaining by ruling: NL/HU spinner size (C browser row), FD/NL/HU success and error branches (unchanged code, out of the button contract), `navigation.state === 'loading'` (unchanged).

## Review 2: tech-lead delta re-review, sketch v2
- Reviewed: sha256 `baa0445ab773dadf74bcedfb826f6e3e8e5880231c12c9a14cbfd4eb13497f58`.
- Findings 1, 2 and 4 resolved: the brace-aware scanner was run on `git show HEAD` files (1 raw brass `<button`, 0 `<Button` each) and on the sketch (0 and 1); M20 is red on B2B2-6. `RemixState` is a return-type annotation, not an assertion. `expectIconThenLabel` and FD form-null are pinned (M26–M28, M30 red). Spinner size is left to C's browser rows: the reviewer agrees (jsdom has no layout).
- Finding 3 partly resolved: D1 said only Download gains `shadow-sm`, but all three gain it from the primary variant, and no probe measures it. Optional: the Download width 150→152.
- Verdict (v2): CHANGES-REQUIRED (doc 322 D1/D5 wording only; code and tests approvable).
- **B fix (v3):** D1 drops the shadow claim and adds width 150→152 (1440). D5 says press opacity is measured and that all three gain `shadow-sm` from code, not measured. The ledger rows for l.25 and l.28 are updated. The build was re-run on v3 (rc 0, same CSS `app-B4X5hQCC.css`). Code and test hunks are unchanged from v2, so the v2 full-suite, covering and mutant runs stand.

## Review 3: tech-lead doc-only delta, sketch v3 (dispatched)
- Reviewed: sha256 `136247312c7fe5f9946f177f73a73121fd69d86b10e4a46838e774b2aa96bcad`, the dispatched `sketch-501.patch.txt`.
- The sha matches. The patch equals the scratch `git diff --cached` (minus the excluded `vite.config.ts` cacheDir). Code and test hunks match the files reviewed in v2.
- D1 (l.25): width 150 → 152 matches `head.out` and `sketch.out` at all three viewports, and no shadow claim remains. D5 (l.28): press opacity 1 → about 0.90 is measured on all three; `shadow-sm` is in the primary variant and pinned by `store-theme-tokens.test.ts:98`, and correctly labelled not measured.
- **Verdict: APPROVE.**

**Superseded:** v3 is replaced by v4 after the advisor's closing check. D5 said `shadow-sm` was not measured, but `rest.boxShadow` is in both probe JSONs.

## Review 4: tech-lead doc-only delta, sketch v4 (dispatched)
- Reviewed: sha256 `acb11d513566038107f566557df86d92de04d66b2219c3da4c8670ee1e730c58`, the dispatched `sketch-501.patch.txt`.
- The sha matches and the patch equals the staged scratch diff (minus `vite.config.ts`). The code and test hunks are the ones approved in reviews 2 and 3: the five `app` files were last modified before the v3/v4 doc edits.
- D5 matches all 9 JSON rows: HEAD `rest.boxShadow` `none`; sketch `rgba(4, 5, 6, 0.3) 0px 1px 2px 0px`, after four transparent layers that D5 leaves out (not wrong).
- DESIGN_SYSTEM: exactly three changed lines (the default row, the pill row and the two-shapes sentence).
- M31 is RED on ST5 only (47/48 pass, fails at `store-theme-tokens.test.ts:677`).
- **Verdict: APPROVE.**
