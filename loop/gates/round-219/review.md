COMMIT: OK (all four paths are new files. They touch no app runtime code, no auth, purchase or download code, and no UI. Verify passed: 201 files and 2920 tests, including `third-party-licenses.test.ts` with 51 tests, and the build succeeded.)

I didn't find `c-round-219.json` in `gates/round-219/`, so I relied on your statement that C passed and on `verify.log`.

## Code Review: third-party-licenses (OSS-LIC) — round 219

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium — the GPL check misses some old-style licence spellings.** `app/lib/third-party-licenses.ts:128`: the pattern `/^A?GPL(-|\+|$)/i` only flags `GPL-…`, `GPL+` and plain `GPL`. Values that people actually write in `package.json` (`GPLv3`, `GPLv2+`, `GPL3`, `AGPLv3`) all pass this test, so they are classed as **clean**. The guard would then let a real GPL dependency through without a warning. Today the lock has no such entry (TL4 shows 0 failures, and the only GPL value is `node-forge`, which passes by the OR rule), so this doesn't block the commit.
   - **Fix:** use `/^A?GPL(?:V?\d|[-+]|$)/i`. LGPL stays excluded because of the `^` anchor.
   - **Tests:** add TL1 rows `['GPLv3','copyleft']`, `['GPLv2+','copyleft']`, `['AGPLv3','copyleft']`, `['LGPLv3','clean']`.
2. **Low — a deleted notices file is quietly recreated outside CI.** `app/lib/__tests__/third-party-licenses.test.ts:335`: if a run doesn't set `CI=true` and `THIRD_PARTY_NOTICES.md` is missing, `toMatchFileSnapshot` writes a new file and the test passes. Doc 171 assumes the gate runs with `CI=true`; `verify.log` doesn't show whether it did.
   - **Fix:** add `expect(existsSync(NOTICES_PATH)).toBe(true)` before the snapshot check, or confirm that `npm run verify` sets `CI`.
3. **Low — the intro says "ships", but the list includes build tools.** `app/lib/third-party-licenses.ts:82`: the text says "software that this store ships", but the 563-row table includes build tools and type packages (`esbuild`, the `@rollup/*` binaries, `lightningcss-*`, `@types/*`), which are not in the bundle. The broad list is intentional (doc 171 explains why), but the wording overstates it.
   - **Fix:** "…lists every non-dev entry in `package-lock.json`, a superset of what the store ships…".
4. **Low — some tests are tied to exact versions.** TL4 (`test.ts:311-316`) expects `mediabunny@1.62.1`, `node-forge@1.3.3` and `limiter@1.1.5`. `mediabunny` is pinned in `package.json`, but `node-forge` and `limiter` are transitive, so a routine `npm update` turns TL4 red, not just TL5. The drift rule in doc 171 (line 21) only names TL5.
   - **Fix:** add TL4 to the drift rule, or find these packages by name only, without the version.
5. **Nit:** `renderLicenseCell` (`:459-463`) searches the exception list twice. A single `findMatchingLicenseException` call guarded by `lockEntryKind === null && license === null` is enough.
6. **Legal (no code change):** the question in doc 171 is still open: is this notice enough under LGPL when the LAME WASM is bundled into an app chunk? It is correctly left to Saba, and nothing in the notices claims an answer.

### Out-of-scope checks
- **Real-browser event order, listener/timer leaks, render cost, accessibility, Tailwind/tokens:** not applicable. The module isn't imported anywhere except its test (checked with grep), so it doesn't reach the client or server bundle.
- **TS strict:** no `any`, no `as`, no `@ts-ignore`; `unknown` values are narrowed with type guards and `Reflect.get`. Semicolons are present.
- **Security:** no secrets and no HTML output. The `@ffmpeg/core@0.12.6` / unpkg statement in the notices matches `app/utils/ffmpeg.ts:38`. It is text only, and the purchased-Studio code is untouched.

### Good Practices Found
- The licence parser handles AND/OR/WITH and brackets, and treats malformed input as `unknown` instead of letting it pass.
- LGPL is deliberately excluded from the GPL check, and a TL1 row covers it.
- An exception matches only the exact name and version. It goes stale if that version disappears or gains its own licence field, and it can never hide a GPL licence (TL3).
- Each `inBundle`/`link` entry is checked on its own, so a duplicate that has a licence can't hide a copy that doesn't (TL2).
- The output is deterministic: sorted by code point and with no timestamps (TL7). The snapshot assertion is awaited.

### Architecture note
- None. This is a new, self-contained pure module that only its test uses. It moves no ownership or coupling and adds no state, effects, listeners or lifecycle to an existing owner.

### Alternative Approach
- Not critical logic (not auth, checkout or the Studio audio pipeline), so this section doesn't apply. Doc 171 already explains why `license-checker` and reading `node_modules` were rejected.

### Score: 9/10