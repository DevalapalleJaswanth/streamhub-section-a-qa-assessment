import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/');
  }

  heading() {
    return this.page.getByRole('heading', { name: /understand the cost of your next loan/i });
  }

  summaryCard(name: string) {
    return this.page.getByRole('article', { name });
  }

  principalInterestChart() {
    return this.page.getByRole('img', { name: /payment composition/i });
  }

  async openCurrentReport(): Promise<void> {
    await this.page.getByRole('button', { name: /view current report/i }).click();
  }
}
