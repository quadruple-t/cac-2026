'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CompassStatus } from '@/components/compass-status';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const CARDS = [
  { tag: 'FEMA', name: 'Individual Assistance', fact: 'Home repair, rent and personal property after a federal disaster.' },
  { tag: 'SBA', name: 'Disaster home loan', fact: 'Low-interest loans for repairs, open to homeowners and renters.' },
  { tag: 'Food', name: 'Disaster SNAP', fact: 'Short-term food benefits when a storm cuts off your groceries.' },
  { tag: 'Housing', name: 'Rental assistance', fact: 'Help paying rent while your home is unsafe to live in.' },
  { tag: 'Work', name: 'Disaster unemployment', fact: 'Income support if the storm took your job or your shifts.' },
  { tag: 'Documents', name: 'Replacement records', fact: 'Get lost IDs, titles and tax records replaced.' },
  { tag: 'Health', name: 'Crisis counseling', fact: 'Free, confidential support for you and your family.' },
  { tag: 'Utilities', name: 'Utility help', fact: 'Relief on power, water and heating bills.' },
  { tag: 'Home', name: 'Repair grants', fact: 'Grants for repairs insurance does not cover.' },
  { tag: 'Legal', name: 'Free legal aid', fact: 'Help with insurance disputes, contractors and landlords.' },
  { tag: 'Mortgage', name: 'Payment relief', fact: 'Ask your servicer about pauses and forbearance.' },
  { tag: 'Farm', name: 'Ag disaster aid', fact: 'Support for crop, livestock and farm infrastructure losses.' },
  { tag: 'Business', name: 'Small business help', fact: 'Loans and grants to get your doors open again.' },
  { tag: 'Taxes', name: 'Casualty-loss relief', fact: 'Deadline extensions and deductions for storm losses.' },
  { tag: 'Debris', name: 'Cleanup support', fact: 'Free debris removal in declared areas.' },
  { tag: 'State', name: 'NC recovery funds', fact: 'State programs that fill gaps federal aid leaves.' },
] as const;

const SURFACES = ['is-cream', 'is-clay', 'is-bark'] as const;

const N_PANELS = 5;

/* Applied under prefers-reduced-motion and without JS: no pinning, everything readable. */
const STATIC_CSS = `
.ls-track{height:auto}
.ls-stage{position:relative;height:auto;overflow:visible}
.ls-cards,.ls-cue,.ls-arc,.ls-progress{display:none}
.ls-hero{position:relative;left:auto;top:auto;transform:none;opacity:1;margin:0 auto;padding:128px 0 56px;width:min(640px,90vw)}
.ls-features{position:relative;opacity:1;pointer-events:auto}
.ls-panel{position:relative;opacity:1;transform:none;filter:none;padding:64px 22px}
`;

/* -------------------------------------------------------------------------- */
/*  Math helpers                                                              */
/* -------------------------------------------------------------------------- */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const superellipse = (v: number) => Math.sign(v) * Math.abs(v) ** 0.6;
// Deterministic scatter so the opening frame is the same on every load.
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* Scroll map (fractions of the track). Keep in sync with the CSS track height. */
const PANELS_START = 0.4;
const PANELS_SPAN = 0.54;
/* Desktop ring and headline sit centered in the space under the fixed nav. */
const NAV_OFFSET = 30;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function AidStage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const cardsHost = cardsRef.current;
    if (!track || !cardsHost) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = Array.from(cardsHost.children) as HTMLElement[];
    const n = cards.length;
    const panels = featuresRef.current
      ? (Array.from(featuresRef.current.querySelectorAll('.ls-panel')) as HTMLElement[])
      : [];
    const hero = heroRef.current;
    const cue = cueRef.current;
    const arc = arcRef.current;
    const features = featuresRef.current;
    const progressBar = progressRef.current;

    const scatter = cards.map((_, i) => ({
      x: (seeded(i, 1) - 0.5) * 1500,
      y: (seeded(i, 2) - 0.5) * 1000,
      r: (seeded(i, 3) - 0.5) * 160,
    }));

    let target = 0;
    let cur = 0;
    let time = 0;
    let mouse = 0;
    let mouseSmooth = 0;
    const intro = { v: 0 };

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        target = self.progress;
        scheduleSnap();
      },
    });
    target = st.progress;
    cur = target;
    if (target > 0.02) intro.v = 1;
    else gsap.to(intro, { v: 1, duration: 2.4, delay: 0.25, ease: 'power3.out' });

    /* Settle on the nearest feature panel once scrolling pauses. */
    let snapTimer = 0;
    function scheduleSnap() {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        const p = st.progress;
        if (p < PANELS_START - 0.03 || p > PANELS_START + PANELS_SPAN + 0.03) return;
        const y = clamp((p - PANELS_START) / PANELS_SPAN) * (N_PANELS - 1);
        const snapped = PANELS_START + (Math.round(y) / (N_PANELS - 1)) * PANELS_SPAN;
        const top = st.start + snapped * (st.end - st.start);
        if (Math.abs(top - window.scrollY) > 4) window.scrollTo({ top, behavior: 'smooth' });
      }, 220);
    }

    function render() {
      const P = cur;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const small = w < 768;
      const mid = w <= 1024;

      const introE = intro.v;
      const z = ease(0.03, 0.2, P); // ring -> arc
      const q = ease(0.3, 0.4, P); // arc sweeps away

      /* Ring geometry */
      const ringRx = small ? w * 0.8 : Math.min(w * 0.44, 660);
      const ringRy = small ? h * 0.4 : Math.min(h * 0.39, 390);
      const ringCy = small ? 0 : NAV_OFFSET;
      const ringScale = small ? 0.72 : 1;
      const spin = time * 0.003;

      /* Arc geometry */
      const arcR = Math.min(w, h * 1.5) * (small ? 1.5 : mid ? 1.25 : 1.1);
      const arcCy = h * (small ? 0.4 : mid ? 0.32 : 0.28) + arcR;
      const spread = small ? 104 : mid ? 116 : 128;
      const arcScale = small ? 1 : mid ? 1.15 : 1.3;
      const drift = ease(0.2, 0.3, P) * 14;
      const parallax = mouseSmooth * z * (small ? 0 : 60);

      for (let i = 0; i < n; i++) {
        const card = cards[i];
        const a = ((i / n) * 360 + spin) * (Math.PI / 180);
        // Superellipse: pushes the diagonal cards outward so the corners of
        // the headline block keep their breathing room.
        const ringX = superellipse(Math.cos(a)) * ringRx;
        const ringY = superellipse(Math.sin(a)) * ringRy + ringCy;
        const ringRot = Math.sin(a) * 10;

        const sc = scatter[i];
        const e = introE;
        let x = lerp(sc.x, ringX, e);
        let y = lerp(sc.y, ringY, e);
        let rot = lerp(sc.r, ringRot, e);
        let scale = lerp(0.6, ringScale, e);

        const aa = -90 - spread / 2 + (i * spread) / (n - 1) - drift;
        const ar = (aa * Math.PI) / 180;
        x = lerp(x, Math.cos(ar) * arcR + parallax, z);
        y = lerp(y, Math.sin(ar) * arcR + arcCy, z);
        rot = lerp(rot, (aa + 90) * 0.55, z);
        scale = lerp(scale, arcScale, z);

        x -= q * w * 1.7;
        rot += q * 50;

        const op = Math.min(1, e * 4) * (1 - ease(0.88, 1, q));
        card.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.opacity = op.toFixed(3);
        card.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        card.style.pointerEvents = q > 0.4 ? 'none' : 'auto';
      }

      if (hero) {
        const o = ease(0.5, 1, introE) * clamp(1 - z * 2.2);
        hero.style.opacity = o.toFixed(3);
        hero.style.transform = `translate(-50%, calc(-50% + ${((small ? 0 : NAV_OFFSET) + (1 - ease(0.5, 1, introE)) * 14 - z * 36).toFixed(1)}px))`;
        hero.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
        hero.toggleAttribute('inert', o <= 0.5);
      }
      if (cue) {
        cue.style.opacity = (ease(0.9, 1, introE) * clamp(1 - P * 18)).toFixed(3);
      }
      if (arc) {
        const o = ease(0.1, 0.22, P) * (1 - ease(0.27, 0.34, P));
        arc.style.opacity = o.toFixed(3);
        arc.style.transform = `translate(-50%, ${((1 - o) * 18).toFixed(1)}px)`;
      }

      /* Feature panels: scale + blur crossfade, one scene per scroll step */
      const fo = ease(0.34, 0.4, P);
      let dark = false;
      if (features) {
        features.style.opacity = fo.toFixed(3);
        features.style.pointerEvents = fo > 0.5 ? 'auto' : 'none';
        const y = clamp((P - PANELS_START) / PANELS_SPAN) * (N_PANELS - 1);
        const idx = Math.min(N_PANELS - 1, Math.floor(y));
        const frac = idx >= N_PANELS - 1 ? 0 : y - idx;
        const me = ease(0.34, 1, frac);
        const live = (me < 0.5 ? panels[idx] : panels[Math.min(N_PANELS - 1, idx + 1)]) ?? panels[idx];
        dark = fo > 0.5 && live?.dataset.dark === '1';
        for (let i = 0; i < panels.length; i++) {
          let s: number;
          let o: number;
          if (i < idx) {
            s = 1.6;
            o = 0;
          } else if (i > idx + 1) {
            s = 0.86;
            o = 0;
          } else if (i === idx) {
            s = 1 + me * 0.6;
            o = 1 - me;
          } else {
            s = 0.86 + me * 0.14;
            o = me;
          }
          const p = panels[i];
          p.style.transform = `scale(${s.toFixed(3)})`;
          p.style.opacity = o.toFixed(3);
          p.style.filter = o > 0.02 && o < 0.98 ? `blur(${((1 - o) * 9).toFixed(1)}px)` : 'none';
          p.style.zIndex = i === idx ? '2' : '1';
          const active = o > 0.6;
          p.style.pointerEvents = active ? 'auto' : 'none';
          p.toggleAttribute('inert', !active);
        }
        if (progressBar) {
          progressBar.style.opacity = fo.toFixed(3);
          progressBar.style.setProperty('--ls-y', (y / (N_PANELS - 1)).toFixed(4));
        }
      }
      const root = document.documentElement;
      if (dark) root.dataset.acDark = '1';
      else delete root.dataset.acDark;
    }

    const onPointer = (e: PointerEvent) => {
      mouse = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const tick = (_t: number, dt: number) => {
      const step = Math.min(dt, 64);
      time += step;
      cur += (target - cur) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - cur) < 0.00002) cur = target;
      mouseSmooth += (mouse - mouseSmooth) * (1 - Math.exp(-dt / 260));
      render();
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.clearTimeout(snapTimer);
      window.removeEventListener('pointermove', onPointer);
      gsap.killTweensOf(intro);
      st.kill();
      delete document.documentElement.dataset.acDark;
    };
  }, []);

  return (
    <div ref={trackRef} className="ls-track">
      <style>{`@media (prefers-reduced-motion: reduce){${STATIC_CSS}}`}</style>
      <noscript>
        <style>{STATIC_CSS}</style>
      </noscript>
      <div className="ls-stage">
        {/* Orbiting program cards (decorative) */}
        <div ref={cardsRef} className="ls-cards" aria-hidden="true">
          {CARDS.map((c, i) => (
            <div key={c.name} className={`ls-card ${SURFACES[i % SURFACES.length]}`}>
              <div className="ls-card-inner">
                <div className="ls-face">
                  <span className="ls-card-tag">{c.tag}</span>
                  <span className="ls-card-name">{c.name}</span>
                </div>
                <div className="ls-face ls-back">
                  <span className="ls-card-fact">{c.fact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Frame 1: headline inside the ring */}
        <div ref={heroRef} className="ls-hero">
          <p className="ls-hero-kicker">For Hurricane Helene survivors in western North Carolina</p>
          <h1 className="ls-hero-h">Disaster aid is a maze. We&apos;ll walk it with you.</h1>
          <p className="ls-hero-p">
            FEMA, SBA, state and local programs each have their own rules and deadlines. Answer a few questions and
            Aid Compass shows which ones fit your household, what to bring, and when it&apos;s due.
          </p>
          <div className="ls-hero-actions">
            <Link href="/conversational" className="ls-btn">
              Show me what I qualify for
            </Link>
            <span className="ls-hero-note">Free, about five minutes, and not a government site.</span>
          </div>
          <div ref={cueRef} className="ls-cue" aria-hidden="true">
            Scroll to explore
            <span className="ls-cue-line" />
          </div>
        </div>

        {/* Frame 2: ring has opened into an arc */}
        <div ref={arcRef} className="ls-arc" aria-hidden="true">
          <h2 className="ls-arc-h">We sort the pile for you.</h2>
          <p className="ls-arc-p">Federal, state and local help in one list, best fit first. Hover a card to see what it covers.</p>
        </div>

        {/* Frames 3–7: pinned feature scenes */}
        <div ref={featuresRef} className="ls-features">
          <Panel
            title="See what you may qualify for."
            body="Answer a few questions and Aid Compass ranks the programs that fit your household, with what each one covers and where to apply."
            points={[]}
            cta={{ href: '/conversational', label: 'Find my programs' }}
          >
            <MockCard title="Your matches" meta="Sample data">
              <MockRow name="FEMA Individual Assistance" sub="Home repair and rental help">
                <CompassStatus tone="success" label="Likely fit" />
              </MockRow>
              <MockRow name="SBA disaster home loan" sub="Low-interest loan for repairs">
                <CompassStatus tone="progress" label="Possible fit" />
              </MockRow>
              <MockRow name="Disaster SNAP" sub="Short-term food benefits">
                <CompassStatus tone="neutral" label="Check details" />
              </MockRow>
            </MockCard>
          </Panel>

          <Panel
            title="Know what to bring before you apply."
            body="Every program asks for paperwork. Aid Compass turns your answers into one checklist so you gather documents once, not five times."
            points={[]}
            cta={{ href: '/dashboard', label: 'Open my checklist' }}
          >
            <MockCard title="Documents" meta="2 of 4 ready">
              <MockCheck done label="Photo ID" />
              <MockCheck done label="Proof of address" />
              <MockCheck label="Insurance claim letter" />
              <MockCheck label="Photos of the damage" />
            </MockCard>
          </Panel>

          <Panel
            title="Never miss a deadline."
            body="Pin the programs you care about and see which dates are closing first. Steps are ordered by what needs attention soonest."
            points={[]}
            cta={{ href: '/deadlines', label: 'See my deadlines' }}
          >
            <MockCard title="Deadlines" meta="Sample data">
              <MockRow name="Apply for FEMA assistance" sub="Closing soon">
                <CompassStatus tone="attention" label="12 days" />
              </MockRow>
              <MockRow name="Submit SBA loan application" sub="Gather income documents first">
                <CompassStatus tone="progress" label="34 days" />
              </MockRow>
              <MockRow name="File insurance supplement" sub="No fixed date">
                <CompassStatus tone="neutral" label="Open" />
              </MockRow>
            </MockCard>
          </Panel>

          <Panel
            dark
            title="Decode the letter from FEMA."
            body="Paste or type what the letter says. Aid Compass explains it in plain words and tells you the next step, so a request for documents does not end your claim."
            points={[]}
            cta={{ href: '/fema', label: 'Explain my letter' }}
          >
            <MockCard title="FEMA letter" meta="Sample" dark>
              <p className="ls-quote">“We are unable to process your request without additional information.”</p>
              <div className="ls-plain">
                <span className="ls-plain-k">In plain words</span>
                <span>FEMA needs one more document. Upload proof you lived in the home before the storm, then check your status again.</span>
              </div>
            </MockCard>
          </Panel>

          <Panel
            final
            title="Start with five minutes."
            body="Free to use. Not a government site. Your answers are stored under your account, and you can change them any time."
            points={[]}
            cta={{ href: '/conversational', label: 'See support for me' }}
            secondary={{ href: '/privacy', label: 'How we handle your data' }}
          />
        </div>

        <div ref={progressRef} className="ls-progress" aria-hidden="true">
          <span className="ls-progress-fill" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function Panel({
  title,
  body,
  points,
  cta,
  secondary,
  dark,
  final,
  children,
}: {
  title: string;
  body: string;
  points: string[];
  cta: { href: string; label: string };
  secondary?: { href: string; label: string };
  dark?: boolean;
  final?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`ls-panel${dark ? ' is-dark' : ''}${final ? ' is-final' : ''}`}
      data-dark={dark ? '1' : '0'}
      aria-label={title}
    >
      <div className="ls-panel-grid">
        <div className="ls-panel-copy">
          <h2 className="ls-panel-h">{title}</h2>
          <p className="ls-panel-p">{body}</p>
          {points.length > 0 && (
            <ul className="ls-points">
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          <div className="ls-panel-actions">
            <Link href={cta.href} className={`ls-btn${dark ? ' is-light' : ''}`}>
              {cta.label}
            </Link>
            {secondary && (
              <Link href={secondary.href} className="ls-link">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
        {children && <div className="ls-panel-mock">{children}</div>}
      </div>
    </section>
  );
}

function MockCard({
  title,
  meta,
  dark,
  children,
}: {
  title: string;
  meta: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`ls-mock${dark ? ' is-dark' : ''}`} role="img" aria-label={`Example: ${title}`}>
      <div className="ls-mock-head">
        <span className="ls-mock-title">{title}</span>
        <span className="ls-mock-meta">{meta}</span>
      </div>
      <div className="ls-mock-body" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

function MockRow({ name, sub, children }: { name: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="ls-row">
      <div className="ls-row-text">
        <span className="ls-row-name">{name}</span>
        <span className="ls-row-sub">{sub}</span>
      </div>
      {children}
    </div>
  );
}

function MockCheck({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="ls-row">
      <div className="ls-row-text">
        <span className={`ls-row-name${done ? ' is-done' : ''}`}>{label}</span>
      </div>
      <span className={`ls-check${done ? ' is-done' : ''}`}>
        {done && (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 6.3 5 8.8l4.5-5.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </div>
  );
}
