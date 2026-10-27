# A round 204: hidden focusables, runtime state (R105–R107)

Decision D-29z169. Baseline: HEAD `135b880`. Implementer A. No STOP. No commits, pushes or installs.

## 0. Start checks (step 1–2): all OK
- **HEAD and tree:** HEAD is `135b880` and `git status` was empty at start.
- **Hashes:** `sha256sum -c` over the frozen 1035 files: OK. Both grants equal the start hashes. Neither new file existed.
- **Collision grep:** only the expected hits (`store-header-footer.test.tsx` N2/N5; e2e `accessibility`/`responsive`/`homepage`). No other frozen hit.

## 1. Changed files (only the 2 grants and the 2 new files)
| File | Change |
|---|---|
| `app/components/layout/Header.tsx` | **R105:** `id="header-mobile-menu"`; closed `max-h-0 opacity-0 invisible`, open `max-h-[80vh] opacity-100 visible`; Toggle gets `type="button"`, `aria-expanded`, `aria-controls`. **R106:** `isUserMenuOpen` disclosure; button gets `type`/`aria-expanded`/`aria-controls="header-user-menu"`/onClick toggle; panel `id="header-user-menu"`, open = `opacity-100 visible translate-y-0`, closed = the old classes plus `group-hover:` unchanged; closes on Escape (only while open; `stopPropagation` + refocus), on blur leaving the wrapper (relatedTarget outside or null), on a document `pointerdown` outside (listener only while open), on a link click, and on Logout (`signOut` ×1). `type="button"` on all 6 buttons. **Plus (code-reviewer Low, in grant):** `isUserMenuOpen` resets when `isAuthenticated` becomes false. |
| `app/components/home/StudioShowcase.tsx` | **R107:** reveal once (`if (isIntersecting) { setIsInView(true); observer.disconnect(); }`, threshold 0.3); `<section onFocus>` reveal; the `motion.div whileHover/whileTap` wrapper removed; Link classes as below (DEVIATION 1). |
| `app/lib/__tests__/store-hidden-focusables.test.tsx` (new) | HF1–HF9, plus HF8b (reveal visible after intersect and not re-hidden; added after review). |
| `docs/implementation/2026/quarter-IV/161-hidden-focusables-runtime.md` (new) | Georgian. Covers R105–R107, the rejected alternatives (`inert`, conditional render, hover-driven state, dropping hover, threshold change), B's probe numbers, and TODOs (B-R203-LEADMAGNET-AUTO-OPEN-FOCUS, hover-Escape Low, e2e Low, the global transition rule). |

`end-sha256.txt`: `a-round-204/end-sha256.txt`.

## 2. DEVIATION 1 from R107 (B or root may veto)
- **Ruling text:** `transition-[background-color,transform] hover:scale-105 active:scale-[0.98]`.
- **Measured result** (`a-round-204/out/ctahover-ruling-5173-1280.json`, from `tools/ctahover-ruling.cjs`, which sets the ruling's literal class string on the live CTA at runtime): `scale` is already `1.05` at +40 ms (also at +340 ms), the press gives `0.98`, and `transform` stays `none`, so the scale snaps instead of easing. The first file from before the change was overwritten by the after-run; this file regenerates that evidence. Two causes:
  1. In Tailwind v4, `scale-*` sets the standalone CSS `scale` property, not `transform`.
  2. A global **unlayered** rule `a, button, [role="button"], input, textarea, select { transition: color, background-color, border-color, box-shadow, transform, opacity }` (`app/styles/app.css:307`, `base/utilities.css:7`, both frozen) beats every layered Tailwind `transition-*` class. The computed `transition-property` on the CTA is that global list, not the class.
- **Shipped instead:** `transition-[background-color,transform] duration-200 hover:bg-brand-hover hover:[transform:scale(1.05)] active:[transform:scale(0.98)]`. These are Tailwind arbitrary properties: no custom CSS, no hex.
- **Kept but inert:** the ruling's `transition-[…] duration-200` stays as ruled. It has no effect because of the global rule.
- **Measured after the change** (`out/ctahover-5173-1280.json`, `out/ctahover-5173-1440.json`):

| Viewport | +40 ms | +340 ms | Press | Background (rest → hover) | `parentTabindex` |
|---|---|---|---|---|---|
| 1280 | `matrix(1.00884…)` | `matrix(1.05…)` | `matrix(0.98…)` | `rgb(201,164,106)` → `rgb(217,184,127)` | null |
| 1440 | `matrix(1…)` | `matrix(1.05…)` | `matrix(0.98…)` | same | null |

- **Note for C, row (d):** the value is in `getComputedStyle().transform` (a matrix). `.scale` reads `none`.

## 3. Tests actually run
- **`npm run typecheck`:** exit 0.
- **`npm run lint`:** repo-wide 208 warnings and 1 info, all pre-existing in other files. `biome check` on the 3 owned code files: 0 diagnostics. `useButtonType` in `Header.tsx`: **6 at HEAD → 0** (HEAD copy linted in a scratch dir).
- **`npx vitest run`** on `store-hidden-focusables`, `store-header-footer`, `store-focus-ring` and `focus-source`: **4 files, 36/36 green** (HF 10, header-footer 9, focus-ring 10, focus-source 7). Frozen N2/N5 are green.
- **Start copy** (HEAD grants + new test, `/tmp/r204-mut`): **10/10 red** (`a-round-204/out/start-copy-run.txt`).
  - HF8 fails on `[tabindex]` (the `<div tabindex="0">`).
  - HF9 and HF8b fail on the initial or final inline opacity: on HEAD, the link's parent is the `whileTap` DIV, which has no reveal style.
  - These differ from B's §3 expectation ("HF8 green on threshold"): HF8 is red as a whole because its tabindex assertion comes first.
- No full suite and no `npm run verify`: those are gate rows.

### Mutants (scratch `/tmp/r204-mut`; `tools/mutants.py`; `out/mutants.json`; re-run after the review edits)
| Mutant | Rows red |
|---|---|
| m1 drop `invisible` | none (expected: jsdom has no CSS; browser only, covered by C MOBILE-204/HIDDEN-204) |
| m2 drop Toggle `aria-expanded` | HF1 |
| m3 user-menu onClick removed | HF2, HF3, HF4, HF5 |
| m4 Escape without `focus()` | HF3 |
| m5 onBlur closes on any blur | HF4 |
| m6 pointerdown ignores `contains` | HF5 |
| m7 Logout without close | HF6 |
| m8 `motion.div whileTap` wrapper restored | HF8, HF9 |
| m9 `setIsInView(entry.isIntersecting)` restored | HF8, HF8b (checked separately) |
| m10 `onFocus` removed | HF9 |

## 4. Browser self-check
- **Setup:** Playwright Chromium on :5173. The mock on :5199 was started by A from `mock-api/server.mjs` (log `a-round-204/out/mock.log`). Tools are copied into `a-round-204/tools/`.
- **`tabprobe.cjs 5173 {375,1280,1440} a204`** (`out/tabprobe-a204-*.json`): **0 hidden stops on every page at every width.**

| Width | `/` | `/store` | product | `/about` | `/free-downloads` |
|---|---|---|---|---|---|
| 375 | 36 | 13 | 12 | 14 | 7 |
| 1280 | 40 | 23 | 16 | 20 | 11 |
| 1440 | 40 | 23 | 16 | 20 | 11 |

  - These equal §0 (36/40/40; `/store` 13 at 375; 23/16/20/11).
  - The probes ran before the one-line auth-reset effect was added. That effect does not touch the anonymous render.
- **`usermenu.cjs 5173 1280`:** identical to B's scratch `usermenu-5176-1280.json` (diff empty), also after the review edit. The sequence:
  - closed: Tab skips the items;
  - Enter opens;
  - Tab walks My Account → Orders → Downloads → Logout, with a solid outline;
  - Escape closes and focus returns to the button;
  - Space and Space toggle it;
  - tabbing out closes it;
  - hover shows and unhover hides it;
  - a click-open stays open after the pointer leaves;
  - an outside click closes it.
- **`usermenu.cjs 5173 1440`:** same, except the element the outside click lands on (Music vs SFX: layout).

## 5. code-reviewer (real subagent run, 4 files)
Score 7/10. Handled:
- **Low: state not reset on auth loss:** fixed (effect on `isAuthenticated`).
- **Low: HF8 checks `disconnect` but not the reveal:** added HF8b.
- **Low: listener-removal check missing:** added to HF5 (`removeEventListener('pointerdown', …)` spy).
- **Low: doc status "Completed":** changed to In Progress.

**Not changed, reported for B:**
- **Medium (reviewer), relatedTarget-null blur:** with the menu opened by keyboard, a mouse click on non-focusable panel content (greeting, `<hr>`, padding) blurs to `null` and closes the state. R106/HF4 rule that null closes, so A kept the ruling.
  - **Visible impact in Chrome:** none while the pointer stays in the group, because `group-hover` keeps the panel shown; only `aria-expanded` flips to false.
  - **Unverified, Safari/Firefox-mac:** focus on a panel link, then a click on the trigger, may blur→close and then click→reopen. A pointer-inside ref is a possible follow-up.
- **Medium (reviewer, test gap):** `invisible` is not provable in jsdom (m1). It relies on C's browser rows.
- **Low: reveal-on-focus delay.** Focus starts the CTA spring with `delay: 0.7`, so for about 0.7–1 s the focused CTA sits inside an opacity-0 wrapper. The ruling says "nothing else changes", so it was not altered. C row (a)/(b) "opacity 1 within 1.5 s" will measure it.
- **Low: dead `transition-[…] duration-200` classes:** kept per the ruling; see DEVIATION 1.
- **Low: `motion-safe:` on the transforms:** not added (not ruled).
- **Low: HF8's section-wide `[tabindex]` scope:** kept, because the ruling says "no element inside the section".
- **Low: HF9's `parentElement` brittleness:** kept, because the ruling says "read the inline style of the link's parent".
- **Low (pre-existing):** hover Escape (B-R203-USERMENU-HOVER-ESCAPE).
- **Low: Enter on an account link** closes the panel while focus is on the link; Remix navigation then moves focus.

**Architecture note (verbatim):**
> Signal 4 (new state/lifecycle) plus a duplicate owner: Header.tsx:14-28 and :117-184 now hold disclosure state, a document listener and focus lifecycle. Meanwhile `app/components/auth/UserDropdown.tsx` (`aria-label="User menu"` at :27) is exported only from the auth barrel and used nowhere, so it's a parallel, dead implementation. **Keep for this round:** it's one lifecycle with co-located refs, and the HF tests target Header. **Proposal for the planner:** one bounded task, either delete `UserDropdown.tsx` or have Header use it, with HF2–HF6 as acceptance tests and no change in behaviour. Separately, the global unlayered `a, button { transition }` rule (app.css:307, utilities.css:7) overrides every Tailwind `transition-*` class store-wide. That's already passed on to B in the doc. This is a review of the diff only, not a full module audit.

A did not act on this note.

## 6. Known gaps and new findings for B
- **A-R204-GLOBAL-TRANSITION (Low, store-wide, outside ownership):** the unlayered `a, button { transition }` rule overrides all Tailwind `transition-*`/`duration-*` on links and buttons, and its list lacks `scale`/`translate`/`rotate`. Any Tailwind v4 `hover:scale-*` on an `a` or `button` snaps.
- **A-R204-USERMENU-NULL-BLUR (Low/Medium per reviewer):** see §5.
- **A-R204-CTA-FOCUS-DELAY (Low):** see §5.
- **B-R203-LEADMAGNET-AUTO-OPEN-FOCUS:** untouched (round 205).
- **Environment:** `cloud/run.sh` was not present at the path the task names, and no mock was running at job start. A started `mock-api/server.mjs` itself in the background; the first instance was killed at its time limit, and the second was also stopped at its background time limit after A's probes had finished. **No mock is running now.** C should health-check `:5199` (`/__mock/health`) before starting its own. `a-browse.json` was not used: the probes use `fl.cjs`'s own browser contexts.
- **Not run by A:** `npm run build`, the full suite and e2e (gate). No RING/NO-SHIFT measurement. No 375 MOBILE-204 timing (B's numbers only).

## 7. Exact next C checks
1. SCOPE-204: the hashes in `a-round-204/end-sha256.txt`; the frozen 1035 files.
2. HIDDEN-204 tree vs ref (expected tree 36/40/40 on `/`).
3. MOBILE-204: +100 ms visible, +600 ms hidden; `aria-expanded` false → true → false.
4. USERMENU-204, including:
   - a click on the greeting text after keyboard-open (the null-blur note);
   - after Enter on My Account, where focus lands.
5. SHOWCASE-204: (a)/(b) opacity 1 within 1.5 s, given the 0.7 s spring delay; (d) read `transform`, not `scale`; (e) no re-hide.
6. NO-SHIFT-204: the CTA Link box vs ref. The wrapper DIV is gone, and the Link is now a direct child of the reveal wrapper.
7. RING-204 spot checks.
8. T-RUN-204: the start copy shows 10/10 red (see §3; HF8 is red on tabindex first).
9. Re-run the mutants plus at least one C mutant.
10. AN-REVIEW-204: DEVIATION 1 uses arbitrary-property classes.
11. G204-3.

## 8. B acceptance criteria A actually passed
- **Steps 1–3:** start checks, collision grep, R105–R107 implemented.
- **HF1–HF9:** written. HF9 runs deterministically with `skipAnimations`, so no fallback note was needed.
- **Step 4:** mutant table; m1 is green as expected.
- **Step 5:** typecheck, lint, targeted tests.
- **Step 6:** browser self-check; 0 hidden stops, counts and menu sequence as in §0.
- **Step 7:** code-reviewer.
- **Step 8:** report and end hashes.

C's rows are not claimed. This report does not mark the whole backlog complete.
