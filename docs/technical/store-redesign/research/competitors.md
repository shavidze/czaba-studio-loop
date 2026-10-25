# CZABA: Competitor Website Design Research

Research date: 2026-10-25. Scope: direct competitors (music and SFX licensing for film) and adjacent ones (sample and instrument brands, SFX stores).

## 0. Method and limits (read first)

- **How pages were read.** Pages were fetched with a text-extraction tool (WebFetch). It returns rendered text and markup hints, **not pixels**. This means:
  - Copy, information architecture, section order, labels, prices and trust signals are **observed**.
  - Typography, colour, motion and hover behaviour are **observed only where a source states them**: Refero style extractions, theme-color meta tags, agency case studies, or vendor feature articles.
  - Anything else is marked **[guess]** or **[not observed]**.
- **Client-rendered pages.** Several sites returned only `<head>` metadata, so no body could be read:
  - output.com (homepage, /products/arcade, /products/output-one), which runs on Storyblok and a JS front end.
  - audionetwork.com (Next.js).
  - Parts of the Artlist and Epidemic homepages.

  Secondary sources fill those gaps and are labelled as such.
- **Blocked fetches.** These were rejected by the fetch tool's provenance rule and not read:
  - musicbed.com/pricing and /songs listing
  - native-instruments.com homepage, /products/kontakt and /pages/komplete-26
  - marmosetmusic.com root
  - prosoundeffects.com root
  - universalproductionmusic.com root
  - getsoundly.com root
- **Dates.** Many review prices are dated. The date is given next to each one.
- **Two ownership facts that matter for positioning:**
  - Spitfire Audio was acquired by **Splice in April 2025**, according to Wikipedia. Spitfire product pages now say "Requires free Splice account", and splice.com's footer lists Spitfire as "A Splice Company".
  - Artlist has pivoted strongly to **AI video production** ("Artlist Studio").

---

## 1. Direct competitors: music licensing for filmmakers

### 1.1 Musicbed (musicbed.com), part of the FM family with Filmsupply and Stills

**Homepage hero (observed, live fetch)**
- Eyebrow "MUSIC LICENSING FOR FILM". H1 "License music from emerging artists". Sub-copy: "We connect creatives, agencies, and production companies with authentic, emotionally resonant artists from around the world. Fully released and ready for film, TV, and advertising."
- **Message:** mostly **feature/curation-led**, with an emotional undertone ("emotionally resonant", "Amplify the emotion in every scene").
- **Media:** a strip of eight placement logos in the hero. A `home-hero-2024.mp4` video sits further down, and a `Searching-MB.webm` product demo video appears in the Search-by-Song section. Whether the hero video is a background **[not observed]**.

**Page rhythm (observed):** short, punchy uppercase section claims.
- "100% CURATED. 0% FILLER."
- "YOU KNOW IT WHEN YOU HEAR IT."
- "DISCOVER SOMETHING NEW, EVERY TIME."
- A curation-scarcity claim: the team accepts "less than 1%" of submissions. Another Musicbed article says it "generally reject[s] over 99%".

**Stats used as value proof:** 70,000+ curated songs, 150,000+ SFX, 1,500+ artists and composers.

**Artist grid as heritage and social proof:** 16 names, including the London Symphony Orchestra and Guster. There are also curated playlists with track counts, such as "2025 Musicbed Awards (34)".

**Audio preview and search**
- **Search tools.** The 2017 rebuild (Musicbed blog) merged browse and search and added:
  - Include/Exclude tokens, for example Piano included and Male vocals excluded
  - BPM slider, key, "builds vs steady" filter, lyric search and length slider

  2025 and 2026 articles add:
  - "Search by Song" (paste a Spotify link or a song name)
  - "Quick Preview" or "Skip to the Heart of a Song", where AI jumps to a song's core segment
  - "Search by Segment", which searches for songs similar to the waveform segment under the playhead (a build, a drop, a quiet bridge)
  - An inline "Find Similar Songs" button on every row, with active filters preserved
  - "Hot Keys"
- **Player persistence.** There is a persistent mini player bottom-left. Hovering the album art reveals an arrow that opens an "Expanded Player" with listening history, related songs and add-to-project (2017). A 2026 article says the expandable player lets you review details "without constantly opening new pages or losing your place".
- **Waveforms.** The October 2025 mobile app redesign introduced "a redesigned song row with a visible waveform on every track" plus scrubbing. Web waveform styling **[not observed]**.

**Song page structure (observed, /songs/cha-ching/44517)**
- Cover image, H1 title, linked artist.
- **Key and BPM shown as links** to filtered searches ("G minor", "152 BPM").
- Tabs: Details, Lyrics, Similar Songs. A "Song Versions" block with its own Download and License buttons, and a "Load More Similar Songs" card grid.
- No price on the song page; licensing happens behind the "License" button.
- Artist pages show photo, bio, country, genre tags, song, album and related-artist counts, and separate "- Instrumental" versions.

**Licensing and pricing**
- Segmented by "are you doing client work?". The 2020 update, still "valid in 2024", lists:
  - Individual: from $29.99/mo without client work, from $99.99/mo with client work
  - Business, Non-Profit, and Wedding ($69)
- A February 2025 article gives single-song prices of $59.99 (YouTuber) and $349.99 (client work), plus a 14-day trial.
- Some premium tracks require single-use licences even for subscribers.
- Enterprise adds Rights & Clearances (licensing of "any song in the world"), human "Song Search" delivered within one business day, and custom music.

**Trust signals:** Trustpilot (4.5/5 from 464 reviews on the DK page). Six named testimonials, including "Emmy Winning Cinematographer". The LA Rams logo. Monthly "Musicbed Awards" for films that use their music, which is a ritual and community device.

**Micro-interactions:** Hot keys. Hover on album art reveals the expand arrow. Any UI sound **[not observed]**.

**What feels premium**
- The curation-as-scarcity claim ("<1%").
- Artist-first framing: named artists with bios, like a record label rather than a stock library.
- Editorial uppercase manifesto lines.
- A human service layer (Song Search, clearances).
- Awards for customers' films.

**What feels cheap or generic**
- "CREATE FREE ACCOUNT" is repeated throughout.
- A phone number sits in the top bar.
- Testimonials are duplicated in the markup.
- Trustpilot reviews complain that cancelling is hard and that annual lock-ins caused surprise charges. This erodes the psychological value of trust.
- Pricing is opaque: no price on song pages, and quotes are negotiated per use. Soundstripe's comparison calls it complicated, though that source is biased.

Sources: musicbed.com; songs/cha-ching/44517; artists/sleepover/44162; blog ?p=2550; pricing article; articles ?p=8040; ?p=8968; find-the-right-song-faster article; Trustpilot DK; Dribbble FM_Designs.

### 1.2 Artlist (artlist.io)

**Homepage hero (observed, partial)**
- H1 "All you need to create amazing videos". Sub "Get the highest-quality music, SFX, AI voiceovers, footage, and more."
- **Message:** a **feature/breadth** pitch, positioned as a one-stop shop.
- Sections: "Highest-quality assets. Always.", "Find what you need. Fast.", "Original content. Exclusively.", then pricing and FAQ. Claim: "700K digital assets, updated daily".
- Hero media **[not observed]**.
- Theme-color meta is **#171717** (near-black). An asset named "green-glow-bg" suggests a green glow accent **[guess from filename]**. The Shotkit review shows pricing "on a black screen".

**Strategic direction (observed):** Artlist Business and Artlist Studio pages lead with AI.
- "The first true AI production platform."
- The page lists AI models (Veo, Kling, GPT Image, ElevenLabs and others).
- Music is now one asset among many.

**Audio preview and search**
- **Persistent bottom player** since 2016: "a new main player at the bottom of the screen that allows you to keep listening as you browse".
- Left-hand category menu (Mood, Video Theme, Genre, Instrument, Spotlight) with a two-step drill-down. Sort by newest, duration and BPM. **Infinite scroll** ("The list of tracks seems to go on forever"). AI-assisted search.
- The track page shows details and similar sounds, with save, share and add-to-collection. WAV is reserved for paid subscribers.
- Waveform styling and hover-to-play **[not observed]**.

**Licensing and pricing**
- Subscription only: Social vs Pro licence, then Business. Prices from Wyzowl (updated January 2026): Music & SFX from £8.49/mo, AI Suite £9.99/mo, AI Max £33.99/mo.
- Licences apply only to projects made while subscribed (Shotkit).
- Enterprise trust signals: logos (Microsoft, Porsche, Google, Apple, Amazon Prime Video, Shopify and others), ISO 27001, SOC 2 "bientôt", indemnification.

**Premium:** dark near-black canvas **[from theme-color]**, an exclusive in-house catalogue, and a big-brand logo wall.

**Cheap or generic:** an "everything for everyone" breadth pitch with AI model names as headline selling points. Infinite scroll suggests a commodity catalogue rather than curation. Music is no longer the hero. This is the opposite of couture curation.

Sources: artlist.io; artlist.io/fr/enterprise; artlist.io/studio; blog "fresh new look" (2016); Wyzowl review; Shotkit review.

### 1.3 Epidemic Sound (epidemicsound.com)

**Visual system (Refero style extraction of an Epidemic marketing page)**
- Refero describes it as "Boutique liner notes on sunlit paper": a light editorial look, mostly monochrome ("Colorfulness sits at 1%").
- **Type:**
  - Custom display serif "sebentaFont", weight 500 only. **Italic is the emphasis system** (no recolouring). Sizes 64–80px display, line-height 1.0–1.06, tracking -0.04em.
  - Body in **Inter**.
  - A 2020 identity post says Epidemic "got our own font, which is called Epidemic"; the current custom serif may be a later addition **[unclear]**.
- **Colour:** paper white #ffffff, bone #f1f0eb and ink black #000000, with full-bleed punctuation blocks in Hot Pink #ff82c2, Signal Blue #20afff and Sun Yellow #ffda40.
- **Shape and depth:** **0px radius everywhere** except the NEW pill. **No drop shadows**; depth comes from background shifts. 1200px centred column, 8px base unit.
- **Hero:** centred two-line serif, text-only (no image). Subhead in Inter with ▪ separators.
- **Feature blocks:** floating product cards rotated -3° to -5°, with a hand-cursor icon.
- **Brand background:**
  - 2020 identity by Kurppa Hosk with Multiple: pillars "bold, universal, simple", and a "minimal and monochrome" backdrop so "the creator" is centre-stage.
  - 2024 rebrand by BOLD Scandinavia: a collage visual language mixing "vintage 1800s illustrations to modern 3D renders".
  - **Audio ID:** not a jingle, but a rhythmic sequence of catalogue music that stays "in key and on time regardless of the tempo, key and genre".

**Hero message:** creator-centric. The music page H1 is "Discover our royalty-free music for videos". The FAQ calls Epidemic "the leading soundtracking platform for content creation". This is **functional**, not dream-selling.

**Audio preview and search**
- Semantic search ("describe music… in your own words").
- Filters: genre, mood, length, tempo, vocal/instrumental.
- **"drag your slider across a track's waveform"** to find similar-sounding tracks, so the waveform is an input device.
- Reference search: Spotify link, or Shazam in the app.
- Curated "Themes" with track counts, weekly Staff Picks, and an AI "Assistant".
- Stems (melody, instruments, bass, drums) via a download arrow on each row.

**Editing tools (closest to CZABA's Studio)**
- **Adapt.** "An AI music editor":
  - Change mood or instruments, remove vocals.
  - Length presets of 15/30/60s or custom up to 5 minutes.
  - Rearrange structure, with a stem mixer to mute or lower stems.
  - Non-destructive, with version revert. Credit-metered.
  - November 2025 added stem-level adaptation and adding missing stems. The CPO said stem control was "the number one most requested update among creators".
- **Studio.** December 2025, inside Premiere Pro: highlight sections of a video and get an "instant, cohesive soundtrack draft" of music, ambience and foley, then move, extend, trim and adjust volume per clip.

**Pricing:** Creator, Pro, Business and Enterprise. Prices were not rendered in the fetch. A Music Gateway review lists Personal £10/mo and Commercial £39/mo (undated, older). The pricing page logo wall shows BBC, L'Oréal, TED, Sephora, Red Bull, Levi's and GoPro, and claims "data insights from over 2 billion YouTube views per day".

**Premium:** the editorial serif with italic emphasis, strict 0-radius, no shadows and colour discipline. It is the best-documented typographic system among the competitors. The sonic logo built from the catalogue and locked to BPM and key is a genuinely clever piece of sound design.

**Cheap or generic:**
- The voice is creator and YouTube volume ("2 billion YouTube views").
- Pink and blue full-bleed blocks read as playful startup, not luxury.
- AI credits and metering.
- The catalogue is huge (55k+ tracks, 250k+ SFX) with no scarcity.

Sources: Refero Epidemic style; epidemicsound.com/music; /pricing; /tools/adapt; blog on searching the library; Adapt and Studio press releases; identity blog (2020); LBB (2024); Lovethework entry; referral page.

### 1.4 Soundstripe (soundstripe.com)

**Homepage hero (observed)**
- Announcement bar: "Soundstripe LIVE is available now."
- H1 **"Real music. Real coverage."** Sub: "116k+ tracks by Grammy-winning artists… comprehensive licensing so every project is covered wherever it runs."
- Badge: "100% Human-Made Music" with a fingerprint icon.
- **Media: a live audio player in the hero.** An artist ("Gee Smiff") with a circular thumbnail, Pause button, volume on/off toggles and a download icon. The MP3 is named `Gee_Smiff_Hero_lead_vocal`. Sound in the hero is unusual among these sites; whether it autoplays muted or unmuted **[not observed]**.

**Sections:**
- Trending Songs: seven rows with art, title, artist and duration.
- Greyscale logo wall: Netflix, Nike, Delta, Hilton, American Express and others.
- "Coverage from TikTok to TV" case uses: HBO *Tokyo Vice* S2 trailer, Super Bowl LIX, *Forza Horizon 5*.
- Feature grid "Smarter tools. Faster workflows.", FAQ, blog.
- Audience-segment links: Creators, Freelancers, Agencies, Brands, Universities, TV & Film.

**Audio and search**
- AI "Supe" ("your 24/7 music supervisor") with text and **video-upload search**.
- Reference Track Search via Spotify, YouTube or Apple links.
- Stems, alts and cut-downs.
- Hover a row to reveal the save icon.
- The song page uses a **slide-over player** with Favorite, Add to Project, Add to Playlist, Copy link, View Credits, Download and Close Player.
- Song page metadata: "Stems" tag, duration, mood tags (Romantic, Hopeful…). No BPM or key on the observed song page.
- A dark-mode toggle that persists.

**Pricing (Photutorial, checked July 2026)**
- Subscriptions: Personal $19.99/mo, Pro $39.99/mo, Pro Plus $69.99/mo, Business $999/yr, Enterprise custom.
- Single-use licences: Personal $49, Digital $199, Expanded $399, All Media $1,249.

**Premium:** the human-made fingerprint badge (authenticity as psychological value), real sound in the hero, and named premium placements.

**Cheap or generic:**
- Repeated "See Pricing" and "Learn More".
- Persona mega-menus and a "How We Compare" page.
- Affiliate `?fpr=` links everywhere.
- A phone number in the footer.
- It reads like a SaaS growth site.

Sources: soundstripe.com/?fpr=dci; /library/songs/17030; features overview blog; vs-Musicbed blog; Photutorial pricing.

### 1.5 Marmoset (marmosetmusic.com)

The root site was not fetched. Observations come from landing pages and reviews.

- **Positioning:** "Music licensing & music production with purpose." A full-service agency: Custom Licensing, Clearances, Music Supervision, Marmoset Studio. The 2020 wedding page mentions Certified B Corporation status and a transparency report.
- **Search UX (Noam Kroll, 2016):**
  - Starts from story and character qualities, mimicking "a meeting with a composer".
  - Filters by energy, **arc** ("a steady build, multiple crescendos, a frenetic pace"), length, vocals, instruments.
  - Kroll called it "arguably the most intuitive tool for searching a music library".
- **Tone:** playful and confident ("we've got you", "copyright law rabbit hole").
- **Premium:** narrative-first search vocabulary (arc, energy), a human supervision layer, and purpose and B-Corp credentials.
- **Weak:** the landing pages observed are old (2020 and 2022 copyright lines) and show no visual detail.

Sources: welcome.marmosetmusic.com/musiclicensing; wedding landing page; Noam Kroll.

### 1.6 Audio Network (audionetwork.com)

The main site is client-rendered; only the Australian "About" page and the blog were read.

- **Hero:** "Audio Network Production Music – for TV, Advertising and Film Productions". The CTA is "Start searching for the soundtrack to your production."
- **Trust signals:** offices in London, New York, Munich, Toronto, Sydney and Amsterdam; clients ABC, BBC, Endemol, Discovery and MTV; "1000+" tracks a month.
- **Licensing:** single production licence "starts from just $295", "pre-cleared for multiple platforms, worldwide, forever".
- **Waveforms** shown on large desktop screens, "paired with track descriptions".
- **Cheap or generic:** the unrendered template token "[[production-count]]" appears in the live meta description and body. It is a visible craft failure.

Sources: au.audionetwork.com/content/who-we-are; blog "what is a waveform".

### 1.7 Universal Production Music (universalproductionmusic.com)

The root site was not fetched.

- Agency case study (Big Group): rebuilt on Angular.js and Sitecore 8 and launched in 28 markets. It has 250,000+ tracks and "150+ filters". The brief was for "better search functionality, and user-friendly filtering to take centre stage". An e-commerce and licensing flow was described as the next phase.
- Owned by Universal Music Publishing Group. It was formerly Killer Tracks, renamed in 2019.
- **Read:** a utility-first broadcast catalogue. Premium comes from the Universal name, not from the craft of the site.

Sources: biggroup.co.uk case study; Wikipedia.

### 1.8 Triple Scoop Music / Songtradr

Both have low relevance.

- **Triple Scoop** (2018 article): aimed at event filmmakers and photographers, with a "browse, license, download" flow. "Signature" playlists were made with named photographers. Per-project prices were $60, $120 and $299, and membership was $499–600 a year.
- **Songtradr:** a B2B marketplace and rights platform. No buyer-UX detail was found.

Neither is a premium design reference.

Sources: ProVideo Coalition (Triple Scoop); Hypebot (Songtradr).

---

## 2. Adjacent: instrument and sample brands

### 2.1 Spitfire Audio (spitfireaudio.com), owned by Splice since April 2025

**Homepage (observed)**
- **Hero:** a featured product rather than a brand dream: "Phoenix – A hybrid synth for cinematic sound design" at £199, struck through from £249, with a "New" badge.
- Static product image; no hero video observed.
- Announcement bar: "OUT NOW: Phoenix – introductory offer ends soon".
- Theme-color meta #000000. It runs on Shopify.

**Sections:**
1. A **"Product Recommender (Beta)"**: "What sound are you looking for?", with prompts like "Warm and intimate strings".
2. Brand statement: "partnering with the world's finest pioneers and studios, including Hans Zimmer and Abbey Road".
3. Editorial cards ("Behind the Score: Anthony Willis on the sound of *Wuthering Heights*") and a game ("Explore the wonderful world of Originals").
4. Product grid.
5. Composer Resources by level.

**Audio demos (signature pattern)**
- Every product card has **"Play demo"** with a **"Now playing" caption naming the piece and the credited composer or performer**, for example "Hall of Mirrors (Paul Thomson)" or "Violin (wet) (Emily Wells)".
- Product pages have a "Listen" section of named demo pieces ("In Between All the Worlds – Louis Rugg"; "Trailer music – Christian Henson"). The BBCSO page uses Saint-Saëns, Tchaikovsky, Rachmaninoff and Grieg.
- The player UI itself **[not observed]**.

**Product page structure (Originals Epic Strings)**
1. Hero: title, one-line promise ("A 60-strong symphonic string section, featuring London's best players"), price £29, Add to cart.
2. Badges: "11 Articulations · 3 Mic Signals · INSTRUMENT Plugin".
3. Overview, then Listen.
4. A 16-minute walkthrough video.
5. Numbered plugin-UI callouts ("Shape every phrase", "Control the space"…).
6. Key Features, then What's Included (each preset and mic signal named).
7. FAQ, then Tech specs.

Heritage is written into the specs: "recorded in the reverberant acoustics of AIR Studios, London", "Lyndhurst Hall". The BBCSO page tells the Maida Vale story: home of the orchestra, and a studio that hosted The Beatles, Hendrix and Bowie.

**Trust signals**
- Collaborators in the mega-menu: Hans Zimmer, Eric Whitacre, Ólafur Arnalds, Hauschka, Gustavo Santaolalla, London Contemporary Orchestra, Abbey Road.
- "over 1 million users" of BBCSO Discover. Trustpilot.
- The LABS and BBCSO plugin UIs were designed with ustwo (the studio behind Monument Valley).

**LABS sub-brand (Villagers Studio identity, about 2025)**
- Typeface "Absolution", "a pseudorandom typeface that contains six alternative shapes for each letter". A script rotates the letterforms in real time as text is typed.
- A 12-colour palette mapped to instrument categories.
- Close-up photography of musicians and their gear.

**Premium:**
- **Provenance as a product attribute:** named halls, players, mic positions and composers.
- Demos credited like concert programmes.
- Composer education as a ritual.
- The plugin UI is shown as an object of craft.

**Cheap or generic:**
- Permanent "introductory offer ends soon" urgency and strike-through prices on the hero.
- Shopify boilerplate: about 200 country-selector links and hCaptcha newsletter gates twice on a page.
- Since the acquisition, "Requires free Splice account" dilutes the London-boutique story.

Sources: spitfireaudio.com; /products/originals-epic-strings; /products/bbc-symphony-orchestra-discover; /pages/discover; Wikipedia; Bounty Hunters (LABS identity); MusicTech (LABS).

### 2.2 Output (output.com)

The body was **not rendered**; only metadata and the blog chrome were read.

- **Titles:**
  - Homepage: "Output – Creative tools for musicians, by musicians."
  - Arcade: "The hitmakers' favorite playable sampler and instruments plugin". Meta: "Perform, shape, and tweak thousands of mix-ready samples so you can sound entirely original."
  - Output One: "Music's most creative tools – all in one".
- **Arcade page structure (urlscan, April 2024 text capture):**
  - Header: Shop, Plans, Log In, Cart, "Try It Free".
  - Hero: "THE ULTIMATE SAMPLE PLUGIN", "Over 64,000 playable samples and 1,300 instruments", "No charges today. Cancel anytime."
  - Feature blocks: Find Inspiration, Add Flavor, Always Fresh.
  - Artist social proof, three testimonials, and an FAQ (plans from $11.99/mo).
- **Brand:** the November 2024 rebrand was "visual and philosophical", with the line "We will always use technology to help you, never to replace you." Claimed users include Beyoncé, Kendrick Lamar, Billie Eilish, *Stranger Things* and *Game of Thrones*.
- **History:**
  - 2015: moved from outputsounds.com to output.com.
  - 2018: WooCommerce store built by SAU/CAL. The founder's goal was "to help people be creative."
  - Today: a Storyblok CMS, a hardware brand (de-fi.com) and merch "Drops".
- **Visual style, motion and audio UX** **[not observed; cannot verify that Output is among the most premium]**. Output's reputation for cinematic product visuals is widely held, but this research could not confirm it from a source. Treat it as **[guess]**.

Sources: urlscan.io capture of output.com/products/arcade; output.com blog chrome; Magnetic Mag (2024); WooCommerce case study (2018); rekkerd (2015).

### 2.3 Native Instruments (native-instruments.com)

Only the About page and a Shopify collection page were read.

- **About hero:** "EXPLORING THE FUTURE OF SOUND". Trust claims: "used by more than 1.5 million creators every month" and "Eight out of ten songs on the Billboard Top 100 feature NI sounds".
- **Chrome:** a two-tier mega-menu (Music production / DJing), "Try 360" subscription, Deals, and currency and language selectors. It runs on Shopify.
- **Collection grid:** cards show brand badges (NI, iZotope, u-he), title, one-liner and USD price. Per-card `#play-` anchors suggest audio previews **[inferred from link structure]**.
- **2023 refresh:** a new logo, with "our new vibe isn't just about appearances". Typeface and colours were not stated.
- **Read:** a big-box retailer feel (Deals, multi-brand grid).

Sources: native-instruments.com/en/company/about-us; zh vari-comp collection page; NI blog brand news (2023); Limely.

### 2.4 Splice (splice.com)

**Visual system (Refero):**
- Dark: Carbon #121214, Graphite #232426, Obsidian #000000, and white text.
- One blue accent (#528fff for links, #1253ff for filled buttons) and Voltage Yellow #f1f607 used only for text highlights.
- **Type:** SoehneBreit 400 display (never bold), Soehne and InterVariable.
- **Shape and depth:** 4px radius on cards and 8px on buttons. No drop shadows, only a 1px inset stroke.
- **Imagery:** full-bleed atmospheric interior photography with coloured light, and the headline set lower-left.
- Refero's summary: "a dark, weightless space where the only thing that ever gets loud is the music."

**Homepage (observed):**
- "Start with Splice / The industry's top sample library—royalty-free for all."
- A rotating "Splice is a…" phrase, then about 20 sample rows each with Play, filename and pack.
- Value props: "100% royalty free / Yours forever / Cancel anytime".
- Promo bar "Get 50% off Splice Creator Annual".

**Sample page:** filename as the H1 (`BRS_Creature_Large_Breath_Sigh_Grumble.wav`), tags, "Add to your Library (1 credit)", and "People also viewed these packs".

**Premium:** restraint, with dark atmospheric photography and a non-bold wide grotesk.

**Cheap:** raw filenames as titles, credit economics, discount banners, and rent-to-own pricing everywhere.

Sources: Refero Splice style; splice.com; splice.com sample page.

---

## 3. Adjacent: SFX libraries and stores

### 3.1 BOOM Library (boomlibrary.com)

- **Signature Series bundle page (observed):**
  - "The Ultimate Sound Design Arsenal".
  - Stats: **271,762 sounds · 68,243 WAV files · 2520 GB · "UCS Compliant"**.
  - Buyout vs subscription toggle. Prices like $13,409 struck through from $22,343 with a "-40%" badge. Subscriptions have a three-year minimum.
  - A "Signature Method" explainer: Construction Kit (dry source) vs Designed (layered, drop-in).
  - A free Loader app for downloads.
- **Trust signals:** a ~100-logo wall (Netflix, Nintendo, Ubisoft, Valve, Disney Pixar…). A "Credits" menu with Trackrecord, Clients and Testimonials. Blog posts embedding trailers that used BOOM sounds (Ant-Man, Crimson Peak…).
- **Previews:** a play button and 0:00 timer on product cards; waveform **[not observed]**.
- **Premium:** proof by credits, with the trailer reel as heritage, and engineering transparency.
- **Cheap:** a discount badge and VAT notices next to five-figure prices, plus a dense catalogue grid ("Page 1 of 9").

Sources: boomlibrary.com ?p=87938; ?p=3211.

### 3.2 Sonniss (sonniss.com)

- Tagline "The Sound Editor's Toolkit".
- **Spec-first filtering:** "Filter by the spec, not just the subject". Sample rate 44.1–192 kHz, bit depth, channel format up to ambisonic, file-count ranges, plus "Gear listed" and "Video demo" toggles.
- **Publisher profile card:** Libraries 51 · "Best spec: Up to 192 kHz / 24-bit" · Prices "$39 to $1,199" · Licence "Royalty-free for commercial work".
- Each product card has a spec badge ("96K/24 STEREO + SURROUND").
- Trust signals: "GUARANTEED SAFE CHECKOUT" and payment logos, which read as generic e-commerce. No audio preview was observed on the publisher page.
- Famous for the free yearly GDC bundle (27–44 GB giveaways).

Sources: sonniss.com/vendors/prosoundeffects; GameFromScratch and rekkerd GDC articles.

### 3.3 Pro Sound Effects (prosoundeffects.com)

The root site was not fetched.

- CORE 5 was developed with Oscar winners Mark Mangini (*Dune*) and Richard King (*Oppenheimer*).
- Education tiers (via Carahsoft): Standard $599, Pro $1,199, Pro Plus $2,799, Complete $3,999 per year for up to 25 students.
- Premium comes through **named-master provenance**.

Sources: Carahsoft PSE page; Sonniss PSE vendor page.

### 3.4 Soundly (getsoundly.com)

- A desktop app, not a web store.
- Free, 24hr Pass, Pro Monthly, and Multi-user (priced by storage).
- **UI (2018 review):**
  - Waveform with a range selector, so the preview plays only the selection.
  - A speed slider above the waveform.
  - Drag-to-timeline into Premiere; Pro Tools hot keys "S" (spot to timeline) and "B" (spot to bin).
  - Right-click reverse and normalise.
  - "Dock Mode" shrinks the app to a strip.
- The reviewer criticised the website for "Too much scrolling".
- **Relevance:** the best evidence of what pros expect from *tool-grade* audio interaction: range, hot keys, drag-out.

Sources: getsoundly.com FAQ; ProVideo Coalition (2018).

---

## 4. Cross-site synthesis

### 4.1 Who actually feels premium, and why (based on this evidence)

| Rank | Site | Premium driver (observed) | Undercut by |
|---|---|---|---|
| 1 | **Spitfire Audio** | Provenance: halls, mics, players, named composers. Demos credited like a concert programme. ustwo-designed instrument UI. Editorial "Behind the Score". | Perpetual sale banners, Shopify boilerplate, Splice dependency |
| 2 | **Musicbed** | Curation scarcity ("<1%"), artists treated as a label roster, human Song Search and clearance, Musicbed Awards | "Create free account" spam, cancellation complaints, opaque pricing |
| 3 | **Epidemic Sound** (visual system only) | Editorial serif with italic emphasis, 0-radius, no shadows, colour discipline, BPM-locked sonic logo | Creator and YouTube volume voice, playful colour blocks, AI credit metering |
| 4 | **Splice** (visual system only) | Dark restraint, wide non-bold grotesk, atmospheric photos | Filenames as titles, credits, discounts |
| 5 | **Marmoset** | Narrative search vocabulary (arc, energy), purpose and B-Corp | Dated landing pages |
| – | **Output** | Cannot verify from text sources; the rebrand claims "visual and philosophical" | – |

The hypothesis to verify was "Musicbed, Spitfire, Output". Spitfire and Musicbed are **confirmed** on substance: provenance and curation. Output is **unverified**, because its pages are client-rendered and no design teardown was found. A manual visual check of output.com is recommended.

### 4.2 Patterns shared by the most premium-feeling sites

1. **Provenance as copy.** Spitfire names the hall (AIR Lyndhurst, Maida Vale), the mic signals and the players. PSE names Oscar-winning sound editors. BOOM lists trailers.
2. **Credited demos.** "Now playing: <piece> – <composer>", rather than "Demo 1".
3. **Curation stated as a number.** Musicbed's "less than 1%" turns a big catalogue into an exclusive one.
4. **Artist as person.** Bio, photo, country, related artists (Musicbed). Soundstripe's "100% Human-Made Music" fingerprint badge.
5. **Human service layer above the software.** Musicbed Song Search ("within one business day"), Rights & Clearances, Marmoset supervision.
6. **Rituals.** Musicbed Awards (monthly), weekly Staff Picks and living playlists, Spitfire composer resources and the free ThinkSpace course, Musicbed Challenges.
7. **Typographic restraint (Epidemic, Splice).** One display face, one weight, italic as emphasis, no shadows, colour as rare punctuation.
8. **Waveform as an input, not decoration.** Epidemic's drag-across-waveform similarity search, Musicbed's Search by Segment and Quick Preview, Soundly's range selection.
9. **Player persistence.** Artlist's bottom player (since 2016), Musicbed's expandable player, Soundstripe's slide-over. The music never stops while you browse.

### 4.3 Common mistakes, the "cheap" signals

- **Fake urgency on the most prominent pixels:** Spitfire's "introductory offer ends soon" banner sits sitewide, and BOOM shows "-40%" badges on $13k bundles.
- **CTA repetition** ("Create free account" or "See Pricing" five or more times) and promo bars ("50% off").
- **Raw technical artefacts in the UI:**
  - Splice uses `.wav` filenames as page titles.
  - Audio Network shows an unrendered `[[production-count]]` token.
  - Musicbed's play icon is labelled "Play Button Created with Sketch".
- **Breadth-as-value:** Artlist's "700K assets" and AI model list, Epidemic's "55,000 tracks / 250,000 SFX", BOOM's "Page 1 of 9". Breadth signals commodity.
- **Opaque or punitive pricing:** Musicbed shows no price on song pages and has cancellation complaints. Subscription-only licences expire for new projects (Artlist, Epidemic).
- **Generic e-commerce trust badges** ("GUARANTEED SAFE CHECKOUT", payment logo rows) on sites selling to professionals.
- **SaaS persona mega-menus** (Soundstripe: Agencies / Brands / Universities / Freelancers / Creators) and "How We Compare" pages.

### 4.4 Interaction gaps, plus specific notes on sound in the UI

- **No site was observed using UI sound design** (clicks, hovers, transitions). The only "sonic branding" found is Epidemic's BPM-locked audio ID used in marketing, and Soundstripe's hero player. **[Caveat: text extraction cannot detect UI sounds. Treat this as "not documented", not "absent".]**
- Hover-to-play and preview latency were **not documented** for any site.
- Waveform styling (bars vs line, colour, played or unplayed state) was **not documented** for any site. Musicbed only added row waveforms on mobile in October 2025.

---

## 5. Gaps a luxury-positioned CZABA could own

1. **The Studio as a ritual, not a tool.** Every editing feature on the market is framed around **speed and AI automation**:
   - Epidemic Adapt is credit-metered AI. Epidemic Studio gives an "instant soundtrack draft".
   - Soundstripe and Musicbed offer stems and alts only as downloads.

   **No competitor offers a hands-on, in-browser human mixdown the buyer performs before download.** CZABA can frame the Personal Mixdown Studio as *the buyer's own signature on the piece*: the couture fitting, not the vending machine. This also answers Epidemic's own data point that stem control was the most requested creator feature.
2. **Provenance at the track level for music libraries.** Spitfire does this for instruments: halls, mics, players. No music library does it per track. CZABA could show per cue:
   - where it was recorded and on what instruments
   - who played it
   - which session it came from
   - which stems exist and why
3. **Visible, stated scarcity.** Musicbed claims curation scarcity but sells 70k songs. CZABA can be genuinely small: numbered collections, limited seasonal "drops", a capped number of licences per cue for exclusivity tiers. Output's merch "Drops" shows the vocabulary exists in this space. Nobody applies it to the music itself.
4. **Dream-selling hero.** Every observed hero is functional ("License music…", "All you need…", "Real music. Real coverage.", product-plus-price). **None sells the scene or the feeling.** A cinematic hero where the music *is* the first interaction, sound-on by invitation, is unclaimed.
5. **Sound-designed interface.** No documented competitor uses considered UI sound (soft room tone on entry, tactile ticks on faders, a signature transition). For a cinematic audio brand this is the most direct form of "pixel craftsmanship", extended to the ears.
6. **Transparent, humane pricing as luxury.** The market's weak spots are opaque per-use quotes (Musicbed), expiring subscription licences (Artlist, Epidemic), and fake sale banners. A clear, fixed, perpetual, no-discount price displayed with confidence signals quiet luxury and builds financial and psychological value.
7. **Editorial heritage.** Spitfire's "Behind the Score" and Musicbed's Awards show that editorial content and community rituals build attachment. CZABA can tell the story of each piece in a liner-notes format, a register Epidemic's visual system already evokes ("boutique liner notes") but never fills with real stories.
8. **Craft hygiene as differentiation.** CZABA should not ship:
   - filenames as titles
   - unrendered tokens
   - "Created with Sketch" labels
   - repeated CTAs
   - discount badges
   - generic safe-checkout badges

   Competitors at $300M+ ARR do ship these.

---

## 6. Sources (URLs actually opened)

**Musicbed**
- https://musicbed.com/
- https://www.musicbed.com/songs/cha-ching/44517
- https://www.musicbed.com/artists/sleepover/44162
- https://musicbed.com/blog/?p=2550
- https://www.musicbed.com/blog/at-musicbed/announcing-new-pricing-plans/
- https://www.musicbed.com/articles/?p=8040
- https://www.musicbed.com/articles/?p=8968
- https://wpengine.fm.co/musicbed/resources/find-the-right-song-faster-with-musicbed-search-tools/
- https://nofilmschool.com/2016/01/musicbed-introduces-new-features-change-way-you-license-music
- https://dk.trustpilot.com/review/musicbed.com
- https://dribbble.com/FM_Designs
- https://www.parse.gl/brands/musicbed-com

**Artlist**
- https://artlist.io/
- https://artlist.io/fr/enterprise
- https://artlist.io/studio
- https://artlist.io/blog/a-fresh-new-look-for-art-list-double-the-speed-lots-of-great-new-music/
- https://wyzowl.com/artlist-review/
- https://shotkit.com/artlist-review/
- https://www.diyphotography.net/?p=260186 (metadata only)

**Epidemic Sound**
- https://styles.refero.design/style/d1f5ece3-ec6c-467d-8a59-51ee259cc023
- https://www.epidemicsound.com/music/
- https://www.epidemicsound.com/pricing/
- https://www.epidemicsound.com/tools/adapt/
- https://www.epidemicsound.com/referral/c6xn4n
- https://www.epidemicsound.com/blog/how-to-find-music-for-videos-content-tips-tricks-features-for-using-the-epidemic-sound-library/
- https://epidemicsound.com/blog/epidemic-sound-new-identity
- https://www.lbbonline.com/news/global-soundtracking-platform-epidemic-sound-unveils-new-brand
- https://lovethework.com/work-awards/entries/718172
- https://corporate.epidemicsound.com/press-and-media/press-releases/2025/epidemic-sound-expands-adapt-functionality-to-give-creators-and-brands-more-creative-control/
- https://corporate.epidemicsound.com/press-and-media/press-releases/2025/epidemic-sound-integrates-ai-powered-studio-within-adobe-premiere-pro-plugin/
- https://www.musicgateway.com/blog/music-licensing/epidemic-sound-review

**Soundstripe**
- https://soundstripe.com/?fpr=dci
- https://www.soundstripe.com/library/songs/17030
- https://www.soundstripe.com/blogs/soundstripe-features-overview
- https://www.soundstripe.com/blogs/soundstripe-vs-musicbed
- https://photutorial.com/soundstripe-pricing

**Marmoset**
- https://welcome.marmosetmusic.com/musiclicensing/
- https://welcome.marmosetmusic.com/wedding-video-music-license
- https://noamkroll.com/what-sets-marmoset-apart-from-other-music-libraries-the-search-tool/

**Audio Network, Universal Production Music, Triple Scoop, Songtradr**
- https://au.audionetwork.com/content/who-we-are
- https://blog.audionetwork.com/the-edit/music/what-is-a-waveform
- https://www.audionetwork.com/browse/m/composer/jonathan-harvey_1250 (empty client-rendered shell)
- https://g2.com/products/audio-network/reviews
- https://biggroup.co.uk/work/universal-production-music-website-build
- https://en.wikipedia.org/wiki/Universal_Production_Music
- https://www.provideocoalition.com/triple-scoop-music-membership-plans-music-licensing/
- https://www.hypebot.com/indie-spotlight-songtradr-music-licensing-placement-platform/

**Spitfire Audio**
- https://www.spitfireaudio.com/
- https://www.spitfireaudio.com/products/originals-epic-strings
- https://www.spitfireaudio.com/products/bbc-symphony-orchestra-discover
- https://www.spitfireaudio.com/pages/discover
- https://en.wikipedia.org/wiki/Spitfire_Audio
- https://www.bounty-hunters.co.uk/spitfire-labs-by-villagers-studio/
- https://www.musictech.net/news/spitfire-audio-launch-labs/

**Output**
- https://output.com (metadata only)
- https://output.com/products/arcade (metadata only)
- https://output.com/products/output-one (metadata only)
- https://output.com/blog/studio-one-plugins
- https://urlscan.io/result/4e178456-7cc4-4577-a8db-f344e4ff5df0/content
- https://magneticmag.com/2024/11/outputs-next-chapter-doubling-down-on-creator-empowerment/
- https://woocommerce.com/posts/passion-project-profitable-business-ecommerce/
- https://rekkerd.org/output-moves-to-output-com/

**Native Instruments**
- https://native-instruments.com/en/company/about-us
- https://www.native-instruments.com/zh/products/komplete/effects/vari-comp/
- https://blog.native-instruments.com/native-instruments-brand-news/
- https://www.limely.co.uk/inspiration/project/native-instruments.com

**Splice**
- https://styles.refero.design/style/1f69df96-675d-4ee0-aa85-e085d9d39981
- https://splice.com/
- https://splice.com/sounds/sample/046536d74d766577890f63545eed9ddff76b6d3dbcaf26ce7207a043c46d835f

**BOOM Library, Sonniss, Pro Sound Effects, Soundly**
- https://www.boomlibrary.com/?p=87938
- https://www.boomlibrary.com/?p=3211
- https://sonniss.com/vendors/prosoundeffects/
- https://www.carahsoft.com/pro-sound-effects/solutions
- https://getsoundly.com/faq/what-are-the-differences-between-the-subscriptions/
- https://www.provideocoalition.com/soundly-2-sound-effects-platform/

**Other (checked, low yield)**
- https://www.awwwards.com/awwwards/collections/sound-design/?page=3
- https://basicagency.com/blog/b-d-jams-earns-awwwards-site-of-the-month
- https://styles.refero.design/style/1514a95f-878c-4d4d-bb14-99d1b83f6227 (Spotify, for dark-UI contrast)
