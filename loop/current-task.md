# CURRENT TASK — Round 148: V-0.5c — the video dock and the Studio Lab page title in English, the final RV-4 sweep, and the RV-1 re-capture (closes V-0)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 147 = **published**, commit `34ce5513e6ff9bb337389333401643c0ef197cc0` on both remotes)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-147.md` is an exact copy of the round-147 `current-task.md` (sha256 `840d750d…c658`). Rationale: `b-round-147.md`. Decision record: **D-29z113** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline = clean HEAD `34ce5513e6ff9bb337389333401643c0ef197cc0`.** B checked that `git status --short` is empty and that rounds 145–147 are published.
- **Frozen list:** `tmp/studio-real-loop/b-round-147-r148-tree-sha256.txt`, **957 entries**. That is `git ls-files -co --exclude-standard` (966) minus the 9 grants, hashed at 34ce551. B ran `sha256sum -c --quiet` from `store/`: OK.
- **Grants:**
  - `b-round-147-r148-grants.txt`: 9 existing files.
  - `b-round-147-r148-new-files.txt`: 2 new files.
  - Start hashes: `b-round-147-r148-granted-start-sha256.txt`.
  - Start copies: `b-round-147/r148-granted-start/` (paths relative to `store/`).

  A checks all three first. Any difference → A stops and reports.

## 0. Why this round (D-29z113)
- **Round 147: C PASS**, `browserVerified` = `realVerified` = true. Gate 147 published it (34ce551, verify 2501 tests, build OK). V-0.5b → `c_pass`, and GATE146-S1 closes.
- **Checks at planning:**
  - The regression round is due on or after 2026-10-27. Today is 2026-10-24, so it is not due.
  - `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
  - No Critical, High or Medium finding is open. `F1-ABSOLUTE-SNAP` is `accepted` (D-29z14), and the Tech Lead manual items do not block.
- **V-0.5c is the last V-0 stage** (D-29z110 R1). B measured it at 34ce551 with the same comment-stripping rule as the ST47 tests:
  - **18 non-comment Georgian lines in `ArrangementVideoDock.tsx`** (17 distinct strings).
  - **1 line in `routes/studio-lab.tsx`**: the meta title.
  - **9 lines in `data/studio-lab-demo.ts`**: user content (sound titles). These stay (D-29z92).
  - The other 65 files under `components/arrangement/**` and `lib/arrangement/**` (non-test), plus `contexts/ArrangementContext.tsx`, have 0.
  - In the rest of `app/`, the only Georgian is in trailing `//` comments: `components/loading/*Loader.tsx` and `contexts/StudioContext.tsx`. Those files are not Studio-workspace UI, and `StudioContext.tsx` is globally forbidden. **Do not widen to them.**
- **`lang="en"` is already present** at `app/root.tsx:44`, and `root.tsx` is globally forbidden. There is no code change for it; it becomes a C check.
- **Folded in, cheap, and owned by this round:**
  - **GATE147-S1:** doc 120's status still says C has not run.
  - **GATE147-S4:** `purchased-collection-ui.test.tsx` l.297–298 are Georgian negative assertions that can no longer fail. A, C and the gate all flagged them, and the V-0 closing sweep owns Georgian-negative pins.
  - **Gate-141 #2:** the SSR test mocks `console.error` but never asserts on it. B probed this at 34ce551 by rendering `/studio-lab` with `renderToString` in node: `console.error` was called **0 times**. Evidence: `b-round-147/probe/ssr-probe.test.tsx`, run from a vitest config under the loop folder, so `store/` was untouched.
- **Not in this round:**
  - GATE147-S2: the `All` button's accessible name `All2`.
  - GATE147-S3: Fold state announced twice.
  - GATE147-S5: `studioLibraryStrings` and `studioLibraryPanelStrings` are near-identical names.

  All three are Low and go to `deferred_low_polish`. Their code (`ArrangementLibrary.tsx`, `strings.ts` naming) is either not owned by this round, or it is a question for the architecture checkpoint.

## 1. What changes (user-visible), exact
### 1.1 New object `studioVideoDockStrings` in `app/lib/arrangement/strings.ts` (appended after `studioLibraryPanelStrings`; plain strings only)
| key | value (exact) | used at (34ce551 line) |
|---|---|---|
| `dockLabel` | `Video` | l.881 `section aria-label` |
| `overviewNote` | `· Overview` (U+00B7) | l.888: `Arrangement <span className="text-dim">{studioVideoDockStrings.overviewNote}</span>` |
| `captionFallback` | `Video` | l.203 `{source ? source.name : studioVideoDockStrings.captionFallback}{' '}` |
| `captionSoundNote` | `· sound from the video track (M/S/Volume)` | l.204 inner span |
| `gapPrefix` | `No video ·` | l.227: `{studioVideoDockStrings.gapPrefix}{' '}` (the `{' '}` and the time `<span>` stay) |
| `empty` | `No video added yet` | l.955 |
| `placeholderExpanded` | `Video expanded` | l.901 |
| `placeholderReturn` | `Return` | l.909 (visible button text) |
| `returnLabel` | `Return the video to the compact view` | l.56: `const VIDEO_RETURN_LABEL = studioVideoDockStrings.returnLabel;` (name kept) |
| `expandLabel` | `Expand video` | l.976 aria-label and l.977 title (both branches keep `VIDEO_RETURN_LABEL`) |
| `dragLabel` | `Move the video (arrow keys: 16 px)` | l.964 |
| `dragTitle` | `Move the video` | l.965 |
| `closeLabel` | `Close the expanded video` | l.989 |
| `closeTitle` | `Close (Esc)` | l.990 |
| `previewLabel` | `Video preview` | l.937 (active `<video>`) |
| `standbyLabel` | `Video preview (standby)` | l.947 (standby `<video>`) |
| `playFailed` | `Video playback failed — try MP4 (H.264) or WebM.` (U+2014) | l.54: `const VIDEO_PLAY_FAILED_MESSAGE = studioVideoDockStrings.playFailed;` (name kept) |

- Every other token of `ArrangementVideoDock.tsx` stays byte-identical:
  - classes, testids, data attributes, handlers, conditions;
  - the glyphs `⤢ ⠿ ✕`;
  - the literal `Arrangement` word, which is already English.

  The only other change is one import line. Biome may wrap JSX; report any rewrap.
- **Wording rationale (D-29z113 R3):**
  - **`Overview`** is Live 12's term for the whole-arrangement strip (§6.1).
  - **`compact view`** is the existing glossary term (D-29z102 R4). `studioVideoStrings.returnedCompact` already uses it.
  - **`playFailed`** mirrors `studioVideoStrings.probeFailed` ("— try MP4 (H.264) or WebM.").
  - **Visible text inside the accessible name (WCAG 2.5.3 label-in-name):** the button's visible text `Return` is the start of its accessible name `Return the video to the compact view`, as the Georgian `დაბრუნება` was before.
  - **`dockLabel` and `captionFallback`** both read `Video`, but they stay separate keys because they mean different things: the region name and a missing-source fallback.

### 1.2 `app/routes/studio-lab.tsx` l.8
`{ title: 'Studio Lab — Demo workspace | CZABA' },` (U+2014). Nothing else in the route changes. The e2e `toHaveTitle(/CZABA/)` specs do not open `/studio-lab`, and they would still match it.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | §1.1 object only (append) |
| `app/components/arrangement/ArrangementVideoDock.tsx` | the 18 §1.1 uses (l.54, 56, 203, 204, 227, 881, 888, 901, 909, 937, 947, 955, 964, 965, 976, 977, 989, 990) + the import |
| `app/routes/studio-lab.tsx` | l.8 per §1.2 only |
| `app/lib/arrangement/__tests__/strings.test.ts` | **ST40**: the Georgian-lines expectation → `[]`, plus `expect(route).toContain("{ title: 'Studio Lab — Demo workspace | CZABA' },")`; the rest of ST40 unchanged. **ST47**: add `../../../components/arrangement/ArrangementVideoDock.tsx`, `../../../routes/studio-lab.tsx` and `./video-dock-strings-ui.test.tsx` to both path loops (GUILLEMET and zero-Georgian), as with `library-row-strings-ui`. New **ST50** and **ST51** (§3.1). Nothing else |
| `app/lib/arrangement/__tests__/floating-video.test.tsx` | l.136 `EXPAND_LABEL` → `'Expand video'`, l.137 `RETURN_LABEL` → `'Return the video to the compact view'`, l.313 → `toContain('Video expanded')`. The fixtures l.114–115 (`ვიდეო`/`მუსიკა`, track names = data) and l.861–868 (a status fixture = data) stay |
| `app/lib/arrangement/__tests__/render-budget.test.tsx` | l.370, l.450, l.454: `ვიდეო არ არის ·` → `No video ·` (hand-written). Fixtures l.181–182 stay |
| `app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx` | `expect(consoleErrorSpy).not.toHaveBeenCalled();` as the last statement of DS1 and DS2. Nothing else (the mock stays) |
| `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` | l.297 → `expect(header).not.toContain('Demo collection');`, l.298 → `expect(header).not.toContain('no sign-in required');`. Nothing else |
| `docs/implementation/2026/quarter-IV/120-studio-v0-library-panel-strings.md` | l.4 → `**სტატუსი:** Completed (C round 147 — PASS, browserVerified; gate 147, 34ce551)`; in l.98, `C round 147 ჯერ არ გაშვებულა.` → `C round 147: PASS (browserVerified = realVerified = true).` Nothing else |
| **new** `app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx` | VDS1–VDS3 (§3.2) |
| **new** `docs/implementation/2026/quarter-IV/121-studio-v0-video-dock-strings.md` | the V-0.5c implementation doc per `TEMPLATE.md`, in Georgian (`GEORGIAN_DOCS.md`). It contains:<ul><li>the §1 string map and glossary;</li><li>the final RV-4 sweep, saying what ST51 covers and what is excluded and why;</li><li>the `lang` finding (already `en` in `root.tsx`);</li><li>the §5 Live sources;</li><li>the testing section.</li></ul>Status `In Progress (C round 148 — ჯერ არ გაშვებულა)` |

- **Temporary mutation path (m113 only):** `app/lib/arrangement/zz-rv4-probe.ts` may be created for one run and must then be deleted. It must not exist at the end.
- **Protected (never touch):**
  - `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`;
  - `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`;
  - `app/components/ui/Modal.tsx`;
  - `app/routes/account.downloads.tsx`, `download-routes.test.ts`;
  - `app/root.tsx` and everything else in `backlog.json` `global_forbidden_files`.
- **Before the first Edit**, read the primitives the hook maps for these files: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md` (Studio), `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`. Also read `.claude/prompts/new-test.md` (new test file) and `docs/implementation/TEMPLATE.md` (new doc).
- **Edit rule (C-R120-01):** make lasting edits only through Edit/Write. There are no shell writes under `store/`, except deleting your own m113 probe file. A Biome-forced rewrap is allowed and must be reported. No `--write` and no `check:fix`.
- **Stop rule:** A stops and reports, without widening scope, if any of these happens:
  - a start check fails;
  - a non-granted test fails;
  - a diff appears outside the grants;
  - another source or test turns out to depend on one of the 17 dock strings or on the route title (B's grep found only the pins listed above; e2e has none);
  - the SSR spy turns out to be called at A's baseline (B saw 0 calls);
  - a needed change is not in this table.

## 3. A — tests and mutations (all literals hand-written; no module-against-module pins, GATE132-S4)
### 3.1 `strings.test.ts`
- **ST50:**
  - `Object.keys(studioVideoDockStrings).sort()` equals the 17 keys of §1.1.
  - Every value equals its §1.1 literal (a hand-written `Record<string, string>`).
  - No value contains a Georgian codepoint or `«»`.
  - Exact codepoints, built with `String.fromCodePoint`:
    - `overviewNote` and `captionSoundNote` start with U+00B7;
    - `playFailed` contains U+2014;
    - `gapPrefix` ends with U+00B7 and has no trailing space.
- **ST51 (the final RV-4 sweep):** a recursive directory walk with `readdirSync`/`statSync`. A hand-written list is not allowed, so that a future file is caught automatically.
  - **Walked:**
    - `app/components/arrangement/**` (`.ts`/`.tsx`, excluding `__tests__`);
    - `app/lib/arrangement/**` (`.ts`/`.tsx`, excluding `__tests__`).
  - **Added by name:** `app/contexts/ArrangementContext.tsx`, `app/routes/studio-lab.tsx`, `app/data/studio-lab-demo.ts`.
  - **Normalisation:** use the existing `normalisedGeorgianLines` (strip comments, trim, `${` → `{`) for every file. The ledger's template-literal line matches only in that form.
  - **Assertions:**
    - the walked set has at least 60 files (B counted 65 at 34ce551), so the test cannot pass vacuously;
    - for every file, `stripSourceComments` is applied and the Georgian lines are collected. `studio-lab-demo.ts` must equal the existing `DEMO_REMAINING_GEORGIAN_LINES`, and every other file must equal `[]`;
    - the failure message names the file.

### 3.2 New `video-dock-strings-ui.test.tsx` (StudioWorkspace harness; mirror the `floating-video` / `render-budget` setup, and any fixture stays local to this file)
- **VDS1 (compact, no video).** Use accessible-name queries wherever a role exists:
  - `region` `Video`;
  - the overview label's text is exactly `Arrangement · Overview`;
  - the caption (`arrangement-video-caption`) text is exactly `Video · sound from the video track (M/S/Volume)`;
  - the empty text `No video added yet` is visible;
  - `button` `Expand video` with title `Expand video`;
  - the two `<video>` elements have aria-labels `Video preview` (active) and `Video preview (standby)`.
- **VDS2 (expanded).** Click `Expand video`:
  - the placeholder shows `Video expanded`;
  - `getAllByRole('button', { name: 'Return the video to the compact view' })` has length 2: the placeholder's button, whose `textContent` is `Return`, and the expand toggle;
  - the drag handle has aria-label `Move the video (arrow keys: 16 px)` and title `Move the video`;
  - the close button has aria-label `Close the expanded video` and title `Close (Esc)`.

  Press Escape: the toggle is back to `Expand video`.
- **VDS3 (play failure).**
  - **Setup:** a video clip is under the playhead, and `HTMLMediaElement.prototype.play` is stubbed to reject with `new DOMException('blocked', 'NotAllowedError')`. Start playback.
  - **Expected:** the status text is exactly `Video playback failed — try MP4 (H.264) or WebM.` and the transport is no longer playing.
  - **If the jsdom harness cannot reach this path** without editing a non-granted file, A writes that down with the reason and omits VDS3. In that case m110 is proved by C's PLAY-FAIL row instead. Do not widen.

### 3.3 Mutations (Edit, then restore by Edit, then verify by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m107 | `overviewNote` → `'· Whole project'` | ST50, VDS1 |
| m108 | l.976/977: both branches of the ternary swapped | floating-video, VDS1/VDS2 |
| m109 | l.227: `{studioVideoDockStrings.gapPrefix}` → the literal `ვიდეო არ არის ·` | ST47 (zero-Georgian loop), ST51, render-budget |
| m110 | `VIDEO_PLAY_FAILED_MESSAGE = studioVideoDockStrings.empty` | VDS3 (or "not reachable in jsdom; C PLAY-FAIL", see §3.2) |
| m111 | studio-lab.tsx l.8 → the original Georgian title | ST40, ST51 |
| m112 | `console.error('m112');` as the first statement in `StudioLabRoute`'s body | DS1, DS2 |
| m113 | create `app/lib/arrangement/zz-rv4-probe.ts` = `export const zzRv4Probe = 'ქ';`, run, delete | ST51 only (proves the walk) |

After each restore:
- the edited file's sha256 equals the post-edit hash;
- `sha256sum -c b-round-147-r148-tree-sha256.txt --quiet` is OK;
- after m113, `git status --short` shows no `zz-rv4-probe.ts`.

### 3.4 Commands (speed rules)
- **Start:**
  - frozen list (957) OK;
  - the 9 start hashes and copies OK;
  - HEAD = 34ce551;
  - `git status --short` empty;
  - the 2 new paths and `zz-rv4-probe.ts` do not exist.

  Run the SSR test once at baseline and record the spy's call count. B saw 0. If it is non-zero, stop.
- `npm run typecheck` and `npm run lint` exit 0. Read-only `npx biome check` on the 9 changed or new code/test files gives 0 diagnostics.
- `npx vitest run` on these 13 files (B checked that they all exist):
  - **6 changed or new test files:** strings, floating-video, render-budget, default-track-names-ssr, purchased-collection-ui, video-dock-strings-ui;
  - **7 unchanged neighbours:** `app/lib/arrangement/__tests__/{video-fades-ui,video-import-status-ui,library-video-return-focus,ssr-layout-effect,workspace-strings-ui,video-sync}` and `app/data/__tests__/studio-lab-demo.test.ts`.

  Save the result as `a-round-148/vitest.json`, and save a baseline run at 34ce551 first (`vitest-baseline.json`).
- Report the per-file runtime `it` counts against 34ce551. Only these may change:
  - strings +2 (ST50, ST51);
  - video-dock-strings-ui new (2 or 3);
  - no other file gains or loses an `it`.
- The **code-reviewer** is required (3+ files). Pass its Architecture note to B verbatim.
- **End:**
  - frozen list OK;
  - `git status --short` = the ` M` grants that changed, plus the 2 `??` new files, and nothing else;
  - `git diff 34ce551 -- <protected>` empty;
  - `a-round-148/end-sha256.txt` for the 11 paths;
  - `a-round-148/diff-vs-start.patch` against the start copies (new files from /dev/null);
  - the non-comment Georgian grep of `ArrangementVideoDock.tsx` and `studio-lab.tsx` gives 0 lines.
- **Not run:** the full suite, `npm run verify`, build and e2e. These are gate rows. No commit, stash, checkout or install.
- Write `a-round-148.md` as you go.

## 4. C — rows (real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, fresh context per session, Snap state recorded at start; both viewports 1440×900 and 1280×720)
**Harness:**
- Reuse `tmp/studio-real-loop/b-round-147/tools/{lib.cjs,dockbase148.cjs}`. Its selectors are testid/structure only, and it waits for either `იტვირთება…` or `Loading…`.
- Run `node dockbase148.cjs <W> dockpost148` (copied into `c-round-148/tools/`) for the post-change capture.
- The video fixture is `tmp/studio-real-loop/media/beeps-6s-h264-aac.mp4`, loaded via `lib.cjs loadVideo`.
- **Baseline:** `b-round-147/out/dockbase148-{1440,1280}.json`. B captured it at 34ce551 before A ran.
  - States: `empty`, `video` (playhead 1 s), `gap` (8 s), `expanded`, `returned`.
  - Rest-of-workspace boxes are in `rest.{empty,video,expanded}`, and the library and dock are excluded from them.
  - Screenshots: `b-round-147/shots/`.
- All outputs go under `c-round-148/`.

| Row | Start state → action → expected |
|---|---|
| T148-TARGETED | A's vitest list; counts equal A's |
| SOURCE-SCOPE | <ul><li>frozen 957 OK at start and end;</li><li>only granted paths differ from `b-round-147/r148-granted-start/`;</li><li>end hashes = `a-round-148/end-sha256.txt`;</li><li>`git status --short` = A's end set, and `zz-rv4-probe.ts` is absent;</li><li>protected diff vs 34ce551 empty;</li><li>0 non-comment Georgian lines in the 2 sources;</li><li>no source change during C's phase.</li></ul> |
| AN-REVIEW | <ul><li>§1.1/§1.2 exact, including the codepoints;</li><li>no other token changed in the dock (diff vs start copies);</li><li>ST40/ST47/ST50/ST51, VDS1–3, DS1/DS2 and the pins assert what §3 says, with hand-written literals;</li><li>ST51 is a real directory walk with the ≥ 60 guard;</li><li>doc 120 has only the §2 edits;</li><li>doc 121 is in Georgian, follows TEMPLATE and is consistent with the evidence.</li></ul> |
| COPY-DOCK | Both viewports.<br>(a) **Fresh page:**<ul><li>`region` `Video`;</li><li>the overview label reads `Arrangement · Overview`;</li><li>the caption reads `Video · sound from the video track (M/S/Volume)`;</li><li>the empty text `No video added yet` is visible;</li><li>`Expand video` (aria + title);</li><li>the video aria-labels are `Video preview` / `Video preview (standby)`.</li></ul>(b) Import the video and seek to 1 s: the caption reads `beeps-6s-h264-aac.mp4 · sound from the video track (M/S/Volume)`.<br>(c) Seek to 8 s: the gap text is exactly `No video · 00:08.000`. Then `addAt` Soft impact on Music at 10 s, which extends the project end past 8 s, because play past the project end is refused with `playPastEnd`. Seek to 8 s again and press play for about 1 s: the time inside the gap text advances in real time, so the position writer is unchanged. Stop, then Ctrl/Cmd+Z the added clip.<br>(d) Seek to 1 s, then `Expand video`: `data-video-floating=true`.<ul><li>The placeholder reads `Video expanded`. Its button's visible text is `Return`, and its accessible name is `Return the video to the compact view`. The toggle has the same name.</li><li>Drag handle: `Move the video (arrow keys: 16 px)` / title `Move the video`. One ArrowRight on the focused handle moves the box +16 px in x.</li><li>Close: `Close the expanded video` / title `Close (Esc)`.</li></ul>Then return the video three ways, one after another: Escape, the placeholder `Return` button, and ✕. Each time the box goes back to compact, and the status reads `The video went back to the compact view.` (or the library variant), as before |
| PLAY-FAIL | **Real behaviour.**<br>**Setup:** a fresh context, with `addInitScript` making `HTMLMediaElement.prototype.play` reject with `new DOMException('blocked','NotAllowedError')` for elements with `data-testid=arrangement-video` (the original for others). Import the video and seek to 0.<br>**Action:** press play.<br>**Expected:**<ul><li>the status is exactly `Video playback failed — try MP4 (H.264) or WebM.`;</li><li>the transport stops: the playhead `aria-valuenow` no longer advances across two samples 500 ms apart.</li></ul>Record the time to the status |
| VIDEO-SYNC (neighbour) | No override. With the video imported, play from 0 for 3 s.<ul><li>The active `<video>` `currentTime` advances.</li><li>Take ≥ 3 samples of `|video.currentTime − playhead|`; each must be ≤ 0.12 s (`VIDEO_STALL_DRIFT_SECONDS` in `video-sync.ts`; record the raw samples).</li><li>`createBufferSource` count ≥ 1 (the video track's sound plays).</li></ul>Stop. This is unchanged behaviour. A sample above 0.12 s is reported as `inconclusive`, with the samples, and becomes a B signal. It is not a FAIL of this copy-only diff, unless AN-REVIEW finds a non-copy change in the dock |
| TITLE-LANG | <ul><li>`document.title` is exactly `Studio Lab — Demo workspace | CZABA`;</li><li>the SSR HTML from `curl http://127.0.0.1:5173/studio-lab` has the same `<title>`;</li><li>`document.documentElement.lang === 'en'`.</li></ul> |
| NO-GEORGIAN (final RV-4, browser) | Scan the **whole page**: every node in `document.body` (skip `<script>`/`<style>`; this includes the Store header/footer, toasts and dialogs) plus `document.title`. The page has no `<main>`. B's pre-scan at 34ce551 (`b-round-147/out/bodyscan-34ce551-1440.json`, tool `b-round-147/tools/bodyscan.cjs`, `ready` only) found only ledger content and the dock strings in these states: `ready`, `video`, `gap`, `expanded`, `error` (abort `**/middle-east.mp3`), library `previewing`, and the **Export dialog open**. Collect text, aria-label, title, placeholder and aria-valuetext, and count Georgian codepoints.<br>**Allowed:** only the `studio-lab-demo.ts` ledger user content (`ღამის პულსი`, `საჯარო preview`, `სრული მიქსი`, `პულსი/ბასი/პადი/მელოდია`), which also appears inside statuses and clip titles that quote a sound name.<br>**Anything else is a finding.** Name the element and the state |
| LAYOUT-DOCK | Compare each state with the same state in `dockbase148`, per viewport. **RV-1 V-0 exception, written before C runs (D-29z113 R5):**<ul><li>**Text nodes may change their own `w` and `glyph`:** `dock-overview-label`, `dock-overview-note`, `dock-caption-note`, `dock-placeholder-text` and `dock-placeholder-return`. The return button is a centred inline button in the fixed placeholder, so its x may shift by half its `w` delta.</li><li>**Flex sibling:** `dock-caption` may change x and w by exactly the overview label's `w` delta (it is `flex-1`), and its right edge stays fixed.</li><li>**Inside the fixed `w-40 aspect-video` video box:** `video-empty` and `video-gap` (`absolute inset-0`) keep their box ≤ 1 px. Only their glyph and line count may change (Georgian: 2 and 3 lines; English: expected 1–2).</li><li>**Everything else ≤ 1 px:** `dock`, `dock-row`, `video-box` (compact and floating), `dock-placeholder`, `video-expand`/`drag`/`close` (icon-only, so text is unchanged), and the `<video>` boxes.</li><li>`docW` has no horizontal overflow.</li></ul>Report every > 1 px delta with its cause. An unexplained delta = FAIL |
| LAYOUT-REST | `rest.{empty,video,expanded}` vs `dockbase148`: every node ≤ 1 px. The library and the dock are excluded, and this round changes no copy outside them |
| RV1-RECAPTURE (after every row above, before G148-3) | **Valid only if every other row PASSES and no source changed during C's phase.**<br>**Tool:** copy the C round-125 RV-1 tool chain into `c-round-148/tools/`: `c-round-125/tools/{d6.cjs,d6build.py,lib122.cjs,h3.cjs,lib.cjs}`.<br>**Before running**, grep the chain for Georgian or English text selectors and waits; known so far: `lib.cjs` l.139 `იტვირთება…`, l.152 `აქტიური ხაზის არჩევა`. Replace only those with testid/role or the current English, and list each change. Keep `KEYRULE`, the S0/S1/S2 states and the S1 setup steps unchanged.<br>**Runs:** run 1 and run 2 per viewport. Determinism must be max 0 px between the runs in all 6 states.<br>**Output:** `c-round-148/out/bbox-post-v0-{1280,1440}.json`, labelled `post-V-0 RV-1 reference (round-148 tree)`, with `S1setupObserved`. In C's copy of `d6.cjs`/`d6build.py`, change only the output directory, the filename and the `label`.<ul><li>Nothing is written under `c-round-125/`.</li><li>`c-round-125/out/contrast-baseline.json` and `under24px.json` stay frozen too.</li><li>Run 1's contrast and pixel outputs land in `c-round-148/out/d6/`. They are not deliverables of this row.</li></ul><br>**This is a capture + determinism row, not a classification of every V-0 delta vs the pre-V-0 baseline.** PASS = both viewports captured, all states present, determinism 0 px, and every S1 setup step succeeded. **Do not overwrite** `c-round-125/out/bbox-baseline-*` (frozen input). The capture becomes the RV-1 reference for V-1…V-3 only if gate 148 publishes this exact tree |
| G148-3 (alone, last) | <ul><li>`/studio-lab` shows the workspace and the English demo badge in a fresh anonymous context;</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;</li><li>`GET /api/studio-token?…` → 401;</li><li>the fake-Bearer 403 is BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror. The known cart noise is expected |

- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbour risk:** none of these may change:
  - the floating video drag/keyboard move and its clamp to the viewport;
  - focus return after Escape/✕/Return (`floating-video`, `library-video-return-focus`);
  - the expanded-video status messages (`studioVideoStrings`, unchanged);
  - video fades (`video-fades-ui`);
  - the import statuses (`video-import-status-ui`);
  - the gap caption's position writer (render budget).

  Accessible-name changes affect only tests that query by name, and those are the granted ones.

## 5. Ableton source
B's captures were fetched 2026-10-24 with curl. The text extracts are in `b-round-147/live/*.txt`. Live 12 Reference Manual:
- ch. 6 "Arrangement View": https://www.ableton.com/en/live-manual/12/arrangement-view/, saved as `b-round-147/live/arrangement-view.{html,txt}`;
- ch. 28 "Working with Video": https://www.ableton.com/en/live-manual/12/working-with-video/, saved as `b-round-147/live/working-with-video.{html,txt}`.

| Behaviour | Section | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Whole-arrangement strip | §6.1 Layout | "The Overview displays the Arrangement's entire layout of clips from start to end and can be used for zooming and navigation" | label `Arrangement · Overview` (term confirmed) | COPY-DOCK (a) |
| Video display window | §28.2.2 The Video Window | "a separate, floating window that always remains above Live's main window. It can be dragged to any location … toggle its visibility with a command in the View menu … full screen … by double-clicking" | **Deliberate difference.** CZABA has a compact in-page dock plus an expand-to-float panel inside the page (`Expand video` / `Return` / ✕ / Esc). There is no separate OS window, no View-menu toggle and no full screen. Only the copy changes here | COPY-DOCK (d) |
| Gaps in video | §28.2.2.1 Movies with Partial Tracks | "During gaps in video, Live's Video Window will display a black screen" | **Deliberate difference.** CZABA shows `No video · <time>` on the dark box, which is more informative. Behaviour is unchanged | COPY-DOCK (c) |
| Video sound | §28.1, §28.2.1 | Video clips "are treated just like audio clips" | The caption note `sound from the video track (M/S/Volume)` explains that the sound is mixed on the video track: consistent | COPY-DOCK (a) |
| Playback failure message, empty dock text, page title | none | not applicable | CZABA-only copy | PLAY-FAIL, COPY-DOCK, TITLE-LANG |

C rates "CZABA requirement met" and "Ableton correspondence" separately:
- **confirmed:** row 1 (the term) and row 4;
- **deliberate difference:** rows 2–3;
- **not applicable:** row 5.

## 6. Evidence and reporting
- C writes `c-round-148.md` and `c-round-148.json` as it goes.
- The JSON has `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `measurements`, `invalidRuns` and `notesForB`. `measurements` holds:
  - accessible names, statuses and the play-fail timing;
  - VIDEO-SYNC samples;
  - LAYOUT-DOCK deltas with causes;
  - Georgian counts per state;
  - RV-1 determinism.
- Evidence goes under `c-round-148/{tools,out,shots}/`. No writes under `store/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.

## 7. Outcome, fixed in advance (B at round 149 planning)
| Condition | Round 149 |
|---|---|
| B plans on or after **2026-10-27** | the **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | a bounded fix-up (≤ 3 related bugs) |
| C FAIL only on a Low this round caused | a bounded fix-up, same owner |
| C FAIL only on a literal criterion with no app defect, or RV1-RECAPTURE invalid only because of the tool | B rules in writing; the next round is a re-check / re-capture only |
| C PASS (new unrelated Lows → `deferred_low_polish`) | <ul><li>root publishes round 148;</li><li>V-0.5c → `c_pass`, so **V-0 is complete** and RV-4 is done;</li><li>`bbox-post-v0-*` becomes the RV-1 reference;</li><li>GATE147-S1/S4 and gate-141 #2 close.</li></ul>**B sends root the bounded frontend-architect checkpoint request** (strings split, test pins importing constants, `ArrangementLibraryOption`; V-0 boundary). The checkpoint does not block. Round 149 = **V-1** (scoped colour tokens `[data-studio-theme=obsidian]`; RV-2 against the DUX-B-1 elements), first stage, measured by B |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 8. Root notes
- **Commit readiness:** nothing new is publishable until C round 148 passes. Rounds 145–147 are published (34ce551).
- **Architecture:** this round adds the 24th `studio*Strings` object (`studioVideoDockStrings`) and the round-147 addendum in `b-round-136-checkpoint-request.md`. The checkpoint is requested **when V-0.5c closes** (C PASS + gate 148). Its questions:
  - (a) split `strings.ts` / `strings.test.ts`, or keep them;
  - (b) the shared Georgian-scan helper, which ST51 now partly provides;
  - (c) `ArrangementLibraryOption`;
  - (d) whether test pins should import constants instead of repeating literals (gate-147 Architecture note);
  - (e) the near-identical object names (GATE147-S5: `studioLibraryStrings` / `studioLibraryPanelStrings`, and now `studioVideoStrings` / `studioVideoDockStrings`).
