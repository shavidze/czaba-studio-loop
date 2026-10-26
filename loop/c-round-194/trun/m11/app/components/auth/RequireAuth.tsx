import { useNavigate } from '@remix-run/react';
import { Loader2, Lock } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { Button } from '~/components/ui';
import { useAuth } from '~/hooks';

interface RequireAuthProps {
  children: ReactNode;
  fallback?: 'redirect' | 'prompt';
  redirectTo?: string;
}

export function RequireAuth({ children, fallback = 'prompt', redirectTo = '/' }: RequireAuthProps) {
  const { isAuthenticated, isInitializing, openModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated && fallback === 'redirect') {
      navigate(redirectTo);
    }
  }, [isInitializing, isAuthenticated, fallback, navigate, redirectTo]);

  // Show loading while auth is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback === 'redirect') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-4xl">
          <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Sign in required</h1>
          <p className="text-muted mb-6">
            You need to sign in to access this page. Create an account or sign in to continue.
          </p>
          <Button onClick={() => openModal('signin')} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
