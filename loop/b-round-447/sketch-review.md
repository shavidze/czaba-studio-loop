# Sketch review — round 448 (STORE-2b-2b)

Dispatched sketch: `b-round-447/sketch-448.patch.txt` sha256 **76965797129dac68195e0d2d1d971aa6316501508e54ce88d4c800daad728afe** (= `git diff cce5eda 5ea607b` in the B scratch).

Reviewer: `tech-lead` (read-only project agent; code-reviewer is not on B's consult list, L58 allows tech-lead).

## Review 1 — sha256 1e80ce3b68c1be5614fd256b4c9e34366d75389842c3b75aa77a212564a50f29 (v1)

**Verdict: APPROVE-WITH-CHANGES.** Rulings:

| # | Sev | Finding | Ruling |
|---|---|---|---|
| 1 | Medium | No in-suite contrast test (a value cell set to the background or outline colour stays green) | **Fixed in v2:** HE8 (painted background + colour) and HE9 (≥ 4.5:1 via jsdom DOMParser); mutants M8 → HE9 and M9 → HE3/HE8/HE9 |
| 2 | Medium | The background depends on one `div` style (clients drop styles, Outlook Word engine) | **Fixed in v2:** outer `table role="presentation"` + `td` with `bgcolor` + `background-color` longhand; content div and message box use the longhand; HE3 pins the outer table; M2 and M9 |
| 3 | Low | `as HireUsEmailPaletteToken[]` assertion; implicit `any` from `JSON.parse` | **Fixed in v2:** `Object.entries`; body parsed to `unknown` + `isSentBrevoEmail` guard |
| 4 | Low | HE5/HE6: fallbacks not pinned; HE6 green at HEAD | **Fixed in v2:** new HE6 pins `General` / `Not specified` (M10); the no-key test is HE7, labelled characterisation |
| 5 | Low | `@theme` anchor hits a comment; TEAL_PATTERN copied; exact counts need edits | `@theme {` anchor in v2; the copy is deferred TL-R448-L5-TEAL-REGEX-COPY; exact counts are intended (A-R447-REVIEW-L1) |
| 6 | Low | Pre-existing action issues: `projectType=toString` → 500; subject goes through the HTML escaper; mailto not URL-encoded; `as string` casts | Out of scope (behaviour change); deferred TL-R448-L6-HIREUS-ACTION-HARDENING |
| 7 | Low | Naming: palette without "Inquiry"; `escapeEmailHtml` generic in a hire-us module; route tests under lib/__tests__ | Renamed to `HIRE_US_INQUIRY_EMAIL_PALETTE` in v2; the rest is deferred with the architecture note (shared `email-html.server.ts` when a second e-mail is revived), signal SIG-R448-EMAIL-HTML-SHARED |

Architecture note: keep the pure `.server` builder; extract the escaper and palette into a shared module only when a second e-mail is revived; do not revive `email.server.ts` for this.

## Review 2 (delta) — sha256 76965797129dac68195e0d2d1d971aa6316501508e54ce88d4c800daad728afe (v2, dispatched)

**Verdict: APPROVE.** The 3 required changes were checked against the files, and the reviewed sha256 equals the dispatched one. Optional Lows, deferred and not applied, so the sketch stays frozen:

| # | Sev | Finding | Ruling |
|---|---|---|---|
| D1 | Low | HE8's title says "its own inline colour", but `nearestColour` accepts an inherited colour | Deferred TL-R448-D1-HE8-OWN-COLOUR. The task tells A that doc 293 describes HE8 as "resolved (own or inherited) colour" |
| D2 | Low | The message div's `background-color` longhand is not pinned (a shorthand would fall through to the wrapper) | Deferred TL-R448-D2-MESSAGE-LONGHAND |
| D3 | Low | HE9 depends on HE8 (fallback black on white = 21:1) | Recorded with D1; keep the two tests together |

## Evidence
- Mutants M1–M10 on v2: `mutant-M*.log`, all red on their named rows (K13).
- Pre-check on v2: `precheck-typecheck.log` rc 0; `precheck-build.log` rc 0, with the builder in `build/server` only (0 files in `build/client`); `precheck-full.log` (K14).
- Chromium probe on v2: `probe/contrast-sketch.json`, 0 failing rows in the light and dark clients, min 7.06:1 (K11).
