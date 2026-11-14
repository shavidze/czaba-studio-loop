#!/usr/bin/env bash
# Claims for task round 506 (DPG-BUTTON-CLEANUP-2 stage 2e). Usage: bash claims-506.sh [store-tree] (default: the store repo).
# Prints one block per [K#]. Run from anywhere. Loop artifacts are read from the loop root.
T=${1:-/home/runner/czaba-project/store}
LOOP=/home/runner/czaba-project/tmp/studio-real-loop
B=$LOOP/b-round-505
LM=app/components/marketing/LeadMagnetPopup.tsx
cd "$T" || exit 1
echo "[K1] HEAD"; git -C /home/runner/czaba-project/store rev-parse --short HEAD
echo "[K2] store worktree (modified untracked)"; git -C /home/runner/czaba-project/store status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr '\n' ' '; echo
echo "[K3] LeadMagnetPopup importers in app/** (non-test)"; grep -rln "LeadMagnetPopup" app --include=*.tsx --include=*.ts | grep -v __tests__ | sort | tr '\n' ' '; echo
echo "[K4] hand-rolled <button / <Button counts in the popup"; echo "$(grep -c '<button\b' $LM) $(grep -c '<Button\b' $LM)"
echo "[K5] bg-destructive / bg-brand / isLoading counts in the popup"; echo "$(grep -c 'bg-destructive' $LM) $(grep -cw 'bg-brand' $LM) $(grep -c 'isLoading' $LM)"
echo "[K6] copy kept"; for c in 'FREE DOWNLOAD' "{isSubmitting ? 'SENDING...' : 'CONTINUE'}" 'BACK TO SITE' 'Tracks, Sound Effects & More' 'CLAIM YOUR OFFER' "We've sent your free mystery pack to your email!"; do printf '%s ' "$(grep -cF "$c" $LM)"; done; echo
echo "[K7] Button isLoading branch replaces children with a spinner and Loading..."; grep -nE "isLoading \? \(|<span>Loading\.\.\.</span>|const isDisabled = disabled \|\| isLoading" app/components/ui/Button.tsx | sed 's/^\([0-9]*\):\s*/\1: /'
echo "[K8] Button lg size / default shape / disabled classes"; grep -nE "^\s*lg: 'px-6 py-3 text-base gap-2'|default: 'rounded-md'|isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'" app/components/ui/Button.tsx | sed 's/^\([0-9]*\):\s*/\1: /'
echo "[K9] ST5 LeadMagnet pin lines"; grep -nE "leadMagnetSubmit|classAttributesWithTokens\(leadMagnetSource" app/lib/__tests__/store-theme-tokens.test.ts | sed 's/^\([0-9]*\):\s*/\1: /'
echo "[K10] SWEEP LeadMagnetPopup in test roots (app/**, perf/**, e2e/**)"; grep -rlE "LeadMagnetPopup" app perf e2e 2>/dev/null | grep -E "__tests__|\.test\.|\.spec\." | sort | tr '\n' ' '; echo
echo "[K11] SWEEP popup action names in test roots"; grep -rlE "FREE DOWNLOAD|BACK TO SITE|'CONTINUE'|SENDING\.\.\." app perf e2e 2>/dev/null | grep -E "__tests__|\.test\.|\.spec\." | sort | tr '\n' ' '; echo
echo "[K12] brand scanner"; python3 -I $LOOP/b-round-497/scan-brand.py . /tmp/k12-scan.json | tail -1
echo "[K13] subscribe endpoint and trigger constants"; grep -nE "fetch\('/api/subscribe'|const SHOW_DELAY_MS = 8000|const SCROLL_THRESHOLD = 40|addEventListener\('mouseleave'" app/hooks/useLeadMagnet.ts | sed 's/^\([0-9]*\):\s*/\1: /'
echo "[K14] L50 focus-origin grep on the popup (count; lines)"; grep -cE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' $LM; grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' $LM | cut -d: -f1 | tr '\n' ' '; echo
echo "[K15] focus trap query and refocus guard"; grep -nE "querySelectorAll<HTMLElement>\('button:not\(\[disabled\]\), input:not\(\[disabled\]\)'\)|if \(dialogRef.current\?\.contains\(document.activeElement\)\) return;" $LM | sed 's/^\([0-9]*\):\s*/\1: /'
D=docs/implementation/2026/quarter-IV/327-dpg-button-cleanup-stage-2e.md
echo "[K16] doc 327 l.4 and headings"; if [ -f $D ]; then sed -n 4p $D; grep '^## ' $D | tr '\n' '|'; echo; else echo "absent"; fi
echo "[K17] DESIGN_SYSTEM LeadMagnet phrase"; grep -c "LeadMagnet popup-ის სამი მოქმედება" docs/design/DESIGN_SYSTEM.md
echo "[K18] 'C round N pending' in docs/implementation"; grep -rn 'C round [0-9]* pending' docs/implementation | wc -l
echo "[K19] gate 505 and c-round-505"; python3 -I -c "import json;g=json.load(open('$LOOP/gates/gate-round-505.json'));c=json.load(open('$LOOP/c-round-505.json'));print(g['status'],g['commit'][:7],c['taskStatus'],c['browserVerified'],c['realVerified'],len(c['bugs']),c['bugs'][0]['id'],c['bugs'][0]['severity'])"
echo "[K20] c-round-505 L57"; tail -1 $LOOP/c-round-505/l57-check.txt
echo "[K21] frozen list sizes (tree, pre, post, protected)"; echo "$(wc -l < $B/r506-tree-sha256.txt) $(wc -l < $B/r506-pre-sha.txt) $(wc -l < $B/r506-post-sketch-sha.txt) $(wc -l < $LOOP/b-round-318/protected-sha256.txt)"
echo "[K22] granted paths in the protected list"; grep -cE "LeadMagnetPopup|store-theme-tokens|DESIGN_SYSTEM|store-button-cleanup-2e|327-dpg" $LOOP/b-round-318/protected-sha256.txt
echo "[K23] new row ids"; if [ -f app/lib/__tests__/store-button-cleanup-2e.test.tsx ]; then grep -oE "it\('B2E-[0-9]+" app/lib/__tests__/store-button-cleanup-2e.test.tsx | sed "s/it('//" | tr '\n' ' '; echo; else echo "absent"; fi
echo "[K24] pre-check tsc / lint / biome"; echo "$(tail -1 $B/precheck-tsc.log) | $(grep -E '^Found [0-9]+ warnings' $B/precheck-lint.log) $(tail -1 $B/precheck-lint.log) | $(grep -E 'Checked [0-9]+ files' $B/precheck-biome.log | sed 's/ in [0-9.]*m\?s//') $(tail -1 $B/precheck-biome.log)"
echo "[K25] pre-check full suite / build / covering"; echo "$(grep -E 'Test Files' $B/precheck-full.log | tr -s ' ') | $(grep -E '^ *Tests' $B/precheck-full.log | tr -s ' ') | full $(tail -1 $B/precheck-full.log) | build $(tail -1 $B/precheck-build-sketch.log) | covering $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -E '^ *Tests' | tr -s ' ') $(tail -1 $B/precheck-covering.log)"
echo "[K26] mutants"; grep -c " OK$" $B/mutants-506.txt; grep -cE "MISMATCH|APPLY-FAIL" $B/mutants-506.txt; tail -1 $B/mutants-506.txt
echo "[K27] probe key values (head | sketch) per width: FREE h, CONTINUE bg, contrast, activeOnSuccess, activeAfterError"
for t in head sketch; do python3 -I -c "
import json
for l in open('$B/probe/$t/$t.jsonl'):
    r=json.loads(l); print('$t', r['W'], r['offer']['rest']['box'][3], r['email']['rest']['bg'], r['email']['restContrast'], r['activeOnSuccess'].get('name'), r['activeAfterError'].get('tag'), r['sending'].get('pe'), r['escClosed'])
"; done
echo "[K28] L58"; (cd $LOOP && python3 -I tools/l58-check.py current-task.md | tail -1)
echo "[K29] cited artifacts exist"; for f in sketch-506.patch.txt sketch-506-v1.patch.txt sketch-delta-v1-v2.diff.txt sketch-sha.txt sketch-sha-history.txt sketch-review.md consult-product-designer.md mutants-506.py mutants-506.txt mutants-506-run1.txt precheck-full.log precheck-full-raw.log precheck-build-sketch.log precheck-covering.log precheck-tsc.log precheck-lint.log precheck-biome.log covering-files.txt r506-tree-sha256.txt r506-pre-sha.txt r506-post-sketch-sha.txt probe/lm-506.cjs probe/head/head.jsonl probe/sketch/sketch.jsonl probe/compare.txt cr1/README.txt cr1/summary.txt scan-head.json scan-sketch.json doc-ledger.md probe/ax-email.cjs probe/ax-email-head.out; do test -f $B/$f && printf 'ok ' || printf "MISSING:$f "; done; echo
echo "[K30] 'In Progress (stage' lines for DPG-BUTTON-CLEANUP-2 docs"; grep -rln 'In Progress (stage [0-9a-z-]* of DPG-BUTTON-CLEANUP-2' docs/implementation | sort | tr '\n' ' '; echo
echo "[K31] ids"; python3 -I $LOOP/tools/find-ids.py $LOOP SABA-Q-499-BUTTON-CASE DPG-BUTTON-CLEANUP-2-NONBRAND B-R505-CHAT-TEXTAREA-NO-LABEL B-R505-GUESTFORM-NATIVE-VALIDATION SABA-Q-506-LM-CONTINUE-COLOUR B-R506-LM-EMAIL-NO-LABEL B-R506-LM-NATIVE-VALIDATION B-R506-LM-WHITE-FIELD B-R506-LM-WORDMARK B-R506-LM-EMOJI-ICON A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON LEADMAGNET-REAL-SUBSCRIBE | awk '{print $1, $2, $3}'
python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print([x['id'] for x in b['root_requests_b'] if x.get('id')=='ROOT-REQ-DPG-PRIMITIVES-PATCH'])"
echo "[K32] inventory A5 line"; grep -c "| A5 keep-list | LeadMagnetPopup 187 / 279 |" $LOOP/b-round-497/stage2-inventory.md
echo "[K33] HEAD popup action lines (offer 181-195, submit 245-251, back 272-287 at d6903a7)"; git -C /home/runner/czaba-project/store show d6903a7:$LM | sed -n '187p;248p;279p' | sed 's/^ *//'
echo "[K34] email field aria-label / aria-invalid / aria-describedby / noValidate counts in the popup"; echo "$(grep -c 'aria-invalid' $LM) $(grep -c 'aria-describedby' $LM) $(grep -c 'noValidate' $LM) $(sed -n '/<input/,/\/>/p' $LM | grep -c 'aria-label')"
echo "[K35] round-505 C offset values"; grep -o '"offset": *"[^"]*"' $LOOP/c-round-505/after/after.json | sort | uniq -c | tr -s ' '
echo "[K36] red history (b5d623f CONTINUE colour) and the email field's AX name"; git -C /home/runner/czaba-project/store show b5d623f:$LM | grep -c 'bg-\[#E63946\]'; cat $B/probe/ax-email-head.out | head -1
