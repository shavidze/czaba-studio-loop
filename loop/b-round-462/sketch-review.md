# Round 463 sketch review (tech-lead)

Dispatched sketch: `sketch-463.patch.txt` **v2**, sha256 `f299877bddf358117f4f170868f3004e8f640c0d7a205fc7a9934d93825eac85`.
Superseded: v1 `3a8b1ae4…` (`sketch-463-v1.patch.txt`), and v1b `746cab3b…` (`sketch-463-v1b.patch.txt`). v1b is v1 plus the doc-301 path fix.

## v1 review: APPROVE, 2 Medium + 3 Low + 1 Info
| Id | Sev | Finding | B ruling |
|---|---|---|---|
| TL-R463-M1 | Medium | DC1 and the inventory treated a compound selector as live when ANY class had a consumer, which kept 15 provably dead rules (`.filter-pill.active`, `.view-toggle-button.active`, `.filter-section-icon.rotate`, `.track-card-overlay.visible`, `.product-grid-section .container`, `.music-listing-list .track-row:last-child`, 6× `.light-flicker-stagger…`, `.audio-player-button-play.is-playing`, `.audio-player-progress.is-playing`, `.section-title.text-center`) | **Fixed in v2.** Liveness is now decided per branch; Lenis runtime classes are allow-listed; the 15 rules are pruned; DC1 is rewritten; M9, M10 and M11 cover it |
| TL-R463-M2 | Medium | `.audio-player-progress.is-playing` was kept as "mixed" although `is-playing` is never set | **Fixed in v2.** Pruned together with `@keyframes playButtonPulse`; the LT entries are removed (app.css teal count 14). The remaining hits on kept unmounted consumers stay with the LEGACY-DEAD remainder; the backlog keeps the task to delete the unmounted AssetListingPage/TrackRow chain with its CSS |
| TL-R463-L3 | Low | The test scans ts/tsx; the generator also scanned js/md (equivalent today, since `app/` has no js/md) | Doc 302 states it; deferred_low_polish |
| TL-R463-L4 | Low | DC3 lacked a comma-list case | **Fixed in v2** (DC3 has 8 cases) |
| TL-R463-L5 | Low | Excluding `docs/` from Tailwind's source scan is the systemic fix for C-R462-01 | Signal SIG-R463-TAILWIND-DOCS-SOURCE; doc 302 TODO |
| TL-R463-I6 | Info | The `sendOrderPaidEmail` rename is correct | — |

Answers to B's questions:
- **Criterion:** safe. No over-deletion; no dynamic, library or server-HTML class.
- **One round:** acceptable (pure deletion).
- **DC in its own file:** correct while ARCH-CHECKPOINT-STYLE-SCAN is open.

## v2 delta review: APPROVE
- M1 and M2 are resolved.
- No new Medium+.
- Low TL-R463-L7: classes inside `:is()`, `:where()` and `:has()` count as required, and the `:not` regex is not nesting-aware. This cannot cause a wrong deletion today; a future `:is(.a, .b)` would fail the test rather than slip through. Deferred_low_polish; doc 302 may name it.
