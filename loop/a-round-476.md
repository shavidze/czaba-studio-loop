# A round 476: DPG-P0-3a, the entrance loader and the header logo in Obsidian & Brass

**STOP — needs B ruling on R1 (code-reviewer Medium, `SpotlightLoader.tsx:181`, inline `backgroundColor` token plus a duplicate `bg-background` child layer; D-29z1683 / L10 / L11).** The tree is left at the sketch state, which is consistent. There is no covering test above 50 % of its timeout: `store-entrance-loader` ran in 941 ms.

**Status:** steps 1–7 done. There is **one STOP for B to rule on (L10)**: the reviewer raised a Medium (R1) on a file the task grants as byte-equal to the sketch. Under D-29z1683, a Medium on such a file is a STOP. The tree is left exactly as the sketch, so C can run unchanged if B accepts it.

## Step 1: K1 / K2 and the primitives
- **K1:** HEAD is `edeba5ac80a7…`, and the tree was clean before the round. Matches.
- **K2:** the sketch sha256 is `83341e9f0c43…5073e0`. Matches.
- **Primitives read:**
  - in full: DESIGN_TOKENS (110 lines);
  - partly: TAILWIND_FIRST l.1–80 of 146, GEORGIAN_DOCS l.1–80 of 100, TESTING_QUALITY_GATES l.1–60 of 165, BUG_HUNTING_TESTS l.1–50 of 307 and FORWARDREF_COMPONENT l.1–40 of 203.

  DESIGN_TOKENS still says brand = teal. That is stale, and fixing it is P0-3b / ROOT-REQ-DPG-PRIMITIVES-PATCH.
- **Pre-flight and `/check`:** A read `.claude/skills/pre-flight/SKILL.md` and `.claude/commands/check.md` only **after** applying the byte-fixed sketch, so the pre-flight gate was not published before code.
  - **Assumptions:** the request is the sketch byte for byte, plus doc 309.
  - **Smallest version:** the sketch itself; A adds no code.
  - **Files:** the 6 grants.
  - **Success:** sha `-c` OK, claims equal, 12/12 mutants, the covering files green.
  - **`/check`:** applied in the scoped form the orchestrator asked for (Biome on the owned files, typecheck, lint, build, the covering tests). `npm run verify` and `test:e2e:smoke` belong to the gate (speed rules).
- **Lessons:** the A section was read (l.42–51, truncated per line).
  - **L11:** STOP at the top.
  - **L12:** no new class selectors in tests by A; the sketch's P2 reads classes, which is B's reviewed design.
  - **L15:** contrast is cited from B's measurement (`contrast-wordmark.json`). A did not re-measure it in a browser.
  - **L26:** every doc row id was grepped. E8 and L6 did not exist; A corrected them to E8b and E14.
  - **L28:** l.4 is exact.

## Step 2: the sketch
- `git apply -p1 sketch-476.patch.txt` returned rc 0.
- `sha256sum -c sketch-476-files-sha256.txt` returned OK for all 5 files:
  - `app/components/loading/SpotlightLoader.tsx`
  - `app/components/loading/EntranceCover.tsx`
  - `app/components/layout/Header.tsx`
  - `app/lib/__tests__/store-entrance-loader.test.tsx`
  - `app/lib/__tests__/store-header-footer.test.tsx`
- No granted file was edited after applying the sketch.

## Step 3: doc 309
- **Path:** `docs/implementation/2026/quarter-IV/309-dpg-p0-3a-entrance-logo-brass.md`, a new file.
- **Structure:** the TEMPLATE headings appear in order, and l.4 is exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 476 PASS)`.
- **What it names:**
  - the product-designer rulings;
  - the contrast, checked against `b-round-475/probe/contrast-wordmark.json`: median 7.56 at 1440 and 7.55 at 1280, lightest 6.81 and 6.73, HEAD ivory 15.4 and 15.39;
  - the hand-off colour, checked against `probe-head.json` and `probe-sketch.json`: at HEAD the cover and overlay are `rgb(0, 0, 0)` and `body` is `rgb(14, 13, 12)`; on the sketch all of them are `rgb(14, 13, 12)`;
  - the parked items P1, P4 and the comment;
  - the 3 deviations, and R59 superseded;
  - the TODO list: P0-3b, ROOT-REQ-DPG-PRIMITIVES-PATCH, SABA-Q-DPG-LOGO-FONT-SERIF, SABA-B-16 and the DP-gate re-review.
- **Corrected after review (#7):** "sizes unchanged" now reads "unchanged in the diff". The doc says which rows pin timing, skip and portal, and that no unit test pins the sizes.

## Step 4: checks (logs in `a-round-476/`)
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0. 191 warnings and 1 info; both counts equal B's `precheck-lint.log`, so none are new | `lint.log` |
| `npm run build` | rc 0 | `build.log` |
| Scoped Biome on the 5 code files | rc 0. 2 warnings, both the existing `dangerouslySetInnerHTML` in EntranceCover l.48/50; the logic is unchanged | `biome-scoped.log` |
| `npx vitest run $(cat covering-476.txt)` | 16 files and 262 tests passed. `store-entrance-loader` ran 50 tests in 941 ms, under 50 % of the timeout (L31) | `covering.log` |
| `claims-476.sh` (rerun after the doc edit) | Byte-equal to `claims-476-allowed-deltas.txt`. Last line `L58 OK` | `claims.txt` |
| `git status --short --untracked-files=all` | The 5 sketch files plus doc 309, nothing else | `git-status.txt` |

## Step 5: mutants
- Run on `/tmp/a476-mut` (a `cp -a` copy).
- **Result:** 12 of 12 RED. `a-round-476/mutants/summary.txt` is identical (`diff`) to `b-round-475/mutants/b-run/summary.txt`.
- No mutant reported `NOT-APPLIED`.

| Mutant | Red rows |
|---|---|
| M1 overlay bg-black | P2, P3 |
| M2 base-layer bg-black | P2, P3 |
| M3 wordmark foreground | P2 |
| M4 dust white | P2, P3 |
| M5 cone white | P3 |
| M6 vignette black | P3 |
| M7 dust random per render | P4 |
| M8 portal not body | P1 |
| M9 cover black | E1 |
| M10 header foreground | N3c |
| M11 vignette space-syntax black | P3 |
| M12 overlay hex6 black | P2, P3 |

## Step 6: code-reviewer
- The project `code-reviewer` subagent ran, with a score of 8/10 and no Critical or High findings.
- It had no shell, so it read the working tree rather than the `git diff`.
- **Its findings and what A did:**

| # | Severity | Finding | A's action (D-29z1683) |
|---|---|---|---|
| R1 | **Medium** | `SpotlightLoader.tsx:181`: the overlay keeps an inline `style={{ backgroundColor: 'var(--color-background)' }}`, and the child `bg-background` layer paints the same colour. Tailwind-first would put `bg-background` on the overlay and drop both. P2 pins both. | **STOP. Not edited.** Context for B's ruling: (a) HEAD already had an inline style on that line (`'#000'`), so this is not new; (b) `pd-p0-3a.md` ruling 1 names "the overlay's inline style" as one of the three places; (c) `sketch-review.md` row (a) Info by `tech-lead` covers `var()` in the inline style; (d) the reviewer says the render is identical and the change is not urgent ("a later colour-only pass"). Editing would break C1's shas, C2's claims and the M1/M12/P2 pins. A suggests a deferred Low or signal, but that is B's call. |
| R2 | Low | `EntranceCover.tsx:1`: the Georgian comment still says the first frame is black ("შავი") | Reported, not edited (byte-equal file) |
| R3 | Low | English JSX comments remain in `SpotlightLoader.tsx` (l.185, 215, 236, 254, 302, 327, 336) | Reported. They predate the round and are unchanged context in the diff (the sketch removed one JSX comment and corrected the Georgian timeline comment; the rest are untouched), so they are outside the "only the sketch's edits" grant |
| R4 | Low | P3 is a source-text scan. It misses named `white`/`black`, `text-white`/`from-black` and `hsl(0 0% 100%)`, counts stops in the file text, and uses `process.cwd()` where E11 uses `__dirname` | Reported, not edited |
| R5 | Low | P2 hard-codes `15` instead of the particle count, and relies on jsdom keeping the `var()` text in `style.backgroundColor` | Reported, not edited |
| R6 | Low | N3c's title claims the header matches the entrance and footer wordmarks, but it asserts only the header (the footer is `text-brand` at `Footer.tsx:28`, untested) | Reported, not edited |
| R7 | Low | Doc 309 claims "sizes unchanged", and no test pins the sizes | **Fixed in doc 309** (A's own file). The doc now names which rows pin what, and A grepped each id. Claims re-run, still equal |
| R8, R9 | Info | `--color-brand-rgb` is defined (`app.css:133`); SSR and hydration are fine; `color-mix` drops only the vignette on old browsers | None |

**Architecture note (for B, verbatim in substance):** this is signal 4, new state in an existing component (`dustParticles` at `SpotlightLoader.tsx:123`). Keep it there: it shares the overlay's lifecycle and only this component uses it. Value low, risk low, no task. The reviewer's "Alternative approach" is the R1 change, deferred to a later colour-only pass.

## Changed files
| File | sha256 / state |
|---|---|
| The 5 sketch files | equal to `b-round-475/sketch-476-files-sha256.txt` |
| `docs/implementation/2026/quarter-IV/309-dpg-p0-3a-entrance-logo-brass.md` | new, A's own; claims equal to the allowed deltas |

Nothing outside the grants was touched. No protected file, `app/styles/**`, `Footer.tsx`, `.claude/**`, `package.json` or `public/**` was changed.

## Acceptance: what A truly passed
- **A steps 1–7:** done, with the R1 STOP recorded for B.
- **What A verified offline:** C1 (scope and shas), C2 (claims), C3 (12/12 mutants) and C4 (16 files) at A's side. C must still run these itself.
- **Not verified by A:** C5–C10 and C12. A ran no browser probe, so `browserVerified` is false from A's side; those rows belong to C. C11 (doc 309) was self-checked only: headings in order, l.4 exact.

## Exact next C checks
1. **B ruling on R1** (L10). If B accepts the tree as is, C runs the task's C1–C12 unchanged.
2. **C5/C6** with `probe-entrance.mjs` after `warm.mjs`: the hand-off at `rgb(14, 13, 12)`, plus the brass stops, dust and vignette, at both viewports.
3. **C7:** the wordmark is `rgb(201, 164, 106)`, weight 700, box 318×72. The header logo is brass at weight 800 on `/` and `/store`. Contrast is ≥ 4.5.
4. **C8:** the timing record. **C9:** the two-brass header record. **C10:** the journey. **C12:** auth.
5. Never run vitest at the same time as a probe.

## Known gaps
- R1 needs B's ruling (see above).
- R2–R6 are Lows on byte-equal files, candidates for `deferred_low_polish`.
- A-R460-REVIEW-4 and C-R190-I4 stay deferred, as the task says.
