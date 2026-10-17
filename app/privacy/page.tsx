import Link from "next/link";
import Navigation from "@/components/navigation";

export const metadata = {
  title: "Privacy",
  description:
    "Why Aid Compass asks you to sign in, what we save, and how you can delete it.",
};

const sections = [
  {
    title: "Why you need an account",
    body: [
      "Your answers describe a hard moment in your life: where you live, what was damaged, your household and income. An account lets us keep that information tied only to you, so no one else can open it.",
      "It also means you don't have to start over. Your answers and pinned programs are saved to your account and are there when you come back on any device. Your chat with Wren and your deadline checklist progress are kept in this browser only.",
    ],
  },
  {
    title: "What we save",
    list: [
      "Your sign-in details: your email address, or the basic profile Google shares with us if you choose Continue with Google. We never see or store your Google password.",
      "Your situation: the answers you give in the questionnaire or chat, such as county, address, what was damaged, ownership, damage severity, household income range, insurance, and farm status.",
      "Your pinned programs, saved to your account. Your conversation with Wren and the deadline steps you check off are stored only in your browser, not on our servers, and clearing your browser data removes them.",
    ],
  },
  {
    title: "What we don't ask for",
    body: [
      "Aid Compass never asks for your Social Security number or bank or card details. You apply on each program's own official site, not here.",
    ],
  },
  {
    title: "How we use it",
    list: [
      "To match you with aid programs and show your deadlines and next steps.",
      "To generate plain-language summaries, answers, and letter explanations with AI. When you use these features, the relevant text (for example your answers, your chat messages, or a FEMA letter you paste) is sent to Google's Gemini model through Firebase to produce a response.",
      "We don't sell your information and we don't use it for advertising.",
    ],
  },
  {
    title: "Where it lives",
    body: [
      "Your data is stored in Google Firebase (Authentication and Firestore). We use a secure, HTTP-only session cookie to keep you signed in for up to 5 days, and Firebase App Check (reCAPTCHA) to block automated abuse. Some details in the application records we keep are encrypted before they are stored.",
    ],
  },
  {
    title: "Your choices",
    list: [
      "Edit any answer at any time on the Settings page.",
      "Choose Clear all my data on the Settings page to delete your saved situation.",
      "To delete your account entirely, or ask any question about your data, email hello@aidcompass.org.",
    ],
  },
  {
    title: "Who we are",
    body: [
      "Aid Compass is an independent student project built for the Congressional App Challenge (NC-08). It is not FEMA, the State of North Carolina, or any government agency. If this policy changes, we will update this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <section className="mx-auto max-w-[720px] px-[22px] py-[66px]">
          <div className="mb-[34px] text-center">
            <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Privacy
            </p>
            <h1 className="ac-reveal mb-4 font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610]">
              Your information, in plain language
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e]">
              Last updated October 14, 2026
            </p>
          </div>

          <div className="ac-reveal-2 flex flex-col gap-4">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-6"
              >
                <h2 className="mb-3 font-serif text-[1.2rem] font-medium text-[#1f1610]">
                  {section.title}
                </h2>
                {section.body?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-3 text-[0.95rem] leading-relaxed text-[#6b5a4e] last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-[0.95rem] leading-relaxed text-[#6b5a4e]">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-[#6b5a4e]">
            <Link href="/" className="font-semibold text-[#3d2b20]">
              Back to home
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
