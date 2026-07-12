'use client';

import { useState } from 'react';
import Navigation from '@/components/navigation';
import SituationIntake from '@/components/features/situation-intake';
import DocumentChecklist from '@/components/features/document-checklist';
import { UserSituation, generateDocumentChecklist } from '@/lib/document-requirements';
import Link from 'next/link';

export default function ChecklistPage() {
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);

  const handleFormSubmit = (situation: UserSituation) => {
    setUserSituation(situation);
  };

  const handleReset = () => {
    setUserSituation(null);
  };

  return (
    <div className="min-h-screen bg-[#f2ece5] py-40 px-4">
      <Navigation />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <h1 className="font-serif text-[clamp(2.5rem,7vw,4rem)] font-medium leading-[1.08] tracking-[-0.015em] text-[#1f1610] mb-4">
            Document Checklist Generator
          </h1>
          <p className="text-[#6b5a4e] text-[clamp(1.1rem,2.8vw,1.3rem)] leading-relaxed max-w-2xl">
            Get your personalized document checklist for disaster aid applications
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
      </div>
    </div>
  );
}
