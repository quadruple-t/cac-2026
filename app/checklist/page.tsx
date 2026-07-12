'use client';

import { useState } from 'react';
import Navigation from '@/components/navigation';
import SituationIntake from '@/components/features/situation-intake';
import DocumentChecklist from '@/components/features/document-checklist';
import { UserSituation, generateDocumentChecklist } from '@/lib/document-requirements';

export default function ChecklistPage() {
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);

  const handleFormSubmit = (situation: UserSituation) => {
    setUserSituation(situation);
    // Save to localStorage for use in Aid Dashboard
    localStorage.setItem('userSituation', JSON.stringify(situation));
  };

  const handleReset = () => {
    setUserSituation(null);
    // Clear from localStorage
    localStorage.removeItem('userSituation');
  };

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-[22px] py-[66px]">
          {/* Header */}
          <div className="mb-[34px] text-center">
            <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Document Checklist
            </p>
            <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Generate Your Personalized Document Checklist
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Answer a few questions about your situation and we'll create a customized checklist of documents you need for disaster aid applications.
            </p>
          </div>

          {/* Main Content */}
          {!userSituation ? (
            <SituationIntake onSubmit={handleFormSubmit} />
          ) : (
            <DocumentChecklist
              documents={generateDocumentChecklist(userSituation)}
              onReset={handleReset}
            />
          )}
        </section>
      </main>
    </div>
  );
}
