# Studio Lab — Export dialog opener-ს layout ფაზაში იმახსოვრებს; Tab-ის wrap `[hidden]` კონტროლებს გამოტოვებს

**თარიღი:** 2026-10-15
**სტატუსი:** Completed — Round 46 C PASS (`c-round-46.md`), commit `d2f6715`; D-29z11
**შეცვლილი პროექტი:** Store

## კონტექსტი

**EXPORT-DIALOG-FOCUS-RESTORE** (Low, `checkpoint-oct13-review.md`-ის მე-6 რჩევა). `ArrangementExportDialog.tsx`-ს ორი ხარვეზი ჰქონდა:

- **Opener-ის დამახსოვრება passive effect-ში.** dialog-ის გახსნისას opener (`document.activeElement`) passive `useEffect`-ში იკითხებოდა. passive effect-ები commit-ის **ყველა** layout effect-ის შემდეგ სრულდება. თუ იმავე commit-ში რომელიმე layout effect focus-ს სხვაგან გადაიტანდა (dialog-ის შემდეგ დარენდერებული sibling, მომავალი toolbar, third-party widget), dialog ამ ელემენტს დაიმახსოვრებდა და დახურვისას focus არასწორ ადგილას დაბრუნდებოდა. B-ის probe (`tmp/studio-real-loop/b-round-45/order-probe.cjs`, React 18.3.1 + jsdom): passive capture-ი, რომელსაც მოსდევს decoy-ის focus-ის მქონე `useLayoutEffect`, ხედავს **`decoy`-ს**, ხოლო იგივე capture layout effect-ად — **`opener`-ს**.
- **Tab-ის wrap და `[hidden]`.** `exportDialogFocusableElements` მხოლოდ `:disabled`-ს ფილტრავდა. `[hidden]` subtree-ში მოთავსებული focusable კონტროლი Tab-ის wrap-ის პირველი ან ბოლო სამიზნე გახდებოდა და focus უხილავ კონტროლზე გადავიდოდა. **დღეს dialog-ში დამალული არაფერია**, ამიტომ ეს ნაწილი მხოლოდ unit ტესტით მოწმდება (იგივე კლასი, რაც DOC034-UNREACHABLE-NOTE).

## მიდგომა

- **Opener-ის capture layout ფაზაშია.** მხოლოდ opener-ის effect-ის იდენტიფიკატორი შეიცვალა: `useEffect` → `useIsomorphicLayoutEffect`. callback-ი და `[isOpen]` ბაიტ-იდენტურია. layout effect ყოველთვის passive effect-ებამდე სრულდება, ამიტომ capture ხედავს რეალურ opener-ს, სანამ dialog focus-ს `დახურვა`-ზე გადაიტანს, და dialog-ის **შემდეგ** დარენდერებული layout effect-ები მას ვეღარ შეცვლის. layout effect-ები tree-ის რიგით სრულდება: dialog-მდე დარენდერებული layout effect, რომელიც focus-ს გადაიტანს, capture-მდე შესრულდება. ეს შემთხვევა კონტრაქტის გარეთაა (C-ის mutation (f)).
- **Cleanup-იც (restore) layout ფაზაში გადავიდა.** restore ახლა დახურვის commit-ის layout ფაზაში სრულდება და არა passive-ში. opener dialog-ის გარეთაა და ისევ connected-ია, ამიტომ `focus()` იქაც მუშაობს; დახურვის commit-ი dialog-ს ჯერ შლის, ამიტომ focus dialog-ის შიგნით აღარაფერზე რჩება. `isConnected` და `:disabled` შემოწმებები უცვლელია.
- **დანარჩენი ორი effect passive რჩება.** focus-to-close (`დახურვა`-ზე ან trap-ზე) და Tab-trap-ის listener ისევ `useEffect`-ია. მათი გადატანა non-goal-ია: focus-to-close-ს თუ layout-ში გადავიტანთ, ის dialog-ის შემდეგ დარენდერებული layout effect-ის **წინ** შესრულდება და გახსნისას focus-ს ის effect წაართმევს (mutation (e) ამას ამტკიცებს, FR4 ვარდება).
- **რატომ `useIsomorphicLayoutEffect` და არა `useLayoutEffect`.** `StudioWorkspace` dialog-ს ყოველთვის რენდერავს (`isOpen={false}`-ითაც), ამიტომ მისი hook-ები სერვერზეც სრულდება. bare `useLayoutEffect` მე-8 SSR გაფრთხილება იქნებოდა (round 45-ის SSR1 ზუსტად 1 frame-ს აჩვენებდა, `ArrangementExportDialog`). hook ბილიკით იმპორტდება (`~/hooks/useIsomorphicLayoutEffect`), round 45-ის precedent-ით; `app/hooks/index.ts` არ შეცვლილა.
- **`closest('[hidden]')`, არა layout-ზე დამოკიდებული შემოწმება.** filter-ს დაემატა ერთი პირობა: ელემენტი გამოიტოვება, თუ `element.closest('[hidden]')` არ არის `null`. ეს ფარავს როგორც ელემენტის საკუთარ `hidden` ატრიბუტს, ისე ნებისმიერ დამალულ წინაპარს. `offsetParent`, `getClientRects` და computed style არ გამოიყენება — jsdom-ს layout არ აქვს და ტესტისა და ბრაუზერის შედეგი განსხვავდებოდა. იგივე ფუნქციას იყენებს focus-to-close-ის შემოწმებაც და Tab handler-იც; ორივე filter-ს იღებს, ეს განზრახულია.

### ცნობილი შეზღუდვები

- **`inert`** და კლასებით მიღებული **CSS `display:none`** ამ კონტრაქტში არ შედის — filter მხოლოდ `[hidden]` ატრიბუტს ხედავს.
- **`aria-hidden`** focus-ის რიგიდან ელემენტს არ იღებს (მხოლოდ assistive technology-სგან მალავს), ამიტომ განზრახ არ ფილტრდება.
- **React-ის commit-ის selection restore (A-R46-RESTORE-SELECTION).** restore სწორად მუშაობს, რადგან დახურვამდე focus ჩვეულებრივ dialog-ის შიგნითაა და ის commit-ში იშლება. თუ dialog-ის გახსნის **შემდეგ** focus dialog-ის გარეთ, connected ელემენტზე გადავიდოდა, ReactDOM-ის `resetAfterCommit` → `restoreSelection` layout-ფაზის restore-ის შემდეგ focus-ს იმ ელემენტს დაუბრუნებს (snapshot-ის passive restore-ის დროს focus opener-ზე ბრუნდებოდა). focus `body`-ზე (მაგ. blur) ამას არ იწვევს — opener იღებს focus-ს. UI-დან ეს მდგომარეობა დღეს მიუღწეველია: backdrop pointer-ს ბლოკავს, Tab-trap focus-ს dialog-ში აჩერებს, workspace-ის `focus()` გამოძახებები dialog-ის ღიაობისას არ სრულდება (`ArrangementLibrary`-ის `requestAnimationFrame` focus-ს ბიბლიოთეკის კონტროლის keydown იწვევს, `ArrangementVideoDock`-ისას — floating ვიდეოს მდგომარეობის ცვლილება, ისიც მხოლოდ მაშინ, როცა focus `body`-ზეა). code-reviewer-ის ალტერნატივა B-სთვის: capture layout-ში ref-ში, restore — passive cleanup-ში. მტკიცებულება: `tmp/studio-real-loop/a-round-46/probe/restore-selection-probe.txt`.

## არქიტექტურა

```mermaid
sequenceDiagram
  participant U as მომხმარებელი
  participant D as ArrangementExportDialog
  participant S as შემდეგი sibling (layout effect)
  U->>D: opener.focus() + click (isOpen=true)
  Note over D: layout: capture → opener
  S->>S: layout: focus სხვაგან (decoy)
  Note over D: passive: focus-to-close → დახურვა
  U->>D: დახურვა / Esc / ✕ (isOpen=false)
  Note over D: dialog წაიშალა; layout cleanup → opener.focus()
```

## შეცვლილი ფაილები

- `app/components/arrangement/ArrangementExportDialog.tsx` — ერთი import ხაზი, opener-ის effect-ის იდენტიფიკატორი, filter-ის ერთი პირობა.
- `app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx` — ახალი; FR1–FR4 და HD1–HD3 (19-case `export-dialog-focus.test.tsx` ბაიტ-იდენტური რჩება).
- `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` — მხოლოდ l.4 (სტატუსი, DOC036-STATUS-LINE).
- `docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md` — მხოლოდ l.4 (სტატუსი, DOC042-STATUS-LINE).
- ეს doc.

## პრობლემები და გადაწყვეტები

- **Problem:** red run-ი სწორი მიზეზით უნდა ყოფილიყო წითელი, არა „focus არსად“. → **Solution:** harness-ში რიგი ფიქსირებულია: opener და decoy → dialog → `FocusThief` (dialog-ის **შემდეგ**). FR1/FR2-ის red diff-ი ასახელებს `data-testid="decoy"`-ს.
- **Problem:** B-ის მოლოდინი C-ის mutation (f)-ზე („thief dialog-მდე → FR1/FR2 snapshot-ზეც მწვანე“) არ დადასტურდა. → **Solution:** გაზომვით: thief dialog-მდე FR1/FR2-ს წითლად ტოვებს **snapshot-ზეც და ახალ კოდზეც** — passive capture ყოველთვის ყველა layout effect-ის შემდეგაა, ხოლო layout capture thief-ის შემდეგ სრულდება. რიგი green run-ის საზრისს განსაზღვრავს (thief dialog-ის შემდეგ = layout capture-ს შეუძლია მოასწროს). დეტალები B/C-სთვის `a-round-46.md`-შია.
- **Problem:** mutation (e)-ში FR2 მოულოდნელად ჩავარდა, თუმცა restore opener-ს focus-ს აძლევდა. → **Solution:** probe-მა აჩვენა `restoreSelection < resetAfterCommit` — focus გახსნისას decoy-ზე დარჩა და დახურვის commit-მა ის დააბრუნა. ეს არის ზემოთ აღწერილი A-R46-RESTORE-SELECTION შეზღუდვა.

## ტესტირება

- **Red** (ხელშეუხებელი წყარო, sha `89bc8e06`): FR1, FR2 წითელი (`decoy`), HD1–HD3 წითელი (Tab/Shift+Tab არ არის `defaultPrevented`); FR3, FR4 მწვანე. **Green:** 7/7; `export-dialog-focus` 19/19, `ssr-layout-effect` 4/4 (SSR1 = 0), `useIsomorphicLayoutEffect` 2/2.
- **Mutation-ები** (scratch ასლი `store/`-ის გარეთ): (a) capture ისევ `useEffect` → FR1, FR2; (b) `[hidden]` პირობა წაშლილი → HD1, HD2, HD3; (c) bare `useLayoutEffect` → SSR1 (ზუსტად 1, `ArrangementExportDialog`); (d) `hasAttribute('hidden')` → HD1, HD2; (e) focus-to-close layout-ში → FR4 (ასევე FR1 გახსნის შემოწმებაზე და FR2 commit-ის selection restore-ით).
- დეტალები და gates: `tmp/studio-real-loop/a-round-46.md`, `a-round-46/`.
- C-ის ID-ები: R46-S, R46-U, R46-FOCUS, R46-SSR, R46-REG, R46-Doc, G46-1…G46-3.

## Ableton-თან კავშირი

ამ რაუნდში Live-ის ქცევა არ მონაწილეობს; ახალი წყარო და ვიდეო არ გამოყენებულა.

| ქცევა | Ableton-ის წყარო | იქ დადასტურებული | CZABA-ს გადაწყვეტილება / განსხვავება | C-ის შემოწმება |
|---|---|---|---|---|
| Export dialog-ის დახურვა keyboard focus-ს opener-ს უბრუნებს, მაშინაც, თუ გახსნის commit-ში სხვა რამემ focus გადაიტანა | არ არის | **არ ეხება** (web dialog-ის accessibility CZABA-ს React UI-ში; კონტრაქტი CZABA-ს საკუთარია — C-R13-03 / D-29e, round 14; Live-ის ქცევად არ წარმოჩნდება) | D-29z11 §0.1 | R46-U, R46-FOCUS |
| Tab-ის wrap `[hidden]`-ის შიგნით მყოფ კონტროლებს გამოტოვებს | არ არის | **არ ეხება** (web a11y hygiene) | D-29z11 §0.2; დღეს მხოლოდ unit | R46-U |
| Doc-ების სტატუსი C-ის შედეგებს ემთხვევა | არ არის | **არ ეხება** | D-29z11 §0.3 | R46-Doc |

## TODO / შემდეგი ნაბიჯები

- round 47: SRW-14 ეტაპი 1 (FB-13) — grid model, Snap on/off ხილული მდგომარეობით და shortcut-ით, divisions, ჯერ clip move.
- B-სთვის: A-R46-RESTORE-SELECTION (Low/Info) — გადაწყვიტოს, საჭიროა თუ არა მომავალში restore-ის ქცევის დაზუსტება გახსნის შემდეგ გარეთ გადატანილი focus-ისთვის.
