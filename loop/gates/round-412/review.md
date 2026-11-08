COMMIT: OK

I read the diff, the five new files, the surrounding `ArrangementContext.tsx` wiring (lines 4525–4594) and `ArrangementLibraryPreview.tsx` (lines 205–230). I did not rerun tests or a browser. For the verify run I only read the header of `verify.log`; your brief says it passed. No auth, purchase or download code is touched. The only network change is `fetchPrecomputedPeaks`, which now sends `credentials: 'omit'`, and that is safer than before.

## Findings, ranked
No Critical or High findings.

1. **Low: `app/lib/arrangement/precomputed-peaks.ts:107`.**
   - The size cap only applies when a `content-length` header exists. Without one, `Number(null ?? 0)` is 0, so a chunked response of any size is read by `response.json()`.
   - The two shipped files are static and small (about 122 KB and 188 KB), so there is no risk in this commit. Doc 264 already lists this as TL-R411-L4 and defers it to 15b-ii.
   - Fix in 15b-ii: read the body as a stream and stop at `PRECOMPUTED_PEAKS_MAX_BYTES`.

2. **Low: `scripts/peaks/generate-demo-peaks.mjs`.**
   - Biome does not cover `scripts/`, so the generator is unlinted and untested.
   - Its `rate / 100` duplicates `PEAK_BUCKETS_PER_SECOND`. PS17 catches drift between them.
   - The `base` URL from `process.argv` is a dev-only input and is not a concern.
   - Fix: add `scripts/peaks` to the Biome `includes` later. It is not needed for this commit.

3. **Low (a11y note, no change needed): `ArrangementLibraryPreview.tsx:369`.**
   - The `title` on the strip is only a mouse tooltip. The strip is `aria-disabled` and `tabIndex` -1, so keyboard and screen-reader users never reach it. The blocked state is still announced through `aria-disabled` and the Preview button's own title.
   - The title becomes the accessible description because the strip already has an `aria-label`, which is harmless.
   - Both titles read from the same `previewUnavailableTitle`, so they cannot drift apart.

## Checks that passed
- **Listener and timer leaks:** none added. The fetches reuse the 15a `controller.signal`, and the `.then` at `ArrangementContext.tsx:4558` rechecks `aborted` and `peaksDecided`, so a late response cannot overwrite decoded peaks.
- **Event ordering:** the peaks fetch races `loadSource`, and `peaksDecided.add` on the decode path wins. A late peaks response is then discarded, so the order is safe.
- **Body cancel:** `void response.body?.cancel().catch(() => undefined)` is null-safe and does not leak a rejection. A 404 or an HTML SPA fallback goes to `json()` and the `catch`, then falls back to the worker path.
- **Render cost:** the title is a string derived during render, with no new state, hook or memo.
- **Tailwind and tokens:** no CSS or class changes.
- **TS strict:** no `any`, no `@ts-ignore`, no assertions. The tests narrow with `unknown` and `getOwnPropertyDescriptor`. `Object.hasOwn` guards the map lookups.
- **Regressions:** `peaksUrl` returns `null` for the 7 synthetic sources, which keeps the worker path. `previewUrl`, `loadSource` and `canReloadSource` are unchanged.
- **Docs:** doc 264 follows the template. The doc-263 status edit is a one-line change.

## Architecture note
- **Signal 4 (new state/lifecycle in an existing owner), `ArrangementContext.tsx:4552-4563`.** This is context from the 15a wiring, not part of this diff. The precomputed-peaks fetch and `peaksDecided` bookkeeping sit inside the already very large collection-load effect.
  - **Keep for now.** The logic shares one `AbortController` and one source-settle lifecycle with `loadSource`. The public hook shape and audio timing are unchanged, and extracting it now would add prop plumbing.
  - **Proposal for the planner, after 15b-ii:** if purchased-adapter peaks add another branch to this block, create one bounded task. It would move the "peaks fetch plus decided/decoded reconcile" step into a `lib/arrangement` helper, for example `createPeaksReconciler(signal)`. Acceptance criteria: the existing PP and LPA tests stay green, and the ordering and abort cases get a focused test.
  - This is a diff-level review and not an audit of the whole module.