COMMIT: OK

## Code Review: round 223, PERF-HARNESS-SHARED-LIB (`perf/lib/page.ts`, `perf/lib/report.ts`, 3 perf specs, `budgets.json` note, docs 163/168/169/175)

**Scope:** The change is a test-harness refactor. Nothing under `app/**` changed, so there's no runtime effect on the store and no render, accessibility, Tailwind or token surface. **Auth, purchase and download code is untouched.** The only `download` in the diff is Playwright's handle for the test WAV export (`perf/studio-lab-resources.perf.spec.ts:414-437`). It isn't product-download code.

**What I checked:** I read the diff, the two new lib files and doc 175. The verify log shows 203 test files passed and the build is green. The root `tsconfig.json` includes `**/*.ts`, so `npm run typecheck` does cover `perf/`.

**What I didn't check:**
- `npm run verify` doesn't run the perf specs. For the Chromium run and the comparison against the earlier baseline results, I'm relying on C's PASS and doc 175 §ტესტირება. I did not re-run them.
- `c-round-223.json` isn't in the gates folder, so I didn't read it.
- Biome doesn't lint `perf/`, so the formatting of the two new files wasn't checked by a tool.

### Critical Issues
- none

### Suggestions (ranked)
1. **Low — the "byte-identical report" claim is narrower than it sounds** (`perf/studio-lab-resources.perf.spec.ts:441-450`).
   - The equivalence check proves identical `failures`/`rows` when the passes are identical.
   - But the new `finally` can now add a problem HEAD never produced (`the "WAV created" observer was not released`). It fires when `page.evaluate` fails: a closed page, or a pass that crashed.
   - Normal runs never hit it: the handle survives the observer's own `disconnect()`, so `released === true`.
   - **Fix:** none needed in code. In doc 175, limit the claim to "identical for identical passes; error paths may add one extra problem".
2. **Low — the observer can leak if setup fails before the `try`** (`perf/studio-lab-resources.perf.spec.ts:291-327`).
   - The observer is attached at :291, but the `try`/`finally` only starts at :327.
   - If the `timeOrigin` evaluate at :302 throws, the observer stays attached with nothing to release it.
   - Each pass gets a new browser context, so the leak can't outlive one pass. GATE217-S1 still holds for the normal and no-text paths.
   - **Fix (stage b):** move the observer install and `timeOrigin` inside the outer `try`, or open the `try` right after :301.
3. **Low — doc line reference is now stale** (doc 168, §შეცვლილი ფაილები, "163…: l.67").
   - Doc 175 already records this as DOC-PERF-LINEREF-DRIFT-223. Nothing to do this round.
4. **Info — two places now hold the `.Nx` suffix logic.**
   - `rateSuffix` is exported from `perf/lib/report.ts:45`, while 1a keeps its own `faderRowId` that builds the suffix inline (`perf/studio-lab.perf.spec.ts:~188`).
   - That's intentional per doc 175 (fader rows follow a different rule), but these two can drift.
   - **Fix:** none now. When stage b adds `report.test.ts`, give it one case that pins `rowRate` parsing against `rateRowId` output.
5. **Info — `quotedAttributeValue` rejects some ids instead of escaping them** (`perf/studio-lab-interactions.perf.spec.ts:~107-112`).
   - Throwing on `"`, `\`, `\n`, `\r`, `\f` is correct and fails loudly, which is better than escaping silently.
   - The fixture ids are unaffected.

### Good Practices Found
- **Faithful port.** I compared each removed block against `perf/lib/report.ts`. The differences between specs became explicit options that match HEAD:
  - `determinismRequiresKind`: false for 1a, true for 1b-i and 1b-ii.
  - `assertWhenPartial`: only 1b-ii used `complete || values.length > 0`.
  - `crossRateMetrics`: 1a only.
  - `guardProblems`: 1b-ii only, placed first.
- **Order is preserved.** `failures` keeps HEAD's order, including putting the shortByAbort message before the 1×/6× comparison. Each spec keeps its own report envelope, so JSON key order is unchanged.
- **Page-side code is safe.** In `perf/lib/page.ts`, module constants (`quietMs`, `settleCapMs`) are still passed into `page.evaluate` as arguments rather than closed over (R1). The number of `evaluate` calls inside measurement windows is unchanged (R2).
- **Strict TS holds.**
  - There's no `any`, `as` or `@ts-ignore`.
  - `PerfReportPass` is a minimal structural interface with `ReadonlyMap` and `readonly string[]`, and all three pass-result types satisfy it without casts.
  - Leftover imports still have users: `Locator`, `expect`, `PerfWindowSnapshot`, `median`, `percentile`.
- **Timer and listener cleanup (GATE217-S2).** `pathTimer` is cleared in `.finally`, so the 30 s timer can no longer keep Node alive or reject after the race settles. The observer release in `finally` also runs when "WAV created" never appears.
- **`storeRoot` stays in each spec.** That avoids a silent `budgetsFile` path change: the same expression inside `perf/lib` would resolve to `perf/`. Good catch in doc 175.
- **A correct revert.** The GATE214-S2 change failed on real data (the clip sits on the Music lane), so it was rolled back and handed to B rather than forced through.

### Architecture note
- **Keep:** `perf/lib/page.ts` and `perf/lib/report.ts`. This extraction resolves the PERF-HARNESS-SHARED-LIB signal (signal 2/3: the same region was being copied and edited in three specs). No new signal on the spec side.
- **Watch, proposal only, for the planner:** `perf/lib/report.ts:33-43` describes the per-spec differences with two boolean flags plus two optional fields. With three consumers, that's cheaper than strategy objects. If a fourth spec or stage b's `tolerancePct` adds another flag, consider grouping them into one per-harness policy record.
  - **The task:** add `perf/lib/report.test.ts` with a vitest include. Cover each option with a case that fails when it's toggled (mutants M-A, M-B, M-C from doc 175).
  - This task is already listed in PERF-HARNESS-SHARED-LIB-b, so nothing new for the backlog. It isn't a finding for this round.

### Alternative Approach
- Not applicable: this isn't auth, checkout or the audio pipeline.
- **Current:** a shared core that returns `{ complete, failures, rows }`, with each spec keeping its own envelope.
- **Alternative:** a shared builder for the whole report, which would change JSON key order.
- **Verdict:** keep the current approach. The goal was proof that nothing changed, and only this approach keeps the existing baseline results directly comparable.

### Score: 9/10