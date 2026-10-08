import { request, type APIRequestContext, type BrowserContext, type Page } from 'playwright';
import { World, type IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { getApiBaseUrl } from '../config/env';
import { ScenarioLogger } from '../utils/logger';
import type { EmiInputs } from '../utils/emiCalculator';

export class AutomationWorld extends World {
  context!: BrowserContext;
  page!: Page;
  request?: APIRequestContext;
  emiInputs: Partial<EmiInputs> = {};
  tracingStarted = false;
  logger = new ScenarioLogger();

  constructor(options: IWorldOptions) {
    super(options);
  }

  async getApiRequestContext(): Promise<APIRequestContext> {
    if (!this.request) {
      this.request = await request.newContext({ baseURL: getApiBaseUrl() });
    }
    return this.request;
  }
}

setWorldConstructor(AutomationWorld);
