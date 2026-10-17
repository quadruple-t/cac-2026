/**
 * The page opener used across the site: an optional kicker, a Newsreader
 * headline in sentence case, a lead paragraph, and optional actions. Left
 * aligned, like the feature frames on the homepage.
 */
export function PageHeader({
  kicker,
  title,
  lead,
  children,
}: {
  kicker?: string;
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="ac-page-head ac-reveal">
      {kicker && <p className="ac-kicker">{kicker}</p>}
      <h1 className="ac-h1">{title}</h1>
      {lead && <p className="ac-lead">{lead}</p>}
      {children && <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">{children}</div>}
    </header>
  );
}
