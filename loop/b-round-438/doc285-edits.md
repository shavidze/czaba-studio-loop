# Doc 285: exact edits for round 439

**Verbatim rule.** Every text inside a ``` fence is copied byte for byte. Text outside the fences only says where the fenced text goes, or which existing text it replaces.

## E1: line 4 (replace the whole line)
```
**სტატუსი:** Completed (C round 439 PASS)
```

## E2: three new bullets after the `(g)` bullet in "მიდგომა"
```
- **(h) v4.1 (C-R438-01, round 439):** NF2 number field-ებს `type`-ის literal-ით **ნებისმიერ** JSX tag-ზე ირჩევს (`scanAllJsxOpeningTags`), არა მხოლოდ `<input>`-ზე; არა-`input` number tag-ების სია ცარიელზეა pin-ული. NF2, PG2 და IN1 raw text-საც ამოწმებენ: თითო arrangement `.ts`/`.tsx` ფაილში `type="number"`-ის (lookbehind `(?<![\w-])`), `<progress`-ისა და `<input`-ის ტექსტის რაოდენობა JSX tag-ების რაოდენობას უდრის. ამიტომ markup string-ში ან comment-ში და wrapper-ის computed `type` წითელია, როგორც HEAD-ზე. `jsxOpeningTags` ახლა `allJsxOpeningTags`-ის filter-ია. HEAD-ის DS4-ის `<Modal` ტექსტი string-ში ან comment-ში არ გადმოვიდა: React component string-იდან არ რენდერდება.
- **(i) PG2-ის paired tag:** HEAD-ის PG2 ამოწმებდა, რომ ყოველი `<progress` self-closing იყო და `</progress>` არსად ყოფილიყო, რადგან მისი regex paired tag-ს ვერ კითხულობდა. Parser paired tag-საც კითხულობს და class-ის, hazard-ისა და რაოდენობის წესი მასზეც მოქმედებს, ამიტომ ეს ორი შემოწმება არ გადმოვიდა (M24: paired tag class-ით — HEAD წითელი, ახალი მწვანე; M25: class-ის გარეშე — ორივე წითელი). HEAD-ის assertion-ების სრული რუკა: `b-round-438/head-assertion-map.md`.
- **(j) Test ფაილები:** HEAD-ის SF2 და DS4 top-level `*.test.tsx`-საც კითხულობდნენ, NF2, RD2 და PG2 კი `*.spec.tsx`-ს. Helper `__tests__`-ს, `*.test.*`-სა და `*.spec.*`-ს გამოტოვებს, რადგან test ფაილი Studio-ს UI-ში არ რენდერდება. დღეს `app/components/arrangement`-ში ასეთი ფაილი არ არის.
```

## E3: closes table
**E3a.** On the line that starts `**დახურული finding-ები და მათი red-proof`, replace the text `` `b-round-437/mutants/head.jsonl`, `sketch.jsonl`, `helper.jsonl` `` with:
```
`b-round-438/mutants/head.jsonl`, `v3.jsonl`, `sketch.jsonl`, `helper.jsonl`
```
**E3b.** Insert these three rows directly after the row whose first cell is `ახალი guard-ები (tech-lead v1-7, v2-1)`:
```
| C-R438-01-NF2-WRAPPER-TAG-NARROWING | M17: `<Input type="number" />` ახალ ფაილში; M18: იგივე `ArrangementDetailPanel.tsx`-ში; M22: `'<input type="number" />'` string-ში; M23: `<Input type={'number' as const} />` | M17, M22, M23 წითელი NF2; M18 მწვანე (false pass) | წითელი NF2 ×4 |
| A-R438-REVIEW-L1-PG2-STRING-MARKUP | M19: `<progress>` markup string-ში; M20: radio markup string-ში; M21/M21b: search markup string-ში | წითელი PG2; წითელი RD2; M21 წითელი SF2 | წითელი PG2; წითელი IN1; M21 მწვანე SF2, M21b წითელი IN1 |
| ruling (i), paired `<progress>` | M24: paired tag class-ით; M25: paired tag class-ის გარეშე | წითელი PG2 ×2 | M24 მწვანე (მიღებული); M25 წითელი PG2 |
```
**E3c.** In the row whose first cell is `helper row-ები`, replace `SS4; SF1 + SS3; SS2` in the last cell with:
```
SS4; SF1 + SS3 + SS9; SS2
```
then append this to the end of the second cell:
```
; H10 any-tag query input-only
```
and this to the end of the last cell:
```
; DS4 + PG2 + SS2 + SS9
```

## E4: replace the whole line that starts `NF1, RD1, PG1 და DS1–DS3 უცვლელია.`
```
NF1, RD1, PG1 და DS1–DS3 უცვლელია. HEAD-ზე წითელი და იმავე suite-ში ახალ ტესტებზე მწვანე მხოლოდ M1, M2, M4, M5, M12, M21 და M24-ია: M1, M4, M5 და M12 HEAD-ის false red-ებია; M2 უფრო მკაცრი per-tag carrier-ით არის ჩანაცვლებული; M21-ს IN1 იჭერს (M21b); M24 ruling (i)-ია. შეგნებულად არ გადმოვიდა სამი scanner-ის დაფარვის შემოწმება: DS4-ის `<Modal` ტექსტი string-ში (ruling (h)), PG2-ის self-closing / `</progress>` შემოწმება (ruling (i)) და test/spec ფაილების კითხვა (ruling (j)). რუკა: `b-round-438/head-assertion-map.md`.
```

## E5: "ტესტირება"
- `A-ს გაშვებები (round 438), log-ები `tmp/studio-real-loop/a-round-438/`-ში:` → replace `round 438` with `round 439` and `a-round-438` with `a-round-439`.
- Replace the line `  - covering set: 7 ფაილი, 23/23, rc 0;` with:
```
  - covering set: 7 ფაილი, 24/24, rc 0;
```
- Replace the line that starts `- Mutant-ები (ცხრილი ზემოთ)` with:
```
- Mutant-ები (ცხრილი ზემოთ) B-მა გაუშვა scratch ასლებში (`b-round-438/mutants/`); C round 439 მათ იმავე script-ებით იმეორებს.
```

## E6: append to "TODO / შემდეგი ნაბიჯები"
```
- A-R438-REVIEW-L2-DS4-SF2-TEXT-CONTAINMENT: DS4/SF2 tag-ის მთლიან ტექსტზე containment-ს ამოწმებენ (HEAD-ის ტოლი; deferred Low).
- A-R438-REVIEW-L3-PARSE-DIAGNOSTICS: `ThisNodeHasError` scanner-ის diagnostics-ს ვერ ხედავს; typecheck ფარავს (deferred Low).
- TL-R439-N1-NF2-RAW-SPELLING: NF2-ის raw guard-ი და AST სხვადასხვა ჩაწერას ითვლიან (`type={ "number" }`); ორი შეგნებული ცვლილებით შეიძლება გაქრეს (deferred Low).
```

## E7: "შეცვლილი ფაილები"
In the `source-scan.test.ts` bullet, replace `SS1–SS8` with:
```
SS1–SS9
```
In the `helpers/source-scan.ts` bullet, replace `JSX opening tag-ების სკანირება hazard-ებით` with:
```
JSX opening tag-ების სკანირება (სახელით ან ნებისმიერი სახელის, `name` ველით) hazard-ებით
```

## E8: architecture diagram
Replace the line `  P --> T[jsxOpeningTags / scanJsxOpeningTags<br/>path, line, tag, attributes, hazards]` with:
```
  P --> T[allJsxOpeningTags / jsxOpeningTags / scan*<br/>path, line, name, tag, attributes, hazards]
```

**Self-check (A and C):** after E1–E8, `grep -nE 'SS1–SS8|23/23|round 438|a-round-438|b-round-437/mutants'` on doc 285 prints nothing.
