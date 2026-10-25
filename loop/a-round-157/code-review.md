# Code-reviewer result — A round 157 (real `code-reviewer` subagent, read-only)

Score 9/10. No Critical, High or Medium findings.

1. Low, test gap: XU6 did not check the project radio's accessible name. **ADDRESSED:** added `expect(view.getByRole('radio', { name: PROJECT_TEXT })).toBe(project);` to XU6. The test is green.
2. Info: XU7's `not.toContain('s')` loop is redundant with the exact values. Kept (B's T3 asks for it).
3. Info: in ST-TP5, the `isTime && includes(seconds)` check is redundant. Kept.
4. Info: `StudioExportTimeBounds` has the same shape as the existing `StudioTimeRangeText` (strings.ts l.100). Kept, because S1 asked for a new small interface. Recorded for B.
5. Info: from the source, the font trim on /studio-lab is safe: no bold/semibold in arrangement, every mono span sets font-normal, and the root Header is hidden on /studio*. The browser rows FONT-INVENTORY and FONT-FAIL remain the real proof.

## Architecture note (verbatim, for B; not acted on)
Signal 2 (coupling/duplication): `strings.ts:547–581` (`studioTimeTextParts.export*`) and `strings.ts:59–64` (`studioExportStrings.projectScope/rangeScope/loopRangeNote/loopProjectNote`) now encode the same four sentence templates twice. Only ST-TP4 keeps them in step. `studioWorkspaceStrings` (l.590–597) avoids this by building its strings from the parts via `joinStudioTimeTextParts`. **Keep it for this round:** R2 forbids touching `studioExportStrings`, and `rangeScope(rangeLabel)` can't be built from parts without a signature change that existing tests pin. The cost is low. **Proposal for the planner** (pass it on verbatim; it is not a fix for this round): once ARCH-CHECKPOINT-V2 rules on the `StudioTimeTextPart` shape, run one bounded task that builds `projectScope`, `loopRangeNote` and `loopProjectNote` from the export builders. The task should also decide whether `rangeScope` should take `{ start, end, seconds }`. The exact-string tests at `strings.test.ts` l.209–225 and ST-TP4 stay as the guard.
