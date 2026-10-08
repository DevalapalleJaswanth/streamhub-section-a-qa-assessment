import path from 'node:path';
import { mkdir } from 'node:fs/promises';

export const reportsDirectory = path.resolve('reports');
export const evidenceDirectory = path.resolve('evidence');
export const screenshotsDirectory = path.join(evidenceDirectory, 'screenshots');
export const tracesDirectory = path.join(evidenceDirectory, 'traces');
export const logsDirectory = path.join(evidenceDirectory, 'logs');

export function safeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'scenario';
}

export async function ensureEvidenceDirectories(): Promise<void> {
  await Promise.all([
    mkdir(reportsDirectory, { recursive: true }),
    mkdir(screenshotsDirectory, { recursive: true }),
    mkdir(tracesDirectory, { recursive: true }),
    mkdir(logsDirectory, { recursive: true }),
  ]);
}
