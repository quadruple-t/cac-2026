// Formats a program deadline for display and computes urgency.
export interface DeadlineInfo {
  label: string;
  /** Days remaining, or null for rolling / ongoing deadlines. */
  daysLeft: number | null;
  urgent: boolean;
  passed: boolean;
}

export function formatDeadline(deadline: string, now: Date = new Date()): DeadlineInfo {
  if (deadline === "Ongoing") {
    return { label: "Ongoing — no set deadline", daysLeft: null, urgent: false, passed: false };
  }

  const date = new Date(`${deadline}T23:59:59`);
  if (Number.isNaN(date.getTime())) {
    return { label: deadline, daysLeft: null, urgent: false, passed: false };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((date.getTime() - now.getTime()) / msPerDay);
  const label = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    label,
    daysLeft,
    urgent: daysLeft >= 0 && daysLeft <= 30,
    passed: daysLeft < 0,
  };
}

export function formatAmount(maxAmount: number | null): string {
  if (maxAmount === null) return "Free help / referrals";
  return `Up to $${maxAmount.toLocaleString()}`;
}
