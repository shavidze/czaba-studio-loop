# Doc ledger, round 506 (L26): doc 327 and the DESIGN_SYSTEM row, sentence → evidence

Sketch v2 sha256 b52088bdbb36ea032842badf2bbafc9b0935505c8e8dced61702c11d1b073e0d. Kinds: T = test row, BR = browser row on the same code (C1–C7; B's probe on the sketch), K = claim, I = inference wording.

## DESIGN_SYSTEM.md (default shape row)
| Sentence part | Evidence |
|---|---|
| three LeadMagnet actions: `lg`, `fullWidth`, `uppercase tracking-wide` | T B2E-1/2/5 (builder equality); BR C1 (320×48, uppercase, 0.4px) |
| max 320 px: FREE DOWNLOAD / BACK TO SITE `max-w-[320px]`, CONTINUE capped by its form | T B2E-1/5 (class), BR C1 (320 at 375 too); source l.210 form `max-w-[320px]` (tech-lead Review 2) |
| CONTINUE primary, not destructive | T B2E-2 (no `bg-destructive`), ST5 count 0; BR C1 bg brass |

## Doc 327
| Section / sentence | Evidence |
|---|---|
| l.4 status | L28 contract (C11 byte check) |
| Context: item 7; stages 2a–2d in docs 320–322, 324–326 | K30 (doc list) |
| Context: keep-list since 2026-10-25; restyle only | policy text (Store redesign section); K6 (copy unchanged) |
| Approach: FREE DOWNLOAD / BACK TO SITE mapping, same rule as "Start Chat" | T B2E-1/5; DESIGN_SYSTEM row (2d) |
| Approach: CONTINUE was red; destructive = error token; alert above is `text-destructive` | K33 (HEAD class line); DESIGN_SYSTEM colour table (product-designer Q2); source l.240 alert class |
| Approach: `isLoading` replaces text with spinner + "Loading..." | K7; T B2E-3 (no svg, no Loading...) |
| Approach: case stays, SABA-Q-499 open | K31 |
| Unchanged list (copy, validation, `/api/subscribe`, Close X, field, headings, focus landing points, refocus after failed submit) | K6, K13, K15; T B2E-4, B2E-6; BR C5, C7 (activeAfterError INPUT) |
| D1 57.6 → 48, padding, `shadow-sm`, press 0.9; width/radius/font/case/0.4px unchanged | BR C1/C2; `probe/head/head.jsonl` vs `probe/sketch/sketch.jsonl` (`compare.txt`) |
| D2 bg rgb(210,119,106) → rgb(201,164,106), hover rgb(217,184,127), contrast 6.09 → 8.32 (10.28) | BR C1/C2/C4; K27 |
| D3 SENDING `pointer-events: none`, opacity 0.5 unchanged | BR C6; K27 (`pe` auto → none) |
| Architecture diagram (trigger: exit intent / scroll + 8 s) | K13 |
| Files list | §2 table; C0 |
| Problem: `buildButtonClassName` does not merge | K8 (builder concatenation); I (tech-lead Review 1) |
| Problem: ST5 pinned the red submit; now count 0; dark text via `primaryTokens` | K9; tech-lead Review 1 answer 4 |
| Problem: Brevo not configured in cloud; unstubbed submit shows "Server configuration error" | BR C5 (`unstubbedAlert`) |
| Testing: A logs, B pre-check files, C round 506 | K24–K26, K29 |
| TODO ids | K31 (all present in backlog) |

## Open/deferred findings on the touched files (contradiction grep)
- `grep -E 'LeadMagnet' backlog.json` open/deferred ids: TL-R445-R4-LEADMAGNET-INLINE-COMPOSING (Esc composing check; unchanged code), SABA-Q-LEADMAGNET-EYEBROW-TONE (the "CZABA" span; unchanged), SABA-Q-LEADMAGNET-NAV-RULES (hook; unchanged), B-R479-LEADMAGNET-TIMER-CLIENT-NAV (hook; unchanged). None contradicts a doc 327 sentence.
- Red-history check (advisor closing check): no Saba or spec decision fixed CONTINUE as red (K36; D-29z1827). Doc 158 S6 records STORE-2a's contrast fix on the red fill: a history row, not a current claim.
