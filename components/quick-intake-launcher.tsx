'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ConversationalIntake from '@/components/features/conversational-intake';

export default function QuickIntakeLauncher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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
        className="ac-sheen fixed bottom-5 right-5 z-30 rounded-full px-5 py-3.5 text-[1rem] font-bold text-white bg-[#b0673f] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#895031] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b0673f]"
      >
        Find aid
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
          <p className="text-[0.9rem] font-bold uppercase tracking-[0.06em] text-[#895031]">Find aid</p>
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
        <Link href="/conversational" className="mt-3 block text-center text-[0.95rem] font-semibold text-[#895031] no-underline hover:text-[#6b5a4e]">
          Continue on a full page →
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
      <p className="mb-2 text-[0.9rem] font-bold uppercase tracking-[0.06em] text-[#895031]">
        Need help?
      </p>
      <h2 className="pr-5 font-serif text-[1.6rem] font-medium leading-tight text-[#1f1610]">
        Find aid in a few steps.
      </h2>
      <p className="mt-3 text-[1.05rem] leading-relaxed text-[#6b5a4e]">
        Answer a few questions to explore programs that may fit your situation.
      </p>
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="ac-sheen mt-5 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-[1.05rem] font-bold text-white bg-[#b0673f] no-underline transition-transform hover:-translate-y-0.5 hover:bg-[#895031] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b0673f]"
      >
        Start here →
      </button>
    </aside>
  );
}
