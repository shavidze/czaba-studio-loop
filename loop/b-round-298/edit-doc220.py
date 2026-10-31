import sys
p = sys.argv[1] + '/docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md'
s = open(p).read()
def sub(old, new):
    global s
    assert s.count(old) == 1, (old[:60], s.count(old))
    s = s.replace(old, new)
sub("**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS; tests rounds 297–298)",
    "**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS; tests rounds 297–299)")
sub("- `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` — იგივე mock line.\n",
    "- `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` — იგივე mock line; round 299-ში NG9 server HTML-ს `applyBrowserParsedMutedState`-ით ამზადებს და warning-ს `muted`-ის გამონაკლისის გარეშე ამოწმებს.\n")
sub("- `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` — ახალი: LH1–LH4 (round 297); round 298-ში LH3 ცალკე ფაილში გადავიდა, unmount-ები `afterEach`-ში.\n",
    "- `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` — ახალი: LH1–LH4 (round 297); round 298-ში LH3 ცალკე ფაილში გადავიდა, unmount-ები `afterEach`-ში; round 299-ში unmount hydration-მდე რეგისტრირდება.\n")
sub("- `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` — ახალი: LH3 თავის ფაილში (round 298).\n",
    "- `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` — ახალი: LH3 თავის ფაილში (round 298); round 299-ში warning-ის სრული regex, ნულოვანი tolerance და `applyBrowserParsedMutedState`.\n")
sub("- **Problem:** `demo-middle-east` demo collection-ში პირველია",
    "- **Problem:** jsdom-ის hydration ტესტებში video dock-ის ორი `<video muted>` ``Prop `muted` did not match. Server: \"false\" Client: \"true\"`` warning-ს ბეჭდავდა (GATE297-S5-VIDEO-MUTED-SSR). Server HTML-ში `muted=\"\"` attribute არის, მაგრამ React `muted`-ს property-ით ადარებს, ხოლო jsdom attribute-იდან `muted` property-ს არ აყენებს (`defaultMuted` არის `true`, `muted` — `false`). Chromium HTML spec-ის მიხედვით property-ს attribute-იდან აყენებს, ამიტომ ბრაუზერში warning არ ჩანს (C round 298: 0). ტესტებში ეს warning React-ის ერთჯერად flag-ს ხარჯავდა და dock-ის შემდეგ hydrate-ებული mismatch-ები არ ჩანდა. **Solution (round 299):** production კოდი არ შეცვლილა. ტესტის helper `applyBrowserParsedMutedState` server HTML-ის ყოველ `<video>`-ს hydration-მდე `muted = defaultMuted`-ს უწერს, როგორც ბრაუზერის parser აკეთებს. `suppressHydrationWarning` უარყოფილია, რადგან ის `<video>`-ის სხვა attribute-ების ნამდვილ mismatch-ებსაც დამალავდა.\n"
    "- **Problem:** `demo-middle-east` demo collection-ში პირველია")
sub("- Covering set: 9 ფაილი, 89 ტესტი გადის.\n",
    "- Covering set (round 296): 9 ფაილი, 89 ტესტი გადის. Round 298–299-ის covering set: 7 ფაილი, 58 ტესტი.\n")
sub("Root-ები `afterEach`-ში ყოველთვის unmount-დება, row-ის ჩავარდნის შემთხვევაშიც.",
    "`afterEach` unmount-ს უკეთებს ყოველ root-ს, რომლის hydration დასრულდა.")
sub("შეზღუდვა: video dock-ის `muted` mismatch (GATE297-S5-VIDEO-MUTED-SSR) იგივე flag-ს ხარჯავს, ამიტომ LH3 იჭერს მხოლოდ იმ mismatch-ებს, რომლებიც dock-ზე ადრე hydrate-დება; library მათ შორისაა.\n",
    "შეზღუდვა round 298-ში: jsdom-ში video dock-ის `muted` warning (GATE297-S5-VIDEO-MUTED-SSR) იგივე flag-ს ხარჯავდა, ხოლო regex server-ის მხოლოდ ზედმეტ attribute-ს (\"Extra attributes from the server\") ვერ იჭერდა (C-R298-01).\n"
    "\n"
    "- რაუნდ 299-ში (C-R298-01) LH3-ისა და NG9-ის regex React 18.3.1-ის ყველა hydration warning-ს ფარავს, რომელიც `didWarnInvalidHydration`-ს აყენებს: `/did not match|Extra attributes from the server|Did not expect server HTML|Expected server HTML|Hydration failed/i`. `applyBrowserParsedMutedState`-ის შემდეგ jsdom-ში `muted` warning აღარ ჩნდება, ამიტომ LH3 და NG9 ნებისმიერ hydration warning-ზე წითლდება (`toEqual([])`, `muted`-ის გამონაკლისის გარეშე). `hydrateRoute` unmount-ს hydration-მდე არეგისტრირებს, ამიტომ hydration-ის throw-ის შემთხვევაშიც root `afterEach`-ში იხსნება. Mutant-ები scratch ასლზე: (x) option-ზე მხოლოდ server-ის attribute — LH3 და NG9 წითელი (HEAD-ზე 20-ვე მწვანე იყო); (v) იგივე standby `<video>`-ზე — LH3 და NG9 წითელი (HEAD-ზე მწვანე); (y) მხოლოდ server-ის node — LH3, NG9 და NG9c წითელი; (h) — LH3 და NG9 წითელი; (r) და (r2) helper-ის გამოძახების მოხსნა — შესაბამისად LH3 და NG9 წითელი; (e) — LH1 და LH3 წითელი; (g) — LH4 წითელი; reorder-ის მოხსნა — LH3 წითელი. LH1 და NG9c warning-ს არ ამოწმებენ და helper-ს არ იყენებენ.\n")
sub("- STUDIO-LINK-b (რაუნდი 299): library option-ზე \"View in store\" და `?` sheet-ის row.\n",
    "- STUDIO-LINK-b (რაუნდი 300): library option-ზე \"View in store\" და `?` sheet-ის row.\n")
sub("- GATE297-S5-VIDEO-MUTED-SSR: `<video muted>`-ის server/client mismatch video dock-ში; სანამ ის არსებობს, dock-ის შემდეგ hydrate-ებული mismatch-ები ტესტებში არ ჩანს.\n",
    "- A-R298-ARCH-HYDRATE-HARNESS (signal): ორ hydrate ფაილს ~120 საერთო ხაზი აქვს; საერთო test helper-ის (`applyBrowserParsedMutedState`-ის ჩათვლით) გამოყოფა architecture checkpoint-ის საკითხია.\n")
open(p, 'w').write(s)
print('doc 220 edited')
