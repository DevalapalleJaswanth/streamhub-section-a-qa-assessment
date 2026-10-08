import { BasePage } from './BasePage';

export class ReportPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/reports');
  }

  heading() {
    return this.page.getByRole('heading', { name: /your repayment projection/i });
  }

  calculationSummary() {
    return this.page.getByRole('heading', { name: /calculation summary/i });
  }

  emiValue() {
    return this.page
      .getByRole('article', { name: /monthly emi/i })
      .getByText(/^\$[\d,]+\.\d{2}$/);
  }

  async displayedEmi(): Promise<string> {
    await this.heading().waitFor({ state: 'visible' });
    return (await this.emiValue().textContent())?.trim() ?? '';
  }

  principalInterestChart() {
    return this.page.getByRole('img', { name: /payment composition/i });
  }

  amortizationTable() {
    return this.page.getByRole('table', { name: /monthly loan amortization schedule/i });
  }
}
