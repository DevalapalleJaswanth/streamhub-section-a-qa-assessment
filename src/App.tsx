import { useEffect, useRef, useState } from 'react';
import type { LoanScenario } from './domain/loanTypes';
import { calculateLoan } from './domain/loanCalculator';
import { AmortizationTable } from './components/AmortizationTable';
import { CalculationSummary } from './components/CalculationSummary';
import { LoanCalculatorForm } from './components/LoanCalculatorForm';
import { PrincipalInterestChart } from './components/PrincipalInterestChart';
import { SummaryCard } from './components/SummaryCard';
import { formatCurrency, formatPercent } from './utils/formatters';
import { DEFAULT_SCENARIO, scenarioFromQuery, scenarioToQuery } from './utils/routeState';

type Page = 'dashboard' | 'calculator' | 'report';

function getPage(): Page {
  if (window.location.pathname === '/calculator') return 'calculator';
  if (window.location.pathname === '/reports') return 'report';
  return 'dashboard';
}

export function App() {
  const [page, setPage] = useState<Page>(getPage);
  const mainContentRef = useRef<HTMLElement>(null);
  const hasRenderedRef = useRef(false);
  const [scenario, setScenario] = useState<LoanScenario>(
    () => scenarioFromQuery(window.location.search) ?? DEFAULT_SCENARIO,
  );

  useEffect(() => {
    function handlePopState() {
      setPage(getPage());
      const urlScenario = scenarioFromQuery(window.location.search);
      setScenario(urlScenario ?? DEFAULT_SCENARIO);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (hasRenderedRef.current) mainContentRef.current?.focus();
    hasRenderedRef.current = true;
  }, [page]);

  function navigate(nextPage: Page, nextScenario = scenario) {
    const query = nextPage === 'report' ? `?${scenarioToQuery(nextScenario)}` : '';
    window.history.pushState({}, '', `${nextPage === 'dashboard' ? '/' : `/${nextPage === 'report' ? 'reports' : 'calculator'}`}${query}`);
    setPage(nextPage);
    setScenario(nextScenario);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const calculation = calculateLoan(scenario);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('dashboard'); }} aria-label="Go to Loanwise home">
            <span className="brand-mark" aria-hidden="true">L</span>
            <span>Loanwise</span>
          </a>
          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              <li><a className={page === 'dashboard' ? 'nav-link nav-link--active' : 'nav-link'} href="/" onClick={(event) => { event.preventDefault(); navigate('dashboard'); }} aria-current={page === 'dashboard' ? 'page' : undefined}>Dashboard</a></li>
              <li><a className={page === 'calculator' ? 'nav-link nav-link--active' : 'nav-link'} href="/calculator" onClick={(event) => { event.preventDefault(); navigate('calculator'); }} aria-current={page === 'calculator' ? 'page' : undefined}>Calculator</a></li>
              <li><a className={page === 'report' ? 'nav-link nav-link--active' : 'nav-link'} href="/reports" onClick={(event) => { event.preventDefault(); navigate('report'); }} aria-current={page === 'report' ? 'page' : undefined}>Reports</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content" id="main-content" ref={mainContentRef} tabIndex={-1}>
        {page === 'dashboard' && (
          <DashboardPage scenario={scenario} calculation={calculation} onCalculate={() => navigate('calculator')} onReport={() => navigate('report')} />
        )}
        {page === 'calculator' && (
          <CalculatorPage scenario={scenario} onSubmit={(nextScenario) => navigate('report', nextScenario)} />
        )}
        {page === 'report' && (
          <ReportPage scenario={scenario} calculation={calculation} onEdit={() => navigate('calculator')} />
        )}
      </main>

      <footer className="site-footer">Loanwise · Clear projections for better decisions</footer>
    </div>
  );
}

type DashboardPageProps = {
  scenario: LoanScenario;
  calculation: ReturnType<typeof calculateLoan>;
  onCalculate: () => void;
  onReport: () => void;
};

function DashboardPage({ scenario, calculation, onCalculate, onReport }: DashboardPageProps) {
  return (
    <div className="page-stack">
      <section className="hero dashboard-hero">
        <div>
          <p className="eyebrow">Loan analytics dashboard</p>
          <h1>Understand the cost of your next loan.</h1>
          <p className="hero-copy">Build a clear repayment picture in seconds. Adjust your assumptions, then explore the details behind every payment.</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={onCalculate}>Start a calculation</button>
            <button className="secondary-button" type="button" onClick={onReport}>View current report</button>
          </div>
        </div>
        <aside className="hero-aside" aria-label="Current loan snapshot">
          <span className="hero-aside__label">Current monthly EMI</span>
          <strong>{formatCurrency(calculation.monthlyPayment)}</strong>
          <span>Based on a {formatCurrency(scenario.principal)} loan</span>
        </aside>
      </section>

      <section aria-labelledby="dashboard-summary-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">At a glance</p>
            <h2 id="dashboard-summary-heading">Your loan snapshot</h2>
          </div>
          <button className="text-button" type="button" onClick={onReport}>See full report <span aria-hidden="true">→</span></button>
        </div>
        <div className="summary-grid">
          <SummaryCard label="Monthly EMI" value={formatCurrency(calculation.monthlyPayment)} supportingText="Your fixed payment" />
          <SummaryCard label="Total interest" value={formatCurrency(calculation.totalInterest)} supportingText={`${formatPercent((calculation.totalInterest / calculation.totalRepayment) * 100)} of repayment`} />
          <SummaryCard label="Total repayment" value={formatCurrency(calculation.totalRepayment)} supportingText={`${scenario.tenureYears} year projection`} />
        </div>
      </section>

      <div className="dashboard-grid">
        <PrincipalInterestChart calculation={calculation} />
        <section className="panel insight-panel" aria-labelledby="insight-heading">
          <p className="eyebrow">A useful starting point</p>
          <h2 id="insight-heading">Small changes add up</h2>
          <p>Use the calculator to compare scenarios and see how your rate, term, and loan amount affect the final repayment.</p>
          <button className="secondary-button" type="button" onClick={onCalculate}>Compare a scenario</button>
        </section>
      </div>
    </div>
  );
}

type CalculatorPageProps = {
  scenario: LoanScenario;
  onSubmit: (scenario: LoanScenario) => void;
};

function CalculatorPage({ scenario, onSubmit }: CalculatorPageProps) {
  return (
    <div className="narrow-page page-stack">
      <section className="page-intro">
        <p className="eyebrow">Loan calculator</p>
        <h1>Shape your repayment plan.</h1>
        <p>Enter three simple assumptions and we’ll estimate your monthly payment, total interest, and repayment schedule.</p>
      </section>
      <section className="panel form-panel" aria-labelledby="calculator-form-heading">
        <div className="section-heading">
        <div>
          <h2 id="calculator-form-heading">Loan assumptions</h2>
            <p className="muted-text">All fields are required.</p>
          </div>
        </div>
        <LoanCalculatorForm initialValues={scenario} onSubmit={onSubmit} />
        <p className="form-disclaimer">Estimates assume a fixed annual rate, monthly payments, and no fees or extra payments. Amounts are shown in USD.</p>
      </section>
    </div>
  );
}

type ReportPageProps = {
  scenario: LoanScenario;
  calculation: ReturnType<typeof calculateLoan>;
  onEdit: () => void;
};

function ReportPage({ scenario, calculation, onEdit }: ReportPageProps) {
  return (
    <div className="page-stack">
      <section className="page-intro page-intro--inline">
        <div>
          <p className="eyebrow">Detailed report</p>
          <h1>Your repayment projection.</h1>
          <p>Review the assumptions and see how each monthly payment is composed.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onEdit}>Edit assumptions</button>
      </section>

      <dl className="scenario-strip" aria-label="Loan assumptions">
        <div><dt>Loan amount</dt><dd>{formatCurrency(scenario.principal)}</dd></div>
        <div><dt>Interest rate</dt><dd>{formatPercent(scenario.annualInterestRate)}</dd></div>
        <div><dt>Loan tenure</dt><dd>{scenario.tenureYears} years</dd></div>
      </dl>

      <CalculationSummary calculation={calculation} />
      <div className="dashboard-grid">
        <PrincipalInterestChart calculation={calculation} />
        <section className="panel report-note" aria-labelledby="report-note-heading">
          <p className="eyebrow">How to read this</p>
          <h2 id="report-note-heading">Interest is front-loaded</h2>
          <p>Early payments contain a larger interest portion because interest is calculated against the remaining balance. As the balance falls, more of each payment goes toward principal.</p>
        </section>
      </div>
      <AmortizationTable calculation={calculation} />
    </div>
  );
}
