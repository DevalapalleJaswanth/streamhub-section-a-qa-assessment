import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Copy .env.example to .env.`);
  }
  return value;
}

function booleanValue(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

export const env = {
  appBaseUrl: required('APP_BASE_URL'),
  browser: process.env.BROWSER ?? 'chromium',
  headless: booleanValue('HEADLESS', true),
  traceOnFailure: booleanValue('TRACE_ON_FAILURE', true),
  screenshotOnFailure: booleanValue('SCREENSHOT_ON_FAILURE', true),
} as const;

export function getApiBaseUrl(): string {
  return required('API_BASE_URL');
}
