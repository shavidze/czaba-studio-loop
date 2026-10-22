import json

P = 'backlog.json'
b = json.load(open(P))
assert b['version'] == 85, b['version']
b['version'] = 86
b['updated'] = '2026-10-22 (B round 86 review -> round 87 task, D-29z52)'
b['current_task'] = (
    'current-task.md (round 87: D-29z52 - SRW-20 stage 3a: WAV clamp/measure/24-bit encode moved to a module worker '
    '(export-wav.ts pure + .worker.ts + .client.ts, main-thread fallback only when Worker is undefined, byte-identical); '
    'renderArrangementWav 4th options arg {onProgress} with OfflineAudioContext.suspend progress; progress store '
    'export-progress.ts outside exportState (useSyncExternalStore, no provider re-render); dialog <progress> + label per '
    'phase render / wav / load (indeterminate) / mp3; lab-owned mp3-encoder.client.ts (same unpkg core and byte-identical '
    'ffmpeg command, shared in-flight load, terminate+reset on timeout/failure, progress on/off); 120 s timer now covers '
    'the dynamic import; frozen-test grants export-mp3 (mock re-target + 3 call-shape lines), export-range-ui l.278/354/397/410, '
    'metronome-ui l.464; doc 076 l.4, new doc 077. Baseline HEAD 971141d, frozen b-round-86-r87-tree-sha256.txt 490)'
)
b['baseline_tree_at_round87'] = {
    'head': '971141d67a1dd33da8f1165de1d895bd62b4e022', 'status_lines': 0,
    'frozen_list': 'b-round-86-r87-tree-sha256.txt', 'entries': 490,
    'snapshots': 'b-round-86-r87-snapshots', 'protected': '4/4',
}
items = {it['id']: it for it in b['items']}
s20 = items['SRW-20']
s20['status'] = ('in_progress (stage 1 C PASS round 85, published 51e024a; stage 2 C PASS round 86 browserVerified=true '
                 'realVerified=true, published 971141d; R20-X1, R20-X2, R20-X3 pass; stage 3a worker+progress dispatched '
                 'round 87 D-29z52; stage 3b cancel planned; R20-X4 open; none deferred)')
for a in s20['acceptance']:
    if a['id'] == 'R20-X2':
        a['status'] = 'pass'
        a['evidence'] = ('C round 86 MP-MP3 (czaba-studio-lab.mp3, MPEG-1 L III 48 kHz stereo, Xing VBR avg 260 kbps, decoded '
                         '101.702 s, lag 0, corr 0.99984/0.99987), MP-RANGE (5.000 s, corr 0.99996), MP-BOTH (.wav then .mp3, '
                         'WAV <=1 LSB vs plain), MP-CDNFAIL (abort -> exact load-failure alert, 0 downloads, WAV still works, '
                         'retry after unroute succeeds), MP-TIMEOUT (1440: exact timeout alert at 120.394 s, 0 downloads), '
                         'MP-REUSE, MP-OVERLOAD, MP-MUTE, MP-KEYS, MP-NET; both viewports; browserVerified true; published '
                         '971141d. Production-bundle MP3 not run (no preview server in the cloud): open evidence')
    if a['id'] == 'R20-X3':
        a['evidence'] = a.get('evidence', '') + ('; re-checked C round 86 MP-X3 (with MP3 enabled: video option disabled '
                                                  'with the unchanged reason, fades line shown, only .wav/.mp3 downloads; both viewports; published 971141d)')
    if a['id'] == 'R20-X4':
        a['status'] = 'open (stage 3a round 87: responsiveness + progress; stage 3b: cancel)'
        a['baseline'] = ('B probe b-round-86/probe: 5-minute project (music clip + Ctrl+D x2 = 05:04.406) WAV export max rAF gap '
                         '445 ms at 971141d (normal 45-57 ms); MP3 conversion already in the ffmpeg worker (44 ms max gap)')
st2 = s20['stages'][1]
st2.update({
    'status': 'c_pass_published', 'browserVerified': True, 'realVerified': True,
    'c_round86_passed': ['X1-PROJECT', 'MP-FORMAT', 'MP-MP3', 'MP-RANGE', 'MP-BOTH', 'MP-WAV-UNCHANGED', 'MP-CDNFAIL',
                         'MP-TIMEOUT (1440 only, as specified)', 'MP-REUSE', 'MP-OVERLOAD', 'MP-MUTE', 'MP-KEYS', 'MP-X3',
                         'MP-NET', 'REG-HYD', 'G86-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)',
                         'T86-TARGETED', 'SOURCE-UNCHANGED'],
    'c_round86_not_run': ['production-bundle MP3 (no preview server in the cloud)'],
    'c_round86_bugs': [], 'notBrowserVerified': [],
    'published': '971141d67a1dd33da8f1165de1d895bd62b4e022',
    'evidence': ['c-round-86.md', 'c-round-86.json', 'gates/gate-round-86.json', 'gates/round-86/review.md'],
})
s20['stages'] = [s for s in s20['stages'] if s.get('stage') != '3']
s20['stages'] += [
    {'stage': '3a', 'round': 87, 'decision': 'D-29z52', 'status': 'dispatched',
     'scope': ('WAV clamp + overload measurement + 24-bit encode off the main thread (module worker, byte-identical, '
               'main-thread fallback only when Worker is undefined); render progress via OfflineAudioContext.suspend; '
               'progress store outside exportState; dialog <progress> + phase label (render / wav / load indeterminate / mp3); '
               'lab-owned MP3 encoder (same core + command, terminate/reset after timeout or failure, progress on/off); '
               '120 s timer covers the dynamic import'),
     'acceptance': ['R20-X4 (responsiveness + progress part)'],
     'c_ids': ['PX-WAV5', 'PX-MP35', 'PX-PHASES', 'PX-WORKER', 'PX-WAV-SAME', 'PX-MP3-SAME', 'PX-BOTH', 'PX-REUSE',
               'PX-CDNFAIL', 'PX-RETRY', 'PX-RANGE-SHORT', 'PX-KEYS', 'PX-X3', 'PX-NET', 'REG-HYD', 'G87-3',
               'T87-TARGETED', 'SOURCE-UNCHANGED'],
     'tech_lead': 'R87-T'},
    {'stage': '3b', 'status': 'planned',
     'scope': ('Cancel in every phase (render: stop resuming the suspended context; WAV: terminate the worker; load/MP3: '
               'reset the lab encoder), no file, exact cancelled message, next export works; abort on unmount (A-R86 L2); '
               'WAV + MP3 delivery note (GATE86-S2)'),
     'acceptance': ['R20-X4 (cancel part)']},
]
s20['files'] = sorted(set(s20.get('files', []) + [
    'app/lib/arrangement/export-wav.ts', 'app/lib/arrangement/export-wav.worker.ts', 'app/lib/arrangement/export-wav.client.ts',
    'app/lib/arrangement/export-progress.ts', 'app/lib/arrangement/mp3-encoder.client.ts',
    'app/lib/arrangement/__tests__/export-wav.test.ts', 'app/lib/arrangement/__tests__/export-progress.test.ts',
    'app/lib/arrangement/__tests__/mp3-encoder.test.ts', 'app/lib/arrangement/__tests__/export-progress-ui.test.tsx',
    'app/lib/arrangement/__tests__/metronome-ui.test.tsx']))
s20['ableton_round87'] = ('Live 12 manual 5.1.3.4/5.1.3.5 (b-round-84/web/managing-files.txt l.248, l.262-283, fetched 2026-10-22): '
                          'progress bar in the dialog confirmed for real-time and video rendering, resets per video pass; Cancel '
                          'stops and deletes the partial file (real-time). Offline audio progress bar: not stated (unconfirmed). '
                          'CZABA: per-phase progress bar in Export (render / WAV / encoder load / MP3); Cancel in stage 3b.')

closed = {
    'C-R85-L2': 'closed (C round 86 X1-PROJECT PASS both viewports: project radio enabled + checked with no range, reachable by Tab; published 971141d)',
    'GATE85-S2-REASON-DESCRIBEDBY': 'closed (C round 86 X1-PROJECT: aria-describedby resolves to the reason span; published 971141d)',
    'GATE85-S3-RANGE-VALIDITY-TWICE': 'closed (render-window.ts helper, round 86 RW1/RW2 + XU4 green; gate 86 review "good practice"; published 971141d)',
    'FFMPEG-DEV-WORKER': ('closed for the dev server (C round 86 MP-MP3/MP-REUSE: encoder loads ~3.4 s via optimizeDeps.exclude; '
                          'published 971141d); production-bundle MP3 remains open evidence PROD-MP3-UNVERIFIED'),
    'FFMPEG-LOAD-POLLER-HANG': ('open for the purchased path (frozen app/utils/ffmpeg.ts, owner root/Tech Lead); the /studio-lab '
                                'path gets its own resettable encoder in round 87 (D-29z52 R3, PX-RETRY)'),
}
for f in b['open_findings']:
    if f.get('id') in closed:
        f['status'] = closed[f['id']]

new = [
    {'id': 'GATE86-S1-POLLER-RETRY', 'severity': 'medium', 'status': ('scheduled round 87 for /studio-lab (lab encoder resets on '
     'timeout; C PX-RETRY); purchased path stays FFMPEG-LOAD-POLLER-HANG'), 'to': 'A',
     'title': 'a retry after the 120 s timeout hits the frozen util poller leak and hangs again', 'evidence': 'gates/round-86/review.md #1'},
    {'id': 'GATE86-S2-BOTH-NOTE-DELIVERY', 'severity': 'low', 'status': 'scheduled stage 3b (same dialog; copy and/or done-message honesty about a multiple-downloads prompt)',
     'to': 'A (3b)', 'title': 'the WAV + MP3 note promises both-or-none, true for encoding but not for browser delivery (real Chrome may prompt; Safari may drop)',
     'evidence': 'gates/round-86/review.md #2; Tech Lead R86-T'},
    {'id': 'GATE86-S3-TIMEOUT-COVERAGE', 'severity': 'low', 'status': ('partly scheduled round 87 (timer covers the dynamic import); '
     'conversion has no fixed limit by decision (duration scales with length) - Cancel in stage 3b is the escape'),
     'to': 'A', 'title': 'the 120 s timeout does not cover the import or the conversion', 'evidence': 'gates/round-86/review.md #3, a-round-86.md L3'},
    {'id': 'GATE86-S4-FORMAT-RADIOS-DURING-RENDER', 'severity': 'info', 'status': ('rejected (B, D-29z52): format radios stay enabled '
     'during a render by the round-86 spec - frozen render-time focus test export-dialog-focus.test.tsx l.454-472 keeps focus on an '
     'enabled format radio; C EXTRA-FORMAT-SWITCH-DURING-MP3 shows the running export is unaffected'), 'to': 'B',
     'title': 'format radios enabled while scope radios are disabled during a render', 'evidence': 'gates/round-86/review.md #4'},
    {'id': 'PROD-MP3-UNVERIFIED', 'severity': 'low', 'status': 'open evidence (needs root: build + preview server + one MP3 export; requested for gate 87)',
     'to': 'root', 'title': 'MP3 export (and from round 87 the export-wav worker) not verified in the production bundle',
     'evidence': 'c-round-86.json notRun; gates/round-86/review.md #5'},
    {'id': 'A-R86-L2-LATE-DOWNLOAD-UNMOUNT', 'severity': 'low', 'status': 'scheduled stage 3b (abort on unmount)', 'to': 'A (3b)',
     'title': 'unmount during encoder load/convert can still download later (exportWav same pattern)', 'evidence': 'a-round-86.md Code review L2'},
    {'id': 'A-R86-L7-REASON-READ-TWICE', 'severity': 'low', 'status': 'open - Lows batch', 'to': 'Lows batch',
     'title': 'range reason inside the <label> and also aria-describedby: may be read twice', 'evidence': 'a-round-86.md Code review L7'},
    {'id': 'A-R86-L8-NOTES-SAY-WAV', 'severity': 'low', 'status': 'open - Lows batch (copy debt)', 'to': 'Lows batch',
     'title': 'no-sound and master-mute notes say "WAV შეიქმნება" for MP3 formats', 'evidence': 'a-round-86.md Code review L8'},
    {'id': 'A-R86-L4-OPTIMIZEDEPS-PURCHASED-DEV', 'severity': 'info', 'status': 'open evidence (purchased Studio MP3 in dev not checked; backend unavailable)',
     'to': 'root/Tech Lead', 'title': 'optimizeDeps.exclude also changes the dev module graph of the purchased Studio', 'evidence': 'a-round-86.md Code review L4; doc 076'},
    {'id': 'FFMPEG-UTIL-UNIFY', 'severity': 'info', 'status': 'signal for SRW-21 (not scheduled)', 'to': 'B/root',
     'title': ('round 87 gives /studio-lab its own resettable MP3 encoder (same core + command) because the frozen util cannot reset '
               'or remove listeners; unify with app/utils/ffmpeg.ts when the purchased Studio becomes verifiable'),
     'evidence': 'D-29z52 R3; b-round-86/probe/PROBE-SUMMARY.md'},
    {'id': 'C-R86-OBS-DEFAULT-OVERLOAD', 'severity': 'info', 'status': 'acknowledged (same as DEMO-SFX-FULL-SCALE; pre-existing)', 'to': 'B',
     'title': 'the default demo project peaks +1.7 dBFS at Master 0 dB, so every default export shows the overload warning', 'evidence': 'c-round-86.md §9'},
    {'id': 'ENV-VITE-REOPTIMIZE-RELOAD', 'severity': 'info', 'status': 'harness rule (round 87 task setup: route probes not in parallel with exports)', 'to': 'C/root',
     'title': 'the first dev-server visit of a non-lab route re-optimizes deps and reloads every open tab', 'evidence': 'c-round-86.md §6'},
]
have = {f.get('id') for f in b['open_findings']}
for n in new:
    if n['id'] not in have:
        b['open_findings'].append(n)

b['architecture_signals'].append({'round': 86, 'source': 'a-round-86.md Architecture note + gates/round-86/review.md Architecture note',
    'note': ('Both reviewers: export region changed in rounds 84-86 (Signal 3), exportMp3 repeats the exportWav guards/render/download '
             '(duplication), timer lifecycle in the context (Signal 4, keep). Proposals: pure export-pipeline.ts or '
             'prepareArrangementRender(...) before stage 3; alternative loadArrangementEncoderWithTimeout helper. B: recorded as '
             'signal ARCH-EXPORT-PIPELINE, not scheduled as a refactor; round 87 puts new logic in new modules (export-wav trio, '
             'export-progress, mp3-encoder) so the context only wires them; checkpoint request q14 asks root for the bounded '
             'frontend-architect checkpoint at the SRW-20 boundary (after stage 3b). Non-blocking.')})

for r in b['rounds']:
    if r.get('round') == 86:
        r['status'] = 'c_pass_published'
        r['result'] = ('C PASS browserVerified=true realVerified=true, 18 rows both viewports (MP-TIMEOUT 1440 only); no bugs; '
                       'fake-Bearer 403 blocked (backend unavailable in cloud); production-bundle MP3 not run; gate 86 published '
                       '971141d (review 8.5/10, S1-S5 triaged in D-29z52)')
b['rounds'].append({
    'round': 87, 'task': 'current-task.md', 'decision': 'D-29z52', 'status': 'dispatched',
    'items': ['SRW-20 stage 3a: WAV encode worker, progress (render/wav/load/mp3), lab MP3 encoder with reset (R20-X4 part 1)',
              'GATE86-S1 (lab path), GATE86-S3 (import inside the timer)', 'doc 076 l.4, new doc 077'],
    'note': 'baseline HEAD 971141d, clean tree; frozen b-round-86-r87-tree-sha256.txt 490/490; snapshots b-round-86-r87-snapshots (8 files); protected 4/4; expected 7 M + 10 ??',
    'owned': ['app/lib/arrangement/graph.client.ts', 'app/lib/arrangement/export-wav.ts (new)', 'app/lib/arrangement/export-wav.worker.ts (new)',
              'app/lib/arrangement/export-wav.client.ts (new)', 'app/lib/arrangement/export-progress.ts (new)',
              'app/lib/arrangement/mp3-encoder.client.ts (new)', 'app/contexts/ArrangementContext.tsx (export functions, progress store)',
              'app/components/arrangement/ArrangementExportDialog.tsx (progress only)',
              'app/lib/arrangement/__tests__/export-wav.test.ts (new)', 'app/lib/arrangement/__tests__/export-progress.test.ts (new)',
              'app/lib/arrangement/__tests__/mp3-encoder.test.ts (new)', 'app/lib/arrangement/__tests__/export-progress-ui.test.tsx (new)',
              'app/lib/arrangement/__tests__/export-mp3.test.tsx (mock re-target + l.383/403/414)',
              'app/lib/arrangement/__tests__/export-range-ui.test.tsx (l.278/354/397/410)',
              'app/lib/arrangement/__tests__/metronome-ui.test.tsx (l.464)',
              'docs/implementation/2026/quarter-IV/076-studio-lab-mp3-export.md (l.4)',
              'docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md (new)'],
    'c_ids': ['PX-WAV5', 'PX-MP35', 'PX-PHASES', 'PX-WORKER', 'PX-WAV-SAME', 'PX-MP3-SAME', 'PX-BOTH', 'PX-REUSE', 'PX-CDNFAIL',
              'PX-RETRY', 'PX-RANGE-SHORT', 'PX-KEYS', 'PX-X3', 'PX-NET', 'REG-HYD', 'G87-3', 'T87-TARGETED', 'SOURCE-UNCHANGED'],
})
tl = b.get('tech_lead_manual_checks')
entry = {'id': 'R87-T', 'what': ('real Chrome: export a 5-minute project as WAV and MP3; does the progress bar and phase label feel right, '
         'is the UI responsive (scroll the timeline, move the mouse) during the export; R86-T multiple-downloads prompt still open'),
         'status': 'open'}
if isinstance(tl, list):
    tl.append(entry)
elif isinstance(tl, dict):
    tl['R87-T'] = entry
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
