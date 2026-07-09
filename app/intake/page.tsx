"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { answersToParams } from "@/lib/answers";
import { DAMAGE_TYPES, INCOME_BRACKETS, NC_COUNTIES } from "@/lib/constants";
import type { DamageType, IntakeAnswers, Ownership } from "@/lib/types";

export default function IntakePage() {
  const router = useRouter();

  const [county, setCounty] = useState("");
  const [ownership, setOwnership] = useState<Ownership | "">("");
  const [damageType, setDamageType] = useState<DamageType[]>([]);
  const [incomeIndex, setIncomeIndex] = useState<number | "">("");
  const [appliedToFema, setAppliedToFema] = useState<boolean | "">("");
  const [error, setError] = useState<string | null>(null);

  function toggleDamage(value: DamageType) {
    setDamageType((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!county || !ownership || incomeIndex === "" || appliedToFema === "") {
      setError("Please answer all of the questions so we can match you accurately.");
      return;
    }
    if (damageType.length === 0) {
      setError("Please select at least one type of damage or loss.");
      return;
    }

    const bracket = INCOME_BRACKETS[incomeIndex as number];
    const answers: IntakeAnswers = {
      county,
      ownerOrRenter: ownership,
      damageType,
      income: bracket.value,
      incomeBracket: bracket.label,
      appliedToFema: appliedToFema as boolean,
    };

    router.push(`/results?${answersToParams(answers).toString()}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Let&apos;s find your aid programs
      </h1>
      <p className="mt-2 text-slate-600">
        Answer these questions about your situation. Your answers stay in your
        browser — we don&apos;t store or share anything.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* County */}
        <Field
          label="Which county do you live in?"
          htmlFor="county"
        >
          <select
            id="county"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Select your county…</option>
            {NC_COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c} County
              </option>
            ))}
          </select>
        </Field>

        {/* Ownership */}
        <Field label="Do you own or rent your home?">
          <div className="grid grid-cols-2 gap-3">
            {(["owner", "renter"] as Ownership[]).map((value) => (
              <OptionButton
                key={value}
                selected={ownership === value}
                onClick={() => setOwnership(value)}
              >
                {value === "owner" ? "I own my home" : "I rent my home"}
              </OptionButton>
            ))}
          </div>
        </Field>

        {/* Damage type */}
        <Field label="What kind of damage or loss did you have?" hint="Select all that apply.">
          <div className="grid gap-2 sm:grid-cols-2">
            {DAMAGE_TYPES.map((d) => (
              <label
                key={d.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  damageType.includes(d.value)
                    ? "border-sky-600 bg-sky-50 text-sky-900"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={damageType.includes(d.value)}
                  onChange={() => toggleDamage(d.value)}
                  className="h-4 w-4 accent-sky-700"
                />
                {d.label}
              </label>
            ))}
          </div>
        </Field>

        {/* Income */}
        <Field
          label="What is your household's annual income?"
          hint="Some programs prioritize lower-income households. This is optional."
        >
          <select
            value={incomeIndex}
            onChange={(e) =>
              setIncomeIndex(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Select an income range…</option>
            {INCOME_BRACKETS.map((b, i) => (
              <option key={b.label} value={i}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        {/* FEMA */}
        <Field label="Have you already applied to FEMA for this disaster?">
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={appliedToFema === true}
              onClick={() => setAppliedToFema(true)}
            >
              Yes, I&apos;ve applied
            </OptionButton>
            <OptionButton
              selected={appliedToFema === false}
              onClick={() => setAppliedToFema(false)}
            >
              No, not yet
            </OptionButton>
          </div>
        </Field>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-sky-700 px-6 font-medium text-white transition-colors hover:bg-sky-800 sm:w-auto"
        >
          See my matched programs
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-base font-semibold text-slate-900"
      >
        {label}
      </label>
      {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
        selected
          ? "border-sky-600 bg-sky-50 text-sky-900"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
