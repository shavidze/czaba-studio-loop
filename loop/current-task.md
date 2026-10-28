# CURRENT TASK — Round 219: OSS-LIC — third-party notices + a GPL/AGPL licence test for runtime dependencies

Decisions:
- **D-29z223:** round 218 closed. C PASS (14 rows), `browserVerified` and `realVerified` true. Gate 218 published `da5ad69` (PERF-16a). **PERF-16a is done.** PERF-16b remains.
- **D-29z224:** C-R218-01 is closed by ruling, not deferred. The `/studio/:productId` guard script baseline becomes **41/0**. The next PERF-RUN compares against `c-round-218/perf-run-1.json`. Cause (C's proof): the `@ffmpeg/ffmpeg` class chunk is now inlined into the guard's own chunks. That is not an eager load. PERF-16b will move this number again.
- **D-29z225:** the OSS-LIC rulings, in §1.
- **D-29z226:** the notices drift rule, in §1.9. From now on, every round that files a `root-deps-request.json`, or that follows a lock-only change, grants `THIRD_PARTY_NOTICES.md` and regenerates it. Correction to `oss-adoption.md` l.40: the doc says "the LAME wasm ships as its own file". It does not. The LAME wasm is inlined as base64 in the package's JS. B records this here; B does not own that doc.

Planned by B on 2026-10-28. Dispatcher: B. Implementer: A. Verifier: C. Consulted before dispatch: `tech-lead` (read-only, all of its points adopted; summary in `b-round-218.md` §4) and the advisor.

**Read first:**
- `lessons.md`. L5, L10, L11, L12, L13, L23, L26, L28, L30, L31, L32 and L33 apply.
- `/home/runner/czaba-project/docs/technical/performance/oss-adoption.md` l.39–41 (OSS-LIC) and l.57–59 ("Never copy code from").
- Project primitives:
  - `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `SECURITY_AUDIT.md`;
  - `.claude/prompts/new-test.md`;
  - `.claude/prompts/new-service.md` (for the pure module's shape only).
- **L23 collision check, done by B.** The new module carries the literals `mediabunny`, `@mediabunny/mp3-encoder`, `unpkg.com`, `@ffmpeg/core@0.12.6`, `GPL`, `LAME` and GitHub URLs.
  - B grepped `app/**/__tests__` (regex `mediabunny|unpkg|ffmpeg|GPL|LAME|THIRD_PARTY|third-party`, plus every `readdirSync` repo scanner). The hits:
    - `mp3-encoder.test.ts` (ME9 scans import statements only, plus the encoder module's own text);
    - `strings.test.ts`, `export-dialog-a11y-copy.test.tsx`, `export-progress-ui.test.tsx`;
    - the scanners `store-focus-ring`, `store-theme-tokens`, `studio-focus-ring`, `timeline-cursor-map`, `panel-radius-ui` and `studio-theme-obsidian`.
  - B then put a draft `app/lib/third-party-licenses.ts`, holding all those literals, on a scratch copy of `da5ad69` and ran the 10 files: **166/166 pass** (`b-round-218/l23-scratch-run.txt`). No grant is needed.
  - **Class ruling R:** the header text must not contain the sequence `import '…mediabunny…'` or `from '…mediabunny…'`. It never uses `import`/`from` before a quoted package name. If A's final file makes any of those 10 files red, that is a STOP.
- The pattern to copy: the repo-scan test ME9 in `app/lib/arrangement/__tests__/mp3-encoder.test.ts`. It reads files with `node:fs` under the jsdom environment (l.1–3, l.471–482).

## Baseline
- **Expected HEAD:** `da5ad69a1b771f5f83a043af6cc2e4e058d3355b` (gate 218, `feat(studio): verified loop rounds 218-218`). No deps commit is expected this round. B filed no `root-deps-request.json`.
- **Working tree at planning:** clean. `b-round-218/git-status-at-planning.txt` is empty.
- **Frozen: every tracked file.** That is 1,066 files in `b-round-218-r219-tree-sha256.txt`, `package.json` and `package-lock.json` included.
  - From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-218-r219-tree-sha256.txt`. B checked it: rc 0.
- **Grants:** none on existing files.
- **New files (4):** listed in `b-round-218-r219-new-files.txt`:
  1. `THIRD_PARTY_NOTICES.md` (repo root);
  2. `app/lib/third-party-licenses.ts`;
  3. `app/lib/__tests__/third-party-licenses.test.ts`;
  4. `docs/implementation/2026/quarter-IV/171-oss-lic-third-party-notices.md` (B checked: 171 is free, 170 is the last).
- **Protected as always:**
  - the auth and purchase files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`;
  - `.claude/**`, `CLAUDE.md`, `package*.json`, `vite.config.ts`, `vitest.config.ts`, `biome.json` and every other config file;
  - `perf/**` and `e2e/**`.
- **Not allowed:**
  - installing, updating or removing packages (`npm install`, `npm update` and so on);
  - running `npm audit fix`;
  - fetching licence data from the network into any file. The source of truth is `package-lock.json` only. `node_modules` may be read to confirm a fact, but the module and the test never read it.

## 0. Why this round
- **The outcome table was fixed in advance** in `tasks/round-218.md` §6: "PASS, and planning before 2026-10-30 → Round 219 = OSS-LIC, then 16b". C passed round 218, and B is planning on 2026-10-28.
- **The spec** is `oss-adoption.md` l.39–41, approved by Saba:
  - a `THIRD_PARTY_NOTICES.md` with package, version, licence and link for every runtime dependency, plus the LAME note;
  - a unit test that reads `package-lock.json` and fails on a runtime dependency whose licence is GPL-* or AGPL-*, with devDependencies excluded and an explicit allow-list for exceptions.
- **Facts B measured on `da5ad69` (2026-10-28):**
  - `lockfileVersion` 3. There are 588 lock entries without `dev: true`, which is **563 unique name@version** pairs.
  - Licences of those entries: MIT 354, Apache-2.0 175, BSD-3-Clause 18, ISC 18, MPL-2.0 14, Unlicense 2, and one each of `(Apache-2.0 AND MIT)`, `(Unlicense OR Apache-2.0)`, `(MIT AND Zlib)`, 0BSD, BSD-2-Clause and **`(BSD-3-Clause OR GPL-2.0)`**.
    - The last one is `node-forge@1.3.3`, via `firebase-admin`.
    - The MPL-2.0 entries are `mediabunny`, `@mediabunny/mp3-encoder`, `lightningcss` and its 11 optional platform binaries (via `@tailwindcss/vite` in `dependencies`).
  - **`limiter@1.1.5` has no `license` field** in the lock. Its path is `firebase-admin > jwks-rsa > limiter` (`npm ls limiter`). Its own `package.json` uses the legacy `"licenses": [{"type": "MIT", …}]`.
  - 8 entries are `devOptional`: typescript, once, wrappy, readable-stream, string_decoder, stream-shift, util-deprecate and end-of-stream. 11 are `optional` (the lightningcss binaries). 0 entries are `link` or `inBundle`.
  - **LAME:**
    - `@mediabunny/mp3-encoder@1.62.1` is MPL-2.0.
    - Its README, l.94, says: "The LAME MP3 Encoder is licensed under LGPL. On their license page they ask that you give them a shoutout with a link." l.102 says the build is LAME 3.100.
    - **The WASM is inlined as base64** (it starts with `AGFzbQ`, the WASM magic) in `dist/modules/build/lame.js` and in the four `dist/bundles/*` files. There is no `.wasm` file in the package (README l.150: "the compiled WASM inlined").
    - `https://lame.sourceforge.io/license.txt`, read by B with WebFetch on 2026-10-28, says LAME is under "the LGPL", with no version stated, and asks users to "Fully acknowledge that you are using LAME, and give a link to our web site, www.mp3dev.org".
  - **`@ffmpeg/core@0.12.6`** is not in the lock. The legacy path `app/utils/ffmpeg.ts` l.38 fetches it at run time from `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm` until PERF-16b. Its npm `license` field says MIT (`npm view`, 2026-10-28). `oss-adoption.md` l.26/l.59 records it as GPL-2.0+. B could not confirm either claim from the ffmpeg.wasm README (WebFetch, 2026-10-28), so the notice states both facts and claims neither (§1.6).

## 1. Rulings (D-29z225). Required.

### 1.1 Where things live
- `app/lib/third-party-licenses.ts` is a **pure** module: no `node:` imports, no file IO, no React.
  - Nothing in `app/routes`, `app/components` or `app/contexts` imports it. Only the test does. It never enters a client or server bundle (C checks this in BUNDLE-219).
  - It exports:
    - the classifier;
    - the lock walker;
    - the copyleft finder;
    - the exceptions constant;
    - the MPL source-link constant;
    - the notices renderer.

    Choose clear, greppable names, for example `classifyLicenseExpression`, `listRuntimeLockPackages`, `findCopyleftRuntimePackages`, `THIRD_PARTY_LICENSE_EXCEPTIONS`, `THIRD_PARTY_SOURCE_LINKS` and `renderThirdPartyNotices`.
  - Strict TypeScript: no `any`, no `@ts-ignore` and **no `as`**. Parse the lock as `unknown` and narrow it with type guards. Every statement ends with `;`.
- The test reads `package-lock.json`, `package.json` and `THIRD_PARTY_NOTICES.md` with `node:fs`, the same way ME9 does.
- `THIRD_PARTY_NOTICES.md` is at the repo root and is **generated**: it is exactly `renderThirdPartyNotices(lock)`. A writes no part of it by hand. Its hand-written prose lives as a constant in the module (§1.6).

### 1.2 Which lock entries count as runtime
- Walk `packages`. Skip the `""` root entry.
- **Exclude only `dev: true`.** `devOptional`, `optional` and `peer` entries count as runtime. This is the conservative choice. Do not "fix" the lightningcss or typescript classification.
- **Name:** take the entry's `name` field when it exists (aliases, for example `string-width-cjs` → `string-width`). Otherwise take the path segment after the last `node_modules/`, scoped names included (`node_modules/@a/b/node_modules/@c/d` → `@c/d`).
- **Unknown entries:** an entry with `link: true` or `inBundle: true` is classified **unknown** (it fails, §1.4), not skipped. There are 0 of these today.
- **Deduplication:** two entries with the same name@version give one notices row. Different versions of the same name give separate rows.

### 1.3 Licence classification (SPDX expression)
- **Input:** `license` is a string, or a legacy object `{ type }`, whose `type` is used. A missing field, an empty string or a non-string is **unknown**.
- **Grammar:** parse `OR`, `AND`, `WITH` and parentheses, with ids matched case-insensitively. A malformed expression (unbalanced parentheses, an empty operand, a dangling operator) is **unknown**. Do not regex-scan the whole string.
- **Copyleft id (flagged):**
  - an id that starts with `GPL-` or `AGPL-`;
  - a bare `GPL` or `AGPL`;
  - deprecated forms such as `GPL-2.0+`, `GPL-3.0`, `GPL-2.0-with-classpath-exception`, `AGPL-1.0`, `AGPL-3.0`.
- **Not flagged, as a deliberate ruling:** `LGPL-*` and bare `LGPL`.
  - The spec names GPL-* and AGPL-* only.
  - LAME, the only LGPL code we ship, is covered by the notice, not by the test.
  - A naive `/GPL/` regex would wrongly flag LGPL. The test proves this does not happen (TL1).
- **Combination rules:**
  - `A OR B` is clean when any alternative is clean.
  - `A AND B` is copyleft when any part is copyleft.
  - `X WITH exception` has the class of `X`.
  - Unknown inside `OR`: the expression is clean if another alternative is clean, otherwise unknown. Unknown inside `AND`: the expression is unknown unless a part is copyleft, in which case it is copyleft.
- **Text that is not a licence id:** `UNLICENSED` and `SEE LICENSE IN …` are **unknown**.
- **Result:** the classifier returns `clean`, `copyleft` or `unknown`. The finder returns every runtime entry that is not `clean` and is not covered by an exception.

### 1.4 Exceptions (the explicit allow-list)
- `THIRD_PARTY_LICENSE_EXCEPTIONS` has exactly **one** entry today:
  - name `limiter`;
  - version `1.1.5`;
  - **asserted licence `MIT`**;
  - reason: `lock has no license field; the package's own package.json uses the legacy "licenses": [{"type": "MIT"}]; via firebase-admin > jwks-rsa`.
- **An exception matches name + version exactly.** A version bump fails the test until the entry is re-checked. Never match by name alone.
- **Stale exceptions fail.** An exception fails when no runtime entry has that name@version, or when the entry now has a `license` field of its own, which makes the exception unnecessary.
- **No exception for `node-forge`.** It passes through the OR rule. If it ever ships under a plain GPL licence, the test must fail.
- **The asserted licence is printed:** the renderer prints the exception's asserted licence in the Licence column, marked `MIT (asserted; see exceptions)`.

### 1.5 The notices table (generated)
- **One row per unique runtime name@version**, sorted by name and then version, with a **plain code-point comparison** (`<`/`>`), not `localeCompare`.
- **Columns:** Package · Version · License · Link.
  - **License** is the raw lock expression, or the asserted exception value (§1.4).
  - **Link** is `https://www.npmjs.com/package/<name>/v/<version>`, with the scoped name kept literally (`@mediabunny/mp3-encoder`).
- **Deterministic output:** `\n` line endings, one trailing newline, and no timestamp, date or count that depends on the environment.
  - The row count may appear, because it comes from the lock.
  - The header names `package-lock.json` and the regeneration command (§1.8).

### 1.6 The hand-written header (a constant in the module, rendered above the table)
The header is in English (it is a legal file, not project docs). It covers, in this order:
1. **What the file is.** Third-party software shipped as runtime dependencies of this store, generated from `package-lock.json`. Runtime means every lock entry without `dev: true`. Do not edit the file by hand. Include the regeneration command.
2. **LAME.** State these facts and nothing more:
   - The MP3 export uses the LAME MP3 Encoder (LAME 3.100), compiled to WebAssembly by the `@mediabunny/mp3-encoder` package (MPL-2.0).
   - The WebAssembly binary is inlined (base64) in that package's JavaScript and is embedded **unmodified**. The package's JavaScript itself is **bundled and minified together with the application's own code** by the build tool (C round 218: it ships inside the lazy chunk `mp3-encoder.client-*.js`, 687,512 B raw, and the LAME worker starts from a `blob:` URL built inside that chunk). It is loaded only when the user starts an MP3 export.
   - **Do not** write "ships unmodified, exactly as published on npm" about the package as a whole. Only the WASM bytes pass through the bundler untouched.
   - LAME is licensed under the LGPL; its licence page does not state a version.
   - "This product uses LAME", with **four links**:
     - `https://lame.sourceforge.io/`;
     - `https://lame.sourceforge.io/license.txt`;
     - the LAME source download, `https://sourceforge.net/projects/lame/files/lame/`;
     - the encoder package's source, `https://github.com/Vanilagy/mediabunny/tree/main/packages/mp3-encoder`.
   - LAME's licence page asks for a link to `www.mp3dev.org`. B fetched it on 2026-10-28 and it redirects to a Google sign-in page, not to LAME. So the notice names it as **text, not a link**, for example: "LAME's licence page names www.mp3dev.org as its web site; the project now lives at lame.sourceforge.io."
   - **Do not** claim that the file is replaceable, or anything else that would need a legal opinion. That question goes to Saba (§8 of `b-round-218.md`).
3. **MPL-2.0 sources.** List the source link for every MPL-2.0 package name, from `THIRD_PARTY_SOURCE_LINKS`:
   - `mediabunny` and `@mediabunny/mp3-encoder` → `https://github.com/Vanilagy/mediabunny`;
   - `lightningcss` and its `lightningcss-*` binaries → `https://github.com/parcel-bundler/lightningcss`.

   The test fails when an MPL-2.0 runtime package has no source link (TL6). For the binaries, a prefix rule `lightningcss-` is allowed.
4. **Run-time downloads not in `package-lock.json`.** One entry:
   - `@ffmpeg/core@0.12.6` is fetched from `unpkg.com` at run time by the legacy purchased-Studio MP3 export only.
   - Its npm licence field is MIT. The FFmpeg build it contains may include components under other licences; this was not verified.
   - It is scheduled for removal (no ticket ids or loop jargon in the file).

   PERF-16b must delete this entry when the URL goes. B records that in 16b's scope; this round adds no source-grep assertion for the URL, because it would be red now.

### 1.7 Test rows (ids are required; C greps them)
`app/lib/__tests__/third-party-licenses.test.ts`, one `describe` per group, the id in each test title:

| Row | What it proves |
|---|---|
| **TL1** classifier, table-driven | <ul><li>clean: `MIT`, `Apache-2.0`, `MPL-2.0`, `LGPL-3.0-only`, `LGPL-2.1-or-later`, `LGPL`, `(BSD-3-Clause OR GPL-2.0)`, `(MIT OR (GPL-2.0 AND AGPL-3.0))`, `(MIT AND Zlib)`;</li><li>copyleft: `GPL-3.0`, `GPL-2.0+`, `GPL-2.0-or-later`, `gpl-3.0-only`, `GPL`, `AGPL-3.0-only`, `AGPL-1.0`, `(MIT AND GPL-3.0)`, `GPL-2.0 WITH Classpath-exception-2.0`, `(LGPL-3.0 AND AGPL-3.0)`;</li><li>unknown: `''`, `UNLICENSED`, `SEE LICENSE IN LICENSE.md`, `(MIT`, `MIT OR`, `AND MIT`;</li><li>a legacy `{ type: 'GPL-3.0' }` object is copyleft and `{ type: 'MIT' }` is clean.</li></ul> |
| **TL2** walker on an in-memory fixture lock | <ul><li>The root `""` entry is skipped.</li><li>A `dev: true` GPL entry is not reported.</li><li>`devOptional`, `optional` and `peer` GPL entries are reported.</li><li>An aliased entry is reported under its `name` field.</li><li>A nested scoped path gets the right name.</li><li>`link: true` and `inBundle: true` entries are unknown and reported.</li><li>Duplicate name@version entries give one row.</li></ul> |
| **TL3** exceptions on fixtures | <ul><li>An entry with no licence and a matching exception is not reported.</li><li>The same entry at another version is reported, and the exception is reported stale.</li><li>An exception whose entry gained a `license` field is reported stale.</li><li>An exception with no matching entry is reported stale.</li></ul> |
| **TL4** real lock | <ul><li>`findCopyleftRuntimePackages(real lock, THIRD_PARTY_LICENSE_EXCEPTIONS)` returns no failures and no stale exceptions.</li><li>**Anchors, so the row cannot pass vacuously:**<ul><li>`mediabunny@1.62.1` and `@mediabunny/mp3-encoder@1.62.1` are runtime and MPL-2.0;</li><li>`node-forge@1.3.3` is runtime and classifies `clean` through the OR rule;</li><li>`limiter@1.1.5` is runtime, has no licence and is covered by its exception;</li><li>at least one `dev: true` entry exists and is excluded.</li></ul></li></ul> |
| **TL5** notices in sync | `await expect(renderThirdPartyNotices(realLock)).toMatchFileSnapshot(<repo root>/THIRD_PARTY_NOTICES.md)`. **The `await` is required.** Without it the row silently checks nothing. |
| **TL6** notices content on the real lock | <ul><li>Every name in `package.json` `dependencies` appears in a table row with its lock version (`node_modules/<name>` entry).</li><li>Every MPL-2.0 runtime package has a source link.</li><li>The LAME section contains the four links of §1.6, the text `www.mp3dev.org` (not as a link), and the words `LGPL`, `inlined` and `bundled`.</li><li>The run-time downloads section names `@ffmpeg/core@0.12.6`.</li><li>The output has no `\r` and ends with exactly one `\n`.</li></ul> |
| **TL7** renderer determinism | Rendering a fixture lock whose `packages` keys are shuffled gives byte-identical output. The order is by code point: `Zed` sorts before `abc`. |

### 1.8 Regeneration and red-proof
- **Regenerating the notices:** `npx vitest run app/lib/__tests__/third-party-licenses.test.ts -u`. The header says exactly this.
  - Under `CI=true` vitest does not write snapshots, so a missing or stale file fails. Commit the generated file in this round. A creates it with `-u` once, then runs **without** `-u` and gets green.
- **Red-proof (L23).** The real-lock rows scan the repo, so they cannot be red on a start copy. Prove them with named mutants. Apply each one to a scratch copy or as a temporary edit that you revert, and verify the restore with `sha256sum`. Save each log under `a-round-219/mutants/`.
  - **(a)** the classifier treats `OR` like `AND` → TL1 and TL4 (node-forge) fail;
  - **(b)** the walker drops the `dev` filter → TL2 fails;
  - **(c)** the classifier uses `/GPL/i` on the raw string → TL1 (LGPL cases) fails;
  - **(d)** exception matching ignores the version → TL3 fails;
  - **(e)** one table row is deleted from `THIRD_PARTY_NOTICES.md` → TL5 fails;
  - **(f)** `await` is removed from TL5 together with mutant (e) → document what happens. Expected: the stale file is no longer caught. This shows why the `await` is required. It is informational, not a pass condition.
  - **(g)** `limiter` is removed from the exceptions → TL4 fails.

### 1.9 Drift rule for later rounds (D-29z226; recorded in the backlog, nothing for A to do)
- After any `chore(deps)` or lock-only change (add, remove, `npm update`, a transitive bump), TL5 is red until the notices are regenerated. So every B task that files a deps request, or that follows such a change, grants `THIRD_PARTY_NOTICES.md` and lists TL5 as a covering test.
- PERF-16b (removing `@ffmpeg/*`) and PERF-8 (adding zustand) are the next ones.
- Root's own `chore(deps)` commit will leave TL5 red at that commit until the round that consumes it. This is a root signal (ROOT-DEPS-NOTICES-REGEN), not a blocker.

## 2. A: the files you own. Everything else is frozen.
1. `app/lib/third-party-licenses.ts`: §1.1–§1.6.
2. `app/lib/__tests__/third-party-licenses.test.ts`: TL1–TL7 (§1.7).
3. `THIRD_PARTY_NOTICES.md`: generated only (§1.8).
4. Doc 171, `docs/implementation/2026/quarter-IV/171-oss-lic-third-party-notices.md`, in Georgian with English terms:
   - It has the 7 TEMPLATE `##` headings in order.
   - l.4 is exactly `**სტატუსი:** Completed (C round 219 PASS)` (L28).
   - It covers:
     - the runtime definition;
     - the classifier rules, including the LGPL ruling;
     - the exception and stale rule;
     - the regeneration command;
     - the drift rule;
     - the LAME facts, with the correction that the WASM is inlined, not a separate file;
     - the unverified FFmpeg-core statement;
     - TODOs: PERF-16b removes the run-time downloads entry, and the "For Saba" legal question.
   - Every test it cites exists (L26).

**Checks A runs (speed rules):**
- `npm run typecheck`;
- `npm run lint`: the new `.ts` files are under `app/**`, so Biome processes them (L30). The `.md` file is not linted;
- `npx vitest run app/lib/__tests__/third-party-licenses.test.ts`, reporting the per-test times. Every test must be under 50 % of the 5 s default (L31/L32);
- the mutants of §1.8;
- `sha256sum -c` of the frozen list, which must give rc 0;
- `git status --short --untracked-files=all`, which must show exactly the 4 new files.

A does not run the full suite or `npm run verify`. With 4 new files, A asks the `code-reviewer` (rule: 3+ files) and reports its Architecture note for B.

**STOP rules (L11, L32, L33):**
- If TL4 finds a real copyleft or unknown runtime entry other than `limiter`, A does **not** add an exception. A writes `STOP — needs B ruling: <name@version licence>` with the lock path.
- If HEAD is not `da5ad69`, or the tree is not clean at the start: STOP.
- If any frozen file has to change: STOP.

## 3. C: rows
**Setup.**
- Use Playwright Chromium, with the dev server at `http://127.0.0.1:5173`. Do not run the full vitest suite or `npm run verify`.
- Do one warm-up `goto('/studio-lab')` first (C rounds 216 and 217: the first navigation timed out).

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-219** (start + end) | <ul><li>`git log -1 --format='%H %s'`;</li><li>`git status --short --untracked-files=all`;</li><li>`sha256sum -c` of the 1,066-file list.</li></ul> | <ul><li>HEAD is `da5ad69`.</li><li>Status shows exactly the 4 new files (`??`).</li><li>Frozen rc 0.</li></ul> |
| **LIC-RUN-219** | <ul><li>`npx vitest run app/lib/__tests__/third-party-licenses.test.ts`;</li><li>a rerun with `CI=true` and without `-u`;</li><li>greps for TL1–TL7;</li><li>a read of the module.</li></ul> | <ul><li>Both runs pass.</li><li>Rows TL1–TL7 exist by id.</li><li>TL5 uses `await … toMatchFileSnapshot`.</li><li>The module has no `node:` import, no `as` assertion and no `any`.</li><li>No regex is applied to the whole unparsed expression. Per-token id tests such as `/^A?GPL(-|$)/i` are fine.</li><li>The exceptions list has exactly `limiter@1.1.5`.</li></ul> |
| **REDPROOF-219** | <ul><li>Read A's mutant logs (a)–(g).</li><li>Add **C's own mutant** on a `/tmp` copy: plant a runtime entry `node_modules/zz-copyleft-probe` `{version:"1.0.0", license:"GPL-3.0-or-later"}` into a copy of `package-lock.json`, then point a copy of the test (or a vite resolve plugin, as in round 218) at that copy. Never edit the repo lock.</li><li>Second C mutant: the same planted entry with `dev: true`.</li></ul> | <ul><li>A's (a)–(e) and (g) each fail the named row.</li><li>C's GPL probe fails TL4 and names `zz-copyleft-probe@1.0.0`.</li><li>The `dev: true` probe passes.</li><li>The repo lock is byte-unchanged afterwards (`sha256sum`).</li></ul> |
| **NOTICES-INDEP-219** | C writes its own script (not A's module) that computes the unique runtime name@version set from `package-lock.json` (non-`dev`, name from `name` or the path), and compares it with the table rows of `THIRD_PARTY_NOTICES.md`. | <ul><li>The sets are equal: 563 today, or C explains any difference with the lock evidence.</li><li>The licence column equals the lock value for every row, except `limiter` (asserted MIT).</li><li>Every `package.json` dependency is present.</li><li>The order is by code point.</li><li>There is no `\r`, and the file ends with one newline.</li></ul> |
| **NOTICES-FACTS-219** | Read the header and check every statement against its source: <ul><li>`node_modules/@mediabunny/mp3-encoder/README.md` l.94/102/150;</li><li>`grep -c AGFzbQ` in `dist/modules/build/lame.js`;</li><li>`find … -name '*.wasm'` gives 0;</li><li>`lame.sourceforge.io/license.txt` (WebFetch);</li><li>`app/utils/ffmpeg.ts` l.38;</li><li>after BUNDLE-219's build: `grep -c AGFzbQ build/client/assets/mp3-encoder.client-*.js` ≥ 1, which confirms the WASM bytes are embedded in the app's own bundled chunk.</li></ul> | <ul><li>Every factual sentence is traceable.</li><li>The four LAME links are present, and `www.mp3dev.org` appears as text only.</li><li>The header says the WASM is unmodified and the JS is bundled. It does not say the whole package ships unmodified.</li><li>There is no claim of replaceability or legal sufficiency.</li><li>FFmpeg core is described as "may include … not verified", not as a fact either way.</li><li>The MPL source links are present.</li><li>There is no loop jargon (round, PERF, D-id) in the file.</li></ul> |
| **BUNDLE-219** | `npm run build` (C's own). Grep `build/client` and `build/server` for `third-party-licenses`, `THIRD_PARTY_LICENSE_EXCEPTIONS` and a distinctive header phrase. Grep `app/` (excluding `__tests__`) for imports of the module. | 0 hits in the builds. 0 importers outside the test. |
| **MP3-SMOKE-219** (browser, 1440, dev) | Add the demo clip with the real mouse, choose MP3, Export, and capture the download. | <ul><li>`czaba-studio-lab.mp3` arrives.</li><li>Every audio frame (Xing frame excluded) is MPEG-1 Layer III, 320 kbps, 48 kHz, stereo (joint stereo, channel mode `01`, counts as stereo, per C's round-218 note).</li><li>Frame duration is in [101.352, 101.452] s.</li><li>The file is not silent.</li><li>0 page errors.</li></ul> |
| **STUDIO-SMOKE-219** (browser, 1280, dev) | The round-217 WAV smoke. | <ul><li>`czaba-studio-lab.wav`: PCM, 2 ch, 48 kHz, 24-bit.</li><li>Its length matches "WAV created" within 1 frame.</li><li>The audio is not all zeros.</li><li>0 page errors.</li></ul> |
| **G219-3** (browser) | Fresh contexts at 1440×900 and 1280×720: <ul><li>`/studio-lab` anonymous;</li><li>`/studio/middle-east`;</li><li>`/api/studio-token?product=middle-east&file=stem1.wav`, with no header and with a fake Bearer.</li></ul> | <ul><li>`/studio-lab` opens anonymously with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it.</li><li>**No token is issued.**</li></ul> |
| **AN-REVIEW-219** | Read doc 171. | <ul><li>The 7 TEMPLATE headings are in order.</li><li>l.4 is byte-exact.</li><li>Every cited row exists (L26).</li><li>The §2 item 4 topics are present, including the "inlined, not a separate file" correction.</li></ul> |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke at the gate. | Not claimed by C. |

**`browserVerified`:** MP3-SMOKE-219, STUDIO-SMOKE-219 and G219-3 are browser rows that can run in the cloud. If any one does not run, the flag is false.

## 4. Reference: how Ableton Live 12 does it
**Not applicable.** This is a licensing, test and generated-docs round, with no user-visible behaviour (agent-workflow "Reference first": out of scope for test-only and docs-only rounds). Ableton conformance for C is "not applicable" on every row. The MP3 smoke keeps the round-218 confirmation (CBR 320 kbps, Live 12 manual §5.1.3.3) as a regression check only.

## 5. Adjacent behaviour that could break
- **The bundle.** If anything imports the module, the server or client bundle grows. BUNDLE-219 covers this.
- **Vitest under jsdom.** `node:fs` already works there (ME9). The test must not change the environment for other files, and must not use a global `vi.mock`.
- **Snapshot writing.** A run with `-u` across the whole suite would also rewrite the notices. That is harmless only while the lock is unchanged. The gate runs under `CI=true`, which never writes.
- **Future deps rounds.** TL5 goes red after any lock change; see §1.9.
- **MP3 export.** Nothing in the export code changes. MP3-SMOKE-219 is a regression check that the round touched nothing there.

## 6. Outcome, fixed in advance
| C result | B at round-220 planning |
|---|---|
| PASS, and planning on or after 2026-10-30 | Round 220 = **REGRESSION** (every done/c_pass item, both viewports, plus `npm run test:e2e:smoke`), then PERF-16b. |
| PASS, and planning before 2026-10-30 | Round 220 = **PERF-16b** (the legacy path delegates to the shared encoder; then the remove request for `@ffmpeg/*` plus the `vite.config.ts` l.27 root grant). It grants `THIRD_PARTY_NOTICES.md` per §1.9. |
| A's STOP on a real copyleft or unknown runtime entry | B rules: an exception with evidence, or a dependency question for root or Saba. No re-dispatch until it is ruled. |
| A row fails (classification, sync, facts, bundle) | A bounded fix-up inside the same 4 files. |
| A smoke or G219-3 finds Medium+ | A bounded fix-up first. A Low goes to `deferred_low_polish`. |

## 7. Publication
- After C PASS, root gates this tree: the 4 new files on `da5ad69`.
- Suggested commit message: `chore(licenses): OSS-LIC third-party notices + GPL/AGPL runtime licence test`.
- **Root reviewer, please cover:**
  - the SPDX classifier (the OR/AND/WITH rules and unknowns);
  - the runtime definition (dev only excluded);
  - the honesty of the LAME and FFmpeg statements;
  - the `await` on TL5.
- Root signal **ROOT-DEPS-NOTICES-REGEN**: from now on, a root `chore(deps)` commit leaves TL5 red until the consuming round regenerates the notices. Optional: root may regenerate the notices in its own deps step.
- Still pending with root, non-blocking: the frontend-architect checkpoint (D-29z195) and `b-round-215-root-request-l28.md`.
