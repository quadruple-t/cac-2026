import Image from 'next/image';

export function Logo({ size }: { size: number }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className="flex-none rounded-full"
    />
  );
}
