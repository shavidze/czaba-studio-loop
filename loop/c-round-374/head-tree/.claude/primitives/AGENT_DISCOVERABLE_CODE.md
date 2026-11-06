# AGENT_DISCOVERABLE_CODE

## რატომ

AI აგენტები (Claude Code-ის ჩათვლით) კოდში ნავიგაციისას იყენებენ ტექსტურ
ძებნას (`ripgrep`/`grep`), არა კომპილერს ან language server-ს. აგენტი
პასუხს პოულობს იმით, რასაც სახელი ეუბნება — ბუნდოვანი სახელი დამატებით
ტურებს, არასწორ ვარაუდებს და ტოკენების ფლანგვას ნიშნავს. წყარო:
[Writing Code for Agents](C:\Apps\wikis\writing-code-for-agents-ka.md).

## წესები

### 1. სახელები — 2-3 სიტყვა, ერთი დომენური ტერმინი

- ❌ `create`, `handleClick`, `data`, `Result`, `Config`, `Utils`
- ✅ `createStripeCheckoutSession`, `handleAddToCartClick`, `useProductFilters`

გაზომილი მონაცემი (დიდი TS მონორეპო): 1 სიტყვა → ~61% უნიკალურობა ცალკე
definition-ზე, 2 სიტყვა → ~88%, 3+ სიტყვა → 96-98%. სამ სიტყვაზე ნაკლები
სახელი თითქმის ყოველთვის multi-hit ძებნას გამოიწვევს. ეხება: exported
functions, hooks, components, types/interfaces, services.

### 2. ერთი კონცეფცია — ერთი ტერმინი

`orgId` vs `organizationId`, `cartItem` vs `lineItem` — ორივე ვარიანტი
ცალკე ძებნას საჭიროებს, თუნდაც ლოკალური import alias-ით. აირჩიე ერთი
ტერმინი, გამოიყენე ყველგან.

### 3. `any` ისეთივე ცუდია, როგორც ცუდი სახელი — უარესი

`data: any`-ს არაფერი აქვს სათქმელი აგენტისთვის; ცუდ სახელსაც მაინც შეუძლია
კვალი დატოვოს. `TypeScript strict` (root `CLAUDE.md`) უკვე კრძალავს `any`-ს
და `@ts-ignore`-ს — ეს იმავე მიზეზის კიდევ ერთი მხარეა.

### 4. პარამეტრების არევის თავიდან აცილება

```ts
// ❌ სამივე string, ადვილად აირევა გამოძახებისას
function transferCartOwnership(userId: string, sessionId: string, cartId: string) {}

// ✅ named object ახალი ფუნქციებისთვის 3+ ერთტიპიან პარამეტრზე
function transferCartOwnership(params: TransferCartOwnershipParams) {}
```

### 5. მოძველებული — `@deprecated` JSDoc, არა ჩუმად დატოვება

```ts
/** @deprecated გამოიყენე useProductFilters — წაიშლება შემდეგ major-ზე */
export function useLegacyProductFilters() { /* ... */ }
```

ეს ერთადერთი გამონაკლისია "no comments" წესიდან (`@deprecated` = TODO-ს
დონის ტექნიკური მარკერი, არა ახსნა). IDE/TS ხედავს და strikethrough-ს
უსვამს ყველა გამოძახებას — აგენტი ვერ გამოტოვებს ისე, როგორც უბრალო
inline კომენტარს შეეძლო. თუ საერთოდ აღარ გჭირდება — წაშალე.

### 6. Barrel ფაილები მალავს რეალურ სახელს

`export * from './hooks'` შლის რეექსპორტის კვალს — აგენტი იძულებულია
დამატებითი hop გააკეთოს განსაზღვრებამდე მისასვლელად. თუ ბარელი გჭირდება,
გამოიყენე named re-export (`export { useProductFilters } from
'./hooks/useProductFilters'`), არა `export *`.

### 7. ტესტის სახელი = წყაროს სახელი

`useProductFilters.test.ts` ტესტავს `useProductFilters.ts`-ს — არა
`ProductFilters.test.ts`.

### 8. არაცხადი ქცევა → `docs/technical/`, არა inline კომენტარი

პროექტის წესი "კომენტარები არ მჭირდება" (გამონაკლისი: TODO, ქართული
კონტექსტი) არ იცვლება. მაგრამ თუ hook/service განზრახ არ აკეთებს იმას,
რასაც სახელი ვარაუდობს (მაგ. `clearCart` არ შლის server-side session-ს,
მხოლოდ local state-ს) — ეს ჩაწერეთ `docs/technical/`-ში, არა კომენტარად.
წინააღმდეგ შემთხვევაში აგენტი მთელ ბიუჯეტს დახარჯავს "ეს არ არსებობს"
დასკვნამდე მისვლისას.

## მაგალითი

```ts
// ❌ ცუდი დისკავერაბილითი
export function process(data: any) { /* ... */ }

// ✅ კარგი დისკავერაბილითი
export function calculateCartTotalWithDiscount(
  items: CartItem[],
  coupon: AppliedCoupon,
): CartTotal { /* ... */ }
```

## როდის გამოვიყენო

ნებისმიერი ახალი export-ის (function/hook/component/type) სახელის
არჩევისას. არსებული კოდის მასობრივი rename ამ primitive-ის ფარგლებში არ
შედის — surgical changes rule (root `CLAUDE.md`) პრიორიტეტულია.
