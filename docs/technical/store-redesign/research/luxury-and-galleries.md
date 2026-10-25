# CZABA design research: what makes a site feel precious

Research date: 2026-10-25. Scope: Apple (Part A), award-gallery and luxury sites (Part B), and the research behind them (Part C). Each claim is tagged:

- **[V]** verified in a source I opened (listed in Sources).
- **[3P]** from a third-party teardown or token extract, not the brand's own code or statement. Treat the values as approximate.
- **[UNVERIFIED]** my own observation or general practice that I could not confirm from an opened source in this session.

Lens used throughout: *Perceived Value* (people judge value from cues, not from intrinsic quality alone) and Arnault's *Star Brand* idea (a brand that feels "timeless yet modern" and sells strongly while staying profitable; HBR, Oct 2001 [V]).

---

## 0. Executive summary: the 12 levers that recur everywhere

1. **One idea per screen.** Short copy in chunks, with generous space and imagery between blocks (Apple [V]; thoughtbot calls whitespace Apple's "real secret" [V]).
2. **Scroll as a film timeline.** A fixed or sticky frame, with scroll driving an image sequence. Apple's AirPods Pro page used about 1,600 still frames that load progressively, which won it Awwwards Site of the Month in Jan 2020 [V].
3. **Typography that changes with size.** Big display type is tracked negative (-0.015em at 80px), body text slightly negative (-0.022em at 17px), and small eyebrow type positive. Line-height tightens as size grows (1.05 at 80px, 1.47 at 17px) [V, from apple.com's own CSS].
4. **Almost no colour in the interface.** Near-black ink (#1d1d1f), off-white canvas (#f5f5f7), and one blue kept for CTAs (#0071e3) [3P]. Nothing, Teenage Engineering and Aesop do the same: the interface stays monochrome and the product photography supplies the colour [3P].
5. **Spring physics, low bounce.** Apple's default bounce is 0. About 0.15 feels "slightly bouncy", and above about 0.4 looks exaggerated for UI. Velocity carries through interruptions [V].
6. **Motion that has a purpose, can be cancelled, and can be turned off.** HIG: "Don't add motion for the sake of adding motion", "Let people cancel motion", "Make motion optional" [V].
7. **Senses that agree.** Apple's audio-haptic principles are *causality, harmony, utility*: "a small ball should feel small and sound small" [V]. For an audio store, interaction sound is the strongest differentiator available, and it has to obey these rules.
8. **An unboxing ritual.** Apple deliberately "designs a ritual of unpacking" (Jony Ive: "Packaging can be theater, it can create a story") [V]. On the web this becomes the first-load reveal, the first play, the cart and the download moment.
9. **Visibly hand-made craft.** Hermès commissions named illustrators for its site and credits them. NN/g argues polish has lost value as a quality signal in the AI era, and that a visible human hand restores it [V].
10. **Show the work.** The labour illusion: showing effort raises perceived value (Buell & Norton 2011, *Management Science* [V]). Stems, session notes, the room and the orchestra are CZABA's equivalent of Hermès' saddle stitch.
11. **Peak and end.** People remember the most intense moment and the last one (Kahneman et al. 1993 [V]). Design one peak (the first time the Studio plays) and one end (the download or receipt) on purpose.
12. **Scarcity and the price signal, used honestly.** Scarcity caused by demand raises value (Worchel et al. 1975 [V]). A higher price raises experienced pleasure as well as willingness to pay (Plassmann et al. 2008 [V]). Luxury theory adds: never discount openly, "make it difficult for clients to buy", and "do not sell openly on the Internet" (Kapferer & Bastien [V]). CZABA has to adapt that last rule, not copy it.

---

## Part A — Apple: the specific mechanics of perceived value

### A1. Scroll-driven storytelling

- **Pacing arc.** A teardown of the iPhone 13 Pro page found that intense, immersive sections alternate with calm ones, building to a climax before easing off. The hero image is cut off at the fold so you scroll on. The page reveals "a few upgrades at a time" [V, Ulster IXD304 student analysis, so it is interpretive].
- **Sticky product, moving content.** In the camera section the phone stays fixed while content scrolls past, so the copy seems to come out of the lens [V, same source].
- **Image sequence on canvas, not scrubbed video.** The AirPods Pro hero was a series of numbered JPEGs (the CSS-Tricks reconstruction uses 148 frames) drawn to a fixed `<canvas>` through `requestAnimationFrame`. Frame index = scroll fraction × frame count. On 3G the page loads only 8 of 111 requests (about 347 KB), so it degrades on slow networks [V].
- **Why frames rather than video.** The Awwwards SOTM write-up says scrubbable video "didn't work across all browsers and devices". The team used about 1,600 stills that load progressively, so the motion gets smoother as assets arrive. A WebGL prototype rendered the sound and noise visualisations, which were baked into texture images [V]. *This is the closest precedent to CZABA: Apple visualised sound itself.*
- **The stated goal** was "a feeling of having experienced AirPods Pro before ever putting them in their ears" [V]. That is the perceived-value mechanism in one line: let the visitor pre-experience ownership.
- **Copy rhythm.** Short, playful, alliterative, for example "Survives splashes, sloshes, sprinkles, sprays, splatters and spills". Specs are translated into life ("3 extra hours of Netflix"). Headlines raise a doubt that the content then resolves ("Smart HDR. And you thought your photos couldn't get any better.") [V, UX Planet analysis].
- **History.** The 2015 redesign merged store and marketing, moved to edge-to-edge imagery, and used parallax "purposefully" (to show the scale of the 5K iMac), while the critic noted it was overused elsewhere [V, Practical Ecommerce].

### A2. Typography (SF Pro): exact values

From apple.com's own CSS (`/v/mainstage/f/built/styles/overview.built.css`), desktop → ≤1068px → ≤734px [V]:

| Style | Size | Line-height | Weight | Tracking |
|---|---|---|---|---|
| headline-super | 80 / 64 / 48px | 1.05 / 1.0625 / 1.083 | 600 | **-0.015em** / -0.009em / -0.003em |
| headline-elevated | 64 / 48 / 40px | 1.0625 / 1.083 / 1.1 | 600 | -0.009em / -0.003em / 0 |
| headline | 48 / 40 / 32px | 1.083 / 1.1 / 1.125 | 600 | -0.003em / 0 / +0.004em |
| section headline | 72 / 56 / 40px | 1.056 / 1.071 / 1.1 | 600 | -0.006em / -0.005em / 0 |
| intro | 21 / 19px | 1.381 / 1.421 | 400 | +0.011em / +0.012em |
| body | 17px | 1.47059 | 400 | **-0.022em** |
| eyebrow-super | 32 / 28 / 24px | 1.125 / 1.143 / 1.167 | 600 | +0.004 → +0.009em |

How to read the table:
- **Tracking follows optical size.** Larger type gets tighter tracking, and smaller headline sizes move toward positive tracking. This is the web version of SF's built-in tracking table. WWDC20 "The details of UI typography": SF used to switch Text→Display at 20pt; the variable font now changes tracking gradually between 17 and 28pt. "Custom tracking should be size-specific" [V].
- **Line-height** drops from about 1.47 (body) to about 1.05 (super headline). Big type sits tightly; reading type has room.
- **Hero spacing.** Hero `padding-top: 130px` (140px at ≤1068px, 100px at ≤734px). The subheadline sits only 18px below the headline, which is tight grouping inside a large void [V].
- **Text colour on dark pages.** Body copy is not white. It is `#c4c4c4`, subheads are `#A1A1A6`, and only headlines are `#fff` [V]. This hierarchy by luminance is a large part of why Apple's dark pages read as expensive.
- A third-party token extract of apple.com (Spain) adds: 96px display at -1.44px, page max-width about 1200px, section gaps 100–120px, a 4px spacing base, 28px card radius, and pill buttons (980px radius) [3P].

### A3. Colour restraint

- [3P] Ink `#1d1d1f` (not black), canvas `#f5f5f7`, paper `#fff`. **Electric Blue `#0071e3` is used for filled CTAs only**, and link blue `#0066cc` for inline links. Product finish swatches carry the rest of the colour.
- Principle: the UI is grey so the product is the only saturated thing on screen. Nothing ("fully monochrome, no accent", colour "comes from product photography") [3P], Teenage Engineering ("product photography carries all chromatic accent") [3P] and Aesop (neutral chrome, warm photography) [3P] all follow the same rule.

### A4. Motion curves and durations

- **Springs, not easing curves**, configured by `duration` + `bounce` (-1…1). Default bounce is 0 ("most versatile"). Presets are smooth, snappy and bouncy. Apple's example custom spring is duration 0.6 with bounce 0.2. Around 0.15 is "slightly bouncy", around 0.3 is "noticeable", and you should avoid going above about 0.4 for UI. Springs keep velocity when retargeted mid-flight, which is why interrupted Apple animations never jerk. Trigger follow-up changes on the *perceptual* duration, not the settling time [V, WWDC23 "Animate with springs"].
- **HIG Motion rules** [V]: add motion purposefully; make it optional (provide haptic or audio alternatives); keep it realistic, following the gesture; keep feedback animations brief and precise; avoid motion on frequent interactions; **let people cancel motion**; avoid sustained oscillation near **0.2 Hz** (a discomfort frequency, which matters for pulsing "now playing" indicators).
- I could not find published durations or cubic-bezier values from apple.com's web CSS in this session **[UNVERIFIED]**. For web, use CSS `linear()` spring approximations or a JS spring with bounce 0–0.15.

### A5. Materials and depth

- Liquid Glass (June 2025): "translucent and behaves like glass in the real world", "reflects and refracts its surroundings", "dynamically reacts to movement with specular highlights", and "intelligently adapts between light and dark environments". Alan Dye described it as combining "the optical qualities of glass with a fluidity only Apple can achieve" [V, Apple Newsroom]. Controls float above content and recede when not needed [V, Design Milk paraphrase].
- HIG notes Liquid Glass motion is *more emphatic under touch and more subdued with a trackpad* [V]. The intensity of feedback matches the input.
- Critics argue Liquid Glass is a UX step backward because translucency costs legibility (Prototypr headline seen in search; **not opened**).

### A6. Sound and haptics

- HIG "Playing haptics" [V]: keep a "clear, causal relationship between each haptic and the action". When visual, audio and touch "are in harmony… the experience is more coherent". Match the "intensity and sharpness of a haptic with… the animation". **"Avoid overusing haptics… the best haptic experience is one that people may not be conscious of, but miss when it's turned off."** Make it optional.
- WWDC21 "Practice audio haptic design" (Camille Moussette) [V]: three principles. **Causality** (the source of the feedback is obvious), **Harmony** ("It should feel the way it looks, and the way it sounds"), **Utility** ("Don't add feedback just because you can… reserve for significant moments").
- Transfer: a CZABA UI-sound palette needs fewer than about 6 sounds, each tied to one meaning (add to cart, stem solo, export complete). The sounds should be tuned to the brand's tonal centre, off by default or quickly mutable, and never on hover-spam.

### A7. Consistency and principles

- WWDC17 "Essential Design Principles" lists wayfinding, feedback, visibility, consistency, mental models, proximity, grouping, mapping, affordance, progressive disclosure, the 80/20 rule and symmetry, and warns that "too much of any principle" hurts [V].
- Apple's Style Guide exists to "maintain a consistent voice" across docs, UI and training [V]. Specific tone rules were not on the page I opened.
- Craft in parts nobody sees: Jobs "even cared about the look of the parts you couldn't see… the aesthetic, the quality, has to be carried all the way through" (Isaacson, via TNW) [V]. Web equivalents: metadata, file names inside the ZIP, the receipt email, the 404 page, `<title>` text, and favicons.
- Apple's 2013 "Designed by Apple in California" film starts from what people should *feel*, and warns "we start to confuse convenience with joy" [V, MacDailyNews transcript].

### A8. The unboxing ritual and how a website can echo it

Facts [V, Retail Brew; 9to5Mac/Lashinsky]:
- The lid drops slowly because of a slight vacuum and friction, with an audible "whoosh". Layers are wrapped "like origami", and the phone is revealed only after a deliberate sequence. The screen film peels off with a distinct sound.
- Jony Ive: "You design a ritual of unpacking to make the product feel special." "Packaging can be theater, it can create a story."
- Apple had a secret packaging room where a designer spent months "opening boxes", and hundreds of iPod box prototypes were tested for the emotional reaction.
- Apple Store staff hand the box over and let the customer open it.
- A 2021 9to5Mac poll: 28.3% keep the box forever and 59.5% keep it until they replace the phone.

Web translation for CZABA **[UNVERIFIED, design proposal]**:
| Box moment | CZABA moment |
|---|---|
| Lid resists, then drops slowly | First load: a short, interruptible reveal (≤1.2s, skippable, shown once per session) instead of a spinner |
| Layered reveal | Product page: hero cue → full mix → stems "unfold" one at a time on scroll |
| Customer opens it themselves | The user presses play. No autoplay. The first sound is *their* gesture |
| Film peel sound | One signature micro-sound on first play or unmute |
| Keep the box | A beautifully typeset licence/receipt PDF and a download folder with clean names, artwork and a cue sheet |

---

## Part B — Gallery and luxury sites: what stands out and what transfers

Notes: the gallery sites Godly, SiteInspire, Land-book and Lapa Ninja are not indexed by the search tool, and direct URLs were blocked by fetch provenance. So I worked through Awwwards pages and brand-specific sources. Several live sites (teenage.engineering, overworldaudio.com, tula.redcollar.co, byotone.com) could not be opened. They are marked below.

### B1. Apple AirPods Pro — apple.com/airpods-pro
- **Awards:** Awwwards Site of the Month, Jan 2020, plus the Developer Award [V].
- **Detail:** one continuous scroll-bound shot; strong black/white to express Noise Cancellation vs Transparency; about 1,600 progressively loaded frames; WebGL sound/noise visualisation baked to textures [V].
- **Transfer:** visualise sound as matter. For each CZABA track: one hero visual that reacts to the actual audio (FFT data baked offline, so it costs no runtime), and a black/white state switch for "full mix ↔ stems".

### B2. Teenage Engineering — teenage.engineering
- **Live site:** could not be opened (blocked).
- **Detail [3P, conflicting]:** One extract shows very light weights (≤300), sizes fluid against 100vw from a 980px base, black canvas, a 1px hairline product grid with no cards, 0px radius, no shadows, and product photos at about 80% of the viewport. A different guide describes monospaced type everywhere, uppercase labels at 0.12em tracking, an orange `#ff6600` CTA with a 100ms transition, and spec grids with 1px gaps. That guide says its CSS is illustrative. **The two sources disagree. Check against the live site.**
- **Product philosophy [3P]:** OP-1 modes take the full screen; every function is within two button presses; playful animated feedback (spinning tape reels, bouncing meters).
- **Transfer:** a catalogue voice ("industrial and cataloguing rather than promotional"), spec tables that look engineered (BPM / key / length / stems in a hairline grid), and *playful instrument feedback inside the Studio* (VU needles, tape-reel metaphors) while the store stays austere.

### B3. Nothing — nothing.tech
- **Detail [3P]:** a three-font system. Ndot dot-matrix is used *only* for product names (lowercase with parentheses: "phone (3)"). NType82 at weight 100 for headlines. Uppercase mono at 11–14px for buttons and labels. Fully monochrome UI with hairline borders instead of shadows, and full-bleed square photography bands [3P]. The brand's own llms.txt states the traits: transparency (see-through backs), Glyph lighting, a restrained black/white palette, lowercase names [V].
- **Transfer:** give CZABA a *naming typography*: one display face reserved for asset and collection names only. Use parenthetical or catalogue numbering (e.g. "CZ-014 (stems)") for a collector-edition feel. Use mono for technical metadata.

### B4. Hermès — hermes.com (2026 homepage)
- **Detail [V]:** illustration replaces glossy photography as the "central visual language". Each product category in the menu has its own hand-drawn illustration (an octopus wearing boots, a bird in a scarf). Linda Merad made twelve linocut- and lithograph-inspired illustrations, and Hermès credited her publicly. nss magazine reports a later edition by Sarah Martinon on paper, animated by Armand Béraud, with sections taking months of handwork and AI tools deliberately rejected. The stated goal is to "transform the e-commerce platform into an immersive, poetic experience". Hermès also refuses chatbots for customer service [V].
- **Why it works:** NN/g argues "polish has lost its value as a quality signal" because AI can produce sleek visuals instantly, so visible human authorship becomes the new luxury cue [V].
- **Transfer:** commission one named artist (illustrator or cinematographer) per collection and credit them like a film crew. Hand-drawn category glyphs (Tension, Wonder, Grief, Pursuit). A rule that no AI chatbot answers on the storefront.

### B5. Aesop — aesop.com, and "Aromatique Candles" by Studio Regale
- **Main site [3P]:** Suisse Int'l does "almost all the work". A humanist serif (Zapf Humanist / Optima) appears roughly once per page. Letter-spacing is 0. Canvas is warm `#fffef2` rather than white, ink `#333`, 0px radius, 1px hairlines and no shadows. Copy is set in "full, unhurried sentences at modest size… like labels". No italics for emphasis, and headings in regular weight [3P].
- **Candles microsite [V]:** Awwwards SOTD on 28 Jan 2021 (7.53; Creativity 8.17). It is a horizontal "virtual voyage" with original pixel art by Mattis Dovier and animation direction by Ugo Bienvenu. Built with GSAP, GLSL, PixiJS and Nuxt. Strictly black and white. It also won a Webby and the People's Voice award [V].
- **Transfer:** a warm off-white or warm off-black canvas rather than pure #000/#fff. Product descriptions written as literary labels, for example *"Low strings, a held breath, the door not yet opened."* For special collections, a horizontal "voyage" microsite in which each track is a room.

### B6. Bang & Olufsen — bang-olufsen.com
- **Detail [V, vendor case study by Publicis Sapient]:** a "story-led commerce" global flagship that uses immersive curated content and heritage (since 1925) as an asset, with "craft carried online". It runs on a headless CMS and microservices. Reported results: **+23% conversion and +27% revenue**, plus a 2020 Webby honoree (vendor-reported, no baseline given).
- **Transfer:** evidence that story-led commerce can pay off. Interleave editorial (how a cue was recorded) with buy modules rather than separating "Journal" from "Shop".

### B7. Rimowa — rimowa.com
- **Detail [V]:** in 2018 R/GA London relaunched the site with Rimowa's first full e-commerce. Services became product: repair appointments, guided purchasing, maintenance. CEO: "There's nothing impulsive or seasonal about this purchase." The 2015 iF-awarded site (m.i.r. media) opened with an interactive panorama of 1920s Schiphol Airport, which is heritage storytelling as the homepage [V].
- **Transfer:** "aftercare" for digital goods: licence lookup, re-download for life, re-render of your Studio mix if a new stem version ships. Heritage on the homepage: the founding story of CZABA and the rooms where the music was recorded.

### B8. Leica — leica-camera.com
- **Detail [V, but historical]:** In 2008 Scholz & Volkmer relaunched the site to mark Leica's repositioning *as a luxury brand*. The site was built around stories of intense moments in the lives of four people (Helen, Alexander, Hugo, Ben), seen from their perspective, with photography by Carli Hermès and motion by Rob Chiu (The Ronin). The 2007 relaunch won an iF award.
- I did not verify the current Leica site's design in this session **[UNVERIFIED]**.
- **Transfer:** sell the moment, not the asset. Each CZABA track's page opens on a scene ("4:12 a.m., a rooftop, the call that changes everything") and the music is what that scene sounds like.

### B9. Sonos — sonos.com
- **Detail [V, Sonos' own blog]:** moved from Helvetica Neue to Aktiv Grotesk (more "ownable"). Replaced a fixed brand colour with a **seasonal palette** (Sky, Rose, Sand, Rust, Pine) governed by a monthly cross-functional "Colour Committee". The Bruce Mau ambigram wordmark can now be placed either way up. Because sound is invisible, illustration (by James Graham) explains features while photography shows real listening. Work by Anomaly and Instrument.
- **Transfer:** a seasonal accent, one per collection, with the rest of the interface neutral. This gives "newness" without breaking the system. *Sound is invisible*, so CZABA needs a deliberate visual language for sound: waveform styling, stem colour coding, and "room" photography.

### B10. Linear — linear.app
- **Detail [V, Anthony Hobday critique]:** dark mode fits the brand, and dark backgrounds allow **lighting effects**: light pulses along screenshot edges, a star field above a divider, and strip-light dividers. Each section heading gets its own subtle colour that is "only obvious when the headings are viewed together". Copycats fail because they use bright colours on dark, which Linear avoids.
- **Transfer:** for a cinematic store, light is the material. Use edge-glows that follow playback position, and a low-contrast per-collection tint.

### B11. Arc (The Browser Company) — arc.net
- **Detail [V, Inverse interview]:** onboarding opens with a "radiating blast of colors" modelled on a **movie opening**, and ends with a personalised **Arc "membership card"**. Pacing borrows game-design "little wins" such as picking a gradient. The goal is that the first opening feels "like unwrapping a gift". The lit frame around the window references Robert Irwin's scrims: "the room matters, too".
- **Transfer:** a member card after sign-up (name, member number, date, a generated waveform signature). The first Studio session as a game tutorial: first win in under 10 seconds (solo the strings).

### B12. Ableton — learningmusic.ableton.com
- **Award [V]:** Awwwards Honorable Mention, 29 May 2017 (Music & Sound).
- **Interaction [UNVERIFIED]:** I could not confirm the playable grid interaction from the page I opened, though this is my understanding of the site.
- **Transfer:** teaching *is* the marketing. A free "How to cut a trailer to music" interactive inside the Studio both raises skill and shows the product.

### B13. Outhere Music — record label
- **Award [V]:** Awwwards SOTD, 17 Jan 2022 (7.3). An identity "inspired by the rhythm and harmony of classical and contemporary music". Three colours (black, `#D14836` red, grey `#9C9C9C`). Artist gallery with detail views, a playlist gallery and a reel video. Built with Tailwind and Swiper.
- **Transfer:** a label-grade identity in which rhythm drives layout, with three colours and a typography-led design. This sits close to CZABA's own stack (Tailwind).

### B14. Because Recollection — 84.Paris for Because Music
- **Awards [V]:** Awwwards Site of the Year 2015. Chrome Experiment (Feb 2016): "an interactive journey through ten years of sound and artworks", built with WebGL and Pixi.js. Search results also reference 84.Paris winning a Cannes Digital Craft Grand Prix (*not opened*).
- **Transfer:** catalogue as heritage. Even a young brand can present its archive as a navigable artwork, for example "CZABA Recollection: every cue, by year".

### B15. Lusion — lusion.co (studio)
- **Award [V]:** Awwwards Site of the Month (May).
- **Craft details [V]:** a point light follows the cursor. A slight camera tilt of about 1.72° lets you "look around". Cloth simulated in Houdini and stored as about 220 KB of blended data. 11 keyframes are interpolated to 66 frames, with 16-bit integers instead of floats. A mobile build at 1,024 vertices against 4,096 on desktop. Redshift renders exported as video with a JSON camera path. A binary frame counter is encoded *into the video* and read with `readPixels()` to sync, because `currentTime` is unreliable. Their principle: "You don't need to do everything real-time."
- **Transfer:** bake expensive visuals offline and play them back cheaply. A cursor-as-light-source on dark product heroes is a restrained, cinematic cursor idea, a better choice than a gimmicky custom cursor.

### B16. A24 — a24films.com
- **Detail [V, GrandArmy]:** an identity mixing "modern and progressive" with mid-century Hollywood. The wordmark plays with Art Deco forms. The system includes a pre-roll animation and music (Felt Not Heard). The logo became a mark of quality that fans tattoo.
- **Transfer:** a CZABA pre-roll, a 2–3 second sonic and visual ident, played *only* on first entry or before a Studio session, as with a film studio logo.

### B17. Epidemic Sound — epidemicsound.com (a direct-category competitor)
- **Detail [V]:** 2020 identity by Kurppa Hosk and Multiple. A custom "Epidemic" typeface. A monochrome backdrop so "the creator is the motif". Pillars: bold, universal, simple.
- **Transfer and differentiation:** competitors in production music put the *creator* in front and keep the brand neutral. CZABA's edge is to go the other way: put the *work and its authorship* in front (composer, room, ensemble) and position it as a gallery, not a utility library.

### Also noted (less detail available)
- **Tula microphones (tula.redcollar.co)** — Awwwards SOTD, 7 Mar 2020 [V]. Site not opened.
- **Overworld Audio (overworldaudio.com)** — Awwwards SOTD and Developer Award, 15 Oct 2026, by Rogier de Boevé [V, from the Awwwards listing]. Site not opened. **Worth a manual visit: it is a current, award-winning audio brand site.**
- **Byotōne (byotone.com)** — Awwwards Honorable Mention, 24 Sep 2026 [V, listing]. Not opened.
- **Sound of Change (music label)** — SOTD, 29 Mar 2016, by Possible Moscow [V, listing].
- **B/D JAMS (BASIC/DEPT)** — SOTM, Sep 2022. A playlist archive with an intro video shot on analog gear, with props recalling a vintage record store [V].
- **A Sound Effect (asoundeffect.com)** — the category baseline [V]: cards with sound count, runtime, price and strikethrough discounts. *This is the bargain-bin pattern a luxury store must avoid.*
- **Devialet, Native Union** — not verified. The only Devialet source found was a 2015 forum thread about a site redesign. **[UNVERIFIED]**

### B-summary: transferable patterns for an audio store

| Pattern | Seen at | CZABA implementation idea |
|---|---|---|
| Scroll-bound "single shot" product story | Apple AirPods Pro | Track page: cue plays, stems separate visually as you scroll |
| Visualised sound | AirPods Pro (WebGL noise), Because Recollection | FFT-baked waveform "sculpture" per track |
| Monochrome UI, colour only in media | Apple, Nothing, TE, Aesop | Neutral chrome; colour from film stills and per-collection tint |
| Reserved naming typeface | Nothing (Ndot) | Display face only for track and collection names |
| Hand-made, credited art | Hermès, Aesop candles | Commissioned illustrator or cinematographer per collection, credited |
| Seasonal palette | Sonos | One accent per collection or season |
| Light as material on dark | Linear, Lusion | Playback-driven edge glow; cursor as a light source |
| Gift-like onboarding and member card | Arc | CZABA member card with a waveform signature |
| Film-studio ident | A24 | 2–3s sonic and visual ident on first entry or Studio launch |
| Heritage homepage | Rimowa 2015, B&O, Leica 2008 | Founders' story, recording rooms, "Recollection" archive |
| Services as product | Rimowa | Lifetime re-download, licence vault, mix re-render |
| Story-led commerce (+23% conversion, vendor-reported) | B&O | Editorial and buy modules interleaved |

---

## Part C — Research basis

### C1. Aesthetic-usability effect
- **Kurosu & Kashimura (1995, Hitachi):** "apparent usability is less correlated with the inherent usability compared to the apparent beauty" [V, Wikipedia summary].
- **Tractinsky, Katz & Ikar (2000), "What is beautiful is usable", *Interacting with Computers* 13(2):127–145.** In an ATM simulation, perceived aesthetics and perceived usability were strongly correlated before *and* after use. The system's aesthetics affected post-use perceptions of usability, while its actual usability did not [V].
- **Counter-evidence: Grishin & Gillan (2019), *Journal of Usability Studies* 14(2).** With aesthetics and usability manipulated independently over four days of repeated use, aesthetics had **no significant effect** on SUS scores. Usability and time did. "If aesthetics influences perceptions of usability in early interactions… the effect is not a strong one." Caveat: their "high aesthetic" stimuli were only mid-scale [V].
- **Implication:** beauty buys the first impression and some forgiveness. It does not replace a Studio that works. For CZABA, the store must be beautiful *and* the Studio must be fast and reliable, or repeat users will notice.

### C2. First impressions (50 ms and 17 ms)
- **Lindgaard, Fernandes, Dudek & Brown (2006), *Behaviour & Information Technology* 25:115–126.** Visual-appeal judgments made after **50 ms** of exposure closely matched judgments after longer viewing, and first impressions persisted, a halo effect [V, Nature News].
- **Tuch, Presslaber, Stöcklin, Opwis & Bargas-Avila (2012), *IJHCS* 70(11):794–811 (Google/Basel).** 119 real sites rated at 50/500/1000 ms, then at 17/33/50 ms. **Visual complexity affects judgments at 17 ms.** Prototypicality (looking like its category) weighs in a little later. **Low complexity plus high prototypicality = most appealing** [V].
- **Implication: a tension with "be distinctive".** Users punish designs that break category expectations at first glance. So CZABA should be *recognisably a store* in structure (logo top-left, nav, search, cart, clear product grid) and spend its distinctiveness on materials, type, sound and motion, not on unfamiliar navigation. Keep the hero visually simple.

### C3. Processing fluency
- **Reber, Schwarz & Winkielman (2004), *PSPR* 8(4).** Aesthetic pleasure increases with ease of processing. Symmetry, contrast, repetition and prototypicality all work through fluency [V].
- **Implication:** rigid grids, consistent type scales and repeated rhythms are not dull. They are what makes the page feel beautiful.

### C4. Perceived value and price-quality inference
- **Zeithaml (1988), *Journal of Marketing* 52(3):2–21**, the means-end model of price, quality and value [citation V; content not opened, abstract unavailable on the page].
- **Rao & Monroe (1989), meta-analysis of 36 studies.** Price has a "moderately large and statistically significant" effect on perceived quality. Brand name has a slightly *larger* effect. Store name has a small, non-significant effect. Consistent cues reinforce each other [V, MSI].
- **Plassmann, O'Doherty, Shiv & Rangel (2008), *PNAS*.** The same wine at a higher stated price was rated more pleasant, and medial orbitofrontal cortex activity rose too. **Price changes the experience itself**, not just willingness to pay [V].
- **Implication:** discounts and price-slash badges actively lower experienced quality. Brand, as a cue, outweighs store presentation. The design's job is to make the *brand* legible and consistent.

### C5. Labour illusion and operational transparency
- **Buell & Norton (2011), *Management Science* 57(9):1564–1579.** When a site shows the work it is doing, people can prefer it to an instant one with identical results. Perceived effort creates reciprocity, which raises valuation (five experiments) [V]. Marketing Week reports the travel study (n=266, waits of 0–60s): a changing list of flights being searched beat a progress bar at every wait length (about +8% value). Diners who could see their food being cooked rated it 22% higher. Transparency *amplifies* existing opinion rather than reversing it [V].
- **Implication:** while the Studio loads stems, show real work ("Loading Violins I — 48 kHz / 24-bit — recorded at…") instead of a spinner. Show recording-session evidence on product pages.

### C6. Peak-end rule
- **Kahneman, Fredrickson, Schreiber & Redelmeier (1993):** people chose to repeat a *longer* cold-water trial (60s at 14°C + 30s at 15°C) because its end was less unpleasant. **Redelmeier & Kahneman (1996)**, colonoscopy: ratings tracked the worst and the final moments. Duration neglect [V, Wikipedia].
- **Caveats [V]:** applies to episodes with clear starts and ends. Weak for day-long experiences (Miron-Shatz 2009). "Not an outstandingly good predictor" (Kemp et al. 2008).
- **Implication:** a store visit has clear episodes (browse → audition → buy → download). Engineer one **peak** (the first time a track plays in the Studio with stems opening) and one **end** (a beautiful download and licence moment, not a generic "Order #1234 confirmed").

### C7. Scarcity
- **Worchel, Lee & Adewole (1975), *JPSP* 32(5):906–914.** Cookies from a jar of 2 were rated more desirable than from a jar of 10. A *drop* from abundant to scarce raised value more than constant scarcity. **Scarcity caused by demand beat scarcity caused by accident** (a bandwagon inference) [V].
- **Implication:** honest scarcity works best: limited editions of an exclusive licence (e.g. "Exclusive buyout: 1 of 1"), or seasonal collections that close. Fake countdown timers are the "accident" kind and also break luxury codes.

### C8. Luxury-web practice ("quiet luxury")
- **Kapferer & Bastien, *The Luxury Strategy*, the 24 "anti-laws" [V].** Including: "Luxury is not comparative"; "Does your product have enough flaws to give it soul?"; "Make it difficult for clients to buy"; "The presumed price should always seem higher than the actual price"; "Raise your prices as time goes on"; "Do not sell"; "Cultivate closeness to the arts"; "Do not sell openly on the Internet". On rule 24: the online features that make commerce convenient (speed, availability, discounts, automation) "work against luxury". The web should be a service for existing clients or a story introduction for chosen prospects.
  - *CZABA adaptation [my reasoning]:* digital goods *must* be sold online, so apply the spirit. No discounts. No comparison tables against competitors. Some friction that feels like care (auditioning in the Studio before buying, a licence conversation for exclusives). A members' area. Sell openly, but never *loudly*.
- **Arnault [V, HBR 2001 abstract; secondary summary]:** star brands pair "unrestrained creative freedom" with strict manufacturing discipline. Desire starts with the product, then the store environment. He visits stores weekly and notices details such as what sales staff wear. He judges brands by admiration in 5–10 years.
- **Practitioner checklists [V; trade articles, not research]:** generous negative space; one or two type families; "slow, purposeful motion"; understated CTAs ("Request a Consultation" over "Shop Now"); paced, exhibition-like reveals; "Price upon request" for top tiers; dark palettes with warm accents (IIAD). "The product is the hero, not the logo"; a fast, uncluttered site *is* the luxury; curated thematic edits; clienteling such as back-in-stock alerts and early access (Endear).
- **Hand-made as the new luxury signal (NN/g) [V]:** see B4.

---

## D. Concrete starter spec for CZABA (synthesis, **[UNVERIFIED]** as recommendations)

1. **Type:** one display face for names and headlines, tracked negative at large sizes (about -0.015em at 80px, easing to 0 by about 40px). One text face at 16–17px with line-height about 1.47 and tracking about -0.01 to -0.02em. Uppercase mono for metadata (BPM, key, stems) at 11–12px with +0.08–0.12em tracking.
2. **Colour:** warm near-black canvas (not #000), off-white ink (not #fff), body copy at about 75–80% luminance, captions about 60%. One accent per collection, used only for the active state or CTA.
3. **Motion:** springs with bounce 0–0.15, durations of 0.35–0.6s for UI and longer only for scene transitions. All of it interruptible, and `prefers-reduced-motion` respected.
4. **Sound:** muted by default with one clear toggle. Fewer than 6 UI sounds, all in key with the brand ident. First sound only after a user gesture.
5. **Hero:** low visual complexity. Category-standard nav. One film still or loop plus one line of copy.
6. **Product page:** scene sentence → play → stems unfold on scroll → credits (composer, ensemble, room) → licence options → Studio CTA.
7. **Loading:** labour-illusion status lines instead of spinners, with progressive frames like AirPods Pro.
8. **Peak:** the first time the Studio plays, solo a stem (a little win). **End:** a typeset licence PDF, clean folder naming, and a member card.
9. **Scarcity:** seasonal collections and 1-of-1 exclusive buyouts. Never fake timers or discount badges.
10. **Craft in unseen places:** ZIP structure, ID3/BWF metadata, email receipts, the 404 page, favicons.

---

## Could not verify / blocked

- Live sites blocked by fetch provenance: teenage.engineering, overworldaudio.com, tula.redcollar.co, byotone.com, the English blakecrosley TE guide, and the mintlify "sounds on the web" wiki.
- domusweb.it Hermès article: fetch returned an unrelated homepage, so I used NN/g, nss magazine and Big Wall Decor instead.
- Godly, SiteInspire, Land-book, Lapa Ninja and Dribbble/Behance showcases are not reachable through search indexing.
- apple.com web transition durations and easing curves: not found.
- Zeithaml 1988 full text: abstract not available on the opened page.
- Current Leica and Devialet site designs, Native Union, and the Ableton Learning Music interaction details.
- Teenage Engineering web tokens: two third-party sources contradict each other.

---

## Sources (opened in this session)

**Apple**
- https://uxplanet.org/8-things-i-learned-analyzing-apples-product-pages-9a5284681b37
- https://blogs.ulster.ac.uk/cormacmccann/?p=3646
- https://www.practicalecommerce.com/Apple-com-Redesign-Pushes-Ecommerce-Site-Trends
- https://css-tricks.com/?p=308477
- https://awwwards.com/airpods-pro-wins-site-of-the-month-january.html
- https://www.awwwards.com/Joseph-Berry/collections/product-focused/
- https://www.apple.com/v/mainstage/f/built/styles/overview.built.css
- https://styles.refero.design/style/c9cabb96-32fa-4896-837a-f2497ce1c856
- https://wwdcnotes.com/notes/wwdc20/10175
- https://wwdcnotes.com/notes/wwdc23/10158
- https://wwdcnotes.com/notes/wwdc17/802
- https://developer.apple.com/design/human-interface-guidelines/motion.md
- https://developer.apple.com/design/human-interface-guidelines/playing-haptics.md
- https://developer.apple.com/videos/play/wwdc2021/10278
- https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- https://design-milk.com/apple-returns-to-a-layered-software-design-with-liquid-glass-interface/
- https://support.apple.com/en-kz/guide/applestyleguide/welcome/web
- https://thoughtbot.com/blog/whitespace
- https://retailbrew.com/stories/2023/03/16/total-package-how-apple-made-unpacking-the-iphone-a-ritual-rather-than-a-chore
- https://9to5mac.com/2012/01/24/inside-apple-offers-a-glimpse-into-apples-secret-unboxing-room/
- https://www.thenextweb.com/news/steve-jobs-obsession-with-the-quality-of-the-things-unseen
- https://macdailynews.com/2013/06/11/new-apple-video-describes-what-goes-into-creating-each-apple-product-with-video/

**Galleries and brands**
- https://www.awwwards.com/websites/sound-audio/?page=1
- https://www.awwwards.com/awwwards/collections/sound-design/?page=3
- https://www.awwwards.com/sites/outhere-music
- https://www.awwwards.com/sites/learning-music-ableton
- https://www.awwwards.com/sites/aesop-aromatique-candles
- https://winners.webbyawards.com/2021/websites-and-mobile-sites/general-websites-and-mobile-sites/corporate-communications/185374/aesop-presents-three-aromatique-candles-other-stories
- https://basicagency.com/blog/b-d-jams-earns-awwwards-site-of-the-month
- https://experiments.withgoogle.com/because-recollection
- https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html
- https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/
- https://www.hontran.dev/blog/best-award-winning-websites-2026
- https://nngroup.com/articles/handmade-designs
- https://www.nssmag.com/en/fashion/46500/hermes-artist-website-illustration-ai
- https://bigwalldecor.com/blogs/blog/hermes-hand-drawn-website-age-of-ai
- https://fontalternatives.com/inspiration/aesop-suisse/
- https://www.shadcn.io/design/aesop/raw
- https://www.shadcn.io/design/nothing
- https://us.nothing.tech/llms.txt
- https://www.shadcn.io/design/teenage-engineering/raw
- https://blakecrosley.com/fr/guides/design/teenage-engineering
- https://anthonyhobday.com/blog/20230119.html
- https://www.inverse.com/input/design/the-browser-company-arc-design-interview
- https://knowledge.publicissapient.com/13/work-Bang-and-Olufsen.html
- https://www.glossy.co/ecommerce/rimowa-is-launching-a-new-online-identity-under-lvmh-ownership
- https://ifdesign.com/en/winner-ranking/project/rimowa/147639
- https://www.horizont.net/medien/nachrichten/-Scholz--Volkmer-entwickelt-Leica-Markenauftritt-im-Netz-74418
- https://ifdesign.com/en/winner-ranking/project/leica-camera/33368
- https://reviewed.com/cameras/news/leica-launches-new-website
- https://www.sonos.com/en-gb/blog/sonos-brand-design-refresh
- https://contra.com/p/Y636XRe2-digital-storefront-for-museum-grade-audio-hardware
- https://www.grandarmy.com/projects/a24
- https://epidemicsound.com/blog/epidemic-sound-new-identity
- https://cdn0.workingnotworking.com/projects/360742-output-arcade-new-browsing-experience
- https://www.asoundeffect.com/?p=701274
- https://devialetchat.com/Thread-New-website

**Research and luxury theory**
- https://en.wikipedia.org/wiki/Aesthetic%E2%80%93usability_effect
- https://academic.oup.com/iwc/article/13/2/127/898608
- https://uxpajournal.org/wp-content/uploads/sites/7/pdf/JUS_Grishin_Feb2019.pdf
- https://www.nature.com/news/2006/060109/full/news060109-13.html
- https://research.google/blog/users-love-simple-and-familiar-designs-why-websites-need-to-make-a-great-first-impression/
- https://research.google/pubs/pub38315/
- https://journals.sagepub.com/doi/10.1207/s15327957pspr0804_3
- https://www.sodanet.gr/publications/bibliography/consumer-perceptions-of-price-quality-and-value-a-means-end-model-and-synthesis-of-evidence
- https://www.msi.org/working-papers/the-effect-of-price-brand-name-and-store-name-on-buyers-perceptions-of-product-quality-an-integrative-review/
- https://pubmed.ncbi.nlm.nih.gov/18195362/
- https://ideas.repec.org/a/inm/ormnsc/v57y2011i9p1564-1579.html
- https://ideas.repec.org/p/hbs/wpaper/14-034.html
- https://www.marketingweek.com/richard-shotton-labour-illusion/
- https://en.wikipedia.org/wiki/Peak%E2%80%93end_rule
- https://uni-muenster.de/imperia/md/content/psyifp/aeechterhoff/vorlesungkommunikation/worchelleeeta_suppdemanobjval_jpsp1975.pdf
- https://www.thefashionlaw.com/the-luxury-strategy-the-24-anti-laws-of-marketing/
- https://store.hbr.org/product/perfect-paradox-of-star-brands-an-interview-with-bernard-arnault-of-lvmh/R0109H
- https://www.antoinebuteau.com/lessons-from-bernard-arnault/
- https://www.iiad.edu.in/the-circle/why-some-websites-just-feel-expensive/
- https://endearhq.com/blog/4-ways-to-cater-to-quiet-luxury
