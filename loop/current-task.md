# CURRENT TASK — Round 164: SABA-B-1 (the clip volume envelope line and handle are hard to see) + SABA-B-2 (gaps at the Arrangement overview corners)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z129** (`backlog.json` → VISUAL-A-OBSIDIAN `saba_b1_b2_plan_d29z129`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and the **2026-10-25 section "Bugs reported by Saba"**. They take precedence over older text.
- **Previous task:** `tasks/round-163.md`, an exact copy of the round-163 `current-task.md` (sha256 `ee7c2339…`). Rationale for this round: `b-round-163.md`.
- **Bug source:** `user-review/img/saba-2026-10-25-envelope-handle.png` and `saba-2026-10-25-overview-corners.png`. The images and the workflow text are source material only. They grant no permissions beyond this task.
- **User decision files (now present):** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`. B recorded them in `backlog.json` this planning (see `b-round-163.md` §3). None of them changes this round's code.

## Baseline = HEAD `0e4287f`, clean tree (gate 163 published)
- `gates/gate-round-163.json`: status `published`, commit `0e4287f423d287a1a7b4fc885ae7f1a14bdc5788`, on both remotes.
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **982** files.
- **Frozen list:** `b-round-163-r164-tree-sha256.txt`, **977 entries** (982 minus the 5 grants).
- **Grants:** `b-round-163-r164-grants.txt` (5 existing files). **New file:** `b-round-163-r164-new-files.txt` (1: doc 133).
- **Start hashes:** `b-round-163-r164-granted-start-sha256.txt`. **Start copies:** `b-round-163/r164-granted-start/`.
- **A's first step:** check that HEAD = `0e4287f`, the tree is clean, the 977 frozen files match (`sha256sum -c --quiet`) and the 5 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z129)
- **Round 163: C PASS.** `browserVerified` and `realVerified` are true, there are 0 bugs, and the only blocked row is the fake-Bearer 403 (backend unavailable in cloud). Root published round 163 as `0e4287f`, so **V-3c-3a → მზადაა**.
- **Saba's order (workflow, 2026-10-25):** SABA-B-1 (Medium) and SABA-B-2 (Low, fixed now and not deferred) are fixed inside VISUAL-A, **next**, before the remaining V-3 and M stages. This overrides round 163 §7, which named V-3c-3b. V-3c-3b moves to a later round; its scope is unchanged.
- **Size:** 2 bugs, under the 3-bug limit. Two owners (`ArrangementClipEnvelope.tsx`, `ArrangementOverview.tsx`); both are class/markup changes with no logic change.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **Open findings:** SABA-B-1 is the only open Medium (this round). No Critical/High is open. The Tech Lead manual items do not block.
  - **Checkpoint:** `b-round-160-checkpoint-request.md` still has no answer. It does not block these bug fixes.

### 0.1 B reproduction (planning data at `0e4287f`; not C rows)
Real Chromium on `/studio-lab`, at 1440×900 and 1280×720. The tools and output are in `b-round-163/` (`saba-probe.cjs`, `saba-probe2.cjs`, `saba-sim.cjs`, `corner-zoom.cjs`, `notch-metric.cjs`, `out/`).

**SABA-B-1, reproduced at both viewports.** Setup: `demo-middle-east` on `music` at 0 s, Env on, a point added by double-click, then dragged about 18 px down (gain 0.64, status `Envelope: 4.000 s · −3.9 dB.`).
- **Same hue on same hue:** the line stroke (`text-accent` → rgb(201,164,106)), the point fill (`bg-accent`) and the waveform (`text-brand/70`) are all brass. The selected clip header is `bg-brand`, also brass.
- **DPR 2 pixel contrast**, measured over about 100 columns of the clip body (`out/saba-sim-dpr2.json`, "baseline"):
  - line core vs the darkest pixel within ±5 device px: **min 1.74**, median 7.42. Where the line crosses the waveform it disappears.
  - DPR 1, `out/saba-probe2.json`: 75 % of the columns are below 3:1 against the pixels 3 px away.
  - handle centre vs its own border: **1.88:1**; handle centre vs the pixels above and below it: 1.58–1.74:1.
- **No hover style exists:** the hovered point has the same colours as at rest.
- **States:** the selected and the normal clip (another clip selected) give the same numbers. A muted lane does not change the clip's rendering (the clip class is the same). At 0 dB the point sits half over the brass header of a selected clip (`out/saba-probe-*-env-selected.png`), which is the case in Saba's screenshot.
- **Simulated fix** (DOM injection only, no source change; `out/saba-sim-dpr2.json`, "sim halo 4"):
  - A background-coloured 4 px halo polyline under a foreground 1.5 px line gives line core vs halo **min 15.62** at both viewports.
  - A foreground handle with a background border gives centre vs border **15.62**.
  - Screenshot: `out/saba-sim-1440-selected-sim.png`.
  - Halo 5 px sampled worse with this sampler (the core is narrower than one device row), so **4 px is ruled**.

**SABA-B-2, reproduced; cause found.** `out/saba-probe.json` (computed chain) and `out/corner-1440-*.png` / `out/saba-probe2-*-corner-empty-*.png` (4× DPR, 16×16 CSS px crops).
- The overview root (`ArrangementOverview.tsx` l.293) is `overflow-hidden rounded-sm` = **6 px**. Its outline overlay (l.305) is also `rounded-sm`.
- The view frame (l.329, `arrangement-overview-frame`) is `rounded-xs` = **2 px**, `inset-y-0`, with a bright `border-foreground/70`.
- When the frame touches a side of the root (empty project: `left 0%`, `width 100%`; or the view at the far right), its almost-square corner is cut by the root's 6 px clip. The bright border stops before the corner, and the dim outer curve shows separately. That is the notch in Saba's screenshot. The parent dock section has no radius, border or overflow involvement (chain in the JSON).
- **Ruled fix:** the frame uses the root's radius (`rounded-sm`). Only the radius changes: no box changes, so the ±1 px rule holds by construction.

### 0.2 B rulings (D-29z129; user-vetoable in `feature-status.md`)
**R1 — Envelope line, a two-tone line:**
- The fix must stay correct after DUX-R-5, which will make waveforms neutral. A single colour fails one of the two sites:
  - foreground on the brass waveform is about 3.3:1, and on the brass header about 1.8:1;
  - a dark line fails on the dark body.
- **Rule:** a background-coloured halo under a foreground line. This is the same two-tone idea as the round-150 overview playhead (`ring-1 ring-background`).
- Tokens only: `stroke-background` and `stroke-foreground`.

**R2 — Envelope handle:**
- `bg-foreground` with `border-background` (it was `bg-accent` + `border-foreground`).
- Size `size-2` → `size-2.5` (8 → 10 px). Saba could not find it. It stays absolutely positioned and centred by the existing translate, so nothing else moves.
- Hover: `hover:scale-125`, with no colour change, because DUX-R-5 reserves the accent for selection, playhead, primary button and focus. No transition is added.
- The `z-30`, `cursor-move`, `rounded-xs`, `title`, handlers, `data-*` and inline `style` are unchanged.

**R3 — Overview frame radius:** `rounded-xs` → `rounded-sm` on `arrangement-overview-frame`. Nothing else in `ArrangementOverview.tsx` changes.

**R4 — Ableton:** no parity claim. This is a CZABA visibility and contrast fix (WCAG 2.2 1.4.11). See §5.

## 1. What changes (exact; line numbers at `0e4287f`)
| ID | File | Change |
|---|---|---|
| E1 | `ArrangementClipEnvelope.tsx` l.408 (line `svg`) | Remove `text-accent` from the svg class. Every other class, `style`, `viewBox`, `preserveAspectRatio`, `aria-hidden` and `data-testid` is byte-identical. |
| E2 | `ArrangementClipEnvelope.tsx` l.415–421 (`<polyline>`) | **Two** polylines with the same `points={linePoints}`, `fill="none"` and `vectorEffect="non-scaling-stroke"`. The **first** (halo) has `className="stroke-background"` and `strokeWidth={4}`. The **second** (line) has `className="stroke-foreground"` and `strokeWidth={1.5}`. Neither has a `stroke=` attribute. |
| E3 | `ArrangementClipEnvelope.tsx` l.367 (point class) | `absolute z-30 size-2.5 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-xs border border-background bg-foreground hover:scale-125`. Nothing else on the point changes. |
| O1 | `ArrangementOverview.tsx` l.329 (frame class) | `rounded-xs` → `rounded-sm`. Nothing else changes. |
| D1 | `docs/implementation/2026/quarter-IV/132-studio-v3c3a-video-dock-icons.md` | Exactly one edit: the status line **l.4** → `**სტატუსი:** Completed (C round 163 PASS; published 0e4287f)` (gate-163 review Low 2). |
| D2 | **new** `docs/implementation/2026/quarter-IV/133-studio-saba-b1-b2-envelope-overview.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: Saba's two reports, B's reproduction numbers (§0.1), the cause of each, R1–R4, the class and markup before and after, the DUX-R-5 coordination, tests and mutations.</li><li>TODO: re-check the envelope contrast in the DUX-R-5 stage; V-3c-3b; V-3c-5 (any panel-radius change must keep the frame radius equal to the root, lock OV1).</li><li>Status: `In Progress (awaiting C round 164)`.</li></ul> |

**Not allowed:**
- any other file, including `ArrangementClip.tsx`, `StudioWorkspace.tsx` and `app/styles/**`;
- a new token, hex, arbitrary `[...]` value, `style=` change, custom CSS, or transition;
- any change to the envelope gestures (add, drag, delete, guard), the overview gestures, keys or `aria-*`;
- the Env **button** (`StudioWorkspace.tsx`, asserted `text-accent` at `clip-envelope-ui.test.tsx` l.357). It stays as it is.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementClipEnvelope.tsx` | E1–E3 |
| `app/components/arrangement/ArrangementOverview.tsx` | O1 |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | Add **EV1** (below). Existing tests unchanged. The polyline queries at l.612/736/741/849 read the first polyline; its `points` are identical, so they stay valid. |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | Add **OV1** (below). Nothing else. |
| `docs/…/132-studio-v3c3a-video-dock-icons.md` | D1 only |
| **new** `docs/…/133-studio-saba-b1-b2-envelope-overview.md` | D2 |

**New locks:**
- **EV1, envelope visibility** (`clip-envelope-ui`, the existing workspace mount):
  - With Env on and a clip that has a point: the line `svg` has exactly 2 `polyline`s with equal `points`.
  - polyline[0] has class `stroke-background` and `stroke-width` 4. polyline[1] has class `stroke-foreground` and `stroke-width` 1.5. Neither has a `stroke` attribute.
  - The svg class does not contain `text-accent`.
  - Every `arrangement-clip-envelope-point` has the class tokens `size-2.5`, `bg-foreground`, `border-background`, `hover:scale-125` and `z-30`. It has none of `bg-accent`, `size-2`, `border-foreground`.
  - With Env off and the same clip (the line still drawn), the two-polyline rule holds.
  - On SVG elements `className` is an `SVGAnimatedString`. Read polyline and svg classes with `getAttribute('class')` or `classList.contains`, not `className.includes`.
- **OV1, overview radius** (`studio-theme-obsidian`, the existing SSR `html` and `classTokensByTestId`, plus the source text if a node has no test id):
  - `arrangement-overview` and `arrangement-overview-frame` both contain `rounded-sm`, and the frame contains no `rounded-xs`.
  - The outline overlay div (`pointer-events-none absolute inset-0 rounded-sm border border-outline`) still occurs exactly once in `ArrangementOverview.tsx`.
  - The point: any later radius change (V-3c-5) must change the root, the overlay and the frame together.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `0e4287f` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementVideoDock.tsx`, every other Arrangement component, `studio-lab.tsx`, and docs 127–131.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 6 files in `b-round-163-r164-vitest-base.txt`. Expect **92/92** (B ran it at `0e4287f`: `b-round-163/out/vitest-base-r164.json`). Save the list as `a-round-164/vitest-files.txt` and the result as `a-round-164/vitest-baseline.json`.
- **After the edits:**
  - Run the same 6 files. Expect 92 plus the new `it`s (EV1, OV1), all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 4 code and test files.
- **`expect(` counts:** record them per granted test file, before and after. At `0e4287f` they are clip-envelope-ui 136 and studio-theme-obsidian 72. A drop needs a reason.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-164/mutations/`):
  - **m178:** line polyline `stroke-foreground` → `stroke-accent`. EV1 turns red.
  - **m179:** delete the halo polyline. EV1 turns red, and the existing EU5/AL1 line tests stay green. This two-sided check shows that EV1 adds the guard.
  - **m180:** point `bg-foreground` → `bg-accent`. EV1 turns red.
  - **m181:** frame `rounded-sm` → `rounded-xs`. OV1 turns red.
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 977 files are OK, and the protected diff vs `0e4287f` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant not needed) + 1 `??` (doc 133), nothing else.
  - Write `a-round-164/end-sha256.txt` (all changed paths + doc 133) and `a-round-164/diff-vs-start.patch` (vs `b-round-163/r164-granted-start/`, plus doc 133 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- **Harness rules:** Escape does not clear a clip selection. To get a **normal** (unselected) clip, select another clip, as B did with `demo-soft-impact` on `sfx` at 30 s. Snap off before drags.
- B's tools are in `b-round-163/`. C may copy `saba-sim.cjs` (its `sample()` is the ruled metric) and `saba-probe2.cjs` unchanged into `c-round-164/tools/` and drop the DOM-injection step. Record their sha256. Copy `c-round-163/tools/{d6,lib,lib122,wav,report}.cjs` unchanged, and check that the d6 sha256 is `3abc88fe…`.
- Write nothing under earlier `c-round-*/out/` or `b-round-*/`. Every run writes a uniquely named output.

| Row | Check |
|---|---|
| T164-TARGETED | Re-run `a-round-164/vitest-files.txt`. The counts equal A's, and EV1 and OV1 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `0e4287f`.</li><li>The frozen 977 files are OK at start and at end.</li><li>The end hashes equal `a-round-164/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` plus doc 133 as `??`, nothing else.</li><li>The protected diff vs `0e4287f` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-163/r164-granted-start/` itself:<ul><li>The envelope changes only E1–E3, and the overview only O1.</li><li>The tests add only EV1/OV1. No assertion is weakened: count `expect(` per file; a drop needs a reason.</li><li>Doc 132 changes only D1. Doc 133 exists with the D2 sections.</li><li>No new token, hex, arbitrary value, `style=` change, transition, or gesture/key/aria change.</li></ul> |
| ENV-VIS (SABA-B-1) | Both viewports, **deviceScaleFactor 2**. Setup as in §0.1: `demo-middle-east` on `music` at 0 s, `demo-soft-impact` on `sfx` at 30 s, Env on, double-click the body at +160 px, then drag the point about 18 px down.<br>**States:** (a) selected clip; (b) normal clip (the sfx clip selected); (c) hover on the point; (d) the `music` lane muted (B found that a muted lane does not change the clip's rendering, so (d) is expected to equal (b); record it, and do not treat the equality as a finding); (e) a fresh point at **0 dB** (top of the body, partly over the header) on a selected clip; (f) Env off, with the line still drawn.<br>**Computed checks, every state:**<ul><li>2 polylines; the line `stroke` = rgb(236,230,218) and the halo `stroke` = rgb(14,13,12); widths 1.5 and 4.</li><li>The point `background-color` = rgb(236,230,218) and `border-color` = rgb(14,13,12); the box is 10×10 ±0.5 at rest.</li><li>In (c) the computed `scale` is `1.25` and the rendered box is about 12.5 px.</li></ul>**Pixel checks** (the `sample()` metric in `b-round-163/saba-sim.cjs`: ≥ 50 columns of the body, away from the handle, the line core = the brightest pixel in a ±12 device-px band, compared with the darkest pixel within ±5):<ul><li>**line core vs halo ≥ 3:1 in every sampled column** (B's baseline min 1.74; simulated fix min 15.62).</li><li>**handle centre vs its own border ≥ 3:1** (baseline 1.88).</li><li>For the pixels 2 px above and below the handle, max(centre, border) vs that pixel ≥ 3:1.</li></ul>Report min, p10 and median per state, and save a crop of each state at both viewports. Below 3:1 in any state is a FAIL. |
| ENV-FUNC | The envelope still works, at both viewports.<ul><li>A double-click adds a point (status `Envelope: point added — …`).</li><li>A drag changes the gain (status `Envelope: … dB.`).</li><li>A double-click on the point deletes it.</li><li>Undo and Redo restore it.</li><li>The A key toggles Env.</li></ul>**Real audio** (live playback applies the clip envelope: `graph.client.ts` schedules `envelopeGain` per clip, l.123–143 and l.230): with one point dragged to the bottom (gain 0), Play from 0 for 1 s. The output tap peak must be < 25 % of the peak at the same position with the envelope at 0 dB. |
| OV-CORNERS (SABA-B-2) | Both viewports, deviceScaleFactor 4. 16×16 CSS-px crops of the 4 corners of `arrangement-overview` in **(a) the empty project** (frame `left 0%`, `width 100%`) and **(b)** with `demo-middle-east` on `music` and the view scrolled to the far right, so the frame touches the right side.<ul><li>Computed `border-radius` of the root, the outline overlay and the frame are all **6px**.</li><li>**Notch metric** (B's tool `b-round-163/notch-metric.cjs`; copy it unchanged and record its sha256). Count the device pixels in the outline band rgb(36,33,30) ±6 that are **not** within 1 device px (8-neighbourhood) of a bright pixel (relative luminance > 0.3). This excludes the anti-aliased edge of the bright arc itself.</li><li>**B's numbers per corner tl/tr/bl/br**, identical at both viewports (`b-round-163/out/notch-baseline-files.json`, `notch-render.json`):<ul><li>baseline (empty project): **3 / 13 / 3 / 15**;</li><li>DOM-simulated `rounded-sm` frame: **1 / 0 / 1 / 0**. The single left pixels are the anti-aliased join of the square overview playhead at 0 % with the curve; they are not the notch.</li></ul></li><li>**Pass:** every corner the frame touches is ≤ 1, and each is below its baseline value. C re-runs the tool on B's baseline crops first, to confirm the baseline numbers. If they differ, the metric run is invalid.</li><li>In state (b), only the corners the frame touches (the right ones) are judged.</li><li>Put the crops side by side with B's.</li></ul> |
| RV1-SABA | <ul><li>Run the copied `d6.cjs` unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with **`c-round-163/out/d6/d6-{1440,1280}-r1.json`**. No key rename is expected.</li><li>Expected: no key missing or added, and every x/y/w/h within ±1 px. B predicts 0 px: the frame changes only its radius, and the envelope handle (8 → 10 px by R2) renders only in Env mode with a point. Env mode is outside d6's S0–S2, so no d6 key covers the handle. Its size is checked in ENV-VIS, not here.</li><li>The contrast sections are unchanged except entries that belong to the overview frame or the envelope, if any. List each changed entry.</li></ul> |
| OV-FUNC | <ul><li>A drag on the overview still moves the view.</li><li>A double-click fits.</li><li>The arrow keys move the view while the overview has focus.</li><li>The focus ring still shows.</li></ul> |
| G164-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged): the V-3c-3a dock rows, V-3c-2 lane rows, V-3c-1 library rows, V-3b transport rows, CONTRAST-V3A and the V-2 rows. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Envelope add/drag/delete, the double-click guard, the line through the points | ENV-FUNC, T164-TARGETED (EU1–EU7, AL1) |
| Envelope points capped below the sticky lane header | T164-TARGETED (`track-header-stacking`) |
| The envelope's real gain on the output | ENV-FUNC (real audio) |
| Overview frame position, playhead, navigation | OV-FUNC, T164-TARGETED (`view.test.ts`, `navigation-strings-ui`) |
| Page layout | RV1-SABA |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Clip volume envelope line and breakpoint visible on the clip (contrast ≥ 3:1); hover enlarges the breakpoint | Not checked this round. The Live 12 manual chapter "Automation and Editing Envelopes" covers clip envelopes, but B did not open it this planning, so **no Ableton claim is made**. | Not checked. | **CZABA visibility fix** for Saba's report, under WCAG 2.2 1.4.11. The colours follow the Obsidian tokens and DUX-R-5, not Live. | Requirement: ENV-VIS, ENV-FUNC. Parity: unverified, not claimed. |
| Overview frame corners | Not applicable; a visual defect in CZABA's own overview. | — | — | OV-CORNERS. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-164.md`, `a-round-164-result.json` and `a-round-164/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-164.md` and `c-round-164.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the ENV-VIS table (state × viewport: min/p10/median, handle ratios) and the OV-CORNERS notch counts (baseline vs after). Put tools, out and shots in `c-round-164/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 165 planning)
| Condition | Round 165 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item, both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL on ENV-VIS or OV-CORNERS | A bounded fix-up, same owners. SABA-B-1/2 stay ბაგია. If the ruled halo or radius cannot reach the target, B re-plans with C's numbers. The target is not weakened. |
| C FAIL on another Critical / High / Medium | A bounded fix-up (≤ 3 related bugs). |
| C FAIL Low only | A fix-up if it is in this round's code and cheap; otherwise `deferred_low_polish`. |
| C PASS | Root publishes round 164. SABA-B-1 and SABA-B-2 → closed (C evidence). Round 165 = **ROOT-RECON-MARKER-ENTER**: a test-first check of Enter during an active pointer gesture in the marker editor; a fix only if the test reproduces it. Round 166 = **V-3c-3b**. |

At every planning, B checks the decision files in `user-review/`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 164: the changed granted paths plus the new doc 133, vs `0e4287f`. Everything else is unchanged.
- **Checkpoint:** `b-round-160-checkpoint-request.md` is still open. It does not block this round. It is the input B needs before V-3c-4 (surfaces); without an answer by then, B applies fallback (c).
- **User-visible decisions (may be vetoed in `feature-status.md`):** R1 (white line with a dark halo), R2 (white 10 px handle with a dark border, enlarged on hover), R3 (6 px frame radius).
