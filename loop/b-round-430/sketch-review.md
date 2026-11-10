# Sketch review — round 431 (SABA-B-12 stage 2a, Export dialog radios)

**Dispatched patch:** `b-round-430/sketch-431.patch.txt`, sha256 `18d59a2fbe599fa84d67e442d6b602fc313a32982b2643172a62e861ee8222d6` (6 files, against 5a30894).

**Reviewer:** `tech-lead` (read-only consult, 2026-11-10), on the first version of the sketch (sha `8a86ba1c…`).
**Verdict: approve-with-lows** (no Critical, High or Medium).

| Id | Severity | Finding | Applied in the dispatched sha |
|---|---|---|---|
| TL-R431-01 | Low | `transition-colors` and `motion-reduce:transition-none` are dead: the unlayered global rule `a, button, input … { transition: … }` (app.css ~l.313) beats `@layer utilities` | **Applied:** both tokens removed from STUDIO_RADIO_CLASS and RD1. The pre-existing global 150 ms colour fade on every input stays (not motion; unchanged from HEAD) |
| TL-R431-02 | Low | RD2 misses a radio hidden behind a spread or `type={var}` | **Applied:** RD2 now also fails when any `<input>` in the folder lacks a literal `type="…"` (all current inputs pass; mutant MU-RD-SPREAD-TYPE red). Limits that stay: top-level `app/components/arrangement/*.tsx` only; `app/components/recordings/SfxSceneExport.tsx:141` keeps a native radio (not in the /studio-lab import closure; STORE-REDESIGN acceptance, TL-R430-10) |
| TL-R431-03 | Low | hover recoloured the checked ring | **Applied:** `enabled:not-checked:hover:border-brand-hover` (product-designer spec: nothing changes on checked). Browser: checked wav/project hover border stays rgb(201,164,106); unchecked mp3/both hover rgb(217,184,127) (`probe/sketch/radio-probe.json`); mutant MU-RD-HOVER-CHECKED red |

Variant validity (tech-lead compiled the class with the store's `@tailwindcss/node`): `checked:border-4`, `checked:border-brand`, `enabled:…:hover` (inside `@media (hover:hover)`), `forced-colors:appearance-auto` (`@media (forced-colors: active)`) are valid; `not-checked` was confirmed in the real browser run above.

Replacement assertions are equal or stronger (L4): DXA7 `accent-brand` 5 → `className={STUDIO_RADIO_CLASS}` 6 + `'checked:border-brand'` 1 in studio-radio.ts + retired `accent-brand` 0; DXL8 `accent-brand` 5 → 0 + STUDIO_RADIO_CLASS 6. The disabled Video radio is now covered too.

Final sketch runs (B, on `/tmp/b431` = git archive 5a30894 + sketch): covering 29 files 384/384 (`precheck-a2.log`), typecheck rc 0, Biome rc 0 on the 6 files (`precheck-biome6.log`), mutants 7/7 red (`mutants/summary.txt`), probe ALL OK (`probe/compare.txt`).
