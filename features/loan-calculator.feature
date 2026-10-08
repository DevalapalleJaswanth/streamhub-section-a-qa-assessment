@ui
Feature: Loan calculator

  Scenario: Calculate EMI for a valid home loan
    Given I open the loan calculator
    When I enter a loan amount of 2500000
    And I enter an annual interest rate of 10
    And I enter a tenure of 10 years
    And I calculate the loan
    Then the displayed EMI should match the independently calculated EMI
