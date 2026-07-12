import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import Navigation from "@/components/navigation";

export default async function FemaExplainerPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-[22px] py-[66px]">
          <div className="mb-[34px] text-center">
            <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              FEMA Explainer
            </p>
            <h1 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Coming Soon
            </h1>
            <p className="text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              This page is under construction.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
