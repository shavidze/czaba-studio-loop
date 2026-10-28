# B — round 42 დახურვა / round 43 დაგეგმვა

Planner: B · 2026-10-28 · baseline შემდეგი რაუნდისთვის: `cf4e147` (root gate: published, review COMMIT OK). repository-ის working tree სუფთაა.

## round 42 შედეგი (C-ის მტკიცებულებიდან)
- **C PASS** R42-1…R42-7, realVerified=true (`c-round-42.md`, `.json`).
  - red: `a5c6a6b`-ის src + ახალი ტესტები → 7 failed / 4 passed. A-ს tree-ზე 11/11.
  - real app (planted `schema.json`):
    - (a) custom `category`/`CATE` და (b) custom `ucs_cat`/`ICAT`: chip არ ჩანს, ჩანს ზუსტი warning ფერით `rgb(245, 158, 11)`.
    - save: (a) იწერება მხოლოდ `CATE`, `ICAT` არ არის არც ერთ reader-ში; (b) ზუსტად ერთი `ICAT`.
    - R42-5-ის D-07 რეგრესია მწვანეა.
  - gate EXIT=0: renderer 317, main 93, E2E 7/7.
- **backlog:**
  - TM-T1-DUP → **done**, RR-R3-01 → **closed**, D-47 → **verified**.
  - D-47-ის განზოგადება ყველა სტანდარტულ ველზე B-ის არჩევანია და Saba-ს დადასტურებას ელოდება (ახალი **Q19**, RR-R42-03).
  - archive: `tasks/round-42.md` (ახალი ფაილი). `round-42-blocked-superseded.md` ხელუხლებელია. backlog-ში BLOCKED round 42 მოინიშნა `superseded`-ად.
- **C-R42-01 (low):** B-ის Mp3tag reference R1 (001 entry 23) წყაროებით არ დასტურდება.
  - B-მ 2026-10-28-ს ორივე URL ხელახლა გახსნა. thread მხოლოდ ამბობს, რომ custom ველი TXXX-ად ინახება. mapping docs თითო ველისთვის აჩვენებს frame-ს ან RIFF INFO chunk-ს და ამბობს, რომ mapping-ის შეცვლა შეიძლება. same-name შემთხვევას არც ერთი არ ეხება.
  - C-ს ეს სწორად აქვს. შესწორება round 43-შია (Scope C, მხოლოდ entry 23-ის ორი ხაზი).

## Saba-სთვის: Q18-ში ახალი ფაქტი (R42-6)
- თუ schema-ში უკვე ორივე ველია (სტანდარტული `category`/`ICAT` + custom `category`/`CATE`):
  - ერთი მნიშვნელობა ორ chunk-ში იწერება;
  - სტანდარტულ Category-ზე **Hide (X)** custom ველის განსაზღვრებასაც შლის (`removeField(key)`). Done-ის შემდეგ `schema.json`-ში custom `category`/`CATE` აღარ არის.
- WAV-ებში შენახული `CATE` მონაცემი ხელუხლებელია, ასე რომ ეს config-ის დაკარგვაა და არა აუდიო ან tag მონაცემის.
- ეს უკვე Q18-ის (B-R42-01) საკითხია. round 43-ს არ ბლოკავს, მაგრამ Saba-მ უნდა იცოდეს.

## ახალი signal-ები (task-ები არ არის)
- **RR-R42-01 (low):** `riffChunkId` case-sensitive-ად შედარდება.
  - B-მ `metadata.ts:179-197` შეამოწმა: writer ID-ს უცვლელად გადასცემს, ამიტომ ხელით ჩაწერილი `icat` ცალკე lowercase chunk ხდება და არა მეორე `ICAT` writer.
  - signal: Q13 (schema-ს ვალიდაცია ჩატვირთვისას).
- **RR-R42-02 (low, a11y):** warning უბრალო `<p>`-ია. → record.
- **RR-R42-04 (info):** ერთი საერთო slot-conflict ფუნქცია schema-store-ში. → არქიტექტურის signal.
- **A-R42-01 (info):** `standard` flag-ის გარეშე ხელით ჩაწერილი ველი custom-ად ითვლება. → Q13.
- **A-R42-02 (info):** T-e mock-ით ამოწმებს. → record.
- **B-R42-03 (info):** `docs/learning/decisions.md:76` „13 მეთოდი“ მოძველებულია (16 → 17). → record.
- **B-R42-02:** დუბლიკატი ჩანაწერი წაიშალა. დაემატა C R42-4-ის დაკვირვება: ცარიელი `IKEY` (size 0) ისევ იწერება, TM-B11 / Q4.

## round 43 = TM-B44 (Saba Q8, D-48)
- **რატომ:** Saba-ს რიგში შემდეგია Q8. ეს ღია **medium** RR-R19-01-ია: ყოველი save ელოდება ღია folder-ის სრულ რეკურსიულ `scanFolder`-ს. critical ან high ბაგი ღია არ არის.
- **რას ვცვლით:**
  - ახალი `fs:stat-files` (main handler, ≤ 50 path, მხოლოდ `.wav` ჩვეულებრივი ფაილები);
  - preload-ში მხოლოდ ერთი member და ერთი type ხაზი (ზუსტი diff task-შია);
  - `refreshSavedFileStats` path-ებს 50-იანი chunk-ებით თანმიმდევრულად აგზავნის;
  - D-28-ის ყველა სხვა წესი უცვლელია, მათ შორის `folderPath === null`.
- **ownership-ის შენიშვნა:** `tests/renderer/setup.ts` round 10-იდან გაყინულია. აქ მასში მხოლოდ ერთი ხაზი ემატება, რადგან `Window["api"]` ახალ required member-ს იღებს და typecheck `tests/**`-საც ამოწმებს. იგივე ეხება `window-api-mocks.ts`-ს და `app-launch.spec.ts`-ს (თითო ერთი ხაზი).
- **Reference-first:** exempt. ეს pure fix-ია და ხილული UX არ იცვლება.
- **C-ის მთავარი რეალური შემოწმებები:**
  - Size/Date single, nested და batch save-ის შემდეგ, სამი დამოუკიდებელი reader-ით;
  - `statFiles` IPC built app-ში;
  - save-ის დრო ≥ 5000 ფაილიან nested tree-ზე, `cf4e147`-ის build-თან შედარებით (T_base − T_new ≥ 0.5 × T_scan).

## დარჩენილი scope
- TM-B44 (round 43);
- TM-B11 (Q4), TM-B05 (Q5), TM-B08 (Q3), TM-B06 (Q6);
- TM-T2-DATA → TM-T2 (blocked, Saba Q7).

Q9–Q17, Q18 და Q19 ღიაა და Saba-ს პასუხამდე არ იგეგმება. scope არ შემცირებულა. არაფერი გადადებულა Saba-ს გარეშე.

ფაილები: `backlog.json` (backup `b-round-42-backlog-before.json`, სკრიპტი `b-round-42-update-backlog.py`), `feature-status.md` (backup და სკრიპტი იგივე სახელებით), `current-task.md`, `tasks/round-42.md`, `b-next.json`.
