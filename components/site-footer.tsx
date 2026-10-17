import Link from 'next/link';
import { CompassMark } from '@/components/compass-mark';

const linkClass =
  'text-[#cdbcae] no-underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export default function SiteFooter() {
  return (
    <footer className="bg-[#241811] text-[#cdbcae]">
      <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-x-12 gap-y-8 px-[22px] py-12">
        <div className="max-w-[340px]">
          <div className="mb-3 flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border-[1.5px] border-[#8a705d]"
            >
              <CompassMark needleColor="#cdbcae" />
            </span>
            <span className="text-base font-bold text-white">Aid Compass</span>
          </div>
          <p className="m-0 text-[0.95rem] leading-relaxed text-[#a8917f]">
            A free tool for finding Hurricane Helene recovery support in western North Carolina.
          </p>
        </div>
        <div className="flex flex-wrap gap-12">
          <div>
            <h2 className="mb-3 font-serif text-[1.05rem] font-medium text-white">Get help</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[0.95rem]">
              <li><Link href="/conversational" className={linkClass}>Find aid</Link></li>
              <li><Link href="/dashboard" className={linkClass}>My aid</Link></li>
              <li><a href="tel:211" className={linkClass}>Call NC 211</a></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-[1.05rem] font-medium text-white">About</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[0.95rem]">
              <li><Link href="/about" className={linkClass}>Who made this</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy policy</Link></li>
              <li><a href="mailto:hello@aidcompass.org" className={linkClass}>hello@aidcompass.org</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[#3b2a1f]">
        <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-x-[18px] gap-y-1.5 px-[22px] py-4 text-[0.85rem] text-[#a8917f]">
          <span>© 2026 Aid Compass, an independent student project for the Congressional App Challenge (NC-08).</span>
          <span>Not affiliated with FEMA, the State of North Carolina, or any government agency.</span>
        </div>
      </div>
    </footer>
  );
}
