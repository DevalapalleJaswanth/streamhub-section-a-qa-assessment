@ui
Feature: Dashboard

  Scenario: Dashboard loads successfully
    Given I open the loan analytics application
    Then the dashboard should be displayed

  Scenario: Dashboard opens the current report
    Given I open the loan analytics application
    When I open the current report from the dashboard
    Then the report detail view should be displayed
