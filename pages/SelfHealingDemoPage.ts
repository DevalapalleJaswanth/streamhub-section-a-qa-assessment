import type { Locator, Page } from 'playwright';
import { screenshotsDirectory, safeFileName } from '../utils/paths';
import type { ScenarioLogger } from '../utils/logger';

type HealingAction =
  | { kind: 'click' }
  | { kind: 'fill'; value: string };

type CandidateDefinition = {
  description: string;
  expectedRole: string;
  locator: (page: Page) => Locator;
};

type HealingTarget = {
  name: string;
  failedSelector: string;
  expectedRole: string;
  action: HealingAction;
  brokenLocator: (page: Page) => Locator;
  candidates: CandidateDefinition[];
};

export type FailureObservation = {
  failedSelector: string;
  url: string;
  error: string;
  screenshotPath: string;
  nearbyText: string;
  interactiveElements: string;
};

export type CandidateValidation = {
  description: string;
  count: number;
  visible: boolean;
  role: string | null;
  expectedRole: string;
  actionSucceeded: boolean;
  accepted: boolean;
  reason: string;
};

export type HealingResult = {
  name: string;
  observation: FailureObservation;
  candidates: CandidateValidation[];
  selectedCandidate?: string;
};

export interface LocatorSuggestionProvider {
  suggest(target: HealingTarget, observation: FailureObservation): CandidateDefinition[];
}

/**
 * Simulates the output of an AI locator suggestion service without making an
 * external API call. Keeping this behind an interface makes the demo
 * replaceable with a real provider later.
 */
export class SimulatedSuggestionProvider implements LocatorSuggestionProvider {
  suggest(target: HealingTarget, _observation: FailureObservation): CandidateDefinition[] {
    return target.candidates;
  }
}

export class SelfHealingDemoPage {
  constructor(
    private readonly page: Page,
    private readonly logger: ScenarioLogger,
  ) {}

  async open(): Promise<void> {
    await this.page.goto('/calculator');
  }

  async runHealing(
    provider: LocatorSuggestionProvider = new SimulatedSuggestionProvider(),
  ): Promise<HealingResult[]> {
    const results: HealingResult[] = [];

    for (const target of this.targets()) {
      const observation = await this.detectFailure(target);
      const validations: CandidateValidation[] = [];
      const suggestions = provider.suggest(target, observation);

      for (const candidate of suggestions) {
        const validation = await this.validateCandidate(candidate, target.action);
        validations.push(validation);
        this.logger.info(
          `${target.name}: ${candidate.description} => ${validation.accepted ? 'accepted' : validation.reason}`,
        );

        if (validation.accepted) {
          results.push({
            name: target.name,
            observation,
            candidates: validations,
            selectedCandidate: candidate.description,
          });
          break;
        }
      }

      if (!results.some((result) => result.name === target.name)) {
        results.push({ name: target.name, observation, candidates: validations });
      }
    }

    return results;
  }

  private async detectFailure(target: HealingTarget): Promise<FailureObservation> {
    const locator = target.brokenLocator(this.page);
    let error = 'The intentionally broken locator unexpectedly succeeded.';

    try {
      await this.performAction(locator, target.action);
    } catch (caughtError) {
      error = String(caughtError);
    }

    const screenshotPath = `${screenshotsDirectory}/self-healing-${safeFileName(target.name)}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    const nearbyText = (await this.page.locator('body').innerText()).slice(0, 2000);
    const interactiveElements = await this.page.locator('button, input, a, [role]').evaluateAll((elements) =>
      elements.slice(0, 40).map((element) => ({
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        accessibleHint: element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 100),
        id: element.getAttribute('id'),
        testId: element.getAttribute('data-testid'),
      })),
    );

    const observation = {
      failedSelector: target.failedSelector,
      url: this.page.url(),
      error,
      screenshotPath,
      nearbyText,
      interactiveElements: JSON.stringify(interactiveElements),
    };
    this.logger.warn(
      `Locator failure detected: ${target.failedSelector}; URL: ${observation.url}; screenshot: ${screenshotPath}`,
    );
    this.logger.info(`Accessibility/DOM context for ${target.name}: ${observation.interactiveElements}`);
    return observation;
  }

  private async validateCandidate(
    candidate: CandidateDefinition,
    action: HealingAction,
  ): Promise<CandidateValidation> {
    const locator = candidate.locator(this.page);
    const count = await locator.count();
    if (count !== 1) {
      return this.rejectedCandidate(candidate, count, false, null, `expected exactly one match, got ${count}`);
    }

    const visible = await locator.isVisible();
    if (!visible) {
      return this.rejectedCandidate(candidate, count, false, null, 'matched element is not visible');
    }

    const role = await this.semanticRole(locator);
    if (role !== candidate.expectedRole) {
      return this.rejectedCandidate(
        candidate,
        count,
        visible,
        role,
        `expected role ${candidate.expectedRole}, got ${role ?? 'unknown'}`,
      );
    }

    try {
      await this.performAction(locator, action);
      // Clicking the form submits it and navigates to the report. Reset the
      // demo page so the remaining candidates are evaluated in the same state.
      if (action.kind === 'click') await this.open();
      return {
        description: candidate.description,
        count,
        visible,
        role,
        expectedRole: candidate.expectedRole,
        actionSucceeded: true,
        accepted: true,
        reason: 'validated',
      };
    } catch (caughtError) {
      return this.rejectedCandidate(candidate, count, visible, role, `action failed: ${String(caughtError)}`);
    }
  }

  private rejectedCandidate(
    candidate: CandidateDefinition,
    count: number,
    visible: boolean,
    role: string | null,
    reason: string,
  ): CandidateValidation {
    return {
      description: candidate.description,
      count,
      visible,
      role,
      expectedRole: candidate.expectedRole,
      actionSucceeded: false,
      accepted: false,
      reason,
    };
  }

  private async performAction(locator: Locator, action: HealingAction): Promise<void> {
    if (action.kind === 'click') {
      await locator.click({ timeout: 1000 });
      return;
    }
    await locator.fill(action.value, { timeout: 1000 });
  }

  private async semanticRole(locator: Locator): Promise<string | null> {
    return locator.evaluate((element) => {
      const explicitRole = element.getAttribute('role');
      if (explicitRole) return explicitRole;
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'button') return 'button';
      if (tagName === 'input' && (element as HTMLInputElement).type === 'number') return 'spinbutton';
      if (tagName === 'input') return 'textbox';
      if (tagName === 'a') return 'link';
      return tagName;
    });
  }

  private targets(): HealingTarget[] {
    return [
      {
        name: 'wrong button accessible name',
        // INTENTIONALLY BROKEN FOR THE SELF-HEALING ASSESSMENT: actual name is "Calculate my loan".
        failedSelector: "page.getByRole('button', { name: 'Calculate EMI' })",
        expectedRole: 'button',
        action: { kind: 'click' },
        brokenLocator: (page) => page.getByRole('button', { name: 'Calculate EMI' }),
        candidates: [
          {
            description: "page.getByRole('button', { name: 'Calculate Loan' })",
            expectedRole: 'button',
            locator: (page) => page.getByRole('button', { name: 'Calculate Loan' }),
          },
          {
            description: "page.getByRole('button', { name: /Calculate my loan/i })",
            expectedRole: 'button',
            locator: (page) => page.getByRole('button', { name: /Calculate my loan/i }),
          },
        ],
      },
      {
        name: 'outdated text locator',
        // INTENTIONALLY BROKEN FOR THE SELF-HEALING ASSESSMENT: this copy no longer exists.
        failedSelector: "page.getByText('Loan principal', { exact: true })",
        expectedRole: 'spinbutton',
        action: { kind: 'fill', value: '2500000' },
        brokenLocator: (page) => page.getByText('Loan principal', { exact: true }),
        candidates: [
          {
            description: "page.getByLabel('Loan amount')",
            expectedRole: 'spinbutton',
            locator: (page) => page.getByLabel('Loan amount'),
          },
        ],
      },
      {
        name: 'incorrect data-testid',
        // INTENTIONALLY BROKEN FOR THE SELF-HEALING ASSESSMENT: the app has no such test id.
        failedSelector: "page.getByTestId('loan-amount-input')",
        expectedRole: 'spinbutton',
        action: { kind: 'fill', value: '2500000' },
        brokenLocator: (page) => page.getByTestId('loan-amount-input'),
        candidates: [
          {
            description: "page.getByRole('spinbutton', { name: /loan amount/i })",
            expectedRole: 'spinbutton',
            locator: (page) => page.getByRole('spinbutton', { name: /loan amount/i }),
          },
        ],
      },
      {
        name: 'generated CSS class',
        // INTENTIONALLY BROKEN FOR THE SELF-HEALING ASSESSMENT: generated classes are unstable and absent.
        failedSelector: "page.locator('.css-emi-rate-input')",
        expectedRole: 'spinbutton',
        action: { kind: 'fill', value: '10' },
        brokenLocator: (page) => page.locator('.css-emi-rate-input'),
        candidates: [
          {
            description: "page.getByLabel('Annual interest rate')",
            expectedRole: 'spinbutton',
            locator: (page) => page.getByLabel('Annual interest rate'),
          },
        ],
      },
      {
        name: 'positional CSS selector',
        // INTENTIONALLY BROKEN FOR THE SELF-HEALING ASSESSMENT: child order is not a contract.
        failedSelector: "page.locator('form > div:nth-child(4) input')",
        expectedRole: 'spinbutton',
        action: { kind: 'fill', value: '10' },
        brokenLocator: (page) => page.locator('form > div:nth-child(4) input'),
        candidates: [
          {
            description: "page.getByLabel('Loan tenure')",
            expectedRole: 'spinbutton',
            locator: (page) => page.getByLabel('Loan tenure'),
          },
        ],
      },
    ];
  }
}
