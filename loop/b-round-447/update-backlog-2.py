"""B round 447 -> 448 planning, advisor follow-up. Idempotent (update-backlog-2.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-447/update-backlog-2.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 447 -> 448 planning (advisor follow-up)'
b['version'] += 1
of = b['open_findings']
of += [
    {'id': 'SABA-Q-HIREUS-EMAIL-THEME', 'severity': 'info', 'origin': 'B (round 448 planning)',
     'title': 'The Hire-Us inquiry e-mail Saba receives now paints the Store Obsidian background (light ink, brass link); rejected option: a light e-mail (dark ink on white, brass link)',
     'status': 'awaiting_user (D-29z1592): the dark default ships; asked once via b-round-447.md For Saba and feature-status.md', 'added': by},
    {'id': 'B-R447-SKETCH-SERVER-PATCH-SILENT', 'severity': 'info', 'origin': 'B pre-check tooling (b-round-445/probe/sketch-server.sh)',
     'title': 'sketch-server.sh patch mode: the served copy lives under the loop folder, a git checkout (czaba-studio-loop), so git apply resolves paths against that repo and silently skips the patch; the server then serves HEAD',
     'status': 'ruled (D-29z1592): C serves only none mode (HEAD); B served the round-448 sketch with patch -p1; a fix of the script (patch -p1 or git apply --directory / outside the repo) is a loop-tool change for root or the next B planning that needs a sketch server',
     'evidence': 'b-round-447.md section 6 advisor follow-up; b-round-447/srv-sketch/dev-5179.log', 'added': by},
    {'id': 'BLOCKED-EVIDENCE-R447-ACCOUNT-DOWNLOADS-CARD', 'severity': 'info', 'origin': 'environment (backend unavailable in cloud)',
     'title': 'Round 447: the ProductCard browser half on the protected /account/downloads (signed-in, backend) was BLOCKED; jsdom product-price-cards green',
     'status': 'open_evidence_backend (D-29z1592): keep for a backend-enabled check; not a reason to call round 447 unverified (cloud policy)', 'evidence': 'c-round-447.json blocked[1]', 'added': by},
]
b['architecture_signals'].append({'id': 'SIG-R447-TEAL-ALLOWLIST-RATCHET', 'added': by, 'decision': 'D-29z1592',
    'source': 'gates/round-447/review.md Architecture note (planner-level observation; keep)',
    'signal': 'store-teal-sweep allow-list is a cross-cutting ratchet edited at every sweep stage (2b-2b, STORE-4, LEGACY cleanup); if it keeps changing, one bounded task moves the allow-list and the teal regex into one shared test constants module (also closes TL-R448-L5-TEAL-REGEX-COPY)',
    'status': 'signal only; not scheduled'})
b['root_requests_b'].append({'id': 'ROOT-REQ-AGENT-WORKFLOW-FILE-SHORT', 'added': by, 'status': 'filed with root (D-29z1592): informational, non-blocking',
    'question': 'docs/technical/studio-real-workspace/agent-workflow.md on disk is 87 lines and ends at "Loop v2 - 2026-10-19"; the policy snapshot in agent prompts continues (cloud runner, speed rules, bug gate, Ableton review, SABA-B-*, STORE, PERF, ARCH-SPLIT, legacy removal). The policy says the file wins when they differ: were the later sections meant to be in the file?'})
b['decisions_log_b'].append({'id': 'D-29z1592', 'date': '2026-11-11', 'by': by, 'decision': 'Advisor follow-up before hand-off: C6 /hire-us page measured by B on dev servers (HEAD :5178 vs sketch :5179: 0 px both ways at 3 viewports; empty submit native required x3; filled submit Server configuration error on both; probe/hire-us-page-sketch.json K26); C4 allowed diff saved from the v2 capture (probe/email-structure-diff-sketch.txt K27); C3 HEAD capture recipe = git clone --shared + node_modules symlink (byte-identical); lint/check on v2 rc 0 (205 = HEAD); git apply --check rc 0; repo-wide git grep: no live importer of email.server. Recorded SABA-Q-HIREUS-EMAIL-THEME, B-R447-SKETCH-SERVER-PATCH-SILENT, BLOCKED-EVIDENCE-R447-ACCOUNT-DOWNLOADS-CARD, SIG-R447-TEAL-ALLOWLIST-RATCHET, ROOT-REQ-AGENT-WORKFLOW-FILE-SHORT.'})
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write(by + '\n')
print('applied v', b['version'])
