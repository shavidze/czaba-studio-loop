# კითხვა Saba-სთვის — round 470 → 471 (2026-11-12)

## Q1. ძველი (legacy) Studio-ს შრიფტი `/studio/<handle>`-ზე

**კონტექსტი:** STORE-2c-1 (round 471) Store-ის შრიფტის token-ებს ცვლის: `--font-sans` ხდება Instrument Sans, `--font-serif` ხდება იგივე sans, ხოლო `--font-mono` ხდება IBM Plex Mono. დაცული ფაილები არ იცვლება. ძველი შეძენილი Studio (`studio.$productId.tsx` და `app/components/studio/**`) Studio-ს თემის marker-ს არ იყენებს. ამიტომ ის cascade-ით მიიღებს ახალ შრიფტებს:

- `StemsLoadingAnimation`-ის სათაური serif-ის ნაცვლად sans გახდება;
- 15 `font-mono` ადგილი Plex Mono-თი გამოჩნდება;
- `font-bold` 600 წონით დაიხატება.

**B-ის და product-designer-ის ნაგულისხმევი არჩევანი:** ცვლილება მიღებულია. მთელი საიტი ერთი შრიფტით გამოჩნდება, ძველი route მაინც წასაშლელია (legacy removal policy) და დაცული ფაილი არ იცვლება.

**ალტერნატივა:** ძველი route ვიზუალურადაც გაიყინოს. ამისთვის საჭიროა დაცული ფაილის ცვლილება, რასაც root და Saba აკეთებენ.

**სტატუსი:** `awaiting_user`. პასუხამდე ლუპი ნაგულისხმევ არჩევანს იყენებს. თუ უარყოფ, root-ის მეშვეობით დაცული ფაილისთვის ცალკე დავალება დაიწერება.
