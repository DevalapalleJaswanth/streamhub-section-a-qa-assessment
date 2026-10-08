import type { APIRequestContext } from 'playwright';

export type PostPayload = {
  title: string;
  body: string;
  userId?: number;
};

export type PostCreationResult = {
  status: number;
  responseBody: unknown;
  responseText: string;
  observedBehavior: 'accepted' | 'rejected' | 'non-validation response';
};

export class JsonPlaceholderApiClient {
  constructor(private readonly requestContext: APIRequestContext) {}

  async createPost(payload: PostPayload): Promise<PostCreationResult> {
    const response = await this.requestContext.post('/posts', { data: payload });
    const responseText = await response.text();
    let responseBody: unknown;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = undefined;
    }

    const status = response.status();
    const observedBehavior =
      status >= 200 && status < 300
        ? 'accepted'
        : status >= 400 && status < 500
          ? 'rejected'
          : 'non-validation response';

    return {
      status,
      responseBody,
      responseText,
      observedBehavior,
    };
  }
}

export function isValidJson(responseBody: unknown): boolean {
  return responseBody !== undefined;
}

export function responseContainsUserId(responseBody: unknown): boolean {
  return (
    typeof responseBody === 'object' &&
    responseBody !== null &&
    Object.prototype.hasOwnProperty.call(responseBody, 'userId')
  );
}
