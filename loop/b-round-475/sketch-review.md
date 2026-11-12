# Sketch review: DPG-P0-3a (B round 475 → 476 planning, 2026-11-12)

**Reviewer:** `tech-lead`, read-only, on v1 (`sketch-476-v1.patch.txt`, sha `b27864a1f64296b254fc0ea7de0fc436a1dd26889899af6a2da01c7fde4f638c`).

**Verdict: APPROVE WITH CHANGES.** All findings are test hardening and one nit; none blocks.

## v1 findings and resolution in v2
**v2** = `sketch-476.patch.txt`, sha `83341e9f0c435de0a77d1508a960d436a7d8bc55344d5699e23347fbbb5073e0`.

| # | Severity | Finding | v2 |
|---|---|---|---|
| 1 | Low | P4's exact `toHaveBeenCalledTimes(45)` breaks if any library starts calling `Math.random` | Adopted: `atMount = calls.length`, `> 0`, and equal after the phases. M7 still red |
| 2 | Low | P3's negative regex misses `#000000`, `rgb(` and the space syntax | Adopted the reviewer's regex verbatim. The row title now says "six light stops" (the positive count is a mutant guard). New mutants M11 (space syntax) and M12 (`#000000`) are red |
| 3 | Nit | `{/* Obsidian background */}` rewrites an English comment; the rule allows only Georgian context or TODO comments | Adopted: the comment line is deleted |
| a | Info | `var()` / `color-mix` in inline style and in the cover CSS: no transparent-cover risk beyond HEAD's `var(--color-black)` dependency. Without `color-mix` support (Chrome < 111, Safari < 16.2) the vignette drops; the cover still works | Recorded (C row C6 reads the computed value in Chromium) |
| c | Info | `useState(createDustParticles)` runs on every mount (45 cheap calls); no hydration risk; no visible change | Recorded |
| d | Architecture | Keep `createDustParticles` in `SpotlightLoader.tsx` (one consumer) | → `architecture_signals` as keep |

No delta review was needed: the v1 → v2 delta is exactly findings 1–3.
- **v2 evidence:** 12/12 mutants red (`mutants/b-run/summary.txt`); typecheck and lint rc 0; covering 16 files, 262 tests; full suite on v2 in `precheck-full.log`.
- **v1 evidence:** full suite 287 files, 4209 tests (`precheck-full-v1.log`).
