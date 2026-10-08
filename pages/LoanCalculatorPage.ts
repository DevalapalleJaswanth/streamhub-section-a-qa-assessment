import { BasePage } from './BasePage';

export class LoanCalculatorPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/calculator');
  }

  loanAmountInput() {
    return this.page.getByRole('spinbutton', { name: /loan amount/i });
  }

  interestRateInput() {
    return this.page.getByRole('spinbutton', { name: /annual interest rate/i });
  }

  tenureInput() {
    return this.page.getByRole('spinbutton', { name: /loan tenure/i });
  }

  calculateButton() {
    return this.page.getByRole('button', { name: /calculate my loan/i });
  }
}
