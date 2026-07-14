'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { clearServerSession } from '@/lib/firebase/session-client';
import { useAuth } from '@/lib/firebase/use-auth';
import { CompassMark } from '@/components/compass-mark';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Chat with Us', href: '/conversational' },
  { name: 'My Aid Programs', href: '/dashboard' },
  { name: 'FEMA Letter Help', href: '/fema' },
  { name: 'About', href: '/about' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  async function handleSignOut() {
    await Promise.all([getFirebaseAuth().signOut(), clearServerSession()]);
    router.push('/sign-in');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#e4d9cf] bg-[#f2ece5]/85 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-[22px] py-2"
      >
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
          <span className="text-[1.06rem] font-bold tracking-[-0.01em]">
            Aid Compass
          </span>
        </Link>

        <div className="flex items-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium no-underline transition-colors ${
                pathname === item.href
                  ? 'text-[#895031]'
                  : 'text-[#6b5a4e] hover:text-[#2a201a]'
              }`}
            >
              {item.name}
            </Link>
          ))}

          {!loading &&
            (user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-[#e4d9cf] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#2a201a] no-underline transition-colors hover:bg-[#f2ece5]"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-lg bg-[#3d2b20] px-3.5 py-1.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#2b1e15]"
              >
                Sign in
              </Link>
            ))}
        </div>
      </nav>
    </header>
  );
}
