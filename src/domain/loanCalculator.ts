import type { AmortizationRow, LoanCalculation, LoanScenario } from './loanTypes';
import { isValidLoanScenario } from './loanRules';

/**
 * Calculates a fixed-rate loan schedule. This module intentionally has no
 * React or browser dependencies so the formula can be tested independently.
 */
export function calculateLoan(scenario: LoanScenario): LoanCalculation {
  if (!isValidLoanScenario(scenario)) {
    throw new RangeError('Loan scenario contains unsupported values.');
  }

  const { principal, annualInterestRate, tenureYears } = scenario;
  const numberOfPayments = tenureYears * 12;
  const monthlyRate = annualInterestRate / 100 / 12;

  const monthlyPayment = monthlyRate === 0
    ? principal / numberOfPayments
    : principal * (monthlyRate * (1 + monthlyRate) ** numberOfPayments)
      / ((1 + monthlyRate) ** numberOfPayments - 1);

  const amortization: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= numberOfPayments; month += 1) {
    const interest = balance * monthlyRate;
    const scheduledPrincipal = monthlyPayment - interest;
    const principalPaid = month === numberOfPayments
      ? balance
      : Math.min(scheduledPrincipal, balance);
    const payment = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);

    amortization.push({
      month,
      payment,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  const totalRepayment = amortization.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = amortization.reduce((sum, row) => sum + row.interest, 0);

  return {
    monthlyPayment,
    totalInterest,
    totalRepayment,
    principalAmount: principal,
    interestAmount: totalInterest,
    amortization,
  };
}
