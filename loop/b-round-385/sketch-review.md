# Sketch review: round 386 (GATE384-M1 + A-R383-REVIEW-L1 + GATE384-L2)

- **Dispatched sketch:** `b-round-385/sketch-386.patch.txt`, sha256 `1cada6c7e1eda38c82a51001bc6e09dad0999fe93bb9dedbc5e9c13edc3a01ae` (5 files, +273/−27), against HEAD `7295618`.
- **First review:** `tech-lead`, on sha256 `5fd7eec2851771c7b683f291f88b3965db8dc5ab059be2d2f8349ac7b57b64e2` (4 files). The reviewer is `tech-lead` because `code-reviewer` is not on B's consult list (L58).
- **Delta review:** `tech-lead`, on sha256 `1cada6c7…a01ae`. Verdict: "delta is correct, new rows non-vacuous, no new Medium+".
- **Reviewed = dispatched:** yes. After the delta review there were no further edits; K13 pins the sha.

## Findings and rulings (first review)
| Id | Sev | Finding | Ruling |
|---|---|---|---|
| TL-R385-M1 | Medium | The video-audio path (`decodeVideoSourceAudio` → `requestSourcePeaks` callback, HEAD l.2848) had the same unguarded `syncPlayback` | **Fixed in sketch.** It calls `resyncAfterDecode(sourceId)`, and its deps swap `syncPlayback` for the helper. Row PW20, mutant MU-386-VIDEO-PATH-DIRECT |
| TL-R385-M2 | Medium | `applySchedule` is not all-or-nothing. A throw partway through `startPlan` can leave earlier sources sounding while the status says "Playback stopped" | **Ruled out of this round:** pre-existing and not caused by this patch. It becomes **GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK** (Medium), scheduled after the regression round. Scope: roll back inside `graph.client.ts` (stop and disconnect the started sources, disconnect master, rethrow), plus the "repeated throw on Play leaves `isPlaying` true" case. Delta reviewer: "I accept it" with that risk |
| TL-R385-L3 | Low | After a successful replay the failure text stayed | **Fixed in sketch.** The `startPlaybackAt` updater replaces `scheduleFailed` with `playingFrom`. EV11 asserts it; mutant MU-386-REPLAY-STATUS |
| TL-R385-L4 | Low | A later "N failed" load status can replace `scheduleFailed` | Accepted: both texts are true, and the later one is the newer fact. Deferred Low |
| TL-R385-L5 | Low | A preview of a placed, evicted source while playing does a full rebuild, then the preview stops it | Accepted (harmless). Deferred Low; no row |
| TL-R385-L6 | Low | A stale preview call pins and shows a status for an old-collection id | Not reachable in a browser (the collection is a module constant). EV12 proves that nothing is decoded or kept. Deferred Low |
| TL-R385-L7 | Low | The `mockImplementationOnce` once-queue can leak between tests, and EV11's export row did not prove the throw | **Fixed in sketch:** `applyScheduleMock.mockReset()` in both `beforeEach`; the export row asserts `isPlaying` false; PW20 asserts the call count +1 |
| TL-R385-L8 | Low | The catch discards the error (no diagnostic) | Accepted. The Studio has no client logging channel, and ERROR_TAXONOMY covers backend codes only. Deferred Low |

The **Architecture note** (TL-R385-ARCH: the all-or-nothing rule belongs in `graph.client.ts`, not in more call-site wrappers) is recorded as a signal and joined to GATE-B385-M2.

## Ordering matrix (L58, RETRO 369)
**Setup:** one operation is in flight, the re-decode of an evicted, placed source while playing. The first event (rows) is followed by a second event (columns).

**Events:**
- R: resolve
- J: reject
- T: resolve, then the resync throws
- C: collection change
- P: preview of the same id
- X: export joins
- S: Play/Stop toggle

7 × 7 = 49 cells. Each cell holds a row id or a ruled exclusion:
- **ex-1:** a promise settles once.
- **ex-2:** not browser-reachable (module-constant collection), and no new code path.
- **ex-3:** the existing contract is unchanged by this patch, covered by the named EV row.

| first \ second | R | J | T | C | P | X | S |
|---|---|---|---|---|---|---|---|
| **R** | ex-1 | ex-1 | ex-1 | EV7 | EV9 | EV5 | EV3 (while playing) |
| **J** | ex-1 | ex-1 | ex-1 | ex-2 | EV6 (row 1) | EV6 (row 2) | ex-3 EV6 |
| **T** | ex-1 | ex-1 | ex-1 | ex-2 | ex-3 EV9 (direct path) | EV11 (row 2) | EV11 (row 1, replay) |
| **C** | EV7 (aborted, no set) | ex-2 (same abort guard) | ex-2 (abort guard returns before resync) | ex-2 | EV12 | ex-2 | ex-2 |
| **P** | EV13 (row 1) | EV13 (row 2) | TL-R385-L5 (deferred) | TL-R385-L6 / EV12 | EV9 (row 2, supersede) | ex-3 EV5 (pins per owner) | ex-3 EV3 (Play clears the preview request) |
| **X** | EV5 | EV6 (row 2) | EV11 (row 2) | ex-2 | ex-3 EV5 | EV5 (row 3, replaced) | ex-3 EV5 |
| **S** | EV3 (row 1) | ex-3 EV6 | ex-3 (not playing: `syncPlayback` returns before scheduling) | ex-2 | ex-3 EV9 | ex-3 EV5 | ex-3 EV3 |

**Load path (first load, not a re-decode):** EV15. **Video-audio path:** PW20. **Dependency identity of the load effect:** EV14, killed by MU-386-UNSTABLE-RESYNC.

## Mutants (all run on the sketch; logs in `mutants/`)
| Mutant | Change | Red rows |
|---|---|---|
| MU-386-NO-CATCH | No try/catch in `resyncAfterDecode` | EV11 ×2, EV15, PW20 |
| MU-386-NO-OWNER-GUARD | Use the controller regardless of collection | EV12 |
| MU-386-CLICK-STOP | Restore the click-time stop in the deferred preview | EV13 ×2 |
| MU-386-LOAD-PATH-DIRECT | Load effect calls `syncPlayback` directly | EV15 |
| MU-386-VIDEO-PATH-DIRECT | Video audio calls `syncPlayback` directly | PW20 |
| MU-386-REPLAY-STATUS | Play does not replace `scheduleFailed` | EV11 (row 1) |
| MU-386-UNSTABLE-RESYNC | `resyncAfterDecode` deps gain `history` (a new identity every commit) | EV14 (plus 14 others) |

## Browser pre-check (B, HEAD :5173 vs sketch :5175, both viewports; `probe/`)
- **M1, `resync-throw.mjs`.** `AudioBufferSourceNode.start` is made to throw once, armed after Add, so it hits the post-decode resync.
  - HEAD: 1 `pageerror` "injected schedule failure", and the clock keeps running (00:03.151 → 00:03.953).
  - Sketch: 0 errors, the clock is frozen (01.622 = 01.622), the `scheduleFailed` text is shown, and Play replaces it with "Playing from …".
  - The `button[aria-label="Stop"]` count is not a playing signal: the transport Stop is always rendered. The clock is the signal.
- **L2 OK case, `preview-while-playing.mjs`.**
  - HEAD: the clock is frozen from the click (01.062 = 01.062).
  - Sketch: the clock runs during the decode (01.050 → 01.201), then stops when the preview starts (01.413 = 01.413). The preview starts in both.
- **L2 fail case** (`decodeAudioData` rejects once).
  - HEAD: the clock is frozen at the click and nothing plays.
  - Sketch: the timeline keeps playing (01.532 → 02.330) with the failure text "“Middle East — public preview” failed to load — details are in the library.".
  - An earlier attempt aborted `/middle-east.mp3` with `page.route` (1 request intercepted), but the preview still started. B did not determine why; the hypothesis, not verified, is a cache fallback in the public-preview fetch. The fault is therefore injected at `decodeAudioData`.
