'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import DeadlineTracker from '@/components/features/deadline-tracker';
import { getEligiblePrograms, rankProgramsByUrgency, AidProgram, ApplicationStatus } from '@/lib/aid-programs';

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

    const loadPrograms = async () => {
      try {
        const response = await fetch('/api/user-situation');
        if (response.ok) {
          const { situation } = await response.json();
          if (situation) {
            setPrograms(rankProgramsByUrgency(getEligiblePrograms(situation)));
            return;
          }
        }

        // The conversational intake still stores its answers locally, so keep
        // that as a fallback until it is migrated to the shared API.
        const savedSituation = localStorage.getItem('userSituation');
        if (savedSituation) {
          setPrograms(rankProgramsByUrgency(getEligiblePrograms(JSON.parse(savedSituation))));
        }
      } catch (error) {
        console.error('Error loading saved situation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, [user, loading, router]);

  const handleStatusChange = (programId: string, status: ApplicationStatus) => {
    setApplicationStatuses(prev => ({ ...prev, [programId]: status }));
  };

  if (loading || (isLoading && user)) {
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

  if (!user) {
    return (
      <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
        <Navigation />
        <main className="flex-1">
          <div className="mx-auto max-w-[640px] px-[22px] py-16 text-center">
            <h1 className="font-serif text-2xl font-medium text-[#1f1610]">Sign in to view your plan</h1>
            <p className="mt-2 text-[#6b5a4e]">Your deadlines and progress are available after you sign in.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-[22px] py-[66px]">
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
