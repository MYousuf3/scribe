'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function AuthButton() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2 text-cream">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-golden_brown border-t-transparent"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <button
        onClick={() => signIn('github', { callbackUrl: '/developer' })}
        className="bg-golden_brown hover:bg-accent_red text-cream px-4 py-2 rounded-lg transition-colors duration-300 font-medium"
      >
        Sign In
      </button>
    );
  }

  // Authenticated
  return (
    <div className="flex items-center space-x-4">
      {/* User Profile */}
      <div className="flex items-center space-x-2 text-cream">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user?.name || 'User'}
            width={32}
            height={32}
            className="rounded-full border-2 border-golden_brown"
          />
        ) : (
          <UserIcon className="h-8 w-8 p-1 bg-clay_brown rounded-full text-cream" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {session.user?.name || (session.user as any)?.username || 'GitHub User'}
          </span>
          {(session.user as any)?.username && (
            <span className="text-xs text-golden_brown">
              @{(session.user as any).username}
            </span>
          )}
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-accent_red hover:bg-golden_brown text-cream px-4 py-2 rounded-lg transition-colors duration-300 font-medium"
        title="Sign Out"
      >
        <span>Sign Out</span>
      </button>
    </div>
  );
} 