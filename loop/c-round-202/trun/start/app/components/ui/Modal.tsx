import { X } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '~/hooks';

/**
 * CZABA Design System - Modal Component
 *
 * Variants:
 * - default: Standard modal with surface background
 * - fullscreen: Full screen modal for immersive content
 *
 * Sizes:
 * - sm: 360px - Confirmations, alerts
 * - md: 420px - Forms, auth (default)
 * - lg: 560px - Complex forms
 * - xl: 720px - Large content
 *
 * @see docs/design/DESIGN_SYSTEM.md
 */

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-[360px]',
  md: 'max-w-modal', // 420px from @theme
  lg: 'max-w-[560px]',
  xl: 'max-w-[720px]',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      size = 'md',
      showCloseButton = true,
      closeOnBackdrop = true,
      closeOnEscape = true,
      className = '',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const modalRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    // Scroll lock
    useScrollLock(isOpen);

    // Close on ESC key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, closeOnEscape, onClose]);

    // Handle backdrop click
    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnBackdrop, onClose],
    );

    if (!isOpen) return null;

    // Only render on client side
    if (typeof window === 'undefined') return null;

    const modalContent = (
      <div
        data-lenis-prevent
        className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[1000] animate-fade-in cursor-pointer"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      >
        <div
          ref={modalRef}
          data-lenis-prevent
          className={[
            'bg-surface border border-outline rounded-xl',
            'w-full mx-4 max-h-[90vh] overflow-auto overscroll-contain styled-scrollbar',
            'relative animate-slide-up shadow-2xl cursor-default',
            sizeStyles[size],
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors z-10 cursor-pointer"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          )}
          {children}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  },
);

Modal.displayName = 'Modal';

// ============================================
// Modal Header
// ============================================

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={['px-8 pt-8 pb-4', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </div>
    );
  },
);

ModalHeader.displayName = 'ModalHeader';

// ============================================
// Modal Title
// ============================================

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={['text-2xl font-semibold text-foreground', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </h2>
    );
  },
);

ModalTitle.displayName = 'ModalTitle';

// ============================================
// Modal Description
// ============================================

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={['text-sm text-muted mt-2', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </p>
    );
  },
);

ModalDescription.displayName = 'ModalDescription';

// ============================================
// Modal Body
// ============================================

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={['px-8 py-4', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </div>
    );
  },
);

ModalBody.displayName = 'ModalBody';

// ============================================
// Modal Footer
// ============================================

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={['px-8 pb-8 pt-4 flex gap-3 justify-end', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ModalFooter.displayName = 'ModalFooter';

// ============================================
// Confirm Dialog - Pre-built pattern
// ============================================

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'default',
  icon,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="p-8 text-center">
        {icon && (
          <div className="w-16 h-16 rounded-full bg-elevated border border-outline flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>
        )}

        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>

        {description && <p className="text-muted mb-8 leading-relaxed">{description}</p>}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-5 py-3 bg-transparent border border-outline text-muted font-medium rounded-lg hover:border-outline-hover hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={[
              'flex-1 px-5 py-3 font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2',
              variant === 'destructive'
                ? 'bg-destructive text-brand-foreground hover:bg-destructive/90'
                : 'bg-foreground text-background hover:bg-foreground/90',
            ].join(' ')}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
