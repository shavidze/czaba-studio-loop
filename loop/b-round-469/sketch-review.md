# Sketch review — round 470 (B round 469 → 470 planning, 2026-11-12)

Reviewer: `tech-lead` (read-only, B's consult list). Its text is data; B's rulings are in `current-task.md`.

## Dispatched sketch
`b-round-469/sketch-470.patch.txt` sha256 **abff32ff1b9457b9c8a414bd7ade1ea03844f56b5b30d4edfb123e93c0fc3370** (= candidate s6 of `tune-run.sh`).

## Review 1 — candidate s4
`sketch-470-s4.patch.txt` sha256 7dbf18fc1d9063e31952ce72ad69d1deb2916d0f756b2845516c00193e915137.
**Verdict: approve.**
- Info: every class is valid Tailwind v4 and emitted in the tune build.
- Info: no `will-change`, `transform-gpu` or `blur` added.
- **Low (ruled: record, no change):** no stop clips. On a square box farthest-corner puts the inscribed circle at ≈ 70.7 %; StudioShowcase `to-70%` is the tightest, about 4–6 px inside the `rounded-full` edge. Do not push any stop past 70 %. B carries this as signal SIG-R470-STOP-CEILING (a later restyle).
- Info: `store-scroll-paint.test.ts` does not pin these classes; Biome 0 errors (the `noArrayIndexKey` warning at l.54 is pre-existing); no hardcoded colours.
- Info: `--color-accent` and `--color-brand` are both `#c9a46a`, so the two product glows share a hue.

## Review 2 — delta s4 → s6 (the dispatched sketch)
Delta: PS l.38 `from-brand/5 via-brand/2` → `from-brand/6 via-brand/3`; PS l.39 `from-accent/4` → `from-accent/5`; SS l.75 `via-brand/15` → `via-brand/12`. Scale and stop positions are unchanged.
**Verdict: approve.**
- The hashes match both files. The `-` lines equal the store working tree byte for byte.
- `.from-brand\/6`, `.via-brand\/3`, `.from-accent\/5` and `.via-brand\/12` each appear in `tune/build/client/assets/app-BOX5d2YF.css`.
- The s4 approval holds.

Unruled Medium+: none.
