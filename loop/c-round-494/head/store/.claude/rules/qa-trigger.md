# QA Trigger Rule

## ტრიგერები

### სრული QA
- "გატესტე", "მოდი გატესტე", "გატესტე ახლა"
- "qa გაუშვი", "qa-engineer გაუშვი"
- "ტესტები გაუშვი", "ტესტები დაწერე"
- "ბაგები იპოვე", "ბაგები მოძებნე"

### ფოკუსირებული QA
- "გატესტე auth" → მხოლოდ AuthContext, auth.ts, social login flow
- "გატესტე studio" → მხოლოდ Studio/DAW კომპონენტები, AudioEngine, stems mixing
- "გატესტე cart" → მხოლოდ CartContext, cart API calls, checkout flow
- "გატესტე player" → მხოლოდ audio playback, waveform, WaveSurfer integration
- "გატესტე api" → მხოლოდ api client, token refresh, error handling

### Security Audit
- "security audit", "უსაფრთხოება შეამოწმე", "audit გააკეთე"
- დამატებით წაიკითხე `primitives/SECURITY_AUDIT.md`
- ფოკუსი: XSS, token storage, auth bypass, localStorage exposure, CSP, user input sanitization

## სავალდებულო ქმედებები

1. წაიკითხე `primitives/BUG_HUNTING_TESTS.md`
2. წაიკითხე `primitives/TESTING_QUALITY_GATES.md`
3. შეამოწმე `docs/bugs/` — წინა QA-ს შედეგები რეგრესიების შესადარებლად
4. გაუშვი `qa-engineer` agent-ის ლოგიკა:
   - კოდბეისის სკანირება (components, hooks, contexts, routes)
   - ბაგების ძებნა (XSS, auth bypass, memory leaks, race conditions, missing states)
   - **დონე 1:** Standard ტესტები `__tests__/` ფოლდერში
   - **დონე 2:** Bug-Hunting ტესტები `__tests__/bug-hunting/` ფოლდერში
   - `npm run test:run` + `npm run build`
5. ბაგების დაფიქსირება `docs/bugs/{year}/quarter-{I|II|III|IV}/{NNN}-{description}.md`-ში
6. `docs/bugs/README.md` ინდექსის განახლება

## Severity დონეები

ყოველ ბაგს მიანიჭე severity bug doc-ში:

| Severity | აღწერა | მაგალითი |
|----------|--------|----------|
| **Critical** | მონაცემთა დაკარგვა, security breach, payment failure | XSS injection, auth token leak |
| **High** | ფუნქციონალი არ მუშაობს, მაგრამ data უსაფრთხოა | Studio playback crash, checkout fail |
| **Medium** | Edge case, არასწორი ქცევა იშვიათ სცენარში | Memory leak on unmount, race condition |
| **Low** | UX პრობლემა, არ აფექტირებს ლოგიკას | Missing loading state, layout shift |

## Summary — QA-ს ბოლოს

QA დასრულებისას დაბეჭდე summary:

```
## QA Summary
- სკანირებული: {მოდულების სია}
- ნაპოვნი ბაგები: {რაოდენობა} (Critical: N, High: N, Medium: N, Low: N)
- დაწერილი ტესტები: {რაოდენობა}
- რეგრესიები: {წინა QA-დან გამეორებული ბაგები}
- დაფიქსირებულია: docs/bugs/{path}
```

## Regression Dataset

ყოველ QA run-ზე შეამოწმე ცნობილი ბაგების რეგრესია:

1. წაიკითხე `docs/bugs/` — ყველა "Completed" სტატუსის ბაგი
2. თითოეულ გამოსწორებულ ბაგზე გადაამოწმე:
   - ფიქსი ჯერ კიდევ ადგილზეა? (კოდი არ წაშლილა / არ გადაწერილა?)
   - იგივე პატერნი სხვაგან ხომ არ გამეორდა?
3. რეგრესია აღმოჩენისას — ახალი ბაგი Critical severity-ით
4. Summary-ში ჩაწერე: "რეგრესიები: {რაოდენობა} / {შემოწმებული ბაგების რაოდენობა}"

**არ დაელოდო დამატებით ინსტრუქციას — დაიწყე მაშინვე.**
