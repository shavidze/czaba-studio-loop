COMMIT: OK. The worker's in-place clamp can't change data the main thread still uses, and nothing here touches auth, purchase or download code. This is a review of the diff only, not a full audit of the module.

## Code Review: round-91 (export notes + in-place WAV encoding in the worker)

### Critical Issues
- None.

### What I checked that unit tests can't show
- **Can the in-place clamp leak back to the main thread? No.** The only real caller is `graph.client.ts:511-513`. It makes a fresh `.slice()` copy of each channel and hands those copies to the worker (`export-wav.client.ts:67-70`). After the hand-off the main thread's copies are emptied and are never read again. Each `.slice()` makes an ordinary `ArrayBuffer`, so every copy is handed off rather than shared. The shared-memory case therefore can't happen today, and `docs/.../079` writes that limit down.
- **Fallback when there is no Worker is unchanged.** `export-wav.client.ts:20` still uses the original `encodeArrangementWav`, which leaves its input alone. EW1 and IP5 protect that.
- **The overload warning still sees the real peak.** `measureExportOverload` runs before the clamp (`export-wav.ts:65`). IP1 asserts peak 1.5, so the overload warning still works.
- **Worker lifecycle is the same.** There are no new listeners or timers. `terminate()` still runs on complete, fail and abort. Progress messages, the final message and the error path in `export-wav.worker.ts` are only reformatted.
- **Old test still proves what it did.** EW7's second worker call (`export-wav.test.ts:233-236`) sends empty channels for the error path. It doesn't reuse the clamped `raw`, so EW7 is still a valid check.
- **Auth/purchase/download: none touched.** The `ArrangementContext.tsx` change is one string at about line 2856, and the dialog change is one constant. Timer, guard, reset and state order are as before.
- **No stale copies of the old text.** I searched the code outside `docs` and `node_modules` for the old timeout and note strings and found none.
- **TS strict:** no `any`, no type assertions, no suppressions. The new function takes a mutable `Float32Array[]` on purpose; the old one keeps its `readonly`.
- **Tailwind/tokens and render cost:** no class or element changes, so render cost is the same.
- **Verify:** 135/135 test files passed, `tsc` was clean, and the build passed. The lint warnings are all old and in files this diff doesn't touch.

### Suggestions (ranked, none blocking)
1. **Low, accessibility: `ArrangementExportDialog.tsx:317`.** The note `<span>` sits inside the `<label>`. Screen readers announce label + note as the WAV + MP3 radio's name, and this round adds a whole sentence to it (`export-range-ui.test.tsx:455` checks exactly that joined text). The pattern was already there. Fix in a separate round: give the note span an `id` and point to it with `aria-describedby` on the input, then update the name check in that test.
2. **Low, docs: `docs/implementation/2026/quarter-IV/079-...md:4`.** The status line still says "waiting for C". After C PASS and the commit, it needs the same one-line update that this diff gives 078.
3. **Low, maintainability: `export-wav.ts:60-73`.** Only the parameter type marks the "caller owns the arrays and won't read them again" rule. If a second caller ever appears, give the function a name that states the rule, or add a test at the call site that the arrays were handed off. Comments are discouraged here, so I'd use a test rather than JSDoc. Nothing to do now.

### Good Practices Found
- A separate function instead of changing the shared one, so the fallback's guarantee not to modify its input is kept, and the rejected alternative is written down.
- The new tests compare against an independent oracle, check that the exact same arrays are reused (IP2), and run the real worker module (IP4). Mutation testing (a–f) is reported in the A report.
- The new note text is honest: "both or neither" is promised for creating the files, and it now says the browser may ask permission before downloading the second file.

### Architecture note
- **Signal 3 (one region changed repeatedly at high cost):** the export area of `ArrangementContext.tsx` (around lines 2795–2860, `exportMp3` and the WAV + MP3 path) was changed in rounds 87, 90 and 91. Each time, even a text change meant updating constants in three UI test files.
- **Keep for now:** this round's change is one string, and the code is tightly tied to the export state and abort lifecycle.
- **Proposal:** use the one already in doc 079's TODO list, a frontend-architect checkpoint (q14) on extracting a `useArrangementExport` hook. A side fix to consider in that checkpoint: export the user-facing message constants from one module so tests import them instead of copying them. This is not a task for this round.

### Alternative Approach (export memory)
- **Current:** the worker clamps the channels it was handed in place, which saves one float copy of the audio (about 234 MB on a 10M arrangement).
- **Alternative:** convert to 24-bit with clamping inside the encoder, sample by sample, with no clamped copy at all. That would also cover the fallback path.
- **Verdict:** the current approach is the right one for this round. It changes nothing in the shared `encodeSfxWav` or `sfx-edit`, and it meets the memory target as long as C's MEM-WAV10 browser memory check passed. Doing it inside the encoder is only worth it if the fallback path's memory becomes a problem.

### Score: 9/10