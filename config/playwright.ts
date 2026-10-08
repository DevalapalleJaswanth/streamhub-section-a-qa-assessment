import type { BrowserType, LaunchOptions } from 'playwright';
import { chromium, firefox, webkit } from 'playwright';
import { env } from './env';

const browserTypes: Record<string, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

export function getBrowserType(): BrowserType {
  const browserType = browserTypes[env.browser];
  if (!browserType) {
    throw new Error(`Unsupported BROWSER value: ${env.browser}. Use chromium, firefox, or webkit.`);
  }
  return browserType;
}

export function getBrowserLaunchOptions(): LaunchOptions {
  return {
    headless: env.headless,
  };
}
