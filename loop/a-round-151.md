# A — Round 151 report: V-2a Studio fonts (D-29z116)

Implementer A · 2026-10-25 · Baseline HEAD e94ae88 · Status: **implementation done, C not run yet** (realVerified = false for all browser rows; A runs no browser rows by task §3.3).

## Start checks (all PASS)
- HEAD `e94ae889c9f331bd681036cc154bb92d38020dc6`; `git status --short` empty.
- `sha256sum -c b-round-150-r151-tree-sha256.txt` → 962 OK.
- Granted start hashes: 8/8 OK. Start copies `b-round-150/r151-granted-start/`: 8/8 byte-identical. The new doc 123 was absent.
- Pre-flight gate posted in chat before editing. Primitives read: TAILWIND_FIRST, DESIGN_TOKENS, FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, GEORGIAN_DOCS, TESTING_QUALITY_GATES, and docs/implementation/TEMPLATE.md.

## Changed files (all via Edit/Write)
| Path | Change |
|---|---|
| `app/styles/app.css` | F1: 3 lines added after `--color-destructive: #d2776a;` inside the obsidian block (18 → 21 declarations). Store `@theme`, l.1 `@import` and the `body` rule are untouched. |
| `app/routes/studio-lab.tsx` | F2: `type LinksFunction` import, `STUDIO_FONTS_HREF` constant (exact §1 URL), `export const links`. |
| `ArrangementTempoRow.tsx` | F3: `font-mono` on the BPM field. |
| `ArrangementMaster.tsx` | F4: `font-mono` on the peak base string. F5: `font-mono` on `arrangement-master-readout`. |
| `ArrangementLane.tsx` | F6: `font-mono` on the track volume readout (`w-10`). |
| `studio-theme-obsidian.test.tsx` | TH2: 3 hand-typed entries, title now says 21 declarations. New helper `classTokensOfEveryTag`. New TH7 and TH8. TH1 and TH3–TH6 unchanged. |
| `detail-panel-fit.test.tsx` | T1: l.293 → `not.toContain('border-outline-strong')`. |
| `docs/.../122-studio-v1a-obsidian-color-tokens.md` | Status l.4 → `Completed (C round 150 PASS, gate 150 e94ae88)`. l.123 and l.127 record that C round 150 ran and passed, with its numbers (FIELD-BOUNDARY ≥ 3.05 px, Loop 5.48, halo 8.32, RV-1 0 px). |
| **new** `docs/.../123-studio-v2a-typography-fonts.md` | In Georgian, with the TEMPLATE sections. Status `In Progress (C round 151 — ჯერ არ გაშვებულა)`. Covers F1–F6, T1, R1–R7 and B's probe numbers. |

`git diff --stat`: each of F3/F4/F6's files changes by +1/−1 line; Master by +2/−2 (F4+F5).

## Tests actually run
- **Baseline** (12 files listed in §3.3): 110/110 → `a-round-151/vitest-baseline.json`.
- **After** (same 12 files): **112/112** → `a-round-151/vitest-after.json`.
  - Per-file `it` counts are unchanged except `studio-theme-obsidian` (6 → 8).
- **TH8 SSR facts:** all three testids are present in the SSR output. The `w-10` + `tabular-nums` count is exactly **4**, as specified.
- **Static checks:**
  - `npm run typecheck` exit 0.
  - `npm run lint` exit 0 (218 warnings, 1 info repo-wide; Biome reports none in the changed files).
  - Read-only `npx biome check` on the 6 `.ts`/`.tsx` files: exit 0, "No fixes applied".
  - `app.css` is outside Biome's file set, so Biome checked 6 files.
- **Mutations** (Edit → all 12 files → restore by Edit → sha256 vs `post-edit-sha256.txt`). Each turned exactly 1 test red (111/1). Details in `a-round-151/mutations/summary.json` and the per-run JSON files.

  | ID | Red test |
  |---|---|
  | m125 | TH2 |
  | m126 | TH2 |
  | m127 | TH7 (re-run after the review's TH7 revision: still TH7 only) |
  | m128 | TH8 |
  | m129 | TH8 |
  | m130 | TH8 |
  | m131 | TH8 |
  | m132 | TH8 |

  - Post-restore run: 112/112. All 9 hashes equal the post-edit hashes.
  - **Procedural note:** m125's restore and m126's mutation were done in one Edit. `app.css` was then sha-verified after the m126 restore.
- **Not run by A** (speed rules): the full suite, `npm run verify`, the build, e2e, and every browser row.

## End state
- Frozen 962 OK.
- Protected diff vs e94ae88 is empty: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `root.tsx`, `Modal.tsx`, `AuthContext.tsx`, `StudioContext.tsx`, and every auth* path.
- `git status --short` = 8 ` M` + 1 `??`. `git diff e94ae88 --name-only` = exactly the 8 granted tracked files.
- `a-round-151/end-sha256.txt` (9 paths) and `a-round-151/diff-vs-start.patch` (vs the start copies plus the new doc) are written.

## Code review (code-reviewer subagent, actually run on the real diff)
Verdict: no Critical, High or Medium. Score 8.5/10.

**Addressed in owned files:**
- **L2:** TH7's `display=swap` and family checks looked at the test's own literal. They now assert on the href that `links()` returns, using an `'href' in descriptor` narrowing with no type assertion. The `toEqual` against the hand-typed literal remains.
- **L1 (doc part):** doc 123 R3 now says the header "Studio Lab" `prefetch="intent"` can prefetch the css2 sheet (not the woff2 files) on Store pages.
- **L5:** doc 123 R4 now lists `AuthModal` among the elements that inherit Studio sans on `/studio-lab`.

**Not changed (reported to B/C):**
- **L1, a C test risk:** `Header.tsx:77-80` and `:216` use `prefetch="intent"` on the Studio Lab link. Remix emits `<link rel="prefetch" as="style">` for route stylesheet links, so hovering or focusing that link on `/` or `/cart` requests the F2 css2 URL. **FONTS-SCOPED must not hover or focus the header link.** B may reword that row to exempt `rel=prefetch` of the css2 sheet. The woff2 files are not fetched.
- **L3:** T1 does not check the non-pending field token. TH5 covers that field.
- **L4:** TH8 checks the pan count only as `> 0`; B did not specify an exact count. Signal only.
- **L6 (likely, unverified):** U+221E `∞` in "−∞" is probably not in Google's latin subset of Plex Mono, so it may render in a fallback mono font. The same was true under Inter, so it is not a regression. C NO-CLIP/VISUAL should look at track volume at its minimum.
- **L7:** the BPM field (`w-14`, about 46 px content) holds "123.45" (2 decimals) in about 43.2 px of Plex Mono, so under 3 px spare. NO-CLIP should also type a value with 2 decimals, not only `300`.
- **Info 8:** client-side navigation into `/studio-lab` waits for the stylesheet (Remix `prefetchStyleLinks`). An error ends the wait, so FONT-FAIL with aborted requests should not hang; a slow Google response would delay navigation.

**Architecture note (verbatim, for B):**
> keep — the obsidian block (`app/styles/app.css:3916-3939`) now holding font declarations is still theming, with the same selector, the same scope and no new state, lifecycle or coupling. The route `links` export (`app/routes/studio-lab.tsx:7-11`) is the normal Remix place to own this. Extracting into `app/styles/studio-theme.css` is already recorded from doc 122 and doesn't need to happen this round.

## B acceptance criteria actually passed by A
- §1 F1–F6, T1: implemented exactly. AN-REVIEW belongs to C.
- §3.1 TH2/TH7/TH8/T1: pass. The TH8 count of 4 holds.
- §3.2 m125–m132: each red only in its target test, and every restore is sha-verified.
- §3.3: start checks, baseline, typecheck, lint, read-only Biome, the targeted vitest files, code-reviewer, and the end-state checks all pass.
- **Not claimed:** every §4 browser row (C's job), and the gate rows.

## Known gaps
- No browser verification by A, so the font rendering, RV-1-TYPE moves, NO-CLIP, RV-2 contrast and FONT-FAIL are all unverified.
- `a-round-151-result.json` is produced by the orchestrator from this session's output. A did not hand-write it.

## Exact next C checks (§4 plus review signals)
1. SOURCE-SCOPE: compare against `a-round-151/end-sha256.txt`; frozen 962; 8 M + 1 ??.
2. FONTS-APPLIED with CDP `CSS.getPlatformFontsForNode` after `document.fonts.ready`, both viewports. Check that the css2 sheet is requested once per load.
3. FONTS-SCOPED: on `/`, `/cart` and `/login`, **do not hover or focus the header Studio Lab link**. If the css2 sheet appears as `rel=prefetch`, record it as signal L1, not as a woff2 load.
4. RV-1-TYPE against `c-round-148/out/bbox-post-v0-*`, plus B's prediction via `fontprobe.cjs`.
5. NO-CLIP: BPM `300` **and** a 2-decimal BPM (e.g. `123.45`); track and master volume at min (`−∞`, also check which font renders `∞`) and max; peak over state.
6. FONT-FAIL, RV-2, TOKENS-SCOPED, FUNC-SMOKE, VISUAL, G151-3, PX-NET/REG-HYD as specified.

## Scope completed
Round 151 A scope (V-2a implementation) is complete pending C. A does not mark V-2a or any backlog item done.
