# A — Round 149 report: V-1a scoped Obsidian & Brass colour tokens

Status: A scope complete; awaiting C round 149. No commit, push, stash, install or build.

## Start
- HEAD b292ff48b7c245d3435f8a44e6c3fc511cb66289, `git status --short` empty.
- `sha256sum -c b-round-148-r149-tree-sha256.txt` OK (965); granted start hashes OK (3).

## Changed files (exact)
| File | Change | `git diff --numstat` |
|---|---|---|
| `app/styles/app.css` | §1.1 block appended at EOF after `.glass-button:hover`, byte-exact; trailing newline kept | 22 + / 0 − |
| `app/components/arrangement/StudioWorkspace.tsx` | `data-studio-theme="obsidian"` line between `className` and `data-lenis-prevent` on the `studio-container` root | 1 + / 0 − |
| `docs/implementation/2026/quarter-IV/121-studio-v0-video-dock-strings.md` | l.4, l.125 (last sentence), l.129: exact §2 texts (GATE148-S1) | 3 + / 3 − |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | new, TH1–TH4 (4 `it`) | new |
| `docs/implementation/2026/quarter-IV/122-studio-v1a-obsidian-color-tokens.md` | new, Georgian, TEMPLATE sections, status `In Progress (C round 149 — ჯერ არ გაშვებულა)` | new |

The whole-tree `git diff b292ff4 --name-only` lists only the 3 modified files. The protected diff is empty: studio.$productId, api.studio-token, account.downloads, download-routes.test, auth*, AuthContext, StudioContext, Modal and root.

## Deviation from the task text (please note, B/C)
- §3.3 names `app/lib/arrangement/__tests__/studio-lab-demo.test.tsx`. **That file does not exist.** The real file is `app/data/__tests__/studio-lab-demo.test.ts`, which I used for the baseline and the after-edit run. C's T149-TARGETED should use these 5 paths:
  1. `app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx` — 2
  2. `app/data/__tests__/studio-lab-demo.test.ts` — 13
  3. `app/lib/arrangement/__tests__/render-budget.test.tsx` — 7
  4. `app/lib/arrangement/__tests__/strings.test.ts` — 51
  5. `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` — 4 (new)
- The new test file was formatted with `npx biome format --write` on that file only (my own new file). No other file was formatted.

## Tests actually run
- Baseline (b292ff4, 4 files): 73/73 → `a-round-149/vitest-baseline.json`.
- After edits (5 files): **77/77**, per-file counts 2/13/7/51 unchanged plus 4 new → `a-round-149/vitest.json`.
- `npm run typecheck` → exit 0 (`a-round-149/typecheck.log`).
- `npm run lint` → exit 0, 218 warnings + 1 info, none in the changed files (`a-round-149/lint.log`).
- Read-only `npx biome check` on `StudioWorkspace.tsx` and the new test → 0 diagnostics. Biome does not cover CSS.
- Mutations (Edit → run → Edit restore → sha256 equal to post-edit; `a-round-149/mutations/`, `summary.json`):

| ID | Mutation | Expected red | Actual red |
|---|---|---|---|
| m114 | remove the attribute | TH1, TH4 | TH1, TH4 ✓ |
| m115 | brand `#c9a46a` → `#c9a46b` | TH2 | TH2 ✓ |
| m116 | selector lines → `:root {` | TH2, TH4 | TH2, TH4 ✓ |
| m117 | add `--color-info: #3b82f6;` | TH2 | TH2 ✓ |
| m118 | add `text-[#fff]` to the root className | TH3 | TH3 ✓ |

- Not run by A (gate rows): the full suite, `npm run verify`, build and e2e.
  - The orchestrator prompt says "run typecheck, build, relevant tests". B §2 forbids `npm run build` because it writes under `store/`, and the speed rules make the build a gate row, so I followed B.
- Not run by A (C rows): any browser row. No Playwright this round.
- `lint.log` was re-run after the L8a brace fix: exit 0, 218 warnings + 1 info, 0 in the changed files. `mutations/summary.json` includes `m118-final`.

## End
- Frozen 965 OK; `git status --short` = 3 ` M` + 2 `??`; HEAD unchanged.
- `a-round-149/end-sha256.txt` (5 paths); `a-round-149/diff-vs-start.patch` (tracked diff plus `--no-index` diffs of the 2 new files).

## Code review (actual `code-reviewer` subagent, agentId a4b91710728256b81)
Verdict: 0 Critical / 0 High / 0 Medium, Lows only, score 9/10. The diff matches §1.1, §1.2 and §2 exactly.
- **L1 (info):** cascade and portal scoping are correct. Modal.tsx:133 and ArrangementMarkerRow:845–855 portal into body, and `html` keeps the Store values.
- **L2:** a browser without `:has()` drops the whole selector list, including the attribute half, so Studio falls back to the Store palette. This is a safe failure and the same exposure as the existing `body:has(.studio-container)`. The §1.1 text is frozen, so this round only records it. **B input:** if V-1b reopens the block, consider splitting it into two rules.
- **L3:** in browsers without `color-mix`, `bg-*/NN` uses Tailwind's inlined Store hex fallback. Already acknowledged in B §0.
- **L4:** during a client-side page transition away from `/studio-lab`, `.page-transition-wrapper:has(.studio-container)` suggests that both pages can coexist briefly. The incoming Store page might then render under a warm `body` for that moment. No C row covers this; an observation for B.
- **L5 (C tooling):** TOKENS-SCOPED compares exact strings. That is fine on the dev server, but a prod build may minify `rgb(36 33 30 / 0.5)`, so compare normalised colours there.
- **L6:** TH3's scope is spec-defined. It does not catch `color-mix(`/`lab(`/named colours/`bg-zinc-*`. The reviewer grepped and found only 3 `transparent` uses, so the guard is truthful today.
- **L7:** test robustness confirmed. Caveats: a CRLF checkout would break TH2's `\n` selector literal (the repo is LF), and TH2 does not prove the block is at EOF (AN-REVIEW covers that).
- **L8:** style nits.
  - (a) A braceless `for` sat next to a braced one. **Fixed**: braces added. Afterwards: vitest on the 5 files 77/77, typecheck 0, Biome 0. m118 was re-run on the final test file and turned TH3 red; restored, hash OK (`mutations/m118-final.json`).
  - (b) The constant self-assertion at TH2's end. Kept (it documents the 2-in-selector invariant).

### Architecture note (verbatim, proposal for B, not acted on)
> `app/styles/app.css:3916–3936` now holds a Studio-only theme block in the Store's global stylesheet, and the Studio root carries two scope keys: `studio-container` for layout (l.284/l.458) and `data-studio-theme` for colour. Keep both for V-1a: it is a single block, no component changed, and the separate attribute is what keeps the protected `studio.$productId` route unthemed. Proposal: if V-1b or V-2 add more Studio-scoped rules, plan a separate bounded task to move them into `app/styles/studio-theme.css`, imported from `app.css`, and repoint TH2 and TH4 to that file; refactoring now would not be worth it.

## B acceptance — what A truly passed
- §1.1 block byte-exact at EOF, 22 + / 0 −: **passed** (numstat, TH2, reviewer).
- §1.2 single attribute, 1 + / 0 −: **passed**.
- §2 doc 121 three lines (GATE148-S1 text): **passed** (3/3 at l.4/125/129).
- §2 doc 122 Georgian, TEMPLATE sections, required status: **written**. Its content review belongs to C's AN-REVIEW.
- §3.1 TH1–TH4 with hand-written literals: **passed** (4/4).
- §3.2 mutations m114–m118: **all 5 red exactly as specified**, restored and hash-verified.
- §3.3 typecheck/lint/scoped Biome/5-file vitest: **passed**. The per-file counts are unchanged; see the 4th file path deviation above.
- End-state checks (frozen 965, 3 M + 2 ??, protected diff empty, end-sha256, patch): **passed**.
- **Not claimed** (C rows): TOKENS-SCOPED, RV-1, RV-2, RV-2-FIELDS, RV-3b, STATE-DISTINCT, FUNC-SMOKE, VISUAL, G149-3, PX-NET/REG-HYD.
- **Not claimed** (gate rows): full vitest, build, verify, e2e smoke.

## Known gaps
- No browser verification by A, so the palette, contrast, layout and portal theming are unverified in a real browser until C runs.
- DUX-B-3 field boundary temporarily ≈ 1.15 (intended; V-1b).
- Reviewer L2/L4 are untested behaviours: a browser without `:has()`, and the page-transition overlap.

## Exact next C checks
1. T149-TARGETED on the **5 paths listed above** (2/13/7/51/4 = 77).
2. SOURCE-SCOPE:
   - `sha256sum -c a-round-149/end-sha256.txt`;
   - the frozen 965 hashes;
   - `git status` = 3 M + 2 ??;
   - `git diff b292ff4 --name-only` = the 3 modified files.
3. AN-REVIEW against `a-round-149/diff-vs-start.patch`.
4. Browser rows per task §4. Optionally add a probe for reviewer L4: navigate client-side from `/studio-lab` to `/` and read the computed `--color-brand` on `body` after the transition settles.
