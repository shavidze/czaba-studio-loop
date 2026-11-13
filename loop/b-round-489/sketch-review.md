# Sketch review: round 490 delta v3 → v4 (tech-lead, read-only)

**Base:** v3 `4a15bff396cb6fb0ed42146cc6c7e5eb4ed4b55ae33a5b104a577c2b10df956c` (`b-round-488/sketch-489.patch.txt`), already in the store tree.
**Dispatched delta:** `b-round-489/sketch-490-v3-to-v4.patch.txt`, sha256 `9280c737640e6f8755f0d3cbc1b567e70652eec83155fe03f7ee41094e2ded81`.

| Delta sha | Verdict | Findings and B's ruling |
|---|---|---|
| `6b8f5f3602d82d1b0cbbffab78022cadc7b52d07c45ab9e8c1630183444955fb` | APPROVE WITH CHANGES | **F1 Medium:** the sign-keyed wheel classifier survived (61/61), because the zoom fixture used `deltaY` −100 → **fixed**: the fixture uses +100, and mutants ME/MF are red. **F2 Low:** doc l.4 says PASS before C → **kept by L28**. **F3 Low:** doc probe lines (the touch swipe was checked by C via CDP; name E8d) → **fixed**. **F4–F6 Info:** project rules OK, `Object.defineProperty` is not an assertion, no assertion lost, MA–MD prove the non-zoom side. **F7 Low:** a real pinch whose first move has 1 touch → **added to TLM-R489-TOUCH-SWIPE** |
| `6541b85bd5dbea7379d3ed7f2a5e3561af11219bda911ad577c0ed4d917bee7b` | APPROVE | **F1b Low:** the mirror survivor `ctrlKey && deltaY > 0` → **fixed**: S3/E8e run over (wheel, 100), (wheel, −100), (touchmove, 0); mutants MG/MH are red |
| `9280c737640e6f8755f0d3cbc1b567e70652eec83155fe03f7ee41094e2ded81` | **APPROVE** (no new Medium+) | F1b fixed; no assertion lost; counts hold (63 tests in the file, 4 files / 94 covering, 30 mutants red); the doc lines are true. Info: the S3 entry in the unit bullet does not repeat "both signs" (not false; no action) |

**Survivors outside the pinned contract** (from the first review, F6): `ctrlKey||metaKey` and a touch check written as `length!==1`. B rules them Low and records them; they are not a STOP (`current-task.md` Rulings). The pinned contract is: for wheel, `ctrlKey` alone decides, at both delta signs; for touch, 1 means scroll and 2 means zoom.

Verdict: APPROVE for 9280c737640e6f8755f0d3cbc1b567e70652eec83155fe03f7ee41094e2ded81.
