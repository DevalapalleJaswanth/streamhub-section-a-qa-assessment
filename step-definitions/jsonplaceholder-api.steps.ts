import assert from 'node:assert/strict';
import { Given, setDefaultTimeout, Then, When } from '@cucumber/cucumber';
import { AutomationWorld } from '../hooks/world';
import {
  isValidJson,
  JsonPlaceholderApiClient,
  responseContainsUserId,
  type PostPayload,
  type PostCreationResult,
} from '../utils/jsonplaceholderApi';

setDefaultTimeout(30_000);

type ApiWorld = AutomationWorld & {
  apiPayload?: PostPayload;
  apiPayloadType?: string;
  apiResult?: PostCreationResult;
};

const normalBody = 'Boundary and invalid payload observation for API testing.';

function setPayload(world: ApiWorld, payloadType: string, payload: PostPayload): void {
  world.apiPayloadType = payloadType;
  world.apiPayload = payload;
  world.logger.info(`Payload type: ${payloadType}`);
  world.logger.info(`Request payload: ${JSON.stringify(payload)}`);
}

function requireApiResult(world: ApiWorld): PostCreationResult {
  assert.ok(world.apiResult, 'The API response should be captured before it is asserted.');
  return world.apiResult;
}

Given('I prepare a post payload with an excessively long title', function (this: ApiWorld) {
  setPayload(this, 'excessively long title', {
    title: 'x'.repeat(10_000),
    body: normalBody,
    userId: 1,
  });
});

Given('I prepare a post payload with unsupported and special characters', function (this: ApiWorld) {
  setPayload(this, 'unsupported and special characters', {
    title: '特殊字符 🚀 <script>alert("x")</script> \\u0000 \\uFFFF',
    body: 'Symbols: !@#$%^&*()[]{}<>?/|~`+=;:\\"\'\n',
    userId: 1,
  });
});

Given('I prepare a post payload without a userId', function (this: ApiWorld) {
  setPayload(this, 'missing userId', {
    title: 'Post without userId',
    body: normalBody,
  });
});

When('I send the post payload to the API', async function (this: ApiWorld) {
  assert.ok(this.apiPayload, 'A post payload should be prepared before sending the request.');

  const client = new JsonPlaceholderApiClient(await this.getApiRequestContext());
  this.apiResult = await client.createPost(this.apiPayload);

  this.logger.info(`HTTP status: ${this.apiResult.status}`);
  this.logger.info(`Response body: ${this.apiResult.responseText}`);
  this.logger.info(`Observed behavior: ${this.apiResult.observedBehavior}`);
});

Then('the API response should not be a server-side failure', function (this: ApiWorld) {
  const result = requireApiResult(this);
  assert.ok(result.status < 500, `Expected a non-5xx response, received HTTP ${result.status}.`);
});

Then('the API response should be valid JSON', function (this: ApiWorld) {
  const result = requireApiResult(this);
  assert.equal(isValidJson(result.responseBody), true, 'The API response should contain valid JSON.');
});

Then('the observed payload behavior should be documented', function (this: ApiWorld) {
  const result = requireApiResult(this);
  assert.ok(this.apiPayloadType, 'The payload type should be captured for reporting.');
  assert.ok(result.observedBehavior, 'The accepted/rejected observation should be captured for reporting.');
});

Then('the missing userId behavior should be documented accurately', function (this: ApiWorld) {
  const result = requireApiResult(this);
  const returnedUserId = responseContainsUserId(result.responseBody);
  const observation = returnedUserId
    ? 'The response includes userId; the mock service supplied or preserved a userId.'
    : 'The response does not include userId; the mock service returned the payload without that field.';

  this.logger.info(`Missing userId observation: ${observation}`);
  assert.ok(result.observedBehavior, 'The missing userId accepted/rejected behavior should be captured.');
});
