## 5. Browser smoke

Standalone Playwright (installed chromium, fresh context, no gstack daemon), script `a-round-71/smoke.cjs`, output `smoke-1440.txt` and `smoke-1440.png`. It ran after the verify attempts, with nothing in parallel. **This is not a PASS claim.**
- Attempts 1–2 (`smoke-1440-attempt1.txt`): the empty demo has nothing to play. The status was `დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.` This is expected; the spec's smoke steps do not add a clip. Attempt 3 crashed on a NaN drag coordinate (a regex-escaping bug in my script); I fixed it.
- Attempt 4: `/studio-lab` returned 200 at 1440×900. I waited for the tempo input plus 4 s, then:
  - **REAL-mouse (PW)** drop of Soft impact on SFX at 20.00 s (pps 40, clip start 20.000 = F-SILENT);
  - click on the BPM field, type `40`, Enter;
  - click on the metronome → `aria-pressed=true`;
  - blur, then Space → status `მეტრონომი ჩართულია — 40 BPM …`.
- 50 meter samples over ~5.9 s (position 00:00.222 → 00:06.102) peaked at −8.9, −12.5, −12.5, −12.8 and −6.6 dB, decaying in between. That is **5 rises ~1.5 s apart; the last (−6.6 dB) is the 6.0 s accent**, so the master meter moves.
- **Instrumentation (PW)**, a `createBufferSource` wrapper: 4 calls by +0.5 s (the Soft impact clip, clicks 0 and 1.5, and the first refill at 3.0) and 8 by +5 s. This fits a 2 s horizon plus refills. The old code would have created every click up to the project end at Play.
- Forbidden requests 0; Authorization headers 0; hydration console lines 0. The only console errors are the known root `/api/cart` CORS preflight.

