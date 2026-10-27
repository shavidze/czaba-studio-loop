import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "5854d450b67e5d5aef29a81920b0fd531f516ba7"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}

t = items["TM-B18"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 15 PASS (c-round-15.md/.json, realVerified=true, 0 bugs): R15-1 only the 4 owned paths, MetadataPanel hunks = import + "
    "module-level buildReloadFailedToast + 2 inside handleSave, handleSchemaChanged/JSX/deps unchanged, no new as-cast, test diff adds only "
    "((a)-(i) byte-identical), data-flow.md +2 paragraphs in the two save sections, STATE_MANAGEMENT.md +1 line in ### Save flow (Edit tool, "
    "permission_denials []); R15-2 a4ad852 worktree + new tests 3 failed | 10 passed ((j)/(k) 'read-batch down', (l) 'read down'), A tree 13/13; "
    "R15-3 M1s/M1b/M2/M3/M4/M5 all killed ((l); (j)(k); (j)(k) expectEditsKept; (j)(k) store deep-equal; (l) type; (m)); R15-4 clean verifyCommand "
    "exit 0, Biome 0 errors / 9 warnings identical to a4ad852, typecheck 0, renderer 120/120, main 76/76, E2E 7/7, --retries=0 7/7; R15-5 built app "
    "_electron + xvfb, ipcMain handler replaced in the running main by a throwing one (app.evaluate removeHandler/handle, harness only): batch toast "
    "exactly 'Tags saved to 2 files, but reloading failed. Rescan to refresh.' (error, one toast), single 'Tags saved, but reloading failed. Rescan to "
    "refresh.', rows unchanged, typed value kept, Save enabled; ffprobe + music-metadata ICAT=R15Batch on both / R15Single; relaunch without "
    "injection shows Tagged + new values; red reference a4ad852 build: raw 'Error invoking remote method 'meta:read-batch': Error: R15 injected' "
    "while files were written; R15-6 no injection: batch 'Tags saved to 2 files' form cleared, single 'Tags saved', chmod 000 '1 saved, 1 failed' "
    "chmod row keeps Tagged, all values confirmed in ffprobe + music-metadata; R15-7 docs match code. Root gate round 15 published 5854d45, review "
    "COMMIT OK (lows -> RR-R15-01..05)"
)
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R15 close: done on C R15 evidence; published 5854d45"

for fid in ("RR-R13-03", "B-R14-01"):
    findings[fid]["status"] = "closed"
    findings[fid]["closed_by"] = "TM-B18 (D-24), C round 15 PASS, published 5854d45"

decisions["D-24"]["status"] = "done R15, published 5854d45 (TM-B18; C R15-1..R15-7)"

rr = findings["RR-R13-02"]
rr["routed_to"] = (
    "B R15 re-route: premise was wrong. src/preload/index.d.ts already types readMetadata as Promise<WavMetadata> and readMetadataBatch as "
    "Promise<Record<string, WavMetadata>> (B read on 5854d45; R15 typechecked 'let updated: WavMetadata = await window.api.readMetadata(...)'), "
    "so removing the 'as WavMetadata' casts needs no protected file. Renderer-only cleanup; pairs with RR-R15-01/RR-R15-02 in a later "
    "MetadataPanel polish round"
)
rr["note"] = "no longer waits on the user"

new_findings = [
    {
        "round": 15, "id": "RR-R15-01", "source": "root-review", "severity": "low", "status": "open",
        "title": "MetadataPanel.tsx:88,110 bare catch {} around the re-read drops the rejection reason; a 'reloading failed' report gives nothing to diagnose (catch (err) and add the message to the toast or a log that fits the no-comments/minimal-logging rules)",
        "routed_to": "signal; later MetadataPanel polish round with RR-R15-02/RR-R13-02 (changing the D-24 toast text needs a D-24 amendment)",
    },
    {
        "round": 15, "id": "RR-R15-02", "source": "root-review + A code-reviewer nit", "severity": "low", "status": "open",
        "title": "MetadataPanel.tsx:93-94,120 'updated as WavMetadata' casts are redundant now that updated/refreshed have explicit types (TYPESCRIPT_STRICT.md)",
        "routed_to": "signal; later MetadataPanel polish round with RR-R13-02/RR-R15-01",
    },
    {
        "round": 15, "id": "RR-R15-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "UX: after a confirmed write with a failed re-read (D-24) the edits stay dirty, so a selection change shows 'Unsaved changes were discarded' although the data is on disk (documented D-24 known limit)",
        "routed_to": "Saba question (product wording / behaviour); not a task until answered",
    },
    {
        "round": 15, "id": "RR-R15-04", "source": "root-review", "severity": "info", "status": "open",
        "title": "Batch toast grammar 'Tags saved to 1 files' when succeeded === 1 and failed is empty (pre-existing wording). B note: the batch branch needs >= 2 selected files and failed empty means succeeded = paths.length >= 2, so the text is not reachable through the UI today",
        "routed_to": "signal; only relevant if batch ever runs with one path",
    },
    {
        "round": 15, "id": "RR-R15-05", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: single and batch write -> re-read -> apply are diverging (D-21, D-22, D-24); one pure resolveSaveOutcome(writeResult, readResult | Error) returning entries to apply / skipSync / clear edits / toast would make the rules unit-testable; also consider writeMetadata* returning the re-read metadata in the same IPC call (preload change -> protected, needs the user)",
        "routed_to": "signal (joins RR-R12-04, RR-R13-04); not a task",
    },
    {
        "round": 15, "id": "C-R15-01", "source": "C", "severity": "low", "status": "open",
        "title": "Error toast (fixed bottom-20 right-4) covers the Save button in the bottom-right corner for ~3 s (c-round-15/r15-5-batch-new-2-after-save.png); pre-existing layout, not changed by D-24",
        "routed_to": "signal; UX/layout round (reference-first applies: toast placement in reference editors)",
    },
    {
        "round": 15, "id": "A-R15-01", "source": "A qa-engineer", "severity": "info", "status": "open",
        "title": "succeeded: 0 + re-read reject -> '0 saved, N failed. Reloading failed. Rescan to refresh.' matches D-24 but reads awkwardly; no test covers succeeded 0",
        "routed_to": "signal; optional wording change with RR-R15-01 (D-24 amendment)",
    },
    {
        "round": 15, "id": "B-R15-01", "source": "B experiment (b-round-15.md E1-E6)", "severity": "info", "status": "open",
        "title": "Fact: all four launchTagManagerApp failure paths are reachable with -r injectors on the built app: blocking main (Atomics.wait) -> electron.launch TimeoutError (Playwright kills the process itself, pid gone at once); process.exit(3) -> 'electron.launch: Process failed to launch!' in ~0.2 s; delaying the renderer JS via webRequest -> firstWindow ok, waitForLoadState domcontentloaded TimeoutError; whenReady never resolving + event loop blocked -> firstWindow TimeoutError, app.close() hangs, SIGKILL needed",
        "routed_to": "TM-B19 round 16 (C real-launch recipes)",
    },
]
known = set(findings)
for f in new_findings:
    if f["id"] not in known:
        b["findings"].append(f)
findings = {f["id"]: f for f in b["findings"]}

for fid in ("RR-R10-01", "RR-R10-02", "RR-R10-04", "A-R10-01"):
    findings[fid]["status"] = "in_progress"
    findings[fid]["routed_to"] = "TM-B19 round 16 (D-25)"
findings["RR-R10-03"]["routed_to"] = (
    "signal; explicitly not in TM-B19: Playwright exposes app.process() only after electron.launch resolves, so output printed before that "
    "cannot be captured without a different launcher (documented in docs/ci-cd.md)"
)

if "TM-B19" not in items:
    b["items"].append({
        "id": "TM-B19",
        "type": "bug",
        "severity": "low",
        "source": "RR-R10-01, RR-R10-02, RR-R10-04, A-R10-01",
        "title": "E2E launch helper diagnostics: (a) the wrapped launch Error drops the original error (no cause/stack, RR-R10-01); (b) an electron.launch TimeoutError (no app yet) is reported as 'first window did not appear', and a non-timeout launch failure as 'first window failed' (RR-R10-02); (c) closeFailedTagManagerApp sends SIGKILL but returns before the process has exited (RR-R10-04); (d) none of these failure paths has a test (A-R10-01)",
        "status": "todo",
        "round": 16,
        "depends_on": [],
        "decisions": ["D-25"],
        "findings": ["RR-R10-01", "RR-R10-02", "RR-R10-04", "A-R10-01", "B-R15-01"],
        "acceptance": [
            "R16: new main-env Vitest tests on a Playwright-free module tests/e2e/electron-launch-failure.ts fail on 5854d45 (module missing / old behaviour) and pass after: launch-phase timeout -> 'electron.launch did not finish within 60000 ms', launch-phase other error -> 'electron.launch failed: <msg>', window/load phases keep today's texts, every thrown Error has cause === original error; close helper waits for the exit event after SIGKILL (bounded), does not kill an already exited process, resolves even if exit never comes",
            "mutations: drop cause; drop the launch phase (falls back to first-window text); no exit wait; unbounded exit wait; kill an exited process -> each killed by a named test",
            "real launches (C, built app, xvfb, TAG_MANAGER_E2E_ELECTRON_REQUIRE with C-phase injectors, full 60/15/10/5 s budgets): block -> launch-timeout text + cause TimeoutError; exit(3) -> 'electron.launch failed: ...'; slow renderer JS -> domcontentloaded text; hung main after window timeout -> rejection only after the Electron pid is gone, no orphan; red reference on 5854d45 for block and exit(3)",
            "unset injector env -> launch args identical (D-06), specs unchanged, E2E 7/7 and --retries=0 7/7; worst-case budget arithmetic in docs/ci-cd.md matches the constants and stays below LAUNCH_HOOK_TIMEOUT_MS",
            "gate: verifyCommand green, renderer 120, main 76 + new",
        ],
        "evidence": [
            "B round 15 experiments on the built 5854d45 app (b-round-15.md E1-E6, injectors b-round-15-exp-*.cjs.txt): E1 block -> 'electron.launch: Timeout 3000ms exceeded.' TimeoutError, today's helper would say 'first window did not appear'; E2 exit(3) -> 'electron.launch: Process failed to launch!' Error after 211 ms; E5 hangafter -> app.close() did not finish in 4 s, process alive (exitCode null) until SIGKILL; E6 Playwright kills a launch-timed-out process itself (pid gone at 0 ms)"
        ],
    })

if "D-25" not in decisions:
    b["decisions"].append({
        "id": "D-25",
        "status": "decided B round 15 close (technical, reversible, test harness only); to be implemented R16 (TM-B19)",
        "decision": "launchTagManagerApp failure messages by phase. Launch phase (electron.launch has not resolved): TimeoutError -> 'electron.launch did not finish within ${FIRST_WINDOW_TIMEOUT_MS} ms'; any other error -> 'electron.launch failed: ${message}'. Window phase (launched, no window): TimeoutError -> 'first window did not appear within ${FIRST_WINDOW_TIMEOUT_MS} ms' (unchanged); other -> 'first window failed before ${FIRST_WINDOW_TIMEOUT_MS} ms: ${message}' (unchanged). Load phase: 'first window appeared but domcontentloaded did not finish within ${DOM_CONTENT_LOADED_TIMEOUT_MS} ms: ${message}' (unchanged). Every message keeps the ' (elapsed N ms)' suffix and the main-output tail block; the thrown Error carries { cause: originalError }. closeFailedTagManagerApp: after SIGKILL wait for the process 'exit' event up to FAILED_APP_KILL_WAIT_MS = 5000; skip kill and wait when the process already exited. LAUNCH_HOOK_TIMEOUT_MS 90000 -> 100000 so the worst case 60 + 15 + 10 + 5 = 90 s stays below the hook timeout. Pure Playwright-free parts move to tests/e2e/electron-launch-failure.ts so main-env Vitest can test them. Env-unset launch args unchanged (D-06, D-20). Pure fix: reference-first rule exempt",
        "contract_with": "none (test harness only; K-4 tag contract untouched)",
    })

for r in b["rounds"]:
    if r["round"] == 15:
        r["status"] = "published"
        r["commit"] = COMMIT
        r["c_result"] = "PASS, realVerified=true (R15-1..R15-7), 0 bugs; mutations M1s/M1b/M2-M5 killed; real-app red reference on a4ad852; root review COMMIT OK (lows -> RR-R15-01..05)"
        for fid in ("RR-R15-01", "RR-R15-02", "RR-R15-03", "RR-R15-04", "RR-R15-05", "C-R15-01", "A-R15-01"):
            if fid not in r["findings"]:
                r["findings"].append(fid)

if not any(r["round"] == 16 for r in b["rounds"]):
    b["rounds"].append({
        "round": 16,
        "task": "TM-B19 E2E launch helper diagnostics: phase-specific launch messages (RR-R10-02), Error cause (RR-R10-01), wait for exit after SIGKILL (RR-R10-04), failure-path tests (A-R10-01) (D-25)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B19"],
        "findings": ["RR-R10-01", "RR-R10-02", "RR-R10-04", "A-R10-01", "B-R15-01"],
    })

b["current_task"] = "round 16: TM-B19 (D-25) E2E launch helper diagnostics: launch-phase messages, Error cause, wait for exit after SIGKILL, failure-path tests (RR-R10-01/02/04, A-R10-01)"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print("ok", len(b["items"]), len(b["findings"]), len(b["decisions"]), len(b["rounds"]))
