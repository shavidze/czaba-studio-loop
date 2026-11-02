#!/usr/bin/env bash
# Claims for tasks/round-302 (current-task.md). Run from anywhere; reads store/ at HEAD.
S=${S:-/home/runner/czaba-project/store}
L=/home/runner/czaba-project/tmp/studio-real-loop
cd "$S" || exit 1
echo "K1 HEAD: $(git rev-parse HEAD)"
echo "K2 status lines: $(git status --short --untracked-files=all | wc -l)"
git diff --quiet HEAD -- 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; echo "K3 protected diff rc: $?"
echo "K4 frozen tree: $(wc -l < $L/b-round-301-r302-tree-sha256.txt) entries; failures: $(sha256sum -c --quiet $L/b-round-301-r302-tree-sha256.txt 2>/dev/null | wc -l)"
echo "K5 retired-name hits outside tests (app/** perf/** e2e/**):"
grep -rnIE "Personal Mixdown|Studio Lab|Lab · Workspace|Demo workspace|headingSuffix" app perf e2e | grep -v '/__tests__/' | sort
echo "K6 retired-name hits in tests (app/**/__tests__ perf/** e2e/**):"
grep -rnIE "Personal Mixdown|Studio Lab|Lab · Workspace|Demo workspace|headingSuffix|Studio · Workspace" app perf e2e | grep '/__tests__/' | sort
echo "K7 czaba-studio-lab (export fileStem) hits app/** perf/** e2e/**: $(grep -rnI 'czaba-studio-lab' app perf e2e | wc -l) in $(grep -rlI 'czaba-studio-lab' app perf e2e | wc -l) files"
echo "K8 h1 render (StudioWorkspace.tsx):"
grep -n -A3 '<h1 className="text-sm font-medium">' app/components/arrangement/StudioWorkspace.tsx
echo "K9 other studioWorkspaceStrings uses in StudioWorkspace.tsx: $(grep -c 'studioWorkspaceStrings\.' app/components/arrangement/StudioWorkspace.tsx)"
echo "K10 checkout.success.tsx has no loader/action export: $(grep -cE '^export (async )?(function|const) (loader|action)' app/routes/checkout.success.tsx); parent checkout layout routes (checkout.tsx / checkout._index.tsx / checkout/): $(ls -d app/routes/checkout.tsx app/routes/checkout app/routes/checkout._index.tsx 2>/dev/null | wc -l)"
echo "K11 pre-existing Biome warnings in checkout.success.tsx at HEAD: $(npx biome lint app/routes/checkout.success.tsx 2>&1 | grep -c 'noArrayIndexKey ━')"
echo "K12 nav label (Header.tsx):"
grep -n -B1 '^ *Studio$' app/components/layout/Header.tsx
echo "K13 testimonial (keep-list) line:"
grep -n 'Mixdown Studio' app/components/home/TestimonialsSection.tsx
echo "K14 'Personal Studio Included' in app/**: $(grep -rnI 'Personal Studio Included' app | wc -l); in e2e/**: $(grep -rnI 'Personal Studio Included' e2e | wc -l)"
echo "K15 narrow share title: $(grep -n "STUDIO_NARROW_SHARE_TITLE = " app/components/arrangement/StudioNarrowScreen.tsx)"
echo "K16 docs with an old name (docs/technical, CLAUDE.md, README.md, USER_GUIDE.md): $(grep -rlE 'Studio Lab|Personal Mixdown' docs/technical CLAUDE.md README.md USER_GUIDE.md 2>/dev/null | wc -l)"
echo "K17 next free implementation doc number: $(ls docs/implementation/2026/quarter-IV | sed -n 's/^\([0-9]\{3\}\)-.*/\1/p' | sort -n | tail -1) is the last"
echo "K18 'In Progress (stage' docs: $(grep -rln 'In Progress (stage' docs/implementation | sort | tr '\n' ' ')"
echo "K19 npm run lint warning total at HEAD: $(npm run lint 2>&1 | grep -oE 'Found [0-9]+ warnings')"
echo "K20 artifacts:"
for f in sketch.patch.txt covering-files.txt sketch-covering-run.log sketch-tsc.log sketch-biome-final.log mutant-a.log mutant-c.log mutant-g.log \
  sketch-studio-lab.tsx.txt sketch-collection.ts.txt sketch-strings.ts.txt sketch-StudioWorkspace.tsx.txt sketch-StudioShowcase.tsx.txt \
  sketch-StudioMockup.tsx.txt sketch-checkout.success.tsx.txt sketch-strings.test.ts.txt sketch-collection.test.ts.txt \
  sketch-purchased-collection-ui.test.tsx.txt sketch-studio-naming.test.tsx.txt mutant-m4.log sketch-colour-ui-run.log; do
  test -f "$L/b-round-301/$f" && echo "  ok $f" || echo "  MISSING $f"
done
echo "K21 protected legacy Studio labels: account.downloads.tsx 'Open in Studio' $(grep -c "Open in Studio" app/routes/account.downloads.tsx), studio.\$productId.tsx 'in Studio.' $(grep -c 'in Studio\.' 'app/routes/studio.$productId.tsx')"
