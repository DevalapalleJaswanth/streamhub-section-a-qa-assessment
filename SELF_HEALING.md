# AI-assisted locator self-healing demonstration

This repository contains an isolated proof of concept in `features/self-healing.feature`. It is tagged `@self-healing` and has a dedicated browser lifecycle hook, so it is excluded from the normal suite unless the dedicated command is used:

```bash
npm run test:self-healing
```

The demonstration does not call an external AI service and does not modify production page objects. `pages/SelfHealingDemoPage.ts` contains five locators explicitly marked `INTENTIONALLY BROKEN FOR THE SELF-HEALING ASSESSMENT`.

## Workflow

### Detection

When a Playwright locator or action fails, the demo records:

- the failed selector string;
- the current URL;
- the Playwright error;
- a full-page screenshot under `evidence/screenshots/`;
- nearby page text;
- a compact DOM/accessibility view of nearby buttons, inputs, links, and ARIA-role elements.

The production page objects are not changed as part of detection.

### AI prompt construction

A real provider can implement `LocatorSuggestionProvider`. The provider should receive the failure observation together with:

- the failed selector;
- the intended user action, such as “fill the loan amount” or “click Calculate”;
- the relevant DOM fragment;
- accessibility information, including roles, labels, accessible names, IDs, and test IDs;
- the URL and failure message.

It should be asked for multiple candidate locators, ranked by confidence, rather than one unverified replacement. The current `SimulatedSuggestionProvider` supplies a small deterministic candidate list so the POC remains offline and repeatable.

### Candidate preference

Candidates should be proposed in this order:

1. `getByRole`;
2. `getByLabel`;
3. `getByText`;
4. `getByTestId`;
5. CSS only as a fallback.

The demo intentionally uses CSS examples as failures to show why generated classes and positional selectors are weak contracts.

### Validation before applying

Before accepting a candidate, the POC checks that:

- the locator exists and matches exactly one element for these actions;
- the element is visible;
- its semantic role/type is the expected one;
- the intended Playwright action (`fill` or `click`) succeeds;
- the failed step can be rerun;
- the complete scenario can be rerun.

The scenario verifies all five candidates and reruns the workflow in the same isolated scenario. A real implementation should also rerun the original failed step and then the full scenario in a clean context before persistence.

## Concrete example

Broken locator:

```ts
page.getByRole('button', { name: 'Calculate EMI' })
```

Actual UI: the calculator button's accessible name is `Calculate my loan`, not `Calculate EMI`.

One AI candidate might be:

```ts
page.getByRole('button', { name: 'Calculate Loan' })
```

That candidate is not accepted merely because it looks plausible: its count is zero in this application. A later candidate matching the observed accessible name is validated with `count() === 1`, visibility, expected `button` role, and a successful `click()`. The form navigation is then checked by reopening the calculator and rerunning the workflow. In this demo the accepted candidate is the regex form:

```ts
page.getByRole('button', { name: /Calculate my loan/i })
```

## Safety rules

- Never silently edit source files based on AI output.
- Never automatically trust a suggested locator.
- Reject zero-match, multi-match, hidden, wrong-role, or failed-action candidates.
- Keep the failed selector, evidence, candidate list, validation results, and chosen candidate in an audit/log history.
- Require human approval before making any replacement persistent.

The POC reports each candidate decision through the scenario logger and writes the failure evidence. It only evaluates candidates; it does not rewrite a page object or feature file.

## Intentionally broken locators

The isolated demo includes:

1. a wrong button accessible name;
2. stale/outdated UI text;
3. an incorrect `data-testid`;
4. a generated CSS class;
5. a positional `nth-child` CSS selector.

These are deliberately confined to `SelfHealingDemoPage` and are never loaded by the normal `npm run test` or `npm run test:ui` tag selection.
