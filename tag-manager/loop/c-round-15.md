# C — Round 15 ვერიფიკაცია: TM-B18 / D-24

**taskStatus: PASS** · realVerified: **true** · bugs: 0
Windows packaging: BLOCKED — Windows packaging is not available in the cloud (ამ რაუნდის ნაწილი არ არის).

ყველა evidence `c-round-15/`-შია. source-ს არ შევხებივარ: `start-hash.txt` = `end-hash.txt` (HEAD `a4ad852` + `git diff a4ad852 | sha256sum`). worktree-ები `/tmp/c-r15-old` და `/tmp/c-r15-mut` წაშლილია, `git worktree list`-ში მხოლოდ მთავარი tree დარჩა.

## R15-1 ownership — PASS
- `git status --porcelain --untracked-files=all`: მხოლოდ 4 owned path (M), untracked ფაილი არ არის.
- `git diff --quiet a4ad852 -- . ':!<4 owned>'` → exit 0.
- `MetadataPanel.tsx`-ში 4 hunk-ია:
  - `import type { BatchWriteResult, WavMetadata }`;
  - module-level helper `buildReloadFailedToast`, რომელსაც Step 2 უშვებს;
  - ორი hunk `handleSave`-ის შიგნით.
- `handleSchemaChanged`, JSX და deps უცვლელია. ახალი `as` cast არ დამატებულა.
- ტესტის diff მხოლოდ ამატებს: `^-` ხაზი 0-ია, (a)–(i) და helper-ები byte-identical-ია. ახალი `describe` ფაილის ბოლოშია.
- `data-flow.md`: +2 პარაგრაფი, მხოლოდ Single File და Batch save სექციებში.
- `STATE_MANAGEMENT.md`: +1 ხაზი `### Save flow` block-ის შიგნით.
- `a-round-15-result.json`: `permission_denials: []`.

## R15-2 red/green — PASS
- ძველი კოდი (`a4ad852` worktree + ახალი ტესტ-ფაილი), `r15-2-red-old.log`: `3 failed | 10 passed (13)`.
  - (j) და (k) ვარდება, Received `"read-batch down"`; (l) ვარდება, Received `"read down"`. სამივე toast-ის ტექსტზე ვარდება.
  - (a)–(i) და (m) გადის.
- A-ს tree, `r15-2-green-new.log`: `13 passed (13)`.

## R15-3 mutations — PASS (6/6 მოკლულია)
სკრიპტი: `scripts/mutate.py`. diff-ები და logs: `r15-3-M*.diff` / `.log`.

| Mutant | ვინ მოკლა | assertion |
|---|---|---|
| M1s: single re-read დაბრუნდა outer `try`-ში | (l) | toast-ის ტექსტი |
| M1b: batch re-read დაბრუნდა outer `try`-ში | (j), (k) | toast-ის ტექსტი |
| M2: batch catch-ში `setEditingMetadata({})` | (j), (k) | `expectEditsKept`: `'' ≠ 'BATCHCat'` |
| M3: batch catch-ში succeeded path-ებზე `updateFileMetadata(path, {})` | (j), (k) | store deep-equal seed: `{} ≠ {…OLDCat}` |
| M4: single catch-ში toast type `'success'` | (l) | `expected 'success' to be 'error'` |
| M5: write reject-ისას `readMetadataBatch` გამოიძახება | (m) | `readMetadataBatch` not called |

## R15-4 gate — PASS
- გავუშვი სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`). სრული `verifyCommand` → **exit 0** (`verify.log`).
- Biome: 0 error და 9 warning. warning-ების სია `a4ad852`-ის სიის იდენტურია (`biome-old.txt` vs `biome-new.txt`, `diff` ცარიელია). ახალი warning არ არის.
- Typecheck: 0 შეცდომა.
- Renderer **120/120** (116 + 4), main **76/76**, E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7**, exit 0 (`e2e-retries0.log`).

## R15-5 real app, rejected re-read — PASS
- გარემო: built app (`out/` A-ს tree-დან, verify-ის build), Playwright `_electron`, `xvfb-run`, viewport 1400×900.
- დრაივერი: `scripts/drive-r15.mjs`. ფაილები: `tests/fixtures/sample.wav`-ის ასლები ცალკე temp folder-ში. სუფთა `XDG_CONFIG_HOME`.
- toast-ები MutationObserver-ით ჩავწერე: ყოველი ცვლილება, ტექსტი და type.
- injection (scan-ის შემდეგ, მხოლოდ გაშვებულ process-ში), ზუსტი snippet:
  `app.evaluate(({ ipcMain }, ch) => { ipcMain.removeHandler(ch); ipcMain.handle(ch, () => { throw new Error('R15 injected'); }); }, 'meta:read-batch' | 'meta:read')`

**Batch (`r15-5-batch-new-*`):** ორი ფაილი მოვნიშნე (click + Ctrl+click), Category-ში ჩავწერე `R15Batch` და დავაჭირე `Save to 2 files`.
- toast-ი ზუსტად ერთია: `Tags saved to 2 files, but reloading failed. Rescan to refresh.`, type error.
- row-ები save-მდე და save-ის შემდეგ ერთნაირია: `Tagged` badge არ აქვს, რადგან fixture untagged-ია და store არ განახლდა.
- input-ში ისევ `R15Batch` წერია, `Save to 2 files` enabled-ია. screenshot: `r15-5-batch-new-2-after-save.png`.
- ffprobe: `ICAT=R15Batch` ორივე ფაილზე. music-metadata: `ICAT=['R15Batch']` ორივეზე.

**Single (`r15-5-single-new-*`, ახალი გაშვება, ახალი folder, `meta:read` injection):** Category-ში ჩავწერე `R15Single` და დავაჭირე `Save Tags`.
- toast-ი ზუსტად ერთია: `Tags saved, but reloading failed. Rescan to refresh.`, type error.
- row-ზე badge არ გაჩნდა. input-ში `R15Single` დარჩა, `Save Tags` enabled-ია.
- ffprobe და music-metadata: `ICAT=R15Single`.

**Restore მეთოდი:** აპი თავიდან გავუშვი injection-ის გარეშე და იგივე folder გავხსენი. ორივე სცენარში row-ებს `Tagged` badge აქვთ, ფორმა თითო ფაილზე აჩვენებს `R15Batch` / `R15Single`-ს, toast არ ჩანს. screenshot: `*-3-relaunch.png`.

**Red reference (`r15-5-batch-old-*`, `a4ad852` worktree-ის build):** იგივე batch recipe.
- toast: `Error invoking remote method 'meta:read-batch': Error: R15 injected`.
- ffprobe და music-metadata მაინც `R15Batch`-ს აჩვენებს ორივე ფაილზე. ეს ადასტურებს, რომ ძველ კოდში ბაგი რეალურია.

## R15-6 real app regressions (injection-ის გარეშე) — PASS
- **(i) batch, 2 ფაილი** (`r15-6i-batch-*`):
  - toast `Tags saved to 2 files` (success);
  - ფორმა გასუფთავდა: Category ცარიელია, Save disabled-ია;
  - row-ები `Tagged`;
  - ffprobe და music-metadata `R15Batch` ორივეზე.
- **(ii) single** (`r15-6ii-single-*`):
  - toast `Tags saved` (success);
  - ფორმა re-read-ის მნიშვნელობას აჩვენებს (`R15Single`), Save disabled-ია;
  - row `Tagged`;
  - ffprobe და music-metadata `R15Single`.
- **(iii) chmod 000** (`r15-6iii-chmod-tagged-*`):
  - seed-ები წინასწარ tagged ფაილებია (`R15Batch`, (i)-ის შედეგი). `b.wav` chmod 000 გახდა მონიშვნის შემდეგ; Category = `R15Chmod`.
  - toast `1 saved, 1 failed` (error).
  - chmod-ის row (`b.wav`) ინარჩუნებს `Tagged`-ს. edits დარჩა, Save enabled-ია.
  - ffprobe და music-metadata: `a.wav` = `R15Chmod`, `b.wav` = `R15Batch` (უცვლელი).
  - პირველი გაშვება untagged seed-ებით (`r15-6iii-chmod-*`) იგივე toast-ს და ფაილის შედეგს აჩვენებს. ის მხოლოდ დამატებითი evidence-ია, რადგან acceptance "keeps Tagged"-ს ითხოვს.

## R15-7 docs — PASS
- `data-flow.md` ორივე პარაგრაფი ქართულადაა, English ტერმინებით, და კოდს ემთხვევა:
  - ზუსტი toast ტექსტები;
  - `updateFileMetadata`, `skipSyncRef` და `setEditingMetadata` არ იძახება;
  - edits და `isDirty` რჩება, Save enabled-ია;
  - Rescan;
  - known limit `Unsaved changes were discarded`;
  - batch-ში write reject → `readMetadataBatch` არ იძახება.
- batch პარაგრაფში `{failed}` ნიშნავს `failed.length`-ს. ეს სწორია.
- `STATE_MANAGEMENT.md`-ის +1 ხაზი task-ის ზუსტი ტექსტია. სხვა სექცია არ შეცვლილა.

## შენიშვნები (ბაგი არ არის, ამ რაუნდის scope-ის გარეთ)
- error toast (`fixed bottom-20 right-4`) 3 წამის განმავლობაში ფარავს Save ღილაკს მარჯვენა ქვედა კუთხეში (`r15-5-batch-new-2-after-save.png`). ეს ძველი layout-ია, D-24-მა არ შეცვალა. B-მ შეიძლება backlog-ში ჩაწეროს.
- qa note: `succeeded: 0` + re-read reject → `0 saved, N failed. Reloading failed. …`. ტექსტი უხერხულია, მაგრამ spec-ს ემთხვევა; A-ს ანგარიშშიც წერია.
