import json, sys
base = sys.argv[1]

def edit(path, pairs):
    s = open(path, encoding='utf-8').read()
    for old, new in pairs:
        assert s.count(old) == 1, (path, old[:70])
        s = s.replace(old, new)
    open(path, 'w', encoding='utf-8', newline='').write(s)

old42 = s42 = None
task = base + '/current-task.md'
s = open(task, encoding='utf-8').read()
i = s.index('### 4.2 R22-M2')
j = s.index('### 4.3 R22-V')
new42 = '''### 4.2 R22-M2 — the mute is a ramp, not a hard cut

Measure it on the **video beep tone**, not on music. Short RMS blocks on music follow the waveform, not the envelope. The beep is a steady tone at about −9.0 dBFS (round 21 decode); report its frequency from your decode.
- **Setup:** the R22-M1 layout, with the mute landing about **20 ms after a beep onset**. The beep lasts 100 ms, so t_m + 35 ms is still inside it.
- **Blocks:** master RMS in **2 ms** blocks. A block must cover at least one full period of the tone; 2 ms is enough for any beep ≥ 500 Hz. If the tone is lower, use one period and report it. L0 is the beep's steady RMS in the 10 ms before t_m.
- **Ramp exists:** the time from the first block ≥ 3 dB below L0 to the first block ≥ 23 dB below L0 is **≥ 3 ms**. With τ = 3 ms the exponential gives about 1.0 ms and 7.9 ms (6–8 ms apart at 2 ms blocks). A hard cut puts both in the same or adjacent block (≤ 2 ms).
- **Silent fast:** every block that starts ≥ t_m + 35 ms and is still inside the beep is < −80 dBFS.

One valid execution, plus at most 2 replacements for invalid ones.

'''
s = s[:i] + new42 + s[j:]
open(task, 'w', encoding='utf-8', newline='').write(s)

edit(task, [
    ('- **R22-A1, volume keeps its smoothing.** During playback, change the music track\'s volume between two non-zero values (real keys on the focused slider, or a synthetic drag; say which). Every spied call with a non-zero previous and non-zero new target has **τ = 0.015**. Check by ear-free measurement: no block-to-block step larger than the target change.',
     '- **R22-A1, volume keeps its smoothing.** During playback, change the music track\'s volume between two non-zero values (real keys on the focused slider, or a synthetic drag; say which). The oracle: every spied call with a non-zero previous target and a non-zero new target has **τ = 0.015**.'),
    ('  - vitest ≥ **1004** with 0 failures (999 plus at least 5 new tests). If the known',
     '  - vitest = 999 + the number of new tests A reports, with **at least 5 new `it` blocks** and 0 failures. If the known'),
    ('- A volume slider dragged to exactly 0 uses the short constant. This is accepted: arriving at silence fast is the mute intent.',
     '- A volume slider dragged to exactly 0 uses the short constant. This is accepted: arriving at silence fast is the mute intent.\n- **Accepted edge case:** right after an unmute (τ 0.003), another track\'s volume change re-sends this track\'s same target (0.8 → 0.8). That call is classified non-zero → non-zero and re-issued at τ 0.015 from the mid-ramp value. The ramp is already near the target and unmute stays well under 100 ms, so this is accepted. Use this disposition if the code-reviewer raises it; it is not a deviation.'),
    ('- **Round 23:** A round-11 follow-ups, part 1, in `ArrangementLane.tsx`: `aria-controls` on the lane fold button, `ring-inset` on the track name, the silent fold refusal during a gesture (it gets a status reason), plus the `ArrangementLane.tsx:661` reason text. This is three related lane-header items plus a comment-only line.',
     '- **Round 23:** A round-11 follow-ups, part 1, in `ArrangementLane.tsx`: `aria-controls` on the lane fold button, `ring-inset` on the track name, and the silent fold refusal during a gesture, plus the `ArrangementLane.tsx:661` reason text. That is three related lane-header items plus a comment-only line. **The UI contract for the refusal (status reason or not) is decided in round 23, not here.**'),
])

plan = sys.argv[2]
edit(plan, [('  - დამატებით R22-M2 ამოწმებს, რომ ramp ნამდვილად არსებობს: −3-დან −23 dB-მდე ≥ 3 ms. ასე hard cut-ით „გასწორება“ გამოირიცხება.',
             '  - დამატებით R22-M2 ამოწმებს, რომ ramp ნამდვილად არსებობს: video beep-ის მუდმივ ტონზე (არა მუსიკაზე), 2 ms-იან RMS block-ებში, −3-დან −23 dB-მდე ≥ 3 ms. ასე hard cut-ით „გასწორება“ გამოირიცხება.')])

b = base + '/b-round-21.md'
edit(b, [('4. **„Ramp არსებობს“ (R22-M2):** −3 dB-დან −23 dB-მდე ≥ 3 ms (ექსპონენტა ≈ 6.9 ms-ს იძლევა, hard cut < 1 ms-ს). ეს გამორიცხავს, რომ C-R21-01 click-იანი hard cut-ით „გასწორდეს“.',
          '4. **„Ramp არსებობს“ (R22-M2):** იზომება video beep-ის მუდმივ ტონზე, 2 ms-იან block-ებში. მუსიკაზე მოკლე block-ები waveform-ს მისდევს და არა envelope-ს. Mute beep-ის onset-იდან ~20 ms-ში ჯდება. −3 dB-დან −23 dB-მდე ≥ 3 ms: ექსპონენტა ~1.0 და ~7.9 ms-ს იძლევა, hard cut ≤ 2 ms-ს. ეს გამორიცხავს, რომ C-R21-01 click-იანი hard cut-ით „გასწორდეს“.\n4a. **Advisor-ის მეორე გამოძახება (წერის შემდეგ):** R22-M2 მუსიკიდან beep-ის ტონზე გადავიდა. R22-A1-ის ბუნდოვანი sub-oracle ამოიღო (მხოლოდ τ 0.015 spy-ით). Vitest-ის ქვედა ზღვარი ახლა არის 999 + A-ს ახალი ტესტები (≥ 5 `it`). Same-target re-send-ის edge case §2.1-ში მიღებულად ჩაიწერა. Round 23-ის fold-ის უარის UI კონტრაქტი round 23-ში გადაწყდება.')])

bl = base + '/backlog.json'
d = json.load(open(bl, encoding='utf-8'))
for it in d['items']:
    if it['id'] == 'SRW-03':
        for bug in it['open_bugs']:
            if bug.get('id') == 'C-R21-01':
                bug['routed_to'] = bug['routed_to'].replace('plus R22-M2 ramp-exists', 'plus R22-M2 ramp-exists (measured on the steady video beep tone, 2 ms RMS blocks, mute ~20 ms after a beep onset; -3 to -23 dB >= 3 ms)')
d['advisor_used_by_B'] += '; called again after writing (applied: R22-M2 on the beep tone with 2 ms blocks, R22-A1 spy-only oracle, vitest floor 999 + A count, same-target re-send edge accepted, round-23 refusal contract left open)'
json.dump(d, open(bl, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
