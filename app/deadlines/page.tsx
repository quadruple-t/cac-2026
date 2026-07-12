'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import DeadlineTracker from '@/components/features/deadline-tracker';
import { getEligiblePrograms, rankProgramsByUrgency, UserSituation, AidProgram, ApplicationStatus } from '@/lib/aid-programs';

export default function DeadlinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<AidProgram[]>([]);
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, ApplicationStatus>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    // Check for saved user situation
    const savedSituation = localStorage.getItem('userSituation');
    if (savedSituation) {
      try {
        const parsedSituation = JSON.parse(savedSituation);
        const eligible = getEligiblePrograms(parsedSituation);
        const ranked = rankProgramsByUrgency(eligible);
        setPrograms(ranked);
      } catch (error) {
        console.error('Error parsing saved situation:', error);
      }
    }
    setIsLoading(false);
  }, [user, loading, router]);

  const handleStatusChange = (programId: string, status: ApplicationStatus) => {
    setApplicationStatuses(prev => ({ ...prev, [programId]: status }));
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
          <DeadlineTracker
            programs={programs}
            applicationStatuses={applicationStatuses}
            onStatusChange={handleStatusChange}
          />
        </section>
      </main>
    </div>
  );
}
