#!/usr/bin/env bash
# usage: bash claims-504.sh [store-tree]   (default /home/runner/czaba-project/store). Run from anywhere.
# HEAD-tree output: claims-504-planning-output.txt; sketch-tree output (/home/runner/b503-verify = HEAD archive + sketch v2): claims-504-sketch-output.txt
S="${1:-/home/runner/czaba-project/store}"; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-503
cd "$S" || exit 2
PH=app/components/product/PurchaseHeader.tsx; BT=app/components/ui/Button.tsx; DS=docs/design/DESIGN_SYSTEM.md
T2C=app/lib/__tests__/store-button-cleanup-2c.test.tsx; D325=docs/implementation/2026/quarter-IV/325-dpg-button-cleanup-stage-2c.md
DLOLD='className="group px-6 py-3 bg-brand text-background font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 min-w-[160px] hover:bg-brand-hover"'
UPOLD='className="group px-6 py-3 bg-brand text-black font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 min-w-[160px] hover:bg-brand/90"'
UNOLD='className="group px-6 py-3 bg-brand text-background font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] hover:bg-brand-hover"'
BUYNOW='className="group px-6 py-3 bg-buy text-brand-foreground font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed! flex items-center justify-center gap-2 min-w-[120px] hover:bg-buy-hover"'
echo "K1 store HEAD $(git -C /home/runner/czaba-project/store rev-parse --short HEAD 2>/dev/null)"
echo "K2 store worktree vs HEAD (modified/untracked): $(git -C /home/runner/czaba-project/store status --short --untracked-files=all | grep -c '^ M') $(git -C /home/runner/czaba-project/store status --short --untracked-files=all | grep -c '^??')"
echo "K3 Go to Downloads old class / Unlock Premium old class / Upgrade to Premium old class (text-black): $(grep -cF "$DLOLD" $PH) $(grep -cF "$UNOLD" $PH) $(grep -cF "$UPOLD" $PH)"
echo "K4 new forms: builder calls / <Button opening tags / min-w-[160px] whitespace-nowrap extras: $(grep -c 'buildButtonClassName(' $PH) $(grep -c '<Button$' $PH) $(grep -cE "min-w-\[160px\] whitespace-nowrap['\"]" $PH)"
echo "K5 Buy Now bg-buy class line unchanged (count) / bg-buy lines: $(grep -cF "$BUYNOW" $PH) $(grep -c 'bg-buy' $PH)"
echo "K6 purchase handlers block sha (handleAddToCart .. isDisabled): $(sed -n '/const handleAddToCart = async/,/const isDisabled = /p' $PH | sha256sum | cut -c1-16)"
echo "K7 Busy copy and spinner (Processing... / Loader2 animate-spin): $(grep -c '<span>Processing...</span>' $PH) $(grep -c '<Loader2 size={16} className="animate-spin" />' $PH)"
echo "K8 Button.tsx: default shape rounded-md / lg size / disabled classes / isLoading Loading... / props spread: $(grep -c "default: 'rounded-md'," $BT) $(grep -c "lg: 'px-6 py-3 text-base gap-2'," $BT) $(grep -c "isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'," $BT) $(grep -c '<span>Loading...</span>' $BT) $(grep -c '{...props}' $BT)"
echo "K9 ui barrel exports Button and buildButtonClassName: $(grep -cE "export \{[^}]*\bButton\b|export \* from './Button'|from './Button'" app/components/ui/index.ts)"
echo "K10 app.css :active scale applies to enabled buttons only: $(grep -cF 'button:active:not(:disabled):not([aria-disabled="true"]),' app/styles/app.css)"
echo "K11 scanner (any/solid): $(python3 -I $L/b-round-497/scan-brand.py . /tmp/claims-504-scan.json)"
echo "K12 PurchaseHeader importers (non-test): $(grep -rlE "PurchaseHeader" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -v "$PH" | sort | paste -sd' ')"
echo "K13 SWEEP labels/tokens/module paths in test roots (app/**/__tests__, perf/**, e2e/**):"
grep -rlE "PurchaseHeader|ProductDetailPage|Unlock Premium|Upgrade to Premium|Go to Downloads|Processing\.\.\.|text-black|bg-buy" app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|^perf/|^e2e/|\.spec\.' | sort | sed 's/^/  /'
echo "K14 e2e hits for the three labels: $(grep -rlE 'Unlock Premium|Upgrade to Premium|Go to Downloads' e2e 2>/dev/null | wc -l)"
echo "K15 token tests pin on PurchaseHeader: ST bg-buy length 1 / glow-free list entry: $(grep -c "readStoreFile('app/components/product/PurchaseHeader.tsx')" app/lib/__tests__/store-theme-tokens.test.ts) $(grep -c "'components/product/PurchaseHeader.tsx'," app/lib/__tests__/store-glow-shadow.test.ts)"
echo "K16 doc 325 l.4 / '## ' headings: $(sed -n 4p $D325 2>/dev/null) | $(grep -c '^## ' $D325 2>/dev/null || echo 0)"
echo "K17 implementation docs 320-324 exist / 325 absent at HEAD: $(ls docs/implementation/2026/quarter-IV/ | grep -cE '^32[0-4]-') $(ls docs/implementation/2026/quarter-IV/ | grep -cE '^325-')"
echo "K18 DESIGN_SYSTEM default-row PurchaseHeader / two-shapes sentence old / new: $(grep -c 'product გვერდის purchase card-ის მოქმედებები (`PurchaseHeader`: „Go to Downloads“, „Upgrade to Premium“, „Unlock Premium“, `lg`, `min-w-\[160px\]`)' $DS) $(grep -c 'dialog-ებზე, Store-ის ფორმის submit-ზე და შეტყობინების შიგნით მოქმედებაზე (cart-ის „Upgrade“) 8px.' $DS) $(grep -c 'შეტყობინების შიგნით მოქმედებაზე (cart-ის „Upgrade“) და purchase card-ის მოქმედებაზე (`PurchaseHeader`) 8px.' $DS)"
echo "K19 pending grep in docs/implementation: $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K20 L31: vitest testTimeout set / timeout tokens in covering files (excluding 2c) / slowest covering test: $(grep -c testTimeout vitest.config.ts) $(cat $B/covering-files.txt | grep -v 2c | xargs grep -c 'timeout' 2>/dev/null | awk -F: '{s+=$2} END {print s+0}') $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -oE '✓ .* [0-9]+ms$' | grep -oE '[0-9]+ms$' | sort -n -r | head -1)"
echo "K21 gate 503 status/commit / c-round-503 status, browserVerified, bugs: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-503.json'));print(g['status'], g.get('commit','')[:7])") $(python3 -I -c "import json;c=json.load(open('$L/c-round-503.json'));print(c['taskStatus'], c['browserVerified'], len(c['bugs']))")"
echo "K22 c-round-503 L57: $(tail -1 $L/c-round-503/l57-check.txt)"
echo "K23 frozen list sizes (r504 tree, protected) / tracked files: $(wc -l < $B/r504-tree-sha256.txt) $(wc -l < $L/b-round-318/protected-sha256.txt) $(git -C /home/runner/czaba-project/store ls-files | wc -l)"
echo "K24 granted tracked paths in the protected list: $(grep -cE 'PurchaseHeader\.tsx|DESIGN_SYSTEM\.md' $L/b-round-318/protected-sha256.txt)"
echo "K25 new test row ids B2C-0..9 (distinct): $(grep -oE "'B2C-[0-9]:" $T2C 2>/dev/null | sort -u | wc -l)"
echo "K26 lint/Biome/tsc on sketch: $(grep -E 'Found [0-9]+ warnings' $B/precheck-lint.log | head -1) | $(tail -1 $B/precheck-lint.log) | biome $(tail -1 $B/precheck-biome.log) | tsc $(tail -1 $B/precheck-tsc.log)"
echo "K27 full suite / build on sketch: $(grep -E 'Test Files|Tests ' $B/precheck-full.log | tr -s ' ' | paste -sd'|') $(tail -1 $B/precheck-full.log) | build $(tail -1 $B/precheck-build-sketch.log)"
echo "K28 mutants: OK lines / restored: $(grep -c ' OK$' $B/mutants-504.txt) $(tail -1 $B/mutants-504.txt)"
echo "K29 probe key values (sketch.json): $(python3 -I -c "
import json
r=json.load(open('$B/probe/sketch/sketch.json'))
t={'Go to Downloads','Upgrade to Premium','Unlock Premium'}
o=[]
for x in r:
  for i in x['items']:
    if i['name'] in t and i['count']==1:
      a=i['rest']; o.append(f\"{x['id']}/{x['vp'].split('x')[0]}:{a['w']}x{a['h']},{a['radius']},{i['restContrast']}/{i['hoverContrast']},op{i['press']['opacity']}\")
print(' '.join(o))")"
echo "K30 journeys (sketch-journey.json) J3/J4 checkout POSTs, arrivals: $(python3 -I -c "
import json
r=json.load(open('$B/probe/sketch/sketch-journey.json'))
print(' '.join(f\"{x['id']}/{x['vp'].split('x')[0]}:{x.get('arrived')}:{x['posts'].count('/api/cart/checkout')}\" for x in r))")"
echo "K31 card info equal HEAD vs sketch (focusables, overflow): $(diff <(grep '^==' $B/probe/head.out) <(grep '^==' $B/probe/sketch.out) >/dev/null && echo equal || echo DIFF)"
echo "K32 artifacts:"; for f in sketch-504.patch.txt sketch-504-v1.patch.txt sketch-504-v2.patch.txt sketch-504-v3.patch.txt sketch-delta-v1-v2.diff.txt sketch-delta-v2-v3.diff.txt l58-check.txt sketch-sha.txt sketch-sha-history.txt sketch-review.md consult-product-designer.md covering-files.txt mutants-504.py mutants-504.txt mutant-logs/summary.txt precheck-tsc.log precheck-lint.log precheck-biome.log precheck-covering.log precheck-full.log precheck-full-raw.log precheck-build-sketch.log r504-tree-sha256.txt r504-pre-sha.txt r504-post-sketch-sha.txt scan-head.json scan-sketch.json scan-sketch.txt probe/measure-504.mjs probe/journey-504.mjs probe/compare-504.py probe/compare-504.txt probe/head.out probe/sketch.out probe/head-journey.out probe/sketch-journey.out probe/head/head.json probe/sketch/sketch.json probe/head/head-journey.json probe/sketch/sketch-journey.json; do test -f "$B/$f" && echo "  ok $f" || echo "  MISSING $f"; done
echo "K33 ids in backlog.json: $(for i in D-29z1812 D-29z1813 D-29z1814 D-29z1815 D-29z1816 DPG-BUTTON-CLEANUP-2-NONBRAND SABA-Q-502-UPGRADE-VARIANT PD-R504-DISABLED-NO-REASON TL-R504-STALE-UPGRADE-COMMENT A-R503-CR-3-STUBCATALOG-DRIFT; do grep -q "\"$i\"" $L/backlog.json && echo -n "$i " || echo -n "MISSING:$i "; done)"
echo "K34 L58 check: $(cd $L && python3 -I tools/l58-check.py current-task.md 2>/dev/null | tail -1)"
