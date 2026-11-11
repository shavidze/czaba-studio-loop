# Round 454 sketch review (`tech-lead`, read-only)

**Dispatched sketch:** `b-round-453/sketch-454.patch.txt` v4, sha256 `9f6fcb40f189e845b8fc1881c0120d1a1dae1a05ad57eb306fa13fc2c43955bc`.
**Verdict on the dispatched sketch (v4 delta review):** APPROVE-WITH-CHANGES, with one Low only, ruled by id below. P1, P2, P3 and P5 are closed, and so is the gradient interpolation. No type, Biome or test-hygiene regressions.

## Review 3: v3 → v4 delta (`/tmp/tl454c`; delta `sketch-454-delta-v3-v4.patch.txt`)
- **Closed:** P1, P2, P3 and P5 (mutants M21–M24 red).
  - A pending comma list can only make a key stricter, never looser.
  - `linear-gradient(180deg in srgb, …)` is valid in Chromium 111+ and keeps HEAD's sRGB interpolation. B's pixel check gives a maximum difference of 1/255 (`probe/gradient-interpolation-check.txt`).
- **Low TL-R454-L-BRACE-PREFIX-HEADER:** a rule written on the same line after a closing brace (`} .x:hover { … }`) is still counted under the previous rule's key.
  - **Ruling:** not fixed in this sketch. It needs a deliberately unusual CSS layout. The line scan is an interim guard, and 2b-3c-2 replaces it with the shared nesting-aware rule reader (SIG-R453-CSSRULEBODIES). So it is owned by STORE-2b-3c-2 and recorded in `deferred_low_polish` (D-29z1614).
  - The reviewer's suggested fix is a header regex that allows a leading `}`, plus mutant M25.

## Review 2: v2 → v3 delta (`/tmp/tl454b`; delta `sketch-454-delta-v2-v3.patch.txt`)
**Verdict:** APPROVE-WITH-CHANGES. M1 closed; M2 partly closed.

| Finding | Severity | Fix in v4 |
|---|---|---|
| P1: a dead teal comma list widened to a live selector | Medium | comma-continuation lines go into the key, with a self-test |
| P2: one-line rule | Low | new header regex |
| P3: comment after the brace | Low | same header regex |
| P5: token-read swap per file | Low | per-rule token-read allow-list in LT6 |
| `color-mix` stop could switch the card gradient to Oklab | Low | `180deg in srgb` |

## Review 1: sketch v2 (sha `359f4208…`, own clone `/tmp/tl454`)
**Verdict:** APPROVE-WITH-CHANGES. Critical and High: none.

**What it confirmed:**
- The live/dead classification is correct (every untouched teal rule has no reachable consumer).
- No changed rule is shared with `/studio-lab`.
- The obsidian block is unchanged.
- The exact-literal pins are not fragile: Biome covers TS/TSX only.

### Findings and B's resolution (sketch v3, sha in `sketch-454.sha256`)

| # | Severity | Finding | Resolution in v3 |
|---|---|---|---|
| M1 | Medium | Teal can come back through a token variable (`var(--color-glow-primary)`) or an 8-digit hex (`#13d9cc1a`) without any LT going red | **LT6:**<br>• a `var(--teal-token)` read allow-list (only `app.css` 2, the dead `.product-detail-add-to-cart` and `.newsletter-button-large`);<br>• a local alpha-hex pattern that must find 0 hits;<br>• self-tests.<br>Mutants M17 and M18 are red. The shared helper is unchanged; its forms are 2b-3c-2's |
| M2 | Medium | A count-neutral swap (remove a dead teal line, add one to an unpinned live rule) and a second override rule for a pinned selector both stay green | **LT5:** every teal line is keyed to its enclosing top-level rule header, with an exact allow-list per rule. **LT1** now also asserts each pinned header's line count (`.command-palette-item.selected {` = 2). Mutants M19 (swap, red on LT5) and M20 (second override, red on LT1) |
| L1 | Low | The stale comment `/* Glow რადიალური ეფექტი */` | deleted |
| L2 | Low | LT2 pinned the 6 dead `.light-flicker-stagger` rules | assertion dropped; the rules are listed dead for 2b-3d |
| L3 | Low | Raw `rgba(236, 230, 218, …)` literals break the no-hardcoded-colour rule | replaced with `color-mix(in srgb, var(--color-foreground) N%, transparent)` (3 % grid, 6 % card stop); no new token. Chromium resolves it to `color(srgb 0.92549 0.901961 0.854902 / a)`; `compare-teal.py` checks that string |
| L4 | Low | The legacy ExportDialog reskin and the `.stems-loader-list` exception need a ruling | ruling line added in `current-task.md` (mixed legacy scrollbars accepted until legacy removal) |

**Info, no change:** the `scrollbar-color` hover. Chromium 121+ and Firefox ignore the `::-webkit-scrollbar` hover colour; this was already so at HEAD.

## v3 checks (superseded by v4; v4 numbers are in `current-task.md` §4)
| Check | Result |
|---|---|
| New test on the sketch | 6/6 |
| HEAD control | LT1, LT2, LT3, LT5 red; LT4, LT6 green |
| Mutants | 20 red, each on its expected rows; BASE, C1 and C2 green (23 lines) |
| Covering | 14 files / 134 tests |
| Typecheck | rc 0 |
| Lint | 205 warnings |
| Biome on the test | clean |
| Claims sketch output | equal to v2 |
| Dry run | only K10 and K12 differ |

v2 artifacts are in `v2-superseded/`; v1 artifacts are in `v1-superseded/`.

(Superseded: v3 was then delta-reviewed; see Review 2.)
