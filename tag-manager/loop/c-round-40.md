# C — Round 40 ანგარიში: TM-B42 (D-46) hover მხოლოდ მოქმედ ღილაკებზე

**სტატუსი: PASS** · realVerified=true · ახალი ბაგი: 1 low (docs), 0 critical/high/medium.
ყველა მტკიცებულება: `c-round-40/`. Source-ს არ შევხებივარ: `git diff 24e9723 | sha256sum` ფაზის დასაწყისში და ბოლოს ერთნაირია (`src-diff-start.sha`).

## R40-1 ownership — PASS
- HEAD `24e9723`. შეცვლილია მხოლოდ 5 owned path, untracked ფაილი არ არის.
- `git diff --quiet 24e9723 -- . ':!<5 owned>'` → 0. tests/, preload, app.css, package*.json, .github, .claude → 0.
- `+`/`-` ხაზები: 42 = 42, დალაგებული set `prototype.diff`-ის ბაიტ-იდენტურია (`cmp` EQUAL; `diff-lines-a.txt` / `diff-lines-prototype.txt`).
- `docs/bugs/001`: მხოლოდ `24c24` და `317c317` (`:35` → `:36`).
- `+` src ხაზებში comment, `any` და `export` არ არის.

## R40-2 CSS — PASS
`out/renderer/assets/*.css` (ჩემი build, gate-იდან):
- `.enabled\:not-aria-disabled\:hover\:{bg-brand-hover,bg-elevated,bg-accent/90,bg-destructive/90}:enabled:not([aria-disabled="true"]):hover`;
- `.enabled\:hover\:{text-foreground,text-destructive,text-destructive/80,border-brand}:enabled:hover`;
- `.hover\:bg-brand-hover` — 0.

## R40-3 რეალური აპი, old vs new (hover) — PASS
- Driver: `c40-probe.mjs` (B-ის probe-ის ასლი + H9/H10/H11 + Deviation-ები). `HARNESS` = `c-round-38/harness.cjs` (read-only). Scan-ის დაყოვნება 16 s: 6 s-ზე Applying H10-მდე სრულდებოდა და editor იხურებოდა (ეს timing-ია, არა ბაგი).
- Build-ები: old = `git archive 24e9723` + `npx electron-vite build` (`/tmp/c40/old`), new = A-ს ხე. `xvfb-run`, `matchMedia('(hover: hover)')` = true. Hover-ის ცდა ≥400 ms. `pageErrors` = [] ორივეზე.
- `new-hover.json` / `old-hover.json`:

| Step | old | new |
|---|---|---|
| H1 clean Save (aria-disabled) | bg 18,217,200 → 29,237,219 | **rest == hover** |
| H2 busy Save | იცვლება | **same** |
| H4 Applying Done | იცვლება | **same** |
| H5 Applying შუა ისარი | color → 238,239,241 | **same** |
| H6 Applying X | color → 239,67,67 | **same** |
| H7 Applying Add Field | bg → 25,29,36 | **same** |
| H8 Rescan (scan-ის დროს) | bg → 25,29,36 | **same** |
| H9 Applying Trash2 | color → oklab(…/0.8) | **same** |
| H10 Applying chip | color + border იცვლება | **same** |
| H11 player disabled | same | same |
| H0, H3, H3b, H6b, H7b, H9-rest, H10-rest, H11 enabled, Back | იცვლება | იცვლება, **old-ის იგივე მნიშვნელობებით** |
| EDGE ისარი (rest, native disabled) | color იცვლება | **same** (დაგეგმილია) |
| Open Folder (secondary `Button`, fieldset-ის გარეთ) | bg 17,19,24 → 25,29,36 | იგივე: 17,19,24 → 25,29,36 (`openfolder-probe.mjs`, `{new,old}-openfolder.json`) |

- rest-ის ყველა მნიშვნელობა (bg, color, border, cursor, effOpacity 0.5/0.6/0.3, aria-disabled, aria-busy, :disabled) old == new. hover-ის სხვაობა მხოლოდ disabled ნაბიჯებზეა.
- სქრინშოტები: `new-H1-clean-save.png`, `new-H4-applying-done.png`, `new-H5-applying-middle-arrow.png` (და ყველა სხვა ნაბიჯი old/new).

## R40-4 keyboard save — PASS
- `new-k2.json`: a.wav → Category `C40Keyb` → `save.focus()` → Enter (write 5 s-ით დაყოვნებულია) → მეორე Enter.
  - write-ის დროს: `Saving...`, `activeElement`, aria-disabled=true, aria-busy=true;
  - შემდეგ: `Save Tags`, focus ისევ ღილაკზეა, aria-busy=false.
- `meta:write` = 1, `meta:write-batch` = 0.
- ffprobe `format_tags.ICAT` = `C40Keyb`; music-metadata `exif ICAT "C40Keyb"` (`k2-ffprobe.json`, `k2-mm.txt`).
- sha256: a.wav შეიცვალა; a2.wav და b.wav იგივეა.

## R40-5 mutants — PASS
`mutants.sh` / `mutants.log`. თითო revert-ზე `/tmp/c40/mut`-ის ასლში: build → probe. ყოველი მუტანტი მოკლულია ზუსტად თავის ნაბიჯზე, სხვა disabled ნაბიჯი არ შეცვლილა:
- m1 primary `not-aria-disabled:` მოხსნილი → H1/H2/H4;
- m2 ghost `enabled:` მოხსნილი → H7/H8;
- m3 ისარი → H5; m4 X → H6; m5 Trash2 → H9; m6 chip → H10.

ასლი ბოლოს აღდგენილია (`diff -r` RESTORED-OK).

Survivors grep-ით დადასტურებულია (`button-usages.txt`):
- `aria-disabled` მხოლოდ ორ primary Button-ზეა (MetadataPanel:373, SchemaEditor:280);
- natively disabled Button მხოლოდ Rescan-ია (ghost);
- secondary მხოლოდ Open Folder-ზეა და არასდროს არის disabled;
- accent/destructive არსად გამოიყენება.

## R40-6 gate — PASS
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) სრული `verifyCommand` → **EXIT=0** (`verify.log`).
- Biome: 0 errors / 8 warnings. ფაილი+წესის სია `c-round-35/biome-new.txt`-ის იდენტურია.
- typecheck node/web/test 0.
- renderer 310/310, main 93/93, E2E 7/7.
- `xvfb-run -a npx playwright test --retries=0` → 7/7, exit 0 (`e2e-retries0.log`).

## R40-7 Reference / Deviations / docs — PASS (1 low docs finding)
- R2 Bootstrap (WebFetch დღეს): "Disabled buttons have `pointer-events: none` applied to, preventing hover and active states from triggering." ✓
- R3 Tailwind: `enabled` ("…only want to apply another style when an element is not disabled", `enabled:hover:border-gray-400`), `aria-disabled` = `&[aria-disabled="true"]`, `not-*` ერთვის სხვა variant-ებს, `hover` = `@media (hover: hover) { &:hover }` ✓
- Dev1: H1/H2/H4 hover-ზე cursor `not-allowed` ✓
- Dev2: H5 ისრის cursor `default` ✓
- Dev3: focused aria-disabled Save Tags (Tab-ის შემდეგ): `:focus-visible` true, box-shadow `rgb(18,217,200) 0 0 0 2px`.
  - სქრინშოტები: `new-DEV3-focus-ring-full.png`, `-crop.png`.
  - ვიზუალურად ring სუსტად ჩანს, რადგან ღილაკის opacity 0.5-ია და ring brand ფერისაა. old-ზეც ასეა (D-45), ამ რაუნდს არ ეხება.
- Dev4: Back ისარი hover-ზე 129,136,152 → 238,239,241, old-ის იგივე ✓
- docs diff (`docs-diff.txt`) კოდს ემთხვევა.
  - D-46 წინადადება component-specs:50-ზეა;
  - 24/317 → `button.tsx:36`; `sed -n 36p` = `'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',`.

### C-R40-01 (low, docs): component-specs-ის "Hidden field chip" ბლოკი ისევ `hover:`-ს წერს
- `docs/design/component-specs.md:376`: `text-dim hover:text-foreground hover:border-brand transition-colors`.
- კოდი (`SchemaEditor.tsx:230`) ახლა `enabled:hover:text-foreground enabled:hover:border-brand`-ია.
- A-მ ეს თავად აღნიშნა (A-R40-01). B-ის frozen diff-ს გარეთაა: R40-1 ზუსტ 42 ხაზს ითხოვდა, ამიტომ A ვერ გაასწორებდა.
- SchemaEditor-ის spec სექცია baseline-ზეც უკვე ძველი იყო: container `mt-3 … border-brand` კოდში არ არის, row `py-1` vs `py-1.5`.
- რეკომენდაცია B-ს: ერთი docs რაუნდი, სადაც მთელ სექციას კოდთან გაასწორებს.

## შენიშვნები B-ს (არა ამ რაუნდის ბაგი)
- **A-R40-02:** D-46-ს decision log-ში (`docs/bugs/001`, D-45-ით მთავრდება) ჩანაწერი არ აქვს, docs კი მას უკვე ასახელებს. B/root უნდა ჩაწეროს.
- k2-ის შემდეგ ffprobe-ში ჩანს ცარიელი `IKEY: ""`, რაც Tag Manager-ის ადრინდელი ქცევაა. ეს დადასტურებული ფაქტია: R40-1-ის `--quiet` შემოწმებით `src/main/**` `24e9723`-ის ბაიტ-იდენტურია, ამიტომ writer ამ რაუნდში ვერ შეიცვლებოდა. ffprobe contract-თვის B-მ შეიძლება გადაამოწმოს, ცარიელი chunk იწერება თუ არა. ამ რაუნდმა writer არ შეცვალა.
- Windows packaging: BLOCKED — Windows packaging is not available in the cloud (ამ რაუნდის ნაწილი არ არის).
