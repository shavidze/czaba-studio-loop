# A — Round 192 (STORE-2a colour tokens) — STATUS: STOPPED AT K0 (stop-and-report gate)

Date: 2026-10-26 · Implementer: A · realVerified: n/a (no implementation) · browserVerified: false (no browser rows run)

## Summary
K0 step 4 found **4 non-protected sites** where light text sits on a brass, buy or destructive fill. They are **beyond B's four granted sites** (one more is an icon on a child element). The task says: "Anything beyond B's four non-protected sites → stop and report (do not widen the grants)". So A stopped **before any source edit**. K1/K2/T1/D1/D2 were **not** implemented. No store file was modified, and the working tree is still clean at `caa09af`.

The biggest problem: with K1 applied, the product page **Buy Now** button (`PurchaseHeader.tsx:348`, on `/products/*`, a C row page) drops from **4.05:1 to 1.88:1**. That would be a Medium regression caused by this round, and CONTRAST-192 would FAIL it.

## Start checks (all OK)
1. HEAD = `caa09af`.
2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-191-r192-tree-sha256.txt` (from the store root): OK, 1017 entries.
3. The five granted start hashes: all OK.
- `git status --short` at the start and the end: empty (A changed nothing in `store/`).
- Mock API: not started (no browser work was done). :5173 was listening; :5199 was not.

## K0 — evidence

### K0.1–K0.3: Studio consumption of the tokens that are NOT overridden
The keys the obsidian block does not override are `surface-glass`, `surface-glass-strong`, `secondary`, `bg-alt`, `brand-rgb`, `accent-rgb`, `buy` and `buy-hover`. Searches covered:
- the utility forms (`bg|text|border|ring|from|to|via|shadow|fill|stroke|outline|divide|placeholder|decoration|caret`-name) and `var(--color-name)`;
- `app/components/arrangement/**`, `app/lib/arrangement/*` (non-test) and `app/routes/studio-lab.tsx`;
- `app/styles/studio.css`, `app/styles/pages/studio.css` and `app/styles/base/utilities.css`;
- the shared components mounted on `/studio-lab`: `Modal` (via ArrangementExportDialog), `Toast`/`ToastContainer`, `CookieConsent` (returns null on Studio routes), `PageTransition` and `AuthModal` (null unless open). root.tsx hides Header, AudioPlayer, StemsPlayerModal and LeadMagnetPopup on `/studio*`.

| Token | Studio sites | Overridden by the obsidian block | Shows at Studio rest? |
|---|---|---|---|
| surface-glass | 0 | no | — |
| surface-glass-strong | 0 | no | — |
| secondary | `Toast.tsx:82` `text-secondary` | no | **No.** A toast is created only by CartContext add/remove (`onToast`, CartContext.tsx:227–286). `/studio-lab` has no cart UI, so the state is "a cart add/remove toast", which cannot be reached in the Studio. |
| bg-alt | 0 | no | — |
| brand-rgb | 0 (keyframe `glow-pulse` app.css:206, used only by store selectors at l.1279/1361) | no | — |
| accent-rgb | 0 | no | — |
| buy / buy-hover | 0 | no | — |
| the 18 obsidian keys | many | yes (`[data-studio-theme]` + `body:has(...)`) | unchanged by design (R72) |

- **app.css class rules (l.207–3629) that use these vars:** 29 uses, matching B's count. Each one was mapped to its selector: `glow-pulse` (keyframes), `.testimonial-content`, `.special-offers-section`, `.filter-section-icon`, `.filter-pill(:hover)`, `.music-listing-subtitle`, `.sort-label`, `.sort-select:hover`, `.track-card-play-button(:hover)`, `.track-card-artist`, `.music-listing-empty(p)`, `.track-row:hover`, `.track-row-artist|tag|duration`, `.track-row-waveform-progress`, `.view-toggle-button`, `.about-subtitle`, `.about-story-content p`, `.value-card p`, `.mission-text` and `.not-found-description`. **None of these class names appears in Studio-rendered code: 0 hits each.**
- **No custom property outside `@theme` references `var(--color-*)`.** Only `utilities.css:180 :root` exists, and it uses literal hsl values, so it has no root-computed leak into the Studio.
- **The `html` element has no background rule.** The body background, which is overridden by `body:has(...)`, propagates to the canvas. So the Studio canvas colour is unchanged.
- **Conclusion for K0.1–K0.3:** the token half is safe for the Studio. The only Studio site is the Toast, whose state cannot be reached in the Studio.

### K0.4: brass, buy or destructive fill with light text (the blocker)
Two searches were run:
- a same-line grep: `bg-(brand|accent|buy|destructive|positive|warning)` together with `text-(foreground|white|secondary|muted)`;
- a ±6-line windowed scan for multi-line `cn()` and array class strings (`a-round-192/scripts/brass-scan.mjs`), followed by a manual read of every hit.

Window hits that use `text-background` or `text-black` (dark on brass) are fine and are not listed below.

| Site | Element | Granted? | Ratio before (ivory on old fill) | Ratio after K1 (ivory on new fill) | After with `text-brand-foreground` |
|---|---|---|---|---|---|
| `Button.tsx:43` buy | variant | yes (B) | 4.05 | 1.88 | 8.32 |
| `Button.tsx:46` destructive | variant | yes (B) | 3.29 | 2.57 | 6.09 |
| `hire-us.tsx:311` | submit | yes (B) | 1.55 | 1.88 | 8.32 |
| `account.orders.tsx:231` | CTA | yes (B) | 1.55 | 1.88 | 8.32 |
| **`components/product/PurchaseHeader.tsx:348`** | **Buy Now button, `bg-buy text-foreground` (/products/*)** | **no** | **4.05** | **1.88 (regression)** | 8.32 |
| **`components/marketing/LeadMagnetPopup.tsx:141`** | **CONTINUE submit, `bg-destructive text-foreground` (keep-list popup; restyle allowed, no text change)** | **no** | 3.29 | 2.57 | 6.09 |
| **`components/ui/Modal.tsx:307`** | ConfirmModal `variant==='destructive'` confirm button | **no** | 3.29 | 2.57 | 6.09 |
| **`components/chat/ChatButton.tsx:38`** | unread badge, `bg-destructive text-foreground` text-xs | **no** | 3.29 | 2.57 | 6.09 |
| `components/auth/ForgetPassword.tsx:80` (child element) | `CheckCircle text-foreground` icon inside a `bg-brand` circle (l.79), UI graphic needs 3:1 | **no** (child element, so not strictly the "same element" rule) | 1.55 | 1.88 | 8.32 |
| `studio.$productId.tsx:440/471`, `account.downloads.tsx:261` | — | protected | 1.55 | 1.88 | — signal `STORE2A-PROTECTED-BRASS-TEXT` |

Ratios come from `a-round-192/scripts/contrast.mjs` (WCAG relative luminance; the old hsl values converted to sRGB). Old ivory is `hsl(220,10%,94%)` and new ivory is `#ece6da`.

**Proposal for B (not done by A):** widen the round-192 grants by the same one-token change (`text-foreground` → `text-brand-foreground`) at `PurchaseHeader.tsx:348`, `LeadMagnetPopup.tsx:141`, `Modal.tsx:307` and `ChatButton.tsx:38`. Optionally also `ForgetPassword.tsx:80` (icon). Extend ST5 to cover them. LeadMagnetPopup is on the keep-list: changing only the text colour token is a restyle and leaves the copy intact, but B/root should confirm this. Without the PurchaseHeader change, K1 cannot pass CONTRAST-192.

### ST6 baseline (measured at start, `caa09af`)
`grep -rn "data-studio-theme" app | grep -v __tests__` → **3** lines:
- `StudioWorkspace.tsx:2189`
- `app.css:3920`
- `app.css:3921`

The `.ts`/`.tsx`-only count is **1**.

### e2e grep (frozen specs)
- `hsl(175|13d9cc|19, 217, 204|006aff|0052cc|f9a91f|rgb(249` (case-insensitive) in `e2e/`: **0** hits.
- `text-foreground|bg-brand|secondary`: 3 hits, all class-name assertions in `e2e/store-page.spec.ts:61,64,76` (`toHaveClass(/bg-brand/)`, `not.toHaveClass(/bg-brand text-background/)`). They do not depend on token values, and K2 does not touch `store.tsx`. **No e2e blocker.**

## Changed files
None in `store/`. Loop-folder artifacts only:
- `a-round-192.md` (this file)
- `a-round-192/checkpoint.md`
- `a-round-192/scripts/brass-scan.mjs`
- `a-round-192/scripts/contrast.mjs`

`end-sha256.txt` and `diff-vs-start.patch` were not written: there is no diff, and the grants are byte-identical to their start hashes.

## Tests run
None of T1 or the neighbour suites: no code was written. typecheck, lint and Biome were not run because nothing changed. The code-reviewer was not invoked because there are 0 changed files (the rule is 3+).

## B acceptance criteria
- Passed: K0.1–K0.3 evidence (the table above); the e2e grep; the ST6 baseline measurement.
- **Not passed / not started:** K0.4 (stop condition hit), K1, K2, T1, D1, D2, red proof and all live proof.

## Known gaps / next steps
1. B decides on the grant widening above (4 sites, plus optionally ForgetPassword). The K0 evidence can be reused as-is, and the frozen tree is unchanged.
2. After the re-grant, A implements K1/K2/T1/D1/D2 as specified, with ST5 extended to the new sites.
3. Advisor: the call was attempted and returned "temporarily overloaded". The stop decision follows the task's literal K0.4 rule.

## Exact next C checks
Nothing to verify for STORE-2a this round: no implementation exists. C may confirm:
- SCOPE: `git status` is empty and the frozen list is OK;
- the K0.4 site list, by re-running `a-round-192/scripts/brass-scan.mjs` over `app/` (non-test, non-arrangement).

## Signals for B
- `STORE2A-EXTRA-BRASS-TEXT`: the 4 (+1 icon) sites above.
- `STORE2A-PROTECTED-BRASS-TEXT` (unchanged).
- `Toast.tsx:82` `text-secondary` is the only Studio-mounted consumer of a non-overridden token. It is reachable only through cart toasts, which `/studio-lab` cannot trigger.

STATUS: STOPPED (task stop-and-report gate K0.4); scope not completed; awaiting B re-grant.
