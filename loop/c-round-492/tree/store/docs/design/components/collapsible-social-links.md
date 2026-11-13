# CollapsibleSocialLinks

კოლაფსირებადი სოციალური ლინკები — hover-ზე იშლება ანიმაციით.

## ფუნქციონალი

- საწყის მდგომარეობაში ჩანს მხოლოდ SocialIcon ღილაკი
- hover-ზე ანიმაციით იშლება 3 სოციალური ლინკი
- თითოეულ ლინკს აქვს ბრენდის ფერი hover-ზე

## სოციალური ქსელები

| ქსელი | აიქონი | Hover ფერი | Delay |
|-------|--------|------------|-------|
| Instagram | InstagramIcon | gradient (custom) | 0s |
| YouTube | YouTubeIcon | `#FF0000` | 0.05s |
| Facebook | FacebookIcon | `#1877F2` | 0.1s |

## სტრუქტურა

```
შეკუმშული:  [🌐]
გაშლილი:    [🌐] [📷] [▶️] [📘]
```

## სტილი

### Trigger ღილაკი
- **ზომა:** `w-10 h-10`
- **ფორმა:** `rounded-full`
- **ფონი:** `bg-surface/50`
- **ტექსტი:** `text-muted` → hover: `text-brand bg-surface`

### სოციალური ლინკები
- **ზომა:** `w-10 h-10`
- **ფორმა:** `rounded-full`
- **ფონი:** `bg-surface/50` → hover: `bg-surface`
- **ტექსტი:** `text-muted` → hover: ბრენდის ფერი

## ანიმაცია (Framer Motion)

### კონტეინერი
```
initial: { width: 0, opacity: 0 }
animate: { width: 'auto', opacity: 1 }
exit:    { width: 0, opacity: 0 }
duration: 0.3s, ease: [0.33, 1, 0.68, 1]
```

### ცალკეული ლინკი
```
initial: { scale: 0, opacity: 0 }
animate: { scale: 1, opacity: 1 }
exit:    { scale: 0, opacity: 0 }
duration: 0.2s, staggered delay
```

## გამოყენება

```tsx
import { CollapsibleSocialLinks } from '~/components/ui/CollapsibleSocialLinks';

// Header-ში ან Footer-ში
<CollapsibleSocialLinks />
```

## Instagram Gradient

Instagram-ის აიქონს აქვს `gradient` prop — hover-ზე ჩართულია custom gradient ეფექტი:
```tsx
<InstagramIcon gradient={hoveredItem === 'instagram'} />
```

## Accessibility

- Trigger: `aria-label="Social links"`, `aria-expanded={isExpanded}`
- ლინკები: `aria-label="Instagram"` / `"YouTube"` / `"Facebook"`
- ყველა ლინკი: `target="_blank" rel="noopener noreferrer"`

## Dependencies

- `SOCIAL_LINKS` კონსტანტა `~/lib/constants`-დან
- Custom აიქონები: `~/components/icons` (SocialIcon, InstagramIcon, YouTubeIcon, FacebookIcon)
