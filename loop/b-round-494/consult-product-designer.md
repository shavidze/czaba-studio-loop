# product-designer consult: RETRO 495 screen and journey review

- **Requested:** B, 2026-11-13, during the round 494 → 495 planning.
- **Input:** the screenshots in `b-round-494/screens/`, plus `screen495.json` and `compare-480.txt`.
- **Returned text (verbatim summary, B's formatting):**

## 1. New candidates
**None. No SR-495-* id is created.** Every piece of clutter, duplication or friction found on these screens is already on file.

Two items were considered and not raised:
- **Two plain `Studio -> /studio-lab` links on the product page.** A buyer who uses the header link loses the Middle East preselection. Not raised, because a global nav item should lead to the same place from every page (Nielsen, consistency). "Try it in the Studio" is the product-specific way in, and its placement is already Q-SR-385-1.
- **"the same graph as playback" in export.** Already in COPY-PD F11 (`screen-review-305.md:35`).

Still open, and still visible on the new captures:
- **SR-480-1:** the "← CZABA" logo in Studio uses the plain text colour; the Store logo is brass.
- **SR-480-2:** the play button still covers the "CZABA AUDIO BUNDLE" mark. This is still the mock cover, so it is unverified against a real cover.
- **SR-480-3:** the bordered "Demo collection — no sign-in required" badge.
- **SR-290-1:** at 1280, "Time selection" is still cut off under the footer (`journey495-3-export-1280x720.png`).
- **Also unchanged:** SR-290-2 / SR-353-4, SR-230-1 / SR-353-2, SR-230-4, SR-245-6, SR-230-7 / SR-321-4, SR-336-1, SR-245-7, SR-305-7, SR-290-5 / SR-290-7, SR-275-6, SR-465-1…3, STORE-4, SR-230-5.

**Position moves for Saba:** none new. Q-SR-385-1 and SR-480-2 are still waiting for him.

## 2. Journey against the promise "the stems of one track play together"
| Step | Keeps the promise? | Evidence |
|---|---|---|
| Product page | Partly | `?preview=middle-east` arrives selected and focused. The page never says what you can do in the Studio (STORE-4 / Q-SR-385-1, still open) |
| Studio arrival → stems → play | **No** | The timeline is empty on arrival (SR-305-3). All clips share one `top` (441 / 462); `left` is 512 / 1152 / 1792, a 640 px gap = 16 s at 40 px/s, so they sit one after another. The status names the fourth stem at "00:48.000 (nearest free spot)". While playing at 00:01.4, only Pulse sounds. The Music lane is empty |
| Export | **No** (follows from the step above) | Range 00:00.000 — 01:04.000: 64 s of sequential stems, not one mix (SR-321-6) |

- **STEM-LANES is still the main gap.** AGREE-STEM-LANES unblocks the most of this journey.
- **Keep the "(nearest free spot)" status** until then: it is the only feedback that explains why the stems play in sequence.
- **Do not change:** the export dialog footer.

## 3. Verdict
**Nothing has got worse on the captured screens since RETRO 480.**
- The line counts and journey facts are identical. The `positionAfterPlay` difference (00:01.471 → 00:01.462) is timing noise.
- The surfaces changed in rounds 480–494 (Account pages, the entrance, client-navigation announcements) are not in these captures.
- The entrance only runs on `/` (`app/components/loading/EntranceCover.tsx:41`), once per session.

**Coverage:** the consultant opened 6 of the 12 PNGs (journey 1-product 1440, 1b-arrival 1280, 2-playing 1440/1280, 3-export 1440/1280). The four `screen495-full-*` PNGs were not opened; for those it relied on `screen495.json` and `compare-480.txt`.
