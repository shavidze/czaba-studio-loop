COMMIT: OK (nothing blocks. This round only touches English default names; there are no runtime changes outside the names, no auth/purchase/download code, and no persistence that would need a migration.)

## Code Review: round-141 (V-0.4d default names)

**What I checked:**
- **Scope:** `paths.txt` has string sources (`strings.ts`, `groups.ts`), the context fallback, the `studio-lab` route, tests and docs. `collection.ts` and `purchased-collection-ui` came up in my searches but are not in the diff. **Auth, purchase and download code: none touched.**
- **No migration needed:** there is no `localStorage`, `sessionStorage` or `indexedDB` in `ArrangementContext.tsx`, `lib/arrangement/*.ts` or `components/arrangement/**`. Doc 117's claim is correct, so old `ჯგუფი N` names never reach a user.
- **No import cycle:** `strings.ts` imports nothing. `groups.ts:2` already imported `studioTrackGroupStrings`; only the source of the value changed (`groups.ts:4`).
- **Name-based lookups:** no code outside tests looks a track up by its old Georgian name (`ვიდეო`, `მუსიკა`, `სტემები`). `e2e/` has no references at all. The other test files build their own Georgian fixtures and don't depend on the route.
- **verify.log:** 166 test files / 2481 tests passed; both builds are green.
- **Not affected:** no listeners, timers, effects, render cost or Tailwind tokens change. TS strict holds: no `any`, no assertions, no suppressions.

### Critical Issues
- none

### Suggestions (ranked)
1. **The ST39 count check got weaker.** `app/lib/arrangement/__tests__/strings.test.ts:~2062-2074` replaced `expect(outputs.length).toBe(17)` with `toBeGreaterThanOrEqual(formatterCount)`. Nothing in `gh`, `mt` or envelope changed this round, so the exact pin of 17 should still hold. A `>=` check can't catch a dropped formatter sample. **Fix:** restore `toBe(17)`, or compute the exact total from `GROUP_HEADER_FORMATTER_SAMPLES`, `METER_FORMATTER_SAMPLES` and `V04C_ENVELOPE_FORMATTER_OUTPUTS` and assert equality.
2. **SSR warnings are silenced.** `app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx:30` mocks `console.error` but never checks it. A node-env `renderToString` is one of the few places that can catch SSR problems (`useLayoutEffect` on the server, invalid DOM nesting, key warnings), and this test hides them. **Fix:** add `expect(consoleErrorSpy).not.toHaveBeenCalled()` at the end of DS1/DS2, or check against an explicit allowlist.
3. **The route title is pinned exactly.** ST40 at `strings.test.ts:~2109` fixes the whole meta title line (`'Studio Lab — დემო სამუშაო სივრცე | CZABA'`). That's intentional, but V-0.5 will break it with any change to the title. **Fix:** the V-0.5 task should update this pin explicitly, so nothing needs to change now.
4. **Mixed language in the library panel (accepted for now).** The lanes are `Music`/`Stems`, but `app/lib/arrangement/library.ts:8,14,15` still labels sources `მუსიკა`/`სტემები`. `ArrangementVideoDock.tsx:203` also falls back to `'ვიდეო'`. Doc 117 puts this in V-0.5, so it's not a finding for this round, but C should expect it in the browser.
5. **Doc 117 status is stale.** `docs/implementation/2026/quarter-IV/117-studio-v0-default-names.md:4` still says "C round 141 ჯერ არ გაშვებულა" (not run yet), but `c-round-141.json` is PASS. Round 116 was closed the same way one round later, so update it in the next round.

### Good Practices Found
- `TRACK_GROUP_NAME_PREFIX` keeps its name and export, and now takes its value from `studioTrackGroupStrings.defaultNamePrefix`. Callers didn't change, and `nextTrackGroupName` (`groups.ts:313-316`) keeps its numbering rule.
- ST22 got stricter: `groups.ts` must now contain no Georgian characters at all, where before one line was exempt.
- DS1/DS2 check the real route on the server and confirm the English names in the track buttons' `aria-label`s.
- DS2 builds the Georgian regex with `String.fromCodePoint`, so a later search for leftover `ჯგუფი` stays clean.
- The 191-line test rename was purely mechanical, and the number of tests per file is unchanged.

### Architecture note
- Signal: placement of default-name seeds is inconsistent, at `strings.ts:401` and `groups.ts:4` versus `studio-lab.tsx:13-16` and `ArrangementContext.tsx:546-550`. The group prefix moved into the strings module, while the lane defaults stayed as data literals, on the argument that they are data rather than UI copy. Both are user-renamable seeds, so the rule isn't applied the same way.
  - **Keep for now:** it causes no harm, moving either one is cheap, and none of the timing, refs, gesture, Undo/Redo, `useArrangement()` shape or test invariants are touched.
  - **Proposal for the planner:** add the question "where do default-name seeds live (strings vs data)" to the open `strings.ts` split checkpoint (`b-round-136-checkpoint-request.md`) instead of opening a separate task. This is a proposal, not approved scope. I only reviewed this diff, not the full module.

### Alternative Approach
- Not critical logic (no auth, checkout or audio pipeline), so no comparison is needed.

### Score: 8/10
A clean, well-tested mechanical change. Loosening the ST39 count is the one weakening that wasn't needed.