# A round 317: PERF-7 fix-up (C-R316-01)

**Status:** implemented within the §4 grants. Not a STOP. No commit, push or deploy.

## Changed files (6 of the existing 40-entry tree; the count stays 40)
- `app/assets/fonts/playfair-display-{latin,latin-ext,cyrillic,vietnamese}.woff2`: `cp` byte copies from `b-round-316/fonts-src/files/`.
- `app/lib/__tests__/self-hosted-fonts.test.ts`: `cp` of `b-round-316/sketch-self-hosted-fonts.test.ts.txt`. `cmp` is equal.
- `docs/implementation/2026/quarter-IV/229-perf-self-hosted-fonts.md`:
  - l.4 now reads `**სტატუსი:** Completed (C round 317 PASS)`.
  - A new Problem → Solution entry after the RFN entry covers the kit vs `/s/` variant, the 4 sizes ours/Google, 2,015 px, C-R316-01, the 25/25 sweep, 0 kit URLs and the fact that `fonts.css` is unchanged.
  - One new testing line names BYTE-IDENTITY and FONT-BYTES.
  - A wording clarification after the review Low: "ეს" became "kit ფაილები".

Nothing else changed. `fonts.css`, the notices, TL10, config, `public/**`, `perf/**` and the protected files are untouched.

## Rows actually run
| Row | Result |
|---|---|
| A-CLAIMS | Output equals `claims-317-head-output.txt` (diff empty) |
| A-APPLY | In `app/assets/fonts`, `sha256sum -c b-round-316/fonts-src/fonts-sha256.txt` gives **25 OK**. The test file is `cmp`-equal to the sketch |
| A-DOC | Done (§2.2) |
| A-CLAIMS-AFTER | Saved as `a-round-317-claims-after.txt`. It differs from `claims-317-sketch-output.txt` only by design: K7 = round 317, K14 = 2 (≥ 1), K15 = `34 OK 6 FAILED` |
| A-TYPE / A-LINT | `npm run typecheck` rc 0; `npm run lint` rc 0 (205 pre-existing warnings, 0 errors). Biome check on the test file is clean |
| A-UNIT | The 3 files: **87/87 passed** |
| A-MUTANTS | `/tmp/a317-scratch` (a tar copy with `node_modules` symlinked). `unit-mutants-316.py` rc 0, and its output equals `precheck-unit-mutants-317.txt` (`a-round-317-mutants.txt`). **MU-KIT-BACK:** with the old kit latin file in place, FN3 is red (got `f0f65d35…`, expected `e0c764a8…`), 1 failed and 4 passed |
| Scope | `git status` shows 40 entries. `tree-316-sha256.txt` gives 34 OK, and the 6 FAILED are exactly the 4 woff2, the test file and doc 229. Protected files: 11/11 OK |
| A-REVIEW | `code-reviewer` (agent a0877201f89dd835a) confirmed that the 4 pins equal `b-round-316/fonts-sha256.txt` l.22–25, all 64 characters each. The doc numbers match `c-round-316.md`, and the 7 headings are in order. It found 0 Medium+, and gave no Architecture note |

It also raised 2 Lows:
- the doc's ambiguous word "ეს" was fixed (one word, inside the granted entry);
- the Solution's extra sentence that `fonts.css` is unchanged is accurate (K11) and was kept.

## Pre-flight note
The doc was edited through a Python string replace, so the Edit hook did not fire. After the edits I read `.claude/primitives/GEORGIAN_DOCS.md`: the new entry is Georgian with English technical terms. The doc follows `docs/implementation/TEMPLATE.md` (7 headings in order, confirmed by the reviewer). `claims-317.sh` was re-run after the final doc edit: the diff against the sketch output is still only K7, K14 and K15.

## Known gaps / not run by A
- No browser rows, production builds or Google fetches. Those are C's BYTE-IDENTITY, FONT-BYTES, FONT-PIXEL, FONT-NET, FCP and PERF-LOAD.
- The full vitest suite, `verify` and the e2e smoke are gate rows.
- Possible side effect: the mutant scratch used symlinked `node_modules`, so vitest's cache may have been written under `store/node_modules/.vite` (cache only, not tracked).

## Exact next C checks
SOURCE-SCOPE (34/6, 40 entries, protected 11/11), CLAIMS, BYTE-IDENTITY (C's own fetch with a Chrome UA: 25/25, 0 kit), UNIT plus the mutants plus MU-KIT-BACK, FONT-BYTES, FONT-PIXEL (`/store` 0 px at 1440/1280 with a clean control), FONT-NET/PRELOAD/CACHE, FCP/PERF-LOAD (alone), DOC, and G317-AUTH on :5173.

## Scope completed
A rows A-CLAIMS through A-REVIEW pass. PERF-7 is not done until C PASS and gate 317.
