import Link from "next/link";
import { ProgramCard } from "@/app/components/ProgramCard";
import { paramsToAnswers } from "@/lib/answers";
import { DAMAGE_TYPES } from "@/lib/constants";
import { buildDocumentChecklist, matchPrograms } from "@/lib/matching";

function damageLabel(value: string): string {
  return DAMAGE_TYPES.find((d) => d.value === value)?.label ?? value;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const answers = paramsToAnswers(await searchParams);

  // Someone landed here without completing intake.
  if (!answers) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Let&apos;s start with a few questions
        </h1>
        <p className="mt-2 text-slate-600">
          Answer a short intake so we can match you to the right aid programs.
        </p>
        <Link
          href="/intake"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-sky-700 px-6 font-medium text-white transition-colors hover:bg-sky-800"
        >
          Start intake
        </Link>
      </div>
    );
  }

  const results = matchPrograms(answers);
  const checklist = buildDocumentChecklist(results);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      {/* Summary of what we matched on */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {results.length > 0
            ? `You may qualify for ${results.length} program${results.length === 1 ? "" : "s"}`
            : "No exact matches yet"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">Based on what you told us:</p>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          <SummaryChip>{answers.county} County</SummaryChip>
          <SummaryChip>
            {answers.ownerOrRenter === "owner" ? "Homeowner" : "Renter"}
          </SummaryChip>
          {answers.damageType.map((d) => (
            <SummaryChip key={d}>{damageLabel(d)}</SummaryChip>
          ))}
          <SummaryChip>{answers.incomeBracket}</SummaryChip>
          <SummaryChip>
            {answers.appliedToFema ? "Applied to FEMA" : "Not yet applied to FEMA"}
          </SummaryChip>
        </ul>
        <Link
          href="/intake"
          className="mt-4 inline-block text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          ← Edit my answers
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p>
            We couldn&apos;t find a program that matches every answer. Your best
            starting points are always{" "}
            <a
              href="https://www.disasterassistance.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-700 hover:underline"
            >
              FEMA
            </a>{" "}
            and{" "}
            <a
              href="https://nc211.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-700 hover:underline"
            >
              NC 211
            </a>
            . Try{" "}
            <Link href="/intake" className="font-medium text-sky-700 hover:underline">
              editing your answers
            </Link>{" "}
            if something wasn&apos;t quite right.
          </p>
        </div>
      ) : (
        <>
          {/* Combined document checklist */}
          {checklist.length > 0 && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Your combined document checklist
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Gather these once — they cover every program below.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {checklist.map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-sm text-slate-700">
                    <span aria-hidden className="mt-0.5 text-emerald-600">
                      ✓
                    </span>
                    {doc}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Matched program cards */}
          <section className="mt-6 space-y-4">
            {results.map((result) => (
              <ProgramCard key={result.program.id} result={result} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function SummaryChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
      {children}
    </span>
  );
}
