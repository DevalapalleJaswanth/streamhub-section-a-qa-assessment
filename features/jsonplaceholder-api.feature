@api
Feature: JSONPlaceholder post-creation validation

  The API scenarios observe how the mock service handles boundary and invalid
  post-creation payloads without assuming that it implements validation rules.

  @api
  Scenario: Observe handling of an excessively long title
    Given I prepare a post payload with an excessively long title
    When I send the post payload to the API
    Then the API response should not be a server-side failure
    And the API response should be valid JSON
    And the observed payload behavior should be documented

  @api
  Scenario: Observe handling of unsupported and special characters
    Given I prepare a post payload with unsupported and special characters
    When I send the post payload to the API
    Then the API response should not be a server-side failure
    And the API response should be valid JSON
    And the observed payload behavior should be documented

  @api
  Scenario: Observe handling of a post with a missing userId
    Given I prepare a post payload without a userId
    When I send the post payload to the API
    Then the API response should not be a server-side failure
    And the API response should be valid JSON
    And the missing userId behavior should be documented accurately
