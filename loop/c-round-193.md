# C — Round 193 (STORE-2a re-dispatch: store `@theme` → Obsidian & Brass) — verdict: **FAIL** (2 Medium contrast regressions caused by this round)

Date: 2026-10-26 · Verifier: C · browserVerified: **true** · realVerified: **true**
Ableton parity: **არ ეხება** (store palette; no Arrangement behaviour).

## Verdict
A implemented the scope as granted, and almost everything checks out in the real browser:
- 26/26 tokens match the §1 table;
- the Studio is 0 px changed at rest and in all three overlays;
- layout is ±1 px against HEAD;
- the keep-list text is byte-identical to HEAD;
- Buy Now, hire-us submit and CONTINUE use dark text at 6.09–10.28:1;
- T1 and all 9 mutants behave as specified, and TH2 goes red under m2.

**However, CONTRAST-193 fails on two token-coloured samples that HEAD had higher.** Under the task's own rule, they are Medium regressions caused by this round. Per §7, round 194 is a bounded fix-up before the regression round.

## Bugs for B
| ID | Sev | What | Numbers (tree / HEAD) |
|---|---|---|---|
| **C-R193-01** | Medium | Keep-list LeadMagnet popup, step 2: the email field is `bg-white` with `placeholder:text-dim` (`LeadMagnetPopup.tsx:126`). `--color-dim` `#928a7d` is a dark-surface token. | **3.41:1** / 5.06:1, rendered pixels, 1440 and 375 |
| **C-R193-02** | Medium | Text-input borders use `border-outline` `#24211e` on the page `#0e0d0c`: the newsletter on `/`, the search on `/store`, and the `/hire-us` fields. The field fill does not mark the field either (1.02–1.12). | computed **1.21** / 1.62; pixels: newsletter **1.03** / 1.35, search **1.20** / 1.61, hire-us **1.21** / 1.62 |
| C-R193-03 | Low | SCOPE literal: the `Button.tsx` S1 `buy` array is a 6-line reflow, not 1 changed line. | Biome lineWidth is 100 and the one-liner is 106 chars. C ran `biome format` on a scratch one-liner: the output equals the tree file byte for byte. The formatter forced it; B should rule on the grant text (`STORE2A-BUTTON-REFLOW`). |

**C-R193-02 context, not an excuse:**
- HEAD was already below 3:1, but the task's "pre-existing → Low" escape only applies when HEAD was the same or lower, and here it was higher.
- `#24211e` is the R72 Studio value.
- Placeholders stay readable: newsletter 6.68, search 5.18.
- On focus, a brass border and ring appear.

Possible fixes, for B to choose: `border-outline-strong` (`#736b60`) on store inputs, or a store-only input border token. Either way it needs a grant on the input sites; the obsidian block must not change.

**C-R193-01 fix hint:** change the placeholder token only on that white field, in `LeadMagnetPopup.tsx` (already a granted file this round). The only dark token is `brand-foreground`/`background` `#0e0d0c`, which is about 19:1 on white; for example, `placeholder:text-brand-foreground`. This is a restyle of a keep-list item (copy unchanged), the same reasoning as R76.

## Rows
| Row | Result | Evidence |
|---|---|---|
| TOKENS-193 | **PASS** | All 26 tokens equal on `/`, `/store` and `/products/middle-east` at 3 viewports (HEAD 26/26 differ). `body` is `rgb(14, 13, 12)` (HEAD `rgb(8,10,12)`). 0 `[data-studio-theme]`. `out/store-{tree,head}-{W}.json` |
| CONTRAST-193 | **FAIL** | C-R193-01 and C-R193-02. Every token-coloured *text* sample on the 3 pages passes: foreground ≥ 11.20, muted ≥ 6.30, dim ≥ 5.38, brass text ≥ 6.35, dark-on-brass ≥ 6.92. The brass focus ring is 7.76–8.35:1 and `:focus-visible` shows it. The only text below threshold is the hardcoded home StudioShowcase neutrals (2b inventory, identical to HEAD). Method: computed colour composited over its ancestors; the inputs, placeholder and buttons were checked on rendered pixels. `out/store-compare.json`, `out/inputs-1440.json` |
| BRASS-TEXT-193 | **PASS for reached sites** | **S5** Buy Now, 3 viewports: `rgb(14,13,12)` on `#c9a46a` **8.32** rest, **10.28** hover (pixel equal). **S3** hire-us: 8.32 rest, 6.94 hover (pixel; `brand/90`). **S6** CONTINUE, 3 viewports: 6.09 rest, 7.31 hover (pixel). **Not reachable:** S1/S2 (no route uses the variants), S7 (cart.tsx uses the default ConfirmDialog, and the mock returns 501 on add-to-cart, so the cart is empty: `out/cart.json`), S8 (unmounted). Those are ST5 only. **BLOCKED (backend):** S4, S9 |
| KEEP-193 | **PASS** | The popup's step-1 and step-2 `innerText` is identical to HEAD at 3 viewports, including `CONTINUE`. "Free Samples" is in the desktop header, and in the mobile menu at 375 on both servers. SpecialOffers text and the home section order are identical. "Limited Collection" is unchanged. `/about` "2,500+ Happy Customers" is identical. TestimonialsSection ("Netflix Original Score") is mounted on no route at HEAD or tree (C-R188-I6), so it is recorded, not failed. `out/popup-*.json` |
| STORE-LAYOUT-193 | **PASS** | 0 boxes > 1 px (13–14 boxes + document height) × 3 pages × 3 viewports, tree vs HEAD on :5174 |
| STORE-SHOTS-193 | **PASS** | `shots/store-{before,after}/{W}-{home,store,product}.png` and `shots/store-after/montage-{1440,1280,375}.png`. Teal UI (nav CTA, hero button, filter pills, Subscribe, Buy Now blue) becomes brass. The surfaces turn warm black. The home background glow goes from teal to a brass radial. Hero and gift-card images stay teal (images, 2b). Fonts are identical. |
| PERF-193 | **PASS** | Median LCP/CLS: 1440 564 ms / 0.0009; 1280 616 ms / 0.022; 375 456 ms / 0.0001. `out/perf-rm.json` |
| RM-193 | **PASS** | With reduce: no loader, 0 running animations, same as HEAD. Control: without reduce, the loader appears at about 450–1500 ms (`out/rm-control.json`). |
| STUDIO-RV-193 | **PASS** | Rest vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, no mask: **0 px / 0 px**. At 1440, tree vs HEAD: grid menu, marker menu and **export dialog: 0 px each**. 0 console errors. `out/rv-*.json`, `out/rv-overlay-diff.json` |
| G193-3 | **PASS** | Lab: `auth_user` null, 0 cookies, workspace and demo badge present. `/studio/middle-east` at 1440 and 1280: "Sign in required", 0 `audio[src]`. studio-token: no header → 401; fake Bearer → 403 with no set-cookie. `out/g193-3.json` |
| SCOPE-193 | **FAIL (Low only)** | Frozen 1012 OK at start and end. A's `end-sha256` OK. `git status` 10 M + 2 ??. `app.css`: 26 value lines in 8 hunks inside `@theme`; obsidian and `:focus-visible` untouched. The other 7 files are 1/1 each; doc 157 is 2/2. Button.tsx is 7/2 → C-R193-03 |
| T-RUN-193 | **PASS** | T1 on the tree: 6/6. Start copies: ×ST1 ×ST2 ×ST3 ✓ST4 ×ST5 ✓ST6. m1 → ST1+ST3; m2 → ST1+ST4, **and TH2 red**; m3 → ST2; m4/m5/m7/m8/m9 → ST5; m6 → ST2+ST3. `c-round-193/trun/trun.txt` (scratch trees only) |
| AN-REVIEW-193 | **PASS** | Only §1 values in `app.css`, with no new selector. T1 has no `as`/`any`/`@ts-ignore`, strips comments, and names the exempt keys explicitly; Biome is clean. D1 is in Georgian with status `In Progress (awaiting C round 193)`, R72–R76 with alternatives (a)–(d), the K0 table, S1–S9, the 2b/2c/2d split, and TODOs including the protected sites and the legacy view |
| DOC157-193 | **PASS** | l.4 `Completed (C round 191 PASS, caa09af)`, l.60 `FS0–FS7` |
| PX-NET / REG-HYD | **PASS** | Every session: 0 pageerror, 0 hydration messages, 0 Authorization headers, 0 non-font remote requests |
| Gate rows | gate | full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL |

## STORE-2b inventory (info)
- **Home StudioShowcase.** Hardcoded Tailwind neutrals (`oklch(0.556 0 0)` on `#171717`, 3.78:1; "/" 2.29:1) and the red "M" `#fb2c36`, all identical to HEAD.
- **SpecialOffers.** `hover:shadow-[…rgba(19,217,204,0.3)]`.
- **Teal imagery.** The hero and gift-card images.

## Environment
- **Mock :5199:** started by C (PID 8631) and killed by PID.
- **HEAD reference:** `git archive caa09af` in `c-round-193/head`, served on :5174 with its own cacheDir. Its PIDs (8628/8652) were killed.
- **:5173:** untouched.
- **store/:** C wrote nothing under it.
- **Tools:** `c-round-193/tools/`.

## For root / Saba
- R76 is not acknowledged by C. KEEP-193 only shows that the CONTINUE copy is byte-identical.
- C-R193-01 touches the same keep-list popup, so its fix would be a further colour-only restyle.
