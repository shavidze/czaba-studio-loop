import json

P = 'backlog.json'
b = json.load(open(P))
assert b['version'] == 84, b['version']
b['version'] = 85
b['updated'] = '2026-10-22 (B round 85 review -> round 86 task, D-29z51)'
b['current_task'] = (
    'current-task.md (round 86: D-29z51 - X1 = C-R85-L2 + GATE85-S2: project scope radio always enabled, '
    'range radio reason linked by aria-describedby (frozen C-R14-02 + XU5 tab-list grant); shared pure '
    'render-window helper (normalise + validate, gate-85 S3, used by dialog, exportWav and exportMp3); '
    'SRW-20 stage 2: format radios WAV (default) / MP3 / WAV + MP3, exportMp3(window?, {includeWav}) via '
    'dynamic import of the frozen app/utils/ffmpeg.ts (loadFFmpeg then convertWavToMp3), 120 s load timeout, '
    'exact load-failure / conversion-failure errors with no file, both-or-none downloads, '
    'czaba-studio-lab[-range].mp3; vite.config.ts optimizeDeps.exclude @ffmpeg/ffmpeg + @ffmpeg/util '
    '(B probe: dev worker broken without it); doc 075 l.4, new doc 076. Baseline HEAD 51e024a, frozen '
    'b-round-85-r86-tree-sha256.txt 487)'
)
b['baseline_tree_at_round86'] = {
    'head': '51e024af0defc5d1774a693c7d003e4dc685299d', 'status_lines': 0,
    'frozen_list': 'b-round-85-r86-tree-sha256.txt', 'entries': 487,
    'snapshots': 'b-round-85-r86-snapshots', 'protected': '4/4',
}
items = {it['id']: it for it in b['items']}

s20 = items['SRW-20']
s20['status'] = ('in_progress (stage 1 C PASS round 85 browserVerified=true realVerified=true, published 51e024a; '
                 'R20-X1 and R20-X3 pass; stage 2 MP3 + WAV+MP3 dispatched round 86, D-29z51; stage 3 '
                 'worker/progress/cancel planned; none deferred)')
for a in s20['acceptance']:
    if a['id'] == 'R20-X1':
        a['status'] = 'pass'
        a['evidence'] = ('C round 85 XR-DEFAULT (range radio default, exact label), XR-WAV (240000 frames, 24-bit/48k/2ch, '
                         'max |diff| vs project frames [192000,432000) 0/1 LSB), XR-MIDSTART (fade + envelope crossing the '
                         'start, <=1 LSB), XR-ALLTRACKS (sfx lane / Ctrl+Shift+L = Master mix), XR-PROJECT, XR-OVERLOAD, '
                         'XR-KEYS; both viewports; browserVerified true; published 51e024a. XR-PASTEND not reachable from '
                         'the UI (range clamps to the clip end); unit XR4 covers the renderer')
    if a['id'] == 'R20-X3':
        a['status'] = 'pass'
        a['evidence'] = ('C round 85 XR-X3: with and without video the video option is disabled with the unchanged reason, '
                         'MP3 disabled (stage 1), only .wav downloads; both viewports; published 51e024a. Re-checked again '
                         'in stage 2 (MP-X3) because MP3 becomes enabled')
st1 = s20['stages'][0]
st1.update({
    'status': 'c_pass_published', 'browserVerified': True, 'realVerified': True,
    'c_round85_passed': ['M1-HANDLE', 'M1-SELECTED', 'M1-GHOST', 'M1-VISIBLE', 'M1-ENV', 'XR-DEFAULT', 'XR-WAV',
                         'XR-MIDSTART', 'XR-ALLTRACKS', 'XR-PROJECT', 'XR-OVERLOAD', 'XR-KEYS', 'XR-X3', 'REG-HYD',
                         'G85-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)', 'T85-TARGETED',
                         'SOURCE-UNCHANGED'],
    'c_round85_not_reachable': ['XR-PASTEND (UI cannot create a range past the project end; unit XR4)'],
    'c_round85_bugs': ['C-R85-L1 (low; Escape does not cancel a clip drag; ruled not a contract, signal ESCAPE-CANCEL-GESTURE)',
                       'C-R85-L2 (low; project radio disabled with no range; scheduled round 86 X1)'],
    'notBrowserVerified': [], 'published': '51e024af0defc5d1774a693c7d003e4dc685299d',
    'evidence': ['c-round-85.md', 'c-round-85.json', 'gates/gate-round-85.json'],
})
st2 = s20['stages'][1]
st2.update({
    'round': 86, 'decision': 'D-29z51', 'status': 'dispatched',
    'scope': ('format radios WAV (default each open) / MP3 / WAV + MP3; exportMp3(window?, {includeWav}) renders through the '
              'unchanged renderArrangementWav, then dynamic import of the frozen app/utils/ffmpeg.ts: loadFFmpeg() raced '
              'against a 120 s timeout, then convertWavToMp3(wavBlob) (frozen command, LAME, VBR by -q:a 0); exact '
              'load-failure and conversion-failure errors, no file; WAV + MP3 downloads both or none; filenames '
              'czaba-studio-lab[-range].mp3; overload warning from the WAV render; vite.config.ts optimizeDeps.exclude '
              '[@ffmpeg/ffmpeg, @ffmpeg/util] (B probe b-round-85/probe); shared render-window helper; X1 = C-R85-L2 + GATE85-S2'),
    'acceptance': ['R20-X2', 'R20-X3 (re-check)'],
    'c_ids': ['X1-PROJECT', 'MP-FORMAT', 'MP-MP3', 'MP-RANGE', 'MP-BOTH', 'MP-WAV-UNCHANGED', 'MP-CDNFAIL', 'MP-TIMEOUT',
              'MP-REUSE', 'MP-OVERLOAD', 'MP-MUTE', 'MP-KEYS', 'MP-X3', 'MP-NET', 'REG-HYD', 'G86-3', 'T86-TARGETED',
              'SOURCE-UNCHANGED'],
    'tech_lead': 'R86-T',
})
s20['files'] = sorted(set(s20.get('files', []) + [
    'vite.config.ts', 'app/lib/arrangement/render-window.ts', 'app/lib/arrangement/__tests__/render-window.test.ts',
    'app/lib/arrangement/__tests__/export-mp3.test.tsx', 'app/lib/arrangement/__tests__/export-dialog-focus.test.tsx']))
s20['ableton_round86'] = ('Live 12 manual 5.1.3.2 Encoding Options (b-round-84/web/managing-files.txt l.200-236, fetched '
                          '2026-10-22): Encode PCM and Encode MP3 toggles; MP3 is CBR 320 kbps; MP3 can be exported on its '
                          'own or with a PCM file; a small amount of silence is added at the start of an MP3. CZABA: one '
                          'format choice WAV / MP3 / WAV + MP3 (same both-files idea, one radio instead of two toggles); '
                          'MP3 comes from the frozen ffmpeg command (LAME, -q:a 0 -> VBR, not CBR 320: conscious difference, '
                          'C reads the header); leading silence / encoder delay is recorded by C, not trimmed.')

for f in b['open_findings']:
    fid = f.get('id')
    if fid == 'C-R84-M1':
        f['status'] = ('closed (C round 85 M1-HANDLE / M1-SELECTED / M1-GHOST / M1-VISIBLE / M1-ENV PASS both viewports: '
                       'header topmost over video/audio fade handles, trim strips and envelope points, selected or not; '
                       'a +40 px drag there changed nothing, no Undo, no status; published 51e024a)')
    if fid == 'C-R84-M1-AUDIO-STATUS':
        f['status'] = 'closed (moot: C round 85 M1-HANDLE at the same spot wrote no status; the header is topmost)'
    if fid == 'GATE83-M1-STICKY-HEADER-OVERLAP':
        f['status'] = 'closed via C-R84-M1 (C round 85 PASS, published 51e024a)'
    if fid == 'C-R84-L1':
        f['status'] = ('open - Lows batch; C round 85 extended the evidence: the 1-LSB jitter also appears with NO video '
                       '(two unchanged project exports differed in 3254 samples inside 4-9 s: Soft impact + stems); '
                       'range files equal one of the two variants bit-for-bit; within the 1e-3 FS tolerance. Harness rule '
                       'HR-C-R84-L1-EXPORT-JITTER widened: <=1 LSB anywhere is jitter')

new = [
    {'id': 'C-R85-L1', 'severity': 'low', 'status': ('ruled (B, D-29z51): not a CZABA contract - the round-85 M1-GHOST '
     '"then Escape" wording was B\'s assumption; no pointer gesture in the workspace cancels on Escape today (grep); '
     'Live behaviour unconfirmed; not requested by the user -> signal ESCAPE-CANCEL-GESTURE, not scheduled'),
     'to': 'B', 'title': 'Escape does not cancel a clip drag / lane move; on release the move commits',
     'evidence': 'c-round-85/m1-1440x900.json, m1-1280x720.json (M1-GHOST escapeCancelsMove=false)'},
    {'id': 'ESCAPE-CANCEL-GESTURE', 'severity': 'info', 'status': ('signal (cross-cutting product question: clip move, '
     'trim, fade, envelope, marker, loop and range gestures; needs a Live source check and a user decision before any task)'),
     'to': 'B/Tech Lead', 'title': 'no Escape-to-cancel for pointer gestures', 'evidence': 'C-R85-L1'},
    {'id': 'C-R85-L2', 'severity': 'low', 'status': 'scheduled round 86 X1 (D-29z51; frozen C-R14-02 and XU5 tab list granted)',
     'to': 'A', 'title': ('with no valid range the project scope radio is checked AND disabled (round-85 E2 disabled only the '
     'range radio); A did it to keep frozen C-R14-02 (exactly 4 enabled controls)'),
     'evidence': 'c-round-85 xr-*.json XR-PROJECT-norange / XR-PROJECT-cleared'},
    {'id': 'GATE85-S1-SILENT-RANGE-NOTE', 'severity': 'low', 'status': 'open - Lows batch (merged with A-R85 review L5)',
     'to': 'Lows batch', 'title': ('a range covering no audible clip exports a silent -range file with no note; the '
     'no-sound note uses project-wide hasSoundingClip'), 'evidence': 'gates/round-85/review.md #1'},
    {'id': 'GATE85-S2-REASON-DESCRIBEDBY', 'severity': 'low', 'status': 'scheduled round 86 X1 (same radio as C-R85-L2)',
     'to': 'A', 'title': 'the disabled range radio reason is not linked (aria-describedby)', 'evidence': 'gates/round-85/review.md #2'},
    {'id': 'GATE85-S3-RANGE-VALIDITY-TWICE', 'severity': 'low', 'status': ('scheduled round 86 (render-window helper; '
     'exportMp3 would otherwise add a third copy) - merges A-R85 review L2 and both Architecture notes'),
     'to': 'A', 'title': 'the 0.001 s window rule lives in the dialog constant and a context literal',
     'evidence': 'gates/round-85/review.md #3, a-round-85.md Architecture note'},
    {'id': 'GATE85-S4-RENDERER-NO-GUARD', 'severity': 'low', 'status': 'open - Lows batch (graph.client.ts frozen in round 86; only guarded callers)',
     'to': 'Lows batch', 'title': 'renderArrangementWav does not validate the window itself (inverted window -> native NotSupportedError)',
     'evidence': 'gates/round-85/review.md #4'},
    {'id': 'GATE85-S5-SCOPE-RESET-EFFECT', 'severity': 'info', 'status': 'open - Lows batch (optional; round 86 format state may reset in the same place)',
     'to': 'Lows batch', 'title': 'scope reset runs in an effect after close (one extra render)', 'evidence': 'gates/round-85/review.md #5'},
    {'id': 'GATE85-S6-ROW-BOUNDARY-HANDLES', 'severity': 'info', 'status': 'open - regression round row (selected clip handles in row N vs row N+1 near the boundary)',
     'to': 'C', 'title': 'isolate per lane body: a fade handle dragged near the row boundary could be covered by the next row',
     'evidence': 'gates/round-85/review.md #6'},
    {'id': 'A-R85-REVIEW-L1-SHORT-RANGE-TEXT', 'severity': 'low', 'status': 'open - Lows batch',
     'to': 'Lows batch', 'title': 'a visible range shorter than 1 ms shows the "select a range" reason; a "too short" text may be clearer',
     'evidence': 'a-round-85.md Code review L1'},
    {'id': 'FFMPEG-DEV-WORKER', 'severity': 'medium', 'status': ('scheduled round 86 (vite.config.ts optimizeDeps.exclude grant); '
     'B probe evidence; production build behaviour unverified in the cloud (no preview server)'),
     'to': 'A', 'title': ('under the Vite dev server the ffmpeg.wasm worker (node_modules/.vite/deps/worker.js) fails with '
     'ERR_FAILED and loadFFmpeg() never settles, so any MP3 export hangs; scratch Vite with optimizeDeps.exclude loads in 3.2 s, '
     'the control without it reproduces the hang'), 'evidence': 'b-round-85/probe/PROBE-SUMMARY.md'},
    {'id': 'FFMPEG-LOAD-POLLER-HANG', 'severity': 'low', 'status': ('signal for the owner of app/utils/ffmpeg.ts (shared with the '
     'protected purchased Studio via StudioContext; frozen for the loop); round 86 wraps the call in a timeout in ArrangementContext'),
     'to': 'root/Tech Lead', 'title': ('loadFFmpeg: a concurrent caller polls isLoaded forever if the first load fails; a load '
     'whose worker never starts never rejects; no timeout'), 'evidence': 'app/utils/ffmpeg.ts l.21-30, b-round-85/probe'},
    {'id': 'C-R85-OBS-PLAYHEAD-OVER-CLIPS', 'severity': 'info', 'status': 'acknowledged (A review L6; intended: playhead z-10 row sibling paints over clips, pointer-events-none)',
     'to': 'B', 'title': 'playhead line paints over clips and the selected clip after the isolate change', 'evidence': 'c-round-85.json observations'},
]
have = {f.get('id') for f in b['open_findings']}
for n in new:
    if n['id'] not in have:
        b['open_findings'].append(n)

b['architecture_signals'].append({'round': 85, 'source': 'a-round-85.md Architecture note + gates/round-85/review.md',
    'note': ('Signal 2 (coupling): export window validity in two owners -> both reviewers keep; scheduled as a small pure '
             'helper in round 86 only because exportMp3 adds a third consumer. Signal 3 (repeated change): '
             'ArrangementExportDialog.tsx changed by 074, 075 and now 076 (format x scope text axis) -> appended to the '
             'checkpoint request as q13 (non-blocking). Signal 4 (dialog owns scope state) -> keep.')})

tl = b['tech_lead_manual_checks']
if not any(t.get('id') == 'R86-T' for t in tl):
    tl.append({'id': 'R86-T', 'what': ('real Chrome on /studio-lab: export MP3 and WAV + MP3 of the whole project and a '
               'range; the MP3 plays in a normal player and sounds like the WAV; first MP3 waits for the encoder download '
               'with a clear message; does Chrome ask to allow multiple downloads for WAV + MP3?'),
               'why': 'feel of SRW-20 stage 2 (D-29z51)', 'status': 'open', 'added': 'round 86 planning'})

for r in b['rounds']:
    if r.get('round') == 85:
        r['status'] = 'c_pass_published'
        r['result'] = ('C PASS browserVerified=true realVerified=true, 17 rows both viewports; XR-PASTEND not reachable '
                       '(unit XR4); C-R85-L1 (low, ruled signal), C-R85-L2 (low, round 86 X1); fake-Bearer 403 blocked '
                       '(backend unavailable in cloud); gate 85 published 51e024a')
if not any(r.get('round') == 86 for r in b['rounds']):
    b['rounds'].append({'round': 86, 'task': 'current-task.md', 'decision': 'D-29z51', 'status': 'dispatched',
        'items': ['X1 = C-R85-L2 + GATE85-S2 (scope radios)', 'render-window helper (GATE85-S3)',
                  'SRW-20 stage 2: MP3 + WAV + MP3 (R20-X2, R20-X3 re-check)', 'FFMPEG-DEV-WORKER (vite.config.ts)',
                  'doc 075 l.4, new doc 076'],
        'note': ('baseline HEAD 51e024a, clean tree; frozen b-round-85-r86-tree-sha256.txt 487/487; snapshots '
                 'b-round-85-r86-snapshots; protected 4/4'),
        'owned': ['vite.config.ts (optimizeDeps.exclude only)',
                  'app/components/arrangement/ArrangementExportDialog.tsx',
                  'app/contexts/ArrangementContext.tsx (export functions and their types only)',
                  'app/lib/arrangement/render-window.ts (new)',
                  'app/lib/arrangement/__tests__/render-window.test.ts (new)',
                  'app/lib/arrangement/__tests__/export-mp3.test.tsx (new)',
                  'app/lib/arrangement/__tests__/export-dialog-focus.test.tsx (C-R14-02 test body only)',
                  'app/lib/arrangement/__tests__/export-range-ui.test.tsx (the two XU5 tests only)',
                  'docs/implementation/2026/quarter-IV/075-studio-lab-range-export-and-header-stacking.md (l.4)',
                  'docs/implementation/2026/quarter-IV/076-studio-lab-mp3-export.md (new)'],
        'c_ids': st2['c_ids']})

hr = b['harness_rules']
for x in hr:
    if isinstance(x, dict) and x.get('id') == 'HR-C-R84-L1-EXPORT-JITTER':
        x['rule'] = ('export equality oracles (range vs window, A vs B): <=1 LSB (24-bit) is jitter anywhere (C round 85 saw '
                     'it without video too); report per-span counts')
if not any(isinstance(x, dict) and x.get('id') == 'HR-MP3-ORACLE' for x in hr):
    hr.append({'id': 'HR-MP3-ORACLE', 'added': 'round 86 planning', 'rule': ('MP3 checks decode with the page AudioContext; '
               'duration within 0.1 s of the WAV; align by best lag (search +-4096 frames at 48 kHz) before comparing; '
               'record the lag (encoder delay/leading silence) and the correlation; never compare MP3 sample-exact')})

json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok')
