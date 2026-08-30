'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Photo = {
  src: string;
  alt: string;
};

const PHOTOS: Photo[] = [
  { src: '/images/hero/hero-1.png', alt: 'A rescue crew tending to a survivor after being airlifted to safety' },
  { src: '/images/hero/hero-2.png', alt: 'Responders navigating a flooded street by boat' },
  { src: '/images/hero/hero-3.png', alt: 'A FEMA worker helping a survivor fill out an individual assistance form' },
  { src: '/images/hero/hero-4.png', alt: 'Volunteers clearing storm debris from a neighborhood' },
  { src: '/images/hero/hero-5.png', alt: 'National Guard members distributing water to a community' },
];

export function HeroRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHOTOS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative aspect-[4/5] w-[340px] flex-none overflow-hidden rounded-[22px] border border-[#e4d9cf] bg-[#faf6f1] sm:w-[400px] lg:w-[440px]">
      {PHOTOS.map((photo, i) => (
        <div
          key={photo.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 440px, (min-width: 640px) 400px, 340px"
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
