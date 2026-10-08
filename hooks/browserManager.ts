import type { Browser } from 'playwright';
import { getBrowserLaunchOptions, getBrowserType } from '../config/playwright';

let sharedBrowser: Browser | undefined;

export async function launchSharedBrowser(): Promise<void> {
  if (!sharedBrowser) {
    sharedBrowser = await getBrowserType().launch(getBrowserLaunchOptions());
  }
}

export function getSharedBrowser(): Browser {
  if (!sharedBrowser) {
    throw new Error('Shared browser has not been launched. Check the BeforeAll hook.');
  }
  return sharedBrowser;
}

export async function closeSharedBrowser(): Promise<void> {
  const browserToClose = sharedBrowser;
  sharedBrowser = undefined;
  await browserToClose?.close();
}
