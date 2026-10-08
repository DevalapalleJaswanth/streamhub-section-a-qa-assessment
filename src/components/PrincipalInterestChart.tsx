import type { LoanCalculation } from '../domain/loanTypes';
import { formatCurrency } from '../utils/formatters';

type PrincipalInterestChartProps = {
  calculation: LoanCalculation;
};

export function PrincipalInterestChart({ calculation }: PrincipalInterestChartProps) {
  const total = calculation.principalAmount + calculation.interestAmount;
  const principalPercentage = total === 0 ? 0 : (calculation.principalAmount / total) * 100;
  const interestPercentage = total === 0 ? 0 : (calculation.interestAmount / total) * 100;

  return (
    <section className="panel" aria-labelledby="breakdown-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Payment composition</p>
          <h2 id="breakdown-heading">Principal vs interest</h2>
        </div>
      </div>
      <div
        className="breakdown-chart"
        role="img"
        aria-label={`Payment composition: ${formatCurrency(calculation.principalAmount)} principal and ${formatCurrency(calculation.interestAmount)} interest`}
      >
        <svg viewBox="0 0 100 18" aria-hidden="true" focusable="false">
          <rect className="chart-interest" x="0" y="0" width="100" height="18" rx="9" />
          <rect className="chart-principal" x="0" y="0" width={principalPercentage} height="18" rx="9" />
        </svg>
      </div>
      <ul className="chart-legend" aria-label="Chart values">
        <li className="legend-item">
          <span className="legend-swatch legend-swatch--principal" aria-hidden="true" />
          <span>Principal</span>
          <strong>{formatCurrency(calculation.principalAmount)}</strong>
          <span className="legend-percent">({principalPercentage.toFixed(1)}%)</span>
        </li>
        <li className="legend-item">
          <span className="legend-swatch legend-swatch--interest" aria-hidden="true" />
          <span>Interest</span>
          <strong>{formatCurrency(calculation.interestAmount)}</strong>
          <span className="legend-percent">({interestPercentage.toFixed(1)}%)</span>
        </li>
      </ul>
    </section>
  );
}
