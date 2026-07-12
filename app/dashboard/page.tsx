import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto flex min-h-full max-w-[640px] flex-1 flex-col justify-center px-[22px] py-16">
      <p className="mb-2 text-sm uppercase tracking-[0.08em] text-[#895031]">
        Signed in
      </p>
      <h1 className="mb-4 font-serif text-2xl font-medium text-[#1f1610]">
        {user.email}
      </h1>
      <p className="mb-8 text-[#55483d]">
        This is a placeholder dashboard proving the Firebase Auth + session
        cookie flow works end to end.
      </p>
      <SignOutButton />
    </div>
  );
}
