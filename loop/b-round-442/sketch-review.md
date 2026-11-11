# Sketch review — round 443 (SYS-3 stage 1 fix-up, C-R442-M1)

Reviewer: `tech-lead` (read-only project agent), 2026-11-11, on sketch v1 sha256 `fdeeb0686436cd3323f078f85a90717e5bb561a705d5a64b9ff0749d52efd8a3`.
Dispatched sketch: v2 sha256 `6b68ac9e67276bd9691e688905400c4d92a75c053345ca9e3f9e25ad7edb4177` = v1 + the reviewer's G1 assertion (IME6 tempo: a fresh plain Enter after the held keys commits, `status === tempoStatusMessage(96)`) + mutant TEMPO-SKIP-BEFORE-REPEAT that pins it. Source files are identical between v1 and v2; only the test file differs.

Verdict: **approve, 0 Medium+.**

| Q | Ruling |
|---|---|
| R1 safety for non-IME users | Yes at all three sites. The first fresh key still acts; `preventDefault` still runs on repeats. Tempo: first key blurs, repeats go to body. Marker: first Escape unmounts the input. Clip Gain: repeats used to re-set the same text, now no-op (visible result identical). `preventRepeatedEnterKeyDown` import stays used (l.784, 847, 859, 871). |
| R2 ordering | Fine. Marker keeps stopPropagation → IME guard → preventDefault → repeat check (= group editor). Tempo and Clip Gain never stopped propagation and already preventDefaulted repeats; bubbling unchanged. IME guard first everywhere. |
| R3 HS1 | Cannot match the new code (`!event.repeat` / bare `if (event.repeat)`). |
| R4 test gaps | G1 (skipCommitRef set before the repeat check would pass IME6) → **fixed in v2**. G2 (tempo fresh Escape checks only focus) → covered by IME7 (value `''`, snapshot equal). G3 (no plain held-key jsdom row for these three editors) → Low, TL-R443-G3-PLAIN-HELD-ROWS, goes to SYS-3 stage 2 with the shared helper; C7 checks the plain held key in the browser this round. |
| R5 source-scan guard | Not this round. SYS-3 stage 2: first one shared helper in `studio-repeat-safe.ts` (e.g. `isSettleableEditorKey(event)`: not composing, not repeat) used by all five editors, then an HS1-style scan for inline copies. |

Evidence on v2: `mutants/results.jsonl` (7/7 red), `logs/covering60-sketch.log` (60 files, 1118, rc 0), `logs/typecheck-sketch.log` rc 0, `logs/biome-scoped-sketch.log` rc 0, browser `probe/compare-sketch.txt` ALL OK (18 cells) (source identical v1→v2), `probe/compare-head.txt` NOT ALL OK (8 of 18 failing).

## Delta review v1 → v2 (tech-lead, 2026-11-11)
Reviewed sha256 `6b68ac9e67276bd9691e688905400c4d92a75c053345ca9e3f9e25ad7edb4177` (the dispatched sketch). Verdict: **approve v2, 0 Medium+.** G1 is in place (plain Enter after the held keys; `status === tempoStatusMessage(96)`); TEMPO-SKIP-BEFORE-REPEAT is red only on IME6; the other 6 mutants stay red. The removed plain-Escape tail of IME6's tempo part is covered by IME7 (TEMPO-ESC-NO-CANCEL red only on IME7). Low gap: no test sends a plain Escape on tempo *after held repeat keys* → folded into TL-R443-G3-PLAIN-HELD-ROWS (SYS-3 stage 2).
