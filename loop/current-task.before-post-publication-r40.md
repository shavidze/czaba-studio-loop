# CURRENT TASK — Round 41: C bug from the round-40 record — the disabled-control reasons are visible in every real state (C-R40-01), plus the detail content scrollbar and the doc 038 stale lines

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-14
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorisation 2026-10-13).
- Decision record: **D-29z6** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-40.md`.
- Round size: **one C bug (C-R40-01)** in **one source file** (`ArrangementDetailPanel.tsx`), with its scroll-affordance part, plus one related doc fix (DOC038-STALE-LINES) in the doc this round edits anyway. No new feature.

> **Environment prerequisite (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B time (2026-10-14 18:3x). It was down 16:55–17:18 during round 40. If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load and browse daemon:** `node.exe` was **28** during B's gates. In round 40 the gstack browse daemon twice failed to start within 15 s and stopped answering after 18:05 (ENV-BROWSE-DAEMON). Every A and C run records `tasklist | grep -ci node.exe`. If the daemon fails, record it, do the offline IDs, retry once with a fresh state file, and never weaken a criterion.

## Why this round

**Round 40 result** (`c-round-40.md`, `c-round-40.json`): **C PASS on every contracted ID** — G40-1..3 (`npm run verify` exit 0, 72 files, 1319/1319), R40-S, R40-U (mutations a–i), R40-Doc, R40-PM (all 9 cases), R40-INFO, R40-MN-1..6, R40-CR, R40-K. Closed: **C-R39-01, C-R30-01, C-R37-01**. 4b-2 group 1 is complete.

The measurement-only item DETAIL-REASON-FIT became **C-R40-01 (Low, C evidence, pre-existing layout)**. The workflow puts C bugs first, so it is this round:

| State (fresh load, C's numbers) | Panel / scroller client | Clip Gain reason clipped | Range reason clipped |
|---|---|---|---|
| video, 1440 | 144 / 107 | **21 px** (3 lines, 48 px) | — |
| video, 1280 | 142 / 105 | **23 px** | — |
| group (REAL Ctrl+A), 1440 | 144 / 107 | **21 px** | 0 |
| group, 1280 | **122** / 85 | **43 px** | **21 px** |
| video, 120 px minimum, 1440 | 120 / 83 | **45 px** | — |
| none, 1440 and 1280 | 144/107, 142/105 | 0 (1 line) | 0 (1 line) |

The content scrolls, but no scrollbar is visible, so in the default view the end of the reason (`ხაზის Volume/Mute`) is invisible (`c-round-40/shots/rs-vid-1440-crop.png`).

**Why the reason leaves its column** (B's arithmetic from C's numbers; D-29z6):
- No string length fixes every real state. In the 1280 group state the reason `<p>` starts ≈ 80 px down a column whose visible part is 77 px, so even a one-line reason is clipped ≈ 11 px, and ≈ 13 px at the 120 px minimum.
- Moving the reason above the disabled `0 dB` button still clips 15 px in the 1280 group state.
- `truncate` + `title` stays rejected (D-29z5 f): it hides the reason from keyboard and touch users.
- A scrollbar alone is not the fix: headless Chromium does not paint scrollbars (`c-round-4.md` R23-1), and in the video state the enabled range inputs keep the scroller from being keyboard-scrollable.

**B's measurement** (gstack `/browse`, 1440×900, default height, none state; `b-round-40/measure-none-1440.txt`; read-only, no DOM change):

| Quantity | px |
|---|---|
| panel / scroller `clientHeight` / `scrollHeight` | 144 / 107 / 107 |
| info column | 288 × 91 |
| **middle box** (empty in none/group; the waveform box for a clip) | **500 × 91** |
| range column / Clip Gain column | 176 × 91 / 128 × 91 |
| nowrap width: video reason / group Clip Gain / group range / none / video placeholder | 345.5 / 320.6 / 256.3 / 114.4 / 180.8 |
| middle box at 1280 (from C's round-40 coordinates: info ends 588, range starts ≈ 952) | ≈ 340 |

**Fit check:**
- Group at 1280, with the 10 px gutter: box ≈ 330, inner ≈ 312. So the range reason takes 1 line and the Clip Gain reason 2 lines. Total 8 + 16 + 2 + 32 = **58 ≤ 69** px visible.
- Video at 1280 and at 120 px: placeholder 16 + gap 4 + reason 32 = **52 ≤ 67** px.
- At 1440 every reason takes one line.

## Baseline

B verified on 2026-10-14 18:37 (`b-round-40/gates.txt`):
- HEAD **`6c7b4bb`**. Root has not committed rounds 39–40. `git status --short` shows **6 paths** plus root's **17 untracked `.codex/agents/*.toml`**:

| Status | Path | sha |
|---|---|---|
| ` M` | `app/contexts/ArrangementContext.tsx` | `91fa12d6` |
| ` M` | `app/components/arrangement/ArrangementDetailPanel.tsx` | `dbcd5c2f` |
| ` M` | `docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md` | `9d9f2122` |
| `??` | `app/lib/arrangement/__tests__/pending-status.test.tsx` | `f2cd4b53` |
| `??` | `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` | `dac18003` |
| `??` | `docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md` | `947d9f83` |

  Each sha equals the one C verified in round 40.
- **New frozen list:** `../tmp/studio-real-loop/b-round-40-tree-sha256.txt` → **384 OK** (round 39's 383 plus `detail-panel-fit.test.tsx`).
- Protected files: 4/4 OK. tsc 0. vitest: **72 files, 1319/1319**.
- Biome `./app` (C round 40): **2 errors**, both the root CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. **Do not touch them.** There are also 218 warnings and 1 info. Your files must add 0 errors and 0 warnings.
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-40-snapshots/`, `SHA256SUMS.txt` inside): `ArrangementDetailPanel.tsx` `dbcd5c2f`, `038-studio-lab-pending-status.md` `947d9f83`.
- **If root has committed rounds 39–40 before you start:** record the new HEAD. Check three things:
  - the commit contains exactly those 6 shas;
  - the 384 list is still OK;
  - your 2 files equal their snapshots.
  If any differs, **stop and report**.
- Do not touch new untracked paths; record any you see. `.kilo/` shows only as ignored.

**Rules:**
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `.kilo/**`, `AGENTS.md` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 The contract (D-29z6), `ArrangementDetailPanel.tsx` only

**A. Reason placement (C-R40-01).** States are those of `ArrangementDetailContentInner`:
- **group** = `!clip && group`;
- **video** = `clip && selection.isVideo`;
- **none** = `!clip && !group`;
- **audio** = `clip && !selection.isVideo`.

| State | Range reason `<p>` (`arrangement-detail-reason`) | Clip Gain reason `<p>` (`arrangement-detail-clip-gain-reason`) |
|---|---|---|
| **group** | In the **middle box** (`content.children[1]`, today an empty `div`), **first** | In the middle box, **after** the range reason |
| **video** | none (unchanged: a clip is selected) | In the **waveform box** (`arrangement-detail-waveform`), **below** the video placeholder text, in one centred stack |
| **none** | **Unchanged**: in the range column, after `მონიშვნა` | **Unchanged**: in the Clip Gain column, after the `0 dB` row |
| **audio** | none | none. The waveform, overlay, playhead and pending marker are unchanged |

**Middle box (group and none):**
- The existing empty `div` keeps its classes and adds `flex flex-col gap-0.5 px-2 py-1`, so content starts at the top.
- In the none state it stays empty.

**Video waveform box:**
- `ArrangementDetailWaveform` gets one optional prop for the reason node, e.g. `videoReason?: ReactNode`; choose a discoverable name.
- The video branch renders one absolute layer, `absolute inset-0 flex flex-col items-center justify-center gap-1 bg-elevated px-2 text-center`, containing:
  1. a `<p className="text-muted" data-testid="arrangement-detail-video-placeholder">` with `DETAIL_VIDEO_PLACEHOLDER`. Its `textContent` stays **exactly** `ვიდეოკლიპი · ტალღა არ ჩანს`;
  2. the reason node.
- The reason is **not** inside the placeholder element. The waveform box's own `className` is unchanged (frozen `WAVEFORM_BOX_CLASS`).

**Each moved `<p>` keeps:**
- its `id` (`reasonId` / `clipGainReasonId`);
- its `data-testid`;
- `className="text-dim"`;
- its exact text.

It gets **no** `truncate`, **no** `title`, and no new attributes.

**Unchanged:**
- every input's and button's `disabled`, `title` and `aria-describedby`;
- the Tab order;
- the `0 dB` row and the pending marker (D-29z5);
- the range Apply;
- the info column;
- the `key` remount;
- the wheel handler.

**B. Scroll affordance.**
- The content scroller (`data-testid="arrangement-detail-content"`) uses `cn('flex min-h-0 flex-1 gap-3 overflow-y-auto px-3 py-2', STUDIO_SCROLLBAR_CLASS)`.
- Import the constant from `./studio-scrollbar`, the same one Library and Workspace use. `studio-scrollbar.ts` itself is frozen.
- `[scrollbar-gutter:stable]` reserves 10 px in every state:
  - the `shrink-0` columns keep their widths (info 288, range 176, Clip Gain 128);
  - the `flex-1` middle box narrows by 10 px;
  - selection changes no longer shift the layout.
- Panel height and lane geometry are unchanged.

**Smallest-honest rationale (record in doc 038):**
- The none state stays in the columns. Both reasons are one line and fit at the default heights (C RS-NONE: 0 px). The info column's first line, `აირჩიე კლიპი, რომ დეტალები ნახო`, always shows the same instruction at the top.
- Putting `ჯერ აირჩიე კლიპი` twice into the middle box would only duplicate it.

**Rejected (D-29z6):**
- (a) shorter reason strings: the frozen tests pin the text, and even one line does not fit in the 1280 group state;
- (b) `truncate` + `title` (D-29z5 f);
- (c) the reason above the disabled button in the same column: it still clips 15 px at 1280 group;
- (d) a fixed reason row above or below the scroller: it takes 16+ px from an 85 px scroller;
- (e) the panel header: it competes with the selection title and stays visible when the panel is collapsed;
- (f) a larger default height (D-29j);
- (g) the scrollbar alone.

**Out of this round** (queued, not deferred scope):
- round 42: Pan group (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES);
- round 43: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH;
- round 44: MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER;
- then 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY;
- polish: SSR-LAYOUT-EFFECT-WARN, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE;
- DETAIL-RESET-SHRINK (info; no measured defect);
- then SRW-14..20 (FB-13, FB-09/11, FB-10, FB-12, FB-06, FB-07), the SRW-21 adapter, the full regression, T12.

**Out of scope for the whole project:** plugins and effects (including compressor, limiter and normalise), pitch, multiple video layers, and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks):**
- the frozen suites `detail-panel-fit`, `pending-status`, `clip-gain`, `detail-panel`, `detail-panel-polish`, `track-layout`, `delete-selection-ui`, `floating-video`;
- the detail panel geometry at 1440×900 and 1280×720;
- the video placeholder;
- the info column scroll in the 1280 group state;
- the Clip Gain marker row.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-test.md` and `prompts/studio-feature.md`;
   - then run the `pre-flight` skill.
2. **Check the baseline and report it before any edit:**
   - HEAD and `git status --short`;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-40-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - your 2 files against the snapshot shas;
   - protected 4/4;
   - `node.exe`.
3. **Read:**
   - `ArrangementDetailPanel.tsx`: l.41–57 (the constants), l.153–216 (`ArrangementDetailWaveform`), l.229–330, l.392–568 (the content markup);
   - `studio-scrollbar.ts`;
   - `detail-panel-fit.test.tsx` F5;
   - `clip-gain.test.tsx` l.760–800;
   - `detail-panel.test.tsx` l.390–420;
   - `detail-panel-polish.test.tsx` l.120–130, l.330–420;
   - `pending-status.test.tsx` PM5 (l.500–515);
   - `c-round-40.md` §3 and §4;
   - `b-round-40/measure-none-1440.txt`.
4. **Re-check (report each):**
   - Grep **every** test file under `app/lib/arrangement/__tests__/` for:
     - `arrangement-detail-reason`, `arrangement-detail-clip-gain-reason`, `arrangement-detail-video-placeholder`, `arrangement-detail-waveform`, `arrangement-detail-content`;
     - `firstElementChild`, `children[`, `parentElement`, `within(`, `bg-elevated`.
   - **Stop and report** (do not amend the test) if any test pins one of these:
     - the old position of a reason (inside a column, or relative to a sibling);
     - the placeholder element's class, tag or parent;
     - the exact `className` of the content scroller or of the middle box;
     - `content.children.length`.
   - Report the `firstElementChild` users. The info column must stay `content.firstElementChild`.
   - Run `npx biome check app/components/arrangement/ArrangementDetailPanel.tsx` before and after: no new diagnostic.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `ArrangementDetailPanel.tsx`

The diff is limited to:
- the `STUDIO_SCROLLBAR_CLASS` import and the scroller's `cn(…)`;
- the optional reason prop of `ArrangementDetailWaveform` and its video-branch layer (§0.1 A);
- where the two reason `<p>` elements render (group: middle box; video: the waveform prop; none: unchanged);
- `flex flex-col gap-0.5 px-2 py-1` on the middle box.

Build each reason `<p>` once and place it by state. Do not duplicate the JSX with diverging attributes.

**Rules:**
- Tokens only. No hardcoded colours, no custom CSS, no new arbitrary values (the imported constant is existing code), no inline styles.
- No comments, no new exports, no `any`, no type assertions.
- Semicolons.
- Nothing else in the file changes.

### 2.2 Doc 038 (narrow)

1. The `**სტატუსი:**` line → `Round 40 C PASS (D-29z5); Round 41 — D-29z6 (C-R40-01).`
2. **l.45** (the contract table): replace "`0 dB` ღილაკის ქვემოთ ჩანს `შეუნახავია — Enter ინახავს, Esc აბრუნებს`" with the round-40 truth. The `0 dB` button row shows `შეუნახავია`. The rest of the text is in `sr-only` and `title`, so `textContent` and the description are the full string.
3. **`## TODO / შემდეგი ნაბიჯები`:** rewrite it as the current list:
   - groups 2/3/4 → rounds 42/43/44;
   - 4c;
   - polish without C-R30-01, which is closed;
   - remove the closed "ნიშნის მესამე ხაზის ჩამოჭრა" and the rejected live-region item;
   - keep SSR-LAYOUT-EFFECT-WARN;
   - the round-40 R40-RS line → "C-R40-01 — Round 41 (D-29z6)";
   - Tech Lead R38-T;
   - add R23-1 for the detail scroller.
4. A new section **`## Round 41 — გამორთული ველების მიზეზი ყოველთვის ჩანს (D-29z6)`**:
   - the bug with C's table;
   - B's measurement and the fit check;
   - the contract (state table, scroller);
   - the none-state rationale;
   - rejected a–g;
   - the files;
   - the tests (red/green);
   - the C IDs;
   - the Ableton table (§4.8).

Write it in Georgian per `GEORGIAN_DOCS.md`. Nothing else changes; the earlier rounds' sections stay as history.

### 2.3 Tests (red-first, in `store/`)

**New file:** `app/lib/arrangement/__tests__/detail-panel-reason.test.tsx`.
- Mount it the way `detail-panel-fit.test.tsx` / `clip-gain.test.tsx` do. Copy what you need; do not import from another test file.
- jsdom has no layout. These tests pin the **placement contract**; C's browser run is the geometry evidence.
- Write every case first, run it against the **current** source, and record red/green per case in `a-round-41/red-run.txt`.

**Helpers:**
- `content` = `getByTestId('arrangement-detail-content')`;
- `middle` = `content.children[1]`;
- `rangeColumn` = the child of `content` that contains `arrangement-detail-start`;
- `clipGainColumn` = `arrangement-detail-clip-gain`.

| ID | Case | Expected | Old source |
|---|---|---|---|
| RF1 | Group selection (two clips) | `middle` contains the range reason and then the Clip Gain reason (`compareDocumentPosition` → FOLLOWING). Neither reason is inside `rangeColumn` or `clipGainColumn`. Their texts are exactly `range ერთ კლიპზე ისმება — აირჩიე ერთი` and `Clip Gain ერთ აუდიო კლიპზე ისმება — აირჩიე ერთი`. Start/end `aria-describedby` = the range reason `id` (non-empty). The Clip Gain input's `aria-describedby` = the Clip Gain reason `id` | red |
| RF2 | Video clip selected | `arrangement-detail-waveform` contains the Clip Gain reason. The placeholder's `textContent` is exactly `ვიდეოკლიპი · ტალღა არ ჩანს`, and `placeholder.contains(reason)` is false. The placeholder and the reason have the same parent. `clipGainColumn` does not contain the reason. The input's `title` and `aria-describedby` point at the reason | red |
| RF3 | Must-not: nothing selected | The range reason is in `rangeColumn` and the Clip Gain reason is in `clipGainColumn` (both `ჯერ აირჩიე კლიპი`); `middle` contains no reason | green |
| RF4 | Must-not: audio clip selected; type `3` | No reason test id in the DOM. The waveform contains no `p`. The pending marker is in `clipGainColumn`, in the reset button's row | green |
| RF5 | Any state | `content.classList` contains every token of `STUDIO_SCROLLBAR_CLASS.split(' ')` (imported from `~/components/arrangement/studio-scrollbar`) and `overflow-y-auto` | red |
| RF6 | Must-not: group, then video | Each visible reason `<p>`: `className` is exactly `text-dim`, there is no `title` attribute, and the text is whole | green |

**Rules:**
- no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards only), no comments;
- exact strings come from the rendered DOM, or from the source where they are exported;
- no snapshot tests;
- no timers.

### 2.4 After the code

- **Self-check:** run the frozen suites of §4.7 and the full `npx vitest run` (1319 plus your new `it` count).
- **Biome:**
  - run `npx biome check --write` **only** on your 2 TS/TSX files;
  - then run a read-only `npx biome check ./app`;
  - expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent. Report its findings and your dispositions.
- **Browser smoke** (A; one run if the server is up; `a-browse.json`; not a PASS claim). On a fresh load at 1440×900 with nothing selected and the panel open, record:
  - the scroller `offsetWidth − clientWidth` (expect 10) and the computed `scrollbar-gutter`;
  - the 4 column widths (expect 288 / 490 / 176 / 128);
  - the panel height (144).
- **Mutations:** only in a scratch copy outside `store/`. They are C's job; A may skip them.
- **`/check`:** run `npm run verify`. Do not run `npm run test:e2e:smoke`: it starts its own dev server.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `6c7b4bb` with the 6 round-39/40 paths and root's 17 `.codex` lines, or a newer root commit that contains exactly those shas.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.1 only |
| `app/lib/arrangement/__tests__/detail-panel-reason.test.tsx` | A | new (§2.3) |
| `docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md` | A | §2.2 only |
| `../tmp/studio-real-loop/a-round-41.md`, `a-round-41/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-41.md`, `c-round-41.json`, `c-round-41/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

- `a-round-40/`, `c-round-40/` and `b-round-40/` are read-only.
- **Expected `git status --short` at the end** (root has not committed): today's 6 lines **plus** `?? app/lib/arrangement/__tests__/detail-panel-reason.test.tsx`, and root's 17 `.codex` lines. If root committed first: ` M` for the panel and doc 038, and `??` for the new test.

### 3.3 Frozen this round

- All **384** files in `b-round-40-tree-sha256.txt`, and everything else under `store/`.
- This includes:
  - `studio-scrollbar.ts`, `ArrangementContext.tsx`, `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `panels.ts`;
  - every existing test file (`detail-panel-fit`, `pending-status`, `clip-gain`, `detail-panel`, `detail-panel-polish` …);
  - docs 001–037.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting earlier work;
- in-place mutation of `store/` files for experiments;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:**
- 1440×900 and 1280×720, each a **fresh load** (`viewport`, then `goto`, then the setup chain).
- Expand the detail panel with a REAL click on `arrangement-detail-toggle`; check `aria-expanded` first.
- **Canonical fresh-load baselines:** 1440: panel 144 / first lane 235; 1280: panel **142** / first lane **273** (C's round-40 correction).

**Harness rules (unchanged):**
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC** (label it): pointer events at computed coordinates, the separator gesture (id 41), window `pointerup`/`blur`, `blur()`, `.focus()`, and `scrollTop`.
- C may read state through the existing `window.__c` reader and the round-40 `geo40.js`; label them.
- No source instrumentation. Mutations run only in a scratch copy outside `store/`.
- Every run and gate records `node.exe`.

**Layout L41** = L40: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4.

**Geometry reader:** `geo40.js` extended with:
- each reason `<p>` rect and its ancestor box (middle / waveform / column);
- the placeholder `<p>` rect;
- the reason line count (height / 16);
- the scroller's `offsetWidth − clientWidth` and its computed `scrollbar-gutter`;
- the 4 column widths.

**"Visible"** means:
- the rect lies fully inside its box rect;
- **and** fully inside the scroller's visible rect at `scrollTop` 0 (`top ≥ scroller.top + 0`, `bottom ≤ scroller.top + clientHeight`).

**Checkpoint order if the session may end:** G41-2 → R41-S → R41-RV → R41-SB → R41-NONE → R41-U → R41-PM → R41-MN → the rest. Write `c-round-41/checkpoint.md` as you go.

### 4.1 R41-RV — the reasons are visible (REAL selection)

| Case | Steps | Expected |
|---|---|---|
| RV-VID-1440 | 1440, default height. REAL click on the video clip header | The Clip Gain reason is **visible** inside `arrangement-detail-waveform`, below the placeholder (`placeholder.bottom ≤ reason.top`). Both lie inside the box with no overlap. 1 line expected (record it). The full text is visible. The Clip Gain column contains no reason. The input is disabled, `title` = the reason, `aria-describedby` → the reason id. Panel 144 / lane 235 unchanged. Screenshot |
| RV-VID-1280 | The same at 1280 | As above. 2 lines expected (record), both visible. Panel 142 / lane 273 |
| RV-GRP-1440 | REAL ruler click + REAL Ctrl+A (C's round-40 method; name it) | Both reasons are **visible** in the middle box: range first, then Clip Gain, no overlap. The range and Clip Gain columns contain no reason. The inputs are disabled with unchanged `title`s and `aria-describedby`. Screenshot |
| RV-GRP-1280 | The same at 1280 (panel 122, content 85) | Both reasons visible at `scrollTop` 0 (round 40: clipped 43 / 21 px). Record the line counts. Screenshot |
| RV-MIN | 1440: SYNTHETIC `.focus()` on the separator + REAL ArrowDown to **120**. Then video, then group. Repeat the video case at 1280 / 120 | Every reason is visible at `scrollTop` 0 (round 40: video 45 px clipped). Record the numbers |
| RV-SWITCH | REAL clicks: SFX header → video header → empty lane area (none) → Ctrl+A group → SFX header | At each step a reason exists only in the place §0.1 names. The audio state has no reason, and the SFX waveform box contains no `p`. Nothing stale remains |

### 4.2 R41-SB — the scroll affordance (computed; the visual is the Tech Lead's)

| Case | Expected |
|---|---|
| SB-1 | The scroller's computed `scrollbar-gutter` = `stable`; `offsetWidth − clientWidth` = **10** (as library in `c-round-4.md` R23-1). The stylesheet contains the `::-webkit-scrollbar` rules for the scroller's classes (C's R23-1 method: thumb `bg-dim`, track `bg-surface`, buttons hidden) |
| SB-2 | Column widths, none state, 1440: info 288, middle **490** (B: 500 before), range 176, Clip Gain 128. At 1280, record them (middle ≈ 330) |
| SB-3 | R40-INFO repeated in the 1280 group state: the info lines are each 16 px, with no overlap; SYNTHETIC `scrollTop = max` reaches the last line |
| SB-4 (record only) | 1280 group state, all controls disabled: does a REAL Tab reach the scroller (`document.activeElement` = the content)? If so, does a REAL ArrowDown scroll it? This is Chrome-native keyboard-focusable-scroller behaviour: record it, with no PASS/FAIL |

The scrollbar's visual look is not paintable headless. It is added to Tech Lead **R23-1** (detail panel, 1280×720 group state).

### 4.3 R41-NONE — must-not

At 1440 and 1280, default height, nothing selected:
- both reasons are in their columns, 1 line each, **clipped 0** (as R40 RS-NONE);
- the middle box is empty;
- the panel height is unchanged.

At the 120 px minimum, record the none state: the info hint is visible at the top, and record the reason clip in px. This is a record, not a FAIL, because the same instruction is visible in the info hint.

### 4.4 R41-PM, R41-MN, R41-K (1440, regression)

| ID | Expected |
|---|---|
| PM-1 | SFX + REAL type `3`: the marker `<p>` is 1 line, `scrollWidth ≤ clientWidth`, width ≥ 69. Scroller `scrollHeight` after = before. **Same centre ±2 px** as the `0 dB` button (C's round-40 wording). Ring `rgb(245, 158, 11)` |
| PM-2 | REAL Enter → +1 `Clip Gain`, no marker |
| MN-1 | Video selected: REAL Tab order from the range start field → end → `მონიშვნა` → the next control. Record it; it must equal round 40 (disabled Clip Gain/`0 dB` are skipped) |
| MN-2 | CR-1: Clip Gain `3` → REAL click on music Volume → `[…, Clip Gain]`, focus on music Volume |
| MN-3 | PG-DEL: SFX selected → REAL music Volume → REAL Delete → nothing deleted |
| MN-4 | Range Apply on the video clip (REAL inputs + REAL Apply) → `მონიშვნა: …` status; the overlay is in the waveform box together with the placeholder and the reason (record the overlap; the overlay is `pointer-events-none`) |
| K | Mute: 1 entry. REAL Space with focus on music Volume toggles playback, and a second Space stops it |

### 4.5 R41-S, R41-U, R41-Doc

**R41-S** (static, read-only): `diff -u` of `b-round-40-snapshots/` against the live files.
- **`ArrangementDetailPanel.tsx`:** only the §2.1 items.
- **Doc 038:** only the §2.2 parts.
- 384 OK; the new test file exists.
- No `any`, no `@ts-ignore`, no type assertion, no new `//` comment, no hardcoded colour, no new arbitrary value (the imported `STUDIO_SCROLLBAR_CLASS` is existing code), no inline style.

**R41-U:**
- The new tests are green, and A's red run matches §2.3: RF1, RF2 and RF5 red on the old source; RF3, RF4 and RF6 green.
- `detail-panel-fit` (7), `pending-status` (22), `clip-gain` (28), `detail-panel` (24) and `detail-panel-polish` (16) are green **unchanged**.
- **Mutations** run in a scratch copy outside `store/`. Each one must make a test fail; report which.

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | Group reasons left in their columns | RF1 |
| (b) | The video reason left in the Clip Gain column | RF2 |
| (c) | The video reason rendered inside the placeholder `<p>` | RF2 (and `detail-panel` l.416) |
| (d) | The none reasons moved into the middle box | RF3 |
| (e) | No `STUDIO_SCROLLBAR_CLASS` | RF5 |
| (f) | `truncate` on the Clip Gain reason in the middle box | RF6 / F5 |
| (g) | In the group state, the Clip Gain reason before the range reason | RF1 |
| (h) | The `id` dropped from the moved Clip Gain reason | RF1 / `clip-gain` l.779 |

**R41-Doc:**
- Doc 038 changes only as §2.2 says and matches the code.
- l.45 and the TODO are current.
- The Ableton table matches §4.8.

### 4.6 Gates

**G41-1:**
- tsc 0;
- vitest = 1319 + the new `it` count, 0 failures. Record `node.exe`. On a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218, plus 1 info.

**G41-2:**
- protected 4/4 OK;
- `sha256sum -c b-round-40-tree-sha256.txt` → 384 OK;
- `git status --short` = §3.2;
- HEAD at the start and at the end.

**G41-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
- media is only the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, the dev-module requests, the homepage hero image from `images.unsplash.com`.

**Not re-run this round** (not PASS):
- exports and WAV integrity;
- video sync and C-R27-01;
- the full find sound → add → fit video → export flow;
- the FB-01..FB-16 stage regression.

### 4.7 Frozen suites (A self-check, C G41-1)

`detail-panel-reason`, `detail-panel-fit`, `pending-status`, `clip-gain`, `detail-panel`, `detail-panel-polish`, `track-layout`, `gesture-guard`, `fader-guards`, `fader-click`, `delete-selection-ui`, `floating-video`, `ArrangementContext.test.ts`.

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

There is no new behaviour. No new browsing and no video. The status-bar source as in rounds 39–40: Live 12 Reference Manual §3.2, https://www.ableton.com/en/live-manual/12/live-concepts/, captured 2026-10-13, `b-round-37/ableton-live-concepts-20261013.txt`.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A disabled control's reason is shown in the panel's free area, not under the control | none | **Not applicable** (CZABA layout) | CZABA layout decision D-29z6 (C-R40-01) | R41-RV |
| The detail content uses the Studio's thin scrollbar with a stable gutter | none | **Not applicable** | CZABA user request of 2026-10-07 (consistent scrollbars) | R41-SB |

C gives two verdicts per row. Never write "Ableton does it this way" for a not-applicable row.

### 4.9 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead). Record the NUL count and offsets from `curl -s http://127.0.0.1:5173/studio-lab`, and the hydrated U+FFFD `aria-label`s. Round 40: 5 NUL at 11729, 28025/28026, 58745/58746; 63 654 bytes; 2 U+FFFD labels. Your byte changes may move what sits under the fixed offsets.
- **Open Low items:**
  - R26-M1;
  - 4b-2 groups 2–4 (rounds 42–44);
  - A-R38-TEST-ORDER, R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY, A-R34-REVIEW-RESIDUALS;
  - DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON, SSR-LAYOUT-EFFECT-WARN;
  - the DOC034/035/036/015 notes, EXPORT-DIALOG-FOCUS-RESTORE;
  - DETAIL-RESET-SHRINK (info).
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - **rounds 39–40 are checkpoint-ready** (6 paths, the C-verified shas above). Commit them before A starts round 41, or leave the working tree as the baseline. Round 41 becomes ready only after C PASS;
  - the 17 `.codex/agents/*.toml` files; the ignored `.kilo/`;
  - `npm run test:e2e:smoke` (root only);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - the CDP allowlist;
  - `Content-Type` without a charset;
  - the root review's open M/L items:
    - M1 lookahead driver; M2 render load; M3 doc 012;
    - L1 undo during a gesture; L2 hold-window reschedule; L3 Delete key repeat; L4 `setPointerCapture` throw; L6 the export dialog text; L7 unbounded history; L8 the unwrapped `new AudioContext`;
  - dev-server availability; the browse daemon (ENV-BROWSE-DAEMON); the machine load.
- **Tech Lead manual checks:** R23-1 (now including the detail scroller), R23-2, R38-T (including A-R38-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-40-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/components/arrangement/ArrangementDetailPanel.tsx docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md
npx vitest run app/lib/arrangement/__tests__/detail-panel-reason.test.tsx
npx vitest run app/lib/arrangement/__tests__/detail-panel-fit.test.tsx app/lib/arrangement/__tests__/pending-status.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-40-snapshots/ArrangementDetailPanel.tsx app/components/arrangement/ArrangementDetailPanel.tsx
diff -u ../tmp/studio-real-loop/b-round-40-snapshots/038-studio-lab-pending-status.md docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest.
- Do not create test files other than `detail-panel-reason.test.tsx`.
- C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- If it is down, say so in the report and do the offline items (G41-1/2, R41-S, R41-U, R41-Doc).
- Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-41.md`:**
1. the pre-flight gate, including the §1.4 re-checks;
2. the red run (per case) and the green run;
3. the diff summary per file;
4. the smoke numbers (gutter, column widths, panel height);
5. the code-reviewer findings and your dispositions;
6. the verbatim command tails, including `node.exe`;
7. the deviations and the §2.4 self-check results.

Do not claim PASS. If you hit a stop condition, stop and report. Do not widen or narrow the change to avoid it.

**C → `c-round-41.md` and `c-round-41.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R41-RV table with geometry and screenshots (1440, 1280, the 120 px minimum);
- the R41-SB and R41-NONE records;
- the mutation table;
- the Ableton two-verdict table (§4.8);
- the gates, the C-R23-01/C-R38-01 record and the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01 / C-R38-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **A-R38-REVIEW-TOUCH:** if R38-T confirms a touch jump, B schedules the pre-specified fix: a non-passive `touchstart` + `preventDefault` on Volume, Pan and Master, with Zoom excluded.
- **Round 42 — 4b-2 group 2 (Pan, Lane only):**
  - a `keydown` on the Pan slider clears the blur suppression (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK). A `change` without a keydown stays ignored, so frozen `fader-guards` l.363–430 stay green;
  - the Lane's Pan bookkeeping also ends on `window` `blur` (A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES).
- **Round 43:** FADER-KEY-ENTRIES (re-read C's R30-K record first), A-R29-REVIEW-1, A-R33-REVIEW-TOUCH.
- **Round 44:** MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER.
- **Then:**
  - 4c (round-9 M1/L8, PREVIEW-VOLUME-IDENTITY) and polish (SSR-LAYOUT-EFFECT-WARN, docs notes);
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 41 -StartPhase A` and a higher limit.
