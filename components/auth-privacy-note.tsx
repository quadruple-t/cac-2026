import Link from "next/link";

// Shown on the sign-in and sign-up screens to explain why an account is
// required, and to link to the full privacy policy.
export function AuthPrivacyNote() {
  return (
    <div className="mt-6 rounded-[10px] border border-[#e4d9cf] px-4 py-3.5 text-[0.9rem] leading-relaxed text-[#6b5a4e]">
      <p className="m-0 font-semibold text-[#1f1610]">Why we ask you to sign in</p>
      <p className="mb-0 mt-1">
        Your answers are personal. An account keeps them private to you and
        saves them, along with your pinned programs, so you don&apos;t have to
        start over. We never ask for your Social Security or bank details.{" "}
        <Link href="/privacy" className="ac-link">
          Read our privacy policy
        </Link>
      </p>
    </div>
  );
}
