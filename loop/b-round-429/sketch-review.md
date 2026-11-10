# Sketch review — round 430 (SABA-B-12 stage 1, STUDIO-VIS-1)

Dispatched sketch: `b-round-429/sketch-430.patch.txt`, sha256 `a459d97568d5f446442d43e827b23a5a8add5c36e0d9c91ac11dc69cc22de567`.

## Review 1 — v1 (source identical to final; tests revised after it)
Reviewer: `tech-lead` (read-only, 2026-11-10). **Verdict: approve-with-lows.** No Critical, High or Medium.
- TL-R430-01 Info: Tailwind v4 generates the arbitrary property/variant tokens; `twMerge` in `cn(inputClass, 'shrink-0', …)` keeps all three (only `border-outline-strong` is swapped for `border-warning` while pending).
- TL-R430-02 Info: Firefox (`appearance: textfield`, 80+) and Safari (the `::-webkit-*` rules) are reasoning, not measurement. **Done in final:** NF1's title now says "token contract; the browser half is the C probe". Firefox/Safari = TLM-SABA-B-12-FIREFOX-SAFARI (Tech Lead, deadline RETRO 435).
- TL-R430-03 Info: no a11y/keyboard regression: `type="number"` keeps role spinbutton, step/min/max, typing and ArrowUp/Down; the wheel guard keys on `target.type`, not a class.
- TL-R430-04 Low: NF2/F10 missed a fourth number field in the panel. **Fixed in final:** F10 collects `getAllByRole('spinbutton')` inside `arrangement-detail-content` and pins the three test ids in DOM order (From, To, Clip Gain). Mutant MU-NF-4TH-FIELD turns F10 red.
- TL-R430-05 Low: NF2's `startsWith('import')` filter could count a multi-line import as a use. **Fixed in final:** import statements are stripped with a multi-line regex and a use must be `${STUDIO_NUMBER_FIELD_CLASS}` or `cn(… STUDIO_NUMBER_FIELD_CLASS`. Mutant MU-NF-IMPORT-ONLY turns NF2 (and F10) red.
- TL-R430-06 Low: NF2 misses `type={var}`, spreads and wrappers, and does not recurse. **Ruled (B):** none exists in `app/components/arrangement` today (claims K8); the pin message now tells the next author what to do. Accepted as the scan's documented limit; doc 278 TODO.
- TL-R430-07 Low: F10 claimed the disabled state without asserting it. **Fixed in final:** `hasAttribute('disabled')` true before selection, false after (no jest-dom in this repo).
- TL-R430-08 Low: folder resolved from `process.cwd()`. **Fixed in final:** `resolve(__dirname, '../../../components/arrangement')`.
- TL-R430-09 Info: naming follows `studio-fader.ts`; `STUDIO_NUMBER_FIELD_CLASS` kept.
- TL-R430-10 Info: seven number inputs in `app/components/recordings/` keep spinners. **Ruled (B):** recorded in SABA-B-12's inventory (b-round-429.md); reachability from `/studio-lab` is checked at stage-2 planning.

## Final (test-only delta after review 1)
Source hunks (`studio-number-field.ts`, `ArrangementDetailPanel.tsx`) are the same text as v1. Re-measured on the final sha: Chromium probe `probe/compare.txt` ALL OK (6 cells; `probe/sketch-final/`), 6 mutant lines all red (`mutants/summary.txt`), covering 32 files 660/660, typecheck and lint rc 0, Biome 4 files rc 0. No re-review: the delta only applies the reviewer's own fixes to test files.

## Ordering matrix
Not applicable: no concurrency or ordering contract (L58).
