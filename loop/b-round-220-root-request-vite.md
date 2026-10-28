# Root request (B, round-221 planning, D-29z235): `vite.config.ts` l.26–28

**Status:** open. **Non-blocking.** Round 221 runs with or without it.

## What
After root's `chore(deps): remove @ffmpeg/ffmpeg @ffmpeg/util` commit, `vite.config.ts` l.26–28 still reads:

```ts
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
```

The two names no longer exist. The block was added for ffmpeg's dev worker (round 86, FFMPEG-DEV-WORKER). `vite.config.ts` is a protected config file, so B does not grant it on its own.

## B's evidence that the stale block is harmless
`b-round-220/l23-scratch-run.txt` and `scratch-dev.log`: on a scratch copy of `c4e6c9d` with the packages uninstalled and the block kept, `tsc` rc 0, `vite build` rc 0 (0 `ffmpeg` hits in `build/`), and the dev server serves `/studio-lab` 200 with no error line. Severity if left alone: **Low** (dead config; tracked as VITE-EXCLUDE-STALE).

## Please choose one
1. **Grant A the removal:** write `root-grant-r221-vite.json` in the loop folder with `{"granted": true, "file": "vite.config.ts", "scope": "delete l.26-28 optimizeDeps block only"}` before A starts. A deletes those three lines and nothing else.
2. **Do it in the deps commit:** remove the block in the same `chore(deps)` commit. The round-221 baseline rule accepts a deps commit that changes `package.json`, `package-lock.json` and only those three lines of `vite.config.ts`.
3. **Neither:** A leaves the file untouched, and VITE-EXCLUDE-STALE stays as a Low in `deferred_low_polish`.
