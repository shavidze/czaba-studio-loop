# B round 285 -> 286 planning: backlog update (runs once). Evidence: c-round-285.json PASS (browserVerified/realVerified true), gates/gate-round-285.json published 60bfb38.
import json
P = 'backlog.json'
b = json.load(open(P))
DATE = '2026-10-31'
ADDED = '2026-10-31 B round 285 -> 286 planning'
assert not any(d.get('id') == 'D-29z690' for d in b['decisions_log_b']), 'already applied'
def find(key, fid):
    for f in b[key]:
        if isinstance(f, dict) and f.get('id') == fid:
            return f
    return None
def prepend(f, text):
    f['status'] = text + ' | ' + str(f.get('status', ''))
q = b['post_current_stage_queue']
sp = next(e for e in q if e.get('id') == 'STUDIO-PERFORMANCE')
st = {s['id']: s for s in sp['stages'] if isinstance(s, dict) and 'id' in s}
prepend(st['PERF-3b'], 'done (D-29z690): C round 285 PASS (c-round-285.json, 14 rows passed, browserVerified/realVerified true; ruler 6143 -> 94/78 elements, 28/28 ruler shots per viewport meanAbs 0, Follow flip gaps [] with W7 control [1,1]/[1,1,1], res.dom.ruler-1/2 95/95, zoom.30 key-window median 11 ms) + gate 285 published 60bfb38 (both remotes)')
st['PERF-3c']['note_d29z690'] = 'C round 285 ZOOM-TIMING record: out-path key 8 (25 px/s waveform band crossing from PERF-3a) 88 ms at both viewports on the round-285 tree (HEAD 104, B sketch 56/48). PERF-3c exit decision (p95 < 50 ms) must measure that key explicitly; not a ruler cost (ruler 48/40 elements there).'
prepend(st['PERF-3'], 'in_progress (D-29z690): PERF-3a + PERF-3b done (rounds 284, 285); PERF-3c queued after the FIX-PD-1 / STUDIO-LINK / NAME-AND-HINT fix-ups (D-29z692)')
prepend(sp, 'in_progress (D-29z692): PERF-3a/3b done; paused for PD-REVIEW fix-ups FIX-PD-1a (round 286), FIX-PD-1b, FIX-PD-1c, STUDIO-LINK, NAME-AND-HINT ("between PERF tasks", Saba 2026-10-31); REGRESSION when due (on/after 2026-11-02) takes precedence; RETRO at 290; then PERF-3c')
of = b['open_findings']
ff = find('open_findings', 'B-R284-FOLLOW-FLIP-GAP')
prepend(ff, 'closed (D-29z690): fixed by round 285 (StudioWorkspace notifies after the Follow writer sets scrollLeft); C RULER-FOLLOW-FLIP PASS both viewports, W7 control shows the gap')
dl = b['deferred_low_polish']
def add_low(d):
    assert find('deferred_low_polish', d['id']) is None, d['id']
    d.setdefault('added', ADDED)
    dl.append(d)
add_low({'id': 'A-R285-REVIEW-NAN-PAGE', 'severity': 'low', 'status': 'deferred', 'title': 'readTimelinePage / parseTimelinePageKey (view.ts) have no finiteness guard: a non-finite scrollLeft or page key yields an empty ruler window; not reproducible in the browser (scrollLeft always finite)', 'evidence': 'a-round-285.md (code-reviewer); c-round-285.json notes[0]', 'repro': 'unit: call timelinePageWindow / parseTimelinePageKey with NaN', 'fix': 'Number.isFinite guard -> treat as unknown viewport (full render)', 'deferred_reason': 'Low (D-29z691): round 286 does not own view.ts (2026-10-23 bug gate)'})
pd_lows = [
    ('PD-F12-ENVELOPE-VALUE', 'envelope point value shown only in the status line while dragging; Live shows a label beside the point (ableton-live-measurements-2026-10-30.md "value label on creation")', 'studio-C2-envelope-drag-bottom-1440.png'),
    ('PD-F12-FROM-TO-FORMAT', 'Clip details From/To in seconds (84.941) while every other time is mm:ss.mmm', 'studio-B4-fade-1440.png'),
    ('PD-F12-MARKER-PLUS', 'a second "+" while the marker name editor is open creates the marker and at once writes "A marker already exists at this time"; should commit the editor without the message', 'scripts/studio-4.cjs log, studio-D1-after-plus-1440.png'),
    ('PD-F12-FOOTER-LINES', 'after a time selection the bottom bar grows to 3 lines (status + time selection + Clip); with SR-230-1 (footer Clip line only while Clip details is collapsed)', 'studio-B2-dragging-1440.png'),
]
for pid, title, ev in pd_lows:
    add_low({'id': pid, 'severity': 'low', 'status': 'deferred', 'title': title, 'evidence': 'docs/technical/studio-real-workspace/product-design-review-2026-10-31.md F12; ' + ev, 'repro': 'see review F12 (product-designer, master 000da42)', 'deferred_reason': 'Saba 2026-10-31 table: F12 -> deferred_low_polish (D-29z693)'})
lp = find('open_findings', 'DEFERRED-LOW-POLISH')
n_open = sum(1 for x in dl if not str(x.get('status', '')).startswith('closed'))
lp['count_round286_note'] = f'B round 285 -> 286 planning: +A-R285-REVIEW-NAN-PAGE, +PD-F12-ENVELOPE-VALUE, +PD-F12-FROM-TO-FORMAT, +PD-F12-MARKER-PLUS, +PD-F12-FOOTER-LINES ({len(dl)} entries, {n_open} not closed)'
# New queue entry for the 2026-10-31 whole-product design review (Saba decisions Q1-Q5)
assert not any(e.get('id') == 'PD-REVIEW-2026-10-31' for e in q)
idx = q.index(sp)
q.insert(idx, {
    'id': 'PD-REVIEW-2026-10-31',
    'status': 'in_progress (D-29z692): FIX-PD-1a dispatched round 286',
    'requested': 'Saba 2026-10-31 (agent-workflow.md "Whole-product design review: Saba\'s decisions and new tasks"); review docs/technical/studio-real-workspace/product-design-review-2026-10-31.md (product-designer, master 000da42)',
    'saba_decisions': {'Q1': 'SRW-21 mount = first Studio product priority after STUDIO-PERFORMANCE; protected files stay outside the loop; B writes SRW-21-PLAN only; STUDIO-LINK until then', 'Q2': 'stem or stem set add -> one lane per stem, all start at the Insert Marker, inside the existing Stems group; one Enter/drag on a library folder adds the set; purchased adapter same rule; Video/Music/SFX lanes stay; free new-track command later', 'Q3': 'LeadMagnet keeps content/behaviour but does not open on /products/*, /cart, /checkout* - inside STORE-2b', 'Q4': '"CZABA Studio" everywhere ("Studio" in nav); "Personal Mixdown Studio" and "Studio Lab · Workspace" go; a badge carries demo status', 'Q5': 'one-time status after the first clip: "Drag a clip by its name bar to move it"; behaviour unchanged'},
    'order_rule': 'FIX-PD-1a/b/c, STUDIO-LINK, NAME-AND-HINT run next, between PERF tasks (bug gate fixes Medium now); STEM-LANES after STUDIO-PERFORMANCE and before SYS-1..3; SRW-21-PLAN in parallel (planning doc only); COPY-PD after STORE-5 or inside REVIEW-RECOMMENDATIONS; SR-BEHAVIOUR after COPY-PD. REGRESSION (due on/after 2026-11-02) and RETRO-290 keep precedence when due.',
    'stages': [
        {'id': 'FIX-PD-1a', 'finding': 'F9 (Medium)', 'what': 'product page price: no-variant product shows the catalogue price (standardPrice/minPrice/variants[0]) instead of $0.00; no known price -> "Price unavailable", Add to Cart / Buy Now aria-disabled no-op with a visible reason line linking /support; sidebar shows Complimentary Download only for an explicit 0', 'status': 'dispatched round 286 (D-29z694..D-29z697)', 'files': ['app/lib/product-utils.ts', 'app/components/product/ProductDetailPage.tsx', 'app/components/product/PurchaseHeader.tsx', 'app/components/product/ProductSidebar.tsx', 'app/lib/__tests__/product-utils.test.ts (append only)', 'app/lib/__tests__/product-price-unavailable.test.tsx (new)', 'docs/implementation/2026/quarter-IV/214-fix-pd-price-fallback.md (new)']},
        {'id': 'FIX-PD-1b', 'finding': 'F7 (Medium) + SR-230-6', 'what': 'English demo names in app/data/studio-lab-demo.ts ("Night Pulse · Full mix", "… · Bass", "Middle East — public preview"); collection label shown once as a library group heading; reference-first + product-designer + screen budget', 'status': 'not_started (next after 286)'},
        {'id': 'FIX-PD-1c', 'finding': 'F8 (Medium)', 'what': 'below 900 px /studio-lab shows a calm "The Studio works on a computer" state with a preview player; desktop-only decision unchanged; legacy MobileBlocker on the protected route untouched', 'status': 'not_started'},
        {'id': 'STUDIO-LINK', 'finding': 'F1 interim', 'what': 'product page "Try it in the Studio" opens /studio-lab with that product\'s public preview selected; library public preview gets "View in store" (tooltip or context menu); Studio exit keeps "← CZABA"', 'status': 'not_started'},
        {'id': 'NAME-AND-HINT', 'finding': 'Q4 + Q5', 'what': 'naming (nav, <title>, Studio header, home copy) + one-time "Drag a clip by its name bar to move it" status after the first clip', 'status': 'not_started'},
        {'id': 'STEM-LANES', 'finding': 'F2 (High) / Q2', 'what': 'one lane per stem in the Stems group, all at the Insert Marker; folder Enter/drag adds the set; one undo step; export all stem lanes; purchased adapter same rule; status says "Snap on (G)" once (SR-245-2). Reference: Live 12 manual 6.1 + LIVE-MEAS-STEM-DROP (requested in user-review/live-checks.md; differing result -> question to Saba)', 'status': 'queued: after STUDIO-PERFORMANCE, before SYS-1..3 (2-3 rounds)'},
        {'id': 'SRW-21-PLAN', 'finding': 'F1 / Q1', 'what': 'plan doc only: exact diff proposal, risks and tests for mounting the new workspace on studio.$productId.tsx / api.studio-token.ts / account.downloads.tsx; root and Saba apply the protected part outside the loop', 'status': 'not_started (planning task, parallel)'},
        {'id': 'COPY-PD', 'finding': 'F11 + approved SR copy', 'what': 'export copy ("MP3 · 320 kbps — smaller file for review links", "WAV · 24-bit / 48 kHz — for your edit timeline"), "Done" -> "Cancel", filled primary, soft-disabled Export on an empty project with tooltip "Add a clip to export"; plus SR items assigned below', 'status': 'queued: after STORE-5 or inside REVIEW-RECOMMENDATIONS (1-2 rounds)'},
        {'id': 'SR-BEHAVIOUR', 'finding': 'SR-230-9, SR-260-5', 'what': 'scroll to a newly added clip only when it is completely out of view; insert marker drawn only when not at the playhead', 'status': 'queued after COPY-PD'},
    ],
    'store_acceptance_additions': {'STORE-3': 'F5: Studio block shows a real crop of the workspace (soloed stem in brass); copy says what the screen shows; CTA "Open the Studio"', 'STORE-4': 'F3: version card first line from data ("Full mix · WAV" / "Full mix + N stems · WAV · opens in Studio"), "1 audio files" -> "1 file", top line of What\'s included visible without the accordion; F10: play on every /store card, mono meta (length · BPM · Stems, data only), 3 columns at 1440; F1: "Make it yours — open in Studio"', 'STORE-2b': 'F4/Q3 LeadMagnet route exclusion (/products/*, /cart, /checkout*), keep-list content unchanged; F6 visual part'},
    'retro_change': 'every RETRO whole-screen review adds a 3-step journey on fresh screenshots: product page -> Studio (add a stem set, play) -> export dialog; reviewed by product-designer with design-philosopher and first-visit-host',
    'added': ADDED,
})
store = next(e for e in q if e.get('id') == 'STORE-REDESIGN')
store['pd_review_acceptance_d29z692'] = 'see PD-REVIEW-2026-10-31.store_acceptance_additions (F5 -> STORE-3, F3/F10/F1 -> STORE-4, F4/F6 -> STORE-2b)'
srw21 = None
for it in b['items']:
    if isinstance(it, dict) and it.get('id') == 'SRW-21':
        srw21 = it
srw21['pd_review_d29z692'] = 'Saba 2026-10-31 Q1: first Studio product priority after STUDIO-PERFORMANCE; status stays deferred_user for the protected mount; SRW-21-PLAN (plan doc only) queued in PD-REVIEW-2026-10-31; STUDIO-LINK is the interim way in'
# SR candidates (review section 5, Saba approved as written)
assign = {
    'SR-230-1': 'approved (endorse) -> deferred_low_polish with PD-F12-FOOTER-LINES',
    'SR-230-2': 'approved (endorse) -> COPY-PD', 'SR-230-3': 'approved (endorse) -> COPY-PD (tooltip + ? sheet; trust phrase stays reachable)',
    'SR-230-4': 'approved (modify: px/s readout into the slider tooltip, reset as icon + tooltip; no layout change) -> COPY-PD',
    'SR-230-5': 'wontfix (Saba 2026-10-31)', 'SR-230-6': 'approved (endorse + F7) -> FIX-PD-1b',
    'SR-230-7': 'approved (modify: merged into SR-260-1, Add label "Add to Music") -> COPY-PD',
    'SR-230-8': 'wontfix (Saba 2026-10-31)', 'SR-230-9': 'approved (endorse, scroll only when the clip is completely out of view) -> SR-BEHAVIOUR',
    'SR-230-10': 'wontfix (Saba 2026-10-31)',
    'SR-245-1': 'approved (modify: short confirmation + "audio is not stretched"; drop "Snap on — grid 1/2") -> COPY-PD',
    'SR-245-2': 'closed info (Saba 2026-10-31): stays; STEM-LANES status says "Snap on (G)" once',
    'SR-245-3': 'approved (modify: BPM placeholder "—" and Metronome reason tooltip; rows not hidden) -> COPY-PD',
    'SR-245-4': 'wontfix (Saba 2026-10-31)', 'SR-245-5': 'approved (endorse: tooltip "Grid: ½ bar", chip keeps the fraction) -> COPY-PD',
    'SR-245-6': 'approved (endorse: icon + tooltip "Waveform height") -> COPY-PD', 'SR-245-7': 'approved (endorse) -> COPY-PD',
    'SR-245-8': 'approved (endorse, with SR-275-1) -> COPY-PD',
    'SR-260-1': 'approved (endorse, first) -> COPY-PD', 'SR-260-2': 'approved (modify: visible "Adds at 00:00.000", term in tooltip and sheet) -> COPY-PD',
    'SR-260-3': 'approved (endorse: outline on-state, tooltip "Follow playhead") -> COPY-PD',
    'SR-260-4': 'approved (modify: text buttons stay; disabled tooltip "Drag on the LOOP lane to set a loop range") -> COPY-PD',
    'SR-260-5': 'approved (default: insert marker drawn only when not at the playhead) -> SR-BEHAVIOUR',
    'SR-260-6': 'wontfix (Saba 2026-10-31)',
    'SR-275-1': 'approved (endorse) -> COPY-PD', 'SR-275-2': 'approved (endorse option b) -> COPY-PD', 'SR-275-3': 'approved (endorse) -> COPY-PD',
    'SR-275-5': 'approved (endorse: "1:42" on cards) -> COPY-PD', 'SR-275-7': 'approved (endorse) -> COPY-PD',
}
for c in b['screen_review_candidates']:
    if c['id'] in assign:
        c['status'] = assign[c['id']] + ' (D-29z693; review section 5) | was ' + str(c.get('status'))
    elif c['id'] in ('SR-275-4', 'SR-275-6', 'SR-275-8', 'SR-275-Q1', 'SR-275-Q2'):
        c['note_d29z693'] = 'not named in the 2026-10-31 review section 5; stays awaiting_user' + (' (SR-275-6 may be resolved by FIX-PD-1b group heading; C reports)' if c['id'] == 'SR-275-6' else '')
for r in b['rounds']:
    if r.get('round') == 285:
        r['status'] = 'done (D-29z690): C PASS (c-round-285.json, browserVerified/realVerified true, 14 rows), gate 285 published 60bfb38 (both remotes); Low A-R285-REVIEW-NAN-PAGE -> deferred_low_polish; B-R284-FOLLOW-FLIP-GAP closed'
b['rounds'].append({'round': 286, 'task': 'current-task.md', 'decision': 'D-29z690..D-29z698', 'status': 'dispatched', 'type': 'PD-REVIEW FIX-PD-1a (F9 price fallback / price-unavailable state)', 'note': 'baseline HEAD 60bfb38 clean; grants 4 M app + 1 M test (append) + 1 new test + doc 214; claims b-round-285/claims-286.sh'})
b['current_task'] = 'current-task.md (round 286, D-29z690..D-29z698; FIX-PD-1a: product page price falls back to the catalogue price; unknown price -> Price unavailable + aria-disabled buttons + reason line to /support; sidebar complimentary only for explicit 0)'
b['updated'] = ADDED
for did, text in [
    ('D-29z690', 'Round 285 closed: C PASS (c-round-285.json, browserVerified/realVerified true, 14 rows) and gate 285 published 60bfb38 on both remotes. PERF-3b done (mzadaa). B-R284-FOLLOW-FLIP-GAP closed. ZOOM-TIMING out-key-8 88 ms recorded on PERF-3c.'),
    ('D-29z691', 'A-R285-REVIEW-NAN-PAGE (Low, A code-reviewer, not reproducible in browser per C) -> deferred_low_polish; round 286 does not own view.ts.'),
    ('D-29z692', 'Saba 2026-10-31 whole-product design review recorded (L42): new queue entry PD-REVIEW-2026-10-31 inserted before STUDIO-PERFORMANCE in post_current_stage_queue with stages FIX-PD-1a/1b/1c, STUDIO-LINK, NAME-AND-HINT (next, between PERF tasks), STEM-LANES (after STUDIO-PERFORMANCE, before SYS-1..3), SRW-21-PLAN (parallel plan doc), COPY-PD (after STORE-5 or in REVIEW-RECOMMENDATIONS), SR-BEHAVIOUR (after COPY-PD); STORE-2b/3/4 acceptance additions F3/F4/F5/F6/F10/F1; RETRO journey review. FIX-PD-1 split into 1a/1b/1c (round rule: one feature or <=3 tightly related bugs; F9 is Store purchase code, F7 Studio data, F8 a Studio route state). STUDIO-PERFORMANCE paused at PERF-3c; REGRESSION (due >= 2026-11-02) and RETRO-290 keep precedence.'),
    ('D-29z693', 'Review section 5 SR positions applied as approved: endorse/modify -> COPY-PD, FIX-PD-1b (SR-230-6), SR-BEHAVIOUR (SR-230-9, SR-260-5) or deferred_low_polish (SR-230-1); drop -> wontfix (Saba 2026-10-31) for SR-230-5/8/10, SR-245-4, SR-260-6; SR-245-2 closed as info; SR-275-4/6/8/Q1/Q2 stay awaiting_user (not named). F12 -> four deferred Lows PD-F12-*.'),
    ('D-29z694', 'FIX-PD-1a design (F9): new pure helpers in product-utils.ts resolveCatalogPrice(product) and resolvePurchasePrice(product, version) return number | undefined (first finite >= 0 of standardPrice, minPrice, variants[0].price; a real variant uses its own price); createDisplayVersions untouched (its SFX [] test stays byte-identical). ProductDetailPage passes number | undefined; ProductSidebar isFree only for an explicit 0. Rejected: inventing an SFX version (contradicts product-utils.test.ts:263), and collapsing unknown to 0 (0 is a real free state in ProductSidebar).'),
    ('D-29z695', 'FIX-PD-1a unknown-price state per product-designer consult: same panel shape; "Total Price" label kept; figure replaced by "Price unavailable" (no currency symbol); Add to Cart and Buy Now stay visible with aria-disabled="true" (focusable, aria-describedby the reason), click/Enter/Space do nothing (no toast, no sign-in modal, no analytics, no cart call); visible reason line "Price unavailable — contact us to buy it." with "contact us" a link to /support. Ownership panels and the loading state keep precedence and are unchanged. Rejected: replacing the buttons by a contact panel (contradicts Saba "Buy is disabled with a reason", layout jump). Copy rationale: product-designer proposed "Online purchase isn\'t open for this collection yet", B kept the reviewed wording because the "not open yet" cause is not known from data (smallest honest copy).'),
    ('D-29z696', 'Round 286 browser contract: mock API (mock-api/server.mjs, :5199) + dev server :5173. door-slams (no variants, standardPrice 9) is the known-price row. The unknown-price branch is SSR-loaded (products.$handle loader) so page.route cannot intercept it: C runs its own scratch copy of the mock in c-round-286/ with one added active SFX fixture without any price, on :5199 in place of the standard mock (mock-api/server.mjs itself is not edited). Signed-in and owner rows are unit-only (backend unavailable in cloud; mock auth returns 401).'),
    ('D-29z697', 'Round 286 reference: Store reference (docs/technical/store-redesign/research/competitors.md, luxury-and-galleries.md) has no unknown-price pattern; B records "no reference found" for the unavailable state and keeps the current panel shape. Ableton conformity: not applicable (Store page). Screen budget: Store page, no Studio persistent element; the reason line appears only in the unknown-price state.'),
    ('D-29z698', 'lessons.md: L54 (test the journey, not just the screen) and L55 (check the product promise against the model) added per Saba 2026-10-31 (policy calls them L47/L48; those ids are taken, so new ids). L21 merged into L20 (RETRO-275 deferred merge candidate) to stay within 60 lines. L42 evidence +1 (PD-REVIEW approvals reached B at round 286 planning and are recorded in the same planning). LIVE-MEAS-STEM-DROP appended to user-review/live-checks.md. regression-last.json unchanged (next due on/after 2026-11-02).'),
]:
    b['decisions_log_b'].append({'id': did, 'date': DATE, 'text': text})
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', len(b['deferred_low_polish']), n_open)
