import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { DashboardPage } from '../pages/DashboardPage';
import { AutomationWorld } from '../hooks/world';
import { ReportPage } from '../pages/ReportPage';

Given('I open the loan analytics application', async function (this: AutomationWorld) {
  const dashboardPage = new DashboardPage(this.page);
  await dashboardPage.open();
});

Then('the dashboard should be displayed', async function (this: AutomationWorld) {
  const dashboardPage = new DashboardPage(this.page);
  assert.equal(
    await dashboardPage.heading().isVisible(),
    true,
    'The dashboard heading should be visible.',
  );
});

When('I open the current report from the dashboard', async function (this: AutomationWorld) {
  await new DashboardPage(this.page).openCurrentReport();
});

Then('the report detail view should be displayed', async function (this: AutomationWorld) {
  assert.equal(
    await new ReportPage(this.page).heading().isVisible(),
    true,
    'The report detail heading should be visible after dashboard navigation.',
  );
});
