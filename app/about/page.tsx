import Navigation from '@/components/navigation';
import { PageHeader } from '@/components/page-header';
import SiteFooter from '@/components/site-footer';
import { TeamAvatar } from '@/components/team-avatar';

const features = [
  {
    title: "Conversational intake",
    body: "Tell Wren about your situation in your own words. AI turns your answers into a list of programs you may qualify for.",
  },
  {
    title: "Aid program discovery",
    body: "Federal, state, and local aid programs in one place, matched to your eligibility.",
  },
  {
    title: "Document checklist",
    body: "The documents each program asks for, so you can gather them before you apply.",
  },
  {
    title: "Deadline tracking",
    body: "Application deadlines ranked by urgency, with contact details for each organization.",
  },
  {
    title: "FEMA letter explainer",
    body: "Paste a FEMA letter and AI explains, in plain language, where your application stands and what to do next.",
  },
  {
    title: "Application status tracking",
    body: "Follow your progress across several programs from one dashboard.",
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
    title: "Independent, not a government site",
    body: "Aid Compass is not FEMA, the State of North Carolina, or any agency. We point you to their official pages; we don't speak for them.",
  },
  {
    title: "We don't want your sensitive data",
    body: "You apply on each program's own secure site. Aid Compass never asks for Social Security or bank details to get you your matches.",
  },
];

const contributors = [
  {
    name: "Taran Duba",
    photo: "/team/taran-duba.jpg",
    bio: "Taran helped shape Aid Compass around the real questions disaster survivors face, keeping the experience clear, practical, and focused on people.",
  },
  {
    name: "Mukesh Ramanathan",
    photo: "/team/mukesh-ramanathan.jpg",
    bio: "Mukesh built most of the frontend, including the conversational AI intake, program discovery, and the document checklist.",
  },
  {
    name: "Ansh Nayak",
    photo: "/team/ansh-nayak.jpg",
    bio: "Ansh built most of the database of programs and charitable organizations, and tuned how it connects to each feature.",
  },
  {
    name: "Hannah Kim",
    photo: "/team/hannah-kim.jpg",
    bio: "Hannah brought a people-first perspective to the project, helping us keep the language welcoming and easy to understand.",
  },
];

const credits = [
  {
    title: "Development",
    body: "Built with Next.js, React, TypeScript, and Firebase Authentication.",
  },
  {
    title: "AI",
    body: "Firebase AI (Gemini) handles natural language and document analysis.",
  },
  {
    title: "Data sources",
    body: "Program information comes from FEMA, SBA, USDA, NC Emergency Management, the American Red Cross, and NC 211.",
  },
  {
    title: "Special thanks",
    body: "To the disaster relief organizations and volunteers who work tirelessly to help communities recover.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <div className="ac-page">
          <PageHeader
            title="A student-built guide through Helene recovery aid"
            lead="Aid Compass helps disaster survivors in western North Carolina find their way through federal, state, and local aid programs."
          />

          {/* Mission */}
          <section
            aria-labelledby="mission-h"
            className="grid gap-x-12 gap-y-4 border-t border-[#e4d9cf] pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]"
          >
            <h2 id="mission-h" className="ac-h2">Our mission</h2>
            <div className="max-w-[62ch] space-y-4 text-[1.05rem] leading-relaxed text-[#55483d]">
              <p>
                Aid Compass makes the recovery process simpler for people and families hit by a disaster. Juggling several aid programs, each with its own eligibility rules and deadlines, is overwhelming.
              </p>
              <p>
                We gather that information in one place, so survivors can reach the support they need quickly.
              </p>
            </div>
          </section>

          {/* Features */}
          <section aria-labelledby="features-h" className="mt-20">
            <div className="ac-page-head">
              <h2 id="features-h" className="ac-h2">What Aid Compass does</h2>
            </div>
            <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <li key={feature.title} className="ac-card">
                  <h3 className="ac-h3">{feature.title}</h3>
                  <p className="m-0 text-[1rem] leading-relaxed text-[#55483d]">{feature.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Who built this */}
          <section
            aria-labelledby="trust-h"
            className="ac-band-dark mt-20 rounded-[16px] border px-6 py-10 md:px-10 md:py-12"
          >
            <div className="mb-8 max-w-[46rem]">
              <p className="mb-3 text-[0.92rem] font-bold text-[#e0a987]">Who built this</p>
              <h2 id="trust-h" className="ac-h2">Built to help, not to collect.</h2>
            </div>
            <ul className="m-0 grid list-none gap-x-10 gap-y-7 p-0 md:grid-cols-2">
              {trustPoints.map((point) => (
                <li key={point.title} className="border-t border-[#4a3628] pt-5">
                  <h3 className="ac-h3">{point.title}</h3>
                  <p className="ac-muted m-0 text-[1rem] leading-relaxed">{point.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Team */}
          <section aria-labelledby="team-h" className="mt-20">
            <div className="ac-page-head">
              <h2 id="team-h" className="ac-h2">The team</h2>
            </div>
            <ul className="m-0 grid list-none gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {contributors.map((person) => (
                <li key={person.name} className="flex flex-col items-start">
                  <TeamAvatar name={person.name} photo={person.photo} />
                  <h3 className="ac-h3 mt-5!">{person.name}</h3>
                  <p className="m-0 text-[0.98rem] leading-relaxed text-[#55483d]">{person.bio}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Credits */}
          <section aria-labelledby="credits-h" className="mt-20">
            <div className="ac-page-head">
              <h2 id="credits-h" className="ac-h2">Credits</h2>
            </div>
            <dl className="ac-card m-0 grid gap-x-10 gap-y-6 md:grid-cols-2">
              {credits.map((credit) => (
                <div key={credit.title}>
                  <dt className="ac-h3">{credit.title}</dt>
                  <dd className="m-0 text-[1rem] leading-relaxed text-[#55483d]">{credit.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Contact */}
          <section
            aria-labelledby="contact-h"
            className="mt-20 flex flex-col gap-5 border-t border-[#e4d9cf] pt-10 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 id="contact-h" className="ac-h3">Questions or feedback?</h2>
              <p className="ac-muted m-0 text-[1rem]">
                Aid Compass is open source, and we welcome contributions.
              </p>
            </div>
            <a
              href="https://github.com/quadruple-t/cac-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="ac-btn-ghost flex-none"
            >
              View the code on GitHub
            </a>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
