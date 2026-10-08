# Loanwise — Loan Analytics Dashboard

Loanwise is a small React and TypeScript loan analytics application with a
Playwright/Cucumber automation framework. It is the Section A solution for the
Streamhub Fullstack + QA Automation Assessment.

The project includes a dashboard, an input-driven loan report, a chart and
amortization table, UI automation, JSONPlaceholder API observations, two
independent SQLite exercises, and an isolated AI-assisted locator self-healing
proof of concept.

## Repository structure

```text
streamhub-section-a-qa-assessment/
├── src/                              # Application under test
│   ├── components/                   # React UI components
│   ├── config/                       # Application configuration
│   ├── domain/                       # Loan types, rules, and calculations
│   └── utils/                        # Application-side utilities
│
├── features/                         # Cucumber Gherkin scenarios
│   ├── dashboard.feature
│   ├── loan-calculator.feature
│   ├── jsonplaceholder-api.feature
│   └── self-healing.feature
├── step-definitions/                 # Gherkin-to-automation implementations
├── pages/                            # Playwright Page Object Model classes
├── hooks/                            # Cucumber World, browser lifecycle, evidence
├── config/                           # Automation and environment configuration
├── utils/                            # Automation/test utilities
│
├── sql/
│   ├── scenario-1-round-trip/
│   └── scenario-2-ipl-streak/
├── submission-results/               # Reviewed evidence committed for submission
├── evidence/                         # Transient runtime logs, screenshots, traces
├── reports/                          # Transient runtime Cucumber report
├── docs/assessment.md                # Original assessment requirements
├── SELF_HEALING.md                   # Self-healing design and safety notes
├── .env.example
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.automation.json
└── tsconfig.node.json
```

## Key separation

- `src/` is the application under test.
- `features/` contains the Cucumber Gherkin scenarios.
- `step-definitions/` maps Gherkin steps to automation behavior.
- `pages/` contains the Playwright Page Object Model.
- `hooks/` manages the browser lifecycle, Cucumber World, and evidence capture.
- `config/` contains automation and environment configuration.
- `src/utils/` contains application-side utilities.
- Root `utils/` contains automation and test utilities.
- `sql/` contains the independent SQL assessment exercises.
- `evidence/` and `reports/` contain transient runtime outputs.
- `submission-results/` contains reviewed evidence intentionally committed for
  the submission.
- `docs/assessment.md` contains the original assessment requirements.

## Prerequisites

- Node.js and npm
- A Playwright browser installation
- SQLite CLI, if reproducing the SQL exercises locally

## Setup

Install the project dependencies, install the Chromium browser used by the
automation framework, and create a local environment file:

```bash
npm install
npm run automation:install
cp .env.example .env
```

The relevant environment values are:

```bash
APP_BASE_URL=http://127.0.0.1:5173
API_BASE_URL=https://jsonplaceholder.typicode.com
```

`APP_BASE_URL` is required for `@ui` and `@self-healing` execution.
`API_BASE_URL` is required for `@api` execution. Application and API URLs are
read from the environment rather than hardcoded in the automation code.

The remaining values in `.env.example` control browser and evidence behavior:
`HEADLESS`, `BROWSER`, `TRACE_ON_FAILURE`, and `SCREENSHOT_ON_FAILURE`.

## Run the application

Start the Vite development server with:

```bash
npm run dev
```

The application is available at `http://127.0.0.1:5173` by default. Keep the
server running while executing UI or self-healing scenarios in another
terminal.

The production build can be checked with:

```bash
npm run build
```

## Run the automation

The available npm commands are:

```bash
npm run typecheck
npm run test:ui
npm run test:api
npm run test:self-healing
npm run test
npm run test:headed
npm run test:bdd
```

The UI command runs the `@ui` scenarios, the API command runs the `@api`
scenarios, and the self-healing command runs the isolated `@self-healing`
demonstration. The normal regression suite excludes `@self-healing`; the BDD
command runs all feature scenarios, and the headed command uses a visible
browser.

The UI and self-healing commands require the application to be running and
configured through `APP_BASE_URL`. The API command requires `API_BASE_URL`.

## UI automation coverage

The `@ui` scenarios cover:

- Dashboard loading
- Dashboard-to-report navigation
- Loan input and report generation
- Independent EMI calculation
- Comparison of the displayed EMI with the expected EMI
- Chart visibility
- Principal values greater than zero
- Interest values greater than zero

The automation calculates the expected EMI in
`utils/emiCalculator.ts`. That formula is intentionally independent from the
application calculation in `src/domain/loanCalculator.ts`; the test does not
import or reuse the application implementation as its oracle.

## Locator strategy

Production page objects prefer semantic, user-facing locators:

- `getByRole`
- `getByLabel`
- Accessible names
- Semantic visible text

Production tests avoid positional XPath, `nth-child`, long CSS chains, and
generated CSS classes. Brittle locators are confined to the isolated
self-healing exercise and are not part of the normal regression suite.

## API automation

The API scenarios exercise `POST /posts` against JSONPlaceholder with:

- An excessively long title
- Unsupported and special characters
- A missing `userId`

JSONPlaceholder accepted all three payloads with HTTP 201 responses during the
final execution. The tests record that observed mock-service behavior and
verify that the responses are valid and not server-side failures; they do not
falsely assert HTTP 400 responses that the service did not return.

The final API observations are in
[`submission-results/api-results.txt`](submission-results/api-results.txt).

## SQL exercises

Both SQL exercises use SQLite and include their schema, seed data, query, and
scenario-specific README.

### Scenario 1 — Round-trip transfers

[`sql/scenario-1-round-trip/`](sql/scenario-1-round-trip/) finds cases where
Account A sends money to Account B and Account B sends a similar amount back to
Account A within 24 hours. The return amount must be within 10% of the original
amount. The query uses a self-join and emits each qualifying pair once.

Final evidence contains five qualifying rows:

- [`scenario-1-round-trip-output.txt`](submission-results/sql-results/scenario-1-round-trip-output.txt)
- [`scenario-1-round-trip-output.png`](submission-results/sql-results/scenario-1-round-trip-output.png)

### Scenario 2 — IPL 2024 scoring streaks

[`sql/scenario-2-ipl-streak/`](sql/scenario-2-ipl-streak/) finds 2024 players
who scored at least 30 runs in three or more consecutive appearances. The
query uses SQLite window functions and a gaps-and-islands technique, and
returns the player and the date the qualifying streak commenced.

Final evidence contains four qualifying streaks:

- [`scenario-2-ipl-streak-output.txt`](submission-results/sql-results/scenario-2-ipl-streak-output.txt)
- [`scenario-2-ipl-streak-output.png`](submission-results/sql-results/scenario-2-ipl-streak-output.png)

## AI self-healing exercise

The self-healing proof of concept contains five intentionally broken or brittle
locators. It is isolated under `@self-healing` and demonstrates:

- Failure detection
- Failure context capture
- Candidate locator suggestion
- Candidate validation
- Rejection of invalid candidates
- No silent modification of production source files

The workflow validates candidate count, visibility, semantic role or type, and
the intended action before accepting a candidate. It then reruns the relevant
workflow. The design and safety rules are documented in
[`SELF_HEALING.md`](SELF_HEALING.md).

## Reporting and execution evidence

Runtime outputs are separate from reviewed submission evidence:

```text
reports/cucumber.html       # Runtime Cucumber report
evidence/logs/              # Runtime logs
evidence/screenshots/       # Runtime screenshots
evidence/traces/            # Runtime Playwright traces
```

The final committed evidence is under `submission-results/`:

- [`api-results.txt`](submission-results/api-results.txt)
- [`cucumber-report.html`](submission-results/cucumber-report.html)
- [`execution-summary.txt`](submission-results/execution-summary.txt)
- [`self-healing-results.txt`](submission-results/self-healing-results.txt)
- [`screenshots/dashboard.png`](submission-results/screenshots/dashboard.png)
- [`screenshots/report-emi-chart.png`](submission-results/screenshots/report-emi-chart.png)
- [`sql-results/scenario-1-round-trip-output.txt`](submission-results/sql-results/scenario-1-round-trip-output.txt)
- [`sql-results/scenario-1-round-trip-output.png`](submission-results/sql-results/scenario-1-round-trip-output.png)
- [`sql-results/scenario-2-ipl-streak-output.txt`](submission-results/sql-results/scenario-2-ipl-streak-output.txt)
- [`sql-results/scenario-2-ipl-streak-output.png`](submission-results/sql-results/scenario-2-ipl-streak-output.png)

The final execution details and pass counts are summarized in
[`submission-results/execution-summary.txt`](submission-results/execution-summary.txt).

## Application behavior and architecture

The application exposes these routes:

- `/` — dashboard with loan summary cards and a principal-versus-interest chart
- `/calculator` — accessible loan assumptions form
- `/reports` — detailed calculation report with chart and amortization table

Loan calculations are implemented in `src/domain/loanCalculator.ts`.
Calculator submissions preserve the selected scenario in the `/reports` URL
query string, so a report can be refreshed or shared without a backend.

The interface uses semantic headings, labels, buttons, navigation, tables, and
an accessible chart region. The application and automation responsibilities are
kept in separate folders as described in the repository structure above.

## Codex reflection

Codex was used as a pair programmer throughout the project: to scaffold the
application and framework structure, integrate Cucumber with Playwright, build
the EMI scenarios, implement the JSONPlaceholder API tests, develop and review
the SQL queries, and design the isolated self-healing proof of concept. It was
also used for debugging, selector and framework-boundary review, and auditing
the repository against the assessment requirements.

The most useful results were the initial scaffolding, repetitive Cucumber and
Playwright boilerplate, framework review, SQL/window-function support, and
debugging assistance. These accelerated implementation while keeping the
application and test behavior reviewable in separate files.

Human judgment and correction remained necessary. JSONPlaceholder returned
HTTP 201 for the long-title, special-character, and missing-`userId` payloads,
so the observed behavior was documented rather than replaced with an assumed
HTTP 400 expectation. The tests retained an independent EMI formula instead
of importing the application calculation logic. A local PostgreSQL approach
was rejected in favor of SQLite for reproducible execution. The five
self-healing locators were isolated from the normal suite, and suggested
locators were validated—including rejection of an invalid zero-match
candidate—before acceptance. Runtime output was separated from reviewed final
evidence.
