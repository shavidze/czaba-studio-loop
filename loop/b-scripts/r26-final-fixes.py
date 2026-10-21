import json

base = 'C:/Apps/czaba-project/tmp/studio-real-loop/'


def edit(path, pairs, newline):
    s = open(path, encoding='utf-8').read()
    for old, new in pairs:
        assert s.count(old) == 1, (path, s.count(old), old[:70])
        s = s.replace(old, new)
    open(path, 'w', encoding='utf-8', newline=newline).write(s)


edit(base + 'current-task.md', [
    ("   - the frozen `render-budget.test.tsx` (how renders are counted), `master-ui.test.tsx` (its fake `AudioContext`, l.135–160, and its 0-render test) and `graph.test.ts` l.127–145 (`master.outputs` equals `[ctx.destination]`).\n",
     "   - the frozen `render-budget.test.tsx` (how renders are counted), `master-ui.test.tsx` (its fake `AudioContext`, l.135–160, and its 0-render test) and `graph.test.ts` l.127–145 (`master.outputs` equals `[ctx.destination]`).\n"
     "\n"
     "   **B grepped the frozen `master-ui.test.tsx` (l.570–636):** it has no structural assertion that a third control would break — only `group.contains(...)`, `compareDocumentPosition` ordering (`exit` < `Master Mute`, `Master Mute` < `Master Volume`, `Master Volume` < `Play`; no \"immediately precedes\"), the readout text, and a render count filtered by the name `ArrangementMaster`. Its fake `AudioContext` has no `createAnalyser`, so it exercises the guarded path. A correct implementation keeps it green unchanged; if it fails, report it as a finding and do not edit it.\n"),
    ("**Rendering contract:** `ArrangementMaster` renders **0 times per Play frame**, including frames with signal and frames after the latch, and at most **once per latch transition**.",
     "**Rendering contract:** `ArrangementMaster` **and every component it renders** (for example an extracted meter sub-component) render **0 times per Play frame**, including frames with signal and frames after the latch, and at most **once per latch transition**."),
    ("**Oracle:** the max `data-level-db` over the second equals the tap's max |x| over the same second in dBFS, **±1.0 dB**.",
     "**Oracle:** the max `data-level-db` over the second equals the tap's max |x| over the same second in dBFS, **±1.0 dB**. The analyser reads the trailing `fftSize / sampleRate` (≈ 85 ms at 4096 / 48 kHz), so C extends the tap window by that length before its start (or compares per frame). Report the `fftSize` and `sampleRate` C read from the page."),
    ("With C's fiber wrapper (round 25 `render-count-browser.txt` method): 2 s of playback with signal below full scale → `ArrangementMaster` renders **0** times;",
     "With C's fiber wrapper (round 25 `render-count-browser.txt` method): 2 s of playback with signal below full scale → `ArrangementMaster` and every component inside it render **0** times;"),
], '\r\n')

edit(base + 'b-round-25.md', [
    ("გააუაროსოს", "გააუარესოს"),
    ("6. **Render:** meter-ის frame ცალკე store/context-ით და DOM-ში ჩაწერით მიეწოდება. `ArrangementMaster` frame-ზე 0-ჯერ რენდერდება, latch-ის გადასვლაზე ≤ 1-ჯერ.",
     "6. **Render:** meter-ის frame ცალკე store/context-ით და DOM-ში ჩაწერით მიეწოდება. `ArrangementMaster` და მისი ყველა შვილი კომპონენტი frame-ზე 0-ჯერ რენდერდება, latch-ის გადასვლაზე ≤ 1-ჯერ.\n"
     "   - B-მა გაყინული `master-ui.test.tsx` (l.570–636) grep-ით შეამოწმა. მასში არ არის სტრუქტურული assertion, რომელსაც მესამე ღილაკი ჩააგდებდა: მხოლოდ `contains`, `compareDocumentPosition`-ის რიგი (`<`, არა „უშუალოდ წინ“) და `ArrangementMaster`-ის render count. მისი fake `AudioContext`-ს `createAnalyser` არ აქვს, ამიტომ guard-ის გზას ამოწმებს. ფაილი გაყინული რჩება.\n"
     "   - R26-ML: analyser ბოლო ≈ 85 ms-ს კითხულობს, ამიტომ C tap-ის ფანჯარას ამ სიგრძით აფართოებს."),
], '\r\n')

p = base + 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
last = b['planned_rounds'][-1]
assert last['round'] == '25-28'
last['round'] = '25-29'
last['items'] = [
    '25: SRW-13 stage 1 Master Volume/Mute + export overload report (D-29p) - C PASS',
    '26: SRW-13 stage 2a live Master meter + latched Master Peak/Clip + R26-X (D-29q) - dispatched',
    '27: SRW-13 stage 2b per-track meters (lane geometry contract)',
    '28: SRW-13 stage 3 FB-04 clip gain',
    '29: SRW-13 stage 4 FB-05 pan + fader-click UX + round-9 M1/L8',
    'C-R23-01 goes first as soon as the Tech Lead answers (worsened in round 25: 8 NUL, visible SSR text)',
    'then SRW-14..20 in dependency order, SRW-21 adapter contract, full regression + root check, T12',
]
open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(b, ensure_ascii=False, indent=2) + '\n')
print('ok')
