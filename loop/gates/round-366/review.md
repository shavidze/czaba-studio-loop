COMMIT: OK

The commit adds only a perf spec, its budgets JSON and an implementation doc. It touches nothing under `app/`, so there is no auth, purchase or download code in it. I found no blocker. Browser behaviour was not run; this is from reading the diff, the spec and the budgets file.

## Code Review: perf/studio-lab-stem-cache.perf.spec.ts, perf/budgets.stem-cache.json, docs/.../236-perf-stem-cache-v2.md

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium-low: `studio-lab-stem-cache.perf.spec.ts:23`.**
   - `stemCacheStoreName = 'entries'` copies `STORE_NAME`, which is a private constant at `stem-cache.client.ts:13`. The doc says the DB name is imported from `app/`, but the store name is not.
   - If the store is renamed, `countStemEntries` returns 0, `entries-stored` fails after the 30 s poll, and `blocked.entries` fails. It fails loudly and slowly, with a misleading cause.
   - Fix: export `STEM_CACHE_STORE_NAME` from the pure `stem-cache.ts`, or add a one-line comment tying the two constants. The export is a later `app/` change, so it is out of scope for this commit.
2. **Low: `spec:285-290`.**
   - If the blocked open throws, the page may be left mid-navigation. The code then runs `countStemEntries(page)` and `setBlockedURLs([])`, and a failure there is caught by the outer catch and recorded as "aborted at blocked".
   - The blocked open is the last step and the context closes right after, so no leak results.
   - A failed run still reports honestly, because `blocked.ready` = 0 trips the assert.
3. **Low: `spec:128-131`.**
   - The IndexedDB poll runs every 100 ms for up to 30 s, with an `indexedDB.open` per tick that always closes. There is no leak, and the cost is confined to test time.
4. **Low: `spec:218-223`, `spec:233-236`, `spec:301`.**
   - The init scripts, the CDP session and the `trackMp3Bytes` listeners are bound to the context.
   - `context.close()` runs in `finally`, so I found no listener or timer leak.
5. **Low, robustness: `spec:138-142`, `spec:144-148`.**
   - `requestWillBeSent` registers an ID only for `.mp3` URLs, and `types` is never pruned. It holds a few entries per pass, so memory is fine.
   - A `dataReceived` event can arrive after `takeMp3Bytes()` and be counted in the next open. The doc states this as intended (navigation to navigation).
6. **Doc nit.** The doc says "5 გახსნა თითო pass-ში". The spec comment lists a–e, which is 5 opens, so this matches.

### Good Practices Found
- **Event ordering:**
  - Each open waits for both stem fetch entries in Resource Timing (`waitForStemFetches`) before it reads them.
  - `entries-stored` is polled before the warm step starts.
  - `Network.clearBrowserCache` is called before `takeMp3Bytes()`, so cold-open stragglers are not attributed to the warm open.
- **Assert design:**
  - The `cold-body-live` liveness row stops `warm.body-bytes == 0` from passing with an empty counter.
  - The blocked step pairs `ready` with `entries`.
  - Wallclock-flaky byte rows are `record`, so the exact-match rule is not applied to them.
- **Resource Timing and report:**
  - The buffer is raised to 2000.
  - A partial run is persisted after every pass.
  - The `assertWhenPartial` option exists in `perf/lib/report.ts:176`.
- **TS strict:** The new spec has no `any`, `@ts-ignore` or type assertions. The one `instanceof` type guard is allowed.
- **Tailwind, tokens, a11y, render cost:** No UI changes, so these do not apply.
- **Environment:** `playwright.perf.config.ts` is unchanged. It matches `*.perf.spec.ts` and builds and serves via remix-serve. `STEM_CACHE_DB_NAME` comes from `stem-cache.ts`, a pure module with no imports, so loading it in the Node spec is safe.
- **Honest scope:**
  - The doc says the harness measures remix-serve, not Vercel.
  - It lists the open question about Vercel's static headers and the two differences from the plan.

### Architecture note
- **Signal:** `perf/studio-lab-stem-cache.perf.spec.ts:96-123` and `:135-156` → **keep.** They are small helpers (an IndexedDB count and a CDP byte tracker) with a single lifecycle, and the existing spec files share `perf/lib`. Extracting them into `perf/lib` would be speculative with one consumer.
- **Signal (risk, proposal only):** `spec:23` duplicates the private store name from `stem-cache.client.ts:13`. I suggest a small planner task for PERF-9b-ii: export the store-name constant from `stem-cache.ts` and import it in the spec. It is low cost. The invariant it protects is the `czaba-stem-cache-v2` schema, which has a test, SC-constants.
- The budgets file repeats near-identical note text across the cold, warm, warm-http and warm-nocache scenarios. If a fifth scenario appears, I'd generate the rows from a template. Not needed now.
- This is a diff review only. I did not audit the whole module.

### Alternative Approach
- **Current:** a separate perf spec drives the real production build under CDP throttle. It uses 3 passes, each in its own context, and asserts on Resource Timing plus an IndexedDB count.
- **Alternative:** read `transferSize` and status from CDP `Network.responseReceived` and `loadingFinished` only, and skip Resource Timing.
- **Verdict:** keep the current approach. Resource Timing works per-initiator (fetch vs audio), which separates the stem cache's fetches from the `<audio preload>` requests, and CDP is already used for the bytes records. CDP-only would mix the two initiators and make the 304-vs-200 asserts less direct.

### Score: 8.5/10