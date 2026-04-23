'use client';

import type { ReactNode } from 'react';

/**
 * MobileFrame — constrains the entire app to a phone-like viewport
 * Centered on desktop with dark surrounding background
 */
export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-desktop-bg flex items-start justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-surface relative shadow-2xl">
        {children}
      </div>
    </div>
  );
}
