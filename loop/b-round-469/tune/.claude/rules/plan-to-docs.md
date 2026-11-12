# Plan Documentation Rule

When exiting `/plan` mode after user approval:

1. **Before starting implementation**, save the approved plan to `docs/plans/{year}/quarter-{I|II|III|IV}/`
   - კვარტალები: I (იან-მარ), II (აპრ-ივნ), III (ივლ-სექ), IV (ოქტ-დეკ)
2. File naming: `{NNN}-{short-description}.md` (e.g., `002-wishlist-feature.md`)
3. Number sequentially based on existing files in the current quarter folder
4. Include these sections in the plan file:
   - **Status**: Approved / In Progress / Completed
   - **Priority**: High / Medium / Low
   - **Created**: date
   - **Context**: why this change is needed
   - **Approach**: what will be done
   - **Key Files**: files to create/modify/delete
   - **Verification**: how to test

5. Update the plan status to "In Progress" when starting implementation
6. Update the plan status to "Completed" when done

This ensures every significant change is documented before execution.
