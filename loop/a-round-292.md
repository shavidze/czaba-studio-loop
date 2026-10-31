# A round 292: FIX-PD-1c narrow-window state for `/studio-lab` and the LRS4 timeout (R5)

**No STOP.** Claims before editing were byte-identical to `b-round-291/claims-292-output.txt`. No covering test is above 50 % of its declared timeout. Biome needs no new ignore, and no frozen or protected file was touched. One deviation goes to B for a ruling (D1 below). It is a deviation, not a STOP, because both clauses are met in substance.

## Changed files (exactly the 9 §4 paths)
| Path | Change |
|---|---|
| `app/hooks/useStudioWideViewport.ts` | new: `STUDIO_WIDE_MIN_PX = 900`, `useStudioWideViewport` (uSES on `(min-width: 900px)`, `innerWidth >= 900` + `resize` fallback, server snapshot `true`), `useStudioHydrated` (noop subscribe, client `true`, server `false`) |
| `app/hooks/index.ts` | +1 line `export { useStudioHydrated, useStudioWideViewport } …` |
| `app/components/arrangement/StudioNarrowScreen.tsx` | new, context-free. Props `className?`, `themeMarker`, `focusHeadingOnMount`. Contents in order: exit `← CZABA` (`studio-narrow-exit`), h1 `studio-narrow-heading` tabIndex −1, body line, preview label + `<audio controls preload="metadata" src="/middle-east.mp3" aria-labelledby scheme-dark>`, `Preview unavailable.` on `error`, `Send link` (share → AbortError silent → other errors fall back to clipboard → `Link copied` / `Couldn't copy the link.` + a focused, selected, read-only `Studio link` field), live status |
| `app/components/arrangement/index.ts` | +1 export line |
| `app/routes/studio-lab.tsx` | gate above the provider. A ref latch `wasWide` is set only when `isHydrated && isWide`. Never-wide renders the narrow screen with no provider. In the wide branch and in SSR/hydration, the wrapper `contents max-[900px]:hidden` holds the provider and the workspace, followed by the narrow screen with `min-[900px]:hidden`. In the latched-narrow branch the provider stays at the same position, `StudioWorkspace` is replaced by `StopPlaybackOnNarrow`, and the narrow screen remounts with `focusHeadingOnMount`. The two narrow screens use different `key`s so the remount really happens. Widen focus goes to `arrangement-exit` only after a false → true transition when focus is on body or in the narrow screen (R4). `meta`, `links` and the initial arrangement are byte-identical |
| `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` | new: NG1–NG9 plus sub-rows NG5b, NG7a–d, NG9b, NG9c (15 tests). Describe `{ timeout: 15_000 }` (see T1) |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | TH4: +1 map line `'components/arrangement/StudioNarrowScreen.tsx': 1`. TH10: `h1` target excludes the narrow test id, plus a new `narrow h1` target with the same weight checks. Nothing else changed |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | `describe('library row status strings (V-0.5a)', { timeout: 15_000 }, …)` only |
| `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md` | new. l.4 is byte-exact `**სტატუსი:** Completed (C round 292 PASS)`. TEMPLATE headings in order. Records the mechanism and the rejected options, the `preload` ruling, the limitation (corrected per review, see below) and both Saba questions |

## Deviations and notes for B (each needs a ruling or acknowledgement)
- **D1 (§3.2 `<p role="status" aria-live="polite">`):** Biome `lint/a11y/useSemanticElements` rejects `role="status"` on a `<p>` and asks for `<output>`. §8 forbids a new ignore, so A used `<output aria-live="polite" className="… block …">`. It has the same implicit `status` role. §8's ignore bullet did not trigger: Biome did not ask for an ignore, it offered a semantic element. The workspace footer status already uses this pattern (`StudioWorkspace.tsx`, the `arrangement-status` output). B-AX's "a `status` region" holds; `getByRole('status')` in NG7 finds it.
- **D2 (NG3 mutant "server snapshot false"):** this mutant does **not** turn NG3 red. Under §3.3's own table, SSR and the hydration pass render the wide tree whenever `!isHydrated`, regardless of the snapshot. The snapshot's real observable effect is on desktop hydration: a `false` snapshot makes the widen-focus effect see false → true and autofocus `arrangement-exit`. A added **NG9c** (hydrate at wide width: the same `arrangement-exit` node, `activeElement === body`), which is red under that mutant (run below). C's UNIT-MUTANTS row should map "server snapshot false" to NG9c, not NG3.
- **D3 (K14):** the claims script's K14 now also lists `studio-narrow-gate-ui.test.tsx`, because the new file renders the route through `renderToString`. This is an expected consequence, but §6 CLAIMS does not list it.
- **D4 (NG9 tolerance):** in jsdom, hydrating the unchanged `ArrangementVideoDock` `<video muted>` logs `Prop muted did not match. Server: "false" Client: "true"`. This is a jsdom artefact. Real Chromium logged **no** hydration warning at 390/899/900/1440 (probe below). NG9 asserts zero hydration-like warnings (`/hydrat|did not match|didn't match/`) other than at most one whose prop argument is `muted`.
- **T1:** A declared `{ timeout: 15_000 }` on the new file's describe. NG5 measured 983–1588 ms alone and **2403 ms** once in the parallel covering run, which is 48 % of the 5000 ms default. That was too close to L11's 50 % line for a new file.

## Covering run (`npx vitest run` of the §5 set, final tree)
- 8 files, **145 tests, all pass**, rc 0. Log: `a-round-292/covering-full.log`.
- Tests ≥ 1000 ms in that run, with the declared timeout and the share used:

  | Test | Time | Timeout | Share |
  |---|---|---|---|
  | LRS4 | 2473 ms | 15 000 | 16 % |
  | NG5 | 2403 ms | 5 000 (default, at that run) | 48 % |
  | MS1 Ctrl+Z | 1533 ms | 5 000 (default) | 31 % |

  - NG5 now runs under 15 000 ms, so it is 16 %. Two later isolated runs: 983 and 1000 ms.
  - K9 gate-291 LRS4 was 2496 ms; against 15 000 that is 17 %.
- **Nothing is above 50 %.**

## Mutants (run by A against a backup copy of A's own files; restore verified with `diff -q`)
| Mutant | Red rows |
|---|---|
| `StopPlaybackOnNarrow` removed | NG5b |
| `StudioWorkspace` kept mounted when narrow | NG5, NG5b, NG6 |
| latch set without `isHydrated` | NG9 |
| server snapshot `false` | NG9c (see D2; NG3 stays green) |
| `>=` → `>` 900 | NG4 |
| latch starts `true` | NG1, NG9, NG9b |
| heading focus removed | NG5 |
| provider only in the wide branch | NG5, NG5b |

| gate below the provider (never-wide narrow screen wrapped in `ArrangementProvider`) | NG1 |

All 9 named mutants were measured; restore was verified with `cmp`.

## Typecheck / lint / Biome
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0. The 205 repository-wide warnings existed before; there are 0 in the 9 paths.
- `npx biome check` on the 8 code/test paths: rc 0, no fixes, **no new ignore**. `useMediaCaption` is already `off` in `biome.json`.

## Claims after the edits (`a-round-292/claims-after.txt`)
- K2 9; K3 1158 rc1; K5 `91 2 0`; K7 `193 379`; K8 `180 264 1`; K11 `218 1`; K12 `exists exists 2`; K13 `386 3906 2`; K14 +1 file (D3).
- All other K lines are identical.
- `sha256sum -c` fails only on the 5 granted existing files.

## A's own browser checks (Playwright Chromium, `127.0.0.1:5173`; scripts and screenshots in `a-round-292/`)
These are A's checks, not C's acceptance.
- **Direct load** at 390×844 and 899×900 (`probe.json`):
  - narrow screen, `activeElement` BODY, one visible h1;
  - `arrangement-exit` absent, `scrollWidth` = viewport;
  - body background `rgb(14, 13, 12)`, audio `color-scheme` `dark`, 1 theme marker;
  - 0 non-backend console errors, 0 hydration warnings.
- **900×900 and 1440×900:** workspace visible, narrow root `display:none`, no hydration warning.
- **Media requests at every width:** `/middle-east.mp3` ×2 and `/videos/hero/hero-music.mp3` ×1, all inside the B-NET set.
- **Resize from 1440×900 and from 1280×720** (`resize.json`): add Bass, mute Music, Play (`data-playing` true), then resize to 899:
  - heading focused, transport unmounted;
  - Space on `Send link` gives `Link copied`, and the clipboard holds the page URL;
  - back to wide: 1 clip, Music still muted, `data-playing` false, focus on `arrangement-exit`, and Ctrl+Z un-mutes.
- **390 → 1440 with focus on `Send link`:** focus moves to `arrangement-exit`; then add + Play gives `data-playing` true.
- **Tab order at 390** (`taborder.cjs`): `studio-narrow-exit` → `AUDIO` (Chromium's native controls take 6 Tab stops inside the element; only the first shows an outline on the host) → `Send link`. Outline on the exit and the button is 1px solid.
- **B-DESK-SAME pre-check** (`desk-diff-a.cjs`, `desk-diff-a.json`, B's method against `b-round-291/probe/desk-5173-*.png`): **0** differing pixels at 1280×720 and **0** at 1440×900.
- **B-BOUNDARY with JavaScript disabled** (`desk-diff-a.json`, `nojs-899.png`, `nojs-900.png`):
  - At 899 the wrapper `contents max-[900px]:hidden` computes to `display:none`, and its first child is not rendered (0 client rects). Its own computed `display` still reads `flex`, so C should measure the wrapper or client rects, not the child's computed display. The narrow root is `flex`.
  - At 900 the wrapper is `contents`, the child is visible, and the narrow root is `none`.
- **Not run by A** (C's rows): master-tap RMS, B-DESK-SAME pixel diff, contrast numbers, AX tree, B-PREVIEW timing, B-AUDIO-ERROR route abort, B-JOURNEY-292, G292-AUTH, JS-disabled B-BOUNDARY.

## code-reviewer (real subagent, all 9 paths), score 8/10, and how A addressed it
- **Medium: no row covered stop-on-narrow; NG6's playing check was vacuous** (empty arrangement, and a non-existent test id with a `?? 'false'` fallback).
  - **Fixed:** added NG5b (a real Soft impact clip via library double-click, Play → `data-playing` true, narrow, widen → false). It is red without `StopPlaybackOnNarrow`.
  - NG6 now reads `[data-playing]` directly.
- **Medium: phone hydration costs more than the doc said.** The provider's load effect also synthesises 2 SFX on the main thread and starts the synth worker, which a module-level cache keeps from being aborted.
  - **Doc corrected.** The fix touches frozen `ArrangementContext.tsx` / demo data, so it is a planner item (extends B-R291-NARROW-PREFETCH).
- **Low: the narrow screen remounts after phone hydration**, so pressing native Play before hydration stops the preview.
  - A tried keeping one key across the boundary and reverted it: on never-wide → wide, the hidden player would keep sounding behind the workspace.
  - Left to B and recorded in doc 218 TODO.
- **Low: a second failed copy did not refocus the field, and a share success after a failed copy left the field visible.** **Fixed** with a failure counter as the effect dependency, and by clearing the field on share success.
- **Low: NG9 `hydrateRoot` was not unmounted.** **Fixed** (NG9 and NG9c unmount).
- **Low, not changed (outside the grant or the spec):**
  - TH4's title still says "only on StudioWorkspace"; R6 allows only the map line.
  - `Preview unavailable.` sits outside the live region; the spec places it as a replacement line.
  - The latch is a ref written in render; the spec requires a `useRef` latch.
  - No Safari < 14 `addListener` fallback.
  - The desktop hidden `<audio preload="metadata">` adds one metadata request; this is in the doc.
- **Architecture note (for B, not acted on):** signal 4, new lifecycle in an existing owner (`studio-lab.tsx` now owns the viewport gate, a side-effect-only child and the cross-subtree focus moves). **Keep:** it is small, the invariants are pinned by NG5, NG5b and NG9, and extracting it would only add prop plumbing. **Proposal:** one bounded task to defer source loading until a wide state is confirmed (for example a collection wrapper whose `loadSource` waits), so a phone hydration starts no fetch and no synthesis. Owner: whoever owns `ArrangementContext` / the demo data. Value medium, risk low.

## Known gaps for B (not fixed; outside the spec)
- **Library preview on narrow (code reading, not browser-verified):** `StopPlaybackOnNarrow` calls only `togglePlayback`, as §3.3 says. Nothing stops a running library-source preview when `StudioWorkspace` unmounts:
  - `stopLibraryPreview` is called only from `ArrangementLibrary`'s collapse/results effect and from the preview button;
  - neither has an unmount cleanup.

  So narrowing mid-preview probably keeps the preview audible behind the narrow screen. The fix is one call to the context's `stopLibraryPreview` in `StopPlaybackOnNarrow`, but that goes beyond §3.3's wording, so A did not add it. C may probe it; B should rule.
- The phone hydration cost (fetch + synthesis + worker) and the narrow-screen remount after phone hydration, both described above.
- `a-round-292/covering.log` is an empty leftover from a failed grep pipeline; the real log is `covering-full.log`.

## Acceptance rows A truly passed (A-side evidence only; C verifies)
CLAIMS (with D3), SOURCE-SCOPE (9 paths; the frozen list fails only on the 5 granted files, re-checked on the final tree), TYPECHECK, UNIT (with T1), UNIT-MUTANTS (all 9, with D2), and the DOC-218 l.4 / headings check. The browser rows are partly pre-checked above but are **C's to pass**.

## Exact next C checks
1. Re-run `claims-292.sh`. Expect the deltas above, including K14 (D3).
2. Rule on D1 (`<output>`) and D2 (map the snapshot mutant to NG9c).
3. Run all §6 browser rows. Focus on:
   - B-RESIZE-KEEP master-tap RMS 0 within 300 ms;
   - B-DESK-SAME 0-pixel diff (A's pre-check is 0 / 0; the hidden narrow `<main>` + `<audio>` are in the desktop DOM);
   - B-FOCUS-ORDER: decide whether the native audio's internal Tab stops are acceptable as "→ audio →";
   - B-BOUNDARY with JavaScript disabled (see the child-display note above);
   - B-JOURNEY-292;
   - B-NET counts (A saw 3 media requests at every width).

## Scope completed
§3.1–§3.6 implemented, with the review fixes above. The whole backlog is not complete. F8 is ready for C, not done.
