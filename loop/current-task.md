# Round 507: DPG-BUTTON-CLEANUP-2-NONBRAND stage N1. Move the global audio player's four icon controls ("Close player", "Previous track", "Next track", "Mute"/"Unmute") onto `IconButton` ghost

**Planned by:** B, at the round 506 → 507 planning on 2026-11-14 (`b-round-506.md`).

## Decisions (`backlog.json` v510, `decisions_log_b`)
- **D-29z1828, round 506 acceptance:** C PASS with `browserVerified`/`realVerified` true and 0 bugs. Gate 506 published `3021b30`, so stage 2e (LeadMagnet) is verified. Follow-ups:
  - one new deferred Low, A-R506-CR-1-HOOKS-MOCK-BARREL;
  - gate 506 suggestions 2 and 3 are `confirmedBy` on PD-R504-DISABLED-NO-REASON and SIG-R501-SHARED-BUTTON-SCANNER;
  - the reviewer's "Button has no focus-visible style" contradicts C3's measurement and is recorded as inaccurate.
- **D-29z1829, NONBRAND inventory:** a whole-tag scanner finds 58 tags in 29 files [K5]. product-designer rules all 59 (the 58 plus the LeadMagnet Close X):
  - 16 → `Button`, 13 → `IconButton`, 28 stay hand-rolled, 2 go to root;
  - stage order N1–N9 (`b-round-506/consult-product-designer.md`).
- **D-29z1830, round 507 = stage N1:** the `AudioPlayer` part of product-designer's stage 1. The StemsPlayerModal pair moves out, because no mock version has a `stems` array [K9]. The first SSR request cannot be stubbed, and stubbing a client-side navigation is not tried yet (D-29z1832).
- **D-29z1831, new ids:**
  - B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD (Medium, next round, see §6);
  - ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE;
  - three Saba questions (`user-review/questions-round-507.md`; defaults apply);
  - B-R507-STEMS-ERROR-NO-RETRY (Low) and SIG-R507-NONBRAND-KEEP-PRIMITIVES (signal).
- **D-29z1832, closing check:**
  - L47/L50 on Close: focus after a keyboard Close is BODY at HEAD and on the sketch [K18]. This is pre-existing, so it is the new deferred Low B-R507-PLAYER-CLOSE-FOCUS-LOST and a record row in C6. The L50 regex finds 4 unchanged hits [K17].
  - Close's ring is clipped at the viewport's right edge, at HEAD and on the sketch (deferred Low B-R507-PLAYER-CLOSE-RING-CLIPPED; C3 records it).
  - Client-navigation loader stubbing is not tried yet; B tries it at round-508 planning.

## Rules
- **Read `lessons.md` first.** Applied here:
  - L1: the scanner is proven on a mutant file, `b-round-506/scan-mutant.txt`; its `className={CONST}` blind spot is closed by `scan-var-classname.txt` (9 Footer text links, none of them a button).
  - L4, L10, L23 (sweep [K8]), L29 (claims K1–K16), L31 (every covering test < 500 ms on B's run; slowest 444 ms).
  - L38: warm-up; B's sketch server had its own `node_modules` without `.vite`.
  - L47: Close unmounts the focused element. Focus then falls to BODY at HEAD and on the sketch at all three widths [K18]. This is pre-existing and unchanged code: B-R507-PLAYER-CLOSE-FOCUS-LOST (deferred Low; its target, the Play preview trigger, needs a ref in protected `AudioContext.tsx`). C6 carries it as a record row, not a pass condition.
  - L50: the regex over `AudioPlayer.tsx` gives 4 hits (l.62, 63, 104, 167: the loading output, error alert and two icon ternaries), all unchanged and none a focus call [K17].
  - L52 (every jsdom row has a mutant), L56 (artifacts [K12]), L57, L58, L59, L60.
  - L61: no native control is added. The progress and volume `range` inputs are untouched.
- **STOP threshold (L10).** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing or slow covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a number that differs from B's expected value in §3.
- **The sketch writes every granted byte**, docs included. A writes no prose this round.
- **Ruling lines (L4):**
  - **Shape:** `IconButton`'s `rounded-lg` (Chromium 12px) replaces `rounded-full`. Nothing in `className` overrides the radius (there is no class merging). SABA-Q-507-PLAYER-ICON-SHAPE is asked once; the default is `rounded-lg`.
  - **Close:** `opacity-60`, `hover:text-error` and `hover:scale-110` go. The positioning classes stay in `className`. Close shrinks 34 → 32 px with a 16 px X (product-designer: a bigger target would cover more of the title).
  - **Colour:** the rest colour of Previous, Next and Mute goes `text-foreground` → `text-muted`, so Play stays dominant. Hover becomes the tokens `bg-elevated` + `text-foreground`; the hardcoded `bg-white/10` and the brass/red hover text go.
  - **Layout:** at 1440 and 1280 the player height (90 px) and Play's centre do not move. At 375 the player grows 4 px, because Mute's own row goes 36 → 40. This is accepted as D5.
- **Pre-ruled Lows** (a re-raise is listed "For B", not a STOP):
  - #1 doc 328 l.4 says "C round 507 PASS" before C runs (L28 contract).
  - #2 N1-1's `tagName` check is near-vacuous, and N1-3/N1-4 re-check IconButton internals. The useful asserts are title, position, size and retired tokens (M3–M6).
  - #3 N1-3/N1-4/N1-5 read class tokens and source text, as stages 2a–2e did (SIG-R501-SHARED-BUTTON-SCANNER).
  - #4 `IconButton` writes a `title` equal to `aria-label`, so some screen readers read the name twice (shared pattern).
  - #5 `IconButton` sets no `type="button"`; the player is not inside a form.
  - #6 the barrel import `~/components/ui` (GATE498-L2-BARREL-IMPORT, A-R506-CR-1-HOOKS-MOCK-BARREL).
  - #7 the Play button keeps its custom circular class and has no `type`. This is Biome's 1 warning in this file, and it is out of scope.
- **Purchase protection:** no auth, cart, checkout, ownership or download file is touched. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.
- **Persistent screen text (L39):** nothing is added. The new `title` tooltips are hover-only.
- **Out of scope:**
  - the Play button and the two `range` inputs;
  - `StemsPlayerModal`, which waits for ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE;
  - `IconButton.tsx` itself;
  - Studio (`/studio-lab` is smoke-checked only, C11).
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.

## Baseline
HEAD is `3021b30` [K1], the gate 506 `commit` [K10]. The gate's `head` field (`d6903a7`) is the pre-commit head. The worktree is clean [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/r507-tree-sha256.txt`: every tracked file except the two granted tracked paths (1,421 of 1,423).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files. No granted path is protected.
3. Before applying: `b-round-506/r507-pre-sha.txt` (the two granted tracked paths at HEAD).
4. After applying: `b-round-506/r507-post-sketch-sha.txt`, covering all four paths.

B applied the patch to a fresh `git archive` of `3021b30` (`/home/runner/b506-fresh`). Checks 4 and 1 are rc 0 there.

## 0. Why this round
- **Saba's DPG item 7:** "Use Button.tsx component only". The brand-filled stages 2a–2e are done; NONBRAND is the remaining class.
- **The global player** appears on every Store page while a preview plays. Its four controls carry the hardcoded `bg-white/10` hover [K3].
- **Bugs first:**
  - No Critical, High or Medium finding is open on loop-owned Store code that can be fixed and browser-verified now. The open Mediums are root-only, Saba-only, device-only or `awaiting_user`.
  - B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) needs the backend and the protected `auth.ts`.
  - The new B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD (Medium) is pre-existing since 2026-03-08, not a regression [K7]. It needs a target decision and a free mock product [K9], so it is the next round (§6).
- **REGRESSION** is due on or after 2026-11-16 (`regression-last.json`: 2026-11-13). **RETRO** is at round 510.

## 1. Reference
- **Store rule** (`docs/design/DESIGN_SYSTEM.md`, Components): `IconButton` is "Square buttons for icons only", used for "Icon-only actions (close, menu)". Sizes: `sm` 32 px with a 16 px icon, `md` 40 px with a 20 px icon.
- **product-designer** (`b-round-506/consult-product-designer.md` §3): ghost, sm for Close and md for the transport icons; rounded-lg; drop the red close hover.
- **Competitor practice for mini-players:** not verified by a primary source this round. The behaviour is unchanged, so no reference behaviour is adopted.
- **Ableton:** does not apply (Store overlay).

| Point | Rule | After this round | Deviation (reason) |
|---|---|---|---|
| Previous, Next, Mute | IconButton ghost md | 40×40, radius 12px, rest `rgb(163, 155, 142)`, hover bg `rgb(29, 26, 23)` + text `rgb(236, 230, 218)` | D1 circle → rounded-lg (Saba question); D2 rest foreground → muted |
| Close player | IconButton ghost sm | 32×32, X 16, `absolute top-1/2 right-0 -translate-y-1/2` | D3: no red hover, no 0.6 opacity, no hover scale |
| Tooltip | IconButton `title={label}` | Previous, Next and Mute gain a tooltip; Mute's follows its label | D4 |
| Layout | — | 1440/1280: player 90 px and Play centre 720/640 unchanged; 375: +4 px | D5 |
| Keyboard ring | shared ring (SABA-B-4) | unchanged: `:focus-visible`, offset 2px | none |
| Behaviour | — | real preview plays; Mute → volume 0, Unmute → 0.7; Close stops (paused, t 0) | none |

## 2. What changes: sketch `b-round-506/sketch-507.patch.txt`
The sha256 is in `b-round-506/sketch-sha.txt`. v1 is superseded; see `sketch-sha-history.txt` and `sketch-delta-v1-v2.diff.txt` (the tech-lead conditions: the test mock and types, and doc wording).

| File | Change |
|---|---|
| `app/components/audio/AudioPlayer.tsx` | Import `IconButton` from `~/components/ui`. Close → `<IconButton variant="ghost" size="sm" label="Close player" onClick={closePlayer} className="absolute top-1/2 right-0 -translate-y-1/2"><X size={16} /></IconButton>`. Previous / Next → `<IconButton variant="ghost" size="md" label="Previous track" onClick={skipPrevious}>` (and the Next equivalent), with the same SVGs. Mute → `<IconButton variant="ghost" size="md" label={volume === 0 ? 'Unmute' : 'Mute'} onClick={() => setVolume(volume === 0 ? 0.7 : 0)}>`. After the change the file has 1 `<button` (Play), 4 `<IconButton` and 0 `bg-white/10` / `hover:text-error` [K3] |
| `app/lib/__tests__/store-button-cleanup-n1.test.tsx` (new) | N1-1: one button per name, and its `title` equals the name. N1-2: each control calls its action once; at volume 0, Mute becomes Unmute (title too) and calls `setVolume(0.7)`. N1-3: ghost classes at the right size; Close keeps its four position tokens. N1-4: no retired token; the icons are 16/20. N1-5: source pins (1 `<button`, 4 `<IconButton`, the import, no `bg-white/10` / `hover:text-error`) |
| `docs/design/DESIGN_SYSTEM.md` | IconButton section: one `ghost` line naming the player's controls and their sizes |
| `docs/implementation/2026/quarter-IV/328-dpg-nonbrand-stage-n1-audio-player.md` (new) | l.4 `**სტატუსი:** In Progress (stage N1 of DPG-BUTTON-CLEANUP-2-NONBRAND; C round 507 PASS)`; the 7 TEMPLATE headings; D1–D5; the TODO list. 328 is the next free number [K13] |

**Sweep (L23):** the test-root hits for `AudioPlayer` and `components/audio` are listed in [K8]. All of them are in the covering set and green on the sketch. No `perf/**` or `e2e/**` file names the player's labels.

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - check the patch's sha256 against `sketch-sha.txt`;
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/sketch-507.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 4 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-507/`. A difference from B's value is a STOP.
   - `npm run typecheck`: rc 0 (B: `b-round-506/precheck-tsc.log`).
   - `npm run lint`: rc 0, "Found 175 warnings." (HEAD: 179; B: `precheck-lint.log`).
   - `npx biome check app/components/audio/AudioPlayer.tsx app/lib/__tests__/store-button-cleanup-n1.test.tsx`: rc 0, "Checked 2 files", no fixes, "Found 1 warning." (pre-ruled #7; B: `precheck-biome.log`).
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/covering-files.txt)`: 8 files, 86/86, the N1-1…N1-5 lines present, and no test above 2,500 ms (B: `precheck-covering.log`).
   - The code-reviewer on the whole change against `3021b30`. Give it `git diff 3021b30` and the two untracked files.
   - Not run by A: the full suite and the build. B ran both on the v2 sketch tree (`precheck-full-raw-v2.log`, `precheck-build-sketch.log`).
4. Write `a-round-507.md`, including the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-507.md`, `c-round-507.json` and `c-round-507/progress.json` as it goes, heaviest rows first (L59).

**Environment:**
- The store dev server runs at `http://127.0.0.1:5173` and the mock API at `:5199`. `cloud/run.sh` starts the mock. If `curl -s http://127.0.0.1:5199/__mock/health` fails, start it from the loop folder with `node mock-api/server.mjs > c-round-507/mock.log 2>&1 &`.
- **Opening the player:** on `/`, wait 6 s, press Esc, then call `.click()` on the first `button[aria-label="Play preview"]` through `page.evaluate`. A real preview (`middle-east.mp3`) plays. The harnesses do this.
- **Warm up (L38):** run `ap-507.cjs` once with `WIDTHS=1440` into `c-round-507/warm` and discard the result. Do not run vitest while a probe runs.

**Harnesses.** Each writes only to the given output path. The oracles are `b-round-506/probe/sketch/{sketch.jsonl,layout.json,behaviour.json}`; HEAD's values are in `probe/head/`.
- `BASE=http://127.0.0.1:5173 node /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/probe/ap-507.cjs <abs c-round-507/after> after`: rest, hover and keyboard focus per control, plus `*-focus.png` crops, at 1440×900, 1280×720 and 375×812.
- `node …/probe/ap-layout-507.cjs <abs c-round-507/after/layout.json>`: the player box, Play's centre and the Close box.
- `node …/probe/ap-behaviour-507.cjs <abs c-round-507/after/behaviour.json>`: real audio advancing; Mute/Unmute volume, label and title; focus after a pointer click; Close's centre while pressed; Close stopping playback.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 2 modified (the §2 tracked paths) and 2 untracked (the n1 test and doc 328). Checks 1, 2 and 4 rc 0 |
| C1 | REST | `after.jsonl` `rest` | Equal to `sketch.jsonl`, boxes ±1 px [K15]. Previous/Next/Mute 40×40 and Close 32×32 at every viewport; radius `12px`; color `rgb(163, 155, 142)`; opacity `1`; `title` = label |
| C2 | HOVER + PRESS | `hover`; `behaviour.json` `pressed` | Hover bg `rgb(29, 26, 23)` and text `rgb(236, 230, 218)` on all four, with no white overlay (`rgba(255, 255, 255, 0.1)` / oklab white) anywhere. While Close is pressed, its centre equals `restCentre` ±1 px and `scale` is `0.95` |
| C3 | KEYBOARD FOCUS + POINTER | `kbd` fields and the `*-focus.png` crops; `behaviour.json` `afterMute.fv` | `fv` true and offset `2px` on all four at all 3 viewports. View at least 4 crops (one per control). Previous, Next and Mute: the ring is visible on all four sides. Close: the ring shows left, top and bottom; its right side is off-screen because the box is flush with the viewport edge, as at HEAD (`probe/close-ring-columns.txt`; record, B-R507-PLAYER-CLOSE-RING-CLIPPED). After a mouse click on Mute, `fv` is false |
| C4 | CONTRAST | `restContrastVsPanel` | 7.2 on all four at every viewport (≥ 3:1; HEAD's Close also measured 7.2 but rendered at opacity 0.6). Below 3 is a Medium |
| C5 | LAYOUT | `layout.json` vs HEAD's `probe/head/layout.json` | Player height 90 at 1440 and 1280 (equal to HEAD), and 243.8 ±1 at 375 (HEAD 239.8, D5). `playCx` 720 / 640 / 187.5. View one full-player screenshot per viewport: the title does not overlap Close, and nothing wraps |
| C6 | BEHAVIOUR (real audio) | `behaviour.json` | At each viewport: `mediaB.t` > `mediaA.t` (the preview plays); after Mute, `vol` is 0 and an "Unmute" button exists with title "Unmute"; after Unmute, `vol` is 0.7; after Close, no Close button remains and the media is `paused` at `t` 0. 0 page errors. All equal to HEAD except the title (null at HEAD). **Record:** `activeAfterClose` (Enter on a focused Close) is BODY as at HEAD [K18], B-R507-PLAYER-CLOSE-FOCUS-LOST; a different value is reported, not failed |
| C7 | GREP | From `store/`: `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/scan-nonbrand.py . /tmp/n.json` and `python3 -I …/b-round-497/scan-brand.py . /tmp/s.json`; K3 | `54 hits; files 28` (HEAD 58/29); brand `92 hits; 31 solid` (unchanged); K3 `<button=1 <IconButton=4 bg-white/10=0 hover:text-error=0` |
| C8 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-506/covering-files.txt)` | 8 files, 86/86; N1-1…N1-5 present; no test above 2,500 ms |
| C9 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules`, `.git` and `build`) to a folder outside `store/` and symlink `node_modules`. Then run `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/mutants-507.py <copy> <abs c-round-507/mutant-logs> /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/head-AudioPlayer.tsx.txt` | M0–M6 all `OK` and `restored rc 0`, matching `b-round-506/mutants-507.txt` |
| C10 | DOCS | `git diff 3021b30 -- docs/design/DESIGN_SYSTEM.md`; doc 328 | DESIGN_SYSTEM: only the one added `ghost` line. Doc 328: the 7 headings (L26 subsequence), and l.4 byte-equal to `**სტატუსი:** In Progress (stage N1 of DPG-BUTTON-CLEANUP-2-NONBRAND; C round 507 PASS)`. Every number in D1–D5 traces to `sketch.jsonl`/`layout.json` or to `after*`. `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 [K14] |
| C11 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link. `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C12 | CLAIMS + SOURCE-SCOPE (end) + L57 | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/claims-507.sh`, compared with `b-round-506/claims-507-sketch-output.txt`; C0 again; `python3 -I tools/l57-check.py c-round-507.json c-round-507/l57-check.txt` | No `MISSING`. Output identical except K1 and K2 (HEAD may move to the loop-state commit; the worktree is dirty). C0 still holds. L57 rc 0, with every `null` naming its reason |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Blocked:** none expected. The StemsPlayerModal rows are not in this round.
- **Neighbours that could break:**
  - the player's progress and volume ranges (`audio-preview-player`, the SABA-B-14 seek thumb): covered by the covering set, and C6 plays real audio;
  - the other `IconButton` user (ChatInput "Send message"): `IconButton.tsx` is unchanged;
  - the focus ring (`store-focus-ring`): in the covering set.
- **L22:** if A STOPs, C runs C0, C12 and C11 only. A STOP that names an unruled Medium+ is a short FAIL.
- **Closing:** with C PASS and `browserVerified` true, NONBRAND stage N1 is verified. The StemsPlayerModal pair stays open in NONBRAND.

## 5. B's pre-check (`b-round-506/`, on `/home/runner/b506-scratch` = a `git archive` of `3021b30` plus the sketch, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome (the 2 code and test files) | rc 0 / rc 0, 175 warnings (HEAD 179) / rc 0, no fixes, 1 warning | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests (v2) | 8 files, 86/86 (slowest 444 ms) | `precheck-covering.log` |
| Full suite (v2) | 304 files / 4,384 tests, rc 0 (v1 gave the same) | `precheck-full-raw-v2.log`, `precheck-full-raw.log`, `precheck-full.log` |
| Build (v2) | rc 0 | `precheck-build-sketch.log` |
| Browser, HEAD (:5173) vs sketch (:5174, own `node_modules` without `.vite`) | §1 table | `probe/head/*`, `probe/sketch/*` |
| Mutants (v2) | M0–M6 OK, `restored rc 0` | `mutants-507.txt`, `mutant-logs/` |
| Scanner | NONBRAND 58/29 → 54/28; brand 92/31 unchanged | `scan-nonbrand-head.json`, `scan-nonbrand-sketch.json` |
| Patch reproduces the tree | `git apply` on a fresh archive: checks 4 and 1 rc 0 | (this table) |
| Sketch review | tech-lead v1 APPROVE WITH CONDITIONS (all Low); each one fixed in v2 or pre-ruled | `sketch-review.md` |
| Claims | HEAD and sketch outputs, no MISSING | `claims-507-planning-output.txt`, `claims-507-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD (Medium, bug-first):** the product page's "Complimentary Download" (free products) has no action. At its planning, B:
   - gets a target ruling from product-designer;
   - writes the jsdom repro;
   - needs a free mock product for the browser half (ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE). Without it, the browser half stays a named open row, not a PASS.
3. **The NONBRAND stages, in the consult's order:**
   - N2 product page (a purchase entry, so it gets an L54 journey row);
   - N3 cookie banner (+2 missed tags; SABA-Q-507-COOKIE-WEIGHT default);
   - N4 home (SpecialOffers, LeadMagnet X; B2E-6 updates);
   - N5 cart;
   - N6 auth/account;
   - N7 free downloads + ChatHeader;
   - N8 recordings;
   - N9 hero mute;
   - the StemsPlayerModal pair, once the fixture exists.
4. **Then** PD-R498-404-SECONDARY-ALIGN, the stage-2 close-out (SIG-R498, SIG-R501, SIG-R507), the rest of DPG P1, the DP gate and P2. RETRO comes at round 510.

## Claims (`b-round-506/claims-507.sh`; planning output `claims-507-planning-output.txt` on HEAD, sketch output `claims-507-sketch-output.txt` on `/home/runner/b506-scratch`)
[K1] HEAD · K2 worktree · K3 AudioPlayer `<button`/`<IconButton`/`bg-white/10`/`hover:text-error` counts · K4 IconButton ghost/sm/md/rounded-lg/title lines · K5 NONBRAND scanner · K6 brand scanner · K7 ProductSidebar "Complimentary Download" has no handler · K8 tests naming AudioPlayer or components/audio · K9 no mock version has a `stems` array and no product is free · K10 gate 506 · K11 c-round-506 result · K12 artifacts exist · K13 next implementation doc number · K14 pending grep · K15 sketch probe key values · K16 layout, HEAD vs sketch · K17 L50 hits in AudioPlayer.tsx · K18 focus after a keyboard Close, HEAD and sketch.
