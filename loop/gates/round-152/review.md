COMMIT: OK (the change only touches classNames, CSS tokens and a route `links` export, plus tests and docs. It doesn't touch auth, purchase or download code. C round 152 passed, and verify passed: 170/170 test files and the build.)

## Code Review: round-152 — Studio V-2a typography (fonts + mono numerals)

I read `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md` first. This reviews the diff only, not the whole module.

### Critical Issues
- none

### Findings (ranked; none block the commit)

1. **Low — the 123 doc is out of date and contradicts itself.** `docs/implementation/2026/quarter-IV/123-studio-v2a-typography-fonts.md`:
   - l.70 says "C round 151 ჯერ არ გაშვებულა", but l.71 describes the results of that same round.
   - l.78 still lists C round 151 as a TODO.
   - l.4 still says "In Progress", and the doc has nothing about C round 152 passing.
   - **Fix:** delete the sentence at l.70 and the TODO at l.78. Add the C-152 result (10 rows passed, 0 bugs, G152-3 blocked because the backend was unavailable), and set the status to Completed with this gate's commit. This is the same kind of update this diff already made in doc 122.

2. **Low — TH8 finds the track volume readouts by guessing from classes.** `studio-theme-obsidian.test.tsx:144-147` looks for elements with `w-10` + `tabular-nums` and expects exactly 4. If any future element gets `w-10 tabular-nums`, this test breaks or passes for the wrong reason.
   - **Fix (next round):** add `data-testid="arrangement-track-volume-readout"` to `ArrangementLane.tsx:816-819` and use `classTokensOfEveryTag` to filter by that testid, the same way the pan-reset check does.

3. **Info — the Studio sans font also reaches the Store chrome on `/studio-lab`.** The `body:has([data-studio-theme="obsidian"])` rule (`app.css:3917`, `:3938`) also applies to AuthModal, the cookie banner and toasts. This is only a font change, not a logic change, it was intended and is documented in R4. Accept it.

4. **Info — no CSP to update now.** There are no CSP headers in the repo, so nothing needs changing. If a CSP is added later, `style-src` must allow `fonts.googleapis.com` and `font-src` must allow `fonts.gstatic.com`. `root.tsx:33-34` already preconnects to both, so the new stylesheet doesn't need its own preconnect.

5. **Info — `∞` is drawn with a fallback font.** In `−∞` the `∞` comes from a fallback monospace font, because Google's subset doesn't include U+221E. This is documented as C-R151-3 and deferred. No action now.

### What I checked that tests cannot catch
- **Event ordering, listener/timer leaks:** none. No handlers, effects or refs changed. In the master peak button, `writeMeter` updates the text and `aria-label` directly in the DOM, and its className is static apart from the `over` toggle.
- **Render cost:** zero. Only static class strings changed, and `links` is a pure function that runs once per route match.
- **Clipping from the wider mono font:** Plex Mono is about 0.6 em wide, so at 12 px each character is about 7.2 px.
  - Track volume, worst case `−59.9`: about 36 px in the 40 px `w-10` box.
  - Master readout, worst case `−60.0 dB`: about 58 px in the 64 px `w-16` box.
  - BPM field: the space inside the `w-14` box after padding and border is about 46 px, enough for "300".
  - The NO-CLIP row passed in round 151.
- **Form controls:** Tailwind's base styles make `input` and `button` inherit their font, and the BPM field and master peak button also have `font-mono` set directly. No dependency on the UA default font.
- **Accessibility:** no change to aria or roles. The fonts don't change colours, and RV-2 (the contrast check) passed with a minimum of 4.57.
- **Tailwind/tokens:** only `font-mono` and theme variables are used, with no hardcoded colours. Store's `@theme` `--font-sans` (l.123) and the `body` rule (l.448) are unchanged. The obsidian selector's specificity (0,1,1) beats `body` (0,0,1).
- **TS strict:** `LinksFunction` is typed. The test narrows with `'href' in descriptor`, with no `as` casts, `any` or `@ts-ignore`.
- **T1 change** (`detail-panel-fit.test.tsx:293`): this makes the test stronger. After V-1b, `not.toContain('border-outline')` could no longer fail, so it protected nothing.

### Good Practices Found
- Fonts load from the route's `links` export, not from `root.tsx` or an `@import`, so Store pages don't download the font files. FONTS-SCOPED checked this in a real browser.
- `display=swap` is set, and only the weights actually used are loaded (Instrument Sans 400–700, Plex Mono 400/500 for the `font-medium` over state, Georgian 400/500).
- Every font stack ends in system fallbacks. The FONT-FAIL row confirmed the workspace still appears in about 0.2 s when the font hosts are blocked.
- TH7 checks the hand-typed href against the route, and TH8 also checks the reverse case: the pan readout stays sans.

### Architecture note
- none. The change is className tokens plus one route export. No new state, lifecycle or coupling, and no owner change. One small backlog item for the planner, not this round: when SRW-21 (purchased mount, deferred) gets its own route, move `STUDIO_FONTS_HREF` (`studio-lab.tsx:7-8`) into a shared constant (e.g. in `lib/arrangement`), so the two routes can't drift apart.

### Alternative Approach
Not needed: the change doesn't touch auth, checkout or the audio pipeline. I did compare one alternative: self-hosting the fonts with `@font-face` would fix the `∞` glyph and remove the third-party request, but the spec forbids it and it would add font files to the repo. The current approach is right for V-2a.

### Score: 9/10
One point off for the stale 123 doc (finding 1). The code itself is clean.