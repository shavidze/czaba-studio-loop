# A round 195 — STORE-2a fix-up 2: GuestForm borders (C-R194-01), recordings `inputClass` (R80), whole-tag ST8b (C-R194-02)

Status: **implemented, awaiting C round 195.** No commit, no push.

## Start checks (all OK, run from the store root)
- HEAD `caa09af`. `git status --short` == `b-round-194/git-status-at-planning.txt`.
- `a-round-194/end-sha256.txt` OK. `b-round-194-r195-tree-sha256.txt` (1017 entries) OK. 7 start hashes OK.
- **K0:** `node ../tmp/studio-real-loop/b-round-194/tools/fieldscan2.mjs app` → exactly 14 hits (GuestForm 53/77; SfxQuickEdit 262/309; SfxSceneBuilder 654/663/757/783/967/1051; SfxSoundLibrary 97/109; SfxVideoSync 155/256). All are inside the 5 source grants, so the stop rule did not fire. The `inputClass` consumers are 2 + 6 + 2 + 2, and every one is an `<input>` or `<select>`.
- **e2e grep** (`guest-name`, `guest-email`, `border-outline`, the four Sfx components): 0 hits.
- **Mock API:** :5199 was not listening. I started `node mock-api/server.mjs` (PID 4342, log `a-round-195/mock.log`) and stopped only that PID at the end. :5199 is free again.

## Changed files (the 7 grants only)
| File | Change |
|---|---|
| `app/components/chat/GuestForm.tsx` | G1/G2: non-error branch `border-outline` → `border-outline-strong`. The error branch, focus ring, placeholder, copy and behaviour are byte-identical. |
| `app/components/recordings/SfxSoundLibrary.tsx` | R1: one token in `inputClass` |
| `app/components/recordings/SfxSceneBuilder.tsx` | R2: one token in `inputClass` |
| `app/components/recordings/SfxVideoSync.tsx` | R3: one token in `inputClass` |
| `app/components/recordings/SfxQuickEdit.tsx` | R4: one token in `inputClass` |
| `app/lib/__tests__/store-theme-tokens.test.ts` | See "Test file changes" below. |
| `docs/implementation/2026/quarter-IV/158-store-2a-colour-tokens.md` | Status → `In Progress (awaiting C round 195)`, plus a new Georgian "Round 195" section. Nothing else in the doc changed. |

- No Biome reflow was needed in the 5 source files: each diff line is the same line with one token swapped (`a-round-195/diff-vs-start.patch`).
- **R81 was not used.** The token is `border-outline-strong` (measured 3.70:1, below).

### Test file changes
- **ST8:** adds G1/G2 (anchored by `id="guest-name"` / `id="guest-email"`, accepting `border-outline-strong` or `border-dim`) and R1–R4 (anchored by `const inputClass =`, accepting `border-outline-strong`).
- **`fieldClassRegion`:**
  - The `const` branch now reads the initialiser up to its `;`, tracking brackets and quotes (reviewer Low #5).
  - The tag branch checks that the anchor and `className=` both fall inside the field tag (#4).
  - `className` is found with `/\sclassName=/`, so `inputClassName=` no longer matches (R195 reviewer Low #8).
  - The region excludes its delimiters (#6).
- **ST8b** follows R82:
  - The pure function `bareOutlineFieldHitsInSource(path, source)` scans each whole `<input|textarea|select` tag up to the `>` at brace depth 0. It skips quotes and template literals, and `=>` does not end the tag.
  - It also follows same-file `const NAME =` initialisers that start with a quote, a backtick, `[` or `cn(`.
  - `FIELD_SCAN_WINDOW_LINES` is deleted. The title and `toEqual([])` are unchanged.
- **Walker guard** (fix for R195 reviewer Medium #2). ST8b now also asserts:
  - the scanned files include GuestForm, SfxSceneBuilder, hire-us and store;
  - no file comes from an excluded folder;
  - there are at least 50 field tags (60 today).
- **Narrowing to note:** the walker now scans `.tsx` only, per R82 (the old one scanned `.tsx?`). `.ts` files cannot hold JSX tags.
- **ST8c:** in-memory self-tests.
  - Flagged: (i) through (iv) as specified, plus (vii) `<textarea disabled={length > 3}>` and (viii) a `cn(...)` constant on a `<select>`.
  - Clean: (v) and (vi).
- Reviewer Low #3 (deny `-light`/`-hover`) stays out of scope.

## Tests and checks actually run
- `npx vitest run app/lib/__tests__/store-theme-tokens.test.ts`: **38/38** green.
- **Neighbour suites:** T1, `sfx-library`, `sfx-scene-route`, `sfx-video-transport` and `studio-theme-obsidian` → **5 files, 58/58** green.
  - Grepping for tests that import GuestForm, ChatWindow, ChatWidget, the support route or the 4 recordings components finds only the 3 sfx suites.
- **Red proof** on `a-round-195/scratch-r194/`: a copy of `app/` with the 5 source grants replaced by their start copies and the new test file kept. Run with `STORE_THEME_TOKENS_ROOT`; log in `a-round-195/red-proof.log`.
  - **7 red:** ST8 G1, G2, R1, R2, R3, R4 and ST8b.
  - **31 green:** ST1–ST7, ST8 F1–F16, ST8c ×8.
  - ST8b lists exactly the 14 hits from `fieldscan2.mjs`.
- **My own mutants** (scratch copies, since deleted):
  - m15: `const fieldClass = 'border border-outline'` on a new `<input>` in `store.tsx` → ST8b red (`routes/store.tsx:603 via fieldClass`).
  - m18: a `<section className="border border-outline">` with no field → all green.
  - I did not run m14, m16 or m17 as files. ST8c (i) covers the m14 shape, and the red proof covers m16 and m17. C runs all mutants.
- `npm run typecheck`: exit 0.
- `npm run lint`: 214 warnings + 1 info, the same as round 194.
- `npx biome check` on the 6 code/test grants: 0 errors, 0 warnings.
- The full suite was not run (speed rules; the gate runs it).

## Live proof (Playwright Chromium, :5173, mock :5199, DPR 2, `--disable-lcd-text`)
Scripts are in `a-round-195/scripts/`. `fields194.cjs` is C's round-194 tool, reused unchanged. Shots are in `a-round-195/shots/`.

| Field | 1440×900 | 1280×720 | 375×812 | Border | Keyboard focus |
|---|---|---|---|---|---|
| `#guest-name` | 3.70 (t/r/b/l 3.70 each) | 3.70 | 3.70 | `rgb(115,107,96)` = outline-strong | `:focus-visible`, border `rgb(201,164,106)` brass |
| `#guest-email` | 3.70 | 3.70 | 3.70 | same | same |

- Every midpoint is compared with the pixel 2 CSS px outside the border. The result is ≥ 3:1 and better than HEAD's 1.62, so R81 was not needed.
- The first 1440 `#guest-name` attempt timed out on a cold load while waiting for the "Live Chat" button. The rerun measured 3.70.
- **Error state** (`guest-error.cjs`, 1440): an empty submit gives both fields `border-destructive focus:border-destructive` with `rgb(210,119,106)`, showing "Name is required" and "Email is required". 0 pageerrors.
- **F2** (`/store` search) at 1440: min **3.64** (t/r/b/l 3.67/3.64/3.65/3.67). Unchanged.
- **`/studio-lab` rest at 1440** vs `c-round-191/shots/c191-1440-1/rest-full.png`: **0 changed px**, maxDelta 0 (`a-round-195/studio-rv.txt`). 0 errors and 0 hydration messages. Anonymous: `auth_user` null, demo badge present.
- Every field session had 0 pageerror, 0 hydration messages, 0 Authorization headers and 0 remote requests.
- `/recordings/:id` and `/scenes/:id`: **BLOCKED, backend unavailable in cloud**. Only ST8 R1–R4 cover them.

## Code review (`code-reviewer` subagent, run for real)
- **Score 8/10.** No Critical or High findings.
- **Medium #1** (doc 158 not updated): fixed. The Round 195 section is added. The stale round-194 lines (`:159`, `:172`, the old TODO) are left as history, because SCOPE-195 allows only the status line and the new section. The new section says it supersedes them.
- **Medium #2** (the walker was untested, so ST8b could pass on an empty scan): fixed with the walker guard above.
- **Lows:**
  - #7 (more fixtures) is partly done (vii, viii).
  - #8 (`inputClassName=`) is fixed.
  - Open for B: #3 (typed `const x: string =`, object maps, `clsx`/`twMerge`); #4 (constants followed one level only, no imports); #5 (deny-list for `-light`/`-hover`/side variants, out of scope by R82); #6 (quote tracking can desync on a JSX `\`, a regex literal or a comment with a quote, which gives loud false positives, not silent passes). None occurs in today's tree.
- **Architecture note (verbatim, for B):** "I'd keep the field scanner in the test file this round. It is cohesive, test-only, guarded by ST8c and has no production coupling, so extracting it now is worth little. The risk is a third rewrite of the same region: if that happens, extract it to a helper or replace it with the TypeScript AST walk as one scoped task."
  - The reviewer suggested `ts.createSourceFile` with `ScriptKind.TSX` as that later AST alternative.

## Where each test-file change is authorised (for SCOPE-195 and AN-REVIEW-195)
- The ST8 site list (G1, G2, R1–R4): T1.
- The scanner (R82): T1/ST8b.
  - `bareOutlineFieldHits` **no longer exists under that name**. It is split into `fieldScanSourceFiles` (the walker) and `bareOutlineFieldHitsInSource` (the pure scanner). ST8b uses both.
  - The helpers `jsxTagEndIndex`, `constantInitialiserEndIndex`, `bareOutlineConstantNames` and `isQuoteCharacter` belong to the scanner.
- The `fieldClassRegion` changes (anchor inside its tag, `;`-bounded constant region, no delimiters): optional reviewer Lows #4–#6, allowed by T1.
- The walker guard (`FIELD_SCAN_REQUIRED_FILES`, `FIELD_SCAN_MINIMUM_TAGS`, and the excluded-folder assertion in ST8b): §3 "Fix its Medium+ findings within the grants" (R195 reviewer Medium #2).
- `/\sclassName=/` in `fieldClassRegion`: R195 reviewer Low #8. It is fixed now under the 2026-10-23 rule: the round already owns this code and the fix costs little.
- ST8c (vii) and (viii): part of "adds ST8c", as extra fixtures.
- **`.tsx`-only coverage:** `find app -name '*.jsx' -not -path '*__tests__*'` finds 0 files, so scanning `.tsx` only (B's tool also scans `.jsx`) leaves no field unscanned.

## Scope at the end
- `git status --short`: **26 lines = 24 ` M` + 2 `??`** (`a-round-195/git-status.txt`). The 5 newly modified files are GuestForm and the 4 Sfx files. The 2 `??` are the test file and doc 158.
- Frozen list (1017): `sha256sum -c` OK. `a-round-195/end-sha256.txt` holds the 7 grants and was checked OK. `a-round-195/diff-vs-start.patch` holds the grants against `b-round-194/r195-granted-start/`.

## Acceptance I can honestly mark (A side)
- K0 ✓, K1 ✓, K2 ✓, T1 ✓ (ST8 rows, ST8b per R82, ST8c i–vi plus vii and viii), D1 ✓.
- Red proof ✓. typecheck, lint count and Biome ✓. Live GuestForm proof ✓ (3.70 at 3 viewports). F2 3.64 ✓. Studio rest 0 px ✓.
- Every C row is for C to verify. RECORDINGS-195 is BLOCKED.

## Known gaps
- Recordings and scenes fields have not been measured in a browser (backend unavailable in cloud).
- I measured the Studio rest only at 1440. C runs 1440 and 1280.
- I did not measure the CONTRAST, KEEP or STORE-LAYOUT rows. They are C's.
- Scanner Lows #3–#6 above remain.

## Exact next C checks
1. GUEST-BORDER-195: `/support` → Live Chat at 3 viewports. Expect 3.70 at the four midpoints, a brass border on keyboard focus, and the destructive border after an empty submit.
2. T-RUN-195:
   - T1 on the tree (38 green).
   - T1 on the round-194 copy (7 red; `a-round-195/scratch-r194/` can be reused or rebuilt).
   - Mutants m14–m18.
3. SCOPE-195: 26 lines, frozen OK at both ends, the patch shows one-token swaps only.
4. STUDIO-RV-195 at 1440 and 1280; FIELD-SPOT F1/F2; CONTRAST, KEEP, STORE-LAYOUT; G195-3; PX-NET.
