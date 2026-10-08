import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { AutomationWorld } from '../hooks/world';
import { SelfHealingDemoPage } from '../pages/SelfHealingDemoPage';

Given('I open the self-healing locator demo', async function (this: AutomationWorld) {
  const demoPage = new SelfHealingDemoPage(this.page, this.logger);
  await demoPage.open();
});

When('I run the simulated AI-assisted locator healing workflow', async function (this: AutomationWorld) {
  const demoPage = new SelfHealingDemoPage(this.page, this.logger);
  this.selfHealingResults = await demoPage.runHealing();
});

Then('each intentionally broken locator should produce a validated healing candidate', function (this: AutomationWorld) {
  const results = this.selfHealingResults;
  assert.equal(results.length, 5, 'The demo should exercise five intentionally broken locators.');

  for (const result of results) {
    assert.notEqual(result.observation.error, 'The intentionally broken locator unexpectedly succeeded.');
    assert.ok(result.observation.failedSelector.length > 0, 'The failed selector should be recorded.');
    assert.ok(result.observation.url.endsWith('/calculator'), 'The failure should record the calculator URL.');
    assert.ok(result.observation.screenshotPath.endsWith('.png'), 'A failure screenshot should be recorded.');
    assert.ok(result.observation.interactiveElements.includes('button'), 'Accessibility context should be captured.');

    const accepted = result.candidates.find((candidate) => candidate.accepted);
    assert.ok(accepted, `A safe candidate should be found for ${result.name}.`);
    assert.equal(accepted.count, 1, `The selected candidate for ${result.name} must be unique.`);
    assert.equal(accepted.visible, true, `The selected candidate for ${result.name} must be visible.`);
    assert.equal(accepted.actionSucceeded, true, `The selected candidate action for ${result.name} must succeed.`);
    assert.equal(accepted.role, accepted.expectedRole, `The selected candidate for ${result.name} must have the expected role.`);
  }
});

Then('the healing report should contain five rejected failures and five accepted candidates', function (this: AutomationWorld) {
  const results = this.selfHealingResults;
  assert.equal(results.filter((result) => result.observation.error !== '').length, 5);
  assert.equal(results.filter((result) => result.selectedCandidate !== undefined).length, 5);

  for (const result of results) {
    this.logger.info(`${result.name} healed with ${result.selectedCandidate}`);
  }
});
