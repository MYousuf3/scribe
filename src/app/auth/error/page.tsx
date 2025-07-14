'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
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
    <div className="min-h-screen bg-light_beige flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-dark_brown font-cuneiform mb-2">
              𒂷 Scribe
            </h1>
          </Link>
          <p className="text-clay_brown font-cuneiform text-lg">
            Chronicle of Changes
          </p>
        </div>
        {/* Error Card */}
        <div className="bg-cream p-8 rounded-lg border-2 border-clay_brown shadow-lg text-center">
          <div className="text-6xl mb-4 text-accent_red">⚠</div>
          <h2 className="text-2xl font-bold text-dark_brown mb-4 font-serif">
            Authentication Error
          </h2>
          <p className="text-clay_brown mb-6 font-sans">
            {error ? `Error: ${error}` : 'There was a problem signing you in.'}
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-golden_brown hover:bg-accent_red text-cream font-medium py-3 px-4 rounded-lg transition-colors duration-300"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-transparent border-2 border-clay_brown text-dark_brown hover:bg-clay_brown hover:text-cream font-medium py-3 px-4 rounded-lg transition-colors duration-300"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-body_dark flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark_accent mx-auto"></div>
          <p className="mt-4 text-body_light">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 