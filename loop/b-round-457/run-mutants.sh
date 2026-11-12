#!/usr/bin/env bash
# usage: run-mutants.sh <scratch-root> <out-file>; scratch must hold the round-458 sketch (db95f40 + b-round-455/sketch-456.patch.txt + b-round-456/sketch-457-delta.patch.txt + b-round-457/sketch-458-delta.patch.txt), committed
set -u
R="$1"; OUT="$(realpath -m "$2")"; : > "$OUT"
T="app/lib/__tests__/store-live-teal.test.ts app/lib/__tests__/store-glow-shadow.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts"
FILES="app/routes/_index.tsx app/components/product/ProductSidebar.tsx app/components/product/ProductCard.tsx app/components/audio/AudioPreviewButton.tsx app/styles/app.css app/lib/__tests__/helpers/style-scan.ts app/lib/__tests__/store-live-teal.test.ts"
cd "$R"; mkdir -p /tmp/m458bak; for f in $FILES; do cp "$f" "/tmp/m458bak/$(echo $f | tr / _)"; done
restore() { for f in $FILES; do cp "/tmp/m458bak/$(echo $f | tr / _)" "$f"; done; }
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
SS=app/lib/__tests__/helpers/style-scan.ts
run M21-NO-COMMENT-STRIP $SS "    ...resolvedImports(stripped, importer),
    ...resolvedImports(stringAware, importer, true),
" ""
run M22-STRIPPED-ONLY $SS "    ...resolvedImports(source, importer),
    ...resolvedImports(stripped, importer),
    ...resolvedImports(stringAware, importer, true),
" "    ...resolvedImports(stripped, importer),
"
run M23-NO-IMPORT-META-URL $SS "    ...wholeModuleImports(source, importer, IMPORT_META_URL_MODULE),
" ""
run M24-NO-SIDE-EFFECT-IMPORT $SS "    ...wholeModuleImports(source, importer, SIDE_EFFECT_IMPORT),
" ""
run M25-SPECIFIER-SWEEP-BLIND $SS 'const LOCAL_SPECIFIER_LITERAL = /['"'"'"`]((?:~\/|\.\.?\/)[^'"'"'"`\n]+)['"'"'"`]/g;' 'const LOCAL_SPECIFIER_LITERAL = /\u0000never/g;'
run M26-DEAD-CONSUMER-COMMENTED-IMPORT $IDX "import { SpotlightLoader } from '~/components/common';" "import { SpotlightLoader } from '~/components/common';
import {
  // page loader
  PianoLoadingAnimation,
} from '~/components/loading';
export const m26 = PianoLoadingAnimation;"
run M27-NAMESPACE-ALIAS-AS-NAME $SS "        if (forwarded.includes('*')) {" "        if (forwarded.includes('never')) {"
run M28-NO-FILE-RESOLUTION-CHECK $SS "        (scriptFilesFor(resolved, sources).length === 0 && !NON_SCRIPT_MODULE.test(resolved.target))" "        (resolved.target.length < 0 && scriptFilesFor(resolved, sources).length === 0)"
run M29-QUERY-NOT-STRIPPED $SS "specifier.replace(/[?#].*\$/, '')" "specifier.replace(/[#].*\$/, '')"
run M30-NAMESPACE-TARGET-FILTER $SS "    ...resolvedImports(source, importer),
    ...resolvedImports(stripped, importer),
    ...resolvedImports(stringAware, importer, true),
" "    ...[
      ...resolvedImports(source, importer),
      ...resolvedImports(stripped, importer),
      ...resolvedImports(stringAware, importer, true),
    ].filter(
      (entry) =>
        !(
          entry.namespace &&
          namespaceReExports(stripped, importer).some((alias) => alias.target === entry.target)
        ),
    ),
"
run M31-HASH-NOT-STRIPPED $SS "specifier.replace(/[?#].*\$/, '')" "specifier.replace(/[?].*\$/, '')"
run M32-TRAILING-SLASH-KEPT $SS ".replace(/(.)\/+\$/, '\$1')" ""
run M33-TRAILING-SLASH-FILE-ONLY $SS "        ? [moduleFile, indexFile]" "        ? [moduleFile ?? indexFile]"
run M34-INDEX-FORM-AS-MODULE $SS "      ? [indexFile]" "      ? [moduleFile ?? indexFile]"
run M35-NO-STRING-AWARE-ARM $SS "    ...resolvedImports(stringAware, importer, true),
" ""
run M36-NO-CLAUSE-GRAMMAR $SS "(wholeOnUnparsedClause && !IMPORT_CLAUSE_GRAMMAR.test(clause.trim()))" "(wholeOnUnparsedClause && clause.length < 0)"
run M37-LOOKAHEAD-UNDERSCORE app/lib/__tests__/store-live-teal.test.ts ": new RegExp(\`(?<![\\\\w-])\${word}(?![A-Za-z0-9-])\`);" ": new RegExp(\`(?<![\\\\w-])\${word}(?![\\\\w-])\`);"
run M38-INDEX-FORM-DROPPED $SS "    return { target: module.replace(/\\/index\$/, ''), form: 'index' };" "    return { target: module.replace(/\\/index\$/, ''), form: 'module' };"
run M21a-ONLY-STRIPPED-ARM-REMOVED $SS "    ...resolvedImports(stripped, importer),
" ""
run M22a-ONLY-RAW-ARM-REMOVED $SS "    ...resolvedImports(source, importer),
" ""
