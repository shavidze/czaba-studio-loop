# product-designer consult, round 505 planning (stage 2d), verbatim final answer

I read all six files read-only and edited nothing. My rulings below come from the code. I did not take my own browser measurements; I used the numbers you measured at HEAD.

## Q3 Send button

**Choice: (A) `IconButton variant="brand" size="md"` with a 20px `Send` icon, plus a small grant on IconButton.tsx.**
- **Why A:** DESIGN_SYSTEM.md line 883 already says IconButton is for icon-only actions and Button is for text plus icon. Item 7 means "use the system's component", and here that component is IconButton. At 40×40 it lines up exactly with the 40px textarea, so the controls sit level. Its `rounded-lg` also matches the textarea.
- **Rejected (B), Button with an icon child:** it comes out as a 48×36 rectangle next to a 40px field, with uneven edges and a heavier look. That breaks the rule in line 883.
- **Rejected (C), leave it hand-rolled:** it keeps the bug where the disabled button still brightens on hover, and it leaves a component with 0 importers.
- **Grant on IconButton.tsx:** remove `hover:shadow-glow` (retired) and `active:scale-95` from the brand variant. The global 0.98 press already exists, and two press sizes break consistency (Nielsen). Then drop IconButton.tsx from the allow-list in store-glow-shadow.test.ts. If the test needs an entry, the new reason is "glow removed R505". ChatInput.tsx stays glow-free.
- **Keep `title={label}`.** The tooltip is the right place for this per the screen-budget rule, and Chromium does not announce a description that matches the name.
- **Disabled when empty:** `pointer-events-none` removes the hover, so the button reads as inert, which is correct. The missing not-allowed cursor stays recorded as PD-R504-DISABLED-NO-REASON. No new tooltip.
- **Reference:** I did not verify Intercom, Zendesk or Crisp in this pass. From memory, messengers commonly use a square or round icon-only send button that is dimmed or hidden when the field is empty, but that is unconfirmed.

## Q4 "Start Chat"

**Choice: `<Button type="submit" size="lg" fullWidth>`, default shape (`rounded-md`).**
- **Why lg:** height goes from 50 to 48px and the 16px/600 text is unchanged. This matches the 2c precedent (purchase card uses `lg`, 8px). It is the main action of the card, at the bottom, full-width, so a large target is right (Fitts).
- **Rejected md:** 40px and 14px text visibly shrinks the only action and makes the button change size during the migration.
- **Rejected pill:** this is a form submit, and the shape table says 8px for form submits.
- **Docs:** add GuestForm "Start Chat" (`lg`, `fullWidth`) and ChatInput Send (IconButton `brand` `md`) to the DESIGN_SYSTEM shape table.

## (i) Focus after Send and after the session starts: in scope

Both fixes are cheap and sit in files this round touches. The loss of focus is a WCAG 2.4.3 problem: a keyboard user lands on BODY and loses their place.
- **After a button send:** move focus to the message textarea ("Type a message...") through a ref in `handleSubmit`. Pressing Enter in the textarea already keeps focus there; leave that unchanged.
- **After "Start Chat" succeeds:** move focus to the same textarea.
  - Only do this when the window switches from GuestForm to ChatInput, for example with a prop like `focusOnMount` that ChatWindow sets after `onGuestSubmit`.
  - Never focus on the first page load for a session that already exists. That would steal focus and scroll /support.
- **Reference:** Not verified for Intercom, Zendesk or Crisp. Keeping focus in the composer after sending is common messenger behaviour, but unconfirmed.
- **Deferred Low (B-R505-CHAT-TEXTAREA-NO-LABEL):** the textarea's only accessible name comes from its placeholder. Adding `aria-label="Message"` should come in a later round.

## (ii) `noValidate`: defer as Low (B-R505-GUESTFORM-NATIVE-VALIDATION)

Adding only `noValidate` would make things worse for screen-reader users. The native bubble is announced. The styled error is not tied to its field: there is no `aria-invalid`, no `aria-describedby`, and focus does not move to the first invalid field.

The proper fix is `noValidate` plus those three pieces, as one GuestForm form-accessibility change. That is form work, not item 7.

## C acceptance rows

| # | Who / action | Observable result |
|---|---|---|
| 1 | Anonymous user, /support at 1440, 1280 and 375 | "Start Chat" is 48px tall, full-width, 8px corners, brass background, 16px/600 text; hover turns brass-hover; keyboard focus shows the brass ring |
| 2 | Session started, field empty | Send is 40×40 with 8px corners, opacity 0.5; hovering does not change its colour; its bottom edge lines up with the textarea's |
| 3 | Type "hi" and click Send with the mouse | Message is sent, field is cleared, focus is on the textarea (not BODY), Send returns to its dimmed state |
| 4 | Keyboard: Tab to Send, press Enter | Same as row 3; focus is on the textarea |
| 5 | Keyboard: fill Name and Email, submit "Start Chat" | ChatInput appears with focus on the textarea; reloading /support with a session already open does not auto-focus |
| 6 | Code check | ChatInput.tsx and GuestForm.tsx have no `<button` tag; IconButton.tsx has no `shadow-glow` or `active:scale-95`; the glow test passes with the updated allow-list |

Relevant files:
- /home/runner/czaba-project/store/app/components/chat/ChatInput.tsx
- /home/runner/czaba-project/store/app/components/chat/GuestForm.tsx
- /home/runner/czaba-project/store/app/components/chat/ChatWindow.tsx
- /home/runner/czaba-project/store/app/components/ui/IconButton.tsx
- /home/runner/czaba-project/store/docs/design/DESIGN_SYSTEM.md