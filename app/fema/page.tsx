'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import SiteFooter from '@/components/site-footer';
import { PageHeader } from '@/components/page-header';
import FemaExplainer from '@/components/features/fema-explainer';

export default function FemaExplainerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
        <Navigation />
        <main className="flex-1">
          <div className="ac-page ac-page-narrow">
            <p className="ac-muted" role="status">Loading…</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <div className="ac-page ac-page-narrow">
          <PageHeader
            kicker="FEMA letter help"
            title="Understand your FEMA letter"
            lead="Paste the letter and get a plain-language explanation of your status, any deadlines, and what to do next."
          />
          <FemaExplainer />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
