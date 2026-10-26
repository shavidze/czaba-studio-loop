#!/usr/bin/env bash
set -u
STORE=/home/runner/czaba-project/store
OUT=/home/runner/czaba-project/tmp/studio-real-loop/a-round-183/mutations
F=app/components/common/CookieConsent.tsx
T=app/components/common/__tests__/CookieConsent.test.tsx
cd "$STORE"
cp "$F" "$OUT/base.tsx"
sha256sum "$F" > "$OUT/base.sha256"
: > "$OUT/restore.log"

apply() {
  local id="$1" expr="$2"
  sed -i "$expr" "$F"
  diff -u "$OUT/base.tsx" "$F" > "$OUT/$id.diff"
  if [ ! -s "$OUT/$id.diff" ]; then echo "$id: MUTATION DID NOT APPLY" | tee -a "$OUT/restore.log"; fi
  npx vitest run "$T" --reporter=verbose > "$OUT/$id.log" 2>&1 || true
  npx vitest run "$T" --reporter=json --outputFile="$OUT/$id.json" > /dev/null 2>&1 || true
  cp "$OUT/base.tsx" "$F"
  echo "$id restore: $(sha256sum -c "$OUT/base.sha256" 2>&1)" | tee -a "$OUT/restore.log"
}

apply m308 's/if (!isVisible || isStudioRoute) return null;/if (!isVisible) return null;/'
apply m309 "s/pathname.startsWith('\/studio')/pathname === '\/studio-lab'/"
apply m310 's/if (!isVisible || isStudioRoute) return null;/if (!isVisible || !isStudioRoute) return null;/'
apply m311 's/fixed bottom-0 left-0 right-0 z-50/fixed top-0 left-0 right-0 z-50/'
