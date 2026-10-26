# B — Round 0 (bootstrap), 2026-10-26

## რა წავიკითხე
- `requirements.md` სრულად (T-0, T-1, T-2, §0.1 ფაქტები, „რა არ შედის“), `policy.md`, `policy.local.md`, templates.
- Repo (HEAD `acefccc`, სუფთა tree): `CLAUDE.md`, `.claude/rules/*` (test-on-bugfix, plan-to-docs, qa-trigger, read-primitives), `TESTING.md` (fixture-ის ნაწილი). `AGENTS.md` არ არსებობს.
- კოდი: `src/main/ipc/metadata.ts`, `src/main/ipc/schema.ts`, `src/shared/types.ts`, `src/main/index.ts`, `SchemaEditor.tsx`/`MetadataPanel.tsx`/`utils.ts` (grep), `tests/fixtures/create-fixtures.ts`, `tests/main/metadata.test.ts`, `tests/main/setup.ts`, ორივე E2E spec, `vitest.config.main.ts`, `playwright.config.ts`, `package.json`, `tsconfig*.json`, `.gitignore`, `release.yml`, `docs/plans/001-*`.
- `node-taglib-sharp@6.0.1` `dist/riff/riffFile.js` (`read()`, `readProperties()`).

## რა გავუშვი (runner-ზე, source არ შემიცვლია; `out/` წავშალე)
1. `/tmp/bexp/exp.cjs`: node-taglib-sharp-ით 0, 1 და 100 sample-იან WAV-ზე title-ის ჩაწერა. 0 → `WAV file is missing data chunk`; 1 და 100 → OK.
2. `electron-vite build` + `xvfb-run -a npx playwright test tests/e2e/app-launch.spec.ts --retries=0` → „Process failed to launch!“. Electron-ის პირდაპირ გაშვება აჩვენებს `FATAL:setuid_sandbox_host.cc(163)`-ს. `--no-sandbox`-ით ეშვება. `kernel.apparmor_restrict_unprivileged_userns = 1`.
3. fixture-ის გარეშე `vitest --config vitest.config.main.ts` → ENOENT `tests/fixtures/sample.wav` (`metadata.test.ts:26`).
4. `npx tsc --noEmit --listFiles | wc -l` → **0**. `-p tsconfig.node.json` → 10 შეცდომა, `web` → 32, `test` → 31.

## გადაწყვეტილებები
- **„missing data chunk“: fixture-ია არასწორი თუ writer-ი? ორივე, ოღონდ სხვადასხვა წონით.** ცარიელი `data` chunk ვალიდური RIFF-ია. ბიბლიოთეკის ციკლი `position + 8 < length` ფაილის ბოლოში მდგარ ცარიელ chunk-ს გამოტოვებს, ანუ ეს ბიბლიოთეკის boundary bug-ია. ამავდროულად spec-ის 44-ბაიტიანი fixture რეალურ ჩანაწერს არ ჰგავს და დამოკიდებულებას არ ვაპაჩებთ. ამიტომ R1-ში სწორდება fixture (D-05). ბიბლიოთეკის ქცევა ცალკე ჩაიწერა: TM-B05 (low).
- **`--no-sandbox` სავალდებულოა** runner-ზე და ემატება მხოლოდ Linux-ზე (D-06). ამ runner-ზე E2E-ის მდგომარეობა 0/6-ია და არა 5/6. 5/6 root-ის container-ში იყო გაზომილი (B-R0-02).
- **Round 1 = T-0, ზუსტად ისე, როგორც მოთხოვნაშია:** სამი დაკავშირებული baseline bug (B01, B02, B03), `check.yml` და plan doc. `src/**` გაყინულია.
- **TM-B04 (tsc no-op) R1-ში არ შედის.** მისი გასწორება ~73 შეცდომის გასწორებაა და შეიძლება preload-ს (გაყინულს) და `package.json` `scripts`-ს შეეხოს. ის round 2-ია, T-1-მდე. C-ს ცხადად ეუბნება, რომ მწვანე `check` ჯერ type-safety-ის მტკიცებულება არ არის. Saba-ს „known state“ (check გადის) მართალია, მაგრამ ამ მიზეზით უფრო სუსტია, ვიდრე ჩანს.
- T0-1-ში `git clean -xfd` და `npm ci` სიმულაციით ჩავანაცვლე: `rm -rf out … tests/fixtures/*.wav`. აგენტები `node_modules`-ს არ აყენებენ. რეალური `npm ci`-ის და postinstall-ის მტკიცებულება publish-ის შემდეგ პირველი Actions run-იდან მოვა, ამიტომ TM-T0-CI მანამდე ღიაა.
- T0-3-ის red proof-ისთვის fixture-ები ჯერ უნდა წაიშალოს, თორემ gate-ის tsx ნაბიჯი მათ წინასწარ ქმნის.
- C-ის UI baseline (R1-9) არსებულ ქცევას ზომავს. A-ის diff-ის გარეშე აღმოჩენილი დეფექტი ახალ finding-ად ჩაიწერება და round-ს არ ჩააგდებს.
- music-metadata INFO-ს latin1-ად კითხულობს, ამიტომ არა-ASCII მნიშვნელობები ffprobe-ით და raw ბაიტებით შედარდება (rule backlog-ში).

## ღია კითხვები Saba-სთვის (R1-ს არ ბლოკავს)
1. **TM-B04:** შეიძლება შეიცვალოს `package.json` `scripts.check` (მაგ. `tsc -b` ან `-p` თითო პროექტზე)? და შეიძლება `src/preload/index.d.ts` შევიდეს web/test tsconfig-ის include-ში (preload default-ად გაყინულია)? თუ არა, renderer-ის `window.api` შეცდომები სხვაგვარად მოგვარდება.
2. **D-01:** `ICAT` საბოლოოა თუ `IGNR` / iXML `USER/CATID` / `ISBJ`? Default: `ICAT`.
3. **D-07:** არსებული `schema.json`-ის migration არ ხდება და მხოლოდ toggle + შენიშვნა რჩება. დასტური?
4. **D-08:** ცარიელი category დასაშვებია. დასტური?
5. **TM-B05:** ცარიელი WAV-ის შემთხვევაში მკაფიო შეცდომის შეტყობინება გვინდა, თუ upstream issue-ც უნდა გაიხსნას?
6. **TM-T2-DATA:** UCS სიის ფაილი და ლიცენზიის დადასტურება. მის გარეშე T-2 BLOCKED-ია.
7. **Root-ისთვის:** `.github/workflows/check.yml`-ის push-ს token-ზე `workflow` scope სჭირდება. თუ ის არ არის, root-მა ეს უნდა გვითხრას.

## სტატუსი
CONTINUE. შემდეგი: Round 1, `current-task.md`.
