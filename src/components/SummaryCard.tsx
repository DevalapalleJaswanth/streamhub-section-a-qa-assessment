type SummaryCardProps = {
  label: string;
  value: string;
  supportingText?: string;
};

export function SummaryCard({ label, value, supportingText }: SummaryCardProps) {
  return (
    <article className="summary-card" aria-label={label}>
      <p className="summary-card__label">{label}</p>
      <p className="summary-card__value">{value}</p>
      {supportingText && <p className="summary-card__supporting">{supportingText}</p>}
    </article>
  );
}
