# B — Round 43 დახურვა / Round 44 დაგეგმვა (2026-10-28)

## Round 43 შედეგი
- **C: FAIL, realVerified=true.** ერთადერთი მიზეზი **C-R43-01** (medium) არის: unowned ტესტი `tests/renderer/components/schema-change-during-folder-load.test.ts` (w7) `:315`-ზე save-ის stats refresh-ს `window.api.scanFolder` mock-ით კვებავს. save ახლა `statFiles`-ს იძახებს, ამიტომ renderer 319/320-ია და `verifyCommand` rc=1-ით მთავრდება.
- ეს **B-ის დაგეგმვის ხარვეზია**: round 43-ის B3-მა ეს ფაილი A-ს არ მისცა. A-მ წესის მიხედვით შეაჩერა მუშაობა (`a-round-43.md`, "B-სთვის").
- პროდუქტი სწორია. C-ის მტკიცებულება:
  - R43-1 ownership/preload PASS;
  - R43-3 red PASS;
  - R43-4 real app PASS: Size/Date და 3 reader (`ICAT`/`IKEY`);
  - R43-5 PASS: IPC edge case-ები; 5000 WAV-ზე single save 388/376 ms → 19/17 ms median;
  - R43-6 regression PASS: partial batch `chmod 000` და Rescan/Open Folder. drop მხოლოდ კოდით შემოწმდა;
  - R43-7 docs PASS: C-R42-01 შესწორება.
- Gate: `gates/gate-round-43.json` = skipped (C FAIL). გამოქვეყნება არ მომხდარა. baseline რჩება `cf4e147`, 13 შეცვლილი ფაილით working tree-ში.
- Root review ამ round-ზე არ ყოფილა (გამოქვეყნება არ მომხდარა).

## B-ის შემოწმება (read-only, scratch copy `/tmp`-ში, repo არ შეცვლილა)
- `:315` → `vi.mocked(window.api.statFiles).mockResolvedValue([{ ...FILE_A, size: 2 }]);` A-ს tree-ზე renderer **320/320**-ს იძლევა.
- იგივე ტესტი `cf4e147`-ის `MetadataPanel.tsx`-ით (w7)-ზე **ჩავარდა** (1 failed / 7 passed). ე.ი. flip D-48-ის ნამდვილი pin-ია.
- `tests/renderer`-ში `scanFolder`-ის სხვა mock-ები Open Folder / Rescan / drop load-ებს ემსახურება და არა save-ის refresh-ს. C-მაც მხოლოდ (w7)-ის ჩავარდნა ნახა.
- გადატანილი 13 ფაილის sha256 ჩაწერილია `current-task.md`-ში.

## Backlog ცვლილებები (მხოლოდ C-ის მტკიცებულებით)
- **TM-B44:** რჩება `in_progress`, რადგან gate წითელია და round არ გამოქვეყნებულა. evidence-ს დაემატა C R43 და B probe.
- **D-48:** status → "implemented in working tree, awaiting round 44 gate".
- **C-R42-01:** in_progress; tree-ში შესწორდა (R43-7 PASS). დაიხურება publish-ით.
- **RR-R19-01 / B-R18-01:** routed → round 44 completion.
- ახალი finding-ები:
  - C-R43-01 (medium, round 44);
  - A-R43-01 (low, symlink/`lstat` signal);
  - A-R43-02 (info, EACCES ტესტის ხარვეზი);
  - A-R43-03 (info, E2E launch flake, C-R9-02 კლასი);
  - B-R43-01 (low, process).
- ახალი **rule (round 44-დან):** როცა round ცვლის, რომელ `window.api`/IPC call-ს იყენებს flow, B `tests/`-ში ეძებს ძველი call-ის ყველა mock-ს. ის ან ownership-ს აძლევს ყოველ ტესტს, რომელიც ამ flow-ს კვებავს, ან წერს, რატომ არ ეხება ცვლილება.
- `tasks/round-43.md` დაარქივდა (ასლი).

## Round 44
- **TM-B44-ის დასრულება.** owned არის ერთი ხაზი (w7)-ში (numstat `1 1`).
- 13 გადატანილი ფაილი hash-ით გაყინულია.
- Acceptance:
  - R44-1: ownership + hash-ები;
  - R44-2: (w7) red/green;
  - R44-3: gate (renderer 320, main 98, E2E 7/7);
  - R44-4: ახალი real-app smoke, 3 reader-ით;
  - R44-5: round-43-ის real evidence-ის გადატანა, მხოლოდ hash-ების დადასტურების შემდეგ.
- TM-B11 (Q4) ამ round-ში **განზრახ არ შედის**. ის frozen `metadata.ts`-ს და K-4 კონტრაქტს ეხება, და მისი ჩავარდნა TM-B44-ის publish-ს ისევ დაბლოკავდა.

## ღია, Saba-ს ელოდება
- Q7: UCS სია + ლიცენზია (TM-T2-DATA → TM-T2).
- Q9–Q17 (UX), Q18 (B-R42-01), Q19 (RR-R42-03).
- არცერთი არ ბლოკავს round 44-ს.
