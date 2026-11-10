# B round 428 -> 429 backlog update 2 (v408 -> v409): gate 428 review items. Refuses to run twice.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'; done = L + '/b-round-428/update-backlog-2.done'
assert not os.path.exists(done)
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 408 and b['decisions_log_b'][-1]['id'] == 'D-29z1508'
b['decisions_log_b'].append({'id': 'D-29z1509', 'date': '2026-11-10', 'by': '2026-11-10 B round 428 -> 429 planning (close)', 'decision': 'Gate 428 review (gates/round-428/review.md: 3 Lows, 0 Medium+) recorded as confirmations: Low 1 (HQ1 value assert) confirmedBy on A-R428-REVIEW-L1-HQ1-VALUE-ASSERT; Low 2 (pressHeldEnter copied in 3 files) confirmedBy on SIG-R427-HELD-ENTER-TEST-HELPER; Low 3 (HX1/HX2 preventive) is the round-428 ruling 3, no id. Its Architecture note (grep-based test for type=button + onClick without an Enter guard, with an allowlist; shared pressHeldEnter util) is confirmedBy on ARCH-CHECKPOINT-SYS-2 and SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT; round 429 adds the inline-copy scan HS1 only, the button-guard allowlist test stays with the checkpoint. Closing-scan claims added to round 429 (advisor): K9c button-guard-scan-enter over components/arrangement on the sketch = 53 ENTER-GUARD, 9 others each ruled (GridMenu 4 + MarkerMenu 1 menuitems: delegated container; Library option: own !repeat; MarkerRow flag: guard inside handleFlagKeyDown, HK2; Transport Fit: TH5 lock; VideoDock drag handle: no onClick); K9d /studio-lab import closure 47 files, non-arrangement <button> files only app/components/ui/* reached through the barrel, of which only Modal is imported by Studio (ruled round 428), openers-in-closure 0. K13 is passed by location (backlog or archive), not byte equality, because the optimizer may archive closed ids between B and A/C.'})
def conf(o, text):
    o['confirmedBy'] = (o['confirmedBy'] + ' | ' + text) if o.get('confirmedBy') else text
for d in b['deferred_low_polish']:
    if d.get('id') == 'A-R428-REVIEW-L1-HQ1-VALUE-ASSERT': conf(d, 'gates/round-428/review.md Low 1 (D-29z1509)')
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R427-HELD-ENTER-TEST-HELPER': conf(s, 'gates/round-428/review.md Low 2 + Architecture note (D-29z1509)')
    if s.get('id') == 'SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT': conf(s, 'gates/round-428/review.md Architecture note: button-guard allowlist test (D-29z1509)')
for c in b['architecture_checkpoint_requests']:
    if c.get('id') == 'ARCH-CHECKPOINT-SYS-2': conf(c, 'gates/round-428/review.md Architecture note: grep test for unguarded type=button onClick with allowlist + shared pressHeldEnter util (D-29z1509)')
b['version'] = 409
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n'); print('backlog v409')
