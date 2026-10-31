import json
P='backlog.json'
b=json.load(open(P))
dl={d['id']:d for d in b['decisions_log_b']}
dl['D-29z765']['text']=dl['D-29z765']['text'].replace("REVIEW-3 (LH3 depends on library hydrating before the dock) closed by round 299's root-cause fix of GATE297-S5: with no dock mismatch, nothing consumes the flag before or after the library.","REVIEW-3 (LH3 depends on library hydrating before the dock) closed by round 299's GATE297-S5 fix: with no muted warning in jsdom, nothing consumes the flag, and mutant v (server-only attribute on the standby <video>, after the library in tree order) turns LH3 and NG9 red (green at ece19e3).")
dl['D-29z766']['text']=("Bug gate (2026-10-23): C-R298-01 is Medium, so round 299 = STUDIO-LINK-a4 before new scope, test-only. GATE297-S5 is pulled forward from deferred_low_polish because both reviewers named it as the cause of the vacuous tolerance. B's planning probe re-classified it: the server HTML DOES carry muted=\"\" (curl of :5173/studio-lab), React compares the muted PROPERTY, and jsdom does not initialise .muted from the attribute (innerHTML and parser: muted false, defaultMuted true), while Chromium does per the HTML spec (C round 298: 0 browser hydration warnings). So the mismatch is a jsdom gap, not a product bug. B first pre-ran suppressHydrationWarning on the two <video> in ArrangementVideoDock.tsx and rejected it on this evidence: it changes production for a test-environment gap and would hide real future attribute mismatches on <video>. Scope (3 related items + doc, 4 grants, all tests/doc): (1) C-R298-01: LH3 and NG9 regex covers all 7 didWarnInvalidHydration sites of react-dom 18.3.1 (/did not match|Extra attributes from the server|Did not expect server HTML|Expected server HTML|Hydration failed/i) and asserts toEqual([]) with no muted tolerance; (2) GATE297-S5: test helper applyBrowserParsedMutedState sets video.muted = video.defaultMuted on the server HTML before hydrateRoot in LH3 and NG9 (emulates the browser parser); (3) GATE298-S3 / A-R298-REVIEW-4: hydrateRoute registers the unmount before await act, both hydrate files; doc 220 corrections. B sketch on an ece19e3 scratch (own cacheDir /tmp/b299-vite-cache): covering 7 files/58 tests green, tsc rc 0, Biome clean; mutants x, v, h -> LH3 and NG9 red; y -> LH3, NG9, NG9c red; r (no helper call in LH3) -> LH3 red; r2 (none in NG9) -> NG9 red; e -> LH1+LH3 red; g -> LH4 red; identity order -> LH3 red; i green; controls x and v on unmodified ece19e3 -> 20/20 green. C adds one real-browser regression row on the dock (both <video> muted after hydration and while a video plays) and records the server-HTML muted attribute. STUDIO-LINK-b moves to round 300.")
q=None
for e in b['post_current_stage_queue']:
    for st in e.get('stages',[]) if isinstance(e,dict) else []:
        if isinstance(st,dict) and st.get('id')=='STUDIO-LINK-a4':
            st['finding']='C-R298-01 (Medium), GATE297-S5-VIDEO-MUTED-SSR (Low, jsdom-only cause), GATE298-S3 / A-R298-REVIEW-4 (Low), doc 220 (INFO-C298-02, GATE298-S1)'
            st['what']="test-only: LH3 + NG9 hydration-warning regex covers all 7 React 18.3.1 emitter sites and asserts no warning at all; test helper applyBrowserParsedMutedState (video.muted = defaultMuted before hydrateRoot, as the browser parser does); unmount registered before hydration; doc 220 corrections"
            st['status']="dispatched (D-29z766): round 299, baseline ece19e3; B sketch b-round-298/ (covering 7 files/58 green; mutants x, v, y, h, r, r2, e, g, identity order red; controls x, v at HEAD green)"
        if isinstance(st,dict) and st.get('id')=='STUDIO-LINK':
            st['status']=st['status'].replace("(C-R298-01 Medium + GATE297-S5 root cause)","(C-R298-01 Medium + GATE297-S5 jsdom muted gap, test-only)")
for e in b['deferred_low_polish']:
    if e['id']=='GATE297-S5-VIDEO-MUTED-SSR':
        e['status']=e['status'].replace("in fix (D-29z766): pulled into round 299 as the root cause of C-R298-01","in fix (D-29z766): pulled into round 299; re-classified as a jsdom-only gap (server HTML has muted=\"\"; jsdom leaves .muted false), fixed by a test helper, no production change")
for e in b['open_findings']:
    if e.get('id')=='A-R298-REVIEW-3': e['status']=e['status'].replace("verified by mutants r/r2 and x","verified by mutant v (dock attribute, red after the fix, green at HEAD)")
for r in b['rounds']:
    if r.get('round')==299:
        r['type']='STUDIO-LINK-a4 test-only Medium fix-up (C-R298-01 + GATE297-S5 jsdom muted gap + GATE298-S3, doc 220)'
        r['note']='baseline ece19e3 clean; 4 grants (studio-link-hydrate-ssr-ui.test.tsx, studio-link-hydrate-ui.test.tsx, studio-narrow-gate-ui.test.tsx, doc 220); no app source; frozen b-round-298-r299-tree-sha256.txt (1168); claims b-round-298/claims-299.sh + after-sketch'
b['current_task']='current-task.md (round 299, D-29z764..D-29z768; STUDIO-LINK-a4, test-only: C-R298-01 Medium (full hydration-warning regex, zero tolerance in LH3 and NG9) + GATE297-S5 (jsdom muted gap, test helper applyBrowserParsedMutedState) + GATE298-S3 (unmount before hydration) + doc 220; baseline ece19e3, frozen b-round-298-r299-tree-sha256.txt 1168; claims b-round-298/claims-299.sh)'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
s=json.dumps(b,ensure_ascii=False)
print('ok; suppressHydrationWarning mentions in new D texts:', sum('suppressHydrationWarning' in dl[i]['text'] for i in ['D-29z764','D-29z765','D-29z766','D-29z767','D-29z768']))
