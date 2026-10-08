import type { LoanCalculation } from '../domain/loanTypes';
import { formatCurrency } from '../utils/formatters';
import { SummaryCard } from './SummaryCard';

type CalculationSummaryProps = {
  calculation: LoanCalculation;
};

export function CalculationSummary({ calculation }: CalculationSummaryProps) {
  return (
    <section aria-labelledby="calculation-summary-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your projection</p>
          <h2 id="calculation-summary-heading">Calculation summary</h2>
        </div>
      </div>
      <div className="summary-grid">
        <SummaryCard
          label="Monthly EMI"
          value={formatCurrency(calculation.monthlyPayment)}
          supportingText="Fixed monthly payment"
        />
        <SummaryCard
          label="Total interest"
          value={formatCurrency(calculation.totalInterest)}
          supportingText="Cost of borrowing"
        />
        <SummaryCard
          label="Total repayment"
          value={formatCurrency(calculation.totalRepayment)}
          supportingText="Principal plus interest"
        />
      </div>
    </section>
  );
}
