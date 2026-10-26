import { FacebookIcon, GoogleIcon } from '../icons';

interface SocialAuthButtonsProps {
  onGoogleClick: () => void;
  onFacebookClick?: () => void;
  isLoading?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export function SocialAuthButtons({
  onGoogleClick,
  onFacebookClick,
  isLoading = false,
  layout = 'horizontal',
}: SocialAuthButtonsProps) {
  return (
    <div className={`flex ${layout === 'horizontal' ? 'gap-3' : 'flex-col gap-3'}`}>
      {onFacebookClick && (
        <button
          type="button"
          onClick={onFacebookClick}
          disabled={isLoading}
          className={`
            ${layout === 'horizontal' ? 'flex-1' : 'w-full'}
            flex items-center justify-center gap-2
            py-3 px-4
            bg-social-facebook text-foreground
            rounded-md font-medium
            hover:brightness-110
            transition
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        >
          {/* Facebook Icon */}
          <FacebookIcon />
          Facebook
        </button>
      )}

      <button
        type="button"
        onClick={onGoogleClick}
        disabled={isLoading}
        className={`
          ${layout === 'horizontal' ? 'flex-1' : 'w-full'}
          flex items-center justify-center gap-3
          py-3 px-4
          ${
            layout === 'horizontal'
              ? 'bg-social-google text-social-google-text border border-social-google-border hover:bg-social-google-hover'
              : 'bg-elevated text-foreground border border-outline hover:border-outline-hover rounded-full'
          }
          rounded-md font-medium
          transition
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        {/* Google Icon */}
        <GoogleIcon />
        {layout === 'vertical' ? 'Continue with Google' : 'Google'}
      </button>
    </div>
  );
}
