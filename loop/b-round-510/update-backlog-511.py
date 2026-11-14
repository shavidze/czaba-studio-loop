# B round 510 -> 511 planning: backlog update (run once from the loop root; writes a .done marker).
import json, os, sys
if os.path.exists('b-round-510/update-backlog-511.done'):
    sys.exit('already applied')
by = '2026-11-14 B round 510 -> 511 planning'
b = json.load(open('backlog.json', encoding='utf-8'))
b['version'] = b['version'] + 1
b['updated'] = by
b['current_task'] = ("Round 511: DPG-BUTTON-CLEANUP-2-NONBRAND stage N2 on PurchaseHeader (Buy Now -> Button buy lg; Open in Studio and "
    "Downloads links -> secondary lg builder; CartButton motion.button aligned to rounded-md/px-6/text-base/font-semibold, colours kept as a named "
    "exception). Product byte sketch b-round-510/sketch-511-purchaseheader.patch.txt (sha de636ad4); A writes tests N2-1..N2-9 + B2C-7/B2C-8/ST5 "
    "rewrites + doc 330 per b-round-510/test-contract-511.md (RC-R510-SKETCH-SCOPE trial). PlayStems out (B-R510-PLAYSTEMS-UNREACHABLE).")
D = [
 ("D-29z1850", "Round 510 (RETRO 510) accepted from c-round-510.json: PASS, browserVerified/realVerified true, 3 Lows (origin B spec). Gate 510 skipped 'no real changes' at head f5d1b9e, so the baseline for round 511 stays f5d1b9e (gate 509 published commit)."),
 ("D-29z1851", "C round 510 Lows C510-RETRO-MEDIAN-IS-MEAN, C510-LESSON-LINE-UNIT, C510-RETRO-REMAINING-79 corrected in retros/retro-510.md by an errata section (before-copy b-round-510/retro-510-before-errata.md); C verifies in round 511 row C11; until then status fixed_pending_C. RETRO 525 counter 'round median <= $17' unchanged (it is the round median, not the sketch-round B cost). INFO-C510-COLD-HYDRATION and INFO-C510-RTSABA-OBSERVATION recorded. L44: GATE384-L3-PLAY-REFUSE-AUTO-START (round-382 no auto-start ruling, never asked) goes to Saba once as SABA-Q-511-SPACE-AFTER-ADD (user-review/questions-round-511.md)."),
 ("D-29z1852", "Round 511 = NONBRAND N2 on PurchaseHeader only (4 controls). PlayStemsButton removed from N2: unreachable - no producer sets DisplayVersion.stems (createDisplayVersions/getVariantDisplayInfo never set it; MOCK_PRODUCT_DETAIL value has no importer), browser probe Premium on harbour-lights (includesStems true) = 0 'Play Stems' at 1440/1280/375 (b-round-510/probe/*/states.json STEMS), the only openStemsPlayer caller is PlayStemsButton. Filed B-R510-PLAYSTEMS-UNREACHABLE (medium, awaiting_user) + SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE (default remove, product-designer). ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE stems half corrected: a fixture cannot help (mapper drops stems; mock Premium already includesStems true) -> superseded by the Saba question. product-designer consult: CartButton option (b) radius/size/weight only, owned links secondary lg, Buy Now buy lg. tech-lead sketch review: approve (b-round-510/sketch-review.md)."),
 ("D-29z1853", "NONBRAND scanner widened to motion.button / motion.a (b-round-510/scan-nonbrand-motion.py; mutant proof scan-motion-mutant.txt): 54 at HEAD f5d1b9e (old 53); the only new hit is CartButton PurchaseHeader l.396. Sketch: 51 (3 PurchaseHeader hits leave; CartButton stays as the named exception). N3-N9 use the widened scanner."),
 ("D-29z1854", "Sketch review follow-up: B-R510-BUSY-CURSOR-HIDDEN (Low) deferred - shared Button adds pointer-events-none while disabled, so the busy Buy Now no longer shows not-allowed cursor (HEAD did via disabled:cursor-not-allowed). Clicks remain blocked. No architecture checkpoint requested: N2 closes no feature boundary and no repeated structural risk on one owner."),
]
for i, d in D:
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-14', 'by': by, 'decision': d})
for r in b['rounds']:
    if r.get('round') == 510:
        r['status'] = 'c_pass_gate_skipped (D-29z1850): C PASS browserVerified true; gate 510 skipped no real changes'
b['rounds'].append({'round': 511, 'task': 'current-task.md', 'decision': 'D-29z1852', 'type': 'NONBRAND N2 PurchaseHeader (feature stage, restyle)', 'status': 'dispatched',
    'note': 'baseline HEAD f5d1b9e; grants b-round-510/grants-511.txt (5); tree pins b-round-510/r511-tree-sha256.txt (1425); claims b-round-510/claims-511.sh K1-K20'})
of = b['open_findings']
def find(lst, i):
    for e in lst:
        if e.get('id') == i: return e
    return None
n = find(of, 'DPG-BUTTON-CLEANUP-2-NONBRAND')
n['status'] = ('in_progress (D-29z1852/D-29z1853): round 511 = N2 PurchaseHeader (Buy Now, Open in Studio, Downloads, CartButton shape); widened scanner 54 at HEAD; '
    'PlayStems moved out to B-R510-PLAYSTEMS-UNREACHABLE with the StemsPlayerModal pair; N3-N9 remain | ' + n['status'])
of.append({'id': 'B-R510-PLAYSTEMS-UNREACHABLE', 'severity': 'medium', 'origin': 'pre-existing', 'added': by,
    'status': 'awaiting_user (D-29z1852): SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE (user-review/questions-round-511.md); only Saba step remains, does not block (2026-10-23 root clarification class); NONBRAND PlayStems l.18 + StemsPlayerModal pair wait for it',
    'title': 'Product page "Play Stems" (PlayStemsButton -> StemsPlayerModal) can never render: no data path sets DisplayVersion.stems',
    'evidence': 'b-round-510/claims-511-planning-output.txt K9, K9b, K11, K18 (STEMS state 0 at 3 viewports); first commit 3927eda 2025-12-21 (K10)',
    'repro': 'open /products/harbour-lights, select Premium (variant includesStems true) -> no Play Stems button; grep createDisplayVersions: no stems key'})
of.append({'id': 'SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE', 'severity': 'info', 'origin': 'B spec', 'added': by, 'status': 'awaiting_user (D-29z1852): user-review/questions-round-511.md Q1; default (product-designer): remove PlayStemsButton and StemsPlayerModal', 'title': 'Wire Play Stems for Premium (needs backend stem preview URLs) or remove the dead pair?'})
of.append({'id': 'SABA-Q-511-SPACE-AFTER-ADD', 'severity': 'info', 'origin': 'B spec', 'added': by, 'status': 'awaiting_user (D-29z1851, L44): user-review/questions-round-511.md Q2', 'title': 'Round-382 ruling: Play pressed while a just-added sound decodes does not auto-start (user presses again). Keep, or auto-start when ready?'})
of.append({'id': 'INFO-C510-COLD-HYDRATION', 'severity': 'info', 'origin': 'environment', 'added': by, 'status': 'recorded (D-29z1851): first anonymous load on a cold Vite dep cache raised Invalid hook call during hydration; 4 later runs 0 (same as round 509); environment, not Studio', 'evidence': 'c-round-510.md Real browser results'})
of.append({'id': 'INFO-C510-RTSABA-OBSERVATION', 'severity': 'info', 'origin': 'B spec', 'added': by, 'status': 'recorded (D-29z1851): questions-retro-510.md Q4 (root requests) lists no defaults; Q6 calls L11 strengthen-only already in force while the consult called it a policy change needing B or root agreement (B adopted it in D-29z1847). Next question files give a default per question', 'evidence': 'c-round-510.md RT-SABA'})
dl = b['deferred_low_polish']
for i, t in [('C510-RETRO-MEDIAN-IS-MEAN', "retro-510 section 7 'median ~ $17' was the mean; median $15.65"),
             ('C510-LESSON-LINE-UNIT', "retro-510 section 9 '4,753 B' was characters; 4,771 bytes"),
             ('C510-RETRO-REMAINING-79', 'retro-510 section 4 remainder 79 -> 61 (79 - 18 classified); consult 78 ids')]:
    dl.append({'id': i, 'severity': 'low', 'origin': 'B spec', 'added': by, 'title': t, 'evidence': 'c-round-510.json bugs',
               'repro': 'c-round-510.json steps', 'status': 'fixed_pending_C (D-29z1851): errata in retros/retro-510.md; C round 511 row C11'})
dl.append({'id': 'B-R510-BUSY-CURSOR-HIDDEN', 'severity': 'low', 'origin': 'B spec', 'added': by, 'title': 'Busy Buy Now (native disabled) loses the not-allowed cursor: shared Button adds pointer-events-none',
           'evidence': 'b-round-510/sketch-review.md finding 1; probe/sketch/sketch-actions.json A1 pointerEvents none', 'repro': 'signed-in stub, click Buy Now, hover while Processing...', 'status': 'deferred_low_polish (D-29z1854)'})
g = find(dl, 'GATE384-L3-PLAY-REFUSE-AUTO-START')
if g: g['status'] = 'question to Saba SABA-Q-511-SPACE-AFTER-ADD (D-29z1851, L44) | ' + g['status']
rr = find(b['root_requests_b'], 'ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE')
rr['status'] = 'superseded (D-29z1852): stems half cannot help - the product mapper never sets DisplayVersion.stems and the mock Premium variant already has includesStems true; decision moves to SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE; free half not needed (D-29z1839) | ' + rr['status']
for e in b['post_current_stage_queue']:
    if e.get('id') == 'DPG-FIX':
        e['status'] = ('in_progress (D-29z1852): round 510 RETRO C PASS (gate skipped); round 511 NONBRAND N2 PurchaseHeader; then REGRESSION if on/after 2026-11-16, N3-N9 | ' + e['status'])
json.dump(b, open('backlog.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open('b-round-510/update-backlog-511.done', 'w').write('ok\n')
print('version', b['version'])
