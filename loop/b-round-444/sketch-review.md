# Sketch 445 review (B round 444 -> 445 planning, SYS-3 stage 2b)

Dispatched sketch: `b-round-444/sketch-445.patch.txt` sha256 07714283ff34c710f2b8f2c1ee654f59132dcf6fe650884e0017f19516170016 (v2; verdict: approve). v1 sha256 3d103c3761dcf148a77b31c81bfbaddd9c5b814985b6cf0667012ea274204009.

Reviewer: project `tech-lead` subagent (read-only), two passes.

## Pass 1, sketch v1 (`sketch-445-v1.patch.txt`, sha 3d103c37): approve-with-changes, 0 Medium+
- Five handlers checked branch by branch against HEAD 616729c: preventDefault, stopPropagation, side effects and their order are equal for composing and repeat keys (agrees with the IME12 truth table).
- L1 (Low): Clip Gain bare `else`, Tempo blur for any non-Escape assume the list holds only Enter/Escape -> type the list (`InlineEditorSettleKey`) and use `else if (event.key === 'Escape')`. **Applied in v2.**
- L2 (Low): `INLINE_EDITOR_ENTER_KEY` is an array -> rename `INLINE_EDITOR_ENTER_ONLY_KEYS`. **Applied in v2.**
- L3 (Low): IME14 scan misses `keyCode !== 229`, `which === 229`, destructuring -> widen pattern + IME15 rows. **Applied in v2.**
- Info 1: IME14 hard-codes callers -> say so in the title. **Applied in v2.**
- Info 2: FV-HELD dispatches synthetic repeats to window; the Chromium probe (`probe/compare-head.txt`, `probe/compare-sketch.txt`) is the main evidence -> cite it in doc 290 (task step).
- Rulings: R1 GATE443-L1 close as "no user-visible effect" with the probe as evidence (confirmed). R2 swallowing the repeat in the floating-video branch is correct: no later Escape branch in `handleKeyDown`; HEAD already prevented every Escape while expanded (confirmed). R3 defer A-R444-REVIEW-L1 + gate-444 finding 1 as Lows owned by a focus-source stage, but doc 289 prose must say FT9 covers AltGr only **in this round** (confirmed with condition; task step). R4 scan scope arrangement only; LeadMagnetPopup inline read -> store-side Low (confirmed).
- Architecture note: keep the helper in `studio-ime-composition.ts`; do not extract a `handleInlineEditorKey(event, {onEnter,onEscape,stop})` (three call patterns would make it flag-driven).

## Pass 2, delta v1 -> v2 (`sketch-445-v1-to-v2.diff.txt`), sketch v2 sha 07714283: approve
- L1, L2, L3 and Info 1 applied correctly; nothing new above Info.
- Info: the destructuring branch misses nested destructuring (`{ nativeEvent: { isComposing } } = event`) and bracket access (`e['isComposing']`); neither exists today -> recorded as TL-R445-I1 (signal, not scheduled).

Reviewed sha = dispatched sha: 07714283ff34c710.

Full sha256 of the dispatched sketch: 07714283ff34c710f2b8f2c1ee654f59132dcf6fe650884e0017f19516170016 (verdict: approve).
