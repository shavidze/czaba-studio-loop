# PERF-15: წინასწარ გამოთვლილი peaks — backend-ის handoff

**თარიღი:** 2026-11-08 · **ავტორი:** B (round 409 → 410 დაგეგმვა) · **სტატუსი:** handoff, backend-ის მხარე loop-ის გარეთაა
**წყარო:** `docs/technical/performance/perf-plan.md` (PERF-15 სტრიქონი და §„Verification in the cloud loop“), `performance-optimizer`-ის კონსულტაცია (`tmp/studio-real-loop/b-round-409/consult-performance-optimizer.md`).

## რატომ

Studio waveform-ს ახლა მხოლოდ მას შემდეგ ხატავს, რაც აუდიო ჩამოიტვირთება და decode დასრულდება (peaks-ის worker). ნაყიდი სტემების დიდი ფაილებისთვის ეს წამებია. წინასწარ გამოთვლილი peaks-ით ბიბლიოთეკის preview waveform decode-მდე ჩნდება. როცა 16-bit peaks-ის სიგრძე decoded აუდიოს ემთხვევა, ბრაუზერი peaks-ს თავიდან აღარ ითვლის.

## კლიენტის კონტრაქტი (PERF-15a, round 410)

- `WorkspaceCollection.peaksUrl?: (source) => string | null` — სურვილისამებრ. `null` ან არარსებობა ნიშნავს: ძველი გზა, ცვლილების გარეშე.
- ფორმატი: BBC **audiowaveform JSON**, version 1 ან 2 (`version`, `channels` (v2), `sample_rate`, `samples_per_pixel`, `bits` 8|16, `length`, `data` — min/max წყვილები, არხებად interleaved). წყარო: https://github.com/bbc/audiowaveform/blob/master/doc/DataFormat.md (შემოწმდა 2026-11-08).
- კლიენტი უარყოფს და worker-ით ითვლის, თუ: ფაილი არავალიდურია; `samples_per_pixel > sample_rate / 100`, ანუ ფაილი წამში 100 bucket-ზე უხეშია; `content-length` 4 MB-ზე დიდია; HTTP სტატუსი არ არის ok. 4 MB-ის ზღვარი მხოლოდ დამატებითი დაცვაა (defense in depth): `content-length`-ის გარეშე პასუხი გადის, ხოლო gzip/brotli-ზე header შეკუმშულ ზომას აჩვენებს (TL-R410-SK-1).
- **16-bit** და სიგრძე decoded აუდიოსთან ±1 bucket-ის ფარგლებში: peaks ინახება და worker აღარ ეშვება.
- **8-bit** მხოლოდ placeholder-ია: decode-ის შემდეგ peaks ყოველთვის თავიდან ითვლება, რადგან ჩუმ სტემებზე normalize 8-bit-ის საფეხურებს აჩენს.
- decoded აუდიო ყოველთვის იმარჯვებს: სიგრძის შეუსაბამობისას ან decode-ის შემდეგ მოსული peaks-ისას კლიენტი გამოთვლილ peaks-ს იყენებს.

## რას ვთხოვთ backend-ს

1. **ინსტრუმენტი:** `audiowaveform` (BBC, GPL-3.0) **გარე პროცესად** სერვერზე ან upload pipeline-ში. მისი კოდი Store-ში არ შემოდის. კლიენტის parser დამოუკიდებლად არის დაწერილი, ხოლო `waveform-data.js` და `peaks.js` LGPL-3.0-ია და allowlist-ში არ არის (`docs/technical/performance/oss-adoption.md`).
2. **პარამეტრები:** `-b 16`, `--split-channels`, ხოლო `samples_per_pixel = sample_rate / 100` (48 kHz-ზე 480, 44.1 kHz-ზე 441). ასე ერთი pixel ერთი bucket-ია. ნაგულისხმევად audiowaveform არხებს mono-ში ურევს, ამიტომ `--split-channels` გვჭირდება: კლიენტი თითო არხის მაქსიმუმს იღებს, ისევე როგორც `computePeaks`.
3. **იგივე ფაილი:** peaks დაითვალეთ ზუსტად იმ asset-ზე, რომელსაც Studio decode-ს უკეთებს: იგივე MP3 ან WAV, იგივე ვერსია. MP3-ზე encoder delay და padding დაახლოებით 2257 sample-ია, 48 kHz-ზე ~5 bucket. decode ffmpeg-ით გააკეთეთ, რათა gapless trimming შენარჩუნდეს. სხვაგვარად სიგრძის შემოწმება ჩავარდება და კლიენტი უბრალოდ თავად დაითვლის. სიგრძის შემოწმება **დაძვრას ვერ ხედავს**: თუ audiowaveform-ის MP3 decoder encoder delay-ს სხვაგვარად ჭრის, ვიდრე ბრაუზერის `decodeAudioData`, waveform ~25–35 ms-ით (2–3 bucket) გადაიწევს, შემოწმება კი მაინც გაივლის. ამიტომ peaks დაითვალეთ WAV master-ზე ან ბრაუზერის იდენტური trimming-ით (`tech-lead` TL-R410-SK-5).
4. **API ველი:** product/stem პასუხს დაემატოს `peaksUrl`, ყოველ სტემსა და preview-ზე. ნაყიდი ფაილის `peaksUrl` ზუსტად ისევე უნდა იყოს დაცული, როგორც აუდიო: იგივე ავტორიზაცია, `private` cache, ვადიანი ბმული. საჯარო preview-ს peaks შეიძლება საჯარო იყოს.
5. **ვერსიები:** 16-bit ფაილი, რომელიც სიგრძის შემოწმებას გაივლის, კლიენტისთვის საბოლოოა. იგივე ხანგრძლივობის re-master ძველ peaks-ს აჩვენებს, ამიტომ `peaksUrl` versioned უნდა იყოს (აუდიოს ვერსიასთან ერთად; TL-R410-SK-6).
6. **Headers:** `Content-Type: application/json`, `Content-Length` (კლიენტი 4 MB-ზე დიდს არ კითხულობს), `Cache-Control` აუდიოს წესით. საჯარო versioned key-ზე `immutable`, ნაყიდზე `private, no-cache` + ETag (PERF-4b/4c-ის მიხედვით).
7. **მომავალი (არ არის საჭირო ახლა):** ორობითი `.dat` ფორმატი Int16Array view-ით, JSON parse-ის გარეშე. ეს მხოლოდ მაშინ დაგეგმდება, თუ JSON parse-ის ხარჯი გაზომვით პრობლემად გამოჩნდება.

## რა რჩება loop-ში

- **PERF-15b:** ბრაუზერში დამტკიცება `page.route` stub-ით: waveform ჩანს `loading` მდგომარეობაში, სანამ აუდიოს პასუხი შეჩერებულია. ასევე ნაყიდი adapter-ის `peaksUrl` input. ნაყიდი route-ის mount SRW-21-ს ელოდება (დაცული ფაილები).
- რეალური backend-ის შემოწმება cloud-ში BLOCKED-ია („backend unavailable in cloud“) და არასდროს ითვლება PASS-ად.
