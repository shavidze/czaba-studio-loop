# Round 292: FIX-PD-1c. Narrow-window state for `/studio-lab` (F8, Medium) + LRS4 timeout ruling (A STOP item 1, round 291)

**Planned by:** B, at the round 291 → 292 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z723:** round 291 (FIX-PD-1b2 + RT-FIX-291) is closed. C PASS, `browserVerified` and `realVerified` both true, 0 failed rows. Gate 291 published `88b23dd` on both remotes. GATE289-S1/S2/S3 and A-R289-REVIEW-L2 are closed.
- **D-29z724:** rulings on A's round-291 STOP.
  - Item 1 (LRS4 headroom) is granted in this round as R5. Gate 291 measured 2496 ms against the 5000 ms default [K9]; this is the third time (rounds 238, 253, 291).
  - Item 2 (C-R291-01, Low, the `#occurrence` key suffix is unpinned) goes to `deferred_low_polish`. Gate-291 review suggestions 1 and 2 go there too, as GATE291-S1 and GATE291-S2. The reviewer's watch item goes to `architecture_signals`.
- **D-29z725:** this round's scope, the mechanism ruling (tech-lead over product-designer on *where* the gate lives) and the copy ruling (Saba's approved F8 wording over product-designer's rewrite).
- **D-29z726:** the order after this round.

**Owner:** A. **Verifier:** C. **Grants:** §4.
- This round touches no Store page, auth, cart, checkout, purchase or protected file.
- It does not change any audio, playback, export or video code. The narrow state only *stops* playback through the existing `togglePlayback`.

## Baseline: HEAD `88b23dd` [K1], clean tree [K2]
- `gates/gate-round-291.json` is `published 88b23dd` [K1].
- **Frozen list:** `b-round-291-r292-tree-sha256.txt`, 1,158 entries (`git ls-files` at `88b23dd`), `sha256sum -c` rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-291/claims-292.sh` **before editing**. Its output must equal `b-round-291/claims-292-output.txt`. Any difference is a STOP (§8).
  - After A's edits, K2, K3 rc, K5, K7, K8, K11, K12 and K13 change on purpose; §6 lists the new values.

## 0. Read first
1. `lessons.md` (every role), especially L4, L10, L11, L12, L23, L29, L31, L39, L47, L50, L52, L53, L54 and L56.
2. This task.
3. `/home/runner/czaba-project/docs/technical/studio-real-workspace/product-design-review-2026-10-31.md` §F8.
4. B's sketch: `b-round-291/sketch-route-theme.diff`, `sketch-useStudioWideViewport.ts.txt` and `sketch-StudioNarrowScreen.tsx.txt`. It is a starting point and is **not** the full contract: it lacks the stop-on-narrow child, the focus moves, the audio-error state, the clipboard-failure field and `scheme-dark` placement.
5. A's primitives:
   - `AGENT_DISCOVERABLE_CODE.md` and `FORWARDREF_COMPONENT.md`, plus `prompts/new-component.md` (new component);
   - `prompts/new-hook.md` (new hook) and `REACT_CONTEXT.md` (it reads `useArrangement`);
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md`;
   - `AUDIO_ARCHITECTURE.md` (stopping the transport);
   - `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
   - `GEORGIAN_DOCS.md`.

## 1. Why, and the promise
**Promise (L55):** "a visitor on a phone gets a calm page where they can hear a CZABA preview and send themselves the link, and a desktop user who narrows the window never loses their work."

**What happens at HEAD** (`b-round-291/probe/narrow-head.json`, `head-390x844.png`):
- At 390×844 the full workspace renders. Five toolbar buttons overlap each other [K17], and the timeline runs off-screen.
- The route has no width gate [K5]. Only the protected legacy route uses `MobileBlocker`, which is out of scope.
- At every width the page downloads both demo mp3 files and starts one synth worker. HEAD logged 2 media requests at 390 [K17].
- The arrangement exists only in memory. Unmounting the provider would lose the user's clips and history.

## 2. Reference (bug-gate Medium fix-up; product-designer consulted)
**Classification:** F8 is a Medium finding under the 2026-10-23 bug gate. It is fixed now, like FIX-PD-1a and FIX-PD-1b. Saba approved the review's recommendation on 2026-10-31, so this round needs no AGREE note and no YouTube step.

**No reference found for a phone-blocking state:**
- B searched for Soundtrap, BandLab and Figma ("mobile browser", "use a computer", "not supported").
- product-designer checked:
  - Soundtrap runs in phone browsers and has an app ([support](https://support.soundtrap.com/hc/en-us/articles/36832868861714));
  - BandLab's web and app versions offer different features ([help](https://help.bandlab.com/hc/en-us/articles/115002959254-What-platforms-can-I-use-BandLab-on));
  - Figma: a staff forum reply says the editor is not optimised for mobile browsers and the app is for viewing and commenting ([forum](https://forum.figma.com/t/why-cant-i-edit-my-figma-files-in-mobile-app/62244)). This is not a help-centre article.
- None of them shows a blocking screen. So the desktop-only Studio is CZABA's own product decision, and the narrow state must still be useful: a preview and a link.
- Ableton Live has no browser version, so Ableton conformity is **not applicable** (§7).

**Deviations:**
- **⚖ No "Continue anyway" escape.** The legacy `MobileBlocker` offers one at 1024 px. Below 900 px the workspace layout is broken (overlap, timeline off-screen), so an escape would lead straight to that failure (product-designer). This goes to Saba once, as **SABA-Q-FIXPD1C-ESCAPE** (L44), non-blocking.
- **Copy:** the wording Saba approved is used as is. product-designer proposed "The Studio needs a wider window / Open this page on a computer, or widen this window…", because the approved text reads oddly to a desktop user who has just narrowed the window. That goes to Saba once, as **SABA-Q-FIXPD1C-COPY**, non-blocking. B does not change approved copy by itself.
- **Native player:** the preview uses the browser's own `<audio controls>`, darkened with `scheme-dark` (B's sketch: computed `color-scheme` `dark`, `probe/sketch-390-scheme-dark.png`). Loading, playing, paused, ended, keyboard and screen-reader support come with it. Its chrome is not drawn with our tokens; that is accepted for a fallback page.

**Screen budget (L39):** the desktop screen does not change. At ≥ 900 px the new markup is in the DOM but `display:none`. B's sketch measured 0 differing pixels at 1280×720 and 1440×900 against HEAD [K17], so the persistent text-line count is unchanged by construction. The narrow state is a separate page state, not a persistent element added to the Studio.

## 3. What A changes

### 3.1 New hook `app/hooks/useStudioWideViewport.ts`
- It exports `STUDIO_WIDE_MIN_PX = 900` and `useStudioWideViewport(): boolean`.
- It uses `useSyncExternalStore` on `matchMedia('(min-width: 900px)')`, subscribing to `change`.
- If `window.matchMedia` is not a function, it falls back to `window.innerWidth >= 900` with a `resize` listener.
- **Server snapshot: `true` (wide).** This is ruling line R1: it keeps the SSR HTML and the first client render identical, so there is no hydration mismatch.
- It also exports `useStudioHydrated(): boolean`, `useSyncExternalStore(noopSubscribe, () => true, () => false)`. It is `false` on the server **and during the hydration pass**, and `true` after it.
  - **Why:** during hydration `useSyncExternalStore` returns the server snapshot, so `useStudioWideViewport` reads `true` even on a phone. A latch set in that pass would wrongly treat every phone load as "was wide" (advisor finding, round-292 planning).
- No `useLayoutEffect` (the `ssr-layout-effect` test forbids it).
- Export both hooks from `app/hooks/index.ts` (one added line).

### 3.2 New component `app/components/arrangement/StudioNarrowScreen.tsx` (export it from `components/arrangement/index.ts`)
**Context-free.** It never calls `useArrangement`, because on a never-wide load it renders without the provider.

**Props:**
- `className?: string`;
- `themeMarker: boolean`: when true, the root carries `data-studio-theme="obsidian"`;
- `focusHeadingOnMount: boolean`.

**Content, top to bottom.** Strings are exact, in English, without guillemets.
1. A `Link to="/"` that reads `← CZABA`, with an `ArrowLeft` icon (`aria-hidden`) and `data-testid="studio-narrow-exit"`. It uses a new test id so the SSR HTML never has two `arrangement-exit` elements.
2. `<h1 tabIndex={-1} data-testid="studio-narrow-heading">The Studio works on a computer</h1>`.
3. `<p>Listen here, or send yourself the link.</p>`.
4. A label `Middle East — public preview` (`id` used by the audio element's `aria-labelledby`), then `<audio controls preload="metadata" src="/middle-east.mp3" className="… scheme-dark">`.
   - **R2:** `preload="metadata"`, so the duration shows before Play. tech-lead's `none` was rejected: the provider already requests the same file on this page [K10], so `none` saves nothing measurable today.
   - **On the audio `error` event:** the label and the player are removed. A line `Preview unavailable.` takes their place. Send link keeps working.
5. A `<button type="button">Send link</button>`, then a status line `<p role="status" aria-live="polite">`, empty at rest.
   - If `typeof navigator.share === 'function'`, call `navigator.share({ title: 'CZABA Studio', url: location.href })`.
     - If it resolves, the status stays empty.
     - If it rejects with `AbortError` (the user cancelled), the status stays empty.
     - Any other rejection falls back to the clipboard path.
   - **Clipboard path:** `navigator.clipboard.writeText(location.href)`.
     - On success the status reads `Link copied`.
     - On failure, or when `navigator.clipboard` is missing, the status reads `Couldn't copy the link.` A `readOnly` text input labelled `Studio link`, with the URL as its value, appears under it and is focused and selected.

**Styling:**
- Tailwind tokens only (`bg-background`, `text-foreground`, `text-muted`, `border-outline`…). No hex values and no new tokens.
- No focus classes: the global `:focus-visible` ring applies [K13], and `studio-focus-ring` scans this folder.
- The root is a `<main>` that fills the viewport (`min-h-screen`) with modest padding. No horizontal scroll at 390.
- No motion.

**`focusHeadingOnMount`:** when true, a `useEffect` focuses the h1 once, on mount.

### 3.3 `app/routes/studio-lab.tsx`
The gate lives here, **above** `ArrangementProvider` (tech-lead).
- `isWide = useStudioWideViewport()` and `isHydrated = useStudioHydrated()`.
- A `useRef` latch `wasWide` is set to true the first time `isHydrated && isWide` is true. It is **never** set during the server render or the hydration pass (R8).

| State | Renders |
|---|---|
| Server render and hydration pass (`!isHydrated`) | the **Wide** row below, at every width, so the HTML matches |
| Never wide (`isHydrated && !wasWide`) | `<StudioNarrowScreen themeMarker focusHeadingOnMount={false} />` and **no provider**. A direct phone load lands here right after hydration: the provider mounted once in the hydration pass (B-R291-NARROW-PREFETCH) and unmounts now, and nothing is auto-focused |
| Wide (`isHydrated && wasWide && isWide`) | `<div className="contents max-[900px]:hidden">` + provider + `<StudioWorkspace/>`, then `<StudioNarrowScreen className="min-[900px]:hidden" themeMarker={false} focusHeadingOnMount={false} />`. This is also the SSR and first-paint tree; CSS picks the visible part, so a phone sees no toolbar flash. **`max-[900px]`, not `max-[899px]`:** Tailwind v4 compiles `max-[N]` to `(width < N)` and `min-[N]` to `(width >= N)` (`node_modules/tailwindcss/dist/lib.js`). So `max-[900px]` and `min-[900px]` are exact complements; `max-[899px]` would leave both visible between 899 and 900 px. B's sketch diff still shows the old `899`; this task wins |
| Latched, now narrow (`isHydrated && wasWide && !isWide`) | The provider **stays mounted** inside the same wrapper, so clips, mix and Undo history survive. `StudioWorkspace` is **not** rendered: its window key listeners [K6] unmount, so Space or Delete cannot act on a hidden workspace. Inside the provider, a small route-local child `StopPlaybackOnNarrow` calls `togglePlayback()` once on mount if `isPlaying` [K15], and renders nothing. Then `<StudioNarrowScreen themeMarker focusHeadingOnMount />` |

**Element positions (R3).**
- The provider element keeps the same position in the hydration tree and both latched branches, so a desktop load never remounts it after hydration.
- `StudioNarrowScreen` may remount between branches; it holds only the status text.
- **Exactly one `data-studio-theme` marker in the SSR HTML:** the workspace's. The narrow screen carries the marker only when the workspace is not rendered, so `body:has([data-studio-theme])` [K13] keeps the obsidian tokens on a phone.

**Widen focus (R4).** When `isWide` turns true after it was false, and `document.activeElement` was inside the narrow screen or was `body`, focus moves to the workspace's `arrangement-exit` link [K6]. The route finds it inside its own wrapper with a ref and `querySelector('[data-testid="arrangement-exit"]')`, after the workspace has mounted (a `useEffect` on `isWide`). Otherwise focus is left where it is.

**No other change.** `meta`, `links` and the initial arrangement stay byte-identical.

### 3.4 Focus targets (L47; L50 grep on the granted route: 0 hits, `b-round-291/l50-hits.txt`)
The only action in this round that removes a focused element is the viewport crossing 900 px.
- **Narrowing (latched):** whatever was focused in the workspace unmounts. Focus goes to `studio-narrow-heading`. It is never `body`.
- **Widening:** if focus was in the narrow screen or on `body`, it goes to `arrangement-exit`.
- **First narrow load** (direct phone load or client-side navigation): no automatic focus; `document.activeElement` is `body`. Tab order is `studio-narrow-exit` → the audio element → `Send link` (→ the `Studio link` field only when it is shown).

### 3.5 Tests

**New file `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx`.**
- It installs its own controllable `matchMedia` stub with change listeners. jsdom has none, and the file must not use a global setup.
- It uses `createWorkspaceTestEnvironment` from `helpers/workspace-test-environment.ts` for audio fakes, and stubs `fetch`.

Rows (each names its mutant, L52):
- **NG1:** narrow (`matches: false`) client render of the route.
  - `studio-narrow-heading` text is exact, and `arrangement-exit` is absent.
  - `fetch` is called 0 times; the provider never mounted.
  - Mutants: gate moved below the provider → `fetch` > 0; latch removed so that it starts true → workspace present.
- **NG2:** wide client render.
  - `arrangement-exit` is present.
  - The narrow root has no `data-studio-theme` attribute, and the document has exactly one marker.
- **NG3:** `renderToString` of the route with `matchMedia` stubbed narrow.
  - The HTML contains `arrangement-exit` once and `studio-narrow-heading` once.
  - `data-studio-theme=` appears exactly once.
  - The narrow root's class contains `min-[900px]:hidden`, and the wrapper's contains `max-[900px]:hidden`. This class check is allowed here because the classes *are* the SSR visibility contract; L12 targets styling.
  - Mutant: server snapshot changed to `false` → `arrangement-exit` absent.
- **NG4:** boundary.
  - The query string passed to `matchMedia` is exactly `(min-width: 900px)`.
  - With `matchMedia` removed, `innerWidth` 899 → narrow and 900 → wide.
  - Mutant: `>=` changed to `>` → the 900 case red.
- **NG5:** latched narrowing keeps the arrangement.
  - Wide render; click `Mute — Music` (`aria-pressed` true); flip to narrow.
  - `arrangement-exit` is absent, and `document.activeElement` is `studio-narrow-heading`.
  - Flip to wide: `Mute — Music` `aria-pressed` is still true, and `document.activeElement` is `arrangement-exit`.
  - Ctrl+Z then un-mutes, so history was kept.
  - Mutants: the provider rendered only in the wide branch → `aria-pressed` false; heading focus removed → activeElement `body`.
- **NG6:** keys in the latched narrow state.
  - Focus `Send link` and press Space and Delete on it (keydown on the button). The transport stays stopped: `data-playing` is absent while narrow and `false` after widening.
  - Mutant: `StudioWorkspace` kept mounted in the narrow branch → red.
- **NG7:** Send link.
  - (a) `navigator.share` defined → called once with `{ title: 'CZABA Studio', url }`, and the status is empty.
  - (b) `share` rejects with `AbortError` → the status is empty, and `clipboard.writeText` is not called.
  - (c) `share` undefined and `writeText` resolves → `Link copied`.
  - (d) `writeText` rejects → `Couldn't copy the link.`, the `Studio link` field holds the URL and is `document.activeElement`.
- **NG8:** the audio element's `error` event → the text `Preview unavailable.` is present, there is no `audio` element, and `Send link` is still present.
- **NG9 (hydration):** `hydrateRoot` on the route's `renderToString` HTML with `matchMedia` stubbed narrow, then flush.
  - `arrangement-exit` is absent and `studio-narrow-heading` is present.
  - `document.activeElement === document.body` (no autofocus).
  - No `console.error` hydration warning.
  - Mutant: the latch set without `isHydrated` (set during the hydration pass) → the heading is focused, red.

**`app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` (R6, exact, sketch-tested `b-round-291/sketch-route-theme.diff`, `sketch-tests.log` 5 files / 89 tests):**
- **TH4** [K7]: add `'components/arrangement/StudioNarrowScreen.tsx': 1,` to the expected map. This is the only change to TH4.
- **TH10** [K7]: the `h1` target becomes "h1 *without* `data-testid="studio-narrow-heading"`, count 1". Add a second target, `narrow h1`, "h1 *with* that test id, count 1", which goes through the same `font-medium` / no `font-semibold` / no `font-bold` checks.
- No assertion is lost; the replacements are equal or stronger (L4). Nothing else in the file changes.

**`app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` (R5):**
- Add a `{ timeout: 15_000 }` options argument to the `describe('library row status strings (V-0.5a)', …)` [K8], in the vitest 4 form `describe(name, options, fn)`.
- Nothing else changes, including the row bodies and the second describe.

### 3.6 Implementation doc `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md` (new; 217 is the last [K11])
- Write it in Georgian with English terms, using the TEMPLATE headings (L26).
- l.4 is exactly `**სტატუსი:** Completed (C round 292 PASS)` (L28).
- Cite only test ids that exist: NG1–NG9, TH4, TH10 and LRS4.
- Record:
  - the mechanism choice and the rejected options (CSS-only, keeping the workspace mounted with a key guard, unmounting the provider);
  - the `preload` ruling;
  - the known limitation that a phone still downloads the two demo mp3 files during hydration, the same as HEAD (B-R291-NARROW-PREFETCH, deferred);
  - the two Saba questions.

### 3.7 Ruling lines (L4)
- **R1:** the hook's server snapshot is `true`. That wins over any wish to render the narrow state alone on the server.
- **R2:** `preload="metadata"`.
- **R3:** the provider keeps its element position across the two latched branches. Any refactor that remounts it is a STOP.
- **R4:** widen focus goes to `arrangement-exit` only if focus was in the narrow screen or on `body`.
- **R5:** the LRS4 timeout wins over L31's "split", because the file gets no new rows.
- **R6:** the TH4/TH10 edits win over "no other change".
- **R8:** the latch ignores the server render and the hydration pass (§3.1, NG9).
- **R7:** `StudioWorkspace.tsx`, `ArrangementContext.tsx` and `MobileWarning.tsx` are **not** edited. If the contract cannot be met without editing them, that is a STOP (§8).

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/routes/studio-lab.tsx` | §3.3 |
| `app/hooks/useStudioWideViewport.ts` | new, §3.1 |
| `app/hooks/index.ts` | one export line |
| `app/components/arrangement/StudioNarrowScreen.tsx` | new, §3.2 |
| `app/components/arrangement/index.ts` | one export line |
| `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` | new, §3.5 |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | TH4 + TH10 only (R6) |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | the describe options only (R5) |
| `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md` | new |

**Frozen:** everything else in the frozen list. In particular:
- `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `studio-lab-demo.ts`, `strings.ts`, `collection.ts`, `MobileWarning.tsx` and `app/styles/app.css`;
- every Store file;
- the 7 protected files [K4];
- `package.json` and the lock file.

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (§6 deltas).
- `npm run typecheck` and `npm run lint`.
- `npx biome check` on the changed code files: rc 0, no new ignore.
- **Covering set:** `npx vitest run` on the new `studio-narrow-gate-ui`, `studio-theme-obsidian`, `ssr-layout-effect`, `default-track-names-ssr`, `studio-focus-ring`, `strings`, `library-row-strings-ui` and `meta-shortcuts-ui`. These are the three route renderers [K14], the two folder scanners, the LRS file, and one workspace keyboard file as a neighbour.
  - Report the file and test counts.
  - List every test above 50 % of its timeout (L11).
- The real `code-reviewer` subagent (9 paths), with its Architecture note passed to B.
- Mutants: A may run them; they are C's UNIT-MUTANTS row.

## 6. Acceptance (C)
All browser rows run in Playwright Chromium against `http://127.0.0.1:5173/studio-lab`, with fresh contexts and empty storage. Load the page once untimed first (L38).
- `navigator.share` is undefined in headless Chromium, so the clipboard path is the one that runs live. Grant `clipboard-read` and `clipboard-write`.
- To exercise share, define a stub with `addInitScript`.
- Native audio play: click the element's play control, or call `play()` inside a user-gesture click handler.

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Differences only where expected: K2 = 9 lines; K3 rc1, failing only on the 5 granted existing paths; K5 = `<new line count> 2 0` (the hooks live in `app/hooks/`, so the route's `useSyncExternalStore`/`matchMedia` count stays 0); K7 the TH lines move; K8 `timeout` count 1; K11 `218 1`; K12 `exists exists 2`; K13 the `data-studio-theme=` count becomes 2. Other K lines identical. L29 grep over this task: no untagged fact about store code |
| SOURCE-SCOPE | `git status` | exactly the 9 §4 paths; the frozen list fails only on the 5 granted existing files (`studio-lab.tsx`, `hooks/index.ts`, `arrangement/index.ts` and the two granted test files) |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | all pass; NG1–NG9, TH4, TH10 (both h1 targets) and LRS4 present by name; the LRS describe carries the 15 000 ms timeout |
| UNIT-MUTANTS | scratch copy | each mutant named in §3.5 turns its row red (gate below the provider, latch removed, server snapshot false, `>` 900, provider only in the wide branch, heading focus removed, workspace kept mounted, latch set during hydration) |
| B-NARROW-LOAD | 390×844, 768×1024, 899×900 | Direct load. `document.activeElement` is `body` after a 2 s settle (no autofocus). One visible h1, `The Studio works on a computer`; body line exact; `arrangement-exit` absent from the DOM after a 2 s settle; `scrollWidth` = viewport width; `studio-narrow-exit` href `/`; full-window screenshot each |
| B-BOUNDARY | 899×900 vs 900×900 | 899 → narrow state only; 900 → workspace visible, narrow root `display:none`. Also before hydration (JavaScript disabled context): at 899 the workspace wrapper's children are `display:none` and the narrow root is visible; at 900 the reverse |
| B-DESK-SAME | 1280×720, 1440×900 | Full-window screenshot after `Demo collection ready` + 1.5 s, mouse at (0, h−1): **0 differing pixels** against `b-round-291/probe/desk-5173-*.png` (B's HEAD shots; method in `probe/desk-diff.cjs`) |
| B-THEME | 390×844 | body background `rgb(14, 13, 12)` (obsidian); `audio` computed `color-scheme` `dark`; heading and body-line contrast against the background ≥ 4.5:1 (measured values reported) |
| B-AX | 390×844 | Chromium AX tree: one `heading` level 1; `audio` element named `Middle East — public preview`; button `Send link`; a `status` region |
| B-FOCUS-ORDER | 390×844 | Tab from page start: `studio-narrow-exit` → `audio` → `Send link`, each `:focus-visible` with a painted outline ≥ 1 px (L9) |
| B-PREVIEW | 390×844 | The duration reads about 1:41 before Play (metadata); after Play, `paused` is false and `currentTime` advances ≥ 0.5 s in 1 s; Pause stops it |
| B-SEND | 390×844 | (a) clipboard: `Link copied`, clipboard text = page URL; (b) `writeText` overridden to reject → `Couldn't copy the link.`, the `Studio link` field value = URL and focused; (c) share stub → called once with the URL, status empty; (d) share stub rejecting `AbortError` → status empty, clipboard untouched |
| B-AUDIO-ERROR | 390×844 | `page.route('**/middle-east.mp3', r => r.abort())` → `Preview unavailable.`, no `audio` element, `Send link` works ((a) path) |
| B-RESIZE-KEEP | start 1440×900 and 1280×720 | Add `Night Pulse · Bass` (library Enter), mute Music, Play 1 s. Resize to 899: narrow visible, `document.activeElement` = `studio-narrow-heading`, master tap RMS 0 within 300 ms (playback stopped). Tab to `Send link`, press Space: `Link copied`, no audio. Resize back: same clip count as before, Music still muted, `data-playing` `false`, `document.activeElement` = `arrangement-exit`, Ctrl+Z un-mutes |
| B-NARROW-WIDE | 390×844 → 1440×900 | Tab to `Send link`, then resize: workspace visible, `Demo collection ready`, `document.activeElement` = `arrangement-exit`; then add + Play works (`data-playing` true, RMS > 0) |
| B-NET | 390×844 | Media requests ⊆ {`/middle-east.mp3`, `/videos/hero/hero-music.mp3`}, the same set as HEAD (`probe/narrow-head.json`); no other new URL. The count and the finished/aborted split are reported, not bounded (B-R291-NARROW-PREFETCH) |
| B-JOURNEY-292 (L54) | 390×844 | `/` → open the mobile menu → `Studio` → narrow state → Send link → `← CZABA` back to `/`; one screenshot per step |
| G292-AUTH | fresh context | `/studio-lab` anonymous (badge at 1440; narrow state at 390), `auth_user` null; `/studio/middle-east` shows `Sign in required`, with 0 `audio[src]`; token API 401 without a header, no token in the body |
| DOC-218 | doc | l.4 byte-exact; TEMPLATE headings in order; only existing test ids cited; limitation and both Saba questions recorded |
| gate | — | The full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows |

**Adjacent behaviour that could break:**
- the Obsidian theme on the desktop Studio (B-DESK-SAME, TH4);
- SSR of the route (NG3, `default-track-names-ssr`);
- workspace keyboard shortcuts (B-NARROW-WIDE Play, `meta-shortcuts-ui`);
- the legacy route's `MobileBlocker` (G292-AUTH: unchanged and protected).

## 7. Ableton conformity (C reports separately)
- **CZABA requirement:** the narrow state, the preview, the link and no data loss on resize.
- **Ableton:** not applicable. Live has no browser or phone version.

## 8. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-292.md` and change nothing else if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout (LRS4 is judged against its new 15 000 ms);
- Biome asks for a new ignore (the sketch's `useMediaCaption` ignore is **not** granted; if Biome requires a `<track>` or an ignore for the native audio element, STOP);
- any row needs an edit to `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `app.css` or another frozen file;
- a hydration warning appears in the browser console at 390 or 1440;
- any two clauses of this task conflict outside R1–R8.

## 9. Why we missed it (product-designer review finding, not Saba-reported; short)
- The Studio's desktop-only decision dates from the legacy route (`MobileBlocker`). The new `/studio-lab` was built and reviewed only at 1280×720 and 1440×900, so no row ever loaded it below 900 px.
- L53 already asks for one probe below the required viewports on layout-mode changes. This round adds 390, 768 and the 899/900 boundary as rows.
- L54 (journey) is applied as B-JOURNEY-292.
- No new lesson: L53 and L54 cover it (D-29z725).

## 9b. Deliverables
- **A:** `a-round-292.md`, with:
  - the changed files;
  - the covering-run counts and the timing list;
  - the typecheck, lint and Biome results;
  - the code-reviewer output, including its Architecture note.

  A STOP goes at the top (L11).
- **C:** `c-round-292.md` and `c-round-292.json`, with evidence under `c-round-292/`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate` and `rows`;
  - `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`;
  - an `origin` for each finding.
- **Root:** publish after C PASS and the gate. Changing paths: the 9 in §4.

## 10. Claims (`b-round-291/claims-292.sh`; expected output `b-round-291/claims-292-output.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `88b23dd`; gate 291 `published 88b23dd` |
| K2 | `git status --short --untracked-files=all` has 0 lines |
| K3 | frozen list 1158 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | `studio-lab.tsx` has 33 lines, 2 `StudioWorkspace` mentions, 0 `useSyncExternalStore`/`matchMedia` lines |
| K6 | `StudioWorkspace.tsx` window keydown listener at l.2607, `data-testid="arrangement-exit"` at l.2761 |
| K7 | `studio-theme-obsidian.test.tsx` TH4 map line l.192, TH10 `name: 'h1'` at l.377 |
| K8 | `library-row-strings-ui.test.tsx` describe at l.180, LRS4 at l.264, 0 `timeout` |
| K9 | gate 291 `verify.log`: LRS4 2496 ms |
| K10 | `studio-lab-demo.ts` l.20 `'demo-middle-east': '/middle-east.mp3'`; title `Middle East — public preview` once |
| K11 | last quarter-IV implementation doc is 217; 0 files start with 218 |
| K12 | `StudioNarrowScreen.tsx` absent, `useStudioWideViewport.ts` absent; 1 non-test app file uses `matchMedia` |
| K13 | `app.css` global `:focus-visible` rule at l.386; `body:has([data-studio-theme="obsidian"])` at l.3906; 1 `data-studio-theme=` attribute line in non-test `.tsx` |
| K14 | route renderers: `default-track-names-ssr`, `ssr-layout-effect`, `studio-theme-obsidian` |
| K15 | `useArrangement` at l.4220; `isPlaying: boolean` l.299 and `togglePlayback: () => void` l.311 in the context type |
| K16 | every cited `b-round-291/` artifact exists (`done`) |
| K17 | HEAD 390: 5 toolbar overlaps, 2 media requests; sketch desktop diff 0 / 0 pixels |
| K18 | `Demo collection ready.` 1, `Sign in required` 1, `data-playing=` 1 |
