# Sketch review: round 440 (SYS-1 stage 1, test-only)

- **Dispatched sketch:** `b-round-439/sketch-440.patch.txt`, sha256 `dd7dc3c724bfc4529e782e316414a09afc80bae5a9703a137adf1c5b07a69209` (v2).
- **Reviewed:**
  - v1 `b-round-439/sketch-440-v1.patch.txt`, sha256 `cb05cfc85fb9152fb91d66ac12f04ff29c1b6ba9e8ac89ccd5da4a70ed65c4b4`, by tech-lead (verbatim in `tech-lead-review-v1.md`);
  - the delta v1 → v2 (`sketch-440-v1-to-v2.diff.txt`), by tech-lead. Its reply names sha256 `dd7dc3c724bfc4529e782e316414a09afc80bae5a9703a137adf1c5b07a69209`.
- **Reviewed = dispatched:** yes (v2).

**Verdict:** approve. Tech-lead found 0 Critical/High/Medium on v1. Both Lows it raised are fixed in v2, and its delta review approves with "Nothing in the delta is Medium or higher".

## Dispositions (tech-lead v1)
| Finding | Severity | Disposition |
|---|---|---|
| L1: LRS3 `children[1].contains(self)` hole | Low | **Fixed in v2**: `durationSpans[0]?.parentElement === metaRow.children[1]`. Mutant S9 (wrapper takes `font-mono`, inner span removed) is red at HEAD and red on v2 |
| library-preview lost the "first `text-foreground` span is the lane name" check | Low | **Fixed in v2**: the first span with `text-foreground` in the row must be the lane-name span. Mutant S10 (decoy span before the name) is red at HEAD and red on v2 |
| `classList.contains` filters feeding `toEqual` | judgement | **Accepted.** The SYS-1 rule forbids a class as the *finder*. A class inside an asserted list is the style contract itself (ruling in task §1) |
| `.sr-only` finder at `detail-panel-strings-ui` (DPS3), lucide icon-class finders elsewhere | Low | **Out of scope for stage 1.** Recorded in the `sys1_other_classname_pins` note for RETRO 450, with no new id. `.sr-only` locates the screen-reader suffix, which has no text-based identity of its own |
| V1–V3 overstate the gap, because `strings.test.ts` already pins these literals | info | **Accepted and stated in the task.** The change removes vacuous self-compares in these two files. The full suite already caught a text change through `strings.test.ts` |
| `export-wav.test.ts` l.510 | — | Left alone (composition test), as B ruled |

## HEAD assertion map (stage 1)
| HEAD assertion | v2 counterpart |
|---|---|
| polish: `span.font-sans` texts = Start, Length, Clip origin (group: Start, Length) | `sansLabels` equal, the same lists (S1 red) |
| strings DPS2: `span.text-dim` texts = 4 labels | Text-found labels = 4, **and** the `text-dim` texts = the same 4 (S2, S3 red) |
| strings DPS4: `span.text-dim` texts contain Tracks | Exactly one `Tracks` span, and it is dim (S4 red; stricter) |
| preview: first `span.text-foreground` text = მუსიკა | One span with that text, it has `text-foreground`, and it is the first `text-foreground` span (S5, S10 red) |
| LRS3 marker `className` toBe exact | Per-token `toContain`; **exact equality not ported (ruling S1-R1)**; S7 red, R1 green |
| LRS3 meta `className` toBe exact | Per-token `toContain` plus `flex` and `not flex-wrap`; **ruling S1-R1**; S8 red, R2 green |
| LRS3 `children[1]` has 1 `font-mono` span, text 00:20.000 | Leaf span with that text, `font-mono`, parent = `children[1]`, the only mono span in the whole row (S6, S9 red; stricter) |
| export-cancel: two constants = their `studioExportStrings` entries | = literals (V1, V2 red; HEAD vacuous) |
| export-wav EW8f: constant = `wavWorkerStalled(30)` | = literal (V3 red; HEAD vacuous) |

## Evidence
- Mutants: `mutants/results.jsonl` (15 ids × head/sketch), with the script and logs in `mutants/`.
- Full suite on v2: `precheck-full.clean.log` (273 / 4029, rc 0).
- Typecheck: `typecheck-sketch.log` (rc 0).
- Lint: `lint-sketch.log` (205 warnings, rc 0).
- Covering set: `covering-sketch.json` (6 files, 89/89).
- Timeout headroom: `l31-headroom.txt`. The slowest test is LRS4 at 1868 ms in a describe with a 15 s timeout, so 12.5 % (K26).
