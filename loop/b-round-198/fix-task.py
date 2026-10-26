p = 'current-task.md'
s = open(p, encoding='utf-8').read()
pairs = [
    ("ეტაპი 1 (Studio) Completed — C PASS რაუნდებში 196–198, გამოქვეყნებულია `2505252`-სა და `980cfbe`-ში (gates 197, 198).",
     "ეტაპი 1 (Studio) Completed — C PASS რაუნდებში 197 და 198, გამოქვეყნებულია `2505252`-სა (rounds 196–197) და `980cfbe`-ში (round 198)."),
    ("everything done since round 122), three doc status lines only for A",
     "everything done since round 122), four doc status lines in three docs for A"),
    ("<li>The status shows at most the three ` M` docs of §1, and the frozen list is OK.</li>",
     "<li>The status shows exactly the three ` M` docs of §1 (A runs before C, so a missing edit is a SCOPE FAIL), and the frozen list is OK.</li>"),
    ("<li>Open `/studio-lab` anonymously and wait for the workspace (no `Loading…` row).</li>",
     "<li>Open `/studio-lab` anonymously and wait for the workspace structurally (`[data-testid=arrangement-timeline-scroller]` present, as `lib.cjs` `openStudio` does), not by a string.</li>"),
    ("<li>Insert marker at 12, `M`, type `Music enters`, Enter.</li>",
     "<li>Insert marker at 12, `M`, type `აქ შედის მუსიკა` (Georgian user input stays covered), Enter.</li>"),
    ("<li>Select Music and Stems, Ctrl+G, rename the group `SFX street`.</li>",
     "<li>Select Music and Stems, Ctrl+G, rename the group `SFX ქუჩა` (Georgian user input).</li>"),
    ("demo collection names included.</li><li>A hit is a regression",
     "demo collection names included.</li><li>User-entered text is excluded: RV-EN runs in its own fresh session, without the Georgian names typed in RG-16/RG-17.</li><li>A hit is a regression"),
    ("<li>0 computed teal colours (hue 160–190°, saturation > 40 %) inside the workspace.</li>",
     "<li>0 computed teal colours (hue 160–190°, saturation > 40 %) inside the `[data-studio-theme]` root. B's grep found no teal class or `--color-video-sync` consumer under `app/components/arrangement/` (`video-sync` there is a module name). The store header outside the root is excluded, because its teal sweep is STORE-2b.</li>"),
    ("| RV-REVEAL | R91 (198) | The rich scene at 1280:<ul>",
     "| RV-REVEAL | R91 (198) | The rich scene at 1280, and the same at 1440 as the control:<ul>"),
    ("  - Only rows that truly need the real .NET backend go under `blocked`, with \"backend unavailable in cloud\": the SRW-21 purchased-route mount and R80 recordings with real data.\n",
     "  - Only rows that truly need the real .NET backend go under `blocked`, with \"backend unavailable in cloud\":\n"
     "    - the SRW-21 purchased-route mount;\n"
     "    - **R80-RECORDINGS-FIELD-BORDERS** (Medium, source done in round 195). Its fields live on the signed-in `recordings.$productId` / `scenes.$productId` routes. The mock answers `/api/products/*/recordings`, `/api/sfx-library` and `/api/sfx-scenes` with sign-in-required (`mock-api/server.mjs` `SIGN_IN_REQUIRED_PATHS`);\n"
     "    - F11–F13 (`/account`) and F16 (`ChatInput`), as in round 195.\n"),
]
for old, new in pairs:
    n = s.count(old)
    assert n == 1, (n, old[:60])
    s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('applied', len(pairs))
