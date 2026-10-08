import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { LoanCalculatorPage } from '../pages/LoanCalculatorPage';
import { ReportPage } from '../pages/ReportPage';
import { AutomationWorld } from '../hooks/world';
import { calculateExpectedEmi, parseCurrency, type EmiInputs } from '../utils/emiCalculator';

const EMI_TOLERANCE = 0.01;

function completeInputs(world: AutomationWorld): EmiInputs {
  const { principal, annualInterestRate, tenureYears } = world.emiInputs;
  assert.ok(principal !== undefined, 'Loan amount should be captured before calculating EMI.');
  assert.ok(annualInterestRate !== undefined, 'Interest rate should be captured before calculating EMI.');
  assert.ok(tenureYears !== undefined, 'Loan tenure should be captured before calculating EMI.');
  return { principal, annualInterestRate, tenureYears };
}

Given('I open the loan calculator', async function (this: AutomationWorld) {
  const calculatorPage = new LoanCalculatorPage(this.page);
  await calculatorPage.open();
});

When('I enter a loan amount of {int}', async function (this: AutomationWorld, amount: number) {
  const calculatorPage = new LoanCalculatorPage(this.page);
  await calculatorPage.enterLoanAmount(amount);
  this.emiInputs = { ...this.emiInputs, principal: amount };
});

When('I enter an annual interest rate of {int}', async function (this: AutomationWorld, annualInterestRate: number) {
  const calculatorPage = new LoanCalculatorPage(this.page);
  await calculatorPage.enterInterestRate(annualInterestRate);
  this.emiInputs = { ...this.emiInputs, annualInterestRate };
});

When('I enter a tenure of {int} years', async function (this: AutomationWorld, tenureYears: number) {
  const calculatorPage = new LoanCalculatorPage(this.page);
  await calculatorPage.enterTenure(tenureYears);
  this.emiInputs = { ...this.emiInputs, tenureYears };
});

When('I calculate the loan', async function (this: AutomationWorld) {
  const calculatorPage = new LoanCalculatorPage(this.page);
  await calculatorPage.calculateLoan();
});

Then('the displayed EMI should match the independently calculated EMI', async function (this: AutomationWorld) {
  const inputs = completeInputs(this);
  const expectedEmi = calculateExpectedEmi(inputs);
  const reportPage = new ReportPage(this.page);
  const displayedEmi = parseCurrency(await reportPage.displayedEmi());
  const difference = Math.abs(displayedEmi - expectedEmi);

  this.logger.info(`Expected EMI: ${expectedEmi.toFixed(2)}`);
  this.logger.info(`Displayed EMI: ${displayedEmi.toFixed(2)}`);
  this.logger.info(`EMI difference: ${difference.toFixed(4)}; tolerance: ${EMI_TOLERANCE.toFixed(2)}`);

  assert.ok(
    difference <= EMI_TOLERANCE,
    `Expected EMI ${expectedEmi.toFixed(2)} but displayed ${displayedEmi.toFixed(2)}. Difference ${difference.toFixed(4)} exceeded tolerance ${EMI_TOLERANCE.toFixed(2)}.`,
  );
});

Then('the principal and interest chart should be visible', async function (this: AutomationWorld) {
  const reportPage = new ReportPage(this.page);
  assert.equal(
    await reportPage.principalInterestChart().isVisible(),
    true,
    'The principal and interest chart should be visible.',
  );
});

Then('the principal value represented by the chart should be greater than zero', async function (this: AutomationWorld) {
  const reportPage = new ReportPage(this.page);
  const principal = parseCurrency(await reportPage.displayedChartValue('Principal'));

  this.logger.info(`Chart principal value: ${principal.toFixed(2)}`);
  assert.ok(principal > 0, `Expected chart principal value to be greater than zero, received ${principal}.`);
});

Then('the interest value represented by the chart should be greater than zero', async function (this: AutomationWorld) {
  const reportPage = new ReportPage(this.page);
  const interest = parseCurrency(await reportPage.displayedChartValue('Interest'));

  this.logger.info(`Chart interest value: ${interest.toFixed(2)}`);
  assert.ok(interest > 0, `Expected chart interest value to be greater than zero, received ${interest}.`);
});
