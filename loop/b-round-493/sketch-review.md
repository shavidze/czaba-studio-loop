# Sketch review, round 494 (docs-only v6)

- **Dispatched full sketch:** `b-round-493/sketch-494.patch.txt` sha256 `a4799d4735fe6970c08bf3ac10e62e6b6b831735e7bd37e05351fa50049a47ee`
- **Dispatched delta v5 → v6:** `b-round-493/sketch-494-delta-v5-to-v6.patch.txt` sha256 `29a0ec9eb435433b5e2ca98604eb5da870f9839e5d05b8980c9a1f736bc71739`
- **Rejected v6-draft:** full `09d4945bc8b4ececbf57d8110a3de508001a6a08b30aa64dc6f37f7a06d53471`, delta `a3a6c1eb692d2febfd14606952d526a3887181115e026dd29f17f0750d009db8` saved as `b-round-493/v6draft-sketch-494.patch.txt` and `v6draft-sketch-494-delta-v5-to-v6.patch.txt`.
- **v5:** full `ea441270…` and **v3:** `f530e0f3…` → `b-round-492/sketch-review.md` (docs v4/v5) and `b-round-491/sketch-review.md` (code v1–v3, ordering matrix). Code and tests in v6 are byte-equal to v3.

## tech-lead review 1 (v6-draft 09d4945b): CHANGES REQUIRED
The reviewer had a shell and checked every sentence against `doc-ledger.md` and the evidence files.

| Id | Sev | Line | Finding | B ruling |
|---|---|---|---|---|
| TL-R494-D1 | Medium | 318:93 | "Ctrl+K palette opens **over** the dialog" is false. It opens behind it, dimmed under the backdrop (`b-round-492/probe/ctrlk-*-open.png`; the palette is inside the sticky z-50 header, `Header.tsx:68`) | Fixed. B checked the screenshot. The reviewer's wording is used, minus the unmeasured "focus moves to the palette input" clause. The backlog title of TL-R492-L4-CTRLK-OVER-DIALOG gets a correction note |
| TL-R494-D2 | Medium | 318:22 | The "visually equals HEAD" claim ignores the text caret, which Playwright screenshots hide by default | Fixed with the reviewer's wording (caret exception) |
| TL-R494-D3 | Low | 318:63 | P13 is red on mutant O only through its comparison with P12 | Fixed with the reviewer's wording. B also dropped "focus fell to body at the end", because P13 data is identical on the mutant and the sketch |
| TL-R494-L1…L3 | Low (ledger) | ledger | l.93 mapping; P13 dropped from the idempotent-close rows; l.98 id = TL-R492-L2-LATE-SUCCESS-PREVIOUS-OPEN | Fixed in `doc-ledger.md` |

It also verified as true: l.9–16, l.24–30, l.34, l.36 (backdrop 40 px, scroll-lock decision), l.68–86, l.90, l.95–97, and 315 l.39/105/117 and 317 l.45.

## tech-lead review 2 (dispatched v6, sha a4799d47…): APPROVE
- l.22, l.63 and l.93 are true against the evidence. Dropping the body clause from l.63 is justified.
- Ledger fixes L1–L3 are correct.
- One Low, TL-R495-L1 (ledger row wording for mutant O): fixed in the ledger. The doc is unaffected.

## Pre-checks on the dispatched v6
- **covering:** 6 files / 97 passed (`sketch-494-covering.log`).
- **build:** rc 0; CSS sha256 equal to v5/v3 (`css-compare-v6.txt`, `build-v6.log`).
- **apply:** the delta applies on the store tree (`--check`); the full patch applies on a clean `e4e1d1c` and is byte-equal to `sketch-494/`.

## Mutants
Unchanged (code = v3): `b-round-491/mutants/mutants-summary.txt` (20 RED) and `b-round-491/probe/pw-check-mutO.txt`.
