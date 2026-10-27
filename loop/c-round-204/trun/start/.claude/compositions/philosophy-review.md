# Philosophy review

Use this workflow only when the user requests a philosophical/product review. Do not run all roles for every code change.

1. Establish the concrete decision and inspect relevant code or interactions.
2. Select at most two lenses for the first pass:
   - flow-sage: unnecessary actions and interruptions.
   - first-visit-host: first-use comprehension.
   - relational-architect: collaboration, attribution and control.
   - design-philosopher: premium experience and brand fit.
3. Obtain independent reviews where agent delegation is authorized; otherwise read the role files and explicitly label the analysis as sequential perspectives from one assistant.
4. Use polyphony-conductor to preserve evidence, disagreements and user-specific needs.
5. Use consequence-tester to choose one falsifiable experiment.
6. Return a recommendation and the remaining uncertainty. Implementation is a separate user-authorized action.

All role definitions are in .claude/agents/ and share .claude/references/philosophy-review-contract.md. Codex can read these same files as role instructions; this is not a claim that Claude's agent frontmatter registers native Codex subagents.

Example request: Review the first Studio visit using flow-sage and first-visit-host; synthesize with polyphony-conductor and propose one consequence-tester experiment.
