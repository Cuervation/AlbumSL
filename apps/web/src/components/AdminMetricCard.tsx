export function AdminMetricCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}): React.JSX.Element {
  return (
    <article className="admin-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
