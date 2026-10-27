import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "cb2d76b0b1dbb0e5e73a70ace2c8c618c0a68ffd"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}

t = items["TM-B19"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 16 PASS (c-round-16.md/.json, realVerified=true, 0 bugs): R16-1 only the 4 owned paths (2 M + 2 new), getElectronRequireArgs/"
    "getElectronLaunchArgs/captureMainProcessOutput/electron.launch options/remainingMs untouched, new module has no import at all, no any/"
    "@ts-ignore/as unknown as/comments, ci-cd.md hunks inside '### E2E launch budget', injector subsection byte-identical, permission_denials []; "
    "R16-2 5854d45 worktree + new test -> ERR_MODULE_NOT_FOUND, A tree 17/17; R16-3 M1 (a-f,f2), M2 (a,b,f,f2), M3 (g,h4,i,i2), M4 (i,i2 timeout), "
    "M5 (h,h3,h2) killed, M6 (phase starts at window) killed by real launch (1): old text came back; R16-4 clean verifyCommand exit 0, Biome 0 errors / "
    "9 warnings same list as 5854d45, typecheck 0, renderer 120/120, main 93/93 (76+17), E2E 7/7, --retries=0 7/7; R16-5 built app + xvfb, real "
    "budgets: (1) block 75 s -> 'electron.launch did not finish within 60000 ms (elapsed 60066 ms)', cause TimeoutError, pid gone; (2) exit(3) -> "
    "'electron.launch failed: electron.launch: Process failed to launch!' in 216 ms, pid gone; (3) slow renderer JS -> domcontentloaded 15000 ms text, "
    "pid gone; (4) hung main -> 'first window did not appear within 60000 ms', rejection at 70063 ms with pid already gone (ESRCH), 0 orphans; "
    "(5) normal launch title + close; red reference 5854d45 own build: (2) 'first window failed before 60000 ms: ...' no cause, (1) 'first window did "
    "not appear' no cause, (4) pid ALIVE at catch (RR-R10-04 confirmed); R16-6 docs match code (5 texts, constants, 60+15+10+5=90<100, cause, exit "
    "wait). Root gate round 16 published cb2d76b, review COMMIT OK (lows -> RR-R16-01..04)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R16 close: done on C R16 evidence; published cb2d76b"

closed_by = "TM-B19 (D-25), C round 16 PASS, published cb2d76b"
for fid in ("RR-R10-01", "RR-R10-02", "RR-R10-04", "A-R10-01", "B-R15-01"):
    findings[fid]["status"] = "closed"
    findings[fid]["closed_by"] = closed_by

d25 = decisions["D-25"]
d25["status"] = "done R16, published cb2d76b (TM-B19; C R16-1..R16-6)"
old_phrase = "Pure Playwright-free parts move to tests/e2e/electron-launch-failure.ts so main-env Vitest can test them."
new_phrase = (
    "Pure Playwright-free parts move to tests/e2e/electron-launch-failure.ts so main-env Vitest can test them; electron-launch.ts re-exports "
    "FIRST_WINDOW_TIMEOUT_MS and LAUNCH_HOOK_TIMEOUT_MS from it, while ELECTRON_REQUIRE_ENV stays defined in electron-launch.ts (used by the "
    "byte-identical getElectronRequireArgs; B R16 wording correction after C-R16-01)."
)
if old_phrase in d25["decision"]:
    d25["decision"] = d25["decision"].replace(old_phrase, new_phrase)
elif "C-R16-01" not in d25["decision"]:
    d25["decision"] += " " + new_phrase

r52 = findings["RR-R5-02"]
r52["status"] = "in_progress"
r52["routed_to"] = "TM-B20 round 17 (D-26)"

new_findings = [
    {
        "round": 16, "id": "RR-R16-01", "source": "root-review", "severity": "low", "status": "open",
        "title": "Biome does not reach the four R16 files (npm run check runs biome check src/ only); e.g. whether organizeImports accepts tests/e2e/electron-launch.ts:5-13 was never checked",
        "routed_to": "signal on TM-B06 (with RR-R14-05, A-R16-02); scope decision with Saba",
    },
    {
        "round": 16, "id": "RR-R16-02", "source": "root-review", "severity": "low", "status": "open",
        "title": "tests/e2e/electron-launch.ts:62 getElectronLaunchArgs runs before the try, so its error (bad TAG_MANAGER_E2E_ELECTRON_REQUIRE path) is thrown without phase, elapsed or cause; nothing is lost (message already explains it, no process yet); optional docs note next to the phase table",
        "routed_to": "signal; optional docs line in a later E2E-harness touch",
    },
    {
        "round": 16, "id": "RR-R16-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "tests/e2e/electron-launch-failure.ts:79-80 when kill('SIGKILL') returns false the helper still waits the full FAILED_APP_KILL_WAIT_MS (5 s); stays within the 90 < 100 s budget. B note: with exitCode/signalCode both null, a false return means the exit event has not been emitted yet, so waiting for it is mostly correct",
        "routed_to": "signal; pairs with A-R16-01 as one optional close-helper hardening",
    },
    {
        "round": 16, "id": "RR-R16-04", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: capturing main output during electron.launch needs spawning Electron ourselves and connecting over CDP; only worth it if launch-phase failures show up in CI",
        "routed_to": "signal (joins RR-R10-03); not a task",
    },
    {
        "round": 16, "id": "A-R16-01", "source": "A qa-engineer", "severity": "low", "status": "open",
        "title": "closeFailedTagManagerApp: if kill() threw, the exit listener and kill-wait timer would stay for 5 s and the kill error would replace the original launch error; a real ChildProcess.kill('SIGKILL') does not throw (same shape as on 5854d45)",
        "routed_to": "signal; pairs with RR-R16-03",
    },
    {
        "round": 16, "id": "A-R16-02", "source": "A", "severity": "info", "status": "open",
        "title": "With a tests/-including Biome config, tests/e2e/electron-launch.ts gets one organizeImports assist (@playwright/test before node:*); pre-existing on 5854d45",
        "routed_to": "signal on TM-B06",
    },
    {
        "round": 16, "id": "C-R16-01", "source": "C", "severity": "info", "status": "closed",
        "title": "D-25 point 6 said ELECTRON_REQUIRE_ENV is re-exported; in code it stays defined in electron-launch.ts (required by byte-identical getElectronRequireArgs); spec imports resolve",
        "closed_by": "B R16 close: D-25 wording corrected in backlog.json and feature-status.md",
    },
    {
        "round": 16, "id": "B-R16-01", "source": "B experiment (b-round-16.md E1, b-round-16-exp-row-display.mts.txt)", "severity": "low", "status": "open",
        "title": "file-row-display.ts:4 formatFirstFieldValue returns value[0] whatever its type: [5] -> number 5, [{}] -> object {} (an object as a React child throws in FileList); hasAnyTagValue throws on [null], [5], [{}] ('Cannot read properties of null (reading trim)', 'item.trim is not a function'). Not reachable from the real app today: main maps every array element through stripRiffNulTerminator/getValuesAsStrings",
        "routed_to": "TM-B20 round 17 (D-26)",
    },
]
known = set(findings)
for f in new_findings:
    if f["id"] not in known:
        b["findings"].append(f)
findings = {f["id"]: f for f in b["findings"]}

for fid in ("RR-R16-01", "A-R16-02"):
    pass
b6 = items["TM-B06"]
b6_sig = "B R16: RR-R16-01 and A-R16-02 add to the signals on this item (with RR-R14-03, RR-R14-05); scope decision still with Saba"
if b6.get("note_b_r16") != b6_sig:
    b6["note_b_r16"] = b6_sig

if "TM-B20" not in items:
    b["items"].append({
        "id": "TM-B20",
        "type": "bug",
        "severity": "low",
        "source": "RR-R5-02, B-R16-01",
        "title": "File row helpers trust array element types: hasAnyTagValue throws on a non-string array element ([null], [5], [{}]) and formatFirstFieldValue returns a non-string first element (an object crashes the FileList row render). Defensive: not reachable from the real app today",
        "status": "todo",
        "round": 17,
        "depends_on": [],
        "decisions": ["D-26"],
        "findings": ["RR-R5-02", "B-R16-01"],
        "acceptance": [
            "R17: new renderer tests fail on cb2d76b and pass after: hasAnyTagValue does not throw and treats non-string array elements as empty ([null], [5], [{}], [undefined via JSON null]); ['x', null] stays tagged; formatFirstFieldValue returns '' unless value[0] is a string; FileList renders rows with artists [null] / genres [{}] without throwing, with no Tagged badge when nothing else is set",
            "mutations: drop the string check in isNonEmptyFieldValue; return value[0] unconditionally; -> each killed by a named test",
            "D-15 behaviour for well-typed values unchanged (existing tests byte-identical and green)",
            "real app regression (C, built app, xvfb): Artists/Genres set through the UI and saved, rows show the first artist/genre and Tagged, ffprobe + music-metadata confirm; untagged fixture row has no badge. The malformed-element case itself is unit/component only (not reachable from the real app; stated honestly)",
            "gate: verifyCommand green, renderer 120 + new, main 93, E2E 7/7, --retries=0 7/7",
        ],
        "evidence": [
            "B round 16 experiment (b-round-16-exp-row-display.mts.txt, tsx on the real cb2d76b module): [null] / [5] / [{}] -> hasAnyTagValue throws; formatFirstFieldValue([5]) -> number 5, ([{}]) -> object; JSON.parse(...) as WavMetadata typechecks under tsconfig.test.json (b-round-16-exp-untyped-probe.test.ts.txt)"
        ],
    })

if "D-26" not in decisions:
    b["decisions"].append({
        "id": "D-26",
        "status": "decided B round 16 close (technical, reversible, renderer display only); to be implemented R17 (TM-B20)",
        "decision": "Amends D-15 for malformed data: in the file-row helpers an array element counts as non-empty only if it is a string with non-whitespace content; any non-string element (null, number, object, boolean) counts as empty and never throws. formatFirstFieldValue returns value[0] only when it is a string, otherwise '' (no String() coercion, no search for a later string element: ['', 'x'] still shows ''). Whole-value rules of D-15 (string, number > 0, non-array non-string non-number -> empty) unchanged. Types (FieldValue) unchanged; main, preload, stores unchanged. Pure fix: reference-first rule exempt",
        "contract_with": "none (renderer display only; K-4 tag contract untouched)",
    })

for r in b["rounds"]:
    if r["round"] == 16:
        r["status"] = "published"
        r["commit"] = COMMIT
        r["c_result"] = "PASS, realVerified=true (R16-1..R16-6), 0 bugs; mutations M1-M6 killed (M6 by a real launch); red reference on a 5854d45 build; root review COMMIT OK (lows -> RR-R16-01..04)"
        for fid in ("RR-R16-01", "RR-R16-02", "RR-R16-03", "RR-R16-04", "A-R16-01", "A-R16-02", "C-R16-01"):
            if fid not in r["findings"]:
                r["findings"].append(fid)

if not any(r["round"] == 17 for r in b["rounds"]):
    b["rounds"].append({
        "round": 17,
        "task": "TM-B20 file row helpers: non-string array elements count as empty and never throw, formatFirstFieldValue returns a string only (RR-R5-02, B-R16-01) (D-26)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B20"],
        "findings": ["RR-R5-02", "B-R16-01"],
    })

b["current_task"] = "round 17: TM-B20 (D-26) file row helpers tolerate non-string array elements (RR-R5-02, B-R16-01)"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print("ok", len(b["items"]), len(b["findings"]), len(b["decisions"]), len(b["rounds"]))
