'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { UserIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function AuthButton() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2 text-white">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-amber-200 border-t-transparent"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <button
        onClick={() => signIn('github', { callbackUrl: '/developer' })}
        className="flex items-center space-x-2 text-white hover:text-amber-200 transition-colors px-3 py-2 rounded-md text-sm font-medium border border-amber-600 hover:border-amber-400"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        <span>Sign In</span>
      </button>
    );
  }

  // Authenticated
  return (
    <div className="flex items-center space-x-4">
      {/* User Profile */}
      <div className="flex items-center space-x-2 text-white">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user?.name || 'User'}
            width={24}
            height={24}
            className="rounded-full border border-amber-600"
          />
        ) : (
          <UserIcon className="h-6 w-6 p-1 bg-amber-700 rounded-full" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {session.user?.name || session.user?.username || 'GitHub User'}
          </span>
          {session.user?.username && (
            <span className="text-xs text-amber-200">
              @{session.user.username}
            </span>
          )}
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center space-x-2 text-white hover:text-amber-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
        title="Sign Out"
      >
        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  );
} 