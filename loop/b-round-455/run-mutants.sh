#!/usr/bin/env bash
# usage: run-mutants.sh <scratch-root> <out-file>; scratch must hold the round-456 sketch applied (b-round-455/sketch-456.patch.txt)
set -u
R="$1"; OUT="$(realpath -m "$2")"; : > "$OUT"
T="app/lib/__tests__/store-live-teal.test.ts app/lib/__tests__/store-glow-shadow.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts"
FILES="app/routes/_index.tsx app/components/product/ProductSidebar.tsx app/components/product/ProductCard.tsx app/components/audio/AudioPreviewButton.tsx app/styles/app.css app/lib/__tests__/helpers/style-scan.ts app/lib/__tests__/store-live-teal.test.ts"
cd "$R"; mkdir -p /tmp/m456bak; for f in $FILES; do cp "$f" "/tmp/m456bak/$(echo $f | tr / _)"; done
restore() { for f in $FILES; do cp "/tmp/m456bak/$(echo $f | tr / _)" "$f"; done; }
run() { local id="$1"; local file="$2"; shift 2
  python3 -c "import sys;p='$file';s=open(p).read();o,n=sys.argv[1],sys.argv[2];assert o in s,('MISSING',o);open(p,'w').write(s.replace(o,n,1))" "$@" || { echo "$id APPLY-FAIL" >> "$OUT"; restore; return; }
  local log; log="$(dirname "$OUT")/mutant-$id.log"; npx vitest run $T > "$log" 2>&1
  local res; res=$(sed -E 's/\x1b\[[0-9;]*m//g' "$log" | grep -E "^\s+×" | grep -oE "(LT|GS|GT|TS)[0-9]+b?" | sort -u | tr '\n' ' ')
  [ -z "$res" ] && echo "$id GREEN(survived)" >> "$OUT" || echo "$id RED $res" >> "$OUT"
  restore; }
IDX=app/routes/_index.tsx
run BASE $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';"
run C1-CONTROL-LIVE-BARREL-NAME $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';
import { ProductCardSkeleton } from '~/components/loading';
export const c1 = ProductCardSkeleton;"
run M1-DEAD-CLASS-IN-ROUTE $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';
export const m1 = 'value-card';"
run M2-MOUNT-TRACKROW-DIRECT $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';
import { TrackRow } from '~/components/product/TrackRow';
export const m2 = TrackRow;"
run M3-MOUNT-PIANO-VIA-BARREL $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';
import { PianoLoadingAnimation } from '~/components/loading';
export const m3 = PianoLoadingAnimation;"
run M4-INLINE-VARIANT-CALLER app/components/product/ProductSidebar.tsx '<AudioPreviewButton track={track} variant="overlay" />' '<AudioPreviewButton track={track} variant="inline" />'
run M5-INLINE-DEFAULT app/components/audio/AudioPreviewButton.tsx "variant = 'overlay'" "variant = 'inline'"
run M6-SPREAD-PROPS app/components/product/ProductCard.tsx '<AudioPreviewButton track={track} variant="overlay" />' '<AudioPreviewButton {...{ track }} variant="overlay" />'
run M7-DEAD-KEY-UNMAPPED app/lib/__tests__/store-live-teal.test.ts "  'styles/app.css .glass-card:hover': ['glass-card'],
" ""
run M8-LIVE-RULE-USES-DEAD-KEYFRAME app/styles/app.css ".audio-player-artwork:hover {" ".audio-player-artwork:focus-visible {
  animation: playButtonPulse 2s ease-in-out infinite;
}

.audio-player-artwork:hover {"
run M9-MEDIA-COPY-GLOW app/styles/app.css ".audio-player-artwork:hover {" "@media (min-width: 1px) {
  .audio-player-artwork {
    box-shadow: 0 0 12px rgba(201, 164, 106, 0.4);
  }
}

.audio-player-artwork:hover {"
run M10-GLOW-ACCENT-UTILITY $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';
export const m10 = 'hover:shadow-glow-accent';"
run M11-BUTTON-PRIMARY-GRADIENT app/styles/app.css ".button-primary {
  background: var(--color-brand);" ".button-primary {
  background: linear-gradient(var(--color-brand), var(--color-brand-hover));"
run M12-WHOLE-BARREL-WALK app/lib/__tests__/helpers/style-scan.ts "if (barrelNames !== null && !entry.namespace) {" "if (barrelNames !== null && entry.namespace && !entry.namespace) {"
run M13-THEME-TOKEN-UTILITY $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';
export const m13 = 'hover:bg-glow-primary';"
run M14-NO-GROUPING-KEY app/lib/__tests__/helpers/style-scan.ts "const GROUPING_AT_RULE = /^@(?:media|supports|layer|container|scope)\b/i;" "const GROUPING_AT_RULE = /^@never-matches\b/i;"
run M15-NO-QUOTE-BLANKING app/lib/__tests__/helpers/style-scan.ts "  const source = blankCommentsAndQuotedDelimiters(css);
  const blocks: CssRuleBlock[] = [];" "  const source = css;
  const blocks: CssRuleBlock[] = [];"
run M16-BARREL-MATCH-IMPORTED-NAME app/lib/__tests__/helpers/style-scan.ts "barrelNames.includes(binding.exported)" "barrelNames.includes(binding.imported)"
run M17-NO-DEFAULT-BINDING app/lib/__tests__/helpers/style-scan.ts "if (match[1] !== undefined && /^[\w\$]+\$/.test(defaultClause)) {" "if (match[1] !== undefined && defaultClause === '\u0000') {"
run M18-INLINE-CLASS-IN-OVERLAY-BRANCH app/components/audio/AudioPreviewButton.tsx 'className="audio-preview-overlay-button cursor-pointer"' 'className="audio-preview-overlay-button audio-preview-inline-button cursor-pointer"'
run M19-TOKEN-TYPO app/lib/__tests__/store-live-teal.test.ts "  'styles/app.css .glass-card:hover': ['glass-card']," "  'styles/app.css .glass-card:hover': ['glass-crd'],"
run M20-THEME-TOKEN-MISSING app/lib/__tests__/store-live-teal.test.ts "    'video-sync',
" ""
