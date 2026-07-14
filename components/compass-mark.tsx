export function CompassMark({ needleColor }: { needleColor: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" fill="none" stroke={needleColor} strokeWidth="1" opacity="0.45" />
      <path d="M9 1.25v2.1M9 14.65v2.1M1.25 9h2.1M14.65 9h2.1" stroke={needleColor} strokeWidth="1.1" strokeLinecap="round" />
      <polygon points="9,2.9 11.1,9 9,15.1 6.9,9" fill="#b0673f" />
      <polygon points="2.9,9 9,6.9 15.1,9 9,11.1" fill={needleColor} />
      <circle cx="9" cy="9" r="1.25" fill="#f2ece5" />
    </svg>
  );
}
