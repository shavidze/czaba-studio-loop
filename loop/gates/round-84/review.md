COMMIT: OK (blocking issue არ არის; auth/purchase/download კოდს diff არ ეხება)

## Code Review: round-84 — SRW-19 ვიდეოს opacity fade + X1 envelope alignment

Verify ჩაბარდა: tsc სუფთაა, 121/121 test file მწვანეა, build-მა გაიარა. Lint-ის 218 warning ძველია; არცერთი შეხებულ ფაილებში არ არის. C-მ ბრაუზერში ჩააბარა VF-* / X1-ALIGN / REG-HYD. ეს diff-ის review-ა; მოდულები სრულად არ შემიმოწმებია.

### Critical Issues
- none

### Suggestions (რანჟირებული)
1. **Medium: ვიდეოს fade-ის edit დაკვრისას აუდიოს თავიდან უშვებს.** ამას ტესტები ვერ იჭერს. `app/contexts/ArrangementContext.tsx:471-474`-ის `scheduleKey` მთელ `clips`-ს serialize-ს უკეთებს, ვიდეოკლიპის `fadeIn`/`fadeOut`-ის ჩათვლით. ამიტომ მხოლოდ სურათის edit audio source-ებს ხელახლა ქმნის: C-მ თითო edit-ზე 12→16 `createBufferSource` გაზომა. ეს რეალურ ბრაუზერში შეიძლება click/dropout-ად გაისმას. Position უკან არ წასულა, ამიტომ commit-ს არ ვბლოკავ. ცვლილება ამ რაუნდის ownership-ის გარეთაა.
   **Fix:** replacer-ში `fadeIn`/`fadeOut` გამოტოვე ვიდეოხაზის კლიპებზე. ან key ააგე fade-ების გარეშე და მას დაუმატე `clipFadeShapes(arrangement)`.
   **ვის:** planner-ს, SRW19-RESCHEDULE-ის სახით. ტესტი: „ვიდეოს fade-ის edit დაკვრისას 0 ახალ source-ს ქმნის“.
2. **Low: Env რეჟიმი ვიდეოს fade სახელურებსაც მალავს** (`ArrangementClip.tsx:769`). ვიდეოკლიპს envelope არ აქვს (`:883`), ამიტომ Env რეჟიმში მომხმარებელი ვიდეოს fade-ს ვერ შეცვლის.
   **Fix:** `!(envelopeMode && !isVideo)`. ეს V5-ის შეგნებული გადაწყვეტილებაა და C-მაც დაადასტურა, ამიტომ არჩევანი product-ზეა.
3. **Low: border-ის სიგანე ორ ადგილასაა და DOM-თან არის მიბმული.**
   - `ArrangementClipEnvelope.tsx:21` (`CLIP_ENVELOPE_ROOT_BORDER_PX`) და `ArrangementClip.tsx`-ის `CLIP_BORDER_PX` ერთსა და იმავეს აღწერს. ორივე root-ის `border` კლასზეა (`:803`) დამოკიდებული. თუ border `border-2` გახდება, X1 ჩუმად აირევა.
   - `closest('[data-clip-id]')` (`:139`) envelope-ს მშობლის DOM-ის attribute-ზე აბამს.
   **Fix:** ერთი exported constant, ან `rootOffsetPx` prop `ArrangementClip`-იდან.
4. **Low: envelope-ის SVG `left:-1px`-ზე იწყება** (`ArrangementClipEnvelope.tsx:162`). root-ის `overflow-hidden` content-ს padding box-ზე ჭრის, ამიტომ ხაზის პირველი და ბოლო 1 px border-ის ქვეშ არ ჩანს. ზიანი არ აქვს, უბრალოდ ცოდნისთვის. fade ramp ისევ body-ის კოორდინატებშია (`:856`) და 1–2 px-ით სცდება. doc ამას Lows batch-ში აღიარებს.
5. **Low a11y: Export-ის შენიშვნა გამორთულ ვიდეოს ვარიანტთან დაკავშირებული არ არის** (`ArrangementExportDialog.tsx:218-222`).
   **Fix:** `<p>`-ს `id` მიეცი და ვიდეოს checkbox-ზე `aria-describedby` დაამატე. ვიდეოს fade სახელურებიც მხოლოდ pointer-ით მუშაობს, ისევე როგორც ადრე აუდიოსი. ეს ძველი pattern-ია.
6. **Low: `video-fades.ts:5-50` `fades.ts:21-82`-ის თითქმის ზუსტი ასლია.** parity ტესტი (VF1) drift-ს იჭერს, მაგრამ ერთი ცვლილება ორ ადგილას უნდა გაკეთდეს. იხ. Architecture note.

### Good Practices Found
- **Overlay-ის ციკლი** (`ArrangementVideoDock.tsx:237-273`):
  - ყოველ frame-ზე DOM-ში წერს React render-ის გარეშე და დუბლიკატ მნიშვნელობას არ წერს.
  - listener-ს `useArrangementPositionWriter`-ის cleanup ხსნის; timer არ არის, ამიტომ leak არ ჩანს.
  - layout effect-ი გაჩერებულ მდგომარეობაში edit-ს ფარავს.
  - SSR-ზე initial მნიშვნელობა ემთხვევა, REG-HYD სუფთაა.
- **Z-order სწორია.** აქტიურ ვიდეოს `z-10` აქვს (`:368`, `:938`), overlay-ს იგივე `z-10`, მაგრამ DOM-ში უფრო გვიანაა, ამიტომ ზემოთ ხვდება. gap-ის წარწერა (`z-20`) და ღილაკები (`z-30`) overlay-ზე მაღლა რჩება. `applyRoles`-ის swap-ს არ ეხება.
- **Pointer-ის თანმიმდევრობა უცვლელია.** fade სახელურს `stopPropagation` აქვს, ამიტომ range gesture არ იწყება. 500 ms double-click guard და `pointercancel`-ის revert ვიდეოზეც იგივე გზით მუშაობს.
- **ხმა და export.** `clipFadeShapes` ისევ მხოლოდ აუდიოა, ამიტომ ვიდეოს ხმა და WAV უცვლელია.
- **Tokens და TS.** მხოლოდ token-ებია გამოყენებული (`bg-background`, `text-accent`, `text-muted`), hex არსად არის. `any`, assertion და `@ts-ignore` არ არის. inline style მხოლოდ დინამიკური მნიშვნელობებისთვისაა.

### Architecture note
- **სიგნალი 2 (coupling):** `ArrangementClipEnvelope.tsx:139,152,162` ახლა `ArrangementClip`-ის root-ის DOM-ზეა დამოკიდებული: `[data-clip-id]` და 1 px border. ვტოვებ, რადგან ღირებულება დაბალია და AL1 ტესტი alignment-ს იჭერს.
  **Proposal:** ერთი shared `CLIP_ROOT_BORDER_PX`. ownership: ArrangementClip + Envelope. მიღება: AL1 და EU5/EU7 მწვანე რჩება.
- **სიგნალი 4 (ახალი lifecycle):** overlay-ის subscriber `ArrangementVideoDock.tsx:237`-შია. ვტოვებ, რადგან ცალკე component-ია, slot-ების sync/swap კოდს არ ეხება და ერთ position lifecycle-ს მიჰყვება.
- **დუბლირება:** `video-fades.ts` ↔ `fades.ts`.
  **Proposal planner-ისთვის:** `fades.ts`-ში შიდა `setFadeForTrackKind(kind)`, რომელსაც `setClipFade` და `setVideoClipFade` გამოიძახებს, საჯარო API-ის შეუცვლელად. მიღება: FD1/FD6 და VF1 parity მწვანე რჩება. ეს მხოლოდ წინადადებაა, მიმდინარე რაუნდის დავალება არ არის.

### Alternative Approach (Studio pipeline)
- **Current:** fade = ცალკე `bg-background` overlay. მას audio position store-იდან per-frame writer მართავს.
- **Alternative:** inline `opacity` ან CSS `filter: brightness()` პირდაპირ აქტიურ `<video>` slot-ზე.
- **Verdict:** მიმდინარე მიდგომა უკეთესია. slot-ის opacity-ს `applyRoles` toggle აკეთებს (`:366`), ამიტომ ეს swap-ს შეეჯახებოდა. overlay docked, floating და expanded ყუთში ერთნაირად მუშაობს. VF-SYNC-მა აჩვენა, რომ audio clock-თან სინქრონი არ ირღვევა. CSS transition sync-ს დაკარგავდა.

### Score: 8.5/10