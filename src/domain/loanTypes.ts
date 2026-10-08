export type LoanScenario = {
  principal: number;
  annualInterestRate: number;
  tenureYears: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type LoanCalculation = {
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  principalAmount: number;
  interestAmount: number;
  amortization: AmortizationRow[];
};
