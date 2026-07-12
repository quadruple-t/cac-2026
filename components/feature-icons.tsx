type IconProps = { className?: string };

/** Small inline line-art icons matching the compass/contour visual language, used in place of emoji. */

export function AmountIcon({ className = '' }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5v7M10 6.2c0-.9-.9-1.6-2-1.6s-2 .6-2 1.4c0 1.9 4 1 4 2.9 0 .8-.9 1.4-2 1.4s-2-.7-2-1.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className = '' }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.75V8l2.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DocumentIcon({ className = '' }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <path d="M4.5 2h5l2 2v10h-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M6.25 7h3.5M6.25 9.25h3.5M6.25 11.5h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function TipIcon({ className = '' }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <path d="M8 2.5a3.75 3.75 0 0 1 2.1 6.86c-.4.28-.6.72-.6 1.14v.5h-3v-.5c0-.42-.2-.86-.6-1.14A3.75 3.75 0 0 1 8 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6.75 13h2.5M7 14.25h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ className = '' }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <path d="M3.3 2.5h2.1l1 2.7-1.3 1.2a7.5 7.5 0 0 0 4.5 4.5l1.2-1.3 2.7 1v2.1c0 .7-.6 1.2-1.3 1.1A11 11 0 0 1 2.2 3.8c-.1-.7.4-1.3 1.1-1.3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ className = '' }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <rect x="2" y="3.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 4.5 8 9l5.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobeIcon({ className = '' }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.75 8h12.5M8 1.75c1.6 1.7 2.5 3.9 2.5 6.25S9.6 12.55 8 14.25C6.4 12.55 5.5 10.35 5.5 8S6.4 3.45 8 1.75Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function CompleteIcon({ className = '' }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.3 8.2 7.2 10l3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
