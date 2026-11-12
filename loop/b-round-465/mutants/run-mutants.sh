#!/usr/bin/env bash
# Usage: from a sketch-applied store copy: bash <abs>/run-mutants.sh <out dir>. Restores style-scan.ts after each mutant.
set -u
OUT=$1; F=app/lib/__tests__/helpers/style-scan.ts; cp $F /tmp/b466-ss.orig
mut(){ python3 -I -c "import sys;p,o,n=sys.argv[1:4];s=open(p).read();assert o in s,'anchor';open(p,'w').write(s.replace(o,n))" "$F" "$2" "$3"; }
run(){ id=$1; cp /tmp/b466-ss.orig $F; mut "$@" || { echo "$id ANCHOR-FAIL"; return; }; npx vitest run app/lib/__tests__/store-teal-sweep.test.ts > $OUT/mutant-$id.log 2>&1; r=$(sed 's/\x1b\[[0-9;]*m//g' $OUT/mutant-$id.log | grep -E "^ *Tests " | tr -s ' '); red=$(sed 's/\x1b\[[0-9;]*m//g' $OUT/mutant-$id.log | grep -oE "× TS[0-9]+" | sort -u | tr '\n' ' '); echo "$id ::$r :: $red"; }
run M1-ZERO-PX-ONLY 'const ZERO_LENGTH = /[+-]?(?:0+(?:\.0*)?|\.0+)[a-z]*/.source;' 'const ZERO_LENGTH = /0(?:px)?/.source;'
run M2-NO-SIGN 'const ZERO_LENGTH = /[+-]?' 'const ZERO_LENGTH = /'
run M3-CLOSED-UNITS '[a-z]*/.source;' '(?:px|r?em|ch|ex|vh|vw|vmin|vmax)?/.source;'
run M4-NO-FUNCTION-BLUR '|(?:calc|min|max|clamp)\(' ''
run M5-NO-CONCAT-BLUR "|['\"\`]\\s*\\+)" ')'
run M6-PRECHECK-CASE 'if (!/shadow/i.test(source)) {' "if (!source.includes('shadow')) {"
run M7-PRECHECK-WRONG-WORD 'if (!/shadow/i.test(source)) {' 'if (!/glow/i.test(source)) {'
run M8-TAILWIND-ALT-HEAD '`(?:drop-|text-)?shadow-\\[[^\\]]{0,300}?${LAYER_START}${ZERO_LENGTH}_${ZERO_LENGTH}_${GLOW_BLUR}`' '`(?:drop-|text-)?shadow-\\[[^\\]]{0,300}?${LAYER_START}0(?:px)?_0(?:px)?_${GLOW_BLUR}`'
run M9-DROPSHADOW-ALT-HEAD '`drop-shadow\\([\\s_]*${ZERO_LENGTH}[\\s_]+${ZERO_LENGTH}[\\s_]+${GLOW_BLUR}`' '`drop-shadow\\([\\s_]*0(?:px)?[\\s_]+0(?:px)?[\\s_]+${GLOW_BLUR}`'
run M10-NO-LAYER-START '${LAYER_START}${ZERO_LENGTH}\\s+${ZERO_LENGTH}\\s+${GLOW_BLUR}' '${ZERO_LENGTH}\\s+${ZERO_LENGTH}\\s+${GLOW_BLUR}'
run M11-ZERO-ANY-DIGIT '(?:0+(?:\.0*)?|\.0+)' '(?:\d+(?:\.\d*)?|\.\d+)'
run M12-ARBITRARY-PROPERTY-ALT-HEAD '`\\[(?:box|text)-shadow:[^\\]]{0,300}?${LAYER_START}${ZERO_LENGTH}_${ZERO_LENGTH}_${GLOW_BLUR}`' '`\\[(?:box|text)-shadow:[^\\]]{0,300}?${LAYER_START}0(?:px)?_0(?:px)?_${GLOW_BLUR}`'
run M13-CONCAT-ANY-OFFSET '${LAYER_START}${ZERO_LENGTH}\\s+${ZERO_LENGTH}\\s+${GLOW_BLUR}' '${LAYER_START}${ZERO_LENGTH}\\s+[^\\s]+\\s+${GLOW_BLUR}'
cp /tmp/b466-ss.orig $F
