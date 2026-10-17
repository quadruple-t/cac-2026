import Link from "next/link";
import Navigation from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import SiteFooter from "@/components/site-footer";

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
        <div className="ac-page ac-page-narrow">
          <PageHeader
            kicker="Privacy policy"
            title="Your information, in plain language"
            lead="Why we ask you to sign in, what we save, and how you can delete it."
          >
            <p className="ac-note m-0">Last updated October 14, 2026</p>
          </PageHeader>

          <div className="max-w-[68ch]">
            {sections.map((section) => (
              <section
                key={section.title}
                className="border-t border-[#e4d9cf] py-8"
              >
                <h2 className="ac-h3 mb-3!">{section.title}</h2>
                {section.body?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-4 text-[1.05rem] leading-relaxed text-[#55483d] last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="ac-points text-[1.05rem] leading-relaxed text-[#55483d]">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <p className="mt-10 border-t border-[#e4d9cf] pt-8 text-[1rem]">
              <Link href="/" className="ac-link">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
