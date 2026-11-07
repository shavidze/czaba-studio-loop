# Mandatory: Read Primitives Before Writing Code

BEFORE writing or editing ANY code, you MUST:

1. Identify which primitives apply using this table
2. Read each matching primitive file with the Read tool
3. Only then start writing code

## Project-local reminder

`.claude/settings.json` registers `.claude/hooks/inject-primitives.mjs` for Edit/Write. It resolves `.claude/primitives-map.json` in the active repository and injects the matching reference paths. Missing mapped files block the edit. No global hook installation is required.

The reminder is not proof that the agent read or followed a primitive, and does not intercept shell writes or other assistants. All assistants must read the matched files before editing. CI checks reference integrity independently.

## Trigger Table

| Changing... | Read primitive |
|-------------|---------------|
| Any new export (function, hook, component, type) — naming | `AGENT_DISCOVERABLE_CODE.md` |
| Component (new or existing) | `FORWARDREF_COMPONENT.md` |
| Styles, colors, spacing | `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md` |
| Context, state management | `REACT_CONTEXT.md` |
| Audio, playback, Studio/DAW | `AUDIO_ARCHITECTURE.md` |
| API call, backend integration | `API_ERROR_HANDLING.md` |
| Loading states, skeleton | `SKELETON_LOADING.md` |
| Error handling, error codes | `ERROR_TAXONOMY.md` |
| Documentation | `GEORGIAN_DOCS.md` |
| Git commit | `GIT_RULES.md` |
| New component (scaffold) | use `prompts/new-component.md` |
| New route/page | use `prompts/new-route.md` |
| New context | use `prompts/new-context.md` |
| New hook | use `prompts/new-hook.md` |
| New service | use `prompts/new-service.md` |
| Studio feature | use `prompts/studio-feature.md` |
| Full feature (multi-file) | use `compositions/new-feature.md` |
| Security review, auth changes | `SECURITY_AUDIT.md` |
| Test creation, CI pipeline | `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` |

## After Writing Code

1. **Self-check** — კოდის ჩაწერის შემდეგ, `/check`-მდე გადაამოწმე:
   - Edge cases: null, undefined, empty arrays, missing props
   - Security: XSS, token exposure, unsanitized user input
   - Primitive compliance: ემთხვევა წაკითხულ primitive-ს?
2. Run `/check` command before committing
3. If 3+ files changed, run `code-reviewer` agent

## No Exceptions

"Small fix" is not an excuse to skip primitives. The table above applies to ALL changes.
