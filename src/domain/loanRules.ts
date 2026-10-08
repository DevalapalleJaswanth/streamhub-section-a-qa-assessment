import type { LoanScenario } from './loanTypes';

export const LOAN_LIMITS = {
  maxPrincipal: 1_000_000_000,
  maxAnnualInterestRate: 100,
  maxTenureYears: 50,
} as const;

export function hasValidInterestPrecision(value: number): boolean {
  const roundedHundredths = Math.round(value * 100);
  return Math.abs(value * 100 - roundedHundredths) < 1e-9;
}

export function isValidLoanScenario(scenario: LoanScenario): boolean {
  return Number.isSafeInteger(scenario.principal)
    && scenario.principal > 0
    && scenario.principal <= LOAN_LIMITS.maxPrincipal
    && Number.isFinite(scenario.annualInterestRate)
    && scenario.annualInterestRate >= 0
    && scenario.annualInterestRate <= LOAN_LIMITS.maxAnnualInterestRate
    && hasValidInterestPrecision(scenario.annualInterestRate)
    && Number.isInteger(scenario.tenureYears)
    && scenario.tenureYears > 0
    && scenario.tenureYears <= LOAN_LIMITS.maxTenureYears;
}
