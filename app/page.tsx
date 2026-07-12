'use client';

import Navigation from '@/components/navigation';

const CONTOUR_PATHS = [
  "M -40 90 C 220 40 460 150 720 95 S 1180 40 1480 110",
  "M -40 165 C 260 120 500 210 760 160 S 1200 120 1480 175",
  "M -40 240 C 220 300 480 180 720 245 S 1220 300 1480 235",
  "M -40 315 C 240 265 520 360 780 305 S 1200 260 1480 320",
  "M -40 390 C 220 445 500 330 740 395 S 1220 450 1480 385",
  "M -40 470 C 260 420 520 520 760 465 S 1200 415 1480 480",
  "M -40 555 C 220 610 480 500 720 560 S 1220 615 1480 550",
  "M -40 640 C 240 590 520 690 780 635 S 1200 585 1480 650",
];

function CompassMark({ needleColor }: { needleColor: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <polygon points="8,1.5 10,8 8,14.5 6,8" fill="#b0673f" />
      <polygon points="1.5,8 8,6 14.5,8 8,10" fill={needleColor} />
    </svg>
  );
}

const problemPoints = [
  {
    title: "Dozens of programs",
    body: "Federal, state, county, and nonprofit aid — each with its own rules about who qualifies.",
  },
  {
    title: "Repeat forms",
    body: "The same questions asked five different ways, on five different websites, in five different orders.",
  },
  {
    title: "Quiet deadlines",
    body: "Application windows that close while you're still dealing with everything else the storm left behind.",
  },
];

const steps = [
  {
    title: "Tell us what happened",
    body: "A few plain questions about your home, your household, and what the storm damaged. No documents needed yet.",
  },
  {
    title: "See what you qualify for",
    body: "We match your answers against current programs and rank them by what fits you best — and what closes soonest.",
  },
  {
    title: "Apply and keep track",
    body: "Each match lists the documents required, the deadline, and a link straight to the official application. You apply on their site — we just get you there.",
  },
];

const contributors = [
  {
    name: "Taran Duba",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Mukesh Ramanathan",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Ansh Nayak",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Hannah Kim",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const trustPoints = [
  {
    title: "Made by students in NC-08",
    body: "A student team building this for the Congressional App Challenge, for the western North Carolina communities recovering from Helene.",
  },
  {
    title: "Free, and always will be",
    body: "No cost, no upsell, no account required to see your matches. Recovery is expensive enough.",
  },
  {
    title: "Independent — not a government site",
    body: "Aid Compass is not FEMA, the State of North Carolina, or any agency. We point you to their official pages; we don't speak for them.",
  },
  {
    title: "We don't want your sensitive data",
    body: "You apply on each program's own secure site. Aid Compass never asks for Social Security or bank details to get you your matches.",
  },
];

export default function Home() {
  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main id="top" className="flex-1">
        {/* HERO */}
        <section aria-labelledby="hero-h" className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.55]"
          >
            <svg
              viewBox="0 0 1440 700"
              preserveAspectRatio="xMidYMid slice"
              width="100%"
              height="100%"
              className="block"
            >
              <g
                fill="none"
                stroke="#7a5539"
                strokeWidth="1.5"
                strokeOpacity="0.55"
                strokeLinecap="round"
              >
                {CONTOUR_PATHS.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
            </svg>
          </div>
          <div className="relative z-10 mx-auto max-w-[1080px] px-[22px] pb-[72px] pt-16">
            <div className="max-w-[660px]">
              <p className="ac-reveal mb-[18px] text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[#6b5a4e]">
                <span className="text-[#895031]">Hurricane Helene recovery</span>{" "}
                · Western North Carolina
              </p>
              <h1
                id="hero-h"
                className="ac-reveal mb-5 font-serif text-[clamp(2.2rem,6vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.015em] text-[#1f1610]"
              >
                Find the disaster aid you actually qualify for.
              </h1>
              <p className="ac-reveal-2 mb-[30px] max-w-[560px] text-[clamp(1.05rem,2.6vw,1.22rem)] text-[#55483d]">
                Answer a few plain questions about what the storm damaged.
                Aid Compass gives you a ranked list of programs you&apos;re
                eligible for — with deadlines, the documents you&apos;ll
                need, and a direct link to each application.
              </p>
              <div className="ac-reveal-3 flex flex-wrap items-center gap-x-[18px] gap-y-3.5">
                <a
                  href="#"
                  className="rounded-[10px] bg-[#3d2b20] px-[26px] py-3.5 text-[1.05rem] font-semibold text-white no-underline transition-colors hover:bg-[#2b1e15] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#3d2b20]"
                >
                  Get started — it&apos;s free
                </a>
                <span className="text-[0.9rem] text-[#6b5a4e]">
                  Free · No account to start · Independent, not a government
                  site
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section
          aria-labelledby="prob-h"
          className="border-y border-[#e4d9cf] bg-[#faf6f1]"
        >
          <div className="mx-auto max-w-[1080px] px-[22px] py-[60px]">
            <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              The problem
            </p>
            <h2
              id="prob-h"
              className="mb-[34px] max-w-[640px] font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610]"
            >
              The help exists. Finding it is the hard part.
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
              {problemPoints.map((point) => (
                <li
                  key={point.title}
                  className="min-w-[240px] flex-1 basis-[240px] border-t-2 border-[#3d2b20] pt-[18px]"
                >
                  <h3 className="mb-1.5 text-[1.05rem] font-semibold text-[#2a201a]">
                    {point.title}
                  </h3>
                  <p className="m-0 text-[0.98rem] text-[#6b5a4e]">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          aria-labelledby="how-h"
          className="mx-auto max-w-[1080px] px-[22px] py-[66px]"
        >
          <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
            How it works
          </p>
          <h2
            id="how-h"
            className="mb-10 max-w-[640px] font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610]"
          >
            Three steps. About ten minutes.
          </h2>
          <ol className="m-0 flex list-none flex-wrap gap-6 p-0">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="min-w-[260px] flex-1 basis-[260px] rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] px-6 py-[26px]"
              >
                <span
                  aria-hidden="true"
                  className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#b0673f] text-[1.05rem] font-bold text-white"
                >
                  {i + 1}
                </span>
                <h3 className="mb-2 text-[1.15rem] font-semibold text-[#2a201a]">
                  {step.title}
                </h3>
                <p className="m-0 text-[#6b5a4e]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* TRUST */}
        <section aria-labelledby="trust-h" className="bg-[#33241a] text-[#eaddd0]">
          <div className="mx-auto max-w-[1080px] px-[22px] py-[66px]">
            <div className="max-w-[760px]">
              <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#cc9c82]">
                Who built this
              </p>
              <h2
                id="trust-h"
                className="mb-[30px] font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-white"
              >
                Built to help, not to collect.
              </h2>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-[22px] p-0">
              {trustPoints.map((point) => (
                <li key={point.title} className="min-w-[280px] flex-1 basis-[300px]">
                  <h3 className="mb-1.5 text-[1.05rem] font-semibold text-white">
                    {point.title}
                  </h3>
                  <p className="m-0 text-[0.98rem] text-[#cbb8a8]">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
            <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-x-6 gap-y-10 p-0 sm:grid-cols-2">
              {contributors.map((person) => (
                <li key={person.name} className="flex flex-col items-center text-center">
                  <span
                    aria-hidden="true"
                    className="h-[216px] w-[216px] flex-none rounded-full border border-[#4a362a] bg-[#3d2b20] bg-cover bg-center"
                    style={{
                      backgroundImage: `url(/team/${person.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}.jpg)`,
                    }}
                  />
                  <h3 className="mb-1 mt-4 font-serif text-[1.02rem] font-semibold text-white">
                    {person.name}
                  </h3>
                  <p className="m-0 max-w-[240px] font-sans text-[0.92rem] text-[#cbb8a8]">
                    {person.bio}
                  </p>
                </li>
              ))}
            </ul>
          </div>
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
              Free help finding and applying for disaster aid in western
              North Carolina.
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
                    href="#"
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
