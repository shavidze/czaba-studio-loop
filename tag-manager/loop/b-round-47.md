# B — Round 47 დახურვა / Round 48 დაგეგმვა

თარიღი: 2026-10-28 · decision: **CONTINUE**

## Round 47 შედეგი (მხოლოდ C-ის evidence-ით)
- **C PASS**, R47-1…R47-7, `realVerified=true`, bugs 0 (`c-round-47.md`/`.json`).
- Gate: renderer 326/326, main 128/128 (120 + 8), E2E 7/7 (`--retries=0`-ითაც 7/7). Biome: 0 errors, 8 warnings.
- Red/green: 1ea34df-ის `src`-ზე 3 failed ((a1)–(a3)) / 5 passed; A-ს tree 8/8.
- Mutants: M1–M4 და M7 (`instanceof`-ის გარეშე) მოკლულია. M5 (`includes('data chunk')`) named survivor-ია. M6 (read helper-ით) ეკვივალენტურია და მას R47-1-ის diff check იცავს.
- Real app (Playwright `_electron`, xvfb):
  - **R47-4:** ცარიელ WAV-ზე toast ზუსტად `Error invoking remote method 'meta:write': Error: Failed to write metadata: Audio data is empty, cannot tag`. sha256 უცვლელია. 1ea34df contrast: `…WAV file is missing data chunk`;
  - **R47-5:** batch `1 saved, 1 failed`. `tone.wav` სამივე reader-ში ჩაწერილია. IPC `failed[]` ზუსტია;
  - **R47-6:** ჩვეულებრივი save უცვლელია.
- Root gate: **published `ede35de`**. Review COMMIT OK, 3 low + 1 architecture note.

## Backlog ცვლილებები
- **TM-B05 → done** (`realVerified=true`, closed_round 47). title-ის read-ის ნახევარი **არ** შეცვლილა. ის (a7)-ით არის დაფიქსირებული და **Q22**-ს მიჰყვება. ეს item-ის notes-ში წერია, ჩუმად არ ჩამოშლილა.
- **D-51 → verified.** Deviation 1-ის ფორმულირება A/C ექსპერიმენტით დაზუსტდა: truncated `data` შეტყობინებას მხოლოდ მაშინ იძლევა, როცა header-ს ბაიტი არ მოსდევს.
- **B-R0-03 → closed** (write half D-51; read half → Q22).
- ახალი signal-ები (task-ები არ არის):
  - **RR-R47-01:** ბიბლიოთეკის ზუსტ ტექსტზე დამოკიდებულება; exact version pin `package.json`-ს ეხება (protected);
  - **RR-R47-02:** ერთი შეტყობინება ორ ფორმაზე (record);
  - **RR-R47-03:** read ყლაპავს → Q22;
  - **RR-R47-04:** architecture, `openTagFile(path, mode)` + error code-ები;
  - **A-R47-01 / C-R47-02:** truncated `data` save-ზე გამოცხადებულ ზომამდე იზრდება → **Q26**;
  - **A-R47-02:** `{ cause: err }`;
  - **C-R47-01:** multi-select `Multiple values` ერთნაირად ცარიელ ფაილებზე → UX კითხვა;
  - **C-R47-03:** M5 survivor, M6 equivalent (record).
- `rounds[47]` = published `ede35de`, `rounds[48]` = planned.

## B probe round 48-ისთვის (node-taglib-sharp 6.0.1, ede35de-ის `node_modules`)
სკრიპტები: `b-round-47-exp-artists-probe.cjs.txt`, `b-round-47-exp-artists-mm.mjs.txt`, `b-round-47-exp-iart-probe.cjs.txt`, `b-round-47-exp-artists-clear-probe.cjs.txt`.

**დადასტურებული ფაქტები:**
- `performers = ['A','B']` → `LIST/INFO`: `ISTR 'A'`, `ISTR 'B'`, `IART` არ არის; `id3 ` chunk-ში `TPE1` ×2.
  - ffprobe: `artist: 'A'`, `ISTR: 'B'` (ბოლო). `['A','B','C']` → `artist: 'A'`, `ISTR: 'C'`.
  - music-metadata: `common.artists ['A','B']`.
- `performers = []` (`['A','B']`-ის შემდეგ) → `ISTR`, `IART`, `TPE1` არ რჩება, readback `[]`.
- `ffmpeg -metadata artist=Rec` წერს `IART`-ს. ბიბლიოთეკა კითხულობს `performers []`, `albumArtists ['Rec\0']`.
  - `performers = ['New']` + save → `IART 'Rec'` რჩება, `ISTR 'New'` ემატება; ffprobe `artist: 'Rec'`, `album_artist: 'Rec'`, `ISTR: 'New'`.
- კოდი: `writeTagsToFile` artists-ს მხოლოდ `STANDARD_PROP_MAP.artists.set`-ით (`tag.performers`) წერს; `IART`-ს არ ეხება.

**დასკვნა (inference):** recorder/DAW ფაილებზე, რომლებსაც `IART` აქვთ, Artists ცარიელი ჩანს, ხოლო save-ის შემდეგ სხვა პროგრამები ძველ artist-ს აჩვენებენ → **B-R47-01**, Saba **Q25**.

**კოდის წაკითხვა (გაშვებული არ არის):** SchemaEditor-ის `RESERVED_RIFF_IDS` `IART`-ს რეზერვირებს, `ISTR`-ს არა → **B-R47-02** (signal Q25-თან).

## Round 48: TM-B08 (Saba Q3) — რატომ ეს
- Saba-ს რიგი: Q2 → Q8 → Q4/Q1 → Q5 → **Q3** → Q6. Q5 (TM-B05) დახურულია. critical/high bug ღია არ არის.
- TM-B08-ის `depends_on` TM-T1 done-ია.
- Q3: artists K-4-ში არ შედის, writer არ იცვლება. backlog TM-B08-ს მხოლოდ pin/doc round-ისთვის ტოვებს.
- Scope: ახალი `tests/main/metadata-artists.test.ts` (b1)–(b7) + docs (`recording-tag-contract.md` D-12 სექცია, `WAV_METADATA.md` ერთი ხაზი). **`src/**` frozen.**
- (b6)/(b7) „pinned until Q25“: Saba-ს პასუხამდე დღევანდელ ქცევას აფიქსირებს.
- Red proof არ არის (src არ იცვლება). pin-ების ძალას C-ის mutant-ები M1–M5 ამტკიცებს.
- Reference: exempt (test/docs only, UX/ქცევის ცვლილება არ არის).
- C: ownership (src unchanged), mutants, gate, real app ორი artist + `IART` ფაილი სამი reader-ით.

## Saba-სთვის ახალი კითხვები (არ ბლოკავს)
- **Q25:** სხვა პროგრამის `IART` Tag Manager-ში Artists-ად არ ჩანს, ხოლო save-ის შემდეგ ffprobe-ის `artist` ძველია. Artists `IART`-ზე გადავიყვანოთ (read + write), თუ დავტოვოთ? (B-R47-01; B-R6-01 და B-R47-02 იმავე ჯგუფშია.) ცვლილება reference-first round იქნება.
- **Q26:** truncated `data`-იანი WAV save-ზე გამოცხადებულ ზომამდე იზრდება. ავკრძალოთ D-51-ის მსგავსად, თუ დავტოვოთ?
- **C-R47-01 (UX):** `Multiple values` ერთნაირად ცარიელ ფაილებზე — Q9–Q24-ის ჯგუფში.

## Remaining
TM-B08 (round 48) → TM-B06 (Q6) → TM-T2-DATA / TM-T2 (Q7, Saba-ს ელოდება).
