'use client';

import Image from 'next/image';
import { useState } from 'react';

interface TeamAvatarProps {
  name: string;
  /** Path under /public, e.g. /team/taran-duba.jpg. Falls back to initials if missing or broken. */
  photo?: string;
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function TeamAvatar({ name, photo }: TeamAvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="relative flex h-[128px] w-[128px] flex-none items-center justify-center overflow-hidden rounded-full border border-[#e4d9cf] bg-[#eadfd4]">
      {photo && !failed ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes="128px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={name} role="img" className="font-serif text-[2.4rem] font-medium tracking-[-0.02em] text-[#895031]">
          {initialsFor(name)}
        </span>
      )}
    </span>
  );
}
