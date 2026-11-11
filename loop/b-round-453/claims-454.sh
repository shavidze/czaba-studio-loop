#!/usr/bin/env bash
# usage: [STORE_ROOT=<repo>] bash claims-454.sh   (prints K1..K14; run from anywhere)
set -u
S=${STORE_ROOT:-/home/runner/czaba-project/store}
L=/home/runner/czaba-project/tmp/studio-real-loop
B=$L/b-round-453
cd "$S" || exit 1
echo "K1 gate453: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-453.json'));print(g['status'],g['commit'][:7])")"
echo "K2 head: $(git rev-parse --short HEAD)"
echo "K3 obsidian block sha: $(awk '/^\[data-studio-theme="obsidian"\],$/ {f=1} f {print} f && /^}/ {exit}' app/styles/app.css | sha256sum | cut -c1-16)"
echo "K4 teal lines per CSS file (helper countTealHits via vite-node, scanning STORE_ROOT/app):"
echo " $(cd /home/runner/czaba-project/store && STORE_ROOT=$S npx vite-node $B/k4-css-teal.ts 2>/dev/null | tail -1)"
echo "K5 live selectors with teal (rule text, app.css + utilities.css):"
for sel in '.audio-player-artwork' '.audio-player-artwork:hover' '.audio-player-button-play' '.audio-player-button-play:hover' '.audio-player-progress::-webkit-slider-thumb:hover' '.audio-player-progress::-moz-range-thumb:hover' '.light-flicker-effect::before' '.light-flicker-effect::after' '.not-found-grid' '.code-4' '.code-0' '.command-palette-item.selected'; do
  n=$(awk -v s="$sel {" '$0==s {c++} END {print c+0}' app/styles/app.css); t=$(awk -v s="$sel {" '$0==s {f=1} f {print} f && /^}/ {f=0}' app/styles/app.css | grep -c -E '19, 217, 204|hsl\(175'); echo " $sel blocks=$n tealLines=$t"; done
for sel in '.styled-scrollbar' '.styled-scrollbar::-webkit-scrollbar-thumb' '.styled-scrollbar::-webkit-scrollbar-thumb:hover'; do t=$(awk -v s="$sel {" '$0==s {f=1} f {print} f && /^}/ {f=0}' app/styles/base/utilities.css | grep -c -E 'hsl\(175'); echo " $sel tealLines=$t"; done
echo "K6 consumers (non-test TSX):"
for c in audio-player-artwork audio-player-button-play audio-player-progress light-flicker-effect light-flicker-stagger not-found-grid code-4 code-0 command-palette-item styled-scrollbar stems-loader-list slider-thumb-teal; do echo " $c: $(grep -rlE "(^|[^-a-zA-Z0-9_])$c([^-a-zA-Z0-9_]|$)" app --include=*.tsx | grep -v __tests__ | sort | tr '\n' ' ')"; done
echo "K7 AudioPreviewButton variants passed: $(grep -rhoE 'AudioPreviewButton[^>]*variant="[a-z]+"' app --include=*.tsx | grep -v __tests__ | grep -oE 'variant="[a-z]+"' | sort | uniq -c | tr '\n' ' ')  inline-class users: $(grep -rl 'audio-preview-inline-button' app --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo "K8 legacy-only importers: StemsLoadingAnimation $(grep -rl 'StemsLoadingAnimation' app --include=*.tsx | grep -v __tests__ | grep -v '^app/components/studio/' | tr '\n' ' ')| VideoPlayer(slider-thumb-teal) $(grep -rl 'slider-thumb-teal' app --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo "K9 tokens used by the new rules: $(grep -n -E '^  --color-(outline-strong|muted|brand-rgb|accent|elevated):' app/styles/app.css | head -5 | tr '\n' ' ')"
echo "K10 doc 297: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^297-') files"
echo "K11 forbidden app/styles/**: $(python3 -I -c "import json;print('app/styles/**' in json.load(open('$L/backlog.json'))['global_forbidden_files'])")"
echo "K12 status (outside/inside grants):"; G=$B/grants-454.txt
git status --porcelain --untracked-files=all | awk '{print $2}' > /tmp/k12.$$; echo " outside $(grep -v -x -F -f "$G" /tmp/k12.$$ | wc -l) inside $(grep -x -F -f "$G" /tmp/k12.$$ | wc -l)"; grep -v -x -F -f "$G" /tmp/k12.$$ | head -5; rm -f /tmp/k12.$$
echo "K13 covering tests: $(cat $B/covering-454.txt | tr '\n' ' ')"
echo "K14 test pins of changed selectors outside the new test: $(grep -rlE 'audio-player-(artwork|button-play|progress)|light-flicker|not-found-grid|code-4|code-0|command-palette-item|styled-scrollbar' app perf e2e 2>/dev/null | grep -E '__tests__|^perf/|^e2e/' | grep -v store-live-teal | sort | tr '\n' ' ')"
