# კითხვა Saba-სთვის: გამოუყენებელი leaf wrapper-ების წაშლა (GATE375-L1-UNUSED-WRAPPERS)

**თარიღი:** 2026-11-08 · **ავტორი:** B, round 404 → 405-ის დაგეგმვა (D-29z1398) · **სტატუსი:** `awaiting_user`

## რატომ მოდის თქვენთან
CLAUDE.md-ის წესით, წაშლა თქვენი ნებართვის გარეშე არ ხდება. ეს არის Low, Studio-ს არ აჩერებს და ლუპი პასუხს არ ელოდება.

## რა ვითარებაა (HEAD dd52107, B-მ grep-ით შეამოწმა)
PERF-11c-ის შემდეგ `StudioWorkspace` leaf-ებს პირდაპირ `…View` კომპონენტებით და `useArrangementActions()`-ით კვებავს. ძველი wrapper კომპონენტები production-ში აღარ ჩანს, მათ მხოლოდ ტესტები იყენებს:

| Wrapper | სად გამოიყენება | `components/arrangement/index.ts`-ის export |
|---|---|---|
| `ArrangementLibrary` | `library-focus-handoff.test.tsx` | კი |
| `ArrangementLibraryPreview` | `library-preview.test.tsx` | არა |
| `ArrangementLoopBrace` | `gesture-reentry.test.tsx`, `gesture-guard.test.tsx` | კი |
| `ArrangementTransport` (იგივე ფორმა) | `self-disabling-focus.test.tsx`, `export-toolbar-hold-enter.test.tsx` | კი |
| `ArrangementMaster` (იგივე ფორმა) | `master-ui`, `master-hold-tick`, `meter-ui`, `schedule-failure-ui` ტესტები | არა |

## კითხვა
1. **(a) დავტოვოთ, როგორც არის.** wrapper-ები ტესტებისთვის მოსახერხებელი შესასვლელია (provider + `useArrangement()`). ფასი: ~5 პატარა კომპონენტი, რომლებიც production-ში არ ჩანს.
2. **(b) წავშალოთ.** ტესტები გადავიტანოთ `…View` + `useArrangementActions()`-ზე, ხოლო wrapper-ები და მათი `index.ts` export-ები წავშალოთ. ეს ერთი შეზღუდული რაუნდია, ქცევა არ იცვლება, ტესტები იგივე მტკიცებულებას ინარჩუნებს.
3. **(c) შუალედური.** wrapper-ებს დავარქვათ test helper და გადავიტანოთ `__tests__/helpers`-ში. production-ის `index.ts`-იდან export-ი მოიხსნება.

**B-ის რეკომენდაცია:** (a), PERF-11c-iii-d/e-ის დასრულებამდე. მერე wrapper-ების პოლიტიკა ყველა leaf-ისთვის ერთად გადაწყდება (`tech-lead`-ის round-375 შენიშვნა). წაშლა ახლა არაფერს აჩქარებს.

**პასუხი:** ჩაწერეთ აქ. root გადმოიტანს policy-ში.
