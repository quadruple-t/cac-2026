'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ConversationalIntake from '@/components/features/conversational-intake';

export default function QuickIntakeLauncher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (pathname === '/conversational' || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open quick intake"
        className="fixed bottom-5 right-5 z-30 rounded-full bg-[#3d2b20] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#2b1e15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d2b20]"
      >
        Quick intake
      </button>
    );
  }

  if (isChatOpen) {
    return (
      <aside
        aria-label="Quick conversational intake"
        className="fixed bottom-5 right-5 z-30 w-[min(390px,calc(100vw-2rem))] rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-3 text-[#2a201a] shadow-xl"
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">Quick intake</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Dismiss quick intake"
            className="rounded-full px-2 py-1 text-lg leading-none text-[#6b5a4e] hover:bg-[#f2ece5] hover:text-[#2a201a]"
          >
            ×
          </button>
        </div>
        <ConversationalIntake compact onComplete={() => router.push('/conversational')} />
        <Link href="/conversational" className="mt-2 block text-center text-xs font-semibold text-[#895031] no-underline hover:text-[#6b5a4e]">
          Open full intake tab →
        </Link>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Quick conversational intake"
      className="fixed bottom-5 right-5 z-30 w-[min(330px,calc(100vw-2rem))] rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-5 text-[#2a201a] shadow-xl"
    >
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        aria-label="Dismiss quick intake"
        className="absolute right-3 top-3 rounded-full px-2 py-1 text-lg leading-none text-[#6b5a4e] hover:bg-[#f2ece5] hover:text-[#2a201a]"
      >
        ×
      </button>
      <p className="mb-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
        Need a faster start?
      </p>
      <h2 className="pr-5 font-serif text-[1.25rem] font-medium leading-tight text-[#1f1610]">
        Tell us what happened.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6b5a4e]">
        Answer a few conversational questions and get matched with disaster aid programs.
      </p>
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#3d2b20] px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#2b1e15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d2b20]"
      >
        Start conversational intake →
      </button>
    </aside>
  );
}
