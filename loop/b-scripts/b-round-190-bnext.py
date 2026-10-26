import json
L='/home/runner/czaba-project/tmp/studio-real-loop/'
old=json.load(open(L+'b-round-190/b-next-before.json'))['remaining']
drop=('STORE-1d(','C-R189-01(','C-R189-02(','C-R189-INFO')
rem=['SABA-B-3(medium, Saba 2026-10-26; round 191 D-29z156; done only on C PASS with browserVerified)']
for r in old:
    if r.startswith(drop): continue
    if r.startswith('REGRESSION('):
        r='REGRESSION(due on/after 2026-10-27; first planning on/after that date, expected round 192; + M1, M3, M4, harness gate-log check, REG-DUX5-PLAYHEAD-RESCAN, C-R167-METRONOME-UNDER-MUTE, STATE-M3 wording, e2e smoke, store smoke vs mock incl. STORE-1a/1b/1c/1d (fresh CLS + overlay parent/height, C-R190-I1), SABA-B-3 one fader per kind, harness rules C-R189-I1/I5, C-R190-I2)'
    if r.startswith('STORE-REDESIGN('):
        r='STORE-REDESIGN(STORE-0..STORE-1d done, STORE-1 complete 338564e; STORE-2 tokens/type (+C-R186-02, A-R187-PRODUCTCARD-PRIMARY-TOKEN, GATE188 header a11y signals, A-R188 NAV_ITEMS, loader colours, C-R190-I3 overlay over header for Saba); STORE-3 hero (+C-R188-I6, C-R188-I2); STORE-4 product/listening (+C-R186-01); STORE-5 loading text/docs (+dead loaders, SpotlightLoader portal unit guard C-R190-I1); direction A decided)'
    if r.startswith('DEFERRED-LOW-POLISH('):
        r='DEFERRED-LOW-POLISH(268 entries incl. C-R190-I4, C-R188-I4, GATE187-SVG-ARIA-HIDDEN, A-R187-PRODUCTCARD-PRIMARY-TOKEN, C-R186-02, GATE186-SITEMAP-INACTIVE, C-R185-I2, C-R185-I3 and earlier)'
    rem.append(r)
i=rem.index([r for r in rem if r.startswith('REVIEW-RECOMMENDATIONS(')][0])
rem.insert(i+1,'STUDIO-PERFORMANCE(not_started; after REVIEW-RECOMMENDATIONS, before T12-ADVANCED; PERF-1 harness first)')
rem.insert(i+2,'RETRO(first after STORE-REDESIGN or at round 200)')
for x in ['C-R190-INFO(routed)','A-R190-SIGNALS(signal)','ARCH-R190-PAGETRANSITION-FIXED(signal)','GLOBAL-FOCUS-VISIBLE-UNLAYERED(signal; RETRO systemic candidate)']:
    rem.append(x)
out={'decision':'CONTINUE',
 'reason':('C round 190 PASS (browserVerified=true, realVerified=true, 16 rows, 0 bugs) and gate 190 published 338564e: STORE-1d and STORE-1 are done, C-R189-01/02 closed. '
  'Saba reported SABA-B-3 (Medium, 2026-10-26) and ordered it fixed next; B reproduced it in the browser (pressed fader = brass band from ring-2 + global :focus-visible outline). '
  'Regression is not due (2026-10-24 + 2 days; due on/after 2026-10-27), so the round-190 prediction "191 = regression" no longer holds. '
  'Large scoped work remains (SABA-B-3, regression, STORE-2..5, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED, deferred Lows, final regression) and nothing needs external input, so neither COMPLETE nor BLOCKED.'),
 'nextTask':('Round 191 (D-29z156) SABA-B-3 from HEAD 338564e (clean; frozen 1013; grants 6: ArrangementLane, ArrangementGroupHeader, ArrangementMaster, ArrangementDetailPanel, ArrangementTransport, affordance-colour-ui.test (DXA1 only); new 3: studio-fader.ts, fader-style-ui.test.tsx, doc 157). '
  'K0 reproduce and confirm the cause; K1 R68 level-fader look on track/group/Master/Clip Gain (graphite track, brass value fill, neutral thumb, every state); K2/K3 R69 single thin offset focus ring on all six range controls, Pan/Zoom neutral (R70); R71 shared recipe. '
  'C rows: PRESS-191, LOOK-191, PANZOOM-191, BEHAVIOUR-191, AUDIO-191, LAYOUT-191, STUDIO-RV-191 (masked), STORE-AFTER-191, G191-3, SCOPE-191, T-RUN-191 (m1-m5), AN-REVIEW-191, PX-NET/REG-HYD. Next: REGRESSION (first planning on/after 2026-10-27), then STORE-2.'),
 'remaining':rem}
json.dump(out,open(L+'b-next.json','w'),ensure_ascii=False,indent=1)
print(len(rem))
