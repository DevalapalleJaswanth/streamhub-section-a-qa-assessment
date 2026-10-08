import dotenv from 'dotenv';

dotenv.config();

function required(name: string, usage: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. ${usage} Copy .env.example to .env.`);
  }
  return value;
}

function booleanValue(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

export const env = {
  browser: process.env.BROWSER ?? 'chromium',
  headless: booleanValue('HEADLESS', true),
  traceOnFailure: booleanValue('TRACE_ON_FAILURE', true),
  screenshotOnFailure: booleanValue('SCREENSHOT_ON_FAILURE', true),
} as const;

export function getAppBaseUrl(): string {
  return required('APP_BASE_URL', 'UI and self-healing execution requires this URL.');
}

export function getApiBaseUrl(): string {
  return required('API_BASE_URL', 'API execution requires this URL.');
}
