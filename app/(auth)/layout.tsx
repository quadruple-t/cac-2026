import Link from "next/link";
import { CompassMark } from "@/components/compass-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#f2ece5] px-[22px] py-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex justify-center">
          <Link
            href="/"
            className="flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-2 text-[#1f1610] no-underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#b0673f]"
          >
            <span
              aria-hidden="true"
              className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border-[1.5px] border-[#3d2b20]"
            >
              <CompassMark needleColor="#3d2b20" />
            </span>
            <span className="text-[1.06rem] font-bold tracking-[-0.01em]">
              Aid Compass
            </span>
          </Link>
        </div>
        <div className="ac-card ac-reveal sm:p-8!">
          {children}
        </div>
      </div>
    </div>
  );
}
