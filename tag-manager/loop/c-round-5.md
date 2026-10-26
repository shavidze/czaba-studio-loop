# C — Round 5 ვერიფიკაცია: TM-B09 (D-15) + RR-R2-02

**Verdict: PASS** (R5-1…R5-7). realVerified=true: რეალური Electron app გაეშვა `xvfb-run`-ით, ffprobe და music-metadata დამოუკიდებლად შემოწმდა. ერთი ახალი low finding არის (C-R5-01), რომელიც ამ round-ის acceptance-ის გარეთაა.

Baseline: HEAD `7879ee0`. tree-ში შეცვლილია მხოლოდ 4 owned path. `git status`-მა phase-ის დასაწყისშიც და ბოლოსაც იგივე 4 path აჩვენა. phase-ის დასაწყისში წაკითხული FileList.tsx diff და lib შიგთავსი ბოლო მდგომარეობას ემთხვევა. root-ისთვის შესადარებელი ბოლო hash: `git diff 7879ee0 | sha256sum` = `6e17490f9ce992e9a5acda5b380c2af97a248a5b9210045b0941ba559dab67a0`. ეს hash მხოლოდ tracked ფაილებს ფარავს. 4 owned ფაილის `cat | sha256sum` = `720303b2…`. საწყისი hash არ ამიღია.

## R5-1 red/green: PASS
- `/tmp/c-r5-red`-ში აღვადგინე ძველი `FileList.tsx` (`git show 7879ee0:…`), ახალი lib და tests დავტოვე → **4 failed / 2 passed** (`c-round-5/r5-1-red.log`).
  - (a)(b)(c) ჩავარდა, რადგან `Tagged` ვერ მოიძებნა.
  - (d) ჩავარდა მხოლოდ საკონტროლო category-only row-ზე (იგივე error). blank row-ის assertion გავიდა.
  - (e)(f) გავიდა.
- იგივე შედეგია A-ს `red-before-fix.log`-შიც.
- რეალურ tree-ზე ორივე ახალი ფაილი → **28/28** (`r5-1-green.log`).

## R5-2 mutations: PASS
- **M1:** `formatFirstFieldValue` string → `value[0] ?? ''` → 2 fail: unit "whole string" + (f) (`r5-2-m1.diff/.log`).
- **M2** ("any defined string non-empty"): string → `true`, array → `some(typeof item === 'string')` → 10 fail, მათ შორის (d), `""`, whitespace, `[""]`, `["", " "]`, all-defaults (`r5-2-m2.*`).
- **M2b** (მხოლოდ `trim` მოშორებულია) → 4 fail: (d), whitespace, `["", " "]`, all-defaults (`r5-2-m2b.*`). `[""]` M2b-ით არ ვარდება, რადგან `""` trim-ის გარეშეც ცარიელია. ეს A-ს ახსნას ემთხვევა და M2-ში ვარდება.

## R5-3 gate: PASS
- სუფთა მდგომარეობა (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) + verifyCommand → **EXIT=0** (`r5-3-verify.log`).
- Biome: 0 errors, 9 warnings. owned ფაილებში ახალი warning არ არის: ჩემი გაზომვით ძველ FileList.tsx-ზე (`/tmp/c-r5-red`) იგივე 2 rule ჩანს `:84` და `:116`-ზე, ახალზე `:75` და `:107`-ზე, ანუ წანაცვლება 9 ხაზია. lib-ს warning არ აქვს (`r5-3-biome-old-filelist.log`, `r5-3-biome-new-owned.log`).
- tsc node/web/test: 0 errors.
- Renderer: **107/107** (79+28). Main: **42/42**. E2E: **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → 7 passed, EXIT=0 (`r5-3-e2e-retries0.log`).

## R5-4…R5-6: real app (`drive-r5b.mjs`, `r5-result.json`, `r5-4-6-drive.log`)
გაშვების პირობები: built `out/main/index.js`, `--no-sandbox`, სუფთა `XDG_CONFIG_HOME`, dialog stub → temp folder, viewport 1400×900. ერთ folder-შია 6 ფაილი.

### R5-4: PASS
**comment-only.wav** (`ffmpeg -metadata comment='მძიმე კარი' -c copy`):
- ffprobe: `{"comment":"მძიმე კარი","encoder":"Lavf60.16.100"}`, title/artist არ არის.
- raw INFO: `ICMT`(29 B) + `ISFT`.
- music-metadata ხედავს `ICMT` და `ISFT`, title/artist არ არის. შენიშვნა: music-metadata ქართულ ICMT-ს mojibake-ით decode-ავს (`a\u0003\u001b…`). ეს reader-ის encoding შეზღუდვაა, ffprobe/raw bytes სწორია.
- row → `Tagged` (`r5-4-comment-only-tagged.png`). row-ზე click-მა metadata panel გახსნა (Comment ველი ჩანს).
- ძველ `7879ee0` build-ზე (`/tmp/c-r5-red`, `npm run build`) იგივე folder → არცერთ row-ზე badge (`r5-before-0-open.png`, `r5-before-result.json`).

**contract.wav** (UI-ით მხოლოდ Category `DOORWood`, Save):
- ffprobe `{"IKEY":"","ICAT":"DOORWood"}`. music-metadata exif იგივეს აჩვენებს. raw INFO: `IKEY` size 0, `ICAT` size 8.
- title/artist არ არის.
- Rescan-ის შემდეგ `Tagged` (`r5-4-contract-tagged.png`). panel-ში category = `DOORWood`.

### R5-5: PASS
- **blank.wav:** Category `x` → Save:
  - ffprobe `ICAT:"x"`;
  - Rescan → `Tagged` (`r5-5-x-tagged.png`).
- Category გავასუფთავე: Save enabled=true. Save:
  - ffprobe `{"IKEY":"","ICAT":""}`, raw INFO `ICAT` size 0. ეს D-10-ის მოსალოდნელი ქცევაა;
  - music-metadata იგივეს აჩვენებს;
  - Rescan → **badge არ ჩანს** (`r5-5-blank-untagged.png`).

### R5-6: PASS
- **title-only.wav:** Title `X`.
  - ffprobe `title:"X"`, music-metadata `common.title="X"`.
  - row-ზე `Tagged` (`r5-6-title-only-tagged.png`).
- **two-artists.wav:** Artists `A`,`B` (TagsInput, Enter):
  - Artist სვეტში ჩანს **`A`** (`r5-6-two-artists.png`);
  - ffprobe `artist:"A", ISTR:"B"` (ძველი TM-B08);
  - music-metadata `artists:["A","B"]`.
- Artist sort header-ზე click → row-ები render-დება, two-artists ბოლოშია (`r5-6-artist-sort.png`).
- untouched.wav ბოლომდე untagged დარჩა.

## R5-7 frozen/ownership: PASS
- `git status`: ზუსტად 4 path.
- `git diff --quiet 7879ee0 -- . ':!…4 owned'` → 0.
- FileList.tsx diff შეიცავს მხოლოდ:
  - import-ს;
  - ლოკალური ფუნქციის წაშლას;
  - გამოუყენებელი `FieldValue`-ს import-იდან ამოღებას;
  - `hasTags = hasAnyTagValue(meta)`-ს.
- lib-ში და დამატებულ ხაზებში არ არის `any`, `@ts-*`, `biome-ignore` ან comments.
- `formatFirstFieldValue` უცვლელადაა გადატანილი.

## Finding
### C-R5-01 (low, scope-ის გარეთ): NUL-only INFO მნიშვნელობა `Tagged`-ს აჩენს
Repro (`probe-nul.mjs`, `r5-x-nul.log`, `r5-x-nul-comment.png`). ფაილები შეიქმნა `sample.wav`-ის ბოლოს LIST/INFO-ს დამატებით:

```python
mk('nul-comment.wav', [(b'ICMT', b'\0'), (b'ISFT', b'Recorder 1.0\0')])
mk('nul-title.wav',   [(b'INAM', b'\0\0')])
```

- ffprobe აჩვენებს `comment:""` / `title:""`.
- app-ში ორივე row → **Tagged**.
- მიზეზი: `meta:read` NUL terminator-ს ინარჩუნებს. ამიტომ ffmpeg-ის ICMT Comment ველში ჩანს როგორც `"მძიმე კარი\u0000"` (`r5-result.json` → `commentOnlyPanel`). `trim()` `\u0000`-ს არ შლის.
- D-15-ის ტექსტი NUL-ს არ ახსენებს, ამიტომ ეს A-ს FAIL არ არის.
- გამოსწორება ორი გზით შეიძლება: reader-ში (`metadata.ts`-ში trailing NUL-ის მოშორება, ამ round-ში frozen) ან `hasAnyTagValue`-ში. ეს B-მ გადაწყვიტოს.
- რისკი: recorder-ები ხშირად წერენ NUL-terminated ცარიელ INFO ველებს.

### C-R5-02 (low, pre-existing, frozen `metadata.ts`): `meta:read` ინარჩუნებს RIFF INFO NUL terminator-ს
- ეს ჩანს primary R5-4 სცენარში: ffmpeg-ით ჩაწერილი `comment-only.wav`-ის Comment input-ის value არის `"მძიმე კარი\u0000"`, ffprobe კი აჩვენებს `"მძიმე კარი"`-ს.
- ეხება ffmpeg-ით ან recorder-ით ჩაწერილ ნებისმიერ INFO ველს.
- შემდეგმა save-მა, სავარაუდოდ, NUL data-დ ჩაწეროს. ეს ჯერ არ შემიმოწმებია.
- C-R5-01-ის root cause-ია.
- გამოსწორება reader-ში უნდა მოხდეს, `hasAnyTagValue`-ის გადაწყვეტილებისგან დამოუკიდებლად. open-findings სიაში ჯერ არ არის.

## შენიშვნები
- `fill()` TagsInput-ზე tag-ს არ ამატებს, საჭიროა Enter ან `,`. ჩემი პირველი driver ამ მიზეზით გაჩერდა (Save disabled). ეს ჩემი script-ის შეცდომა იყო და app-ის bug არ არის.
- ჩემი `/tmp` copies: `/tmp/c-r5-red`, `/tmp/c-r5-m1`, `/tmp/c-r5-m2`. repo-ში ჩემგან მხოლოდ generated `out/`, fixtures და `test-results` დარჩა.
