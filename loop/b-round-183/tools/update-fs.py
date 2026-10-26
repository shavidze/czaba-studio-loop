import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
old_a="- **Round 182 (D-29z147): M3 — ბიბლიოთეკის ჩანაწერებს შორის 4 px — მზადაა (ვეტოს შესაძლებლობით).**"
new_line=("- **Round 183 (D-29z148): M4 — cookie banner Studio-ს აღარ ფარავს — მზადაა (ვეტოს შესაძლებლობით, R44/R45).** C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 183 გამოქვეყნდა `423fbc4`. "
 "BANNER-STUDIO-M4 (HEAD-ზე banner (0, 832) 1440×68 / (0, 652) 1280×68 ფარავდა სტატუსის ხაზსა და მინიშნებას; CUR-ზე `/studio-lab` და `/studio/middle-east` — banner არ არის, `elementFromPoint` ხაზებს ეცემა), BANNER-STORE-M4 (`/` და `/products` — rect Δ 0 px, computed style იგივე; Accept → `granted`, Decline → `denied`), NAV-M4 (client-side გადასვლა „← CZABA“-ზე → banner 136/157 ms-ში, consent `null`), STUDIO-RV-M4 (0 px), M3-NEIGHBOUR, G183-3 — PASS (`c-round-183.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
 "ინფო: m310-ზე CC5-ის „გადაწყვეტილება უკვე არის“ ქვე-შემთხვევა predicate-მდე ვერ აღწევს (C-R183-M310-CC5-UNREACHABLE). Close (X) 0×0, `useButtonType` ×3, inline gradient, `fbq` branch → `deferred_low_polish`. Architecture: predicate-ის დუბლირება `root.tsx:137` / `CookieConsent.tsx:16` → სიგნალი (keep). "
 "**Round 184 (D-29z149): ROOT-RECON-GRID-HARNESS — მუშავდება.** ტესტის helper `createWorkspaceTestEnvironment` (`app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts`) სამ grid UI suite-ში; 45 ტესტის სახელი უცვლელი (`b-round-183/out/vitest-base-names.txt`). რეგრესიის რაუნდი — 2026-10-27-დან პირველ დაგეგმვაზე (მოსალოდნელია Round 185; M1, M3, M4).\n")
assert s.count(old_a)==1; s=s.replace(old_a,new_line+old_a)
old_b="M4 — **არ დაწყებულა**. Frontend-architect checkpoint"
assert s.count(old_b)==1
s=s.replace(old_b,"M4 — **არ დაწყებულა** → M3 — **მზადაა** (Round 182, `f22290f`); M4 — **მზადაა** (Round 183, C PASS `browserVerified`, `423fbc4`; ვეტო R44/R45); ROOT-RECON-GRID-HARNESS — **მუშავდება** (Round 184; VISUAL-A-ს გასასვლელი); checkpoint ხელახლა მოთხოვნილია (`b-round-183-checkpoint-request.md`). Frontend-architect checkpoint")
old_c="| ROOT-RECON-GRID-HARNESS | **არ დაწყებულა** — ტესტის helper-ის გამოყოფა"
assert s.count(old_c)==1
s=s.replace(old_c,"| ROOT-RECON-GRID-HARNESS | **მუშავდება** (Round 184, D-29z149; baseline 45/45, 20/14/11) — ტესტის helper-ის გამოყოფა")
open(p,'w',encoding='utf-8').write(s); print('ok')
