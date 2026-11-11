"""B round 447 -> 448 planning backlog update. Idempotent (update-backlog.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-447'
DONE = f'{B}/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 447 -> 448 planning'
b['version'] += 1
b['updated'] = '2026-11-11'
of = b['open_findings']
ofi = {e.get('id'): e for e in of}
dl = b['deferred_low_polish']
dli = {e.get('id'): e for e in dl}
C447 = ('C round 447 PASS (c-round-447.json, browserVerified/realVerified true, C1-C15 PASS, 0 bugs, observations O1-O6), '
        'gate 447 published cce5eda (review COMMIT OK 9/10, verify green: 279 files / 4109 tests)')

# D-29z1589: round 447 accepted; STORE-2b-2a done
q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STORE-REDESIGN')
st2 = next(s for s in q['stages'] if s['id'] == 'STORE-2')
sp = st2['split_2b_d29z1583']
sp['STORE-2b-2a'] = f'done (D-29z1589): {C447} | dispatched round 447 (D-29z1588)'
sp['STORE-2b-2b'] = ('dispatched round 448 (D-29z1591): hire-us inquiry e-mail only - teal -> Obsidian/Brass hex mirror of @theme (pinned by HE1) + own dark wrapper '
                     'background (B-R447-HIREUS-EMAIL-LIGHT-CLIENT); template extracted to app/lib/hire-us-inquiry-email.server.ts; email.server.ts is dead (0 importers since 3b094eb) '
                     '-> LEGACY-DEAD-STORE-COMPONENTS, not restyled (D-29z1590) | ' + sp.get('STORE-2b-2b', ''))
st2['status'] = 'in_progress (D-29z1589..D-29z1591): 2a done; 2b-1 done (446); 2b-2a done (447); 2b-2b dispatched round 448; 2b-3, 2b-4, 2c, 2d not_started | ' + st2['status']
q['status'] = 'in_progress (D-29z1591): STORE-2b-2a done (447, cce5eda); round 448 = STORE-2b-2b (hire-us e-mail) | ' + q['status']

r447 = next(r for r in b['rounds'] if r.get('round') == 447)
r447['status'] = 'c_pass_published'
r447['result'] = C447 + ' (D-29z1589)'

# Findings from round 447 (L7: confirmations are confirmedBy, not new ids)
dl.append({'id': 'A-R447-REVIEW-L1', 'severity': 'low', 'origin': 'B spec (round 447 task fixed the TS2 shape as >= 1 hit; found by A code-reviewer)',
           'status': 'scheduled round 448 (D-29z1591): this round owns store-teal-sweep.test.ts; exact counts per allow-list entry (TS2), mutant M5',
           'title': 'store-teal-sweep TS2 checks >= 1 hit per allow-listed file, so an allow-listed file can gain teal and stay green',
           'evidence': 'a-round-447.md code-reviewer Lows', 'repro': 'app/lib/__tests__/store-teal-sweep.test.ts TS2 at cce5eda', 'fix': 'pin exact counts', 'added': by})
dl.append({'id': 'A-R447-REVIEW-L2', 'severity': 'low', 'origin': 'B spec (round 447 TS3 token list; found by A code-reviewer)',
           'status': 'deferred_low_polish (D-29z1589): not owned cheaply this round; take with 2b-3 (glow inventory) or the polish pass',
           'title': 'store-teal-sweep TS3 does not catch an inline boxShadow: glow or a drop-shadow-[...] class',
           'evidence': 'a-round-447.md code-reviewer Lows', 'repro': 'app/lib/__tests__/store-teal-sweep.test.ts GLOW_TOKENS at cce5eda',
           'fix': 'add boxShadow/filter style keys and drop-shadow-[ to the glow scan', 'added': by})
dl.append({'id': 'A-R447-REVIEW-L3', 'severity': 'low', 'origin': 'B spec (found by A code-reviewer)',
           'status': 'scheduled round 448 (D-29z1591): TS5 scans perf/** (>= 10 files, 0 teal), mutant M6',
           'title': 'store-teal-sweep walks app/ only while the claims K3 scans app and perf',
           'evidence': 'a-round-447.md code-reviewer Lows', 'repro': 'store-teal-sweep.test.ts listAppSources at cce5eda', 'fix': 'scan perf/ too', 'added': by})
dl.append({'id': 'A-R447-REVIEW-L4', 'severity': 'low', 'origin': 'B spec (product-designer ruling in round 447: solo waveform = foreground)',
           'status': 'deferred_low_polish (D-29z1589): StudioMockup S button bg-yellow-500 / M bg-red-500 restyle with STORE-3 (Studio block) or 2b-4',
           'title': 'StudioMockup solo and active waveforms look the same; the S button keeps bg-yellow-500, so the solo state no longer matches its button colour',
           'evidence': 'a-round-447.md code-reviewer Lows; gates/round-447/review.md suggestion 1', 'repro': 'app/components/home/StudioMockup.tsx at cce5eda',
           'fix': 'S on = bg-foreground text-background (Studio Solo), M on neutral token; or a distinct solo waveform treatment', 'added': by,
           'confirmedBy': ['C round 447 O2 (c-round-447.json notes.observations)', 'gate 447 reviewer suggestion 1']})
of.append({'id': 'B-R447-HIREUS-EMAIL-LIGHT-CLIENT', 'severity': 'medium', 'origin': 'pre-existing (found by B HEAD probe, round 448 planning)',
           'title': 'The /hire-us inquiry e-mail sets no background: in a light mail client 10 of 12 text elements fail WCAG contrast; submitted name, project type and budget are #fff on white (1:1), headings and the e-mail link teal 1.78:1; dark client: footer 3.26:1',
           'status': 'scheduled round 448 (D-29z1591, STORE-2b-2b): own dark wrapper background + Obsidian palette; C3 acceptance',
           'evidence': 'b-round-447/probe/contrast-head.json (K10), shot-head-light.png, shot-head-dark.png; sketch fix contrast-sketch.json (0 failing, min 7.06)',
           'repro': 'b-round-447/probe/capture-hire-us-email.ts (real action, fetch stubbed) + email-contrast.cjs', 'added': by})
of.append({'id': 'TLM-R448-HIREUS-EMAIL-CLIENTS', 'severity': 'info', 'origin': 'environment (no Brevo key / mail client in cloud)',
           'title': 'Tech Lead manual: send one /hire-us inquiry through Brevo and check it in Gmail web (light and dark), Outlook and Apple Mail: background drawn, text legible, link brass',
           'status': 'open_tech_lead_manual (D-29z1591): deadline RETRO 465 (L46); does not block', 'added': by})
lg = ofi.get('LEGACY-DEAD-STORE-COMPONENTS')
if lg is not None:
    lg['title'] += ('; + app/lib/email.server.ts (0 importers in app/perf/e2e since 3b094eb "Remove all Shopify code"; 5 teal hits) '
                    'and app/components/loading/PianoCurtainLoader.tsx (0 users outside barrels) (D-29z1590)')
    lg['evidence'] += '; b-round-447/claims-448-planning-output.txt K5, K6'
of.append({'id': 'INFO-C447-L57-ABSENT', 'severity': 'info', 'origin': 'C (bookkeeping)',
           'title': 'c-round-447.json lacks all 12 L57 harness fields (tools/l57-check.py: L57 INCOMPLETE)',
           'status': 'logged (D-29z1589): round 448 task names "all L57 fields" and the checker run; RETRO 450 counts it', 'evidence': 'b-round-447/l57-check-447.txt', 'added': by})
of.append({'id': 'INFO-C447-O3-HERO-PIXEL-DIFF', 'severity': 'info', 'origin': 'C observation (round 447)',
           'title': 'home full-page pixel diff vs HEAD in the hero band (7 px at 1440, 75 px at 1280, y 430-620), unattributed',
           'status': 'carried as C10 O3-CONTROL in round 448 (record; HEAD-vs-HEAD control, L37 control pairs) (D-29z1591)', 'evidence': 'c-round-447/pdiff.json', 'added': by})
of.append({'id': 'B-R447-AUTH-ROW-PREMISE', 'severity': 'info', 'origin': 'B spec (round 447 C14)',
           'title': 'Round 447 C14 asserted the anonymous /studio/middle-east "Sign in required" text; in the cloud the route renders blank on tree and HEAD (backend unavailable), so the row could not pass as written',
           'status': 'ruled (D-29z1589): purchase-protection rows assert 0 audio[src], 0 media requests and HEAD parity; the text half stays BLOCKED backend unavailable', 'evidence': 'c-round-447.json blocked[0]', 'added': by})
of.append({'id': 'SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE', 'severity': 'info', 'origin': 'A (round 447 report)',
           'title': '.claude/primitives/DESIGN_TOKENS.md still lists brand as #13D9CC teal and accent orange; app/styles/app.css:63 defines brand #c9a46a',
           'status': 'awaiting_user (D-29z1589): proposal only, project-level rule file; listed under "For Saba" in b-round-447.md', 'evidence': 'a-round-447.md process disclosure', 'added': by})
for lid, title, fix in [
    ('TL-R448-L5-TEAL-REGEX-COPY', 'hire-us-inquiry-email.test.ts copies the teal regex of store-teal-sweep.test.ts, so the two can drift', 'one shared test helper constant for the teal pattern'),
    ('TL-R448-L6-HIREUS-ACTION-HARDENING', 'hire-us action (pre-existing): projectType=toString/constructor resolves a prototype function and the action returns 500; the subject (plain-text header) goes through the HTML escaper; the mailto href is HTML-escaped but not URL-encoded; formData.get(...) as string casts', 'Object.hasOwn/Map lookups; plain-text subject; encodeURIComponent for the mailto; typed form parsing'),
    ('TL-R448-D1-HE8-OWN-COLOUR', 'HE8 accepts an inherited colour (nearestColour) although its first sketch title said own inline colour; HE9 relies on HE8 (fallback black on white = 21:1)', 'check each text element own style colour, or keep the resolved-colour wording; keep HE8/HE9 together'),
    ('TL-R448-D2-MESSAGE-LONGHAND', 'the message div background-color longhand is not pinned; a shorthand background would fall through to the wrapper colour and stay green', 'assert the message div own style contains background-color: surface'),
]:
    dl.append({'id': lid, 'severity': 'low', 'origin': 'B sketch (tech-lead sketch review, round 448 planning)' if lid.startswith('TL-R448-D') or lid.endswith('COPY') else 'pre-existing (tech-lead sketch review, round 448 planning)',
               'status': 'deferred_low_polish (D-29z1591)', 'title': title, 'evidence': 'b-round-447/sketch-review.md', 'repro': 'app/routes/hire-us.tsx / app/lib/__tests__/hire-us-inquiry-email*.test.ts in b-round-447/sketch-448.patch.txt', 'fix': fix, 'added': by})
b['architecture_signals'].append({'id': 'SIG-R448-EMAIL-HTML-SHARED', 'added': by, 'decision': 'D-29z1591', 'source': 'b-round-447/sketch-review.md (tech-lead Architecture note: keep)',
    'signal': 'escapeEmailHtml and the e-mail palette live in hire-us-inquiry-email.server.ts; when a second e-mail is revived, extract both into one shared email-html.server.ts (do not revive email.server.ts for this)', 'status': 'signal only; not scheduled'})
b['retro_candidates'].append({'id': 'RETRO450-A-SHELL-EDITS-BYPASS-HOOK', 'added': by, 'decision': 'D-29z1589',
    'text': 'Round 447: A made the 7 source edits with python string replaces in the shell, so the primitives hook did not fire for them, and read several primitives after editing; A also ran git stash / git stash pop for a HEAD comparison. No harm found (diff intact, C PASS). Question for RETRO 450: should A self-check require Edit/Write for app/** and forbid git stash in the store tree (use a --shared scratch clone)?'})
b['decisions_log_b'] += [
    {'id': 'D-29z1589', 'date': '2026-11-11', 'by': by, 'decision': f'Round 447 accepted: {C447}; STORE-2b-2a done. A-R447-REVIEW-L1..L4 recorded (L4 confirmedBy C O2 + gate suggestion 1). B-R447-AUTH-ROW-PREMISE ruled (auth rows = 0 audio[src] + HEAD parity). INFO-C447-L57-ABSENT logged. SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE for Saba. RETRO450-A-SHELL-EDITS-BYPASS-HOOK candidate.'},
    {'id': 'D-29z1590', 'date': '2026-11-11', 'by': by, 'decision': 'STORE-2b-2b rescoped: app/lib/email.server.ts has 0 importers (app/perf/e2e; caller removed in 3b094eb), so it is not restyled and joins LEGACY-DEAD-STORE-COMPONENTS with PianoCurtainLoader.tsx (0 users); the 3 live hits are the hire-us inquiry e-mail. B HEAD probe: light client 10/12 text elements fail (values white on white) -> B-R447-HIREUS-EMAIL-LIGHT-CLIENT Medium pre-existing, fixed together (teal->brass alone cannot pass: brass on white 2.33:1). No e-mail guidance in store-redesign-spec (no reference found).'},
    {'id': 'D-29z1591', 'date': '2026-11-11', 'by': by, 'decision': 'Dispatch round 448 = STORE-2b-2b on cce5eda with B sketch b-round-447/sketch-448.patch.txt (builder module hire-us-inquiry-email.server.ts, palette pinned to @theme by HE1, wrapper background, HE1-HE9 incl. jsdom contrast HE8/HE9, outer presentation table with bgcolor; store-teal-sweep exact counts (A-R447-REVIEW-L1) + perf scan TS5 (A-R447-REVIEW-L3)); mutants M1-M10 red on sketch; sketch typecheck/build (builder server-only)/full suite 281/4119 pre-check; tech-lead review v1 APPROVE-WITH-CHANGES -> v2 delta APPROVE (sha 76965797...). C rows C1-C13 incl. rendered e-mail contrast in light/dark clients, structure diff, escape, /hire-us page parity, O3 control, showcase re-measure, Studio + purchase protection. TLM-R448-HIREUS-EMAIL-CLIENTS (deadline RETRO 465).'},
]
b['rounds'].append({'round': 448, 'task': 'current-task.md', 'decision': 'D-29z1591', 'type': 'STORE-2b-2b (hire-us inquiry e-mail: teal -> Obsidian/Brass, own background; + A-R447-REVIEW-L1/L3)',
                    'status': 'dispatched', 'note': 'baseline cce5eda (gate 447 published); B sketch b-round-447/sketch-448.patch.txt (sha256 in sketch-review.md); claims b-round-447/claims-448.sh; grants b-round-447/grants-448.txt; covering b-round-447/covering-448.txt'})
b['current_task'] = 'Round 448: STORE-2b-2b (hire-us inquiry e-mail leaves teal and gets its own dark background; teal-sweep exact counts + perf scan) on cce5eda (current-task.md)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write(by + '\n')
print('applied v', b['version'])
