import json
p='backlog.json'; d=json.load(open(p))
assert d['version']==183
TAG='2026-10-27 B round 199 -> 200 planning (D-29z165)'
r=[x for x in d['rounds'] if x['round']==199][0]
assert r['status']=='dispatched'
r['status']='c_pass_published'
r['result']={'c_report':'c-round-199.json / c-round-199.md','taskStatus':'PASS','browserVerified':True,'realVerified':True,'passed_rows':91,'failed_rows':0,'bugs':0,'regressions':0,
 'inconclusive':['RV-MARKER-ENTER K2 sub-criterion: not browser-reachable (editor cannot open during a held gesture; a pre-opened editor commits on the capture-phase pointerdown blur); locked only by vitest MU15/MU16 (gate). Not browser-verified; the reachable rows passed'],
 'blocked':['SRW-21 mount (deferred_user)','R80-RECORDINGS-FIELD-BORDERS (backend unavailable in cloud)','F11-F13 /account, F16 ChatInput (backend unavailable in cloud)'],
 'smoke':'RG-SMOKE pass (2 tests, /cart only)','gate':'gates/gate-round-199.json published 5b1a2bba (docs 156/158/159 status lines)','recorded':TAG}
rr=d['regression_rounds'][1]
assert rr['id']=='REGRESSION-ROUND-2026-10-27'
rr['round']=199; rr['decision']='D-29z164'
rr['status']='completed (C round 199 PASS, every runnable row ran, browserVerified true, realVerified true; published 5b1a2bb)'
rr['result']={'passed_rows':91,'failed_rows':0,'regressions':0,'smoke':'pass','blocked':r['result']['blocked'],'inconclusive_subcriterion':'RV-MARKER-ENTER K2 (unit-only, see rounds[199])',
 'not_run_scope_additions':['REG-DUX5-PLAYHEAD-RESCAN (C-R180-K8-PLAYHEAD-MASK): the round-199 task did not carry the playhead-at-~10 s re-scan; RV-TOKENS scanned with the playhead at the clip left edge. Carried to the next REGRESSION round (B planning gap, recorded honestly)'],
 'regression_last_set':'2026-10-27 round 199 ('+TAG+')'}
d['regression_rounds'].append({'id':'REGRESSION-ROUND-2026-10-30','round':'first planning on/after 2026-10-30','decision':'pending','status':'planned','trigger':'speed rules 2026-10-21: regression-last.json 2026-10-27 round 199; due on/after 2026-10-30','scope_additions':['REG-DUX5-PLAYHEAD-RESCAN (carried from round 199)','SABA-B-4 stage 2 store focus style (if done by then)'],'added':TAG})
def find(i):
    return [f for L in (d['open_findings'],d['deferred_low_polish']) for f in L if f.get('id')==i]
def setall(i,status,**kw):
    fs=find(i); assert fs,i
    for f in fs:
        f['status']=status
        for k,v in kw.items(): f[k]=v
setall('C-R167-METRONOME-UNDER-MUTE','closed by C round 199 RP-METRO-MUTE (both viewports): metronome click output-tap peak 0.484 before Master Mute, exactly 0 over 145-148 frames from 150 ms after; matches the tooltip ("Master volume and Mute also apply to it") ('+TAG+')',evidence_r199='c-round-199.json observations RP-METRO-MUTE; c-round-199/out/RP-{1440,1280}.json')
setall('C-R149-OBS-SPACE-EMPTY','closed as observation by C round 199 RP-SPACE-EMPTY: on an empty project Space leaves the playhead at 0.000 and shows "Nothing to play — add a clip from the library first." Intended current behaviour; ABL-R-9 (awaiting_user/approved per ableton-decisions.md) owns any change ('+TAG+')')
setall('GATE76-S3-VIDEO-CLIP-MARKER-UNTESTED','browser-checked by C round 199 RP-VIDEO-MARKER (both viewports): video clip drag snaps start to the marker 7.300 exactly, one Ctrl+Z restores; no defect. The unit-test gap remains a test-hygiene Low (deferred_low_polish) ('+TAG+')')
setall('A-R147-REVIEW-L2-BADGE-CLASS-SELECTOR','closed: fixed in round 179 (C-R178-BADGE-SELECTOR fix-up: badgeText filters by text, LRS5 by text); C round 179 AN-REVIEW-179 colour-selector regex 0 hits + BADGE-BROWSER PASS, published 15189d5. Entry was stale (not closed at round 180 planning) - retro-200 lesson input ('+TAG+')',evidence_close='c-round-179.md l.11, l.14')
setall('ROOT-RECON-MARKER-ENTER',find('ROOT-RECON-MARKER-ENTER')[0]['status']+' | round 199 RV-MARKER-ENTER re-ran the reachable rows PASS at both viewports; K2 sub-criterion again browser-unreachable, unit-only (MU15/MU16), not browser-verified ('+TAG+')')
of=d['open_findings']
of.append({'id':'OBS-R199-LEDGER','severity':'info','status':'ruled (B, D-29z165): keep. The demo sound titles in app/data/studio-lab-demo.ts are content (sound names), covered by the standing M2 ledger "user content / sound titles are not translated" (tasks 147/148). Smallest honest behaviour: no change; Saba may veto via a decisions note','evidence':'c-round-199.json observations OBS-R199-LEDGER','added':TAG})
of.append({'id':'OBS-R199-OV-PLAYHEAD-CORNER','severity':'info','status':'acknowledged: notch metric counts come from the overview playhead at 0 % overlapping the left arc; 0 elsewhere; not a SABA-B-2 gap. Harness rule: move the playhead off 0 before the corner metric','evidence':'c-round-199.json observations','added':TAG})
setall('C-R188-I6','awaiting_user (re-confirmed by C round 199 OBS-R199-KEEP-TESTIMONIALS: TestimonialsSection.tsx still unmounted since a208b4c, 2026-10-02). Listed "for Saba" in b-round-199.md and retro-200.md; STORE-3 must neither mount nor delete it without Saba ('+TAG+')')
of.append({'id':'OBS-R199-SNAP-DEFAULT','severity':'info','status':'acknowledged: Snap off in a fresh session, unchanged since round 122; harness rule: set Snap explicitly','evidence':'c-round-199.json observations','added':TAG})
of.append({'id':'OBS-R199-PROTECTED-NAV','severity':'info','status':'acknowledged (info): /studio/middle-east fires framenavigated 3x to the same URL; protection unchanged (Sign in required, 0 audio[src]). Not scheduled; protected file','evidence':'c-round-199.json observations','added':TAG})
d['version']=184; d['updated']=TAG
json.dump(d,open(p,'w'),indent=1,ensure_ascii=False)
print('ok')
