import type { Page } from 'playwright';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async open(pathname: string): Promise<void> {
    await this.page.goto(pathname);
  }

  async waitForHeading(name: string | RegExp): Promise<void> {
    await this.page.getByRole('heading', { name }).waitFor();
  }
}
