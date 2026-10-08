export type EmiInputs = {
  principal: number;
  annualInterestRate: number;
  tenureYears: number;
};

/**
 * Independent test-side EMI calculation.
 * Do not replace this with an import from the application domain layer.
 */
export function calculateExpectedEmi({ principal, annualInterestRate, tenureYears }: EmiInputs): number {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfPayments = tenureYears * 12;

  if (monthlyRate === 0) return principal / numberOfPayments;

  return principal * monthlyRate * (1 + monthlyRate) ** numberOfPayments
    / ((1 + monthlyRate) ** numberOfPayments - 1);
}

export function parseCurrency(value: string): number {
  const normalized = value.replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Unable to parse currency value: "${value}"`);
  }

  return parsed;
}
