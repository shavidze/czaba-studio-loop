import { XCircle } from 'lucide-react';
import { useState } from 'react';
import { FacebookIcon, GoogleIcon, LoaderIcon } from '~/components/icons';
import { Button, Input, PasswordInput } from '~/components/ui';
import { useAuth } from '~/hooks/useAuth';
import { validateEmail, validatePassword } from '~/lib/auth';
import { getErrorMessage } from '~/lib/utils/getErrorMessage';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const isAnyLoading = isLoading || loadingProvider !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};

    if (!name) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    try {
      await signUp(name, email, password);
    } catch (error: unknown) {
      setErrors({ general: getErrorMessage(error) });
    }
  };

  const handleSocialLogin = async (provider: 'facebook' | 'google') => {
    setErrors({});
    setLoadingProvider(provider);

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        // Facebook not implemented yet
        throw new Error('Facebook login is not available yet');
      }
    } catch (error: unknown) {
      console.error(`${provider} sign up error:`, error);
      setErrors({
        general: getErrorMessage(error),
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="p-8">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-foreground mb-6">Create account</h2>

      {/* General Error */}
      {errors.general && (
        <div className="bg-error-bg border border-error-border rounded-lg p-4 mb-6 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <p className="text-error-light text-sm leading-relaxed">{errors.general}</p>
        </div>
      )}

      {/* Social Buttons */}
      <div className="flex gap-3 mb-6">
        {/* Facebook Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={isAnyLoading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 cursor-pointer bg-social-facebook text-foreground font-medium rounded-lg hover:bg-social-facebook-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingProvider === 'facebook' ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <FacebookIcon />
              <span>Facebook</span>
            </>
          )}
        </button>

        {/* Google Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={isAnyLoading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 bg-social-google text-social-google-text font-medium cursor-pointer rounded-lg border border-social-google-border hover:bg-social-google-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingProvider === 'google' ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin text-social-google-text" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Google</span>
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-outline" />
        <span className="text-dim text-sm">or</span>
        <div className="flex-1 h-px bg-outline" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={setName}
            error={errors.name}
            disabled={isAnyLoading}
            autoComplete="name"
          />
        </div>

        <div className="mb-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            disabled={isAnyLoading}
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            disabled={isAnyLoading}
            autoComplete="new-password"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="accent"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isAnyLoading}
        >
          Create Account
        </Button>
      </form>

      {/* Footer - Sign In Link */}
      <p className="text-center text-muted text-sm mt-8">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-foreground font-semibold hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </p>

      {/* Terms and Privacy */}
      <p className="text-center text-dim text-xs mt-6">
        By signing up, you agree to our{' '}
        <a
          href="/terms"
          className="text-muted hover:text-foreground hover:underline transition-colors"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="/privacy"
          className="text-muted hover:text-foreground hover:underline transition-colors"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
