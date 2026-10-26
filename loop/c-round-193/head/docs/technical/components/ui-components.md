# UI Components Documentation

> CZABA Design System - Standardized UI Components
>
> All components follow the design tokens defined in `app/styles/app.css` and documented in `docs/design/DESIGN_SYSTEM.md`.

---

## Table of Contents

1. [Button](#button)
2. [IconButton](#iconbutton)
3. [Input](#input)
4. [Card](#card)
5. [Modal](#modal)
6. [Toast](#toast)
7. [CollapsibleSocialLinks](#collapsiblesociallinks)

---

## Installation & Import

All UI components are exported from a single barrel file:

```tsx
import {
  // Buttons
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  AccentButton,
  IconButton,

  // Form elements
  Input,
  PasswordInput,
  Textarea,

  // Cards
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,

  // Modals
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ConfirmDialog,

  // Feedback
  ToastContainer,

  // Social
  CollapsibleSocialLinks,
} from '~/components/ui';
```

---

## Button

Versatile button component with multiple variants and sizes.

### File Location
`app/components/ui/Button.tsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'accent'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `fullWidth` | `boolean` | `false` | Expands to container width |
| `disabled` | `boolean` | `false` | Disables interaction |

### Variants

#### Primary (Revenue Actions)
```tsx
<Button variant="primary">Add to Cart</Button>
<PrimaryButton>Buy Now</PrimaryButton>
```
- Background: `--color-brand` (#13D9CC)
- Use for: Add to Cart, Buy Now, Submit, Primary CTAs

#### Secondary (Supporting Actions)
```tsx
<Button variant="secondary">Cancel</Button>
<SecondaryButton>Back</SecondaryButton>
```
- Background: `--color-elevated`
- Use for: Cancel, Back, Secondary actions

#### Ghost (Tertiary Actions)
```tsx
<Button variant="ghost">Learn More</Button>
<GhostButton>Skip</GhostButton>
```
- Background: transparent
- Use for: Links styled as buttons, less important actions

#### Accent (Auth & Special Actions)
```tsx
<Button variant="accent">Sign In</Button>
<AccentButton>Create Account</AccentButton>
```
- Background: `--color-accent` (#f9a91f)
- Use for: Auth forms, special CTAs

### Sizes

| Size | Padding | Font Size | Use Case |
|------|---------|-----------|----------|
| `sm` | 12px 6px | text-sm | Inline actions, tags |
| `md` | 16px 10px | text-sm | Default, forms |
| `lg` | 24px 12px | text-base | Hero CTAs, modals |

### Examples

```tsx
// Basic usage
<Button>Click Me</Button>

// With loading state
<Button isLoading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>

// Full width in forms
<Button fullWidth size="lg">
  Submit Form
</Button>

// Disabled state
<Button disabled>Not Available</Button>

// Using convenience exports
<PrimaryButton size="lg">Buy Now</PrimaryButton>
<SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
<GhostButton>Learn More</GhostButton>
<AccentButton>Sign Up</AccentButton>
```

---

## IconButton

Square button optimized for icon-only interactions.

### File Location
`app/components/ui/IconButton.tsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Accessibility label (aria-label) |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'ghost'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `children` | `ReactNode` | **required** | Icon element |

### Sizes

| Size | Dimensions | Recommended Icon Size |
|------|------------|----------------------|
| `sm` | 32×32px | 16px |
| `md` | 40×40px | 20px |
| `lg` | 48×48px | 24px |

### Examples

```tsx
import { X, Play, Settings, Menu } from 'lucide-react';

// Close button
<IconButton label="Close" variant="ghost" size="md">
  <X size={20} />
</IconButton>

// Play button
<IconButton label="Play" variant="primary" size="lg">
  <Play size={24} />
</IconButton>

// Settings
<IconButton label="Settings" variant="secondary">
  <Settings size={20} />
</IconButton>

// Mobile menu
<IconButton label="Open menu" size="lg">
  <Menu size={24} />
</IconButton>
```

---

## Input

Form input components with floating labels and validation states.

### File Location
`app/components/ui/Input.tsx`

### Components

#### Input (Text Input)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Floating label text |
| `value` | `string` | **required** | Controlled value |
| `onChange` | `(value: string) => void` | **required** | Change handler |
| `type` | `string` | `'text'` | Input type |
| `error` | `string` | - | Error message |
| `variant` | `'default' \| 'filled'` | `'default'` | Background style |
| `inputSize` | `'md' \| 'lg'` | `'md'` | Input height |

```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
/>
```

#### PasswordInput

Same props as Input, plus built-in visibility toggle.

```tsx
<PasswordInput
  label="Password"
  value={password}
  onChange={setPassword}
  error={errors.password}
  autoComplete="current-password"
/>
```

#### Textarea

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Floating label text |
| `value` | `string` | **required** | Controlled value |
| `onChange` | `(value: string) => void` | **required** | Change handler |
| `rows` | `number` | `4` | Number of visible rows |
| `error` | `string` | - | Error message |

```tsx
<Textarea
  label="Message"
  value={message}
  onChange={setMessage}
  rows={6}
  error={errors.message}
/>
```

### Variants

| Variant | Background | Use Case |
|---------|------------|----------|
| `default` | `--color-surface` | Standard forms |
| `filled` | `--color-elevated` | Elevated contexts |

### States

- **Default**: Border `--color-outline`
- **Focus**: Border `--color-brand` + focus ring
- **Error**: Border `--color-destructive` + error message
- **Disabled**: 50% opacity, no interaction

### Examples

```tsx
// Complete form example
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <form className="space-y-4">
      <Input
        label="Full Name"
        value={name}
        onChange={setName}
        error={errors.name}
      />

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
      />

      <Textarea
        label="Your Message"
        value={message}
        onChange={setMessage}
        rows={5}
        error={errors.message}
      />

      <Button type="submit" fullWidth>
        Send Message
      </Button>
    </form>
  );
}
```

---

## Card

Flexible container component for grouping related content.

### File Location
`app/components/ui/Card.tsx`

### Components

#### Card (Container)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outline' \| 'interactive'` | `'default'` | Visual style |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `as` | `'div' \| 'article' \| 'section'` | `'div'` | HTML element |

#### Sub-components

| Component | Description |
|-----------|-------------|
| `CardHeader` | Top section with margin-bottom |
| `CardTitle` | Heading (h3 by default, customizable) |
| `CardDescription` | Muted description text |
| `CardContent` | Main content area |
| `CardFooter` | Bottom section with border-top |

### Variants

| Variant | Style | Use Case |
|---------|-------|----------|
| `default` | Surface bg + border | Standard cards |
| `elevated` | Elevated bg + shadow | Prominent content |
| `outline` | Transparent + 2px border | Form sections |
| `interactive` | Hover effects | Clickable cards |

### Padding

| Size | Value | Use Case |
|------|-------|----------|
| `none` | 0px | Image cards, custom padding |
| `sm` | 16px | Compact cards |
| `md` | 24px | Default |
| `lg` | 32px | Feature cards |

### Examples

```tsx
// Basic card with all sub-components
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>

// Interactive card (clickable)
<Card variant="interactive" onClick={handleClick}>
  <CardContent>
    Click me to navigate
  </CardContent>
</Card>

// Elevated feature card
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle as="h2">Premium Feature</CardTitle>
  </CardHeader>
  <CardContent>
    Highlighted content with shadow
  </CardContent>
</Card>

// Product card with no padding (image bleeds)
<Card variant="interactive" padding="none">
  <img src={product.image} alt={product.title} className="w-full" />
  <div className="p-4">
    <CardTitle>{product.title}</CardTitle>
    <p className="text-brand font-semibold">{product.price}</p>
  </div>
</Card>

// Semantic article card
<Card as="article" variant="default">
  <CardHeader>
    <CardTitle as="h2">Blog Post Title</CardTitle>
    <CardDescription>Published on Jan 1, 2025</CardDescription>
  </CardHeader>
  <CardContent>
    Article content...
  </CardContent>
</Card>
```

---

## Modal

Accessible modal dialog with backdrop, keyboard handling, and scroll locking.

### File Location
`app/components/ui/Modal.tsx`

### Components

#### Modal (Container)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **required** | Controls visibility |
| `onClose` | `() => void` | **required** | Close handler |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal width |
| `showCloseButton` | `boolean` | `true` | Show X button |
| `closeOnBackdrop` | `boolean` | `true` | Close on backdrop click |
| `closeOnEscape` | `boolean` | `true` | Close on ESC key |
| `aria-label` | `string` | - | Accessibility label |
| `aria-labelledby` | `string` | - | ID of title element |

#### Sub-components

| Component | Description |
|-----------|-------------|
| `ModalHeader` | Top section (px-8 pt-8 pb-4) |
| `ModalTitle` | h2 heading |
| `ModalDescription` | Muted description |
| `ModalBody` | Main content (px-8 py-4) |
| `ModalFooter` | Actions area (px-8 pb-8 pt-4) |

### Sizes

| Size | Width | Use Case |
|------|-------|----------|
| `sm` | 360px | Confirmations, alerts |
| `md` | 420px | Forms, auth (default) |
| `lg` | 560px | Complex forms |
| `xl` | 720px | Large content, media |

### Features

- **ESC key**: Closes modal (configurable)
- **Backdrop click**: Closes modal (configurable)
- **Scroll lock**: Body scroll disabled when open
- **Focus trap**: Keeps focus within modal
- **Portal**: Renders at document.body level
- **Animation**: Fade in + slide up

### Examples

```tsx
// Basic modal
function ExampleModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Edit Profile</ModalTitle>
        <ModalDescription>
          Update your account information
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Email" value={email} onChange={setEmail} />
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Large modal for media
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  <ModalBody>
    <video src={videoUrl} controls className="w-full" />
  </ModalBody>
</Modal>

// Modal without close button (forced action)
<Modal
  isOpen={isOpen}
  onClose={onClose}
  showCloseButton={false}
  closeOnBackdrop={false}
  closeOnEscape={false}
>
  <ModalBody>
    You must complete this action
  </ModalBody>
  <ModalFooter>
    <Button onClick={handleComplete}>Continue</Button>
  </ModalFooter>
</Modal>
```

### ConfirmDialog

Pre-built confirmation dialog pattern.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **required** | Controls visibility |
| `onConfirm` | `() => void` | **required** | Confirm action |
| `onCancel` | `() => void` | **required** | Cancel action |
| `title` | `string` | **required** | Dialog title |
| `description` | `string` | - | Optional description |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `isLoading` | `boolean` | `false` | Shows loading state |
| `variant` | `'default' \| 'destructive'` | `'default'` | Confirm button style |
| `icon` | `ReactNode` | - | Optional icon |

```tsx
import { Trash2, AlertTriangle } from 'lucide-react';

// Delete confirmation
<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete Item?"
  description="This action cannot be undone."
  confirmText="Delete"
  cancelText="Keep"
  variant="destructive"
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteConfirm(false)}
  isLoading={isDeleting}
  icon={<Trash2 className="w-7 h-7 text-muted" />}
/>

// Save changes confirmation
<ConfirmDialog
  isOpen={showSaveConfirm}
  title="Save Changes?"
  description="Your changes will be applied immediately."
  confirmText="Save"
  onConfirm={handleSave}
  onCancel={() => setShowSaveConfirm(false)}
/>

// Warning dialog
<ConfirmDialog
  isOpen={showWarning}
  title="Are you sure?"
  description="This will reset all your preferences."
  confirmText="Reset"
  variant="destructive"
  onConfirm={handleReset}
  onCancel={() => setShowWarning(false)}
  icon={<AlertTriangle className="w-7 h-7 text-warning" />}
/>
```

---

## Toast

Notification system for user feedback.

### File Location
`app/components/ui/Toast.tsx`

### Setup

Add `ToastContainer` to your root layout:

```tsx
// app/root.tsx
import { ToastContainer } from '~/components/ui';

export default function App() {
  return (
    <html>
      <body>
        <Outlet />
        <ToastContainer />
      </body>
    </html>
  );
}
```

### Usage with Hook

```tsx
import { useToast } from '~/hooks';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Item added to cart!', 'success');
  };

  const handleError = () => {
    showToast('Something went wrong', 'error');
  };

  const handleInfo = () => {
    showToast('Processing your request...', 'info');
  };

  return (
    <Button onClick={handleSuccess}>Add to Cart</Button>
  );
}
```

### Toast Types

| Type | Color | Use Case |
|------|-------|----------|
| `success` | Green | Successful actions |
| `error` | Red | Errors, failures |
| `info` | Blue | Informational messages |
| `warning` | Yellow | Warnings |

---

## CollapsibleSocialLinks

Expandable social media links component with hover animation.

### File Location
`app/components/ui/CollapsibleSocialLinks.tsx`

### Description

მინიმალისტური social links კომპონენტი, რომელიც იშლება hover-ზე. მთავარი trigger ღილაკი ფარავს სოციალურ ქსელებს, hover-ზე კი ჰორიზონტალურად გამოჩნდება Instagram, YouTube, Facebook აიქონები.

```
[●] → hover → [●] [IG🌈] [YT🔴] [FB🔵]
```

### Features

- **Framer Motion Animation**: Smooth horizontal expansion (300ms)
- **Staggered Appearance**: Icons appear with 50ms delay each
- **Brand Colors on Hover**:
  - Instagram: Official gradient (#FFD600 → #FF7A00 → #FF0069 → #D300C5 → #7638FA)
  - YouTube: #FF0000
  - Facebook: #1877F2
- **Centralized Config**: URLs from `~/lib/constants.ts`

### Props

არ აქვს props - კონფიგურაცია `constants.ts`-ში.

### Usage

```tsx
import { CollapsibleSocialLinks } from '~/components/ui';

// Footer-ში
<div className="flex items-center justify-between">
  <h3 className="text-brand">CZABA</h3>
  <CollapsibleSocialLinks />
</div>
```

### Configuration

Social links URLs are defined in `app/lib/constants.ts`:

```typescript
export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/czaba',
  youtube: 'https://youtube.com/@czaba',
  facebook: 'https://facebook.com/czaba',
} as const;
```

### Related Components

- **Icons**: `~/components/icons/SocialIcons.tsx`
  - `InstagramIcon` (gradient prop for brand colors)
  - `YouTubeIcon`
  - `FacebookIcon`
  - `SocialIcon` (generic share icon)

---

## Best Practices

### 1. Consistent Imports

Always import from the barrel file:
```tsx
// ✅ Good
import { Button, Input, Card } from '~/components/ui';

// ❌ Avoid
import { Button } from '~/components/ui/Button';
```

### 2. Use Semantic Variants

Choose variants based on action importance:
```tsx
// ✅ Primary for main action
<Button variant="primary">Submit Order</Button>

// ✅ Secondary for supporting action
<Button variant="secondary">Cancel</Button>

// ✅ Ghost for tertiary
<Button variant="ghost">Skip</Button>
```

### 3. Accessibility

Always provide accessible labels:
```tsx
// ✅ IconButton with label
<IconButton label="Close dialog">
  <X size={20} />
</IconButton>

// ✅ Modal with aria-label
<Modal isOpen={isOpen} onClose={onClose} aria-label="Edit profile">
```

### 4. Loading States

Show loading feedback for async actions:
```tsx
<Button isLoading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### 5. Error Handling

Display validation errors clearly:
```tsx
<Input
  label="Email"
  value={email}
  onChange={setEmail}
  error={errors.email} // Shows error message below input
/>
```

---

## Design Tokens Reference

All components use design tokens from `app/styles/app.css`:

### Colors
- `--color-brand`: Primary brand color
- `--color-accent`: Secondary accent
- `--color-surface`: Card backgrounds
- `--color-elevated`: Elevated surfaces
- `--color-foreground`: Primary text
- `--color-muted`: Secondary text
- `--color-outline`: Borders
- `--color-destructive`: Error states

### Spacing
- `--spacing-2`: 8px
- `--spacing-4`: 16px
- `--spacing-6`: 24px
- `--spacing-8`: 32px

### Border Radius
- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px

See `docs/design/DESIGN_SYSTEM.md` for complete token reference.
