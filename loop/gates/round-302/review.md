COMMIT: OK. The change only renames the product and edits copy. It doesn't change any purchase logic, auth or downloads, or any audio, timer or listener code.

## Code Review: round-302, rename to "CZABA Studio" (stage a)

### Critical Issues
- None.

### Findings, most important first
1. **A purchase route file is touched, but only its text.** At `app/routes/checkout.success.tsx:106`, one string in the fixed `STEPS` list now reads `'Access CZABA Studio anytime'`. No loader, action, API call, token, order lookup, download link or export changed. The architecture rule ("auth, access to purchased material and protected files don't change") is about behaviour, and behaviour is unchanged. You wrote "must be none" about purchase code. If you meant "no edits to purchase files at all", this one edit is a reason to block. Fix if you want it: take this one-line edit out of the commit and do it in a separate approved change.
2. **The new repo-wide name check is fragile.** In `app/lib/__tests__/studio-naming.test.tsx:10,55`, test NM1 reads every `.ts`/`.tsx` file in `app/`, comments included, and fails on any line containing "Studio Lab". The open question about the `/studio-lab` URL (SABA-Q-NAME-LAB-URL-FILE) will probably lead someone to write a `TODO` mentioning that name, and the unit tests will then fail. Fix: let lines containing `TODO`/`SABA-Q` through, or move the scan into the `agents:check`/lint step. Low severity.
3. **One old name is still expected in a browser test.** `e2e/store-page.spec.ts:102` still expects the badge `'Personal Studio Included'`. That text no longer appears anywhere in `app/`, so this is an outdated test, not a leftover on the site, and it's already in the backlog (B-R301-E2E-STALE-PERSONAL-STUDIO). Fix in stage b: update that test and add `Personal Studio` to `RETIRED_NAMES` so the check also catches that variant.
4. **The tab title doesn't follow the site's usual pattern.** Almost every other page title ends in `| CZABA` (for example `scenes.$productId.tsx:13`, `faq.tsx:9`). `studio-lab.tsx:17` uses `CZABA Studio — Demo collection` instead. The implementation doc records this as a deliberate product-designer decision, so I'm noting it only so you know it was a conscious choice. No change needed.
5. **The errors in the verify log were already there.** The messages at `verify.log:1243–1276` ("must be used within an ArrangementProvider") come from existing tests that check what happens outside the provider. This diff didn't cause them: 231 test files and 3439 tests pass.

### Suggestions
- `StudioWorkspace.tsx:2767,2772` calls `workspaceCollectionCopy(collection.origin)` twice per render. It's cheap and was like this before, so it isn't a finding. If that area is edited again, store the result in one local variable.

### Good Practices Found
- The `<h1>` text has a single source, `workspaceCollectionCopy(origin).heading`. The `headingSuffix` key was fully removed: from the strings, the key-list test, and the component.
- Demo and purchased collections now share the same heading, but they can still be told apart by the badge. Tests PW1/PW6 check that the headings are equal and the badges differ.
- The `/studio-lab` route only ever uses `studioLabDemoCollection`, so "Demo collection" in the tab title is accurate.
- Browser checks: nothing in `e2e/` mentions the old heading or title, so no browser test breaks. The `<h1>`'s screen-reader name gets shorter and stays meaningful.
- Code quality: no new `any`, type casts or suppression comments. No Tailwind or design-token changes beyond removing one muted span. No new effects, timers or listeners. The new test cleans up its stubs in `afterEach` and resets `MotionGlobalConfig` in `afterAll`.
- The implementation doc says clearly what was left unchanged on purpose (the URL, the export file name, the testimonial quote) and why.

### Architecture note
- None. The diff only changes text: no state, lifecycle or ownership moves between parts of the code. The new repo-wide scan test isn't one of the four warning signs.

### Alternative Approach
- Not applicable: this change doesn't touch auth, checkout or the audio pipeline.

### Score: 8/10