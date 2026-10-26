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
    <span className="relative flex h-[216px] w-[216px] flex-none items-center justify-center overflow-hidden rounded-full border border-[#4a362a] bg-[#3d2b20]">
      {photo && !failed ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes="216px"
          className="object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={name} role="img" className="font-serif text-[3.5rem] font-medium text-[#cc9c82]">
          {initialsFor(name)}
        </span>
      )}
    </span>
  );
}
