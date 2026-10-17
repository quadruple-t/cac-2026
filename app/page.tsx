'use client';

import Navigation from '@/components/navigation';
import SiteFooter from '@/components/site-footer';
import { AidStage } from '@/components/landing/aid-stage';

const steps = [
  {
    title: "Tell us what happened",
    body: "Chat with Wren or fill in the questionnaire: where you live, what was damaged, and whether you own or rent.",
  },
  {
    title: "See what fits",
    body: "Programs are ranked against your answers. Pin the ones you want to follow and their deadlines line up for you.",
  },
  {
    title: "Apply on the official site",
    body: "Every program links to its own official application. You apply there; we never ask for your Social Security or bank details.",
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
            <p className="ac-lead">You don&apos;t need any documents to start.</p>
          </div>
          <ol className="m-0 list-none border-t border-[#e4d9cf] p-0">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-[#e4d9cf] py-6 md:grid-cols-[3.5rem_minmax(0,0.9fr)_minmax(0,1.6fr)] md:gap-x-10"
              >
                <span aria-hidden="true" className="font-serif text-[2rem] leading-none text-[#a85f38]">
                  {i + 1}
                </span>
                <h3 className="ac-h3">{step.title}</h3>
                <p className="col-start-2 m-0 max-w-[56ch] text-[1.05rem] leading-relaxed text-[#55483d] md:col-start-auto">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
