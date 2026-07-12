import Link from "next/link";
import { CompassMark } from "@/components/compass-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#f2ece5] px-[22px] py-16">
      <div className="w-full max-w-[400px]">
        <Link
          href="/"
          className="ac-reveal mb-6 flex items-center justify-center gap-2.5 text-[#2a201a] no-underline"
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
        <div className="ac-reveal-2 rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
