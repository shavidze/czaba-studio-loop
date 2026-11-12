/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI.
 */

import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui';

interface ErrorDisplayProps {
  title: string;
  message: string;
  showRefresh?: boolean;
  showHome?: boolean;
}

function ErrorDisplay({ title, message, showRefresh = true, showHome = true }: ErrorDisplayProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-bg">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>

        {/* Message */}
        <p className="text-muted mb-8">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRefresh && (
            <Button variant="secondary" size="lg" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          )}

          {showHome && (
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-black font-medium rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Root Error Boundary for Remix routes
 */
export function RootErrorBoundary() {
  const error = useRouteError();

  // Handle HTTP error responses (404, 500, etc.)
  if (isRouteErrorResponse(error)) {
    let title = 'Something went wrong';
    let message = 'An unexpected error occurred.';

    switch (error.status) {
      case 404:
        title = 'Page Not Found';
        message = "The page you're looking for doesn't exist or has been moved.";
        break;
      case 401:
        title = 'Unauthorized';
        message = 'You need to sign in to access this page.';
        break;
      case 403:
        title = 'Access Denied';
        message = "You don't have permission to view this page.";
        break;
      case 500:
        title = 'Server Error';
        message = 'Something went wrong on our end. Please try again later.';
        break;
      default:
        title = `Error ${error.status}`;
        message = error.statusText || 'An unexpected error occurred.';
    }

    return (
      <html lang="en" className="dark">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{title} | CZABA</title>
        </head>
        <body className="bg-background text-foreground">
          <ErrorDisplay title={title} message={message} />
        </body>
      </html>
    );
  }

  // Handle JavaScript errors
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

  // Log error for debugging (in production, send to error tracking service)
  console.error('Uncaught error:', error);

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error | CZABA</title>
      </head>
      <body className="bg-background text-foreground">
        <ErrorDisplay
          title="Something went wrong"
          message={
            process.env.NODE_ENV === 'development'
              ? errorMessage
              : 'An unexpected error occurred. Please try again.'
          }
        />
      </body>
    </html>
  );
}

/**
 * Route-level Error Boundary (doesn't replace entire page)
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    let title = 'Error';
    let message = error.statusText || 'An error occurred';

    if (error.status === 404) {
      title = 'Not Found';
      message = "This content doesn't exist or has been removed.";
    }

    return <ErrorDisplay title={title} message={message} showHome={false} />;
  }

  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Route error:', error);

  return (
    <ErrorDisplay
      title="Something went wrong"
      message={
        process.env.NODE_ENV === 'development'
          ? errorMessage
          : 'Failed to load this section. Please try again.'
      }
      showHome={false}
    />
  );
}
