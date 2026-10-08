import type { LoanScenario } from '../domain/loanTypes';
import { isValidLoanScenario } from '../domain/loanRules';

export const DEFAULT_SCENARIO: LoanScenario = {
  principal: 250000,
  annualInterestRate: 6.5,
  tenureYears: 20,
};

export function scenarioToQuery(scenario: LoanScenario): string {
  const params = new URLSearchParams({
    amount: String(scenario.principal),
    rate: String(scenario.annualInterestRate),
    years: String(scenario.tenureYears),
  });
  return params.toString();
}

export function scenarioFromQuery(search: string): LoanScenario | null {
  const params = new URLSearchParams(search);
  const principal = Number(params.get('amount'));
  const annualInterestRate = Number(params.get('rate'));
  const tenureYears = Number(params.get('years'));

  if (!params.has('amount') || !params.has('rate') || !params.has('years')) {
    return null;
  }

  const scenario = { principal, annualInterestRate, tenureYears };
  return isValidLoanScenario(scenario) ? scenario : null;
}
