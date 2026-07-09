import type { MatchResult } from "@/lib/matching";
import { formatAmount, formatDeadline } from "@/lib/format";

export function ProgramCard({ result }: { result: MatchResult }) {
  const { program, matchedOn, notes } = result;
  const deadline = formatDeadline(program.deadline);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{program.name}</h3>
          <p className="text-sm text-slate-500">{program.agency}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
          {formatAmount(program.maxAmount)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{program.description}</p>

      {/* Why this matched — visible eligibility reasoning */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Why you matched
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {matchedOn.map((reason) => (
            <li
              key={reason.field + reason.detail}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900"
            >
              <span className="font-semibold">{reason.field}:</span>
              {reason.detail}
            </li>
          ))}
        </ul>
      </div>

      {/* Deadline */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="text-slate-500">
          Deadline:{" "}
          <span
            className={
              deadline.urgent
                ? "font-semibold text-amber-700"
                : "font-medium text-slate-800"
            }
          >
            {deadline.label}
          </span>
          {deadline.daysLeft !== null && deadline.daysLeft >= 0 && (
            <span className="text-slate-500"> ({deadline.daysLeft} days left)</span>
          )}
        </span>
      </div>

      {/* Required documents */}
      <details className="mt-4 rounded-lg bg-slate-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          Documents you&apos;ll need ({program.requiredDocs.length})
        </summary>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
          {program.requiredDocs.map((doc) => (
            <li key={doc}>{doc}</li>
          ))}
        </ul>
      </details>

      {/* Notes / nudges */}
      {notes.length > 0 && (
        <ul className="mt-3 space-y-1">
          {notes.map((note) => (
            <li key={note} className="text-xs text-slate-500">
              • {note}
            </li>
          ))}
        </ul>
      )}

      <a
        href={program.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-sky-700 px-5 text-sm font-medium text-white transition-colors hover:bg-sky-800"
      >
        Apply / Learn more →
      </a>
    </article>
  );
}
