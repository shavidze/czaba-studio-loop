# C — Round 6 ვერიფიკაცია: TM-B10 (D-16) + RR-R2-01

**taskStatus: PASS** · realVerified: **true** · bugs: 1 low (C-R6-01, pre-existing, scope-ის გარეთ)

Evidence: `c-round-6/`. Source-ში არაფერი შემიცვლია. ყველა mutation და "before" build `/tmp`-ში გაეშვა.

## Baseline / R6-7 (frozen/ownership): PASS
- HEAD `a8c1b53`. `git status --porcelain --untracked-files=all` აჩვენებს მხოლოდ ორ path-ს: `M src/main/ipc/metadata.ts` და `?? tests/main/riff-info-nul.test.ts`.
- `git diff --quiet a8c1b53 -- . ':!src/main/ipc/metadata.ts' ':!tests/main/riff-info-nul.test.ts'` → exit 0.
- `metadata.ts` diff (+21/−11) შეიცავს მხოლოდ ამას:
  - `stripRiffNulTerminator` (internal, loop-ით);
  - getter-ები: title/album/comment/copyright/isrc/publisher, artists/genres `.map`;
  - INFO branch `.map(stripRiffNulTerminator)`;
  - `export function getRiffInfoTags` + `return []`.
- write path, IPC handlers, error mapping, year/track/bpm უცვლელია. დამატებულ ხაზებში არ არის `any`, `@ts-*`, `biome-ignore` ან `//`. ორი ძველი catch კომენტარი ადგილზეა.
- Hashes (`r6-7-hashes.txt`):
  - metadata.ts `41f9667c…`;
  - test `a3eeb178…`.
- regex-ის ნაცვლად loop A-ს გადახრაა, რადგან Biome `noControlCharactersInRegex`-ს უარყოფს. ქცევით იდენტურია: M2/M4 ამას ადასტურებს.

## R6-1 (red/green): PASS
- `/tmp/c-r6-red`: rsync + `node_modules` symlink. `a8c1b53:metadata.ts` მხოლოდ export patch-ით, diff 1 ხაზი.
- **Red: 8/8 fail** (`r6-1-red.log`):
  - (a) `'heavy door\u0000'`;
  - (b) `'\u0000\u0000'`;
  - (c) `['Foley\u0000']`;
  - (d) `expected +0 to be 120`;
  - (e) `['MKH416\u0000']`;
  - (f) `ITKN payload is 120: false`;
  - (g) interior `'a\u0000b\u0000'`;
  - (h) `TypeError: File tag is not a CombinedTag`.
- **Green**: რეალურ tree-ზე 8/8 pass (`r6-1-green.log`).

## R6-2 (mutations): PASS
| Mutation | ცვლილება | ჩავარდნილი ტესტები | log |
|---|---|---|---|
| M1 | identity | (a)–(g) fail, (h) pass | `r6-2-m1.log` |
| M2 | `replace(/\u0000$/)`, ერთი NUL | მხოლოდ (b) fail | `r6-2-m2.log` |
| M3 | `throw` აღდგენილია | მხოლოდ (h) fail | `r6-2-m3.log` |
| M4 | `replace(/\u0000/g)` | მხოლოდ (g) fail | `r6-2-m4.log` |

M2 და M4 task-ის regex ფორმით დავწერე, `new RegExp`-ით. ყველა mutation მოკლულია.

## R6-3 (gate): PASS
`rm -rf out test-results playwright-report tests/fixtures/*.wav`, შემდეგ სრული verifyCommand → **exit 0** (`r6-3-verify.log`).
- Biome: 34 ფაილი, 0 error, 9 warning, არცერთი `metadata.ts`-ში. ცალკე stdin-lint ძველ და ახალ `metadata.ts`-ზე: ორივეში 0 lint diagnostic.
- typecheck node/web/test: 0 error.
- Renderer: **107/107**.
- Main: **50/50** (42 + 8).
- Build: OK.
- E2E: 7/7. ცალკე `playwright test --retries=0`: **7/7** (`r6-3-e2e-retries0.log`).

## R6-4 (real app, NUL ფაილები): PASS
Built app, `_electron` + `xvfb-run -a`, `--no-sandbox`, სუფთა `XDG_CONFIG_HOME`, dialog stub. Driver: `drive-r6.mjs`, შედეგი `r6-result.json`.

**გადახრა ბრძანებათა რიგიდან:** Schema editor-ის ღილაკი (gear, "Customize Fields") მხოლოდ მაშინ ჩანს, როცა ფაილი არჩეულია. ამიტომ folder-ის გახსნამდე ველის დამატება UI-დან შეუძლებელია. რიგი ასეთი იყო:
1. Open Folder;
2. nul-comment.wav-ის არჩევა;
3. Customize Fields → Take / Number / ITKN → Add Field → Done (`handleSchemaChanged` თავიდან კითხულობს ყველა ფაილს);
4. Rescan.

`schema.json` (`xdg/Electron/schema.json`) შეიცავს `{"key":"take","type":"number","riffChunkId":"ITKN"}`-ს, ანუ ID არ შეცვლილა.

- **nul-comment / nul-title:** Tagged არ ჩანს (`r6-r6-4-nul-untagged.png`).
  - Comment/Title input = `""` (codes `[]`).
  - ffprobe: `comment:""` / `title:""`.
  - raw: `ICMT` = `00`, `INAM` = `0000`.
- **comment-only:** Comment `input.value` = `"მძიმე კარი"`, char codes `[4315,…,4312]`, 0 არ არის (`r6-r6-4-comment-clean.png`).
- **nul-take, save-მდე:** Take `120`, Category `DOORWood` (code 0 არ არის).
- **nul-take, Title X → Save → Rescan:** Take `120`, Category `DOORWood`, Title `X` (`r6-4-take-saved.png`, Take/Category ჩანს).
  - Raw INFO:

    | sub-chunk | size | payload hex |
    |---|---|---|
    | `ITKN` | 3 | `313230` |
    | `ICAT` | 8 | `444f4f52576f6f64` |
    | `INAM` | 1 | `58` |

    byte 0 არცერთში არ არის.
  - ffprobe: `ITKN=120`, `ICAT=DOORWood`, `title=X`.
  - music-metadata: exif `ITKN 120`, `ICAT DOORWood`, `INAM X`; ID3 `TIT2 X`.
- **Before (a8c1b53 build, `/tmp/c-r6-red`, `npm run build`):** ფაილი, ბიჯები და driver იგივეა (`r6-before-result.json`, `r6-4-before-take-saved.png`).
  - **data loss დადასტურდა.**
  - Take = `""`. Panel `0`-ს `''`-ად ხატავს (MetadataPanel `numVal === 0 ? ''`), ანუ store-ში მნიშვნელობა 0-ია.
  - Category = `"DOORWood\u0000"`.
  - save-ის შემდეგ raw `ITKN` size 1 = `30` ("0"), `ICAT` size 9 = `…6400` (NUL ჩაიწერა data-ში). ffprobe `ITKN=0`.
  - იმავე build-ზე nul-comment და nul-title **Tagged**-ია (C-R5-01 რეპროდუცირდება), Comment = `"\u0000"`.
  - TM-B10-ის medium შეფასება სწორია.

## R6-5 (ffmpeg ფაილის save): PASS
comment-only, Title Y → Save → Rescan (`r6-r6-5-comment-only-saved.png`):

| sub-chunk | save-მდე | save-ის შემდეგ |
|---|---|---|
| `ICMT` | size 29, ბოლოს `00` | size **28**, byte 0 არ არის |
| `ISFT` | 14 byte, `Lavf60.16.100\0` | byte-identical |

- ffprobe `comment` = `მძიმე კარი`, `title=Y`.
- Panel Comment = `მძიმე კარი`; Tagged ✓.
- `a8c1b53` build-ზე იგივე save ICMT-ს **29**-ად ტოვებს (NUL ჩაწერილია), ISFT კი იქაც რჩება. ISFT-ის დაკარგვა არ ხდება.

## R6-6 (regression): PASS
- **(i) cat-new, Category DOORWood → Save:**
  - raw `ICAT` size 8 `444f4f52576f6f64`, NUL არ არის;
  - ffprobe `ICAT=DOORWood`, music-metadata exif `ICAT DOORWood`;
  - rescan-ის შემდეგ Tagged ✓ (`r6-r6-6-cat-new-tagged.png`).
- **(ii) cat-clear, `x` → Save → clear → Save → Rescan:**
  - პირველი save-ის შემდეგ `ICAT` size 1 `78`;
  - მეორის შემდეგ `ICAT` **size 0**;
  - Tagged არ ჩანს, panel Category `""` (`r6-r6-6-cat-clear-untagged.png`).

## Findings
- **C-R6-01 (low, pre-existing, write path, scope-ის გარეთ):**
  - როცა schema-ში custom Number ველია, ყოველი single-file save წერს `ITKN="0"`-ს (size 1) ფაილში, რომელსაც ეს ველი არასოდეს ჰქონია.
  - ffprobe ამას `ITKN=0`-ად აჩვენებს comment-only და cat-new ფაილებზე.
  - `a8c1b53` build-ზეც იგივე ხდება. D-10 მხოლოდ ცარიელ text ველებს ფარავს. ეს backend contract-ისთვის საინტერესოა: import tool `ITKN=0`-ს მნიშვნელობად წაიკითხავს. B-მ უნდა გადაწყვიტოს, ეს D-10-ის გაფართოებაა თუ ახალი item.
- **დაკვირვება (არა Tag Manager-ის bug):**
  - `music-metadata` RIFF INFO-ს UTF-8 ქართულ ტექსტს mojibake-ად კითხულობს (`'a\x03\x1ba…'`). ასე ხდება ffmpeg-ის ორიგინალ ფაილზეც, save-მდე.
  - ffprobe და ID3 `COMM` სწორ ტექსტს აჩვენებს. ICMT-ის ბაიტები სწორი UTF-8-ია (hex ზემოთ).
  - ეს დამოუკიდებელი reader-ის შეზღუდვაა. `ICMT`-ის შედარება ამიტომ hex-ითა და ffprobe-ით გავაკეთე.

## Acceptance
R6-1 ✓ · R6-2 ✓ · R6-3 ✓ · R6-4 ✓ · R6-5 ✓ · R6-6 ✓ · R6-7 ✓
