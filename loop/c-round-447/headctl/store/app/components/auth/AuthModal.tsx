import { useEffect, useRef } from 'react';
import { useAuth, useScrollLock } from '~/hooks';
import { ForgotPasswordForm } from './ForgetPassword';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export function AuthModal() {
  const { isModalOpen, modalView, closeModal, openModal } = useAuth();
  const modalMap = {
    signin: (
      <SignInForm
        onSwitchToSignUp={() => openModal('signup')}
        onSwitchToForgotPassword={() => openModal('forgotPassword')}
      />
    ),
    signup: <SignUpForm onSwitchToSignIn={() => openModal('signin')} />,
    forgotPassword: <ForgotPasswordForm onSwitchToSignIn={() => openModal('signin')} />,
  };

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, closeModal]);

  // Prevent body scroll when modal is open
  useScrollLock(isModalOpen);

  // Close on backdrop click, e.target = ის რასაც ვაკლიკებთ, e.currentTarget = ის რაზეც მივაბით onClick.
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[1000] animate-fade-in font-heading cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="overflow-hidden bg-surface border border-outline rounded-xl w-full max-w-modal max-h-[90vh] relative animate-slide-up shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-dim hover:text-foreground transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {modalMap[modalView]}
      </div>
    </div>
  );
}
