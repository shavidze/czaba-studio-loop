import { Link } from '@remix-run/react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Download, FileMusic, Heart, Package, Search, ShoppingBag } from 'lucide-react';

// Preset icons for common empty states
const presetIcons: Record<string, LucideIcon> = {
  cart: ShoppingBag,
  downloads: Download,
  library: FileMusic,
  orders: Package,
  search: Search,
  favorites: Heart,
  notifications: Bell,
};

interface EmptyStateProps {
  icon?: LucideIcon;
  preset?: keyof typeof presetIcons;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  preset,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
}: EmptyStateProps) {
  const Icon = icon || (preset ? presetIcons[preset] : ShoppingBag);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-elevated border border-outline flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-xl font-medium text-foreground mb-2">{title}</h2>

      {/* Description */}
      <p className="text-muted max-w-sm mb-8 leading-relaxed">{description}</p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel &&
          (actionHref || onAction) &&
          (actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center justify-center px-6 py-3 bg-brand text-background rounded-lg font-medium hover:bg-brand/90 transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-6 py-3 bg-brand text-background rounded-lg font-medium hover:bg-brand/90 transition-colors cursor-pointer"
            >
              {actionLabel}
            </button>
          ))}

        {secondaryActionLabel &&
          (secondaryActionHref || onSecondaryAction) &&
          (secondaryActionHref ? (
            <Link
              to={secondaryActionHref}
              className="inline-flex items-center justify-center px-6 py-3 bg-elevated text-foreground rounded-lg font-medium hover:bg-outline transition-colors border border-outline"
            >
              {secondaryActionLabel}
            </Link>
          ) : (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center px-6 py-3 bg-elevated text-foreground rounded-lg font-medium hover:bg-outline transition-colors border border-outline cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          ))}
      </div>
    </div>
  );
}
