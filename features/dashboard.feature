@ui
Feature: Dashboard

  Scenario: Dashboard loads successfully
    Given I open the loan analytics application
    Then the dashboard should be displayed
