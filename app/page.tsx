'use client';

import Navigation from '@/components/navigation';
import { CompassMark } from '@/components/compass-mark';
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
              <h2 className="text-[1.2rem] font-bold text-[#1f1610]">Need help right away?</h2>
              <p className="text-[1rem] text-[#55483d]">For housing, food, utilities, and local services, call NC 211. For an immediate emergency, call 911.</p>
            </div>
            <a href="tel:211" className="flex-none rounded-lg bg-[#3d2b20] px-5 py-3 text-center text-[1.05rem] font-bold text-white no-underline hover:bg-[#2b1e15]">
              Call 211
            </a>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          aria-labelledby="how-h"
          className="mx-auto max-w-[1080px] px-[22px] py-[66px]"
        >
          <p className="mb-3 text-[1rem] font-bold uppercase tracking-[0.06em] text-[#895031]">
            How it works
          </p>
          <h2
            id="how-h"
            className="mb-10 max-w-[700px] font-serif text-[clamp(2.1rem,5vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1f1610]"
          >
            Three simple steps to get started.
          </h2>
          <ol className="m-0 flex list-none flex-wrap gap-6 p-0">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="ac-lift min-w-[260px] flex-1 basis-[260px] rounded-[18px] border border-[#e4d9cf] bg-[#faf6f1] px-6 py-7"
              >
                <span
                  aria-hidden="true"
                  className="mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#c6805c,#895031)] text-[1.05rem] font-bold text-white shadow-[0_8px_16px_rgba(176,103,63,0.25)]"
                >
                  {i + 1}
                </span>
                <h3 className="mb-2.5 text-[1.3rem] font-semibold text-[#2a201a]">
                  {step.title}
                </h3>
                <p className="m-0 text-[1.1rem] leading-relaxed text-[#6b5a4e]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#241811] text-[#cdbcae]">
        <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-x-12 gap-y-7 px-[22px] py-11">
          <div className="max-w-[340px]">
            <div className="mb-3 flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border-[1.5px] border-[#8a705d]"
              >
                <CompassMark needleColor="#cdbcae" />
              </span>
              <span className="text-base font-bold text-white">
                Aid Compass
              </span>
            </div>
            <p className="m-0 text-[0.92rem] text-[#a8917f]">
              A free tool for finding Hurricane Helene recovery support in
              western North Carolina.
            </p>
          </div>
          <div className="flex flex-wrap gap-12">
            <div>
              <h3 className="mb-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[#8a705d]">
                Get help
              </h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[0.95rem]">
                <li>
                  <a
                    href="/dashboard"
                    className="text-[#cdbcae] no-underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Open Aid Compass
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-[#cdbcae] no-underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-[#cdbcae] no-underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Privacy policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[#8a705d]">
                Contact
              </h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[0.95rem]">
                <li>
                  <a
                    href="mailto:hello@aidcompass.org"
                    className="text-[#cdbcae] no-underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    hello@aidcompass.org
                  </a>
                </li>
                <li className="text-[#a8917f]">
                  Congressional App Challenge, NC-08
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-[#3b2a1f]">
          <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-x-[18px] gap-y-1.5 px-[22px] py-4 text-[0.82rem] text-[#8a705d]">
            <span>© 2026 Aid Compass. An independent student project.</span>
            <span>
              Not affiliated with FEMA, the State of North Carolina, or any
              government agency.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
