Feature: AI-assisted self-healing locator demonstration

  @self-healing
  Scenario: Detect and safely evaluate replacement locators
    Given I open the self-healing locator demo
    When I run the simulated AI-assisted locator healing workflow
    Then each intentionally broken locator should produce a validated healing candidate
    And the healing report should contain five rejected failures and five accepted candidates
