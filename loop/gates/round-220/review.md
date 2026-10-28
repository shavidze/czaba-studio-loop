COMMIT: OK. Nothing blocks the commit. The one open risk is that nobody has yet exported an MP3 through the real purchased-Studio screen (LEGACY-UI-220 in C round 220). That check couldn't run because the backend isn't available in the cloud environment.

## Code Review: PERF-16b-i — old Studio MP3 export moved to the shared encoder (round 220, HEAD c54a534)

This covers only the paths in `paths.txt` and `untracked.txt`, not a full audit of the modules.

**Checks and evidence**
- **Out-of-scope code:** the commit doesn't change any auth, purchase, download access or signed-URL code. `StudioContext.tsx` is unchanged, and the call at `StudioContext.tsx:1190` stays the same.
- **Real-browser ordering:** the old Studio's WAV worker writes a plain 16-bit PCM WAV with a 44-byte header (`audio-encoder.worker.ts:63-117`) at 48 kHz (`StudioContext.tsx:1114`). In Chromium, C fed `convertWavToMp3` a 48 kHz, stereo, 16-bit WAV. LAME produced constant-bitrate MP3 at all three quality levels. An invalid bitrate made zero network requests, and loading a page didn't fetch the encoder chunk.
- **Leaks:** this change removes two old problems. The polling `setInterval` in `loadFFmpeg` was never cleared if loading failed. The `on('progress')` listener was never removed. The encoder cleans up after itself: each run is removed from its `Set` in a `finally` block, and `input.dispose()` runs in an outer `finally`.
- **Error handling:** no code anywhere checks error text for "FFmpeg". Errors pass through unchanged to the catch block in `StudioContext`.
- **Gates:** `verify.log` shows 202/202 test files passing, the build succeeding, `tsc` clean and no new lint errors.
- **Third-party loading:** the export no longer downloads JS and WASM from `unpkg.com` at run time. The repo has no Content-Security-Policy that could have blocked that download, so this is a real supply-chain improvement. C's build check found 0 hits for `@ffmpeg` or `unpkg` in `build/`.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Medium: the main purchased-Studio export path still hasn't run end to end (LEGACY-UI-220).** C's check used a WAV that matches what the old Studio's worker writes, but not the Studio screen itself. Fix: before 16b-ii removes the `@ffmpeg/*` packages, run one MP3 export at each quality level on `/studio/:productId` with the backend available.
2. **Low: a reset from the Studio lab can cancel an export in the old Studio.** `mp3-encoder.client.ts:132-141` resets the encoder for the whole module, and only `ArrangementContext.tsx:3414/3459/3474/3489/3515` call that reset. The old Studio's call (`app/utils/ffmpeg.ts:14-20`) has no way to cancel its own encode. Doc 172 records this; the ME12 test covers it, and the export fails cleanly if it happens. Fix, only if someone actually hits it: add `signal?: AbortSignal` to `ArrangementMp3EncodeOptions` and cancel per run rather than everything at once.
3. **Low: agent guidance tells agents to import a function that no longer exists.** `.claude/agents/studio-specialist.md:98` and `.codex/agents/studio-specialist.toml:94` import `loadFFmpeg`. `.claude/primitives/AUDIO_ARCHITECTURE.md:174` and `.claude/agents/performance-optimizer.md:26` still show `@ffmpeg`. Code that follows them would fail `tsc` and TL8. `agents:check` didn't catch this because it only checks that referenced files exist. Fix: update these files as part of 16b-ii.
4. **Low: the old Studio export shows no progress while encoding MP3.** `ffmpeg.ts:20` passes `undefined` as `onProgress`, so the bar jumps from 85% to 100%. That matches how FFmpeg behaved, and it's already a TODO. Fix: let `convertWavToMp3` accept a callback that maps the encoder's 0–1 progress onto 85–100%.
5. **Low: the licence check calls `Proprietary` "clean" and lets `GPLv`/`GPL.3` through.** See `third-party-licenses.ts:119-150` and TL1. This was ruled intentional (R-219-2: "clean" means "no GPL/AGPL found"), but the word "clean" invites misreading. Fix: rename the category to `no-copyleft-detected` in a later round.
6. **Info: one extra script request.** C-R220-01: one extra 373 B chunk because Rollup split the bundle differently. It is not loaded eagerly, and total JS size went down. B still has to approve the new baseline.

### Good Practices Found
- The bitrate is checked against an exact lookup table before `import()`, so a bad value never loads the encoder chunk (`ffmpeg.ts:14-17`). Using `??` instead of `||` means a bitrate of `0` is rejected rather than silently becoming 320k.
- The old Studio gets a new encoder object on every call, so an object from before a reset is never reused (LF4).
- TL8 scans the source for `unpkg` or `@ffmpeg`, with a test proving the scan actually catches them. TL5 now checks the notices file exists, so a deleted file can't be silently recreated.
- TypeScript stays strict: no `any`, no type assertions, every statement ends with a semicolon. The `TODO` comment is allowed by CLAUDE.md.
- The Studio lab still gets 320k by default, so its behaviour doesn't change (ME4, ME10).

### Architecture note
- **Signal 2 (who owns what changed):** `app/utils/ffmpeg.ts:18`. The old Studio (`StudioContext`) now depends on `lib/arrangement/mp3-encoder.client`, and only `ArrangementContext` resets that encoder. The Studio lab can now cancel work the old Studio is doing.
- **Keep for now, because:** each page has only one encoder user (`StudioProvider` is mounted only in `studio.$productId.tsx`, `ArrangementProvider` only in `studio-lab.tsx`), the race is documented and fails safely, `ArrangementContext` is frozen, and nobody has seen the bug. Moving it now would cost more than it fixes.
- **Proposal for planner, not approved scope:** after 16b-ii, move the encoder to a neutral `app/lib/audio/mp3-encoder.client.ts` and add a per-call `signal`. Done when: ME1–ME12 still pass, a new test shows a reset from the lab doesn't cancel an old-Studio encode that has its own signal, and `ArrangementContext`'s public shape is unchanged.

### Alternative Approach (Studio audio pipeline)
- **Current:** a thin wrapper in the old Studio that calls the shared encoder, which loads lazily and can only be reset all at once.
- **Alternative:** each caller gets its own encoder instance with its own cancel, or a separate copy of `registerMp3Encoder` for the old Studio.
- **Verdict:** the current approach is better for now. There is one lazy chunk, LAME is registered once, the frozen context isn't touched, and the bundle shrinks. Per-caller instances would only improve the reset race, and that race hasn't happened. Switch only if someone actually hits it (suggestion 2).

### Score: 8.5/10