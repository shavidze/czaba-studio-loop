import json
import sys

root = sys.argv[1]
loop = root + '/tmp/studio-real-loop/'
plan = root + '/docs/technical/studio-real-workspace/plan.md'


def edit(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        if a not in s:
            print('MISSING in', path, ':', a[:70])
            continue
        s = s.replace(a, b)
    open(path, 'w', encoding='utf-8').write(s)


edit(loop + 'b-round-23.md', [
    ('**Advisor:** ხელმისაწვდომი იყო. B-მ ის orientation-ის შემდეგ, წერამდე, ერთხელ გამოიძახა და რჩევა გამოიყენა:',
     '**Advisor:** ხელმისაწვდომი იყო. B-მ ის ორჯერ გამოიძახა: orientation-ის შემდეგ, წერამდე, და ხელახლა წერის შემდეგ. ორივე რჩევა გამოიყენა.\n\nპირველი გამოძახების შედეგად:'),
    ('- C ყოველ round-ში NUL-ის რაოდენობას ინფორმაციად წერს.\n',
     '- C ყოველ round-ში NUL-ის რაოდენობას ინფორმაციად წერს.\n\nმეორე გამოძახების შედეგად:\n- ყველა consumer შემოწმდა. გაყინული `render-budget.test.tsx` render-ებს `fiber.type.name`-ით ითვლის, ამიტომ `forwardRef` მას ჩააგდებდა და მთელ body-საც ხელახლა დააშორებდა (re-indent). B-მ `forwardRef`-ის ნაცვლად `panelRef` prop აირჩია (§4.1);\n- R24-* ID-ების კოლიზია არ არის;\n- library separator-ის expand-ის შენიშვნა დაემატა.\n'),
    ('   - **`nextElementSibling` (l.447, l.474) → `detailPanelRef`** + `forwardRef` `ArrangementDetailPanel`-ზე. ქცევა არ იცვლება. Oracle-ებია არსებული R11-P2a ტესტი (l.543, უცვლელი) და C-ის R24-F.',
     '   - **`nextElementSibling` (l.447, l.474) → `detailPanelRef`**, რომელიც `ArrangementDetailPanel`-ს optional `panelRef` prop-ით გადაეცემა. Precedent-ია `ArrangementLibrary`-ის `asideRef`/`bodyRef`. `forwardRef` არ გამოიყენება, რადგან:\n     - გაყინული `render-budget.test.tsx` render-ებს ფუნქციის სახელით (`fiber.type.name`) ითვლის; `forwardRef` object-ის fiber-ზე ეს რაოდენობა 0 გახდებოდა და ტესტი ჩავარდებოდა;\n     - inline wrap-ის გამო Biome ~250-ხაზიან body-ს ხელახლა დააშორებდა (re-indent).\n\n     ქცევა არ იცვლება. Oracle-ებია არსებული R11-P2a ტესტი (l.543, უცვლელი), უცვლელი `render-budget`/`detail-panel` ტესტები და C-ის R24-F.'),
])

edit(loop + 'b-next.json', [
    ('(2) scroller.nextElementSibling (l.447, l.474) becomes an explicit detailPanelRef via forwardRef on ArrangementDetailPanel, with no behaviour change; the R11-P2a refit test at l.543 is the oracle.',
     '(2) scroller.nextElementSibling (l.447, l.474) becomes an explicit detailPanelRef, passed through an optional panelRef prop on ArrangementDetailPanel (the ArrangementLibrary asideRef precedent). It is not a forwardRef: the frozen render-budget.test.tsx counts renders by function name, and an inline wrap would re-indent the body. There is no behaviour change; the R11-P2a refit test at l.543 is the oracle, and render-budget/detail-panel tests stay unchanged and green.'),
])

edit(loop + 'feature-status.md', [
    ('`scroller.nextElementSibling` → ცხადი `detailPanelRef` (`forwardRef` `ArrangementDetailPanel`-ზე, ქცევის ცვლილების გარეშე).',
     '`scroller.nextElementSibling` → ცხადი `detailPanelRef`, `ArrangementDetailPanel`-ის `panelRef` prop-ით (`asideRef`-ის precedent; `forwardRef` არა, რადგან გაყინული `render-budget` ტესტი render-ებს სახელით ითვლის). ქცევა არ იცვლება.'),
    ('Round 24 (მიმდინარე): `StudioWorkspace.tsx` (Home separator-ზე, `forwardRef`).',
     'Round 24 (მიმდინარე): `StudioWorkspace.tsx` (Home separator-ზე, `panelRef`).'),
])

edit(plan, [
    ('  - **`nextElementSibling` → `detailPanelRef`** (`forwardRef` `ArrangementDetailPanel`-ზე, React 18). ქცევა არ იცვლება; oracle არის არსებული R11-P2a refit ტესტი (`track-layout.test.tsx` l.543) და C-ის R24-F.',
     '  - **`nextElementSibling` → `detailPanelRef`**, რომელიც `ArrangementDetailPanel`-ს optional `panelRef` prop-ით გადაეცემა (`ArrangementLibrary`-ის `asideRef`/`bodyRef`-ის precedent). `forwardRef` არ გამოიყენება, რადგან:\n    - გაყინული `render-budget.test.tsx` render-ებს `fiber.type.name`-ით ითვლის და `forwardRef`-ის object type მას ჩააგდებდა;\n    - inline wrap-ის გამო body ხელახლა დაშორდებოდა (re-indent).\n\n    ქცევა არ იცვლება. Oracle-ებია არსებული R11-P2a refit ტესტი (`track-layout.test.tsx` l.543), უცვლელი `render-budget`/`detail-panel` ტესტები და C-ის R24-F.'),
    ('`nextElementSibling` → `forwardRef` (D-29o) |', '`nextElementSibling` → `panelRef` prop (D-29o) |'),
    ('A-ს round-11 follow-up-ები, ნაწილი 2 (Home separator-ებზე, `forwardRef`; D-29o).',
     'A-ს round-11 follow-up-ები, ნაწილი 2 (Home separator-ებზე, `panelRef`; D-29o).'),
    ('Round 21-ის, Round 22-ისა და Round 23-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
     'Round 21-ის, Round 22-ისა და Round 23-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია. Round 23-ის შემდეგ B-მ ის ორჯერ გამოიძახა: წერამდე და წერის შემდეგ.'),
])

bp = loop + 'backlog.json'
d = json.load(open(bp, encoding='utf-8'))
d['current_task'] = d['current_task'].replace('scroller.nextElementSibling -> explicit detailPanelRef via forwardRef on ArrangementDetailPanel', 'scroller.nextElementSibling -> explicit detailPanelRef via an optional panelRef prop on ArrangementDetailPanel (asideRef precedent; no forwardRef because the frozen render-budget.test.tsx counts renders by function name)')
d['advisor_used_by_B'] += '; and again after writing (advice applied: forwardRef replaced by a panelRef prop after B found that render-budget.test.tsx counts fibers by function name; consumer check done; no R24-* ID collision; library separator expand note)'
for r in d['rounds']:
    if r.get('round') == 24:
        r['items'][0] = r['items'][0].replace('detailPanelRef via forwardRef on ArrangementDetailPanel replacing scroller.nextElementSibling', 'detailPanelRef passed through an optional panelRef prop on ArrangementDetailPanel (no forwardRef: render-budget name counting, re-indent) replacing scroller.nextElementSibling')
for pr in d['planned_rounds']:
    if pr.get('round') == '22-24':
        pr['items'][2] = pr['items'][2].replace('(forwardRef on ArrangementDetailPanel)', '(panelRef prop on ArrangementDetailPanel; forwardRef rejected in D-29o)')
for it in d['items']:
    if it['id'] == 'SRW-11B':
        it['round24_note'] = it['round24_note'].replace('forwardRef detail ref', 'panelRef detail ref')
json.dump(d, open(bp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
json.load(open(loop + 'b-next.json', encoding='utf-8'))
print('done')
