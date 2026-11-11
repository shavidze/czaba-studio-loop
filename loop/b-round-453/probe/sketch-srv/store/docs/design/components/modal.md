# Modal — კომპონენტის სპეციფიკაცია

**ფაილი:** `app/components/ui/Modal.tsx`

## Sizes

| Size | Width | გამოყენება |
|------|-------|-----------|
| `sm` | 360px | Confirmation dialogs |
| `md` | 420px | ფორმები, login (default) |
| `lg` | 560px | კომპლექსური კონტენტი |
| `xl` | 720px | Stems player, პროდუქტის დეტალები |

---

## სტრუქტურა

```
┌─────────── Backdrop ──────────────┐
│                                    │
│   ┌──────── Modal ──────────┐     │
│   │  ModalHeader            │     │
│   │    ModalTitle           │     │
│   │    ModalDescription     │     │
│   │    [Close Button]       │     │
│   ├─────────────────────────┤     │
│   │  ModalBody              │     │
│   │    (scrollable content) │     │
│   ├─────────────────────────┤     │
│   │  ModalFooter            │     │
│   │    [Cancel] [Confirm]   │     │
│   └─────────────────────────┘     │
│                                    │
└────────────────────────────────────┘
```

---

## Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;    // default: true
  closeOnBackdrop?: boolean;    // default: true
  closeOnEscape?: boolean;      // default: true
  children: React.ReactNode;
}
```

---

## Sub-components

### ModalHeader

- `flex items-center justify-between`
- padding: `p-5` ან `p-6`
- border-bottom: `1px outline`

### ModalTitle

- `text-lg font-semibold text-foreground`

### ModalDescription

- `text-sm text-muted mt-1`

### ModalBody

- `flex-1 overflow-y-auto`
- padding: `px-5 py-4` ან `px-6 py-5`
- max-height: viewport-based scrolling

### ModalFooter

- `flex items-center justify-end gap-3`
- padding: `p-5` ან `p-6`
- border-top: `1px outline`

---

## Backdrop

```css
background: hsl(220, 20%, 2%, 0.7);
backdrop-filter: blur(4px);
```

---

## ანიმაცია

| ელემენტი | გამოჩენა | გაქრობა |
|---------|---------|---------|
| Backdrop | `fade-in 200ms` | `fade-out 150ms` |
| Modal | `scale-in 250ms` + `fade-in-up` | `scale-out 150ms` |

---

## ConfirmDialog

Confirmation modal-ის shortcut:

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;      // default: "დადასტურება"
  cancelLabel?: string;       // default: "გაუქმება"
  variant?: "default" | "destructive";
}
```

```tsx
<ConfirmDialog
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="პროდუქტის წაშლა"
  description="ნამდვილად გსურთ წაშლა? ეს მოქმედება შეუქცევადია."
  confirmLabel="წაშლა"
  variant="destructive"
/>
```

---

## Keyboard Navigation

| Key | მოქმედება |
|-----|---------|
| `ESC` | მოდალის დახურვა |
| `Tab` | ფოკუსის ციკლი მოდალში |
| `Shift+Tab` | უკუ ფოკუსი |

---

## Scroll Lock

მოდალის გახსნისას `body` იბლოკება scrolling-ისგან:

```
document.body.style.overflow = 'hidden'
```

დახურვისას აღდგება.

---

## Accessibility

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` → ModalTitle
- `aria-describedby` → ModalDescription
- Focus trap: Tab-ით მხოლოდ მოდალში ელემენტებს შორის
- Auto-focus: პირველი interactive ელემენტი
