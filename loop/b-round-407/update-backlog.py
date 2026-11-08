# B round 407 -> 408 planning, part 1: backlog v379 -> v380 (acceptance of round 407 from C evidence only). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-407/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 379, b['version']
BY = '2026-11-08 B round 407 -> 408 planning'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1412', "Round 407 (PERF-11c-iii-d-ii) accepted on independent C evidence: c-round-407.json taskStatus PASS, 9 rows passed (SOURCE-SCOPE start/end + L57, PATCH-IDENTITY cmp-identical to sketch sha 4ec62e31, STOPPED-SEEK all 4 steps error 0 both viewports, VIDEO-SYNC max |drift| 0.008/0.013 s paused false swaps 0 fallbacks 0, LEAF-PROBE 0 differences vs sketch (Caption + ArrangementVideoDockViewInner 13 zeros, shell [0,3,1,1,1,0,1,1,1,1,1,1,2]), UNIT 360/360 + 7/7 mutants RED on C's committed scratch, AUTH, DOCS), failed [], bugs [], browserVerified/realVerified true; gate 407 published 5508f70 on both remotes (review COMMIT OK, 8.5/10, no blocking). PERF-11c-iii-d-ii done; PERF-11c-iii-d (VideoDock) complete. Still open evidence: fake-bearer /api/studio-token row BLOCKED (backend unavailable in cloud). C note: floating-box pointer drag covered by unit file only, not browser-run (recorded, not a bug)."),
 ('D-29z1413', "Round 407 reviewer findings ruled. R406-CR-L3 closed (C round 407 row 4 VIDEO-SYNC PASS, D-29z1411 condition met). TL-R407-SK-L1 title widened per A (a-round-407.md 'For B'): cachedLane keeps the top-level fields of an older base after ANY commit that leaves video clips unchanged, not only track-only commits; gate-407 review item 2 checked every lane consumer (only track.kind/id, clips) -> still no visible effect; stays deferred_low_polish, with A's suggested video-track-only unit row as its test. A-R407-REVIEW-L2 (mutable registry inside useMemo) and gate-407 item 1 (= A-R407-REVIEW-I5, clipsRef written during render; self-correcting via publishedClips) -> one deferred Low A-R407-REVIEW-RENDER-PHASE-REGISTRY. A-R407-REVIEW-L4 (ArrangementVideoCaptionView naming vs folder XInner -> X pattern; render-log name 'ArrangementVideoCaption' is the live key, so renaming is a test-selector change, L8) -> deferred_low_polish with fix home = the round that next owns drag-preview-render VIDEO_DOCK_COMPONENTS. Gate-407 items 3/4 info, closed. Architecture notes: A reviewer + gate 407 both 'keep' the reader/publish lifecycle in the dock; extract createVideoLaneStore() into app/lib/arrangement/ only on a second consumer -> recorded as signal SIG-R407-VIDEO-LANE-STORE on architecture_signals, not scheduled. The VideoDock leaf (feature boundary d) is closed; the open non-blocking root request ARCH-CHECKPOINT-SYS-R385-ACTIONS remains the checkpoint for the leaf-plumbing work and gets this as its fourth echo."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
s = [x for x in q['stages'] if x.get('id') == 'PERF-11c-iii-d-ii']
assert len(s) == 1
pre(s[0], 'done (D-29z1412): C round 407 PASS browserVerified/realVerified true; gate 407 published 5508f70')
for f in b['open_findings']:
    if f.get('id') == 'R406-CR-L3':
        pre(f, 'closed (D-29z1413): C round 407 row 4 VIDEO-SYNC PASS')
for f in b['deferred_low_polish']:
    if f.get('id') == 'TL-R407-SK-L1':
        f['title'] = 'useVideoLanePreviewReader cachedLane = {...base, clips} lives across commits, so top-level fields (tracks, loop) keep an older base after ANY commit that leaves the video clips unchanged; no visible effect today (consumers read only track.kind/id and clips; gate-407 review item 2)'
        f['test_when_fixed'] = 'unit row: edit the video track without touching its clips; inner/caption 0 renders, opacity/gap correct (A reviewer suggestion, a-round-407.md)'
        pre(f, 'deferred_low_polish (D-29z1413): title widened per A')
for fid, title, extra in [
  ('A-R407-REVIEW-RENDER-PHASE-REGISTRY', 'useVideoLanePreviewReader keeps a mutable listener registry inside useMemo and useCommittedVideoLaneClips writes clipsRef during render; a discarded concurrent render can cause one extra or missed notify, self-correcting via publishedClips (A reviewer Low 2 + Info 5, gate-407 review item 1)', 'evidence: a-round-407.md; gates/round-407/review.md'),
  ('A-R407-REVIEW-L4-CAPTION-VIEW-NAME', 'ArrangementVideoCaptionView = memo(ArrangementVideoCaption) departs from the folder XInner -> X naming; the render-log key is ArrangementVideoCaption, so a rename is a test-selector change (L8); fix home = next round owning drag-preview-render VIDEO_DOCK_COMPONENTS', 'evidence: a-round-407.md'),
]:
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': 'A (code-reviewer)', 'evidence': extra, 'title': title, 'status': 'deferred_low_polish (D-29z1413)', 'added': BY})
sig = {'id': 'SIG-R407-VIDEO-LANE-STORE', 'source': 'a-round-407.md Architecture note; gates/round-407/review.md Architecture note', 'signal': 4, 'note': 'useVideoLanePreviewReader is now a commit event bus + reader cache inside ArrangementVideoDock.tsx; both reviewers: keep; extract createVideoLaneStore() into app/lib/arrangement/ only on a second consumer (VideoLanePreviewReader shape unchanged, DP70/DP72-DP75 untouched)', 'status': 'recorded (D-29z1413), not scheduled', 'added': BY}
a = b['architecture_signals']
if isinstance(a, list):
    a.append(sig)
else:
    a.setdefault('items', []).append(sig)
for o in b['architecture_checkpoint_requests']:
    if o.get('id') == 'ARCH-CHECKPOINT-SYS-R385-ACTIONS':
        pre(o, 'requested (D-29z1413): fourth echo (A reviewer 407 + gate 407, keep); still non-blocking')
for r in b['rounds']:
    if r.get('round') == 407:
        r['status'] = 'done (D-29z1412): C PASS, gate 407 published 5508f70'
b['version'] = 380
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v379 -> v380\n')
print('ok v380')
