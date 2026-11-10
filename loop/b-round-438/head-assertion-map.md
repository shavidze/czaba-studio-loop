# HEAD assertion → v4.1 map (round 439 planning, B)

Source: `git show HEAD:<path>` for the six scan tests (`142918b`), compared with `b-round-438/sketch-files/`. Each HEAD `expect(` is mapped to its v4.1 counterpart, or to a named ruling. Mutant evidence is in `b-round-438/mutants/{head,v3,sketch}.jsonl`.

| HEAD test:line | HEAD assertion | v4.1 counterpart | Status / evidence |
|---|---|---|---|
| NF1 :21 | class tokens | NF1 unchanged | equal |
| NF2 :33 | owners (files with `type=…number` anywhere in text) = [DetailPanel] | NF2 owners pin over any-tag number tags + non-`input` list `[]` + raw-count guard | stronger (M17, M18, M22, M23 red) |
| NF2 :42 | each owner uses the constant via `${…}` or `cn(…)` | `identifierUsesOutsideImports` > 0 + per-tag carrier + `inputClass` checks | stronger (M13–M16); M2 HEAD false red |
| RD1 :30, :46 | tokens | unchanged | equal |
| RD2 :51 | radio owners = [ExportDialog] | RD2 owners pin | equal |
| RD2 :56 | 6 radio tags | `toHaveLength(6)` | equal |
| RD2 :58 | each radio tag has `className={STUDIO_RADIO_CLASS}` (regex) | exact attribute text + hazards | stronger (M3) |
| RD2 :65 | every input has a literal `[a-z]+` type | IN1 literal `^[a-z-]+$` + spread allow-list + `<input` raw-count guard | stronger (M3, M20, M21b); M5 HEAD false red |
| PG1 :34, :54, :55 | tokens | unchanged | equal |
| PG2 :62 | progress owners (`<progress` anywhere in text) = [ExportDialog] | PG2 owners pin over JSX tags + `createElement` + `<progress` raw-count guard | stronger (M6–M8, M19) |
| PG2 :67 | each `<progress` opening is one self-closing tag | **ruling (i):** scanner-coverage guard; the parser reads paired tags, and the class, hazard and count rules apply to them | M24 (paired, with class): HEAD red, v4.1 green (accepted); M25 (paired, no class): red on both |
| PG2 :70 | 1 tag | `toHaveLength(1)` | equal |
| PG2 :71 | no `</progress>` in any file | **ruling (i)**, as above | M24 / M25 |
| PG2 :78 | class regex on each tag | exact attribute text + hazards | stronger |
| SF1 :61–66 | old scanner fixtures | SF1 fixtures on the parser (+ comment fixture) | replaced (the old scanner is gone); SS1/SS3 cover the parser |
| SF2 :71 | search owners = [Library, ShortcutSheet] | SF2 owners pin, recursive | equal |
| SF2 :76 | each tag contains the cancel-hidden class | same containment + hazards | stronger (M9); text containment = HEAD (A-R438-REVIEW-L2, deferred) |
| DS1–DS3 | render and constant checks | unchanged | equal |
| DS4 :108 | Modal owners (top level) | recursive owners pin | stronger (M11) |
| DS4 :113 | each Modal tag contains the skin prop | same + hazards | stronger; containment = HEAD (A-R438-REVIEW-L2) |
| DS4 :116, :117 | legacy dialog: 1 Modal, no skin prop | unchanged (on the parser) | equal |
| DS4 :118 | `openingTags` fixture (`<ModalBody>` vs `<Modal x={a > b …}>`) | fixture on `jsxOpeningTags` + SS2 | equal |
| DS4 (text) | HEAD's `<Modal` text match also counted strings and comments | **ruling (h):** not ported; a component cannot render from a string | — |
| file lists (NF2 :13, RD2 :14, PG2 :14, SF2 :43, DS4 :101) | HEAD's SF2/DS4 listed every top-level `.tsx` including `*.test.tsx`; NF2/RD2/PG2 excluded `.test.` but not `.spec.` | helper skips `__tests__`, `*.test.*` and `*.spec.*` (recursive) | **ruling (j):** a test or spec file is not rendered in the Studio UI; none exists in `app/components/arrangement` today |
| HS1 :48, :49 | no inline held-Enter copy; the helper exists | unchanged, shared walker | equal; M12 HEAD false red |
| HS2 :56–64 | regex fixtures | same + 2 negated-repeat fixtures | stronger |

**Result:** every HEAD assertion is carried over at equal or stronger strength, except three scanner-coverage checks with no runtime meaning:
- **(h)** DS4's `<Modal` text in strings;
- **(i)** PG2's self-closing-only and no-`</progress>` guards;
- **(j)** reading test and spec files.

All three are ruled in `sketch-review.md`.

**Mutants red at HEAD and green on v4.1, in the same suite:** M1, M2, M4, M5, M12, M21 and M24.
- M1, M4, M5 and M12 are HEAD false reds.
- M2 is replaced by the stricter per-tag carrier.
- M21 is caught by IN1 in the radio suite (M21b red), so the covering set stays red.
- M24 is ruling (i).
