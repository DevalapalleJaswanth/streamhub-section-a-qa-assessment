import { writeFile } from 'node:fs/promises';
import { After, AfterAll, Before, BeforeAll, Status } from '@cucumber/cucumber';
import { env } from '../config/env';
import { ensureEvidenceDirectories, logsDirectory, safeFileName, screenshotsDirectory, tracesDirectory } from '../utils/paths';
import { closeSharedBrowser, getSharedBrowser, launchSharedBrowser } from './browserManager';
import { AutomationWorld } from './world';

BeforeAll(async function () {
  await ensureEvidenceDirectories();
});

Before(async function (this: AutomationWorld, { pickle }) {
  this.logger.info(`Starting scenario: ${pickle.name}`);
});

Before({ tags: '@ui' }, async function (this: AutomationWorld, { pickle }) {
  await launchSharedBrowser();
  this.context = await getSharedBrowser().newContext({
    baseURL: env.appBaseUrl,
  });
  this.page = await this.context.newPage();

  if (env.traceOnFailure) {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    this.tracingStarted = true;
  }
});

After(async function (this: AutomationWorld, { pickle, result }) {
  const failed = result?.status === Status.FAILED;
  const scenarioName = safeFileName(`${pickle.uri ?? 'feature'}-${pickle.name}-${pickle.id}`);

  try {
    if (failed && env.screenshotOnFailure && this.page) {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        const screenshotPath = `${screenshotsDirectory}/${scenarioName}.png`;
        await writeFile(screenshotPath, screenshot);
        await this.attach(screenshot, 'image/png');
        this.logger.info(`Failure screenshot: ${screenshotPath}`);
      } catch (error) {
        this.logger.error(`Could not capture failure screenshot: ${String(error)}`);
      }
    }

    if (this.context && this.tracingStarted) {
      try {
        if (failed && env.traceOnFailure) {
          const tracePath = `${tracesDirectory}/${scenarioName}.zip`;
          await this.context.tracing.stop({ path: tracePath });
          this.logger.info(`Failure trace: ${tracePath}`);
          await this.attach(`Trace saved at ${tracePath}`, 'text/plain');
        } else {
          await this.context.tracing.stop();
        }
      } catch (error) {
        this.logger.error(`Could not finalize trace: ${String(error)}`);
      } finally {
        this.tracingStarted = false;
      }
    }
  } finally {
    try {
      await this.context?.close();
    } catch (error) {
      this.logger.error(`Could not close browser context: ${String(error)}`);
    }

    try {
      await this.request?.dispose();
    } catch (error) {
      this.logger.error(`Could not dispose API request context: ${String(error)}`);
    }

    const logPath = `${logsDirectory}/${scenarioName}.log`;
    try {
      await writeFile(logPath, `${this.logger.toText()}\n`, 'utf8');
      await this.attach(this.logger.toText(), 'text/plain');
    } catch (error) {
      console.error(`Could not write scenario log: ${String(error)}`);
    }
  }
});

AfterAll(async function () {
  await closeSharedBrowser();
});
