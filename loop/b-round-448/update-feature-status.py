"""B round 448 -> 449 feature-status update. Idempotent (update-feature-status.done)."""
import os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-448/update-feature-status.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/feature-status.md'
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა:'), lines[2][:40]
lines[2] = ('განახლდა: 2026-11-11 · ავტორი: B (round 448 → round 449 დაგეგმვა, D-29z1593…D-29z1595) · წესი: '
            '`docs/technical/studio-real-workspace/agent-workflow.md` (+ policy-ის SABA-B-4, SABA-B-7, SABA-B-8 და SABA-B-9/10/11 სექციები)')
idx = next(i for i, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1590…D-29z1591): **round 448 = STORE-2b-2b'))
lines[idx] = '  ძველი: ' + lines[idx][2:]
new = [
    '  - **Round 448 = STORE-2b-2b (Hire-Us-ის შიდა e-mail) — მზადაა (D-29z1593).** C round 448 PASS: C1–C6, C8–C13, `browserVerified`/`realVerified` true, '
    '0 ბაგი (`c-round-448.json`); C7 (რეალური გაგზავნა Brevo-თი) BLOCKED — cloud-ში key არ არის. Gate 448 გამოქვეყნდა `48e16b8` (review: COMMIT OK; verify 281/4119). '
    'e-mail ახლა ორივე client-ში იკითხება: HEAD-ზე ღია client-ში 12-დან 10 ტექსტი ვერ აკმაყოფილებდა კონტრასტს, ახლა 0 (მინ. 7.06:1). '
    'B-R447-HIREUS-EMAIL-LIGHT-CLIENT დაიხურა. რეალური Gmail/Outlook/Apple Mail — Tech Lead-ის შემოწმება TLM-R448-HIREUS-EMAIL-CLIENTS (ვადა RETRO 465). '
    'A-ს reviewer-ის M1 (template-ის golden ტესტი არ არის) B-მ Low-ად შეაფასა მიზეზით (HE4/HE5 + C4) და გადავიდა `deferred_low_polish`-ში; RETRO 450-ის კანდიდატია.',
    '  შემდეგი (D-29z1594…D-29z1595): **round 449 = STORE-2b-3a (gradient ტექსტი ქრება) — მუშავდება.** STORE-2b-3 ოთხ ეტაპად გაიყო: 2b-3a gradient ტექსტი, '
    '2b-3b glow ჩრდილები (`--shadow-glow`, `ui/Button`), 2b-3c დარჩენილი ცოცხალი teal CSS, 2b-3d მკვდარი token-ები და წესები (LEGACY cleanup-თან ერთად). '
    'ამ რაუნდში სათაურებში გამოყოფილი 8 სიტყვა (home hero „CZABA“, „Releases“, „Studio“, „Inner Circle“, `/about`-ის ორი, 404-ის „Sound“ და LeadMagnet-ის eyebrow) '
    'teal gradient-ის ნაცვლად სათაურის light ink-ით (#ECE6DA) გამოჩნდება — product-designer-ის გადაწყვეტილება (brass უარყოფილია: ბმულს ჰგავს). '
    'B-ის sketch-ზე Chromium-ში: 24 row (8 სიტყვა × 3 viewport) — HEAD-ზე 34–80 % teal, sketch-ზე 0, კონტრასტი ≥ 13.6, ზომები და ხაზები უცვლელი; '
    'LeadMagnet-ის ტექსტი იგივეა; `/studio-lab` 0 px. tech-lead: v2 APPROVE-WITH-CHANGES → ორი Medium (ტესტის regex, „0 importer“-ის დაცვა) v3-ში გასწორდა → APPROVE. '
    'სამი მკვდარი home სექცია (ArtistBio, Testimonials, VideoShowcase) და `.loading-brand` არ იცვლება — გადადის LEGACY-DEAD-STORE-COMPONENTS-ში. '
    '**Saba-სთვის კითხვები:** SABA-Q-TESTIMONIALS-UNMOUNTED — keep-list-ის testimonials („Netflix Original Score“) 2026-10-02-დან (`a208b4c`) არცერთ გვერდზე არ ჩანს; '
    'დავაბრუნოთ მთავარ გვერდზე თუ `/about`-ის სტატისტიკა ჩაითვალოს? SABA-Q-LEADMAGNET-EYEBROW-TONE — popup-ის „CZABA“ light ink-ით დარჩეს თუ caption ნაცრისფრით? '
    'Safari — Tech Lead-ის შემოწმება TLM-R449-WEBKIT-HEADING-INK. შემდეგ: **round 450 = RETRO** (436–449), მერე 2b-3b… REGRESSION 2026-11-13-დან.',
]
lines[idx:idx] = new
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
open(DONE, 'w').write('done\n')
print('feature-status updated at line', idx + 1)
