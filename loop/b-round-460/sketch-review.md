# Sketch review: round 461 (SABA-B-13 test hardening)

The reviewer was the `tech-lead` project agent, read-only. B wrote the sketch and ran it in `/tmp/b461-scratch` on ffd0c7c.

## Review 1: v1 (superseded, `v1-superseded/sketch-461.patch.txt`, sha 36264b9d71310b2485186d3f7deda4aae0a93a63b38098594d440c54e1816b5a)

**Verdict: APPROVE-WITH-CHANGES.**

1. Info: the hydration path is real. `onRecoverableError` fires, the server node is detached, and the foreign node has to come first.
2. Medium: gaps against production.
   - In production, `hydrateRoot(document)` runs inside `startTransition`, and `clearContainer` removes the whole `<html>`, stylesheets included.
   - The test covers only `head`, rendered synchronously in `act`, and only a mismatch in `head`.
   - **Applied:** these gaps must be recorded in doc 300 (A step 4 in the task).
3. Medium: if a test failed, the root and the error listener leaked. **Applied:** the root is held at module scope and unmounted in `afterEach`, and the listener is removed in `try/finally`.
4. Low: E1b unstubbed `window` too late. **Applied:** the unstub now runs in `finally`. E9 cannot false-pass, because M6–M8 cover all three removals.
5. Low: E21's media assert proves nothing. **Applied:** new E21b, a clean hydration at the failsafe that keeps media `all`. It is a React tripwire and has no source mutant.
6. Low: E20 and E20b only checked that errors were > 0. **Applied:** they now count only errors that are `Error` objects with a message matching `/hydrat/i`.
7. Info: the rules pass (no `any`, no assertions, semicolons, tsc 0, Biome clean).

## Review 2: v2 (superseded by v3, `v2-superseded/sketch-461.patch.txt`)

Sha256 of `sketch-461.patch.txt`: **3e56c4dc8a0aaa6fa3c19e08eb6e68489652c5100439f6ebc2412fdbf24c7357**

**Verdict: APPROVE.** All seven v1 findings are resolved, M1–M10 are RED, and BASE and BASE-ALL are green.

Two non-blocking nits were recorded and not applied:
- the console spy's `mockRestore()` is not in `finally`, but `vi.restoreAllMocks()` in `afterEach` covers it;
- the `vi.advanceTimersByTime(500)` in E21b runs before the boot script. It only offsets the start time from 0, the same way E20 and E21 do.

B's own leak check: E20 was forced to fail on purpose, and E20b, E21 and E21b still passed.

## Review 3: v3, dispatched (supersedes v2)

**Why v3 was needed.** B's whole-file mutant run (`mutants.py … whole`) showed **M5 GREEN**: it went red only under a `-t` filter. React's dev build prints a hydration warning once per module, so the earlier E20/E20b mismatch made E21's console assert vacuous. The v2 files are kept in `v2-superseded/`: `mutants-whole-v2/mutants.txt` holds the M5 GREEN evidence.

**Change.** E21 and E21b now run before E20 and E20b, with a Georgian context comment. The delta is `sketch-461-delta-v2-v3.diff.txt`.

sha256 of `sketch-461.patch.txt`: **b154ff5396da0d16cc564931836b7f9124694b0eda6583d255cd2179775376f5**

**Verdict: APPROVE** (`tech-lead`).
- **Ordering is acceptable as a guard.** `vitest.config.ts` sets no `isolate`, `sequence` or `shuffle`, so tests run in source order inside one module instance per file.
- **Mutants:** the whole-file run in `mutants/mutants.txt` has M5 RED in E21 and every M1–M10 RED in its target row.
- **What the guard does not cover:** only E21 kills M5. E21b's console assert is vacuous after E21, so E21b mainly checks the media after the failsafe.
- **Not applied:** a later stronger option is `vi.resetModules()` plus a dynamic import of `react-dom/client` per hydration. B records it as a note only, not a finding.
