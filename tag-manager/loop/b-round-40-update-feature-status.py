P = 'feature-status.md'
L = open(P, encoding='utf-8').read().split('\n')
assert L[2].startswith('განახლდა: 2026-10-28, B round 39.')
L[2] = ("განახლდა: 2026-10-28, B round 40. round 40 **PASS** (C R40-1…R40-7, realVerified=true, 1 low docs ბაგი C-R40-01). TM-B42 → **done**, D-46 verified. "
        "root gate published `e386cca` (round 40), review COMMIT OK (0 critical/high/medium; low: D-46 decision log-ში არ წერია RR-R40-01; RR-R40-02 დადასტურება; RR-R40-03 real-app hover — C-მ უკვე გაზომა; არქიტექტურის შენიშვნა RR-R40-04 `IconButton`). "
        "ეს არის round 41-ის baseline. round 41 = **TM-B43** (low, მხოლოდ docs): component-specs.md-ის SchemaEditor სექცია კოდს ემთხვევა (C-R40-01/A-R40-01, A-R40-04(a)), D-46-ის bullet და ჩანაწერი (22) `docs/bugs/001`-ში (A-R40-02/RR-R40-01), README 22/13/9. "
        "TM-B43-ის შემდეგ ყველა დარჩენილი item Saba-ს გადაწყვეტილებას (D-07/TM-T1-MIG, TM-T1-DUP, D-12/TM-B08, D-10/TM-B11, TM-B05, TM-B06, TM-T2/TM-T2-DATA, RR-R35-02, B-R36-01) ან root-ის Actions link-ს (TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14) ელოდება. სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")
L.insert(3, "")
L.insert(4, ("**round 40 დახურულია (C PASS, R40-1…R40-7, realVerified=true):** მხოლოდ 5 owned path, +/- ხაზები (42) == `b-round-39-exp/prototype.diff`, docs/bugs/001 მხოლოდ 24/317. "
             "build-ის CSS: `:enabled:not([aria-disabled=\"true\"]):hover` ხუთ variant-ზე, `:enabled:hover` ოთხ SchemaEditor ადგილზე, plain `.hover\\:bg-brand-hover` 0. "
             "real app (Playwright `_electron`, xvfb, mouse hover, `getComputedStyle`), ძველი `24e9723` vs ახალი: H1/H2/H4/H5/H6/H7/H8/H9/H10 (disabled / `aria-disabled` / Applying) ძველზე იცვლება, ახალზე rest == hover; "
             "H0/H3/H3b/H6b/H7b/H9/H10 rest/H11 enabled/Back და Open Folder ახალზე იცვლება ძველის იგივე მნიშვნელობებით; rest-ის ყველა მნიშვნელობა old == new; `pageErrors` []. "
             "K2: focus Save Tags-ზე რჩება, 1 `meta:write`, ffprobe + music-metadata `ICAT=C40Keyb`, სხვა ფაილების sha256 უცვლელი. mutant-ები m1–m6 მოკლულია, survivor-ები grep-ით ეკვივალენტურია. "
             "gate: verifyCommand exit 0, Biome 0/8, 310/93/7, `--retries=0` 7/7. Reference/Deviations 1–4 დადასტურდა. "
             "დახურული finding-ები: RR-R38-01, RR-R38-04, B-R39-01, RR-R40-02 (დადასტურება), RR-R40-03 (C R40-3/Dev1 გაზომვა). ახალი: C-R40-01 = A-R40-01 (chip spec) → TM-B43; A-R40-02 = RR-R40-01 (D-46 log) → TM-B43; A-R40-04 (a) row `py-1` → TM-B43, (b) plain disabled `<button>`-ზე `cursor-not-allowed` არ არის → record B-R39-02-თან; A-R40-03 (AudioPlayer conditional class) → record; RR-R40-04 (`IconButton`) → signal. C-ის `IKEY=\"\"` შენიშვნა არსებული C-R1-01-ია."))

def repl_prefix(prefix, new):
    idx = [i for i, l in enumerate(L) if l.startswith(prefix)]
    assert len(idx) == 1, prefix
    L[idx[0]] = new

repl_prefix('| TM-B42 |', "| TM-B42 | disabled ღილაკები hover-ზე ფერს იცვლიდა (ძველი ქცევა, B-R39-01). hover feedback მხოლოდ enabled, არა-`aria-disabled` ღილაკზე: `Button` variant-ები `enabled:not-aria-disabled:hover:`, SchemaEditor fieldset ღილაკები `enabled:hover:`. UX: Reference R1–R4 + Deviations | **done** (round 40, `e386cca`) | C R40 PASS (R40-1…R40-7, realVerified=true): CSS selector-ები; real app old/new hover — disabled ნაბიჯებზე rest == hover, enabled უცვლელი; K2 ICAT ffprobe + music-metadata; m1–m6 მოკლულია; gate 310/93/7; review COMMIT OK | D-46 |")
i = [k for k, l in enumerate(L) if l.startswith('| TM-B42 |')][0]
L.insert(i + 1, "| TM-B43 | მხოლოდ docs: component-specs.md-ის SchemaEditor სექცია = `SchemaEditor.tsx` (structure, row `py-1.5`, icon ღილაკები და chip `enabled:hover:`, Done `aria-disabled`/`aria-busy`); D-46 bullet + ჩანაწერი (22) `docs/bugs/001`-ში; README 22/13/9 | **in_progress** (low), round 41 | C-R40-01, A-R40-01, A-R40-02, RR-R40-01, A-R40-04(a); B R40 (`b-round-40-exp/prototype.diff`, dry-run `e386cca`-ზე) | D-46 |")

for fid in ['RR-R38-01', 'RR-R38-04', 'B-R39-01']:
    idx = [k for k, l in enumerate(L) if l.startswith('| ' + fid + ' |')]
    assert len(idx) == 1, fid
    parts = L[idx[0]].rstrip().rstrip('|').rsplit('|', 1)
    L[idx[0]] = parts[0] + '| **closed: TM-B42 round 40 (C PASS)** |'

j = [k for k, l in enumerate(L) if l.startswith('| B-R39-02 |')][0]
rows = [
    "| C-R40-01 | low | component-specs.md:376 chip ისევ `hover:text-foreground hover:border-brand`; კოდი `enabled:hover:`; SchemaEditor სექცია baseline-ზეც ძველი იყო (container, `py-1`) | **TM-B43** round 41 |",
    "| A-R40-01 | low | იგივე, რაც C-R40-01 (frozen diff-ის გარეთ) | **TM-B43** round 41 (C-R40-01-ის dup) |",
    "| A-R40-02 | low | D-46 docs-ში ციტირებულია, `docs/bugs/001`-ის decision log D-45-ით მთავრდება | **TM-B43** round 41 |",
    "| RR-R40-01 | low | review: D-46-ის ქართული ჩანაწერი D-45-ის შემდეგ (variant-ები, icon ღილაკები, უარყოფილი ალტერნატივა, რატომ არ არის ტესტი) | **TM-B43** round 41 (= A-R40-02) |",
    "| RR-R40-02 | info | დადასტურება: 24/317 `button.tsx:36` სწორია; SchemaEditor-ის ref-ები არ გადაადგილდა | closed (ქმედება არ სჭირდება) |",
    "| RR-R40-03 | low | `aria-disabled` ღილაკი real app-ში ერთხელ hover-ით შესამოწმებელია (cursor, opacity) | **closed**: C R40-3 / Dev1 (H1/H2/H4 `not-allowed`, 0.5, old == new; Dev3 focus ring) |",
    "| RR-R40-04 | info | არქიტექტურის signal: საერთო forwardRef `IconButton` (`ui/`), რომელიც D-46-ის prefix-ს და disabled opacity-ს ფლობს | signal |",
    "| A-R40-03 | info | AudioPlayer disabled hover-ს conditional class-ით აცილებს, არა `enabled:hover:`-ით; ქცევა იგივეა (H11) | record |",
    "| A-R40-04 | low | (a) spec row `py-1` vs კოდი `py-1.5`; (b) SchemaEditor-ის natively disabled plain `<button>`-ებს `cursor-not-allowed` არ აქვთ (B-R39-02-ის მსგავსი) | (a) **TM-B43** round 41; (b) record (UX, reference-first) |",
]
for k, r in enumerate(rows):
    L.insert(j + 1 + k, r)

d = [k for k, l in enumerate(L) if l.startswith('| D-46 |')]
assert len(d) == 1
L[d[0]] = L[d[0]].replace("| planned (round 40); კონტრაქტი: none (მხოლოდ renderer UI) |", "| verified (C R40 PASS), published `e386cca` (TM-B42); decision log-ის ჩანაწერი TM-B43-ში (round 41); კონტრაქტი: none (მხოლოდ renderer UI) |")
assert 'verified (C R40 PASS)' in L[d[0]]
open(P, 'w', encoding='utf-8').write('\n'.join(L))
print('ok')
