export function CompassMark({ needleColor }: { needleColor: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <polygon points="8,1.5 10,8 8,14.5 6,8" fill="#b0673f" />
      <polygon points="1.5,8 8,6 14.5,8 8,10" fill={needleColor} />
    </svg>
  );
}
