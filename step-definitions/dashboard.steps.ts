import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';
import { DashboardPage } from '../pages/DashboardPage';
import { AutomationWorld } from '../hooks/world';

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
