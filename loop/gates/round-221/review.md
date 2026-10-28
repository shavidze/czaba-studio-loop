COMMIT: OK. The diff touches no runtime code, and the facts it claims check out against the repository.

## Code Review: round-221 (PERF-16b-ii: the @ffmpeg packages are removed; notices, test TL9 and docs updated)

**What I checked:** I read the 9 paths in `paths.txt` and the full `diff.patch`. I also checked them against `app/utils/ffmpeg.ts`, `StudioContext.tsx:1189-1190`, `package.json`, `vite.config.ts` and `THIRD_PARTY_NOTICES.md`. In `verify.log`: the third-party-licenses tests pass 67/67, all 202 test files pass, typecheck is clean and the build succeeds. This reviews the diff only; I did not check the whole module.

**Scope:**
- No `.ts` or `.tsx` file under `app/` changed except one test file (`third-party-licenses.test.ts`).
- Auth, purchase and download code are untouched.
- No changes to components, listeners, timers, rendering, accessibility or Tailwind. Those review points don't apply this round.
- `package.json` and `package-lock.json` came from root commit `521eb27` (HEAD), not from this candidate. TL9a and TL9b read the real files and pass.

### Critical Issues
- None.

### Suggestions (most important first)
1. **`vite.config.ts:26-28`, Low.** `optimizeDeps.exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']` now points at packages that are no longer installed. It does no harm, but it's misleading. **Fix:** after root approves (VITE-EXCLUDE-STALE), delete the whole `optimizeDeps` block. That is outside A's ownership, so it is not a blocker.
2. **`.claude/primitives/AUDIO_ARCHITECTURE.md:174`, `.claude/skills/ffmpeg-wasm/SKILL.md:32-129` (and the `.agents` mirror), `.claude/agents/performance-optimizer.md:26`, Medium for agent tooling.** These still tell agents to `import { FFmpeg } from '@ffmpeg/ffmpeg'` and to load the core from unpkg. An agent following the primitive or skill would bring back the exact thing TL8 and TL9 forbid. The tests would catch it, but only after the edit. **Fix:** a root/Saba proposal (already in doc 173 TODO) to update the primitive and the skill, or mark them deprecated.
3. **`app/lib/__tests__/third-party-licenses.test.ts:56` vs the new `readObjectKeys` at `:34`, Low.** The new helper overlaps the existing `listDependencyNames` (both use the same Reflect.get pattern). **Fix:** later, rebuild `listDependencyNames` on top of `readObjectKeys`. It's test-local code, so this isn't needed now.
4. **`docs/technical/studio.md`, footer, nit.** `Last Updated` changed to 2026-10-28 but `Version: 1.1.0` was not bumped. **Fix:** bump it to 1.2.0, or leave it if this doc doesn't really use versions.
5. **`docs/learning/README.md:35`, existing problem, nit.** The table lists `Firebase v10`, but `package.json:43` is `^12.6.0`. It's a line next to the one this diff touched. **Fix:** change it to v12 in a later docs sweep.

### Good Practices Found
- **The docs match the code.**
  - The signature `convertWavToMp3(wavBlob: Blob, bitrate: string = '320k')` matches `ffmpeg.ts:8` exactly.
  - The 128/192/320 kbps mapping matches `StudioContext.tsx:1189`.
  - The `Unsupported MP3 bitrate` message matches `ffmpeg.ts:11`.
  - The mediabunny pin `1.62.1` matches `package.json:35,49`.
  - The LGPL claim matches `THIRD_PARTY_NOTICES.md:21`.
- **The notices file was regenerated with `vitest -u`, not edited by hand.** It changes only the count and removes 3 rows.
- **TL9 meets TS strict.** It uses `unknown` with `Reflect.get` and narrowing: no `any`, no type assertions, semicolons everywhere. TL9a/b also check that the files aren't empty (`dependencies.length > 0` and the `''` root key), so the test can't pass on an empty file.
- **The TL9d fixture includes a clean key (`mediabunny`).** That shows the filter is exact and doesn't simply report everything.
- **The Mermaid edits change labels only;** node ids and edges are the same. The doc also states honestly that LEGACY-UI-STUBBED-221 does not prove ownership or auth.

### Architecture note
- none. The diff has only docs, notices and test-local helpers, so none of the four signals apply. The export-pipeline checkpoint is already listed as a TODO in doc 173 and stays the planner's call.

### Alternative Approach
- **Current:** TL9 checks the real `package.json`, the lock file and the rendered notices for `@ffmpeg/`.
- **Alternative:** a single generic deny-list test (for example `FORBIDDEN_PACKAGE_SCOPES = ['@ffmpeg/']`) that every future removal reuses.
- **Verdict:** keep the current version. There is only one removal so far, and the generic version would be an abstraction used once, which the checkpoint contract warns against. Revisit it if a second package is removed.

### Score: 9/10