# Visual pass: computed styles from the live homepages (2026-10-25)

Captured in a real browser (Claude desktop built-in browser) with getComputedStyle and document.fonts on each homepage, plus screenshots. Only the first h1/h2 and one CTA were sampled per site.

| Site | Background / text | Loaded fonts | H1 | H2 | CTA | Media |
|---|---|---|---|---|---|---|
| musicbed.com | white, text rgba(0,0,0,.9) | Aktiv Grotesk only (single family) | "License music from emerging artists", 48px / 400, letter-spacing -1.92px (-0.04em), line-height 1.1 | 32px / 400, -1.28px, in a dark band (#f4f5f5 text) | "Create free account": near-black #111312, white text, 4px radius, 14px uppercase | 2 videos; client logo wall (Samsung, Lincoln, Xbox, Google, Audi, Sony) directly under the hero |
| spitfireaudio.com | #232323 dark | GT Flaire Basic VF (variable) + GT Ultra Fine | h1 is the product name "Phoenix", 16px / 550 (the hero is a product image) | "What sound are you looking for?" 29px / 550, -0.015em | "Shop" ghost button, 6px radius | Top banner "OUT NOW: Phoenix – Introductory offer ends soon"; red sale price €239 next to struck-out €299; cookie modal over the content |
| output.com | warm cream #F1E7D1 | Pilat family (Book, Regular, Bold, Heavy, Wide Heavy, Wide Black) | "In a world of noise, make music that matters", 56px Pilat Wide Heavy, +0.02em tracking | "From" 144px Pilat Wide Black (oversized display type) | 0px radius (square), cream on dark | The only one with a dream-type headline |
| artlist.io | #0D0D0D near-black, white text | artlistSans + Publico Banner (serif, used for italic emphasis) | "Make your best *creative work* with AI", 56px / 400, -0.03em; the serif italic marks the emphasis | 48px Publico Banner light (300) | Yellow pill "Start Free Now" | Dark cinematic video hero; AI model logos (Veo, Kling, ElevenLabs); music is no longer the product lead |
| epidemicsound.com | warm off-white #F1F0EB | Sebenta (custom serif) + Inter | "You bring the idea. We bring the sound.", 80px Sebenta / 500, -0.03em, line-height 1.0, italic emphasis | 32px Sebenta, -0.03em | Black pill buttons, plus a secondary grey pill | 11 videos; a full cookie modal blocks the first view |

Observations:
- Tight negative tracking on large type is universal (-0.03 to -0.04em). It matches Apple's practice from the other research file.
- Two clear camps: neutral grotesk on white (Musicbed) versus an editorial serif with an italic accent (Epidemic, Artlist). Output stands alone with warm cream, oversized wide display type and square corners.
- Cheap-feeling signals seen live: Spitfire's "offer ends soon" banner and red discount pricing, cookie modals covering the hero on Spitfire and Epidemic, and Artlist's AI-model logo strip, which dilutes the creative-music promise.
- czaba.store could not be opened from the browser (navigation denied or failed), so the current CZABA site must be judged from the repository code.
