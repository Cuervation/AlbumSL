import type { ApiErrorCode } from "@albumsl/contracts";

export class HttpApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: readonly string[];

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    details?: readonly string[],
  ) {
    super(message);
    this.name = "HttpApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
