# product-designer consult: B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD (B round 508 -> 509, 2026-11-14)
Read-only consult; B's transcription of the final answer (agentId a17f3d2491d3a4411). Input: browser probe b-round-508/probe/free-stub.json + free-1440.png (client-navigation `_data` stub makes harbour-lights $0; click on "Complimentary Download" changes nothing, 0 dialogs, 0 page errors).

## Chosen: (a) "Get it free" = the same acquisition as Buy Now
- Same handler as Buy Now (not a copy): extract it from PurchaseHeader into a shared hook so sign-in, ownership and analytics behave identically.
- Second defect in the same touch: the sidebar decides "free" from resolveCatalogPrice (Standard) while the header uses resolvePurchasePrice(selected version). The button follows currentPrice === 0 for the selected version.
- Element: `<Button type="button" variant="primary" size="lg" fullWidth>` (Button has no default type). Lands with the NONBRAND migration (one touch).
- Text and accessible name "Get it free"; Download icon removed (nothing downloads on click).
- States: anonymous -> sign-in modal + toast "Sign in to get it free."; in progress -> shares isBuyingNow, both buttons disabled, spinner + "Processing..." (not Button isLoading "Loading..."); error -> existing CartContext toast, button active again; owned -> hidden; signed-in purchases loading -> disabled; unknown price / unsupported version / selected version > $0 -> not rendered.
- Header Add to Cart / Buy Now unchanged (label at $0 is a Saba sub-question).

## Rejected
- (b) link to /free-downloads: three hard-coded items + e-mail; does not mention this product.
- (c) scroll to the purchase panel: label stays untrue; "See options" is a weak duplicate.
- (d) remove: needs Saba; fallback answer to the question.
- (e) plain "Free" label: removal of an action, needs Saba.

## Acceptance (cloud) 1-7 and BLOCKED 8-10
Adopted in current-task.md (round 509) C rows; B turned 8 (signed-in click) and 9 (owned) into STUBBED rows using b-round-503/probe/journey-504.mjs (L36); the real $0 order / Stripe acceptance stays BLOCKED (backend).

## Question for Saba
Delivery of free catalogue products. Default: $0 order through normal checkout after sign-in -> My Downloads. Alt 1: Brevo e-mail link. Alt 2: no $0 products, remove the button. Sub-question: header "Buy Now" at $0 -> "Get it free"? (product-designer default yes; B ships it unchanged this round, smallest change, until Saba answers).
