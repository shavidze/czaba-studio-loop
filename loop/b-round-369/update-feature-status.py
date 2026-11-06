# B round 369 -> 370: feature-status.md update. Run once from the loop root.
import pathlib
import sys

P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-369/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
s = P.read_text()
old_head = 'განახლდა: 2026-11-06 · ავტორი: B (round 368 → round 369 დაგეგმვა, D-29z1210…D-29z1216)'
assert s.count(old_head) == 1
s = s.replace(old_head, 'განახლდა: 2026-11-06 · ავტორი: B (round 369 → round 370 დაგეგმვა, D-29z1218…D-29z1222)')
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1216): **round 369 = RETRO 369**'))
lines[i] = '  ძველი (round 369-ის დაგეგმვა): ' + lines[i][2:]
lines.insert(i + 1, '  - **Round 369 = RETRO 369 — მზადაა (C round 369 PASS, `browserVerified` true, `realVerified` true; gate 369 გამოტოვდა — store-ში ცვლილება არ იყო, baseline რჩება `29f4b4d`; D-29z1218).** '
                    'გაიარა: SOURCE-SCOPE, CLAIMS, RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-L57, RT-SABA, RT-SCREEN, G369-AUTH და STUDIO-SMOKE-369 ორივე viewport-ზე. '
                    'C369-L1 (Low, B): retro-369 §10 და lessons l.3 შესწორდა (R11-P1e და chain-ის range-ები ჩამოთვლილია), C ამოწმებს round 370-ის RT-FIX-ით. C369-L2 (Low, B spec) დაიხურა: cross-lane გადატანის Undo-ს სახელია „Undo: Move to track — <lane>“.')
lines.insert(i + 2, '  - **Round 370 = PERF-11a — მუშავდება (D-29z1219…D-29z1222).** `@microsoft/signalr` იტვირთება მხოლოდ chat-ის დაწყებისას (ChatContext, dynamic import); `/studio*`-ზე framer-ის page transition აღარ არის (ახალი `RouteTransition`, key-იანი `.page-transition-wrapper`), ამიტომ SSR HTML-ში `opacity:0` აღარ არის. '
                    'B-ის გაზომვა (perf spec, production build): `/studio-lab` JS 378,121 → 362,477 B, `/` 264,641 → 250,526, `/studio/middle-east` 286,109 → 270,648; FCP − DCL 358 → 6 ms (record). სამი encoded-bytes row ხდება assert (≤ 372,000 / 258,000 / 278,000). '
                    'PERF-11b (lazy Firebase, დაცული `auth.ts`) → root/Saba-ს მოთხოვნა `b-round-369/root-request-perf11b-firebase-lazy.md` (არ ბლოკავს); PERF-11c — ArrangementContext-ის leaf consumer-ები. perf-plan-ის 230 KB loop-ის შიგნით მიუღწევადია (D-29z1220). მტკიცებულება: `b-round-369/`.')
lines.insert(i + 3, '  შემდეგი (D-29z1222): **round 370 = PERF-11a** → REGRESSION (პირველი დაგეგმვა 2026-11-08-ზე ან შემდეგ) → PERF-11c → PERF-11b (თუ root/Saba უპასუხებს) → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM '
                    '→ STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). SYS-R369-STEM-CACHE-WRITE-COORDINATOR — როცა root ARCH-CHECKPOINT-PERF9-STEM-CACHE-ს უპასუხებს (18 მოთხოვნიდან არცერთს პასუხი არ აქვს).')
j = next(k for k, l in enumerate(lines) if l.startswith('| RETRO 369 |'))
lines[j] = ('| RETRO 369 | **მზადაა** (C round 369 PASS, D-29z1218; gate 369 გამოტოვდა, store-ში ცვლილება არ ყოფილა) — `retros/retro-369.md`, `lessons.md` (60 ხაზი), `user-review/screen-review-369.md`. '
            'C369-L1 შესწორდა (RT-FIX round 370-ში), C369-L2 დაიხურა. SYS-R369 — პირობითი, root-ის პასუხს ელოდება. |')
P.write_text('\n'.join(lines))
DONE.write_text('ok\n')
print('ok')
