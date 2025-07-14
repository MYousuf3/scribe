'use client';

import { getProviders, signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const setupProviders = async () => {
      const session = await getSession();
      if (session) {
        router.push('/developer');
        return;
      }

      const res = await getProviders();
      setProviders(res);
      setLoading(false);
    };
    
    setupProviders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-clay-light flex items-center justify-center">
        <div className="text-ink-dark font-cuneiform text-lg">Loading...</div>
      </div>
    );
  }

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

        {/* Sign-in Card */}
        <div className="bg-clay-medium p-8 rounded-lg border-2 border-clay-dark shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-ink-dark font-cuneiform mb-2">
              Access the Archives
            </h2>
            <p className="text-ink-medium">
              Connect your GitHub account to generate and manage changelogs
            </p>
          </div>

          <div className="space-y-4">
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => signIn(provider.id, { callbackUrl: '/developer' })}
                  className="w-full bg-ink-dark text-clay-light font-medium py-3 px-4 rounded 
                           hover:bg-ink-medium transition-colors duration-200 
                           flex items-center justify-center space-x-3
                           border-2 border-ink-dark hover:border-ink-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>Continue with {provider.name}</span>
                </button>
              ))}
          </div>

          <div className="mt-6 text-center text-sm text-ink-medium">
            <p>
              By signing in, you agree to access your GitHub repositories 
              for changelog generation
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-ink-medium hover:text-ink-dark transition-colors duration-200 font-cuneiform"
          >
            ← Return to Archives
          </Link>
        </div>
      </div>
    </div>
  );
} 