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
    <div className="min-h-screen bg-[#f2ece5] py-12 px-4">
      <Navigation />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#1f1610]">
            Document Checklist Generator
          </h1>
          <p className="text-xl text-[#55483d] mt-2">
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
