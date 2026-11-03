#!/usr/bin/env bash
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$L/b-round-316
F=$S/app/assets/fonts
T=$S/app/lib/__tests__/self-hosted-fonts.test.ts
D=$S/docs/implementation/2026/quarter-IV/229-perf-self-hosted-fonts.md
echo "K1 gate316 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-316.json'));print(g['status'],g.get('reason',''))")"
if git -C "$S" rev-parse HEAD >/dev/null 2>&1; then echo "K2 $(git -C "$S" status --short --untracked-files=all | wc -l) $(git -C "$S" rev-parse --short HEAD)"; else echo "K2 (no git)"; fi
echo "K3 playfair-sha $(cd "$F" && sha256sum playfair-display-*.woff2 | awk '{print substr($1,1,12)}' | tr '\n' ' ')"
echo "K4 playfair-pins $(grep -A1 "'playfair-display-" "$T" | grep -o "'[0-9a-f]\{64\}'" | cut -c2-13 | tr '\n' ' ')"
echo "K5 store-vs-corrected-list $(cd "$F" && sha256sum -c "$B/fonts-src/fonts-sha256.txt" 2>/dev/null | grep -c ': OK$') of 25"
echo "K6 kit-urls old-manifest $(grep -c '/l/font?kit=' "$L/b-round-315/fonts-src/manifest.json") new-manifest $(grep -c '/l/font?kit=' "$B/fonts-src/manifest.json")"
echo "K7 doc229-l4 $(sed -n 4p "$D")"
echo "K8 protected-ok $(cd "$S" && sha256sum -c "$L/b-round-312/protected-sha256.txt" 2>/dev/null | grep -c ': OK$')"
echo "K9 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K10 test-file-vs-316-sketch $(cmp -s "$T" "$L/b-round-315/sketch-self-hosted-fonts.test.ts.txt" && echo equal || echo differs) vs-317-sketch $(cmp -s "$T" "$B/sketch-self-hosted-fonts.test.ts.txt" && echo equal || echo differs)"
echo "K11 fonts.css-sha-ok $(cd "$F" && sha256sum -c "$B/fonts-src/fonts-css-sha256.txt" 2>/dev/null | grep -c ': OK$')"
echo "K12 byte-identity-after-fix $(tail -1 "$B/byte-identity-after-fix.txt")"
echo "K13 notices-fonts-heading $(grep -c '^## Fonts (SIL Open Font License 1.1)$' "$S/THIRD_PARTY_NOTICES.md")"
echo "K14 doc229-kit-mentions $(grep -c 'l/font?kit=' "$D")"
echo "K15 tree-316 $(cd "$S" && sha256sum -c "$B/tree-316-sha256.txt" 2>/dev/null | grep -c ': OK$') OK $(cd "$S" && sha256sum -c "$B/tree-316-sha256.txt" 2>/dev/null | grep -c ': FAILED$') FAILED"
