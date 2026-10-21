param([int]$RoundLimit = 20, [int]$StartRound = 1, [ValidateSet('A','C','B')][string]$StartPhase = 'A')
$ErrorActionPreference = 'Stop'
$taskRoot = 'C:/Apps/czaba-project/tmp/studio-real-loop'
$storeRoot = 'C:/Apps/czaba-project/store'
$agentDefinitions = Join-Path $taskRoot 'agents.json'
Set-Location -LiteralPath $storeRoot
function Set-LoopStatus([string]$phase,[int]$round,[string]$detail) {
    [pscustomobject]@{phase=$phase;round=$round;detail=$detail;updatedUtc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath "$taskRoot/status.json" -Encoding utf8
}
function Invoke-LoopAgent([string]$role,[string]$promptFile,[string]$resultFile,[switch]$Implementation) {
    $workflowPolicy = Get-Content -LiteralPath 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md' -Raw
    $taskPrompt = (Get-Content -LiteralPath $promptFile -Raw) + "`nUser steering: work ONLY in real store project. Do not spend time implementing, publishing, or testing standalone prototype/Sites copies. Read root-pre-push-review.md and publication-checkpoint.json when present; include its remaining findings in C/B follow-up. Context policy: never intentionally compact. Write a short checkpoint before exhausting context; use existing artifacts and inspect partial edits before continuing. Do not duplicate or revert work."
    $taskPrompt += "`nAPPROVED WORKFLOW OVERRIDE: The following policy takes precedence over older task/report instructions about batch size, repeated sync runs and broad per-round regression. Preserve all final scope and quality gates. B must publish feature-status.md and a bounded next task; C must report failures honestly within the run budget. Preserve prior partial planning artifacts before revising. Never overwrite an existing tasks/round-N.md archive with a next-round draft after restart; read the existing archive as the completed round task. Policy:`n$workflowPolicy"
    if ($Implementation) {
        $taskPrompt | claude -p --agent $role --agents $agentDefinitions --model claude-opus-5-5 --permission-mode acceptEdits --allowedTools 'Read,Glob,Grep,Bash,Edit,Write,Agent' --output-format json > $resultFile
    } else {
        $taskPrompt | claude -p --agent $role --agents $agentDefinitions --permission-mode acceptEdits --allowedTools 'Read,Glob,Grep,Bash,Write' --output-format json > $resultFile
    }
    if ($LASTEXITCODE -ne 0) { throw "$role exited with code $LASTEXITCODE. Inspect $resultFile" }
    $agentResult = Get-Content -LiteralPath $resultFile -Raw | ConvertFrom-Json
    if ($agentResult.is_error) { throw "$role reported an error. Inspect $resultFile" }
    if ($Implementation -and -not ($agentResult.modelUsage.PSObject.Properties.Name -match '^claude-opus-5-5(?:\[1m\])?$')) { throw 'Implementation result does not confirm requested Opus 5.5 model.' }
}
for ($round=$StartRound; $round -le $RoundLimit; $round++) {
    if (-not (Test-Path -LiteralPath "$taskRoot/current-task.md")) { throw 'B current-task.md missing; no implementation started.' }
    if ($round -gt $StartRound -or $StartPhase -eq 'A') {
    Set-LoopStatus 'A_IMPLEMENTING' $round 'Claude Opus 5.5 implementing B current task.'
    @"
You are A. Read and IMPLEMENT ONLY C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md. Read C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md (or locate plan under store/docs if B placed it there), backlog.json, c-baseline.md if available and previous C/B reports. You are not alone; no reverting others changes. Follow root/store AGENTS, actual migrated .claude primitives/templates/skills, run pre-flight first. Own only files B task permits. PROTECTED: app/routes/studio.`$productId.tsx, api.studio-token.ts, account.downloads.tsx, app/lib/__tests__/download-routes.test.ts, existing auth/purchases/R2/backend/config/env/settings. Do not expose purchased URLs. New /studio-lab uses shared real app workspace with demo-only assets and no auth requirement. Preserve existing Studio while protected route belongs to other agent. No iframe/static prototype replacement. Real audio scheduling/editing/export, no fake successes. ORCHESTRATOR OVERRIDE: Test server already running http://127.0.0.1:5173. Use this port instead of B task 5183; do not start duplicate or stop it. Any browser use via gstack /browse, own state file under tmp/studio-real-loop/a-browse.json. No commits/push/deploy, permission bypass, installs, deleting tests/files. Apply the /check skill with Biome scoped to exact owned paths as B requires (do not rewrite protected files). Run typecheck, build, relevant tests; root performs final repository-wide gate. For 3+ file changes invoke actual code-reviewer subagent and address findings; do not merely claim a review. Architecture notes are proposals for B/root, not in-round refactor instructions: report them, never extract outside ownership. Preserve user's configured advisor. Report actually run results and unresolved failures. Write tmp/studio-real-loop/a-round-$round.md with changed files, tests, known gaps, exact next C checks, scope completed; only mark B acceptance criteria you truly passed. Return concise summary. Do not self-mark whole backlog complete.
"@ | Set-Content -LiteralPath "$taskRoot/a-round-$round-prompt.txt" -Encoding utf8
    Invoke-LoopAgent 'studio-implementer' "$taskRoot/a-round-$round-prompt.txt" "$taskRoot/a-round-$round-result.json" -Implementation
    }
    if ($round -gt $StartRound -or $StartPhase -ne 'B') {
    Set-LoopStatus 'C_VERIFYING' $round 'Independent Studio product verifier testing A work.'
    @"
You are C. Independently verify A round $round. Read current-task.md, a-round-$round.md, plan.md/backlog and prior reports in tmp/studio-real-loop. Understand Studio user flow find sound -> add -> fit video -> actual export. Compare actual behavior with B criteria, user FB-01..FB-16 and Ableton source docs; don't invent scores or unverified passes. REAL browser interaction via gstack /browse, own state file c-browse.json, target http://127.0.0.1:5173/studio-lab. New incognito context no credentials should open demo page; test that premium auth is NOT bypassed. Test at 1280x720 and 1440x900 when relevant. Measure real audio graph/output, source timing, video transport, export WAV data/duration/sample integrity, not just pixels. Use small synthetic/generated demo or owned test media, never upload private videos externally. Source read-only; own tmp/studio-real-loop/c-round-$round.md, screenshots/tests under tmp/studio-real-loop/c-round-$round/, and c-round-$round.json. JSON schema: {"taskStatus":"PASS|FAIL|BLOCKED","bugs":[{"id":"...","severity":"critical|high|medium|low","steps":["..."],"expected":"...","actual":"...","evidence":"..."}],"passed":["acceptance-id"],"blocked":["reason"]}. No app edits, no commits/deploy, no settings/security changes; browser side effects limited demo local state. Re-run meaningful tests and build if relevant; do not trust A claims. Missing functionality is not PASSED. Return findings to B through your artifacts, no direct implementation.
"@ | Set-Content -LiteralPath "$taskRoot/c-round-$round-prompt.txt" -Encoding utf8
    Invoke-LoopAgent 'studio-product-verifier' "$taskRoot/c-round-$round-prompt.txt" "$taskRoot/c-round-$round-result.json"
    }
    Set-LoopStatus 'B_PLANNING_NEXT' $round 'B converts C findings to next bounded implementation task.'
    @"
You are B. Read current-task.md, a-round-$round.md, c-round-$round.md and c-round-$round.json, backlog.json and initial full plan. You own only planning artifacts, not app source. Preserve previous task as tasks/round-$round.md (copy, don't delete). Update backlog ONLY from independently evidenced C acceptance results. Write next current-task.md targeting C bugs first, then next dependency-ordered unimplemented scope from full original backlog FB-01..FB-16 and prototype flows. Keep exact file ownership, protected auth files, meaningful test criteria, real audio/video behavior, demo-only public /studio-lab. Do not shrink scope or label feature requests deferred without user authorization; professional plugins/effects/pitch/multi-video-layer explicitly out of scope and grid tempo is not audio stretch. Write b-round-$round.md and b-next.json with {"decision":"CONTINUE|COMPLETE|BLOCKED","reason":"...","nextTask":"...","remaining":["ids"]}. COMPLETE only when ALL scoped features have evidence of working, C no unresolved critical/high bugs, build/typecheck/check/tests pass, purchase protection preserved, reusable real Store workspace opens anonymously. For uncertain UI contracts choose the smallest honest behavior consistent with user request, record rationale. BLOCKED only for external missing info/approval/credentials required; don't claim blocked merely because implementation is large. Record reviewer Architecture notes as backlog signals, not automatically scheduled tasks. At a feature boundary or accumulated risk on one owner, request a bounded frontend-architect checkpoint from root; do not indefinitely delay independent core features for low-priority polish. Return concise task summary.
"@ | Set-Content -LiteralPath "$taskRoot/b-round-$round-prompt.txt" -Encoding utf8
    Invoke-LoopAgent 'studio-task-writer' "$taskRoot/b-round-$round-prompt.txt" "$taskRoot/b-round-$round-result.json"
    $decision = Get-Content -LiteralPath "$taskRoot/b-next.json" -Raw | ConvertFrom-Json
    if ($decision.decision -eq 'COMPLETE') { Set-LoopStatus 'AWAITING_ROOT_VERIFICATION' $round 'B/C acceptance complete; root must independently verify final result.'; exit 0 }
    if ($decision.decision -eq 'BLOCKED') { Set-LoopStatus 'NEEDS_ATTENTION' $round $decision.reason; exit 0 }
}
Set-LoopStatus 'ROUND_LIMIT_REACHED' $RoundLimit 'Continue with further bounded rounds after reviewing progress; incomplete, not successful.'


