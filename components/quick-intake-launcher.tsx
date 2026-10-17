'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ConversationalIntake from '@/components/features/conversational-intake';
import { persistIntakeSituation } from '@/lib/user-situation-client';

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
        className="ac-btn-dark ac-sheen fixed bottom-5 right-5 z-30 border-[#5a4232]"
      >
        Find aid
      </button>
    );
  }

  const closeButton = (
    <button
      type="button"
      onClick={() => setIsOpen(false)}
      aria-label="Dismiss quick intake"
      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-[10px] text-[1.4rem] leading-none text-[#6b5a4e] hover:bg-[#f2ece5] hover:text-[#1f1610] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#b0673f]"
    >
      <span aria-hidden="true">×</span>
    </button>
  );

  if (isChatOpen) {
    return (
      <aside
        aria-label="Quick conversational intake"
        className="fixed bottom-5 right-5 z-30 w-[min(390px,calc(100vw-2rem))] max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-[16px] border border-[#cdbcae] bg-[#faf6f1] p-3 text-[#1f1610]"
      >
        <div className="mb-2 flex items-center justify-between gap-3 pl-1">
          <p className="font-serif text-[1.2rem] font-medium text-[#1f1610]">Find aid</p>
          {closeButton}
        </div>
        <ConversationalIntake
          compact
          onComplete={async (situation) => {
            const outcome = await persistIntakeSituation(situation);
            router.push(outcome === 'saved' ? '/dashboard' : '/conversational');
          }}
        />
        <Link
          href="/conversational"
          className="ac-link mt-2 flex min-h-11 items-center justify-center text-[0.95rem] no-underline hover:underline"
        >
          Continue on the full page
        </Link>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Quick conversational intake"
      className="fixed bottom-5 right-5 z-30 w-[min(330px,calc(100vw-2rem))] rounded-[16px] border border-[#cdbcae] bg-[#faf6f1] p-5 text-[#1f1610]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="ac-kicker mt-2.5">Need help?</p>
        <div className="-mr-2 -mt-2">{closeButton}</div>
      </div>
      <h2 className="font-serif text-[1.6rem] font-medium leading-tight tracking-[-0.01em] text-[#1f1610]">
        Find aid in a few steps.
      </h2>
      <p className="mt-3 text-[1.05rem] leading-relaxed text-[#55483d]">
        Answer a few questions to explore programs that may fit your situation.
      </p>
      <button type="button" onClick={() => setIsChatOpen(true)} className="ac-btn ac-sheen mt-5 w-full">
        Start the questions
      </button>
    </aside>
  );
}
