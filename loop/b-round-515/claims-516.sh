#!/usr/bin/env bash
# Round 516 claims. Run from anywhere: bash claims-516.sh. Each K# prints its evidence; C compares with claims-516-planning-output.txt.
S=/home/runner/czaba-project/store
L=/home/runner/czaba-project/tmp/studio-real-loop
B=$L/b-round-515
cd "$S" || exit 1
echo "K1 HEAD"; git rev-parse HEAD
echo "K2 tracked tree changes (planning: 0 lines)"; git status --short --untracked-files=no | wc -l
echo "K3 C round 515"; python3 -I -c "import json;d=json.load(open('$L/c-round-515.json'));print(d['taskStatus'],d['browserVerified'],d['realVerified'],len(d['bugs']))"
echo "K4 gate 515"; python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-515.json'));print(d['status'],d['commit'])"
echo "K5 scanner HEAD and sketch hit counts + SpecialOffers entries"; python3 -I -c "
import json
h=json.load(open('$B/scan-head.json'));s=json.load(open('$B/scan-sketch.json'))
print(len(h),len(s),[x['line'] for x in h if 'SpecialOffers' in x['file']],[x['line'] for x in s if 'SpecialOffers' in x['file']])"
echo "K6 SpecialOffers hand-rolled link class literal (lines)"; grep -n 'className="w-fit cursor-pointer rounded-lg border border-outline bg-elevated px-6 py-3 font-medium' app/components/home/SpecialOffersSection.tsx | cut -d: -f1 | tr '\n' ' '; echo
echo "K7 LeadMagnet Close: hand-rolled button count, top-6 right-6 class, X size 32, closeButtonRef"; grep -c '<button\b' app/components/marketing/LeadMagnetPopup.tsx; grep -n 'absolute top-6 right-6 text-foreground/60' app/components/marketing/LeadMagnetPopup.tsx | cut -d: -f1; grep -n '<X size={32} />' app/components/marketing/LeadMagnetPopup.tsx | cut -d: -f1; grep -c 'closeButtonRef' app/components/marketing/LeadMagnetPopup.tsx
echo "K8 B2E-6 pins one hand-rolled button"; grep -n "match(/<button\\\\b/g) ?? \[\]).length).toBe(1)" app/lib/__tests__/store-button-cleanup-2e.test.tsx | cut -d: -f1
echo "K9 IconButton lg size and ghost variant"; grep -n "lg: { button: 'w-12 h-12', icon: 24 }" app/components/ui/IconButton.tsx | cut -d: -f1; grep -n "'bg-transparent text-muted'," app/components/ui/IconButton.tsx | cut -d: -f1; grep -n "title={label}" app/components/ui/IconButton.tsx | cut -d: -f1
echo "K10 Button default shape and secondary lg"; grep -n "default: 'rounded-md'," app/components/ui/Button.tsx | cut -d: -f1; grep -n "lg: 'px-6 py-3 text-base gap-2'," app/components/ui/Button.tsx | cut -d: -f1
echo "K11 probe files and values (HEAD vs sketch)"; for t in head sketch; do test -f $B/probe/$t/n4.json && python3 -I -c "
import json
d=json.load(open('$B/probe/$t/n4.json'))
for w,r in d['widths'].items():
  c=r['closeOnOpen'];print('$t',w,r['gift']['box'][2:],r['collection']['box'][2:],r['gift']['radius'],r['gift']['weight'],r['gift']['parentW'],r['giftHover']['bg'],c['box'][2:],c['centreFromTop'],c['centreFromRight'],c['glyph'],c['isActive'],c['title'],r['closeContrast'],c['wordmarkOverlap'],c['hScroll'],r['closeHover']['bg'],r['closedAfterClick'],r['afterCloseActive']['name'],len(d['errors']))"; done
echo "K12 mutants (count, red)"; python3 -I -c "import json;d=json.load(open('$B/mut-logs/mutants-summary.json'));print(len(d),sum(v['red'] for v in d.values()))"
echo "K13 covering on sketch"; sed 's/\x1b\[[0-9;]*m//g' $B/sketch-covering.log | grep -E "Test Files|Tests " | tr -s ' '
echo "K14 lint on sketch"; grep -oE "Found [0-9]+ warnings?" $B/sketch-lint.log
echo "K15 pins"; wc -l < $B/r516-tree-sha256.txt; sha256sum -c --quiet $B/r516-tree-sha256.txt && echo tree-ok; sha256sum -c --quiet $L/b-round-318/protected-sha256.txt && echo protected-ok; sha256sum -c --quiet $B/r516-pre-sha.txt && echo pre-ok
echo "K16 regression-last"; python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])"
echo "K17 implementation docs (last number; 334 free)"; ls docs/implementation/2026/quarter-IV | tail -1; ls docs/implementation/2026/quarter-IV | grep -c '^334-'
echo "K18 full suite pre-check on the sketch"; sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -E "Test Files|Tests " | tr -s ' '
echo "K19 cited artifacts exist"; for f in sketch-516.patch.txt sketch-sha.txt sketch-review.md grants-tracked.txt claims-516-allowed-delta.txt doc-e2e-inventory.txt consult-product-designer.md covering-files.txt mutants-516.py probe/n4-probe.mjs precheck-tsc-sketch.log sketch-biome.log scan-head.json scan-sketch.json r516-post-sketch-sha.txt; do test -f $B/$f && echo "ok $f" || echo "MISSING $f"; done
echo "K20 sketch applies to HEAD"; git apply --check $B/sketch-516.patch.txt && echo apply-ok; sha256sum -c --quiet $B/sketch-sha.txt && echo sketch-sha-ok
echo "K21 LeadMagnet tests reference Close by role (count of test files)"; grep -l "name: 'Close'" app/lib/__tests__/*.tsx | wc -l
