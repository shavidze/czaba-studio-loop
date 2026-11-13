# Architecture checkpoint request: ARCH-CHECKPOINT-ENTRANCE-LOADING (D-29z1750)

**To:** root (send after round 490 C PASS; non-blocking). **Reviewer:** read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`.

- **Scope:** `app/components/loading/EntranceCover.tsx` and `SpotlightLoader.tsx`. Rounds 455–461, 476, 489 and 490 changed them; the test is `app/lib/__tests__/store-entrance-loader.test.tsx`.
- **Signal (SIG-R489-ENTRANCE-ZOOM-RULE-TWICE):** the zoom / scroll-skip rule exists twice: once as the boot-script string in `EntranceCover.tsx` and once as `isZoomGesture` in `SpotlightLoader.tsx`. Only `ENTRANCE_SCROLL_SKIP_EVENTS` is shared. Round 490's MA–MH mutants show the two copies can drift independently, and today only jsdom rows pin each one.
- **Question:** keep the two copies, or extract one of these:
  - (a) generate the boot check from one rule;
  - (b) a parity test that runs {plain wheel, ctrl+wheel ±delta, 1 touch, 2 touches} through both paths.
  - Also: should the `SpotlightLoader` effect (4 timers and 4 listeners in one lifecycle) be left as it is? The A-R489 reviewer said keep.
- **Wanted output:** a keep or extract argument, the value, the risk, and at most three sentences. Any approved change becomes one bounded B task with one owner and behaviour-preserving tests.
