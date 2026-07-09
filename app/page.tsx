import Link from "next/link";
import { programs } from "@/lib/matching";

const steps = [
  {
    title: "Answer a few questions",
    body: "Tell us your county, whether you rent or own, and the damage you experienced. Takes about a minute.",
  },
  {
    title: "See programs you match",
    body: "We check your answers against real federal, state, and local aid programs — and show you why each one matched.",
  },
  {
    title: "Apply with confidence",
    body: "Get deadlines, a combined document checklist, and direct links to each application.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-5">
      <section className="py-14 sm:py-20">
        <p className="mb-3 inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
          For Hurricane Helene survivors in western North Carolina
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          Find the disaster aid you actually qualify for.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          After a disaster, the hardest part is knowing where to start. Aid
          Compass matches your situation to {programs.length} aid programs and
          shows you exactly what to do next.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/intake"
            className="inline-flex h-12 items-center justify-center rounded-full bg-sky-700 px-6 font-medium text-white transition-colors hover:bg-sky-800"
          >
            Find my aid programs
          </Link>
          <a
            href="https://www.disasterassistance.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Go straight to FEMA
          </a>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800">
              {i + 1}
            </div>
            <h2 className="font-semibold text-slate-900">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
