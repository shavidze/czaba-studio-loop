COMMIT: OK. One judgment call is for root: the diff deletes `app/lib/email.server.ts`, which is purchase and download code. Details are in finding 1.

I read the diff and grepped the repo. I did not run the tests or the build. I'm relying on C's PASS and `verify.log` for those.

## Findings (ranked)

1. **Medium (policy flag, not a defect): `app/lib/email.server.ts` deletion (-183 lines).**
   - The file built the order-paid email, including download links via `getDownloadUrl` from `r2-tokens.server`.
   - A strict reading of "no touch of purchase/download code" would block this.
   - A repo-wide grep finds no remaining importer of `email.server` or `sendOrderPaidEmail`. The only matches are `hire-us-inquiry-email.server`, which is a different module.
   - The live download path is untouched. `r2-tokens.server.ts` is unchanged and is still used by `api.download.ts`, `api.studio-token.ts`, `api.recording-stream.ts` and `api.recording-original.ts`, and `r2-tokens.server.test.ts` still imports `getDownloadUrl`.
   - The doc says the production bundle is identical to HEAD. I did not check that myself.
   - The routes that use `BREVO_API_KEY` (`hire-us`, `free-downloads`, `_index`, `api.subscribe`) don't use this file.
   - The doc records that `docs/technical/future/stripe-migration-guide.md` still mentions the file (TL-R462-L3).
   - Fix: none needed for the code. Root should confirm the deletion is acceptable under the no-purchase-code rule. If it is, the stripe-migration-guide reference should be updated in a follow-up so a future migration doesn't look for a file that no longer exists.

2. **Low: `app/lib/__tests__/store-gradient-text.test.ts:63`.**
   - `DELETED_STORE_MODULES` lists `sendOrderEmail`, but the deleted export was `sendOrderPaidEmail`.
   - GT6's barrel regex looks for the wrong name for that entry, so a re-export of `sendOrderPaidEmail` would not be caught.
   - The file check on the same line still works, because it uses the path `lib/email.server.ts`.
   - Barrels never exported it in practice, so the risk is small.
   - Fix: rename the key to `sendOrderPaidEmail`.

3. **Low: `store-gradient-text.test.ts:1231-1247` (GT6).**
   - It has no positive fixture for the regex (TL-R462-L2), and the barrel count is hard-coded to `toBe(5)`.
   - This is brittle but safe, since adding a barrel fails loudly.
   - Fix: add one positive and one negative string case for the regex.

4. **Low: dead CSS remains in `app/styles/app.css`.**
   - `.video-player-slider`, `.video-volume-slider`, `.piano-loading-overlay`, `.piano-keys-container`, `.piano-key`, `.piano-loading-text` and `.loading-brand` are still there, at about lines 2865–3100.
   - They have no consumers now.
   - They are planned for 2b-3d-2 and cost only bytes.

## What I checked
- **Event ordering and listener/timer leaks:** the deleted `Timeline` (window listeners with changing handler deps), the `CinemaCurtainLoader` and `PianoCurtainLoader` timers, and `VideoShowcase` were all unmounted. Removing them only removes risk, and nothing live is changed.
- **Regressions:**
  - No remaining imports of any deleted module.
  - The `studio.$productId.tsx` and `TransportBar` "Timeline" matches are comments, not imports.
  - The 4 barrels lose exactly the 8 export lines the doc counts. The barrel files only ever re-exported the deleted modules.
- **Render cost, accessibility, Tailwind/tokens, TS strict:**
  - Nothing new ships, and no runtime code is added.
  - The deleted code had a hardcoded `#ff3333`, inline styles, `as React.CSSProperties`, unlabeled icon buttons, and `[whiteKeys.map]` as a hook dependency. All of that is gone.
  - The test changes use no `any`, no suppression directives and no type assertions.
- **Auth/purchase/download:** no live code is touched, apart from the dead `email.server.ts` in finding 1.
- **Implementation doc:** present at `docs/implementation/2026/quarter-IV/301-store-2b-3d-1-dead-store-modules.md`. Its section structure follows the template as far as I can tell. I didn't open the template.

## Architecture note
- **Signal:** `store-gradient-text.test.ts`, GT5b and GT6.
  - It now holds the import-matcher fixtures, the deleted-module list and the barrel-guard logic in one style-scan test file. That is mixed responsibilities.
  - Keep it for now. The cost is low, the file is cohesive around the "dead module" concept, and the mutants cover it.
- **Proposal for the planner (one bounded task, not part of this round):**
  - Move `DELETED_STORE_MODULES` and GT6 into a small shared helper or test, `dead-module-guard.test.ts`.
  - Acceptance: GT5b and GT6 behave identically, and mutants M1, M2 and M7 still fail the suite.
  - Do this only if a third scan test needs the same list.
- This is a review of the diff, not an audit of the whole module.

### Score: 8/10