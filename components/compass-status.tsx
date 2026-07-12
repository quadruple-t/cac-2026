type CompassStatusTone = 'success' | 'progress' | 'attention' | 'neutral';

const TONE_ANGLE: Record<CompassStatusTone, number> = {
  success: 0,
  progress: 45,
  attention: 100,
  neutral: 100,
};

const TONE_COLOR: Record<CompassStatusTone, string> = {
  success: '#10b981',
  progress: '#f59e0b',
  attention: '#dc2626',
  neutral: '#8a705d',
};

/**
 * Renders the compass needle pointing "aligned" (success), tilted (progress),
 * or off-axis (attention/neutral) — the shared visual language for urgency,
 * application status, and completion across every feature page.
 */
export function CompassStatus({
  tone,
  label,
  angle,
  color,
}: {
  tone: CompassStatusTone;
  label: string;
  /** Override the tone's default needle angle, e.g. for a continuous progress % */
  angle?: number;
  color?: string;
}) {
  const needleAngle = angle ?? TONE_ANGLE[tone];
  const needleColor = color ?? TONE_COLOR[tone];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.04em]"
      style={{ borderColor: needleColor, color: needleColor }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <g className="compass-needle" style={{ transform: `rotate(${needleAngle}deg)` }}>
          <polygon points="8,2 9.1,8 8,14 6.9,8" fill="currentColor" />
        </g>
      </svg>
      {label}
    </span>
  );
}
