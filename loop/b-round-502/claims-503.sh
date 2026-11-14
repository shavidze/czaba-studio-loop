#!/usr/bin/env bash
# usage: bash claims-503.sh [store-tree]   (default /home/runner/czaba-project/store). Run from anywhere.
# HEAD-tree output: claims-503-planning-output.txt; sketch-tree output (/home/runner/b502-verify = HEAD archive + sketch): claims-503-sketch-output.txt
S="${1:-/home/runner/czaba-project/store}"; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-502
cd "$S" || exit 2
CT=app/routes/cart.tsx; RC='app/routes/recordings.$productId.tsx'; SH=app/components/home/StudioShowcase.tsx
T3=app/lib/__tests__/store-button-cleanup-2b3.test.tsx; DS=docs/design/DESIGN_SYSTEM.md
D323=docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md; D324=docs/implementation/2026/quarter-IV/324-dpg-button-cleanup-stage-2b-3.md
UPOLD='className="px-3 py-1.5 bg-brand text-black text-sm font-medium rounded hover:bg-brand/90 transition-colors flex items-center gap-1.5"'
UPNEW="className={buildButtonClassName({ size: 'sm', className: 'min-h-11 shrink-0' })}"
SCOLD='className="mb-6 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-background hover:bg-brand-hover"'
SCNEW="className={buildButtonClassName({ shape: 'pill', className: 'mb-6 min-h-11' })}"
BROLD='className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-background transition-[background-color,transform] duration-200 hover:bg-brand-hover hover:[transform:scale(1.05)] active:[transform:scale(0.98)]"'
BRNEW="<Link to=\"/store\" className={buildButtonClassName({ size: 'lg', shape: 'pill' })}>"
echo "K1 store HEAD $(git -C /home/runner/czaba-project/store rev-parse --short HEAD 2>/dev/null)"
echo "K2 store worktree vs HEAD (modified/untracked): $(git -C /home/runner/czaba-project/store status --short --untracked-files=all | grep -c '^ M') $(git -C /home/runner/czaba-project/store status --short --untracked-files=all | grep -c '^??')"
echo "K3 cart Upgrade old class / new builder line: $(grep -cF "$UPOLD" $CT) $(grep -cF "$UPNEW" $CT)"
echo "K4 recordings Create a scene old class / new builder line: $(grep -cF "$SCOLD" "$RC") $(grep -cF "$SCNEW" "$RC")"
echo "K5 showcase Browse old class / new builder line: $(grep -cF "$BROLD" $SH) $(grep -cF "$BRNEW" $SH)"
echo "K6 cart owns_same Upgrade branch / Universal+Standard owns_same returns: $(grep -c "{ownershipStatus.type === 'owns_same' && (" $CT) $(grep -cE "return \{ type: 'owns_same', version: '(Universal|Standard)' \};" $CT)"
echo "K7 recordings scene condition line: $(grep -cF "{catalog.licenseType.toLowerCase() === 'universal' && catalog.recordings.length > 0 && (" "$RC")"
echo "K8 HeroSection lg pill builder precedent: $(grep -cF "buildButtonClassName({ size: 'lg', shape: 'pill', className: 'group' })" app/components/home/HeroSection.tsx)"
echo "K9 app.css :active scale targets button and role=button only / DESIGN_SYSTEM link no-press-scale sentence: $(grep -cF 'button:active:not(:disabled):not([aria-disabled="true"]),' app/styles/app.css) $(grep -cF '[role="button"]:active:not(:disabled):not([aria-disabled="true"]) {' app/styles/app.css) $(grep -c 'SIG-R496-LINK-NO-PRESS-SCALE' $DS)"
echo "K10 _index renders StudioShowcase: $(grep -c '<StudioShowcase' app/routes/_index.tsx)"
echo "K11 scanner (any/solid): $(python3 -I $L/b-round-497/scan-brand.py . /tmp/claims-503-scan.json)"
echo "K12 home view-all link with the same name: $(grep -cF 'viewAllText="Browse the Collection"' app/routes/_index.tsx)"
echo "K13 SWEEP labels/tokens/module paths in test roots (app/**/__tests__, perf/**, e2e/**):"
grep -rlE "Upgrade|Create a scene|Browse the Collection|StudioShowcase|routes/cart|recordings\.\\\$productId|recordings\.\\\$|text-black|scale\(1\.05\)|buildButtonClassName" app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|^perf/|^e2e/|\.spec\.' | sort | sed 's/^/  /'
echo "K14 e2e homepage Browse locator keyed on a[href=/store] + text: $(grep -cF "page.locator('a[href=\"/store\"]').filter({ hasText: 'Browse the Collection' })" e2e/homepage.spec.ts)"
echo "K15 doc 324 l.4 / '## ' headings: $(sed -n 4p $D324 2>/dev/null) | $(grep -c '^## ' $D324 2>/dev/null || echo 0)"
echo "K16 doc 323 l.4: $(sed -n 4p $D323)"
echo "K17 docs 320-322 exist: $(ls docs/implementation/2026/quarter-IV/ | grep -cE '^32[0-2]-')"
echo "K18 DESIGN_SYSTEM default-row Upgrade / pill-row scene+showcase / two-shapes sentence (old, new): $(grep -c 'შეტყობინების შიგნით მოქმედება (cart-ის „Upgrade“, `sm`, `min-h-11`)' $DS) $(grep -c 'recordings-ის „Create a scene“ (`md`, `min-h-11`), მთავარი გვერდის Studio showcase-ის „Browse the Collection“) |' $DS) $(grep -c 'dialog-ებსა და Store-ის ფორმის submit-ზე 8px.' $DS) $(grep -c 'შეტყობინების შიგნით მოქმედებაზე (cart-ის „Upgrade“) 8px.' $DS)"
echo "K19 pending grep in docs/implementation / In Progress (stage grep:"; echo "  pending $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"; grep -rn 'In Progress (stage' docs/implementation | cut -c1-140 | sed 's/^/  /'
echo "K20 L31: BC1b declared timeout / BC1b at gate 502 / alone on the sketch (x3) / store-button-cleanup in covering set / slowest covering test: $(grep -c 'const BC1B_TIMEOUT_MS = 20_000;' app/lib/__tests__/store-button-cleanup.test.tsx) $(grep -c '    BC1B_TIMEOUT_MS,' app/lib/__tests__/store-button-cleanup.test.tsx) / $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-502/verify.log | grep -E '✓ BC1b:' | grep -oE '[0-9]+ms$') / $(grep -oE '[0-9]+ms$' $B/bc1b-alone.log | paste -sd' ') / $(grep -c store-button-cleanup.test.tsx $B/covering-files.txt) / $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -oE '✓ .* [0-9]+ms$' | grep -oE '[0-9]+ms$' | sort -n -r | head -1)"
echo "K21 gate 502 status/commit / c-round-502 status: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-502.json'));print(g['status'], g.get('commit','')[:7])") $(python3 -I -c "import json;c=json.load(open('$L/c-round-502.json'));print(c['taskStatus'], c['browserVerified'])")"
echo "K22 c-round-502 L57: $(tail -1 $L/c-round-502/l57-check.txt)"
echo "K23 frozen list sizes (r503 tree, protected) / tracked files: $(wc -l < $B/r503-tree-sha256.txt) $(wc -l < $L/b-round-318/protected-sha256.txt) $(git -C /home/runner/czaba-project/store ls-files | wc -l)"
echo "K24 granted paths in the protected list: $(grep -c -F -f $B/granted-tracked.txt $L/b-round-318/protected-sha256.txt)"
echo "K25 new test row ids B2B3-0..7 (distinct): $(grep -oE "'B2B3-[0-7]:" $T3 2>/dev/null | sort -u | wc -l)"
echo "K26 lint/biome HEAD-equal (B sketch logs): $(grep -E '^Found [0-9]+ warnings' $B/precheck-lint.log) / $(grep -E '^Found [0-9]+ warnings' $B/precheck-biome.log)"
echo "K27 full suite / build on sketch: $(grep -E 'Test Files|Tests |^rc' $B/precheck-full.log | tr -s ' ' | paste -sd' ') / $(tail -1 $B/precheck-build-sketch.log)"
echo "K28 mutants: $(grep -c ' OK$' $B/mutants-503.txt) OK, $(grep -c 'MISMATCH\|APPLY-FAIL' $B/mutants-503.txt) bad, $(tail -1 $B/mutants-503.txt)"
echo "K29 probe HEAD vs sketch, every target x viewport (box, radius, padding, transition, hover/press transform, press opacity, contrast, keyboard focus, neighbour heights):"
python3 -I - "$B" <<'PY'
import json, sys
b = sys.argv[1]
for lab in ('head', 'sketch'):
    for r in json.load(open(f'{b}/probe/{lab}/{lab}.json')):
        a = r['rest']; c = r['context']
        ctx = {k: v['h'] for k, v in c.items() if isinstance(v, dict) and v and 'h' in v}
        print(f"  {lab} {r['id']} {r['vp']}: {a['w']}x{a['h']} radius {a['radius']} pad {a['padding']} | transition {a['transition']} | hoverT {r['hover']['transform']} pressT {r['press']['transform']} op {r['press']['opacity']} | c {r['restContrast']}/{r['hoverContrast']} | focus {r['focus']['focusVisible']} {r['focus']['outline'].split(' ')[0]} {r['focus']['offset']} | ctx {ctx}")
PY
echo "K30 journeys equal HEAD vs sketch: $(python3 -I -c "import json;a=[{k:v for k,v in r.items() if k!='errors'} for r in json.load(open('$B/probe/head/head-journey.json'))];b=[{k:v for k,v in r.items() if k!='errors'} for r in json.load(open('$B/probe/sketch/sketch-journey.json'))];print(a==b, all(r['ok'] for r in b))")"
echo "K31 cart neighbour actions + c7 equal HEAD vs sketch: $(python3 -I -c "import json;print(json.load(open('$B/probe/nb-head/head-actions.json'))==json.load(open('$B/probe/nb-sketch/sketch-actions.json')), json.load(open('$B/probe/nb-head/head-c7.json'))==json.load(open('$B/probe/nb-sketch/sketch-c7.json')))")"
echo "K32 artifacts:"; for f in checkpoint.md doc-ledger.md sketch-503.patch.txt sketch-sha.txt sketch-sha-history.txt sketch-review.md sketch-503-v1.patch.txt sketch-503-v2.patch.txt sketch-delta-v1-v2.diff.txt mutants-503.py mutants-503.txt mutant-logs/summary.txt mutant-logs/mutant-M1.log mutant-logs/mutant-M16.log covering-files.txt precheck-tsc.log precheck-lint.log precheck-biome.log precheck-covering.log precheck-full.log precheck-build-sketch.log bc1b-alone.log scan-head.json scan-sketch.json scan-sketch.txt r503-tree-sha256.txt r503-pre-sha.txt r503-post-sketch-sha.txt granted-tracked.txt probe/measure-503.mjs probe/journey-503.mjs probe/head.out probe/sketch.out probe/head/head.json probe/sketch/sketch.json probe/head-journey.out probe/sketch-journey.out probe/head/head-journey.json probe/sketch/sketch-journey.json probe/nb-head/head-actions.json probe/nb-sketch/sketch-actions.json ../b-round-501/consult-product-designer.md ../b-round-497/stage2-inventory.md ../b-round-497/scan-brand.py ../user-review/questions-round-502.md ../a-round-502.md ../c-round-502.json; do test -f $B/$f && echo "  ok $f" || echo "  MISSING $f"; done
echo "K33 ids:"; (cd $L && python3 -I tools/find-ids.py . DPG-BUTTON-CLEANUP-2 B-R502-DOC323-L28-STATUS SABA-Q-502-UPGRADE-VARIANT PD-R502-SHOWCASE-ARROW-NUDGE SIG-R498-BUTTONLINK-WRAPPER SIG-R501-SHARED-BUTTON-SCANNER B-R502-CART-MOBILE-ITEMS-HIDDEN | cut -d' ' -f1-2 | sed 's/^/  /')
echo "K34 l58: $(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K35 builder calls per file (cart, recordings, showcase): $(grep -c 'buildButtonClassName(' $CT) $(grep -c 'buildButtonClassName(' "$RC") $(grep -c 'buildButtonClassName(' $SH)"
