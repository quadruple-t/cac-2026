'use client';

import Navigation from '@/components/navigation';
import SiteFooter from '@/components/site-footer';
import { AidStage } from '@/components/landing/aid-stage';

const steps = [
  {
    title: "Tell us what you need",
    body: "Answer a few simple questions about your household. No documents needed to start.",
  },
  {
    title: "Explore your options",
    body: "See programs that may fit your situation, along with key deadlines.",
  },
  {
    title: "Take the next step",
    body: "Use the official application link when you’re ready to apply.",
  },
];

export default function Home() {
  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation variant="stage" />

      <main id="top" className="flex-1">
        {/* PINNED SCROLL STAGE: hero ring, arc, and feature frames */}
        <AidStage />

        <section aria-label="Urgent help" className="border-y border-[#e4d9cf] bg-[#faf6f1]">
          <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-[22px] py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="ac-h3">Need help right away?</h2>
              <p className="m-0 text-[1rem] text-[#55483d]">For housing, food, utilities, and local services, call NC 211. For an immediate emergency, call 911.</p>
            </div>
            <a href="tel:211" className="ac-btn-dark flex-none">
              Call 211
            </a>
          </div>
        </section>

        {/* HOW IT WORKS: a real sequence, so the steps are numbered */}
        <section id="how-it-works" aria-labelledby="how-h" className="ac-page">
          <div className="ac-page-head">
            <h2 id="how-h" className="ac-h2">Three steps, about five minutes.</h2>
            <p className="ac-lead">No documents needed to start. You can stop and come back any time.</p>
          </div>
          <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="ac-card">
                <span aria-hidden="true" className="mb-5 block font-serif text-[2.4rem] leading-none text-[#b0673f]">
                  {i + 1}
                </span>
                <h3 className="ac-h3">{step.title}</h3>
                <p className="m-0 text-[1.05rem] leading-relaxed text-[#55483d]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
