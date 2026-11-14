# Code review, round 506 (code-reviewer subagent, agentId a6d96c7c693ef4bca)
Input: a-round-506/diff-vs-d6903a7.patch.txt plus the 2 untracked files. Score 9/10. Critical/High/Medium: none.
Lows:
- CR-1: the barrel import pulls in Toast.tsx (`useToast` from `~/hooks`) and Modal.tsx; the 2e test and store-lead-magnet-dialog mock `~/hooks` with only useScrollLock/useLeadMagnet. This works today because no missing export is used at load time; a future barrel module that reads a `~/hooks` export at load would break both. Suggested fix: spread `vi.importActual('~/hooks')`. Tied to pre-ruled Low #5 (barrel).
- CR-2 (confirmation): ST5 drops the LeadMagnet expectDarkTextOnFill; dark text on brand is still covered via primaryTokens (l.687-693).
- CR-3: B2E-2 bg-brand / no bg-destructive repeat the exact-string check (= pre-ruled Low #1).
- CR-4: doc 327 l.4 mixes "In Progress" and "C round 506 PASS" (= the L28 multi-stage form B pinned; pre-ruled Low #3).
Behaviour confirmed by reading: focus on open Close (l.149 untouched); email field after FREE DOWNLOAD / failed submit (effects l.54-72 untouched); backToSiteButtonRef forwarded (Button.tsx:102,121); explicit type reaches DOM (props spread last, Button.tsx:131); disabled native, trap query unchanged; no isLoading.
Architecture note: none, keep as is (no new state/effects/ownership; shared Button lowers coupling).
