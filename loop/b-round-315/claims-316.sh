#!/usr/bin/env bash
# Round 316 claims (L29 + L56). Run from the loop root: bash b-round-315/claims-316.sh
# CLAIMS_STORE overrides the store path (B's sketch: /tmp/b316s).
L=$(pwd)
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
F=$L/b-round-315/fonts-src
echo "K1 $(python3 -c "import json;g=json.load(open('gates/gate-round-315.json'));print(g['status'],g['commit'][:7])")"
if [ -d "$S/.git" ]; then echo "K2 $(git -C "$S" status --short --untracked-files=all | wc -l) $(git -C "$S" rev-parse --short HEAD)"; else echo "K2 (no git)"; fi
echo "K3 $(grep -rln --include=*.ts --include=*.tsx --include=*.css -E 'fonts\.(googleapis|gstatic)\.com' "$S/app" | grep -v __tests__ | sed "s#$S/##" | sort | tr '\n' ' ')| lines $(grep -rn --include=*.ts --include=*.tsx --include=*.css -E 'fonts\.(googleapis|gstatic)\.com' "$S/app" | grep -v __tests__ | wc -l)"
echo "K4 root.tsx: preconnect $(grep -c "rel: 'preconnect'" "$S/app/root.tsx") fontStyles-import $(grep -c "import fontStyles from './assets/fonts/fonts.css?url';" "$S/app/root.tsx") fontStyles-link $(grep -c "{ rel: 'stylesheet', href: fontStyles }," "$S/app/root.tsx") appStyles-link-line $(grep -n "{ rel: 'stylesheet', href: appStyles }," "$S/app/root.tsx" | cut -d: -f1)"
echo "K5 app.css l.1: $(head -1 "$S/app/styles/app.css" | cut -c1-60)"
echo "K6 studio-lab.tsx: STUDIO_FONTS_HREF $(grep -c STUDIO_FONTS_HREF "$S/app/routes/studio-lab.tsx") preload $(grep -c "rel: 'preload'" "$S/app/routes/studio-lab.tsx") woff2-url-imports $(grep -c "woff2?url';" "$S/app/routes/studio-lab.tsx")"
echo "K7 TH7 title line: $(grep -n "it('TH7" "$S/app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx" | cut -c1-90)"
echo "K8 app/assets/fonts: $( [ -d "$S/app/assets/fonts" ] && ls "$S/app/assets/fonts" | grep -c woff2 || echo absent) css $( [ -f "$S/app/assets/fonts/fonts.css" ] && echo present || echo absent)"
echo "K9 last quarter-IV doc: $(ls "$S/docs/implementation/2026/quarter-IV/" | sort | tail -1)"
echo "K10 notices headings: $(grep '^## ' "$S/THIRD_PARTY_NOTICES.md" | tr '\n' '|')"
echo "K11 biome files.includes: $(python3 -c "import json;print(json.load(open('$S/biome.json'))['files']['includes'])")"
echo "K12 remix-serve immutable: $(grep -c 'immutable: true' /home/runner/czaba-project/store/node_modules/@remix-run/serve/dist/cli.js)"
echo "K13 protected: $(cd "$S" 2>/dev/null && sha256sum -c "$L/b-round-312/protected-sha256.txt" 2>/dev/null | grep -c ': OK$')"
echo "K14 staged: faces $(grep -c '@font-face' "$F/fonts.css") families $(grep -o "font-family: '[^']*'" "$F/fonts.css" | sort -u | wc -l) urls $(grep -o "url('./[^']*')" "$F/fonts.css" | sort -u | wc -l) woff2 $(ls "$F/files" | grep -c woff2) sha-ok $(cd "$F/files" && sha256sum -c ../fonts-sha256.txt 2>/dev/null | grep -c ': OK$') licences $(cd "$F/licenses" && sha256sum -c ../licenses-sha256.txt 2>/dev/null | grep -c ': OK$') fonts.css $(cd "$F" && sha256sum -c fonts-css-sha256.txt 2>/dev/null | grep -c ': OK$') display-swap $(grep -c 'font-display: swap;' "$F/fonts.css") comments $(grep -c '/\*' "$F/fonts.css")"
echo "K15 artifacts: $(for p in b-round-315/sketch.patch.txt b-round-315/unit-mutants-316.py b-round-315/precheck-unit-mutants-316.txt b-round-315/fonts-src/fonts-sha256.txt b-round-315/fonts-src/licenses-sha256.txt b-round-315/fonts-src/manifest.json b-round-315/probe/fonts-probe.cjs b-round-315/probe/fonts-5316.json b-round-315/probe/fonts-5317.json b-round-315/probe/shots.cjs b-round-315/probe/pxdiff.cjs b-round-315/probe/pxdiff.txt b-round-315/probe/pxdiff-head-vs-head.txt; do test -f "$L/$p" && echo -n 1 || echo -n "0($p)"; done)"
echo "K16 tests naming Google font hosts: $(grep -rln -E 'fonts\.(googleapis|gstatic)\.com' "$S/app" --include=*.test.ts --include=*.test.tsx | sed "s#$S/##" | tr '\n' ' ')"
echo "K17 PageTransition: root uses $(grep -c '<PageTransition key={location.pathname}>' "$S/app/root.tsx"); initial opacity 0 lines $(grep -c 'opacity: 0' "$S/app/components/animations/PageTransition.tsx")"
echo "K18 regression-last: $(python3 -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K19 OFL first lines: $(for f in "$F"/licenses/OFL-*.txt; do grep -c 'SIL OPEN FONT LICENSE Version 1.1' "$f" | tr -d '\n'; done)"
echo "K20 $(python3 -I c-round-314/rowcmp.py c-round-315/perf-harness.json b-round-315/precheck-perf.json 2>&1 | sed 's#^b-round-315/precheck-perf.json ##')"
