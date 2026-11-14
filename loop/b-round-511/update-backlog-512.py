# B round 511 -> 512 planning: backlog update (run once from the loop root; writes a .done marker).
import json, os, sys
if os.path.exists('b-round-511/update-backlog-512.done'):
    sys.exit('already applied')
by = '2026-11-14 B round 511 -> 512 planning'
b = json.load(open('backlog.json', encoding='utf-8'))
b['version'] = b['version'] + 1
b['updated'] = by
b['current_task'] = ("Round 512: DPG-BUTTON-CLEANUP-2-NONBRAND N2 close-out (docs-only): git apply b-round-511/sketch-512-docs.patch.txt "
    "(sha ad47fec4) on the uncommitted round-511 tree (HEAD f5d1b9e) - DESIGN_SYSTEM.md (colour row, variant guide, Buttons sections + new Buy block), "
    "docs/design/components/button.md, ui-components.md Button section, doc 330 l.4 -> C round 512; C re-checks docs + default card, anon journey, "
    "Added pulse (record), protection + /studio-lab in the browser.")
D = [
 ("D-29z1856", "Round 511 C result accepted from c-round-511.json: taskStatus FAIL only for A's unruled STOP; every row C0-C14 PASS, browserVerified/realVerified true (17 passed). Gate 511 skipped (C FAIL), nothing published; baseline stays HEAD f5d1b9e + the uncommitted round-511 tree (pinned b-round-511/r512-a511-pin-sha.txt, app diff == a-round-511/diff.patch). STOP ruling (L10) on A-R511-REVIEW-DESIGN-SYSTEM-PRIMARY-EXAMPLES: option (a) doc-only follow-up grant, not (b) Low-deferred - origin B spec (two-line grant, L34 not applied), the stale design doc would steer N3-N9, and N2 cannot publish without a C PASS anyway. One finding id C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES (Medium) with A's STOP id as alias (L7)."),
 ("D-29z1857", "Doc grant widened by inventory (L1/L34): the same 'Add to Cart / Buy Now = primary' claim is in docs/design/components/button.md and in the Button section of docs/technical/components/ui-components.md (which also carries teal #13D9CC and accent #f9a91f, part of SIG-R477-DOCS-OUTSIDE-DESIGN); all three docs granted as whole sections via one byte sketch (tech-lead reviewed twice, approve; 4 wording Lows applied, 1 rejected under L28). docs/design/components/card.md l.126 (illustrative Card composition) not granted, recorded. Doc text describes HEAD: buy only Buy Now; Checkout, Get it free, Upgrade/Unlock Premium primary; cart Upgrade colour cites SABA-Q-502-UPGRADE-VARIANT."),
 ("D-29z1858", "B pre-check probe (b-round-511/probe/n2-added.mjs, round-511 tree): Add to Cart 'Added' pulse scales to 1.04 under prefers-reduced-motion: reduce as well as no-preference (motion.button animate has no useReducedMotion guard; other Store components have one). Pre-existing, not caused by N2 -> new Low B-R511-CART-PULSE-REDUCED-MOTION in deferred_low_polish (2026-10-23 bug gate); C records it in round 512 C5. Reviewer's mouse-down opacity Low (A-R511 For B 2) did not reproduce in C round 511 C3 -> no finding."),
 ("D-29z1859", "Doc 330 l.4 is a re-dispatch under L28: rewritten to 'Completed (C round 512 PASS)' inside B's sketch; tech-lead's suggestion of a pending form rejected (L28 forbids it). Process findings from a-round-511.md recorded: A-R511-L60-SHELL-EDITS (python string-replace in the store tree; content verified by diff/mutants) and A-R511-PRIMITIVES-PARTIAL-READ (several mapped primitives read only partly). Architecture note (three copies of the JSX tag scanner) -> confirmedBy on SIG-R501-SHARED-BUTTON-SCANNER, not scheduled. INFO-C510-COLD-HYDRATION confirmed again (C round 511 C1 cold ANON 1440). RETRO input: L34 'grant the whole section' was not applied to a design doc grant in round 511."),
]
for i, d in D:
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-14', 'by': by, 'decision': d})
for r in b['rounds']:
    if r.get('round') == 511:
        r['status'] = 'c_fail_unruled_stop_gate_skipped (D-29z1856): every C row PASS, browserVerified true; FAIL only for A STOP on stale DESIGN_SYSTEM examples; ruled (a) in round 512'
b['rounds'].append({'round': 512, 'task': 'current-task.md', 'decision': 'D-29z1856', 'type': 'NONBRAND N2 close-out (docs-only fix-up of round 511)', 'status': 'dispatched',
    'note': 'baseline HEAD f5d1b9e + uncommitted round-511 tree; grants 4 docs via b-round-511/sketch-512-docs.patch.txt (sha ad47fec4); pins r512-tree-sha256.txt (1425), r512-a511-pin-sha.txt, r512-pre-sha.txt, r512-post-sketch-sha.txt; claims b-round-511/claims-512.sh K1-K17'})
of = b['open_findings']; dl = b['deferred_low_polish']
def find(lst, i):
    for e in lst:
        if isinstance(e, dict) and e.get('id') == i: return e
    return None
n = find(of, 'DPG-BUTTON-CLEANUP-2-NONBRAND')
n['status'] = ('in_progress (D-29z1856): N2 PurchaseHeader code verified by C round 511 (C0-C14 PASS, browserVerified true, not published: C FAIL on the unruled doc STOP); round 512 closes the doc half; N2 done only after C round 512 PASS; N3-N9 remain | ' + n['status'])
of.append({'id': 'C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES', 'aliases': ['A-R511-REVIEW-DESIGN-SYSTEM-PRIMARY-EXAMPLES'], 'severity': 'medium', 'origin': 'B spec', 'added': by,
    'status': 'scheduled round 512 (D-29z1856/D-29z1857): doc-only sketch over DESIGN_SYSTEM.md, button.md, ui-components.md',
    'title': 'After N2, Button docs contradict the code: DESIGN_SYSTEM.md Usage Examples/Primary heading still show Add to Cart as variant=primary and <PrimaryButton>Buy Now; no buy block; same claim in docs/design/components/button.md and ui-components.md',
    'evidence': 'c-round-511.json bugs[0]; a-round-511.md STOP; b-round-511/claims-512-planning-output.txt K6, K15',
    'repro': "grep -n 'variant=\"primary\" size=\"lg\">Add to Cart\\|<PrimaryButton>Buy Now' docs/design/DESIGN_SYSTEM.md"})
of.append({'id': 'A-R511-L60-SHELL-EDITS', 'severity': 'info', 'origin': 'A', 'added': by, 'status': 'recorded (D-29z1859): process finding; content verified (diff == contract, mutants red); RETRO input',
    'title': 'A edited store files with python exact-string replace instead of the Edit tool (L60), so the primitives hook did not fire', 'evidence': 'a-round-511.md "A\'s own process findings"'})
of.append({'id': 'A-R511-PRIMITIVES-PARTIAL-READ', 'severity': 'info', 'origin': 'A', 'added': by, 'status': 'recorded (D-29z1859): RETRO input (read-primitives rule says read each mapped file)',
    'title': 'A read FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, BUG_HUNTING_TESTS and prompts/new-test.md only for their first ~60 lines', 'evidence': 'a-round-511.md "Primitives only partly read"'})
dl.append({'id': 'B-R511-CART-PULSE-REDUCED-MOTION', 'severity': 'low', 'origin': 'B pre-check', 'added': by,
    'title': 'Add to Cart "Added" pulse (framer animate scale [1,1.05,1]) still plays under prefers-reduced-motion: reduce',
    'evidence': 'b-round-511/probe/run/b-added.json (max scale 1.042 at 1440 and 1.041 at 1280 under both settings); PurchaseHeader.tsx CartButton motion.button animate without useReducedMotion',
    'repro': 'node b-round-511/probe/n2-added.mjs <dir> x (reducedMotion reduce context); read addedMaxScale', 'status': 'deferred_low_polish (D-29z1858); C round 512 C5 records it'})
s = find(of, 'SIG-R501-SHARED-BUTTON-SCANNER')
s.setdefault('confirmedBy', []).append('a-round-511.md Architecture note: three copies (2c openingTags, n2 copy, ST5 buyVariantTag) (D-29z1859)')
h = find(of, 'INFO-C510-COLD-HYDRATION') or find(dl, 'INFO-C510-COLD-HYDRATION')
h.setdefault('confirmedBy', []).append('c-round-511.md C1: first ANON 1440 run cold-Vite hydration error, warm re-run clean (D-29z1859)')
g = find(of, 'SIG-R477-DOCS-OUTSIDE-DESIGN') or find(b.get('architecture_signals', []), 'SIG-R477-DOCS-OUTSIDE-DESIGN')
if g: g['status'] = 'partly addressed round 512 (D-29z1857): ui-components.md Button section teal/orange hex granted; other files unchanged | ' + g['status']
b['retro_candidates'].append({'id': 'RC-R511-L34-DESIGN-DOC-GRANT', 'added': by, 'decision': 'D-29z1859', 'status': 'RETRO input',
    'note': 'Round 511 granted two named lines of DESIGN_SYSTEM.md instead of its Buttons section (L34), which cost one C FAIL round (512 is a doc-only fix-up). Candidate wording: L34 applies to design docs, and B greps every doc that states the changed rule (L1).'})
for e in b['post_current_stage_queue']:
    if e.get('id') == 'DPG-FIX':
        e['status'] = ('in_progress (D-29z1856): round 511 N2 code C-verified, FAIL on unruled doc STOP; round 512 = N2 doc close-out; then REGRESSION if on/after 2026-11-16, N3-N9 | ' + e['status'])
json.dump(b, open('backlog.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open('b-round-511/update-backlog-512.done', 'w').write('ok\n')
print('version', b['version'])
