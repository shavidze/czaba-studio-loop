# Architecture checkpoint request: ARCH-CHECKPOINT-ENTRANCE-LOADING (D-29z1750, sent D-29z1753)

**To:** root. **Sent:** at the round 490 -> 491 planning, after round 490 C PASS (browserVerified true) and gate 490 published `53ff249`. Non-blocking. **Reviewer:** read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`.

- **Scope:** `app/components/loading/EntranceCover.tsx` and `SpotlightLoader.tsx`. Rounds 455–461, 476, 489 and 490 changed them; the test is `app/lib/__tests__/store-entrance-loader.test.tsx`.
- **Signal (SIG-R489-ENTRANCE-ZOOM-RULE-TWICE):** the zoom / scroll-skip rule exists twice: once as the boot-script string in `EntranceCover.tsx` and once as `isZoomGesture` in `SpotlightLoader.tsx`. Only `ENTRANCE_SCROLL_SKIP_EVENTS` is shared. Round 490's MA–MH mutants show the two copies can drift independently, and today only jsdom rows pin each one.
- **Question:** keep the two copies, or extract one of these:
  - (a) generate the boot check from one rule;
  - (b) a parity test that runs {plain wheel, ctrl+wheel ±delta, 1 touch, 2 touches} through both paths.
  - Also: should the `SpotlightLoader` effect (4 timers and 4 listeners in one lifecycle) be left as it is? The A-R489 reviewer said keep.
- **Wanted output:** a keep or extract argument, the value, the risk, and at most three sentences. Any approved change becomes one bounded B task with one owner and behaviour-preserving tests.
- **New since round 489 (gate 490 reviewer, `gates/round-490/review.md` Architecture note):** signals 3 and 4 apply; verdict "keep for now", with a proposal to extract `useEntranceSkip(hide)` in `app/components/loading/` that owns the key, click, wheel and touch listeners and removes them synchronously (closes GATE490-L1-SKIP-LISTENER-ASYNC-REMOVE). The same round could close A-R490-REVIEW-NOCTRL-NEG-WHEEL (S1/E8c at deltaY -100) and the A-R490 reviewer's "contract table" idea. Please weigh this option against (a) and (b).
- **Baseline for the review:** store `53ff249`.
