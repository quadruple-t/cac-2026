'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { clearServerSession } from '@/lib/firebase/session-client';
import { useAuth } from '@/lib/firebase/use-auth';
import { CompassMark } from '@/components/compass-mark';

const navItems = [
  { name: 'Find aid', href: '/conversational' },
  { name: 'My aid', href: '/dashboard' },
  { name: 'Deadlines', href: '/deadlines' },
  { name: 'FEMA letter', href: '/fema' },
  { name: 'About', href: '/about' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleSignOut() {
    await Promise.all([getFirebaseAuth().signOut(), clearServerSession()]);
    router.push('/sign-in');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#e4d9cf] bg-[#f2ece5]/85 shadow-[0_4px_20px_rgba(61,43,32,0.04)] backdrop-blur-sm">
      <nav aria-label="Primary" className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-[22px] py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#2a201a] no-underline"
        >
          <span
            aria-hidden="true"
            className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border-[1.5px] border-[#3d2b20]"
          >
            <CompassMark needleColor="#3d2b20" />
          </span>
          <span className="text-[1.2rem] font-bold tracking-[-0.01em]">
            Aid Compass
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center whitespace-nowrap text-[0.83rem] font-medium no-underline transition-all ${
                  pathname === item.href
                  ? 'rounded-full bg-[#eadbce] px-3 py-2 text-[1rem] text-[#895031] shadow-sm'
                    : 'rounded-full px-3 py-2 text-[1rem] text-[#6b5a4e] hover:bg-[#f7efe8] hover:text-[#2a201a]'
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 bg-[#b0673f] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {!loading &&
            (user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-none rounded-lg border border-[#e4d9cf] bg-white px-4 py-2 text-[1rem] font-semibold text-[#2a201a] no-underline transition-colors hover:bg-[#f2ece5]"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="flex-none rounded-lg bg-[#3d2b20] px-4 py-2 text-[1rem] font-semibold text-white no-underline transition-colors hover:bg-[#2b1e15]"
              >
                Sign in
              </Link>
            ))}
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-lg border border-[#e4d9cf] bg-white px-3 py-2 text-[1rem] font-semibold text-[#2a201a] md:hidden"
          >
            Menu
          </button>
        </div>
      </nav>
      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t border-[#e4d9cf] bg-[#faf6f1] px-[22px] py-3 md:hidden">
          <div className="mx-auto flex max-w-[1080px] flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-[1.05rem] font-semibold no-underline ${pathname === item.href ? 'bg-[#eadbce] text-[#895031]' : 'text-[#2a201a] hover:bg-[#f2ece5]'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
