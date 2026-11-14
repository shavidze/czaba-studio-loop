# Doc ledger: B's sketch for doc 330 (round 512)

Sketch `b-round-511/sketch-512-docs.patch.txt`. The checker found 5 added lines in `docs/implementation/` and no test-row ids in them.

| Added doc 330 sentence (summary) | Kind | Source |
|---|---|---|
| l.4 `Completed (C round 512 PASS)` | status (L28 re-dispatch) | `current-task.md` D-29z1859 |
| Three docs named Add to Cart / Buy Now as `primary` | docs fact | claims K6 (`claims-512-planning-output.txt`) |
| Round 511 changed two lines and the file contradicted itself (C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES) | finding | `c-round-511.json` bugs[0], `a-round-511.md` STOP |
| Round 512 aligned the Button sections of the three docs with HEAD | docs fact | K17 (0/0/0 on scratch); C row C1 |
| Changed-files list: DESIGN_SYSTEM (511+512), button.md and ui-components.md (512) | file list | `git status` at C0 |

No test behaviour is claimed in the added lines; A's `a-round-512/doc-ledger.md` covers the changed docs' code facts.
