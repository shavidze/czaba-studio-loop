COMMIT: OK

Cloud-only caveat: I read the diff and the repository but did not run a browser, so the event-ordering and Safari checks below rest on reading the code.

## Code Review: round-449 (STORE-2b-3a, gradient text removal)

### Critical Issues
- None. The diff touches no auth, purchase, download, token or API code (`client.ts`, `AuthContext`, `CartContext`). No `any`, `@ts-ignore` or type assertions were added. There are no new listeners, timers, effects or hooks, so there is nothing to leak, and no change to event ordering.

### Suggestions (ranked)
1. **Low – Safari/WebKit not verified.** The heading text now inherits solid ink instead of `-webkit-text-fill-color: transparent` with a clip. That should be safer in WebKit, but nobody has checked it in a real browser. The doc already tracks this as `TLM-R449-WEBKIT-HEADING-INK`, so keep it open until a Tech Lead checks it.
2. **Low – bare `<span>` wrappers.** The seven touched files now contain wrappers with no className, for example `HeroSection.tsx:163`, `StudioShowcase.tsx:96`, `$.tsx:45` and `about.tsx:57,122`.
   - The doc keeps them on purpose, to leave the DOM tree and box layout unchanged, and `studio-naming.test.tsx` NM2 reads `heading.querySelector('span')`.
   - Cost: this is harmless markup noise.
   - Fix: leave them for now. If the emphasis is later made semantic, use `<em>` or a Tailwind token class such as `text-foreground`, in the same change as NM2.
3. **Low – dead sections keep an orphan class.** `ArtistBioSection.tsx:27`, `TestimonialsSection.tsx:97` and `VideoShowcase.tsx:72` still say `text-glow`, and no CSS rule defines it any more.
   - If any of them is remounted, it renders as plain inherited ink, which is harmless.
   - GT3 pins the exact hit counts, and GT5 fails if one is re-imported.
   - Fix: none now. Delete the whole components with LEGACY-DEAD-STORE-COMPONENTS in 2b-3d.
4. **Info – LeadMagnet eyebrow tone.** `LeadMagnetPopup.tsx:162` is on the keep-list. Removing the class token only changes paint. Saba's question about light ink versus caption grey (`SABA-Q-LEADMAGNET-EYEBROW-TONE`) is already logged.
5. **Info – docs.** `docs/design/star-brand-audit.md:182,184` still describe `text-glow` as the brand mark. The implementation doc marks this as superseded and defers it to STORE-5, which is acceptable.

### Good Practices Found
- The token and every consumer are removed together. A repo-wide grep finds `--gradient-text` nowhere; `.loading-brand` uses its own inline gradient. `text-glow` and `hero-title-glow` survive only in the three allow-listed dead files plus the `store-header-footer.test.tsx` absence assertions.
- `.hero-title-glow` read `--primary-hue`, which is undefined, so its `text-shadow` did nothing at HEAD. Removing it changes nothing visible.
- Dropping `background-clip: text` removes a text-clip paint layer from the heading, so render cost can only go down. Selection and forced-colors behaviour also improve, since text no longer relies on a transparent fill.
- The new test `store-gradient-text.test.ts` is meaningful:
  - It scans CSS rule by rule rather than by plain text match.
  - It has a parser self-test and a non-vacuous guard.
  - It pins exact counts and runs in the node environment.
- The change is Tailwind-first and uses no hardcoded colours.

### Architecture note
- none. This is a subtractive CSS and className change with no new state or lifecycle. One proposal for the planner: add the dead-component cleanup (`ArtistBioSection`, `TestimonialsSection`, `VideoShowcase`, `PianoLoadingAnimation`, `.loading-brand`) as a single bounded task in 2b-3d. Its acceptance criteria would be removing the allow-list entries and keeping GT1 and GT3 at zero hits. This is a proposal only, and the Testimonials keep-list question needs Saba first.

### Alternative Approach
- Not critical logic (styling only). The current approach, solid light ink instead of brass or a darker rest-of-heading, is sound for contrast and for avoiding a false "this is a link" signal.

### Score: 9/10