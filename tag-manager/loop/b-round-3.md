# B — Round 3 დახურვა, Round 4 გეგმა

Planner: B · 2026-10-26 · baseline HEAD `230b87a85e7301b25e86e3768a9e242cf9adc5f4` (root-მა გამოაქვეყნა round 3, tree სუფთაა). წყაროს არ შევხებივარ.

## Round 3: შედეგი
- **C: PASS, realVerified=true.** R3-1…R3-10 დამოუკიდებლად შემოწმდა ნამდვილ app-ში (`_electron`, xvfb) და დამოუკიდებელი reader-ებით (ffprobe, საკუთარი RIFF dump, music-metadata).
- **Root gate:** verify მწვანეა (renderer 79, main 40, E2E 7/7), review COMMIT OK, publish `230b87a`.
- **Done (realVerified=true):** TM-T1, TM-T1-DOC.
- **არ დასრულებულა:**
  - TM-T0-CI და TM-T0: Actions run ჯერ მწვანე არ არის (`realVerified=false`);
  - T1-6-ის Actions ნაწილი TM-T0-CI-ს ეკუთვნის.
- **არქივი:** `tasks/round-3.md`, ზუსტი ასლი, თავდაპირველი შეცდომით (ICMT „26“). ეს შეცდომა C-R3-02-ში და TM-T1-ის evidence-ში გასწორდა: სწორი მნიშვნელობაა 28 (9 ქართული ასო × 3 + space).

## Backlog-ის ცვლილებები (მხოლოდ C-ისა და root-ის მტკიცებულებით)

| ID | ცვლილება | წყარო |
|---|---|---|
| TM-T1 | → done, commit `230b87a`. `files`-ში `.mjs` → `.ts` | C R3-1…R3-10 |
| TM-T1-DOC | → done | C R3-10 |
| TM-T1-MIG | evidence (რეგრესია), ღია რჩება | C R3-7, D-07 Saba |
| TM-T1-DUP | სათაური გაფართოვდა: მეორე შემთხვევაა იგივე key, სხვა ID (`CATE`). ჩაიწერა შემოთავაზებული default | root review RR-R3-01 |
| TM-T0-CI | evidence: გაუქმებული run `40323787413` + B-ის დაკვირვება. round 4 | root-ის შენიშვნა |
| **TM-B09** (ახალი, low) | „Tagged“ badge-ში კონტრაქტის ველები არ ითვლება | C-R3-01 |
| findings | დაიხურა: A-R2-01, RR-R1-02, RR-R1-06, C-R3-02. დაემატა: C-R3-01, A-R3-01, RR-R3-01…06 | C R3, review R3 |
| rule (R3) | სანამ root მწვანე run-ს არ მიაბამს, Actions-run acceptance არცერთ item-ზე არ ითვლება | root-ის შენიშვნა |

Reviewer-ის არქიტექტურული შენიშვნა (RR-R3-06: ვერსიიანი `schema.json` + merge `loadSchema()`-ში) signal-ად ჩაიწერა TM-T1-MIG/DUP-თან. task არ გამხდარა.

## Round 4: TM-T0-CI apt-ის გასწორება + RR-R3-02

**რატომ ახლა.** Root-მა TM-T0-CI T-1-ის **წინ** დანიშნა. სამი publish-ის შემდეგ `check.yml` GitHub-ზე ერთხელაც არ დასრულებულა, ანუ CI gate მკვდარია. ამიტომ high-ად ვთვლი და ფუნქციონალზე წინ დგას. RR-R3-02 იმავე CI გზაზეა და ერთი ფაილის მცირე ცვლილებაა.

**ფაქტები და ჰიპოთეზა:**
- **ფაქტი (B, ამ runner-ზე):**
  - `/var/lib/man-db/auto-update` არ არსებობს;
  - `debconf-communicate` და `timeout` არის;
  - `xvfb` Depends: `xauth`;
  - `ffprobe` `ffmpeg` პაკეტშია. ამიტომ `--no-install-recommends` არაფერს წაშლის, რაც გვჭირდება.
- **ჰიპოთეზა:** hang man-db trigger-ის ან dpkg/debconf prompt-ის/pty-ის ბრალია. ეს დადასტურებული არ არის, root-ს log-ის წაკითხვა არ შეუძლია.
- **რას იძლევა ეს რაუნდი გარანტირებულად:** fail-fast ქცევას და ხილულ log-ს. ესაა attempt-ის timeout, 1 retry, step-ის `timeout-minutes: 10` და დროის ხაზი ყოველ attempt-ზე. შემდეგი run ან გაივლის, ან ზუსტად გვიჩვენებს, სად იხარჯება დრო.

**გადაწყვეტილებები:**
- **`timeout-minutes: 10`, არა 8.** 2 × 240 s attempt + recovery 8 წუთში არ ეტევა.
- **ლოგიკა ცალკე bash ფაილშია:** `.github/scripts/apt-install.sh`, რომ C-მ PATH shim-ებით და მოკლე timeout-ით შეამოწმოს. Vitest-ის target არ არის, რადგან `npm run check` Windows-ზეც უნდა გაეშვას.
- **`playwright install-deps` step-ს მხოლოდ `timeout-minutes` ემატება.** man-db-ის პარამეტრი წინა step-იდან მასზეც მოქმედებს.
- **ახალი action (retry) არ ემატება** (RR-R1-03).

**Acceptance:** R4-1…R4-8 (`current-task.md`). C-ის PASS ლოკალური მტკიცებულებაა. **TM-T0-CI done-ს მხოლოდ root-ის მიბმული მწვანე Actions run-ით ხდება.**

## Saba-სთვის ღია კითხვები (არცერთი არ ბლოკავს round 4-ს)
1. D-07 (TM-T1-MIG): ძველ `schema.json`-ს ავტომატური მიგრაცია არ სჭირდება? საჭიროა დადასტურება.
2. D-10: ცარიელი ველი `""`-ად ჩაიწეროს (დღევანდელი ქცევა), თუ sub-chunk წაიშალოს? დღეს editor-ის ყოველი save `ICAT=""`-ს წერს (RR-R3-03).
3. D-12 / TM-B08: შედის თუ არა artists კონტრაქტში?
4. TM-T1-DUP: ძველი custom ველი `ICAT`-ით ან `category` key-ით. შემოთავაზებული default: სტანდარტული toggle დაიმალოს და გამოჩნდეს გაფრთხილება.
5. RR-R1-07: `check.yml` required check-ად გავხადოთ და `release.yml`-ს `needs: check` დავუმატოთ? (პირველი მწვანე run-ის შემდეგ.)
6. RR-R3-05: `tsx` devDependency-დ დაემატოს? `package.json` დაცულია და ახალი დამოკიდებულებისთვის თანხმობა საჭიროა.
7. TM-T2-DATA: UCS სია და ლიცენზია (T-2 BLOCKED).

## შემდეგი
Round 5 (ორიენტაცია) დამოკიდებულია Round 4-ის შემდეგი Actions run-ის შედეგზე:
- **თუ run მწვანეა:** მცირე bug round, RR-R2-01, RR-R2-02 და TM-B09;
- **თუ run ისევ წითელია:** კიდევ ერთი CI round, attempt-ების timing-ის მიხედვით.
