# Sketch review, round 396 (PERF-13c-ii-b)

**Dispatched sketch:** `b-round-395/sketch-396.patch.txt`, sha256 `91c5d73012eeb0b43f61d304f3c8743e1dfcc5beae96d8367b00407eeb7dc50a`.
**Reviewer:** `tech-lead` (code-reviewer is not on B's consult list; L58 allows `tech-lead`). Read-only.

## Review 1, on sha256 `236287d196726a3674d2e5f463df5c6035ab90cbe09b9d0e67e1ebe7482bac9d`
- **Medium 1 (perf step left `HTMLMediaElement.prototype.play` wrapped; element array kept alive):** fixed in the sketch. `measurePreviewStream` installs `window.__czabaPreviewRestore` and calls it in `finally`; body moved to `runPreviewStream`.
- **Medium 2 (stream element sends credentials in no-cors mode, unlike the decode fetch `credentials: 'omit'`):** fixed in the sketch. `element.crossOrigin = 'anonymous';` after `createAudioElement()`; row PS29; mutant MU-396-NO-CROSSORIGIN.
- **Low (duplicate stem URLs under two ids share the same-URL seek path):** recorded as B-R395-PURCHASED-DUP-URL (deferred_low_polish).
- **Low (AudioContext created at preview time in 1x passes):** no budgeted row affected; perf sketch rows equal C round 395 except `res.harness.mem-polls-1.6x` 18 → 20 (poll count, assert passes).
- Rulings (a) URL as seek key, (b) fallback lifetime = collection object, (c) no cache write by the stream: all hold. Note for SRW-21-PLAN: the route must memoise the adapter by product id and stems (else the fallback never sticks and the decode cache resets).
- Architecture: keep `previewUrl` inline in the adapter.

## Review 2 (delta), on sha256 `91c5d730…` (= dispatched)
- Both Mediums resolved. No Critical/High/Medium.
- **Low:** `perf/studio-lab-resources.perf.spec.ts` `finally` restore `page.evaluate` would throw on a crashed page and hide the real error; recorded as B-R395-PERF-RESTORE-CATCH (deferred_low_polish), not applied (keeps reviewed = dispatched).

## Ordering matrix
Not applicable: the round adds no write, abort, queue or join path. The stream lifecycle (preview.client.ts) changes only the element's CORS mode before `src`; the round-394/395 PS16–PS26 ordering rows are unchanged and green (`precheck-covering.log`).

## Evidence
- Unit mutants: `mutants/summary.txt` (7/7 RED, pristine rc 0 before and after), per-mutant logs `mutants/mutant-*.log`.
- Perf: `perf-sketch.log` + `perf-sketch-latest-resources.json` (PASS; preview rows 1 / 0 / 0); fix-removed mutant `mutants/perf-MU-396-DEMO-NO-STREAM.log` (FAIL: 0 / 37.1 / 1).
- Browser (scratch dev server :5174, own Vite cacheDir, stopped after): `probe/rows-R1b.json`, `rows-R1.json`, `rows-R3.json`, `rows-R2.json`, `rows-R6.json` equal C round 395; `probe/rows-R8.json` crossOrigin `anonymous`, stream playing, 0 decodes.
- `sketch-tsc.log` rc 0, `sketch-biome.log` rc 0, `precheck-full.log` 258 files / 3832 tests rc 0, `precheck-covering.log` 19 files / 314 tests rc 0.
