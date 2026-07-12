import Navigation from '@/components/navigation';

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

export default function AboutPage() {
  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-[22px] py-[66px]">
          {/* Header */}
          <div className="mb-[34px] text-center">
            <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              About
            </p>
            <h1 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Aid Compass
            </h1>
            <p className="text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
              Helping disaster survivors navigate the complex landscape of federal, state, and local aid programs.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-[#faf6f1] rounded-[14px] p-8 border border-[#e4d9cf] mb-8">
            <h2 className="font-serif text-[1.5rem] font-medium text-[#1f1610] mb-4">
              Our Mission
            </h2>
            <p className="text-[#6b5a4e] text-[1.05rem] leading-relaxed">
              Aid Compass was created to simplify the disaster recovery process for individuals and families affected by disasters. We understand that navigating multiple aid programs, understanding eligibility requirements, and managing application deadlines can be overwhelming. Our platform consolidates this information into one easy-to-use interface, helping survivors access the support they need quickly and efficiently.
            </p>
          </div>

          {/* Features */}
          <div className="bg-[#faf6f1] rounded-[14px] p-8 border border-[#e4d9cf] mb-8">
            <h2 className="font-serif text-[1.5rem] font-medium text-[#1f1610] mb-4">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Conversational AI Intake</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Natural language interface powered by AI to understand your situation and match you with eligible programs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Aid Program Discovery</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Comprehensive database of federal, state, and local aid programs with eligibility matching.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Document Checklist</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Personalized document requirements for each program to streamline your application process.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Deadline Tracking</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Track application deadlines with urgency indicators and contact information for each organization.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">FEMA Letter Explainer</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  AI-powered analysis of FEMA correspondence to help you understand your application status and next steps.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Application Status Tracking</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Monitor your application progress across multiple programs in one centralized dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Who Built This */}
          <div className="bg-[#33241a] text-[#eaddd0] rounded-[14px] p-8 mb-8">
            <div className="max-w-[760px]">
              <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#cc9c82]">
                Who built this
              </p>
              <h2 className="mb-[30px] font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-white">
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

          {/* Credits */}
          <div className="bg-[#faf6f1] rounded-[14px] p-8 border border-[#e4d9cf] mb-8">
            <h2 className="font-serif text-[1.5rem] font-medium text-[#1f1610] mb-4">
              Credits
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Development Team</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Built with Next.js, React, TypeScript, and Firebase Authentication.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">AI Integration</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Powered by Firebase AI (Gemini) for natural language processing and document analysis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Data Sources</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  Aid program information sourced from FEMA, SBA, USDA, NC Emergency Management, American Red Cross, and NC 211.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1f1610] mb-2">Special Thanks</h3>
                <p className="text-[#6b5a4e] text-[1.05rem]">
                  To all the disaster relief organizations and volunteers who work tirelessly to help communities recover.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center">
            <p className="text-[#6b5a4e] text-[1.05rem]">
              Questions or feedback? This project is open source and welcomes contributions.
            </p>
            <a 
              href="https://github.com/quadruple-t/cac-2026" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-4 text-[#b0673f] hover:text-[#895031] font-medium"
            >
              View on GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
