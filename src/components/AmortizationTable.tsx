import type { LoanCalculation } from '../domain/loanTypes';
import { formatCurrency } from '../utils/formatters';

type AmortizationTableProps = {
  calculation: LoanCalculation;
};

export function AmortizationTable({ calculation }: AmortizationTableProps) {
  const visibleRows = calculation.amortization.slice(0, 12);

  return (
    <section className="panel" aria-labelledby="amortization-heading">
      <div className="section-heading section-heading--table">
        <div>
          <p className="eyebrow">Repayment schedule</p>
          <h2 id="amortization-heading">First 12 monthly payments</h2>
        </div>
        <p className="muted-text">Showing {visibleRows.length} of {calculation.amortization.length} payments</p>
      </div>
      <div className="table-wrapper">
        <table>
          <caption className="sr-only">Monthly loan amortization schedule</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Payment</th>
              <th scope="col">Principal</th>
              <th scope="col">Interest</th>
              <th scope="col">Balance</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                <td>{formatCurrency(row.payment)}</td>
                <td>{formatCurrency(row.principal)}</td>
                <td>{formatCurrency(row.interest)}</td>
                <td>{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
