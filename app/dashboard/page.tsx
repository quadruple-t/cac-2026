'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import AidDashboard from '@/components/features/aid-dashboard';
import AidIntakeForm from '@/components/features/aid-intake';
import DocumentChecklist from '@/components/features/document-checklist';
import { getEligiblePrograms, rankProgramsByUrgency, UserSituation, AidProgram } from '@/lib/aid-programs';
import { generateDocumentChecklist } from '@/lib/document-requirements';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);
  const [eligiblePrograms, setEligiblePrograms] = useState<AidProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'documents'>('programs');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    // Load user situation from Firebase
    const loadUserSituation = async () => {
      try {
        const res = await fetch('/api/user-situation');
        if (res.ok) {
          const data = await res.json();
          if (data.situation) {
            setUserSituation(data.situation);
            const eligible = getEligiblePrograms(data.situation);
            const ranked = rankProgramsByUrgency(eligible);
            setEligiblePrograms(ranked);
          }
        }
      } catch (error) {
        console.error('Error loading user situation:', error);
      }
      setIsLoading(false);
    };

    loadUserSituation();
  }, [user, loading, router]);

  const handleFormSubmit = async (situation: UserSituation) => {
    try {
      const res = await fetch('/api/user-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(situation),
      });
      if (res.ok) {
        setUserSituation(situation);
        const eligible = getEligiblePrograms(situation);
        const ranked = rankProgramsByUrgency(eligible);
        setEligiblePrograms(ranked);
      } else {
        console.error('Failed to save user situation');
      }
    } catch (error) {
      console.error('Error saving user situation:', error);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/user-situation', { method: 'DELETE' });
      setUserSituation(null);
      setEligiblePrograms([]);
    } catch (error) {
      console.error('Error deleting user situation:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
        <Navigation />
        <main className="flex-1">
          <div className="text-center py-12">
            <p className="text-[#6b5a4e]">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-[22px] py-[66px]">
          {/* Header */}
          <div className="mb-[34px] text-center">
            <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Disaster Aid Center
            </p>
            <h1 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Your Personalized Aid Resources
            </h1>
            <p className="text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Answer a few questions about your situation to discover eligible aid programs and get a personalized document checklist for your applications.
            </p>
          </div>

          {/* Main Content */}
          {!userSituation ? (
            <AidIntakeForm onSubmit={handleFormSubmit} />
          ) : (
            <div>
              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-white border border-[#e4d9cf] rounded-[14px] p-1">
                  <button
                    onClick={() => setActiveTab('programs')}
                    className={`px-6 py-3 rounded-[10px] font-medium text-[1.05rem] transition-colors ${
                      activeTab === 'programs'
                        ? 'bg-[#b0673f] text-white'
                        : 'text-[#6b5a4e] hover:text-[#2a201a]'
                    }`}
                  >
                    Aid Programs ({eligiblePrograms.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-3 rounded-[10px] font-medium text-[1.05rem] transition-colors ${
                      activeTab === 'documents'
                        ? 'bg-[#b0673f] text-white'
                        : 'text-[#6b5a4e] hover:text-[#2a201a]'
                    }`}
                  >
                    Document Checklist ({generateDocumentChecklist(userSituation).length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'programs' ? (
                <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />
              ) : (
                <DocumentChecklist
                  documents={generateDocumentChecklist(userSituation)}
                  onReset={handleReset}
                />
              )}

              <div className="text-center mt-8">
                <button
                  onClick={handleReset}
                  className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
                >
                  ← Start Over
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

