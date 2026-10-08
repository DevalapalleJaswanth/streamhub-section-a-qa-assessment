# Loanwise — Loan Analytics Dashboard

Loanwise is a small React + TypeScript loan analytics application and a
Playwright/Cucumber automation framework for Section A of the assessment.

## Repository structure

```text
loan-analytics-dashboard/
├── src/                    # React + TypeScript application
│   ├── components/         # UI components, chart, form, summary, table
│   ├── domain/             # Loan calculation logic and validation
│   └── utils/              # Application-side utilities
│
├── features/               # Cucumber Gherkin scenarios
├── step-definitions/       # UI, API, and self-healing step implementations
├── pages/                  # Playwright Page Object Model classes
├── hooks/                  # Cucumber World and browser lifecycle
├── config/                 # Environment, Cucumber, Playwright configuration
├── utils/                  # Automation-side helpers and independent calculations
│
├── sql/
│   ├── scenario-1-round-trip/
│   └── scenario-2-ipl-streak/
│
├── SELF_HEALING.md
├── submission-results/     # Final committed assessment evidence
│   ├── cucumber-report.html
│   ├── execution-summary.txt
│   ├── api-results.txt
│   ├── self-healing-results.txt
│   ├── screenshots/
│   └── sql-results/
│
├── reports/                # Runtime Cucumber report, Git ignored
├── evidence/               # Runtime screenshots/logs/traces, Git ignored
├── .env.example
├── package.json
└── README.md
```

### Key separation

- `src/` is the application under test.
- `features/`, `step-definitions/`, `pages/`, `hooks/`, `config/`, and root
  `utils/` form the automation framework.
- `src/utils/` contains application utilities, while root `utils/` contains
  automation and test utilities.
- `sql/` contains the two independent SQL assessment exercises.
- `reports/` and `evidence/` are transient runtime output.
- `submission-results/` contains the reviewed evidence intentionally committed
  for the assessment.

## Run the application

```bash
npm install
npm run dev
```

Vite serves the application at `http://127.0.0.1:5173` by default. Keep the
development server running in one terminal while running UI or self-healing
scenarios in another terminal.

The production build can be verified with:

```bash
npm run build
```

## Configure and run automation

Set up the environment and Playwright browser once:

```bash
cp .env.example .env
npm run automation:install
```

`APP_BASE_URL` is required for `@ui` and `@self-healing` execution. It must
point to the running Loanwise application. `API_BASE_URL` is required for
`@api` execution and should point to the JSONPlaceholder target shown in
`.env.example` or be provided directly in the shell environment.

Example values:

```bash
APP_BASE_URL=http://127.0.0.1:5173
API_BASE_URL=https://jsonplaceholder.typicode.com
```

Run the typed framework and the tag-specific suites with:

```bash
npm run typecheck
npm run test:ui
npm run test:api
npm run test:self-healing
```

`npm run test` runs the normal regression suite and excludes the isolated
`@self-healing` demonstration. `npm run test:bdd` runs all feature scenarios.
The `npm run test:headed` command runs the framework with a visible browser.

The framework currently covers:

- `@ui`: dashboard loading, dashboard-to-report navigation, independently
  calculated EMI validation, and principal/interest chart visibility and
  non-zero values.
- `@api`: JSONPlaceholder `POST /posts` observations for an excessively long
  title, special characters, and a missing `userId`.
- `@self-healing`: five intentionally broken locator examples with offline
  candidate suggestion and validation.
- SQL: SQLite schema, seed data, queries, and checked-in text outputs for
  round-trip transfers and IPL 2024 scoring streaks.

Reports are written to `reports/cucumber.html`. Failed scenarios write
screenshots, traces, and logs under `evidence/`. These runtime locations are
ignored by Git; reviewed final evidence can be selected and placed under
`submission-results/`.

## Application behavior and architecture

- `/` — dashboard landing page with loan summary cards and a
  principal-versus-interest chart.
- `/calculator` — accessible loan assumptions form.
- `/reports` — detailed calculation report with chart and amortization table.

Loan calculations are isolated in `src/domain/loanCalculator.ts`. The test
suite uses a separate formula in `utils/emiCalculator.ts` rather than reusing
application calculation code. Report assumptions are kept in the URL query
string so a report can be refreshed or shared without a backend.

The interface uses semantic headings, labels, buttons, navigation, tables, and
an accessible chart region. Production page objects use semantic locators such
as roles, labels, and accessible names. The repository-level responsibilities
of the application and automation folders are summarized in the structure
overview above.

## Codex reflection

Codex was used as a pair programmer throughout the project: first to scaffold
the application and framework structure, then to integrate Cucumber with
Playwright, build the EMI scenarios, implement the JSONPlaceholder API tests,
develop and review the SQL queries, and design the isolated self-healing POC.
It was also used for debugging, reviewing selectors and framework boundaries,
and auditing the repository against the assessment requirements.

What worked well was the initial scaffolding, repetitive Cucumber and
Playwright boilerplate, framework review, SQL/window-function support, and
debugging assistance. These accelerated implementation while leaving the
application and test behavior reviewable in separate files.

Human judgment and correction were still required. JSONPlaceholder was not
forced to return HTTP 400 for invalid-looking payloads; its actual HTTP 201
behavior was executed and documented. The test retained an independent EMI
formula instead of importing the application calculation logic. A local
PostgreSQL approach was rejected and the SQL scenarios were converted to
SQLite for reproducible local execution. The self-healing locators were kept
isolated from the normal suite, and transient runtime evidence was separated
from evidence intended for the final submission.
