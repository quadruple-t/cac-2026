'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import SiteFooter from '@/components/site-footer';
import { PageHeader } from '@/components/page-header';
import DeadlineTracker from '@/components/features/deadline-tracker';
import { rankedProgramToAidProgram } from '@/lib/sheets/aid-programs-adapter';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';

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
        const res = await fetch('/api/user-situation');
        if (res.ok) {
          const data = await res.json();
          if (data.situation) {
            const programsRes = await fetch('/api/aid-programs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data.situation),
            });
            if (programsRes.ok) {
              const programsData = await programsRes.json();
              setPrograms(programsData.programs.map(rankedProgramToAidProgram));
            }
          }
        }
      } catch (error) {
        console.error('Error loading programs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, [user, loading, router]);

  const handleStatusChange = (programId: string, status: ApplicationStatus) => {
    setApplicationStatuses(prev => ({ ...prev, [programId]: status }));
  };

  const isPageLoading = loading || (isLoading && Boolean(user));
  const isSignedOut = !isPageLoading && !user;

  // One layout for every state, so the header stays put (and only animates
  // in once) while the plan loads.
  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <div className="ac-page">
          {isSignedOut ? (
            <PageHeader
              title="Sign in to view your plan"
              lead="Your deadlines and progress are available after you sign in."
            />
          ) : (
            <PageHeader
              title="Track your application deadlines"
              lead="Turn the programs you pinned into a short list of deadlines and next steps."
            />
          )}

          {isPageLoading ? (
            <p role="status" className="ac-muted m-0">
              Loading your plan...
            </p>
          ) : (
            user && (
              <DeadlineTracker
                programs={programs}
                applicationStatuses={applicationStatuses}
                onStatusChange={handleStatusChange}
              />
            )
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
