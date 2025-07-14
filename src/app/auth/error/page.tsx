'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access was denied. You may have cancelled the authentication or the provider blocked the request.';
      case 'Verification':
        return 'The verification link was invalid or has expired.';
      case 'Default':
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Configuration Error';
      case 'AccessDenied':
        return 'Access Denied';
      case 'Verification':
        return 'Verification Failed';
      case 'Default':
      default:
        return 'Authentication Error';
    }
  };

  return (
    <div className="min-h-screen bg-clay-light flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-ink-dark font-cuneiform mb-2">
              𒂷 Scribe
            </h1>
          </Link>
          <p className="text-ink-medium font-cuneiform text-lg">
            Chronicle of Changes
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-clay-medium p-8 rounded-lg border-2 border-clay-dark shadow-lg">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-ink-dark font-cuneiform mb-4">
              {getErrorTitle(error)}
            </h2>
            
            <p className="text-ink-medium mb-6">
              {getErrorMessage(error)}
            </p>

            {error && (
              <div className="bg-clay-light p-3 rounded border border-clay-dark mb-6">
                <p className="text-sm text-ink-medium font-mono">
                  Error Code: {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link 
                href="/auth/signin"
                className="block w-full bg-ink-dark text-clay-light font-medium py-3 px-4 rounded 
                         hover:bg-ink-medium transition-colors duration-200 
                         border-2 border-ink-dark hover:border-ink-medium"
              >
                Try Again
              </Link>
              
              <Link 
                href="/"
                className="block w-full bg-clay-light text-ink-dark font-medium py-3 px-4 rounded 
                         hover:bg-clay-dark hover:text-clay-light transition-colors duration-200 
                         border-2 border-ink-dark"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 text-sm text-ink-medium">
          <p>
            If this error persists, please check that your GitHub account has proper access to the repository.
          </p>
        </div>
      </div>
    </div>
  );
} 