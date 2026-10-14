import Link from "next/link";

// Shown on the sign-in and sign-up screens to explain why an account is
// required, and to link to the full privacy policy.
export function AuthPrivacyNote() {
  return (
    <div className="mb-6 rounded-lg border border-[#e4d9cf] bg-[#f2ece5] px-4 py-3 text-[0.85rem] leading-relaxed text-[#6b5a4e]">
      <p className="m-0 font-semibold text-[#3d2b20]">Why we ask you to sign in</p>
      <p className="m-0 mt-1">
        Your answers are personal. An account keeps them private to you and
        saves your matches, pins, and deadlines so you don&apos;t have to start
        over. We never ask for your Social Security or bank details.{" "}
        <Link href="/privacy" className="font-semibold text-[#895031]">
          Read our privacy policy
        </Link>
      </p>
    </div>
  );
}
