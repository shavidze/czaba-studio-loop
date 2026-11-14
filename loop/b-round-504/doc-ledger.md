# Doc 326 ledger (L26, RETRO 495): every declarative sentence → evidence

Doc: `docs/implementation/2026/quarter-IV/326-dpg-button-cleanup-stage-2d.md`, sketch v3. Probe evidence is in `probe/` (head.out, sketch.out), and every row of it ran per input origin: mouse click, keyboard Tab+Enter, and Enter in the field. Claims are in `claims-505.sh`.

| Line | Sentence (short) | Evidence |
|---|---|---|
| 4 | status In Progress (stage 2d; C round 505 PASS) | L28 contract, pre-ruled Low #4 [K17] |
| 9 | stages 2a–2c = docs 320–322, 324, 325 | [K18] (docs 320–325 exist); 323 is the cart doc (round 503 ledger) |
| 9 | chat live only on /support → Live Chat → ChatWindow | [K3]; probe `live 1` rows |
| 11 | ChatButton used only by ChatWidget; ChatWidget mounted by no route | [K4] (0 importers outside components/chat) |
| 16 | Start Chat = Button submit lg fullWidth, default 8px | B2D-1 (M1–M3); probe `start` radius 8px [C1] |
| 17 | Send = IconButton brand md, icon 20px, 40×40 = textarea 40px | B2D-3 (M9, M12); probe `sendEmpty` 40x40, svg 20x20, `form.h` 40 |
| 17 | DESIGN_SYSTEM: icon-only → IconButton | [K36] (DESIGN_SYSTEM l.883 row) |
| 18 | brand variant loses glow and active:scale-95; global 0.98 press applies | B2D-0, B2D-8 (M11); probe sendReady press `matrix(0.98…)`, opacity 1 (sketch.out); [K7] |
| 20 | HEAD: send click → field clears, button disabled, focus BODY | head.out `activeAfterClickSend` BODY ×3, `kbdAfter` BODY ×3 [K30] |
| 21 | HEAD: after Start Chat focus BODY | head.out `activeAfterStart` BODY ×3 [K30] |
| 22 | now focus → message field in both cases; Enter in field keeps focus | B2D-4 (M5), B2D-7 (M7, M8); sketch.out TEXTAREA ×3 each (mouse + keyboard origin) [K30]; B2D-5 "focus unchanged" (inference: handleKeyDown never touches focus) |
| 23 | focus only when opened with guest form; existing-session open → no change | B2D-7 third part (M7); signed-in probe rows `active` not TEXTAREA [K32] |
| 24 | async start: focus moved elsewhere in flight → not taken back (only from BODY) | B2D-9 (M15); probe `inflight` row stays on "Back to support options" |
| 25 | unchanged: validation texts, session/message API calls, support.tsx, ChatHeader | B2D-2 (M13), B2D-5 (M14); probe C5/C6 equal head/sketch [K31]; frozen check 1 (support.tsx, ChatHeader.tsx, client.ts frozen) |
| 27 | D1: 12→8 px, 50→48, padding 12/16→12/24, shadow-sm, press opacity 0.9 | head.out vs sketch.out `start` rows |
| 28 | D2: 36→40, icon 16→20, shadow-sm, title; radius stays 12px; press opacity 1, scale 0.98 | head.out vs sketch.out `sendEmpty`/`sendReady` rows |
| 29 | D3: empty Send inert, hover no colour; HEAD hover coloured, pointer cursor | sketch `sendEmptyHover` topIsButton false, bg rest; head topIsButton true, bg hover |
| 30 | D4: focus moves after send/start; signed-in open unchanged | [K30], [K32] |
| Arch | mermaid flow | ChatWindow/ChatInput source (K10, K11) |
| Files | 9 changed files and their purpose | `sketch-505.patch.txt` diffstat (`git apply --stat`) |
| Problems | Button has no twMerge | [K9] (Button.tsx builder joins classes; no cn/twMerge import: tech-lead review 1 answer 5) |
| Problems | IconButton glow + two token tests listed it as dead | [K16] HEAD `1 0 1 …5)` |
| Problems | focus lost on disabled button; fix in handleSubmit / ChatWindow | B2D-4, B2D-7, B2D-9 |
| Problems | backend absent → page.route stubs + hub aborted | probe header comment; CHAT-REAL-BACKEND |
| Testing | A/B/C artifacts | L28-style forward references (a-round-505, c-round-505), pre-ruled Low #4 |
| TODO | 2e, NONBRAND, ChatButton cleanup, GuestForm a11y, textarea name, Live Chat focus | backlog ids B-R505-* and DPG-FIX queue |

**Contradiction sweep:** open and deferred findings on the touched files (`backlog.json` grep for GuestForm, ChatInput, ChatWindow, IconButton, components/chat and support.tsx):
- **GATE453-L2-L3-INERT-GLOW-CLASSNAMES:** its IconButton half is removed by this round. It gets a note, and its ChatButton and GlobalPlayhead halves stay open.
- **B-R455-GS2-DEAD-LABELS-UNVERIFIED:** its IconButton label leaves GS2. It gets a note, and the ChatButton label stays.
- **B-R505-***: these are new and deferred.
- **B-R478-DEAD-LICENSE-LINK:** a note covers the support.tsx card.

No doc sentence contradicts an open finding.
