# A round 92 — SRW-21 stage 1: purchased-collection adapter + origin-aware workspace copy (D-29z57)

Implementer: A (Claude Opus 5.5) · 2026-10-22 · Task: `current-task.md` (round 92). No commit, push, deploy, install or server start/stop.

## Baseline (verified before the first edit)
HEAD `77cd5b668bb5…` · `git status --short` empty · frozen `b-round-91-r92-tree-sha256.txt` 513/513 OK · owned hashes `d90699d8` / `2b8b8639` / `bd76912d` · CR=0.

## Changed files (end state: 3 M + 5 ??, frozen 513/513 still OK)
| File | Status | sha256 prefix | What |
|---|---|---|---|
| `app/lib/arrangement/collection.ts` | ?? | `210cfdc0` | P1: `workspaceCollectionCopy`, `createPurchasedWorkspaceCollection`, `WorkspaceCollectionCopy`, `PurchasedWorkspaceCollectionInput`, `PurchasedStemFetch` (type of `fetchAudio`). Type-only imports from `~/types/arrangement` and `~/types/audio`. |
| `app/components/arrangement/StudioWorkspace.tsx` | M | `1270f6c5` | W1: one import; h1 text node → `` {`${workspaceCollectionCopy(collection.origin).heading} `} `` (a template literal, so SSR emits one text node: the dev-server HTML is `CZABA Studio Lab <span class=…>`, the same as HEAD and without `<!-- -->`); badge text → `.badge`. No class or element change. |
| `app/contexts/ArrangementContext.tsx` | M | `140f17ec` | X1–X3: import (l.24); status initializer (l.533); load-effect ready/failed (l.3014–3015); WAV name (l.2723–2724); MP3 names (l.2907, 2913, 2919); deps `[collection.origin, exportProgress]` (l.2750, l.2956). |
| `app/lib/arrangement/__tests__/collection.test.ts` | ?? | `456335d4` | PC1–PC9, plus PC10 (body-read failure, added after review). 14 tests. |
| `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` | ?? | `637d9d88` | PW1–PW6. 6 tests. Stubs copied from `grid-snap-ui`, nothing imported from test files. |
| `docs/implementation/2026/quarter-IV/079-…md` | M | `2d95af25` | l.4 only → `**სტატუსი:** C PASS (Round 91), გამოქვეყნდა 77cd5b6 (D-29z56)` |
| `docs/implementation/2026/quarter-IV/080-studio-workspace-purchased-collection-readiness.md` | ?? | `72b7fd89` | New, per TEMPLATE (all sections), status `Round 92 — C-ის შემოწმებას ელოდება (D-29z57)` |
| `docs/technical/arrangement-workspace.md` | ?? | `e6465055` | New mount guide |

**Diff-scope note for C (SOURCE-UNCHANGED):** two inserted lines are the `const { fileStem } = workspaceCollectionCopy(collection.origin);` reads inside `exportWav` (new l.2723, before HEAD l.2722) and `exportMp3` (new l.2907, between HEAD l.2904 `try {` and l.2905 `const files = [`). The task requires them ("read `fileStem` … inside `exportWav` / `exportMp3`"). They sit next to, not on, the listed line numbers. Every other hunk is on a granted line. `grep -rn "lib/arrangement/collection" app/routes` is empty.

## Adapter behaviour beyond the literal spec (flag for B)
- A rejection of `response.arrayBuffer()` is handled like a fetch rejection: when aborted, the original error is rethrown; otherwise it becomes `ფაილი ვერ ჩაიტვირთა (ქსელი)`. The spec only said "return `ctx.decodeAudioData(await response.arrayBuffer())`"; without this, a body-stream error could reach the library row as `ფაილი ვერ გაიშიფრა`, or carry a raw message. Covered by PC10 and mutation i.
- The validation error texts (Georgian, no URL) are A's wording; the spec only required `Error`.

## Tests actually run (speed rules: no full suite, no `npm run verify`)
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0. The repo has 218 warnings and 1 info, all outside owned files. Scoped `npx biome check` on the 5 owned code/test files → clean. `npx biome lint` → `a-round-92/biome-lint-owned.txt` (clean).
- Formatting: the two new test files were formatted through `biome format --stdin-file-path` to stdout, then copied over. No `--write` anywhere.
- Targeted vitest (`a-round-92/targeted-list.txt`, 68 files: every `__tests__` file that mounts `StudioWorkspace`/`ArrangementProvider`, all `export-*`, `library.test.ts`, both new files) → **68 files / 1126 tests PASS** (`a-round-92/targeted-vitest.log`, final run after the review fixes). No frozen test went red. `export-dialog-footer` FT2 still sees `czaba-studio-lab.wav`.
- Mutation proofs run in the scratch copy `a-round-92/mut/` (own `vitest.config.ts`, `cacheDir` in the scratch folder), script `a-round-92/run-mutations.py`, results in `a-round-92/mutation-results.json`. Final run with the final tests:

| ID | Mutation | Red | PW6 |
|---|---|---|---|
| a | no `signal` | PC3, PW4 | green |
| b | `headers: { Authorization }` | PC3 | green |
| c | URL in HTTP error | PC5 ×4, PW3 | green |
| d | purchased badge = demo badge | PC9, PW1 | green |
| e | ready literal hardcoded to demo | PW2 (also PW5, which waits for ready) | green |
| f | `fileStem` hardcoded `czaba-studio-lab` | PW5 | green |
| g | empty `stems` accepted | PC2 | green |
| h | no sort by `order` | PC1 | green |
| i (extra) | aborted body-read error wrapped | PC10 | green |

- **A smoke (not C evidence)**, Playwright Chromium, 1440×900, storage state `a-browse.json` (read only), warm-up `/` first, existing `:5173` server. Results in `a-round-92/smoke/smoke.json`; screenshots `a92-1440-ready.png` and `a92-1440-export-done.png`:
  - loading status seen `დემო კოლექცია იტვირთება…`;
  - h1 `CZABA Studio Lab · სამუშაო სივრცე`, badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`, ready text exact, title `Studio Lab — დემო სამუშაო სივრცე | CZABA`;
  - one WAV export downloads `czaba-studio-lab.wav` (RIFF/WAVE, 2 ch, 48000, 24-bit) with done text `WAV შეიქმნა: 00:02.000, 24-bit · 48 kHz · stereo.`;
  - 0 Authorization headers, audio requests only `/middle-east.mp3` and `/videos/hero/hero-music.mp3`, 0 non-noise console errors (2 cart/connection noise).
  - The smoke ran twice: before the review fixes, and again after the h1 template-literal change.

## Code-reviewer (actual subagent `code-reviewer`, 9/10, no Critical/High/Medium)
Findings and what I did:
- **Low 1:** the `arrayBuffer()` failure branch had no test → **fixed**: PC10 added, plus mutation i.
- **Low 2:** the purchased MP3 names are not test-backed → **documented** in doc 080 as code-only (PW5 covers WAV, as the spec asked). Not fixed by a test this round.
- **Info 4:** `{heading}{' '}` made SSR emit `<!-- -->` → **fixed**: a template literal gives one text node. Dev-server SSR HTML is `CZABA Studio Lab <span …`, as at HEAD.
- **Info 5:** the doc said the "loader" stems carry the token → **fixed**: the route's client effect appends `?token=` after `/api/studio-token`.
- **Info:** PC2 asserts only `toThrow(Error)`, which is spec-compliant. The provider does not reset status when the collection prop changes; that is pre-existing, and the mount guide recommends `useMemo`. Both are kept as signals.
- The reviewer could not run a shell; it compared against B's snapshots. Hunk scope and token-leak paths were confirmed by reading the code.

**Architecture note (verbatim from reviewer, for B; not acted on):**
> - **Signal 2, coupling** (`ArrangementContext.tsx:24`, `StudioWorkspace.tsx:19` → `app/lib/arrangement/collection.ts`): the new pure `lib/` module is used in one direction only by the context and the component. No state, ref or lifecycle moves between owners, and there is no two-way dependency. **Keep**, because it removes duplicated hardcoded copy, and the invariants (audio timing, refs, gestures, Undo/Redo, the `useArrangement()` shape) are untouched.
> - **Mild signal 1, mixed responsibility inside `collection.ts`:** the UI copy table (l.4-33) and the network adapter (l.35-118) share one file. **Keep, because** VISUAL-A V-0 is already planned to move Studio copy into one strings module. Splitting now would be a one-off move. **Proposal for planner (not this round):** when V-0 lands, move `workspaceCollectionCopy` and `WorkspaceCollectionCopy` into the V-0 strings module, leave `createPurchasedWorkspaceCollection` in place, and accept only if PC9, PW1, PW2 and PW6 plus the frozen `export-*` name tests pass unchanged.
> - **Signal 4:** absent. The provider gains no new state, effect, timer or listener. COLLECTION-EMPTY-STATUS is already recorded and is not new.

## B acceptance criteria (only what A truly passed)
- P1 (a) copy table, exact values: PASS (PC9; demo strings checked against HEAD by grep).
- P1 (b) factory, validation, shape, private URL map, request init, errors without URL/token, lazy fetch: PASS (PC1–PC8, PC10).
- W1 header, X1 status, X2 file names, X3 import: PASS (PW1, PW2, PW3, PW5, PW6, smoke). Purchased MP3 names are code-only (see Low 2).
- New tests and mutations a–h: PASS (plus i).
- Docs (079 l.4, 080, `arrangement-workspace.md`): written.
- Checks: typecheck, lint, scoped Biome, targeted vitest: PASS.
- Code-reviewer run and findings addressed: yes.
- **Not claimed:** any C browser row (DEMO-COPY, DEMO-LOAD, EXPORT-NAMES, PX-NET, REG-HYD, G92-3, PC-REVIEW) and any gate row (full vitest, build, verify, e2e smoke, production bundle). I did not run the build.

## Known gaps
- The whole purchased path is unit-only. The route mount stays blocked by the auth owner, and the purchased Studio still uses `StudioContext`.
- Purchased MP3 file names have no dedicated test.
- COLLECTION-EMPTY-STATUS (Low, provider) is still open, as is the status not resetting on a collection swap (pre-existing).
- The hardcoded `middle-east` loader is a mount prerequisite (documented).
- `store/node_modules/.vite` is written by the running dev server and by the project's own vitest config during the targeted runs in `store/`. Only the mutation runs used the scratch `cacheDir`, as required.

## Exact next C checks
1. SOURCE-UNCHANGED: HEAD `77cd5b6`; 3 M + 5 ??; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-91-r92-tree-sha256.txt` 513/513; end hashes above; `git diff -U0` of the 3 M files, with the two `fileStem` insertion lines noted above; routes grep empty; protected hashes.
2. DEMO-COPY at 1280 and 1440: h1/badge/ready exact, title, library notice, one-line rects without Master overlap.
3. DEMO-LOAD: hold `**/middle-east.mp3` → `დემო კოლექცია იტვირთება…` → release → ready. Abort `**/videos/hero/hero-music.mp3` → `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.` plus the `შეცდომა: …` row.
4. EXPORT-NAMES: all four demo names, files parse, done texts.
5. PX-NET, REG-HYD (SSR now emits the h1 as a single text node), G92-3.
6. PC-REVIEW: re-run mutations b and f with `a-round-92/run-mutations.py b f` (scratch copy `a-round-92/mut/`; copy the current store files in first). The purchased path is unit-only.
7. T92-TARGETED: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-92/targeted-list.txt)`.

## Scope completed
SRW-21 stage 1 (A part) is implemented and self-checked. It waits for C. The backlog is not marked complete.
