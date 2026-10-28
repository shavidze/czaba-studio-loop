P = 'feature-status.md'
L = open(P, encoding='utf-8').read().split('\n')


def idx(prefix):
    r = [i for i, l in enumerate(L) if l.startswith(prefix)]
    assert len(r) == 1, (prefix, r)
    return r[0]


L[2] = ("განახლდა: 2026-10-28, B round 39. round 39 **PASS** (C R39-1…R39-5, realVerified=true, ბაგი არ არის). TM-B41 → **done**. "
        "root gate published `24e9723` (round 39), review COMMIT OK (0 critical/high/medium, 2 low RR-R39-01/02, 1 არქიტექტურის შენიშვნა RR-R39-03). "
        "ეს არის round 40-ის baseline. round 40 = **TM-B42** (low, UX, D-46): B-ის real-app გაზომვამ (`b-round-39-exp/`) აჩვენა, რომ disabled ღილაკის hover cue "
        "**ძველია** — `ea4a1cb` (native `disabled`) და `24e9723` (`aria-disabled`) ყველა ნაბიჯზე იდენტურია (Chromium `:hover`-ს native disabled-ზეც ამთხვევს; B-R39-01). "
        "ე.ი. RR-R38-01 D-45-ის regression არ არის, მაგრამ cue reference-ს ეწინააღმდეგება (Bootstrap: disabled ღილაკზე hover არ ჩნდება; in-app AudioPlayer). "
        "fix: `Button` variant-ები `enabled:not-aria-disabled:hover:`, SchemaEditor-ის fieldset ღილაკები `enabled:hover:`; prototype-ზე ყველა disabled ნაბიჯი rest == hover, "
        "enabled control-ები ისევ იცვლება, renderer 310/310. RR-R35-02 (timeout) — Saba-ს კითხვა. სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")

i = idx('**round 38 დახურულია')
L.insert(i, "")
L.insert(i, ("**round 39 დახურულია (C PASS, R39-1…R39-5, realVerified=true):** `src/` byte-identical `96f1e45`-თან; მხოლოდ 7 owned path; "
             "`dom-queries.test.ts`/`dom-queries.ts` `cmp`-identical B-ის draft-ებთან, +/- ხაზები (80) == `prototype.diff`; docs/bugs/001 მხოლოდ 279/310/328, README უცვლელი; "
             "TESTING.md მხოლოდ §6. red (HEAD helper) 1/309 of 310 — მხოლოდ (q4); green 310/310 ×2; თითო ფაილი ცალკე მწვანე. mutant-ები: B-ის HM-1…HM-5, PM-6, CM-3, CM-8 "
             "და C-ის C-1…C-8 — ყველა მოკლულია. gate: verifyCommand exit 0, Biome 0/8, 310/93/7, `--retries=0` 7/7, real app smoke. docs PASS. "
             "დახურული finding-ები: C-R36-01, RR-R36-02, RR-R36-03, R36-A-02, RR-R36-04, C-R37-01, B-R37-02, C-R38-01, RR-R38-03. "
             "ახალი: RR-R39-01 ((f9) store reset) → closed (`resetAllStores` აღადგენს; C-მ ცალკეც და სრულ suite-შიც გაუშვა); RR-R39-02 ((x8) store suite-ში გადატანა) → record; "
             "RR-R39-03 (`queryButtonByText`) → signal; A-R39-01 ((f9) substring) → record; A-R39-02 (§6 RegExp trim-ის ფორმულირება) → record; "
             "B-R39-01 (hover cue ძველია) → TM-B42; B-R39-02 (fieldset-ის ისრებს Applying-ის დროს cursor default) → record."))

i = idx('| TM-B41 |')
L[i] = ("| TM-B41 | test hygiene (test-only): `dom-queries` unit ტესტები (q1)–(q4) uniqueness / მთლიანი string / trim + RegExp `g`/`y`-ის უარყოფა helper-ში; "
        "(x8) D-44-ის რიგი; (f9) ცარიელი field list-ის Done; (b1)-ის სახელი; TESTING.md §6 | **done** (round 39, `24e9723`) | "
        "C R39 PASS (R39-1…R39-5, realVerified=true): red 1/310 → 310/310 ×2; HM-1…HM-5/PM-6/CM-3/CM-8 + C-1…C-8 მოკლულია; gate 310/93/7; review COMMIT OK | — |")
i = idx('| TM-B42 |')
L[i] = ("| TM-B42 | disabled ღილაკები hover-ზე ფერს იცვლის (ძველი ქცევა, B-R39-01: `ea4a1cb` == `24e9723`). hover feedback მხოლოდ enabled, არა-`aria-disabled` ღილაკზე: "
        "`Button` variant-ები `enabled:not-aria-disabled:hover:`, SchemaEditor fieldset ღილაკები `enabled:hover:`. UX: Reference R1–R4 + Deviations | "
        "**in_progress** (low), round 40 | RR-R38-01, RR-R38-04, B-R39-01; B R39 (`b-round-39-exp/`): hover probe old/new/proto, proto renderer 310/310 | D-46 |")

repl = {
    '| C-R36-01 |': 'closed: TM-B41 round 39 (C PASS)',
    '| RR-R36-02 |': 'closed: TM-B41 round 39 (C PASS)',
    '| RR-R36-03 |': 'closed: TM-B41 round 39 (C PASS)',
    '| RR-R36-04 |': 'closed: TM-B41 round 39 (C PASS)',
    '| C-R37-01 |': 'closed: TM-B41 round 39 (C PASS, (x8))',
    '| B-R37-02 |': 'closed: TM-B41 round 39 (TESTING.md §6)',
    '| C-R38-01 |': 'closed: TM-B41 round 39 (C PASS, (f9))',
    '| RR-R38-03 |': 'closed: TM-B41 round 39 (C PASS)',
    '| RR-R38-01 |': '**TM-B42** round 40 (B-R39-01: ძველი cue, არა regression)',
    '| RR-R38-04 |': '**TM-B42** round 40 (B-R39-01: ძველი cue, არა regression)',
}
for pre, val in repl.items():
    i = idx(pre)
    parts = L[i].rstrip().rstrip('|').rstrip().split(' | ')
    parts[-1] = '**' + val + '**' if val.startswith('closed') else val
    L[i] = ' | '.join(parts) + ' |'

i = idx('| RR-R38-05 |')
new = [
    "| RR-R39-01 | low | (f9) `useSchemaStore.setState({ fields: [] })` პირდაპირ; უსაფრთხოა მხოლოდ store reset-ით | **closed**: `resetAllStores` `beforeEach`-ში აღადგენს `STANDARD_FIELDS`-ს; C R39-2 ცალკე და სრულ suite-ში |",
    "| RR-R39-02 | low | (x8) store-ის ტესტია component suite-ში; შეიძლება `tests/renderer/stores/file-store.test.ts`-ში გადავიდეს | record (მომავალი test round-ის ride-along) |",
    "| RR-R39-03 | info | არქიტექტურის signal: `queryButtonByText` (null, თუ არ არის); store-only შემოწმებები `stores/` suite-ებში | signal |",
    "| A-R39-01 | low | (f9) `toHaveTextContent(\"Done\")` substring-ია; `/^Done$/` უფრო მკაცრია; C-4/C-5/C-7 მაინც მოკლულია | record |",
    "| A-R39-02 | info | TESTING.md §6 trim-ს მხოლოდ string-ზე ახსენებს; RegExp-იც trim-ებულ ტექსტზე მოწმდება ((q3)/C-3) და ნაწილობრივ match-საც უშვებს | record (TESTING.md-ის შემდეგი შეხება) |",
    "| B-R39-01 | info | ფაქტი: Chromium `:hover`-ს native disabled ღილაკზეც ამთხვევს; `ea4a1cb` და `24e9723` იდენტურია (Save/Done bg `rgb(18,217,200)` → `rgb(29,237,219)`, fieldset-ის ისრების/X-ის ფერი იცვლება, Rescan/Add Field-ის bg იცვლება). cue ძველია, D-45-ის regression არ არის | **TM-B42** round 40 (D-46) |",
    "| B-R39-02 | info | fieldset-ით disabled ისრებს Applying-ის დროს cursor `default` აქვს (Add Field-ს `not-allowed`); `ea4a1cb`-შიც ასეა | record (TM-B42-ის scope-ში არ არის) |",
]
for k, row in enumerate(new):
    L.insert(i + 1 + k, row)

i = idx('| D-45 |')
L.insert(i + 1, ("| D-46 | hover feedback მხოლოდ იმ ღილაკზე, რომელიც მოქმედებს (TM-B42, მხოლოდ renderer styling): `Button` variant-ები `enabled:not-aria-disabled:hover:…`, "
                 "SchemaEditor-ის fieldset ღილაკები (ისრები, Trash2, Hide standard X, hidden-standard chip) `enabled:hover:…`. disabled / `aria-disabled` ღილაკი "
                 "ინარჩუნებს resting ფერს, opacity 0.5-ს და `cursor-not-allowed`-ს (D-45). უარყოფილი: `pointer-events-none` (Bootstrap) — `not-allowed` cursor დაიკარგებოდა. "
                 "Reference R1–R4, Deviations (round 40 task) | planned (round 40); კონტრაქტი: none (მხოლოდ renderer UI) |"))

open(P, 'w', encoding='utf-8').write('\n'.join(L))
print('ok')
