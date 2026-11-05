# Round 352 sketch review (L58) — tech-lead, read-only, 2026-11-05

Reviewed: `b-round-351/sketch-dp72-release.patch.txt` (first form: last-value check after release). code-reviewer is not on B's consult list; tech-lead used instead.

- Medium+: none.
- Low 1: after release, check the write count, not only the last value (a seek-back then forward would still end on previewTarget; with an unchanged key the effect should write nothing). 20 ms settle is not flaky in jsdom (`video.seeking` false, seek lands within microtasks). → APPLIED: `writesBeforeRelease` + `expect(seeks).toHaveLength(writesBeforeRelease)`; this makes M-B1 red on DP72.
- Low 2: the Undo `seeks.length > …` check is redundant with the final value check. → KEPT (documents intent; the line M-B7 turns red alone).
- Setter spy `function (this: HTMLMediaElement, value: number)` + `instanceof HTMLVideoElement`: typed `this` param, no `any`, no assertion; Biome `useArrowFunction` ignores `this` functions; restored by `afterEach` `vi.restoreAllMocks()`.
- Removing try/finally: acceptable (fresh mount per test; teardown cleans up).
