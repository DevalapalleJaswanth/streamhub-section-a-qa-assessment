# Loanwise — Loan Analytics Dashboard

Small React + TypeScript application for Section A of the assessment.

## Run locally

```bash
npm install
npm run dev
```

The production build can be verified with:

```bash
npm run build
```

## Automation framework

Set up the environment and Playwright browser once:

```bash
cp .env.example .env
npm run automation:install
```

Run the typed Cucumber/Playwright scaffold with:

```bash
npm run typecheck
npm run test:bdd
```

The framework currently contains no business scenarios. Once scenarios are
added, use the tag-specific scripts:

```bash
npm run test:ui
npm run test:api
npm run test:self-healing
npm run test:headed
npm run typecheck
```

Reports are written to `reports/cucumber.html`. Failed scenarios write
screenshots, traces, and logs under `evidence/`.

Transient runtime artifacts are ignored by Git. Final reviewed evidence can be
placed intentionally under `submission-results/`.

## Application structure

- `/` — dashboard landing page with loan summary cards and a principal-versus-interest chart.
- `/calculator` — accessible loan assumptions form.
- `/reports` — detailed calculation report with chart and amortization table.

Loan calculations are isolated in `src/domain/loanCalculator.ts`, independently of React components. Report assumptions are kept in the URL query string so a report can be refreshed or shared without a backend.

The interface uses semantic headings, labels, buttons, navigation, tables, and an accessible chart region. No generated or positional selectors are used by the application.

## Automation folder responsibilities

- `features/` — business-readable Gherkin scenarios.
- `step-definitions/` — thin translations from Gherkin to page-object/API actions.
- `pages/` — Playwright Page Object Model classes and semantic locators.
- `hooks/` — Cucumber world state and browser/context lifecycle, screenshots, traces, and logs.
- `config/` — environment loading, Cucumber configuration, and Playwright launch settings.
- `utils/` — shared automation support such as paths and scenario logging.
