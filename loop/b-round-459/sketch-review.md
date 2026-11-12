# tech-lead review of the round-460 sketch (SABA-B-13 fix-up, C-R459-01 / A-R459-REVIEW-R1)

Reviewer: project agent `tech-lead`, read-only, consulted by B at the round 459 → 460 planning (2026-11-12). Recorded by B from the agent's final answer.

## Review 1: sketch v2b, delta sha256 624ae2ba94062d5433efefd3189b6d6a30b669575d3740d95e60fbe947af2b96 (superseded)
Verdict: REQUEST CHANGES.

**Scenarios.**
- Normal hydration: correct.
- Whole-document client render after #418: correct on the fast path. The probe showed the overlay play 3/3, but only with boot at about 70–80 ms.
- Skip before hydration: correct. The skip handler looks up the node at call time, and E16 covers it.
- Reduced motion, same-tab reload, client navigation to `/`: correct. The client fallback plays once, as in v1.
- Slow JS: flawed (TL-R460-1).

**Other points.**
- Reading `window.__czabaEntrance` during render in `EntranceCoverHead` is acceptable. React does not patch attributes during hydration, and the later Layout render writes 'not all', which is harmless. The state never returns to `pending`. There is no StrictMode in `entry.client.tsx`, and the handshake claim path is idempotent. Reviewer: "I don't see a smaller alternative".
- `declare global` in the component file is fine within the grant. Limit: the boot-script string is not type-checked against the interface; only the tests tie them together.
- Tests: E15–E18 and the overlay-mount watch are meaningful, and M19–M26 are red. The test-side "client render" is a jsdom `renderToString` re-insert, not React hydration. The attribute ordering and the CSS animation restart are checked only by the Chromium probe.

**Findings.**
- **TL-R460-1 (Medium):** a stale `pending` state re-blackens a visible page. With JS slower than 1000 ms plus #418, the fresh `<style media="all">` restarts the failsafe animation. The page goes black until the passive takeover runs, or for 1.25 s if `_index` never mounts. Fix: time-bound `isEntrancePending()` by `ENTRANCE_FAILSAFE_MS`, and add a test.
- **TL-R460-2 (Low):** no Chromium probe beyond the failsafe. Add a slow-JS + #418 run.
- **TL-R460-3 (Low):** rename `replaceHeadLikeClientRender` so it is not read as proof of React hydration behaviour.

**B's action.**
- TL-R460-1: applied. `isEntrancePending()` is time-bounded, with test E19 and mutant M27.
- TL-R460-2: applied. Probe mode `delayinject` is in `probe/frames.mjs` and in the matrix.
- TL-R460-3: applied. The helper is renamed `reinsertCoverHeadHtml`.
- Result: sketch v2c.

## Review 2: sketch v2c, the dispatched sketch
- Delta sha256: 2c99e2b6d1977dee0020e8fd54cb33af39515f996d8a2e76509f3c03c3de031b (`sketch-460-delta.patch.txt`).
- Full sha256: 2a374f3e3ad0281d94db0d05cf66a1fd593d8d0ad7d1eada481def323e3c170a (`sketch-460-full.patch.txt`).
- The reviewer checked both shas with sha256sum.

Verdict: APPROVE (delta 2c99e2b6d1977dee0020e8fd54cb33af39515f996d8a2e76509f3c03c3de031b, full 2a374f3e3ad0281d94db0d05cf66a1fd593d8d0ad7d1eada481def323e3c170a). The release still needs `delayinject` rows that pass.

**Findings.**
- **TL-R460-1:** resolved. `isEntrancePending()` is time-bounded, E19 covers the 999/1000 ms boundary, and M27 is red with BASE green.
- **TL-R460-2:** half done. The `delayinject` mode is in `frames.mjs` and in `run-matrix.sh` for both servers. It needs results: a run must end with state `expired` and no black frame after about 1250 ms. This blocks the release, not the sketch, so it is a C row.
- **TL-R460-3:** resolved. The helper is renamed `reinsertCoverHeadHtml`.

**No blocking new issues.**
- A style re-inserted just before 1000 ms restarts its own CSS failsafe animation. The claim right after the re-render turns it off; E15 and E19 cover this.
- Reading the clock during render is safe because of `suppressHydrationWarning`.
