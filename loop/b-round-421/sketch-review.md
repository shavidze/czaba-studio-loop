# Sketch review — SYS-2 stage 1 (round 422)

**Dispatched sketch:** `b-round-421/sketch-422.patch.txt`, sha256 `7002efc193c12ea78d9c34cdc3ac798c9830ef6a8d061947450adafffd8aba45`.

**Reviewed sha (tech-lead, read-only):** `678d26e79ee33640f393f7863634e751ba3615bf5ad07603a0f7974ff9fc2a68`. **Verdict: approve-with-lows** (no Critical/High/Medium).

**Delta after review (test file only, the reviewer's own Lows):** sha `678d26e7…` → `7002efc1…`. The only changes are the reviewer's own Lows, applied in `transport-centre-ui.test.tsx`:
- HE4: `before` snapshot added; `not.toBe(null)` → `not.toBe(before.undo)` (TL-R422-04).
- HE2: the weak `toContain('"loop"')` line removed (TL-R422-05). `loop?.enabled === true` stays.
- HE5: the title says the zoom is idempotent, so only the prevented repeat keydown observes a repeat (TL-R422-06).

No source line changed. Re-run on the new sha: mutants `mutants/summary.txt` (7 lines, identical), covering 23 files 509/509, typecheck rc 0, Biome rc 0, full suite `precheck-full.log`. The delta is the reviewer's requested text, so it gets no second review (recorded here per L58).

| Id | Sev | Ruling |
|---|---|---|
| TL-R422-01 | info | Flag guard before the target/modifier early return: safe. A repeated Ctrl+Enter is also prevented, which matches the transport helper. No other key path changes |
| TL-R422-02 | info | No Enter path reads `defaultPrevented` (StudioWorkspace l.2748 Escape, l.3108 drop); no stopPropagation |
| TL-R422-03 | info | Every HE row can fail (mutants) and checks a positive first-press effect |
| TL-R422-04 | low | fixed in the sketch (HE4 `not.toBe(before.undo)`) |
| TL-R422-05 | low | fixed in the sketch (line removed) |
| TL-R422-06 | low | fixed in the sketch (HE5 title) |
| TL-R422-07 | info | Timeout headroom about 45× (15 s per test, 250–320 ms per row) |
| TL-R422-08 | info | Transport coverage complete except Fit. Fit stays out (TH5 lock, idempotent) |
| TL-R422-09 | low | Implementation doc 272 is in the task |

## Ordering matrix
Not applicable. This is a per-keydown guard, not a concurrency or ordering contract: one event kind, the Enter repeat flag, true or false. The fresh-press × repeat cells are the HE rows' two halves (`pressEnter(false)` → true and acts; `pressEnter(true)` ×3 → false and the snapshot is unchanged).
