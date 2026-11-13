import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
mark=os.path.join(L,'b-round-485/update-backlog-1.done')
if os.path.exists(mark): sys.exit('already applied')
p=os.path.join(L,'backlog.json'); b=json.load(open(p,encoding='utf-8'))
by='2026-11-13 B round 485 -> 486 planning'
D=b['decisions_log_b']
D.append({"id":"D-29z1727","date":"2026-11-13","by":by,"decision":"Round 485 result (C evidence only): c-round-485.json taskStatus PASS, browserVerified true, realVerified true, 15 rows passed (RA-ATTRS, RA-INITIAL, RA-BROWSER, RA-TITLES, RA-STUDIO, RA-TAB, RA-REPEAT, RA-SPEAKERS, RA-VISUAL, STUDIO-485, LF-RUNTIME, LF-FOOTER, G485-AUTH, C-SCOPE, C-APPLY); gate 485 published 034122994313113c9c74888b4fef2f8ee1a6144a on both remotes (review COMMIT OK). Per the outcome fixed in advance (D-29z1726): CLIENT-NAV-CONTRACT done; GATE479-M1-ROUTE-ANNOUNCE done for the live-region contract (screen-reader half -> TLM-R485-SR-ROUTE-ANNOUNCE, deadline RETRO 495, does not block); Lows GATE479-L2-TABINDEX-FINALLY, A-R479-L1-TARGET-BLANK, A-R479-L3-DEFAULTPREVENTED-UNTESTED, A-R479-L2-SLOW-LOADER-FOCUS closed. Caveat recorded, not rounded up: C's LF-RUNTIME checked each mutant's expected red row only, not the full red-row sets. Baseline for round 486 = 0341229 (gate 485 commit; context/head-sha.txt still showed 751e30e)."})
D.append({"id":"D-29z1728","date":"2026-11-13","by":by,"decision":"New findings from round 485, all Low under the 2026-10-23 bug gate -> deferred_low_polish: B-R485-STUDIO-PRODUCT-TITLE (C; client nav into protected /studio/:productId is silent, needs root edit -> ROOT-REQ-STUDIO-PRODUCT-TITLE); A-R485-REVIEW-L1-TARGET-CASE (A reviewer; target compared case-sensitively, same as React Router); GATE485-L1-H1-EXIT-WRAPPER (gate reviewer 'Medium-low', ruled Low: the h1 fallback can read the exiting wrapper's h1 during AnimatePresence exit, only on a title-less route; every loop-editable Store route now has a title and the remaining title-less routes are protected; fix = read the last .page-transition-wrapper); GATE485-L2-ACCOUNT-IMPORT-ORDER (cosmetic, already noted in B-R485-DOWNLOADS-TITLE text). A-R485 RA9 jsdom-limit note is covered by C's RA-BROWSER/RA-TITLES (no id). Architecture note (A reviewer + gate reviewer): RouteTransition owns announcement state + rAF; keep; extract useRouteAnnouncement(pathname) only if a second lifecycle lands -> architecture_signals SIG-R485-ROUTE-ANNOUNCEMENT-HOOK (signal, not scheduled). B-spec INFOs: task said Biome 14->14 warnings, real 16->16 (B's biome command expanded the unquoted $id.$token path); task 4 'Store -> Studio announced' was over-broad (true for /studio-lab only); c-round-485.json lacks 12 L57 fields and the bug origin (INFO, C bookkeeping)."})
def fid(lst,i):
    return next((f for f in lst if f.get('id')==i),None)
of=b['open_findings']; dl=b['deferred_low_polish']
f=fid(of,'GATE479-M1-ROUTE-ANNOUNCE')
if f: f['status']='done (D-29z1727): live-region contract C round 485 PASS (browserVerified true), published 0341229; screen-reader half -> TLM-R485-SR-ROUTE-ANNOUNCE (deadline RETRO 495, does not block) | '+f['status']
for i in ('GATE479-L2-TABINDEX-FINALLY','A-R479-L1-TARGET-BLANK','A-R479-L3-DEFAULTPREVENTED-UNTESTED','A-R479-L2-SLOW-LOADER-FOCUS'):
    f=fid(dl,i) or fid(of,i)
    if f: f['status']='closed (D-29z1727): CLIENT-NAV-CONTRACT C round 485 PASS, published 0341229 | '+f['status']
f=fid(of,'B-R480-ORDER-CARD-KEYBOARD')
if f: f['status']='dispatched (D-29z1729): round 486 on baseline 0341229 | '+f['status']
for t in b['systemic_tasks']:
    if t.get('id')=='CLIENT-NAV-CONTRACT':
        t['status']='done (D-29z1727): C round 485 PASS browserVerified true, published 0341229 | '+t['status']
b['tech_lead_manual_checks'].append({"id":"TLM-R485-SR-ROUTE-ANNOUNCE","added":by,"status":"open (D-29z1727): deadline RETRO 495 (L46); does not block (2026-10-23 root clarification class)","what":"NVDA (Windows Chrome) and VoiceOver (macOS Safari): after a footer link click (e.g. FAQ) the screen reader speaks the new page title ('FAQ | CZABA'); a repeated same-name navigation (/account -> /account/downloads) is spoken again; /studio-lab entry speaks 'CZABA Studio — Demo collection'","evidence":"c-round-485.md RA-* rows (live-region contract verified in Chromium, speech not)"})
add=[
 {"id":"B-R485-STUDIO-PRODUCT-TITLE","severity":"low","origin":"pre-existing","status":"deferred_low_polish (D-29z1728): needs ROOT-REQ-STUDIO-PRODUCT-TITLE (protected app/routes/studio.$productId.tsx)","title":"Client navigation into the purchased Studio /studio/:productId announces nothing (route has no meta; title '' and the h1 fallback is not rendered at the rAF read)","evidence":"a-round-485/studio-product-probe.json; c-round-485/auth.json","repro":"/faq -> client nav /studio/middle-east; read [data-route-announcer] and document.title","added":by},
 {"id":"A-R485-REVIEW-L1-TARGET-CASE","severity":"low","origin":"B spec","status":"deferred_low_polish (D-29z1728)","title":"releaseLinkFocus compares target case-sensitively (link-focus.ts), so target=\"_Self\" keeps focus; consistent with React Router's same-document check","evidence":"a-round-485.md code-reviewer Low","repro":"jsdom: anchor target=\"_Self\" plain click -> focus not released","added":by},
 {"id":"GATE485-L1-H1-EXIT-WRAPPER","severity":"low","origin":"B spec","status":"deferred_low_polish (D-29z1728): reviewer 'Medium-low' ruled Low; only reachable on a title-less route, and every loop-editable Store route has a title since round 485","title":"route-name.ts h1 fallback uses querySelector on .page-transition-wrapper h1; during AnimatePresence mode=wait exit the old wrapper is first, so a title-less route can be announced with the previous page's h1","evidence":"gates/round-485/review.md finding 1","repro":"a Store route without meta, client nav from a page with an h1; read the region one frame after navigation","fix":"read the last .page-transition-wrapper (querySelectorAll, last) plus a test that holds the exit open","added":by},
]
for e in add:
    if not fid(dl,e['id']): dl.append(e)
rr=b.get('root_requests_b')
entry={"id":"ROOT-REQ-STUDIO-PRODUCT-TITLE","added":by,"decision":"D-29z1728","request":"In the protected app/routes/studio.$productId.tsx add a meta export with a title from the product (e.g. '<product title> — CZABA Studio'), so that client navigation into the purchased Studio is announced and the tab is titled (WCAG 2.4.2). Can be combined with ROOT-REQ-DOWNLOADS-TITLE and the SRW-21 mount work.","closes":["B-R485-STUDIO-PRODUCT-TITLE"],"status":"open"}
if isinstance(rr,list): rr.append(entry)
elif isinstance(rr,dict): rr[entry['id']]=entry
b['architecture_signals'].append({"id":"SIG-R485-ROUTE-ANNOUNCEMENT-HOOK","added":by,"note":"A code-reviewer and gate-485 reviewer: app/components/animations/RouteTransition.tsx now owns announcement state + effect + rAF beside the transition. Keep. Extract useRouteAnnouncement(pathname) as one bounded task only if a second focus/announcement lifecycle lands here; acceptance = RA1-RA9 unchanged. Not scheduled."})
for r in b['rounds']:
    if r.get('round')==485:
        r['status']='C PASS (browserVerified true, 15 rows, 1 Low pre-existing); gate 485 published 0341229 (D-29z1727)'
b['version']=b['version']+1; b['updated']='2026-11-13'
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
open(mark,'w').write('ok\n'); print('v',b['version'])
